
// src/app/(main)/preschools/growth-kit/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, FileText, CheckCircle, Handshake, BookHeart, FileSpreadsheet, Download, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const freeResources = [
    { title: "Parent-Teacher Meeting Notes", category: "Parent & Community" },
    { title: "Weekly Lesson Plan Template", category: "Planning & Curriculum" },
    { title: "Daily Attendance Sheet", category: "Admin & Operations" },
    { title: "School Code of Conduct", category: "Admin & Operations" },
    { title: "Engaging Social Media Post Ideas", category: "Parent & Community" },
];

const premiumResources = [
    { title: "CAPS Aligned Numeracy Worksheets (Grade R)", category: "Premium Worksheets" },
    { title: "British Curriculum Literacy Pack (Ages 3-4)", category: "Premium Worksheets" },
    { title: "American Curriculum Fine Motor Skills Activities", category: "Premium Worksheets" },
    { title: "AI-Powered Branding Checklist", category: "Planning & Curriculum" },
    { title: "Child Injury Report Form (Legal Template)", category: "Admin & Operations" },
    { title: "Staff Disciplinary Action Form (HR Template)", category: "Admin & Operations" },
    { title: "School Fee Clearance Report", category: "Admin & Operations" },
];

const ResourceButton = ({ title }: { title: string }) => (
    <Button variant="outline" className="w-full justify-start" asChild>
        <a href="#" download>
            <Download className="mr-2 h-4 w-4" />
            {title}
        </a>
    </Button>
);

const LockedResourceButton = ({ title }: { title: string }) => (
     <Button variant="outline" className="w-full justify-start text-muted-foreground" disabled>
        <Lock className="mr-2 h-4 w-4" />
        {title}
    </Button>
);

export default function GrowthKitPage() {
  return (
    <div className="py-12 md:py-20 bg-gradient-to-br from-background to-secondary/30 min-h-[calc(100vh-var(--header-height,8rem))]">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
            <div className="inline-block p-3 bg-primary/20 rounded-full mb-3 mx-auto">
                <Gift className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">The ECD Excellence Toolkit</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                A comprehensive library of downloadable templates and worksheets to help you save time, build trust, and boost the quality of your preschool.
            </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Free Resources */}
            <Card className="lg:col-span-2 shadow-xl glassmorphism">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-primary flex items-center gap-3"><FileSpreadsheet className="w-7 h-7"/>Admin & Operations</CardTitle>
                    <CardDescription>Streamline daily management and compliance with these ready-to-use forms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {freeResources.filter(r => r.category === "Admin & Operations").map(res => <ResourceButton key={res.title} title={res.title} />)}
                    {premiumResources.filter(r => r.category === "Admin & Operations").map(res => <LockedResourceButton key={res.title} title={res.title} />)}
                </CardContent>
            </Card>
            <Card className="lg:col-span-1 row-span-2 shadow-xl glassmorphism bg-primary/10 border-primary/20 flex flex-col justify-center">
                 <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline text-primary">Unlock Everything</CardTitle>
                     <CardDescription>Subscribe to a paid plan to get access to all premium worksheets, branding tools, and advanced AI features.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button asChild size="lg">
                        <Link href="/pricing">View Pricing Plans</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card className="lg:col-span-1 shadow-xl glassmorphism">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-primary flex items-center gap-3"><BookHeart className="w-7 h-7"/>Planning & Curriculum</CardTitle>
                    <CardDescription>Plan engaging lessons and track readiness with ease.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                   {freeResources.filter(r => r.category === "Planning & Curriculum").map(res => <ResourceButton key={res.title} title={res.title} />)}
                   {premiumResources.filter(r => r.category === "Planning & Curriculum").map(res => <LockedResourceButton key={res.title} title={res.title} />)}
                </CardContent>
            </Card>

             <Card className="lg:col-span-1 shadow-xl glassmorphism">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-primary flex items-center gap-3"><Handshake className="w-7 h-7"/>Parent Engagement</CardTitle>
                    <CardDescription>Build trust and strong relationships with your families.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                   {freeResources.filter(r => r.category === "Parent & Community").map(res => <ResourceButton key={res.title} title={res.title} />)}
                </CardContent>
            </Card>

            <Card className="lg:col-span-3 shadow-xl glassmorphism">
                <CardHeader>
                     <CardTitle className="text-2xl font-headline text-primary flex items-center gap-3"><Lock className="w-7 h-7"/>Premium Curriculum Worksheets</CardTitle>
                     <CardDescription>High-quality, curriculum-aligned worksheets. Subscribers to the Growth plan can add their own branding.</CardDescription>
                </CardHeader>
                 <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {premiumResources.filter(r => r.category === "Premium Worksheets").map(res => <LockedResourceButton key={res.title} title={res.title} />)}
                 </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
