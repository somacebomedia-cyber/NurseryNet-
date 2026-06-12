// src/app/(main)/preschools/roi-calculator/page.tsx
import RoiCalculator from '@/components/marketing/RoiCalculator';
import { TrendingUp } from 'lucide-react';

export default function RoiCalculatorPage() {
  return (
    <div className="py-12 md:py-20 bg-gradient-to-br from-background to-secondary/30 min-h-[calc(100vh-var(--header-height,8rem))] flex items-center">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
            Preschool ROI Calculator
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Estimate your potential growth and return on investment by partnering with NurseryNet.
          </p>
        </header>
        <RoiCalculator />
      </div>
    </div>
  );
}
