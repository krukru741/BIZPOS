import { ipcMain } from 'electron'
import { executeCheckout } from '../services/sale.service'

export function registerSaleIPC() {
  ipcMain.handle('checkout', async (event, data) => {
    return await executeCheckout(data)
  })
}
