/**
 * Payload-First Security Test Specification for NurseryNet Firestore Rules.
 * Verifies all 12 adversarial payloads ("Dirty Dozen") against the Eight Pillars.
 */

export interface AdversarialTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  actor: {
    uid: string | null;
    email?: string;
    email_verified?: boolean;
  };
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
  enforcedBy: string;
}

export const DIRTY_DOZEN_TESTS: AdversarialTestCase[] = [
  {
    id: 1,
    name: 'Self-Promote to Admin on User Creation',
    operation: 'create',
    path: '/users/attacker_1',
    actor: { uid: 'attacker_1', email: 'attacker@example.com', email_verified: true },
    payload: { uid: 'attacker_1', name: 'Attacker', email: 'attacker@example.com', role: 'Admin' },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isValidUserProfile restricts role to Parent | Preschool Owner | Job Seeker',
  },
  {
    id: 2,
    name: 'Shadow Field Injection on User Update',
    operation: 'update',
    path: '/users/user_1',
    actor: { uid: 'user_1', email: 'u1@example.com', email_verified: true },
    payload: { isAdmin: true },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'affectedKeys().hasOnly() + data.keys().hasOnly() blocks shadow fields',
  },
  {
    id: 3,
    name: 'Unverified Email Admin Spoof',
    operation: 'list',
    path: '/ownership_claims',
    actor: { uid: 'spoof_1', email: 'Somacebomedia@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isAdmin() strictly mandates request.auth.token.email_verified == true',
  },
  {
    id: 4,
    name: 'Unauthenticated Claim Submission',
    operation: 'create',
    path: '/ownership_claims/claim_anon',
    actor: { uid: null },
    payload: { claimId: 'claim_anon', schoolSlug: 'school-1', status: 'pending_review' },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isVerifiedUser() requires non-null auth + email_verified',
  },
  {
    id: 5,
    name: 'Self-Approved Manual Document Claim',
    operation: 'create',
    path: '/ownership_claims/claim_forged',
    actor: { uid: 'attacker_1', email: 'a@gmail.com', email_verified: true },
    payload: {
      claimId: 'claim_forged',
      schoolSlug: 'school-1',
      claimantUid: 'attacker_1',
      verificationMethod: 'admin_document_review',
      status: 'approved',
    },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'admin_document_review creation mandates status == pending_review',
  },
  {
    id: 6,
    name: 'Hijack Already-Locked Preschool Profile',
    operation: 'update',
    path: '/verified_ownerships/little-ashford',
    actor: { uid: 'attacker_2', email: 'evil@school.co.za', email_verified: true },
    payload: { ownerUid: 'attacker_2', monthlyFeeZAR: 10 },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'verified_ownerships update requires existing().ownerUid == request.auth.uid and immutable ownerUid',
  },
  {
    id: 7,
    name: 'Webmail Domain Match Auto-Verify Spoof',
    operation: 'create',
    path: '/verified_ownerships/school-b',
    actor: { uid: 'attacker_3', email: 'fake@gmail.com', email_verified: true },
    payload: {
      schoolSlug: 'school-b',
      ownerUid: 'attacker_3',
      verificationMethod: 'domain_match',
      verifiedDomain: 'gmail.com',
    },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isNonWebmailDomain() explicitly rejects gmail.com and consumer webmail domains',
  },
  {
    id: 8,
    name: 'Owner Tampering With Immutable Verification Metadata',
    operation: 'update',
    path: '/verified_ownerships/little-ashford',
    actor: { uid: 'owner_1', email: 'principal@littleashford.co.za', email_verified: true },
    payload: { lockStatus: 'locked', activeDisputeId: '' },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'Owner update affectedKeys().hasOnly() excludes lockStatus, activeDisputeId, and ownerUid',
  },
  {
    id: 9,
    name: 'Orphaned Dispute on Unclaimed School',
    operation: 'create',
    path: '/ownership_disputes/disp_orphan',
    actor: { uid: 'user_2', email: 'u2@example.com', email_verified: true },
    payload: { disputeId: 'disp_orphan', schoolSlug: 'unclaimed-school-xyz', status: 'open' },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'exists(/verified_ownerships/$(schoolSlug)) global consistency check',
  },
  {
    id: 10,
    name: 'Cross-Tenant Funding Workspace Overwrite',
    operation: 'update',
    path: '/funding_workspaces/owner_1',
    actor: { uid: 'attacker_2', email: 'attacker2@school.co.za', email_verified: true },
    payload: {
      uid: 'owner_1',
      schoolName: 'Hijacked Funding OS',
      estimatedPipelineZAR: 0,
    },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'funding_workspaces update requires isOwner(userId) and incoming().uid == existing().uid',
  },
  {
    id: 11,
    name: 'Blanket Query Scraping on Grant Proposals',
    operation: 'list',
    path: '/grant_proposals',
    actor: { uid: 'random_user', email: 'r@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'allow list requires isAdmin() || resource.data.ownerUid == request.auth.uid',
  },
  {
    id: 12,
    name: 'Audit Log Deletion & Invalid ID Poisoning',
    operation: 'delete',
    path: '/verification_audit_logs/../../poisoned_id',
    actor: { uid: 'attacker_1', email: 'a@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'verification_audit_logs denies all update/delete + isValidId() blocks traversal chars',
  },
];
