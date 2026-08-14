export const products = [
  { id: 1, name: "Organic Whole Milk", sku: "MILK-001", barcode: "8901030784", category: "Dairy", brand: "Amul", buyingPrice: 42, sellingPrice: 55, gst: 5, stock: 120, minStock: 20, unit: "L", status: "active", image: "🥛" },
  { id: 2, name: "Sourdough Bread", sku: "BRD-042", barcode: "8902345678", category: "Bakery", brand: "Britannia", buyingPrice: 38, sellingPrice: 55, gst: 5, stock: 45, minStock: 10, unit: "pcs", status: "active", image: "🍞" },
  { id: 3, name: "Free Range Eggs", sku: "EGG-012", barcode: "8903456789", category: "Dairy", brand: "Farm Fresh", buyingPrice: 72, sellingPrice: 95, gst: 0, stock: 8, minStock: 12, unit: "doz", status: "active", image: "🥚" },
  { id: 4, name: "Greek Yogurt 500g", sku: "YGT-007", barcode: "8904567890", category: "Dairy", brand: "Epigamia", buyingPrice: 68, sellingPrice: 89, gst: 5, stock: 0, minStock: 15, unit: "pcs", status: "active", image: "🫙" },
  { id: 5, name: "Brown Rice 5kg", sku: "RCE-023", barcode: "8905678901", category: "Grains", brand: "India Gate", buyingPrice: 210, sellingPrice: 279, gst: 5, stock: 67, minStock: 10, unit: "kg", status: "active", image: "🌾" },
  { id: 6, name: "Basmati Rice 1kg", sku: "RCE-024", barcode: "8906789012", category: "Grains", brand: "Daawat", buyingPrice: 88, sellingPrice: 119, gst: 5, stock: 200, minStock: 30, unit: "kg", status: "active", image: "🌾" },
  { id: 7, name: "Extra Virgin Olive Oil", sku: "OIL-003", barcode: "8907890123", category: "Oils", brand: "Figaro", buyingPrice: 385, sellingPrice: 499, gst: 5, stock: 28, minStock: 10, unit: "500ml", status: "active", image: "🫒" },
  { id: 8, name: "Tomato Ketchup 1kg", sku: "SCE-011", barcode: "8908901234", category: "Condiments", brand: "Heinz", buyingPrice: 128, sellingPrice: 165, gst: 12, stock: 55, minStock: 10, unit: "pcs", status: "active", image: "🍅" },
  { id: 9, name: "Himalayan Pink Salt", sku: "SLT-002", barcode: "8909012345", category: "Spices", brand: "Tata", buyingPrice: 38, sellingPrice: 55, gst: 5, stock: 3, minStock: 8, unit: "kg", status: "active", image: "🧂" },
  { id: 10, name: "Almond Butter 250g", sku: "NUT-005", barcode: "8900123456", category: "Spreads", brand: "DiSano", buyingPrice: 295, sellingPrice: 399, gst: 12, stock: 22, minStock: 8, unit: "pcs", status: "active", image: "🥜" },
  { id: 11, name: "Sparkling Water 1L", sku: "BEV-014", barcode: "8901234567", category: "Beverages", brand: "Perrier", buyingPrice: 75, sellingPrice: 99, gst: 18, stock: 144, minStock: 24, unit: "btl", status: "active", image: "💧" },
  { id: 12, name: "Dark Chocolate 70%", sku: "CHO-008", barcode: "8902345679", category: "Snacks", brand: "Lindt", buyingPrice: 168, sellingPrice: 229, gst: 18, stock: 38, minStock: 10, unit: "pcs", status: "active", image: "🍫" },
];

export const categories = ["All", "Dairy", "Bakery", "Grains", "Oils", "Condiments", "Spices", "Spreads", "Beverages", "Snacks", "Fruits", "Vegetables"];

export const customers = [
  { id: 1, name: "Priya Sharma", phone: "9876543210", email: "priya@email.com", totalPurchases: 14580, outstanding: 0, lastVisit: "2024-01-15", totalOrders: 42 },
  { id: 2, name: "Rahul Mehta", phone: "9123456789", email: "rahul@email.com", totalPurchases: 8920, outstanding: 450, lastVisit: "2024-01-14", totalOrders: 28 },
  { id: 3, name: "Anita Patel", phone: "9234567890", email: "anita@email.com", totalPurchases: 22100, outstanding: 0, lastVisit: "2024-01-15", totalOrders: 67 },
  { id: 4, name: "Vikram Singh", phone: "9345678901", email: "vikram@email.com", totalPurchases: 5640, outstanding: 1200, lastVisit: "2024-01-10", totalOrders: 19 },
  { id: 5, name: "Kavya Nair", phone: "9456789012", email: "kavya@email.com", totalPurchases: 31250, outstanding: 0, lastVisit: "2024-01-15", totalOrders: 89 },
];

