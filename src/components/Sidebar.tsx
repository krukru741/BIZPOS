import { LayoutDashboard, Package, ShoppingCart, BarChart3, Receipt, Users, Truck, DollarSign, Bell, Settings, ChevronLeft, ChevronRight, Leaf, PieChart, ClipboardList } from "lucide-react";

type Page = string;

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
  darkMode: boolean;
  unreadCount: number;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pos", label: "POS", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "inventory", label: "Inventory", icon: ClipboardList },
  { id: "sales", label: "Sales History", icon: Receipt },
  { id: "customers", label: "Customers", icon: Users },
  { id: "purchases", label: "Purchases", icon: Truck },
  { id: "expenses", label: "Expenses", icon: DollarSign },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "design-system", label: "Design System", icon: PieChart },
];

export default function Sidebar({ currentPage, onNavigate, collapsed, onToggle, darkMode, unreadCount }: SidebarProps) {
  return (
    <aside
      style={{
        width: collapsed ? 60 : "var(--sidebar-width)",
        minWidth: collapsed ? 60 : "var(--sidebar-width)",
        height: "100vh",
        background: "var(--card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease, min-width 0.25s ease",
        position: "sticky",
        top: 0,
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", borderBottom: "1px solid var(--border)" }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "var(--foreground)", lineHeight: 1.1 }}>FreshMart</div>
              <div style={{ fontSize: 10, color: "var(--muted-foreground)", fontWeight: 500 }}>POS System</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Leaf size={18} color="#fff" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="btn btn-ghost"
          style={{ padding: "4px", borderRadius: 6, minWidth: 0, flexShrink: 0 }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`sidebar-link ${currentPage === id ? "active" : ""}`}
            onClick={() => onNavigate(id)}
            title={collapsed ? label : undefined}
            style={{ justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "8px" : "8px 12px", position: "relative" }}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
            {id === "notifications" && unreadCount > 0 && !collapsed && (
              <span className="badge badge-red" style={{ marginLeft: "auto", padding: "1px 6px", fontSize: 10 }}>{unreadCount}</span>
            )}
          </button>
        ))}

        <div style={{ height: 1, background: "var(--border)", margin: "8px 4px" }} />

        <button
          className={`sidebar-link ${currentPage === "notifications" ? "active" : ""}`}
          onClick={() => onNavigate("notifications")}
          title={collapsed ? "Notifications" : undefined}
          style={{ justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "8px" : "8px 12px", position: "relative" }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, background: "#EF4444", borderRadius: "50%", border: "2px solid var(--card)" }} />
            )}
          </div>
          {!collapsed && <span>Notifications</span>}
          {!collapsed && unreadCount > 0 && <span className="badge badge-red" style={{ marginLeft: "auto", padding: "1px 6px", fontSize: 10 }}>{unreadCount}</span>}
        </button>

        <button
          className={`sidebar-link ${currentPage === "settings" ? "active" : ""}`}
          onClick={() => onNavigate("settings")}
          title={collapsed ? "Settings" : undefined}
          style={{ justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "8px" : "8px 12px" }}
        >
          <Settings size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Settings</span>}
        </button>
      </nav>

      {/* User */}
      {!collapsed && (
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#22C55E,#16A34A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 13, flexShrink: 0 }}>A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Admin User</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Store Manager</div>
          </div>
        </div>
      )}
    </aside>
  );
}
