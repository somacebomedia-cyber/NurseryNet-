import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  findVerifiedWebsitePhotoSet,
  isSocialMediaUrl,
  MAX_PRESCHOOL_PROFILE_PHOTOS,
  normalizeSchoolWebsiteOrSocialUrl,
  VERIFIED_WEBSITE_PHOTO_SETS,
} from '@/lib/real-website-photos';

export interface ExtractedWebsitePhotosResult {
  websiteUrl: string;
  coverPhoto: string | null;
  images: string[];
  source: 'verified-cache' | 'live-website' | 'live-social';
}

const BAD_IMAGE_URL_PATTERN =
  /facebook\.com\/tr\?|static\.xx\.fbcdn\.net\/rsrc\.php|sacoronavirus\.co\.za|gravatar\.com\/blavatar|wp-content\/plugins\/revslider.*dummy\.png|1x1|pixel|tracker|spacer|badge|favicon|wp-smiley|emoji|spinner|loading|\/apple\.png|\/mail\.png|\/heart\.png|Phone-01\.png|Menu-btn\.gif|Circle_edited|Square_edited|Sketched%20Arrow|st-andrews-(?:fb|insta|twitter)|lighthouse-scrapbook|sea-star-clipart|clip-art-sea|grey_bird\.png|directional-button-icons|\.svg(?:\?|$)|\.gif(?:\?|$)|wix_mp/i;

