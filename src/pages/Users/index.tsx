import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Edit2, Lock, Ban, CheckCircle } from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string|null>(null)

  // Form State
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CASHIER')
  
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await window.ipcRenderer.invoke('users-list')
      setUsers(res)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await window.ipcRenderer.invoke('users-update', { id: editingId, role })
      } else {
        await window.ipcRenderer.invoke('users-create', { username, password, role })
      }
      setShowModal(false)
      loadUsers()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      await window.ipcRenderer.invoke('users-toggle-status', id)
      loadUsers()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const openNew = () => {
    setEditingId(null)
    setUsername('')
    setPassword('')
    setRole('CASHIER')
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <Button onClick={openNew}><UserPlus className="w-4 h-4 mr-2"/> Add User</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id} className={u.status === 'INACTIVE' ? 'opacity-50' : ''}>
                  <TableCell className="font-bold">{u.username}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    {u.status === 'ACTIVE' 
                      ? <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">ACTIVE</span>
                      : <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded text-xs font-bold">INACTIVE</span>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingId(u.id)
                      setUsername(u.username)
                      setRole(u.role)
                      setShowModal(true)
                    }}>
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </Button>
                    {u.username !== 'admin' && (
                      <Button variant="ghost" size="icon" onClick={() => toggleStatus(u.id, u.status)}>
                        {u.status === 'ACTIVE' ? <Ban className="w-4 h-4 text-rose-600" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader><CardTitle>{editingId ? 'Edit User' : 'New User'}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Username</label>
                  <Input value={username} onChange={e=>setUsername(e.target.value)} disabled={!!editingId} required />
                </div>
                {!editingId && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Password</label>
                    <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-bold">Role</label>
                  <Select value={role} onValueChange={(val: any) => setRole(val)} disabled={username === 'admin'}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="CASHIER">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">{editingId ? 'Save Changes' : 'Create User'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
