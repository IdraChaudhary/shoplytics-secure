'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Menu, X } from 'lucide-react'
import SearchBar from './SearchBar'
import { useCart } from '../store/cart'

export default function Navbar() {
  const { open, lines } = useCart()
  const [navOpen, setNavOpen] = useState(false)
  const count = lines.reduce((sum, l) => sum + (l.quantity || 0), 0)
  const navItems = [
    { label: 'Store', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Login', href: '/login' },
    { label: 'Register', href: '/register' },
  ]
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden -ml-2 inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100"
            aria-label="Open menu"
            onClick={() => setNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">🛍️</span>
            Shoplytics
          </Link>
        </div>
        <div className="hidden sm:block flex-1 max-w-2xl">
          <SearchBar />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:inline text-sm text-gray-700 hover:text-gray-900">Sign In</Link>
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

      {/* Mobile search bar */}
      <div className="sm:hidden border-t border-gray-200 px-4 py-2">
        <SearchBar />
      </div>

      {/* Mobile menu drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${navOpen ? '' : 'pointer-events-none'}`} aria-hidden={!navOpen}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${navOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setNavOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`absolute left-0 top-0 h-full w-full max-w-xs bg-white shadow-xl transform transition-transform ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="font-semibold">Menu</div>
            <button onClick={() => setNavOpen(false)} aria-label="Close menu" className="p-2 hover:bg-gray-100 rounded-md">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="p-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setNavOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </nav>
  )
}
