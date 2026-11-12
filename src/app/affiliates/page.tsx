// src/app/affiliates/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Coins, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function AffiliatesPage() {
  const { brand } = useBrand();
  const [schoolsReferred, setSchoolsReferred] = useState<number>(15);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // 20% recurring commission on R349 Verified plan = R69.80 / school / month
  const monthlyEarnings = Math.round(schoolsReferred * 349 * 0.20);
  const annualEarnings = monthlyEarnings * 12;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setPartnerName('');
      setPartnerEmail('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 mb-3">
            <Coins className="h-3.5 w-3.5" />
            <span>Education Consultant & Partner Program</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            {brand} Partner & Affiliate Program
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Earn 20% recurring monthly commissions by introducing crèches, educares, and preschools to South Africa&apos;s leading school directory.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Calculator */}
            <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Affiliate Earnings Calculator
              </h2>
              <p className="text-xs text-muted-foreground">
                Calculate your monthly passive income based on active verified school subscriptions.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <Label htmlFor="schools">Preschools Referred & Subscribed</Label>
                  <span className="font-heading font-bold text-lg text-primary tabular-nums">
                    {schoolsReferred} centres
                  </span>
                </div>
                <input
                  id="schools"
                  type="range"
                  min="2"
                  max="100"
                  step="1"
                  value={schoolsReferred}
                  onChange={(e) => setSchoolsReferred(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>2 schools</span>
                  <span>100 schools</span>
                </div>
              </div>

              <div className="p-5 bg-muted/40 rounded-xl border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Estimated Monthly Payout</span>
                  <div className="font-heading text-3xl font-extrabold text-foreground font-mono tabular-nums mt-0.5">
                    R{monthlyEarnings.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ month</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Annual Projected</span>
                  <div className="font-heading text-xl font-bold text-emerald-600 font-mono tabular-nums mt-0.5">
                    R{annualEarnings.toLocaleString()} ZAR
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Direct monthly EFT payout to any South African bank account.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Recurring commission paid for the entire lifetime of the school subscription.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Dedicated referral links and printable brochures provided.</span>
                </div>
              </div>
            </div>

            {/* Signup Form */}
            <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="font-heading text-lg font-bold text-foreground">Apply to Become a Partner</h3>
              <p className="text-xs text-muted-foreground">
                Ideal for ECD trainers, educational book distributors, and NPO coordinators.
              </p>

              {submitted ? (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950 rounded-xl border border-emerald-300 text-center space-y-2 text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-600" />
                  <h4 className="font-bold">Application Received!</h4>
                  <p className="text-xs">We will email your referral tracking link within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleJoin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="pName" className="text-xs">Your Name / Organization</Label>
                    <Input
                      id="pName"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Sipho Sithole (ECD Consultant)"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pEmail" className="text-xs">Email Address</Label>
                    <Input
                      id="pEmail"
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      placeholder="sipho@consulting.co.za"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pRegion" className="text-xs">Province / Region</Label>
                    <Input
                      id="pRegion"
                      placeholder="e.g. Gauteng / City of Tshwane"
                    />
                  </div>

                  <Button type="submit" className="w-full font-semibold">
                    <Send className="mr-2 h-4 w-4" /> Submit Partner Application
                  </Button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
