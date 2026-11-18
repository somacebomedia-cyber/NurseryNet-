"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  calculateAgeGroupFromDob,
  DEFAULT_PARENT_PASSPORT,
  getSavedParentPassport,
  getSubmittedApplications,
  ParentEnrolmentPassport,
  PreschoolApplication,
  saveParentPassport,
} from '@/lib/application-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Sparkles,
  CheckCircle2,
  Save,
  Wand2,
  School,
  FileText,
  Phone,
  HeartPulse,
  MessageCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Loader2,
} from 'lucide-react';

function formatSaWhatsAppNumber(rawPhone?: string): string {
  const digits = (rawPhone || '0825551829').replace(/\D/g, '');
  if (digits.startsWith('27') && digits.length >= 11) return digits;
  if (digits.startsWith('0') && digits.length >= 10) return `27${digits.slice(1)}`;
  return `27${digits}`;
}

export default function ParentProfilePage() {
  const { toast } = useToast();

  const [passport, setPassport] = useState<ParentEnrolmentPassport>(DEFAULT_PARENT_PASSPORT);
  const [applications, setApplications] = useState<PreschoolApplication[]>([]);
  const [savedBanner, setSavedBanner] = useState(false);

  // Quick AI Bio Parser on Parent Profile
  const [aiQuickNote, setAiQuickNote] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);

  useEffect(() => {
    const load = () => {
      setPassport(getSavedParentPassport());
      setApplications(getSubmittedApplications());
    };
    load();
    window.addEventListener('nurserynet_passport_updated', load);
    window.addEventListener('nurserynet_leads_updated', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('nurserynet_passport_updated', load);
      window.removeEventListener('nurserynet_leads_updated', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  const handleFieldChange = <K extends keyof ParentEnrolmentPassport>(
    key: K,
    value: ParentEnrolmentPassport[K]
  ) => {
    setPassport((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'childDateOfBirth' && typeof value === 'string') {
        next.childAgeGroup = calculateAgeGroupFromDob(value);
      }
      return next;
    });
  };

  const handleSavePassport = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveParentPassport({
      ...passport,
      customAnswers: {
        ...passport.customAnswers,
        'Child’s Primary Home Language': passport.homeLanguage,
        'Attendance & Aftercare Option': passport.attendancePreference,
        'Does your child require school transport collection?': passport.requiresTransport
          ? 'Yes'
          : 'No',
        'Previous Preschool / Crèche Attended (if any)': passport.previousPreschool,
        'Potty / Toilet Training Status': passport.pottyTrainingStatus,
        'Dietary or Cultural Meal Requirements': passport.dietaryPreference,
        'Do you qualify for the DSD ECD Subsidy / SASSA Grant?': passport.sassaOrSubsidyStatus,
      },
    });
    setPassport(updated);
    setSavedBanner(true);
    toast({
      title: 'Parent Enrolment Profile Saved',
      description:
        'AI will now automatically copy and adapt this profile into every preschool application form you open.',
    });
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleAiPopulateProfile = async () => {
    if (!aiQuickNote.trim()) {
      toast({
        title: 'Enter a short family note first',
        description: 'Describe your child, DOB, and contact details in plain words.',
        variant: 'destructive',
      });
      return;
    }

    setIsAiParsing(true);
    try {
      const response = await fetch('/api/agentic-autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: aiQuickNote,
          customFields: [
            {
              id: 'lang',
              label: 'Child’s Primary Home Language',
              type: 'select',
              required: true,
              options: ['English', 'isiZulu', 'isiXhosa', 'Afrikaans', 'Sesotho', 'Setswana', 'Sepedi', 'Other'],
            },
            {
              id: 'att',
              label: 'Attendance & Aftercare Option',
              type: 'select',
              required: true,
              options: ['Full Day (07:00 – 17:30)', 'Half Day (07:00 – 13:00)', 'Full Day + Holiday Care'],
            },
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.autofill) {
        throw new Error(data?.error || 'Could not parse family note.');
      }

      const af = data.autofill;
      const customMap: Record<string, string> = {};
      if (Array.isArray(af.customFieldAnswers)) {
        af.customFieldAnswers.forEach((item: { questionLabel: string; answer: string }) => {
          if (item?.questionLabel) customMap[item.questionLabel] = item.answer;
        });
      }

      const nextPassport = saveParentPassport({
        childFullName: af.childFullName || passport.childFullName,
        childDateOfBirth: af.childDateOfBirth || passport.childDateOfBirth,
        childAgeGroup:
          af.childAgeGroup ||
          calculateAgeGroupFromDob(af.childDateOfBirth || passport.childDateOfBirth),
        preferredStartDate: af.preferredStartDate || passport.preferredStartDate,
        homeLanguage:
          customMap['Child’s Primary Home Language'] || passport.homeLanguage,
        attendancePreference:
          customMap['Attendance & Aftercare Option'] || passport.attendancePreference,
        parentFullName: af.parentFullName || passport.parentFullName,
        parentRelationship: af.parentRelationship || passport.parentRelationship,
        parentIdOrPassport: af.parentIdOrPassport || passport.parentIdOrPassport,
        parentPhone: af.parentPhone || passport.parentPhone,
        parentEmail: af.parentEmail || passport.parentEmail,
        residentialAddress: af.residentialAddress || passport.residentialAddress,
        medicalAllergies: af.medicalAllergies || passport.medicalAllergies,
        emergencyContactName: af.emergencyContactName || passport.emergencyContactName,
        emergencyContactPhone: af.emergencyContactPhone || passport.emergencyContactPhone,
        familyBioForAi: aiQuickNote.trim(),
      });
      setPassport(nextPassport);
      setAiQuickNote('');
      toast({
        title: 'AI Updated Your Parent Profile',
        description: af.agentSummary || 'Your universal parent profile is now ready for 1-click applications.',
      });
    } catch (err: any) {
      toast({
        title: 'AI Profile Update Notice',
        description: err?.message || 'Please check your input or API key.',
        variant: 'destructive',
      });
    } finally {
      setIsAiParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header Banner */}
      <section className="py-10 bg-muted/30 border-b border-border/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
                <span className="font-semibold text-primary flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Universal Parent Enrolment Passport
                </span>
                <span className="text-muted-foreground" aria-hidden="true">·</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Auto-Fills Any Preschool Form in 0 Clicks
                </span>
              </div>
              <h1 className="font-heading text-3xl font-extrabold text-foreground">
                My Parent &amp; Child Enrolment Profile
              </h1>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                Save your child and guardian details once here. Whenever you click <strong>Apply</strong> on any preschool (or multiple preschools at once) in the Directory, AI automatically copies from this profile and adapts your answers to match each school&apos;s custom application form.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button asChild size="sm" className="font-semibold whitespace-nowrap">
                <Link href="/directory">
                  Browse &amp; Apply to Preschools
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Columns: Universal Parent & Learner Profile Editor */}
          <div className="lg:col-span-8 space-y-6">
            {/* Optional AI Quick-Fill Bar for Parent Profile */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-primary" />
                  <h2 className="font-heading text-sm font-bold text-foreground">
                    Update Your Profile via AI Note
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Powered by Gemini Agent
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a WhatsApp message or type a quick sentence about your child to update your saved profile automatically:
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={aiQuickNote}
                  onChange={(e) => setAiQuickNote(e.target.value)}
                  placeholder="e.g. I'm Thabo Sithole (083 221 9087), father of Melokuhle born 2022-08-19 for Grade R in Jan 2027..."
                  className="text-xs bg-background"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={isAiParsing}
                  onClick={handleAiPopulateProfile}
                  className="whitespace-nowrap shrink-0 font-semibold text-xs"
                >
                  {isAiParsing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                      AI Fill Profile
                    </>
                  )}
                </Button>
              </div>
            </div>

            <form
              onSubmit={handleSavePassport}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    Saved Family Enrolment Passport
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    AI automatically copies from these fields into every preschool application form you open.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const reset = saveParentPassport(DEFAULT_PARENT_PASSPORT);
                    setPassport(reset);
                    toast({
                      title: 'Restored Sample Family Profile',
                      description: 'Loaded sample Mokoena family profile.',
                    });
                  }}
                  className="text-xs text-muted-foreground self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset Demo Profile
                </Button>
              </div>

              {savedBanner && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Profile saved! Every preschool application form in the Directory will now auto-copy from this profile.
                  </span>
                </div>
              )}

              {/* 1. Child / Learner Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  1. Child / Learner Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Child&apos;s Full Name &amp; Surname</Label>
                    <Input
                      value={passport.childFullName}
                      onChange={(e) => handleFieldChange('childFullName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Child&apos;s Date of Birth</Label>
                    <Input
                      type="date"
                      value={passport.childDateOfBirth}
                      onChange={(e) => handleFieldChange('childDateOfBirth', e.target.value)}
                      className="font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Age Group Placement (Auto-Calculated)</Label>
                    <select
                      value={passport.childAgeGroup}
                      onChange={(e) => handleFieldChange('childAgeGroup', e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="Infant / Baby Care (3–12 months)">Infant / Baby Care (3–12 months)</option>
                      <option value="Toddler (1–3 years)">Toddler (1–3 years)</option>
                      <option value="Preschool (3–4 years)">Preschool (3–4 years)</option>
                      <option value="Grade R / Pre-Primary (5–6 years)">Grade R / Pre-Primary (5–6 years)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Preferred Enrolment Term</Label>
                    <select
                      value={passport.preferredStartDate}
                      onChange={(e) => handleFieldChange('preferredStartDate', e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="Immediate Enrolment">Immediate Enrolment</option>
                      <option value="Next Month">Next Month</option>
                      <option value="January 2027 (Term 1)">January 2027 (Term 1)</option>
                      <option value="April 2027 (Term 2)">April 2027 (Term 2)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Parent / Guardian Details */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  2. Parent / Legal Guardian Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Parent / Guardian Full Name</Label>
                    <Input
                      value={passport.parentFullName}
                      onChange={(e) => handleFieldChange('parentFullName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Relationship to Child</Label>
                    <select
                      value={passport.parentRelationship}
                      onChange={(e) => handleFieldChange('parentRelationship', e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Grandparent">Grandparent</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Mobile / WhatsApp Number (SA)</Label>
                    <Input
                      type="tel"
                      value={passport.parentPhone}
                      onChange={(e) => handleFieldChange('parentPhone', e.target.value)}
                      className="font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Email Address</Label>
                    <Input
                      type="email"
                      value={passport.parentEmail}
                      onChange={(e) => handleFieldChange('parentEmail', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">SA ID or Passport Number</Label>
                    <Input
                      value={passport.parentIdOrPassport}
                      onChange={(e) => handleFieldChange('parentIdOrPassport', e.target.value)}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Residential Street Address</Label>
                    <Input
                      value={passport.residentialAddress}
                      onChange={(e) => handleFieldChange('residentialAddress', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Universal School-Specific Preferences (Used by AI to answer custom school questions) */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5" />
                    3. Care, Language &amp; Custom Form Preferences
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    AI uses these preferences to automatically answer any custom questions a preschool adds to their online form.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Child&apos;s Primary Home Language</Label>
                    <select
                      value={passport.homeLanguage}
                      onChange={(e) => handleFieldChange('homeLanguage', e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background text-foreground"
                    >
                      {['English', 'isiZulu', 'isiXhosa', 'Afrikaans', 'Sesotho', 'Setswana', 'Sepedi', 'Other'].map(
                        (lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Attendance &amp; Aftercare Option</Label>
                    <select
                      value={passport.attendancePreference}
                      onChange={(e) => handleFieldChange('attendancePreference', e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="Full Day (07:00 – 17:30)">Full Day (07:00 – 17:30)</option>
                      <option value="Half Day (07:00 – 13:00)">Half Day (07:00 – 13:00)</option>
                      <option value="Full Day + Holiday Care">Full Day + Holiday Care</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Potty / Toilet Training Status</Label>
                    <select
                      value={passport.pottyTrainingStatus}
                      onChange={(e) => handleFieldChange('pottyTrainingStatus', e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="Fully Toilet Trained">Fully Toilet Trained</option>
                      <option value="In Training (Pull-ups)">In Training (Pull-ups)</option>
                      <option value="Nappies / Diapers">Nappies / Diapers</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Dietary / Cultural Meal Preference</Label>
                    <select
                      value={passport.dietaryPreference}
                      onChange={(e) => handleFieldChange('dietaryPreference', e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="Standard School Menu">Standard School Menu</option>
                      <option value="Halaal">Halaal</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Food Allergy – Packed from Home">Food Allergy – Packed from Home</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Medical &amp; Allergy Notes</Label>
                    <Input
                      value={passport.medicalAllergies}
                      onChange={(e) => handleFieldChange('medicalAllergies', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Previous Preschool / Crèche Attended</Label>
                    <Input
                      value={passport.previousPreschool}
                      onChange={(e) => handleFieldChange('previousPreschool', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Emergency Contact Name</Label>
                    <Input
                      value={passport.emergencyContactName}
                      onChange={(e) => handleFieldChange('emergencyContactName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Emergency Contact Phone</Label>
                    <Input
                      type="tel"
                      value={passport.emergencyContactPhone}
                      onChange={(e) => handleFieldChange('emergencyContactPhone', e.target.value)}
                      className="font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold">
                      Family Bio / Additional Notes for AI Application Agent
                    </Label>
                    <textarea
                      rows={2}
                      value={passport.familyBioForAi}
                      onChange={(e) => handleFieldChange('familyBioForAi', e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground font-mono">
                  Last synced: {new Date(passport.updatedAt).toLocaleDateString()}
                </span>
                <Button type="submit" className="font-semibold">
                  <Save className="w-4 h-4 mr-2" />
                  Save My Parent Enrolment Profile
                </Button>
              </div>
            </form>
          </div>

          {/* Right 4 Columns: How AI Auto-Copy Works + Submitted Applications Tracker */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Zero-Click AI Application Flow
                </span>
                <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                  Active
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-muted-foreground">
                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                  <div className="font-bold text-foreground">1. Your Profile is Stored Here</div>
                  <p>
                    Update {passport.childFullName}&apos;s details once on this page.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                  <div className="font-bold text-foreground">2. Click &ldquo;Apply&rdquo; on Any Preschool</div>
                  <p>
                    When you open any preschool&apos;s application modal (or apply to multiple schools at once), the form is <strong>already pre-filled</strong> from your Parent Profile.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                  <div className="font-bold text-foreground">3. AI Adapts to Custom School Forms</div>
                  <p>
                    If a preschool principal adds custom questions to their form, AI reads your Parent Profile and selects the right answers automatically.
                  </p>
                </div>
              </div>

              <Button asChild className="w-full font-semibold text-xs">
                <Link href="/directory">
                  Go to Directory &amp; Apply in 1 Click
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>

            {/* Parent's Submitted Applications History */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  My Submitted Applications ({applications.length})
                </h3>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {applications.map((app) => {
                  const waUrl = `https://wa.me/${formatSaWhatsAppNumber(app.schoolPhone)}?text=${encodeURIComponent(
                    `Hi ${app.schoolName}, I am following up on the online application submitted via NurseryNet for ${app.childFullName} (${app.childAgeGroup}).`
                  )}`;
                  return (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-xl border border-border bg-background space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <School className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{app.schoolName}</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            Learner: {app.childFullName} · {app.submittedAt}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-bold capitalize flex items-center gap-1 shrink-0 ${
                            app.status === 'accepted'
                              ? 'text-emerald-600'
                              : app.status === 'waitlisted'
                              ? 'text-amber-600'
                              : 'text-primary'
                          }`}
                        >
                          {app.status === 'accepted' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {app. preferredStartDate}
                        </span>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          WhatsApp School
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
