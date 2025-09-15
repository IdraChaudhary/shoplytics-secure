'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type CartLine = { variantId: string; quantity: number; title?: string; image?: string; price?: string; handle?: string }

type CartCtx = {
  lines: CartLine[]
  add: (line: CartLine) => void
  remove: (variantId: string) => void
  clear: () => void
  isOpen: boolean
  open: () => void
  close: () => void
}

const Ctx = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart-lines')
      if (saved) setLines(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('cart-lines', JSON.stringify(lines)) } catch {}
  }, [lines])

  const api = useMemo<CartCtx>(() => ({
    lines,
    add: (l) => setLines((prev) => {
      const idx = prev.findIndex(p => p.variantId === l.variantId)
      if (idx >= 0) {
        const clone = [...prev]
        clone[idx] = { ...clone[idx], quantity: clone[idx].quantity + l.quantity }
        return clone
      }
      return [...prev, l]
    }),
    remove: (id) => setLines(prev => prev.filter(p => p.variantId !== id)),
    clear: () => setLines([]),
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }), [lines, isOpen])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useCart() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useCart must be used within CartProvider')
  return v
}
