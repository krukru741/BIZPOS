import { useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, User, Tag, Receipt, QrCode, Banknote, CreditCard, CheckCircle, X, Pause } from "lucide-react";
import { products, categories } from "../data/mockData";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  image: string;
}

type PaymentMethod = "cash" | "qr" | "card";

export default function POS() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [customer, setCustomer] = useState("Walk-in Customer");

  const filtered = products.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product: typeof products[0]) => {
    if (product.stock === 0) return; // prevent adding out-of-stock items
    setCart(cart => {
      const existing = cart.find(c => c.id === product.id);
      if (existing) return cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...cart, { id: product.id, name: product.name, price: product.sellingPrice, qty: 1, image: product.image }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(cart => cart.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const discountAmt = Math.round(subtotal * discount / 100);
  const tax = Math.round((subtotal - discountAmt) * 0.05);
  const total = subtotal - discountAmt + tax;
  const change = cashReceived ? Math.max(0, +cashReceived - total) : 0;

  const completeSale = () => {
    if (payMethod === "qr") { setShowQR(true); return; }
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); setCart([]); setDiscount(0); setCashReceived(""); }, 3000);
  };

  const posCategories = ["All", ...categories.slice(1, 9)];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>
      {/* LEFT: Products */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid var(--border)", background: "var(--background)" }}>
        {/* Search + Categories */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", background: "var(--card)", flexShrink: 0 }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input className="input" style={{ paddingLeft: 36 }} placeholder="Search products or scan barcode…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            {posCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                background: activeCategory === cat ? "var(--primary)" : "var(--muted)",
                color: activeCategory === cat ? "#fff" : "var(--muted-foreground)",
                border: "none", cursor: "pointer", transition: "all 0.15s ease",
              }}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {filtered.map(p => (
              <div key={p.id} className="pos-product-card" onClick={() => addToCart(p)}>
                <div style={{ fontSize: 32, textAlign: "center", padding: "4px 0" }}>{p.image}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted-foreground)" }}>{p.brand}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--primary)" }}>₱{p.sellingPrice}</span>
                  {p.stock <= p.minStock && p.stock > 0 && <span className="badge badge-yellow" style={{ fontSize: 9, padding: "1px 5px" }}>Low</span>}
                  {p.stock === 0 && <span className="badge badge-red" style={{ fontSize: 9, padding: "1px 5px" }}>Out</span>}
                </div>
                <div style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }} className="add-icon">
                  <Plus size={12} color="#fff" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div style={{ width: 380, display: "flex", flexDirection: "column", background: "var(--card)", overflow: "hidden" }}>
        {/* Cart header */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingCart size={18} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Cart</span>
            {cart.length > 0 && <span className="badge badge-green">{cart.reduce((a, c) => a + c.qty, 0)} items</span>}
          </div>
          {cart.length > 0 && <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => setCart([])}><Trash2 size={13} /> Clear</button>}
        </div>

        {/* Customer */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
          <User size={15} color="var(--muted-foreground)" />
          <input className="input" style={{ border: "none", padding: "4px 0", fontSize: 13, background: "transparent" }} value={customer} onChange={e => setCustomer(e.target.value)} />
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {cart.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, padding: 32 }}>
              <ShoppingCart size={48} color="var(--border)" />
              <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: 14, textAlign: "center" }}>Cart is empty.<br />Tap a product to add it.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.image}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>₱{item.price} × {item.qty}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, border: "1px solid var(--border)", borderRadius: 6, background: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                  <span style={{ fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, border: "1px solid var(--primary)", borderRadius: 6, background: "rgba(34,197,94,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12} color="var(--primary)" /></button>
                </div>
                <span style={{ fontWeight: 800, fontSize: 14, minWidth: 60, textAlign: "right" }}>₱{item.price * item.qty}</span>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
          {/* Discount */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Tag size={14} color="var(--muted-foreground)" />
            <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Discount</span>
            <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
              {[0, 5, 10, 15].map(d => (
                <button key={d} onClick={() => setDiscount(d)} style={{
                  padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "1px solid",
                  borderColor: discount === d ? "var(--primary)" : "var(--border)",
                  background: discount === d ? "rgba(34,197,94,0.1)" : "transparent",
                  color: discount === d ? "var(--primary)" : "var(--muted-foreground)",
                  cursor: "pointer",
                }}>{d}%</button>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {[
              ["Subtotal", `₱${subtotal.toLocaleString("en-PH")}`],
              discount > 0 ? [`Discount (${discount}%)`, `-₱${discountAmt.toLocaleString("en-PH")}`] : null,
              ["GST (5%)", `₱${tax.toLocaleString("en-PH")}`],
            ].filter((row): row is string[] => row !== null).map(([k, v]) => (
              <div key={k as string} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--muted-foreground)" }}>{k}</span>
                <span style={{ color: (v as string).startsWith("-") ? "#EF4444" : "var(--foreground)" }}>{v}</span>
              </div>
            ))}
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: "var(--primary)" }}>₱{total.toLocaleString("en-PH")}</span>
            </div>
          </div>

          {/* Payment method */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
            {([
              { key: "cash", label: "Cash", icon: <Banknote size={16} /> },
              { key: "qr", label: "QR/UPI", icon: <QrCode size={16} /> },
              { key: "card", label: "Card", icon: <CreditCard size={16} /> },
            ] as const).map(({ key, label, icon }) => (
              <button key={key} onClick={() => setPayMethod(key)} style={{
                padding: "10px 8px", border: `2px solid ${payMethod === key ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 10, background: payMethod === key ? "rgba(34,197,94,0.08)" : "transparent",
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s ease",
              }}>
                <div style={{ color: payMethod === key ? "var(--primary)" : "var(--muted-foreground)" }}>{icon}</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: payMethod === key ? "var(--primary)" : "var(--muted-foreground)" }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Cash received */}
          {payMethod === "cash" && (
            <div style={{ marginBottom: 12 }}>
              <input className="input" type="number" placeholder="Cash received" value={cashReceived} onChange={e => setCashReceived(e.target.value)} style={{ marginBottom: 6 }} />
              {cashReceived && +cashReceived >= total && (
                <p style={{ margin: 0, fontSize: 13, color: "#22C55E", fontWeight: 700 }}>Change: ₱{change.toLocaleString("en-PH")}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <button className="btn btn-primary animate-pulse-green" style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: 16, fontWeight: 800, borderRadius: 12 }} onClick={completeSale} disabled={cart.length === 0}>
            <CheckCircle size={18} /> Complete Sale — ₱{total.toLocaleString("en-PH")}
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <button className="btn btn-secondary" style={{ justifyContent: "center", fontSize: 12 }}><Pause size={14} /> Hold</button>
            <button className="btn btn-secondary" style={{ justifyContent: "center", fontSize: 12 }} onClick={() => setCart([])}><X size={14} /> Cancel</button>
          </div>
        </div>
      </div>

      {/* QR Payment Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal" style={{ textAlign: "center", maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>Scan to Pay</h3>
            <p style={{ margin: "0 0 20px", color: "var(--muted-foreground)" }}>Amount: <strong style={{ color: "var(--primary)", fontSize: 20 }}>₱{total.toLocaleString("en-PH")}</strong></p>

            {/* QR code simulation */}
            <div style={{ width: 200, height: 200, margin: "0 auto 20px", background: "var(--foreground)", borderRadius: 16, display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 1, padding: 12 }}>
              {[...Array(100)].map((_, i) => (
                <div key={i} style={{ background: [2,3,4,12,13,14,22,23,24,5,15,25,30,31,32,40,41,42,50,51,52,37,38,39,47,48,49,57,58,59,60,61,62,70,71,72,80,81,82,7,17,27,65,75,85,45,55,46,56,66,76,86,43,53,63,73,83,93,44,54,64,74,84,94,92,91,90,89,88,20,21,8,9,18,19,28,29,68,69,78,79,99,98,97,96].includes(i) ? "var(--card)" : "var(--foreground)", borderRadius: 1 }} />
              ))}
            </div>

            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 20 }}>Waiting for payment confirmation…</p>

            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={() => {
              setShowQR(false);
              setShowSuccess(true);
              setTimeout(() => { setShowSuccess(false); setCart([]); }, 3000);
            }}>
              Simulate Payment Success
            </button>
          </div>
        </div>
      )}

      {/* Success overlay */}
      {showSuccess && (
        <div className="modal-overlay">
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div className="animate-success" style={{ width: 100, height: 100, background: "rgba(34,197,94,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={56} color="#22C55E" />
            </div>
            <h2 style={{ color: "#F8FAFC", fontSize: 28, fontWeight: 800, margin: 0 }}>Payment Successful!</h2>
            <p style={{ color: "rgba(248,250,252,0.7)", margin: 0 }}>₱{total.toLocaleString("en-PH")} received · Invoice generated</p>
          </div>
        </div>
      )}
    </div>
  );
}
