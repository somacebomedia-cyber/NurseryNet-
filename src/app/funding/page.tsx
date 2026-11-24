// src/app/funding/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  buildLiveCacheKey,
  getCachedLiveSearch,
  LiveSearchResponse,
  setCachedLiveSearch,
} from '@/lib/live-search-types';
import {
  consumePendingVoiceAction,
  VOICE_ACTION_EVENT,
  VoiceAction,
} from '@/lib/voice-types';
import {
  CURRENT_DBE_DAILY_SUBSIDY_ZAR,
  LEGACY_DSD_DAILY_SUBSIDY_ZAR,
  MAX_SUBSIDY_DAYS_PER_YEAR,
  VERIFIED_SA_ECD_GRANTS,
  DBE_COMPLIANCE_CHECKLIST,
  OFFICIAL_DBE_COMPLIANCE_TEMPLATES,
  PROVINCIAL_DBE_ECD_DESKS,
  DEFAULT_COMPLIANCE_CHECKS,
  calculateEstimatedPipelineZAR,
  getLocalFundingWorkspaceFallback,
  saveLocalFundingWorkspaceFallback,
  subscribeToFundingWorkspace,
  saveFundingWorkspaceToFirestore,
  subscribeToUserGrantProposals,
  saveGrantProposalToFirestore,
  deleteGrantProposalFromFirestore,
  hasActivePaidSubscription,
  type EcdRegistrationStatus,
  type GrantPipelineStatus,
  type PipelineGrantEntry,
  type GrantProposalDraftRecord,
  type DbeComplianceTemplate,
  type VerifiedEcdGrant,
} from '@/lib/firestore-funding';
import LiveSearchSources from '@/components/directory/LiveSearchSources';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Building2,
  Coins,
  ArrowRight,
  FileCheck2,
  Globe,
  AlertCircle,
  X,
  Sparkles,
  BookmarkPlus,
  Check,
  Download,
  Copy,
  FileText,
  Lock,
  Unlock,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Calendar,
  Layers,
  TrendingUp,
  ClipboardCheck,
  FolderKanban,
  RefreshCw,
} from 'lucide-react';

type FundingTab = 'directory' | 'pipeline' | 'ai-drafter' | 'compliance' | 'provincial-desks';

const FUNDING_TOPICS = [
  'DBE R24/Day Equitable Share Subsidy',
  'ECD Infrastructure & Toilet Grants',
  'NLC Lotteries Charities Sector',
  'Corporate CSI & Tshikululu ECD Funds',
  'Vangasali Registration Stimulus',
];

const QUICK_PROJECT_FOCUSES = [
  'Flush child-sized toilets, perimeter security fencing & outdoor gross-motor jungle gym',
  'Daily fortified breakfast porridge, cooked lunch nutrition & kitchen hygiene equipment',
  'Montessori & NCF 0-4 emergent literacy, numeracy & multilingual wooden learning kits',
  'NQF Level 4 ECD practitioner training stipends & first-aid compliance certification',
];

const GRANT_CATEGORIES = [
  'All Categories',
  'DBE Government Subsidy',
  'Infrastructure & Safety',
  'NLC Lotteries & Equipment',
  'Corporate CSI & Foundations',
  'Practitioner Bursaries & Training',
] as const;

