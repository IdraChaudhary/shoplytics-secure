'use client'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  product: {
    id: string
    handle: string
    title: string
    featuredImage?: { url: string; altText?: string | null }
    priceRange?: { minVariantPrice?: { amount: string; currencyCode: string } }
  }
}

export default function ProductCard({ product }: Props) {
  const price = product.priceRange?.minVariantPrice
  return (
    <Link href={`/products/${product.handle}`} className="group block bg-white rounded-[12px] shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[12px]">
        {product.featuredImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gray-100" />
        )}
        <div className="pointer-events-none absolute inset-0 rounded-t-[12px] ring-1 ring-inset ring-black/5 group-hover:ring-black/10" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
        {price && (
          <p className="text-sm text-gray-600 mt-1">{new Intl.NumberFormat(undefined, { style: 'currency', currency: price.currencyCode }).format(parseFloat(price.amount))}</p>
        )}
      </div>
    </Link>
  )
}
