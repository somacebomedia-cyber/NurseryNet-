
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { TrendingUp, Calendar, Repeat } from 'lucide-react';

const formatCurrency = (amount: number) => `R ${amount.toFixed(2)}`;

export default function AffiliateRoiCalculator() {
  // Scenario values for Growth Navigator Plan
  const r399Referrals = 5;
  const r399Price = 399;
  const r399CommissionRate = 0.50;
  const r399CommissionMonths = 3;
  const r399TotalEarning = r399Referrals * r399Price * r399CommissionRate * r399CommissionMonths;

  // Scenario values for Creative Canvas Plan
  const r199Referrals = 5;
  const r199Price = 199;
  const r199CommissionRate = 0.20;
  const r199MonthlyEarning = r199Referrals * r199Price * r199CommissionRate;
  const r199AnnualEarning = r199MonthlyEarning * 12;

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-2xl glassmorphism">
      <CardHeader className="text-center">
        <div className="inline-block p-3 bg-primary/20 rounded-full mb-3 mx-auto">
          <TrendingUp className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-3xl text-primary">Earning Potential Scenarios</CardTitle>
        <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
          You have two great ways to earn. Here’s what referring just 5 schools to each of our plans could look like.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
        {/* Scenario 1: Growth Navigator */}
        <div className="p-6 bg-primary/5 rounded-lg border border-primary/20 flex flex-col">
          <h3 className="font-headline text-2xl font-semibold text-primary mb-2">Growth Navigator Plan</h3>
          <p className="text-muted-foreground mb-4 font-medium">50% Commission for 3 Months</p>
          <p className="text-base text-foreground/90">If you refer <strong className="text-accent font-bold">5 schools</strong> to this plan:</p>
          <div className="my-4 flex-grow flex flex-col justify-center">
            <p className="text-5xl font-bold text-primary animate-slide-in-up">{formatCurrency(r399TotalEarning)}</p>
            <p className="text-muted-foreground flex items-center justify-center gap-1.5"><Calendar className="w-4 h-4" /> Total earnings over 3 months</p>
          </div>
          <p className="text-sm text-muted-foreground mt-auto">A powerful upfront payment for helping schools grow fast!</p>
        </div>

        {/* Scenario 2: Creative Canvas */}
        <div className="p-6 bg-accent/5 rounded-lg border border-accent/20 flex flex-col">
          <h3 className="font-headline text-2xl font-semibold text-accent mb-2">Creative Canvas Plan</h3>
          <p className="text-muted-foreground mb-4 font-medium">20% RECURRING Commission</p>
          <p className="text-base text-foreground/90">If you refer <strong className="text-primary font-bold">5 schools</strong> to this plan:</p>
          <div className="my-4 flex-grow flex flex-col justify-center">
            <p className="text-5xl font-bold text-accent animate-slide-in-up" style={{ animationDelay: '0.1s' }}>{formatCurrency(r199MonthlyEarning)}</p>
            <p className="text-muted-foreground flex items-center justify-center gap-1.5"><Repeat className="w-4 h-4" /> Every single month!</p>
          </div>
          <p className="text-sm text-muted-foreground mt-auto">Build a reliable, passive income stream that grows with every referral.</p>
        </div>
      </CardContent>
       <CardFooter className="text-center">
        <p className="text-xs text-muted-foreground w-full">
          *Scenarios are for illustrative purposes. Your actual earnings will depend on the number and type of successful referrals.
        </p>
      </CardFooter>
    </Card>
  );
}
