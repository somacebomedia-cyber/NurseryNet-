import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import {
  ClaimStatus,
  DisputeStatus,
  OwnershipLockStatus,
  sanitizeFirestoreId,
  truncateString,
  VerificationMethod,
} from '@/lib/ownership-verification';

export interface VerifiedOwnershipRecord {
  schoolSlug: string;
  schoolName: string;
  ownerUid: string;
  ownerDisplayName: string;
  ownerRole: string;
  verificationMethod: VerificationMethod;
  verifiedDomain?: string;
  sourceClaimId: string;
  verificationProofHash?: string;
  lockStatus: OwnershipLockStatus;
  activeDisputeId?: string;
  city?: string;
  province?: string;
  address?: string;
  monthlyFeeZAR?: number;
  operatingHours?: string;
  curriculum?: string;
  websiteUrl?: string;
  npoNumber?: string;
  publicContactPhone?: string;
  publicContactEmail?: string;
  images?: string[];
  verifiedAt?: Timestamp | string | null;
  updatedAt?: Timestamp | string | null;
}

export interface OwnershipClaimRecord {
  claimId: string;
  schoolSlug: string;
  schoolName: string;
  city?: string;
  province?: string;
  claimantUid: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  claimantRole: string;
  verificationMethod: VerificationMethod;
  status: ClaimStatus;
  dsdNumber?: string;
  npoNumber?: string;
  cipcNumber?: string;
  proofNotes?: string;
  verifiedDomain?: string;
  maskedTargetPhone?: string;
  verificationProofHash?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  createdAt?: Timestamp | string | null;
  updatedAt?: Timestamp | string | null;
}

export interface OwnershipDisputeRecord {
  disputeId: string;
  schoolSlug: string;
  schoolName: string;
  currentOwnerUid: string;
  challengerUid: string;
  challengerName: string;
  challengerEmail: string;
  challengerPhone: string;
  challengerRole: string;
  reason: string;
  registrationRef?: string;
  status: DisputeStatus;
  adminNotes?: string;
  resolvedBy?: string;
  createdAt?: Timestamp | string | null;
  updatedAt?: Timestamp | string | null;
}

export interface VerificationAuditLogRecord {
  logId: string;
  schoolSlug: string;
  schoolName: string;
  action:
    | 'claim_submitted'
    | 'claim_auto_verified'
    | 'claim_approved'
    | 'claim_rejected'
    | 'dispute_opened'
    | 'dispute_upheld'
    | 'ownership_transferred'
    | 'ownership_revoked';
  actorUid: string;
  actorName: string;
  details: string;
  createdAt?: Timestamp | string | null;
}

function makeUniqueId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 9);
  return sanitizeFirestoreId(`${prefix}_${Date.now()}_${rand}`);
}

