import { getPrisma } from './db.service'
import { toZonedTime, format } from "date-fns-tz"
import { startOfDay, endOfDay, subDays, startOfMonth, eachDayOfInterval, addDays } from "date-fns"

const prisma = getPrisma()
const TIMEZONE = 'Asia/Manila'

export function getDateRange(range: string) {
  const now = new Date()
  const zonedNow = toZonedTime(now, TIMEZONE)
  
  let start = startOfDay(zonedNow)
  let end = endOfDay(zonedNow)
  let prevStart = startOfDay(subDays(zonedNow, 1))
  let prevEnd = endOfDay(subDays(zonedNow, 1))

  switch (range) {
    case 'Today':
      break
    case 'Yesterday':
      start = startOfDay(subDays(zonedNow, 1))
      end = endOfDay(subDays(zonedNow, 1))
      prevStart = startOfDay(subDays(zonedNow, 2))
      prevEnd = endOfDay(subDays(zonedNow, 2))
      break
    case 'Last 7 Days':
      start = startOfDay(subDays(zonedNow, 6))
      prevStart = startOfDay(subDays(zonedNow, 13))
      prevEnd = endOfDay(subDays(zonedNow, 7))
      break
    case 'Last 30 Days':
      start = startOfDay(subDays(zonedNow, 29))
      prevStart = startOfDay(subDays(zonedNow, 59))
      prevEnd = endOfDay(subDays(zonedNow, 30))
      break
    case 'This Month':
      start = startOfMonth(zonedNow)
      const lastMonthEnd = subDays(start, 1)
      prevStart = startOfMonth(lastMonthEnd)
      prevEnd = endOfDay(lastMonthEnd)
      break
  }
  return { start, end, prevStart, prevEnd }
}

function calculateTrend(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export async function getDashboardKPIs(range: string) {
  const { start, end, prevStart, prevEnd } = getDateRange(range)

  const [sales, prevSales] = await Promise.all([
    prisma.sale.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } }, _sum: { netAmount: true }, _count: { id: true } }),
    prisma.sale.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: prevStart, lte: prevEnd } }, _sum: { netAmount: true }, _count: { id: true } })
  ])

  const [items, prevItems] = await Promise.all([
    prisma.saleItem.findMany({ where: { sale: { status: 'COMPLETED', createdAt: { gte: start, lte: end } } } }),
    prisma.saleItem.findMany({ where: { sale: { status: 'COMPLETED', createdAt: { gte: prevStart, lte: prevEnd } } } })
  ])

  const grossProfit = items.reduce((sum, item) => sum + ((item.unitPrice - item.unitCost) * item.quantity), 0)
  const prevGrossProfit = prevItems.reduce((sum, item) => sum + ((item.unitPrice - item.unitCost) * item.quantity), 0)
  
  const itemsSold = items.reduce((sum, item) => sum + item.quantity, 0)
  const prevItemsSold = prevItems.reduce((sum, item) => sum + item.quantity, 0)

  const currentRevenue = sales._sum.netAmount || 0
  const margin = currentRevenue > 0 ? (grossProfit / currentRevenue) * 100 : 0

  return {
    sales: currentRevenue,
    salesTrend: calculateTrend(currentRevenue, prevSales._sum.netAmount || 0),
    transactions: sales._count.id || 0,
    transactionsTrend: calculateTrend(sales._count.id || 0, prevSales._count.id || 0),
    itemsSold,
    itemsSoldTrend: calculateTrend(itemsSold, prevItemsSold),
    grossProfit,
    grossProfitTrend: calculateTrend(grossProfit, prevGrossProfit),
    margin
  }
}

export async function getSalesTrend(range: string) {
  const { start, end } = getDateRange(range)
  
  const sales = await prisma.sale.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
    select: { netAmount: true, createdAt: true }
  })

  // Create padded date array
  const interval = eachDayOfInterval({ start, end })
  const grouped = new Map<string, number>()
  
  // Initialize all days to 0
  for (const date of interval) {
    grouped.set(format(date, 'MMM dd', { timeZone: TIMEZONE }), 0)
  }

  for (const sale of sales) {
    const zonedDate = toZonedTime(sale.createdAt, TIMEZONE)
    const key = format(zonedDate, 'MMM dd', { timeZone: TIMEZONE })
    grouped.set(key, (grouped.get(key) || 0) + sale.netAmount)
  }

  return Array.from(grouped.entries()).map(([day, total]) => ({ day, total }))
}

export async function getTopProducts(range: string) {
  const { start, end } = getDateRange(range)

  const items = await prisma.saleItem.findMany({
    where: { sale: { status: 'COMPLETED', createdAt: { gte: start, lte: end } } },
    include: { product: { select: { name: true } } }
  })

  const prodMap = new Map<string, { name: string, qty: number, sales: number, profit: number }>()

  for (const item of items) {
    const existing = prodMap.get(item.productId) || { name: item.product.name, qty: 0, sales: 0, profit: 0 }
    existing.qty += item.quantity
    existing.sales += item.subtotal
    existing.profit += (item.unitPrice - item.unitCost) * item.quantity
    prodMap.set(item.productId, existing)
  }

  return Array.from(prodMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 5) // Top 5
}

export async function getPaymentMethods(range: string) {
  const { start, end } = getDateRange(range)

  const salesWithPayments = await prisma.sale.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
    include: { payment: true }
  })

  const methods = { CASH: 0, GCASH: 0, CARD: 0 }
  for (const s of salesWithPayments) {
    if (s.payment?.method) {
      methods[s.payment.method as keyof typeof methods] += s.netAmount
    }
  }

  return Object.entries(methods).map(([method, amount]) => ({ name: method, value: amount }))
}

export async function getInventoryAlerts() {
  const allActive = await prisma.product.findMany({
    where: { status: 'ACTIVE' }
  })
  
  const outOfStock = allActive.filter(p => p.currentStock === 0)
  const lowStock = allActive.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderLevel)
  
  // Near Expiry (within 30 days)
  const now = new Date()
  const nextMonth = addDays(now, 30)
  
  // Need to cast as any to bypass TS error if prisma client hasn't generated expiryDate yet
  const nearExpiry = allActive.filter(p => {
    const expiry = (p as any).expiryDate
    if (!expiry) return false
    const expDate = new Date(expiry)
    return expDate > now && expDate <= nextMonth && p.currentStock > 0
  })

  return {
    outOfStock: outOfStock.sort((a, b) => a.name.localeCompare(b.name)),
    lowStock: lowStock.sort((a, b) => a.currentStock - b.currentStock),
    nearExpiry: nearExpiry.sort((a, b) => new Date((a as any).expiryDate).getTime() - new Date((b as any).expiryDate).getTime())
  }
}

export async function getRecentActivity() {
  const recent = await prisma.sale.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      cashSession: {
        include: {
          user: { select: { username: true } }
        }
      }
    }
  })
  
  return recent.map(r => ({
    id: r.id,
    transactionNo: r.transactionNo,
    amount: r.netAmount,
    time: r.createdAt,
    cashier: r.cashSession?.user?.username || 'System'
  }))
}

export async function getReport(type: string, range: string) {
  // Existing report logic, not modified for dashboard directly
  return null
}
