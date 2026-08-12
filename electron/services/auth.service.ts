import { PrismaClient, User } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = getPrisma()

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
  const count = await prisma.user.count()
  if (count === 0) {
    const passwordHash = await bcrypt.hash('password123', 10)
    await prisma.user.create({
      data: {
        username: 'admin',
        password: passwordHash,
        role: 'ADMIN',
        mustChangePassword: true
      }
    })
  }
}

export async function login(username: string, password: string):Promise<Omit<User, 'password'>> {
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
