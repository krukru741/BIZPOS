import { getPrisma } from '../services/db.service'
import { ipcMain } from 'electron'

const prisma = getPrisma()

export function registerProductIPC() {
  ipcMain.handle('get-products', async (event, search?: string) => {
    const whereClause = search ? {
      status: 'ACTIVE',
      OR: [
        { name: { contains: search } },
        { barcode: { contains: search } }
      ]
    } : { status: 'ACTIVE' }

    return await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { name: 'asc' }
    })
  })

  ipcMain.handle('get-product-by-barcode', async (event, barcode: string) => {
    return await prisma.product.findUnique({
      where: { barcode, status: 'ACTIVE' },
      include: { category: true }
    })
  })

  ipcMain.handle('create-product', async (event, data: any) => {
    return await prisma.product.create({
      data
    })
  })

  ipcMain.handle('update-product', async (event, id: string, data: any) => {
    return await prisma.product.update({
      where: { id },
      data
    })
  })

  ipcMain.handle('delete-product', async (event, id: string) => {
    // Soft delete
    return await prisma.product.update({
      where: { id },
      data: { status: 'INACTIVE' }
    })
  })
}
