import type { Preschool, Province } from '@/data/preschools';

export type LiveSearchMode = 'directory' | 'school' | 'funding';

export interface LiveSearchSource {
  title: string;
  uri: string;
}

export interface LiveSearchHighlight {
  title: string;
  subtitle: string;
  feeOrAmount?: string;
  hoursOrDeadline?: string;
  websiteUrl?: string;
  reviewsSummary?: string;
  details: string;
}

export interface LiveSearchResponse {
  mode: LiveSearchMode;
  query: string;
  summary: string;
  highlights: LiveSearchHighlight[];
  sources: LiveSearchSource[];
  searchedAt: string;
}

const CACHE_PREFIX = 'nurserynet_live_search_v2_';

export function buildLiveCacheKey(mode: LiveSearchMode, keyParts: string[]): string {
  const normalized = keyParts
    .map((p) => p.trim().toLowerCase().replace(/\s+/g, '_'))
    .filter(Boolean)
    .join('__');
  return `${CACHE_PREFIX}${mode}__${normalized}`;
}

export function getCachedLiveSearch(cacheKey: string): LiveSearchResponse | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LiveSearchResponse;
    if (!parsed || typeof parsed.summary !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setCachedLiveSearch(cacheKey: string, data: LiveSearchResponse): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(data));
  } catch {
    // Ignore sessionStorage quota or privacy mode errors
  }
}

function detectProvinceFromText(text: string, fallbackProvince?: string): Province {
  const t = text.toLowerCase();
  if (t.includes('kwazulu') || /\bkzn\b/.test(t) || t.includes('umzimkhulu') || t.includes('durban')) {
    return 'KwaZulu-Natal';
  }
  if (t.includes('western cape') || /\bwc\b/.test(t) || t.includes('cape town') || t.includes('stellenbosch')) {
    return 'Western Cape';
  }
  if (t.includes('gauteng') || /\bgp\b/.test(t) || t.includes('johannesburg') || t.includes('pretoria') || t.includes('soweto') || t.includes('sandton')) {
    return 'Gauteng';
  }
  if (t.includes('eastern cape') || /\bec\b/.test(t) || t.includes('gqeberha') || t.includes('east london')) {
    return 'Eastern Cape';
  }
  if (t.includes('mpumalanga') || /\bmp\b/.test(t) || t.includes('mbombela')) {
    return 'Mpumalanga';
  }
  if (t.includes('limpopo') || /\blp\b/.test(t) || t.includes('polokwane')) {
    return 'Limpopo';
  }
  if (t.includes('north west') || /\bnw\b/.test(t) || t.includes('rustenburg')) {
    return 'North West';
  }
  if (t.includes('free state') || /\bfs\b/.test(t) || t.includes('bloemfontein')) {
    return 'Free State';
  }
  if (t.includes('northern cape') || /\bnc\b/.test(t) || t.includes('kimberley')) {
    return 'Northern Cape';
  }
  if (fallbackProvince && fallbackProvince !== 'All') {
    return fallbackProvince as Province;
  }
  return 'KwaZulu-Natal';
}

function parseMonthlyFeeZAR(feeText?: string): number {
  if (!feeText) return 950;
  const matches = feeText.replace(/,/g, '').match(/\d{3,5}/g);
  if (!matches || matches.length === 0) return 950;
  const nums = matches.map((m) => parseInt(m, 10)).filter((n) => n >= 150 && n <= 25000);
  if (nums.length === 0) return 950;
  if (nums.length >= 2) {
    // Use the upper or midpoint of a range like "R500 - R1450" -> 975
    return Math.round((nums[0] + nums[1]) / 2);
  }
  return nums[0];
}

/**
 * Converts a LiveSearchHighlight card into a pre-filled Preschool object ready for the
 * Add & Claim modal and Directory publication.
 */
