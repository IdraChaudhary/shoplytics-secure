import ProductCard from './ProductCard'
import { storefrontFetch, GQL } from '@/src/lib/storefront'

export const revalidate = 0

export default async function ProductsGrid() {
  const data = await storefrontFetch<any>(GQL.products, { first: 12 }).catch(() => ({ products: { edges: [] } }))
  const products = (data.products?.edges || []).map((e: any) => e.node)
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">New Arrivals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