export function subscribeToVerifiedOwnerships(
  onUpdate: (records: Record<string, VerifiedOwnershipRecord>) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'verified_ownerships';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const map: Record<string, VerifiedOwnershipRecord> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as VerifiedOwnershipRecord;
        map[docSnap.id] = { ...data, schoolSlug: docSnap.id };
      });
      onUpdate(map);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export function subscribeToUserClaims(
  uid: string,
  onUpdate: (claims: OwnershipClaimRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'ownership_claims';
  const q = query(collection(db, path), where('claimantUid', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: OwnershipClaimRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as OwnershipClaimRecord);
      });
      list.sort((a, b) => getTimeMs(b.createdAt) - getTimeMs(a.createdAt));
      onUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export function subscribeToUserDisputes(
  uid: string,
  onUpdate: (disputes: OwnershipDisputeRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'ownership_disputes';
  const q = query(collection(db, path), where('challengerUid', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: OwnershipDisputeRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as OwnershipDisputeRecord);
      });
      list.sort((a, b) => getTimeMs(b.createdAt) - getTimeMs(a.createdAt));
      onUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export function subscribeToAdminClaims(
  onUpdate: (claims: OwnershipClaimRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'ownership_claims';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: OwnershipClaimRecord[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as OwnershipClaimRecord));
      list.sort((a, b) => getTimeMs(b.createdAt) - getTimeMs(a.createdAt));
      onUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export function subscribeToAdminDisputes(
  onUpdate: (disputes: OwnershipDisputeRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'ownership_disputes';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: OwnershipDisputeRecord[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as OwnershipDisputeRecord));
      list.sort((a, b) => getTimeMs(b.createdAt) - getTimeMs(a.createdAt));
      onUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export function subscribeToAdminAuditLogs(
  onUpdate: (logs: VerificationAuditLogRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'verification_audit_logs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: VerificationAuditLogRecord[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as VerificationAuditLogRecord));
      list.sort((a, b) => getTimeMs(b.createdAt) - getTimeMs(a.createdAt));
      onUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export function getTimeMs(ts: Timestamp | string | null | undefined): number {
  if (!ts) return 0;
  if (typeof ts === 'string') return Date.parse(ts) || 0;
  if (typeof (ts as Timestamp).toMillis === 'function') {
    return (ts as Timestamp).toMillis();
  }
  return 0;
}

export function formatFirestoreTime(ts: Timestamp | string | null | undefined): string {
  const ms = getTimeMs(ts);
  if (!ms) return 'Just now';
  return new Date(ms).toLocaleString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Atomically records an instant-verified ownership claim (Domain Match or Listed Phone OTP),
 * creates the locked VerifiedOwnership record, and appends an immutable audit log entry.
 */
export async function completeInstantVerifiedClaim(params: {
  schoolSlug: string;
  schoolName: string;
  city?: string;
  province?: string;
  address?: string;
  monthlyFeeZAR?: number;
  operatingHours?: string;
  curriculum?: string;
  websiteUrl?: string;
  npoNumber?: string;
  publicContactPhone?: string;
  publicContactEmail?: string;
  images?: string[];
  claimantUid: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  claimantRole: string;
  verificationMethod: 'domain_match' | 'phone_otp';
  verifiedDomain?: string;
  maskedTargetPhone?: string;
  verificationProofHash: string;
}): Promise<{ claimId: string; schoolSlug: string }> {
  const cleanSlug = sanitizeFirestoreId(params.schoolSlug);
  const claimId = makeUniqueId('claim');
  const logId = makeUniqueId('log');
  const now = serverTimestamp();

  const claimDoc: Record<string, unknown> = {
    claimId,
    schoolSlug: cleanSlug,
    schoolName: truncateString(params.schoolName, 160),
    city: truncateString(params.city, 100),
    province: truncateString(params.province, 80),
    claimantUid: sanitizeFirestoreId(params.claimantUid),
    claimantName: truncateString(params.claimantName, 120),
    claimantEmail: truncateString(params.claimantEmail, 200),
    claimantPhone: truncateString(params.claimantPhone, 32),
    claimantRole: truncateString(params.claimantRole, 80),
    verificationMethod: params.verificationMethod,
    status: 'approved',
    verificationProofHash: params.verificationProofHash.slice(0, 64),
    createdAt: now,
    updatedAt: now,
  };
  if (params.verifiedDomain) {
    claimDoc.verifiedDomain = truncateString(params.verifiedDomain, 160);
  }
  if (params.maskedTargetPhone) {
    claimDoc.maskedTargetPhone = truncateString(params.maskedTargetPhone, 40);
  }

  const sanitizedImages = Array.isArray(params.images)
    ? params.images.filter((u) => typeof u === 'string' && u.length <= 500).slice(0, 4)
    : [];

  const ownershipDoc: Record<string, unknown> = {
    schoolSlug: cleanSlug,
    schoolName: truncateString(params.schoolName, 160),
    ownerUid: sanitizeFirestoreId(params.claimantUid),
    ownerDisplayName: truncateString(params.claimantName, 120),
    ownerRole: truncateString(params.claimantRole, 80),
    verificationMethod: params.verificationMethod,
    sourceClaimId: claimId,
    verificationProofHash: params.verificationProofHash.slice(0, 64),
    lockStatus: 'locked',
    city: truncateString(params.city, 100),
    province: truncateString(params.province, 80),
    address: truncateString(params.address, 240),
    monthlyFeeZAR: Math.min(50000, Math.max(0, Number(params.monthlyFeeZAR) || 950)),
    operatingHours: truncateString(params.operatingHours || '07:00 – 17:00', 80),
    curriculum: truncateString(params.curriculum || 'Play-Based', 80),
    websiteUrl: truncateString(params.websiteUrl, 300),
    npoNumber: truncateString(params.npoNumber, 64),
    publicContactPhone: truncateString(params.publicContactPhone, 32),
    publicContactEmail: truncateString(params.publicContactEmail, 200),
    images: sanitizedImages,
    verifiedAt: now,
    updatedAt: now,
  };
  if (params.verifiedDomain) {
    ownershipDoc.verifiedDomain = truncateString(params.verifiedDomain, 160);
  }

  const auditDoc = {
    logId,
    schoolSlug: cleanSlug,
    schoolName: truncateString(params.schoolName, 160),
    action: 'claim_auto_verified',
    actorUid: sanitizeFirestoreId(params.claimantUid),
    actorName: truncateString(params.claimantName, 120),
    details: truncateString(
      params.verificationMethod === 'domain_match'
        ? `Auto-verified via official school domain (@${params.verifiedDomain}) and locked to owner.`
        : `Auto-verified via 6-digit OTP to listed phone (${params.maskedTargetPhone}) and locked to owner.`,
      600
    ),
    createdAt: now,
  };

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'ownership_claims', claimId), claimDoc);
    batch.set(doc(db, 'verified_ownerships', cleanSlug), ownershipDoc);
    batch.set(doc(db, 'verification_audit_logs', logId), auditDoc);
    await batch.commit();
    return { claimId, schoolSlug: cleanSlug };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `verified_ownerships/${cleanSlug}`);
  }
}

/**
 * Submits a manual document-review claim into the Admin Verification Queue.
 * Does NOT create or alter the public VerifiedOwnership record until an Admin approves it.
 */
export async function submitManualDocumentClaim(params: {
  schoolSlug: string;
  schoolName: string;
  city?: string;
  province?: string;
  claimantUid: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  claimantRole: string;
  dsdNumber?: string;
  npoNumber?: string;
  cipcNumber?: string;
  proofNotes: string;
}): Promise<{ claimId: string }> {
  const cleanSlug = sanitizeFirestoreId(params.schoolSlug);
  const claimId = makeUniqueId('claim');
  const logId = makeUniqueId('log');
  const now = serverTimestamp();

  const claimDoc = {
    claimId,
    schoolSlug: cleanSlug,
    schoolName: truncateString(params.schoolName, 160),
    city: truncateString(params.city, 100),
    province: truncateString(params.province, 80),
    claimantUid: sanitizeFirestoreId(params.claimantUid),
    claimantName: truncateString(params.claimantName, 120),
    claimantEmail: truncateString(params.claimantEmail, 200),
    claimantPhone: truncateString(params.claimantPhone, 32),
    claimantRole: truncateString(params.claimantRole, 80),
    verificationMethod: 'admin_document_review' as const,
    status: 'pending_review' as const,
    dsdNumber: truncateString(params.dsdNumber, 80),
    npoNumber: truncateString(params.npoNumber, 80),
    cipcNumber: truncateString(params.cipcNumber, 80),
    proofNotes: truncateString(params.proofNotes, 1500),
    createdAt: now,
    updatedAt: now,
  };

  const auditDoc = {
    logId,
    schoolSlug: cleanSlug,
    schoolName: truncateString(params.schoolName, 160),
    action: 'claim_submitted',
    actorUid: sanitizeFirestoreId(params.claimantUid),
    actorName: truncateString(params.claimantName, 120),
    details: truncateString(
      `Manual registration document claim submitted for Admin review (${
        params.dsdNumber ? `DSD: ${params.dsdNumber}` : params.npoNumber ? `NPO: ${params.npoNumber}` : 'Evidence notes provided'
      }).`,
      600
    ),
    createdAt: now,
  };

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'ownership_claims', claimId), claimDoc);
    batch.set(doc(db, 'verification_audit_logs', logId), auditDoc);
    await batch.commit();
    return { claimId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `ownership_claims/${claimId}`);
  }
}

