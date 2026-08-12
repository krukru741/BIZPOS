import { ipcMain } from 'electron'
import { openCashSession, closeCashSession, addCashMovement, getActiveCashSession, calculateExpectedCash } from '../services/cash.service'

export function registerCashIPC() {
  ipcMain.handle('cash-open-session', async (event, openingCash: number) => {
    return await openCashSession(openingCash)
  })

  ipcMain.handle('cash-close-session', async (event, { actualCash, note }) => {
    return await closeCashSession(actualCash, note)
  })

  ipcMain.handle('cash-movement', async (event, { type, amount, reason, note }) => {
    return await addCashMovement(type, amount, reason, note)
  })

  ipcMain.handle('cash-active-session', async () => {
    return await getActiveCashSession()
  })

  ipcMain.handle('cash-expected', async (event, sessionId: string) => {
    return await calculateExpectedCash(sessionId)
  })
}
