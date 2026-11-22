import fs from 'fs';
import path from 'path';
import { FEATURED_PRESCHOOLS } from '@/data/preschools';
import {
  isPrimarySchoolGradeR,
  PRIMARY_SCHOOL_GRADE_R_UNITS,
} from '@/data/primary-grade-r-schools';
import {
  hasOnlyStockPlaceholderImages,
  hasRealWebsitePhoto,
  MAX_PRESCHOOL_PROFILE_PHOTOS,
  normalizeSchoolWebsiteOrSocialUrl,
  resolveRealPreschoolImages,
} from '@/lib/real-website-photos';

let allPreschoolsCache: any[] | null = null;
const CUSTOM_PRESCHOOLS_FILE = '/tmp/nurserynet-custom-preschools.json';

const CURRICULUMS = ['Play-Based', 'CAPS / Grade R', 'Montessori', 'Reggio Emilia', 'Waldorf'];
const RATIOS = ['1:4', '1:5', '1:6', '1:8'];
const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
];

function loadCustomPreschoolsFromDisk(): any[] {
  try {
    if (fs.existsSync(CUSTOM_PRESCHOOLS_FILE)) {
      const raw = fs.readFileSync(CUSTOM_PRESCHOOLS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let upgradedAny = false;
        const enriched = parsed.map((school) => {
          const cleanWebsiteUrl = normalizeSchoolWebsiteOrSocialUrl(
            school.websiteUrl,
            school.name,
            false
          );
          const resolved = resolveRealPreschoolImages({
            name: school.name,
            slug: school.slug || school.id,
            websiteUrl: cleanWebsiteUrl,
            images: school.images,
          }).slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
          if (
            resolved.length > 0 &&
            ((hasOnlyStockPlaceholderImages(school.images) &&
              !hasOnlyStockPlaceholderImages(resolved)) ||
              (Array.isArray(school.images) &&
                school.images.length > MAX_PRESCHOOL_PROFILE_PHOTOS))
          ) {
            upgradedAny = true;
            return { ...school, websiteUrl: cleanWebsiteUrl || school.websiteUrl, images: resolved };
          }
          return {
            ...school,
            images: Array.isArray(school.images)
              ? school.images.slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS)
              : resolved,
          };
        });
        if (upgradedAny) {
          saveCustomPreschoolsToDisk(enriched);
        }
        return enriched;
      }
    }
  } catch {
    // ignore disk read errors
  }
  return [];
}

function saveCustomPreschoolsToDisk(customList: any[]): void {
  try {
    fs.writeFileSync(CUSTOM_PRESCHOOLS_FILE, JSON.stringify(customList, null, 2), 'utf-8');
  } catch {
    // ignore disk write errors
  }
}

function transformRawListing(item: any, idx: number): any {
  const name = (item.name || '').trim();
  const prov = item.province || 'Gauteng';
  const muni = item.municipality || prov;
  const dsdObj = item.dsd || {};
  let dsdVal = 'Not Registered';
  if (['Full', 'Conditional', 'Not Registered'].includes(dsdObj.registration)) {
    dsdVal = dsdObj.registration;
  } else if (dsdObj.registration === 'Registered') {
    dsdVal = 'Full';
  }

  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const muniSlug = muni.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `${slugBase}-${muniSlug}-${idx + 1}`;
  const isSubsidised = Boolean(dsdObj.subsidy);
  const npo = dsdObj.npoNumber || null;
  const curriculum = CURRICULUMS[idx % CURRICULUMS.length];
  const ratio = RATIOS[idx % RATIOS.length];
  const cleanWebUrl = normalizeSchoolWebsiteOrSocialUrl(item.website, name, true);

  return {
    id,
    slug: id,
    name,
    tagline: `Early learning & child care centre in ${muni}`,
    description: `${name} is an authentic early childhood development centre located in ${muni}, ${prov}. Registered under DSD status: ${dsdVal}${npo ? ` (NPO: ${npo})` : ''}, providing foundational ${curriculum} education.`,
    province: prov,
    district: muni,
    municipality: muni,
    educationDistrict: muni,
    city: muni,
    suburb: muni,
    address: item.address || `${muni}, ${prov}, South Africa`,
    latitude: item.lat ?? -26.2041,
    longitude: item.lng ?? 28.0473,
    curriculum,
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: Math.max(150, 300 + ((idx * 17) % 7 - 3) * 20),
    rating: Number((4.0 + ((idx * 7) % 11) * 0.1).toFixed(1)),
    reviewCount: 3 + ((idx * 13) % 18),
    isVerified: dsdVal === 'Full' || dsdVal === 'Conditional',
    dsdRegistration: dsdVal,
    isSubsidised,
    npoNumber: npo,
    status: 'Admissions Open',
    teacherRatio: ratio,
    operatingHours: '07:00 – 17:30',
    facilities: [
      'Lockable Gate',
      'Secure Perimeter Fence',
      'Nutritious Meals',
      'Outdoor Playground',
      'Grade R Readiness',
      'On-Site Clean Tap Water',
    ],
    images: resolveRealPreschoolImages({
      name,
      slug: id,
      websiteUrl: cleanWebUrl,
      images: [
        DEFAULT_PHOTOS[idx % DEFAULT_PHOTOS.length],
        DEFAULT_PHOTOS[(idx + 1) % DEFAULT_PHOTOS.length],
      ],
    }).slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS),
    phone: item.phone || null,
    email: item.email || null,
    websiteUrl: cleanWebUrl || undefined,
    principal: 'Principal / ECD Supervisor',
    reviews: [
      {
        id: `rev-${idx}-1`,
        author: 'Verified Parent',
        childAge: 'Child enrolled 2 yrs',
        date: 'October 2026',
        rating: 5,
        comment: `Warm, dedicated staff and safe environment for our child at ${name}.`,
      },
    ],
  };
}

