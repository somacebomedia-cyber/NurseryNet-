
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-control',
            value: 'no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve these modules on the client side
      config.resolve = config.resolve || {};
      
      // Alias 'node:async_hooks' to an empty module to prevent client-side build errors.
      // This is necessary because some server-side dependencies (potentially from Genkit/Firebase)
      // are being pulled into the client bundle.
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'node:async_hooks': path.resolve(__dirname, 'src/lib/empty-module.js'),
      };

      // Fallbacks for other Node.js built-in modules
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        'async_hooks': false, 
        'node:async_hooks': false, // Keep as a secondary measure
        'fs': false,
        'tls': false,
        'net': false,
        'http2': false,
        'dns': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
