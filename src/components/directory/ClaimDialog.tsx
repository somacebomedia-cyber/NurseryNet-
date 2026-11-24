'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Preschool, PROVINCES, CURRICULUMS, Province } from '@/data/preschools';
import { useAuth } from '@/context/AuthContext';
import {
  hasRealWebsitePhoto,
  isSocialMediaUrl,
  MAX_PRESCHOOL_PROFILE_PHOTOS,
  resolveRealPreschoolImages,
} from '@/lib/real-website-photos';
import {
  getVerificationMethodLabel,
  sanitizeFirestoreId,
  VerificationMethod,
} from '@/lib/ownership-verification';
import {
  completeInstantVerifiedClaim,
  submitManualDocumentClaim,
  updateVerifiedOwnedListing,
  type VerifiedOwnershipRecord,
} from '@/lib/firestore-ownership';
import { syncOwnerProfileToDirectory } from '@/lib/owner-listing-sync';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  BadgeCheck,
  Loader2,
  CheckCircle2,
  School,
  Globe,
  LayoutDashboard,
  Lock,
  Smartphone,
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  Clock,
  AlertCircle,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EligibilityResponse {
  foundInDirectory: boolean;
  schoolSlug: string;
  schoolName: string;
  domainMatch: {
    eligible: boolean;
    canAutoApproveNow: boolean;
    officialDomain: string | null;
    callerEmail: string | null;
    isWebmail: boolean;
    reason: string;
  };
  phoneOtp: {
    eligible: boolean;
    maskedPhone: string | null;
    reason: string;
  };
  manualReview: {
    eligible: boolean;
    dsdRegistrationOnFile: string | null;
    hasNpoOnFile: boolean;
  };
}

interface ClaimDialogProps {
  preschool: Preschool | null;
  ownershipRecord?: VerifiedOwnershipRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess?: (preschool: Preschool, previousSlug?: string) => void;
  onRemoveClaimed?: (removedSlug: string) => void;
  onOpenDispute?: (preschool: Preschool) => void;
  isFromLiveSearch?: boolean;
}

