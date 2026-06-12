
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  planName: string;
  price: string;
  originalPrice?: string; // For crossed-out price
  priceDetails?: string;
  features: string[];
  ctaText: string;
  ctaLink?: string;
  ctaAction?: () => void;
  isPopular?: boolean;
  isFree?: boolean;
  isLoading?: boolean;
}

export default function PricingCard({
  planName,
  price,
  originalPrice,
  priceDetails = "/ month",
  features,
  ctaText,
  ctaLink,
  ctaAction,
  isPopular = false,
  isFree = false,
  isLoading = false,
}: PricingCardProps) {
    
  const CtaComponent = ctaLink ? Link : 'button';

  return (
    <Card className={cn(
      "flex flex-col rounded-xl shadow-2xl glassmorphism overflow-hidden transform hover:scale-105 transition-transform duration-300",
      isPopular ? "border-2 border-accent ring-4 ring-accent/30" : "border-primary/20"
    )}>
      {isPopular && (
        <div className="py-2 px-4 bg-accent text-center font-semibold text-accent-foreground">
          Most Popular
        </div>
      )}
      <CardHeader className="items-center text-center p-6 bg-card/30">
        <CardTitle className="text-3xl font-headline text-primary">{planName}</CardTitle>
        <div className="mt-4">
          {originalPrice && !isFree && (
            <p className="text-xl line-through text-muted-foreground">{originalPrice}</p>
          )}
          <span className="text-5xl font-extrabold text-primary">{price}</span>
          {!isFree && (
            <span className="ml-1 text-xl font-medium text-muted-foreground">{priceDetails}</span>
          )}
          {isFree && (
             <span className="ml-1 text-xl font-medium text-muted-foreground">Forever</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-8">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-6 w-6 text-green-500 mr-2 shrink-0" />
              <span className="text-foreground/90">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-6 bg-card/30">
        <Button 
            asChild={!!ctaLink} 
            size="lg" 
            className={cn("w-full text-lg py-3", isPopular ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary hover:bg-primary/90")}
            onClick={ctaAction}
            disabled={isLoading}
        >
          {ctaLink ? (
             <Link href={ctaLink}>{ctaText}</Link>
          ) : (
            <>
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {ctaText}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
