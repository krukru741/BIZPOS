import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, Tag, FileText } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'POS', path: '/pos', icon: ShoppingCart },
    { name: 'Products', path: '/products', icon: Tag },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Sales', path: '/sales', icon: FileText },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-slate-50 print:bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col print:hidden">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight">BIZPOS</h1>
          <p className="text-sm text-slate-400">Admin ▼</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {links.map((link) => {
              const active = location.pathname === link.path
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <link.icon size={20} />
                    <span>{link.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
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
