'use client'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import SearchBar from './SearchBar'
import { useCart } from '../store/cart'

export default function Navbar() {
  const { open } = useCart()
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">🛍️</span>
          Shoplytics
        </Link>
        <SearchBar />
        <div className="flex items-center gap-4">
          <Link href="/auth/signin" className="text-sm text-gray-700 hover:text-gray-900">Sign In</Link>
          <button onClick={() => open()} className="relative inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm hover:bg-gray-50">
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}
