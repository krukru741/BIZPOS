import { ipcMain } from 'electron'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function registerCategoryIPC() {
  ipcMain.handle('get-categories', async () => {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
  })

  ipcMain.handle('create-category', async (event, data: { name: string }) => {
    return await prisma.category.create({
      data: { name: data.name }
    })
  })
}
