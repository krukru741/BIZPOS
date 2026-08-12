import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Download, Upload, Edit, Trash2 } from 'lucide-react'
import type { Product, Category } from '@prisma/client'

export default function Products() {
  const [products, setProducts] = useState<(Product & { category?: Category | null })[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({
    barcode: '', name: '', categoryId: '', unit: 'pcs', costPrice: 0, sellingPrice: 0, currentStock: 0, reorderLevel: 0, status: 'ACTIVE'
  })
  const searchInputRef = useRef<HTMLInputElement>(null)

  const loadProducts = async (q = '') => {
    const res = await window.ipcRenderer.invoke('get-products', q)
    setProducts(res)
  }

  const loadCategories = async () => {
    const res = await window.ipcRenderer.invoke('get-categories')
    setCategories(res)
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProducts(search)
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [search])

  // Barcode scanner listener for rapid keyboard input
  useEffect(() => {
    let barcodeBuffer = ''
    let lastKeyTime = 0

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in a dialog or input other than search
      const target = e.target as HTMLElement
      if (isModalOpen || (target.tagName === 'INPUT' && target !== searchInputRef.current)) {
        return
      }

      const currentTime = new Date().getTime()
      
      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 0 && currentTime - lastKeyTime < 100) { // Rapid input threshold
          setSearch(barcodeBuffer)
          barcodeBuffer = ''
        } else if (target === searchInputRef.current) {
          // Normal enter press on search input
          loadProducts(search)
        }
        return
      }

      // If more than 100ms passed since last key, reset buffer (it's human typing, not a scanner)
      if (currentTime - lastKeyTime > 100) {
        barcodeBuffer = ''
      }

      if (e.key.length === 1) { // Normal characters
        barcodeBuffer += e.key
        lastKeyTime = currentTime
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, search])

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id)
      setFormData(product)
    } else {
      setEditingId(null)
      setFormData({
        barcode: '', name: '', categoryId: categories[0]?.id || '', unit: 'pcs', costPrice: 0, sellingPrice: 0, currentStock: 0, reorderLevel: 0, status: 'ACTIVE'
      })
    }
    setIsModalOpen(true)
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    await window.ipcRenderer.invoke('create-category', { name: newCategoryName })
    setNewCategoryName('')
    loadCategories()
  }

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        currentStock: Number(formData.currentStock),
        reorderLevel: Number(formData.reorderLevel),
      }

      if (editingId) {
        await window.ipcRenderer.invoke('update-product', editingId, data)
      } else {
        await window.ipcRenderer.invoke('create-product', data)
      }
      setIsModalOpen(false)
      loadProducts(search)
    } catch (err) {
      console.error(err)
      alert("Failed to save product")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to deactivate this product?")) {
      await window.ipcRenderer.invoke('delete-product', id)
      loadProducts(search)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>Manage Categories</Button>
          <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Import</Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
          <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" /> ADD PRODUCT</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              ref={searchInputRef}
              placeholder="Search product/barcode... (Scan directly)" 
              className="pl-9 max-w-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barcode</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">No products found.</TableCell>
                </TableRow>
              ) : products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.barcode}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category?.name || 'Uncategorized'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.currentStock <= p.reorderLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {p.currentStock} {p.unit}
                    </span>
                  </TableCell>
                  <TableCell>₱{p.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(p)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Barcode</Label>
              <Input 
                value={formData.barcode || ''} 
                onChange={(e) => setFormData({...formData, barcode: e.target.value})} 
                placeholder="Scan or type barcode"
              />
            </div>
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.categoryId || ''} onValueChange={(val) => setFormData({...formData, categoryId: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={formData.unit || ''} onValueChange={(val) => setFormData({...formData, unit: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="box">box</SelectItem>
                  <SelectItem value="pack">pack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cost Price (₱)</Label>
              <Input 
                type="number"
                value={formData.costPrice || 0} 
                onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Selling Price (₱)</Label>
              <Input 
                type="number"
                value={formData.sellingPrice || 0} 
                onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Current Stock</Label>
              <Input 
                type="number"
                value={formData.currentStock || 0} 
                onChange={(e) => setFormData({...formData, currentStock: Number(e.target.value)})} 
                disabled={!!editingId} // Disable direct stock editing for existing products
              />
            </div>
            <div className="space-y-2">
              <Label>Reorder Level</Label>
              <Input 
                type="number"
                value={formData.reorderLevel || 0} 
                onChange={(e) => setFormData({...formData, reorderLevel: Number(e.target.value)})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <ul className="space-y-2 border rounded-md p-2 h-40 overflow-y-auto">
              {categories.map(c => (
                <li key={c.id} className="text-sm px-2 py-1 bg-slate-50 rounded">{c.name}</li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input 
                placeholder="New Category Name" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button onClick={handleAddCategory}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
