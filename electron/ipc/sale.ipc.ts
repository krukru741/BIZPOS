import { getPrisma } from '../services/db.service'
import { ipcMain } from 'electron'
import { executeCheckout } from '../services/sale.service'

const prisma = getPrisma()

export function registerSaleIPC() {
  ipcMain.handle('checkout', async (event, data) => {
    return await executeCheckout(data)
  })

  ipcMain.handle('get-sales', async () => {
    // Basic implementation: get recent sales
    return await prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        payment: true,
        items: {
          include: { product: true }
        }
      }
    })
  })
}
