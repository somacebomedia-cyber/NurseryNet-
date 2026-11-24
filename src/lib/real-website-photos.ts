import verifiedWebsitePhotosJson from '@/data/verified-website-photos.json';

export const MAX_PRESCHOOL_PROFILE_PHOTOS = 6;
export const DEFAULT_STOCK_PHOTO_HOST = 'images.unsplash.com';

export interface WebsitePhotoSet {
  domain: string;
  schoolNamePattern: RegExp;
  websiteUrl: string;
  coverPhoto: string;
  images: string[];
  captions?: string[];
  logoUrl?: string;
  sourceType?: 'website' | 'social';
}

const BOGUS_AUDIT_WEBSITE_PATTERN =
  /gmail\.|yahoo\.|webmail\.|telkomsa\.|vodamail\.|mweb\.|hotmail\.|outlook\.|none|n\/a|nil|wwwecd|edccentre\.co\.za|socialdevelopment\.co\.za|dsd\.gov|wordpress\.com\/?$|callupcontact|cgwifi|blackberry|reitztreecare|graaff-fruit|afraliaflora|brackenfellnursery|mountainstreamsnursery|prettygardenslc|elands\.co\.za/i;

/**
 * Verified real cover and campus gallery photos extracted directly from actual South African
 * preschool websites and social media pages (capped at a maximum of 6 photos per profile).
 */
export const VERIFIED_WEBSITE_PHOTO_SETS: WebsitePhotoSet[] = (
  verifiedWebsitePhotosJson as Array<{
    domain: string;
    namePattern: string;
    websiteUrl: string;
    coverPhoto?: string;
    images: string[];
    captions?: string[];
    logoUrl?: string;
    sourceType?: 'website' | 'social';
  }>
).map((entry) => {
  const cappedImages = (entry.images || []).filter(Boolean).slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
  const inferredLogo =
    entry.logoUrl ||
    cappedImages.find((img) =>
      /logo|crest|emblem|babinhead|cropped-logo|logo_overlay/i.test(img)
    );
  return {
    domain: entry.domain.toLowerCase(),
    schoolNamePattern: new RegExp(entry.namePattern, 'i'),
    websiteUrl: entry.websiteUrl,
    coverPhoto: cappedImages[0] || entry.coverPhoto || '',
    images: cappedImages,
    captions: entry.captions ? entry.captions.slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS) : undefined,
    logoUrl: inferredLogo,
    sourceType: entry.sourceType || (isSocialMediaUrl(entry.websiteUrl) ? 'social' : 'website'),
  };
});

/**
 * Checks whether a URL points to a social media page (Facebook, Instagram, TikTok, LinkedIn, X).
 */
export function isSocialMediaUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return /(?:facebook\.com|fb\.com|instagram\.com|tiktok\.com|linkedin\.com|twitter\.com|x\.com)/i.test(
    url
  );
}

/**
 * Checks whether an image URL is a generic stock placeholder (Unsplash or Picsum).
 */
export function isStockPlaceholderImage(img?: string | null): boolean {
  if (!img || typeof img !== 'string') return true;
  return img.includes(DEFAULT_STOCK_PHOTO_HOST) || img.includes('picsum.photos');
}

/**
 * Checks whether a list of image URLs consists only of generic stock placeholders.
 */
export function hasOnlyStockPlaceholderImages(images?: string[] | null): boolean {
  if (!Array.isArray(images) || images.length === 0) return true;
  return images.every((img) => isStockPlaceholderImage(img));
}

/**
 * Checks whether a preschool has at least one real photo from its actual website or social media page
 * (rather than generic stock photos).
 */
export function hasRealWebsitePhoto(images?: string[] | null): boolean {
  if (!Array.isArray(images) || images.length === 0) return false;
  return images.some((img) => Boolean(img) && !isStockPlaceholderImage(img));
}

/**
 * Looks up verified real website or social media photos by websiteUrl, domain, or preschool name/slug.
 */
export function findVerifiedWebsitePhotoSet(input: {
  name?: string | null;
  slug?: string | null;
  websiteUrl?: string | null;
}): WebsitePhotoSet | null {
  const urlLower = (input.websiteUrl || '').toLowerCase();
  const nameAndSlug = `${input.name || ''} ${(input.slug || '').replace(/-/g, ' ')} ${urlLower}`.toLowerCase();

  for (const set of VERIFIED_WEBSITE_PHOTO_SETS) {
    if (urlLower && urlLower.includes(set.domain)) {
      return set;
    }
    if (set.schoolNamePattern.test(nameAndSlug)) {
      return set;
    }
  }
  return null;
}

