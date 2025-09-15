'use client'
import { useEffect, useRef, useState } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const timeout = useRef<any>()

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    clearTimeout(timeout.current)
    timeout.current = setTimeout(async () => {
      const res = await fetch(`/api/shopify/search?q=${encodeURIComponent(query)}`)
      const json = await res.json()
      setResults(json.products || [])
      setOpen(true)
    }, 200)
  }, [query])

  return (
    <div className="relative w-full max-w-md">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for products"
        className="w-full rounded-full border border-gray-300 bg-white/90 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {open && results.length > 0 && (
        <div className="absolute mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg z-50 max-h-80 overflow-auto">
          {results.map((p) => (
            <a key={p.id} href={`/products/${p.handle}`} className="flex items-center gap-3 p-3 hover:bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.featuredImage?.url && <img src={p.featuredImage.url} alt={p.title} className="h-10 w-10 rounded object-cover" />}
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{p.title}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
