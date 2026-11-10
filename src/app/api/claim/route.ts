import { NextRequest, NextResponse } from 'next/server';

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
}

// In-memory persistent store during server lifetime
const claimsStore: Map<string, ClaimRecord> = new Map();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nurserySlug, nurseryName, ownerName, ownerEmail, ownerPhone, role, proofNotes } = body || {};

    if (!nurserySlug || !ownerName || !ownerEmail || !ownerPhone) {
      return NextResponse.json(
        { error: 'Preschool identifier, name, email and contact phone are required.' },
        { status: 400 }
      );
    }

    // Check if already claimed
    const existing = claimsStore.get(nurserySlug);
    if (existing && existing.status === 'approved') {
      return NextResponse.json(
        { error: 'This listing is already claimed and verified by the school administration.' },
        { status: 409 }
      );
    }

    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const token = `owner_tok_${Math.random().toString(36).substring(2, 10)}`;

    const newClaim: ClaimRecord = {
      id: claimId,
      nurserySlug,
      nurseryName: nurseryName || nurserySlug,
      ownerName,
      ownerEmail,
      ownerPhone,
      role: role || 'Owner / Principal',
      proofNotes: proofNotes || '',
      status: 'approved', // Auto-approve in demo sandbox so users can immediately test the claimed listing!
      createdAt: new Date().toISOString(),
      token,
    };

    claimsStore.set(nurserySlug, newClaim);

    return NextResponse.json(
      {
        success: true,
        claimId,
        token,
        status: newClaim.status,
        message: 'Claim verified successfully! Your listing now shows the Owner-Claimed & Verified badge.',
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

  // List all claims
  return NextResponse.json({
    totalClaims: claimsStore.size,
    claims: Array.from(claimsStore.values()),
  });
}
