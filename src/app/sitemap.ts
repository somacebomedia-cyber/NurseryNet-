import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL || 'https://nurserynet.co.za';
  const routes = [
    '',
    '/directory',
    '/funding',
    '/preschools',
    '/preschools/business-plan-generator',
    '/preschools/funding-finder',
    '/preschools/growth-kit',
    '/preschools/logo-generator',
    '/preschools/roi-calculator',
    '/pricing',
    '/rankings',
    '/hardware',
    '/jobs',
    '/affiliates',
    '/contact',
    '/privacy',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));
}
