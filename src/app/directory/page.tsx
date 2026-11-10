"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  PRESCHOOLS,
  PROVINCES,
  CITIES,
  CURRICULUMS,
  ALL_FACILITIES,
  ECD_BENCHMARKS,
  Province,
  City,
  Curriculum,
  Preschool,
} from '@/data/preschools';
import PreschoolCard from '@/components/directory/PreschoolCard';
import SchoolDetailModal from '@/components/directory/SchoolDetailModal';
import TourBookingModal from '@/components/directory/TourBookingModal';
import InquiryModal from '@/components/directory/InquiryModal';
import ClaimDialog from '@/components/directory/ClaimDialog';
import EcdBenchmarksDialog from '@/components/directory/EcdBenchmarksDialog';
import { Button } from '@/components/ui/button';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  RotateCcw,
  BadgeCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  School,
  Building,
  Info,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const ITEMS_PER_PAGE = 24;

export default function DirectoryPage() {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<Province | 'All'>('All');
  const [selectedCity, setSelectedCity] = useState<City | 'All'>('All');
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | 'All'>('All');
  const [selectedAgeBracket, setSelectedAgeBracket] = useState<'All' | 'infants' | 'toddlers' | 'preprimary'>('All');
  const [maxMonthlyFee, setMaxMonthlyFee] = useState<number>(7500);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyClaimed, setOnlyClaimed] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'fee-asc' | 'fee-desc' | 'reviews' | 'name'>('rating');
  const [currentPage, setCurrentPage] = useState(1);

  // Claimed Slugs tracking in localStorage
  const [claimedSlugs, setClaimedSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('nurserynet_claimed_slugs') || '[]');
      if (Array.isArray(stored)) {
        setClaimedSlugs(stored);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Modal States
  const [activeSchool, setActiveSchool] = useState<Preschool | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [benchmarksModalOpen, setBenchmarksModalOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Map claimed state onto PRESCHOOLS
  const allSchoolsWithClaimed = useMemo(() => {
    if (claimedSlugs.length === 0) return PRESCHOOLS;
    return PRESCHOOLS.map((s) => {
      const slug = s.slug || s.id;
      if (claimedSlugs.includes(slug)) {
        return { ...s, isClaimed: true };
      }
      return s;
    });
  }, [claimedSlugs]);

  // Dynamic Cities based on selected province
  const availableCities = useMemo(() => {
    const pool = selectedProvince === 'All'
      ? allSchoolsWithClaimed
      : allSchoolsWithClaimed.filter((s) => s.province === selectedProvince);
    
    const cityCounts = new Map<string, number>();
    for (const s of pool) {
      if (s.city) {
        cityCounts.set(s.city, (cityCounts.get(s.city) || 0) + 1);
      }
    }
    return Array.from(cityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([name, count]) => ({ name, count }));
  }, [allSchoolsWithClaimed, selectedProvince]);

  // Filter Logic
  const filteredPreschools = useMemo(() => {
    return allSchoolsWithClaimed.filter((school) => {
      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = school.name.toLowerCase().includes(query);
        const matchesSuburb = school.suburb.toLowerCase().includes(query);
        const matchesCity = school.city.toLowerCase().includes(query);
        const matchesProvince = school.province ? school.province.toLowerCase().includes(query) : false;
        const matchesCurriculum = school.curriculum.toLowerCase().includes(query);
        const matchesEmis = school.emisNumber ? school.emisNumber.includes(query) : false;
        const matchesLang = school.primaryLanguage ? school.primaryLanguage.toLowerCase().includes(query) : false;
        if (!matchesName && !matchesSuburb && !matchesCity && !matchesProvince && !matchesCurriculum && !matchesEmis && !matchesLang) {
          return false;
        }
      }

      // Province filter
      if (selectedProvince !== 'All' && school.province !== selectedProvince) {
        return false;
      }

      // City filter
      if (selectedCity !== 'All' && school.city !== selectedCity) {
        return false;
      }

      // Curriculum filter
      if (selectedCurriculum !== 'All' && school.curriculum !== selectedCurriculum) {
        return false;
      }

      // Age Bracket filter
      if (selectedAgeBracket === 'infants' && school.minAgeMonths > 12) {
        return false;
      }
      if (selectedAgeBracket === 'toddlers' && (school.minAgeMonths > 24 || school.maxAgeMonths < 24)) {
        return false;
      }
      if (selectedAgeBracket === 'preprimary' && school.maxAgeMonths < 60) {
        return false;
      }

      // Fee filter
      if (school.monthlyFeeZAR > maxMonthlyFee) {
        return false;
      }

      // Verified toggle
      if (onlyVerified && !school.isVerified) {
        return false;
      }

      // Claimed toggle
      if (onlyClaimed && !school.isClaimed) {
        return false;
      }

      // Facilities filter
      if (selectedFacilities.length > 0) {
        const hasAllFacilities = selectedFacilities.every((fac) => school.facilities.includes(fac));
        if (!hasAllFacilities) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'fee-asc') return a.monthlyFeeZAR - b.monthlyFeeZAR;
      if (sortBy === 'fee-desc') return b.monthlyFeeZAR - a.monthlyFeeZAR;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [
    allSchoolsWithClaimed,
    searchQuery,
    selectedProvince,
    selectedCity,
    selectedCurriculum,
    selectedAgeBracket,
    maxMonthlyFee,
    onlyVerified,
    onlyClaimed,
    selectedFacilities,
    sortBy,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedProvince,
    selectedCity,
    selectedCurriculum,
    selectedAgeBracket,
    maxMonthlyFee,
    onlyVerified,
    onlyClaimed,
    selectedFacilities,
    sortBy,
  ]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredPreschools.length / ITEMS_PER_PAGE);
  const paginatedPreschools = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPreschools.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPreschools, currentPage]);

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedProvince('All');
    setSelectedCity('All');
    setSelectedCurriculum('All');
    setSelectedAgeBracket('All');
    setMaxMonthlyFee(7500);
    setSelectedFacilities([]);
    setOnlyVerified(false);
    setOnlyClaimed(false);
    setSortBy('rating');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedProvince !== 'All' ||
    selectedCity !== 'All' ||
    selectedCurriculum !== 'All' ||
    selectedAgeBracket !== 'All' ||
    maxMonthlyFee < 7500 ||
    selectedFacilities.length > 0 ||
    onlyVerified ||
    onlyClaimed;

  // Handlers for cards & modals
  const handleOpenDetail = (school: Preschool) => {
    setActiveSchool(school);
    setDetailModalOpen(true);
  };

  const handleOpenTour = (school: Preschool) => {
    setActiveSchool(school);
    setDetailModalOpen(false);
    setTourModalOpen(true);
  };

  const handleOpenInquiry = (school: Preschool) => {
    setActiveSchool(school);
    setDetailModalOpen(false);
    setInquiryModalOpen(true);
  };

  const handleOpenClaim = (school: Preschool) => {
    setActiveSchool(school);
    setDetailModalOpen(false);
    setClaimModalOpen(true);
  };

  const handleClaimSuccess = (updatedSchool: Preschool) => {
    const slug = updatedSchool.slug || updatedSchool.id;
    setClaimedSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    if (activeSchool && (activeSchool.slug === slug || activeSchool.id === slug)) {
      setActiveSchool({ ...activeSchool, isClaimed: true });
    }
  };

  // Filter Sidebar Content (shared between desktop and mobile sheet)
  const FilterControls = () => (
    <div className="space-y-6">
      {/* Province Filter */}
      <div>
        <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
          Province (South Africa)
        </label>
        <select
          value={selectedProvince}
          onChange={(e) => {
            setSelectedProvince(e.target.value as any);
            setSelectedCity('All');
          }}
          className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="All">All 9 Provinces (1,180+ Preschools)</option>
          {PROVINCES.map((p) => {
            const count = allSchoolsWithClaimed.filter((s) => s.province === p).length;
            return (
              <option key={p} value={p}>
                {p} ({count} schools)
              </option>
            );
          })}
        </select>
      </div>

      {/* City Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
            City / Suburb Hub
          </label>
          {selectedCity !== 'All' && (
            <button
              onClick={() => setSelectedCity('All')}
              className="text-[10px] text-primary hover:underline font-bold"
            >
              All Hubs
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCity('All')}
            className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg border transition-all text-left truncate ${
              selectedCity === 'All'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background hover:bg-muted text-foreground border-border'
            }`}
          >
            All Cities
          </button>
          {availableCities.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedCity(c.name)}
              className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg border transition-all text-left truncate flex items-center justify-between ${
                selectedCity === c.name
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background hover:bg-muted text-foreground border-border'
              }`}
            >
              <span className="truncate">{c.name}</span>
              <span className="text-[10px] opacity-75 ml-1">({c.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Curriculum Filter */}
      <div>
        <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
          Curriculum & Philosophy
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCurriculum('All')}
            className={`w-full text-xs font-semibold py-2 px-3 rounded-lg border transition-all flex items-center justify-between ${
              selectedCurriculum === 'All'
                ? 'bg-primary/10 text-primary border-primary/50'
                : 'bg-background hover:bg-muted text-foreground border-border'
            }`}
          >
            <span>All Curricula</span>
            {selectedCurriculum === 'All' && <Check className="w-3.5 h-3.5" />}
          </button>
          {CURRICULUMS.map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCurriculum(curr)}
              className={`w-full text-xs font-semibold py-2 px-3 rounded-lg border transition-all flex items-center justify-between ${
                selectedCurriculum === curr
                  ? 'bg-primary/10 text-primary border-primary/50'
                  : 'bg-background hover:bg-muted text-foreground border-border'
              }`}
            >
              <span>{curr}</span>
              {selectedCurriculum === curr && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Age Bracket */}
      <div>
        <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
          Child Age Bracket
        </label>
        <div className="space-y-1">
          {[
            { id: 'All', label: 'All Ages' },
            { id: 'infants', label: 'Baby / Infant (3–12 months)' },
            { id: 'toddlers', label: 'Toddler (1–3 years)' },
            { id: 'preprimary', label: 'Pre-Primary / Grade R (4–6 years)' },
          ].map((bracket) => (
            <button
              key={bracket.id}
              onClick={() => setSelectedAgeBracket(bracket.id as any)}
              className={`w-full text-xs font-medium py-2 px-3 rounded-lg border transition-all text-left flex items-center justify-between ${
                selectedAgeBracket === bracket.id
                  ? 'bg-primary/10 text-primary border-primary/50 font-bold'
                  : 'bg-background hover:bg-muted text-foreground border-border'
              }`}
            >
              <span>{bracket.label}</span>
              {selectedAgeBracket === bracket.id && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Fee Slider */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Max Monthly Tuition
          </label>
          <span className="text-xs font-extrabold text-primary tabular-nums">
            R{maxMonthlyFee.toLocaleString()} / mo
          </span>
        </div>
        <input
          type="range"
          min={3000}
          max={7500}
          step={250}
          value={maxMonthlyFee}
          onChange={(e) => setMaxMonthlyFee(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 tabular-nums">
          <span>R3,000</span>
          <span>R5,250</span>
          <span>R7,500+</span>
        </div>
      </div>

      {/* Verified & Claimed Toggles */}
      <div className="space-y-2 p-3 rounded-xl bg-background border border-border">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">Verified Accredited Only</span>
          </div>
          <input
            type="checkbox"
            checked={onlyVerified}
            onChange={(e) => setOnlyVerified(e.target.checked)}
            className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-border/60">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-foreground">Owner-Claimed Only</span>
          </div>
          <input
            type="checkbox"
            checked={onlyClaimed}
            onChange={(e) => setOnlyClaimed(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
          />
        </label>
      </div>

      {/* Facilities Checklist */}
      <div>
        <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
          Campus Facilities & Safety
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {ALL_FACILITIES.map((fac) => {
            const isChecked = selectedFacilities.includes(fac);
            return (
              <label
                key={fac}
                onClick={() => toggleFacility(fac)}
                className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                  isChecked
                    ? 'bg-accent/10 border-accent/40 text-foreground font-semibold'
                    : 'bg-background hover:bg-muted/50 border-border text-muted-foreground'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    isChecked ? 'bg-accent border-accent text-accent-foreground' : 'border-muted-foreground/40'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{fac}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="w-full text-xs font-bold rounded-xl h-10 border-dashed hover:border-destructive hover:text-destructive flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Directory Hero Banner */}
      <section className="relative w-full py-12 sm:py-16 bg-purple-blue-gradient text-white overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/35 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-yellow-300 mb-3 border border-white/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1,180+ Accredited ECD Centres · South Africa</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            Discover Verified South African Preschools
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-white/95 font-medium leading-relaxed drop-shadow-sm">
            Search 1,180+ real government-registered preschools with official EMIS numbers, curriculum matching, and direct tour scheduling across all 9 provinces.
          </p>

          {/* Quick Stats & National Benchmarks CTA Bar */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-3 max-w-3xl mx-auto">
            <Button
              onClick={() => setBenchmarksModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-bold text-xs h-9 px-4 rounded-full shadow-lg flex items-center gap-1.5"
            >
              <BarChart3 className="w-4 h-4" />
              <span>National ECD Census Benchmarks (42,420 Centres)</span>
            </Button>

            <span className="text-white/70 text-xs hidden sm:inline">|</span>

            <span className="text-xs font-medium text-white/90">
              {filteredPreschools.length} schools matching your search
            </span>
          </div>
        </div>
      </section>

      {/* Main Directory Body */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search & Filter Top Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Search Box */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by school name, EMIS #, suburb (e.g. Durbanville, Sandton), or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-border bg-card shadow-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Button & Sort Controls */}
          <div className="flex items-center gap-3 justify-between sm:justify-end">
            {/* Mobile Filter Sheet */}
            <div className="lg:hidden">
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl font-bold gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                      <span className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs overflow-y-auto p-6 bg-card border-border">
                  <SheetHeader className="mb-4 text-left">
                    <SheetTitle className="font-heading text-lg font-bold">Filter Preschools</SheetTitle>
                  </SheetHeader>
                  <FilterControls />
                </SheetContent>
              </Sheet>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden md:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 px-3 text-xs font-semibold rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              >
                <option value="rating">Top Rated (Default)</option>
                <option value="name">Alphabetical (A–Z)</option>
                <option value="reviews">Most Parent Reviews</option>
                <option value="fee-asc">Tuition: Low to High</option>
                <option value="fee-desc">Tuition: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header Status & Quick Province Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            Showing <strong className="text-foreground font-bold">
              {filteredPreschools.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredPreschools.length)}
            </strong> of{' '}
            <strong className="text-foreground font-bold">{filteredPreschools.length}</strong> verified preschools
            {selectedProvince !== 'All' && <span> in {selectedProvince}</span>}
            {selectedCity !== 'All' && <span> ({selectedCity})</span>}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setBenchmarksModalOpen(true)}
              className="text-primary hover:underline font-bold flex items-center gap-1"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>National Benchmarks</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-destructive hover:underline font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Layout Grid: Desktop Sidebar + School Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 p-5 rounded-2xl bg-card border border-border/80 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h2 className="font-heading text-sm font-bold text-foreground">Filter Directory</h2>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-destructive"
                >
                  Reset
                </button>
              )}
            </div>
            <FilterControls />
          </aside>

          {/* Preschool Cards Grid */}
          <div className="lg:col-span-3">
            {filteredPreschools.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl bg-card border border-dashed border-border/80 space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground">No Preschools Found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    We couldn't find any preschools matching your active filter criteria. Try selecting "All Provinces" or clearing keyword searches.
                  </p>
                </div>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="rounded-xl font-bold text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedPreschools.map((school) => (
                    <PreschoolCard
                      key={school.id}
                      preschool={school}
                      onSelect={handleOpenDetail}
                      onBookTour={handleOpenTour}
                      onClaim={handleOpenClaim}
                    />
                  ))}
                </div>

                {/* Pagination Bar */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80">
                    <div className="text-xs text-muted-foreground">
                      Page <strong className="text-foreground">{currentPage}</strong> of{' '}
                      <strong className="text-foreground">{totalPages}</strong> ({filteredPreschools.length} preschools)
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                        className="h-9 px-3 rounded-xl text-xs font-bold"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Prev
                      </Button>

                      {/* Dynamic page buttons */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = currentPage;
                        if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        if (pageNum < 1 || pageNum > totalPages) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 350, behavior: 'smooth' });
                            }}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                              currentPage === pageNum
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-background hover:bg-muted text-foreground border border-border'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                        className="h-9 px-3 rounded-xl text-xs font-bold"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <SchoolDetailModal
        preschool={activeSchool}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onBookTour={handleOpenTour}
        onInquire={handleOpenInquiry}
        onClaim={handleOpenClaim}
      />

      <TourBookingModal
        preschool={activeSchool}
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
      />

      <InquiryModal
        preschool={activeSchool}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />

      <ClaimDialog
        preschool={activeSchool}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onClaimSuccess={handleClaimSuccess}
      />

      <EcdBenchmarksDialog
        isOpen={benchmarksModalOpen}
        onClose={() => setBenchmarksModalOpen(false)}
      />
    </div>
  );
}
