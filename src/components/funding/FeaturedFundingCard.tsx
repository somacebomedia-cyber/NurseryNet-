
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Link from "next/link";

interface FeaturedFundingCardProps {
  title: string;
  description: string;
  applyLink: string;
  learnMoreLink: string;
}

export default function FeaturedFundingCard({
  title,
  description,
  applyLink,
  learnMoreLink,
}: FeaturedFundingCardProps) {
  return (
    <Card className="bg-gradient-to-r from-primary to-[hsl(256,50%,52%)] text-primary-foreground p-6 rounded-xl shadow-lg relative overflow-hidden mb-8">
      <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-white/10 rounded-full opacity-50"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-44 h-44 bg-white/10 rounded-full opacity-50"></div>
      
      <div className="relative z-10">
        <Badge variant="secondary" className="bg-white/20 text-white mb-4 py-2 px-4 text-sm">
          <Star className="w-4 h-4 mr-2 fill-current" />
          Featured Opportunity
        </Badge>
        <h2 className="text-2xl font-headline font-semibold mb-3">{title}</h2>
        <p className="mb-4 opacity-90 text-base">{description}</p>
        <div className="flex flex-wrap gap-4">
          <Button asChild className="bg-white text-primary hover:bg-gray-100 font-semibold">
            <Link href={applyLink}>Apply Now</Link>
          </Button>
          <Button asChild variant="outline" className="border-white text-white hover:bg-white/10 hover:text-white font-semibold">
            <Link href={learnMoreLink}>Learn More</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
