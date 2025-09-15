import ProductCard from './ProductCard'
import { storefrontFetch, GQL } from '@/src/lib/storefront'

export const revalidate = 0

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-[12px] shadow-sm border border-gray-100">
      <div className="aspect-[4/5] w-full bg-gray-100 rounded-t-[12px]" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export default async function ProductsGrid() {
  const data = await storefrontFetch<any>(GQL.products, { first: 12 }).catch(() => ({ products: { edges: [] } }))
  const products = (data.products?.edges || []).map((e: any) => e.node)
  const isEmpty = products.length === 0
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">New Arrivals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isEmpty
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
        {isEmpty && (
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <div className="font-medium">No products yet</div>
            <p className="text-sm mt-1">Connect your Shopify Storefront API credentials to show live products.</p>
          </div>
        )}
      </div>
    </section>
  )
}
