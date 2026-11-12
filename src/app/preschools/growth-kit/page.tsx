// src/app/preschools/growth-kit/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Gift, 
  Download, 
  FileText, 
  CheckCircle2, 
  Eye, 
  ArrowRight, 
  Sparkles,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';

interface KitItem {
  id: string;
  title: string;
  category: string;
  description: string;
  format: string;
  content: string;
}

export default function GrowthKitPage() {
  const { brand } = useBrand();
  const [selectedItem, setSelectedItem] = useState<KitItem | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const kitItems: KitItem[] = [
    {
      id: 'fee-clearance',
      title: 'School Fee Clearance Certificate',
      category: 'Financial & Administration',
      description: 'Standardized South African transfer clearance verifying fee settlements before admitting learners from previous crèches or schools.',
      format: 'DOC / PDF Printable',
      content: `REPUBLIC OF SOUTH AFRICA - EARLY CHILDHOOD DEVELOPMENT
OFFICIAL SCHOOL FEE CLEARANCE CERTIFICATE

Date: ________________________
To: Admissions Office, The Receiving Institution

RE: LEARNER CLEARANCE & ACCOUNT STATUS
Learner Full Name: _____________________________________________
Date of Birth / ID No: _________________________________________
Parent / Guardian Name: ________________________________________

This document certifies that the aforementioned learner was registered at our early learning facility during the academic period:
From: ______________ To: ______________

FINANCIAL STATUS:
[ ] All school, registration, and activity fees have been settled in full.
[ ] An outstanding balance of R ____________ remains under an active payment agreement.
[ ] Account is fully cleared with no pending obligations.

Principal / Financial Officer Signature: _______________________
Official School Stamp: 
[STAMP HERE]

Issued in compliance with South African Early Childhood Development administrative guidelines.`,
    },
    {
      id: 'learner-registration',
      title: 'Comprehensive Learner Enrollment Form',
      category: 'Admissions & Compliance',
      description: 'South African DSD-compliant admission pack capturing clinic card immunizations, emergency contacts, dietary allergies, and pick-up authorization.',
      format: 'Printable Admission Pack',
      content: `SOUTH AFRICAN ECD LEARNER REGISTRATION & ADMISSION FORM

SECTION 1: LEARNER INFORMATION
Full Names: ____________________________________________________
Surname: _______________________________________________________
Date of Birth: _____ / _____ / _________  Gender: [ ] M  [ ] F
Home Language: ________________________ Other Languages: _______
Physical Residential Address: ___________________________________
Road-to-Health Clinic Card Attached: [ ] YES  [ ] NO

SECTION 2: PARENT / LEGAL GUARDIAN
Primary Contact Name: __________________________________________
Relationship: _____________________ ID Number: _________________
Cell Number: ______________________ WhatsApp: __________________
Email: ____________________________ Workplace Phone: ___________

SECTION 3: MEDICAL & DIETARY NEEDS
Allergies (Peanuts, Dairy, Medication, Stings): __________________
Chronic Health Conditions (Asthma, Epilepsy, Diabetes): _________
Family Doctor / Clinic Contact: _________________________________
Authorized Pick-Up Persons (ID required): _______________________

SECTION 4: DECLARATION & CONSENT
I hereby declare that all information supplied is true and accurate.
Parent / Guardian Signature: _________________ Date: ___________`,
    },
    {
      id: 'school-readiness',
      title: 'Grade R Primary School Readiness Checklist',
      category: 'Educational Assessment',
      description: 'Practical milestone checklist evaluating gross motor, fine motor, auditory perception, emergent literacy, and emotional self-regulation.',
      format: 'Educator Rubric',
      content: `GRADE R TO GRADE 1 SCHOOL READINESS EVALUATION RUBRIC
National Curriculum Framework (NCF) Standard Assessment

Learner Name: ____________________________ Age: _____ yrs _____ mos
Assessing Educator: _______________________ Date: _________________

1. GROSS MOTOR DEVELOPMENT
- Balances on one leg for 5+ seconds:           [ ] Mastered  [ ] Developing  [ ] Support Needed
- Catches and bounces a medium-sized ball:       [ ] Mastered  [ ] Developing  [ ] Support Needed
- Walks backwards heel-to-toe along a line:     [ ] Mastered  [ ] Developing  [ ] Support Needed

2. FINE MOTOR & PENCIL GRIP
- Demonstrates dynamic tripod pencil grip:       [ ] Mastered  [ ] Developing  [ ] Support Needed
- Cuts along straight and curved lines safely:   [ ] Mastered  [ ] Developing  [ ] Support Needed
- Copies basic geometric shapes (circle, cross): [ ] Mastered  [ ] Developing  [ ] Support Needed

3. EMERGENT NUMERACY & LITERACY
- Recognizes own written name:                   [ ] Mastered  [ ] Developing  [ ] Support Needed
- Counts rhythmically from 1 to 20:              [ ] Mastered  [ ] Developing  [ ] Support Needed
- Recognizes simple patterns and color sequences:[ ] Mastered  [ ] Developing  [ ] Support Needed

4. EMOTIONAL & SOCIAL INDEPENDENCE
- Separates comfortably from caregiver:          [ ] Mastered  [ ] Developing  [ ] Support Needed
- Uses toilet independently and washes hands:    [ ] Mastered  [ ] Developing  [ ] Support Needed
- Follows two- to three-step verbal directions:  [ ] Mastered  [ ] Developing  [ ] Support Needed

Principal Endorsement: _________________________`,
    },
    {
      id: 'daily-routine',
      title: 'South African ECD Daily Routine & Curriculum Schedule',
      category: 'Curriculum & Routine',
      description: 'Structured daily timeline balancing indoor cognitive stimulation, structured gross motor play, nutritious meal times, and rest routines.',
      format: 'Classroom Poster Layout',
      content: `DAILY LEARNING SCHEDULE - EARLY CHILDHOOD CENTRE
Compliant with DBE/DSD 0-4 Early Learning Guidelines

07:00 - 08:00  Learner Arrival, Health Checks & Quiet Free Play
08:00 - 08:30  Nutritious Breakfast / Porridge Routine & Hand Washing
08:30 - 09:00  Morning Circle: Greeting, Weather Chart, Songs & Rhymes
09:00 - 09:45  Small Group Focus: Sensory, Fine Motor, Creative Art
09:45 - 10:30  Outdoor Free Play: Gross Motor Obstacle Course, Sandpit
10:30 - 11:00  Mid-Morning Fruit & Water Snack Routine
11:00 - 11:30  Story Time, Emergent Literacy & Vocabulary Building
11:30 - 12:15  Nutritious Warm Lunch & Oral Hygiene
12:15 - 14:00  Quiet Rest / Nap Routine with Calming Melodies
14:00 - 14:30  Wake-Up, Bathroom & Afternoon Healthy Snack
14:30 - 16:30  Constructive Free Play, Music & Movement
16:30 - 17:30  Departure & Parent Hand-Over Communication`,
    },
  ];

  const handleDownload = (item: KitItem) => {
    const blob = new Blob([item.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.id}-${brand.toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(item.title);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 mb-3">
            <Gift className="h-3.5 w-3.5" />
            <span>100% Free Administrative Resources</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            The {brand} School Growth Kit
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            You don&apos;t need an enterprise budget to run an organized, legally sound institution. Download free, professional templates tailored for South African early learning centres.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {downloadSuccess && (
            <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between text-sm text-emerald-800 dark:text-emerald-200 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span><strong>{downloadSuccess}</strong> downloaded successfully to your device!</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setDownloadSuccess(null)}>Dismiss</Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {kitItems.map((item) => (
              <Card key={item.id} className="flex flex-col border border-border/70 hover:border-primary/40 hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {item.format}
                    </span>
                  </div>
                  <CardTitle className="font-heading text-xl font-bold text-foreground">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1 leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter className="pt-2 border-t border-border/40 flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Eye className="mr-2 h-4 w-4" /> Preview
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => handleDownload(item)}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Bottom Card */}
          <div className="mt-16 p-8 bg-card border border-border rounded-2xl text-center max-w-3xl mx-auto shadow-sm">
            <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-heading text-xl font-bold text-foreground">
              Ready to claim your official school listing?
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-xl mx-auto">
              Join thousands of verified principals managing their admissions, fees, and tour inquiries on South Africa&apos;s most comprehensive directory.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="font-semibold">
                <Link href="/directory">Find My School in Directory</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-semibold">
                <Link href="/pricing">View Growth Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {selectedItem?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.category} · Standard South African Template
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 bg-muted/40 rounded-xl border border-border font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
            {selectedItem?.content}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Close
            </Button>
            {selectedItem && (
              <Button onClick={() => { handleDownload(selectedItem); setSelectedItem(null); }}>
                <Download className="mr-2 h-4 w-4" /> Download Printable Template
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
