import { PrismaClient } from '@prisma/client'
import { app } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import { format } from 'date-fns-tz'
import { requirePermission } from './auth.service'

const TIMEZONE = 'Asia/Manila'
const MAX_BACKUPS = 30
const APP_VERSION = '1.0.0'
const DB_VERSION = 1

let prisma = new PrismaClient()

function getBackupsDir() {
  return path.join(app.getPath('userData'), 'backups')
}

async function ensureDir(dir: string) {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

export async function createBackup(type: 'DAILY' | 'MANUAL' | 'EMERGENCY' = 'MANUAL') {
  if (type === 'MANUAL') requirePermission('backup.manage')

  const backupsDir = getBackupsDir()
  await ensureDir(backupsDir)

  const now = new Date()
  const dateStr = format(now, 'yyyyMMdd-HHmmss', { timeZone: TIMEZONE })
  const backupId = `BKP-${dateStr}`
  const backupFolder = path.join(backupsDir, backupId)
  
  await ensureDir(backupFolder)
  const dbPath = path.join(backupFolder, 'bizpos.db')
  const jsonPath = path.join(backupFolder, 'backup.json')

  // Live safe backup using SQLite VACUUM INTO
  // Note: Windows paths in SQLite VACUUM INTO need forward slashes or escaped backslashes.
  const safeDbPath = dbPath.replace(/\\/g, '/')
  await prisma.$executeRawUnsafe(`VACUUM INTO '${safeDbPath}'`)

  // Check integrity of the newly created backup
  const isHealthy = await verifyDatabaseIntegrity(safeDbPath)

  const metadata = {
    backupId,
    createdAt: format(now, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: TIMEZONE }),
    applicationVersion: APP_VERSION,
    databaseVersion: DB_VERSION,
    type,
    integrity: isHealthy ? 'PASS' : 'FAIL'
  }

  await fs.writeFile(jsonPath, JSON.stringify(metadata, null, 2))

  if (type !== 'EMERGENCY') {
    await rotateBackups()
  }

  return metadata
}

async function rotateBackups() {
  const backupsDir = getBackupsDir()
  const entries = await fs.readdir(backupsDir, { withFileTypes: true })
  const folders = entries.filter(e => e.isDirectory() && e.name.startsWith('BKP-')).map(e => e.name).sort()

  if (folders.length > MAX_BACKUPS) {
    const toDelete = folders.slice(0, folders.length - MAX_BACKUPS)
    for (const folder of toDelete) {
      await fs.rm(path.join(backupsDir, folder), { recursive: true, force: true })
    }
  }
}

async function verifyDatabaseIntegrity(dbPath: string): Promise<boolean> {
  const tempPrisma = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } }
  })
  try {
    const result: any = await tempPrisma.$queryRawUnsafe('PRAGMA integrity_check;')
    await tempPrisma.$disconnect()
    return result && result[0] && result[0].integrity_check === 'ok'
  } catch (err) {
    await tempPrisma.$disconnect()
    return false
  }
}

export async function listBackups() {
  const backupsDir = getBackupsDir()
  await ensureDir(backupsDir)
  
  const entries = await fs.readdir(backupsDir, { withFileTypes: true })
  const folders = entries.filter(e => e.isDirectory() && e.name.startsWith('BKP-'))
  
  const backups = []
  for (const folder of folders) {
    try {
      const json = await fs.readFile(path.join(backupsDir, folder.name, 'backup.json'), 'utf-8')
      backups.push(JSON.parse(json))
    } catch (err) {
      // Ignore broken backup folders
    }
  }
  return backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function exportBackup(backupId: string, targetDir: string) {
  requirePermission('backup.manage')
  const srcFolder = path.join(getBackupsDir(), backupId)
  const targetFolder = path.join(targetDir, backupId)
  
  await ensureDir(targetFolder)
  await fs.copyFile(path.join(srcFolder, 'bizpos.db'), path.join(targetFolder, 'bizpos.db'))
  await fs.copyFile(path.join(srcFolder, 'backup.json'), path.join(targetFolder, 'backup.json'))
}

export async function restoreBackup(backupFolderFullPath: string) {
  requirePermission('backup.manage')
  
  const dbToRestore = path.join(backupFolderFullPath, 'bizpos.db')
  const isHealthy = await verifyDatabaseIntegrity(dbToRestore)
  if (!isHealthy) throw new Error('Selected backup failed integrity check. Restore cancelled.')

  // 1. Create emergency backup
  await createBackup('EMERGENCY')

  // 2. Disconnect Prisma
  await prisma.$disconnect()
  
  // 3. Replace the actual DB file
  // Get current DB path (assuming it's dev.db in process.cwd())
  const currentDbPath = path.join(process.cwd(), 'dev.db')
  
  try {
    await fs.copyFile(dbToRestore, currentDbPath)
  } catch (err: any) {
    // If copy fails, reconnect and abort
    prisma = new PrismaClient()
    throw new Error(`Failed to copy database: ${err.message}`)
  }

  // 4. Verify restored DB
  prisma = new PrismaClient()
  const restoredHealthy = await verifyDatabaseIntegrity(currentDbPath)
  
  if (!restoredHealthy) {
    // Restore failed. Try to rollback using the emergency backup we just created.
    // Finding the latest emergency backup
    await prisma.$disconnect()
    const backups = await listBackups()
    const latestEmergency = backups.find(b => b.type === 'EMERGENCY')
    if (latestEmergency) {
      await fs.copyFile(path.join(getBackupsDir(), latestEmergency.backupId, 'bizpos.db'), currentDbPath)
    }
    prisma = new PrismaClient()
    throw new Error('Restored database was corrupted. Rolled back to emergency backup.')
  }

  // Success, restart app
  setTimeout(() => {
    app.relaunch()
    app.quit()
  }, 3000)

  return true
}

export async function checkStartupBackup() {
  const backups = await listBackups()
  const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: TIMEZONE })
  const hasDaily = backups.some(b => b.createdAt.startsWith(todayStr) && b.type === 'DAILY')
  
  if (!hasDaily) {
    await createBackup('DAILY')
  }
}
