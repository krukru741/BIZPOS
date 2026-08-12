import { ipcMain } from 'electron'
import { login, logout, getCurrentUser } from '../services/auth.service'

export function registerAuthIPC() {
  ipcMain.handle('auth-login', async (event, { username, password }) => {
    return await login(username, password)
  })

  ipcMain.handle('auth-logout', async () => {
    return await logout()
  })

  ipcMain.handle('auth-current', async () => {
    return getCurrentUser()
  })

  // User Management
  ipcMain.handle('users-list', async () => {
    requirePermission('users.manage')
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    const users = await prisma.user.findMany({ select: { id: true, username: true, role: true, status: true } })
    return users
  })

  ipcMain.handle('users-create', async (event, { username, password, role }) => {
    requirePermission('users.manage')
    const { PrismaClient } = require('@prisma/client')
    const bcrypt = require('bcryptjs')
    const prisma = new PrismaClient()
    
    const count = await prisma.user.count({ where: { username } })
    if (count > 0) throw new Error('Username already exists')

    const hash = await bcrypt.hash(password, 10)
    return await prisma.user.create({
      data: { username, password: hash, role }
    })
  })

  ipcMain.handle('users-update', async (event, { id, role }) => {
    requirePermission('users.manage')
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    return await prisma.user.update({ where: { id }, data: { role } })
  })

  ipcMain.handle('users-toggle-status', async (event, id) => {
    requirePermission('users.manage')
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    const user = await prisma.user.findUnique({ where: { id } })
    if (user.username === 'admin') throw new Error('Cannot deactivate root admin')
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    return await prisma.user.update({ where: { id }, data: { status: newStatus } })
  })
}
