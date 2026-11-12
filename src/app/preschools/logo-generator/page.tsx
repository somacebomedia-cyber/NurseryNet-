// src/app/preschools/logo-generator/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wand2, 
  Download, 
  Sparkles, 
  Copy, 
  Check, 
  BookOpen, 
  Sun, 
  GraduationCap, 
  TreePine, 
  Award,
  Palette,
  ArrowRight
} from 'lucide-react';

export default function LogoGeneratorPage() {
  const { brand } = useBrand();

  const [schoolName, setSchoolName] = useState('Bright Future Educare');
  const [motto, setMotto] = useState('Nurturing Minds · Est. 2019');
  const [selectedColor, setSelectedColor] = useState<'violet' | 'emerald' | 'amber' | 'navy'>('violet');
  const [selectedIcon, setSelectedIcon] = useState<'sun' | 'book' | 'tree' | 'award' | 'cap'>('sun');
  const [selectedShield, setSelectedShield] = useState<'crest' | 'circle' | 'modern'>('crest');
  const [copied, setCopied] = useState(false);

  const colors = {
    violet: { primary: '#7C3AED', secondary: '#F59E0B', text: '#4C1D95', bg: '#F5F3FF' },
    emerald: { primary: '#059669', secondary: '#D97706', text: '#064E3B', bg: '#ECFDF5' },
    amber: { primary: '#D97706', secondary: '#2563EB', text: '#78350F', bg: '#FFFBEB' },
    navy: { primary: '#1E3A8A', secondary: '#F59E0B', text: '#172554', bg: '#EFF6FF' },
  };

  const activeColor = colors[selectedColor];

  const generateSvgMarkup = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${activeColor.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${activeColor.secondary};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="400" height="400" rx="32" fill="${activeColor.bg}" />

  <!-- Shield / Crest Outer Frame -->
  ${selectedShield === 'crest' ? `
    <path d="M 200,60 C 260,60 310,75 310,140 C 310,240 200,310 200,310 C 200,310 90,240 90,140 C 90,75 140,60 200,60 Z" fill="white" stroke="${activeColor.primary}" stroke-width="8" filter="url(#shadow)" />
    <path d="M 200,75 C 250,75 295,90 295,145 C 295,230 200,290 200,290 C 200,290 105,230 105,145 C 105,90 150,75 200,75 Z" fill="none" stroke="${activeColor.secondary}" stroke-width="2" stroke-dasharray="4 4" />
  ` : selectedShield === 'circle' ? `
    <circle cx="200" cy="180" r="110" fill="white" stroke="${activeColor.primary}" stroke-width="8" filter="url(#shadow)" />
    <circle cx="200" cy="180" r="98" fill="none" stroke="${activeColor.secondary}" stroke-width="2" stroke-dasharray="4 4" />
  ` : `
    <rect x="95" y="75" width="210" height="210" rx="28" fill="white" stroke="${activeColor.primary}" stroke-width="8" filter="url(#shadow)" />
    <rect x="110" y="90" width="180" height="180" rx="18" fill="none" stroke="${activeColor.secondary}" stroke-width="2" stroke-dasharray="4 4" />
  `}

  <!-- Center Emblem Symbol -->
  <g transform="translate(200, 165) scale(1.6)" fill="${activeColor.primary}">
    ${selectedIcon === 'sun' ? `
      <circle cx="0" cy="0" r="14" fill="${activeColor.secondary}" />
      <g stroke="${activeColor.secondary}" stroke-width="3" stroke-linecap="round">
        <line x1="0" y1="-22" x2="0" y2="-28" />
        <line x1="0" y1="22" x2="0" y2="28" />
        <line x1="-22" y1="0" x2="-28" y2="0" />
        <line x1="22" y1="0" x2="28" y2="0" />
        <line x1="-16" y1="-16" x2="-20" y2="-20" />
        <line x1="16" y1="16" x2="20" y2="20" />
        <line x1="16" y1="-16" x2="20" y2="-20" />
        <line x1="-16" y1="16" x2="-20" y2="20" />
      </g>
    ` : selectedIcon === 'book' ? `
      <path d="M -20,-12 C -10,-15 0,-10 0,-10 C 0,-10 10,-15 20,-12 L 20,12 C 10,9 0,14 0,14 C 0,14 -10,9 -20,12 Z" fill="${activeColor.primary}" />
      <line x1="0" y1="-10" x2="0" y2="14" stroke="white" stroke-width="2" />
    ` : selectedIcon === 'tree' ? `
      <path d="M 0,-24 L 16,-6 L 8,-6 L 20,10 L -20,10 L -8,-6 L -16,-6 Z" fill="${activeColor.primary}" />
      <rect x="-3" y="10" width="6" height="10" fill="${activeColor.secondary}" />
    ` : selectedIcon === 'award' ? `
      <circle cx="0" cy="-6" r="16" fill="${activeColor.secondary}" />
      <polygon points="0,-12 3,-4 11,-4 5,2 7,10 0,6 -7,10 -5,2 -11,-4 -3,-4" fill="white" />
      <polygon points="-8,6 -14,24 -4,18 6,24 0,6" fill="${activeColor.primary}" />
    ` : `
      <polygon points="0,-16 24,-6 0,4 -24,-6" fill="${activeColor.primary}" />
      <rect x="-14" y="-3" width="28" height="12" rx="4" fill="${activeColor.secondary}" />
      <line x1="18" y1="-4" x2="18" y2="14" stroke="${activeColor.secondary}" stroke-width="3" />
      <circle cx="18" cy="15" r="3" fill="${activeColor.secondary}" />
    `}
  </g>

  <!-- Typography Banner -->
  <text x="200" y="345" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" text-anchor="middle" fill="${activeColor.text}" letter-spacing="1">
    ${schoolName.toUpperCase()}
  </text>
  <text x="200" y="368" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" text-anchor="middle" fill="${activeColor.primary}" opacity="0.8">
    ${motto}
  </text>
</svg>`;
  };

  const handleDownloadSvg = () => {
    const markup = generateSvgMarkup();
    const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schoolName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-crest.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(generateSvgMarkup());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
            <Wand2 className="h-3.5 w-3.5" />
            <span>AI Brand Builder for South African Schools</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            School Crest & Logo Generator
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Design a crisp, dignified crest for your school uniforms, signboards, letterheads, and {brand} profile. Free to customize and export.
          </p>
        </div>
      </section>

      {/* Editor Grid */}
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Controls */}
            <div className="lg:col-span-6 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" /> Brand Customization
              </h2>

              <div className="space-y-1.5">
                <Label htmlFor="schoolName" className="text-xs font-semibold">School / Centre Name</Label>
                <Input
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Little Acorns Educare"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motto" className="text-xs font-semibold">School Motto or Foundation Year</Label>
                <Input
                  id="motto"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="e.g. Nurturing Minds · Est. 2018"
                />
              </div>

              {/* Shield Shape */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Crest Geometry</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedShield('crest')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                      selectedShield === 'crest' 
                        ? 'border-primary bg-primary/10 text-primary font-bold' 
                        : 'border-border bg-muted/30 text-foreground'
                    }`}
                  >
                    Traditional Crest
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedShield('circle')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                      selectedShield === 'circle' 
                        ? 'border-primary bg-primary/10 text-primary font-bold' 
                        : 'border-border bg-muted/30 text-foreground'
                    }`}
                  >
                    Circular Seal
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedShield('modern')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                      selectedShield === 'modern' 
                        ? 'border-primary bg-primary/10 text-primary font-bold' 
                        : 'border-border bg-muted/30 text-foreground'
                    }`}
                  >
                    Modern Rounded
                  </button>
                </div>
              </div>

              {/* Symbol Icon */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Central Symbol</Label>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIcon('sun')}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                      selectedIcon === 'sun' ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                    }`}
                  >
                    <Sun className="h-5 w-5" />
                    <span className="text-[10px] mt-1">Sun</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIcon('book')}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                      selectedIcon === 'book' ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                    }`}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span className="text-[10px] mt-1">Book</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIcon('tree')}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                      selectedIcon === 'tree' ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                    }`}
                  >
                    <TreePine className="h-5 w-5" />
                    <span className="text-[10px] mt-1">Sprout</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIcon('award')}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                      selectedIcon === 'award' ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                    }`}
                  >
                    <Award className="h-5 w-5" />
                    <span className="text-[10px] mt-1">Medal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIcon('cap')}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                      selectedIcon === 'cap' ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                    }`}
                  >
                    <GraduationCap className="h-5 w-5" />
                    <span className="text-[10px] mt-1">Cap</span>
                  </button>
                </div>
              </div>

              {/* Color Scheme */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Institutional Palette</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedColor('violet')}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                      selectedColor === 'violet' ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                    }`}
                  >
                    <div className="h-4 w-4 rounded-full bg-[#7C3AED]" />
                    <span className="font-medium">Royal Violet & Gold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedColor('emerald')}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                      selectedColor === 'emerald' ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-border'
                    }`}
                  >
                    <div className="h-4 w-4 rounded-full bg-[#059669]" />
                    <span className="font-medium">Emerald & Amber</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedColor('navy')}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                      selectedColor === 'navy' ? 'border-blue-900 ring-2 ring-blue-900/20' : 'border-border'
                    }`}
                  >
                    <div className="h-4 w-4 rounded-full bg-[#1E3A8A]" />
                    <span className="font-medium">Classic Academic Navy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedColor('amber')}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                      selectedColor === 'amber' ? 'border-amber-600 ring-2 ring-amber-600/20' : 'border-border'
                    }`}
                  >
                    <div className="h-4 w-4 rounded-full bg-[#D97706]" />
                    <span className="font-medium">Warm Sun Gold</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Canvas Preview */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-sm">
                <div 
                  className="w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden shadow-inner border border-border/60"
                  dangerouslySetInnerHTML={{ __html: generateSvgMarkup() }}
                />

                <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-[340px]">
                  <Button onClick={handleDownloadSvg} className="flex-1 font-semibold">
                    <Download className="mr-2 h-4 w-4" /> Export Vector SVG
                  </Button>
                  <Button variant="outline" onClick={handleCopySvg} className="flex-1">
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-emerald-600" /> Copied Code!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" /> Copy SVG Code
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Next Steps CTA */}
              <div className="p-6 bg-muted/40 rounded-2xl border border-border text-center space-y-3">
                <h4 className="font-heading font-bold text-base text-foreground">Want this logo on your verified listing?</h4>
                <p className="text-xs text-muted-foreground">
                  Verified schools can upload their custom crest directly to their profile to stand out to parents.
                </p>
                <div className="flex justify-center gap-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/preschools/profile-preview">See Profile Preview</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/pricing">Claim Verified Status</Link>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