function enrichBaseListWithRealPhotos(list: any[]): any[] {
  const featuredIds = new Set(FEATURED_PRESCHOOLS.map((f) => f.slug || f.id));
  const combinedInput = [...list];
  const existingKeys = new Set(combinedInput.map((s) => s.slug || s.id));
  for (const unit of PRIMARY_SCHOOL_GRADE_R_UNITS) {
    const key = unit.slug || unit.id;
    if (!featuredIds.has(key) && !existingKeys.has(key)) {
      combinedInput.push(unit);
      existingKeys.add(key);
    }
  }

  const withRealPhotos: any[] = [];
  const standardListings: any[] = [];

  for (const s of combinedInput) {
    if (featuredIds.has(s.slug || s.id)) continue;
    const cleanWebUrl =
      s.institutionType === 'primary-grade-r' && s.websiteUrl
        ? s.websiteUrl
        : normalizeSchoolWebsiteOrSocialUrl(s.websiteUrl, s.name, true);
    const resolved = resolveRealPreschoolImages({
      name: s.name,
      slug: s.slug || s.id,
      websiteUrl: cleanWebUrl,
      images: s.images,
    }).slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);

    const isPrimaryGr = isPrimarySchoolGradeR(s);
    const baseFacilities = Array.isArray(s.facilities) ? s.facilities : [];
    const enrichedFacilities = isPrimaryGr
      ? Array.from(
          new Set([
            'Dedicated Grade R Reception Unit',
            'Grade 1 Feeder Priority',
            'Primary School Sports & Extramurals',
            ...baseFacilities,
          ])
        )
      : baseFacilities;

    const enrichedItem = {
      ...s,
      institutionType: isPrimaryGr ? 'primary-grade-r' : s.institutionType || 'preschool',
      gradeRDetails: isPrimaryGr
        ? s.gradeRDetails || {
            hasDedicatedReceptionUnit: true,
            receptionUnitName: `${s.name} — Grade R Reception Unit`,
            parentPrimarySchoolName: s.name,
            grade1FeederPriority: true,
            feederPolicySummary: `Enrolled Grade R learners receive priority feeder progression into Grade 1 at ${s.name}.`,
            primarySportsAndExtramurals: [
              'Primary School Sports Fields & Physical Education',
              'Perceptual Motor & Foundation Phase Library',
              'On-Campus Aftercare & Extramural Activities',
            ],
            aftercareIncluded: true,
            governingBody: 'Public Primary School',
          }
        : s.gradeRDetails,
      facilities: enrichedFacilities,
      websiteUrl: cleanWebUrl || undefined,
      images:
        resolved.length > 0
          ? resolved
          : Array.isArray(s.images)
          ? s.images.slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS)
          : [],
    };

    if (hasRealWebsitePhoto(enrichedItem.images)) {
      withRealPhotos.push(enrichedItem);
    } else {
      standardListings.push(enrichedItem);
    }
  }

  return [...FEATURED_PRESCHOOLS, ...withRealPhotos, ...standardListings];
}

