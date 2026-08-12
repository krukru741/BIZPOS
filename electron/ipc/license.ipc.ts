import { ipcMain } from 'electron'
import { verifyLicense, activateLicense, getInstallationId } from '../services/license.service'
import { isDatabaseEmpty } from '../services/db.service'

export function registerLicenseIPC() {
  ipcMain.handle('system-status', async () => {
    const isFirstRun = await isDatabaseEmpty()
    const installId = await getInstallationId()
    let license = { valid: false, restricted: true, license: null }
    if (!isFirstRun) {
      license = await verifyLicense()
    }
    return { isFirstRun, license, installId }
  })

  ipcMain.handle('license-activate', async (event, licenseString: string) => {
    return await activateLicense(licenseString)
  })
}
