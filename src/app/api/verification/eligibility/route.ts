import { NextRequest, NextResponse } from 'next/server';
import { loadAllPreschools } from '@/lib/preschool-pool';
import {
  extractOfficialSchoolDomain,
  isOfficialEmailDomainMatch,
  maskPhoneNumber,
  normalizeSaPhoneNumber,
} from '@/lib/ownership-verification';
import { verifyFirebaseBearerToken } from '@/lib/server-verification-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const schoolSlug = typeof body?.schoolSlug === 'string' ? body.schoolSlug.trim() : '';
    if (!schoolSlug) {
      return NextResponse.json({ error: 'schoolSlug is required.' }, { status: 400 });
    }

    const caller = await verifyFirebaseBearerToken(req.headers.get('authorization'));
    const allSchools = loadAllPreschools();
    const authoritative = allSchools.find(
      (s) => (s.slug || s.id) === schoolSlug || s.id === schoolSlug
    );

    const authoritativeWebsite = authoritative?.websiteUrl || null;
    const authoritativePhone = authoritative?.phone || null;

    const officialDomain = extractOfficialSchoolDomain(authoritativeWebsite);
    const domainCheck = isOfficialEmailDomainMatch(caller?.email || null, authoritativeWebsite);

    const normalizedPhone = normalizeSaPhoneNumber(authoritativePhone);
    const maskedPhone = maskPhoneNumber(authoritativePhone);

    let domainReason = 'This listing does not have an official non-social school website on file.';
    if (officialDomain) {
      if (!caller) {
        domainReason = `Sign in with a verified @${officialDomain} email address for instant verification.`;
      } else if (domainCheck.matched && caller.emailVerified) {
        domainReason = `Your signed-in email (${caller.email}) matches the school's official domain @${officialDomain}.`;
      } else if (domainCheck.isWebmail) {
        domainReason = `Personal webmail accounts (${domainCheck.emailDomain}) cannot auto-verify. Sign in with an @${officialDomain} email or choose Phone OTP / Document Review.`;
      } else {
        domainReason = `Signed-in email domain (${domainCheck.emailDomain || 'none'}) does not match @${officialDomain}.`;
      }
    }

    const phoneReason = maskedPhone
      ? `We can send a 6-digit verification code directly to the official phone number already listed for this school (${maskedPhone}).`
      : 'No verified public phone number is listed on file for this preschool yet. Use Official Domain or Manual Document Review.';

    return NextResponse.json({
      foundInDirectory: Boolean(authoritative),
      schoolSlug,
      schoolName: authoritative?.name || body?.schoolName || schoolSlug,
      domainMatch: {
        eligible: Boolean(officialDomain),
        canAutoApproveNow: Boolean(officialDomain && caller?.emailVerified && domainCheck.matched),
        officialDomain,
        callerEmail: caller?.email || null,
        isWebmail: domainCheck.isWebmail,
        reason: domainReason,
      },
      phoneOtp: {
        eligible: Boolean(normalizedPhone && maskedPhone),
        maskedPhone,
        reason: phoneReason,
      },
      manualReview: {
        eligible: true,
        dsdRegistrationOnFile: authoritative?.dsdRegistration || null,
        hasNpoOnFile: Boolean(authoritative?.npoNumber),
      },
    });
  } catch (err) {
    console.error('[/api/verification/eligibility] error:', err);
    return NextResponse.json(
      { error: 'Unable to check ownership verification eligibility.' },
      { status: 500 }
    );
  }
}
