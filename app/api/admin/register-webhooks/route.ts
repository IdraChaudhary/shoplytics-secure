import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VERSION = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION || '2023-10'

function required(name: string, val?: string | null): string {
  if (!val) throw new Error(`${name} not configured`)
  return val
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    const requiredToken = process.env.HEALTH_CHECK_TOKEN || process.env.ADMIN_SETUP_TOKEN
    if (!requiredToken || token !== requiredToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shopDomain = required('SHOPIFY_STORE_DOMAIN', process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOP_DOMAIN)
    const adminAccessToken = required('SHOPIFY_ADMIN_ACCESS_TOKEN', process.env.SHOPIFY_ADMIN_ACCESS_TOKEN)
    const appUrl = required('NEXT_PUBLIC_SHOPIFY_APP_URL', process.env.NEXT_PUBLIC_SHOPIFY_APP_URL)

    const addressBase = `${appUrl.replace(/\/$/, '')}/api/webhooks/shopify`

    const topics = [
      'orders/create',
      'orders/updated',
      'products/create',
      'products/update',
      'app/uninstalled',
    ]

    const headers = {
      'X-Shopify-Access-Token': adminAccessToken,
      'Content-Type': 'application/json',
    }

    // List current webhooks
    const listRes = await fetch(`https://${shopDomain}/admin/api/${VERSION}/webhooks.json`, { headers, cache: 'no-store' })
    const listJson = await listRes.json().catch(() => ({}))
    const existing: any[] = Array.isArray(listJson?.webhooks) ? listJson.webhooks : []

    const results: any[] = []
    for (const topic of topics) {
      const already = existing.find(w => w.topic === topic && typeof w.address === 'string' && w.address.startsWith(addressBase))
      if (already) {
        results.push({ topic, status: 'exists', id: already.id })
        continue
      }
      const body = {
        webhook: {
          topic,
          address: addressBase,
          format: 'json',
        },
      }
      const res = await fetch(`https://${shopDomain}/admin/api/${VERSION}/webhooks.json`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const txt = await res.text()
        results.push({ topic, status: 'error', http: res.status, body: txt.slice(0, 500) })
      } else {
        const json = await res.json().catch(() => ({}))
        results.push({ topic, status: 'created', id: json?.webhook?.id })
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
