// src/app/preschools/profile-preview/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  ArrowRight, 
  Sparkles,
  Camera,
  MapPin,
  Clock
} from 'lucide-react';

export default function ProfilePreviewPage() {
  const { brand } = useBrand();
  const [activeTab, setActiveTab] = useState<'compare' | 'verified' | 'unclaimed'>('compare');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
            <Eye className="h-3.5 w-3.5" />
            <span>Listing Visibility Comparison</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Unclaimed vs Verified School Profile
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover why verified schools receive 4.5x more parent tour inquiries and enrollment bookings across South Africa.
          </p>

          {/* Tab selector */}
          <div className="mt-8 inline-flex p-1 bg-muted rounded-xl">
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'compare' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Side-by-Side Comparison
            </button>
            <button
              onClick={() => setActiveTab('verified')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'verified' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Verified Pro Profile
            </button>
            <button
              onClick={() => setActiveTab('unclaimed')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'unclaimed' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unclaimed Basic Profile
            </button>
          </div>
        </div>
      </section>

      {/* Main Comparison Section */}
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* UNCLAIMED PROFILE */}
            {(activeTab === 'compare' || activeTab === 'unclaimed') && (
              <div className="border border-border/80 rounded-2xl bg-card p-6 opacity-90 shadow-sm relative">
                <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Unclaimed Basic Profile
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">Government Open Data</span>
                </div>

                <div className="space-y-4">
                  {/* Photo area */}
                  <div className="h-44 bg-muted/60 rounded-xl flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border">
                    <Camera className="h-8 w-8 mb-1 opacity-40" />
                    <span className="text-xs">No school photos uploaded</span>
                  </div>

                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground">
                      Sunshine Early Learning Centre
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Johannesburg · Ward 117 · Gauteng</span>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verification Status:</span>
                      <span className="font-semibold text-amber-600">Unverified Audit Data</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Fees:</span>
                      <span className="text-foreground">Unlisted / Contact required</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Operating Hours:</span>
                      <span className="text-foreground">Standard 07:30 - 17:00</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button disabled variant="outline" className="w-full text-xs text-muted-foreground">
                      Direct Tour Booking Unavailable
                    </Button>
                    <p className="text-[11px] text-center text-muted-foreground">
                      Parents must manually dial directory numbers without confirmation.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                      <Link href="/directory">Claim This Listing Free</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* VERIFIED CLAIMED PROFILE */}
            {(activeTab === 'compare' || activeTab === 'verified') && (
              <div className="border-2 border-primary rounded-2xl bg-card p-6 shadow-xl relative">
                <div className="absolute -top-3.5 right-6 bg-primary text-primary-foreground text-xs font-bold py-1 px-3 rounded-full uppercase tracking-wider shadow">
                  Verified School
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                      Official DSD Verified Listing
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-primary">NPO 048-291</span>
                </div>

                <div className="space-y-4">
                  {/* Photo area */}
                  <div className="h-44 bg-gradient-to-tr from-primary/30 to-amber-500/20 rounded-xl p-4 flex flex-col justify-end text-white relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-white/90">6 Campus Photos</span>
                        <h4 className="text-sm font-bold text-white drop-shadow">Classrooms, Play Area, Dining Hall</h4>
                      </div>
                      <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                        DSD Registered
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        Sunshine Early Learning Centre
                      </h3>
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>Rosebank, Johannesburg · Gauteng · Subsidy Qualified</span>
                    </div>
                  </div>

                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Tuition:</span>
                      <span className="font-bold text-foreground font-mono">R1,450 / month (Includes 2 hot meals)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ages Catered:</span>
                      <span className="text-foreground">3 months to 5 years (Grade R)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Direct Lead Routing:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Instant WhatsApp Alerts
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button className="w-full font-semibold text-xs">
                      <Calendar className="mr-1.5 h-3.5 w-3.5" /> Book School Tour
                    </Button>
                    <Button variant="outline" className="w-full font-semibold text-xs text-emerald-600 border-emerald-600/40 hover:bg-emerald-50">
                      <Phone className="mr-1.5 h-3.5 w-3.5" /> Direct WhatsApp
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>Response Rate: <strong>Under 2 Hours</strong></span>
                    <Link href="/pricing" className="text-primary font-bold hover:underline flex items-center gap-1">
                      Upgrade to Verified <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Call to action */}
          <div className="mt-16 text-center max-w-xl mx-auto">
            <h3 className="font-heading text-2xl font-bold text-foreground">Ready to elevate your school&apos;s digital presence?</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Claiming is free for all registered South African preschools. Upgrade anytime to receive direct tour leads.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="font-semibold">
                <Link href="/pricing">View Pricing & Plans</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-semibold">
                <Link href="/directory">Find My Listing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