function upgradeImageUrlQuality(rawImgUrl: string, baseUrl: string): string | null {
  if (!rawImgUrl || typeof rawImgUrl !== 'string') return null;
  const trimmed = rawImgUrl
    .trim()
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/#.*$/, '');

  if (!trimmed || trimmed.startsWith('data:')) {
    return null;
  }

  let absoluteUrl = trimmed;
  try {
    absoluteUrl = new URL(trimmed, baseUrl).toString();
  } catch {
    return null;
  }

  if (!/^https?:\/\//i.test(absoluteUrl)) return null;
  if (BAD_IMAGE_URL_PATTERN.test(absoluteUrl)) return null;

  // Skip tiny dimension badges/icons in URLs
  if (/w_(?:[1-9]\d?),h_(?:[1-9]\d?)\b/i.test(absoluteUrl)) return null;
  if (/fit=(?:[1-9]\d?)%2C(?:[1-9]\d?)\b/i.test(absoluteUrl)) return null;

  // Upgrade Wix low-res blurred preview URLs to high-resolution crisp cover photos
  if (absoluteUrl.includes('static.wixstatic.com/media/')) {
    const mediaMatch = absoluteUrl.match(/(https:\/\/static\.wixstatic\.com\/media\/[^/]+)/i);
    if (mediaMatch && /\.(?:jpe?g|png|webp)$/i.test(mediaMatch[1])) {
      absoluteUrl = mediaMatch[1];
    } else if (absoluteUrl.includes('/v1/fill/')) {
      absoluteUrl = absoluteUrl.replace(
        /\/v1\/fill\/[^/]+\//,
        '/v1/fill/w_1200,h_800,al_c,q_85/'
      );
    }
  }

  return absoluteUrl;
}

function isLikelyLogoUrl(url: string, tag = ''): boolean {
  return (
    /logo|emblem|brand|headerlogo|coct-logo|babinhead|cropped-nn-image|iconizer-|01Home_Slogan/i.test(
      url
    ) || /logo/i.test(tag)
  );
}

/**
 * Downloads an external image into /public/images/preschools/ if needed (for instance, when an R2
 * host like image2url.com or a Facebook lookaside.fbsbx.com social media URL requires crawler headers
 * or returns non-standard MIME types that Next.js <Image> would otherwise reject).
 */
async function cacheExternalPhotoLocallyIfNeeded(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith('/')) return imageUrl;

  for (const set of VERIFIED_WEBSITE_PHOTO_SETS) {
    if (imageUrl.includes(set.domain) && set.coverPhoto.startsWith('/')) {
      return set.coverPhoto;
    }
  }

  const isFacebookMedia =
    imageUrl.includes('lookaside.fbsbx.com') || imageUrl.includes('fbcdn.net');
  const needsLocalCache =
    isFacebookMedia ||
    imageUrl.includes('image2url.com') ||
    imageUrl.includes('googleusercontent.com') ||
    !(/\.(jpe?g|png|webp)(\?.*)?$/i.test(imageUrl));

  if (!needsLocalCache) {
    return imageUrl;
  }

  try {
    const hash = crypto.createHash('md5').update(imageUrl).digest('hex').slice(0, 12);
    const extMatch = imageUrl.match(/\.(jpe?g|png|webp)/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const fileName = `web-${hash}.${ext}`;
    const publicDir = path.join(process.cwd(), 'public', 'images', 'preschools');
    const filePath = path.join(publicDir, fileName);
    const publicUrl = `/images/preschools/${fileName}`;

    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
      return publicUrl;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    try {
      const res = await fetch(imageUrl, {
        headers: {
          'User-Agent': isFacebookMedia
            ? 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
            : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      if (!res.ok) return imageUrl;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1500) return imageUrl;
      fs.mkdirSync(publicDir, { recursive: true });
      fs.writeFileSync(filePath, buf);
      return publicUrl;
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return imageUrl;
  }
}

/**
 * Extracts real cover and gallery photos (maximum 6 pictures) from a preschool's website or social media HTML.
 */
export async function extractPhotosFromWebsiteHtml(
  html: string,
  baseUrl: string,
  schoolName?: string
): Promise<string[]> {
  const verifiedSet = findVerifiedWebsitePhotoSet({
    name: schoolName,
    websiteUrl: baseUrl,
  });
  if (verifiedSet) {
    return verifiedSet.images.slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
  }

  const campusCandidates: string[] = [];
  const logoCandidates: string[] = [];
  const seen = new Set<string>();

  const addCandidate = (raw: string | null | undefined, tag = '') => {
    if (!raw) return;
    const upgraded = upgradeImageUrlQuality(raw, baseUrl);
    if (!upgraded) return;
    const dedupeKey = upgraded.replace(/\?.*$/, '').toLowerCase();
    if (seen.has(dedupeKey) && !upgraded.includes('lookaside.fbsbx.com')) return;
    seen.add(dedupeKey);
    if (isLikelyLogoUrl(upgraded, tag)) {
      logoCandidates.push(upgraded);
    } else {
      campusCandidates.push(upgraded);
    }
  };

  // 1. For social media pages (Facebook / Instagram), prioritize og:image & twitter:image first
  const isSocial = isSocialMediaUrl(baseUrl);
  const ogMatches = [
    ...Array.from(
      html.matchAll(
        /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/gi
      )
    ),
    ...Array.from(
      html.matchAll(
        /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/gi
      )
    ),
  ];

  if (isSocial) {
    for (const m of ogMatches) {
      if (m[1]) addCandidate(m[1]);
    }
  }

  // 2. Extract <img src / data-src / data-lazy-src> tags from HTML
  const imgTagRegex = /<img[^>]+>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgTagRegex.exec(html)) !== null) {
    const tag = imgMatch[0];
    const srcMatch = tag.match(/(?:data-lazy-src|data-src|src)=["']([^"']+)["']/i);
    if (srcMatch?.[1]) {
      addCandidate(srcMatch[1], tag);
    }
  }

  // 3. Extract inline style background-image URLs
  const bgRegex = /url\(["']?([^)"']+\.(?:jpe?g|png|webp)(?:\?[^)"']*)?)["']?\)/gi;
  let bgMatch: RegExpExecArray | null;
  while ((bgMatch = bgRegex.exec(html)) !== null) {
    addCandidate(bgMatch[1]);
  }

  // 4. If the site is a client-rendered SPA (e.g. Vite / React with <script type="module" src="/assets/index-*.js">),
  // inspect the entry JS bundle for real gallery photos
  if (campusCandidates.length === 0) {
    const scriptMatch = html.match(/<script[^>]+src=["'](\/assets\/index-[^"']+\.js)["']/i);
    if (scriptMatch?.[1]) {
      const bundleUrl = new URL(scriptMatch[1], baseUrl).toString();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      try {
        const bundleRes = await fetch(bundleUrl, { signal: controller.signal });
        if (bundleRes.ok) {
          const jsText = await bundleRes.text();
          const jsImgMatches =
            jsText.match(/https?:\/\/[^\s"'`<>\\)]+\.(?:jpg|jpeg|png|webp)/gi) || [];
          for (const jsImg of jsImgMatches.slice(0, 8)) {
            addCandidate(jsImg);
          }
        }
      } catch {
        // ignore bundle fetch error
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  // 5. Extract Schema.org JSON-LD image / photo
  const ldRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ldMatch: RegExpExecArray | null;
  while ((ldMatch = ldRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(ldMatch[1].trim());
      const items = Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed];
      for (const item of items) {
        if (!item) continue;
        const imgField = item.image || item.photo;
        if (typeof imgField === 'string') {
          addCandidate(imgField);
        } else if (Array.isArray(imgField)) {
          for (const sub of imgField) {
            addCandidate(typeof sub === 'string' ? sub : sub?.url);
          }
        } else if (imgField && typeof imgField.url === 'string') {
          addCandidate(imgField.url);
        }
      }
    } catch {
      // ignore invalid JSON-LD
    }
  }

  // 6. Include og:image / twitter:image if not already added
  if (!isSocial) {
    for (const m of ogMatches) {
      if (m[1]) addCandidate(m[1]);
    }
  }

  // Combine campus photos first, then logos if needed, strictly capped at MAX_PRESCHOOL_PROFILE_PHOTOS (6)
  const topCandidates = [...campusCandidates, ...logoCandidates].slice(
    0,
    MAX_PRESCHOOL_PROFILE_PHOTOS
  );
  const finalized = await Promise.all(
    topCandidates.map((u) => cacheExternalPhotoLocallyIfNeeded(u))
  );

  return Array.from(new Set(finalized)).slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
}

/**
 * Fetches a preschool's official website or social media page and extracts its real cover photo
 * and campus gallery images (maximum of 6 pictures).
 */
export async function extractRealPhotosFromWebsiteUrl(
  rawUrl?: string | null,
  schoolName?: string | null
): Promise<ExtractedWebsitePhotosResult> {
  const verifiedSet = findVerifiedWebsitePhotoSet({
    name: schoolName,
    websiteUrl: rawUrl,
  });

  if (verifiedSet) {
    const capped = verifiedSet.images.slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
    return {
      websiteUrl: rawUrl || verifiedSet.websiteUrl,
      coverPhoto: capped[0] || verifiedSet.coverPhoto,
      images: capped,
      source: 'verified-cache',
    };
  }

  const normalizedUrl = normalizeSchoolWebsiteOrSocialUrl(rawUrl, schoolName, false);
  if (!normalizedUrl) {
    return {
      websiteUrl: rawUrl || '',
      coverPhoto: null,
      images: [],
      source: 'live-website',
    };
  }

  const isSocial = isSocialMediaUrl(normalizedUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': isSocial
          ? 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!res.ok) {
      return {
        websiteUrl: normalizedUrl,
        coverPhoto: null,
        images: [],
        source: isSocial ? 'live-social' : 'live-website',
      };
    }

    const html = await res.text();
    const images = (
      await extractPhotosFromWebsiteHtml(
        html,
        res.url || normalizedUrl,
        schoolName || undefined
      )
    ).slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);

    return {
      websiteUrl: res.url || normalizedUrl,
      coverPhoto: images[0] || null,
      images,
      source: isSocial ? 'live-social' : 'live-website',
    };
  } catch {
    return {
      websiteUrl: normalizedUrl,
      coverPhoto: null,
      images: [],
      source: isSocial ? 'live-social' : 'live-website',
    };
  } finally {
    clearTimeout(timeout);
  }
}
