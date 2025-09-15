'use client'
import { useCart } from '@/src/components/store/cart'

export default function AddToCartButton({ variant }: { variant: { id: string; title: string; price: string; image?: string; handle?: string } }) {
  const { add } = useCart()
  return (
    <button
      onClick={() => add({ variantId: variant.id, quantity: 1, title: variant.title, price: variant.price, image: variant.image, handle: variant.handle })}
      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
    >
      Add to Cart
    </button>
  )
}
