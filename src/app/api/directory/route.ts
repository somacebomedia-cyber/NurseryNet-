import { NextRequest, NextResponse } from 'next/server';
import { loadAllPreschools } from '@/lib/preschool-pool';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = (searchParams.get('q') || '').trim().toLowerCase();
  const province = (searchParams.get('province') || '').trim();
  const municipality = (searchParams.get('municipality') || '').trim().toLowerCase();
  const dsd = (searchParams.get('dsd') || '').trim();
  const subsidised = searchParams.get('subsidised');
  const curriculum = (searchParams.get('curriculum') || '').trim();
  const ageBracket = searchParams.get('ageBracket') || 'All';
  const maxFeeParam = searchParams.get('maxFee');
  const maxFee = maxFeeParam ? parseInt(maxFeeParam, 10) : null;
  const verified = searchParams.get('verified');
  const facilitiesParam = searchParams.get('facilities');
  const facilities = facilitiesParam ? facilitiesParam.split(',').filter(Boolean) : [];
  const sortBy = searchParams.get('sort') || 'rating';

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)));

  const pool = loadAllPreschools();

  // Compute province counts from full pool
  const provinceCounts: Record<string, number> = {};
  for (const s of pool) {
    if (s.province) {
      provinceCounts[s.province] = (provinceCounts[s.province] || 0) + 1;
    }
  }

  let filtered = pool;

  if (province && province !== 'All') {
    filtered = filtered.filter((s) => s.province === province);
  }

  if (municipality && municipality !== 'all') {
    filtered = filtered.filter((s) => {
      const sm = (s.municipality || '').toLowerCase();
      const sc = (s.city || '').toLowerCase();
      const ss = (s.suburb || '').toLowerCase();
      return sm.includes(municipality) || sc.includes(municipality) || ss.includes(municipality);
    });
  }

  if (dsd && dsd !== 'All') {
    if (dsd === 'Not Registered') {
      filtered = filtered.filter((s) => !s.dsdRegistration || s.dsdRegistration === 'Not Registered');
    } else {
      filtered = filtered.filter((s) => s.dsdRegistration === dsd);
    }
  }

  if (subsidised === 'true') {
    filtered = filtered.filter((s) => s.isSubsidised);
  }

  if (curriculum && curriculum !== 'All') {
    filtered = filtered.filter((s) => s.curriculum === curriculum);
  }

  if (ageBracket === 'infants') {
    filtered = filtered.filter((s) => s.minAgeMonths <= 12);
  } else if (ageBracket === 'toddlers') {
    filtered = filtered.filter((s) => s.minAgeMonths <= 24 && s.maxAgeMonths >= 24);
  } else if (ageBracket === 'preprimary') {
    filtered = filtered.filter((s) => s.maxAgeMonths >= 60);
  }

  if (maxFee !== null && !isNaN(maxFee)) {
    filtered = filtered.filter((s) => s.monthlyFeeZAR <= maxFee);
  }

  if (verified === 'true') {
    filtered = filtered.filter((s) => s.isVerified);
  }

  if (facilities.length > 0) {
    filtered = filtered.filter((s) =>
      facilities.every((f) => Array.isArray(s.facilities) && s.facilities.includes(f))
    );
  }

  if (query) {
    const queryNorm = query.replace(/\bcenter\b/g, 'centre');
    const queryTokens = queryNorm.split(/\s+/).filter((t) => t.length >= 2);
    filtered = filtered.filter((s) => {
      const name = (s.name || '').toLowerCase();
      const suburb = (s.suburb || '').toLowerCase();
      const muni = (s.municipality || '').toLowerCase();
      const city = (s.city || '').toLowerCase();
      const npo = (s.npoNumber || '').toLowerCase();
      const phone = (s.phone || '').toLowerCase();
      const curr = (s.curriculum || '').toLowerCase();
      const hayNorm = `${name} ${suburb} ${muni} ${city} ${npo} ${phone} ${curr}`.replace(
        /\bcenter\b/g,
        'centre'
      );
      return (
        name.includes(query) ||
        suburb.includes(query) ||
        muni.includes(query) ||
        city.includes(query) ||
        npo.includes(query) ||
        phone.includes(query) ||
        curr.includes(query) ||
        hayNorm.includes(queryNorm) ||
        (queryTokens.length > 1 && queryTokens.every((t) => hayNorm.includes(t)))
      );
    });
  }

  // Compute top hubs/cities in current province/filter
  const cityMap = new Map<string, number>();
  for (const s of filtered) {
    const c = s.suburb || s.city || s.municipality;
    if (c) {
      cityMap.set(c, (cityMap.get(c) || 0) + 1);
    }
  }
  const availableCities = Array.from(cityMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([name, count]) => ({ name, count }));

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'fee-asc') return a.monthlyFeeZAR - b.monthlyFeeZAR;
    if (sortBy === 'fee-desc') return b.monthlyFeeZAR - a.monthlyFeeZAR;
    if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return b.rating - a.rating; // default 'rating'
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const results = filtered.slice(start, start + limit);

  return NextResponse.json({
    total,
    page,
    limit,
    totalPages,
    results,
    provinceCounts,
    availableCities,
  });
}