export const salesHistory = [
  { id: "INV-2024-0842", date: "2024-01-15 14:32", customer: "Priya Sharma", items: 5, total: 847, payment: "cash", status: "completed" },
  { id: "INV-2024-0841", date: "2024-01-15 13:18", customer: "Walk-in", items: 3, total: 389, payment: "qr", status: "completed" },
  { id: "INV-2024-0840", date: "2024-01-15 12:55", customer: "Rahul Mehta", items: 8, total: 1243, payment: "card", status: "completed" },
  { id: "INV-2024-0839", date: "2024-01-15 11:42", customer: "Walk-in", items: 2, total: 178, payment: "cash", status: "completed" },
  { id: "INV-2024-0838", date: "2024-01-15 10:30", customer: "Anita Patel", items: 12, total: 2145, payment: "qr", status: "completed" },
  { id: "INV-2024-0837", date: "2024-01-15 09:15", customer: "Walk-in", items: 4, total: 520, payment: "cash", status: "refunded" },
  { id: "INV-2024-0836", date: "2024-01-14 18:45", customer: "Kavya Nair", items: 7, total: 1890, payment: "card", status: "completed" },
  { id: "INV-2024-0835", date: "2024-01-14 17:22", customer: "Walk-in", items: 1, total: 99, payment: "cash", status: "completed" },
];

export const purchases = [
  { id: "PO-2024-0142", date: "2024-01-14", supplier: "Metro Cash & Carry", items: 15, total: 24500, status: "received" },
  { id: "PO-2024-0141", date: "2024-01-12", supplier: "Reliance Fresh WS", items: 8, total: 12800, status: "received" },
  { id: "PO-2024-0140", date: "2024-01-10", supplier: "BigBazaar Wholesale", items: 22, total: 38900, status: "partial" },
  { id: "PO-2024-0139", date: "2024-01-08", supplier: "Local Dairy Co.", items: 5, total: 8200, status: "received" },
  { id: "PO-2024-0138", date: "2024-01-05", supplier: "Agro Supplies Ltd", items: 11, total: 18700, status: "received" },
];

export const expenses = [
  { id: 1, date: "2024-01-15", category: "Utilities", description: "Electricity Bill", amount: 4200, paid: "cash" },
  { id: 2, date: "2024-01-14", category: "Staff", description: "Cashier Salary", amount: 18000, paid: "bank" },
  { id: 3, date: "2024-01-13", category: "Rent", description: "Monthly Rent", amount: 35000, paid: "bank" },
  { id: 4, date: "2024-01-12", category: "Marketing", description: "Newspaper Ad", amount: 2500, paid: "cash" },
  { id: 5, date: "2024-01-10", category: "Maintenance", description: "AC Service", amount: 1800, paid: "cash" },
  { id: 6, date: "2024-01-08", category: "Packaging", description: "Bags & Boxes", amount: 3200, paid: "cash" },
];

export const dailySalesData = [
  { day: "Mon", sales: 18420, orders: 87 },
  { day: "Tue", sales: 22100, orders: 102 },
  { day: "Wed", sales: 19800, orders: 94 },
  { day: "Thu", sales: 24500, orders: 118 },
  { day: "Fri", sales: 31200, orders: 142 },
  { day: "Sat", sales: 42800, orders: 195 },
  { day: "Sun", sales: 38500, orders: 178 },
];

export const monthlyRevenueData = [
  { month: "Jul", revenue: 285000, profit: 68400 },
  { month: "Aug", revenue: 312000, profit: 74880 },
  { month: "Sep", revenue: 298000, profit: 71520 },
  { month: "Oct", revenue: 335000, profit: 80400 },
  { month: "Nov", revenue: 389000, profit: 93360 },
  { month: "Dec", revenue: 445000, profit: 106800 },
  { month: "Jan", revenue: 356000, profit: 85440 },
];

export const paymentSplitData = [
  { name: "Cash", value: 45, color: "#22C55E" },
  { name: "QR / UPI", value: 38, color: "#3B82F6" },
  { name: "Card", value: 17, color: "#F59E0B" },
];

export const topProducts = [
  { name: "Basmati Rice 1kg", sold: 312, revenue: 37128, trend: "+12%" },
  { name: "Organic Whole Milk", sold: 288, revenue: 15840, trend: "+8%" },
  { name: "Sourdough Bread", sold: 245, revenue: 13475, trend: "+5%" },
  { name: "Dark Chocolate 70%", sold: 189, revenue: 43281, trend: "+22%" },
  { name: "Greek Yogurt 500g", sold: 176, revenue: 15664, trend: "-3%" },
];

export const notifications = [
  { id: 1, type: "warning", title: "Low Stock Alert", message: "Free Range Eggs — only 8 units left (min: 12)", time: "10 min ago", read: false },
  { id: 2, type: "success", title: "Payment Received", message: "INV-2024-0842 — ₱847 via Cash", time: "28 min ago", read: false },
  { id: 3, type: "warning", title: "Low Stock Alert", message: "Himalayan Pink Salt — only 3 units left (min: 8)", time: "1 hr ago", read: false },
  { id: 4, type: "info", title: "Purchase Completed", message: "PO-2024-0142 — Metro Cash & Carry received", time: "3 hrs ago", read: true },
  { id: 5, type: "success", title: "Payment Received", message: "INV-2024-0841 — ₱389 via UPI", time: "3 hrs ago", read: true },
  { id: 6, type: "error", title: "Payment Failed", message: "Card transaction declined for ₱1,200", time: "5 hrs ago", read: true },
];
