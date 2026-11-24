import { NextRequest, NextResponse } from 'next/server';
import { loadAllPreschools } from '@/lib/preschool-pool';
import { isOfficialEmailDomainMatch } from '@/lib/ownership-verification';
import {
  issueVerificationProof,
  verifyFirebaseBearerToken,
  verifyOtpChallenge,
} from '@/lib/server-verification-store';

export async function POST(req: NextRequest) {
  try {
    const caller = await verifyFirebaseBearerToken(req.headers.get('authorization'));
    if (!caller || !caller.emailVerified) {
      return NextResponse.json(
        { error: 'Authentication with a verified account is required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const schoolSlug = typeof body?.schoolSlug === 'string' ? body.schoolSlug.trim() : '';
    const method = body?.method;

    if (!schoolSlug || (method !== 'domain_match' && method !== 'phone_otp')) {
      return NextResponse.json(
        { error: 'Valid schoolSlug and verification method are required.' },
        { status: 400 }
      );
    }

    const authoritative = loadAllPreschools().find(
      (s) => (s.slug || s.id) === schoolSlug || s.id === schoolSlug
    );
    if (!authoritative) {
      return NextResponse.json(
        { error: 'Preschool not found in authoritative directory. Please submit Manual Document Review.' },
        { status: 404 }
      );
    }

    if (method === 'domain_match') {
      const check = isOfficialEmailDomainMatch(caller.email, authoritative.websiteUrl);
      if (!check.officialDomain) {
        return NextResponse.json(
          { error: 'This school does not have an eligible official website domain on file.' },
          { status: 400 }
        );
      }
      if (check.isWebmail) {
        return NextResponse.json(
          {
            error: `Consumer email providers (${check.emailDomain}) cannot be used for instant domain verification.`,
          },
          { status: 403 }
        );
      }
      if (!check.matched) {
        return NextResponse.json(
          {
            error: `Your signed-in email (${caller.email}) must end with @${check.officialDomain} to verify via domain match.`,
          },
          { status: 403 }
        );
      }

      const verificationProofHash = issueVerificationProof({
        uid: caller.uid,
        schoolSlug,
        method: 'domain_match',
        verifiedDomain: check.officialDomain,
      });

      return NextResponse.json({
        verified: true,
        method: 'domain_match',
        verifiedDomain: check.officialDomain,
        verificationProofHash,
      });
    }

    // method === 'phone_otp'
    const challengeId = typeof body?.challengeId === 'string' ? body.challengeId.trim() : '';
    const code = typeof body?.code === 'string' ? body.code.trim() : '';

    if (!challengeId || !code) {
      return NextResponse.json(
        { error: 'Challenge ID and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const result = verifyOtpChallenge({
      challengeId,
      uid: caller.uid,
      schoolSlug,
      code,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          verified: false,
          error: result.error,
          locked: result.locked,
          remainingAttempts: result.remainingAttempts,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      method: 'phone_otp',
      maskedTargetPhone: result.targetMasked,
      verificationProofHash: result.proofHash,
    });
  } catch (err) {
    console.error('[/api/verification/verify-challenge] error:', err);
    return NextResponse.json(
      { error: 'Verification check failed. Please try again.' },
      { status: 500 }
    );
  }
}
