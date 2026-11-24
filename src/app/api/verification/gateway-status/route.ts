import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseBearerToken } from '@/lib/server-verification-store';
import { getMessagingGatewayStatus } from '@/lib/otp-providers';

/**
 * Admin-only read-only endpoint returning whether each direct messaging provider
 * (Meta WhatsApp, Twilio, Clickatell, Resend) is configured in server environment secrets.
 * Never returns API keys, tokens, or partial secrets.
 */
export async function GET(req: NextRequest) {
  try {
    const caller = await verifyFirebaseBearerToken(req.headers.get('authorization'));
    if (!caller || !caller.isAdmin) {
      return NextResponse.json(
        { error: 'Platform Admin authentication required.' },
        { status: 403 }
      );
    }

    const status = getMessagingGatewayStatus();
    return NextResponse.json(status);
  } catch (err) {
    console.error('[/api/verification/gateway-status] error:', err);
    return NextResponse.json(
      { error: 'Unable to check messaging gateway status.' },
      { status: 500 }
    );
  }
}
