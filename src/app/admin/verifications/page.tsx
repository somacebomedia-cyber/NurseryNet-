'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  adminApproveManualClaim,
  adminRejectManualClaim,
  adminResolveOwnershipDispute,
  adminRevokeOwnershipLock,
  formatFirestoreTime,
  subscribeToAdminAuditLogs,
  subscribeToAdminClaims,
  subscribeToAdminDisputes,
  subscribeToVerifiedOwnerships,
  type OwnershipClaimRecord,
  type OwnershipDisputeRecord,
  type VerificationAuditLogRecord,
  type VerifiedOwnershipRecord,
} from '@/lib/firestore-ownership';
import { getVerificationMethodLabel } from '@/lib/ownership-verification';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  FileCheck2,
  ArrowRightLeft,
  History,
  LogIn,
  Loader2,
  Unlock,
  ExternalLink,
  Radio,
  Mail,
  MessageSquare,
} from 'lucide-react';
import type { GatewayStatusSummary } from '@/lib/otp-providers';

type AdminTab = 'claims' | 'disputes' | 'registry' | 'audit' | 'gateways';

export default function AdminVerificationsPage() {
  const { user, loading: authLoading, signInWithGoogle, getIdToken } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('claims');
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatusSummary | null>(null);
  const [loadingGateways, setLoadingGateways] = useState(false);
  const [claimStatusFilter, setClaimStatusFilter] = useState<'pending_review' | 'all' | 'approved' | 'rejected'>('pending_review');
  const [disputeStatusFilter, setDisputeStatusFilter] = useState<'open' | 'all'>('open');
  const [searchQuery, setSearchQuery] = useState('');

  const [claims, setClaims] = useState<OwnershipClaimRecord[]>([]);
  const [disputes, setDisputes] = useState<OwnershipDisputeRecord[]>([]);
  const [ownershipsMap, setOwnershipsMap] = useState<Record<string, VerifiedOwnershipRecord>>({});
  const [auditLogs, setAuditLogs] = useState<VerificationAuditLogRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [selectedOwnershipSlug, setSelectedOwnershipSlug] = useState<string | null>(null);

  const [reviewerNotes, setReviewerNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    let settled = 0;
    const markSettled = () => {
      settled += 1;
      if (settled >= 2) setLoadingData(false);
    };

    const unsubClaims = subscribeToAdminClaims(
      (list) => {
        setClaims(list);
        markSettled();
      },
      () => markSettled()
    );
    const unsubDisputes = subscribeToAdminDisputes(
      (list) => {
        setDisputes(list);
        markSettled();
      },
      () => markSettled()
    );
    const unsubOwnerships = subscribeToVerifiedOwnerships((map) => {
      setOwnershipsMap(map);
    });
    const unsubLogs = subscribeToAdminAuditLogs((list) => {
      setAuditLogs(list);
    });

    return () => {
      unsubClaims();
      unsubDisputes();
      unsubOwnerships();
      unsubLogs();
    };
  }, [user?.isAdmin]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    let cancelled = false;
    const loadGatewayStatus = async () => {
      setLoadingGateways(true);
      try {
        const token = await getIdToken();
        if (!token || cancelled) return;
        const res = await fetch('/api/verification/gateway-status', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (res.ok && !cancelled) {
          const data: GatewayStatusSummary = await res.json();
          setGatewayStatus(data);
        }
      } catch {
        // Non-blocking status readout
      } finally {
        if (!cancelled) setLoadingGateways(false);
      }
    };
    void loadGatewayStatus();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.isAdmin, user?.uid]);

  const ownershipsList = useMemo(
    () =>
      Object.values(ownershipsMap).sort((a, b) =>
        a.schoolName.localeCompare(b.schoolName)
      ),
    [ownershipsMap]
  );

  const pendingClaimsCount = useMemo(
    () => claims.filter((c) => c.status === 'pending_review').length,
    [claims]
  );
  const openDisputesCount = useMemo(
    () => disputes.filter((d) => d.status === 'open').length,
    [disputes]
  );

  const filteredClaims = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return claims.filter((c) => {
      if (claimStatusFilter !== 'all' && c.status !== claimStatusFilter) return false;
      if (!q) return true;
      return (
        c.schoolName.toLowerCase().includes(q) ||
        c.claimantName.toLowerCase().includes(q) ||
        c.claimantEmail.toLowerCase().includes(q) ||
        (c.dsdNumber || '').toLowerCase().includes(q) ||
        (c.npoNumber || '').toLowerCase().includes(q)
      );
    });
  }, [claims, claimStatusFilter, searchQuery]);

  const filteredDisputes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return disputes.filter((d) => {
      if (disputeStatusFilter === 'open' && d.status !== 'open') return false;
      if (!q) return true;
      return (
        d.schoolName.toLowerCase().includes(q) ||
        d.challengerName.toLowerCase().includes(q) ||
        d.challengerEmail.toLowerCase().includes(q) ||
        (d.registrationRef || '').toLowerCase().includes(q)
      );
    });
  }, [disputes, disputeStatusFilter, searchQuery]);

  const filteredOwnerships = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ownershipsList;
    return ownershipsList.filter(
      (o) =>
        o.schoolName.toLowerCase().includes(q) ||
        o.ownerDisplayName.toLowerCase().includes(q) ||
        (o.city || '').toLowerCase().includes(q)
    );
  }, [ownershipsList, searchQuery]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter(
      (l) =>
        l.schoolName.toLowerCase().includes(q) ||
        l.actorName.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
    );
  }, [auditLogs, searchQuery]);

  const activeClaim = useMemo(
    () =>
      filteredClaims.find((c) => c.claimId === selectedClaimId) ||
      filteredClaims[0] ||
      null,
    [filteredClaims, selectedClaimId]
  );

  const activeDispute = useMemo(
    () =>
      filteredDisputes.find((d) => d.disputeId === selectedDisputeId) ||
      filteredDisputes[0] ||
      null,
    [filteredDisputes, selectedDisputeId]
  );

  const activeOwnership = useMemo(
    () =>
      filteredOwnerships.find((o) => o.schoolSlug === selectedOwnershipSlug) ||
      filteredOwnerships[0] ||
      null,
    [filteredOwnerships, selectedOwnershipSlug]
  );

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle('Preschool Owner');
    } finally {
      setSigningIn(false);
    }
  };

  const handleApproveClaim = async (claim: OwnershipClaimRecord) => {
    if (!user) return;
    setActionLoading(true);
    try {
      await adminApproveManualClaim({
        claim,
        adminUid: user.uid,
        adminName: user.name,
        reviewNotes: reviewerNotes.trim() || 'Verified registration credentials and approved ownership lock.',
      });
      setReviewerNotes('');
      toast({
        title: 'Ownership Approved & Locked',
        description: `${claim.schoolName} is now locked to ${claim.claimantName}.`,
      });
    } catch {
      toast({
        title: 'Approval Failed',
        description: 'Could not approve claim. Ensure you are signed in as a verified Platform Admin.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClaim = async (claim: OwnershipClaimRecord) => {
    if (!user) return;
    const reason = reviewerNotes.trim();
    if (reason.length < 5) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please enter a brief explanation in Reviewer Notes before rejecting.',
        variant: 'destructive',
      });
      return;
    }
    setActionLoading(true);
    try {
      await adminRejectManualClaim({
        claim,
        adminUid: user.uid,
        adminName: user.name,
        reviewNotes: reason,
      });
      setReviewerNotes('');
      toast({
        title: 'Claim Rejected',
        description: `Rejection note recorded for ${claim.schoolName}.`,
      });
    } catch {
      toast({
        title: 'Action Failed',
        description: 'Unable to update claim status.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveDispute = async (
    dispute: OwnershipDisputeRecord,
    decision: 'uphold_current' | 'transfer_to_challenger' | 'revoke_lock'
  ) => {
    if (!user) return;
    const notes = reviewerNotes.trim() || `Resolved via Admin Console (${decision}).`;
    setActionLoading(true);
    try {
      await adminResolveOwnershipDispute({
        dispute,
        decision,
        adminUid: user.uid,
        adminName: user.name,
        adminNotes: notes,
      });
      setReviewerNotes('');
      toast({
        title:
          decision === 'transfer_to_challenger'
            ? 'Ownership Transferred'
            : decision === 'revoke_lock'
            ? 'Ownership Lock Revoked'
            : 'Current Owner Upheld',
        description: `Dispute ${dispute.disputeId} has been resolved and logged.`,
      });
    } catch {
      toast({
        title: 'Dispute Resolution Failed',
        description: 'Could not commit dispute decision.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeOwnership = async (ownership: VerifiedOwnershipRecord) => {
    if (!user) return;
    setActionLoading(true);
    try {
      await adminRevokeOwnershipLock({
        ownership,
        adminUid: user.uid,
        adminName: user.name,
        reason: reviewerNotes.trim() || 'Revoked by platform administrator.',
      });
      setReviewerNotes('');
      toast({
        title: 'Ownership Lock Revoked',
        description: `${ownership.schoolName} has been returned to unclaimed status.`,
      });
    } catch {
      toast({
        title: 'Revocation Failed',
        description: 'Unable to revoke ownership lock.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-20">
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Admin Verification Console
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sign in with your authorized NurseryNet administrator Google account to review pending document claims, adjudicate ownership disputes, and inspect verification audit trails.
          </p>
          <Button onClick={handleSignIn} disabled={signingIn} className="h-11 px-6 font-bold">
            {signingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
            <span>Sign in with Google</span>
          </Button>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-20">
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Administrator Access Required
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Signed in as <strong className="text-foreground">{user.email}</strong>. This verification operations queue is restricted to authorized NurseryNet administrators.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Owner Portal</Link>
            </Button>
            <Button asChild>
              <Link href="/directory">Browse Directory</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Bar Breadcrumb & Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">
              NurseryNet Operations / Verification &amp; Trust
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              Ownership Verification &amp; Disputes Queue
            </h1>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Button asChild variant="outline" size="sm" className="h-9 text-xs font-semibold whitespace-nowrap">
              <Link href="/directory">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Open Public Directory
              </Link>
            </Button>
          </div>
        </div>

        {/* 4-Column Metric Summary Strip (Tabular Numerals, Single Elevation) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Pending Document Claims</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-foreground tabular-nums">
              {pendingClaimsCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Open Ownership Disputes</span>
              <ShieldAlert className="w-4 h-4 text-destructive" />
            </div>
            <div className="text-2xl font-extrabold text-foreground tabular-nums">
              {openDisputesCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Locked Verified Profiles</span>
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-foreground tabular-nums">
              {ownershipsList.length}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Audit Trail Events</span>
              <History className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-extrabold text-foreground tabular-nums">
              {auditLogs.length}
            </div>
          </div>
        </div>

        {/* Toolbar: Segmented Tabs + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border overflow-x-auto">
            {(
              [
                { id: 'claims', label: 'Pending Claims', count: pendingClaimsCount },
                { id: 'disputes', label: 'Disputes', count: openDisputesCount },
                { id: 'registry', label: 'Verified Registry', count: ownershipsList.length },
                { id: 'audit', label: 'Audit Log', count: auditLogs.length },
                {
                  id: 'gateways',
                  label: 'Direct Gateways',
                  count: gatewayStatus
                    ? gatewayStatus.providers.filter((p) => p.configured).length
                    : 0,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setReviewerNotes('');
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono text-[11px] tabular-nums opacity-75">
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search school, principal, DSD/NPO..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* TAB 1: PENDING CLAIMS */}
        {activeTab === 'claims' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground">Ownership Claim Submissions</span>
                <div className="flex items-center gap-1 text-[11px]">
                  {(['pending_review', 'approved', 'rejected', 'all'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setClaimStatusFilter(st)}
                      className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                        claimStatusFilter === st
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {st === 'pending_review'
                        ? 'Pending'
                        : st === 'all'
                        ? 'All'
                        : st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {loadingData ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : filteredClaims.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <FileCheck2 className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                  <p className="text-sm font-bold text-foreground">All caught up</p>
                  <p className="text-xs text-muted-foreground">
                    No ownership claims match this filter right now.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredClaims.map((claim) => {
                    const isSelected = activeClaim?.claimId === claim.claimId;
                    return (
                      <button
                        key={claim.claimId}
                        type="button"
                        onClick={() => {
                          setSelectedClaimId(claim.claimId);
                          setReviewerNotes('');
                        }}
                        className={`w-full text-left px-4 py-3.5 transition-colors flex items-center justify-between gap-3 ${
                          isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-sm font-bold text-foreground truncate">
                            {claim.schoolName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {claim.claimantName} · {claim.claimantRole} ·{' '}
                            {getVerificationMethodLabel(claim.verificationMethod)}
                          </div>
                        </div>
                        <div className="text-right shrink-0 space-y-0.5">
                          <div
                            className={`text-xs font-bold ${
                              claim.status === 'approved'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : claim.status === 'rejected'
                                ? 'text-destructive'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {claim.status === 'pending_review'
                              ? 'Pending Review'
                              : claim.status === 'approved'
                              ? 'Approved'
                              : 'Rejected'}
                          </div>
                          <div className="text-[11px] text-muted-foreground tabular-nums">
                            {formatFirestoreTime(claim.createdAt)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Inspector Drawer */}
            <div className="lg:col-span-5 rounded-xl border border-border bg-card p-5 space-y-4">
              {activeClaim ? (
                <>
                  <div className="pb-3 border-b border-border space-y-1">
                    <div className="text-[11px] font-mono text-muted-foreground tabular-nums">
                      Claim ID: {activeClaim.claimId}
                    </div>
                    <h2 className="font-heading text-lg font-bold text-foreground">
                      {activeClaim.schoolName}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {activeClaim.city || 'South Africa'}
                      {activeClaim.province ? ` · ${activeClaim.province}` : ''} ·{' '}
                      {getVerificationMethodLabel(activeClaim.verificationMethod)}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Claimant</span>
                      <span className="font-semibold text-foreground">{activeClaim.claimantName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Verified Email</span>
                      <span className="font-mono text-foreground">{activeClaim.claimantEmail}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-mono tabular-nums text-foreground">
                        {activeClaim.claimantPhone || activeClaim.maskedTargetPhone || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Role</span>
                      <span className="font-semibold text-foreground">{activeClaim.claimantRole}</span>
                    </div>
                    {activeClaim.dsdNumber && (
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">DSD Cert #</span>
                        <span className="font-mono font-bold text-foreground">{activeClaim.dsdNumber}</span>
                      </div>
                    )}
                    {activeClaim.npoNumber && (
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">NPO #</span>
                        <span className="font-mono font-bold text-foreground">{activeClaim.npoNumber}</span>
                      </div>
                    )}
                    {activeClaim.cipcNumber && (
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">CIPC #</span>
                        <span className="font-mono font-bold text-foreground">{activeClaim.cipcNumber}</span>
                      </div>
                    )}
                  </div>

                  {activeClaim.proofNotes && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-foreground">Submitted Proof Notes</span>
                      <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border leading-relaxed">
                        {activeClaim.proofNotes}
                      </p>
                    </div>
                  )}

                  {activeClaim.status === 'pending_review' ? (
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div>
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Reviewer Notes (Required for Rejection)
                        </label>
                        <textarea
                          rows={2}
                          value={reviewerNotes}
                          onChange={(e) => setReviewerNotes(e.target.value)}
                          placeholder="e.g. Verified DSD registration number and confirmed principal callback."
                          className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleApproveClaim(activeClaim)}
                          className="flex-1 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          Approve &amp; Lock
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={actionLoading}
                          onClick={() => handleRejectClaim(activeClaim)}
                          className="flex-1 h-10 text-xs font-bold"
                        >
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Reject Claim
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-1">
                      <div className="font-bold text-foreground">
                        Decision: {activeClaim.status === 'approved' ? 'Approved & Locked' : 'Rejected'}
                      </div>
                      {activeClaim.reviewNotes && (
                        <p className="text-muted-foreground">{activeClaim.reviewNotes}</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  Select a claim from the list to inspect verification evidence.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: OWNERSHIP DISPUTES */}
        {activeTab === 'disputes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground">Ownership Disputes</span>
                <div className="flex items-center gap-1 text-[11px]">
                  {(['open', 'all'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setDisputeStatusFilter(st)}
                      className={`px-2 py-1 rounded-md font-semibold ${
                        disputeStatusFilter === st
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {st === 'open' ? 'Open Cases' : 'All Disputes'}
                    </button>
                  ))}
                </div>
              </div>

              {filteredDisputes.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-500/60 mx-auto" />
                  <p className="text-sm font-bold text-foreground">No active ownership disputes</p>
                  <p className="text-xs text-muted-foreground">
                    All locked preschool listings are currently undisputed.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredDisputes.map((disp) => {
                    const isSelected = activeDispute?.disputeId === disp.disputeId;
                    return (
                      <button
                        key={disp.disputeId}
                        type="button"
                        onClick={() => {
                          setSelectedDisputeId(disp.disputeId);
                          setReviewerNotes('');
                        }}
                        className={`w-full text-left px-4 py-3.5 transition-colors flex items-center justify-between gap-3 ${
                          isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-sm font-bold text-foreground truncate">
                            {disp.schoolName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            Challenger: {disp.challengerName} · {disp.challengerRole}
                          </div>
                        </div>
                        <div className="text-right shrink-0 space-y-0.5">
                          <div
                            className={`text-xs font-bold ${
                              disp.status === 'open'
                                ? 'text-destructive'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {disp.status === 'open'
                              ? 'Open Dispute'
                              : disp.status === 'resolved_transferred'
                              ? 'Transferred'
                              : disp.status === 'resolved_kept'
                              ? 'Owner Upheld'
                              : 'Dismissed'}
                          </div>
                          <div className="text-[11px] text-muted-foreground tabular-nums">
                            {formatFirestoreTime(disp.createdAt)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 rounded-xl border border-border bg-card p-5 space-y-4">
              {activeDispute ? (
                <>
                  <div className="pb-3 border-b border-border space-y-1">
                    <div className="text-[11px] font-mono text-muted-foreground tabular-nums">
                      Case ID: {activeDispute.disputeId}
                    </div>
                    <h2 className="font-heading text-lg font-bold text-foreground">
                      {activeDispute.schoolName}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Current Owner:{' '}
                      <strong className="text-foreground">
                        {ownershipsMap[activeDispute.schoolSlug]?.ownerDisplayName ||
                          activeDispute.currentOwnerUid}
                      </strong>
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Challenger</span>
                      <span className="font-semibold text-foreground">{activeDispute.challengerName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-mono text-foreground">{activeDispute.challengerEmail}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-mono tabular-nums text-foreground">
                        {activeDispute.challengerPhone}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">DSD / NPO / CIPC Ref</span>
                      <span className="font-mono font-bold text-foreground">
                        {activeDispute.registrationRef || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground">Dispute Statement</span>
                    <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border leading-relaxed">
                      {activeDispute.reason}
                    </p>
                  </div>

                  {activeDispute.status === 'open' ? (
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div>
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Adjudication Notes
                        </label>
                        <textarea
                          rows={2}
                          value={reviewerNotes}
                          onChange={(e) => setReviewerNotes(e.target.value)}
                          placeholder="Record how you verified the rightful owner..."
                          className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleResolveDispute(activeDispute, 'transfer_to_challenger')}
                          className="w-full h-10 text-xs font-bold bg-primary text-primary-foreground"
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-1.5" />
                          Transfer Ownership to Challenger
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={actionLoading}
                            onClick={() => handleResolveDispute(activeDispute, 'uphold_current')}
                            className="h-9 text-xs font-bold"
                          >
                            Uphold Current Owner
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={actionLoading}
                            onClick={() => handleResolveDispute(activeDispute, 'revoke_lock')}
                            className="h-9 text-xs font-bold"
                          >
                            Revoke Lock
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-1">
                      <div className="font-bold text-foreground">Status: {activeDispute.status}</div>
                      {activeDispute.adminNotes && (
                        <p className="text-muted-foreground">{activeDispute.adminNotes}</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  Select a dispute case to inspect both parties and adjudicate ownership.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: VERIFIED OWNERSHIP REGISTRY */}
        {activeTab === 'registry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border text-xs font-bold text-foreground">
                Active Verified &amp; Locked Preschool Profiles ({filteredOwnerships.length})
              </div>
              {filteredOwnerships.length === 0 ? (
                <div className="p-10 text-center text-xs text-muted-foreground">
                  No verified preschool ownership locks recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredOwnerships.map((item) => (
                    <button
                      key={item.schoolSlug}
                      type="button"
                      onClick={() => setSelectedOwnershipSlug(item.schoolSlug)}
                      className={`w-full text-left px-4 py-3.5 transition-colors flex items-center justify-between gap-3 ${
                        activeOwnership?.schoolSlug === item.schoolSlug
                          ? 'bg-primary/5'
                          : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-sm font-bold text-foreground truncate">
                          {item.schoolName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          Owner: {item.ownerDisplayName} ({item.ownerRole}) ·{' '}
                          {getVerificationMethodLabel(item.verificationMethod)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Locked
                        </div>
                        <div className="text-[11px] text-muted-foreground tabular-nums">
                          {formatFirestoreTime(item.verifiedAt)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 rounded-xl border border-border bg-card p-5 space-y-4">
              {activeOwnership ? (
                <>
                  <div className="pb-3 border-b border-border space-y-1">
                    <h2 className="font-heading text-lg font-bold text-foreground">
                      {activeOwnership.schoolName}
                    </h2>
                    <p className="text-xs text-muted-foreground font-mono">
                      Slug: {activeOwnership.schoolSlug}
                    </p>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Verified Owner</span>
                      <span className="font-semibold text-foreground">{activeOwnership.ownerDisplayName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-semibold text-foreground">
                        {getVerificationMethodLabel(activeOwnership.verificationMethod)}
                      </span>
                    </div>
                    {activeOwnership.verifiedDomain && (
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Verified Domain</span>
                        <span className="font-mono text-foreground">@{activeOwnership.verifiedDomain}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Verified At</span>
                      <span className="tabular-nums text-foreground">
                        {formatFirestoreTime(activeOwnership.verifiedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border space-y-2">
                    <input
                      type="text"
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      placeholder="Reason for revoking lock (optional)"
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={actionLoading}
                      onClick={() => handleRevokeOwnership(activeOwnership)}
                      className="w-full h-9 text-xs font-bold"
                    >
                      <Unlock className="w-3.5 h-3.5 mr-1.5" />
                      Revoke Ownership Lock
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  Select a verified school to view lock details.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: IMMUTABLE AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border text-xs font-bold text-foreground">
              Append-Only Verification Audit Log ({filteredLogs.length})
            </div>
            {filteredLogs.length === 0 ? (
              <div className="p-10 text-center text-xs text-muted-foreground">
                No audit events logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                      <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                      <th className="py-2.5 px-4 font-semibold">Action</th>
                      <th className="py-2.5 px-4 font-semibold">Preschool</th>
                      <th className="py-2.5 px-4 font-semibold">Actor</th>
                      <th className="py-2.5 px-4 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredLogs.map((log) => (
                      <tr key={log.logId} className="hover:bg-muted/20">
                        <td className="py-2.5 px-4 font-mono text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                          {formatFirestoreTime(log.createdAt)}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-foreground whitespace-nowrap">
                          {log.action.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-foreground whitespace-nowrap">
                          {log.schoolName}
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                          {log.actorName}
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground max-w-md">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DIRECT MESSAGING GATEWAYS (READ-ONLY STATUS) */}
        {activeTab === 'gateways' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Radio className="w-4 h-4 text-primary" />
                  <span>Direct WhatsApp, SMS &amp; Email Integration Status</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  NurseryNet connects directly to Meta WhatsApp Cloud API, Twilio, Clickatell South Africa, and Resend. Add your chosen provider&apos;s secret keys in <strong>Settings &rarr; Secrets</strong> and they activate automatically.
                </p>
              </div>
              <div className="shrink-0">
                {gatewayStatus?.livePhoneDeliveryConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Live OTP Active ({gatewayStatus.activePhoneProvider.replace(/_/g, ' ')})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    Sandbox Preview Mode (Add any provider below to go live)
                  </span>
                )}
              </div>
            </div>

            {loadingGateways ? (
              <div className="p-10 rounded-xl border border-border bg-card text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking server environment configuration...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(gatewayStatus?.providers || []).map((provider) => (
                  <div
                    key={provider.id}
                    className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-muted/60 text-foreground">
                            {provider.channel === 'email' ? (
                              <Mail className="w-4 h-4" />
                            ) : (
                              <MessageSquare className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">
                              {provider.label}
                            </div>
                            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                              Direct {provider.channel}
                            </div>
                          </div>
                        </div>
                        {provider.configured ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                            Connected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] font-semibold text-muted-foreground">
                            Not configured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {provider.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border space-y-1.5 text-[11px]">
                      <div className="font-semibold text-foreground">
                        Required secrets (Settings &rarr; Secrets):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {provider.requiredSecrets.map((secretName) => (
                          <code
                            key={secretName}
                            className="px-2 py-0.5 rounded bg-muted/70 border border-border font-mono text-[11px] text-foreground"
                          >
                            {secretName}
                          </code>
                        ))}
                      </div>
                      {provider.optionalSecrets && provider.optionalSecrets.length > 0 && (
                        <div className="text-muted-foreground pt-0.5">
                          Optional:{' '}
                          {provider.optionalSecrets.map((opt, idx) => (
                            <span key={opt}>
                              <code className="font-mono text-[10px]">{opt}</code>
                              {idx < provider.optionalSecrets!.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
