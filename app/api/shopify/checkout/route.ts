import { NextRequest, NextResponse } from 'next/server'
import { storefrontFetch, GQL } from '@/src/lib/storefront'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const lines = Array.isArray(body?.lines) ? body.lines : []
  if (!lines.length) return NextResponse.json({ error: 'No lines' }, { status: 400 })
  try {
    const data = await storefrontFetch<{ cartCreate: { cart: { checkoutUrl: string }, userErrors: any[] } }>(GQL.cartCreate, { lines })
    const url = data.cartCreate?.cart?.checkoutUrl
    if (!url) return NextResponse.json({ error: 'Failed to create checkout', details: data.cartCreate?.userErrors }, { status: 500 })
    return NextResponse.json({ checkoutUrl: url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
