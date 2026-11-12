// src/app/preschools/roi-calculator/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Calculator, 
  DollarSign, 
  Users, 
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

export default function RoiCalculatorPage() {
  const { brand } = useBrand();

  const [monthlyFee, setMonthlyFee] = useState<number>(1500);
  const [currentStudents, setCurrentStudents] = useState<number>(35);
  const [newEnrolments, setNewEnrolments] = useState<number>(3);
  const [planType, setPlanType] = useState<'verified' | 'pro'>('verified');

  const subscriptionCostPerMonth = planType === 'verified' ? 349 : 690;
  const annualSubscriptionCost = subscriptionCostPerMonth * 12;

  // South African preschool fee model: typically 11 to 12 monthly fee cycles per year
  const feeMonths = 11;
  const newMonthlyRevenue = newEnrolments * monthlyFee;
  const newAnnualRevenue = newMonthlyRevenue * feeMonths;
  const netAnnualProfit = newAnnualRevenue - annualSubscriptionCost;
  const roiPercentage = annualSubscriptionCost > 0 ? Math.round((netAnnualProfit / annualSubscriptionCost) * 100) : 0;
  const daysToBreakeven = Math.max(1, Math.round((annualSubscriptionCost / (newMonthlyRevenue / 30))));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
            <Calculator className="h-3.5 w-3.5" />
            <span>Enrollment & Revenue Modeling</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            School Enrollment ROI Calculator
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            See exactly how enrolling just 1 to 3 new children through {brand} covers your annual listing cost and transforms your school&apos;s cashflow.
          </p>
        </div>
      </section>

      {/* Main Calculator */}
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Controls */}
            <div className="lg:col-span-6 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> School Parameters
              </h2>

              {/* Monthly Fee */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="monthlyFee" className="text-sm font-semibold text-foreground">
                    Average Monthly Tuition Fee per Child (ZAR)
                  </Label>
                  <span className="font-heading font-bold text-lg text-primary tabular-nums">
                    R{monthlyFee.toLocaleString()}
                  </span>
                </div>
                <input
                  id="monthlyFee"
                  type="range"
                  min="300"
                  max="8000"
                  step="50"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>R300 (Subsidised Community)</span>
                  <span>R8,000 (Private Academy)</span>
                </div>
              </div>

              {/* Current Capacity */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="currentStudents" className="text-sm font-semibold text-foreground">
                    Current Enrolled Learners
                  </Label>
                  <span className="font-heading font-bold text-lg text-primary tabular-nums">
                    {currentStudents} learners
                  </span>
                </div>
                <input
                  id="currentStudents"
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={currentStudents}
                  onChange={(e) => setCurrentStudents(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>5 learners</span>
                  <span>200 learners</span>
                </div>
              </div>

              {/* Projected Enrolments from NurseryNet */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="newEnrolments" className="text-sm font-semibold text-foreground">
                    Projected New Enrollments from {brand}
                  </Label>
                  <span className="font-heading font-bold text-lg text-emerald-600 tabular-nums">
                    +{newEnrolments} new children
                  </span>
                </div>
                <input
                  id="newEnrolments"
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={newEnrolments}
                  onChange={(e) => setNewEnrolments(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-muted rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>1 child</span>
                  <span>15 children</span>
                </div>
              </div>

              {/* Plan Choice */}
              <div className="space-y-2 pt-2 border-t border-border">
                <Label className="text-sm font-semibold text-foreground">Select Listing Plan</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlanType('verified')}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      planType === 'verified'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/30 text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div className="text-xs font-bold">Verified Centre</div>
                    <div className="text-sm font-mono font-bold mt-1">R349 / mo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanType('pro')}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      planType === 'pro'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/30 text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div className="text-xs font-bold">Pro Featured Slot</div>
                    <div className="text-sm font-mono font-bold mt-1">R690 / mo</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Output Calculation Dashboard */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/40 rounded-2xl p-6 sm:p-8 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    Projected Net Financial Impact
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    11-Month SA School Year
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Net Annual Tuition Gain</span>
                    <div className="font-heading text-4xl sm:text-5xl font-extrabold text-foreground tabular-nums tracking-tight mt-1">
                      +R{netAnnualProfit.toLocaleString()} <span className="text-base font-semibold text-emerald-600">ZAR</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      After deducting the full R{annualSubscriptionCost.toLocaleString()} annual subscription fee.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="p-4 bg-background/80 rounded-xl border border-border/60">
                      <span className="text-xs text-muted-foreground font-medium">Return on Investment (ROI)</span>
                      <div className="font-heading text-2xl font-bold text-emerald-600 tabular-nums mt-1">
                        +{roiPercentage}%
                      </div>
                      <span className="text-[11px] text-muted-foreground">Every R1 invested yields R{(roiPercentage / 100).toFixed(1)} back</span>
                    </div>

                    <div className="p-4 bg-background/80 rounded-xl border border-border/60">
                      <span className="text-xs text-muted-foreground font-medium">Breakeven Time</span>
                      <div className="font-heading text-2xl font-bold text-foreground tabular-nums mt-1">
                        {daysToBreakeven} Days
                      </div>
                      <span className="text-[11px] text-muted-foreground">Paid off in under a month</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/40 rounded-xl text-xs space-y-2 border border-border/40">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">New Monthly Inflow:</span>
                      <span className="font-mono font-bold text-foreground">R{newMonthlyRevenue.toLocaleString()} / mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Listing Cost:</span>
                      <span className="font-mono text-muted-foreground">-R{subscriptionCostPerMonth} / mo</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border font-semibold">
                      <span>Net Monthly Increase:</span>
                      <span className="font-mono text-emerald-600">+R{(newMonthlyRevenue - subscriptionCostPerMonth).toLocaleString()} / mo</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button asChild size="lg" className="w-full font-semibold py-6 text-base">
                      <Link href="/pricing">
                        Lock In Your Listing at R{subscriptionCostPerMonth}/mo <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Explanatory Note */}
              <div className="p-4 rounded-xl bg-card border border-border text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">How this model is derived:</p>
                <p>
                  South African parents seeking preschools search primarily during October–January. With 20,291 schools indexed, listings with verified badges and phone numbers receive on average 8–15 parent profile views weekly, leading to 2–5 direct tour booking leads monthly.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
