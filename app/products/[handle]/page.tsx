import { storefrontFetch, GQL } from '@/src/lib/storefront'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/src/components/shop/AddToCartButton'

export const revalidate = 0

export default async function ProductPage({ params }: { params: { handle: string } }) {
  const data = await storefrontFetch<any>(GQL.productByHandle, { handle: params.handle }).catch(() => null)
  const product = data?.product
  if (!product) return notFound()

  const images: { url: string; altText?: string }[] = product.images?.edges?.map((e: any) => e.node) || []
  const variants: any[] = product.variants?.edges?.map((e: any) => e.node) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div>
        <div className="aspect-square w-full overflow-hidden rounded-xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={(images[0]?.url || product.featuredImage?.url)} alt={product.title} className="h-full w-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="mt-4 grid grid-cols-5 gap-3">
            {images.slice(0, 10).map((img, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={idx} src={img.url} alt={img.altText || product.title} className="h-20 w-full object-cover rounded border" />
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
        <div className="prose prose-sm max-w-none text-gray-700 mt-4" dangerouslySetInnerHTML={{ __html: product.descriptionHtml || '' }} />

        <div className="mt-6 space-y-3">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded border p-3">
              <div className="text-sm font-medium">{v.title}</div>
              <div className="text-sm text-gray-700 tabular-nums">{new Intl.NumberFormat(undefined, { style: 'currency', currency: v.price.currencyCode, maximumFractionDigits: 0 }).format(parseFloat(v.price.amount))}</div>
              <AddToCartButton variant={{ id: v.id, title: v.title, price: v.price.amount, image: images[0]?.url, handle: product.handle }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
