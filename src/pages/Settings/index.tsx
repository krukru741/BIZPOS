import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, ShieldAlert, Download, RefreshCw, AlertTriangle, CheckCircle, DatabaseBackup } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  
  // General State
  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  // Backup State
  const [backups, setBackups] = useState<any[]>([])
  const [isBackingUp, setIsBackingUp] = useState(false)
  
  // Restore State
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [selectedRestoreFolder, setSelectedRestoreFolder] = useState<string|null>(null)
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreProgress, setRestoreProgress] = useState(0)
  const [restoreSuccess, setRestoreSuccess] = useState(false)

  useEffect(() => {
    loadSettings()
    loadBackups()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await window.ipcRenderer.invoke('get-settings')
      if (settings.businessName) setBusinessName(settings.businessName)
      if (settings.businessAddress) setAddress(settings.businessAddress)
      if (settings.businessOwner) setOwnerName(settings.businessOwner)
      if (settings.businessContact) setContact(settings.businessContact)
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await window.ipcRenderer.invoke('save-settings', {
        businessName,
        businessAddress: address,
        businessOwner: ownerName,
        businessContact: contact
      })
      alert('Settings saved successfully.')
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const loadBackups = async () => {
    try {
      const res = await window.ipcRenderer.invoke('backup-list')
      setBackups(res)
    } catch (err) {
      console.error(err)
    }
  }

  const handleBackupNow = async () => {
    setIsBackingUp(true)
    try {
      await window.ipcRenderer.invoke('backup-create')
      await loadBackups()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleExportBackup = async (backupId: string) => {
    try {
      const exported = await window.ipcRenderer.invoke('backup-export', backupId)
      if (exported) alert('Backup exported successfully!')
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSelectRestore = async () => {
    try {
      const folder = await window.ipcRenderer.invoke('backup-restore-select')
      if (folder) {
        setSelectedRestoreFolder(folder)
        setShowRestoreModal(true)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const executeRestore = async () => {
    if (!selectedRestoreFolder) return
    setIsRestoring(true)
    try {
      // Simulate progress for UI
      const interval = setInterval(() => {
        setRestoreProgress(p => {
          if (p >= 90) {
            clearInterval(interval)
            return 90
          }
          return p + 10
        })
      }, 500)

      await window.ipcRenderer.invoke('backup-restore-execute', selectedRestoreFolder)
      
      clearInterval(interval)
      setRestoreProgress(100)
      setRestoreSuccess(true)
    } catch (err: any) {
      setIsRestoring(false)
      setRestoreProgress(0)
      alert(`Restore Failed: ${err.message}\n\nDon't worry, your database was rolled back and remains safe.`)
      setShowRestoreModal(false)
    }
  }

  const latestBackup = backups.length > 0 ? backups[0] : null

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          {user?.role === 'ADMIN' && <TabsTrigger value="backup">Backup & Restore</TabsTrigger>}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Business Name</label>
                  <Input value={businessName} onChange={e=>setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Address</label>
                  <Input value={address} onChange={e=>setAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Owner / Manager Name</label>
                  <Input value={ownerName} onChange={e=>setOwnerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Contact Number</label>
                  <Input value={contact} onChange={e=>setContact(e.target.value)} />
                </div>
                <Button type="submit" className="mt-4" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" /> 
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === 'ADMIN' && (
          <TabsContent value="backup">
            <div className="grid grid-cols-3 gap-6">
              <Card className="col-span-2">
                <CardHeader><CardTitle>Backup Status</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {latestBackup ? (
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-md flex items-start gap-4">
                      <CheckCircle className="mt-1" />
                      <div>
                        <p className="font-bold text-lg">Backup Healthy</p>
                        <p className="text-sm">Last backup: {new Date(latestBackup.createdAt).toLocaleString()}</p>
                        <p className="text-xs mt-1">ID: {latestBackup.backupId}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 text-amber-700 rounded-md flex items-start gap-4">
                      <AlertTriangle className="mt-1" />
                      <div>
                        <p className="font-bold text-lg">No Backups Found</p>
                        <p className="text-sm">Your database is currently unprotected against failure.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button onClick={handleBackupNow} disabled={isBackingUp} className="flex-1">
                      {isBackingUp ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <DatabaseBackup className="w-4 h-4 mr-2" />}
                      Backup Now
                    </Button>
                    {latestBackup && (
                      <Button onClick={() => handleExportBackup(latestBackup.backupId)} variant="outline" className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export Latest Backup to USB
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-rose-600 flex items-center gap-2"><ShieldAlert size={20}/> Danger Zone</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 mb-6">Restoring a backup will overwrite all current sales and inventory data.</p>
                  <Button onClick={handleSelectRestore} variant="destructive" className="w-full">RESTORE BACKUP</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg shadow-2xl border-rose-600 border-2">
            {!isRestoring ? (
              <>
                <CardHeader className="bg-rose-50 text-rose-700 border-b border-rose-100">
                  <CardTitle className="flex items-center gap-2"><AlertTriangle/> RESTORE DATABASE</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="font-bold">This will replace your current BizPOS database.</p>
                  <div className="p-4 bg-slate-100 rounded text-sm space-y-2">
                    <p>Current database: <strong>{new Date().toLocaleDateString()}</strong></p>
                    <p>Selected backup folder: <strong>{selectedRestoreFolder}</strong></p>
                  </div>
                  <p className="text-rose-600 text-sm font-medium">Any transactions created after the selected backup will no longer exist.</p>
                  <p className="text-xs text-slate-500">An emergency backup of the current database will automatically be created before restoring.</p>
                  
                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowRestoreModal(false)}>CANCEL</Button>
                    <Button variant="destructive" className="flex-1" onClick={executeRestore}>RESTORE DATABASE</Button>
                  </div>
                </CardContent>
              </>
            ) : !restoreSuccess ? (
              <CardContent className="py-12 text-center space-y-6">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                <div>
                  <h3 className="text-xl font-bold">Restoring database...</h3>
                  <p className="text-sm text-slate-500 mt-2">Please do not close BizPOS.</p>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${restoreProgress}%` }}></div>
                </div>
              </CardContent>
            ) : (
              <CardContent className="py-12 text-center space-y-6">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
                <div>
                  <h3 className="text-2xl font-bold text-emerald-700">Restore Successful</h3>
                  <p className="text-slate-600 mt-2">BizPOS will restart in 3 seconds...</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
