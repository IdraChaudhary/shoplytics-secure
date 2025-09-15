import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { CartProvider } from '@/src/components/store/cart'
import Navbar from '@/src/components/shop/Navbar'
import CartDrawer from '@/src/components/shop/CartDrawer'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Shoplytics - Privacy-First Shopify Analytics',
  description: 'AI-assisted multi-tenant Shopify insights platform for enterprise retailers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <CartProvider>
              <Navbar />
              {(!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) && (
                <div className="bg-amber-50 border-y border-amber-200 text-amber-900 text-sm px-4 py-2 text-center">
                  Storefront API is not fully configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in your environment.
                  <a href="/api/storefront/health" className="ml-2 underline">Check</a>
                </div>
              )}
              <div id="root" className="relative flex min-h-screen flex-col">
                {children}
              </div>
              <CartDrawer />
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
        {/* Toast notifications container */}
        <div id="toast-container" className="fixed top-4 right-4 z-50" />
      </body>
    </html>
  )
}
