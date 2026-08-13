import { ipcMain } from 'electron'
import { verifyLicense, activateLicense, getInstallationId } from '../services/license.service'
import { isDatabaseEmpty } from '../services/db.service'

export function registerLicenseIPC() {
  ipcMain.handle('system-status', async () => {
    const isFirstRun = await isDatabaseEmpty()
    const installId = await getInstallationId()
    let license = { valid: false, restricted: true, license: null }
    let businessName = "JUAN MINI GROCERY" // Fallback

    if (!isFirstRun) {
      license = await verifyLicense()
      
      const { getPrisma } = require('../services/db.service')
      const prisma = getPrisma()
      const bNameSetting = await prisma.setting.findUnique({ where: { key: 'businessName' } })
      if (bNameSetting) {
        businessName = bNameSetting.value
      }
    }
    
    return { isFirstRun, license, installId, businessName }
  })

  ipcMain.handle('license-activate', async (event, licenseString: string) => {
    return await activateLicense(licenseString)
  })
}
