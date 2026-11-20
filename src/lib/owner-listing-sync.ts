import type { Preschool } from '@/data/preschools';
import {
  hasOnlyStockPlaceholderImages,
  MAX_PRESCHOOL_PROFILE_PHOTOS,
  resolveRealPreschoolImages,
} from '@/lib/real-website-photos';

export interface OwnerProfileUpdateInput {
  previousSlug?: string;
  previousName?: string;
  schoolName: string;
  monthlyFeeZAR: number;
  operatingHours: string;
  capacity?: number;
  whatsappPhone?: string;
  email?: string;
  npoNumber?: string;
  city?: string;
  province?: string;
  address?: string;
  curriculum?: string;
  websiteUrl?: string;
  images?: string[];
  ownerName?: string;
  role?: string;
  tierName?: string;
  websitePreviewed?: boolean;
}

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
];

export function buildCleanSchoolSlug(name: string, city?: string): string {
  const raw = `${name.trim()}-${(city || 'south-africa').trim()}`;
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Automatically reconciles any mismatch between the Owner Portal (`nurserynet_active_plan`)
 * and the Directory (`nurserynet_custom_preschools`).
 *
 * Specifically: if an owner claimed a preschool with a spelling mistake, and then fixed
 * the spelling in the Owner Portal (`nurserynet_active_plan.schoolName`), this function
 * detects the corrected name in `nurserynet_active_plan` and immediately updates
 * `nurserynet_custom_preschools`, `nurserynet_claimed_slugs`, `nurserynet_saved_schools`,
 * and the server-side `/api/claim` pool so the Directory reflects the corrected spelling.
 */
export async function reconcileOwnerProfileWithDirectory(): Promise<{
  customSchools: Preschool[];
  claimedSlugs: string[];
  activePlan: any;
  reconciled: boolean;
}> {
  if (typeof window === 'undefined') {
    return { customSchools: [], claimedSlugs: [], activePlan: null, reconciled: false };
  }

  try {
    const rawPlan = localStorage.getItem('nurserynet_active_plan');
    const activePlan = rawPlan ? JSON.parse(rawPlan) : null;

    const rawCustom = localStorage.getItem('nurserynet_custom_preschools');
    let customSchools: Preschool[] = rawCustom ? JSON.parse(rawCustom) : [];
    if (!Array.isArray(customSchools)) customSchools = [];

    const rawSlugs = localStorage.getItem('nurserynet_claimed_slugs');
    let claimedSlugs: string[] = rawSlugs ? JSON.parse(rawSlugs) : [];
    if (!Array.isArray(claimedSlugs)) claimedSlugs = [];

    // First: upgrade any custom claimed schools that still have generic stock placeholder photos
    // to their real website cover & gallery photos if available!
    let photosUpgraded = false;
    customSchools = customSchools.map((cs) => {
      const resolved = resolveRealPreschoolImages({
        name: cs.name,
        slug: cs.slug || cs.id,
        websiteUrl: cs.websiteUrl,
        images: cs.images,
      });
      if (
        resolved.length > 0 &&
        hasOnlyStockPlaceholderImages(cs.images) &&
        !hasOnlyStockPlaceholderImages(resolved)
      ) {
        photosUpgraded = true;
        const upgraded = { ...cs, images: resolved };
        fetch('/api/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nurserySlug: upgraded.slug || upgraded.id,
            nurseryName: upgraded.name,
            ownerName: 'Verified Principal',
            ownerPhone: upgraded.phone,
            ownerEmail: upgraded.email,
            replaceAllForOwner: true,
            preschoolData: upgraded,
          }),
        }).catch(() => {});
        return upgraded;
      }
      return cs;
    });

    if (photosUpgraded) {
      localStorage.setItem('nurserynet_custom_preschools', JSON.stringify(customSchools));
    }

    if (!activePlan || !activePlan.schoolName || typeof activePlan.schoolName !== 'string') {
      return { customSchools, claimedSlugs, activePlan, reconciled: false };
    }

    const correctedName = activePlan.schoolName.trim();
    if (!correctedName) {
      return { customSchools, claimedSlugs, activePlan, reconciled: false };
    }

    // Find the target claimed school in customSchools:
    // 1. Match by activePlan.schoolSlug or activePlan.previousSlug
    // 2. Or if there is a claimed school in customSchools (the primary claimed school sits at index 0)
    let targetIndex = -1;
    if (activePlan.schoolSlug) {
      targetIndex = customSchools.findIndex(
        (s) => (s.slug || s.id) === activePlan.schoolSlug
      );
    }
    if (targetIndex === -1 && activePlan.previousSlug) {
      targetIndex = customSchools.findIndex(
        (s) => (s.slug || s.id) === activePlan.previousSlug
      );
    }
    // If customSchools has entries and the user fixed the name in the Owner Portal (which didn't have schoolSlug set or had the old slug),
    // match the primary claimed school at index 0 (unless correctedName is the untouched default 'Sunshine Early Learning Centre' and customSchools[0] is a totally different school that was claimed later)
    if (targetIndex === -1 && customSchools.length > 0) {
      const isUntouchedDefault =
        correctedName === 'Sunshine Early Learning Centre' && !activePlan.schoolSlug;
      if (!isUntouchedDefault) {
        targetIndex = 0;
      }
    }

    let reconciled = false;

    if (targetIndex !== -1) {
      const targetSchool = customSchools[targetIndex];
      const oldName = targetSchool.name;
      const oldSlug = targetSchool.slug || targetSchool.id;
      const city = activePlan.city || targetSchool.city || targetSchool.municipality || 'South Africa';
      const province = activePlan.province || targetSchool.province || 'KwaZulu-Natal';
      const fee = Number(activePlan.monthlyFeeZAR) || targetSchool.monthlyFeeZAR || 950;
      const hours = activePlan.operatingHours || targetSchool.operatingHours || '07:00 – 17:00';
      const phone = activePlan.whatsappPhone || targetSchool.phone || '';
      const npo = activePlan.npoNumber !== undefined ? activePlan.npoNumber : targetSchool.npoNumber;

      // Check if name or core profile fields in Owner Portal differ from Directory record
      const desiredImages = resolveRealPreschoolImages({
        name: correctedName,
        slug: buildCleanSchoolSlug(correctedName, city),
        websiteUrl: activePlan.websiteUrl ?? targetSchool.websiteUrl,
        images: activePlan.images || targetSchool.images,
      });
      const needsImageUpgrade =
        hasOnlyStockPlaceholderImages(targetSchool.images) &&
        !hasOnlyStockPlaceholderImages(desiredImages);

      if (
        oldName !== correctedName ||
        targetSchool.monthlyFeeZAR !== fee ||
        targetSchool.operatingHours !== hours ||
        (phone && targetSchool.phone !== phone) ||
        needsImageUpgrade
      ) {
        const newSlug = buildCleanSchoolSlug(correctedName, city);
        const updatedSchool: Preschool = {
          ...targetSchool,
          id: newSlug,
          slug: newSlug,
          name: correctedName,
          city,
          municipality: city,
          suburb: targetSchool.suburb || city,
          province,
          address: activePlan.address || targetSchool.address || `${city}, ${province}, South Africa`,
          monthlyFeeZAR: fee,
          operatingHours: hours,
          phone: phone || targetSchool.phone,
          npoNumber: npo || targetSchool.npoNumber || null,
          websiteUrl: activePlan.websiteUrl ?? targetSchool.websiteUrl,
          images: desiredImages.length > 0 ? desiredImages : targetSchool.images,
          tagline: `Early childhood development centre in ${city}, ${province}`,
          description:
            targetSchool.description && oldName && oldName !== correctedName
              ? targetSchool.description.replace(new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), correctedName)
              : `${correctedName} is an Owner-Claimed & Verified early childhood development centre in ${city}, ${province}.`,
          reviews: Array.isArray(targetSchool.reviews)
            ? targetSchool.reviews.map((r) => ({
                ...r,
                comment:
                  oldName && oldName !== correctedName && typeof r.comment === 'string'
                    ? r.comment.replace(new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), correctedName)
                    : r.comment,
              }))
            : [],
          isClaimed: true,
          isVerified: true,
        };

        // Replace old entry and deduplicate any other entries from the same city with a similar misspelled name
        customSchools = [
          updatedSchool,
          ...customSchools.filter((s, idx) => {
            if (idx === targetIndex) return false;
            const sSlug = s.slug || s.id;
            if (sSlug === oldSlug || sSlug === newSlug) return false;
            return true;
          }),
        ];

        claimedSlugs = [
          newSlug,
          ...claimedSlugs.filter((slug) => slug !== oldSlug && slug !== newSlug),
        ];

        const updatedPlan = {
          ...activePlan,
          schoolName: correctedName,
          schoolSlug: newSlug,
          previousSlug: oldSlug,
          city,
          province,
        };

        localStorage.setItem('nurserynet_custom_preschools', JSON.stringify(customSchools));
        localStorage.setItem('nurserynet_claimed_slugs', JSON.stringify(claimedSlugs));
        localStorage.setItem('nurserynet_active_plan', JSON.stringify(updatedPlan));

        // Also update saved shortlist if the school was shortlisted under the old slug/name
        try {
          const rawSaved = localStorage.getItem('nurserynet_saved_schools');
          if (rawSaved) {
            const savedList: Preschool[] = JSON.parse(rawSaved);
            if (Array.isArray(savedList)) {
              const updatedSaved = savedList.map((s) =>
                (s.slug || s.id) === oldSlug || (s.slug || s.id) === newSlug || s.name === oldName
                  ? updatedSchool
                  : s
              );
              localStorage.setItem('nurserynet_saved_schools', JSON.stringify(updatedSaved));
            }
          }
        } catch {
          // ignore
        }

        // Clear any stale sessionStorage live search cache that might still hold the old misspelled query
        try {
          Object.keys(window.sessionStorage).forEach((key) => {
            if (key.startsWith('nurserynet_live_search_')) {
              window.sessionStorage.removeItem(key);
            }
          });
        } catch {
          // ignore
        }

        // Push corrected school to server directory pool (/api/claim)
        fetch('/api/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nurserySlug: newSlug,
            previousSlug: oldSlug,
            previousName: oldName,
            nurseryName: correctedName,
            ownerName: 'Verified Principal',
            ownerPhone: updatedSchool.phone,
            ownerEmail: updatedSchool.email,
            replaceAllForOwner: true,
            preschoolData: updatedSchool,
          }),
        }).catch(() => {});

        if (oldName !== correctedName) {
          reconciled = true;
        }
      }
    } else if (
      correctedName !== 'Sunshine Early Learning Centre' &&
      customSchools.length === 0
    ) {
      // The user edited their school name in the Owner Portal without a record in customSchools yet — create one so it appears in the Directory
      const city = activePlan.city || 'Umzimkhulu';
      const province = activePlan.province || 'KwaZulu-Natal';
      const newSlug = activePlan.schoolSlug || buildCleanSchoolSlug(correctedName, city);
      const fee = Number(activePlan.monthlyFeeZAR) || 1450;
      const hours = activePlan.operatingHours || '07:00 – 17:30';

      const createdSchool: Preschool = {
        id: newSlug,
        slug: newSlug,
        name: correctedName,
        tagline: `Early childhood development centre in ${city}, ${province}`,
        description: `${correctedName} is an Owner-Claimed & Verified early childhood development centre in ${city}, ${province}.`,
        province,
        city,
        municipality: city,
        district: city,
        suburb: city,
        address: activePlan.address || `${city}, ${province}, South Africa`,
        curriculum: activePlan.curriculum || 'Play-Based',
        ageRange: '18 months – 6 years',
        minAgeMonths: 18,
        maxAgeMonths: 72,
        monthlyFeeZAR: fee,
        rating: 4.9,
        reviewCount: 14,
        isVerified: true,
        isClaimed: true,
        dsdRegistration: 'Full',
        npoNumber: activePlan.npoNumber || null,
        status: 'Admissions Open',
        teacherRatio: '1:6',
        operatingHours: hours,
        facilities: [
          'Lockable Gate',
          'Secure Perimeter Fence',
          'Nutritious Meals',
          'Outdoor Playground',
          'Grade R Readiness',
          'On-Site Clean Tap Water',
        ],
        images: (() => {
          const resolved = resolveRealPreschoolImages({
            name: correctedName,
            slug: newSlug,
            websiteUrl: activePlan.websiteUrl,
            images: activePlan.images || DEFAULT_IMAGES,
          });
          return resolved.length > 0 ? resolved : DEFAULT_IMAGES;
        })(),
        phone: activePlan.whatsappPhone || '082 555 1829',
        email: activePlan.email || '',
        websiteUrl: activePlan.websiteUrl || '',
        principal: 'Verified Owner / Principal',
        reviews: [],
      };

      customSchools = [createdSchool];
      if (!claimedSlugs.includes(newSlug)) {
        claimedSlugs = [newSlug, ...claimedSlugs];
      }
      localStorage.setItem('nurserynet_custom_preschools', JSON.stringify(customSchools));
      localStorage.setItem('nurserynet_claimed_slugs', JSON.stringify(claimedSlugs));
      localStorage.setItem(
        'nurserynet_active_plan',
        JSON.stringify({ ...activePlan, schoolSlug: newSlug })
      );

      fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nurserySlug: newSlug,
          nurseryName: correctedName,
          ownerName: 'Verified Principal',
          preschoolData: createdSchool,
        }),
      }).catch(() => {});

      reconciled = true;
    }

    return { customSchools, claimedSlugs, activePlan, reconciled };
  } catch (err) {
    console.error('Error reconciling owner profile with directory:', err);
    return { customSchools: [], claimedSlugs: [], activePlan: null, reconciled: false };
  }
}

