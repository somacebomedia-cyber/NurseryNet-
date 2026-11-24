# Security Specification & Payload-First TDD (`security_spec.md`)

## 1. Data Invariants
1. **Identity Integrity**: Every user-authored claim (`claimantUid`), dispute (`challengerUid`), verified ownership (`ownerUid`), audit log (`actorUid`), funding workspace (`uid`), and grant proposal draft (`ownerUid`) must match `request.auth.uid` with `request.auth.token.email_verified == true`.
2. **Anti-Hijack Ownership Lock**: Once `/verified_ownerships/{schoolSlug}` exists, no non-admin user other than `existing().ownerUid` may update it, and even the owner cannot mutate `ownerUid`, `verificationMethod`, `sourceClaimId`, or `verifiedAt`.
3. **No Self-Approval of Manual Claims**: A non-admin user creating an `/ownership_claims/{claimId}` with `verificationMethod: "admin_document_review"` must set `status: "pending_review"`. Only Platform Admins can transition a claim to `approved` or `rejected`.
4. **Domain Match Anti-Webmail Guard**: Direct client creation of `/verified_ownerships/{schoolSlug}` using `domain_match` requires `request.auth.token.email_verified == true`, a non-webmail `verifiedDomain`, and an email matching `@<verifiedDomain>`.
5. **Dispute Consistency**: Creating `/ownership_disputes/{disputeId}` requires `/verified_ownerships/{schoolSlug}` to exist, `currentOwnerUid` to match the live owner, `challengerUid != currentOwnerUid`, and `status == "open"`.
6. **PII & Financial Workspace Isolation**: `/users/{userId}`, `/ownership_claims/{claimId}`, `/ownership_disputes/{disputeId}`, `/funding_workspaces/{userId}`, and `/grant_proposals/{proposalId}` are strictly readable and writable only by the owner (`userId` / `ownerUid`) or Platform Admins.
7. **Immutable Audit Trail**: `/verification_audit_logs/{logId}` is append-only (`update` and `delete` always denied).
8. **Temporal Integrity**: All `createdAt` / `updatedAt` / `verifiedAt` timestamps must strictly equal `request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Self-Promote to Admin on Signup**: `POST /users/{uid}` with `role: "Admin"`.
2. **Shadow Field Injection on User Profile**: `UPDATE /users/{uid}` injecting `{ isAdmin: true }`.
3. **Email Spoofing Admin Bypass**: Unverified token (`email_verified: false`) with email `Somacebomedia@gmail.com` attempting to read `/ownership_claims`.
4. **Unauthenticated Claim Creation**: Anonymous write to `/ownership_claims/claim_1`.
5. **Self-Approved Document Claim**: Non-admin creating `/ownership_claims/claim_2` with `verificationMethod: "admin_document_review"` and `status: "approved"`.
6. **Hijack Already-Locked School**: Attacker B attempting `create` or `update` on `/verified_ownerships/little-ashford` owned by Owner A.
7. **Webmail Domain Match Spoof**: User with `random@gmail.com` attempting `create` on `/verified_ownerships/school-a` with `verificationMethod: "domain_match"` and `verifiedDomain: "gmail.com"`.
8. **Owner Privilege Escalation on Locked School**: Verified Owner A attempting to change `ownerUid` or `lockStatus` to bypass an active dispute.
9. **Orphaned Dispute Creation**: User attempting to open `/ownership_disputes/disp_1` for an unclaimed school that does not exist in `/verified_ownerships`.
10. **Self-Dispute Spoofing**: Owner A attempting to open a dispute against themselves (`challengerUid == currentOwnerUid`).
11. **PII Blanket Scraping**: Random signed-in user calling `list` on `/ownership_claims` or `/grant_proposals` without filtering to `claimantUid == request.auth.uid` / `ownerUid == request.auth.uid`.
12. **Audit Log Tampering & Funding Workspace Hijack**: User attempting to `update` or `delete` `/verification_audit_logs/log_1` or overwrite another owner's `/funding_workspaces/{otherUid}`.
