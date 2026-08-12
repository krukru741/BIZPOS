import { getPrisma } from './db.service'
import { currentUser, requirePermission } from './auth.service'

const prisma = getPrisma()

export let currentCashSessionId: string | null = null

export async function getActiveCashSession() {
  if (!currentUser) return null
  const session = await prisma.cashSession.findFirst({
    where: { openedById: currentUser.id, status: 'OPEN' }
  })
  if (session) currentCashSessionId = session.id
  return session
}

export async function openCashSession(openingCash: number) {
  requirePermission('cash_session.manage')
  if (!currentUser) throw new Error('Not logged in')

  const existing = await getActiveCashSession()
  if (existing) throw new Error('You already have an open cash session')

  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const count = await prisma.cashSession.count({
    where: { sessionNo: { startsWith: `CS-${dateStr}` } }
  })
  const sessionNo = `CS-${dateStr}-${String(count + 1).padStart(6, '0')}`

  const session = await prisma.cashSession.create({
    data: {
      sessionNo,
      openedById: currentUser.id,
      openingCash,
      status: 'OPEN'
    }
  })

  currentCashSessionId = session.id

  await prisma.auditLog.create({
    data: { userId: currentUser.id, action: 'OPEN_SESSION', details: `Session ${sessionNo} opened with ₱${openingCash}` }
  })

  return session
}

export async function addCashMovement(type: 'CASH_IN' | 'CASH_OUT', amount: number, reason: string, note: string) {
  requirePermission('cash_session.manage')
  if (!currentUser) throw new Error('Not logged in')
  
  const session = await getActiveCashSession()
  if (!session) throw new Error('No open cash session')

  const movement = await prisma.cashMovement.create({
    data: {
      cashSessionId: session.id,
      type,
      amount,
      reason,
      note
    }
  })

  await prisma.auditLog.create({
    data: { userId: currentUser.id, action: type, details: `₱${amount} for ${reason}` }
  })

  return movement
}

export async function calculateExpectedCash(sessionId: string) {
  const session = await prisma.cashSession.findUnique({ where: { id: sessionId }, include: { sales: { include: { payment: true } }, movements: true } })
  if (!session) throw new Error('Session not found')

  let expected = session.openingCash

  for (const sale of session.sales) {
    if (sale.status === 'COMPLETED' && sale.payment?.method === 'CASH') {
      expected += sale.netAmount
    }
  }

  for (const mov of session.movements) {
    if (mov.type === 'CASH_IN') expected += mov.amount
    if (mov.type === 'CASH_OUT') expected -= mov.amount
  }

  return expected
}

export async function closeCashSession(actualCash: number, note: string) {
  requirePermission('cash_session.manage')
  if (!currentUser) throw new Error('Not logged in')
  
  const session = await getActiveCashSession()
  if (!session) throw new Error('No open cash session')

  const expectedCash = await calculateExpectedCash(session.id)
  const variance = actualCash - expectedCash
  
  let status = 'BALANCED'
  if (variance > 0) status = 'OVER'
  if (variance < 0) status = 'SHORT'

  const closedSession = await prisma.cashSession.update({
    where: { id: session.id },
    data: {
      closedAt: new Date(),
      closedById: currentUser.id,
      expectedCash,
      actualCash,
      variance,
      status
    }
  })

  currentCashSessionId = null

  await prisma.auditLog.create({
    data: { userId: currentUser.id, action: 'CLOSE_SESSION', details: `Closed ${session.sessionNo}. Variance: ₱${variance}. Note: ${note}` }
  })

  return closedSession
}