export default function FundingPage() {
  const { user } = useAuth();

  // Workspace navigation state
  const [activeTab, setActiveTab] = useState<FundingTab>('directory');

  // Principal School & Calculator State
  const [schoolName, setSchoolName] = useState<string>('Sunshine Early Learning Centre');
  const [province, setProvince] = useState<string>('Gauteng');
  const [npoNumber, setNpoNumber] = useState<string>('248-910 NPO');
  const [registrationStatus, setRegistrationStatus] = useState<EcdRegistrationStatus>('conditional');
  const [qualifyingChildren, setQualifyingChildren] = useState<number>(30);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(22);
  const [compareRateMode, setCompareRateMode] = useState<'dbe24' | 'dsd17'>('dbe24');

  // Pipeline & Compliance Vault State
  const [complianceChecks, setComplianceChecks] = useState<string[]>(DEFAULT_COMPLIANCE_CHECKS);
  const [pipelineGrants, setPipelineGrants] = useState<PipelineGrantEntry[]>([]);
  const [savedProposals, setSavedProposals] = useState<GrantProposalDraftRecord[]>([]);
  const [workspaceFeedback, setWorkspaceFeedback] = useState<string | null>(null);
  const [isSavingWorkspace, setIsSavingWorkspace] = useState<boolean>(false);

  // Subscription / Soft-Preview Gate State
  const [isPaidSubscriber, setIsPaidSubscriber] = useState<boolean>(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState<boolean>(false);

  // Directory Filter & Live Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [liveGrantQuery, setLiveGrantQuery] = useState('');
  const [liveGrants, setLiveGrants] = useState<LiveSearchResponse | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // AI Grant Proposal Drafter State
  const [selectedGrantId, setSelectedGrantId] = useState<string>(VERIFIED_SA_ECD_GRANTS[0].id);
  const [requestedAmountZAR, setRequestedAmountZAR] = useState<number>(125000);
  const [projectFocus, setProjectFocus] = useState<string>(QUICK_PROJECT_FOCUSES[0]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generatedProposal, setGeneratedProposal] = useState<{
    proposalId?: string;
    executiveSummary: string;
    fullProposalText: string;
    budgetBreakdown: string;
    complianceTips: string[];
    grantTitle: string;
    funderName: string;
  } | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);

  // Compliance Template Preview Modal State
  const [previewTemplate, setPreviewTemplate] = useState<DbeComplianceTemplate | null>(null);

  // Read URL tab query param on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as FundingTab | null;
    if (
      tabParam &&
      ['directory', 'pipeline', 'ai-drafter', 'compliance', 'provincial-desks'].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, []);

  // Determine subscription status and hydrate initial workspace fallback
  useEffect(() => {
    setIsPaidSubscriber(hasActivePaidSubscription(user));
    const localFallback = getLocalFundingWorkspaceFallback();
    setSchoolName(localFallback.schoolName);
    setProvince(localFallback.province);
    setNpoNumber(localFallback.npoNumber || '248-910 NPO');
    setRegistrationStatus(localFallback.registrationStatus);
    setQualifyingChildren(localFallback.qualifyingChildren);
    setDaysPerMonth(localFallback.daysPerMonth);
    setComplianceChecks(localFallback.complianceChecks);
    setPipelineGrants(localFallback.pipelineGrants);
  }, [user]);

  // Subscribe to Firestore funding_workspaces and grant_proposals when user is signed in
  useEffect(() => {
    if (!user?.uid) return;

    const unsubWorkspace = subscribeToFundingWorkspace(user.uid, (remote) => {
      if (remote) {
        setSchoolName(remote.schoolName || 'Sunshine Early Learning Centre');
        setProvince(remote.province || 'Gauteng');
        if (remote.npoNumber) setNpoNumber(remote.npoNumber);
        setRegistrationStatus(remote.registrationStatus || 'conditional');
        setQualifyingChildren(remote.qualifyingChildren || 30);
        setDaysPerMonth(remote.daysPerMonth || 22);
        setComplianceChecks(remote.complianceChecks || DEFAULT_COMPLIANCE_CHECKS);
        setPipelineGrants(remote.pipelineGrants || []);
      }
    });

    const unsubProposals = subscribeToUserGrantProposals(user.uid, (proposals) => {
      setSavedProposals(proposals);
    });

    return () => {
      unsubWorkspace();
      unsubProposals();
    };
  }, [user?.uid]);

  // Listen for voice assistant funding actions
  useEffect(() => {
    const applyFundingVoiceAction = (action: VoiceAction | null) => {
      if (!action || action.type !== 'search_funding') return;
      setActiveTab('directory');
      if (action.query) {
        setLiveGrantQuery(action.query);
      }
      if (action.liveSearchPayload) {
        setLiveError(null);
        setLiveGrants(action.liveSearchPayload);
      }
    };

    const pending = consumePendingVoiceAction();
    if (pending && pending.type === 'search_funding') {
      applyFundingVoiceAction(pending);
    }

    const onVoiceEvent = (e: Event) => {
      const custom = e as CustomEvent<VoiceAction>;
      if (custom.detail?.type === 'search_funding') {
        consumePendingVoiceAction();
        applyFundingVoiceAction(custom.detail);
      }
    };

    window.addEventListener(VOICE_ACTION_EVENT, onVoiceEvent);
    return () => window.removeEventListener(VOICE_ACTION_EVENT, onVoiceEvent);
  }, []);

  // Subsidy math (DBE R24.00/day vs Legacy DSD R17.00/day, capped at 264 operational days/year)
  const activeDailyTariff =
    compareRateMode === 'dbe24' ? CURRENT_DBE_DAILY_SUBSIDY_ZAR : LEGACY_DSD_DAILY_SUBSIDY_ZAR;
  const annualOperationalDays = Math.min(MAX_SUBSIDY_DAYS_PER_YEAR, daysPerMonth * 12);
  const monthlySubsidyZAR = qualifyingChildren * activeDailyTariff * daysPerMonth;
  const annualSubsidyDbe24ZAR =
    qualifyingChildren * CURRENT_DBE_DAILY_SUBSIDY_ZAR * annualOperationalDays;
  const annualSubsidyLegacy17ZAR =
    qualifyingChildren * LEGACY_DSD_DAILY_SUBSIDY_ZAR * annualOperationalDays;
  const annualSubsidyActiveZAR =
    compareRateMode === 'dbe24' ? annualSubsidyDbe24ZAR : annualSubsidyLegacy17ZAR;
  const annualUpliftZAR = annualSubsidyDbe24ZAR - annualSubsidyLegacy17ZAR;

  // Ring-fenced 50 / 30 / 20 DBE allocation breakdown
  const monthlyNutrition50ZAR = monthlySubsidyZAR * 0.5;
  const monthlyStipends30ZAR = monthlySubsidyZAR * 0.3;
  const monthlyStimulationAdmin20ZAR = monthlySubsidyZAR * 0.2;

  // Total tracked grant pipeline value in ZAR
  const totalPipelineZAR = useMemo(
    () => calculateEstimatedPipelineZAR(pipelineGrants, qualifyingChildren, daysPerMonth),
    [pipelineGrants, qualifyingChildren, daysPerMonth]
  );

  // DBE Compliance Readiness Percentage
  const complianceReadinessScore = useMemo(() => {
    if (DBE_COMPLIANCE_CHECKLIST.length === 0) return 0;
    return Math.round((complianceChecks.length / DBE_COMPLIANCE_CHECKLIST.length) * 100);
  }, [complianceChecks]);

  const showBannerFeedback = (msg: string) => {
    setWorkspaceFeedback(msg);
    setTimeout(() => setWorkspaceFeedback(null), 4500);
  };

  // Persist workspace to local fallback and (if authenticated) Firestore
  const persistWorkspaceChanges = async (
    nextGrants = pipelineGrants,
    nextChecks = complianceChecks,
    nextChildren = qualifyingChildren,
    nextDays = daysPerMonth,
    nextStatus = registrationStatus
  ) => {
    const estimatedZAR = calculateEstimatedPipelineZAR(nextGrants, nextChildren, nextDays);
    saveLocalFundingWorkspaceFallback({
      uid: user?.uid || 'guest',
      schoolName,
      province,
      npoNumber,
      registrationStatus: nextStatus,
      qualifyingChildren: nextChildren,
      daysPerMonth: nextDays,
      complianceChecks: nextChecks,
      pipelineGrants: nextGrants,
      estimatedPipelineZAR: estimatedZAR,
    });

    if (user?.uid) {
      setIsSavingWorkspace(true);
      try {
        await saveFundingWorkspaceToFirestore(user.uid, {
          schoolName,
          province,
          npoNumber,
          registrationStatus: nextStatus,
          qualifyingChildren: nextChildren,
          daysPerMonth: nextDays,
          complianceChecks: nextChecks,
          pipelineGrants: nextGrants,
          estimatedPipelineZAR: estimatedZAR,
        });
      } catch (err) {
        console.error('Failed to sync funding workspace to Firestore:', err);
      } finally {
        setIsSavingWorkspace(false);
      }
    }
  };

  // Toggle a compliance requirement item
  const handleToggleComplianceCheck = async (checkId: string) => {
    const exists = complianceChecks.includes(checkId);
    const updated = exists
      ? complianceChecks.filter((id) => id !== checkId)
      : [...complianceChecks, checkId];
    setComplianceChecks(updated);
    await persistWorkspaceChanges(pipelineGrants, updated);
  };

  // Add or update a grant in the principal's pipeline
  const handleAddGrantToPipeline = async (grant: VerifiedEcdGrant) => {
    const alreadyExists = pipelineGrants.some((g) => g.grantId === grant.id);
    if (alreadyExists) {
      setActiveTab('pipeline');
      showBannerFeedback(`"${grant.title}" is already tracked in your Grant Pipeline.`);
      return;
    }

    const computedEstimatedZAR =
      grant.id === 'dbe-per-child-subsidy' ? annualSubsidyDbe24ZAR : grant.estimatedZAR;

    const newEntry: PipelineGrantEntry = {
      grantId: grant.id,
      title: grant.title,
      provider: grant.provider,
      amountLabel: grant.amountLabel,
      estimatedZAR: computedEstimatedZAR,
      status: 'saved',
      deadline: grant.deadline,
      url: grant.url,
    };

    const updated = [newEntry, ...pipelineGrants];
    setPipelineGrants(updated);
    await persistWorkspaceChanges(updated, complianceChecks);
    showBannerFeedback(
      `Added "${grant.title}" (Est. R${computedEstimatedZAR.toLocaleString()}) to your Grant Pipeline.`
    );
  };

  const handleUpdatePipelineStatus = async (grantId: string, nextStatus: GrantPipelineStatus) => {
    const updated = pipelineGrants.map((g) =>
      g.grantId === grantId ? { ...g, status: nextStatus } : g
    );
    setPipelineGrants(updated);
    await persistWorkspaceChanges(updated, complianceChecks);
    showBannerFeedback(`Updated grant pipeline stage to "${nextStatus.toUpperCase()}".`);
  };

  const handleRemovePipelineGrant = async (grantId: string) => {
    const updated = pipelineGrants.filter((g) => g.grantId !== grantId);
    setPipelineGrants(updated);
    await persistWorkspaceChanges(updated, complianceChecks);
    showBannerFeedback('Removed grant from your tracked pipeline.');
  };

  // Open AI Drafter pre-configured for a specific grant
  const handleOpenAiDrafterForGrant = (grant: VerifiedEcdGrant) => {
    setSelectedGrantId(grant.id);
    setRequestedAmountZAR(
      grant.id === 'dbe-per-child-subsidy' ? annualSubsidyDbe24ZAR : grant.estimatedZAR
    );
    setActiveTab('ai-drafter');
  };

  // Instant subscriber unlock for Verified Centre (R149/mo)
  const handleInstantSubscriberActivate = async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'nurserynet_active_plan',
        JSON.stringify({
          tierId: 'verified',
          name: 'Verified Centre',
          monthlyPriceZAR: 149,
          schoolName,
          province,
          npoNumber,
          activatedAt: new Date().toISOString(),
        })
      );
    }
    setIsPaidSubscriber(true);
    setUpgradeDialogOpen(false);
    await persistWorkspaceChanges();
    showBannerFeedback(
      'Verified Centre (R149/mo) Funding OS Pro tools unlocked! Cloud vault, full proposal export & dashboard sync active.'
    );
  };

  // Run Live Google Search for SA ECD grants
  const handleSearchLiveGrants = async (topicQuery?: string, forceRefresh = false) => {
    const queryToRun =
      (topicQuery ?? liveGrantQuery).trim() ||
      'South Africa DBE ECD R24 per child subsidy preschool grants NLC CSI';
    if (topicQuery) {
      setLiveGrantQuery(topicQuery);
    }

    setLiveError(null);
    const cacheKey = buildLiveCacheKey('funding', [queryToRun]);
    if (!forceRefresh) {
      const cached = getCachedLiveSearch(cacheKey);
      if (cached) {
        setLiveGrants(cached);
        return;
      }
    }

    setLiveLoading(true);
    try {
      const res = await fetch('/api/live-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'funding',
          query: queryToRun,
        }),
      });
      const raw = await res.text();
      let data: unknown = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
      if (!res.ok) {
        const errObj = data as { error?: string } | null;
        setLiveError(
          errObj?.error ||
            (res.status >= 500
              ? 'The server is still starting up. Please wait a moment and click Retry.'
              : `Could not retrieve live grant calls (HTTP ${res.status}).`)
        );
        return;
      }
      if (!data) {
        setLiveError('Received an unexpected response from the server. Please click Retry.');
        return;
      }
      const typed = data as LiveSearchResponse;
      setLiveGrants(typed);
      setCachedLiveSearch(cacheKey, typed);
    } catch {
      setLiveError(
        'Could not reach the live search service. Please check your connection and retry.'
      );
    } finally {
      setLiveLoading(false);
    }
  };

  // Generate AI Grant Proposal & Motivation Letter via /api/funding-assistant
  const handleGenerateAiProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetGrant =
      VERIFIED_SA_ECD_GRANTS.find((g) => g.id === selectedGrantId) || VERIFIED_SA_ECD_GRANTS[0];

    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/funding-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName,
          province,
          npoNumber,
          registrationStatus,
          qualifyingChildren,
          daysPerMonth,
          grantId: targetGrant.id,
          grantTitle: targetGrant.title,
          funderName: targetGrant.provider,
          requestedAmountZAR,
          projectFocus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAiError(data?.error || 'Could not generate proposal right now. Please try again.');
        return;
      }

      setGeneratedProposal({
        executiveSummary: data.executiveSummary,
        fullProposalText: data.fullProposalText,
        budgetBreakdown: data.budgetBreakdown,
        complianceTips: Array.isArray(data.complianceTips) ? data.complianceTips : [],
        grantTitle: targetGrant.title,
        funderName: targetGrant.provider,
      });
    } catch {
      setAiError('Network error while contacting the ECD Funding Assistant.');
    } finally {
      setAiLoading(false);
    }
  };

  // Save AI Proposal Draft to Firestore
  const handleSaveProposalDraft = async () => {
    if (!generatedProposal) return;
    if (!isPaidSubscriber) {
      setUpgradeDialogOpen(true);
      return;
    }

    if (!user?.uid) {
      showBannerFeedback(
        'Proposal saved to your local Funding OS Vault. Sign in to sync across devices.'
      );
      return;
    }

    try {
      const proposalId = await saveGrantProposalToFirestore({
        proposalId: generatedProposal.proposalId,
        ownerUid: user.uid,
        schoolName,
        province,
        npoNumber,
        grantId: selectedGrantId,
        grantTitle: generatedProposal.grantTitle,
        funderName: generatedProposal.funderName,
        requestedAmountZAR,
        projectFocus,
        executiveSummary: generatedProposal.executiveSummary,
        fullProposalText: generatedProposal.fullProposalText,
        budgetBreakdown: generatedProposal.budgetBreakdown,
      });
      setGeneratedProposal({ ...generatedProposal, proposalId });
      showBannerFeedback('AI Grant Proposal saved to your Firestore Funding Vault!');
    } catch (err) {
      console.error('Failed to save grant proposal:', err);
      showBannerFeedback('Could not save to Firestore right now.');
    }
  };

  // Download template or proposal as printable text file
  const downloadTextDocument = (filename: string, content: string, titleLabel: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showBannerFeedback(`Downloaded "${titleLabel}" to your device.`);
  };

  const handleDownloadFullCompliancePack = () => {
    if (!isPaidSubscriber) {
      setUpgradeDialogOpen(true);
      return;
    }
    const combined = OFFICIAL_DBE_COMPLIANCE_TEMPLATES.map(
      (tpl) => `${'='.repeat(72)}\n${tpl.title.toUpperCase()}\n${'='.repeat(72)}\n\n${tpl.content}`
    ).join('\n\n\n');
    downloadTextDocument(
      `dbe-ecd-subsidy-audit-pack-${schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`,
      combined,
      'Complete 4-Document DBE Subsidy Audit Pack'
    );
  };

  // Filtered grants with live eligibility match percentage
  const filteredGrants = useMemo(() => {
    return VERIFIED_SA_ECD_GRANTS.filter((g) => {
      const matchesCategory =
        selectedCategory === 'All Categories' || g.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.provider.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.eligibility.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const computeGrantMatchPercent = (grant: VerifiedEcdGrant): number => {
    if (!grant.requiredChecklistIds || grant.requiredChecklistIds.length === 0) return 100;
    const met = grant.requiredChecklistIds.filter((reqId) =>
      complianceChecks.includes(reqId)
    ).length;
    return Math.round((met / grant.requiredChecklistIds.length) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero & Policy Migration Authority Header */}
      <section className="py-12 md:py-16 bg-muted/20 border-b border-border/60">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 mb-3">
                <Coins className="h-3.5 w-3.5 shrink-0" />
                <span>
                  OFFICIAL SA ECD FUNCTION SHIFT: DSD → DEPARTMENT OF BASIC EDUCATION (DBE)
                </span>
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                South African ECD Funding &amp; Subsidy OS
              </h1>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Calculate your centre&apos;s gazetted{' '}
                <strong className="text-foreground font-mono">
                  R{CURRENT_DBE_DAILY_SUBSIDY_ZAR.toFixed(2)} per child/day
                </strong>{' '}
                DBE Equitable Share allocation, track NLC &amp; Tshikululu CSI grant deadlines,
                generate audit-ready motivation letters with AI, and maintain 100% provincial
                inspection compliance.
              </p>
            </div>

            {/* Subscription & Cloud Sync Status Card */}
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm lg:w-80 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Funding OS Tier
                </span>
                {isPaidSubscriber ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    <Unlock className="w-3 h-3" /> Pro Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    <Lock className="w-3 h-3" /> Guest Preview
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {isPaidSubscriber ? (
                  <span>
                    Full AI Proposal export, 1-click DBE Audit Pack, and live Owner Dashboard
                    pipeline protection are active for <strong>{schoolName}</strong>.
                  </span>
                ) : (
                  <span>
                    Preview calculators, live grant search &amp; AI summaries free. Unlock full
                    proposal export &amp; Firestore cloud sync with{' '}
                    <strong className="text-foreground">Verified Centre (R149/mo)</strong>.
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                {isPaidSubscriber ? (
                  <Button asChild variant="outline" size="sm" className="w-full text-xs font-bold">
                    <Link href="/dashboard">
                      View Pipeline in Owner Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setUpgradeDialogOpen(true)}
                      className="flex-1 text-xs font-bold whitespace-nowrap"
                    >
                      Unlock Pro OS · R149/mo
                    </Button>
                    <Button asChild variant="outline" size="sm" className="text-xs font-semibold">
                      <Link href="/pricing">Plans</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 4-Card Live Financial & Compliance KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>DBE R24/Day Annual Subsidy</span>
                <Calculator className="w-4 h-4 text-primary" />
              </div>
              <div className="mt-2 font-heading text-2xl font-extrabold text-foreground font-mono tabular-nums">
                R{annualSubsidyDbe24ZAR.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                +R{annualUpliftZAR.toLocaleString()}/yr vs legacy R17 rate
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Tracked Grant Pipeline</span>
                <FolderKanban className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 font-heading text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                R{totalPipelineZAR.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground font-mono">
                {pipelineGrants.length} active grant{pipelineGrants.length === 1 ? '' : 's'} tracked
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>DBE Audit Readiness</span>
                <ClipboardCheck className="w-4 h-4 text-primary" />
              </div>
              <div className="mt-2 font-heading text-2xl font-extrabold text-foreground font-mono tabular-nums">
                {complianceReadinessScore}%
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground font-mono">
                {complianceChecks.length} of {DBE_COMPLIANCE_CHECKLIST.length} statutory docs ready
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Subscription ROI Multiple</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 font-heading text-2xl font-extrabold text-foreground font-mono tabular-nums">
                {Math.max(1, Math.round(totalPipelineZAR / (149 * 12)))}x
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                1 grant covers 45+ years of R149/mo plan
              </div>
            </div>
          </div>

          {workspaceFeedback && (
            <div className="mt-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{workspaceFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setWorkspaceFeedback(null)}
                className="text-xs underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Interactive DBE R24.00/Child/Day Subsidy Calculator & 50/30/20 Ring-Fence Ledger */}
      <section className="py-10 border-b border-border/60">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-card border-2 border-primary/25 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-border/60">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-primary shrink-0" />
                  <span>DBE Per-Child Equitable Share Subsidy Calculator (2025/2026)</span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Gazetted national standard:{' '}
                  <strong className="text-foreground font-mono">
                    R24.00 per qualifying child per operational day
                  </strong>{' '}
                  (up to {MAX_SUBSIDY_DAYS_PER_YEAR} operational days per year).
                </p>
              </div>

              {/* Rate Comparison Toggle: DBE R24.00 vs Legacy DSD R17.00 */}
              <div className="inline-flex items-center p-1 rounded-xl bg-muted border border-border self-start lg:self-center">
                <button
                  type="button"
                  onClick={() => setCompareRateMode('dbe24')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    compareRateMode === 'dbe24'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Current DBE R24.00/day
                </button>
                <button
                  type="button"
                  onClick={() => setCompareRateMode('dsd17')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    compareRateMode === 'dsd17'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Legacy DSD R17.00/day
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Centre Profile & Sliders */}
              <div className="lg:col-span-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="calc-school-name" className="text-xs font-semibold">
                      ECD Centre Name
                    </Label>
                    <Input
                      id="calc-school-name"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="calc-province" className="text-xs font-semibold">
                      Province
                    </Label>
                    <select
                      id="calc-province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs font-medium"
                    >
                      {PROVINCIAL_DBE_ECD_DESKS.map((p) => (
                        <option key={p.province} value={p.province}>
                          {p.province}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="calc-reg-status" className="text-xs font-semibold">
                      DBE Registration Tier
                    </Label>
                    <select
                      id="calc-reg-status"
                      value={registrationStatus}
                      onChange={(e) =>
                        setRegistrationStatus(e.target.value as EcdRegistrationStatus)
                      }
                      className="mt-1 w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs font-medium"
                    >
                      <option value="full">Full Registration (Gold)</option>
                      <option value="conditional">Conditional (Silver)</option>
                      <option value="unregistered">Vangasali Pipeline (Bronze)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-sm font-semibold">
                    <Label htmlFor="children">Qualifying Children (SASSA / Means-Tested)</Label>
                    <span className="font-bold text-primary font-mono tabular-nums">
                      {qualifyingChildren} children
                    </span>
                  </div>
                  <input
                    id="children"
                    type="range"
                    min="5"
                    max="150"
                    step="1"
                    value={qualifyingChildren}
                    onChange={(e) => setQualifyingChildren(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>5 children (Micro home crèche)</span>
                    <span>150 children (Large community educare)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <Label htmlFor="days">Operational Days per Month</Label>
                    <span className="font-bold text-primary font-mono tabular-nums">
                      {daysPerMonth} days/mo ({annualOperationalDays} days/yr)
                    </span>
                  </div>
                  <input
                    id="days"
                    type="range"
                    min="18"
                    max="23"
                    step="1"
                    value={daysPerMonth}
                    onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-muted-foreground block">
                    DBE funds up to a statutory maximum of {MAX_SUBSIDY_DAYS_PER_YEAR} operational
                    days per financial year (R6,336/child/year at R24/day).
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isSavingWorkspace}
                    onClick={async () => {
                      await persistWorkspaceChanges();
                      showBannerFeedback(
                        `Saved ${schoolName} (${qualifyingChildren} children · R${annualSubsidyDbe24ZAR.toLocaleString()}/yr) to your Funding Workspace.`
                      );
                    }}
                    className="text-xs font-bold whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    <span>
                      {isSavingWorkspace
                        ? 'Syncing Workspace...'
                        : 'Save Calculation to My Workspace'}
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGrantId('dbe-per-child-subsidy');
                      setRequestedAmountZAR(annualSubsidyDbe24ZAR);
                      setActiveTab('ai-drafter');
                    }}
                    className="text-xs font-semibold whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    <span>Draft DBE SLA Motivation Letter</span>
                  </Button>
                </div>
              </div>

              {/* Right Column: Live Calculation + Mandatory 50/30/20 Ring-Fenced Breakdown */}
              <div className="lg:col-span-6 bg-muted/30 p-5 sm:p-6 rounded-2xl border border-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                      Monthly Provincial Tranche ({compareRateMode === 'dbe24' ? 'R24.00/day' : 'R17.00/day'})
                    </span>
                    <div className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground font-mono tabular-nums mt-0.5">
                      R{monthlySubsidyZAR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-xs font-normal text-muted-foreground"> / month</span>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                      Annual Allocation ({annualOperationalDays} Days)
                    </span>
                    <div className="font-heading text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-0.5">
                      R{annualSubsidyActiveZAR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Mandatory 50/30/20 Ring-Fence Ledger */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>Statutory DBE Ring-Fenced Expenditure Breakdown</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      PED Audit Standard
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-background border border-border">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        <span>50% Child Nutrition</span>
                        <span className="font-mono">50%</span>
                      </div>
                      <div className="mt-1 font-mono font-extrabold text-base text-foreground tabular-nums">
                        R{monthlyNutrition50ZAR.toLocaleString()}
                        <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Daily breakfast porridge, cooked lunch &amp; fresh fruit.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-background border border-border">
                      <div className="flex items-center justify-between text-[11px] font-bold text-primary">
                        <span>30% Staff Stipends</span>
                        <span className="font-mono">30%</span>
                      </div>
                      <div className="mt-1 font-mono font-extrabold text-base text-foreground tabular-nums">
                        R{monthlyStipends30ZAR.toLocaleString()}
                        <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        ECD practitioners, cooks &amp; assistant salaries.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-background border border-border">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-300">
                        <span>20% Stimulation &amp; Ops</span>
                        <span className="font-mono">20%</span>
                      </div>
                      <div className="mt-1 font-mono font-extrabold text-base text-foreground tabular-nums">
                        R{monthlyStimulationAdmin20ZAR.toLocaleString()}
                        <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        NCF learning toys, stationery, hygiene &amp; audit fees.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
                  <span className="text-emerald-900 dark:text-emerald-200">
                    <strong>Tariff Uplift Impact:</strong> Moving from R17/day to the gazetted{' '}
                    <strong>R24/day</strong> adds{' '}
                    <strong className="font-mono">
                      R{annualUpliftZAR.toLocaleString()} ZAR/year
                    </strong>{' '}
                    to your centre&apos;s budget.
                  </span>
                  {compareRateMode === 'dsd17' && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setCompareRateMode('dbe24')}
                      className="h-7 text-[11px] font-bold shrink-0"
                    >
                      Switch to R24/day
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Tab Funding OS Workspace Navigation */}
      <section className="py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-border mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'directory'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. Verified SA Grant Directory ({VERIFIED_SA_ECD_GRANTS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pipeline')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'pipeline'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>2. My Grant Pipeline Tracker ({pipelineGrants.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai-drafter')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'ai-drafter'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>3. AI Proposal &amp; Motivation Drafter</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('compliance')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'compliance'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>4. DBE Compliance Vault ({complianceReadinessScore}%)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('provincial-desks')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'provincial-desks'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>5. 9-Province DBE ECD Desks</span>
            </button>
          </div>

          {/* TAB 1: VERIFIED SA GRANT DIRECTORY & LIVE GOOGLE SEARCH */}
          {activeTab === 'directory' && (
            <div className="space-y-10">
              {/* Live Google Search ECD Grant Finder */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      <span>Live SA Grant &amp; DBE Call Finder (Google Search Grounded)</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      Query live South African ECD funding windows, provincial DBE notices, NLC
                      charities calls, and Tshikululu CSI deadlines.
                    </p>
                  </div>
                  {liveGrants && (
                    <button
                      type="button"
                      onClick={() => {
                        setLiveGrants(null);
                        setLiveError(null);
                      }}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 self-start sm:self-center"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear Live Results</span>
                    </button>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchLiveGrants(undefined, false);
                  }}
                  className="flex flex-col sm:flex-row gap-2.5"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                    <Input
                      placeholder="e.g. Gauteng DBE ECD R24 subsidy 2026, NLC charities grant, Tshikululu ECD fund..."
                      value={liveGrantQuery}
                      onChange={(e) => setLiveGrantQuery(e.target.value)}
                      className="pl-9 h-10"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={liveLoading}
                    className="h-10 px-5 font-bold text-xs whitespace-nowrap shrink-0"
                  >
                    <Globe className="w-4 h-4 mr-1.5" />
                    <span>{liveLoading ? 'Searching Live Web...' : 'Search Live Grants'}</span>
                  </Button>
                </form>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Quick topics:</span>
                  {FUNDING_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      disabled={liveLoading}
                      onClick={() => handleSearchLiveGrants(topic, false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors whitespace-nowrap shrink-0"
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                {liveLoading && (
                  <div className="space-y-3 pt-3 border-t border-border/60 animate-pulse">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-24 bg-muted rounded-xl" />
                    <div className="h-24 bg-muted rounded-xl" />
                  </div>
                )}

                {liveError && !liveLoading && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-between gap-3 text-xs text-destructive">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{liveError}</span>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearchLiveGrants(undefined, true)}
                      className="h-8 px-3 text-xs font-semibold shrink-0"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {liveGrants && !liveLoading && !liveError && (
                  <div className="pt-4 border-t border-border/60 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                        {liveGrants.summary}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearchLiveGrants(liveGrants.query, true)}
                        className="h-8 px-3 text-xs font-semibold whitespace-nowrap shrink-0"
                      >
                        Refresh
                      </Button>
                    </div>

                    {liveGrants.highlights.length > 0 && (
                      <div className="space-y-3">
                        {liveGrants.highlights.map((grant, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-background border border-border/80 space-y-2"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div>
                                <h3 className="font-heading text-base font-bold text-foreground">
                                  {grant.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">{grant.subtitle}</p>
                              </div>
                              {grant.websiteUrl && (
                                <Button
                                  asChild
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs whitespace-nowrap shrink-0 self-start"
                                >
                                  <a
                                    href={grant.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Official Portal <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                  </a>
                                </Button>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono tabular-nums">
                              {grant.feeOrAmount && (
                                <span>
                                  Amount:{' '}
                                  <strong className="text-emerald-600">{grant.feeOrAmount}</strong>
                                </span>
                              )}
                              {grant.feeOrAmount && grant.hoursOrDeadline && (
                                <span aria-hidden="true" className="text-muted-foreground/40">
                                  ·
                                </span>
                              )}
                              {grant.hoursOrDeadline && (
                                <span>
                                  Window:{' '}
                                  <strong className="text-foreground">
                                    {grant.hoursOrDeadline}
                                  </strong>
                                </span>
                              )}
                            </div>

                            {grant.reviewsSummary && (
                              <p className="text-xs text-muted-foreground">
                                <strong className="text-foreground">Eligibility: </strong>
                                {grant.reviewsSummary}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {grant.details}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <LiveSearchSources
                      sources={liveGrants.sources}
                      searchedAt={liveGrants.searchedAt}
                    />
                  </div>
                )}
              </div>

              {/* Verified South African ECD Grants Directory */}
              <div className="space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-foreground">
                      Verified South African ECD Grants &amp; Subsidy Windows
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Deep-linked to official application portals with live eligibility matching
                      against your centre&apos;s compliance checklist.
                    </p>
                  </div>
                  <div className="w-full md:w-72">
                    <Input
                      placeholder="Filter by grant, funder or keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                  {GRANT_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Grant Cards */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredGrants.map((grant) => {
                    const matchPct = computeGrantMatchPercent(grant);
                    const isTracked = pipelineGrants.some((p) => p.grantId === grant.id);

                    return (
                      <Card
                        key={grant.id}
                        className="border border-border/80 hover:border-primary/40 transition-colors"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                                {grant.category}
                              </span>
                              <span
                                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md ${
                                  matchPct >= 75
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                {matchPct}% Readiness Match
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                              Intake Window: <strong className="text-foreground">{grant.deadline}</strong>
                            </span>
                          </div>
                          <CardTitle className="font-heading text-lg sm:text-xl font-bold text-foreground">
                            {grant.title}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">
                            Administered by <strong>{grant.provider}</strong> · Turnaround:{' '}
                            <span className="font-mono">{grant.turnaroundTime}</span>
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="pb-4 text-xs space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-foreground">Funding Allocation:</strong>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                              {grant.amountLabel}
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">Eligibility Criteria:</strong>{' '}
                            {grant.eligibility}
                          </p>
                        </CardContent>

                        <CardFooter className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={isTracked ? 'secondary' : 'default'}
                              onClick={() => handleAddGrantToPipeline(grant)}
                              className="h-8 text-xs font-bold whitespace-nowrap"
                            >
                              {isTracked ? (
                                <>
                                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                                  <span>Tracked in Pipeline</span>
                                </>
                              ) : (
                                <>
                                  <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
                                  <span>Track in My Pipeline</span>
                                </>
                              )}
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenAiDrafterForGrant(grant)}
                              className="h-8 text-xs font-semibold whitespace-nowrap"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
                              <span>Draft AI Proposal</span>
                            </Button>
                          </div>

                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-semibold whitespace-nowrap"
                          >
                            <a href={grant.url} target="_blank" rel="noopener noreferrer">
                              {grant.portalLabel} <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY GRANT PIPELINE TRACKER */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-foreground">
                      My ECD Grant Pipeline Tracker
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Track every application from document preparation to final payout. Automatically
                      synced to your Owner Dashboard so you never miss an intake window.
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] uppercase font-bold text-muted-foreground">
                      Total Tracked Pipeline Value
                    </span>
                    <div className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                      R{totalPipelineZAR.toLocaleString()} ZAR
                    </div>
                  </div>
                </div>

                {!isPaidSubscriber && (
                  <div className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                      <strong>Guest Preview Active:</strong> Changes below are previewed in your
                      browser session. Upgrade to{' '}
                      <strong>Verified Centre (R149/mo)</strong> to lock in permanent Firestore
                      cloud persistence and Owner Dashboard deadline alerts.
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setUpgradeDialogOpen(true)}
                      className="text-xs font-bold whitespace-nowrap shrink-0"
                    >
                      <Unlock className="w-3.5 h-3.5 mr-1.5" />
                      <span>Protect Pipeline · R149/mo</span>
                    </Button>
                  </div>
                )}

                {pipelineGrants.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <FolderKanban className="w-10 h-10 text-muted-foreground mx-auto" />
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      No Grants Tracked Yet
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Add grants from the Verified SA Grant Directory to calculate your centre&apos;s
                      total funding pipeline and track submission progress.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setActiveTab('directory')}
                      className="text-xs font-bold"
                    >
                      Browse Verified SA Grants
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {pipelineGrants.map((entry) => {
                      const matchedGrant = VERIFIED_SA_ECD_GRANTS.find(
                        (g) => g.id === entry.grantId
                      );
                      return (
                        <div
                          key={entry.grantId}
                          className="p-4 rounded-xl bg-background border border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-heading font-bold text-base text-foreground">
                                {entry.title}
                              </span>
                              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                Est. R{entry.estimatedZAR.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Provider: <strong>{entry.provider}</strong> · Window:{' '}
                              <strong>{entry.deadline}</strong>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            <div className="flex items-center gap-1.5">
                              <Label
                                htmlFor={`status-${entry.grantId}`}
                                className="text-[11px] font-semibold text-muted-foreground"
                              >
                                Stage:
                              </Label>
                              <select
                                id={`status-${entry.grantId}`}
                                value={entry.status}
                                onChange={(e) =>
                                  handleUpdatePipelineStatus(
                                    entry.grantId,
                                    e.target.value as GrantPipelineStatus
                                  )
                                }
                                className="h-8 rounded-md border border-input bg-card px-2.5 text-xs font-bold text-foreground"
                              >
                                <option value="saved">1. Saved / Shortlisted</option>
                                <option value="preparing">2. Preparing Audit Docs</option>
                                <option value="submitted">3. Submitted to Funder</option>
                                <option value="approved">4. Approved / Contracting</option>
                              </select>
                            </div>

                            {matchedGrant && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenAiDrafterForGrant(matchedGrant)}
                                className="h-8 text-xs font-semibold whitespace-nowrap"
                              >
                                <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
                                <span>Draft Proposal</span>
                              </Button>
                            )}

                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs whitespace-nowrap"
                            >
                              <a href={entry.url} target="_blank" rel="noopener noreferrer">
                                Portal <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemovePipelineGrant(entry.grantId)}
                              className="h-8 px-2 text-muted-foreground hover:text-destructive"
                              title="Remove from pipeline"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AI GRANT PROPOSAL & MOTIVATION LETTER DRAFTER */}
          {activeTab === 'ai-drafter' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Form: Grant & Centre Parameters */}
              <Card className="lg:col-span-5 border border-border">
                <CardHeader>
                  <CardTitle className="font-heading text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>AI Grant Proposal Drafter</span>
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Generate a formal South African ECD motivation letter and ring-fenced ZAR budget
                    aligned with Children&apos;s Act 38 of 2005 and DBE norms.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerateAiProposal} className="space-y-4">
                    <div>
                      <Label htmlFor="ai-grant-select" className="text-xs font-semibold">
                        Target Grant / Funder
                      </Label>
                      <select
                        id="ai-grant-select"
                        value={selectedGrantId}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          setSelectedGrantId(nextId);
                          const g = VERIFIED_SA_ECD_GRANTS.find((item) => item.id === nextId);
                          if (g) {
                            setRequestedAmountZAR(
                              g.id === 'dbe-per-child-subsidy'
                                ? annualSubsidyDbe24ZAR
                                : g.estimatedZAR
                            );
                          }
                        }}
                        className="mt-1 w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs font-medium"
                      >
                        {VERIFIED_SA_ECD_GRANTS.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title} ({g.amountLabel})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="ai-school-name" className="text-xs font-semibold">
                          ECD Centre Name
                        </Label>
                        <Input
                          id="ai-school-name"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className="mt-1 h-9 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ai-npo" className="text-xs font-semibold">
                          NPO Registration Number
                        </Label>
                        <Input
                          id="ai-npo"
                          placeholder="e.g. 248-910 NPO"
                          value={npoNumber}
                          onChange={(e) => setNpoNumber(e.target.value)}
                          className="mt-1 h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="ai-amount" className="text-xs font-semibold">
                          Requested Amount (ZAR)
                        </Label>
                        <Input
                          id="ai-amount"
                          type="number"
                          min={5000}
                          max={25000000}
                          value={requestedAmountZAR}
                          onChange={(e) => setRequestedAmountZAR(Number(e.target.value))}
                          className="mt-1 h-9 text-xs font-mono"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ai-children" className="text-xs font-semibold">
                          Beneficiary Children
                        </Label>
                        <Input
                          id="ai-children"
                          type="number"
                          min={5}
                          max={500}
                          value={qualifyingChildren}
                          onChange={(e) => setQualifyingChildren(Number(e.target.value))}
                          className="mt-1 h-9 text-xs font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="ai-focus" className="text-xs font-semibold">
                        Specific Project Need &amp; Community Impact
                      </Label>
                      <textarea
                        id="ai-focus"
                        rows={3}
                        value={projectFocus}
                        onChange={(e) => setProjectFocus(e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background p-2.5 text-xs leading-relaxed"
                        placeholder="Describe what your crèche will purchase or build with this funding..."
                        required
                      />
                      <div className="mt-2 space-y-1.5">
                        <span className="text-[11px] text-muted-foreground block">
                          Quick project presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_PROJECT_FOCUSES.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setProjectFocus(preset)}
                              className="text-left text-[11px] px-2.5 py-1 rounded-md border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors line-clamp-1"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={aiLoading}
                      className="w-full font-bold text-xs h-10"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      <span>
                        {aiLoading
                          ? 'Drafting SA ECD Proposal & ZAR Budget...'
                          : 'Generate Motivation Letter & Budget'}
                      </span>
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Right Panel: Generated Proposal Output + Saved Drafts Vault */}
              <div className="lg:col-span-7 space-y-6">
                {aiError && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}

                {!generatedProposal && !aiLoading && (
                  <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-3">
                    <FileText className="w-10 h-10 text-primary mx-auto" />
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      Ready to Draft Your Funder-Ready Motivation Letter
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Select a South African grant on the left and click{' '}
                      <strong>Generate Motivation Letter &amp; Budget</strong> to produce an
                      executive summary, itemized ZAR budget table, and statutory submission
                      letter.
                    </p>
                  </div>
                )}

                {aiLoading && (
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4 animate-pulse">
                    <div className="h-5 bg-muted rounded w-1/2" />
                    <div className="h-20 bg-muted rounded-xl" />
                    <div className="h-32 bg-muted rounded-xl" />
                    <div className="h-44 bg-muted rounded-xl" />
                  </div>
                )}

                {generatedProposal && !aiLoading && (
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          Generated SA ECD Proposal
                        </span>
                        <h3 className="font-heading text-lg font-bold text-foreground">
                          {generatedProposal.grantTitle}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Prepared for <strong>{generatedProposal.funderName}</strong> · Requested:{' '}
                          <strong className="font-mono text-emerald-600">
                            R{requestedAmountZAR.toLocaleString()} ZAR
                          </strong>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleSaveProposalDraft}
                          className="h-8 text-xs font-semibold whitespace-nowrap"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
                          <span>Save to Vault</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (!isPaidSubscriber) {
                              setUpgradeDialogOpen(true);
                              return;
                            }
                            downloadTextDocument(
                              `ecd-proposal-${schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`,
                              `${generatedProposal.grantTitle}\nFunder: ${generatedProposal.funderName}\nCentre: ${schoolName} (${npoNumber})\nRequested: R${requestedAmountZAR.toLocaleString()} ZAR\n\nEXECUTIVE SUMMARY:\n${generatedProposal.executiveSummary}\n\nBUDGET BREAKDOWN:\n${generatedProposal.budgetBreakdown}\n\nFULL MOTIVATION LETTER:\n${generatedProposal.fullProposalText}`,
                              generatedProposal.grantTitle
                            );
                          }}
                          className="h-8 text-xs font-bold whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          <span>Download .TXT</span>
                        </Button>
                      </div>
                    </div>

                    {/* Executive Summary (Always visible in free preview) */}
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                      <span className="text-xs font-bold text-foreground">
                        1. Executive Summary (Board &amp; Adjudication Committee Overview)
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {generatedProposal.executiveSummary}
                      </p>
                    </div>

                    {/* Ring-Fenced Budget Breakdown (Always visible in free preview) */}
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                      <span className="text-xs font-bold text-foreground">
                        2. Ring-Fenced ZAR Budget Schedule
                      </span>
                      <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                        {generatedProposal.budgetBreakdown}
                      </pre>
                    </div>

                    {/* Full Motivation Letter (Editable for Paid Subscribers, Soft-Preview Gated for Guests) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          3. Formal Motivation Letter &amp; Implementation Plan
                        </span>
                        {isPaidSubscriber && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedProposal.fullProposalText);
                              setCopiedFeedback(true);
                              setTimeout(() => setCopiedFeedback(false), 2500);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedFeedback ? 'Copied to Clipboard!' : 'Copy Full Letter'}</span>
                          </button>
                        )}
                      </div>

                      {isPaidSubscriber ? (
                        <textarea
                          rows={14}
                          value={generatedProposal.fullProposalText}
                          onChange={(e) =>
                            setGeneratedProposal({
                              ...generatedProposal,
                              fullProposalText: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-input bg-background p-4 font-mono text-xs leading-relaxed text-foreground"
                        />
                      ) : (
                        <div className="relative rounded-xl border border-border bg-background p-4 overflow-hidden">
                          <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-hidden">
                            {generatedProposal.fullProposalText.slice(0, 520)}...
                          </pre>
                          <div className="mt-3 p-4 rounded-xl bg-card/95 border border-primary/30 text-center space-y-2.5 shadow-sm">
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Unlock Full Editable Motivation Letter &amp; Cloud Vault</span>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto">
                              Verified Centre subscribers (<strong>R149/mo</strong>) get unlimited
                              full-length proposal exports, editable templates, and automatic
                              Firestore cloud storage.
                            </p>
                            <div className="flex justify-center gap-2.5">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => setUpgradeDialogOpen(true)}
                                className="text-xs font-bold"
                              >
                                Unlock Full Proposal · R149/mo
                              </Button>
                              <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href="/pricing">Compare Tiers</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Compliance Tips */}
                    {generatedProposal.complianceTips.length > 0 && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                          Mandatory Attachments for This Submission:
                        </span>
                        <ul className="space-y-1 text-xs text-emerald-800 dark:text-emerald-300">
                          {generatedProposal.complianceTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Saved Firestore Proposal Drafts Vault */}
                {savedProposals.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <h4 className="font-heading text-base font-bold text-foreground">
                      Saved Firestore Grant Proposal Vault ({savedProposals.length})
                    </h4>
                    <div className="space-y-2">
                      {savedProposals.map((item) => (
                        <div
                          key={item.proposalId}
                          className="p-3 rounded-xl bg-background border border-border flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-foreground">{item.grantTitle}</div>
                            <div className="text-muted-foreground">
                              {item.schoolName} ·{' '}
                              <span className="font-mono text-emerald-600 font-bold">
                                R{item.requestedAmountZAR.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setGeneratedProposal({
                                  proposalId: item.proposalId,
                                  executiveSummary: item.executiveSummary,
                                  fullProposalText: item.fullProposalText,
                                  budgetBreakdown: item.budgetBreakdown || '',
                                  complianceTips: [],
                                  grantTitle: item.grantTitle,
                                  funderName: item.funderName,
                                })
                              }
                              className="h-7 text-xs"
                            >
                              Load Draft
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteGrantProposalFromFirestore(item.proposalId)}
                              className="h-7 px-2 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DBE COMPLIANCE READINESS VAULT & OFFICIAL AUDIT PACK */}
          {activeTab === 'compliance' && (
            <div className="space-y-8">
              {/* Top Readiness Progress Bar */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-foreground">
                      10-Point DBE Subsidy &amp; Children&apos;s Act Compliance Vault
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Check off the statutory documents your centre currently holds on file. Your
                      readiness score updates your Grant Directory match % in real time.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] uppercase font-bold text-muted-foreground block">
                        Audit Readiness
                      </span>
                      <span className="font-heading text-2xl font-extrabold font-mono text-primary">
                        {complianceReadinessScore}%
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleDownloadFullCompliancePack}
                      className="text-xs font-bold whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      <span>Download Complete 4-Doc Audit Pack</span>
                    </Button>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${complianceReadinessScore}%` }}
                  />
                </div>
              </div>

              {/* 10-Point Interactive Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DBE_COMPLIANCE_CHECKLIST.map((item) => {
                  const checked = complianceChecks.includes(item.id);
                  const linkedTemplate = item.templateId
                    ? OFFICIAL_DBE_COMPLIANCE_TEMPLATES.find((t) => t.id === item.templateId)
                    : null;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-colors ${
                        checked
                          ? 'bg-emerald-500/5 border-emerald-500/40'
                          : 'bg-card border-border hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          id={`chk-${item.id}`}
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleComplianceCheck(item.id)}
                          className="mt-1 h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                        />
                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {item.statutoryRef}
                            </span>
                          </div>
                          <label
                            htmlFor={`chk-${item.id}`}
                            className="font-heading text-sm font-bold text-foreground block cursor-pointer"
                          >
                            {item.title}
                          </label>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                          {linkedTemplate && (
                            <div className="pt-2 flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setPreviewTemplate(linkedTemplate)}
                                className="h-7 text-[11px] font-semibold"
                              >
                                <Eye className="w-3 h-3 mr-1" /> Preview Official Form
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  downloadTextDocument(
                                    `${linkedTemplate.id}.txt`,
                                    linkedTemplate.content,
                                    linkedTemplate.title
                                  )
                                }
                                className="h-7 text-[11px] font-semibold text-primary"
                              >
                                <Download className="w-3 h-3 mr-1" /> Download
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Official Printable DBE Subsidy Audit Pack Templates */}
              <div className="pt-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground">
                      Official Printable DBE Subsidy Audit Templates
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Standardized South African forms required during provincial district social
                      worker and PED audit visits.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="text-xs font-semibold">
                    <Link href="/preschools/growth-kit?category=dbe-subsidy">
                      Open Full School Growth Kit (8 Templates){' '}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {OFFICIAL_DBE_COMPLIANCE_TEMPLATES.map((tpl) => (
                    <Card key={tpl.id} className="border border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-md">
                            {tpl.category}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {tpl.format}
                          </span>
                        </div>
                        <CardTitle className="font-heading text-base font-bold text-foreground">
                          {tpl.title}
                        </CardTitle>
                        <CardDescription className="text-xs leading-relaxed">
                          {tpl.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-3 border-t border-border/50 flex gap-2.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewTemplate(tpl)}
                          className="flex-1 text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview Form
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            downloadTextDocument(`${tpl.id}.txt`, tpl.content, tpl.title)
                          }
                          className="flex-1 text-xs font-bold"
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" /> Download .TXT
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 9-PROVINCE DBE ECD DESK DIRECTORY */}
          {activeTab === 'provincial-desks' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  9-Province Department of Basic Education (DBE) ECD Desks
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Following the national ECD function shift from DSD to DBE, provincial education
                  departments (PEDs) administer all R24/day equitable share SLA contracts and
                  Vangasali registrations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PROVINCIAL_DBE_ECD_DESKS.map((desk) => (
                  <Card
                    key={desk.province}
                    className={`border transition-colors ${
                      desk.province === province
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                          <MapPin className="w-3.5 h-3.5" /> {desk.province}
                        </span>
                        {desk.province === province && (
                          <span className="text-[10px] font-bold uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Your Province
                          </span>
                        )}
                      </div>
                      <CardTitle className="font-heading text-base font-bold text-foreground mt-1">
                        {desk.department}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2 pb-4">
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 text-foreground shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-foreground">Helpline:</strong>{' '}
                          <span className="font-mono">{desk.helpline}</span>
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-foreground shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-foreground">SLA Intake:</strong>{' '}
                          {desk.intakeWindow}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed pt-1">
                        <strong className="text-foreground">District Priority:</strong>{' '}
                        {desk.registrationFocus}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-3 border-t border-border/50">
                      <Button asChild variant="outline" size="sm" className="w-full text-xs">
                        <a href={desk.portalUrl} target="_blank" rel="noopener noreferrer">
                          Open {desk.province} PED Portal{' '}
                          <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Template Preview Modal */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>{previewTemplate?.title}</span>
            </DialogTitle>
            <DialogDescription>
              {previewTemplate?.category} · Official South African DBE Subsidy Audit Template
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 bg-muted/40 rounded-xl border border-border font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
            {previewTemplate?.content}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            {previewTemplate && (
              <Button
                onClick={() => {
                  downloadTextDocument(
                    `${previewTemplate.id}.txt`,
                    previewTemplate.content,
                    previewTemplate.title
                  );
                  setPreviewTemplate(null);
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Download Printable Template
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Upgrade & Anti-Churn ROI Modal */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Unlock Full South African ECD Funding OS</span>
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Your tracked grant pipeline is currently valued at{' '}
              <strong className="text-emerald-600 font-mono">
                R{totalPipelineZAR.toLocaleString()} ZAR
              </strong>
              . One successful grant pays for over 45 years of your Verified Centre subscription.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
              <div className="font-bold text-foreground">
                Included in Verified Centre (R149/month) &amp; Featured Top Slot (R390/month):
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Unlimited full-length AI Grant Proposals &amp; Ring-Fenced ZAR Budget exports
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Permanent Firestore Cloud Grant Pipeline &amp; Proposal Vault persistence
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    1-Click Complete 4-Document DBE Subsidy Audit Pack download
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Verified badge in parent search directory + direct WhatsApp &amp; tour bookings
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUpgradeDialogOpen(false)}
              className="text-xs"
            >
              Continue Guest Preview
            </Button>
            <Button
              type="button"
              onClick={handleInstantSubscriberActivate}
              className="text-xs font-bold"
            >
              <Unlock className="w-3.5 h-3.5 mr-1.5" />
              <span>Activate Verified Centre (R149/mo) Now</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
