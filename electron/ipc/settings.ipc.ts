import { ipcMain } from 'electron'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function registerSettingsIPC() {
  ipcMain.handle('get-settings', async () => {
    const settings = await prisma.setting.findMany()
    // Convert array of {key, value} to an object
    return settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, string>)
  })

  ipcMain.handle('save-settings', async (event, settingsObj: Record<string, string>) => {
    const promises = Object.entries(settingsObj).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    })
    await Promise.all(promises)
    return true
  })
}
