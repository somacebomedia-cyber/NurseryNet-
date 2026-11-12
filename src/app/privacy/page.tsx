// src/app/privacy/page.tsx
"use client";

import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { ShieldCheck, Lock, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
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
            <ShieldCheck className="h-4 w-4" />
            <span>POPIA & South African Data Privacy Compliance</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">
            Privacy Policy & Data Protection
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Effective Date: November 2026 · Compliant with the Protection of Personal Information Act 4 of 2013 (POPIA)
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto max-w-4xl px-4 space-y-8 text-foreground/90 text-sm leading-relaxed">
          <div className="p-4 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground">
            <strong className="text-foreground">Commitment to Children&apos;s Rights:</strong> {brand} is dedicated to protecting early childhood development data. We do not sell learner, parent, or preschool contact records. Information collected during tour bookings and enquiries is routed strictly between verified parents and chosen educational facilities.
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">1. Responsible Party & Scope</h2>
            <p>
              This Privacy Policy explains how {brand} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, and safeguards personal information when you browse our national directory of 20,291 early childhood centres, claim a school profile, submit tour bookings, or purchase verified subscription tiers.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">2. Information We Process</h2>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Public School Directory Records:</strong> Official school names, municipal locations, DSD registration numbers, NPO certificates, and public phone numbers sourced from official government audits and OpenStreetMap.</li>
              <li><strong>School Claimants & Principals:</strong> Full legal names, South African mobile/WhatsApp numbers, official institutional email addresses, and verification documents (e.g. DSD certificates).</li>
              <li><strong>Parents & Guardians:</strong> Contact names, phone numbers, email addresses, and requested tour dates submitted through inquiry and booking forms.</li>
              <li><strong>Billing Information:</strong> Payments are processed via Stitch Money (licensed South African payment provider). We do not store full bank account login credentials or payment card numbers on our servers.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">3. Purpose of Processing under POPIA</h2>
            <p>
              In accordance with Section 11 of POPIA, information is processed for the following justifiable purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Facilitating parent-to-school tour bookings and enrollment communications.</li>
              <li>Verifying institutional ownership against official Department of Social Development records.</li>
              <li>Maintaining directory accuracy and municipal fee benchmark transparency.</li>
              <li>Sending transaction receipts, verification codes, and security notices.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">4. Data Retention & Information Officer Contact</h2>
            <p>
              Under POPIA, you have the right to request access to, correction of, or deletion of your personal records. For data requests or to contact our Information Officer, email:
            </p>
            <div className="mt-3 p-4 bg-card border border-border rounded-xl font-mono text-xs">
              Information Officer: NurseryNet Privacy Governance<br />
              Email: privacy@nurserynet.app<br />
              Address: Rosebank Link, Oxford Road, Johannesburg, Gauteng, 2196
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
