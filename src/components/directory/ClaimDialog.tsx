"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Preschool, PROVINCES, CURRICULUMS, Province } from '@/data/preschools';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClaimDialogProps {
  preschool: Preschool | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess?: (preschool: Preschool) => void;
  isFromLiveSearch?: boolean;
}

export default function ClaimDialog({
  preschool,
  isOpen,
  onClose,
  onClaimSuccess,
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
    if (preschool.phone) {
      setPhone(preschool.phone);
    }
    if (preschool.websiteUrl) {
      setProofNotes(`Official website: ${preschool.websiteUrl}`);
    }
  }, [preschoolId, preschool]);

  if (!preschool) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanName = schoolName.trim() || preschool.name;
    const cleanCity = city.trim() || preschool.city || 'South Africa';
    const computedSlug =
      isFromLiveSearch
        ? `${cleanName}-${cleanCity}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        : preschool.slug || preschool.id;

    const updatedPreschoolPayload: Preschool = {
      ...preschool,
      id: computedSlug,
      slug: computedSlug,
      name: cleanName,
      tagline: `Early childhood development centre in ${cleanCity}, ${province}`,
      province,
      city: cleanCity,
      municipality: cleanCity,
      district: cleanCity,
      suburb: cleanCity,
      address: address.trim() || `${cleanCity}, ${province}, South Africa`,
      monthlyFeeZAR: Math.max(150, Number(monthlyFeeZAR) || 950),
      operatingHours: operatingHours.trim() || '07:00 – 17:00',
      curriculum,
      websiteUrl: websiteUrl.trim() || undefined,
      phone: phone.trim() || preschool.phone,
      email: email.trim() || preschool.email,
      principal: `${ownerName.trim()} (${role})`,
      isClaimed: true,
      isVerified: true,
      claimedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nurserySlug: computedSlug,
          nurseryName: cleanName,
          ownerName: ownerName.trim(),
          ownerEmail: email.trim(),
          ownerPhone: phone.trim(),
          role,
          proofNotes,
          preschoolData: updatedPreschoolPayload,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const finalSchool: Preschool = data.preschool || updatedPreschoolPayload;
        setPublishedSchool(finalSchool);
        setIsSent(true);
        setClaimToken(data.token || 'owner_token_verified');

        // Persist claimed slug, custom preschool record, and Owner Dashboard active school in localStorage
        try {
          const slug = finalSchool.slug || finalSchool.id;
          const storedSlugs = JSON.parse(localStorage.getItem('nurserynet_claimed_slugs') || '[]');
          if (Array.isArray(storedSlugs) && !storedSlugs.includes(slug)) {
            storedSlugs.push(slug);
            localStorage.setItem('nurserynet_claimed_slugs', JSON.stringify(storedSlugs));
          }

          const storedCustom = JSON.parse(localStorage.getItem('nurserynet_custom_preschools') || '[]');
          const filteredCustom = Array.isArray(storedCustom)
            ? storedCustom.filter((item: Preschool) => (item.slug || item.id) !== slug)
            : [];
          localStorage.setItem(
            'nurserynet_custom_preschools',
            JSON.stringify([finalSchool, ...filteredCustom])
          );

          // Sync to Owner Dashboard so visiting /dashboard shows this claimed school
          const existingPlanRaw = localStorage.getItem('nurserynet_active_plan');
          let existingPlan: any = {};
          if (existingPlanRaw) {
            try {
              existingPlan = JSON.parse(existingPlanRaw) || {};
            } catch {
              existingPlan = {};
            }
          }
          localStorage.setItem(
            'nurserynet_active_plan',
            JSON.stringify({
              ...existingPlan,
              schoolName: finalSchool.name,
              schoolSlug: slug,
              monthlyFeeZAR: finalSchool.monthlyFeeZAR,
              operatingHours: finalSchool.operatingHours,
              websiteUrl: finalSchool.websiteUrl || '',
              city: finalSchool.city,
              province: finalSchool.province,
              tierName: existingPlan.tierName || 'Owner-Claimed & Verified',
            })
          );
        } catch {
          // Ignore localStorage errors
        }

        toast({
          title: isFromLiveSearch ? 'Preschool Added & Claimed!' : 'Ownership Claim Approved!',
          description: `${finalSchool.name} is now live in the Directory with the Owner-Claimed badge.`,
        });

        if (onClaimSuccess) {
          onClaimSuccess(finalSchool);
        }
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
                  ? 'Preschool Published & Claimed!'
                  : isFromLiveSearch
                  ? 'Add & Claim Preschool in Directory'
                  : 'Is this your preschool?'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isSent
                  ? 'Your listing is now live in the NurseryNet Directory with the Owner-Claimed badge.'
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
                Congratulations, {ownerName}!
              </h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                <strong className="text-foreground">{displaySchool.name}</strong> ({displaySchool.city},{' '}
                {displaySchool.province}) is now published in the NurseryNet Directory as{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Owner-Claimed &amp; Verified
                </span>
                .
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
                Your school profile has also been synced to your Owner Dashboard ({email}).
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
                  School Directory Details (Pre-Filled — Review or Edit)
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
                    Preschool Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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

            <div className="pt-1">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing &amp; Verifying Ownership...</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    <span>
                      {isFromLiveSearch
                        ? 'Publish & Claim Listing in Directory — Free'
                        : 'Claim Listing — Free'}
                    </span>
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
