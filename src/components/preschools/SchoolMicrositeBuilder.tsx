// src/components/preschools/SchoolMicrositeBuilder.tsx
"use client";

import { useState, useEffect } from 'react';
import { useBrand } from '@/context/BrandContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Globe,
  Monitor,
  Smartphone,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Calendar,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export interface MicrositeConfig {
  schoolName: string;
  suburb: string;
  tagline: string;
  monthlyFee: string;
  hours: string;
  whatsapp: string;
  curriculum: string;
  theme: 'violet' | 'emerald' | 'amber' | 'indigo';
  published: boolean;
}

const DEFAULT_CONFIG: MicrositeConfig = {
  schoolName: 'Sunshine Early Learning Centre',
  suburb: 'Rosebank, Johannesburg',
  tagline: 'Warm, structured early childhood care with daily hot meals and CAPS-aligned Grade R.',
  monthlyFee: 'R1,450',
  hours: '07:00 – 17:30 (Mon – Fri)',
  whatsapp: '082 555 1829',
  curriculum: 'Play-Based NCF & Montessori Corners',
  theme: 'violet',
  published: true,
};

const THEME_PALETTES = {
  violet: {
    heroBg: 'from-violet-700 via-purple-700 to-indigo-800',
    accentBg: 'bg-violet-600 hover:bg-violet-700',
    accentText: 'text-violet-700 dark:text-violet-300',
    softBg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-200 dark:border-violet-800',
  },
  emerald: {
    heroBg: 'from-emerald-700 via-teal-700 to-emerald-900',
    accentBg: 'bg-emerald-600 hover:bg-emerald-700',
    accentText: 'text-emerald-700 dark:text-emerald-300',
    softBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  amber: {
    heroBg: 'from-amber-600 via-orange-600 to-amber-800',
    accentBg: 'bg-amber-600 hover:bg-amber-700',
    accentText: 'text-amber-700 dark:text-amber-300',
    softBg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
  },
  indigo: {
    heroBg: 'from-indigo-700 via-blue-700 to-slate-900',
    accentBg: 'bg-indigo-600 hover:bg-indigo-700',
    accentText: 'text-indigo-700 dark:text-indigo-300',
    softBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
};

export default function SchoolMicrositeBuilder({ compact = false }: { compact?: boolean }) {
  const { brand } = useBrand();
  const [config, setConfig] = useState<MicrositeConfig>(DEFAULT_CONFIG);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nurserynet_microsite_config');
      if (stored) {
        try {
          setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(stored) });
        } catch {
          // ignore parse errors
        }
      }
    }
  }, []);

  const slug = config.schoolName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'my-school';

  const siteUrl = `https://nurserynet.app/s/${slug}`;
  const palette = THEME_PALETTES[config.theme];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...config, published: true };
    setConfig(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nurserynet_microsite_config', JSON.stringify(updated));
    }
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const entityLabel =
    brand === 'NurseryNet'
      ? 'Early Learning & Preschool'
      : brand === 'PrimaryNet'
      ? 'Primary School'
      : brand === 'HighschoolNet'
      ? 'High School'
      : 'Institution';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Configuration Controls */}
      <form
        onSubmit={handleSave}
        className={`${compact ? 'lg:col-span-5' : 'lg:col-span-5'} bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm`}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Free School Website Setup
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Included free with the R390/mo Featured Top Slot plan
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
            R0 Extra
          </span>
        </div>

        {savedFeedback && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>School website configuration saved and ready to publish!</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="ms-name" className="text-xs font-semibold">School / Centre Name</Label>
          <Input
            id="ms-name"
            value={config.schoolName}
            onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ms-suburb" className="text-xs font-semibold">Suburb & City</Label>
            <Input
              id="ms-suburb"
              value={config.suburb}
              onChange={(e) => setConfig({ ...config, suburb: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ms-fee" className="text-xs font-semibold">Starting Monthly Fee</Label>
            <Input
              id="ms-fee"
              value={config.monthlyFee}
              onChange={(e) => setConfig({ ...config, monthlyFee: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ms-tagline" className="text-xs font-semibold">Website Welcome Headline / Bio</Label>
          <textarea
            id="ms-tagline"
            rows={2}
            value={config.tagline}
            onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
            className="w-full p-2.5 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ms-hours" className="text-xs font-semibold">Operating Hours</Label>
            <Input
              id="ms-hours"
              value={config.hours}
              onChange={(e) => setConfig({ ...config, hours: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ms-wa" className="text-xs font-semibold">Tour WhatsApp No.</Label>
            <Input
              id="ms-wa"
              value={config.whatsapp}
              onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ms-curr" className="text-xs font-semibold">Curriculum & Highlights</Label>
          <Input
            id="ms-curr"
            value={config.curriculum}
            onChange={(e) => setConfig({ ...config, curriculum: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Website Colour Theme</Label>
          <div className="grid grid-cols-4 gap-2">
            {(['violet', 'emerald', 'amber', 'indigo'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setConfig({ ...config, theme: t })}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold capitalize transition-colors ${
                  config.theme === t
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full font-semibold">
          <Sparkles className="mr-2 h-4 w-4" /> Save & Publish Microsite
        </Button>
      </form>

      {/* Right: Live Browser Preview */}
      <div className={`${compact ? 'lg:col-span-7' : 'lg:col-span-7'} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 border border-border rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs min-w-0">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <span className="font-mono text-foreground truncate">{siteUrl}</span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Copy microsite URL"
            >
              {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                viewport === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                viewport === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobile
            </button>
          </div>
        </div>

        {/* Simulated Website Frame */}
        <div className="flex justify-center bg-muted/20 border border-border rounded-2xl p-4 sm:p-6">
          <div
            className={`bg-background border border-border rounded-xl overflow-hidden shadow-lg transition-all duration-200 ${
              viewport === 'mobile' ? 'w-[340px]' : 'w-full'
            }`}
          >
            {/* Microsite Top Nav */}
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-card">
              <div className="font-heading font-bold text-sm text-foreground truncate max-w-[60%]">
                {config.schoolName || 'Your School Name'}
              </div>
              <span className={`text-[11px] font-semibold flex items-center gap-1 ${palette.accentText}`}>
                <ShieldCheck className="h-3.5 w-3.5" /> DSD Verified
              </span>
            </div>

            {/* Microsite Hero */}
            <div className={`bg-gradient-to-br ${palette.heroBg} text-white px-6 py-8 sm:py-10`}>
              <div className="text-[11px] font-semibold text-white/85 uppercase tracking-wider mb-1">
                {entityLabel} · {config.suburb}
              </div>
              <h4 className="font-heading text-2xl sm:text-3xl font-extrabold leading-tight">
                {config.schoolName || 'Your School Name'}
              </h4>
              <p className="text-xs sm:text-sm text-white/90 mt-2 max-w-lg leading-relaxed">
                {config.tagline}
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1.5 bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-lg shadow">
                  <Calendar className="h-3.5 w-3.5" /> Book a Campus Tour
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/15 text-white border border-white/30 text-xs font-semibold px-4 py-2 rounded-lg">
                  <Phone className="h-3.5 w-3.5" /> WhatsApp {config.whatsapp}
                </span>
              </div>
            </div>

            {/* Microsite Key Info Grid */}
            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card">
              <div className={`p-3 rounded-xl border ${palette.border} ${palette.softBg}`}>
                <div className="text-[11px] text-muted-foreground font-semibold">Monthly Tuition</div>
                <div className="font-heading text-lg font-extrabold text-foreground font-mono tabular-nums mt-0.5">
                  {config.monthlyFee} <span className="text-xs font-normal text-muted-foreground">/ mo</span>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-border bg-background">
                <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                  <Clock className="h-3 w-3" /> School Hours
                </div>
                <div className="text-xs font-bold text-foreground mt-1">
                  {config.hours}
                </div>
              </div>
              <div className="p-3 rounded-xl border border-border bg-background">
                <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Curriculum
                </div>
                <div className="text-xs font-bold text-foreground mt-1">
                  {config.curriculum}
                </div>
              </div>
            </div>

            {/* Microsite Footer */}
            <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Hosted Free on {brand}</span>
              <span className="flex items-center gap-1 font-medium text-foreground">
                Custom Domain Ready <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
