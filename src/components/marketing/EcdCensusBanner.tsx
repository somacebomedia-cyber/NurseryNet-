"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, ShieldCheck, TreePine, Droplets, ArrowRight } from 'lucide-react';
import EcdBenchmarksDialog from '@/components/directory/EcdBenchmarksDialog';

export default function EcdCensusBanner() {
  const [benchmarksOpen, setBenchmarksOpen] = useState(false);

  return (
    <>
      <section className="w-full bg-slate-900 text-white py-8 border-y border-slate-800">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left">
              <div className="p-3 rounded-2xl bg-primary/20 text-yellow-300 border border-primary/30 shrink-0">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold mb-1 border border-yellow-400/30">
                  <span>South Africa National ECD Census 2021 Data</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-heading text-white">
                  1,180+ Real Verified Preschools Benchmarked Against 42,420 National Centres
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
                  Every nursery and crèche on NurseryNet is cross-referenced with Department of Basic Education safety norms, EMIS registry data, and infrastructure indicators.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
              <div className="hidden sm:flex items-center gap-4 text-xs font-mono pr-4 border-r border-slate-700">
                <div>
                  <span className="text-yellow-400 font-extrabold text-base block">88.6%</span>
                  <span className="text-slate-400 text-[10px]">Secure Fencing</span>
                </div>
                <div>
                  <span className="text-yellow-400 font-extrabold text-base block">83.6%</span>
                  <span className="text-slate-400 text-[10px]">Lockable Gates</span>
                </div>
                <div>
                  <span className="text-yellow-400 font-extrabold text-base block">81.0%</span>
                  <span className="text-slate-400 text-[10px]">Playgrounds</span>
                </div>
              </div>

              <Button
                onClick={() => setBenchmarksOpen(true)}
                className="h-10 px-4 text-xs font-bold rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-lg flex items-center gap-1.5"
              >
                <span>View Full National Benchmarks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <EcdBenchmarksDialog
        isOpen={benchmarksOpen}
        onClose={() => setBenchmarksOpen(false)}
      />
    </>
  );
}
