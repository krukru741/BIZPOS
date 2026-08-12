import { ipcMain } from 'electron'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function registerProductIPC() {
  ipcMain.handle('get-products', async () => {
    return await prisma.product.findMany({
      where: { status: 'ACTIVE' }
    })
  })
}
