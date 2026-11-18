"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Preschool, PROVINCES, CURRICULUMS, Province } from '@/data/preschools';
import {
  removeClaimedPreschoolListing,
  syncOwnerProfileToDirectory,
} from '@/lib/owner-listing-sync';
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
  Key,
  Globe,
  LayoutDashboard,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClaimDialogProps {
  preschool: Preschool | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess?: (preschool: Preschool, previousSlug?: string) => void;
  onRemoveClaimed?: (removedSlug: string) => void;
  isFromLiveSearch?: boolean;
}

export default function ClaimDialog({
  preschool,
  isOpen,
  onClose,
  onClaimSuccess,
  onRemoveClaimed,
  isFromLiveSearch = false,
}: ClaimDialogProps) {
  const { toast } = useToast();

  // Editable School Profile Fields (pre-filled from live search or existing record)
  const [schoolName, setSchoolName] = useState('');
  const [province, setProvince] = useState<Province | string>('KwaZulu-Natal');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [monthlyFeeZAR, setMonthlyFeeZAR] = useState<number>(950);
  const [operatingHours, setOperatingHours] = useState('07:00 – 17:00');
  const [curriculum, setCurriculum] = useState('Play-Based');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Owner Verification Fields
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Owner / Principal');
  const [proofNotes, setProofNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [claimToken, setClaimToken] = useState('');
  const [publishedSchool, setPublishedSchool] = useState<Preschool | null>(null);

  const preschoolId = preschool?.id || '';
  const isEditingExistingClaim = Boolean(preschool?.isClaimed);

  useEffect(() => {
    if (!preschool) return;
    setSchoolName(preschool.name || '');
    setProvince(preschool.province || 'KwaZulu-Natal');
    setCity(preschool.city || preschool.municipality || '');
    setAddress(preschool.address || '');
    setMonthlyFeeZAR(preschool.monthlyFeeZAR || 950);
    setOperatingHours(preschool.operatingHours || '07:00 – 17:00');
    setCurriculum(preschool.curriculum || 'Play-Based');
    setWebsiteUrl(preschool.websiteUrl || '');
    setPhone(preschool.phone || '082 555 1829');
    setEmail(preschool.email || 'principal@school.co.za');
    const cleanPrincipal = (preschool.principal || 'Verified Principal')
      .replace(/\s*\(.*\)\s*$/, '')
      .trim();
    setOwnerName(cleanPrincipal || 'Verified Principal');
    if (preschool.websiteUrl) {
      setProofNotes(`Official website: ${preschool.websiteUrl}`);
    }
  }, [preschoolId, preschool]);

  if (!preschool) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const previousSlug = preschool.slug || preschool.id;
    const previousName = preschool.name;
    const cleanName = schoolName.trim() || preschool.name;
    const cleanCity = city.trim() || preschool.city || 'South Africa';

    try {
      const finalSchool = await syncOwnerProfileToDirectory({
        previousSlug,
        previousName,
        schoolName: cleanName,
        city: cleanCity,
        province: String(province),
        address: address.trim() || `${cleanCity}, ${province}, South Africa`,
        monthlyFeeZAR: Math.max(150, Number(monthlyFeeZAR) || 950),
        operatingHours: operatingHours.trim() || '07:00 – 17:00',
        curriculum,
        websiteUrl: websiteUrl.trim() || undefined,
        whatsappPhone: phone.trim() || preschool.phone,
        email: email.trim() || preschool.email,
        ownerName: ownerName.trim() || 'Verified Principal',
        role,
      });

      setPublishedSchool(finalSchool);
      setIsSent(true);
      setClaimToken(`owner_tok_${finalSchool.id.slice(0, 10)}`);

      toast({
        title: isEditingExistingClaim
          ? 'Preschool Name & Listing Updated!'
          : isFromLiveSearch
          ? 'Preschool Added & Claimed!'
          : 'Ownership Claim Approved!',
        description: `${finalSchool.name} is now updated across both the Directory and your Owner Portal.`,
      });

      if (onClaimSuccess) {
        onClaimSuccess(finalSchool, previousSlug);
      }
    } catch {
      toast({
        title: 'Connection error',
        description: 'Unable to update listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDuplicateClaim = async () => {
    const slugToRemove = preschool.slug || preschool.id;
    await removeClaimedPreschoolListing(slugToRemove);
    if (onRemoveClaimed) {
      onRemoveClaimed(slugToRemove);
    }
    toast({
      title: 'Claimed Listing Removed',
      description: `Removed "${preschool.name}" from your custom claimed listings.`,
    });
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSent(false);
      setClaimToken('');
      setPublishedSchool(null);
    }, 300);
  };

  const displaySchool = publishedSchool || preschool;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-card border-border">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl font-bold text-foreground">
                {isSent
                  ? 'Preschool Listing Updated & Synced!'
                  : isEditingExistingClaim
                  ? 'Edit Claimed Preschool Name & Details'
                  : isFromLiveSearch
                  ? 'Add & Claim Preschool in Directory'
                  : 'Is this your preschool?'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isSent
                  ? 'Your corrected name and details are now live in both the Directory and Owner Portal.'
                  : isEditingExistingClaim
                  ? 'Fix any spelling mistake in your preschool name or update tuition, hours, and location. Changes sync immediately to the Directory and Owner Portal.'
                  : isFromLiveSearch
                  ? 'Review the pre-filled details from live search and verify ownership to publish your listing.'
                  : `Claim and manage the listing for ${preschool.name}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isSent ? (
          <div className="py-5 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="font-heading text-lg font-bold text-foreground">
                {isEditingExistingClaim ? 'Listing Corrected!' : `Congratulations, ${ownerName}!`}
              </h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                <strong className="text-foreground">{displaySchool.name}</strong> ({displaySchool.city},{' '}
                {displaySchool.province}) is now live in the NurseryNet Directory and synced with your Owner Portal.
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
                Any future edits made in the Owner Portal or Directory automatically stay in sync.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <Button
                onClick={handleClose}
                className="flex-1 h-11 font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              >
                View Listing in Directory
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 h-11 font-bold rounded-xl border-primary/40 text-primary hover:bg-primary/10"
              >
                <Link href="/dashboard" onClick={handleClose}>
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  Manage in Owner Dashboard
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Editable School Directory Profile Section */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <School className="w-4 h-4 text-primary" />
                  School Directory Details (Correct Spelling or Update Info)
                </span>
                {isFromLiveSearch && (
                  <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    From Live Web
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Preschool Name (Displayed in Directory) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Province <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Town / City / Suburb <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Umzimkhulu"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Erf 28 Riverbend Road, Skoonplaas, Umzimkhulu"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Monthly Tuition (ZAR)
                  </label>
                  <input
                    type="number"
                    min={150}
                    max={25000}
                    value={monthlyFeeZAR}
                    onChange={(e) => setMonthlyFeeZAR(Number(e.target.value))}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    placeholder="07:00 – 17:00"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Curriculum
                  </label>
                  <select
                    value={curriculum}
                    onChange={(e) => setCurriculum(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CURRICULUMS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.yourschool.co.za"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
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
                  placeholder="+27 79 448 6843"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {!isEditingExistingClaim && (
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
              </div>
            )}

            <div className="pt-1 flex flex-col gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving &amp; Syncing to Directory...</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    <span>
                      {isEditingExistingClaim
                        ? 'Save Corrected Name & Update Directory Listing'
                        : isFromLiveSearch
                        ? 'Publish & Claim Listing in Directory — Free'
                        : 'Claim Listing — Free'}
                    </span>
                  </>
                )}
              </Button>

              {isEditingExistingClaim && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRemoveDuplicateClaim}
                  className="w-full h-9 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove This Claimed Listing (if duplicate)</span>
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
