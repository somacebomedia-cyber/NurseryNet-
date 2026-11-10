# NurseryNet — Setup & Handoff Notes

**Live preview:** the app is running in the sandbox preview panel (port 3000).
**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma + SQLite · Stitch Money payments · Email + WhatsApp lead notifications.

---

## What's inside

| Area | Where |
|---|---|
| Directory (42,067 SA preschools, all 9 provinces) | `/?view=directory` |
| School detail + 12 attributes + JSON-LD | click any listing card |
| Tour booking → email + WhatsApp notifications | "Book a tour" button |
| Enquiries (enrollment / fees / general) | "Enquire" button |
| **Owner claim flow** (claim → email code → review → owner dashboard) | "Is this your preschool?" on any unclaimed listing |
| **Owner dashboard** (edit listing, see leads & enquiries) | `/?view=owner&token=…` (magic link emailed on approval) |
| For Schools — pricing + Stitch checkout | `/?view=pricing` |
| Payment status page (Stitch return + demo simulate) | `/?view=payment&paymentId=…` |
| Leads admin console (key-gated, incl. Claims review tab) | `/?view=admin` — key: `nurserynet-admin` (change via `ADMIN_DASHBOARD_KEY`) |

## Lead notifications (email + WhatsApp)

Every tour lead and enquiry fires **4 notifications**: email + WhatsApp to the school, email + WhatsApp confirmation to the parent. Every attempt is journalled in the `NotificationLog` table — **a lead is never lost**, even with no provider configured (messages show "Queued" and can be retried with one click from the admin console).

Configure ONE email option and ONE WhatsApp option in `.env` (see `.env.example`):

```
# Email — Option A: Resend          | Option B: any SMTP server
RESEND_API_KEY=re_xxx                | SMTP_HOST=smtp.yourprovider.co.za
                                     | SMTP_PORT=587
EMAIL_FROM=NurseryNet <no-reply@…>   | SMTP_USER / SMTP_PASS

# WhatsApp — Option A: Meta WhatsApp Business Cloud API   | Option B: Twilio
WHATSAPP_CLOUD_TOKEN=EAAG…           | TWILIO_ACCOUNT_SID=AC…
WHATSAPP_PHONE_NUMBER_ID=123456…     | TWILIO_AUTH_TOKEN=…
                                     | TWILIO_WHATSAPP_FROM=whatsapp:+1…
```

Phone numbers are normalised to SA E.164 (+27…) automatically; WhatsApp is only attempted for mobile numbers (6x/7x/8x prefixes).

## Payments — Stitch Money (replaces Stripe)

Stripe is not used (it does not support SA local businesses). The integration uses Stitch's current Pay By Bank API:

1. `POST https://secure.stitch.money/connect/token` — OAuth2 `client_credentials`, scope `client_paymentrequest`
2. `POST https://api.stitch.money/graphql` — `clientPaymentInitiationRequestCreate` mutation → returns `paymentInitiationRequest { id, url }`
3. Payer is redirected to the Stitch-hosted checkout (Capitec Pay, Absa Pay, PayShap, instant EFT)
4. `POST /api/payments/stitch/webhook` receives Svix-signed events (HMAC-SHA256 verified, replay-protected) and activates the subscription idempotently

Configure in `.env`:

```
STITCH_CLIENT_ID=…            # from Stitch onboarding
STITCH_CLIENT_SECRET=…
STITCH_MERCHANT_ID=…          # or STITCH_BANK_ID + STITCH_ACCOUNT_NUMBER + TYPE + NAME
STITCH_WEBHOOK_SECRET=whsec_… # from your Svix/Stitch webhook subscription
```

**Without credentials the app runs in demo mode** — the full checkout → status → completion flow is testable in-app (a "Pay successfully / Fail payment" simulation panel appears on the status page).

Tiers: Free (R0) · Verified School (R299/mo) · Pro Featured (R690/mo) — edit in `src/config/tiers.ts`.

## Owner claim flow ("Is this your preschool?")

Full lifecycle, end to end:

