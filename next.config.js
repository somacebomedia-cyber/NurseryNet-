/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === 'production' ? '.next-build' : '.next',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
