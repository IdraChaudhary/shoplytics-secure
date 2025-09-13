import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'], 
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Shoplytics Secure',
    template: '%s | Shoplytics Secure',
  },
  description: 'Privacy-first, AI-assisted multi-tenant Shopify insights platform for enterprise retailers',
  keywords: ['shopify', 'analytics', 'privacy', 'multi-tenant', 'enterprise', 'insights', 'ecommerce', 'dashboard'],
  authors: [{ name: 'Shoplytics Team' }],
  creator: 'Shoplytics Team',
  openGraph: {
    title: 'Shoplytics Secure',
    description: 'Enterprise-grade Shopify analytics with privacy at its core',
    type: 'website',
    locale: 'en_US',
    siteName: 'Shoplytics Secure',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shoplytics Secure',
    description: 'Enterprise-grade Shopify analytics with privacy at its core',
  },
  robots: {
    index: false, // Don't index in development/demo
    follow: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <ThemeProvider defaultTheme="system">
          <div id="root" className="relative flex min-h-screen flex-col">
            {children}
          </div>
          {/* Toast notifications container */}
          <div id="toast-container" className="fixed top-4 right-4 z-50" />
        </ThemeProvider>
      </body>
    </html>
  );
}