export default function ClaimDialog({
  preschool,
  ownershipRecord,
  isOpen,
  onClose,
  onClaimSuccess,
  onOpenDispute,
  isFromLiveSearch = false,
}: ClaimDialogProps) {
  const { user, signInWithGoogle, getIdToken } = useAuth();
  const { toast } = useToast();

  // Mode / Step state
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>('domain_match');
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // OTP Challenge State
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingChallenge, setVerifyingChallenge] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [sandboxPreviewCode, setSandboxPreviewCode] = useState<string | null>(null);
  const [providerNote, setProviderNote] = useState<string | null>(null);

  // Claimant & Manual Evidence Fields
  const [ownerName, setOwnerName] = useState('');
  const [role, setRole] = useState('Owner / Principal');
  const [contactPhone, setContactPhone] = useState('');
  const [dsdNumber, setDsdNumber] = useState('');
  const [npoNumber, setNpoNumber] = useState('');
  const [cipcNumber, setCipcNumber] = useState('');
  const [proofNotes, setProofNotes] = useState('');

  // Editable School Profile Fields (strictly for verified Owner Edit mode)
  const [schoolName, setSchoolName] = useState('');
  const [province, setProvince] = useState<Province | string>('KwaZulu-Natal');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [monthlyFeeZAR, setMonthlyFeeZAR] = useState<number>(950);
  const [operatingHours, setOperatingHours] = useState('07:00 – 17:00');
  const [curriculum, setCurriculum] = useState('Play-Based');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [publicEmail, setPublicEmail] = useState('');
  const [schoolImages, setSchoolImages] = useState<string[]>([]);
  const [fetchingPhotos, setFetchingPhotos] = useState(false);

  // Submission & Result state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultState, setResultState] = useState<
    | null
    | {
        type: 'instant_verified' | 'pending_review' | 'updated';
        claimId?: string;
        method?: VerificationMethod;
      }
  >(null);

  const schoolSlug = sanitizeFirestoreId(
    ownershipRecord?.schoolSlug || preschool?.slug || preschool?.id || ''
  );
  const lockedOwnerUid = ownershipRecord?.ownerUid || preschool?.ownerUid || null;
  const isLockedInFirestore = Boolean(lockedOwnerUid);
  const isCurrentVerifiedOwner = Boolean(
    user && lockedOwnerUid && (user.uid === lockedOwnerUid || user.isAdmin)
  );
  const isLockedBySomeoneElse = Boolean(isLockedInFirestore && !isCurrentVerifiedOwner);

  // Countdown timer for OTP resend throttle
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Hydrate fields when preschool changes
  useEffect(() => {
    if (!preschool || !isOpen) return;
    setErrorMessage(null);
    setResultState(null);
    setChallengeId(null);
    setOtpCode('');
    setSandboxPreviewCode(null);
    setProviderNote(null);

    setSchoolName(ownershipRecord?.schoolName || preschool.name || '');
    setProvince(ownershipRecord?.province || preschool.province || 'KwaZulu-Natal');
    setCity(ownershipRecord?.city || preschool.city || preschool.municipality || '');
    setAddress(ownershipRecord?.address || preschool.address || '');
    setMonthlyFeeZAR(ownershipRecord?.monthlyFeeZAR || preschool.monthlyFeeZAR || 950);
    setOperatingHours(ownershipRecord?.operatingHours || preschool.operatingHours || '07:00 – 17:00');
    setCurriculum(ownershipRecord?.curriculum || preschool.curriculum || 'Play-Based');
    setWebsiteUrl(ownershipRecord?.websiteUrl || preschool.websiteUrl || '');
    setContactPhone(ownershipRecord?.publicContactPhone || preschool.phone || '');
    setPublicEmail(ownershipRecord?.publicContactEmail || preschool.email || '');
    setNpoNumber(ownershipRecord?.npoNumber || preschool.npoNumber || '');

    const resolved = resolveRealPreschoolImages({
      name: ownershipRecord?.schoolName || preschool.name,
      slug: schoolSlug,
      websiteUrl: ownershipRecord?.websiteUrl || preschool.websiteUrl,
      images:
        ownershipRecord?.images && ownershipRecord.images.length > 0
          ? ownershipRecord.images
          : preschool.images,
    }).slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS);
    setSchoolImages(resolved);

    setOwnerName(user?.name || ownershipRecord?.ownerDisplayName || '');
    setRole(ownershipRecord?.ownerRole || 'Owner / Principal');
  }, [preschool, ownershipRecord, isOpen, schoolSlug, user?.name]);

  // Fetch authoritative eligibility from server when unclaimed & open
  const fetchEligibility = useCallback(async () => {
    if (!preschool || !isOpen || isLockedInFirestore) return;
    setLoadingEligibility(true);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/verification/eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          schoolSlug,
          schoolName: preschool.name,
        }),
      });
      if (res.ok) {
        const data: EligibilityResponse = await res.json();
        setEligibility(data);
        if (data.domainMatch.canAutoApproveNow) {
          setSelectedMethod('domain_match');
        } else if (data.phoneOtp.eligible) {
          setSelectedMethod('phone_otp');
        } else {
          setSelectedMethod('admin_document_review');
        }
      }
    } catch {
      setSelectedMethod('admin_document_review');
    } finally {
      setLoadingEligibility(false);
    }
  }, [preschool, isOpen, isLockedInFirestore, schoolSlug, getIdToken]);

  useEffect(() => {
    void fetchEligibility();
  }, [fetchEligibility, user?.uid]);

  if (!preschool) return null;

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle('Preschool Owner');
      toast({
        title: 'Account Verified',
        description: 'Checking your ownership verification options now.',
      });
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage('Google sign-in could not be completed. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSendOtp = async () => {
    setErrorMessage(null);
    setSendingOtp(true);
    try {
      const token = await getIdToken();
      if (!token) {
        setErrorMessage('Please sign in first to request a verification code.');
        return;
      }

      const res = await fetch('/api/verification/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schoolSlug }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data?.error || 'Could not dispatch verification code.');
        if (typeof data?.retryAfterSeconds === 'number') {
          setResendCooldown(data.retryAfterSeconds);
        }
        return;
      }

      setChallengeId(data.challengeId);
      setMaskedPhone(data.maskedPhone);
      setOtpExpiresAt(data.expiresAt);
      setResendCooldown(data.cooldownSeconds || 45);
      setSandboxPreviewCode(data.sandboxPreviewCode || null);
      setProviderNote(data.providerNote || null);

      toast({
        title:
          data.deliveryMode === 'live'
            ? `Code Sent via ${data.providerLabel || 'SMS / WhatsApp'}`
            : '6-Digit Sandbox Code Issued',
        description:
          data.deliveryMode === 'live'
            ? `Verification code delivered to listed school number ${data.maskedPhone}.`
            : `Preview code generated for listed number ${data.maskedPhone}.`,
      });
    } catch {
      setErrorMessage('Network error while requesting verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleInstantVerify = async (method: 'domain_match' | 'phone_otp') => {
    if (!user || !user.email) return;
    setErrorMessage(null);
    setVerifyingChallenge(true);

    try {
      const token = await getIdToken();
      if (!token) {
        setErrorMessage('Session expired. Please sign in again.');
        return;
      }

      const verifyRes = await fetch('/api/verification/verify-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolSlug,
          method,
          ...(method === 'phone_otp' ? { challengeId, code: otpCode.trim() } : {}),
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.verified || !verifyData.verificationProofHash) {
        setErrorMessage(verifyData?.error || 'Ownership verification failed.');
        return;
      }

      // Atomically commit claim + locked verified_ownership + audit log in Firestore
      const { claimId } = await completeInstantVerifiedClaim({
        schoolSlug,
        schoolName: preschool.name,
        city: preschool.city || preschool.municipality,
        province: String(preschool.province || 'KwaZulu-Natal'),
        address: preschool.address,
        monthlyFeeZAR: preschool.monthlyFeeZAR,
        operatingHours: preschool.operatingHours,
        curriculum: preschool.curriculum,
        websiteUrl: preschool.websiteUrl,
        npoNumber: preschool.npoNumber || undefined,
        publicContactPhone: preschool.phone || contactPhone,
        publicContactEmail: preschool.email || user.email,
        images: schoolImages,
        claimantUid: user.uid,
        claimantName: ownerName.trim() || user.name,
        claimantEmail: user.email,
        claimantPhone: contactPhone.trim() || preschool.phone || '',
        claimantRole: role,
        verificationMethod: method,
        verifiedDomain: verifyData.verifiedDomain,
        maskedTargetPhone: verifyData.maskedTargetPhone || maskedPhone || undefined,
        verificationProofHash: verifyData.verificationProofHash,
      });

      // Keep local Owner Portal & server directory pool synced with cryptographic proof
      const syncedSchool = await syncOwnerProfileToDirectory({
        previousSlug: schoolSlug,
        previousName: preschool.name,
        schoolName: preschool.name,
        city: preschool.city || preschool.municipality,
        province: String(preschool.province || 'KwaZulu-Natal'),
        address: preschool.address,
        monthlyFeeZAR: preschool.monthlyFeeZAR || 950,
        operatingHours: preschool.operatingHours || '07:00 – 17:00',
        curriculum: preschool.curriculum,
        websiteUrl: preschool.websiteUrl,
        images: schoolImages,
        whatsappPhone: preschool.phone || contactPhone,
        email: preschool.email || user.email,
        ownerName: ownerName.trim() || user.name,
        role,
        ownerUid: user.uid,
        verificationMethod: method,
        verificationProofHash: verifyData.verificationProofHash,
      });

      setResultState({ type: 'instant_verified', claimId, method });
      toast({
        title: 'Ownership Verified & Locked!',
        description: `${preschool.name} is now locked to your verified account.`,
      });

      if (onClaimSuccess) {
        onClaimSuccess(
          {
            ...syncedSchool,
            ownerUid: user.uid,
            ownerDisplayName: ownerName.trim() || user.name,
            verificationMethod: method,
            lockStatus: 'locked',
            isClaimed: true,
            isVerified: true,
          },
          schoolSlug
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message?.includes('PERMISSION_DENIED')
          ? 'This preschool may already be claimed or your email domain did not match security rules.'
          : 'Verification succeeded on the server, but saving the ownership lock failed. Please try again.'
      );
    } finally {
      setVerifyingChallenge(false);
    }
  };

  const handleSubmitManualReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    setErrorMessage(null);

    if (!dsdNumber.trim() && !npoNumber.trim() && !cipcNumber.trim() && proofNotes.trim().length < 10) {
      setErrorMessage(
        'Please provide a DSD registration number, NPO/CIPC number, or detailed proof notes so an admin can verify your school.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { claimId } = await submitManualDocumentClaim({
        schoolSlug,
        schoolName: preschool.name,
        city: preschool.city || preschool.municipality,
        province: String(preschool.province || 'KwaZulu-Natal'),
        claimantUid: user.uid,
        claimantName: ownerName.trim() || user.name,
        claimantEmail: user.email,
        claimantPhone: contactPhone.trim(),
        claimantRole: role,
        dsdNumber: dsdNumber.trim(),
        npoNumber: npoNumber.trim(),
        cipcNumber: cipcNumber.trim(),
        proofNotes: proofNotes.trim(),
      });

      setResultState({
        type: 'pending_review',
        claimId,
        method: 'admin_document_review',
      });
      toast({
        title: 'Submitted for Verification Review',
        description: `Your claim (${claimId}) is queued for the NurseryNet Verification Team.`,
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
            eventType: 'manual_claim',
            schoolName: preschool.name,
            referenceId: claimId,
          }),
        }).catch(() => {});
      });
    } catch {
      setErrorMessage('Could not submit manual claim. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveOwnedListingEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await updateVerifiedOwnedListing({
        schoolSlug,
        schoolName: schoolName.trim() || preschool.name,
        ownerDisplayName: ownerName.trim() || user.name,
        ownerRole: role,
        city: city.trim() || preschool.city,
        province: String(province),
        address: address.trim(),
        monthlyFeeZAR: Math.max(150, Number(monthlyFeeZAR) || 950),
        operatingHours: operatingHours.trim() || '07:00 – 17:00',
        curriculum,
        websiteUrl: websiteUrl.trim(),
        npoNumber: npoNumber.trim(),
        publicContactPhone: contactPhone.trim(),
        publicContactEmail: publicEmail.trim(),
        images: schoolImages,
      });

      const synced = await syncOwnerProfileToDirectory({
        previousSlug: schoolSlug,
        previousName: preschool.name,
        schoolName: schoolName.trim() || preschool.name,
        city: city.trim() || preschool.city,
        province: String(province),
        address: address.trim(),
        monthlyFeeZAR: Math.max(150, Number(monthlyFeeZAR) || 950),
        operatingHours: operatingHours.trim() || '07:00 – 17:00',
        curriculum,
        websiteUrl: websiteUrl.trim(),
        images: schoolImages,
        whatsappPhone: contactPhone.trim(),
        email: publicEmail.trim(),
        npoNumber: npoNumber.trim(),
        ownerName: ownerName.trim() || user.name,
        role,
        ownerUid: lockedOwnerUid || user.uid,
        verificationMethod: ownershipRecord?.verificationMethod,
      });

      setResultState({ type: 'updated' });
      toast({
        title: 'Verified Listing Updated',
        description: `${synced.name} changes are now saved and synced.`,
      });

      if (onClaimSuccess) {
        onClaimSuccess(
          {
            ...synced,
            ownerUid: lockedOwnerUid || user.uid,
            ownerDisplayName: ownerName.trim() || user.name,
            verificationMethod: ownershipRecord?.verificationMethod,
            lockStatus: ownershipRecord?.lockStatus || 'locked',
            isClaimed: true,
            isVerified: true,
          },
          schoolSlug
        );
      }
    } catch {
      setErrorMessage('You do not have permission to update this locked listing, or a field was invalid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchWebsitePhotos = async () => {
    if (!websiteUrl.trim() && !schoolName.trim()) return;
    setFetchingPhotos(true);
    try {
      const res = await fetch('/api/extract-website-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: websiteUrl.trim(),
          schoolName: schoolName.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.images) && data.images.length > 0) {
          setSchoolImages(data.images.slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS));
          toast({
            title: 'Photos Loaded',
            description: `Extracted ${Math.min(data.images.length, MAX_PRESCHOOL_PROFILE_PHOTOS)} school photo(s).`,
          });
          return;
        }
      }
      toast({ title: 'No additional photos found' });
    } catch {
      toast({ title: 'Could not reach URL', variant: 'destructive' });
    } finally {
      setFetchingPhotos(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setResultState(null);
      setErrorMessage(null);
      setChallengeId(null);
      setOtpCode('');
      setSandboxPreviewCode(null);
    }, 250);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-card border border-border">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isLockedBySomeoneElse
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {isLockedBySomeoneElse ? <Lock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="font-heading text-xl font-bold text-foreground">
                {resultState?.type === 'instant_verified'
                  ? 'Ownership Verified & Locked'
                  : resultState?.type === 'pending_review'
                  ? 'Submitted for Admin Verification'
                  : resultState?.type === 'updated'
                  ? 'Verified Listing Updated'
                  : isLockedBySomeoneElse
                  ? 'Verified & Locked Preschool Profile'
                  : isCurrentVerifiedOwner
                  ? 'Manage Your Verified Preschool Listing'
                  : isFromLiveSearch
                  ? 'Verify Ownership Before Publishing'
                  : 'Verify Preschool Ownership'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {preschool.name}
                {preschool.city ? ` · ${preschool.city}` : ''}
                {preschool.province ? ` · ${preschool.province}` : ''}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* STATE 1: RESULT SCREEN */}
        {resultState ? (
          <div className="py-5 space-y-5">
            {resultState.type === 'pending_review' ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Under Verification Review</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your registration proof for <strong className="text-foreground">{preschool.name}</strong> has been queued for our Verification Team. To protect parents and school owners, the public listing remains untouched until an admin approves your claim.
                </p>
                {resultState.claimId && (
                  <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Claim Tracking ID</span>
                    <span className="font-mono font-bold text-foreground tabular-nums">{resultState.claimId}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {resultState.type === 'updated'
                      ? 'Listing changes saved and synced'
                      : `${getVerificationMethodLabel(resultState.method)}`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">{schoolName || preschool.name}</strong> is locked strictly to your verified Google account. No other visitor can overwrite or delete this profile.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5">
              <Button onClick={handleClose} className="flex-1 h-10 font-bold">
                Return to Directory
              </Button>
              <Button asChild variant="outline" className="flex-1 h-10 font-bold">
                <Link href="/dashboard" onClick={handleClose}>
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  Open Owner Portal
                </Link>
              </Button>
            </div>
          </div>
        ) : isLockedBySomeoneElse ? (
          /* STATE 2: LOCKED TO ANOTHER OWNER -> ANTI-HIJACK SCREEN + DISPUTE CTA */
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Protected by Owner Lock</span>
                </span>
                <span className="text-muted-foreground font-medium">
                  {getVerificationMethodLabel(ownershipRecord?.verificationMethod || preschool.verificationMethod)}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                This preschool listing has already been claimed and locked by a verified representative
                {ownershipRecord?.ownerDisplayName ? ` (${ownershipRecord.ownerDisplayName})` : ''}. Random visitors cannot modify tuition fees, contact numbers, or school details.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background space-y-2.5">
              <p className="text-xs font-bold text-foreground">
                Are you the legitimate principal or owner of {preschool.name}?
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you believe this profile was claimed by an unauthorized person or former staff member, submit a formal Ownership Dispute with your DSD, NPO, or CIPC registration reference. Our verification team will review both parties before transferring access.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    handleClose();
                    if (onOpenDispute) onOpenDispute(preschool);
                  }}
                  className="flex-1 h-10 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>File Ownership Dispute</span>
                </Button>
                <Button type="button" variant="outline" onClick={handleClose} className="h-10 text-xs font-semibold">
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : isCurrentVerifiedOwner ? (
          /* STATE 3: VERIFIED OWNER EDIT FORM */
          <form onSubmit={handleSaveOwnedListingEdits} className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl">
              <span className="font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Verified Owner Access</span>
              </span>
              <span className="text-[11px]">
                {getVerificationMethodLabel(ownershipRecord?.verificationMethod)}
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-foreground block mb-1">Preschool Name</label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Province</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground"
                >
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">City / Suburb</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-foreground block mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Monthly Tuition (ZAR)</label>
                <input
                  type="number"
                  min={150}
                  max={50000}
                  value={monthlyFeeZAR}
                  onChange={(e) => setMonthlyFeeZAR(Number(e.target.value))}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground tabular-nums"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Curriculum</label>
                <select
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground"
                >
                  {CURRICULUMS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Public School Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground tabular-nums"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-foreground block mb-1">Official Website or Social URL</label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.yourschool.co.za"
                    className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={fetchingPhotos}
                    onClick={handleFetchWebsitePhotos}
                    className="h-9 px-2.5 text-[11px] font-bold shrink-0"
                  >
                    {fetchingPhotos ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Fetch Photos'}
                  </Button>
                </div>
              </div>
            </div>

            {schoolImages.length > 0 && (
              <div className="pt-2 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">
                    Campus Photos ({schoolImages.length} / {MAX_PRESCHOOL_PROFILE_PHOTOS})
                  </span>
                  {hasRealWebsitePhoto(schoolImages) && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {isSocialMediaUrl(websiteUrl) ? 'Social Media Photos' : 'Website Photos'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {schoolImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setSchoolImages((prev) =>
                          [imgUrl, ...prev.filter((u) => u !== imgUrl)].slice(0, MAX_PRESCHOOL_PROFILE_PHOTOS)
                        )
                      }
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 ${
                        idx === 0 ? 'border-primary' : 'border-border opacity-75 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`School photo ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-xs font-bold">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Saving Verified Changes...</span>
                </>
              ) : (
                <span>Save Verified Listing Changes</span>
              )}
            </Button>
          </form>
        ) : !user || !user.emailVerified ? (
          /* STATE 4: IDENTITY GATE (MUST SIGN IN WITH VERIFIED GOOGLE ACCOUNT) */
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
              <p className="font-bold text-foreground">Step 1 of 2 · Verify your identity first</p>
              <p className="text-muted-foreground leading-relaxed">
                To stop unauthorized strangers from claiming <strong className="text-foreground">{preschool.name}</strong>, NurseryNet requires a verified Google account before checking domain match, sending a listed-phone OTP, or reviewing registration documents.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full h-11 font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              {signingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{signingIn ? 'Connecting Google Account...' : 'Sign in with Google to Claim Preschool'}</span>
            </Button>
          </div>
        ) : (
          /* STATE 5: SIGNED IN -> HYBRID 3-PATH VERIFICATION WIZARD */
          <div className="space-y-4 pt-2">
            {/* Signed-in identity strip */}
            <div className="flex items-center justify-between gap-2 text-xs px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border">
              <div className="min-w-0">
                <span className="text-muted-foreground">Signed in as </span>
                <span className="font-bold text-foreground truncate">{user.email}</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                Email Verified
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Verification Method Selector Tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Choose a Proof-of-Ownership Method
                </span>
                {loadingEligibility && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking school record...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod('domain_match');
                    setErrorMessage(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-colors space-y-1 ${
                    selectedMethod === 'domain_match'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Instant
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground">Official Domain</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {eligibility?.domainMatch.officialDomain
                      ? `@${eligibility.domainMatch.officialDomain}`
                      : 'School email match'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod('phone_otp');
                    setErrorMessage(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-colors space-y-1 ${
                    selectedMethod === 'phone_otp'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Instant
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground">Listed Phone OTP</p>
                  <p className="text-[11px] text-muted-foreground leading-snug tabular-nums">
                    {eligibility?.phoneOtp.maskedPhone || 'Listed school phone'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod('admin_document_review');
                    setErrorMessage(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-colors space-y-1 ${
                    selectedMethod === 'admin_document_review'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <FileCheck2 className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      Admin Review
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground">Document Proof</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    DSD, NPO, or CIPC
                  </p>
                </button>
              </div>
            </div>

            {/* Common Claimant Identity Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Your Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Sindi Khumalo"
                  className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Your Role <span className="text-destructive">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Owner / Principal">Owner / Principal</option>
                  <option value="Director / Headmaster">Director / Headmaster</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Governing Body Chair">Governing Body Chair</option>
                </select>
              </div>
            </div>

            {/* PANEL A: OFFICIAL SCHOOL DOMAIN MATCH */}
            {selectedMethod === 'domain_match' && (
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-start gap-2.5 text-xs">
                  <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">Authoritative Website Domain Check</p>
                    <p className="text-muted-foreground leading-relaxed">
                      {eligibility?.domainMatch.reason ||
                        'We verify your signed-in email domain strictly against the official school website already listed in our directory.'}
                    </p>
                  </div>
                </div>

                {eligibility?.domainMatch.canAutoApproveNow ? (
                  <Button
                    type="button"
                    disabled={verifyingChallenge}
                    onClick={() => handleInstantVerify('domain_match')}
                    className="w-full h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                  >
                    {verifyingChallenge ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Domain &amp; Locking Profile...</span>
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="w-4 h-4" />
                        <span>Verify @{eligibility.domainMatch.officialDomain} &amp; Lock Ownership Now</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    {eligibility?.phoneOtp.eligible && (
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => setSelectedMethod('phone_otp')}
                        className="flex-1 h-9 text-xs font-bold"
                      >
                        Use Listed Phone OTP ({eligibility.phoneOtp.maskedPhone})
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedMethod('admin_document_review')}
                      className="flex-1 h-9 text-xs font-bold"
                    >
                      Switch to Document Review
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* PANEL B: LISTED PHONE / WHATSAPP 6-DIGIT OTP */}
            {selectedMethod === 'phone_otp' && (
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-start gap-2.5 text-xs">
                  <Smartphone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">
                      Authoritative Listed School Phone Verification
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {eligibility?.phoneOtp.reason ||
                        'A 6-digit single-use verification code is dispatched strictly to the public phone number already on file for this preschool.'}
                    </p>
                  </div>
                </div>

                {eligibility?.phoneOtp.eligible ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-background border border-border text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Authoritative Directory Number</span>
                        <span className="font-mono font-bold text-foreground tabular-nums">
                          {maskedPhone || eligibility.phoneOtp.maskedPhone}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant={challengeId ? 'outline' : 'default'}
                        size="sm"
                        disabled={sendingOtp || resendCooldown > 0}
                        onClick={handleSendOtp}
                        className="h-9 px-3 text-xs font-bold shrink-0"
                      >
                        {sendingOtp ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : resendCooldown > 0 ? (
                          <span className="tabular-nums">Resend in {resendCooldown}s</span>
                        ) : challengeId ? (
                          'Resend Code'
                        ) : (
                          'Send 6-Digit Code'
                        )}
                      </Button>
                    </div>

                    {sandboxPreviewCode && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/25 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Sandbox Preview OTP Code</span>
                          </span>
                          <span className="font-mono text-sm font-extrabold tracking-widest text-foreground tabular-nums">
                            {sandboxPreviewCode}
                          </span>
                        </div>
                        {providerNote && (
                          <p className="text-[11px] text-muted-foreground">{providerNote}</p>
                        )}
                      </div>
                    )}

                    {challengeId && (
                      <div className="space-y-2.5 pt-1">
                        <label className="text-xs font-bold text-foreground block">
                          Enter 6-Digit Verification Code
                          {otpExpiresAt && (
                            <span className="ml-2 font-normal text-[11px] text-muted-foreground">
                              Expires in 10 minutes · Max 5 attempts
                            </span>
                          )}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="flex-1 h-11 px-4 rounded-lg border border-border bg-background text-foreground font-mono text-lg font-bold tracking-[0.35em] text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <Button
                            type="button"
                            disabled={verifyingChallenge || otpCode.length !== 6}
                            onClick={() => handleInstantVerify('phone_otp')}
                            className="h-11 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                          >
                            {verifyingChallenge ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Verify & Lock'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedMethod('admin_document_review')}
                    className="w-full h-9 text-xs font-bold"
                  >
                    No Listed Phone on File — Continue with Manual Document Review
                  </Button>
                )}
              </div>
            )}

            {/* PANEL C: MANUAL REGISTRATION DOCUMENT REVIEW */}
            {selectedMethod === 'admin_document_review' && (
              <form onSubmit={handleSubmitManualReview} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-start gap-2.5 text-xs">
                  <FileCheck2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">
                      Manual Registration Proof (DSD / DBE / NPO / CIPC)
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Ideal for ECD centres using Gmail or an updated phone number. Our team reviews your official registration details before locking the profile to your account.
                    </p>
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
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+27 79 448 6843"
                      className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      DSD Partial Care / ECD Cert No.
                    </label>
                    <input
                      type="text"
                      value={dsdNumber}
                      onChange={(e) => setDsdNumber(e.target.value)}
                      placeholder="e.g. KZN-ECD-2024-0412"
                      className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      NPO Registration No.
                    </label>
                    <input
                      type="text"
                      value={npoNumber}
                      onChange={(e) => setNpoNumber(e.target.value)}
                      placeholder="e.g. 142-889 NPO"
                      className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      CIPC Enterprise No. (if private)
                    </label>
                    <input
                      type="text"
                      value={cipcNumber}
                      onChange={(e) => setCipcNumber(e.target.value)}
                      placeholder="e.g. 2019/442810/07"
                      className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Supporting Proof / Official Social or Website Link <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    placeholder="Provide your official school Facebook page, municipal letter details, or best time for a callback on the school's official number."
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting to Verification Queue...</span>
                    </>
                  ) : (
                    <>
                      <School className="w-4 h-4" />
                      <span>Submit Proof for Admin Approval</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
