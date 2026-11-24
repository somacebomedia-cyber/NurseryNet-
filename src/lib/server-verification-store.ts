import crypto from 'crypto';
import firebaseAppletConfig from '../../firebase-applet-config.json';
import { BOOTSTRAP_ADMIN_EMAILS } from '@/lib/ownership-verification';
import {
  dispatchPhoneOtpDirect,
  type DispatchOtpResult,
} from '@/lib/otp-providers';

export interface VerifiedFirebaseCaller {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  isAdmin: boolean;
}

interface OtpChallengeRecord {
  challengeId: string;
  uid: string;
  schoolSlug: string;
  channel: 'phone_otp' | 'domain_email_otp';
  targetMasked: string;
  targetRawHash: string;
  codeHash: string;
  expiresAt: number;
  createdAt: number;
  attempts: number;
  maxAttempts: number;
  consumed: boolean;
}

interface VerifiedProofRecord {
  proofHash: string;
  uid: string;
  schoolSlug: string;
  method: 'domain_match' | 'phone_otp';
  verifiedDomain?: string;
  maskedTargetPhone?: string;
  expiresAt: number;
}

const EPHEMERAL_FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');

function getHmacSecret(): string {
  return process.env.OTP_HMAC_SECRET?.trim() || EPHEMERAL_FALLBACK_SECRET;
}

// Keep challenge stores across Next.js dev route reloads
const globalForVerification = globalThis as unknown as {
  __nurserynetOtpStore?: Map<string, OtpChallengeRecord>;
  __nurserynetCooldownStore?: Map<string, number>;
  __nurserynetProofStore?: Map<string, VerifiedProofRecord>;
};

const otpStore =
  globalForVerification.__nurserynetOtpStore ??
  (globalForVerification.__nurserynetOtpStore = new Map<string, OtpChallengeRecord>());

const cooldownStore =
  globalForVerification.__nurserynetCooldownStore ??
  (globalForVerification.__nurserynetCooldownStore = new Map<string, number>());

const proofStore =
  globalForVerification.__nurserynetProofStore ??
  (globalForVerification.__nurserynetProofStore = new Map<string, VerifiedProofRecord>());

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_RESEND_COOLDOWN_MS = 45 * 1000; // 45 seconds
export const OTP_MAX_ATTEMPTS = 5;

function hmacSha256(input: string): string {
  return crypto.createHmac('sha256', getHmacSecret()).update(input).digest('hex');
}

function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Verifies a Firebase Auth ID token sent in the Authorization: Bearer header
 * via Firebase Identity Toolkit accounts:lookup (requires no IAM / works on Starter Tier).
 */
export async function verifyFirebaseBearerToken(
  authHeader: string | null
): Promise<VerifiedFirebaseCaller | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken || idToken.length > 4096) {
    return null;
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(
        firebaseAppletConfig.apiKey
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        cache: 'no-store',
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const user = Array.isArray(data?.users) ? data.users[0] : null;
    if (!user || !user.localId || !user.email) return null;

    const email = String(user.email).trim();
    const emailVerified = Boolean(user.emailVerified);
    const isAdmin =
      emailVerified && BOOTSTRAP_ADMIN_EMAILS.includes(email.toLowerCase());

    return {
      uid: String(user.localId),
      email,
      emailVerified,
      displayName: String(user.displayName || email.split('@')[0] || 'Verified User'),
      isAdmin,
    };
  } catch (err) {
    console.error('[verifyFirebaseBearerToken] lookup failed:', err);
    return null;
  }
}

export function createOtpChallenge(params: {
  uid: string;
  schoolSlug: string;
  channel: 'phone_otp' | 'domain_email_otp';
  targetRaw: string;
  targetMasked: string;
}):
  | { ok: true; challengeId: string; code: string; expiresAt: number; cooldownSeconds: number }
  | { ok: false; error: string; retryAfterSeconds?: number } {
  const now = Date.now();
  const rateKey = `${params.uid}:${params.schoolSlug}:${params.channel}`;
  const lastSentAt = cooldownStore.get(rateKey) || 0;
  const elapsed = now - lastSentAt;

  if (elapsed < OTP_RESEND_COOLDOWN_MS) {
    const retryAfterSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
    return {
      ok: false,
      error: `Please wait ${retryAfterSeconds}s before requesting a new verification code.`,
      retryAfterSeconds,
    };
  }

  const challengeId = `otp_${crypto.randomBytes(12).toString('hex')}`;
  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = hmacSha256(`${challengeId}:${params.uid}:${params.schoolSlug}:${code}`);
  const targetRawHash = hmacSha256(params.targetRaw.toLowerCase());
  const expiresAt = now + OTP_TTL_MS;

  otpStore.set(challengeId, {
    challengeId,
    uid: params.uid,
    schoolSlug: params.schoolSlug,
    channel: params.channel,
    targetMasked: params.targetMasked,
    targetRawHash,
    codeHash,
    expiresAt,
    createdAt: now,
    attempts: 0,
    maxAttempts: OTP_MAX_ATTEMPTS,
    consumed: false,
  });

  cooldownStore.set(rateKey, now);

  // Prune expired records opportunistically
  for (const [key, rec] of otpStore.entries()) {
    if (rec.expiresAt < now - 60_000) {
      otpStore.delete(key);
    }
  }

  return {
    ok: true,
    challengeId,
    code,
    expiresAt,
    cooldownSeconds: Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000),
  };
}

