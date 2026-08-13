import { PrismaClient, User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getPrisma } from './db.service'
import { logger } from './log.service'

// Secure in-memory session state
export let currentUser: Omit<User, 'password'> | null = null

const PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    'users.manage', 'settings.manage', 'inventory.adjust', 'reports.view', 'profit.view', 'cash.manage', 'backup.manage', 'pos.sell'
  ],
  MANAGER: [
    'inventory.adjust', 'reports.view', 'cash.manage', 'pos.sell'
  ],
  CASHIER: [
    'pos.sell', 'sales.view_own', 'cash_session.manage'
  ]
}

export function hasPermission(permission: string): boolean {
  if (!currentUser) return false
  const rolePerms = PERMISSIONS[currentUser.role] || []
  return rolePerms.includes(permission)
}

export function requirePermission(permission: string) {
  if (!hasPermission(permission)) {
    throw new Error(`Unauthorized: Requires ${permission}`)
  }
}

export async function ensureDefaultAdmin() {
  // NO-OP in V1.
}

export async function setupFirstRun(payload: any) {
  const { businessName, address, ownerName, adminUsername, adminPassword } = payload
  const prisma = getPrisma()

  const hash = await bcrypt.hash(adminPassword, 10)

  await prisma.$transaction([
    prisma.user.create({
      data: {
        username: adminUsername,
        password: hash,
        role: 'ADMIN',
        mustChangePassword: false
      }
    }),
    prisma.setting.create({ data: { key: 'businessName', value: businessName } }),
    prisma.setting.create({ data: { key: 'businessAddress', value: address } }),
    prisma.setting.create({ data: { key: 'businessOwner', value: ownerName } })
  ])

  logger.info(`First-run setup completed for business: ${businessName}`)

  return true
}

export async function login(username: string, password: string): Promise<Omit<User, 'password'>> {
  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) throw new Error('Invalid username or password')
  if (user.status !== 'ACTIVE') throw new Error('User account is deactivated')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Invalid username or password')

  const { password: _, ...safeUser } = user
  currentUser = safeUser

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'LOGIN',
      details: 'User logged in'
    }
  })

  return safeUser
}

export async function logout() {
  const prisma = getPrisma()
  if (currentUser) {
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'LOGOUT',
        details: 'User logged out'
      }
    })
  }
  currentUser = null
}

export function getCurrentUser() {
  return currentUser
}