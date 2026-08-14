import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import ProductDetail from "./pages/ProductDetail";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Sales from "./pages/Sales";
import ManualSale from "./pages/ManualSale";
import Customers from "./pages/Customers";
import Purchases from "./pages/Purchases";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import DesignSystem from "./pages/DesignSystem";
import { notifications as allNotifs } from "./data/mockData";

type Page = string;

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  pos: "Point of Sale",
  products: "Products",
  "add-product": "Add Product",
  "product-detail": "Product Details",
  inventory: "Inventory",
  sales: "Sales History",
  "manual-sale": "Manual Sale",
  customers: "Customers",
  purchases: "Purchases",
  expenses: "Expenses",
  reports: "Reports",
  notifications: "Notifications",
  settings: "Settings",
  "design-system": "Design System",
};

const breadcrumbs: Record<string, string[]> = {
  "add-product": ["Products", "Add Product"],
  "product-detail": ["Products", "Product Details"],
  "manual-sale": ["Sales History", "Manual Sale"],
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(allNotifs.filter(n => !n.read).length);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const markAllRead = () => {
    setUnreadCount(0);
    showToast("All notifications marked as read");
  };

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

  const renderPage = () => {
    const props = { onNavigate: navigate };
    switch (currentPage) {
      case "dashboard": return <Dashboard onNavigate={navigate} />;
      case "pos": return <POS onNavigate={navigate} />;
      case "products": return <Products onNavigate={navigate} />;
      case "add-product": return <AddProduct onNavigate={navigate} />;
      case "product-detail": return <ProductDetail onNavigate={navigate} />;
      case "inventory": return <Inventory onNavigate={navigate} />;
      case "sales": return <Sales onNavigate={navigate} />;
      case "manual-sale": return <ManualSale onNavigate={navigate} />;
      case "customers": return <Customers />;
      case "purchases": return <Purchases />;
      case "expenses": return <Expenses />;
      case "reports": return <Reports />;
      case "notifications": return <Notifications onMarkRead={markAllRead} />;
      case "settings": return <Settings darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />;
      case "design-system": return <DesignSystem />;
      default: return <Dashboard onNavigate={navigate} />;
    }
  };

  const isPOS = currentPage === "pos";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        darkMode={darkMode}
        unreadCount={unreadCount}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar
          title={pageTitles[currentPage] || currentPage}
          breadcrumb={breadcrumbs[currentPage]}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
          onNavigate={navigate}
          unreadCount={unreadCount}
        />

        <main style={{ flex: 1, overflowY: "auto" }}>
          {renderPage()}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="animate-toast" style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 18px",
          background: "var(--card)",
          border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          maxWidth: 360,
          fontSize: 14,
          fontWeight: 600,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: toast.type === "success" ? "#22C55E" : "#EF4444", flexShrink: 0 }} />
          {toast.message}
        </div>
      )}
    </div>
  );
}
