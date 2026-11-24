/**
 * Direct Messaging & Email Provider Integrations (Server-Only)
 *
 * Supports direct API calls using Node's native fetch (zero third-party SDK bloat)
 * for South African and global OTP/notification providers:
 *   1. Meta WhatsApp Business Cloud API (WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID)
 *   2. Twilio WhatsApp & SMS API (TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM / TWILIO_SMS_FROM)
 *   3. Clickatell South Africa SMS API (CLICKATELL_API_KEY)
 *   4. Resend Transactional Email API (RESEND_API_KEY + RESEND_FROM_EMAIL)
 *   5. Optional Custom HTTPS Webhooks (SSRF-guarded fallback)
 */

export type DirectProviderId =
  | 'meta_whatsapp'
  | 'twilio_whatsapp'
  | 'twilio_sms'
  | 'clickatell_sms'
  | 'resend_email'
  | 'custom_webhook'
  | 'sandbox_preview';

export interface ProviderStatusItem {
  id: DirectProviderId;
  label: string;
  channel: 'whatsapp' | 'sms' | 'email' | 'webhook';
  configured: boolean;
  requiredSecrets: string[];
  optionalSecrets?: string[];
  description: string;
}

export interface GatewayStatusSummary {
  livePhoneDeliveryConfigured: boolean;
  activePhoneProvider: DirectProviderId;
  liveEmailConfigured: boolean;
  activeEmailProvider: DirectProviderId;
  providers: ProviderStatusItem[];
}

export interface DispatchOtpResult {
  ok: boolean;
  deliveryMode: 'live' | 'sandbox_preview';
  provider: DirectProviderId;
  providerLabel: string;
  providerNote: string;
  error?: string;
}

const FETCH_TIMEOUT_MS = 10_000;

function envTrim(name: string): string {
  return (process.env[name] || '').trim();
}

function isValidMetaPhoneNumberId(id: string): boolean {
  return /^\d{5,30}$/.test(id);
}

function isValidMetaApiVersion(ver: string): boolean {
  return /^v\d{1,2}\.\d{1,2}$/.test(ver);
}

function isValidTwilioAccountSid(sid: string): boolean {
  return /^AC[a-fA-F0-9]{32}$/.test(sid);
}

function isValidSafeHttpsWebhookUrl(rawUrl: string): boolean {
  if (!rawUrl) return false;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (
      !host ||
      host === 'localhost' ||
      host === '0.0.0.0' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.startsWith('127.') ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
      host.includes(':')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
    });
  } finally {
    clearTimeout(timer);
  }
}

function hasMetaWhatsApp(): boolean {
  return Boolean(
    envTrim('WHATSAPP_ACCESS_TOKEN') &&
      isValidMetaPhoneNumberId(envTrim('WHATSAPP_PHONE_NUMBER_ID'))
  );
}

function hasTwilioWhatsApp(): boolean {
  return Boolean(
    isValidTwilioAccountSid(envTrim('TWILIO_ACCOUNT_SID')) &&
      envTrim('TWILIO_AUTH_TOKEN') &&
      envTrim('TWILIO_WHATSAPP_FROM')
  );
}

function hasTwilioSms(): boolean {
  return Boolean(
    isValidTwilioAccountSid(envTrim('TWILIO_ACCOUNT_SID')) &&
      envTrim('TWILIO_AUTH_TOKEN') &&
      envTrim('TWILIO_SMS_FROM')
  );
}

function hasClickatellSms(): boolean {
  return Boolean(envTrim('CLICKATELL_API_KEY'));
}

function hasResendEmail(): boolean {
  return Boolean(envTrim('RESEND_API_KEY') && envTrim('RESEND_FROM_EMAIL'));
}

function hasPhoneWebhook(): boolean {
  return (
    isValidSafeHttpsWebhookUrl(envTrim('WHATSAPP_OTP_WEBHOOK_URL')) ||
    isValidSafeHttpsWebhookUrl(envTrim('SMS_OTP_WEBHOOK_URL'))
  );
}

function hasEmailWebhook(): boolean {
  return isValidSafeHttpsWebhookUrl(envTrim('EMAIL_OTP_WEBHOOK_URL'));
}

/**
 * Returns non-sensitive boolean configuration status for the Admin Console.
 * NEVER exposes API keys, tokens, or partial credentials.
 */
