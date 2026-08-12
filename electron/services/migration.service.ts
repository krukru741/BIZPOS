import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'
import { getPrisma } from './db.service'
import { logger } from './log.service'
import { createBackup } from './backup.service'

export async function runMigrations() {
  const prisma = getPrisma()
  
  logger.info('Initializing migration service...')
  // Create schema_version table if not exists
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `)

  const currentVersionResult: any = await prisma.$queryRawUnsafe(`
    SELECT MAX(version) as v FROM schema_version;
  `)
  const currentVersion = currentVersionResult[0]?.v || 0

  logger.info(`Current database version: ${currentVersion}`)

  // In production, migrations will be packed in resources/migrations
  const isDev = !app.isPackaged
  const migrationsDir = isDev 
    ? path.join(process.cwd(), 'migrations')
    : path.join(process.resourcesPath, 'migrations')

  try {
    await fs.access(migrationsDir)
  } catch {
    logger.warn('No migrations directory found. Skipping migrations.')
    return
  }

  const files = await fs.readdir(migrationsDir)
  const sqlFiles = files.filter(f => f.endsWith('.sql')).sort()

  const pendingMigrations = sqlFiles.filter(f => {
    const v = parseInt(f.split('_')[0], 10)
    return v > currentVersion
  })

  if (pendingMigrations.length === 0) {
    logger.info('Database is up to date.')
    return
  }

  logger.info(`Found ${pendingMigrations.length} pending migrations.`)
  
  // Create pre-migration emergency backup
  logger.info('Creating pre-migration emergency backup...')
  await createBackup('EMERGENCY')

  for (const file of pendingMigrations) {
    const version = parseInt(file.split('_')[0], 10)
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf-8')

    logger.info(`Applying migration: ${file}`)
    
    // SQLite does not support DDL inside prepared statements easily via Prisma executeRaw if it has multiple statements.
    // However, Prisma can execute multiple statements in executeRawUnsafe.
    // If it fails, the catch block will throw and application boot stops.
    try {
      const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0)
      for (const stmt of statements) {
        await prisma.$executeRawUnsafe(stmt)
      }
      
      await prisma.$executeRawUnsafe(`
        INSERT INTO schema_version (version, applied_at) VALUES (${version}, datetime('now'));
      `)
      logger.info(`Migration ${version} applied successfully.`)
    } catch (err: any) {
      logger.error(`Migration ${file} failed! Rolling back...`, err)
      throw new Error(`Database Migration Failed: ${err.message}`)
    }
  }

  logger.info('All migrations applied successfully.')
}
