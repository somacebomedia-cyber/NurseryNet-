
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useBrand } from '@/context/BrandContext';

const currencyConfig = {
  ZAR: {
    symbol: 'R',
    fee: { min: 500, max: 10000, default: 2000, step: 100 },
    costOptions: [
      { label: "R199 (Creative)", value: 199 },
      { label: "R399 (Growth)", value: 399 }
    ],
    defaultCost: 399,
  },
  GBP: {
    symbol: '£',
    fee: { min: 200, max: 2000, default: 600, step: 10 },
    costOptions: [
      { label: "£29 (Creative)", value: 29 },
      { label: "£49 (Growth)", value: 49 }
    ],
    defaultCost: 49,
  },
  USD: {
    symbol: '$',
    fee: { min: 250, max: 2500, default: 750, step: 10 },
    costOptions: [
      { label: "$39 (Creative)", value: 39 },
      { label: "$59 (Growth)", value: 59 }
    ],
    defaultCost: 59,
  },
  EUR: {
    symbol: '€',
    fee: { min: 220, max: 2200, default: 650, step: 10 },
    costOptions: [
      { label: "€35 (Creative)", value: 35 },
      { label: "€55 (Growth)", value: 55 }
    ],
    defaultCost: 55,
  },
};

type Currency = keyof typeof currencyConfig;

interface RoiCalculatorProps {
    currency?: Currency;
}

export default function RoiCalculator({ currency: initialCurrency = 'ZAR' }: RoiCalculatorProps) {
  const { brand } = useBrand();
  const [currency, setCurrency] = useState(initialCurrency);

  // Update currency when prop changes
  useEffect(() => {
    setCurrency(initialCurrency);
  }, [initialCurrency]);
  
  const config = currencyConfig[currency];

  const [currentStudents, setCurrentStudents] = useState<number>(30);
  const [monthlyFee, setMonthlyFee] = useState<number>(config.fee.default);
  const [nurseryNetCost, setNurseryNetCost] = useState<number>(config.defaultCost);
  const [estimatedNewStudents, setEstimatedNewStudents] = useState<number>(5);

  const [projectedRevenue, setProjectedRevenue] = useState<number>(0);
  const [roiPercentage, setRoiPercentage] = useState<number>(0);
  const [netGain, setNetGain] = useState<number>(0);
  
  const formatCurrency = (amount: number) => `${config.symbol}${amount.toFixed(2)}`;
  const formatNumber = (num: number) => num.toLocaleString();

  // Reset states when currency or brand changes
  useEffect(() => {
    const newConfig = currencyConfig[currency];
    setMonthlyFee(newConfig.fee.default);
    setNurseryNetCost(newConfig.defaultCost);
  }, [currency, brand]);

  useEffect(() => {
    const additionalRevenueFromNewStudents = estimatedNewStudents * monthlyFee;
    const totalProjectedRevenue = (currentStudents * monthlyFee) + additionalRevenueFromNewStudents;
    
    setProjectedRevenue(totalProjectedRevenue);

    const gainFromInvestment = additionalRevenueFromNewStudents;
    const costOfInvestment = nurseryNetCost;
    
    if (costOfInvestment > 0) {
      const calculatedRoi = ((gainFromInvestment - costOfInvestment) / costOfInvestment) * 100;
      setRoiPercentage(calculatedRoi);
      setNetGain(gainFromInvestment - costOfInvestment);
    } else {
      setRoiPercentage(gainFromInvestment > 0 ? Infinity : 0);
      setNetGain(gainFromInvestment);
    }
  }, [currentStudents, monthlyFee, nurseryNetCost, estimatedNewStudents]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const institutionType = brand === 'NurseryNet' ? 'Preschool' :
                          brand === 'PrimaryNet' ? 'Primary School' :
                          brand === 'HighschoolNet' ? 'High School' :
                          'Institution';

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl glassmorphism">
      <CardHeader className="text-center">
        <div className="inline-block p-3 bg-primary/20 rounded-full mb-3 mx-auto">
          <TrendingUp className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-3xl">Calculate Your {institutionType}'s Growth</CardTitle>
        <CardDescription className="text-lg">
          Estimate your potential return on investment with {brand}. Adjust the sliders to see the impact!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Inputs Column */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="currentStudents" className="text-base flex items-center mb-1">
                <Users className="mr-2 h-5 w-5 text-primary/80" /> Current Number of Students: <span className="font-bold ml-2 text-primary">{formatNumber(currentStudents)}</span>
              </Label>
              <Slider
                id="currentStudents"
                min={5} max={200} step={1}
                value={[currentStudents]}
                onValueChange={(value) => setCurrentStudents(value[0])}
              />
            </div>
            <div>
              <Label htmlFor="monthlyFee" className="text-base flex items-center mb-1">
                <DollarSign className="mr-2 h-5 w-5 text-primary/80" /> Average Monthly Fee per Student: <span className="font-bold ml-2 text-primary">{formatCurrency(monthlyFee)}</span>
              </Label>
              <Slider
                id="monthlyFee"
                min={config.fee.min} max={config.fee.max} step={config.fee.step}
                value={[monthlyFee]}
                onValueChange={(value) => setMonthlyFee(value[0])}
              />
            </div>
            <div>
              <Label htmlFor="nurseryNetCost" className="text-base flex items-center mb-1">
                <DollarSign className="mr-2 h-5 w-5 text-primary/80" /> {brand} Monthly Plan: <span className="font-bold ml-2 text-primary">{formatCurrency(nurseryNetCost)}</span>
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                 {config.costOptions.map(opt => (
                    <Button key={opt.value} type="button" size="sm" variant={nurseryNetCost === opt.value ? "default" : "outline"} onClick={() => setNurseryNetCost(opt.value)}>{opt.label}</Button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="estimatedNewStudents" className="text-base flex items-center mb-1">
                <Users className="mr-2 h-5 w-5 text-primary/80" /> Est. New Students per Month (via {brand}): <span className="font-bold ml-2 text-primary">{formatNumber(estimatedNewStudents)}</span>
              </Label>
              <Slider
                id="estimatedNewStudents"
                min={1} max={20} step={1}
                value={[estimatedNewStudents]}
                onValueChange={(value) => setEstimatedNewStudents(value[0])}
              />
            </div>
          </div>

          {/* Results Column */}
          <div className="space-y-6 p-6 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="text-2xl font-headline font-semibold text-primary text-center mb-4">Your Estimated Results</h3>
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Est. Additional Monthly Revenue</p>
                <p className="text-3xl font-bold text-green-600 animate-slide-in-up">{formatCurrency(estimatedNewStudents * monthlyFee)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Net Monthly Gain (after {brand} cost)</p>
                <p className="text-3xl font-bold text-green-600 animate-slide-in-up" style={{'animationDelay': '0.1s'}}>{formatCurrency(netGain)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projected Return on Investment (ROI)</p>
                <p className="text-5xl font-bold text-primary animate-slide-in-up" style={{'animationDelay': '0.2s'}}>
                  {isFinite(roiPercentage) ? `${formatNumber(Math.round(roiPercentage))}%` : 'Huge!'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Total Monthly Revenue (with {brand})</p>
                <p className="text-2xl font-bold text-primary/80 animate-slide-in-up" style={{'animationDelay': '0.3s'}}>{formatCurrency(projectedRevenue)}</p>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="text-center">
        <p className="text-xs text-muted-foreground w-full">
          *This calculator provides an estimate for illustrative purposes only. Actual results may vary.
        </p>
      </CardFooter>
    </Card>
  );
}

    
  
