"use client";

import Image from 'next/image';
import { Preschool } from '@/data/preschools';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ShieldCheck, Clock, Users, Calendar, ArrowRight } from 'lucide-react';

interface PreschoolCardProps {
  preschool: Preschool;
  onSelect: (preschool: Preschool) => void;
  onBookTour: (preschool: Preschool) => void;
}

export default function PreschoolCard({ preschool, onSelect, onBookTour }: PreschoolCardProps) {
  const statusStyles = {
    'Admissions Open': 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    'Limited Spots': 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    'Waitlist Only': 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  }[preschool.status];

  return (
    <div className="group flex flex-col bg-card rounded-2xl border border-border/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-primary/40">
      {/* Cover Image & Badges */}
      <div className="relative w-full h-52 overflow-hidden bg-muted">
        <Image
          src={preschool.images[0]}
          alt={`${preschool.name} learning environment`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
          {preschool.isVerified ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-primary backdrop-blur-md shadow-sm border border-white/40">
              <ShieldCheck className="w-4 h-4 text-primary fill-primary/20" />
              <span>Verified ECD</span>
            </div>
          ) : <div />}

          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${statusStyles}`}>
            {preschool.status}
          </span>
        </div>

        {/* Location & Rating Scrim on bottom of photo */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white z-10">
          <div className="flex items-center gap-1 text-xs font-medium drop-shadow-md">
            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{preschool.suburb}, {preschool.city}</span>
          </div>
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-xs font-bold text-yellow-300">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="tabular-nums">{preschool.rating.toFixed(1)}</span>
            <span className="text-white/80 font-normal">({preschool.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title & Tagline */}
        <div className="mb-3">
          <h3 
            onClick={() => onSelect(preschool)}
            className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
          >
            {preschool.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {preschool.tagline}
          </p>
        </div>

        {/* Unboxed Metadata with dot separators (Zero-Pill discipline) */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-2 text-xs text-muted-foreground/90 my-2 pt-2 border-t border-border/60">
          <span className="font-semibold text-primary">{preschool.curriculum}</span>
          <span aria-hidden="true" className="text-muted-foreground/40">·</span>
          <span>Ages {preschool.ageRange}</span>
          <span aria-hidden="true" className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span>{preschool.teacherRatio} Ratio</span>
          </span>
        </div>

        {/* Facilities Preview */}
        <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
          {preschool.facilities.slice(0, 3).map((facility, idx) => (
            <span key={idx} className="text-[11px] text-foreground/80 bg-muted/60 px-2 py-0.5 rounded-md">
              {facility}
            </span>
          ))}
          {preschool.facilities.length > 3 && (
            <span className="text-[11px] text-muted-foreground px-1 py-0.5">
              +{preschool.facilities.length - 3} more
            </span>
          )}
        </div>

        {/* Pricing & Actions Footer */}
        <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-muted-foreground block">Monthly Tuition</span>
            <span className="text-base font-extrabold text-foreground tabular-nums">
              R{preschool.monthlyFeeZAR.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground"> / mo</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect(preschool)}
              className="text-xs font-semibold h-9 px-3 rounded-lg hover:border-primary hover:text-primary"
            >
              Details
            </Button>
            <Button
              size="sm"
              onClick={() => onBookTour(preschool)}
              className="text-xs font-bold h-9 px-3.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 shadow-md flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Tour</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
