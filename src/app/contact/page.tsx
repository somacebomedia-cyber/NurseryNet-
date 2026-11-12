// src/app/contact/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Building2, 
  Clock, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export default function ContactPage() {
  const { brand } = useBrand();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('claim');
  const [institution, setInstitution] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>South Africa Support & Enquiries</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Get in touch with {brand}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re a preschool principal claiming your school, a parent with questions, or an education partner, our local team is here to assist you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Contact Form */}
            <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Send us a message</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Fill in your details below and a regional support specialist will respond within 24 hours.
              </p>

              {submitted ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground">Message Received!</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Thank you, <span className="font-semibold text-foreground">{name}</span>. A confirmation ticket has been dispatched to <span className="font-semibold text-foreground">{email}</span>.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setPhone('');
                      setInstitution('');
                      setMessage('');
                    }}
                    className="mt-4"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold">Your Full Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Nomvula Khumalo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nomvula@example.co.za"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-semibold">South African Phone / WhatsApp</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="083 456 7890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="institution" className="text-xs font-semibold">School / Centre Name (Optional)</Label>
                      <Input
                        id="institution"
                        placeholder="e.g. Little Acorns Educare"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-semibold">What is your enquiry about?</Label>
                    <select
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="claim">Claiming & Verifying a School Listing</option>
                      <option value="pricing">Pricing Plans & Stitch Billing</option>
                      <option value="directory">Updating Contact Information</option>
                      <option value="funding">DSD Subsidies & Funding Support</option>
                      <option value="parent">Parent Directory Assistance</option>
                      <option value="other">Other General Enquiry</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs font-semibold">Message Details</Label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Please describe how we can assist you..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="w-full p-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full py-6 font-semibold">
                    {isSubmitting ? (
                      'Sending Message...'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Send Message to {brand}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Direct Contact Info & Offices */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
                <h3 className="font-heading text-xl font-bold text-foreground">Direct Contact Channels</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase">General Enquiries</h4>
                      <a href="mailto:support@nurserynet.app" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        support@nurserynet.app
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase">Phone & WhatsApp Support</h4>
                      <p className="text-sm font-medium text-foreground">
                        +27 (0) 11 555 0192 / +27 82 000 4421
                      </p>
                      <span className="text-xs text-muted-foreground">Mon – Fri, 08:00 – 17:00 SAST</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase">Response Times</h4>
                      <p className="text-sm font-medium text-foreground">
                        Within 2 business hours for claim verification requests
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">South African Regional Hubs</h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Johannesburg: Rosebank Link, Oxford Rd, Gauteng</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Cape Town: The Boulevard Office Park, Woodstock, Western Cape</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Durban: Umhlanga Ridge, KwaZulu-Natal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick links card */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <h4 className="font-heading text-base font-bold text-foreground">Looking for school tools?</h4>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Explore our free growth kits, ROI calculator, and verified preschool listings.
                </p>
                <div className="space-y-2">
                  <Link href="/pricing" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    View Pricing Plans <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link href="/preschools/growth-kit" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    Download Free Growth Kit <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