/**
 * Atomically saves any change made to a school's name or details (either from the Owner Portal
 * or from the Directory's "Edit Claimed Listing" modal) across BOTH the Owner Portal AND the Directory.
 */
export async function syncOwnerProfileToDirectory(
  input: OwnerProfileUpdateInput
): Promise<Preschool> {
  const cleanName = input.schoolName.trim() || 'Verified Preschool';
  let customSchools: Preschool[] = [];
  let claimedSlugs: string[] = [];
  let existingPlan: any = {};

  if (typeof window !== 'undefined') {
    try {
      customSchools = JSON.parse(localStorage.getItem('nurserynet_custom_preschools') || '[]');
      if (!Array.isArray(customSchools)) customSchools = [];
    } catch {
      customSchools = [];
    }
    try {
      claimedSlugs = JSON.parse(localStorage.getItem('nurserynet_claimed_slugs') || '[]');
      if (!Array.isArray(claimedSlugs)) claimedSlugs = [];
    } catch {
      claimedSlugs = [];
    }
    try {
      existingPlan = JSON.parse(localStorage.getItem('nurserynet_active_plan') || '{}') || {};
    } catch {
      existingPlan = {};
    }
  }

  // Locate existing custom school record if present
  const prevSlug = input.previousSlug || existingPlan.schoolSlug || customSchools[0]?.slug || customSchools[0]?.id;
  const existingSchool =
    customSchools.find((s) => (s.slug || s.id) === prevSlug) || customSchools[0] || null;
  const oldName = input.previousName || existingSchool?.name || existingPlan.schoolName || '';

  const city = (
    input.city ||
    existingPlan.city ||
    existingSchool?.city ||
    existingSchool?.municipality ||
    'Umzimkhulu'
  ).trim();
  const province = (
    input.province ||
    existingPlan.province ||
    existingSchool?.province ||
    'KwaZulu-Natal'
  ).trim();
  const newSlug = buildCleanSchoolSlug(cleanName, city);

  const resolvedWebsiteUrl =
    input.websiteUrl !== undefined ? input.websiteUrl : existingSchool?.websiteUrl || '';

  const resolvedImages = (() => {
    const baseImages =
      Array.isArray(input.images) && input.images.length > 0
        ? input.images.slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS)
        : existingSchool?.images && existingSchool.images.length > 0
        ? existingSchool.images.slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS)
        : DEFAULT_IMAGES;
    const fromWebsite = resolveRealPreschoolImages({
      name: cleanName,
      slug: newSlug,
      websiteUrl: resolvedWebsiteUrl,
      images: baseImages,
    }).slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
    return (fromWebsite.length > 0 ? fromWebsite : baseImages).slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
  })();

  const updatedSchool: Preschool = {
    ...(existingSchool || {
      ageRange: '18 months – 6 years',
      minAgeMonths: 18,
      maxAgeMonths: 72,
      rating: 4.9,
      reviewCount: 12,
      dsdRegistration: 'Full',
      status: 'Admissions Open',
      teacherRatio: '1:6',
      facilities: [
        'Lockable Gate',
        'Secure Perimeter Fence',
        'Nutritious Meals',
        'Outdoor Playground',
        'Grade R Readiness',
        'On-Site Clean Tap Water',
      ],
      images: resolvedImages,
      reviews: [],
    }),
    id: newSlug,
    slug: newSlug,
    name: cleanName,
    tagline: `Early childhood development centre in ${city}, ${province}`,
    description:
      existingSchool?.description && oldName && oldName !== cleanName
        ? existingSchool.description.replace(
            new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
            cleanName
          )
        : `${cleanName} is an Owner-Claimed & Verified early childhood development centre in ${city}, ${province}.`,
    province,
    city,
    municipality: city,
    district: city,
    suburb: existingSchool?.suburb || city,
    address:
      input.address ||
      existingPlan.address ||
      existingSchool?.address ||
      `${city}, ${province}, South Africa`,
    curriculum: input.curriculum || existingSchool?.curriculum || 'Play-Based',
    monthlyFeeZAR: Math.max(150, Number(input.monthlyFeeZAR) || 950),
    operatingHours: input.operatingHours || existingSchool?.operatingHours || '07:00 – 17:30',
    phone: input.whatsappPhone || existingSchool?.phone || '',
    email: input.email || existingSchool?.email || '',
    npoNumber:
      input.npoNumber !== undefined
        ? input.npoNumber || null
        : existingSchool?.npoNumber || null,
    websiteUrl: resolvedWebsiteUrl,
    images: resolvedImages,
    principal: input.ownerName
      ? `${input.ownerName} (${input.role || 'Owner / Principal'})`
      : existingSchool?.principal || 'Owner / Principal',
    isClaimed: true,
    isVerified: true,
    claimedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const filteredCustom = customSchools.filter((s) => {
      const sSlug = s.slug || s.id;
      if (sSlug === prevSlug || sSlug === newSlug) return false;
      if (oldName && s.name.toLowerCase() === oldName.toLowerCase()) return false;
      return true;
    });

    const nextCustom = [updatedSchool, ...filteredCustom];
    const nextSlugs = [
      newSlug,
      ...claimedSlugs.filter((s) => s !== prevSlug && s !== newSlug),
    ];

    const updatedPlan = {
      ...existingPlan,
      tierName: input.tierName || existingPlan.tierName || 'Owner-Claimed & Verified',
      schoolName: cleanName,
      schoolSlug: newSlug,
      previousSlug: prevSlug,
      monthlyFeeZAR: updatedSchool.monthlyFeeZAR,
      operatingHours: updatedSchool.operatingHours,
      capacity: input.capacity || existingPlan.capacity || 45,
      whatsappPhone: updatedSchool.phone,
      npoNumber: updatedSchool.npoNumber || '',
      city: updatedSchool.city,
      province: updatedSchool.province,
      address: updatedSchool.address,
      curriculum: updatedSchool.curriculum,
      websiteUrl: updatedSchool.websiteUrl || '',
      websitePreviewed:
        input.websitePreviewed !== undefined
          ? input.websitePreviewed
          : existingPlan.websitePreviewed,
    };

    try {
      localStorage.setItem('nurserynet_custom_preschools', JSON.stringify(nextCustom));
      localStorage.setItem('nurserynet_claimed_slugs', JSON.stringify(nextSlugs));
      localStorage.setItem('nurserynet_active_plan', JSON.stringify(updatedPlan));

      // Also update saved shortlist if present
      const rawSaved = localStorage.getItem('nurserynet_saved_schools');
      if (rawSaved) {
        const savedList: Preschool[] = JSON.parse(rawSaved);
        if (Array.isArray(savedList)) {
          const updatedSaved = savedList.map((s) =>
            (s.slug || s.id) === prevSlug ||
            (s.slug || s.id) === newSlug ||
            (oldName && s.name === oldName)
              ? updatedSchool
              : s
          );
          localStorage.setItem('nurserynet_saved_schools', JSON.stringify(updatedSaved));
        }
      }

      // Clear stale live search cache in sessionStorage so old misspelled searches don't reappear
      Object.keys(window.sessionStorage).forEach((key) => {
        if (key.startsWith('nurserynet_live_search_')) {
          window.sessionStorage.removeItem(key);
        }
      });

      window.dispatchEvent(new Event('nurserynet_directory_synced'));
    } catch {
      // ignore storage errors
    }
  }

  // Push update to server directory pool (/api/claim)
  try {
    await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nurserySlug: newSlug,
        previousSlug: prevSlug,
        previousName: oldName,
        nurseryName: cleanName,
        ownerName: input.ownerName || 'Verified Principal',
        ownerEmail: updatedSchool.email,
        ownerPhone: updatedSchool.phone,
        role: input.role || 'Owner / Principal',
        replaceAllForOwner: true,
        preschoolData: updatedSchool,
      }),
    });
  } catch {
    // ignore network error
  }

  return updatedSchool;
}

/**
 * Allows an owner to remove an accidentally claimed or misspelled duplicate listing from the Directory.
 */
export async function removeClaimedPreschoolListing(slugToRemove: string): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const customSchools: Preschool[] = JSON.parse(
        localStorage.getItem('nurserynet_custom_preschools') || '[]'
      );
      if (Array.isArray(customSchools)) {
        const filtered = customSchools.filter((s) => (s.slug || s.id) !== slugToRemove);
        localStorage.setItem('nurserynet_custom_preschools', JSON.stringify(filtered));
      }

      const claimedSlugs: string[] = JSON.parse(
        localStorage.getItem('nurserynet_claimed_slugs') || '[]'
      );
      if (Array.isArray(claimedSlugs)) {
        localStorage.setItem(
          'nurserynet_claimed_slugs',
          JSON.stringify(claimedSlugs.filter((s) => s !== slugToRemove))
        );
      }

      window.dispatchEvent(new Event('nurserynet_directory_synced'));
    } catch {
      // ignore
    }
  }

  try {
    await fetch(`/api/claim?slug=${encodeURIComponent(slugToRemove)}`, {
      method: 'DELETE',
    });
  } catch {
    // ignore
  }
}
