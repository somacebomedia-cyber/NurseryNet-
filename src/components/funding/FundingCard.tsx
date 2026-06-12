// src/components/funding/FundingCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Building2, CalendarDays, CheckCircle2, Globe, HandCoins, Laptop, MapPin, Presentation, Users, Utensils, Factory, FlaskConical, School, Landmark, DraftingCompass } from "lucide-react";
import Link from "next/link";
import { LucideIconName } from "@/ai/schemas/funding-schemas";


const iconMap: Record<LucideIconName, React.ElementType> = {
  Building2, Globe, School, Landmark, Factory,
  Users, Laptop, Presentation, FlaskConical, Utensils
};

export interface FundingCardProps {
  id: string;
  category: string;
  deadlineInfo?: string;
  headerImage: string;
  headerImageHint: string;
  providerLogo: string;
  providerLogoHint: string;
  title: string;
  providerName: string;
  providerTypeIcon: LucideIconName;
  fundingAmount: string;
  deadlineDate: string;
  location: string;
  metaIcon?: LucideIconName;
  metaText?: string;
  description: string;
  requirements: string[];
  detailsLink?: string;
  isInitiallySaved?: boolean;
  onGenerateProposal: () => void;
}


export default function FundingCard({
  category,
  deadlineInfo,
  headerImage,
  headerImageHint,
  providerLogo,
  providerLogoHint,
  title,
  providerName,
  providerTypeIcon,
  fundingAmount,
  deadlineDate,
  location,
  metaIcon,
  metaText,
  description,
  requirements,
  detailsLink,
  isInitiallySaved = false,
  onGenerateProposal,
}: FundingCardProps) {
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const ProviderIcon = iconMap[providerTypeIcon];
  const MetaIconComponent = metaIcon ? iconMap[metaIcon] : null;

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-transform duration-300 hover:-translate-y-1 glassmorphism bg-gradient-to-br from-primary/95 to-primary/80 text-primary-foreground">
      <CardHeader className="p-0 relative">
        {category && <Badge className="absolute top-4 left-4 z-10 bg-background/20 text-white px-3 py-1 text-xs backdrop-blur-sm">{category}</Badge>}
        {deadlineInfo && <Badge variant="destructive" className="absolute top-4 right-4 z-10 px-3 py-1 text-xs">{deadlineInfo}</Badge>}
        <div className="h-40 w-full overflow-hidden">
          <Image src={headerImage} alt={title} data-ai-hint={headerImageHint} width={400} height={180} className="w-full h-full object-cover opacity-50" />
        </div>
      </CardHeader>
      <CardContent className="p-5 flex flex-col flex-grow bg-card text-card-foreground">
        <div className="relative mb-3">
          <Image 
            src={providerLogo} 
            alt={`${providerName} logo`} 
            data-ai-hint={providerLogoHint}
            width={60} 
            height={60} 
            className="rounded-lg object-contain border bg-card p-1 shadow-md -mt-10"
          />
        </div>
        <CardTitle className="text-lg font-semibold text-primary mb-1 leading-tight">{title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          {ProviderIcon && <ProviderIcon className="w-4 h-4 mr-1.5 text-primary/70" />}
          {providerName}
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground mb-3">
          <div className="flex items-center">
            <HandCoins className="w-3.5 h-3.5 mr-1.5 text-primary/70" /> {fundingAmount}
          </div>
          <div className="flex items-center">
            <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-primary/70" /> {deadlineDate}
          </div>
          <div className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary/70" /> {location}
          </div>
          {MetaIconComponent && metaText && (
            <div className="flex items-center">
              <MetaIconComponent className="w-3.5 h-3.5 mr-1.5 text-primary/70" /> {metaText}
            </div>
          )}
        </div>

        <p className="text-sm text-foreground/80 mb-4 line-clamp-3 flex-grow">{description}</p>

        <div className="bg-primary/5 p-3 rounded-md mb-4">
          <h4 className="text-xs font-semibold text-primary mb-1.5 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Key Requirements
          </h4>
          <ul className="list-disc list-inside pl-1 space-y-0.5">
            {requirements.map((req, index) => (
              <li key={index} className="text-xs text-muted-foreground">{req}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-wrap gap-2 justify-between items-center bg-card border-t border-border/30 mt-auto">
        <Button onClick={onGenerateProposal} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-4 flex-1 min-w-max">
           <DraftingCompass className="w-4 h-4 mr-2" /> Generate Proposal
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setIsSaved(!isSaved)} title="Save for later" className={`rounded-full hover:bg-primary/10 ${isSaved ? 'text-primary' : 'text-muted-foreground'}`}>
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-primary' : ''}`} />
        </Button>
      </CardFooter>
    </Card>
  );
}
