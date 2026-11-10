"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  ShieldCheck,
  Lock,
  TreePine,
  Building,
  Droplets,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ECD_BENCHMARKS } from '@/data/preschools';

interface EcdBenchmarksDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EcdBenchmarksDialog({ isOpen, onClose }: EcdBenchmarksDialogProps) {
  const infra = ECD_BENCHMARKS.nationalInfrastructure;
  const equipment = ECD_BENCHMARKS.outdoorPlayEquipment;
  const provinces = ECD_BENCHMARKS.provincialDistribution;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-card border-border">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl font-bold text-foreground">
                National ECD Census Benchmarks (South Africa)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Official Department of Basic Education (DBE) Census covering 42,420 early childhood centres across all 9 provinces.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Top National Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-center">
              <span className="text-2xl font-black text-primary block tabular-nums">42,420</span>
              <span className="text-[11px] font-semibold text-muted-foreground mt-0.5 block">
                Total Surveyed Centres
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block tabular-nums">
                88.6%
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground mt-0.5 block">
                Perimeter Fenced
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block tabular-nums">
                83.6%
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground mt-0.5 block">
                Lockable Security Gates
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block tabular-nums">
                81.0%
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground mt-0.5 block">
                Outdoor Playgrounds
              </span>
            </div>
          </div>

          {/* Core Infrastructure & Safety Standards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>National Infrastructure & Safety Norms</span>
              </h4>
              <span className="text-[11px] text-muted-foreground">National Prevalence (%)</span>
            </div>

            <div className="space-y-3">
              {[
                { label: infra.perimeterFencing.label, pct: infra.perimeterFencing.percentage, count: infra.perimeterFencing.count, icon: ShieldCheck, color: 'bg-emerald-500' },
                { label: infra.lockableSecurityGate.label, pct: infra.lockableSecurityGate.percentage, count: infra.lockableSecurityGate.count, icon: Lock, color: 'bg-emerald-500' },
                { label: infra.permanentBuilding.label, pct: infra.permanentBuilding.percentage, count: infra.permanentBuilding.count, icon: Building, color: 'bg-blue-500' },
                { label: infra.outdoorPlayArea.label, pct: infra.outdoorPlayArea.percentage, count: infra.outdoorPlayArea.count, icon: TreePine, color: 'bg-green-500' },
                { label: infra.onSiteTapWater.label, pct: infra.onSiteTapWater.percentage, count: infra.onSiteTapWater.count, icon: Droplets, color: 'bg-cyan-500' },
                { label: infra.dsdSubsidised.label, pct: infra.dsdSubsidised.percentage, count: infra.dsdSubsidised.count, icon: HeartHandshake, color: 'bg-amber-500' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-background border border-border/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <item.icon className="w-3.5 h-3.5 text-primary" />
                      {item.label}
                    </span>
                    <span className="font-mono font-bold text-foreground tabular-nums">
                      {item.pct}% ({item.count.toLocaleString()} centres)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outdoor Equipment Breakdown */}
          <div>
            <h4 className="font-heading text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <TreePine className="w-4 h-4 text-emerald-600" />
              <span>Outdoor Play Apparatus Prevalence</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { label: 'Swings', pct: equipment.swings.percentage, count: equipment.swings.count },
                { label: 'Slides', pct: equipment.slides.percentage, count: equipment.slides.count },
                { label: 'Jungle Gyms', pct: equipment.jungleGyms.percentage, count: equipment.jungleGyms.count },
                { label: 'Sand Pits', pct: equipment.sandPits.percentage, count: equipment.sandPits.count },
                { label: 'Seesaws', pct: equipment.seesaws.percentage, count: equipment.seesaws.count },
              ].map((eq, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border text-center">
                  <span className="text-base font-black text-foreground block tabular-nums">{eq.pct}%</span>
                  <span className="text-xs font-bold text-primary block mt-0.5">{eq.label}</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">{eq.count.toLocaleString()} schools</span>
                </div>
              ))}
            </div>
          </div>

          {/* Provincial Distribution Breakdown */}
          <div>
            <h4 className="font-heading text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              <span>Provincial Distribution (All 9 Provinces)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {provinces.map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-background border border-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{p.province}</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-primary">{p.count.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">({p.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citation & Methodology Footer */}
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground flex items-start gap-2.5">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>
                <strong>Data Source:</strong> Department of Basic Education (DBE) ECD Census 2021, hosted via DataFirst (University of Cape Town).
              </p>
              <p className="text-[11px]">
                NurseryNet benchmarks every school listing against these official national standards to help parents make informed, safe early childhood education choices.
              </p>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full h-11 font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Close Benchmarks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
