'use client';

import type { ImageLoaderProps } from 'next/image';

/**
 * Custom Next.js image loader that:
 * 1. Serves local assets (/images/..., /pwa-..., etc.) directly with width/quality query params.
 * 2. Optimizes Unsplash & Picsum URLs directly via their native CDN width/quality parameters.
 * 3. Routes external South African preschool website & social media image URLs through
 *    /api/school-image so hotlink-protected or offline third-party school servers never cause
 *    Next.js `/_next/image` 403/404 upstream errors.
 */
export default function schoolImageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src) return '';

  const q = quality || 75;

  // Local static assets in /public
  if (src.startsWith('/')) {
    if (src.startsWith('/api/school-image')) {
      return src;
    }
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}w=${width}&q=${q}`;
  }

  // Data or blob URLs
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  // Unsplash native CDN optimization
  if (src.includes('images.unsplash.com')) {
    try {
      const url = new URL(src);
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', String(q));
      if (!url.searchParams.has('auto')) {
        url.searchParams.set('auto', 'format');
      }
      return url.toString();
    } catch {
      return src;
    }
  }

  // Route external school website & social media URLs through our resilient server proxy
  return `/api/school-image?url=${encodeURIComponent(src)}&w=${width}&q=${q}`;
}