export function getMessagingGatewayStatus(): GatewayStatusSummary {
  const providers: ProviderStatusItem[] = [
    {
      id: 'meta_whatsapp',
      label: 'Meta WhatsApp Business Cloud',
      channel: 'whatsapp',
      configured: hasMetaWhatsApp(),
      requiredSecrets: ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'],
      optionalSecrets: ['WHATSAPP_OTP_TEMPLATE_NAME', 'WHATSAPP_API_VERSION'],
      description: 'Official direct WhatsApp Cloud API for South African phone verification.',
    },
    {
      id: 'twilio_whatsapp',
      label: 'Twilio WhatsApp',
      channel: 'whatsapp',
      configured: hasTwilioWhatsApp(),
      requiredSecrets: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_FROM'],
      description: 'Direct WhatsApp messaging via Twilio Programmable Messaging.',
    },
    {
      id: 'twilio_sms',
      label: 'Twilio SMS',
      channel: 'sms',
      configured: hasTwilioSms(),
      requiredSecrets: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_SMS_FROM'],
      description: 'Direct SMS delivery via Twilio (also acts as automatic SMS fallback).',
    },
    {
      id: 'clickatell_sms',
      label: 'Clickatell South Africa SMS',
      channel: 'sms',
      configured: hasClickatellSms(),
      requiredSecrets: ['CLICKATELL_API_KEY'],
      optionalSecrets: ['CLICKATELL_FROM'],
      description: 'Local South African SMS gateway with ZAR billing and direct REST API.',
    },
    {
      id: 'resend_email',
      label: 'Resend Transactional Email',
      channel: 'email',
      configured: hasResendEmail(),
      requiredSecrets: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'],
      optionalSecrets: ['ADMIN_ALERT_EMAIL'],
      description: 'Direct email alerts for admin claim reviews, ownership disputes, and confirmations.',
    },
  ];

  let activePhoneProvider: DirectProviderId = 'sandbox_preview';
  if (hasMetaWhatsApp()) activePhoneProvider = 'meta_whatsapp';
  else if (hasTwilioWhatsApp()) activePhoneProvider = 'twilio_whatsapp';
  else if (hasTwilioSms()) activePhoneProvider = 'twilio_sms';
  else if (hasClickatellSms()) activePhoneProvider = 'clickatell_sms';
  else if (hasPhoneWebhook()) activePhoneProvider = 'custom_webhook';

  let activeEmailProvider: DirectProviderId = 'sandbox_preview';
  if (hasResendEmail()) activeEmailProvider = 'resend_email';
  else if (hasEmailWebhook()) activeEmailProvider = 'custom_webhook';

  return {
    livePhoneDeliveryConfigured: activePhoneProvider !== 'sandbox_preview',
    activePhoneProvider,
    liveEmailConfigured: activeEmailProvider !== 'sandbox_preview',
    activeEmailProvider,
    providers,
  };
}

/**
 * 1. Direct Meta WhatsApp Business Cloud API
 */
async function sendViaMetaWhatsApp(params: {
  toE164: string;
  schoolName: string;
  code: string;
}): Promise<{ ok: boolean; error?: string }> {
  const token = envTrim('WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = envTrim('WHATSAPP_PHONE_NUMBER_ID');
  const rawVersion = envTrim('WHATSAPP_API_VERSION') || 'v21.0';
  const apiVersion = isValidMetaApiVersion(rawVersion) ? rawVersion : 'v21.0';
  const templateName = envTrim('WHATSAPP_OTP_TEMPLATE_NAME');
  const templateLang = envTrim('WHATSAPP_OTP_TEMPLATE_LANG') || 'en';

  if (!token || !isValidMetaPhoneNumberId(phoneNumberId)) {
    return { ok: false, error: 'Meta WhatsApp configuration is incomplete.' };
  }

  const toDigits = params.toE164.replace(/\D/g, '');
  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const payload = templateName
    ? {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toDigits,
        type: 'template',
        template: {
          name: templateName,
          language: { code: templateLang },
          components: [
            {
              type: 'body',
              parameters: [{ type: 'text', text: params.code }],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [{ type: 'text', text: params.code }],
            },
          ],
        },
      }
    : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toDigits,
        type: 'text',
        text: {
          preview_url: false,
          body: `NurseryNet ownership verification code for ${params.schoolName}: ${params.code}. This code expires in 10 minutes. Do not share it with anyone.`,
        },
      };

  try {
    const res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`[otp-providers] Meta WhatsApp API responded with status ${res.status}`);
      return { ok: false, error: 'WhatsApp provider could not deliver the verification message.' };
    }
    return { ok: true };
  } catch {
    console.error('[otp-providers] Meta WhatsApp network error');
    return { ok: false, error: 'WhatsApp provider timed out.' };
  }
}

