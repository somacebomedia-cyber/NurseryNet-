"use client";

import Image from 'next/image';
import { Preschool, getMunicipalityBenchmark } from '@/data/preschools';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Star,
  ShieldCheck,
  BadgeCheck,
  Calendar,
  Trash2,
  Scale,
  CheckCircle2,
  MapPin,
  FileText,
} from 'lucide-react';

interface CompareSchoolsModalProps {
  schools: Preschool[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (schoolId: string) => void;
  onClearAll: () => void;
  onBookTour: (school: Preschool) => void;
  onApplySchool?: (school: Preschool) => void;
  onApplyAll?: (schools: Preschool[]) => void;
  onSelectDetail: (school: Preschool) => void;
}

export default function CompareSchoolsModal({
  schools,
  isOpen,
  onClose,
  onRemove,
  onClearAll,
  onBookTour,
  onApplySchool,
  onApplyAll,
  onSelectDetail,
}: CompareSchoolsModalProps) {
  const compared = schools.slice(0, 4);

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-card border-border">
        <DialogHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <div>
            <DialogTitle className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              <span>Side-by-Side Preschool Comparison ({compared.length})</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Compare monthly tuition against municipal Census 2021 medians, DSD accreditation, ratios, and apply to all at once.
            </DialogDescription>
          </div>
          {compared.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {onApplyAll && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onApplyAll(compared)}
                  className="text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Apply to All {compared.length} at Once
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-xs font-semibold text-muted-foreground hover:text-destructive whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Clear
              </Button>
            </div>
          )}
        </DialogHeader>

        {compared.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Your shortlist is currently empty. Click the heart icon on any preschool card to save and compare schools side-by-side.
            </p>
            <Button onClick={onClose} className="text-xs font-bold rounded-xl">
              Browse Directory
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 w-44 text-xs font-semibold text-muted-foreground align-top">
                    Preschool Details
                  </th>
                  {compared.map((school) => {
                    const defaultImage =
                      school.images && school.images.length > 0
                        ? school.images[0]
                        : 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80';
                    return (
                      <th key={school.id} className="p-3 align-top min-w-[190px] max-w-[240px]">
                        <div className="space-y-2.5">
                          <div className="relative h-28 w-full rounded-xl overflow-hidden bg-muted border border-border/60">
                            <Image
                              src={defaultImage}
                              alt={school.name}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => onRemove(school.id)}
                              title="Remove from comparison"
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/65 text-white hover:bg-destructive transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => onSelectDetail(school)}
                              className="font-heading text-sm font-bold text-foreground hover:text-primary text-left line-clamp-1"
                            >
                              {school.name}
                            </button>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-accent shrink-0" />
                              <span className="truncate">{school.suburb || school.city}, {school.province}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {onApplySchool && (
                              <Button
                                size="sm"
                                onClick={() => onApplySchool(school)}
                                className="flex-1 h-8 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg whitespace-nowrap"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                Apply
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => onBookTour(school)}
                              className="flex-1 h-8 text-xs font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg whitespace-nowrap"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Tour
                            </Button>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                <tr>
                  <td className="p-3 font-semibold text-muted-foreground">Monthly Tuition</td>
                  {compared.map((school) => {
                    const muni = getMunicipalityBenchmark(school.municipality || school.city || school.district);
                    const median = Math.round(muni.medianMonthlyFee || 300);
                    return (
                      <td key={school.id} className="p-3 font-mono tabular-nums">
                        <span className="text-base font-extrabold text-foreground block">
                          R{school.monthlyFeeZAR.toLocaleString()} / mo
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Local Census Median: R{median.toLocaleString()}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-muted-foreground">Parent Rating</td>
                  {compared.map((school) => (
                    <td key={school.id} className="p-3 font-mono tabular-nums">
                      <div className="inline-flex items-center gap-1 font-bold text-foreground">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{school.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground font-sans font-normal">
                          ({school.reviewCount} reviews)
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-muted-foreground">Verification & DSD</td>
                  {compared.map((school) => (
                    <td key={school.id} className="p-3">
                      <div className="space-y-1">
                        {school.isClaimed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            <span>Owner-Claimed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-primary font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>DSD {school.dsdRegistration || 'Verified'}</span>
                          </span>
                        )}
                        <span className="block text-[11px] text-muted-foreground font-mono">
                          {school.npoNumber ? `NPO #${school.npoNumber}` : 'Community ECD'} ·{' '}
                          {school.isSubsidised ? 'DSD Subsidised' : 'Private Fee'}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-muted-foreground">Curriculum & Ages</td>
                  {compared.map((school) => (
                    <td key={school.id} className="p-3">
                      <span className="font-semibold text-foreground block">{school.curriculum}</span>
                      <span className="text-muted-foreground">Ages {school.ageRange}</span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-muted-foreground">Ratio & Language</td>
                  {compared.map((school) => (
                    <td key={school.id} className="p-3 font-mono tabular-nums">
                      <span className="font-semibold text-foreground block">{school.teacherRatio} Ratio</span>
                      <span className="text-muted-foreground font-sans">{school.primaryLanguage || 'English'}</span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-muted-foreground">Operating Hours</td>
                  {compared.map((school) => (
                    <td key={school.id} className="p-3 font-mono tabular-nums text-foreground">
                      {school.operatingHours}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-muted-foreground">Key Facilities</td>
                  {compared.map((school) => (
                    <td key={school.id} className="p-3">
                      <ul className="space-y-1">
                        {school.facilities.slice(0, 4).map((fac, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-foreground/90">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{fac}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