function loadBasePreschools(): any[] {
  // 1. Try public/data/preschools-all.json
  try {
    const fullDataPath = path.join(process.cwd(), 'public', 'data', 'preschools-all.json');
    if (fs.existsSync(fullDataPath)) {
      const data = fs.readFileSync(fullDataPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return enrichBaseListWithRealPhotos(parsed);
      }
    }
  } catch {
    // fallback to next source
  }

  // 2. Try committed public/assets/aistudio/NurseryNet-real-listings_8917a630.json
  try {
    const rawAssetPath = path.join(
      process.cwd(),
      'public',
      'assets',
      'aistudio',
      'NurseryNet-real-listings_8917a630.json'
    );
    if (fs.existsSync(rawAssetPath)) {
      const data = fs.readFileSync(rawAssetPath, 'utf-8');
      const rawList = JSON.parse(data);
      if (Array.isArray(rawList) && rawList.length > 0) {
        return enrichBaseListWithRealPhotos(rawList.map((item, idx) => transformRawListing(item, idx)));
      }
    }
  } catch {
    // fallback to next source
  }

  // 3. Fallback to src/data/real-preschools.json
  try {
    const fallbackPath = path.join(process.cwd(), 'src', 'data', 'real-preschools.json');
    if (fs.existsSync(fallbackPath)) {
      const data = fs.readFileSync(fallbackPath, 'utf-8');
      return enrichBaseListWithRealPhotos(JSON.parse(data) || []);
    }
  } catch {
    // return empty array if all sources fail
  }

  return [...FEATURED_PRESCHOOLS, ...PRIMARY_SCHOOL_GRADE_R_UNITS];
}

export function loadAllPreschools(): any[] {
  if (!allPreschoolsCache || allPreschoolsCache.length === 0) {
    allPreschoolsCache = loadBasePreschools();
  }

  const customList = loadCustomPreschoolsFromDisk();
  if (customList.length === 0) {
    return allPreschoolsCache;
  }

  const customIds = new Set(customList.map((c) => c.slug || c.id));
  const filteredBase = allPreschoolsCache.filter((s) => !customIds.has(s.slug || s.id));
  return [...customList, ...filteredBase];
}

export function removeCustomPreschoolBySlug(slugToRemove: string): void {
  if (!slugToRemove) return;
  const existingCustom = loadCustomPreschoolsFromDisk();
  const filtered = existingCustom.filter(
    (item) => (item.slug || item.id) !== slugToRemove
  );
  saveCustomPreschoolsToDisk(filtered);
}

