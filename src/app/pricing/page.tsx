// src/app/pricing/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { TiersConfig, SubscriptionTier } from '@/config/tiers';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard, 
  Building2, 
  PhoneCall, 
  Clock, 
  HelpCircle,
  CheckCircle2,
  Lock,
  Loader2,
  Award
} from 'lucide-react';

export default function PricingPage() {
  const { brand } = useBrand();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'processing' | 'success'>('details');
  const [schoolName, setSchoolName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'capitec' | 'card' | 'eft'>('capitec');

  const tiers = TiersConfig.all();

  const handleOpenCheckout = (tier: SubscriptionTier) => {
    if (tier.id === 'free') {
      window.location.href = '/directory';
      return;
    }
    setSelectedTier(tier);
    setCheckoutStep('details');
    setIsCheckoutOpen(true);
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('processing');
    setTimeout(() => {
      // Store subscription in localStorage for demo state persistence
      if (typeof window !== 'undefined' && selectedTier) {
        localStorage.setItem('nurserynet_active_plan', JSON.stringify({
          tierId: selectedTier.id,
          tierName: selectedTier.name,
          schoolName: schoolName || 'Sunshine Early Learning Centre',
          billingCycle,
          activatedAt: new Date().toISOString(),
        }));
      }
      setCheckoutStep('success');
    }, 1800);
  };

  const entityType = brand === 'NurseryNet' ? 'Preschool & ECD' : brand === 'PrimaryNet' ? 'Primary School' : brand === 'HighschoolNet' ? 'High School' : 'Institution';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative py-16 md:py-24 border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>South African {entityType} Growth Plans</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Simple, transparent pricing for {brand}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with verified local families, receive direct tour enquiries, and elevate your institution with South Africa&apos;s leading education directory.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-10 flex justify-center items-center gap-3">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly billing
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={billingCycle === 'annual'}
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                billingCycle === 'annual' ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'} flex items-center gap-1.5`}>
              Annual billing
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                Save 15%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {tiers.map((tier) => {
              const price = billingCycle === 'monthly' ? tier.monthlyPriceZAR : Math.round(tier.annualPriceZAR / 12);
              const isFree = tier.id === 'free';

              return (
                <Card 
                  key={tier.id}
                  className={`flex flex-col relative transition-all duration-300 hover:shadow-xl ${
                    tier.popular 
                      ? 'border-2 border-primary shadow-lg ring-2 ring-primary/20 md:-translate-y-2' 
                      : 'border-border/60'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold py-1 px-4 rounded-full uppercase tracking-wider shadow-md">
                      Most Popular for Principals
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <CardTitle className="font-heading text-2xl font-bold flex items-center justify-between">
                      {tier.name}
                      {tier.hasVerifiedBadge && (
                        <ShieldCheck className="h-6 w-6 text-emerald-600" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm min-h-[40px] mt-1">
                      {tier.tagline}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col pt-0">
                    <div className="mb-6 pb-6 border-b border-border/40">
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight text-foreground">
                          {isFree ? 'R0' : `R${price}`}
                        </span>
                        {!isFree && (
                          <span className="text-sm text-muted-foreground font-medium">
                            / month
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isFree 
                          ? 'Included automatically for all registered facilities' 
                          : billingCycle === 'annual'
                            ? `Billed annually at R${tier.annualPriceZAR.toLocaleString()} ZAR (Save 15%)`
                            : 'Billed monthly. Cancel anytime with 30 days notice.'}
                      </p>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Included Features:
                      </p>
                      <ul className="space-y-2.5">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/90">
                            <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2">
                    <Button 
                      onClick={() => handleOpenCheckout(tier)}
                      variant={tier.popular ? 'default' : 'outline'}
                      className="w-full font-semibold py-6 text-base"
                    >
                      {isFree ? (
                        <>Browse Directory Listings <ArrowRight className="ml-2 h-4 w-4" /></>
                      ) : (
                        <>Get Started with {tier.name} <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* South Africa Payment Trust Bar */}
          <div className="mt-16 p-6 rounded-2xl bg-muted/40 border border-border/50 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">Protected by Stitch Money & South African Banking Rails</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Direct Capitec Pay, Instant EFT (FNB, Absa, Nedbank, Standard Bank), and Visa/Mastercard. No international conversion fees.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground shrink-0">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>DSD Registered Verified Flow</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-16 bg-muted/20 border-t border-border/40">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              Compare plan capabilities
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Choose the level of parent visibility that fits your school&apos;s enrollment goals.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-4 font-semibold text-foreground">Capability</th>
                  <th className="p-4 font-semibold text-center text-foreground">Free Listing</th>
                  <th className="p-4 font-semibold text-center text-primary bg-primary/5">Verified Centre</th>
                  <th className="p-4 font-semibold text-center text-foreground">Pro Featured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-4 font-medium text-foreground">Search directory presence</td>
                  <td className="p-4 text-center text-emerald-600">Standard</td>
                  <td className="p-4 text-center text-emerald-600 bg-primary/5 font-semibold">Priority</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">#1 Pinned Top Slot</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-foreground">Official Verification Badge</td>
                  <td className="p-4 text-center text-muted-foreground">-</td>
                  <td className="p-4 text-center text-emerald-600 bg-primary/5 font-semibold">Green Shield</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">Gold Featured Shield</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-foreground">Direct Tour Booking Inbox</td>
                  <td className="p-4 text-center text-muted-foreground">-</td>
                  <td className="p-4 text-center text-emerald-600 bg-primary/5">Email + WhatsApp</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">Priority Lead Routing</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-foreground">Facility Gallery Photos</td>
                  <td className="p-4 text-center text-muted-foreground font-mono">1 photo</td>
                  <td className="p-4 text-center font-mono bg-primary/5">Up to 8 photos</td>
                  <td className="p-4 text-center font-mono font-bold">Up to 20 photos</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-foreground">Edit Fees, Hours & Curriculum</td>
                  <td className="p-4 text-center text-muted-foreground">-</td>
                  <td className="p-4 text-center text-emerald-600 bg-primary/5">Full Control</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">Full Control + Spotlight</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-foreground">Leads & Views Analytics Funnel</td>
                  <td className="p-4 text-center text-muted-foreground">-</td>
                  <td className="p-4 text-center text-muted-foreground bg-primary/5">Basic Leads Count</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">Full Conversion Funnel</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Frequently asked questions
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Everything you need to know about claiming, verification, and payment.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="font-semibold text-left py-4 hover:no-underline">
                How does claiming a listing work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                If your preschool or centre is already in our directory of 20,291 South African institutions, click &quot;Claim this listing&quot; on its profile. Enter your contact details and DSD or NPO registration number. Once verified, you receive immediate dashboard access to update photos, tuition fees, and admission slots.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="font-semibold text-left py-4 hover:no-underline">
                Can I pay via Capitec Pay or Instant EFT?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                Yes! We use Stitch Money, South Africa&apos;s licensed open banking gateway. You can checkout directly via Capitec Pay, Instant EFT across all major South African banks (FNB, Standard Bank, Absa, Nedbank, Investec), or with any Visa or Mastercard credit/debit card.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="font-semibold text-left py-4 hover:no-underline">
                Can I cancel or change my plan anytime?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                Absolutely. There are no lock-in contracts for monthly plans. You can cancel or upgrade directly from your Owner Dashboard at any time. If you cancel, your listing remains active as a free listing without losing your history.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="font-semibold text-left py-4 hover:no-underline">
                How do tour inquiries and phone leads reach me?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                Whenever a parent submits a tour booking or enrollment query on your profile, our system routes it immediately to your verified email address and sends an instant WhatsApp alert to your school phone number.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-12 text-center p-8 bg-muted/30 rounded-2xl border border-border/50">
            <h3 className="font-heading text-lg font-bold text-foreground">Have a specific question or need custom municipal licensing?</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Our South African support team is ready to help you get your centre set up.</p>
            <div className="flex justify-center gap-3">
              <Button asChild variant="outline">
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button asChild>
                <Link href="/preschools/growth-kit">Download Free Growth Kit</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Simulated Stitch Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {checkoutStep === 'success' ? 'Subscription Confirmed' : `Subscribe to ${selectedTier?.name}`}
            </DialogTitle>
            <DialogDescription>
              {checkoutStep === 'success' 
                ? 'Your school listing has been upgraded.' 
                : 'Secure checkout via Stitch Money South Africa.'}
            </DialogDescription>
          </DialogHeader>

          {checkoutStep === 'details' && selectedTier && (
            <form onSubmit={handleSimulatePayment} className="space-y-4 py-2">
              <div className="p-3 bg-muted/60 rounded-lg flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-foreground">{selectedTier.name}</span>
                  <span className="block text-xs text-muted-foreground capitalize">{billingCycle} Billing</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg font-mono tabular-nums text-foreground">
                    {billingCycle === 'monthly' ? `R${selectedTier.monthlyPriceZAR}` : `R${selectedTier.annualPriceZAR}`}
                  </span>
                  <span className="block text-xs text-muted-foreground">ZAR / {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="schoolName" className="text-xs">Preschool / Institution Name</Label>
                <Input
                  id="schoolName"
                  placeholder="e.g. Little Stars Early Learning Centre"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ownerEmail" className="text-xs">Principal / Owner Email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="principal@school.co.za"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ownerPhone" className="text-xs">SA Mobile / WhatsApp</Label>
                  <Input
                    id="ownerPhone"
                    type="tel"
                    placeholder="082 123 4567"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs">Select Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('capitec')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                      paymentMethod === 'capitec' 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border bg-card hover:bg-muted/50'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Capitec Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('eft')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                      paymentMethod === 'eft' 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border bg-card hover:bg-muted/50'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Instant EFT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                      paymentMethod === 'card' 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border bg-card hover:bg-muted/50'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Debit/Credit</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full font-semibold py-5">
                  Pay {billingCycle === 'monthly' ? `R${selectedTier.monthlyPriceZAR}` : `R${selectedTier.annualPriceZAR}`} ZAR via Stitch
                </Button>
                <p className="text-[11px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" /> Test Mode: Instant simulation with zero real charge
                </p>
              </div>
            </form>
          )}

          {checkoutStep === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div>
                <h4 className="font-semibold text-foreground">Initiating Stitch Secure Payment...</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Connecting to South African banking gateway and authorizing transaction.
                </p>
              </div>
            </div>
          )}

          {checkoutStep === 'success' && selectedTier && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-heading text-xl font-bold text-foreground">Payment Successful!</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your listing for <span className="font-semibold text-foreground">{schoolName || 'Sunshine Early Learning Centre'}</span> is now activated with the <span className="font-semibold text-primary">{selectedTier.name}</span> plan.
                </p>
              </div>

              <div className="w-full p-4 bg-muted/40 rounded-xl text-left text-xs space-y-1.5 border border-border/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-emerald-600">Active & Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-mono text-foreground">STITCH-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notification:</span>
                  <span className="text-foreground">Sent to {ownerEmail || 'principal@school.co.za'}</span>
                </div>
              </div>

              <div className="flex gap-3 w-full pt-2">
                <Button asChild variant="outline" className="flex-1" onClick={() => setIsCheckoutOpen(false)}>
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
                <Button asChild className="flex-1" onClick={() => setIsCheckoutOpen(false)}>
                  <Link href="/directory">Browse Listings</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
