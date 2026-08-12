import { PrismaClient } from '@prisma/client'
import { PATHS } from './paths.service'
import { logger } from './log.service'
import fs from 'fs/promises'

let prismaInstance: PrismaClient | null = null

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    // In packaged apps or production, dynamically point to AppData database
    const dbUrl = `file:${PATHS.db}`
    logger.info(`Initializing Prisma with database at ${dbUrl}`)
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })
  }
  return prismaInstance
}

export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect()
    prismaInstance = null
    logger.info('Prisma disconnected successfully.')
  }
}

export async function isDatabaseEmpty(): Promise<boolean> {
  const prisma = getPrisma()
  try {
    const count = await prisma.user.count()
    return count === 0
  } catch (err) {
    // If the table doesn't exist, it means migrations haven't run or DB is missing
    return true
  }
}

export async function dbExists(): Promise<boolean> {
  try {
    await fs.access(PATHS.db)
    return true
  } catch {
    return false
  }
}
