import { NextRequest, NextResponse } from 'next/server';
import { upsertCustomPreschool } from '@/lib/preschool-pool';

interface ClaimRecord {
  id: string;
  nurserySlug: string;
  nurseryName?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  role: string;
  proofNotes?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  createdAt: string;
  token?: string;
  preschool?: any;
}

const claimsStore: Map<string, ClaimRecord> = new Map();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nurserySlug,
      nurseryName,
      ownerName,
      ownerEmail,
      ownerPhone,
      role,
      proofNotes,
      preschoolData,
    } = body || {};

    if (!nurserySlug || !ownerName || !ownerEmail || !ownerPhone) {
      return NextResponse.json(
        { error: 'Preschool identifier, name, email and contact phone are required.' },
        { status: 400 }
      );
    }

    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const token = `owner_tok_${Math.random().toString(36).substring(2, 10)}`;

    // Upsert the claimed/added preschool into the shared directory pool so it appears in /api/directory
    let savedPreschool: any = null;
    if (preschoolData && typeof preschoolData === 'object') {
      savedPreschool = upsertCustomPreschool({
        ...preschoolData,
        slug: nurserySlug,
        id: nurserySlug,
        name: preschoolData.name || nurseryName || nurserySlug,
        phone: preschoolData.phone || ownerPhone,
        email: preschoolData.email || ownerEmail,
        principal: `${ownerName} (${role || 'Owner / Principal'})`,
        isClaimed: true,
        isVerified: true,
      });
    }

    const newClaim: ClaimRecord = {
      id: claimId,
      nurserySlug: savedPreschool?.slug || nurserySlug,
      nurseryName: savedPreschool?.name || nurseryName || nurserySlug,
      ownerName,
      ownerEmail,
      ownerPhone,
      role: role || 'Owner / Principal',
      proofNotes: proofNotes || '',
      status: 'approved',
      createdAt: new Date().toISOString(),
      token,
      preschool: savedPreschool,
    };

    claimsStore.set(newClaim.nurserySlug, newClaim);

    return NextResponse.json(
      {
        success: true,
        claimId,
        token,
        status: newClaim.status,
        preschool: savedPreschool,
        message:
          'Claim verified and published! Your preschool now appears in the NurseryNet Directory with the Owner-Claimed & Verified badge.',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[/api/claim] error:', err);
    return NextResponse.json({ error: 'Failed to process claim submission.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const claim = claimsStore.get(slug);
    if (!claim) {
      return NextResponse.json({ claimed: false });
    }
    return NextResponse.json({ claimed: true, claim });
  }

  return NextResponse.json({
    totalClaims: claimsStore.size,
    claims: Array.from(claimsStore.values()),
  });
}
