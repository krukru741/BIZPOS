import { Bell, Moon, Sun, Search, ChevronRight } from "lucide-react";

interface TopbarProps {
  title: string;
  breadcrumb?: string[];
  darkMode: boolean;
  onToggleDark: () => void;
  onNavigate: (page: string) => void;
  unreadCount: number;
}

export default function Topbar({ title, breadcrumb, darkMode, onToggleDark, onNavigate, unreadCount }: TopbarProps) {
  return (
    <header style={{
      height: 60,
      background: "var(--card)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      position: "sticky",
      top: 0,
      zIndex: 9,
    }}>
      <div>
        {breadcrumb && breadcrumb.length > 1 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {breadcrumb.map((crumb, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <ChevronRight size={14} color="var(--muted-foreground)" />}
                <span style={{ fontSize: 13, color: i === breadcrumb.length - 1 ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: i === breadcrumb.length - 1 ? 600 : 400 }}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>{title}</h1>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn btn-ghost" style={{ padding: 8, borderRadius: 8, position: "relative" }} onClick={() => onNavigate("notifications")}>
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, background: "#EF4444", borderRadius: "50%", border: "2px solid var(--card)" }} />
          )}
        </button>
        <button className="btn btn-ghost" style={{ padding: 8, borderRadius: 8 }} onClick={onToggleDark}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#22C55E,#16A34A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 13, cursor: "pointer" }}>A</div>
      </div>
    </header>
  );
}
