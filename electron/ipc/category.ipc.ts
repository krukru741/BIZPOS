import { getPrisma } from '../services/db.service'
import { ipcMain } from 'electron'

const prisma = getPrisma()

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
