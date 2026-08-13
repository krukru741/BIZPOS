import { ipcMain } from 'electron'
import { getDashboardKPIs, getSalesTrend, getTopProducts, getPaymentMethods, getInventoryAlerts, getRecentActivity } from '../services/dashboard.service'

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

  ipcMain.handle('dashboard-inventory-alerts', async () => {
    return await getInventoryAlerts()
  })

  ipcMain.handle('dashboard-recent-activity', async () => {
    return await getRecentActivity()
  })

  ipcMain.handle('dashboard-report', async (event, type: string, range: string) => {
    const { getReport } = require('../services/dashboard.service')
    return await getReport(type, range)
  })
}
