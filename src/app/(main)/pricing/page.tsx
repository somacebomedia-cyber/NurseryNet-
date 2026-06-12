
"use client";

import { useState } from 'react';
import PricingCard from '@/components/marketing/PricingCard';
import RoiCalculator from '@/components/marketing/RoiCalculator';
import ColorfulStripes from '@/components/marketing/ColorfulStripes';
import FloatingElements from '@/components/marketing/FloatingElements';
import AnimatedBird from '@/components/marketing/AnimatedBird';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles, Gift, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useBrand } from '@/context/BrandContext';
import { brandQueryParam } from '@/components/layout/Navbar';

const pricingData = {
  ZAR: {
    discovery: { price: "R0", originalPrice: "", priceDetails: "Forever" },
    creative: { price: "R199", originalPrice: "R799", priceDetails: "/ month", planId: 'creative' },
    growth: { price: "R399", originalPrice: "R1999", priceDetails: "/ month", planId: 'growth' },
  },
  GBP: {
    discovery: { price: "£0", originalPrice: "", priceDetails: "Forever" },
    creative: { price: "£29", originalPrice: "£79", priceDetails: "/ month", planId: 'creative' },
    growth: { price: "£49", originalPrice: "£199", priceDetails: "/ month", planId: 'growth' },
  },
  USD: {
    discovery: { price: "$0", originalPrice: "", priceDetails: "Forever" },
    creative: { price: "$39", originalPrice: "$89", priceDetails: "/ month", planId: 'creative' },
    growth: { price: "$59", originalPrice: "$249", priceDetails: "/ month", planId: 'growth' },
  },
  EUR: {
    discovery: { price: "€0", originalPrice: "", priceDetails: "Forever" },
    creative: { price: "€35", originalPrice: "€85", priceDetails: "/ month", planId: 'creative' },
    growth: { price: "€55", originalPrice: "€229", priceDetails: "/ month", planId: 'growth' },
  },
};

const newsletterValues = {
    ZAR: "R499/month",
    GBP: "£45/month",
    USD: "$50/month",
    EUR: "€50/month",
};

type Currency = keyof typeof pricingData;


