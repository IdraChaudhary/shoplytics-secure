import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shoplytics Secure',
  description: 'Privacy-first, AI-assisted multi-tenant Shopify insights platform for enterprise retailers',
  keywords: ['shopify', 'analytics', 'privacy', 'multi-tenant', 'enterprise', 'insights'],
  authors: [{ name: 'Shoplytics Team' }],
  openGraph: {
    title: 'Shoplytics Secure',
    description: 'Enterprise-grade Shopify analytics with privacy at its core',
    type: 'website',
  },
  robots: {
    index: false, // Don't index in development/demo
    follow: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
        {/* Toast notifications container */}
        <div id="toast-container" />
      </body>
    </html>
  );
}
