// src/app/terms/page.tsx
"use client";

import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  const { brand } = useBrand();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-14 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Home</Link>
          </Button>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            <FileText className="h-4 w-4" />
            <span>South African Early Childhood Service Agreement</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">
            Terms of Service & School Listing Agreement
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Governed by the Laws of the Republic of South Africa · Updated November 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto max-w-4xl px-4 space-y-8 text-foreground/90 text-sm leading-relaxed">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing or using the {brand} platform, directory, APIs, or tools, you agree to be bound by these Terms of Service. If you are claiming a school listing on behalf of an institution, crèche, or educare, you represent that you possess the legal authority to bind that entity.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">2. Directory Listings & Claiming Verification</h2>
            <p>
              Our index of 20,291 early learning centres is compiled from official South African provincial audits, municipal gazettes, and public registers.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Free Inclusion:</strong> No preschool or educator is required to pay a fee to exist within the public directory.</li>
              <li><strong>Ownership Proof:</strong> To edit contact details, fees, hours, or receive tour bookings directly, principals must undergo identity and DSD/NPO accreditation verification.</li>
              <li><strong>Accuracy Representation:</strong> Claimants agree to maintain truthful tuition fees, accreditation status, and meal provisions for parent transparency.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">3. Subscriptions & Stitch Money Billing</h2>
            <p>
              Paid plans (Verified Centre at R349/mo, Featured Slot at R690/mo) provide enhanced visibility and direct lead routing:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Billing Currency:</strong> All prices are denominated in South African Rand (ZAR) inclusive of standard statutory levies where applicable.</li>
              <li><strong>Cancellation:</strong> Monthly subscriptions may be cancelled at any time through your dashboard with 30 days notice. Upon cancellation, your listing reverts to the standard free tier without deletion.</li>
              <li><strong>Payment Rails:</strong> Payments are processed securely via Stitch Money (Capitec Pay, Instant EFT, or Card).</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">4. Dispute Resolution & Contact</h2>
            <p>
              These terms are governed by the Consumer Protection Act 68 of 2008 and the Electronic Communications and Transactions Act 25 of 2002. Any listing dispute or claim grievance may be directed to our legal team at <a href="mailto:legal@nurserynet.app" className="text-primary underline">legal@nurserynet.app</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
