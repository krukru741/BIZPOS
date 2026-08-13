import { getPrisma } from '../services/db.service'
import { ipcMain } from 'electron'
import { executeCheckout, getSales, voidSale } from '../services/sale.service'

const prisma = getPrisma()

export function registerSaleIPC() {
  ipcMain.handle('checkout', async (event, data) => {
    return await executeCheckout(data)
  })

  ipcMain.handle('get-sales', async () => {
    return await getSales()
  })

  ipcMain.handle('void-sale', async (event, { saleId, reason }) => {
    return await voidSale(saleId, reason)
  })
}
