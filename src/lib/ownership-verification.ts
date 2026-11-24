export type VerificationMethod = 'domain_match' | 'phone_otp' | 'admin_document_review';

export type ClaimStatus = 'pending_review' | 'approved' | 'rejected';

export type DisputeStatus = 'open' | 'resolved_kept' | 'resolved_transferred' | 'dismissed';

export type OwnershipLockStatus = 'locked' | 'disputed';

export const BOOTSTRAP_ADMIN_EMAILS = ['somacebomedia@gmail.com'];

export const FREE_WEBMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'yahoo.co.za',
  'icloud.com',
  'me.com',
  'webmail.co.za',
  'mweb.co.za',
  'telkomsa.net',
  'vodamail.co.za',
  'aol.com',
  'protonmail.com',
  'proton.me',
]);

export const SOCIAL_HOST_PATTERNS = [
  'facebook.com',
  'fb.com',
  'instagram.com',
  'tiktok.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'youtube.com',
  'whatsapp.com',
  'wa.me',
  'google.com',
  'maps.google.com',
];

export function isBootstrapAdminEmail(email?: string | null, emailVerified?: boolean): boolean {
  if (!email || !emailVerified) return false;
  return BOOTSTRAP_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function sanitizeFirestoreId(raw: string, fallback = 'record'): string {
  const cleaned = (raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  return cleaned || fallback;
}

export function truncateString(value: string | undefined | null, maxLen: number): string {
  if (!value || typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

/**
 * Extracts a clean, registrable domain from an official school website URL.
 * Returns null for social media pages, invalid URLs, or consumer webmail hosts.
 */
export function extractOfficialSchoolDomain(websiteUrl?: string | null): string | null {
  if (!websiteUrl || typeof websiteUrl !== 'string') return null;
  const trimmed = websiteUrl.trim();
  if (!trimmed) return null;

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (!host || !host.includes('.') || host === 'localhost') return null;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;

    if (
      SOCIAL_HOST_PATTERNS.some(
        (social) => host === social || host.endsWith(`.${social}`)
      )
    ) {
      return null;
    }

    if (FREE_WEBMAIL_DOMAINS.has(host)) {
      return null;
    }

    return host.slice(0, 160);
  } catch {
    return null;
  }
}

export function extractEmailDomain(email?: string | null): string | null {
  if (!email || typeof email !== 'string') return null;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const domain = parts[1];
  if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return null;
  return domain;
}

export function isOfficialEmailDomainMatch(
  userEmail?: string | null,
  schoolWebsiteUrl?: string | null
): { matched: boolean; officialDomain: string | null; emailDomain: string | null; isWebmail: boolean } {
  const officialDomain = extractOfficialSchoolDomain(schoolWebsiteUrl);
  const emailDomain = extractEmailDomain(userEmail);
  const isWebmail = Boolean(emailDomain && FREE_WEBMAIL_DOMAINS.has(emailDomain));

  if (!officialDomain || !emailDomain || isWebmail) {
    return { matched: false, officialDomain, emailDomain, isWebmail };
  }

  const matched =
    emailDomain === officialDomain || emailDomain.endsWith(`.${officialDomain}`);
  return { matched, officialDomain, emailDomain, isWebmail };
}

/**
 * Normalizes a South African phone number to +27XXXXXXXXX format when possible.
 * Returns null if the input does not look like a real dialable phone number.
 */
export function normalizeSaPhoneNumber(rawPhone?: string | null): string | null {
  if (!rawPhone || typeof rawPhone !== 'string') return null;
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 15) return null;

  // Reject obvious dummy/placeholder patterns
  if (/^0+$/.test(digits) || digits === '0825551829' || digits === '27825551829') {
    return null;
  }

  if (digits.startsWith('27') && digits.length === 11) {
    return `+${digits}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `+27${digits.slice(1)}`;
  }
  if (digits.length >= 10) {
    return `+${digits}`;
  }
  return null;
}

/**
 * Masks an authoritative school phone number for UI display (e.g. +27 82 ••• •482).
 */
export function maskPhoneNumber(rawPhone?: string | null): string | null {
  const normalized = normalizeSaPhoneNumber(rawPhone);
  if (!normalized) return null;
  const digits = normalized.replace(/\D/g, '');
  if (digits.startsWith('27') && digits.length === 11) {
    const prefix = `0${digits.slice(2, 4)}`;
    const suffix = digits.slice(-3);
    return `${prefix} ••• •${suffix}`;
  }
  const suffix = digits.slice(-3);
  return `+${digits.slice(0, 2)} ••• •${suffix}`;
}

export function getVerificationMethodLabel(method?: VerificationMethod | string): string {
  switch (method) {
    case 'domain_match':
      return 'Official Domain Verified';
    case 'phone_otp':
      return 'Listed Phone OTP Verified';
    case 'admin_document_review':
      return 'Registration Document Verified';
    default:
      return 'Owner Verified';
  }
}
