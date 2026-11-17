// src/app/funding/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import {
  buildLiveCacheKey,
  getCachedLiveSearch,
  LiveSearchResponse,
  setCachedLiveSearch,
} from '@/lib/live-search-types';
import {
  consumePendingVoiceAction,
  VOICE_ACTION_EVENT,
  VoiceAction,
} from '@/lib/voice-types';
import LiveSearchSources from '@/components/directory/LiveSearchSources';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Handshake, 
  Search, 
  Calculator, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Building2, 
  Coins, 
  ArrowRight,
  FileCheck2,
  HelpCircle,
  Globe,
  AlertCircle,
  X,
} from 'lucide-react';

interface GrantSource {
  title: string;
  provider: string;
  category: string;
  amount: string;
  eligibility: string;
  deadline: string;
  url: string;
}

const FUNDING_TOPICS = [
  'DSD Provincial Subsidies',
  'Infrastructure Grants',
  'NLC Lottery Funding',
  'Corporate CSI Funds',
];

export default function FundingPage() {
  const { brand } = useBrand();
  const [qualifyingChildren, setQualifyingChildren] = useState<number>(25);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(21);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveGrantQuery, setLiveGrantQuery] = useState('');
  const [liveGrants, setLiveGrants] = useState<LiveSearchResponse | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // Official SA DSD standard subsidy is R17.00 per child per operating day
  const dailySubsidyZAR = 17.00;
  const monthlySubsidy = qualifyingChildren * dailySubsidyZAR * daysPerMonth;
  const annualSubsidy = monthlySubsidy * 11; // 11-month subsidy grant cycle

  useEffect(() => {
    const applyFundingVoiceAction = (action: VoiceAction | null) => {
      if (!action || action.type !== 'search_funding') return;
      if (action.query) {
        setLiveGrantQuery(action.query);
      }
      if (action.liveSearchPayload) {
        setLiveError(null);
        setLiveGrants(action.liveSearchPayload);
      }
    };

    const pending = consumePendingVoiceAction();
    if (pending && pending.type === 'search_funding') {
      applyFundingVoiceAction(pending);
    }

    const onVoiceEvent = (e: Event) => {
      const custom = e as CustomEvent<VoiceAction>;
      if (custom.detail?.type === 'search_funding') {
        consumePendingVoiceAction();
        applyFundingVoiceAction(custom.detail);
      }
    };

    window.addEventListener(VOICE_ACTION_EVENT, onVoiceEvent);
    return () => window.removeEventListener(VOICE_ACTION_EVENT, onVoiceEvent);
  }, []);

  const handleSearchLiveGrants = async (topicQuery?: string, forceRefresh = false) => {
    const queryToRun = (topicQuery ?? liveGrantQuery).trim() || 'South Africa ECD preschool grants DSD subsidy';
    if (topicQuery) {
      setLiveGrantQuery(topicQuery);
    }

    setLiveError(null);
    const cacheKey = buildLiveCacheKey('funding', [queryToRun]);
    if (!forceRefresh) {
      const cached = getCachedLiveSearch(cacheKey);
      if (cached) {
        setLiveGrants(cached);
        return;
      }
    }

    setLiveLoading(true);
    try {
      const res = await fetch('/api/live-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'funding',
          query: queryToRun,
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
              : `Could not retrieve live grant calls (HTTP ${res.status}).`)
        );
        return;
      }
      if (!data) {
        setLiveError('Received an unexpected response from the server. Please click Retry.');
        return;
      }
      const typed = data as LiveSearchResponse;
      setLiveGrants(typed);
      setCachedLiveSearch(cacheKey, typed);
    } catch {
      setLiveError('Could not reach the live search service. Please check your connection and retry.');
    } finally {
      setLiveLoading(false);
    }
  };

  const grants: GrantSource[] = [
    {
      title: 'Department of Social Development ECD Daily Subsidy',
      provider: 'Provincial DSD Departments',
      category: 'Government Subsidy',
      amount: 'R17.00 per child per day',
      eligibility: 'Conditionally or Fully Registered ECD centres catering to households earning under R3,800/mo.',
      deadline: 'Annual Provincial Intake (April – June)',
      url: 'https://www.dsd.gov.za',
    },
    {
      title: 'Ilifa Labantwana ECD Infrastructure Upgrade Grants',
      provider: 'Ilifa Labantwana & Partners',
      category: 'Infrastructure & Safety',
      amount: 'R25,000 – R150,000 per centre',
      eligibility: 'Informal crèches requiring fire safety, sanitation, and physical fencing upgrades to achieve DSD compliance.',
      deadline: 'Rolling Window',
      url: 'https://ilifalabantwana.co.za',
    },
    {
      title: 'National Lottery Commission (NLC) Charities Sector Grant',
      provider: 'National Lotteries Commission',
      category: 'Capital & Equipment',
      amount: 'Up to R250,000',
      eligibility: 'Registered Non-Profit Organisations (NPOs) providing community-based early child care for over 2 years.',
      deadline: 'Quarterly Funding Windows',
      url: 'https://www.nlcsa.org.za',
    },
    {
      title: 'DG Murray Trust Innovation & Early Learning Grants',
      provider: 'DG Murray Trust',
      category: 'Pedagogy & Teacher Training',
      amount: 'Project-Specific Grants',
      eligibility: 'Community ECD hubs implementing structured early language stimulation and nutritional programs.',
      deadline: 'Bi-annual Submissions',
      url: 'https://dgmt.co.za',
    },
    {
      title: 'FirstRand Foundation Early Childhood Education Fund',
      provider: 'FirstRand CSI',
      category: 'Holistic Development',
      amount: 'R50,000 – R200,000',
      eligibility: 'Township and rural educares focused on early numeracy, nutrition security, and practitioner bursaries.',
      deadline: 'Annual Call for Proposals',
      url: 'https://www.firstrand.co.za',
    },
  ];

  const filteredGrants = grants.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
            <Coins className="h-3.5 w-3.5" />
            <span>South African Early Learning Subsidies & Grants</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            ECD Funding & Subsidies Hub
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover official Department of Social Development daily per-child subsidies, capital grants, and CSI philanthropic funding opportunities for your centre.
          </p>
        </div>
      </section>

      {/* Subsidy Calculator Section */}
      <section className="py-16 border-b border-border/40">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/60">
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-primary" /> DSD Per-Child Subsidy Calculator
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Based on the official South African DSD baseline of <span className="font-semibold text-foreground">R17.00 per qualifying child per operational day</span>.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
                Gazetted DSD Tariff
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <Label htmlFor="children">Qualifying Children (Means-tested)</Label>
                    <span className="font-bold text-primary tabular-nums">{qualifyingChildren} children</span>
                  </div>
                  <input
                    id="children"
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={qualifyingChildren}
                    onChange={(e) => setQualifyingChildren(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-muted-foreground">Children from families below means threshold</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <Label htmlFor="days">Operational Days per Month</Label>
                    <span className="font-bold text-primary tabular-nums">{daysPerMonth} days</span>
                  </div>
                  <input
                    id="days"
                    type="range"
                    min="18"
                    max="23"
                    step="1"
                    value={daysPerMonth}
                    onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-muted-foreground">Average South African preschool operational calendar</span>
                </div>
              </div>

              <div className="bg-muted/40 p-6 rounded-xl border border-border/60 text-center space-y-3">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Potential Government Grant Funding</span>
                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tabular-nums">
                  R{monthlySubsidy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-sm font-normal text-muted-foreground"> / month</span>
                </div>
                <div className="text-xs text-emerald-600 font-semibold font-mono">
                  Up to R{annualSubsidy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ZAR annually
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
                  Subsidies must be allocated: 50% towards child nutrition & meals, 30% towards practitioner stipends, and 20% for learning materials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grant Directory */}
      <section className="py-16">
        <div className="container mx-auto max-w-5xl px-4">
          {/* Live Google Search ECD Grant Finder */}
          <div className="mb-12 p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Live SA Grant &amp; DSD Call Finder</span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Query Google Search for current South African ECD funding windows, provincial DSD tenders, and NLC deadlines.
                </p>
              </div>
              {liveGrants && (
                <button
                  type="button"
                  onClick={() => {
                    setLiveGrants(null);
                    setLiveError(null);
                  }}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 self-start sm:self-center"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Live Results</span>
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchLiveGrants(undefined, false);
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  placeholder="e.g. Gauteng DSD ECD subsidy 2026, NLC charities grant, municipal crèche upgrade..."
                  value={liveGrantQuery}
                  onChange={(e) => setLiveGrantQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <Button
                type="submit"
                disabled={liveLoading}
                className="h-10 px-5 font-bold text-xs whitespace-nowrap shrink-0"
              >
                <Globe className="w-4 h-4 mr-1.5" />
                <span>{liveLoading ? 'Searching Live Web...' : 'Search Live Grants'}</span>
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Quick topics:</span>
              {FUNDING_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  disabled={liveLoading}
                  onClick={() => handleSearchLiveGrants(topic, false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors whitespace-nowrap shrink-0"
                >
                  {topic}
                </button>
              ))}
            </div>

            {liveLoading && (
              <div className="space-y-3 pt-3 border-t border-border/60 animate-pulse">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-24 bg-muted rounded-xl" />
                <div className="h-24 bg-muted rounded-xl" />
              </div>
            )}

            {liveError && !liveLoading && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-between gap-3 text-xs text-destructive">
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{liveError}</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearchLiveGrants(undefined, true)}
                  className="h-8 px-3 text-xs font-semibold shrink-0"
                >
                  Retry
                </Button>
              </div>
            )}

            {liveGrants && !liveLoading && !liveError && (
              <div className="pt-4 border-t border-border/60 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                    {liveGrants.summary}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearchLiveGrants(liveGrants.query, true)}
                    className="h-8 px-3 text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    Refresh
                  </Button>
                </div>

                {liveGrants.highlights.length > 0 && (
                  <div className="space-y-3">
                    {liveGrants.highlights.map((grant, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-background border border-border/80 space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h3 className="font-heading text-base font-bold text-foreground">
                              {grant.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {grant.subtitle}
                            </p>
                          </div>
                          {grant.websiteUrl && (
                            <Button asChild size="sm" variant="outline" className="h-8 text-xs whitespace-nowrap shrink-0 self-start">
                              <a href={grant.websiteUrl} target="_blank" rel="noopener noreferrer">
                                Official Portal <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
                          {grant.feeOrAmount && (
                            <span>
                              Amount: <strong className="text-emerald-600">{grant.feeOrAmount}</strong>
                            </span>
                          )}
                          {grant.feeOrAmount && grant.hoursOrDeadline && (
                            <span aria-hidden="true" className="text-muted-foreground/40">
                              ·
                            </span>
                          )}
                          {grant.hoursOrDeadline && (
                            <span>
                              Window: <strong className="text-foreground">{grant.hoursOrDeadline}</strong>
                            </span>
                          )}
                        </div>

                        {grant.reviewsSummary && (
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Eligibility: </strong>
                            {grant.reviewsSummary}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {grant.details}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <LiveSearchSources sources={liveGrants.sources} searchedAt={liveGrants.searchedAt} />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Baseline South African Grants & Funds
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Verified funding windows for registered non-profit and community educares.
              </p>
            </div>
            <div className="w-full sm:w-72">
              <Input
                placeholder="Filter baseline grants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredGrants.map((grant, idx) => (
              <Card key={idx} className="border border-border/80 hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      {grant.category}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      Deadline: <strong>{grant.deadline}</strong>
                    </span>
                  </div>
                  <CardTitle className="font-heading text-lg font-bold text-foreground">
                    {grant.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Administered by <strong>{grant.provider}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <strong className="text-foreground">Funding Amount:</strong>
                    <span className="font-mono font-bold text-emerald-600">{grant.amount}</span>
                  </div>
                  <p className="text-muted-foreground">
                    <strong>Eligibility:</strong> {grant.eligibility}
                  </p>
                </CardContent>
                <CardFooter className="pt-2 border-t border-border/40 flex justify-between items-center">
                  <span className="text-[11px] text-muted-foreground">South African registered NPO/DSD required</span>
                  <Button asChild size="sm" variant="outline">
                    <a href={grant.url} target="_blank" rel="noopener noreferrer">
                      Official Portal <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Need Help Box */}
          <div className="mt-12 p-6 bg-muted/30 rounded-2xl border border-border text-center space-y-3">
            <h4 className="font-heading font-bold text-base text-foreground">Need help compiling your DSD subsidy documentation?</h4>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              Our free School Growth Kit includes attendance register templates, health consent forms, and registration guidance required by provincial inspectors.
            </p>
            <Button asChild>
              <Link href="/preschools/growth-kit">Download Free Compliance Kit</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
