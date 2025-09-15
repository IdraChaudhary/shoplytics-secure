'use client'
import { useCart } from '../store/cart'

export default function CartDrawer() {
  const { isOpen, close, lines, clear } = useCart()

  const checkout = async () => {
    const res = await fetch('/api/shopify/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: lines.map(l => ({ quantity: l.quantity, merchandiseId: l.variantId })) })
    })
    const json = await res.json()
    if (json.checkoutUrl) window.location.href = json.checkoutUrl
  }

  return (
    <div className={`fixed inset-0 z-50 transition ${isOpen ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={close} />
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Your Cart</h3>
          <button onClick={close} className="text-sm text-gray-600 hover:text-gray-900">Close</button>
        </div>
        <div className="p-4 space-y-4 overflow-auto h-[calc(100%-7rem)]">
          {lines.length === 0 && <p className="text-gray-500">Your cart is empty</p>}
          {lines.map((l) => (
            <div key={l.variantId} className="flex gap-3 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {l.image && <img src={l.image} alt={l.title} className="h-16 w-16 rounded object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{l.title}</div>
                <div className="text-sm text-gray-600">Qty: {l.quantity}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex items-center justify-between">
          <button onClick={clear} className="text-sm text-gray-600 hover:text-gray-900">Clear</button>
          <button onClick={checkout} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Checkout</button>
        </div>
      </div>
    </div>
  )
}
