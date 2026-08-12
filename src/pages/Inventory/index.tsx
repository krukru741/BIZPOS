import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Product, Category } from '@prisma/client'

interface InventoryMovement {
  id: string
  productId: string
  type: string
  quantity: number
  remarks: string | null
  createdAt: string
}

export default function Inventory() {
  const [products, setProducts] = useState<(Product & { category?: Category | null })[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isAdjOpen, setIsAdjOpen] = useState(false)
  
  const [adjData, setAdjData] = useState({ quantity: 0, type: 'ADJUSTMENT', remarks: '' })

  const loadProducts = async () => {
    const res = await window.ipcRenderer.invoke('get-products', '')
    setProducts(res)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleOpenHistory = async (product: Product) => {
    setSelectedProduct(product)
    const res = await window.ipcRenderer.invoke('get-inventory-movements', product.id)
    setMovements(res)
    setIsHistoryOpen(true)
  }

  const handleOpenAdj = (product: Product) => {
    setSelectedProduct(product)
    setAdjData({ quantity: 0, type: 'ADJUSTMENT', remarks: '' })
    setIsAdjOpen(true)
  }

  const handleSaveAdj = async () => {
    if (!selectedProduct || adjData.quantity === 0) return
    try {
      await window.ipcRenderer.invoke('create-adjustment', {
        productId: selectedProduct.id,
        quantity: Number(adjData.quantity),
        type: adjData.type,
        remarks: adjData.remarks
      })
      setIsAdjOpen(false)
      loadProducts()
      alert("Stock Adjusted successfully!")
    } catch (err) {
      alert("Failed to adjust stock.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold">{p.name}</TableCell>
                  <TableCell>{p.category?.name || 'Uncategorized'}</TableCell>
                  <TableCell>{p.currentStock}</TableCell>
                  <TableCell>
                    {p.currentStock <= p.reorderLevel ? (
                      <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded text-xs">⚠ LOW</span>
                    ) : (
                      <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded text-xs">✓ OK</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenAdj(p)}>Adjust</Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenHistory(p)}>History</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* History Modal */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Movement History: {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="mb-4 font-semibold text-slate-600">Current Stock: {selectedProduct?.currentStock}</p>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center">No movements recorded.</TableCell></TableRow>
                  ) : movements.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>{new Date(m.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{m.type}</TableCell>
                      <TableCell className={`font-bold ${m.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </TableCell>
                      <TableCell>{m.remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adjustment Modal */}
      <Dialog open={isAdjOpen} onOpenChange={setIsAdjOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Stock Adjustment</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-slate-100 p-3 rounded text-center">
              <p className="text-sm text-slate-500">Current Stock</p>
              <p className="text-2xl font-bold">{selectedProduct?.currentStock}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Adjustment Quantity (e.g. -5 or +10)</Label>
              <Input type="number" value={adjData.quantity || ''} onChange={(e) => setAdjData({...adjData, quantity: Number(e.target.value)})} />
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={adjData.type} onValueChange={(v) => setAdjData({...adjData, type: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STOCK_IN">Stock In (+)</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment (+/-)</SelectItem>
                  <SelectItem value="DAMAGED">Damaged (-)</SelectItem>
                  <SelectItem value="EXPIRED">Expired (-)</SelectItem>
                  <SelectItem value="RETURN">Return (+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input value={adjData.remarks} onChange={(e) => setAdjData({...adjData, remarks: e.target.value})} placeholder="e.g. Broken bottles" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAdj}>SAVE ADJUSTMENT</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
