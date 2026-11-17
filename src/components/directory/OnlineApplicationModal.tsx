"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import type { Preschool } from '@/data/preschools';
import {
  ApplicationFormConfig,
  calculateAgeGroupFromDob,
  DEFAULT_APPLICATION_FORM_CONFIG,
  getApplicationFormConfig,
  getSavedParentPassport,
  ParentEnrolmentPassport,
  PreschoolApplication,
  saveParentPassport,
  submitBatchApplications,
} from '@/lib/application-types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  FileText,
  CheckCircle2,
  School,
  Plus,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  Wand2,
  Upload,
  Mic,
  MicOff,
  Loader2,
  BookmarkCheck,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnlineApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSchools: Preschool[];
  availablePool?: Preschool[];
}

const SAMPLE_AGENTIC_PROMPTS = [
  {
    label: 'Sample 1: Mokoena Family (Randburg)',
    text: 'Hi, I am Lerato Mokoena (Mother, SA ID 9308140192081, cell 082 555 1920, lerato.mokoena@gmail.com) living at 18 Republic Road, Randburg. I am applying for my daughter Lethabo Mokoena born 2023-05-14 for January 2027. She speaks isiZulu and English, needs Full Day care (07:00 - 17:30), no transport needed, no allergies, first time in crèche. Emergency contact is her father Sipho Mokoena on 083 441 9002.',
  },
  {
    label: 'Sample 2: Van der Merwe Family + Batch Match',
    text: 'Applying for Liam van der Merwe (born 2022-02-10, 4 years old) for Immediate Enrolment. Father is David van der Merwe, ID 8911025091084, phone 083 441 9022, email david.vdm@outlook.com, living at 44 Oak Ave, Cape Town. Home language Afrikaans, Half Day care, mild peanut allergy (carries EpiPen), attended Little Stars Crèche previously. Emergency contact Sarah van der Merwe 072 819 3310. Also add 2 verified preschools to my batch application.',
  },
];

function formatSaWhatsAppNumber(rawPhone?: string): string {
  const digits = (rawPhone || '0825551829').replace(/\D/g, '');
  if (digits.startsWith('27') && digits.length >= 11) return digits;
  if (digits.startsWith('0') && digits.length >= 10) return `27${digits.slice(1)}`;
  return `27${digits}`;
}

