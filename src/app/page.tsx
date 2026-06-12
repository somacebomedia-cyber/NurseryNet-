
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, TrendingUp, Users, Briefcase, Wand2, Search, Gift, Eye, ChevronDown, BrainCircuit, Zap, School, BookOpenCheck, GraduationCap, DollarSign, Book } from 'lucide-react';
import AnimatedBird from '@/components/marketing/AnimatedBird';
import FloatingElements from '@/components/marketing/FloatingElements';
import ColorfulStripes from '@/components/marketing/ColorfulStripes';
import ThreeDElements from '@/components/marketing/ThreeDElements';
import Image from 'next/image';
import Testimonials from '@/components/marketing/Testimonials';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useBrand } from '@/context/BrandContext';
import { cn } from '@/lib/utils';


const brandContent = {
  NurseryNet: {
    heroTitle: "Discover & Grow Your Preschool with",
    heroSubtitle: "The ultimate platform connecting parents with amazing preschools, and empowering owners with powerful AI business growth & marketing tools.",
    cta1: "Find a Preschool",
    cta2: "For Preschool Owners",
    features: [
        { icon: Search, title: 'Effortless Preschool Discovery', description: 'Our intuitive directory makes finding the perfect learning environment for your child simple and stress-free.' },
        { icon: Wand2, title: 'Instant Professional Branding', description: 'Our AI generates stunning logos and marketing content, giving your school the professional image it deserves.' },
        { icon: BrainCircuit, title: 'AI-Powered Funding & Strategy', description: 'Access an AI agent that finds tailored funding opportunities and drafts grant proposals for you.' },
        { icon: Zap, title: 'The Complete Growth Toolkit', description: 'Get a full suite of tools: parent inquiry management, performance analytics, and a direct line to new families.' },
    ],
    splashTitle: "A Splash of Fun & Creativity",
    splashDescription: "Our platform is designed to be engaging and inspiring, reflecting the joyful spirit of early childhood education."
  },
  PrimaryNet: {
    heroTitle: "Find & Elevate Your Primary School with",
    heroSubtitle: "A comprehensive ecosystem connecting families with great primary schools, and providing educators with tools for digital learning and parent communication.",
    cta1: "Find a Primary School",
    cta2: "For School Administrators",
    features: [
        { icon: Search, title: 'Advanced School Discovery', description: 'Filter schools by curriculum, extracurriculars, and performance to find the best fit for your child\'s needs.' },
        { icon: BookOpenCheck, title: 'Digital Homework & Grading', description: 'Streamline homework assignment and grading with AI-powered tools that save teachers hours.' },
        { icon: Users, title: 'Enhanced Parent Portals', description: 'Improve communication with secure, real-time updates on student progress and school events.' },
        { icon: TrendingUp, title: 'Performance Analytics', description: 'Track key school metrics and student outcomes to drive continuous improvement and report to stakeholders.' },
    ],
    splashTitle: "Building Foundational Skills",
    splashDescription: "Our platform provides tools that are robust yet simple, reflecting the importance of this foundational educational stage."
  },
  HighschoolNet: {
    heroTitle: "Navigate & Excel Your High School with",
    heroSubtitle: "The premier platform for connecting students with high schools and providing advanced tools for subject selection, career guidance, and university prep.",
    cta1: "Find a High School",
    cta2: "For School Counselors",
     features: [
        { icon: Search, title: 'In-Depth School Profiles', description: 'Compare high schools based on academic focus, sports programs, and matriculation results.' },
        { icon: GraduationCap, title: 'AI Career & Subject Guidance', description: 'Help students discover their passions and choose the right subjects for their desired university path.' },
        { icon: Briefcase, title: 'University Application Hub', description: 'A centralized platform for students to manage applications, track deadlines, and get AI feedback on essays.' },
        { icon: TrendingUp, title: 'Alumni Network & Analytics', description: 'Build and engage your alumni community while tracking the success of your graduates.' },
    ],
    splashTitle: "Fostering Future Leaders",
    splashDescription: "We provide modern, powerful tools designed to help students and counselors navigate the path to higher education and beyond."
  },
  TertiaryNet: {
    heroTitle: "Advance Your Career with",
    heroSubtitle: "Connecting students and professionals with universities and colleges, offering powerful tools for research collaboration and career services.",
    cta1: "Find a University/College",
    cta2: "For University Admissions",
     features: [
        { icon: Search, title: 'Detailed Program Search', description: 'Find and compare undergraduate and postgraduate programs across the country.' },
        { icon: Wand2, title: 'AI-Powered Research Assistant', description: 'Supercharge your research with AI tools that help find papers, summarize articles, and check citations.' },
        { icon: Briefcase, title: 'Industry & Corporate Partnerships', description: 'Connect students with internships and job opportunities directly through the platform.' },
        { icon: GraduationCap, title: 'Career Services Suite', description: 'Offer students AI-driven CV builders, interview prep, and personalized career path recommendations.' },
    ],
    splashTitle: "Powering Academic & Professional Excellence",
    splashDescription: "Our platform is built for the rigors of higher education, offering sophisticated tools for research, career development, and institutional growth."
  }
};


