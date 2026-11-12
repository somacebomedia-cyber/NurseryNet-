// src/app/rankings/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Award, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Users, 
  Filter, 
  Search, 
  ArrowRight,
  Sparkles,
  Trophy,
  CheckCircle2
} from 'lucide-react';

interface RankedSchool {
  rank: number;
  name: string;
  suburb: string;
  city: string;
  province: string;
  rating: number;
  reviewCount: number;
  dsdStatus: string;
  npoNumber: string;
  curriculum: string;
  monthlyFee: number;
  ratio: string;
  isVerified: boolean;
}

export default function RankingsPage() {
  const { brand } = useBrand();
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const rankedSchools: RankedSchool[] = [
    {
      rank: 1,
      name: 'Oak Tree Montessori Early Learning',
      suburb: 'Claremont',
      city: 'Cape Town',
      province: 'Western Cape',
      rating: 4.95,
      reviewCount: 48,
      dsdStatus: 'DSD Fully Registered',
      npoNumber: '049-112 NPO',
      curriculum: 'Montessori Certified',
      monthlyFee: 3200,
      ratio: '1:6 (Toddlers)',
      isVerified: true,
    },
    {
      rank: 2,
      name: 'St. Andrew Early Childhood Academy',
      suburb: 'Rosebank',
      city: 'Johannesburg',
      province: 'Gauteng',
      rating: 4.92,
      reviewCount: 62,
      dsdStatus: 'DSD Fully Registered',
      npoNumber: '032-445 NPO',
      curriculum: 'CAPS & Early Literacy',
      monthlyFee: 2850,
      ratio: '1:7',
      isVerified: true,
    },
    {
      rank: 3,
      name: 'Bambelela Educare Community Centre',
      suburb: 'Umlazi',
      city: 'eThekwini',
      province: 'KwaZulu-Natal',
      rating: 4.89,
      reviewCount: 51,
      dsdStatus: 'DSD Fully Registered',
      npoNumber: '088-721 NPO',
      curriculum: 'National Curriculum Framework (NCF)',
      monthlyFee: 450,
      ratio: '1:8 (Subsidised)',
      isVerified: true,
    },
    {
      rank: 4,
      name: 'Pretoria East Sunshine Preschool',
      suburb: 'Faerie Glen',
      city: 'City of Tshwane',
      province: 'Gauteng',
      rating: 4.87,
      reviewCount: 39,
      dsdStatus: 'DSD Fully Registered',
      npoNumber: '012-998 NPO',
      curriculum: 'Play-Based Holistic',
      monthlyFee: 2400,
      ratio: '1:6',
      isVerified: true,
    },
    {
      rank: 5,
      name: 'Durbanville Little Explorers Crèche',
      suburb: 'Durbanville',
      city: 'Cape Town',
      province: 'Western Cape',
      rating: 4.85,
      reviewCount: 34,
      dsdStatus: 'DSD Fully Registered',
      npoNumber: '065-331 NPO',
      curriculum: 'Reggio Emilia Inspired',
      monthlyFee: 2950,
      ratio: '1:6',
      isVerified: true,
    },
    {
      rank: 6,
      name: 'Siyaphambili Educare Centre',
      suburb: 'Khayelitsha',
      city: 'Cape Town',
      province: 'Western Cape',
      rating: 4.83,
      reviewCount: 42,
      dsdStatus: 'DSD Fully Registered',
      npoNumber: '071-224 NPO',
      curriculum: 'DSD Subsidised Early Learning',
      monthlyFee: 350,
      ratio: '1:8',
      isVerified: true,
    },
  ];

  const filteredSchools = rankedSchools.filter(school => {
    const matchesProvince = selectedProvince === 'All' || school.province === selectedProvince;
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          school.suburb.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          school.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvince && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 mb-3">
            <Trophy className="h-3.5 w-3.5" />
            <span>2026 South Africa ECD Quality Rankings</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Top Rated {brand} Preschools
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Evaluated by verified Department of Social Development accreditation, safe child-to-caregiver ratios, parent satisfaction, and facility audits.
          </p>
        </div>
      </section>

      {/* Filters and Leaderboard */}
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Province:</span>
              {['All', 'Gauteng', 'Western Cape', 'KwaZulu-Natal'].map((prov) => (
                <button
                  key={prov}
                  onClick={() => setSelectedProvince(prov)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    selectedProvince === prov 
                      ? 'bg-primary text-primary-foreground font-bold' 
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Filter by school name or town..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredSchools.map((school) => (
              <div 
                key={school.rank}
                className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-heading text-lg font-extrabold shrink-0 ${
                    school.rank === 1 
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' 
                      : school.rank === 2 
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200' 
                        : school.rank === 3 
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' 
                          : 'bg-muted text-muted-foreground'
                  }`}>
                    #{school.rank}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-lg font-bold text-foreground">
                        {school.name}
                      </h3>
                      {school.isVerified && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {school.suburb}, {school.city} · {school.province}
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-foreground">{school.curriculum}</span>
                      <span>·</span>
                      <span className="font-mono">{school.npoNumber}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{school.rating}</span>
                        <span className="text-muted-foreground font-normal">({school.reviewCount} reviews)</span>
                      </div>
                      <span className="text-muted-foreground">Ratio: <strong>{school.ratio}</strong></span>
                      <span className="text-muted-foreground">Fee: <strong className="font-mono text-foreground">R{school.monthlyFee}/mo</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                  <Button asChild variant="outline" size="sm" className="w-full md:w-auto">
                    <Link href={`/directory?q=${encodeURIComponent(school.name)}`}>
                      View in Directory <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center p-8 bg-muted/30 rounded-2xl border border-border">
            <h4 className="font-heading font-bold text-lg text-foreground">Is your school registered with the DSD?</h4>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Get evaluated for our verified quality rankings by claiming your listing and providing your official NPO or registration certificate.
            </p>
            <Button asChild>
              <Link href="/directory">Claim & Verify My School</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