/**
 * Updates public directory details for an already-verified preschool.
 * Enforced by Firestore rules so ONLY the locked ownerUid or a Platform Admin can succeed.
 */
export async function updateVerifiedOwnedListing(params: {
  schoolSlug: string;
  schoolName: string;
  ownerDisplayName: string;
  ownerRole: string;
  city?: string;
  province?: string;
  address?: string;
  monthlyFeeZAR?: number;
  operatingHours?: string;
  curriculum?: string;
  websiteUrl?: string;
  npoNumber?: string;
  publicContactPhone?: string;
  publicContactEmail?: string;
  images?: string[];
}): Promise<void> {
  const cleanSlug = sanitizeFirestoreId(params.schoolSlug);
  const path = `verified_ownerships/${cleanSlug}`;
  const sanitizedImages = Array.isArray(params.images)
    ? params.images.filter((u) => typeof u === 'string' && u.length <= 500).slice(0, 4)
    : [];

  try {
    await updateDoc(doc(db, 'verified_ownerships', cleanSlug), {
      schoolName: truncateString(params.schoolName, 160),
      ownerDisplayName: truncateString(params.ownerDisplayName, 120),
      ownerRole: truncateString(params.ownerRole, 80),
      city: truncateString(params.city, 100),
      province: truncateString(params.province, 80),
      address: truncateString(params.address, 240),
      monthlyFeeZAR: Math.min(50000, Math.max(0, Number(params.monthlyFeeZAR) || 950)),
      operatingHours: truncateString(params.operatingHours || '07:00 – 17:00', 80),
      curriculum: truncateString(params.curriculum || 'Play-Based', 80),
      websiteUrl: truncateString(params.websiteUrl, 300),
      npoNumber: truncateString(params.npoNumber, 64),
      publicContactPhone: truncateString(params.publicContactPhone, 32),
      publicContactEmail: truncateString(params.publicContactEmail, 200),
      images: sanitizedImages,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Submits a formal Ownership Dispute against a locked preschool listing.
 */
export async function submitOwnershipDispute(params: {
  schoolSlug: string;
  schoolName: string;
  currentOwnerUid: string;
  challengerUid: string;
  challengerName: string;
  challengerEmail: string;
  challengerPhone: string;
  challengerRole: string;
  reason: string;
  registrationRef?: string;
}): Promise<{ disputeId: string }> {
  const cleanSlug = sanitizeFirestoreId(params.schoolSlug);
  const disputeId = makeUniqueId('dispute');
  const logId = makeUniqueId('log');
  const now = serverTimestamp();

  const disputeDoc = {
    disputeId,
    schoolSlug: cleanSlug,
    schoolName: truncateString(params.schoolName, 160),
    currentOwnerUid: sanitizeFirestoreId(params.currentOwnerUid),
    challengerUid: sanitizeFirestoreId(params.challengerUid),
    challengerName: truncateString(params.challengerName, 120),
    challengerEmail: truncateString(params.challengerEmail, 200),
    challengerPhone: truncateString(params.challengerPhone, 32),
    challengerRole: truncateString(params.challengerRole, 80),
    reason: truncateString(params.reason, 1500),
    registrationRef: truncateString(params.registrationRef, 120),
    status: 'open' as const,
    createdAt: now,
    updatedAt: now,
  };

  const auditDoc = {
    logId,
    schoolSlug: cleanSlug,
    schoolName: truncateString(params.schoolName, 160),
    action: 'dispute_opened',
    actorUid: sanitizeFirestoreId(params.challengerUid),
    actorName: truncateString(params.challengerName, 120),
    details: truncateString(
      `Formal ownership dispute opened by ${params.challengerName} (${params.challengerRole}). Ref: ${
        params.registrationRef || 'N/A'
      }.`,
      600
    ),
    createdAt: now,
  };

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'ownership_disputes', disputeId), disputeDoc);
    batch.set(doc(db, 'verification_audit_logs', logId), auditDoc);
    await batch.commit();
    return { disputeId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `ownership_disputes/${disputeId}`);
  }
}

/**
 * Admin Action: Approve a pending manual document claim and lock ownership to the claimant.
 */
export async function adminApproveManualClaim(params: {
  claim: OwnershipClaimRecord;
  adminUid: string;
  adminName: string;
  reviewNotes?: string;
}): Promise<void> {
  const cleanSlug = sanitizeFirestoreId(params.claim.schoolSlug);
  const logId = makeUniqueId('log');
  const now = serverTimestamp();

  const ownershipDoc = {
    schoolSlug: cleanSlug,
    schoolName: truncateString(params.claim.schoolName, 160),
    ownerUid: sanitizeFirestoreId(params.claim.claimantUid),
    ownerDisplayName: truncateString(params.claim.claimantName, 120),
    ownerRole: truncateString(params.claim.claimantRole, 80),
    verificationMethod: 'admin_document_review' as const,
    sourceClaimId: sanitizeFirestoreId(params.claim.claimId),
    lockStatus: 'locked' as const,
    city: truncateString(params.claim.city, 100),
    province: truncateString(params.claim.province, 80),
    npoNumber: truncateString(params.claim.npoNumber, 64),
    publicContactPhone: truncateString(params.claim.claimantPhone, 32),
    publicContactEmail: truncateString(params.claim.claimantEmail, 200),
    verifiedAt: now,
    updatedAt: now,
  };

  const auditDoc = {
    logId,
    schoolSlug: cleanSlug,
    schoolName: truncateString(params.claim.schoolName, 160),
    action: 'claim_approved',
    actorUid: sanitizeFirestoreId(params.adminUid),
    actorName: truncateString(params.adminName, 120),
    details: truncateString(
      `Admin approved manual document claim for ${params.claim.claimantName}. ${
        params.reviewNotes ? `Notes: ${params.reviewNotes}` : ''
      }`,
      600
    ),
    createdAt: now,
  };

  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'ownership_claims', params.claim.claimId), {
      status: 'approved',
      reviewNotes: truncateString(params.reviewNotes || 'Approved by NurseryNet Verification Team.', 1000),
      reviewedBy: sanitizeFirestoreId(params.adminUid),
      updatedAt: now,
    });
    batch.set(doc(db, 'verified_ownerships', cleanSlug), ownershipDoc);
    batch.set(doc(db, 'verification_audit_logs', logId), auditDoc);
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `ownership_claims/${params.claim.claimId}`);
  }
}

