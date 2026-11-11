"use client";

import { useState } from 'react';
import { Preschool } from '@/data/preschools';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BadgeCheck, Loader2, CheckCircle2, ShieldCheck, School, Building, Phone, Mail, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClaimDialogProps {
  preschool: Preschool | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess?: (preschool: Preschool) => void;
}

export default function ClaimDialog({ preschool, isOpen, onClose, onClaimSuccess }: ClaimDialogProps) {
  const { toast } = useToast();
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Owner / Principal');
  const [proofNotes, setProofNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [claimToken, setClaimToken] = useState('');

  if (!preschool) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nurserySlug: preschool.slug || preschool.id,
          nurseryName: preschool.name,
          ownerName,
          ownerEmail: email,
          ownerPhone: phone,
          role,
          proofNotes,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setIsSent(true);
        setClaimToken(data.token || 'owner_token_verified');

        // Persist to localStorage so the UI updates across the entire app
        try {
          const stored = JSON.parse(localStorage.getItem('nurserynet_claimed_slugs') || '[]');
          const slug = preschool.slug || preschool.id;
          if (!stored.includes(slug)) {
            stored.push(slug);
            localStorage.setItem('nurserynet_claimed_slugs', JSON.stringify(stored));
          }
        } catch {
          // Ignore localStorage errors
        }

        toast({
          title: 'Ownership Claim Approved!',
          description: `Listing ${preschool.name} is now marked as Owner-Claimed.`,
        });

        if (onClaimSuccess) {
          onClaimSuccess({ ...preschool, isClaimed: true, claimedAt: new Date().toISOString() });
        }
      } else if (res.status === 409) {
        toast({
          title: 'Already Claimed',
          description: data.error || 'This listing has already been claimed by school administration.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Could not submit claim',
          description: data.error || 'Please review your details and try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Connection error',
        description: 'Unable to reach the verification server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSent(false);
      setOwnerName('');
      setEmail('');
      setPhone('');
      setProofNotes('');
      setClaimToken('');
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleClose()}>
      <DialogContent className="max-w-lg p-6 rounded-2xl bg-card border-border">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl font-bold text-foreground">
                {isSent ? 'Ownership Claim Verified!' : 'Is this your preschool?'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isSent
                  ? 'Your profile badge is now updated to Owner-Claimed & Verified.'
                  : `Claim and manage the listing for ${preschool.name}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isSent ? (
          <div className="py-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="font-heading text-lg font-bold text-foreground">
                Congratulations, {ownerName}!
              </h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                You now hold administrative ownership for <strong className="text-foreground">{preschool.name}</strong>.
                Parents will now see the <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">Owner-Claimed & Verified</span> badge on your listing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-primary" />
                  Your Owner Verification Key:
                </span>
                <span className="font-mono text-primary font-bold">{claimToken}</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                A confirmation with your management portal link has been sent to <strong className="text-foreground">{email}</strong>.
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full h-11 font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              Back to Directory
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* School Record Banner */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-start gap-3">
              <School className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-foreground block">{preschool.name}</span>
                <span className="text-muted-foreground">
                  {preschool.suburb}, {preschool.city} · {preschool.province || 'South Africa'}
                </span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {preschool.dsdRegistration && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      DSD: {preschool.dsdRegistration}
                    </span>
                  )}
                  {preschool.npoNumber && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      NPO #{preschool.npoNumber}
                    </span>
                  )}
                  {preschool.isSubsidised && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                      DSD Subsidised
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Claimant Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Your Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sindi Khumalo"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Your Role at School <span className="text-destructive">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Owner / Principal">Owner / Principal</option>
                  <option value="Director / Headmaster">Director / Headmaster</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Head Educator">Head Educator</option>
                  <option value="Board Member">Board Member</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Official Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="principal@school.co.za"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Contact Phone (SA) <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+27 82 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Verification Proof / Accreditation Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. DSD registration certificate no., school website, or official landline"
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Free verification for accredited South African early childhood institutions.
              </span>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Ownership...</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    <span>Claim Listing — Free</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