export function verifyOtpChallenge(params: {
  challengeId: string;
  uid: string;
  schoolSlug: string;
  code: string;
}):
  | { ok: true; proofHash: string; channel: 'phone_otp' | 'domain_email_otp'; targetMasked: string }
  | { ok: false; error: string; locked?: boolean; remainingAttempts?: number } {
  const record = otpStore.get(params.challengeId);
  if (!record) {
    return { ok: false, error: 'Verification code expired or not found. Please request a new code.' };
  }

  if (record.uid !== params.uid || record.schoolSlug !== params.schoolSlug) {
    return { ok: false, error: 'Verification challenge does not match this account or preschool.' };
  }

  if (record.consumed) {
    return { ok: false, error: 'This verification code has already been used.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(params.challengeId);
    return { ok: false, error: 'Verification code has expired. Please request a new 6-digit code.' };
  }

  if (record.attempts >= record.maxAttempts) {
    return {
      ok: false,
      error: 'Too many failed attempts. Please request a fresh verification code.',
      locked: true,
      remainingAttempts: 0,
    };
  }

  const cleanCode = (params.code || '').replace(/\D/g, '');
  if (cleanCode.length !== 6) {
    return { ok: false, error: 'Please enter the full 6-digit verification code.' };
  }

  const candidateHash = hmacSha256(
    `${record.challengeId}:${params.uid}:${params.schoolSlug}:${cleanCode}`
  );

  if (!timingSafeHexEqual(candidateHash, record.codeHash)) {
    record.attempts += 1;
    const remaining = Math.max(0, record.maxAttempts - record.attempts);
    return {
      ok: false,
      error:
        remaining > 0
          ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Too many incorrect attempts. Please request a new verification code.',
      locked: remaining === 0,
      remainingAttempts: remaining,
    };
  }

  record.consumed = true;
  const proofHash = issueVerificationProof({
    uid: params.uid,
    schoolSlug: params.schoolSlug,
    method: 'phone_otp',
    maskedTargetPhone: record.targetMasked,
  });

  return {
    ok: true,
    proofHash,
    channel: record.channel,
    targetMasked: record.targetMasked,
  };
}

export function issueVerificationProof(params: {
  uid: string;
  schoolSlug: string;
  method: 'domain_match' | 'phone_otp';
  verifiedDomain?: string;
  maskedTargetPhone?: string;
}): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const proofHash = hmacSha256(
    `proof:${params.uid}:${params.schoolSlug}:${params.method}:${Date.now()}:${nonce}`
  );
  proofStore.set(proofHash, {
    proofHash,
    uid: params.uid,
    schoolSlug: params.schoolSlug,
    method: params.method,
    verifiedDomain: params.verifiedDomain,
    maskedTargetPhone: params.maskedTargetPhone,
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
  });
  return proofHash;
}

export function validateVerificationProof(
  proofHash: string | undefined | null,
  uid: string,
  schoolSlug: string
): VerifiedProofRecord | null {
  if (!proofHash) return null;
  const record = proofStore.get(proofHash);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    proofStore.delete(proofHash);
    return null;
  }
  if (record.uid !== uid || record.schoolSlug !== schoolSlug) {
    return null;
  }
  return record;
}

/**
 * Dispatches OTP via configured direct providers (Meta WhatsApp, Twilio, Clickatell)
 * or safe sandbox preview mode when no live provider keys are set.
 */
export async function dispatchOtpCode(params: {
  channel: 'phone_otp' | 'domain_email_otp';
  targetRaw: string;
  schoolName: string;
  code: string;
  preferredChannel?: 'whatsapp' | 'sms';
}): Promise<DispatchOtpResult> {
  return dispatchPhoneOtpDirect({
    toE164: params.targetRaw,
    schoolName: params.schoolName,
    code: params.code,
    preferredChannel: params.preferredChannel,
  });
}
