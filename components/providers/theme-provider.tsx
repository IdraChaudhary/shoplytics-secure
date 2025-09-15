'use client'

import React from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}

export default ThemeProvider
