import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasDomain = Boolean(process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOP_DOMAIN)
  const hasToken = Boolean(process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_ACCESS_TOKEN)
  const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION || '2023-10'

  return NextResponse.json({ ok: true, configured: hasDomain && hasToken, hasDomain, hasToken, apiVersion })
}