export default function HomePage() {
  const { brand } = useBrand();
  const content = brandContent[brand] || brandContent.NurseryNet;

  const getSubLinksForBrand = () => {
    switch (brand) {
      case 'PrimaryNet':
        return [
          { href: '#', label: 'AI Grading Assistant', icon: Wand2 },
          { href: '#', label: 'Parent Communication Tools', icon: Users },
          { href: '/pricing', label: 'Pricing & Plans', icon: DollarSign, isSeparator: true },
        ];
      case 'HighschoolNet':
        return [
          { href: '#', label: 'AI Career Guidance', icon: GraduationCap },
          { href: '#', label: 'University App Hub', icon: Briefcase },
          { href: '/pricing', label: 'Pricing & Plans', icon: DollarSign, isSeparator: true },
        ];
      case 'TertiaryNet':
         return [
          { href: '#', label: 'AI Research Assistant', icon: Wand2 },
          { href: '#', label: 'Corporate Partnership Portal', icon: Briefcase },
          { href: '/pricing', label: 'Pricing & Plans', icon: DollarSign, isSeparator: true },
        ];
      case 'NurseryNet':
      default:
        return [
          { href: '/preschools/logo-generator', label: 'AI Logo Generator', icon: Wand2 },
          { href: '/funding', label: 'AI Funding Hub', icon: Search },
          { href: '/preschools/roi-calculator', label: 'ROI Calculator', icon: TrendingUp },
          { href: '/preschools/growth-kit', label: 'Free Resources', icon: Gift },
          { href: '/preschools/profile-preview', label: 'Profile Preview', icon: Eye },
          { href: '/pricing', label: 'Pricing & Plans', icon: DollarSign, isSeparator: true },
        ];
    }
  };
  
  const preschoolSubLinks = getSubLinksForBrand();

  const getHeroSection = () => {
    switch(brand) {
      case 'NurseryNet':
        return (
          <>
            <FloatingElements count={15} elementTypes={['star', 'heart']} colorClasses={['text-yellow-300', 'text-pink-300']} />
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 opacity-50 md:opacity-100">
               <AnimatedBird />
            </div>
          </>
        );
      case 'PrimaryNet':
        return <FloatingElements count={20} elementTypes={['circle']} colorClasses={['text-secondary/50', 'text-white/50']} />;
      case 'HighschoolNet':
         return <FloatingElements count={10} elementTypes={['square']} colorClasses={['text-white/30']} />;
      case 'TertiaryNet':
        return <FloatingElements count={15} elementTypes={['line']} colorClasses={['text-secondary/40']} />;
      default:
        return null;
    }
  }

  const getHeroBgClass = () => {
    switch(brand) {
      case 'NurseryNet': return 'bg-purple-blue-gradient';
      case 'PrimaryNet': return 'bg-gradient-to-br from-blue-500 to-cyan-400';
      case 'HighschoolNet': return 'bg-gradient-to-br from-slate-800 to-slate-600';
      case 'TertiaryNet': return 'bg-gradient-to-br from-gray-800 to-gray-900';
      default: return 'bg-purple-blue-gradient';
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className={cn("relative w-full py-20 md:py-32 text-primary-foreground overflow-hidden", getHeroBgClass())}>
        {getHeroSection()}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl animate-slide-in-up">
            {content.heroTitle} <span className="text-yellow-300">{brand}</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            {content.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
              <Link href="/directory">{content.cta1}</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="bg-background text-primary hover:bg-background/80 shadow-lg">
                  {content.cta2} <ChevronDown className="ml-2 h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-background border-border text-foreground">
                <DropdownMenuItem asChild>
                  <Link href="/preschools" className="flex items-center w-full font-semibold text-foreground hover:bg-accent/10">
                    <Briefcase className="mr-2 h-4 w-4 text-primary" /> Tools Overview
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                {preschoolSubLinks.map((subLink, index) => (
                  <DropdownMenuItem key={`${subLink.label}-${index}`} asChild>
                    <Link href={subLink.href} className="flex items-center w-full text-foreground hover:bg-accent/10">
                      <subLink.icon className="mr-2 h-4 w-4 text-primary" />
                      {subLink.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Why Choose {brand}?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete ecosystem for success in the {brand === 'NurseryNet' ? 'early childhood' : brand === 'PrimaryNet' ? 'primary education' : brand === 'HighschoolNet' ? 'secondary education' : 'tertiary education'} sector.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {content.features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center p-6 bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <feature.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-semibold mb-2 text-center">{feature.title}</h3>
                <p className="text-muted-foreground text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Free Resources Section */}
       <section className="w-full py-16 md:py-24 bg-secondary/20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-left p-6">
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                        Free Tools to Grow Your School
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        You don't need a budget to start growing. Access our free library of essential documents and resources designed to help you run your school more efficiently.
                    </p>
                    <ul className="mt-6 space-y-2">
                        <li className="flex items-center text-foreground/80">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                            {brand === 'NurseryNet' ? 'School Fee Clearance Templates' : 'Attendance Record Templates'}
                        </li>
                        <li className="flex items-center text-foreground/80">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                            {brand === 'NurseryNet' ? 'Primary School Readiness Checklists' : 'Parent-Teacher Meeting Guides'}
                        </li>
                        <li className="flex items-center text-foreground/80">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                            And many more downloadable PDFs...
                        </li>
                    </ul>
                    <Button asChild size="lg" className="mt-8">
                        <Link href="/preschools/growth-kit">Explore the Growth Kit</Link>
                    </Button>
                </div>
                <div className="flex justify-center items-center">
                    <Image src="https://images.unsplash.com/photo-1604881988758-f76ad2f78c8f" alt="Free resources preview" data-ai-hint="documents forms" width={500} height={400} className="rounded-xl shadow-lg" />
                </div>
            </div>
        </div>
    </section>

      {/* Colorful Stripes Section */}
      {brand === 'NurseryNet' && (
        <section className="relative w-full py-16 md:py-24 overflow-hidden bg-background">
          <ColorfulStripes />
          <FloatingElements count={10} elementTypes={['heart']} colorClasses={['text-accent', 'text-pink-400']} />
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-4">
              {content.splashTitle}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {content.splashDescription}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <Image src="https://images.unsplash.com/photo-1516627145400-ef898d973216" alt="Children playing" data-ai-hint="children playing" width={600} height={400} className="rounded-xl shadow-lg" />
              <div className="text-left p-6 bg-card/70 backdrop-blur-md rounded-xl shadow-lg">
                <h3 className="font-headline text-2xl font-semibold text-primary mb-3">Vibrant Community</h3>
                <p className="text-muted-foreground mb-2">Join a network of passionate educators and parents.</p>
                <h3 className="font-headline text-2xl font-semibold text-primary mt-4 mb-3">Beautiful Profiles</h3>
                <p className="text-muted-foreground">Showcase your school with stunning, customizable profiles that attract parents.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Yellow Background with 3D Elements Section */}
      {brand === 'NurseryNet' && (
        <section className="relative w-full py-16 md:py-24 bg-yellow-100 overflow-hidden">
          <FloatingElements count={12} elementTypes={['circle', 'star']} colorClasses={['text-primary/50', 'text-accent-blue-DEFAULT/50']} />
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-yellow-700 sm:text-4xl mb-8">
              Playful Tools for a Brighter Future
            </h2>
            <ThreeDElements />
             <p className="mt-8 text-lg text-yellow-800/80 max-w-3xl mx-auto">
              Every tool on our platform, no matter how playful, is a powerful engine for growth. The schools that lead the market understand this. Don't get left behind.
            </p>
          </div>
        </section>
      )}

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
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground bg-primary hover:bg-primary-foreground/10 shadow-lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
