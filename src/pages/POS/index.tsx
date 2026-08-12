import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Search, Plus, Minus, Trash2, ShoppingCart, AlertCircle } from 'lucide-react'
import type { Product } from '@prisma/client'

interface CartItem extends Product {
  cartQuantity: number
  subtotal: number
}

export default function POS() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  
  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [notFoundAlert, setNotFoundAlert] = useState(false)
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'GCASH' | 'CARD'>('CASH')
  const [amountReceived, setAmountReceived] = useState<string>('')
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Session check
  useEffect(() => {
    window.ipcRenderer.invoke('cash-active-session').then(session => {
      if (!session) {
        navigate('/cash')
      }
    })
  }, [navigate])

  // Totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const discount = 0
  const total = subtotal - discount
  
  const change = (paymentMethod === 'CASH' && Number(amountReceived) >= total) 
    ? Number(amountReceived) - total 
    : 0

  useEffect(() => {
    // Initial load of some products for the grid
    searchProducts('')
  }, [])

  const searchProducts = async (q: string) => {
    const res = await window.ipcRenderer.invoke('get-products', q)
    setProducts(res)
  }

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    searchProducts(val)
  }

  // Handle Barcode Scanner / Rapid Keyboard Input
  useEffect(() => {
    let barcodeBuffer = ''
    let lastKeyTime = 0

    const handleKeyDown = async (e: KeyboardEvent) => {
      // Handle Shortcuts
      if (e.key === 'F2' || (e.ctrlKey && e.key === 'f')) {
        e.preventDefault()
        searchInputRef.current?.focus()
        return
      }
      if (e.key === 'F4' && cart.length > 0 && !isPaymentOpen) {
        e.preventDefault()
        setIsPaymentOpen(true)
        return
      }
      if (e.key === 'F9' && cart.length > 0 && !isPaymentOpen) {
        e.preventDefault()
        setCart([])
        return
      }
      if (e.key === 'Escape' && isPaymentOpen) {
        setIsPaymentOpen(false)
        return
      }
      if (e.key === 'Enter' && isPaymentOpen && Number(amountReceived) >= total) {
        handleCheckout()
        return
      }

      // Scanner Logic
      const target = e.target as HTMLElement
      if (isPaymentOpen || notFoundAlert || (target.tagName === 'INPUT' && target !== searchInputRef.current)) {
        return
      }

      const currentTime = new Date().getTime()
      
      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 0 && currentTime - lastKeyTime < 100) {
          // Rapid input = scanner
          await handleScannedBarcode(barcodeBuffer)
          barcodeBuffer = ''
          setSearch('')
        } else if (target === searchInputRef.current && search.trim() !== '') {
          // Enter pressed on search manually, maybe try to exact match
          await handleScannedBarcode(search.trim())
          setSearch('')
        }
        return
      }

      if (currentTime - lastKeyTime > 100) {
        barcodeBuffer = ''
      }
      
      if (e.key.length === 1) {
        barcodeBuffer += e.key
        lastKeyTime = currentTime
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cart, isPaymentOpen, notFoundAlert, search, amountReceived, total])

  const handleScannedBarcode = async (barcode: string) => {
    try {
      const product = await window.ipcRenderer.invoke('get-product-by-barcode', barcode)
      if (product) {
        addToCart(product)
      } else {
        setNotFoundAlert(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        if (existing.cartQuantity + 1 > product.currentStock) {
          alert(`Insufficient stock for ${product.name}. Only ${product.currentStock} available.`)
          return prev
        }
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, cartQuantity: item.cartQuantity + 1, subtotal: (item.cartQuantity + 1) * item.sellingPrice }
            : item
        )
      } else {
        if (1 > product.currentStock) {
          alert(`Insufficient stock for ${product.name}.`)
          return prev
        }
        return [...prev, { ...product, cartQuantity: 1, subtotal: product.sellingPrice }]
      }
    })
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id))
      return
    }
    
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        if (newQuantity > item.currentStock) {
          alert(`Insufficient stock. Only ${item.currentStock} available.`)
          return item
        }
        return { ...item, cartQuantity: newQuantity, subtotal: newQuantity * item.sellingPrice }
      }
      return item
    }))
  }

  const handleCheckout = async () => {
    if (paymentMethod === 'CASH' && Number(amountReceived) < total) {
      alert("Insufficient payment.")
      return
    }

    setIsCheckingOut(true)
    try {
      const checkoutData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.cartQuantity,
          price: item.sellingPrice,
          subtotal: item.subtotal
        })),
        payment: {
          method: paymentMethod,
          amountReceived: paymentMethod === 'CASH' ? Number(amountReceived) : total,
          change: paymentMethod === 'CASH' ? change : 0
        },
        totalAmount: subtotal,
        discountAmount: discount,
        netAmount: total
      }

      await window.ipcRenderer.invoke('checkout', checkoutData)
      alert("Sale Completed!")
      setCart([])
      setIsPaymentOpen(false)
      setAmountReceived('')
      searchProducts('') // Refresh stock in grid
    } catch (err: any) {
      alert("Transaction failed: " + (err.message || 'Unknown error'))
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-6rem)]">
      {/* Left Panel: Search & Products */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input 
            ref={searchInputRef}
            placeholder="Search / Scan Barcode (F2)" 
            className="pl-10 text-lg py-6"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto content-start p-1">
          {products.map(p => (
            <Card 
              key={p.id} 
              className={`cursor-pointer transition-colors ${p.currentStock > 0 ? 'hover:bg-slate-100' : 'opacity-50'}`}
              onClick={() => { if (p.currentStock > 0) addToCart(p) }}
            >
              <CardContent className="p-4 text-center">
                <div className="font-bold text-lg line-clamp-1">{p.name}</div>
                <div className="text-slate-500 font-medium">₱{p.sellingPrice.toFixed(2)}</div>
                <div className="text-xs text-slate-400 mt-2">Stock: {p.currentStock}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Panel: Cart */}
      <div className="w-[400px] flex flex-col bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b bg-slate-50 rounded-t-xl flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> CURRENT SALE
          </h2>
          <span className="text-xs text-slate-500">Cashier: Juan</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p className="text-center font-medium">Cart is empty</p>
              <p className="text-center text-sm">Scan a barcode or search<br/>for a product to begin.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border">
                <div className="flex justify-between font-bold">
                  <span>{item.name}</span>
                  <span>₱{item.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <span>₱{item.sellingPrice.toFixed(2)} × {item.cartQuantity}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center font-bold text-black">{item.cartQuantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 ml-2" onClick={() => updateQuantity(item.id, 0)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 space-y-3 rounded-b-xl">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Discount</span>
            <span>₱{discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-slate-900 border-t pt-2">
            <span>TOTAL</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setCart([])} disabled={cart.length === 0}>
              Clear (F9)
            </Button>
            <Button variant="outline" className="flex-1" disabled={cart.length === 0}>
              Hold (F8)
            </Button>
          </div>
          <Button 
            className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700" 
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
          >
            PAY NOW (F4)
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">PAYMENT</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="text-center space-y-1">
              <p className="text-slate-500 font-medium">TOTAL</p>
              <p className="text-4xl font-bold text-blue-600">₱{total.toFixed(2)}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-500 text-center">Payment Method</p>
              <div className="flex gap-2 justify-center">
                {(['CASH', 'GCASH', 'CARD'] as const).map(method => (
                  <Button 
                    key={method}
                    variant={paymentMethod === method ? 'default' : 'outline'}
                    className={paymentMethod === method ? 'bg-blue-600' : ''}
                    onClick={() => {
                      setPaymentMethod(method)
                      if (method !== 'CASH') setAmountReceived(total.toString())
                      else setAmountReceived('')
                    }}
                  >
                    {method}
                  </Button>
                ))}
              </div>
            </div>

            {paymentMethod === 'CASH' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                <label className="text-sm font-medium">Amount Received (₱)</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  min={subtotal} 
                  required 
                  value={amountReceived} 
                  onChange={e => setAmountReceived(e.target.value)} 
                  className="h-16 text-3xl font-bold text-center" 
                />
              </div>    <div className="flex gap-2 justify-center mt-2">
                    <Button variant="outline" size="sm" onClick={() => setAmountReceived(total.toString())}>Exact</Button>
                    <Button variant="outline" size="sm" onClick={() => setAmountReceived('500')}>₱500</Button>
                    <Button variant="outline" size="sm" onClick={() => setAmountReceived('1000')}>₱1000</Button>
                  </div>
                </div>
                <div className="text-center space-y-1 pt-2">
                  <p className="text-slate-500 font-medium">CHANGE</p>
                  <p className={`text-3xl font-bold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {change >= 0 ? `₱${change.toFixed(2)}` : 'Insufficient'}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700" 
              onClick={handleCheckout}
              disabled={isCheckingOut || (paymentMethod === 'CASH' && Number(amountReceived) < total)}
            >
              {isCheckingOut ? 'Processing...' : 'COMPLETE SALE (ENTER)'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Not Found Alert */}
      <Dialog open={notFoundAlert} onOpenChange={setNotFoundAlert}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" /> Product Not Found
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>The barcode scanned does not match any active products.</p>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setNotFoundAlert(false)}>Search Again</Button>
            <Button onClick={() => { setNotFoundAlert(false); window.location.hash = '#/products' }}>
              Add New Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