/**
 * Admin Action: Reject a pending manual document claim with an explicit reason.
 */
export async function adminRejectManualClaim(params: {
  claim: OwnershipClaimRecord;
  adminUid: string;
  adminName: string;
  reviewNotes: string;
}): Promise<void> {
  const cleanSlug = sanitizeFirestoreId(params.claim.schoolSlug);
  const logId = makeUniqueId('log');
  const now = serverTimestamp();

  const auditDoc = {
    logId,
    schoolSlug: cleanSlug,
    schoolName: truncateString(params.claim.schoolName, 160),
    action: 'claim_rejected',
    actorUid: sanitizeFirestoreId(params.adminUid),
    actorName: truncateString(params.adminName, 120),
    details: truncateString(
      `Admin rejected claim by ${params.claim.claimantName}. Reason: ${params.reviewNotes}`,
      600
    ),
    createdAt: now,
  };

  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'ownership_claims', params.claim.claimId), {
      status: 'rejected',
      reviewNotes: truncateString(params.reviewNotes, 1000),
      reviewedBy: sanitizeFirestoreId(params.adminUid),
      updatedAt: now,
    });
    batch.set(doc(db, 'verification_audit_logs', logId), auditDoc);
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `ownership_claims/${params.claim.claimId}`);
  }
}