export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>('ZAR');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { brand } = useBrand();
  const bqp = brandQueryParam(brand);

  const selectedPrices = pricingData[currency];
  const selectedNewsletterValue = newsletterValues[currency];

  const handleCheckout = async (planId: string) => {
    if (!user) {
        toast({
            title: "Authentication Required",
            description: "Please sign up or log in to choose a plan.",
            variant: "destructive"
        });
        router.push(`/signup${bqp ? `?${bqp}` : ''}`);
        return;
    }
    if (user.role !== 'Preschool Owner' && brand === 'NurseryNet') {
      toast({
            title: "Action Not Allowed",
            description: "Only Preschool Owners can subscribe to plans.",
            variant: "destructive"
        });
        return;
    }

    setIsLoading(planId);
    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                planId, 
                userId: user.uid,
                userEmail: user.email,
                currency: currency,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || 'Failed to create checkout session.');
        }
        
        const { approvalUrl } = await response.json();

        if (approvalUrl) {
            window.location.href = approvalUrl;
        } else {
            throw new Error('Could not get payment approval URL.');
        }

    } catch (error: any) {
        console.error("Checkout error:", error);
        toast({
            title: "Something went wrong",
            description: error.message || "Could not redirect to payment. Please try again.",
            variant: "destructive"
        });
        console.error(error);
    } finally {
        setIsLoading(null);
    }
  };
  
  const institutionType = brand === 'NurseryNet' ? 'preschool' : 
                          brand === 'PrimaryNet' ? 'primary school' :
                          brand === 'HighschoolNet' ? 'high school' :
                          'institution';

  const getFloatingElements = () => {
    switch (brand) {
      case 'NurseryNet':
        return <FloatingElements count={20} elementTypes={['heart', 'circle']} colorClasses={['text-accent', 'text-accent-blue-DEFAULT']} />;
      case 'PrimaryNet':
        return <FloatingElements count={20} elementTypes={['circle']} colorClasses={['text-secondary/50', 'text-white/50']} />;
      case 'HighschoolNet':
        return <FloatingElements count={10} elementTypes={['square']} colorClasses={['text-white/30']} />;
      case 'TertiaryNet':
        return <FloatingElements count={15} elementTypes={['line']} colorClasses={['text-secondary/40']} />;
      default:
        return null;
    }
  };

  const plans = [
    {
      id: "discovery",
      planName: "Discovery Spark",
      isFree: true,
      features: [
        "Basic Directory Listing",
        "Standard Profile Page",
        "Photo Gallery (up to 10 images)",
        "24-Hour Profile Stories",
        `Weekly High-Value Newsletter (via WhatsApp) - Expert insights, activity ideas & industry news (Est. Value ${selectedNewsletterValue})`,
        `Free Downloadable Admin Templates (Contracts, Registration Forms, etc.)`,
        "Community Forum Access"
      ],
      ctaText: "Get Started Free",
      ctaLink: `/signup${bqp ? `?${bqp}` : ''}`,
    },
    {
      id: "creative",
      planName: "Creative Canvas",
      features: [
        "All Discovery Spark features, plus:",
        "Enhanced Profile Visibility",
        "AI Logo Generator (Create New or Upload)",
        "4 AI-Generated Social Media Posts per Month",
        `Downloadable Curriculum Worksheets (CAPS, British, American) - ${brand} Branded`,
        `Remove ${brand} Branding from Profile`,
      ],
      ctaText: "Choose Creative",
      ctaAction: () => handleCheckout('creative'),
    },
    {
      id: "growth",
      planName: "Growth Navigator",
      features: [
        "All Creative Canvas features, plus:",
        "**100 FREE Business Cards with QR Code to your profile (one-time)**",
        "Premium Directory Placement (Top Results)",
        "Advanced SEO for your Profile Page",
        "AI Logo Animator",
        "AI Funding Opportunities Finder",
        "AI Worksheet Grading & Parent Reporting",
        "AI Quarterly Report Card Generator",
        "Interactive ROI Calculator Tool",
        `Downloadable Curriculum Worksheets (CAPS, British, American) - Your ${institutionType}'s Logo`,
        "Advanced Profile Analytics Dashboard",
        "Weekly Performance Reports (via WhatsApp)",
        "Premium Monthly Content Pack (20 Social Media Posts & Newsletter Segments)",
        "Priority Email & Chat Support",
        "Access to Exclusive Webinars & Growth Resources"
      ],
      ctaText: "Go Pro",
      ctaAction: () => handleCheckout('growth'),
      isPopular: true,
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section with Colorful Stripes */}
      <section className="relative w-full py-20 md:py-32 bg-background overflow-hidden">
        {brand === 'NurseryNet' && <ColorfulStripes className="opacity-50" />}
        {getFloatingElements()}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge variant="outline" className="text-sm py-1 px-3 border-primary text-primary bg-primary/10 mb-4 font-semibold">
            <Zap className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" /> Limited Launch Pricing
          </Badge>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
            Plans Designed for Your Growth
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Choose the perfect plan to help your {institutionType} flourish. Lock in your plan now before prices increase after our official launch.
          </p>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
           <div className="flex justify-center mb-10">
            <Tabs value={currency} onValueChange={(value) => setCurrency(value as Currency)} className="w-auto">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
                <TabsTrigger value="ZAR">South Africa (ZAR)</TabsTrigger>
                <TabsTrigger value="GBP">United Kingdom (GBP)</TabsTrigger>
                <TabsTrigger value="USD">United States (USD)</TabsTrigger>
                <TabsTrigger value="EUR">Europe (EUR)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <PricingCard 
                key={plan.id} 
                {...plan}
                isLoading={isLoading === plan.id}
                price={(selectedPrices[plan.id as keyof typeof selectedPrices] as any).price}
                originalPrice={(selectedPrices[plan.id as keyof typeof selectedPrices]as any).originalPrice}
                priceDetails={(selectedPrices[plan.id as keyof typeof selectedPrices] as any).priceDetails}
              />
            ))}
          </div>
          <div className="mt-12 text-center text-muted-foreground space-y-2">
            <p className="font-semibold">Securely powered by PayPal & Paystack. We accept all major credit cards.</p>
            <p>All plans include free setup and onboarding assistance. Need a custom solution? <a href="/contact" className="text-primary hover:underline">Contact us</a>.</p>
          </div>
        </div>
      </section>
      
      {/* ROI Calculator Section with Flying Bird */}
      <section className="relative w-full py-16 md:py-24 bg-purple-blue-gradient text-primary-foreground overflow-hidden">
        <FloatingElements count={15} elementTypes={['star']} colorClasses={['text-yellow-300', 'text-pink-300']} />
         <div className="absolute top-10 right-10 opacity-30 md:opacity-70 transform scale-75 md:scale-100">
           <AnimatedBird />
        </div>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
           <h2 className="font-headline text-3xl font-bold tracking-tight text-center mb-2 sm:text-4xl text-yellow-300">
            Maximize Your {institutionType}'s Potential
          </h2>
          <p className="text-center text-lg mb-10 max-w-3xl mx-auto">Use our interactive calculator to see how {brand} can drive significant growth and returns for your {institutionType}.</p>
          <RoiCalculator currency={currency} />
        </div>
      </section>

      {/* FAQ Section Placeholder */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              { q: "Is there really a free plan?", a: `Absolutely! Our Discovery Spark plan is completely free. It includes a basic directory listing, standard profile page, photo gallery, our high-value weekly newsletter via WhatsApp, and access to free downloadable admin templates.` },
              { q: "What's included in the AI Logo Generator vs. Animator?", a: "The AI Logo Generator (Creative Canvas plan) helps you create a new static logo or upload your existing one. The AI Logo Animator (Growth Navigator plan) takes your static logo and creates an engaging animation for it." },
              { q: "What kind of social media content do I get with the paid plans?", a: "The Creative Canvas plan gives you 4 AI-generated social media posts per Month. The Growth Navigator plan gives you a premium pack of 20 posts and newsletter segments." },
              { q: "What are the downloadable worksheets?", a: `Paid plans get access to curriculum-aligned worksheets (CAPS, British, American). The Creative Canvas plan worksheets are ${brand} branded. The Growth Navigator plan allows your ${institutionType}'s logo on these worksheets.` },
              { q: "Can I upgrade or downgrade my plan later?", a: "Yes, you can change your plan at any time to suit your school's evolving needs." },
              { q: "How does the platform help me get more students?", a: `By listing your ${institutionType} in our directory, enhancing your online presence with professional profiles and AI tools, providing valuable content (newsletters, marketing posts), and offering resources like worksheets, we help you attract and engage more local parents and students.` }
            ].map(faq => (
              <Card key={faq.q} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

       {/* Call to Action */}
      <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            What is it costing you to not be on {brand}?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg">
            Every day you wait, another school is connecting with families that could have been yours, securing funding you didn't know existed, and building a brand that outshines the competition. The risk isn't in joining—it's in being left behind.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 shadow-lg">
              <Link href={`/pricing${bqp ? `?${bqp}` : ''}`}>View Pricing Plans</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground bg-primary hover:bg-primary-foreground/10 shadow-lg">
              <Link href={`/contact${bqp ? `?${bqp}` : ''}`}>Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
