import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Download, Upload, Edit, Trash2, Wand2 } from 'lucide-react'
import type { Product, Category } from '@prisma/client'
import { useAuth } from '@/context/AuthContext'

export default function Products() {
  const { user } = useAuth()
  const canSeeCost = user?.role === 'ADMIN' || user?.role === 'MANAGER'
  
  const [products, setProducts] = useState<(Product & { category?: Category | null })[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({
    barcode: '', name: '', categoryId: '', unit: 'pcs', costPrice: 0, sellingPrice: 0, currentStock: 0, reorderLevel: 0, expiryDate: null, status: 'ACTIVE'
  })
  const searchInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        barcode: '', name: '', categoryId: categories[0]?.id || '', unit: 'pcs', costPrice: 0, sellingPrice: 0, currentStock: 0, reorderLevel: 0, expiryDate: null, status: 'ACTIVE'
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

  const generateBarcode = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    setFormData({ ...formData, barcode: `BIZ-${timestamp}${random}` })
  }

  const handleExportCSV = () => {
    const headers = ['Barcode', 'Name', 'Category', 'Cost Price', 'Selling Price', 'Current Stock', 'Reorder Level', 'Expiry Date (YYYY-MM-DD)']
    const rows = products.map(p => [
      p.barcode || '',
      `"${p.name.replace(/"/g, '""')}"`,
      p.category?.name || '',
      p.costPrice,
      p.sellingPrice,
      p.currentStock,
      p.reorderLevel,
      p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : ''
    ].join(','))
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "bizpos_products_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string
      if (!text) return

      const lines = text.split('\\n').map(l => l.trim()).filter(l => l.length > 0)
      if (lines.length <= 1) {
        alert("Empty or invalid CSV file.")
        return
      }

      // Basic CSV parsing (assuming no commas inside values for simple case, or handled by a strict regex)
      const parsedProducts = lines.slice(1).map(line => {
        // A simple regex to handle quotes would be ideal, but for V1 we'll use a basic split
        // or a regex that splits by comma ignoring commas inside quotes:
        const cols = line.match(/(".*?"|[^",\\s]+)(?=\\s*,|\\s*$)/g) || line.split(',')
        const cleanCol = (c: string) => c ? c.replace(/^"|"$/g, '').trim() : ''
        
        return {
          barcode: cleanCol(cols[0]),
          name: cleanCol(cols[1]),
          // category logic would require mapping name to ID, defaulting to null for now if not matched
          categoryId: categories.find(cat => cat.name === cleanCol(cols[2]))?.id || null,
          costPrice: cleanCol(cols[3]),
          sellingPrice: cleanCol(cols[4]),
          currentStock: cleanCol(cols[5]),
          reorderLevel: cleanCol(cols[6]),
          expiryDate: cleanCol(cols[7]) || null
        }
      }).filter(p => p.name) // name is required

      if (parsedProducts.length === 0) return

      try {
        await window.ipcRenderer.invoke('bulk-import-products', parsedProducts)
        alert(`Successfully imported ${parsedProducts.length} products.`)
        loadProducts()
      } catch (err: any) {
        alert("Import failed: " + err.message)
      }
    }
    reader.readAsText(file)
    // reset input
    e.target.value = ''
  }

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        currentStock: Number(formData.currentStock),
        reorderLevel: Number(formData.reorderLevel),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null
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
          
          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleImportCSV} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Import</Button>
          
          <Button variant="outline" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" /> Export</Button>
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
                {canSeeCost && <TableHead>Cost</TableHead>}
                <TableHead>Price</TableHead>
                {canSeeCost && <TableHead>Margin</TableHead>}
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
                    {p.currentStock === 0 ? (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-rose-100 text-rose-700">Out of Stock</span>
                    ) : p.currentStock <= p.reorderLevel ? (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700">Low Stock</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700">In Stock ({p.currentStock})</span>
                    )}
                  </TableCell>
                  {canSeeCost && <TableCell className="text-slate-500">₱{p.costPrice.toFixed(2)}</TableCell>}
                  <TableCell className="font-bold text-slate-900">₱{p.sellingPrice.toFixed(2)}</TableCell>
                  {canSeeCost && (
                    <TableCell>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {p.costPrice > 0 ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(0) : 100}%
                      </span>
                    </TableCell>
                  )}
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
            <div className="space-y-2 col-span-2">
              <Label>Barcode</Label>
              <div className="flex gap-2">
                <Input 
                  value={formData.barcode || ''} 
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})} 
                  placeholder="Scan or type barcode"
                  className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={generateBarcode} title="Auto-Generate Barcode">
                  <Wand2 className="w-4 h-4 mr-2" /> Generate
                </Button>
              </div>
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
              <div className="flex gap-2">
                <Select value={formData.categoryId || ''} onValueChange={(val) => setFormData({...formData, categoryId: val})}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="z-50 shadow-lg bg-white absolute mt-1 w-full">
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setIsCategoryModalOpen(true)} title="Add New Category">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={formData.unit || ''} onValueChange={(val) => setFormData({...formData, unit: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent className="z-50 shadow-lg bg-white absolute mt-1 w-full">
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
                value={formData.costPrice === 0 ? '' : formData.costPrice} 
                onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})} 
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div className="space-y-2">
              <Label>Selling Price (₱)</Label>
              <Input 
                type="number"
                value={formData.sellingPrice === 0 ? '' : formData.sellingPrice} 
                onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})} 
                onFocus={(e) => e.target.select()}
              />
            </div>

            {/* Real-time Profit Margin Calculator */}
            <div className="col-span-2 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Expected Margin</span>
              <span className="font-bold text-emerald-700">
                {formData.sellingPrice && formData.costPrice && formData.sellingPrice > 0 ? (
                  `₱${(formData.sellingPrice - formData.costPrice).toFixed(2)} (${(((formData.sellingPrice - formData.costPrice) / formData.sellingPrice) * 100).toFixed(1)}%)`
                ) : (
                  '₱0.00 (0.0%)'
                )}
              </span>
            </div>

            <div className="space-y-2">
              <Label>Current Stock</Label>
              <Input 
                type="number"
                value={formData.currentStock === 0 ? '' : formData.currentStock} 
                onChange={(e) => setFormData({...formData, currentStock: Number(e.target.value)})} 
                onFocus={(e) => e.target.select()}
                disabled={!!editingId} // Disable direct stock editing for existing products
              />
            </div>
            <div className="space-y-2">
              <Label>Reorder Level</Label>
              <Input 
                type="number"
                value={formData.reorderLevel === 0 ? '' : formData.reorderLevel} 
                onChange={(e) => setFormData({...formData, reorderLevel: Number(e.target.value)})} 
                onFocus={(e) => e.target.select()}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label>Expiry Date (Optional)</Label>
              <Input 
                type="date"
                value={formData.expiryDate ? new Date(formData.expiryDate).toISOString().split('T')[0] : ''} 
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value ? new Date(e.target.value) : null})} 
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
