import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Package, Tags, Settings as SettingsIcon, ClipboardList, Receipt, BarChart, LogOut, UserCircle, Wallet, DatabaseBackup } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

const MENU_ITEMS = [
  { path: '/pos', label: 'POS', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
  { path: '/sales', label: 'Sales History', icon: Receipt, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { path: '/cash', label: 'Cash Session', icon: Wallet, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { path: '/products', label: 'Products', icon: Package, roles: ['ADMIN', 'MANAGER'] },
  { path: '/categories', label: 'Categories', icon: Tags, roles: ['ADMIN'] },
  { path: '/inventory', label: 'Inventory', icon: ClipboardList, roles: ['ADMIN', 'MANAGER'] },
  { path: '/reports', label: 'Reports', icon: BarChart, roles: ['ADMIN', 'MANAGER'] },
  { path: '/users', label: 'Users', icon: UserCircle, roles: ['ADMIN'] },
  { path: '/settings', label: 'Settings', icon: SettingsIcon, roles: ['ADMIN'] },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  const allowedItems = MENU_ITEMS.filter(item => item.roles.includes(user?.role || ''))

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col print:hidden">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-wider">BIZPOS</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Cashier: {user?.username}</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {allowedItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white font-medium' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
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
          <Outlet />
        </div>
      </main>
    </div>
  )
}