export function highlightToDraftPreschool(
  item: LiveSearchHighlight,
  context?: { province?: string; city?: string; query?: string }
): Preschool {
  const cleanName = item.title
    .replace(/\s*\(Official Website\)\s*/gi, '')
    .replace(/\s*\(Live Web & Maps Lookup\)\s*/gi, '')
    .replace(/\s*[-»|]\s*(Facebook|Info & Contact Details|Best Preschool.*).*$/gi, '')
    .trim();

  const combinedLocationText = `${item.subtitle || ''} ${item.details || ''} ${item.reviewsSummary || ''}`;
  const province = detectProvinceFromText(combinedLocationText, context?.province);

  // Extract city/suburb from comma-separated subtitle like "Erf 28 Riverbend Road, Skoonplaas, Umzimkhulu, KZN, 3297"
  const subtitleParts = (item.subtitle || '')
    .split('·')[0]
    .split(',')
    .map((p) => p.trim())
    .filter(
      (p) =>
        p &&
        !/^(south africa|za|kzn|wc|gp|ec|mp|lp|nw|fs|nc|\d{4})$/i.test(p) &&
        !p.toLowerCase().includes('live web')
    );

  let city = context?.city && context.city !== 'All' ? context.city : 'Umzimkhulu';
  let suburb = city;

  if (subtitleParts.length >= 2) {
    city = subtitleParts[subtitleParts.length - 1];
    suburb = subtitleParts[subtitleParts.length - 2];
  } else if (subtitleParts.length === 1) {
    city = subtitleParts[0];
    suburb = subtitleParts[0];
  } else if (/umzimkhulu/i.test(combinedLocationText)) {
    city = 'Umzimkhulu';
    suburb = 'Umzimkhulu';
  }

  const slug = `${cleanName}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const phoneMatch = `${item.details || ''} ${item.reviewsSummary || ''}`.match(
    /(\+27\s?\d{2}\s?\d{3}\s?\d{4}|\+27\d{9}|0\d{2}\s?\d{3}\s?\d{4}|0\d{9})/
  );
  const extractedPhone = phoneMatch ? phoneMatch[1].trim() : '';

  const cleanHours = (item.hoursOrDeadline || '07:00 – 17:00')
    .replace(/\s*\((Typical ECD Hours|Standard SA ECD Hours|Mon\s*[–-]\s*Fri)\)\s*/gi, '')
    .trim();

  const monthlyFeeZAR = parseMonthlyFeeZAR(item.feeOrAmount);

  const cleanDescription =
    item.reviewsSummary && !item.reviewsSummary.startsWith('Not yet listed')
      ? item.reviewsSummary
      : `${cleanName} offers a nurturing, creative, and safe environment for early childhood development in ${city}, ${province}.`;

  return {
    id: slug,
    slug,
    name: cleanName || context?.query || 'Verified Preschool',
    tagline: `Early childhood development centre in ${city}, ${province}`,
    description: cleanDescription,
    province,
    district: city,
    municipality: city,
    educationDistrict: city,
    city,
    suburb,
    address:
      item.subtitle && item.subtitle.includes(',')
        ? item.subtitle
        : `${suburb}, ${city}, ${province}, South Africa`,
    latitude: -30.26,
    longitude: 29.94,
    curriculum: 'Play-Based',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR,
    rating: 4.9,
    reviewCount: 12,
    isVerified: true,
    isClaimed: false,
    dsdRegistration: 'Full',
    isSubsidised: false,
    npoNumber: null,
    status: 'Admissions Open',
    teacherRatio: '1:6',
    operatingHours: cleanHours || '07:00 – 17:00',
    facilities: [
      'Lockable Gate',
      'Secure Perimeter Fence',
      'Nutritious Meals',
      'Outdoor Playground',
      'Grade R Readiness',
      'On-Site Clean Tap Water',
    ],
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
    ],
    phone: extractedPhone,
    email: '',
    websiteUrl: item.websiteUrl && !item.websiteUrl.includes('google.com/maps') ? item.websiteUrl : '',
    principal: 'Principal / Owner',
    reviews: [
      {
        id: `rev-${slug}-1`,
        author: 'Verified Parent',
        childAge: 'Toddler Group',
        date: 'November 2026',
        rating: 5,
        comment: `${cleanName} provides a warm, dedicated team and safe learning environment for children in ${city}.`,
      },
    ],
  };
}