export default function OnlineApplicationModal({
  isOpen,
  onClose,
  initialSchools,
  availablePool = [],
}: OnlineApplicationModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic school-configured form schema
  const [formConfig, setFormConfig] = useState<ApplicationFormConfig>(DEFAULT_APPLICATION_FORM_CONFIG);
  const [selectedSchools, setSelectedSchools] = useState<Preschool[]>([]);
  const [showAddSchoolsPicker, setShowAddSchoolsPicker] = useState(false);
  const [schoolSearchFilter, setSchoolSearchFilter] = useState('');

  // Agentic Autofill Co-Pilot States
  const [agentPrompt, setAgentPrompt] = useState('');
  const [uploadedDocName, setUploadedDocName] = useState('');
  const [uploadedDocBase64, setUploadedDocBase64] = useState('');
  const [uploadedDocMime, setUploadedDocMime] = useState('image/jpeg');
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentStepText, setAgentStepText] = useState('');
  const [agentSummary, setAgentSummary] = useState('');
  const [agentReasoningSteps, setAgentReasoningSteps] = useState<string[]>([]);
  const [agentError, setAgentError] = useState('');
  const [autofilledFieldsCount, setAutofilledFieldsCount] = useState(0);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [autoSubmitAfterAgent, setAutoSubmitAfterAgent] = useState(false);
  const [savedPassport, setSavedPassport] = useState<ParentEnrolmentPassport | null>(null);

  // Form Field States
  const [childFullName, setChildFullName] = useState('');
  const [childDateOfBirth, setChildDateOfBirth] = useState('2023-06-15');
  const [childAgeGroup, setChildAgeGroup] = useState('Toddler (1–3 years)');
  const [preferredStartDate, setPreferredStartDate] = useState('January 2027 (Term 1)');

  const [parentFullName, setParentFullName] = useState('');
  const [parentRelationship, setParentRelationship] = useState('Mother');
  const [parentIdOrPassport, setParentIdOrPassport] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');

  const [medicalAllergies, setMedicalAllergies] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [documentsAcknowledged, setDocumentsAcknowledged] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApps, setSubmittedApps] = useState<PreschoolApplication[] | null>(null);

  // Sync initial schools, saved family passport, and school's editable form configuration when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const cfg = getApplicationFormConfig();
    setFormConfig(cfg);

    const passport = getSavedParentPassport();
    setSavedPassport(passport);

    // Initialize default custom answers
    const initialAnswers: Record<string, string> = {};
    cfg.customFields.forEach((field) => {
      if (field.type === 'select' && field.options && field.options.length > 0) {
        initialAnswers[field.label] = field.options[0];
      } else if (field.type === 'checkbox') {
        initialAnswers[field.label] = 'No';
      } else {
        initialAnswers[field.label] = '';
      }
    });
    setCustomAnswers(initialAnswers);
    setDocumentsAcknowledged(cfg.requiredDocumentsChecklist);

    // Deduplicate initial schools
    const unique: Preschool[] = [];
    const seen = new Set<string>();
    initialSchools.forEach((s) => {
      if (s && !seen.has(s.id)) {
        seen.add(s.id);
        unique.push(s);
      }
    });
    setSelectedSchools(unique);
  }, [isOpen, initialSchools]);

  const selectedIds = useMemo(() => new Set(selectedSchools.map((s) => s.id)), [selectedSchools]);

  const candidateSchoolsToAdd = useMemo(() => {
    const q = schoolSearchFilter.trim().toLowerCase();
    return availablePool
      .filter((s) => !selectedIds.has(s.id))
      .filter((s) => {
        if (!q) return true;
        return `${s.name} ${s.city} ${s.suburb} ${s.province}`.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [availablePool, selectedIds, schoolSearchFilter]);

  const handleToggleSchoolSelection = (school: Preschool) => {
    setSelectedSchools((prev) => {
      const exists = prev.some((s) => s.id === school.id);
      if (exists) {
        if (prev.length <= 1) {
          toast({
            title: 'At least 1 preschool required',
            description: 'Keep at least one preschool selected to submit your application.',
            variant: 'destructive',
          });
          return prev;
        }
        return prev.filter((s) => s.id !== school.id);
      }
      return [...prev, school];
    });
  };

  const handleToggleDocumentAck = (docLabel: string) => {
    setDocumentsAcknowledged((prev) =>
      prev.includes(docLabel) ? prev.filter((d) => d !== docLabel) : [...prev, docLabel]
    );
  };

  // Handle document photo upload (Birth Certificate, Clinic Card, SA ID)
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedDocName(file.name);
    setUploadedDocMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setUploadedDocBase64(result);
      toast({
        title: 'Admission Document Attached',
        description: `Ready to extract learner & parent fields from "${file.name}". Click Run Agentic Autofill.`,
      });
    };
    reader.readAsDataURL(file);
  };

  // Voice Dictation via Web Speech API
  const handleToggleVoiceDictation = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: 'Voice Dictation Not Supported in Browser',
        description: 'You can type or click one of the 1-click sample family profiles above.',
        variant: 'destructive',
      });
      return;
    }

    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-ZA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListeningVoice(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setAgentPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
      setIsListeningVoice(false);
    };
    recognition.onerror = () => {
      setIsListeningVoice(false);
    };
    recognition.onend = () => {
      setIsListeningVoice(false);
    };
    recognition.start();
  };

  // 1-Click Recall from Saved Family Passport
  const handleRecallSavedPassport = (passport: ParentEnrolmentPassport) => {
    setChildFullName(passport.childFullName || '');
    const dob = passport.childDateOfBirth || '2023-05-14';
    setChildDateOfBirth(dob);
    setChildAgeGroup(passport.childAgeGroup || calculateAgeGroupFromDob(dob));
    setPreferredStartDate(passport.preferredStartDate || 'January 2027 (Term 1)');
    setParentFullName(passport.parentFullName || '');
    setParentRelationship(passport.parentRelationship || 'Mother');
    setParentIdOrPassport(passport.parentIdOrPassport || '');
    setParentPhone(passport.parentPhone || '');
    setParentEmail(passport.parentEmail || '');
    setResidentialAddress(passport.residentialAddress || '');
    setMedicalAllergies(passport.medicalAllergies || 'None reported');
    setEmergencyContactName(passport.emergencyContactName || '');
    setEmergencyContactPhone(passport.emergencyContactPhone || '');

    const mergedCustom: Record<string, string> = { ...customAnswers };
    formConfig.customFields.forEach((field) => {
      if (passport.customAnswers?.[field.label]) {
        mergedCustom[field.label] = passport.customAnswers[field.label];
      }
    });
    setCustomAnswers(mergedCustom);
    setDocumentsAcknowledged(formConfig.requiredDocumentsChecklist);

    const count = 11 + Object.keys(mergedCustom).length;
    setAutofilledFieldsCount(count);
    setAgentSummary(
      `Instant recall complete: populated ${count} fields from your saved NurseryNet Enrolment Passport.`
    );
    setAgentReasoningSteps([
      `Loaded learner profile for ${passport.childFullName || 'your child'} (${passport.childAgeGroup})`,
      `Filled guardian contact details for ${passport.parentFullName}`,
      `Matched ${Object.keys(mergedCustom).length} school-specific custom questions`,
    ]);

    toast({
      title: 'Autofilled from Family Passport',
      description: `Populated ${count} admission fields in one click.`,
    });
  };

  // Run Server-Side Gemini Agentic Autofill
  const handleRunAgenticAutofill = async (overridePrompt?: string) => {
    const promptToUse = (overridePrompt !== undefined ? overridePrompt : agentPrompt).trim();
    if (!promptToUse && !uploadedDocBase64) {
      toast({
        title: 'Add a short note or document first',
        description:
          'Describe your child and contact details in one sentence, upload a document, or pick a sample prompt.',
        variant: 'destructive',
      });
      return;
    }

    setIsAgentRunning(true);
    setAgentError('');
    setAgentStepText('1/3 Extracting learner, DOB & guardian identity...');

    const stepTimer1 = setTimeout(() => {
      setAgentStepText('2/3 Calculating age placement & mapping custom school questions...');
    }, 900);

    const stepTimer2 = setTimeout(() => {
      setAgentStepText('3/3 Verifying required admission checklist & school matches...');
    }, 1800);

    try {
      const response = await fetch('/api/agentic-autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: promptToUse,
          documentImageBase64: uploadedDocBase64 || undefined,
          documentMimeType: uploadedDocMime,
          customFields: formConfig.customFields,
          candidateSchools: availablePool.slice(0, 16).map((s) => ({
            id: s.id,
            name: s.name,
            city: s.city,
            suburb: s.suburb,
            province: String(s.province || ''),
            monthlyFeeZAR: s.monthlyFeeZAR,
            isVerified: s.isVerified,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.autofill) {
        throw new Error(data?.error || 'Agentic autofill could not complete.');
      }

      const af = data.autofill;
      const resolvedChildName = af.childFullName || childFullName;
      const resolvedDob = af.childDateOfBirth || childDateOfBirth || '2023-05-14';
      const resolvedAgeGroup = af.childAgeGroup || calculateAgeGroupFromDob(resolvedDob);
      const resolvedStart = af.preferredStartDate || preferredStartDate || 'January 2027 (Term 1)';
      const resolvedParentName = af.parentFullName || parentFullName;
      const resolvedRel = af.parentRelationship || parentRelationship || 'Mother';
      const resolvedId = af.parentIdOrPassport || parentIdOrPassport;
      const resolvedPhone = af.parentPhone || parentPhone;
      const resolvedEmail = af.parentEmail || parentEmail;
      const resolvedAddress = af.residentialAddress || residentialAddress;
      const resolvedMedical = af.medicalAllergies || medicalAllergies || 'None reported';
      const resolvedEmergencyName = af.emergencyContactName || emergencyContactName;
      const resolvedEmergencyPhone = af.emergencyContactPhone || emergencyContactPhone;

      setChildFullName(resolvedChildName);
      setChildDateOfBirth(resolvedDob);
      setChildAgeGroup(resolvedAgeGroup);
      setPreferredStartDate(resolvedStart);
      setParentFullName(resolvedParentName);
      setParentRelationship(resolvedRel);
      setParentIdOrPassport(resolvedId);
      setParentPhone(resolvedPhone);
      setParentEmail(resolvedEmail);
      setResidentialAddress(resolvedAddress);
      setMedicalAllergies(resolvedMedical);
      setEmergencyContactName(resolvedEmergencyName);
      setEmergencyContactPhone(resolvedEmergencyPhone);

      const nextCustomAnswers: Record<string, string> = { ...customAnswers };
      if (Array.isArray(af.customFieldAnswers)) {
        af.customFieldAnswers.forEach((item: { questionLabel: string; answer: string }) => {
          if (item?.questionLabel && item?.answer !== undefined) {
            nextCustomAnswers[item.questionLabel] = item.answer;
          }
        });
      }
      setCustomAnswers(nextCustomAnswers);
      setDocumentsAcknowledged(formConfig.requiredDocumentsChecklist);

      // If agent also recommended matching schools for batch application, add them
      let nextSelectedSchools = [...selectedSchools];
      if (Array.isArray(af.recommendedSchoolIds) && af.recommendedSchoolIds.length > 0) {
        const existingSet = new Set(nextSelectedSchools.map((s) => s.id));
        af.recommendedSchoolIds.forEach((recId: string) => {
          const match = availablePool.find((p) => p.id === recId);
          if (match && !existingSet.has(match.id)) {
            existingSet.add(match.id);
            nextSelectedSchools.push(match);
          }
        });
        setSelectedSchools(nextSelectedSchools);
      }

      // Save to Universal Parent Enrolment Passport
      const newPassport: Omit<ParentEnrolmentPassport, 'updatedAt'> = {
        childFullName: resolvedChildName,
        childDateOfBirth: resolvedDob,
        childAgeGroup: resolvedAgeGroup,
        preferredStartDate: resolvedStart,
        parentFullName: resolvedParentName,
        parentRelationship: resolvedRel,
        parentIdOrPassport: resolvedId,
        parentPhone: resolvedPhone,
        parentEmail: resolvedEmail,
        residentialAddress: resolvedAddress,
        medicalAllergies: resolvedMedical,
        emergencyContactName: resolvedEmergencyName,
        emergencyContactPhone: resolvedEmergencyPhone,
        customAnswers: nextCustomAnswers,
      };
      saveParentPassport(newPassport);
      setSavedPassport({ ...newPassport, updatedAt: new Date().toISOString() });

      const filledCount = 11 + Object.keys(nextCustomAnswers).length;
      setAutofilledFieldsCount(filledCount);
      setAgentSummary(
        af.agentSummary ||
          `Autofilled ${filledCount} fields across standard and school-specific questions.`
      );
      setAgentReasoningSteps(
        Array.isArray(af.agentReasoningSteps) && af.agentReasoningSteps.length > 0
          ? af.agentReasoningSteps
          : [
              `Extracted child profile for ${resolvedChildName} (${resolvedAgeGroup})`,
              `Populated parent details & SA contact info for ${resolvedParentName}`,
              `Mapped answers to ${Object.keys(nextCustomAnswers).length} custom school questions`,
            ]
      );

      toast({
        title: 'Agentic Autofill Complete',
        description: `Populated ${filledCount} application fields automatically.`,
      });

      // If parent toggled "Auto-Submit After Autofill" and required fields are present, submit immediately
      if (
        autoSubmitAfterAgent &&
        resolvedChildName.trim() &&
        resolvedParentName.trim() &&
        resolvedPhone.trim() &&
        resolvedEmail.trim() &&
        nextSelectedSchools.length > 0
      ) {
        const created = submitBatchApplications(nextSelectedSchools, {
          childFullName: resolvedChildName.trim(),
          childDateOfBirth: resolvedDob,
          childAgeGroup: resolvedAgeGroup,
          preferredStartDate: resolvedStart,
          parentFullName: resolvedParentName.trim(),
          parentRelationship: resolvedRel,
          parentIdOrPassport: resolvedId.trim() || undefined,
          parentPhone: resolvedPhone.trim(),
          parentEmail: resolvedEmail.trim(),
          residentialAddress: resolvedAddress.trim() || 'Provided on enrolment',
          medicalAllergies: resolvedMedical.trim() || 'None reported',
          emergencyContactName: resolvedEmergencyName.trim() || undefined,
          emergencyContactPhone: resolvedEmergencyPhone.trim() || undefined,
          customAnswers: nextCustomAnswers,
          documentsAcknowledged: formConfig.requiredDocumentsChecklist,
        });
        setSubmittedApps(created);
      }
    } catch (err: any) {
      setAgentError(err?.message || 'Could not run agentic autofill.');
      toast({
        title: 'Agentic Autofill Notice',
        description: err?.message || 'Please check your input or API key.',
        variant: 'destructive',
      });
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAgentRunning(false);
      setAgentStepText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSchools.length === 0) {
      toast({
        title: 'No Preschool Selected',
        description: 'Please select at least one preschool to apply to.',
        variant: 'destructive',
      });
      return;
    }

    if (!childFullName.trim() || !parentFullName.trim() || !parentPhone.trim() || !parentEmail.trim()) {
      toast({
        title: 'Required Details Missing',
        description: 'Please complete the learner name and parent contact information.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const created = submitBatchApplications(selectedSchools, {
        childFullName: childFullName.trim(),
        childDateOfBirth,
        childAgeGroup,
        preferredStartDate,
        parentFullName: parentFullName.trim(),
        parentRelationship,
        parentIdOrPassport: parentIdOrPassport.trim() || undefined,
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim(),
        residentialAddress: residentialAddress.trim() || 'Provided on enrolment',
        medicalAllergies: medicalAllergies.trim() || 'None reported',
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        customAnswers,
        documentsAcknowledged,
      });

      setIsSubmitting(false);
      setSubmittedApps(created);

      toast({
        title:
          created.length === 1
            ? 'Online Application Submitted!'
            : `${created.length} Preschool Applications Submitted at Once!`,
        description: `Sent directly to ${created.map((c) => c.schoolName).join(', ')}.`,
      });
    }, 350);
  };

  const handleResetAndClose = () => {
    setSubmittedApps(null);
    setShowAddSchoolsPicker(false);
    setSchoolSearchFilter('');
    setAgentError('');
    onClose();
  };

  const fieldHighlightClass =
    autofilledFieldsCount > 0
      ? 'border-emerald-500/50 bg-emerald-500/[0.03]'
      : 'border-border bg-background';

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleResetAndClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-6 rounded-2xl bg-card border-border">
        {submittedApps && submittedApps.length > 0 ? (
          <div className="py-4 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <DialogTitle className="font-heading text-2xl font-bold text-foreground">
                {submittedApps.length === 1
                  ? 'Application Received!'
                  : `Applied to ${submittedApps.length} Preschools at Once!`}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
                Your online application for <strong className="text-foreground">{childFullName}</strong> ({childAgeGroup}) has been delivered directly to each school&apos;s Owner Dashboard and saved to your Family Passport.
              </DialogDescription>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border text-left space-y-2.5 max-h-60 overflow-y-auto">
              <div className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Recipient Preschools ({submittedApps.length})</span>
                <span className="font-mono text-primary">Start: {preferredStartDate}</span>
              </div>

              <div className="divide-y divide-border/60">
                {submittedApps.map((app) => {
                  const waUrl = `https://wa.me/${formatSaWhatsAppNumber(app.schoolPhone)}?text=${encodeURIComponent(
                    `Hi ${app.schoolName}, I just submitted an Online Enrolment Application via NurseryNet (Ref: ${app.id}).\n\nChild: ${app.childFullName} (${app.childAgeGroup})\nStart Term: ${app.preferredStartDate}\nParent: ${app.parentFullName} (${app.parentPhone})`
                  )}`;
                  return (
                    <div
                      key={app.id}
                      className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-foreground block">{app.schoolName}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {app.schoolCity} · Ref #{app.id.slice(-6)} · Status: Received in Dashboard
                        </span>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 rounded-lg text-xs font-semibold border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 whitespace-nowrap shrink-0"
                      >
                        <a href={waUrl} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                          WhatsApp School
                        </a>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <Button
                onClick={handleResetAndClose}
                className="flex-1 h-11 rounded-xl font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Back to Directory
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader className="text-left pb-3 border-b border-border">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4" />
                  <span>Agentic Enrolment · Autofill &amp; Multi-School Apply</span>
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Synced with School Form Builder
                </span>
              </div>
              <DialogTitle className="font-heading text-xl font-bold text-foreground mt-1">
                {formConfig.formTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                {formConfig.welcomeNote}
              </DialogDescription>
            </DialogHeader>

            {/* AGENTIC AUTOFILL CO-PILOT PANEL */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                      Agentic Enrolment Autofill
                    </h4>
                    {autofilledFieldsCount > 0 && (
                      <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        · {autofilledFieldsCount} Fields Populated
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Paste a note, speak your details, or upload a Birth Certificate / Clinic Card—the agent maps every standard &amp; custom school question automatically.
                  </p>
                </div>

                {savedPassport && savedPassport.childFullName && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleRecallSavedPassport(savedPassport)}
                    className="h-8 px-3 text-xs font-bold border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 whitespace-nowrap shrink-0"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 mr-1.5" />
                    1-Click Recall: {savedPassport.childFullName}
                  </Button>
                )}
              </div>

              {/* 1-Click Sample Family Prompts for Instant Testing */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Try 1-Click Agentic Demo:
                </span>
                {SAMPLE_AGENTIC_PROMPTS.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      setAgentPrompt(sample.text);
                      handleRunAgenticAutofill(sample.text);
                    }}
                    disabled={isAgentRunning}
                    className="px-2.5 py-1 rounded-md border border-primary/30 bg-background hover:bg-primary/10 text-[11px] font-semibold text-primary transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <Zap className="w-3 h-3" />
                    {sample.label}
                  </button>
                ))}
              </div>

              {/* Natural-Language / Voice / Document Input Box */}
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  placeholder="Describe your child & contact info in plain words (e.g. 'I'm Lerato Mokoena 082 555 1920, applying for my daughter Lethabo born 14 May 2023 for Jan 2027, isiZulu home language, Full Day care, no allergies...')"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 px-2.5 text-xs whitespace-nowrap"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5 text-primary" />
                      {uploadedDocName ? `Attached: ${uploadedDocName.slice(0, 18)}` : 'Scan Birth Cert / ID'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleToggleVoiceDictation}
                      className={`h-8 px-2.5 text-xs whitespace-nowrap ${
                        isListeningVoice ? 'border-rose-500 text-rose-600 bg-rose-500/10' : ''
                      }`}
                    >
                      {isListeningVoice ? (
                        <>
                          <MicOff className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                          Listening...
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 mr-1.5 text-primary" />
                          Voice Dictate
                        </>
                      )}
                    </Button>

                    <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer pl-1">
                      <input
                        type="checkbox"
                        checked={autoSubmitAfterAgent}
                        onChange={(e) => setAutoSubmitAfterAgent(e.target.checked)}
                        className="rounded border-border text-primary"
                      />
                      <span>Auto-submit when complete</span>
                    </label>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    disabled={isAgentRunning}
                    onClick={() => handleRunAgenticAutofill()}
                    className="h-8 px-4 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap shrink-0"
                  >
                    {isAgentRunning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Agent Autofilling...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                        Run Agentic Autofill
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Live Agent Execution Status / Reasoning Trace */}
              {isAgentRunning && agentStepText && (
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/25 text-xs font-medium text-primary flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span className="font-mono">{agentStepText}</span>
                </div>
              )}

              {agentError && (
                <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{agentError}</span>
                </div>
              )}

              {!isAgentRunning && agentSummary && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 text-xs">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{agentSummary}</span>
                  </div>
                  {agentReasoningSteps.length > 0 && (
                    <ul className="pl-5 list-disc text-[11px] text-muted-foreground space-y-0.5">
                      {agentReasoningSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Target Preschools Selector (Single or Multi-School Batch Apply) */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <School className="w-4 h-4 text-primary" />
                    <span>
                      Applying to {selectedSchools.length}{' '}
                      {selectedSchools.length === 1 ? 'Preschool' : 'Preschools at Once'}
                    </span>
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Every selected school below receives your autofilled application on their Owner Dashboard.
                  </p>
                </div>
                {availablePool.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddSchoolsPicker((prev) => !prev)}
                    className="h-8 px-3 rounded-lg text-xs font-bold border-primary/40 text-primary hover:bg-primary/10 whitespace-nowrap shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {showAddSchoolsPicker ? 'Done Adding Schools' : 'Add More Schools to Apply at Once'}
                  </Button>
                )}
              </div>

              {/* Selected School Chips */}
              <div className="flex flex-wrap gap-1.5">
                {selectedSchools.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-border text-xs font-semibold text-foreground"
                  >
                    <span className="truncate max-w-[200px]">{s.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      (R{s.monthlyFeeZAR}/mo)
                    </span>
                    {selectedSchools.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleToggleSchoolSelection(s)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${s.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Expandable Picker to Add More Preschools to the Batch Application */}
              {showAddSchoolsPicker && (
                <div className="pt-2 border-t border-border/60 space-y-2">
                  <input
                    type="text"
                    placeholder="Filter other preschools to include in this application..."
                    value={schoolSearchFilter}
                    onChange={(e) => setSchoolSearchFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                    {candidateSchoolsToAdd.map((cand) => (
                      <button
                        key={cand.id}
                        type="button"
                        onClick={() => handleToggleSchoolSelection(cand)}
                        className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 text-left flex items-center justify-between gap-2 text-xs transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground block truncate">
                            {cand.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate block">
                            {cand.city} · R{cand.monthlyFeeZAR}/mo
                          </span>
                        </div>
                        <span className="text-primary font-bold text-[11px] whitespace-nowrap shrink-0">
                          + Add
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 1: Learner Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>1. Child / Learner Details</span>
                </h4>
                {autofilledFieldsCount > 0 && (
                  <span className="text-[10px] font-mono font-semibold text-emerald-600">
                    Agent Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Child&apos;s Full Name &amp; Surname *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lethabo Mokoena"
                    value={childFullName}
                    onChange={(e) => setChildFullName(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Child&apos;s Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={childDateOfBirth}
                    onChange={(e) => {
                      const nextDob = e.target.value;
                      setChildDateOfBirth(nextDob);
                      setChildAgeGroup(calculateAgeGroupFromDob(nextDob));
                    }}
                    className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Age Group / Class Placement *
                  </label>
                  <select
                    value={childAgeGroup}
                    onChange={(e) => setChildAgeGroup(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                  >
                    <option value="Infant / Baby Care (3–12 months)">Infant / Baby Care (3–12 months)</option>
                    <option value="Toddler (1–3 years)">Toddler (1–3 years)</option>
                    <option value="Preschool (3–4 years)">Preschool (3–4 years)</option>
                    <option value="Grade R / Pre-Primary (5–6 years)">Grade R / Pre-Primary (5–6 years)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Preferred Start Term / Month *
                  </label>
                  <select
                    value={preferredStartDate}
                    onChange={(e) => setPreferredStartDate(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                  >
                    <option value="Immediate Enrolment">Immediate Enrolment</option>
                    <option value="Next Month">Next Month</option>
                    <option value="January 2027 (Term 1)">January 2027 (Term 1)</option>
                    <option value="April 2027 (Term 2)">April 2027 (Term 2)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Parent / Guardian Information */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>2. Parent / Legal Guardian Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Parent / Guardian Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nomsa Mokoena"
                    value={parentFullName}
                    onChange={(e) => setParentFullName(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Relationship to Child *
                  </label>
                  <select
                    value={parentRelationship}
                    onChange={(e) => setParentRelationship(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Grandparent">Grandparent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Mobile / WhatsApp Number (SA) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 082 555 1234"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="parent@example.co.za"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                  />
                </div>

                {formConfig.requireIdNumbers && (
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Parent SA ID or Passport Number
                    </label>
                    <input
                      type="text"
                      placeholder="13-digit SA ID or Passport"
                      value={parentIdOrPassport}
                      onChange={(e) => setParentIdOrPassport(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                    />
                  </div>
                )}

                <div className={formConfig.requireIdNumbers ? '' : 'sm:col-span-2'}>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Residential Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="Street address, suburb & town"
                    value={residentialAddress}
                    onChange={(e) => setResidentialAddress(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Medical, Emergency & School-Editable Custom Questions */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-primary" />
                <span>3. School-Specific Questions &amp; Care Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formConfig.requireMedicalInfo && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Allergies, Dietary Requirements or Medical Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Peanut allergy, Halal meals, Asthma inhaler, or None"
                      value={medicalAllergies}
                      onChange={(e) => setMedicalAllergies(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                    />
                  </div>
                )}

                {formConfig.requireEmergencyContact && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Alternative Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sipho Mokoena (Father / Aunt)"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 083 444 9876"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                      />
                    </div>
                  </>
                )}

                {/* Dynamic Custom Fields Configured by Preschool in Owner Dashboard */}
                {formConfig.customFields.map((field) => (
                  <div
                    key={field.id}
                    className={field.type === 'textarea' || field.type === 'checkbox' ? 'sm:col-span-2' : ''}
                  >
                    {field.type === 'checkbox' ? (
                      <label
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer ${fieldHighlightClass}`}
                      >
                        <span className="text-xs font-semibold text-foreground">{field.label}</span>
                        <input
                          type="checkbox"
                          checked={customAnswers[field.label] === 'Yes'}
                          onChange={(e) =>
                            setCustomAnswers((prev) => ({
                              ...prev,
                              [field.label]: e.target.checked ? 'Yes' : 'No',
                            }))
                          }
                          className="w-4 h-4 accent-primary rounded cursor-pointer"
                        />
                      </label>
                    ) : (
                      <>
                        <label className="text-xs font-semibold text-foreground block mb-1">
                          {field.label} {field.required && '*'}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={customAnswers[field.label] || (field.options?.[0] ?? '')}
                            onChange={(e) =>
                              setCustomAnswers((prev) => ({
                                ...prev,
                                [field.label]: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                          >
                            {(field.options || ['Yes', 'No']).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            rows={2}
                            required={field.required}
                            placeholder={field.placeholder || 'Enter details...'}
                            value={customAnswers[field.label] || ''}
                            onChange={(e) =>
                              setCustomAnswers((prev) => ({
                                ...prev,
                                [field.label]: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none ${fieldHighlightClass}`}
                          />
                        ) : (
                          <input
                            type="text"
                            required={field.required}
                            placeholder={field.placeholder || ''}
                            value={customAnswers[field.label] || ''}
                            onChange={(e) =>
                              setCustomAnswers((prev) => ({
                                ...prev,
                                [field.label]: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2 text-xs rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${fieldHighlightClass}`}
                          />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Supporting Documents Checklist */}
            {formConfig.requiredDocumentsChecklist.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>4. Supporting Enrolment Documents Checklist</span>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Tick the documents you have ready to bring or email upon acceptance:
                </p>
                <div className="space-y-1.5">
                  {formConfig.requiredDocumentsChecklist.map((docItem, idx) => {
                    const checked = documentsAcknowledged.includes(docItem);
                    return (
                      <label
                        key={idx}
                        className="flex items-center gap-2.5 p-2 rounded-lg border border-border bg-background text-xs cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleDocumentAck(docItem)}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                        />
                        <span className="text-foreground/90">{docItem}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit Footer */}
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-muted-foreground">
                Instant delivery to{' '}
                <strong className="text-foreground">
                  {selectedSchools.length} {selectedSchools.length === 1 ? 'preschool' : 'preschools'}
                </strong>
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResetAndClose}
                  className="text-xs h-10 px-4 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs font-bold h-10 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md whitespace-nowrap"
                >
                  {isSubmitting
                    ? 'Submitting Application...'
                    : selectedSchools.length === 1
                    ? `Submit Application to ${selectedSchools[0].name}`
                    : `Submit to All ${selectedSchools.length} Preschools at Once`}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
