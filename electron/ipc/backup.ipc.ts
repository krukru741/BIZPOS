import { ipcMain, dialog } from 'electron'
import { createBackup, listBackups, restoreBackup, exportBackup } from '../services/backup.service'

export function registerBackupIPC() {
  ipcMain.handle('backup-create', async () => {
    return await createBackup('MANUAL')
  })

  ipcMain.handle('backup-list', async () => {
    return await listBackups()
  })

  ipcMain.handle('backup-export', async (event, backupId: string) => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Destination Folder for Backup Export'
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      await exportBackup(backupId, result.filePaths[0])
      return true
    }
    return false
  })

  ipcMain.handle('backup-restore-select', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Backup Folder to Restore'
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  ipcMain.handle('backup-restore-execute', async (event, folderPath: string) => {
    return await restoreBackup(folderPath)
  })
}
