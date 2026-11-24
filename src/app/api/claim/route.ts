import { NextRequest, NextResponse } from 'next/server';
import { removeCustomPreschoolBySlug, upsertCustomPreschool } from '@/lib/preschool-pool';
import {
  validateVerificationProof,
  verifyFirebaseBearerToken,
} from '@/lib/server-verification-store';

interface VerifiedClaimCacheRecord {
  schoolSlug: string;
  ownerUid: string;
  ownerName: string;
  verificationMethod: string;
  updatedAt: string;
}

const globalForClaims = globalThis as unknown as {
  __nurserynetVerifiedClaims?: Map<string, VerifiedClaimCacheRecord>;
};

const verifiedClaimsCache =
  globalForClaims.__nurserynetVerifiedClaims ??
  (globalForClaims.__nurserynetVerifiedClaims = new Map<string, VerifiedClaimCacheRecord>());

export async function POST(req: NextRequest) {
  try {
    const caller = await verifyFirebaseBearerToken(req.headers.get('authorization'));
    if (!caller || !caller.emailVerified) {
      return NextResponse.json(
        { error: 'Unauthorized: Sign in with a verified account to update a claimed preschool listing.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      nurserySlug,
      previousSlug,
      previousName,
      nurseryName,
      ownerName,
      ownerEmail,
      ownerPhone,
      role,
      verificationMethod,
      verificationProofHash,
      preschoolData,
      ownerUidOverride,
    } = body || {};

    if (!nurserySlug || typeof nurserySlug !== 'string') {
      return NextResponse.json(
        { error: 'Preschool identifier is required.' },
        { status: 400 }
      );
    }

    const existingLock = verifiedClaimsCache.get(nurserySlug);

    // Authorization gate:
    // 1. Platform Admin can always publish approved manual claims or ownership transfers.
    // 2. Already-verified owner of this slug can publish listing edits.
    // 3. New instant claim must present a valid server-issued verificationProofHash bound to (caller.uid, nurserySlug).
    const isExistingOwner = Boolean(existingLock && existingLock.ownerUid === caller.uid);
    const validProof = validateVerificationProof(verificationProofHash, caller.uid, nurserySlug);

    if (!caller.isAdmin && !isExistingOwner && !validProof) {
      return NextResponse.json(
        {
          error:
            existingLock && existingLock.ownerUid !== caller.uid
              ? 'This preschool listing is locked to another verified owner. Please submit an Ownership Dispute if you represent this school.'
              : 'Verification proof required. Complete Official Domain Match, Listed Phone OTP, or wait for Admin approval before publishing.',
        },
        { status: 403 }
      );
    }

    const effectiveOwnerUid =
      caller.isAdmin && typeof ownerUidOverride === 'string' && ownerUidOverride.trim()
        ? ownerUidOverride.trim()
        : existingLock?.ownerUid || caller.uid;

    let savedPreschool: any = null;
    if (preschoolData && typeof preschoolData === 'object') {
      savedPreschool = upsertCustomPreschool(
        {
          ...preschoolData,
          slug: nurserySlug,
          id: nurserySlug,
          previousSlug,
          previousName,
          replaceAllForOwner: false,
          name: preschoolData.name || nurseryName || nurserySlug,
          phone: preschoolData.phone || ownerPhone || '',
          email: preschoolData.email || ownerEmail || '',
          principal: ownerName
            ? `${ownerName} (${role || 'Owner / Principal'})`
            : preschoolData.principal || 'Verified Principal',
          ownerUid: effectiveOwnerUid,
          verificationMethod:
            verificationMethod || validProof?.method || existingLock?.verificationMethod || 'admin_document_review',
          lockStatus: 'locked',
          isClaimed: true,
          isVerified: true,
        },
        previousSlug
      );
    }

    if (previousSlug && previousSlug !== nurserySlug && (caller.isAdmin || isExistingOwner)) {
      verifiedClaimsCache.delete(previousSlug);
    }

    const finalSlug = savedPreschool?.slug || nurserySlug;
    verifiedClaimsCache.set(finalSlug, {
      schoolSlug: finalSlug,
      ownerUid: effectiveOwnerUid,
      ownerName: ownerName || caller.displayName,
      verificationMethod:
        verificationMethod || validProof?.method || existingLock?.verificationMethod || 'admin_document_review',
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        status: 'approved',
        ownerUid: effectiveOwnerUid,
        preschool: savedPreschool,
        message: 'Verified ownership listing synchronized.',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[/api/claim] error:', err);
    return NextResponse.json({ error: 'Failed to process verified listing update.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const caller = await verifyFirebaseBearerToken(req.headers.get('authorization'));
    if (!caller || !caller.emailVerified) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required.' }, { status: 400 });
    }

    const existingLock = verifiedClaimsCache.get(slug);
    if (!caller.isAdmin && (!existingLock || existingLock.ownerUid !== caller.uid)) {
      return NextResponse.json(
        { error: 'Only a Platform Admin or the verified owner may remove this custom listing.' },
        { status: 403 }
      );
    }

    verifiedClaimsCache.delete(slug);
    removeCustomPreschoolBySlug(slug);
    return NextResponse.json({ success: true, removedSlug: slug });
  } catch {
    return NextResponse.json({ error: 'Failed to remove listing.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const claim = verifiedClaimsCache.get(slug);
    if (!claim) {
      return NextResponse.json({ claimed: false });
    }
    return NextResponse.json({
      claimed: true,
      schoolSlug: claim.schoolSlug,
      verificationMethod: claim.verificationMethod,
      updatedAt: claim.updatedAt,
    });
  }

  return NextResponse.json({
    totalVerifiedLocks: verifiedClaimsCache.size,
  });
}
