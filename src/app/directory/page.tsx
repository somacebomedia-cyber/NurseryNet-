"use client";

import { useState, useMemo } from 'react';
import {
  PRESCHOOLS,
  CITIES,
  CURRICULUMS,
  ALL_FACILITIES,
  City,
  Curriculum,
  Preschool,
} from '@/data/preschools';
import PreschoolCard from '@/components/directory/PreschoolCard';
import SchoolDetailModal from '@/components/directory/SchoolDetailModal';
import TourBookingModal from '@/components/directory/TourBookingModal';
import InquiryModal from '@/components/directory/InquiryModal';
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
  GraduationCap,
  Calendar,
  Building2,
  ChevronDown
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function DirectoryPage() {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | 'All'>('All');
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | 'All'>('All');
  const [selectedAgeBracket, setSelectedAgeBracket] = useState<'All' | 'infants' | 'toddlers' | 'preprimary'>('All');
  const [maxMonthlyFee, setMaxMonthlyFee] = useState<number>(7500);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'fee-asc' | 'fee-desc' | 'reviews'>('rating');

  // Modal States
  const [activeSchool, setActiveSchool] = useState<Preschool | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter Logic
  const filteredPreschools = useMemo(() => {
    return PRESCHOOLS.filter((school) => {
      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = school.name.toLowerCase().includes(query);
        const matchesSuburb = school.suburb.toLowerCase().includes(query);
        const matchesCity = school.city.toLowerCase().includes(query);
        const matchesCurriculum = school.curriculum.toLowerCase().includes(query);
        const matchesTagline = school.tagline.toLowerCase().includes(query);
        if (!matchesName && !matchesSuburb && !matchesCity && !matchesCurriculum && !matchesTagline) {
          return false;
        }
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
      return 0;
    });
  }, [
    searchQuery,
    selectedCity,
    selectedCurriculum,
    selectedAgeBracket,
    maxMonthlyFee,
    onlyVerified,
    selectedFacilities,
    sortBy,
  ]);

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCity('All');
    setSelectedCurriculum('All');
    setSelectedAgeBracket('All');
    setMaxMonthlyFee(7500);
    setSelectedFacilities([]);
    setOnlyVerified(false);
    setSortBy('rating');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCity !== 'All' ||
    selectedCurriculum !== 'All' ||
    selectedAgeBracket !== 'All' ||
    maxMonthlyFee < 7500 ||
    selectedFacilities.length > 0 ||
    onlyVerified;

  // Handlers for cards
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

  // Filter Sidebar Content (shared between desktop and mobile sheet)
  const FilterControls = () => (
    <div className="space-y-6">
      {/* City Filter */}
      <div>
        <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2.5">
          City / Metropolitan Region
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setSelectedCity('All')}
            className={`text-xs font-semibold py-2 px-3 rounded-lg border transition-all text-left ${
              selectedCity === 'All'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background hover:bg-muted text-foreground border-border'
            }`}
          >
            All Cities
          </button>
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`text-xs font-semibold py-2 px-3 rounded-lg border transition-all text-left truncate ${
                selectedCity === c
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background hover:bg-muted text-foreground border-border'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Curriculum Filter */}
      <div>
        <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2.5">
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
        <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2.5">
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
          min={3800}
          max={7500}
          step={200}
          value={maxMonthlyFee}
          onChange={(e) => setMaxMonthlyFee(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 tabular-nums">
          <span>R3,800</span>
          <span>R5,500</span>
          <span>R7,500+</span>
        </div>
      </div>

      {/* Verified Only Toggle */}
      <div className="p-3 rounded-xl bg-background border border-border">
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
      </div>

      {/* Facilities Checklist */}
      <div>
        <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2.5">
          Campus Facilities & Services
        </label>
        <div className="space-y-1.5">
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
      <section className="relative w-full py-14 sm:py-20 bg-purple-blue-gradient text-white overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/30 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-yellow-300 mb-4 border border-white/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Accredited Early Childhood Directory · South Africa</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            Discover & Tour South Africa's Premier Preschools
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-lg text-white/95 font-medium leading-relaxed drop-shadow-sm">
            Search verified crèches, nursery schools and pre-primary academies across Johannesburg, Cape Town, Durban, and Pretoria.
          </p>

          {/* Quick City Filter Bar */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-2 max-w-3xl mx-auto">
            <button
              onClick={() => setSelectedCity('All')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md ${
                selectedCity === 'All'
                  ? 'bg-yellow-300 text-purple-950 scale-105 shadow-lg'
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30'
              }`}
            >
              All Hubs ({PRESCHOOLS.length})
            </button>
            {CITIES.map((c) => {
              const count = PRESCHOOLS.filter((s) => s.city === c).length;
              const isSelected = selectedCity === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-yellow-300 text-purple-950 scale-105 shadow-lg'
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{c}</span>
                  <span className="opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Directory Body */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search & Mobile Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Search Box */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by preschool name, suburb (e.g. Sandton, Camps Bay, Umhlanga), or curriculum..."
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
                <option value="reviews">Most Parent Reviews</option>
                <option value="fee-asc">Tuition: Low to High</option>
                <option value="fee-desc">Tuition: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-border/60 text-xs text-muted-foreground">
          <div>
            Showing <strong className="text-foreground font-bold">{filteredPreschools.length}</strong> of{' '}
            {PRESCHOOLS.length} verified preschools
            {selectedCity !== 'All' && <span> in {selectedCity}</span>}
            {selectedCurriculum !== 'All' && <span> ({selectedCurriculum})</span>}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-primary hover:underline font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear active filters
            </button>
          )}
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
                    We couldn't find any preschools matching your active filter criteria. Try clearing some filters or searching a different suburb.
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPreschools.map((school) => (
                  <PreschoolCard
                    key={school.id}
                    preschool={school}
                    onSelect={handleOpenDetail}
                    onBookTour={handleOpenTour}
                  />
                ))}
              </div>
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
    </div>
  );
}
