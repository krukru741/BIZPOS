import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    businessName: '',
    address: '',
    contactNumber: '',
    tin: '',
    receiptFooter: '',
    currency: 'PHP',
    lowStockThreshold: '10'
  })
  
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Load settings from IPC
    const loadSettings = async () => {
      try {
        const data = await window.ipcRenderer.invoke('get-settings')
        if (Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }))
        }
      } catch (error) {
        console.error('Failed to load settings', error)
      }
    }
    loadSettings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await window.ipcRenderer.invoke('save-settings', settings)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Business Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input id="businessName" name="businessName" value={settings.businessName} onChange={handleChange} placeholder="Juan Mini Grocery" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" value={settings.address} onChange={handleChange} placeholder="Barobo, Agusan del Sur" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input id="contactNumber" name="contactNumber" value={settings.contactNumber} onChange={handleChange} placeholder="09XX XXX XXXX" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tin">TIN</Label>
            <Input id="tin" name="tin" value={settings.tin} onChange={handleChange} placeholder="XXX-XXX-XXX" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="receiptFooter">Receipt Footer</Label>
            <Input id="receiptFooter" name="receiptFooter" value={settings.receiptFooter} onChange={handleChange} placeholder="Thank you for shopping with us!" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" value={settings.currency} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low-stock Default Threshold</Label>
              <Input type="number" id="lowStockThreshold" name="lowStockThreshold" value={settings.lowStockThreshold} onChange={handleChange} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'SAVE SETTINGS'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
