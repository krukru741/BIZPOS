import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerProductIPC } from './ipc/product.ipc'
import { registerSaleIPC } from './ipc/sale.ipc'
import { registerSettingsIPC } from './ipc/settings.ipc'
import { registerCategoryIPC } from './ipc/category.ipc'
import { registerInventoryIPC } from './ipc/inventory.ipc'
import { registerDashboardIPC } from './ipc/dashboard.ipc'
import { registerAuthIPC } from './ipc/auth.ipc'
import { registerCashIPC } from './ipc/cash.ipc'
import { registerBackupIPC } from './ipc/backup.ipc'
import { ensureDefaultAdmin } from './services/auth.service'
import { checkStartupBackup } from './services/backup.service'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

async function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true
  })

  win.maximize()

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })
  
  // Register IPC Handlers
  registerProductIPC()
  registerSaleIPC()
  registerSettingsIPC()
  registerCategoryIPC()
  registerInventoryIPC()
  registerDashboardIPC()
  registerAuthIPC()
  registerCashIPC()
  registerBackupIPC()

  await ensureDefaultAdmin()
  await checkStartupBackup()

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