/**
 * 2. Direct Twilio WhatsApp / SMS REST API
 */
async function sendViaTwilio(params: {
  mode: 'whatsapp' | 'sms';
  toE164: string;
  schoolName: string;
  code: string;
}): Promise<{ ok: boolean; error?: string }> {
  const accountSid = envTrim('TWILIO_ACCOUNT_SID');
  const authToken = envTrim('TWILIO_AUTH_TOKEN');
  const rawFrom =
    params.mode === 'whatsapp' ? envTrim('TWILIO_WHATSAPP_FROM') : envTrim('TWILIO_SMS_FROM');

  if (!isValidTwilioAccountSid(accountSid) || !authToken || !rawFrom) {
    return { ok: false, error: 'Twilio configuration is incomplete.' };
  }

  const fromValue =
    params.mode === 'whatsapp'
      ? rawFrom.startsWith('whatsapp:')
        ? rawFrom
        : `whatsapp:${rawFrom}`
      : rawFrom.replace(/^whatsapp:/i, '');

  const toValue =
    params.mode === 'whatsapp' ? `whatsapp:${params.toE164}` : params.toE164;

  const bodyText = `NurseryNet verification code for ${params.schoolName}: ${params.code}. Expires in 10 minutes.`;
  const formBody = new URLSearchParams({
    From: fromValue,
    To: toValue,
    Body: bodyText,
  });

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    const res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
    });

    if (!res.ok) {
      console.error(`[otp-providers] Twilio (${params.mode}) responded with status ${res.status}`);
      return { ok: false, error: `Twilio ${params.mode.toUpperCase()} delivery failed.` };
    }
    return { ok: true };
  } catch {
    console.error(`[otp-providers] Twilio (${params.mode}) network error`);
    return { ok: false, error: `Twilio ${params.mode.toUpperCase()} request timed out.` };
  }
}

/**
 * 3. Direct Clickatell South Africa REST API
 */
async function sendViaClickatell(params: {
  toE164: string;
  schoolName: string;
  code: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = envTrim('CLICKATELL_API_KEY');
  const from = envTrim('CLICKATELL_FROM');
  if (!apiKey) {
    return { ok: false, error: 'Clickatell API key is missing.' };
  }

  const toDigits = params.toE164.replace(/\D/g, '');
  const payload: Record<string, unknown> = {
    content: `NurseryNet ownership verification code for ${params.schoolName}: ${params.code}. Expires in 10 minutes.`,
    to: [toDigits],
  };
  if (from) {
    payload.from = from;
  }

  try {
    const res = await fetchWithTimeout('https://platform.clickatell.com/messages', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`[otp-providers] Clickatell API responded with status ${res.status}`);
      return { ok: false, error: 'Clickatell SMS delivery failed.' };
    }
    return { ok: true };
  } catch {
    console.error('[otp-providers] Clickatell network error');
    return { ok: false, error: 'Clickatell SMS request timed out.' };
  }
}

/**
 * 4. Direct Resend Transactional Email API
 */
export async function sendEmailViaResend(params: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: boolean; provider: DirectProviderId; error?: string }> {
  const apiKey = envTrim('RESEND_API_KEY');
  const fromEmail = envTrim('RESEND_FROM_EMAIL');
  if (!apiKey || !fromEmail) {
    return { ok: false, provider: 'sandbox_preview', error: 'Resend email is not configured.' };
  }

  try {
    const res = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [params.to],
        subject: params.subject,
        text: params.text,
      }),
    });

    if (!res.ok) {
      console.error(`[otp-providers] Resend API responded with status ${res.status}`);
      return { ok: false, provider: 'resend_email', error: 'Email delivery failed.' };
    }
    return { ok: true, provider: 'resend_email' };
  } catch {
    console.error('[otp-providers] Resend network error');
    return { ok: false, provider: 'resend_email', error: 'Email service timed out.' };
  }
}

/**
 * 5. Optional SSRF-Guarded Custom Webhook Fallback
 */
async function sendViaCustomWebhook(params: {
  url: string;
  toE164: string;
  schoolName: string;
  code: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isValidSafeHttpsWebhookUrl(params.url)) {
    return { ok: false, error: 'Configured webhook URL is not a valid public HTTPS endpoint.' };
  }

  const authToken = envTrim('OTP_WEBHOOK_AUTH_TOKEN');
  try {
    const res = await fetchWithTimeout(params.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        to: params.toE164,
        schoolName: params.schoolName,
        message: `NurseryNet ownership verification code for ${params.schoolName}: ${params.code}. Expires in 10 minutes.`,
      }),
    });
    if (!res.ok) {
      console.error(`[otp-providers] Custom webhook responded with status ${res.status}`);
      return { ok: false, error: 'Configured messaging webhook failed.' };
    }
    return { ok: true };
  } catch {
    console.error('[otp-providers] Custom webhook network error');
    return { ok: false, error: 'Configured messaging webhook timed out.' };
  }
}

