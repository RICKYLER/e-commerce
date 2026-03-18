'use client'

import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { products } from '@/lib/products'

export default function AdminProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-3xl text-foreground">
              Products
            </h1>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <select className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
            <option>All Categories</option>
            <option>Eau de Parfum</option>
            <option>Eau de Toilette</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 font-medium text-foreground/60">Product</th>
                  <th className="text-left py-4 px-6 font-medium text-foreground/60">Category</th>
                  <th className="text-left py-4 px-6 font-medium text-foreground/60">Price</th>
                  <th className="text-left py-4 px-6 font-medium text-foreground/60">Stock</th>
                  <th className="text-left py-4 px-6 font-medium text-foreground/60">Status</th>
                  <th className="text-right py-4 px-6 font-medium text-foreground/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="py-4 px-6">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-foreground/60">{product.brand}</p>
                    </td>
                    <td className="py-4 px-6 text-foreground">{product.category}</td>
                    <td className="py-4 px-6 font-medium text-foreground">${product.price}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.inStock
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-foreground/60" />
                        </button>
                        <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 text-sm">
          <p className="text-foreground/60">
            Showing 1-8 of {products.length} products
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded border border-border hover:bg-muted transition-colors text-foreground">
              Previous
            </button>
            <button className="px-3 py-2 rounded bg-accent text-accent-foreground">
              1
            </button>
            <button className="px-3 py-2 rounded border border-border hover:bg-muted transition-colors text-foreground">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
