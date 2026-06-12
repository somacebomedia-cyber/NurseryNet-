// src/app/(main)/preschools/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Search as SearchIcon, TrendingUp, Gift, Eye, Briefcase, Users, BarChart2, ShieldCheck, MessageSquare, FileText, Zap } from "lucide-react";
import Link from "next/link";
import { useBrand } from "@/context/BrandContext";
import { brandQueryParam } from "@/components/layout/Navbar";

const pageContent = {
    NurseryNet: {
        title: "Grow Your Preschool with NurseryNet",
        description: "Access a suite of powerful tools designed to help you attract more families, enhance your brand, and streamline your operations. Start for free or choose a plan that fits your ambitions.",
        toolsTitle: "Our Exclusive AI & Growth Tools",
        benefitsTitle: "Everything You Need to Shine"
    },
    PrimaryNet: {
        title: "Elevate Your Primary School with PrimaryNet",
        description: "Equip your primary school with digital tools for enhanced learning, parent communication, and administrative efficiency. Discover our tailored solutions.",
        toolsTitle: "Our Digital Classroom & Admin Tools",
        benefitsTitle: "A Foundation for Future Success"
    },
    HighschoolNet: {
        title: "Empower Your High School with HighschoolNet",
        description: "Provide students with cutting-edge tools for career guidance and university prep, while giving counselors and administrators the resources they need to manage success.",
        toolsTitle: "University & Career Readiness Suite",
        benefitsTitle: "Guiding the Next Generation"
    },
    TertiaryNet: {
        title: "Advance Your Institution with TertiaryNet",
        description: "From AI-powered research assistants to corporate partnership portals, discover tools that will attract top students and enhance your institution's reputation.",
        toolsTitle: "Tools for Academic & Career Excellence",
        benefitsTitle: "Fostering Innovation and Employability"
    }
};

const featuresForPreschools = [
  {
    title: "AI Logo Magic",
    description: "Craft a unique brand with our AI-powered logo generator, or have our team professionally animate your existing logo.",
    icon: Wand2,
    href: "/preschools/logo-generator",
    cta: "Generate Your Logo"
  },
  {
    title: "AI Funding Hub",
    description: "Discover grants and financial support, then generate proposals and business plans with AI.",
    icon: SearchIcon,
    href: "/funding", // Updated Link
    cta: "Find Funding"
  },
  {
    title: "ROI Calculator",
    description: "Estimate your potential growth and return on investment with NurseryNet.",
    icon: TrendingUp,
    href: "/preschools/roi-calculator",
    cta: "Calculate Your ROI"
  },
  {
    title: "Free Growth Kit",
    description: "Access a library of essential documents like clearance forms, checklists, and templates to streamline your admin.",
    icon: Gift,
    href: "/preschools/growth-kit",
    cta: "Access Resources"
  },
  {
    title: "Profile Preview",
    description: "Visualize how your school will captivate parents on NurseryNet (Coming Soon).",
    icon: Eye,
    href: "/preschools/profile-preview",
    cta: "Preview Your Profile"
  }
];

const generalPlatformFeatures = [
    { title: "Customizable Profiles", description: "Showcase your unique offerings, philosophy, and facilities with beautiful, easy-to-manage profiles that attract parents and students.", icon: Briefcase },
    { title: "Free Value for All", description: "Every listed institution receives our high-value weekly newsletter via WhatsApp and access to essential admin templates, completely free!", icon: Zap },
    { title: "Premium Content & Resources", description: "Paid tiers unlock monthly social media posts, newsletter segments, and downloadable curriculum-aligned worksheets with custom branding options.", icon: FileText },
    { title: "Integrated Website Services", description: "Opt for a professionally designed website for your school, seamlessly integrated with your platform profile and tools (add-on service).", icon: Eye },
    { title: "Targeted Lead Generation", description: "Attract interested parents and students directly through your profile, connecting you with families and applicants in your area.", icon: Users },
    { title: "Advanced Analytics", description: "Track profile views, engagement, and leads. Get weekly performance insights via WhatsApp to make data-driven decisions (Growth Navigator Plan).", icon: BarChart2 },
    { title: "Secure & Reliable Platform", description: "Trust in a platform built with security and reliability at its core, ensuring your data and your users' data is safe.", icon: ShieldCheck },
    { title: "Community & Support", description: "Access community forums and priority support channels based on your plan.", icon: MessageSquare },
];


export default function ForPreschoolsHubPage() {
  const { brand } = useBrand();
  const content = pageContent[brand] || pageContent.NurseryNet;
  const bqp = brandQueryParam(brand);
  const institutionType = brand === 'NurseryNet' ? 'preschool' : 
                          brand === 'PrimaryNet' ? 'primary school' :
                          brand === 'HighschoolNet' ? 'high school' :
                          'institution';

  return (
    <div className="bg-gradient-to-br from-background to-secondary/30 py-12 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <Briefcase className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
            {content.title}
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl">
            {content.description}
          </p>
        </header>

        <section id="preschool-tools" className="mb-16 md:mb-24">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl text-center mb-10">
            {content.toolsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresForPreschools.map((feature) => (
              <Card key={feature.title} className="flex flex-col hover:shadow-xl transition-shadow duration-300 glassmorphism">
                <CardHeader className="text-center">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                    <feature.icon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href={`${feature.href}${bqp ? `?${bqp}` : ''}`}>{feature.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
        
        <section id="platform-benefits" className="mb-16 md:mb-24">
           <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl text-center mb-10">
            {content.benefitsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {generalPlatformFeatures.map(feature => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow duration-300 glassmorphism text-center">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2"> <feature.icon className="h-8 w-8 text-primary"/></div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground rounded-xl shadow-2xl">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              What is it costing you to not be on {brand}?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg">
              Every day you wait, another school is connecting with families that could have been yours, securing funding you didn't know existed, and building a brand that outshines the competition. The risk isn't in joining—it's in being left behind.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 shadow-lg">
                <Link href={`/pricing${bqp ? `?${bqp}` : ''}`}>Explore Our Plans & Join Today!</Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
