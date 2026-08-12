import { getPrisma } from '../services/db.service'
import { ipcMain } from 'electron'

const prisma = getPrisma()

export function registerInventoryIPC() {
  ipcMain.handle('get-inventory-movements', async (event, productId: string) => {
    return await prisma.inventoryMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' }
    })
  })

  ipcMain.handle('create-adjustment', async (event, data: { productId: string, quantity: number, type: string, remarks: string }) => {
    return await prisma.$transaction(async (tx) => {
      // Create movement
      const movement = await tx.inventoryMovement.create({
        data: {
          productId: data.productId,
          type: data.type, // STOCK_IN, ADJUSTMENT, DAMAGED, etc.
          quantity: data.quantity,
          remarks: data.remarks
        }
      })

      // Update product stock
      const product = await tx.product.update({
        where: { id: data.productId },
        data: { currentStock: { increment: data.quantity } }
      })

      // Create audit log
      let user = await tx.user.findFirst()
      if (!user) user = await tx.user.create({ data: { username: "admin", password: "123", role: "Admin" } })

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "INVENTORY_ADJUSTMENT",
          details: `Adjusted ${product.name} by ${data.quantity} (${data.type})`
        }
      })

      return movement
    })
  })
}
