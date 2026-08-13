import { Bell, AlertTriangle, CheckCircle, XCircle, Info, Truck } from "lucide-react";
import { notifications } from "../data/mockData";

interface NotificationsProps {
  onMarkRead: () => void;
}

const icons: Record<string, React.ReactNode> = {
  warning: <AlertTriangle size={18} color="#F59E0B" />,
  success: <CheckCircle size={18} color="#22C55E" />,
  error: <XCircle size={18} color="#EF4444" />,
  info: <Info size={18} color="#3B82F6" />,
};
const bgColors: Record<string, string> = {
  warning: "#FEF9C3",
  success: "#DCFCE7",
  error: "#FEE2E2",
  info: "#DBEAFE",
};

export default function Notifications({ onMarkRead }: NotificationsProps) {
  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div className="section-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>
            {notifications.filter(n => !n.read).length} unread notifications
          </p>
        </div>
        <button className="btn btn-secondary" onClick={onMarkRead}>Mark all as read</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 680 }}>
        {notifications.map(n => (
          <div key={n.id} style={{
            background: "var(--card)",
            border: `1px solid ${n.read ? "var(--border)" : "rgba(34,197,94,0.2)"}`,
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            opacity: n.read ? 0.7 : 1,
            transition: "all 0.15s ease",
          }}>
            <div style={{ width: 38, height: 38, background: bgColors[n.type], borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {icons[n.type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{n.title}</p>
                <span style={{ fontSize: 11, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>{n.time}</span>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--muted-foreground)" }}>{n.message}</p>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, background: "var(--primary)", borderRadius: "50%", flexShrink: 0, marginTop: 6 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