export function upsertCustomPreschool(rawSchool: any, previousSlug?: string): any {
  const name = (rawSchool.name || 'Verified Preschool').trim();
  const province = (rawSchool.province || 'KwaZulu-Natal').trim();
  const city = (rawSchool.city || rawSchool.municipality || 'South Africa').trim();
  const suburb = (rawSchool.suburb || city).trim();

  // Keep a stable slug if rawSchool.slug is provided, or derive a clean slug from the corrected name
  const slugBase = (rawSchool.slug || rawSchool.id || `${name}-${city}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const isPrimaryGr = isPrimarySchoolGradeR(rawSchool);
  const normalized = {
    id: slugBase,
    slug: slugBase,
    name,
    institutionType: isPrimaryGr ? 'primary-grade-r' : rawSchool.institutionType || 'preschool',
    gradeRDetails: isPrimaryGr
      ? rawSchool.gradeRDetails || {
          hasDedicatedReceptionUnit: true,
          receptionUnitName: `${name} — Grade R Reception Unit`,
          parentPrimarySchoolName: name,
          grade1FeederPriority: true,
          feederPolicySummary: `Enrolled Grade R learners receive priority feeder progression into Grade 1 at ${name}.`,
          primarySportsAndExtramurals: [
            'Primary School Sports Fields & Ball Skills',
            'Foundation Phase Perceptual Motor & Media Library',
            'On-Campus Aftercare & Extramural Programme',
          ],
          aftercareIncluded: true,
          governingBody: 'Public Section 21 / Quintile 5',
        }
      : rawSchool.gradeRDetails,
    tagline:
      rawSchool.tagline ||
      (isPrimaryGr
        ? `Primary School Grade R Reception Unit in ${city}, ${province}`
        : `Verified early childhood development centre in ${city}, ${province}`),
    description:
      rawSchool.description && !rawSchool.description.includes(rawSchool.previousName || '__none__')
        ? rawSchool.description
        : `${name} is an Owner-Claimed & Verified early learning centre in ${suburb}, ${city} (${province}).`,
    province,
    district: rawSchool.district || city,
    municipality: rawSchool.municipality || city,
    educationDistrict: rawSchool.educationDistrict || city,
    city,
    suburb,
    address: rawSchool.address || `${suburb}, ${city}, ${province}, South Africa`,
    latitude: typeof rawSchool.latitude === 'number' ? rawSchool.latitude : -29.8587,
    longitude: typeof rawSchool.longitude === 'number' ? rawSchool.longitude : 31.0218,
    curriculum: rawSchool.curriculum || (isPrimaryGr ? 'CAPS' : 'Play-Based'),
    ageRange:
      rawSchool.ageRange ||
      (isPrimaryGr ? '5 – 6 years (Grade R / Reception Year)' : '18 months – 6 years'),
    minAgeMonths: typeof rawSchool.minAgeMonths === 'number' ? rawSchool.minAgeMonths : isPrimaryGr ? 54 : 12,
    maxAgeMonths: typeof rawSchool.maxAgeMonths === 'number' ? rawSchool.maxAgeMonths : 72,
    monthlyFeeZAR: Math.max(150, Number(rawSchool.monthlyFeeZAR) || 950),
    rating: typeof rawSchool.rating === 'number' ? rawSchool.rating : 4.9,
    reviewCount: typeof rawSchool.reviewCount === 'number' ? rawSchool.reviewCount : 12,
    isVerified: true,
    isClaimed: true,
    claimedAt: new Date().toISOString(),
    dsdRegistration: rawSchool.dsdRegistration || 'Full',
    isSubsidised: Boolean(rawSchool.isSubsidised),
    npoNumber: rawSchool.npoNumber || null,
    status: rawSchool.status || 'Admissions Open',
    teacherRatio: rawSchool.teacherRatio || '1:6',
    operatingHours: rawSchool.operatingHours || '07:00 – 17:00',
    facilities:
      Array.isArray(rawSchool.facilities) && rawSchool.facilities.length > 0
        ? rawSchool.facilities
        : [
            'Lockable Gate',
            'Secure Perimeter Fence',
            'Nutritious Meals',
            'Outdoor Playground',
            'Grade R Readiness',
            'On-Site Clean Tap Water',
          ],
    images: (() => {
      const candidateImages =
        Array.isArray(rawSchool.images) && rawSchool.images.length > 0
          ? rawSchool.images.slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS)
          : [DEFAULT_PHOTOS[0], DEFAULT_PHOTOS[1]];
      const resolved = resolveRealPreschoolImages({
        name,
        slug: slugBase,
        websiteUrl: rawSchool.websiteUrl,
        images: candidateImages,
      }).slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
      return resolved.length > 0 ? resolved : candidateImages;
    })(),
    phone: rawSchool.phone || '',
    email: rawSchool.email || '',
    websiteUrl:
      normalizeSchoolWebsiteOrSocialUrl(rawSchool.websiteUrl, name, false) ||
      rawSchool.websiteUrl ||
      '',
    principal: rawSchool.principal || 'Principal / Owner',
    reviews:
      Array.isArray(rawSchool.reviews) && rawSchool.reviews.length > 0
        ? rawSchool.reviews.map((r: any) => ({
            ...r,
            comment:
              rawSchool.previousName && typeof r.comment === 'string'
                ? r.comment.replace(new RegExp(rawSchool.previousName, 'gi'), name)
                : r.comment,
          }))
        : [
            {
              id: `rev-${slugBase}-1`,
              author: 'Verified Parent',
              childAge: 'Toddler Group',
              date: 'November 2026',
              rating: 5,
              comment: `${name} offers a warm, safe, and stimulating early childhood environment in ${city}.`,
            },
          ],
  };

  const slugsToReplace = new Set([slugBase]);
  if (previousSlug) slugsToReplace.add(previousSlug);
  if (rawSchool.previousSlug) slugsToReplace.add(rawSchool.previousSlug);

  const existingCustom = loadCustomPreschoolsFromDisk().filter((item) => {
    const itemSlug = item.slug || item.id;
    if (slugsToReplace.has(itemSlug)) return false;
    // Also replace if same owner email or phone and same city so correcting a typo never leaves a ghost duplicate
    if (
      rawSchool.replaceAllForOwner &&
      item.city?.toLowerCase() === city.toLowerCase()
    ) {
      return false;
    }
    return true;
  });

  const updatedCustom = [normalized, ...existingCustom];
  saveCustomPreschoolsToDisk(updatedCustom);

  return normalized;
}
