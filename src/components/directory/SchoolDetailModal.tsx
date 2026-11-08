"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Preschool } from '@/data/preschools';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  Users,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ExternalLink,
  User
} from 'lucide-react';

interface SchoolDetailModalProps {
  preschool: Preschool | null;
  isOpen: boolean;
  onClose: () => void;
  onBookTour: (preschool: Preschool) => void;
  onInquire: (preschool: Preschool) => void;
}

export default function SchoolDetailModal({
  preschool,
  isOpen,
  onClose,
  onBookTour,
  onInquire,
}: SchoolDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!preschool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl bg-card border-border">
        {/* Header Photo Gallery */}
        <div className="relative w-full h-72 sm:h-80 bg-muted">
          <Image
            src={preschool.images[activeImageIndex] || preschool.images[0]}
            alt={preschool.name}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Badges on Hero Image */}
          <div className="absolute top-4 left-4 flex gap-2">
            {preschool.isVerified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-primary backdrop-blur-md shadow-md">
                <ShieldCheck className="w-4 h-4 text-primary fill-primary/20" />
                Verified ECD Center
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-md">
              {preschool.curriculum}
            </span>
          </div>

          {/* Multi-Photo Switcher Dots */}
          {preschool.images.length > 1 && (
            <div className="absolute top-4 right-4 flex gap-1.5 bg-black/50 backdrop-blur-md p-1.5 rounded-full">
              {preschool.images.map((_, idx) => (
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
          <div className="absolute bottom-4 left-4 right-4 text-white">
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

            <div className="flex items-center gap-3 w-full sm:w-auto">
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
                className="flex-1 sm:flex-initial text-sm font-bold h-11 px-6 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule a Tour
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
              <span className="text-xs text-muted-foreground block">Teacher Ratio</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">{preschool.teacherRatio} Caregiver Ratio</span>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted-foreground block">Hours</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">{preschool.operatingHours}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted-foreground block">Head of School</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block truncate">{preschool.principal}</span>
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
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span>{preschool.email}</span>
            </div>
            <div className="flex items-center gap-1 text-primary hover:underline cursor-pointer">
              <MapPin className="w-4 h-4" />
              <span>{preschool.city}, South Africa</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
