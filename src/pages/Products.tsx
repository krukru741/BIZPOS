import { useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { products, categories } from "../data/mockData";

interface ProductsProps {
  onNavigate: (page: string) => void;
}

export default function Products({ onNavigate }: ProductsProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("all");
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    const matchStock = stockFilter === "all" || (stockFilter === "low" && p.stock > 0 && p.stock <= p.minStock) || (stockFilter === "out" && p.stock === 0) || (stockFilter === "ok" && p.stock > p.minStock);
    return matchSearch && matchCat && matchStock;
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const toggleSelect = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(paginated.every(p => selected.includes(p.id)) ? selected.filter(id => !paginated.map(p => p.id).includes(id)) : [...new Set([...selected, ...paginated.map(p => p.id)])]);

  const getStockBadge = (p: typeof products[0]) => {
    if (p.stock === 0) return <span className="badge badge-red">Out of Stock</span>;
    if (p.stock <= p.minStock) return <span className="badge badge-yellow">Low Stock</span>;
    return <span className="badge badge-green">In Stock</span>;
  };

  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div className="section-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>{products.length} products total</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("add-product")}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: "14px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search products, SKU…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        <select className="input" style={{ width: 160 }} value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>

        <select className="input" style={{ width: 140 }} value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1); }}>
          <option value="all">All Stock</option>
          <option value="ok">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        {selected.length > 0 && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 12px", background: "rgba(34,197,94,0.08)", borderRadius: 8, border: "1px solid rgba(34,197,94,0.2)" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{selected.length} selected</span>
            <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }}>Delete</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" checked={paginated.every(p => selected.includes(p.id))} onChange={toggleAll} style={{ accentColor: "var(--primary)", cursor: "pointer" }} />
              </th>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(p => (
              <tr key={p.id}>
                <td><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ accentColor: "var(--primary)", cursor: "pointer" }} /></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: "var(--muted)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{p.image}</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{p.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "var(--muted-foreground)" }}>{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted-foreground)" }}>{p.sku}</td>
                <td><span className="badge badge-blue">{p.category}</span></td>
                <td>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>₹{p.sellingPrice}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--muted-foreground)" }}>Cost: ₹{p.buyingPrice}</p>
                </td>
                <td>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{p.stock} {p.unit}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--muted-foreground)" }}>Min: {p.minStock}</p>
                </td>
                <td>{getStockBadge(p)}</td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => onNavigate("product-detail")} title="View"><Eye size={15} /></button>
                    <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => onNavigate("add-product")} title="Edit"><Pencil size={15} /></button>
                    <button className="btn btn-ghost" style={{ padding: 6, color: "var(--danger)" }} title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={16} /></button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={`btn ${page === i + 1 ? "btn-primary" : "btn-ghost"}`} style={{ padding: "6px 10px", minWidth: 32, fontSize: 13 }} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
