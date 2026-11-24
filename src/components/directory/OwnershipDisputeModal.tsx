'use client';

import { useState, useEffect } from 'react';
import { Preschool } from '@/data/preschools';
import { useAuth } from '@/context/AuthContext';
import {
  submitOwnershipDispute,
  type VerifiedOwnershipRecord,
} from '@/lib/firestore-ownership';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldAlert,
  Lock,
  CheckCircle2,
  Loader2,
  LogIn,
  AlertCircle,
} from 'lucide-react';

interface OwnershipDisputeModalProps {
  preschool: Preschool | null;
  ownershipRecord?: VerifiedOwnershipRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OwnershipDisputeModal({
  preschool,
  ownershipRecord,
  isOpen,
  onClose,
}: OwnershipDisputeModalProps) {
  const { user, signInWithGoogle, getIdToken } = useAuth();
  const { toast } = useToast();

  const [challengerName, setChallengerName] = useState('');
  const [challengerPhone, setChallengerPhone] = useState('');
  const [challengerRole, setChallengerRole] = useState('Owner / Principal');
  const [registrationRef, setRegistrationRef] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedDisputeId, setSubmittedDisputeId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) {
      setChallengerName((prev) => prev || user.name);
    }
  }, [user?.name]);

  if (!preschool) return null;

  const schoolSlug = ownershipRecord?.schoolSlug || preschool.slug || preschool.id;
  const currentOwnerUid = ownershipRecord?.ownerUid || preschool.ownerUid || '';

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle('Preschool Owner');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('Could not sign in with Google. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !user.email || !user.emailVerified) {
      setError('Please sign in with a verified Google account to submit a formal dispute.');
      return;
    }

    if (!currentOwnerUid) {
      setError('This listing does not have an active verified owner lock in Firestore.');
      return;
    }

    if (user.uid === currentOwnerUid) {
      setError('You are already the verified owner of this preschool listing.');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Please provide at least 10 characters explaining your ownership claim and evidence.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { disputeId } = await submitOwnershipDispute({
        schoolSlug,
        schoolName: preschool.name,
        currentOwnerUid,
        challengerUid: user.uid,
        challengerName: challengerName.trim() || user.name,
        challengerEmail: user.email,
        challengerPhone: challengerPhone.trim(),
        challengerRole,
        reason: reason.trim(),
        registrationRef: registrationRef.trim(),
      });

      setSubmittedDisputeId(disputeId);
      toast({
        title: 'Ownership Dispute Logged',
        description: `Case ${disputeId} has been routed to the NurseryNet Verification Team.`,
      });

      // Non-blocking admin email alert if Resend direct integration is configured
      void getIdToken().then((token) => {
        if (!token) return;
        fetch('/api/verification/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventType: 'ownership_dispute',
            schoolName: preschool.name,
            referenceId: disputeId,
          }),
        }).catch(() => {});
      });
    } catch (err: any) {
      setError(
        err?.message?.includes('PERMISSION_DENIED')
          ? 'Unable to log dispute. Ensure this preschool is currently locked and you are not the current owner.'
          : 'Could not submit ownership dispute. Please check all fields and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmittedDisputeId(null);
      setError(null);
      setReason('');
      setRegistrationRef('');
    }, 250);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-card border border-border">
        <DialogHeader className="text-left space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-bold text-foreground">
                {submittedDisputeId ? 'Ownership Dispute Submitted' : 'File an Ownership Dispute'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {preschool.name} · Currently locked to a verified account
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submittedDisputeId ? (
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-foreground">Dispute case opened for admin review</p>
                <p className="text-muted-foreground leading-relaxed">
                  Our verification team will review your DSD / NPO / CIPC evidence against the current verified owner before making any ownership transfer.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Dispute Reference ID</span>
              <span className="font-mono font-bold text-foreground tabular-nums">{submittedDisputeId}</span>
            </div>

            <Button onClick={handleClose} className="w-full h-10 font-bold">
              Done
            </Button>
          </div>
        ) : !user ? (
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                To prevent fraudulent takeover attempts, you must sign in with a verified Google account before submitting an official ownership dispute for{' '}
                <strong className="text-foreground">{preschool.name}</strong>.
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full h-11 font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              {signingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{signingIn ? 'Signing in...' : 'Sign in with Google to Continue'}</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground leading-relaxed">
              The live listing remains locked while our team verifies both parties. Submitting false ownership claims is logged in our audit trail.
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Your Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={120}
                  value={challengerName}
                  onChange={(e) => setChallengerName(e.target.value)}
                  placeholder="e.g. Thandiwe Mokoena"
                  className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Your Role at School <span className="text-destructive">*</span>
                </label>
                <select
                  value={challengerRole}
                  onChange={(e) => setChallengerRole(e.target.value)}
                  className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Owner / Principal">Owner / Principal</option>
                  <option value="Director / Founder">Director / Founder</option>
                  <option value="Governing Body Chair">Governing Body Chair</option>
                  <option value="Authorized Administrator">Authorized Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Direct Contact Phone <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  required
                  minLength={6}
                  maxLength={32}
                  value={challengerPhone}
                  onChange={(e) => setChallengerPhone(e.target.value)}
                  placeholder="+27 82 123 4567"
                  className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-background text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  DSD / NPO / CIPC Reference
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={registrationRef}
                  onChange={(e) => setRegistrationRef(e.target.value)}
                  placeholder="e.g. NPO 123-456 or DSD Cert #"
                  className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Explanation &amp; Proof of Rightful Ownership <span className="text-destructive">*</span>
              </label>
              <textarea
                required
                rows={4}
                minLength={10}
                maxLength={1500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you are the legitimate principal or owner (e.g., official DSD certificate holder, school landline/website listed under your name, or previous staff member left the school)."
                className="w-full text-xs p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={handleClose} className="h-10 text-xs font-semibold">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Dispute...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Submit Formal Dispute</span>
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
