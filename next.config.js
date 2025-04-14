/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: true,
  experimental: {
    optimizeCss: true
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 