import { NextRequest, NextResponse } from 'next/server'
import { storefrontFetch, GQL } from '@/src/lib/storefront'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ products: [] })
  }
  try {
    const data = await storefrontFetch<{ products: { edges: { node: any }[] } }>(GQL.search, {
      query: q,
      first: 6,
    })
    const items = (data.products?.edges || []).map(e => e.node)
    return NextResponse.json({ products: items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, products: [] }, { status: 500 })
  }
}
