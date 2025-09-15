// Shopify Storefront API minimal client
export type StorefrontFetch = <T>(query: string, variables?: Record<string, any>) => Promise<T>

const domain = process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOP_DOMAIN || ''
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_ACCESS_TOKEN || ''
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION || '2023-10'

if (!domain || !token) {
  // We intentionally do not throw to keep build green; runtime will fail loudly.
  console.warn('[Storefront] Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN')
}

export const storefrontFetch: StorefrontFetch = async (query, variables = {}) => {
  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
    // Ensure server-only
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[Storefront] HTTP ${res.status}: ${text}`)
  }
  const json = await res.json()
  if (json.errors) {
    console.error('[Storefront] GraphQL errors', json.errors)
    throw new Error('Storefront GraphQL error')
  }
  return json.data
}

// Queries
export const GQL = {
  products: `#graphql
    query Products($first: Int!) {
      products(first: $first) {
        edges { node { id handle title featuredImage { url altText } priceRange { minVariantPrice { amount currencyCode } } } }
      }
    }
  `,
  search: `#graphql
    query Search($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        edges { node { id handle title featuredImage { url altText } priceRange { minVariantPrice { amount currencyCode } } } }
      }
    }
  `,
  productByHandle: `#graphql
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        descriptionHtml
        featuredImage { url altText }
        images(first: 10) { edges { node { url altText } } }
        variants(first: 50) { edges { node { id title price { amount currencyCode } availableForSale } } }
      }
    }
  `,
  cartCreate: `#graphql
    mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `,
}
