'use client'
import { useEffect, useRef, useState } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeout = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setOpen(false)
      setActive(-1)
      return
    }
    if (timeout.current) window.clearTimeout(timeout.current)
    timeout.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/shopify/search?q=${encodeURIComponent(query)}`)
        const json = await res.json()
        setResults(Array.isArray(json.products) ? json.products : [])
        setOpen(true)
        setActive(-1)
      } catch {
        setResults([])
        setOpen(false)
      }
    }, 250)
    return () => { if (timeout.current) window.clearTimeout(timeout.current) }
  }, [query])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && active >= 0 && results[active]) {
      window.location.href = `/products/${results[active].handle}`
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search for products"
        aria-expanded={open}
        aria-controls="search-results"
        className="w-full rounded-full border border-gray-300 bg-white/90 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {open && (
        <div
          id="search-results"
          role="listbox"
          className="absolute mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg z-50 max-h-80 overflow-auto"
          aria-label="Search results"
        >
          {results.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No results</div>
          ) : (
            results.map((p, idx) => (
              <a
                key={p.id || p.handle || idx}
                href={`/products/${p.handle}`}
                role="option"
                aria-selected={active === idx}
                className={`flex items-center gap-3 p-3 hover:bg-gray-50 ${active === idx ? 'bg-gray-50' : ''}`}
                onMouseEnter={() => setActive(idx)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.featuredImage?.url && <img src={p.featuredImage.url} alt={p.title} className="h-10 w-10 rounded object-cover" />}
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{p.title}</div>
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  )
}