/**
 * Admin Action: Resolve an ownership dispute — either upholding the current owner,
 * transferring ownership cleanly to the challenger, or revoking the lock altogether.
 */
export async function adminResolveOwnershipDispute(params: {
  dispute: OwnershipDisputeRecord;
  decision: 'uphold_current' | 'transfer_to_challenger' | 'revoke_lock';
  adminUid: string;
  adminName: string;
  adminNotes: string;
}): Promise<void> {
  const cleanSlug = sanitizeFirestoreId(params.dispute.schoolSlug);
  const logId = makeUniqueId('log');
  const now = serverTimestamp();

  try {
    const batch = writeBatch(db);

    if (params.decision === 'uphold_current') {
      batch.update(doc(db, 'ownership_disputes', params.dispute.disputeId), {
        status: 'resolved_kept',
        adminNotes: truncateString(params.adminNotes, 1000),
        resolvedBy: sanitizeFirestoreId(params.adminUid),
        updatedAt: now,
      });
      batch.update(doc(db, 'verified_ownerships', cleanSlug), {
        lockStatus: 'locked',
        activeDisputeId: '',
        updatedAt: now,
      });
      batch.set(doc(db, 'verification_audit_logs', logId), {
        logId,
        schoolSlug: cleanSlug,
        schoolName: truncateString(params.dispute.schoolName, 160),
        action: 'dispute_upheld',
        actorUid: sanitizeFirestoreId(params.adminUid),
        actorName: truncateString(params.adminName, 120),
        details: truncateString(
          `Admin upheld existing verified owner against dispute ${params.dispute.disputeId}. Notes: ${params.adminNotes}`,
          600
        ),
        createdAt: now,
      });
    } else if (params.decision === 'transfer_to_challenger') {
      batch.update(doc(db, 'ownership_disputes', params.dispute.disputeId), {
        status: 'resolved_transferred',
        adminNotes: truncateString(params.adminNotes, 1000),
        resolvedBy: sanitizeFirestoreId(params.adminUid),
        updatedAt: now,
      });
      batch.update(doc(db, 'verified_ownerships', cleanSlug), {
        ownerUid: sanitizeFirestoreId(params.dispute.challengerUid),
        ownerDisplayName: truncateString(params.dispute.challengerName, 120),
        ownerRole: truncateString(params.dispute.challengerRole, 80),
        verificationMethod: 'admin_document_review',
        lockStatus: 'locked',
        activeDisputeId: '',
        publicContactPhone: truncateString(params.dispute.challengerPhone, 32),
        publicContactEmail: truncateString(params.dispute.challengerEmail, 200),
        updatedAt: now,
      });
      batch.set(doc(db, 'verification_audit_logs', logId), {
        logId,
        schoolSlug: cleanSlug,
        schoolName: truncateString(params.dispute.schoolName, 160),
        action: 'ownership_transferred',
        actorUid: sanitizeFirestoreId(params.adminUid),
        actorName: truncateString(params.adminName, 120),
        details: truncateString(
          `Admin transferred locked ownership to ${params.dispute.challengerName} (${params.dispute.challengerRole}). Notes: ${params.adminNotes}`,
          600
        ),
        createdAt: now,
      });
    } else {
      batch.update(doc(db, 'ownership_disputes', params.dispute.disputeId), {
        status: 'dismissed',
        adminNotes: truncateString(params.adminNotes, 1000),
        resolvedBy: sanitizeFirestoreId(params.adminUid),
        updatedAt: now,
      });
      batch.delete(doc(db, 'verified_ownerships', cleanSlug));
      batch.set(doc(db, 'verification_audit_logs', logId), {
        logId,
        schoolSlug: cleanSlug,
        schoolName: truncateString(params.dispute.schoolName, 160),
        action: 'ownership_revoked',
        actorUid: sanitizeFirestoreId(params.adminUid),
        actorName: truncateString(params.adminName, 120),
        details: truncateString(
          `Admin revoked ownership lock and returned listing to unclaimed state. Notes: ${params.adminNotes}`,
          600
        ),
        createdAt: now,
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `ownership_disputes/${params.dispute.disputeId}`);
  }
}

/**
 * Admin Action: Revoke an existing verified ownership lock directly from the Verified Registry.
 */
export async function adminRevokeOwnershipLock(params: {
  ownership: VerifiedOwnershipRecord;
  adminUid: string;
  adminName: string;
  reason: string;
}): Promise<void> {
  const cleanSlug = sanitizeFirestoreId(params.ownership.schoolSlug);
  const logId = makeUniqueId('log');
  const now = serverTimestamp();

  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'verified_ownerships', cleanSlug));
    batch.set(doc(db, 'verification_audit_logs', logId), {
      logId,
      schoolSlug: cleanSlug,
      schoolName: truncateString(params.ownership.schoolName, 160),
      action: 'ownership_revoked',
      actorUid: sanitizeFirestoreId(params.adminUid),
      actorName: truncateString(params.adminName, 120),
      details: truncateString(
        `Admin revoked ownership lock previously held by ${params.ownership.ownerDisplayName}. Reason: ${params.reason}`,
        600
      ),
      createdAt: now,
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `verified_ownerships/${cleanSlug}`);
  }
}