1. **Claim** — an owner opens their school's profile and clicks **"Is this your preschool? Claim this listing — free"**. They fill in their name, role, email, phone and (optional) DSD registration number / website as proof → `POST /api/claims` creates a claim in `verifying` status and emails a **6-digit code** (valid 15 min, 5 attempts, resend with 30 s cooldown).
2. **Verify** — the claimant enters the code in the OTP step → claim moves to `pending_review`; they get a "received / under review" email and the admin gets a review notification.
3. **Review** — in the admin console (`/?view=admin` → **Claims** tab, first tab, badge count on the trigger) you **Approve** or **Reject** with an optional note. Approving issues a unique `ownerToken`, marks the listing **Owner-Claimed** (`Preschool.claimedAt`) and emails the claimant a **magic link** to their dashboard. Rejecting emails the note.
4. **Owner dashboard** — `/?view=owner&token=…` (also remembered in localStorage). The owner can edit every parent-facing attribute (name, description, contact, DSD no., hours, ages, curriculum, languages, extracurriculars, fees, deposit, subsidies, meals, ratio, safety toggles, transport) and sees **every tour lead & enquiry** captured for their school. Saving hits `lastUpdatedAt`; the directory reflects changes immediately.

One active claim per listing at a time; the claim CTA hides on already-claimed listings ("This listing is claimed and managed by the school"). Claim emails use the same provider config and journalling as lead notifications (`claim-verification-code`, `claim-received`, `claim-approved`, `claim-rejected`, `claim-admin-notify` templates in the log).

**Testing without an email provider:** the verification code for a `verifying` claim is shown right in the admin console Claims tab (and in the notification log preview), and approving copies the owner link to your clipboard — so the whole flow is testable before any credentials exist.

Extra env vars:

```
ADMIN_NOTIFY_EMAIL=you@…        # where new-claim review notifications go
APP_BASE_URL=https://…          # base URL used in owner magic links (emails)
```

Model: `ClaimRequest` in `prisma/schema.prisma` (statuses `verifying → pending_review → approved | rejected`).

## Directory data

42,067 listings seeded via `bun scripts/seed-nurserynet.mjs` (deterministic; also exports `data/preschools.jsonl`). The generator models the real SA ECD landscape: ~300 real towns/suburbs with coordinates, provincial density weights, language-appropriate naming, realistic fee bands and facility mix, DSD registration numbers.

Listings are flagged `Unverified` / `AI-Enriched` by default (the synthetic seed's fake "Owner-Claimed" flags were reset to `AI-Enriched` once the real claim flow landed — that badge now only appears on genuinely approved claims). To upgrade them with real scraped data, run raw Google Maps listings through the included pipeline in `src/scripts/enrich-nurseries.ts` (hygiene filter + AI enrichment prompt + `applyEnrichment()`), per the core-engine spec.

## Useful commands

```bash
bun run dev              # dev server (auto-runs in sandbox)
bun run lint             # ESLint
bun run db:push          # apply prisma/schema.prisma to SQLite
bun scripts/seed-nurserynet.mjs   # regenerate + reseed the 42k dataset
```

## Key files

- `src/lib/notifications.ts` — email + WhatsApp provider abstraction, templates, journalling, retry, claim emails
- `src/lib/stitch.ts` — Stitch OAuth, payment request creation, Svix webhook verification
- `src/lib/admin-auth.ts` — shared admin-key gate for console APIs
- `src/app/api/tour-booking/route.ts` — lead capture → notifications
- `src/app/api/claims/*` — claim submit / verify code / resend
- `src/app/api/admin/claims/review/route.ts` — approve / reject + owner token issue
- `src/app/api/owner/*` — token-gated owner dashboard data + listing updates
- `src/app/api/payments/*` — checkout, status, webhook
- `src/app/api/admin/leads/route.ts` — admin console data (incl. claims)
- `src/components/directory/ClaimListingModal.tsx` — claim form + OTP step
- `src/components/owner/OwnerDashboardView.tsx` — owner listing editor + leads
- `src/components/directory/*` — directory UI, detail modal, booking modal
- `src/config/tiers.ts` — subscription tiers
- `scripts/browser_claim_flow.py`, `scripts/browser_admin_owner_flow.py` — end-to-end browser tests of the claim lifecycle (run against a local dev server)
