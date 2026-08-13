import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Package, Tags, Settings as SettingsIcon, ClipboardList, Receipt, BarChart, LogOut, UserCircle, Wallet, DatabaseBackup, Store } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

const MENU_GROUPS = [
  {
    name: 'OPERATIONS',
    items: [
      { path: '/pos', label: 'POS', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
      { path: '/sales', label: 'Sales History', icon: Receipt, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
      { path: '/cash', label: 'Cash Session', icon: Wallet, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    ]
  },
  {
    name: 'INVENTORY',
    items: [
      { path: '/products', label: 'Products', icon: Package, roles: ['ADMIN', 'MANAGER'] },
      { path: '/categories', label: 'Categories', icon: Tags, roles: ['ADMIN'] },
      { path: '/inventory', label: 'Inventory', icon: ClipboardList, roles: ['ADMIN', 'MANAGER'] },
    ]
  },
  {
    name: 'MANAGEMENT',
    items: [
      { path: '/reports', label: 'Reports', icon: BarChart, roles: ['ADMIN', 'MANAGER'] },
      { path: '/users', label: 'Users', icon: UserCircle, roles: ['ADMIN'] },
      { path: '/settings', label: 'Settings', icon: SettingsIcon, roles: ['ADMIN'] },
    ]
  }
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [businessName, setBusinessName] = useState('BizPOS')

  useEffect(() => {
    // Fetch business name dynamically for the sidebar
    window.ipcRenderer.invoke('get-settings').then(settings => {
      if (settings.businessName) {
        setBusinessName(settings.businessName)
      }
    }).catch(console.error)
  }, [])

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col print:hidden">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white mb-2 opacity-50">
            <Store size={14} />
            <span className="text-xs font-bold tracking-widest">BIZPOS</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-wide uppercase leading-tight">{businessName}</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Cashier: {user?.username}</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6 px-3">
            {MENU_GROUPS.map((group) => {
              const allowedItems = group.items.filter(item => item.roles.includes(user?.role || ''))
              if (allowedItems.length === 0) return null
              
              return (
                <div key={group.name} className="space-y-1">
                  <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                    {group.name}
                  </h3>
                  <ul className="space-y-1">
                    {allowedItems.map((item) => {
                      const isActive = location.pathname === item.path
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                              isActive 
                                ? 'bg-blue-600/10 text-blue-400 font-semibold' 
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                            }`}
                          >
                            <item.icon size={18} className={`transition-transform duration-200 ${isActive ? 'scale-110 text-blue-500' : 'group-hover:scale-110 group-hover:text-slate-300'}`} />
                            <span className="text-sm tracking-wide">{item.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          {user?.role === 'ADMIN' && (
            <div className="text-xs flex items-center gap-2 text-emerald-500 bg-slate-800/50 p-2 rounded">
              <DatabaseBackup size={14} /> Backup Active
            </div>
          )}
          <Button variant="destructive" className="w-full flex gap-2" onClick={logout}>
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
