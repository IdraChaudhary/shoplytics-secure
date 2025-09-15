'use client'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import SearchBar from './SearchBar'
import { useCart } from '../store/cart'

export default function Navbar() {
  const { open, lines } = useCart()
  const count = lines.reduce((sum, l) => sum + (l.quantity || 0), 0)
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">🛍️</span>
          Shoplytics
        </Link>
        <SearchBar />
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900">Sign In</Link>
          <button
            onClick={() => open()}
            aria-label="Open cart"
            className="relative inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 bg-blue-600 text-white rounded-full text-[10px] leading-4 text-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
