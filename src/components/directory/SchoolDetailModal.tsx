"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Preschool, ECD_BENCHMARKS, getMunicipalityBenchmark } from '@/data/preschools';
import {
  buildLiveCacheKey,
  getCachedLiveSearch,
  LiveSearchResponse,
  setCachedLiveSearch,
} from '@/lib/live-search-types';
import LiveSearchSources from '@/components/directory/LiveSearchSources';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Star,
  MapPin,
  ShieldCheck,
  BadgeCheck,
  Clock,
  Users,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
  ExternalLink,
  Languages,
  Building,
  BarChart3,
  Lock,
  TreePine,
  Droplets,
  AlertCircle,
  Globe,
  RefreshCw,
  Heart,
  FileText,
} from 'lucide-react';

interface SchoolDetailModalProps {
  preschool: Preschool | null;
  isOpen: boolean;
  onClose: () => void;
  onBookTour: (preschool: Preschool) => void;
  onInquire: (preschool: Preschool) => void;
  onApply?: (preschool: Preschool) => void;
  onClaim?: (preschool: Preschool) => void;
  isSaved?: boolean;
  onToggleSave?: (preschool: Preschool) => void;
}

export default function SchoolDetailModal({
  preschool,
  isOpen,
  onClose,
  onBookTour,
  onInquire,
  onApply,
  onClaim,
  isSaved = false,
  onToggleSave,
}: SchoolDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [liveData, setLiveData] = useState<LiveSearchResponse | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const schoolId = preschool?.id || '';
  const schoolName = preschool?.name || '';
  const schoolMunicipality = preschool?.municipality || preschool?.city || preschool?.suburb || '';
  const schoolProvince = preschool?.province || '';
  const schoolNpo = preschool?.npoNumber || null;

  useEffect(() => {
    setActiveImageIndex(0);
    setLiveError(null);
    if (!schoolId && !schoolName) {
      setLiveData(null);
      return;
    }
    const cacheKey = buildLiveCacheKey('school', [schoolId || schoolName, schoolMunicipality]);
    const cached = getCachedLiveSearch(cacheKey);
    setLiveData(cached);
  }, [schoolId, schoolName, schoolMunicipality]);

  if (!preschool) return null;

  const handleRunLiveVerification = async () => {
    setLiveLoading(true);
    setLiveError(null);
    try {
      const res = await fetch('/api/live-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'school',
          schoolName,
          municipality: schoolMunicipality,
          province: schoolProvince,
          npoNumber: schoolNpo,
        }),
      });
      const raw = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
      if (!res.ok) {
        setLiveError(
          data?.error ||
            (res.status >= 500
              ? 'The server is still starting up. Please wait a moment and click Retry.'
              : `Could not fetch live web details (HTTP ${res.status}).`)
        );
        return;
      }
      if (!data) {
        setLiveError('Received an unexpected response from the server. Please click Retry.');
        return;
      }
      setLiveData(data as LiveSearchResponse);
      const cacheKey = buildLiveCacheKey('school', [schoolId || schoolName, schoolMunicipality]);
      setCachedLiveSearch(cacheKey, data as LiveSearchResponse);
    } catch {
      setLiveError('Could not reach the live search service. Please check your connection and retry.');
    } finally {
      setLiveLoading(false);
    }
  };

  const images = preschool.images && preschool.images.length > 0
    ? preschool.images
    : ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80'];

  const muniStats = getMunicipalityBenchmark(preschool.municipality || preschool.city || preschool.district);
  const hasFencing = preschool.facilities.some(f => f.toLowerCase().includes('fence') || f.toLowerCase().includes('security'));
  const hasGate = preschool.facilities.some(f => f.toLowerCase().includes('gate') || f.toLowerCase().includes('security'));
  const hasWater = true; // In South Africa verified registered schools meet sanitation standards
  const hasPlayground = preschool.facilities.some(f => f.toLowerCase().includes('playground') || f.toLowerCase().includes('garden') || f.toLowerCase().includes('sports'));

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl bg-card border-border">
        {/* Header Photo Gallery */}
        <div className="relative w-full h-72 sm:h-80 bg-muted">
          <Image
            src={images[activeImageIndex] || images[0]}
            alt={preschool.name}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

          {/* Badges on Hero Image */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            {preschool.isClaimed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md">
                <BadgeCheck className="w-4 h-4" />
                Owner-Claimed & Verified
              </span>
            ) : preschool.dsdRegistration === 'Full' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
                <ShieldCheck className="w-4 h-4" />
                DSD Registered
              </span>
            ) : preschool.dsdRegistration === 'Conditional' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-md">
                <ShieldCheck className="w-4 h-4" />
                DSD Conditional
              </span>
            ) : preschool.isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-primary backdrop-blur-md shadow-md">
                <ShieldCheck className="w-4 h-4 text-primary fill-primary/20" />
                Audit Verified
              </span>
            ) : null}

            {preschool.npoNumber && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/60 text-white/95 backdrop-blur-md">
                NPO #{preschool.npoNumber}
              </span>
            )}

            {preschool.isSubsidised && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-600 text-white shadow-md">
                DSD Subsidised
              </span>
            )}

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-md">
              {preschool.curriculum}
            </span>
          </div>

          {/* Multi-Photo Switcher Dots */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 flex gap-1.5 bg-black/50 backdrop-blur-md p-1.5 rounded-full z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === activeImageIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Bottom Title Scrim */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold drop-shadow-md">
              {preschool.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-white/90 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-accent" />
                {preschool.address}
              </span>
              <span className="flex items-center gap-1 text-yellow-300 font-bold">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {preschool.rating.toFixed(1)} ({preschool.reviewCount} parent reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-6">
          {/* Action Strip: Price & Booking */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Tuition & Enrollment
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-foreground tabular-nums">
                  R{preschool.monthlyFeeZAR.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">/ month</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ml-2">
                  {preschool.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {onToggleSave && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onToggleSave(preschool)}
                  className={`text-xs font-bold h-11 px-3.5 rounded-xl whitespace-nowrap shrink-0 ${
                    isSaved
                      ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'border-border text-foreground'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-1.5 ${isSaved ? 'fill-current text-rose-500' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              )}

              {/* Claim or Edit Listing button */}
              {onClaim && (
                <Button
                  variant="outline"
                  onClick={() => onClaim(preschool)}
                  className="text-xs font-bold h-11 px-3.5 rounded-xl border-primary/40 text-primary hover:bg-primary/10 whitespace-nowrap shrink-0"
                >
                  <BadgeCheck className="w-4 h-4 mr-1.5" />
                  {preschool.isClaimed ? 'Edit Listing / Fix Name' : 'Claim School'}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => onInquire(preschool)}
                className="flex-1 sm:flex-initial text-sm font-semibold h-11 px-4 rounded-xl whitespace-nowrap"
              >
                <Mail className="w-4 h-4 mr-1.5" />
                Inquire
              </Button>

              <Button
                variant="outline"
                onClick={() => onBookTour(preschool)}
                className="flex-1 sm:flex-initial text-sm font-bold h-11 px-4 rounded-xl border-accent text-accent hover:bg-accent/10 whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 mr-1.5" />
                Book Tour
              </Button>

              {onApply && (
                <Button
                  onClick={() => onApply(preschool)}
                  className="flex-1 sm:flex-initial text-sm font-bold h-11 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg whitespace-nowrap"
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  Apply Online
                </Button>
              )}
            </div>
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted-foreground block">Age Range</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">{preschool.ageRange}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted-foreground block">Caregiver Ratio</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">{preschool.teacherRatio} Ratio</span>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted-foreground block">Instruction Language</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block truncate">
                {preschool.primaryLanguage || 'English'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted-foreground block">Operating Hours</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block truncate">{preschool.operatingHours}</span>
            </div>
          </div>

          {/* Department of Social Development (DSD) Registration & NPO Accreditation Card */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h4 className="font-heading text-sm font-bold text-foreground">
                  Department of Social Development (DSD) & NPO Accreditation
                </h4>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                preschool.dsdRegistration === 'Full'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : preschool.dsdRegistration === 'Conditional'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {preschool.dsdRegistration === 'Full' ? 'DSD Fully Registered' : preschool.dsdRegistration === 'Conditional' ? 'Conditional DSD' : 'Audit Sourced / In Process'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">DSD Status</span>
                <span className="font-semibold text-foreground">
                  {preschool.dsdRegistration || (preschool.isVerified ? 'Fully Registered' : 'Not Registered')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">NPO Registration</span>
                <span className="font-mono font-bold text-foreground">
                  {preschool.npoNumber ? `NPO #${preschool.npoNumber}` : 'Community Crèche'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">State ECD Subsidy</span>
                <span className="font-semibold text-foreground">
                  {preschool.isSubsidised ? 'DSD Subsidised' : 'Private / Fee-funded'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Municipality</span>
                <span className="font-semibold text-foreground truncate block">
                  {preschool.municipality || preschool.district || preschool.city}
                </span>
              </div>
            </div>
          </div>

          {/* National & Municipal ECD Census 2021 Benchmark Comparison */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-heading text-sm font-bold text-foreground">
                    ECD Census 2021 Benchmarks: {muniStats.name || preschool.municipality || preschool.city}
                  </h4>
                  <span className="text-[10px] text-muted-foreground">
                    Official Census covering {muniStats.centres ? `${muniStats.centres} centres in this municipality` : '42,420 centres nationwide'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-primary font-bold px-2 py-0.5 rounded bg-primary/10">
                DBE/DSD Census Data
              </span>
            </div>

            {/* Monthly Fee Comparison Bar */}
            <div className="p-3 rounded-lg bg-background border border-border/80">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-muted-foreground font-medium">Monthly Fee Comparison:</span>
                <div className="flex items-center gap-2 font-mono">
                  <span>This School: <strong className="text-foreground">R{preschool.monthlyFeeZAR.toLocaleString()}</strong></span>
                  <span className="text-muted-foreground">·</span>
                  <span>Muni Median: <strong className="text-primary">R{Math.round(muniStats.medianMonthlyFee || 300).toLocaleString()}</strong></span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden flex">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min(100, Math.max(15, ((muniStats.medianMonthlyFee || 300) / Math.max(preschool.monthlyFeeZAR, muniStats.medianMonthlyFee || 300)) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">
                {preschool.monthlyFeeZAR > (muniStats.medianMonthlyFee || 300)
                  ? `School tuition reflects premium private facilities above local municipal median (R${Math.round(muniStats.medianMonthlyFee || 300)}/mo).`
                  : `School tuition is at or below local municipal median (R${Math.round(muniStats.medianMonthlyFee || 300)}/mo), expanding community affordability.`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-background border border-border/80 text-center">
                <span className="text-sm font-extrabold text-foreground block tabular-nums">
                  {muniStats.dsdRegisteredPct || 38.2}%
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Muni DSD Registered
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border border-border/80 text-center">
                <span className="text-sm font-extrabold text-foreground block tabular-nums">
                  {muniStats.subsidyPct || 30.2}%
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Muni Subsidised
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border border-border/80 text-center">
                <span className="text-sm font-extrabold text-foreground block tabular-nums">
                  {muniStats.mealsPct || 94.1}%
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Daily Meals Served
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border border-border/80 text-center">
                <span className="text-sm font-extrabold text-foreground block tabular-nums">
                  {muniStats.fencedPct || 88.6}%
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Secure Fenced
                </span>
              </div>
            </div>
          </div>

          {/* Live Google Search Verification Section */}
          <div className="p-4 rounded-xl bg-background border border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span>Live Web Verification</span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Check Google Search for current tuition fees, operating hours, official website, and parent reviews.
                </p>
              </div>
              <Button
                type="button"
                variant={liveData ? 'outline' : 'default'}
                size="sm"
                disabled={liveLoading}
                onClick={handleRunLiveVerification}
                className="whitespace-nowrap shrink-0 h-9 px-4 text-xs font-bold rounded-lg"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${liveLoading ? 'animate-spin' : ''}`} />
                <span>{liveLoading ? 'Checking Web...' : liveData ? 'Refresh Live Info' : 'Check Live Web Details'}</span>
              </Button>
            </div>

            {liveLoading && (
              <div className="space-y-2 pt-2 border-t border-border/60 animate-pulse">
                <div className="h-3.5 bg-muted rounded w-3/4" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="h-14 bg-muted rounded-lg" />
                  <div className="h-14 bg-muted rounded-lg" />
                  <div className="h-14 bg-muted rounded-lg" />
                </div>
              </div>
            )}

            {liveError && !liveLoading && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center justify-between gap-3 text-xs text-destructive">
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{liveError}</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRunLiveVerification}
                  className="h-7 px-3 text-xs font-semibold shrink-0"
                >
                  Retry
                </Button>
              </div>
            )}

            {liveData && !liveLoading && (
              <div className="pt-3 border-t border-border/60 space-y-3">
                <p className="text-xs text-foreground leading-relaxed">
                  {liveData.summary}
                </p>

                {liveData.highlights.length > 0 && (
                  <div className="space-y-2.5">
                    {liveData.highlights.map((item, idx) => (
                      <div key={idx} className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                            <span className="text-[11px] text-muted-foreground block">Published Fees</span>
                            <span className="font-semibold text-foreground tabular-nums mt-0.5 block">
                              {item.feeOrAmount || 'Not published online'}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                            <span className="text-[11px] text-muted-foreground block">Operating Hours</span>
                            <span className="font-semibold text-foreground tabular-nums mt-0.5 block">
                              {item.hoursOrDeadline || 'Not published online'}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                            <span className="text-[11px] text-muted-foreground block">Web Presence</span>
                            {item.websiteUrl ? (
                              <a
                                href={item.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline mt-0.5 max-w-full truncate"
                              >
                                <span className="truncate">Visit Website</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="font-medium text-muted-foreground mt-0.5 block">
                                No standalone site listed
                              </span>
                            )}
                          </div>
                        </div>

                        {item.reviewsSummary && (
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">Web Reviews & Reputation: </strong>
                            {item.reviewsSummary}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <LiveSearchSources sources={liveData.sources} searchedAt={liveData.searchedAt} />
              </div>
            )}
          </div>

          {/* About School */}
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">About Our School</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {preschool.description}
            </p>
          </div>

          {/* Facilities & Amenities */}
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-3">Campus Facilities & Services</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {preschool.facilities.map((fac, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-foreground p-2 rounded-lg bg-muted/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Parent Reviews Section */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">Verified Parent Reviews</h3>
                <p className="text-xs text-muted-foreground">Feedback from registered South African parents</p>
              </div>
              <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-bold">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>{preschool.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            <div className="space-y-3">
              {preschool.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-background border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">{rev.author}</span>
                        <span className="text-[11px] text-muted-foreground">{rev.childAge} · {rev.date}</span>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground/90 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Verified Contact Bar */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              {preschool.phone ? (
                <a
                  href={`tel:${preschool.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {preschool.phone}</span>
                </a>
              ) : (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Contact on file with DSD</span>
                </div>
              )}

              {preschool.email && (
                <a
                  href={`mailto:${preschool.email}?subject=Enrollment%20Inquiry%20-%20NurseryNet`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Centre</span>
                </a>
              )}

              {preschool.websiteUrl && (
                <a
                  href={preschool.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground hover:border-primary transition-colors font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Official Website</span>
                </a>
              )}
            </div>

            {preschool.latitude && preschool.longitude ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${preschool.latitude},${preschool.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-primary hover:underline font-bold"
              >
                <MapPin className="w-4 h-4" />
                <span>View on Map ({preschool.latitude.toFixed(3)}, {preschool.longitude.toFixed(3)})</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{preschool.suburb}, {preschool.city}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
