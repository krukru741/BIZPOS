import { app } from 'electron'
import path from 'path'
import fs from 'fs/promises'

// For production, we want AppData/Roaming/BizPOS/
// app.getPath('userData') automatically resolves to this based on package.json name
const USER_DATA = app.getPath('userData')

export const PATHS = {
  data: path.join(USER_DATA, 'data'),
  backups: path.join(USER_DATA, 'backups'),
  logs: path.join(USER_DATA, 'logs'),
  config: path.join(USER_DATA, 'config'),
  license: path.join(USER_DATA, 'license'),
  
  // Specific files
  db: path.join(USER_DATA, 'data', 'bizpos.db'),
  logFile: path.join(USER_DATA, 'logs', 'bizpos.log'),
  installConfig: path.join(USER_DATA, 'config', 'installation.json'),
  licenseFile: path.join(USER_DATA, 'license', 'license.json')
}

export async function ensureAppDirectories() {
  const dirs = [PATHS.data, PATHS.backups, PATHS.logs, PATHS.config, PATHS.license]
  for (const dir of dirs) {
    try {
      await fs.access(dir)
    } catch {
      await fs.mkdir(dir, { recursive: true })
    }
  }
}