/**
 * Unified Direct Phone/WhatsApp OTP Dispatcher.
 *
 * Security invariant:
 * - If at least one live provider is configured, attempts live delivery (with automatic fallback
 *   across configured direct providers, e.g., WhatsApp -> SMS) and NEVER leaks a sandbox OTP code
 *   if live delivery fails.
 * - Only enters `sandbox_preview` mode when NO live phone/WhatsApp provider is configured.
 */
export async function dispatchPhoneOtpDirect(params: {
  toE164: string;
  schoolName: string;
  code: string;
  preferredChannel?: 'whatsapp' | 'sms';
}): Promise<DispatchOtpResult> {
  type Candidate = {
    id: DirectProviderId;
    label: string;
    channel: 'whatsapp' | 'sms';
    send: () => Promise<{ ok: boolean; error?: string }>;
  };

  const candidates: Candidate[] = [];

  if (hasMetaWhatsApp()) {
    candidates.push({
      id: 'meta_whatsapp',
      label: 'WhatsApp (Meta Cloud API)',
      channel: 'whatsapp',
      send: () => sendViaMetaWhatsApp(params),
    });
  }
  if (hasTwilioWhatsApp()) {
    candidates.push({
      id: 'twilio_whatsapp',
      label: 'WhatsApp (Twilio)',
      channel: 'whatsapp',
      send: () => sendViaTwilio({ ...params, mode: 'whatsapp' }),
    });
  }
  if (hasTwilioSms()) {
    candidates.push({
      id: 'twilio_sms',
      label: 'SMS (Twilio)',
      channel: 'sms',
      send: () => sendViaTwilio({ ...params, mode: 'sms' }),
    });
  }
  if (hasClickatellSms()) {
    candidates.push({
      id: 'clickatell_sms',
      label: 'SMS (Clickatell SA)',
      channel: 'sms',
      send: () => sendViaClickatell(params),
    });
  }

  const webhookWhatsapp = envTrim('WHATSAPP_OTP_WEBHOOK_URL');
  const webhookSms = envTrim('SMS_OTP_WEBHOOK_URL');
  if (isValidSafeHttpsWebhookUrl(webhookWhatsapp)) {
    candidates.push({
      id: 'custom_webhook',
      label: 'WhatsApp Gateway',
      channel: 'whatsapp',
      send: () => sendViaCustomWebhook({ ...params, url: webhookWhatsapp }),
    });
  } else if (isValidSafeHttpsWebhookUrl(webhookSms)) {
    candidates.push({
      id: 'custom_webhook',
      label: 'SMS Gateway',
      channel: 'sms',
      send: () => sendViaCustomWebhook({ ...params, url: webhookSms }),
    });
  }

  if (candidates.length === 0) {
    return {
      ok: true,
      deliveryMode: 'sandbox_preview',
      provider: 'sandbox_preview',
      providerLabel: 'Sandbox Preview Mode',
      providerNote:
        'No live WhatsApp or SMS provider keys are configured yet — showing sandbox code for testing.',
    };
  }

  if (params.preferredChannel === 'sms') {
    candidates.sort((a, b) => (a.channel === 'sms' ? -1 : b.channel === 'sms' ? 1 : 0));
  }

  let lastError = 'Verification message could not be delivered.';
  let lastProvider: DirectProviderId = candidates[0].id;
  let lastLabel = candidates[0].label;

  for (const candidate of candidates) {
    lastProvider = candidate.id;
    lastLabel = candidate.label;
    const result = await candidate.send();
    if (result.ok) {
      return {
        ok: true,
        deliveryMode: 'live',
        provider: candidate.id,
        providerLabel: candidate.label,
        providerNote: `6-digit verification code sent via ${candidate.label}.`,
      };
    }
    if (result.error) lastError = result.error;
  }

  return {
    ok: false,
    deliveryMode: 'live',
    provider: lastProvider,
    providerLabel: lastLabel,
    providerNote: lastError,
    error: `${lastError} Please try again in a moment or verify via Official Domain / Document Review.`,
  };
}
