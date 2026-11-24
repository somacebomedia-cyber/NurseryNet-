import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseBearerToken } from '@/lib/server-verification-store';
import { sendEmailViaResend } from '@/lib/otp-providers';
import { BOOTSTRAP_ADMIN_EMAILS, truncateString } from '@/lib/ownership-verification';

/**
 * Authenticated notification route for sending direct Resend admin alert emails
 * when a manual ownership claim or ownership dispute is filed.
 * Safely no-ops if RESEND_API_KEY is not configured yet.
 */
export async function POST(req: NextRequest) {
  try {
    const caller = await verifyFirebaseBearerToken(req.headers.get('authorization'));
    if (!caller || !caller.emailVerified) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const eventType =
      body?.eventType === 'manual_claim' || body?.eventType === 'ownership_dispute'
        ? body.eventType
        : null;
    const schoolName = truncateString(body?.schoolName, 140);
    const referenceId = truncateString(body?.referenceId, 120);

    if (!eventType || !schoolName) {
      return NextResponse.json({ error: 'Invalid notification payload.' }, { status: 400 });
    }

    const adminEmail =
      (process.env.ADMIN_ALERT_EMAIL || '').trim() || BOOTSTRAP_ADMIN_EMAILS[0];

    const subject =
      eventType === 'manual_claim'
        ? `[NurseryNet] Manual Ownership Claim Pending: ${schoolName}`
        : `[NurseryNet] Ownership Dispute Filed: ${schoolName}`;

    const text =
      eventType === 'manual_claim'
        ? [
            `A new manual preschool ownership claim is waiting in your NurseryNet Admin Queue.`,
            ``,
            `Preschool: ${schoolName}`,
            `Submitted by: ${caller.displayName} (${caller.email})`,
            referenceId ? `Claim ID: ${referenceId}` : '',
            ``,
            `Review and approve/reject this claim in your Admin Verification Console (/admin/verifications).`,
          ]
            .filter(Boolean)
            .join('\n')
        : [
            `An ownership dispute has been filed for a locked preschool listing.`,
            ``,
            `Preschool: ${schoolName}`,
            `Filed by: ${caller.displayName} (${caller.email})`,
            referenceId ? `Dispute ID: ${referenceId}` : '',
            ``,
            `Inspect evidence and uphold or transfer ownership in your Admin Verification Console (/admin/verifications).`,
          ]
            .filter(Boolean)
            .join('\n');

    const result = await sendEmailViaResend({
      to: adminEmail,
      subject,
      text,
    });

    return NextResponse.json({
      delivered: result.ok,
      provider: result.provider,
    });
  } catch (err) {
    console.error('[/api/verification/notify] error:', err);
    return NextResponse.json({ delivered: false }, { status: 200 });
  }
}
