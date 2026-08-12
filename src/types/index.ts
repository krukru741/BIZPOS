export interface Product {
  id: string
  barcode: string | null
  name: string
  categoryId: string | null
  category?: Category | null
  brand: string | null
  unit: string | null
  costPrice: number
  sellingPrice: number
  currentStock: number
  reorderLevel: number
  status: string
}

export interface Category {
  id: string
  name: string
}
