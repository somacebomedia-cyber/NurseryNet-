import { NextRequest, NextResponse } from 'next/server';
import { loadAllPreschools } from '@/lib/preschool-pool';
import { maskPhoneNumber, normalizeSaPhoneNumber } from '@/lib/ownership-verification';
import {
  createOtpChallenge,
  dispatchOtpCode,
  verifyFirebaseBearerToken,
} from '@/lib/server-verification-store';

export async function POST(req: NextRequest) {
  try {
    const caller = await verifyFirebaseBearerToken(req.headers.get('authorization'));
    if (!caller || !caller.emailVerified) {
      return NextResponse.json(
        { error: 'Please sign in with a verified Google account before requesting a verification code.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const schoolSlug = typeof body?.schoolSlug === 'string' ? body.schoolSlug.trim() : '';
    if (!schoolSlug) {
      return NextResponse.json({ error: 'Preschool slug is required.' }, { status: 400 });
    }

    // Always look up the authoritative phone number from the directory pool (never trust client-supplied phone)
    const authoritative = loadAllPreschools().find(
      (s) => (s.slug || s.id) === schoolSlug || s.id === schoolSlug
    );
    if (!authoritative) {
      return NextResponse.json(
        { error: 'This preschool was not found in the authoritative directory. Please use Manual Document Review.' },
        { status: 404 }
      );
    }

    const normalizedPhone = normalizeSaPhoneNumber(authoritative.phone);
    const maskedPhone = maskPhoneNumber(authoritative.phone);
    if (!normalizedPhone || !maskedPhone) {
      return NextResponse.json(
        { error: 'This preschool has no valid public phone number on file. Please use Official Domain or Document Review.' },
        { status: 400 }
      );
    }

    const created = createOtpChallenge({
      uid: caller.uid,
      schoolSlug,
      channel: 'phone_otp',
      targetRaw: normalizedPhone,
      targetMasked: maskedPhone,
    });

    if (!created.ok) {
      return NextResponse.json(
        { error: created.error, retryAfterSeconds: created.retryAfterSeconds },
        { status: 429 }
      );
    }

    const preferredChannel =
      body?.preferredChannel === 'sms' || body?.preferredChannel === 'whatsapp'
        ? body.preferredChannel
        : undefined;

    const delivery = await dispatchOtpCode({
      channel: 'phone_otp',
      targetRaw: normalizedPhone,
      schoolName: authoritative.name || schoolSlug,
      code: created.code,
      preferredChannel,
    });

    if (!delivery.ok) {
      return NextResponse.json(
        {
          error:
            delivery.error ||
            'Could not deliver the verification message via the configured messaging provider.',
          provider: delivery.provider,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      challengeId: created.challengeId,
      maskedPhone,
      expiresAt: created.expiresAt,
      cooldownSeconds: created.cooldownSeconds,
      deliveryMode: delivery.deliveryMode,
      provider: delivery.provider,
      providerLabel: delivery.providerLabel,
      providerNote: delivery.providerNote,
      // Strictly surfaced ONLY when no live WhatsApp/SMS provider keys are configured
      ...(delivery.deliveryMode === 'sandbox_preview' ? { sandboxPreviewCode: created.code } : {}),
    });
  } catch (err) {
    console.error('[/api/verification/send-otp] error:', err);
    return NextResponse.json(
      { error: 'Failed to generate verification code. Please try again.' },
      { status: 500 }
    );
  }
}
