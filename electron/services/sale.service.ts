import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function executeCheckout(checkoutData: any) {
  return await prisma.$transaction(async (tx) => {
    // 1. Generate Sale ID
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const count = await tx.sale.count({
      where: { transactionNo: { startsWith: `SALE-${dateStr}` } }
    })
    const transactionNo = `SALE-${dateStr}-${String(count + 1).padStart(6, '0')}`

    // 2. Validate stock for all products
    const productMap = new Map()
    for (const item of checkoutData.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } })
      if (!product) throw new Error(`Product ${item.productId} not found`)
      if (product.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`)
      }
      productMap.set(item.productId, product)
    }

    // 3. Create Sale (SaleItems and Payment are created via nested writes)
    const sale = await tx.sale.create({
      data: {
        transactionNo: transactionNo,
        totalAmount: checkoutData.totalAmount,
        discountAmount: checkoutData.discountAmount,
        netAmount: checkoutData.netAmount,
        status: "COMPLETED",
        items: {
          create: checkoutData.items.map((item: any) => {
            const product = productMap.get(item.productId)
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.price,
              unitCost: product.costPrice,
              subtotal: item.subtotal
            }
          })
        },
        payment: {
          create: {
            method: checkoutData.payment.method,
            amountReceived: checkoutData.payment.amountReceived,
            change: checkoutData.payment.change
          }
        }
      }
    })

    // 4. Update Product Stock and create Inventory Movements
    for (const item of checkoutData.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } }
      })

      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          type: "SALE",
          quantity: -item.quantity,
          remarks: `Sale ${transactionNo}`
        }
      })
    }

    // 5. Create Audit Log (Ensure a default user exists for V1)
    let user = await tx.user.findFirst()
    if (!user) {
      user = await tx.user.create({
        data: {
          username: "admin",
          password: "password123", // In a real app, hash this
          role: "Admin"
        }
      })
    }

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "COMPLETED_SALE",
        details: `Sale ${transactionNo} for ₱${checkoutData.netAmount}`
      }
    })

    return sale
  })
}
