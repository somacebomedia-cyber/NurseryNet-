import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const memoryImageCache = new Map<
  string,
  { buffer: Buffer; contentType: string; expiresAt: number }
>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

let cachedFallbackBuffer: Buffer | null = null;

function getFallbackImageBuffer(): { buffer: Buffer; contentType: string } {
  if (!cachedFallbackBuffer) {
    try {
      const localPath = path.join(
        process.cwd(),
        'public',
        'images',
        'preschools',
        'little-ashford-cover-1.jpg'
      );
      cachedFallbackBuffer = fs.readFileSync(localPath);
    } catch {
      // 1x1 transparent PNG fallback if disk read ever fails
      cachedFallbackBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64'
      );
      return { buffer: cachedFallbackBuffer, contentType: 'image/png' };
    }
  }
  return { buffer: cachedFallbackBuffer, contentType: 'image/jpeg' };
}

function respondWithImage(buffer: Buffer, contentType: string): NextResponse {
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url') || '';
  if (!rawUrl || !/^https?:\/\//i.test(rawUrl)) {
    const fallback = getFallbackImageBuffer();
    return respondWithImage(fallback.buffer, fallback.contentType);
  }

  const now = Date.now();
  const cached = memoryImageCache.get(rawUrl);
  if (cached && cached.expiresAt > now) {
    return respondWithImage(cached.buffer, cached.contentType);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const parsed = new URL(rawUrl);
    const res = await fetch(rawUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        Referer: `${parsed.protocol}//${parsed.host}/`,
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!res.ok) {
      const fallback = getFallbackImageBuffer();
      return respondWithImage(fallback.buffer, fallback.contentType);
    }

    const contentType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
    if (!contentType.startsWith('image/')) {
      const fallback = getFallbackImageBuffer();
      return respondWithImage(fallback.buffer, fallback.contentType);
    }

    const arrayBuf = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    if (buffer.length < 100) {
      const fallback = getFallbackImageBuffer();
      return respondWithImage(fallback.buffer, fallback.contentType);
    }

    if (memoryImageCache.size > 250) {
      const firstKey = memoryImageCache.keys().next().value;
      if (firstKey) memoryImageCache.delete(firstKey);
    }
    memoryImageCache.set(rawUrl, {
      buffer,
      contentType,
      expiresAt: now + CACHE_TTL_MS,
    });

    return respondWithImage(buffer, contentType);
  } catch {
    const fallback = getFallbackImageBuffer();
    return respondWithImage(fallback.buffer, fallback.contentType);
  } finally {
    clearTimeout(timeout);
  }
}
