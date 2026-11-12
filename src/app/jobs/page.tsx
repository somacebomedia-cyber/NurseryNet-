// src/app/jobs/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  GraduationCap, 
  CheckCircle2, 
  Building2, 
  Send,
  ArrowRight
} from 'lucide-react';

interface JobListing {
  id: string;
  title: string;
  schoolName: string;
  location: string;
  province: string;
  salary: string;
  type: string;
  qualification: string;
  description: string;
}

export default function JobsPage() {
  const { brand } = useBrand();
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [applicationSent, setApplicationSent] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');

  const jobs: JobListing[] = [
    {
      id: 'job-1',
      title: 'Qualified Grade R Class Educator (SACE Registered)',
      schoolName: 'Oak Tree Montessori Preschool',
      location: 'Claremont, Cape Town',
      province: 'Western Cape',
      salary: 'R16,500 – R21,000 / month',
      type: 'Full-time',
      qualification: 'Diploma in Grade R Teaching / B.Ed Foundation Phase + SACE',
      description: 'Lead an inquiry-based Grade R classroom preparing young learners for Grade 1. Strong understanding of NCF and CAPS literacy required.',
    },
    {
      id: 'job-2',
      title: 'Early Childhood Development Practitioner (Toddlers 2–3 yrs)',
      schoolName: 'St. Andrew Early Learning Academy',
      location: 'Rosebank, Johannesburg',
      province: 'Gauteng',
      salary: 'R12,000 – R15,500 / month',
      type: 'Full-time',
      qualification: 'ECD NQF Level 4 or 5 Certificate',
      description: 'Create engaging sensory routines, language games, and gross motor play in a well-resourced campus with 1:6 child-to-carer ratio.',
    },
    {
      id: 'job-3',
      title: 'Preschool Administrator & Admissions Coordinator',
      schoolName: 'Bright Horizon Educare',
      location: 'Umhlanga, Durban',
      province: 'KwaZulu-Natal',
      salary: 'R14,000 – R18,000 / month',
      type: 'Full-time',
      qualification: 'Diploma in Administration / 2+ yrs ECD administration experience',
      description: 'Manage parent tour inquiries, fee billing, DSD monthly subsidy returns, and staff attendance records.',
    },
    {
      id: 'job-4',
      title: 'Bilingual Baby Care Assistant (Infants 3–12 months)',
      schoolName: 'Little Stars Educare',
      location: 'Faerie Glen, Pretoria',
      province: 'Gauteng',
      salary: 'R9,500 – R12,000 / month',
      type: 'Full-time',
      qualification: 'First Aid Level 1 + Baby Care Certificate',
      description: 'Gentle, attentive care for infants. Clean Police Clearance and National Child Protection Register screening required.',
    },
  ];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationSent(true);
    setTimeout(() => {
      setApplicationSent(false);
      setSelectedJob(null);
      setApplicantName('');
      setApplicantEmail('');
      setApplicantPhone('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
            <Briefcase className="h-3.5 w-3.5" />
            <span>South Africa ECD Employment Exchange</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Early Learning Careers & Jobs
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Find vetted educator, practitioner, and leadership positions at verified crèches and preschools across South Africa.
          </p>
        </div>
      </section>

      {/* JobList */}
      <section className="py-16">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id} className="border border-border/80 hover:border-primary/50 transition-colors shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      {job.type}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      {job.salary}
                    </span>
                  </div>
                  <CardTitle className="font-heading text-xl font-bold text-foreground">
                    {job.title}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-2 text-muted-foreground mt-0.5">
                    <Building2 className="h-3.5 w-3.5" /> {job.schoolName} · <MapPin className="h-3.5 w-3.5 text-primary" /> {job.location}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-xs space-y-2 pb-4">
                  <p className="text-foreground/90 leading-relaxed">
                    {job.description}
                  </p>
                  <div className="p-2.5 bg-muted/40 rounded-lg text-muted-foreground flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                    <span><strong>Required Qualification:</strong> {job.qualification}</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-border/40 flex justify-between items-center">
                  <span className="text-[11px] text-muted-foreground">South African Police Clearance check required</span>
                  <Button size="sm" onClick={() => setSelectedJob(job)}>
                    Apply for Position <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center p-8 bg-card border border-border rounded-2xl">
            <h4 className="font-heading font-bold text-lg text-foreground">Are you an ECD Principal looking to hire?</h4>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Post your job vacancy directly to our verified network of over 14,000 South African early learning practitioners.
            </p>
            <Button asChild>
              <Link href="/contact">Post a Job Opening</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Application Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Apply: {selectedJob?.title}</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedJob?.schoolName} · {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>

          {applicationSent ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <h4 className="font-bold text-foreground">Application Dispatched!</h4>
              <p className="text-xs text-muted-foreground">
                Your credentials have been forwarded directly to the school principal.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="appName" className="text-xs">Full Name</Label>
                <Input
                  id="appName"
                  placeholder="e.g. Zanele Dlamini"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="appEmail" className="text-xs">Email Address</Label>
                <Input
                  id="appEmail"
                  type="email"
                  placeholder="zanele@example.co.za"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="appPhone" className="text-xs">Cell / WhatsApp</Label>
                <Input
                  id="appPhone"
                  type="tel"
                  placeholder="082 123 4567"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sace" className="text-xs">SACE Registration Number (if applicable)</Label>
                <Input
                  id="sace"
                  placeholder="e.g. SACE-109284"
                />
              </div>

              <Button type="submit" className="w-full font-semibold">
                <Send className="mr-2 h-4 w-4" /> Submit Application
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
