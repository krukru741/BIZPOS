import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    window.ipcRenderer.invoke('categories-list').then(setCategories)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold">{c.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
