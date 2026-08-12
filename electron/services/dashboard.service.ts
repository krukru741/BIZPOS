import { getPrisma } from './db.service'
import { toZonedTime, startOfDay, endOfDay, subDays, startOfMonth, format } from 'date-fns-tz'

const prisma = getPrisma()
const TIMEZONE = 'Asia/Manila'

export function getDateRange(range: string) {
  const now = new Date()
  const zonedNow = toZonedTime(now, TIMEZONE)
  
  let start = startOfDay(zonedNow)
  let end = endOfDay(zonedNow)

  switch (range) {
    case 'Today':
      break
    case 'Yesterday':
      start = startOfDay(subDays(zonedNow, 1))
      end = endOfDay(subDays(zonedNow, 1))
      break
    case 'Last 7 Days':
      start = startOfDay(subDays(zonedNow, 6))
      break
    case 'Last 30 Days':
      start = startOfDay(subDays(zonedNow, 29))
      break
    case 'This Month':
      start = startOfMonth(zonedNow)
      break
  }
  return { start, end }
}

export async function getDashboardKPIs(range: string) {
  const { start, end } = getDateRange(range)

  const sales = await prisma.sale.aggregate({
    where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
    _sum: { netAmount: true },
    _count: { id: true }
  })

  // Get gross profit and items sold
  const items = await prisma.saleItem.findMany({
    where: { sale: { status: 'COMPLETED', createdAt: { gte: start, lte: end } } }
  })

  const grossProfit = items.reduce((sum, item) => sum + ((item.unitPrice - item.unitCost) * item.quantity), 0)
  const itemsSold = items.reduce((sum, item) => sum + item.quantity, 0)

  // Low stock count
  const lowStock = await prisma.product.count({
    where: { status: 'ACTIVE', currentStock: { lte: prisma.product.fields.reorderLevel } }
  })

  return {
    sales: sales._sum.netAmount || 0,
    transactions: sales._count.id || 0,
    itemsSold,
    grossProfit,
    lowStock
  }
}

export async function getSalesTrend(range: string) {
  const { start, end } = getDateRange(range)
  
  const sales = await prisma.sale.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
    select: { netAmount: true, createdAt: true }
  })

  const grouped = new Map<string, number>()
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

  return Array.from(prodMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 10)
}

export async function getPaymentMethods(range: string) {
  const { start, end } = getDateRange(range)

  const payments = await prisma.payment.groupBy({
    by: ['method'],
    where: { sale: { status: 'COMPLETED', createdAt: { gte: start, lte: end } } },
    _sum: { amountReceived: true, change: true } // Need to calculate actual paid
  })

  // Actually, amount paid = sale.netAmount. For CASH, amountReceived might be higher. Let's join sale
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

export async function getLowStockProducts() {
  return await prisma.product.findMany({
    where: { status: 'ACTIVE', currentStock: { lte: prisma.product.fields.reorderLevel } },
    orderBy: { currentStock: 'asc' },
    take: 10
  })
}

export async function getReport(type: string, range: string) {
  const { start, end } = getDateRange(range)

  if (type === 'PROFIT') {
    const sales = await prisma.sale.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
      _sum: { netAmount: true }
    })
    const items = await prisma.saleItem.findMany({
      where: { sale: { status: 'COMPLETED', createdAt: { gte: start, lte: end } } }
    })
    const cogs = items.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0)
    const revenue = sales._sum.netAmount || 0
    const grossProfit = revenue - cogs
    const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0
    return { revenue, cogs, grossProfit, margin }
  }

  if (type === 'INVENTORY') {
    const products = await prisma.product.findMany({ where: { status: 'ACTIVE' } })
    const totalProducts = products.length
    const totalCost = products.reduce((sum, p) => sum + (p.costPrice * p.currentStock), 0)
    const potentialSales = products.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0)
    const potentialProfit = potentialSales - totalCost
    const lowStock = products.filter(p => p.currentStock <= p.reorderLevel && p.currentStock > 0).length
    const outOfStock = products.filter(p => p.currentStock === 0).length
    return { totalProducts, totalCost, potentialSales, potentialProfit, lowStock, outOfStock }
  }

  if (type === 'SALES_BY_DATE') {
    const sales = await prisma.sale.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
    })
    const grouped = new Map<string, { tx: number, amount: number }>()
    for (const sale of sales) {
      const zonedDate = toZonedTime(sale.createdAt, TIMEZONE)
      const key = format(zonedDate, 'MMM dd, yyyy', { timeZone: TIMEZONE })
      const existing = grouped.get(key) || { tx: 0, amount: 0 }
      existing.tx += 1
      existing.amount += sale.netAmount
      grouped.set(key, existing)
    }
    return Array.from(grouped.entries()).map(([date, data]) => ({ date, ...data }))
  }

  return null
}

