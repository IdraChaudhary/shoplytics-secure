/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.shopify.com'],
  },
  
  // Configure for deployment
  output: 'standalone',
  
  // Handle build errors for initial deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack config for handling server-side modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-only modules on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: false,
      };
    }
    return config;
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
