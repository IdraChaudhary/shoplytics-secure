import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasKey = Boolean(process.env.SHOPIFY_API_KEY)
  const hasSecret = Boolean(process.env.SHOPIFY_API_SECRET)
  const hasWebhookSecret = Boolean(process.env.SHOPIFY_WEBHOOK_SECRET)
  const hasDomain = Boolean(process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOP_DOMAIN)

  return NextResponse.json({
    ok: true,
    configured: hasKey && hasSecret,
    hasKey,
    hasSecret,
    hasWebhookSecret,
    hasDomain,
    notes: 'This endpoint only reports presence of env vars. It does not perform a live Admin API call.'
  })
}
