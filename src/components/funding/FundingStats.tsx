"use client";

import { Card, CardContent } from "@/components/ui/card";

interface StatItemProps {
  number: string;
  label: string;
}

const StatItem = ({ number, label }: StatItemProps) => (
  <div className="text-center p-4 bg-gradient-to-br from-background to-secondary/10 rounded-lg">
    <span className="text-3xl font-bold text-primary block">{number}</span>
    <div className="text-sm text-muted-foreground mt-1">{label}</div>
  </div>
);

interface FundingStatsProps {
  stats: {
    activeOpportunities: string;
    totalAvailable: string;
    schoolsFunded: string;
    successRate: string;
  };
}

export default function FundingStats({ stats }: FundingStatsProps) {
  return (
    <Card className="mb-8 shadow-lg glassmorphism">
      <CardContent className="p-6">
        <h3 className="text-xl font-headline font-semibold text-primary mb-4">Funding Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem number={stats.activeOpportunities} label="Active Opportunities" />
          <StatItem number={stats.totalAvailable} label="Total Available" />
          <StatItem number={stats.schoolsFunded} label="Schools Funded" />
          <StatItem number={stats.successRate} label="Success Rate" />
        </div>
      </CardContent>
    </Card>
  );
}
