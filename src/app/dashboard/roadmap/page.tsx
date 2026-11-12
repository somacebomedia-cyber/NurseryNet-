// src/app/dashboard/roadmap/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Rocket, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ThumbsUp, 
  ArrowRight,
  Database,
  ShieldCheck,
  CreditCard,
  Brain,
  MessageSquare
} from 'lucide-react';

interface Milestone {
  quarter: string;
  title: string;
  status: 'shipped' | 'in-progress' | 'planned';
  description: string;
  votes: number;
  icon: React.ElementType;
}

export default function RoadmapPage() {
  const { brand } = useBrand();
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      quarter: 'Q3 2026',
      title: '20,291 Real SA Preschools & ECD Census 2021 Benchmarks',
      status: 'shipped',
      description: 'Integrated official DSD audit data and municipal Census benchmarks across all 9 South African provinces.',
      votes: 142,
      icon: Database,
    },
    {
      quarter: 'Q4 2026',
      title: 'Owner Claim Flow & Instant WhatsApp Notification Routing',
      status: 'shipped',
      description: 'Principals can claim listings with official DSD registration numbers and receive real-time parent enquiries directly on WhatsApp.',
      votes: 98,
      icon: ShieldCheck,
    },
    {
      quarter: 'Q4 2026',
      title: 'Stitch Money South African Banking & School Growth Portal',
      status: 'shipped',
      description: 'Capitec Pay, Instant EFT, tuition ROI modeling, and printable DSD administrative templates.',
      votes: 84,
      icon: CreditCard,
    },
    {
      quarter: 'Q1 2027',
      title: 'AI South African CAPS Lesson Plan & Weekly Activity Generator',
      status: 'in-progress',
      description: 'Multilingual lesson planning in English, isiZulu, isiXhosa, and Afrikaans aligned with DBE National Curriculum Framework.',
      votes: 215,
      icon: Brain,
    },
    {
      quarter: 'Q2 2027',
      title: 'Automated DSD Monthly Subsidy Attendance Reconciliation',
      status: 'planned',
      description: 'One-click attendance reporting formatted strictly according to provincial Social Development grant audit specifications.',
      votes: 178,
      icon: Clock,
    },
  ]);

  const handleVote = (index: number) => {
    setMilestones(prev => prev.map((m, i) => i === index ? { ...m, votes: m.votes + 1 } : m));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
            <Rocket className="h-3.5 w-3.5" />
            <span>Platform Evolution & Community Voice</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            {brand} Product Roadmap
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            See what we&apos;ve built, what we&apos;re currently shipping, and vote on upcoming features tailored for South African early learning.
          </p>
        </div>
      </section>

      {/* Roadmap List */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="space-y-6">
            {milestones.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.title}
                  className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${
                      item.status === 'shipped' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                        : item.status === 'in-progress' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          {item.quarter}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          item.status === 'shipped'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'in-progress'
                              ? 'bg-primary/15 text-primary'
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </div>

                      <h3 className="font-heading text-lg font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleVote(index)}
                    className="shrink-0 flex items-center gap-1.5 font-semibold text-xs"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>Upvote ({item.votes})</span>
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center p-8 bg-card border border-border rounded-2xl">
            <h4 className="font-heading font-bold text-lg text-foreground">Have a specific feature suggestion?</h4>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              We build directly with South African preschool owners, teachers, and parents.
            </p>
            <Button asChild>
              <Link href="/contact">Suggest a Feature</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