/**
 * Normalizes a preschool website or social media URL, filtering out bogus DSD audit placeholders.
 * When `requireVerifiedForAudit` is true, only keeps URLs from raw 2014 audit records if they
 * match an active verified website or social media photo set.
 */
export function normalizeSchoolWebsiteOrSocialUrl(
  rawUrl?: string | null,
  schoolName?: string | null,
  requireVerifiedForAudit = false
): string | null {
  const verifiedSet = findVerifiedWebsitePhotoSet({
    name: schoolName,
    websiteUrl: rawUrl,
  });
  if (verifiedSet) {
    return verifiedSet.websiteUrl;
  }
  if (requireVerifiedForAudit) {
    return null;
  }
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let cleaned = rawUrl.trim().replace(/\s+/g, '');
  if (!cleaned || BOGUS_AUDIT_WEBSITE_PATTERN.test(cleaned)) return null;

  if (/^http\/\//i.test(cleaned)) cleaned = cleaned.replace(/^http\/\//i, 'http://');
  if (/^http\/([^/])/i.test(cleaned)) cleaned = cleaned.replace(/^http\//i, 'http://');
  if (/co\.za/i.test(cleaned) && !/\.co\.za/i.test(cleaned)) {
    cleaned = cleaned.replace(/co\.za/i, '.co.za');
  }
  cleaned = cleaned
    .replace(/^https?:\/\/wwww\./i, 'https://www.')
    .replace(/,za$/i, '.za')
    .replace(/\.co\.zah$/i, '.co.za')
    .replace(/\.co\.zaa$/i, '.co.za');

  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  cleaned = cleaned.replace(/^https?:\/\/m\.facebook\.com/i, 'https://www.facebook.com');

  try {
    const parsed = new URL(cleaned);
    if (!parsed.hostname.includes('.')) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Returns real website or social media photos for a preschool if available, preserving any custom
 * non-stock photos the owner has configured, and strictly enforcing a maximum of 6 pictures.
 */
export function resolveRealPreschoolImages(input: {
  name?: string | null;
  slug?: string | null;
  websiteUrl?: string | null;
  images?: string[] | null;
}): string[] {
  const existing = Array.isArray(input.images) ? input.images.filter(Boolean) : [];
  const nonStockExisting = existing.filter((img) => !isStockPlaceholderImage(img));
  const verifiedSet = findVerifiedWebsitePhotoSet(input);

  // If the school already has non-stock photos, keep them (and merge with verified website/social photos up to 6 max)
  if (nonStockExisting.length > 0) {
    if (verifiedSet) {
      const merged = Array.from(new Set([...nonStockExisting, ...verifiedSet.images]));
      return merged.slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
    }
    return Array.from(new Set(nonStockExisting)).slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
  }

  // Otherwise, if this preschool matches a verified website or social media photo set, use those real photos (max 6)!
  if (verifiedSet) {
    return verifiedSet.images.slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
  }

  return existing.slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
}

/**
 * Resolves the real official logo URL for a preschool if available (from an explicit logoUrl,
 * verified website photo set, or verified logo asset in the school's image list).
 */
export function resolveRealPreschoolLogo(input: {
  name?: string | null;
  slug?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  images?: string[] | null;
}): string | undefined {
  if (input.logoUrl && typeof input.logoUrl === 'string' && input.logoUrl.trim()) {
    return input.logoUrl.trim();
  }

  const verifiedSet = findVerifiedWebsitePhotoSet(input);
  if (verifiedSet?.logoUrl) {
    return verifiedSet.logoUrl;
  }

  const candidateImages = [
    ...(Array.isArray(input.images) ? input.images : []),
    ...(verifiedSet?.images || []),
  ].filter(Boolean);

  const matchedLogo = candidateImages.find(
    (img) =>
      !isStockPlaceholderImage(img) &&
      /logo|crest|emblem|babinhead|cropped-logo|logo_overlay/i.test(img)
  );

  return matchedLogo || undefined;
}

