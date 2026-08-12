import { ipcMain } from 'electron'
import { getDashboardKPIs, getSalesTrend, getTopProducts, getPaymentMethods, getLowStockProducts } from '../services/dashboard.service'

export function registerDashboardIPC() {
  ipcMain.handle('dashboard-kpis', async (event, range: string) => {
    return await getDashboardKPIs(range)
  })

  ipcMain.handle('dashboard-sales-trend', async (event, range: string) => {
    return await getSalesTrend(range)
  })

  ipcMain.handle('dashboard-top-products', async (event, range: string) => {
    return await getTopProducts(range)
  })

  ipcMain.handle('dashboard-payment-methods', async (event, range: string) => {
    return await getPaymentMethods(range)
  })

  ipcMain.handle('dashboard-low-stock', async () => {
    return await getLowStockProducts()
  })

  ipcMain.handle('dashboard-report', async (event, type: string, range: string) => {
    const { getReport } = require('../services/dashboard.service')
    return await getReport(type, range)
  })
}
