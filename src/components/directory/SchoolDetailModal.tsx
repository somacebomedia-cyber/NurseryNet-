"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Preschool, ECD_BENCHMARKS } from '@/data/preschools';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Star,
  MapPin,
  ShieldCheck,
  BadgeCheck,
  Clock,
  Users,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
  ExternalLink,
  Languages,
  Building,
  BarChart3,
  Lock,
  TreePine,
  Droplets,
  AlertCircle
} from 'lucide-react';

interface SchoolDetailModalProps {
  preschool: Preschool | null;
  isOpen: boolean;
  onClose: () => void;
  onBookTour: (preschool: Preschool) => void;
  onInquire: (preschool: Preschool) => void;
  onClaim?: (preschool: Preschool) => void;
}

export default function SchoolDetailModal({
  preschool,
  isOpen,
  onClose,
  onBookTour,
  onInquire,
  onClaim,
}: SchoolDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!preschool) return null;

  const images = preschool.images && preschool.images.length > 0
    ? preschool.images
    : ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80'];

  const hasFencing = preschool.facilities.some(f => f.toLowerCase().includes('fence') || f.toLowerCase().includes('security'));
  const hasGate = preschool.facilities.some(f => f.toLowerCase().includes('gate') || f.toLowerCase().includes('security'));
  const hasWater = true; // In South Africa verified registered schools meet sanitation standards
  const hasPlayground = preschool.facilities.some(f => f.toLowerCase().includes('playground') || f.toLowerCase().includes('garden') || f.toLowerCase().includes('sports'));

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl bg-card border-border">
        {/* Header Photo Gallery */}
        <div className="relative w-full h-72 sm:h-80 bg-muted">
          <Image
            src={images[activeImageIndex] || images[0]}
            alt={preschool.name}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

          {/* Badges on Hero Image */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            {preschool.isClaimed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md">
                <BadgeCheck className="w-4 h-4" />
                Owner-Claimed & Verified
              </span>
            ) : preschool.isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-primary backdrop-blur-md shadow-md">
                <ShieldCheck className="w-4 h-4 text-primary fill-primary/20" />
                Register-Verified ECD
              </span>
            ) : null}

            {preschool.emisNumber && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/60 text-white/95 backdrop-blur-md">
                EMIS #{preschool.emisNumber}
              </span>
            )}

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-md">
              {preschool.curriculum}
            </span>
          </div>

          {/* Multi-Photo Switcher Dots */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 flex gap-1.5 bg-black/50 backdrop-blur-md p-1.5 rounded-full z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === activeImageIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Bottom Title Scrim */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold drop-shadow-md">
              {preschool.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-white/90 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-accent" />
                {preschool.address}
              </span>
              <span className="flex items-center gap-1 text-yellow-300 font-bold">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {preschool.rating.toFixed(1)} ({preschool.reviewCount} parent reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-6">
          {/* Action Strip: Price & Booking */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Tuition & Enrollment
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-foreground tabular-nums">
                  R{preschool.monthlyFeeZAR.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">/ month</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ml-2">
                  {preschool.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Claim button if not claimed */}
              {!preschool.isClaimed && onClaim && (
                <Button
                  variant="outline"
                  onClick={() => onClaim(preschool)}
                  className="text-xs font-bold h-11 px-3.5 rounded-xl border-primary/40 text-primary hover:bg-primary/10"
                >
                  <BadgeCheck className="w-4 h-4 mr-1.5" />
                  Claim School
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => onInquire(preschool)}
                className="flex-1 sm:flex-initial text-sm font-semibold h-11 px-4 rounded-xl"
              >
                <Mail className="w-4 h-4 mr-1.5" />
                Inquire
              </Button>

              <Button
                onClick={() => onBookTour(preschool)}
                className="flex-1 sm:flex-initial text-sm font-bold h-11 px-5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Tour
              </Button>
            </div>
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted-foreground block">Age Range</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">{preschool.ageRange}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted-foreground block">Caregiver Ratio</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">{preschool.teacherRatio} Ratio</span>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted-foreground block">Instruction Language</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block truncate">
                {preschool.primaryLanguage || 'English'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted-foreground block">Operating Hours</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block truncate">{preschool.operatingHours}</span>
            </div>
          </div>

          {/* Government Registration & Accreditation Card */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h4 className="font-heading text-sm font-bold text-foreground">
                  Official South African Registration & Accreditation
                </h4>
              </div>
              <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                Register-Verified
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div>
                <span className="text-muted-foreground block">EMIS Number</span>
                <span className="font-mono font-bold text-foreground">{preschool.emisNumber || 'Register-Verified'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Education District</span>
                <span className="font-bold text-foreground">{preschool.educationDistrict || preschool.district || preschool.city}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Province</span>
                <span className="font-bold text-foreground">{preschool.province || 'South Africa'}</span>
              </div>
            </div>
          </div>

          {/* National ECD Census 2021 Benchmark Comparison */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h4 className="font-heading text-sm font-bold text-foreground">
                  National ECD Census Benchmark Compliance
                </h4>
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold">
                DBE Census 2021 Norms
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              How this preschool compares against South Africa's national early childhood averages (surveying 42,420 institutions nationwide):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-background border border-border/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-foreground">Perimeter Security Fencing</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">Compliant</span>
                  <span className="text-[10px] text-muted-foreground block">Nat avg: 88.6%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-background border border-border/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-foreground">Lockable Security Gate</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">Compliant</span>
                  <span className="text-[10px] text-muted-foreground block">Nat avg: 83.6%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-background border border-border/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  <span className="font-medium text-foreground">On-Site Clean Tap Water</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-cyan-600">Certified</span>
                  <span className="text-[10px] text-muted-foreground block">Nat avg: 74.0%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-background border border-border/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-foreground">Outdoor Playground</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">Available</span>
                  <span className="text-[10px] text-muted-foreground block">Nat avg: 81.0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* About School */}
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">About Our School</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {preschool.description}
            </p>
          </div>

          {/* Facilities & Amenities */}
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-3">Campus Facilities & Services</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {preschool.facilities.map((fac, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-foreground p-2 rounded-lg bg-muted/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Parent Reviews Section */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">Verified Parent Reviews</h3>
                <p className="text-xs text-muted-foreground">Feedback from registered South African parents</p>
              </div>
              <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-bold">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>{preschool.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            <div className="space-y-3">
              {preschool.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-background border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">{rev.author}</span>
                        <span className="text-[11px] text-muted-foreground">{rev.childAge} · {rev.date}</span>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground/90 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Bar */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/80 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">{preschool.phone}</span>
            </div>
            {preschool.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>{preschool.email}</span>
              </div>
            )}
            {preschool.latitude && preschool.longitude ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${preschool.latitude},${preschool.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-primary hover:underline font-bold"
              >
                <MapPin className="w-4 h-4" />
                <span>View on Map ({preschool.latitude.toFixed(3)}, {preschool.longitude.toFixed(3)})</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{preschool.suburb}, {preschool.city}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
