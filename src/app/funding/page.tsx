// src/app/funding/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
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
  HelpCircle
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

export default function FundingPage() {
  const { brand } = useBrand();
  const [qualifyingChildren, setQualifyingChildren] = useState<number>(25);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(21);
  const [searchQuery, setSearchQuery] = useState('');

  // Official SA DSD standard subsidy is R17.00 per child per operating day
  const dailySubsidyZAR = 17.00;
  const monthlySubsidy = qualifyingChildren * dailySubsidyZAR * daysPerMonth;
  const annualSubsidy = monthlySubsidy * 11; // 11-month subsidy grant cycle

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Active South African Grants & Funds
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Verified funding windows for registered non-profit and community educares.
              </p>
            </div>
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search grants or providers..."
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
