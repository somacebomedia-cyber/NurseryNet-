// src/app/preschools/page.tsx
"use client";

import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { 
  TrendingUp, 
  Gift, 
  Wand2, 
  Eye, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Search,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function PreschoolsOverviewPage() {
  const { brand } = useBrand();

  const entityType = brand === 'NurseryNet' ? 'Preschool' : brand === 'PrimaryNet' ? 'Primary School' : brand === 'HighschoolNet' ? 'High School' : 'Institution';

  const tools = [
    {
      title: 'Tuition ROI Calculator',
      description: 'Model your school fees, current capacity, and calculate exact revenue gains from just 1–3 new enrolled learners.',
      href: '/preschools/roi-calculator',
      icon: TrendingUp,
      badge: 'Interactive Tool',
      cta: 'Launch Calculator',
    },
    {
      title: 'Free School Growth Kit',
      description: 'Download essential South African administrative templates: Fee Clearance Certificates, Registration Forms, and Readiness Checklists.',
      href: '/preschools/growth-kit',
      icon: Gift,
      badge: 'Free Downloads',
      cta: 'Access Growth Kit',
    },
    {
      title: 'AI Logo & Crest Generator',
      description: 'Generate professional, print-ready crests and badges for uniforms, signage, and social media in seconds.',
      href: '/preschools/logo-generator',
      icon: Wand2,
      badge: 'Brand Builder',
      cta: 'Design Your Logo',
    },
    {
      title: 'School Profile Preview',
      description: 'See the dramatic difference between an unverified public listing and an owner-claimed verified profile.',
      href: '/preschools/profile-preview',
      icon: Eye,
      badge: 'Preview Mode',
      cta: 'Compare Profiles',
    },
    {
      title: 'Pricing & Verification Plans',
      description: 'Explore South African ZAR tiers (Free, Verified Centre R349/mo, Featured Slot R690/mo) with instant Stitch checkout.',
      href: '/pricing',
      icon: DollarSign,
      badge: 'Monetization',
      cta: 'View Pricing Plans',
    },
    {
      title: 'ECD Funding & Subsidy Guide',
      description: 'Search official South African Department of Social Development daily subsidies and educational foundation grants.',
      href: '/funding',
      icon: Search,
      badge: 'Grant Finder',
      cta: 'Explore Funding',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-border/40 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Growth & Management Suite for South African Educators</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Tools built specifically for {entityType} Principals
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything your school needs to increase enrollment, establish legal trust with DSD/NPO accreditation, and connect with parents in your neighborhood.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="font-semibold py-6 px-8">
              <Link href="/directory">Claim Your Listing — Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-semibold py-6 px-8">
              <Link href="/pricing">View Growth Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <Card key={tool.title} className="flex flex-col border border-border/70 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted px-2.5 py-0.5 rounded-full">
                      {tool.badge}
                    </span>
                  </div>
                  <CardTitle className="font-heading text-xl font-bold text-foreground">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1 leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter className="pt-2 border-t border-border/40">
                  <Button asChild variant="ghost" className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5 font-semibold">
                    <Link href={tool.href}>
                      {tool.cta} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Value Proposition Box */}
          <div className="mt-16 p-8 bg-card border border-border rounded-2xl max-w-4xl mx-auto shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-heading text-2xl font-bold text-foreground">
                  Why 20,291 South African schools are indexed on {brand}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  We integrate directly with official provincial audits, municipal census medians, and direct WhatsApp routing so no parent enquiry gets lost.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-foreground/90">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>DSD & NPO Registration verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp and Email parent lead notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Census 2021 municipal fee transparency</span>
                  </li>
                </ul>
              </div>
              <div className="bg-muted/40 p-6 rounded-xl border border-border/50 text-center space-y-3">
                <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
                <h4 className="font-semibold text-foreground">Ready to take control of your profile?</h4>
                <p className="text-xs text-muted-foreground">
                  Search for your centre in our national index and verify ownership in less than 2 minutes.
                </p>
                <Button asChild className="w-full font-semibold">
                  <Link href="/directory">Search My School</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
