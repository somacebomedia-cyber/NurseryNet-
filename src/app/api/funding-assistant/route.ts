import { NextRequest, NextResponse } from 'next/server';
import { ThinkingLevel, Type } from '@google/genai';
import { getGeminiClient, hasValidGeminiApiKey } from '@/lib/gemini';
import {
  CURRENT_DBE_DAILY_SUBSIDY_ZAR,
  MAX_SUBSIDY_DAYS_PER_YEAR,
  VERIFIED_SA_ECD_GRANTS,
} from '@/lib/firestore-funding';

export interface FundingAssistantRequestBody {
  schoolName: string;
  province: string;
  municipality?: string;
  npoNumber?: string;
  registrationStatus: 'full' | 'conditional' | 'unregistered';
  qualifyingChildren: number;
  grantId: string;
  grantTitle?: string;
  funderName?: string;
  requestedAmountZAR?: number;
  projectFocus: string;
}

export interface GeneratedGrantProposalResponse {
  grantId: string;
  grantTitle: string;
  funderName: string;
  requestedAmountZAR: number;
  executiveSummary: string;
  budgetBreakdown: string;
  fullProposalText: string;
  complianceTips: string[];
  generatedAt: string;
}

function buildDeterministicSaEcdProposal(body: FundingAssistantRequestBody): GeneratedGrantProposalResponse {
  const matchedGrant =
    VERIFIED_SA_ECD_GRANTS.find((g) => g.id === body.grantId) || VERIFIED_SA_ECD_GRANTS[0];
  const schoolName = (body.schoolName || 'Sunshine Early Learning Centre').trim();
  const province = (body.province || 'Gauteng').trim();
  const municipality = (body.municipality || 'Local Municipality').trim();
  const npoLabel = body.npoNumber?.trim() ? `NPO #${body.npoNumber.trim()}` : 'NPO Registration on File';
  const childrenCount = Math.max(5, Number(body.qualifyingChildren) || 35);
  const regLabel =
    body.registrationStatus === 'full'
      ? 'Full (Gold) DBE Partial Care & ECD Programme Registration'
      : body.registrationStatus === 'conditional'
      ? 'Conditional (Silver) DBE Registration advancing to Full Compliance'
      : 'Vangasali Bronze Registration Candidate';

  const isDbeSubsidy = matchedGrant.id === 'dbe-per-child-subsidy';
  const annualDbeTotal = childrenCount * CURRENT_DBE_DAILY_SUBSIDY_ZAR * MAX_SUBSIDY_DAYS_PER_YEAR;
  const requestedZAR = isDbeSubsidy
    ? annualDbeTotal
    : Math.max(15000, Number(body.requestedAmountZAR) || matchedGrant.estimatedZAR);

  const projectFocus =
    (body.projectFocus || '').trim() ||
    'Daily fortified child nutrition, NQF Level 4 practitioner stipends, and early learning stimulation resources';

  const item1Amount = Math.round(requestedZAR * 0.5);
  const item2Amount = Math.round(requestedZAR * 0.3);
  const item3Amount = requestedZAR - item1Amount - item2Amount;

  const budgetBreakdown = isDbeSubsidy
    ? [
        `1. Child Nutrition & Daily Balanced Meals (50% Ring-Fenced): R${item1Amount.toLocaleString()} ZAR`,
        `   - Fortified breakfast porridge, fresh fruit, vegetables, and protein lunches for ${childrenCount} qualifying children across ${MAX_SUBSIDY_DAYS_PER_YEAR} operational days.`,
        `2. Practitioner & Cook Stipends (30% Ring-Fenced): R${item2Amount.toLocaleString()} ZAR`,
        `   - Monthly stipend top-ups for qualified NQF Level 4 practitioners and kitchen staff.`,
        `3. Early Learning Stimulation Materials & Admin (20% Cap): R${item3Amount.toLocaleString()} ZAR`,
        `   - Age-appropriate NCF 0-4 literacy/numeracy kits, sanitation supplies, and audit stationery.`,
        `TOTAL ANNUAL DBE SUBSIDY ALLOCATION (${childrenCount} children x R24.00/day x ${MAX_SUBSIDY_DAYS_PER_YEAR} days): R${requestedZAR.toLocaleString()} ZAR`,
      ].join('\n')
    : [
        `1. Direct Capital / Programme Implementation (50%): R${item1Amount.toLocaleString()} ZAR`,
        `   - Core procurement and installation for: ${projectFocus}.`,
        `2. Learning Equipment, Safety & Educational Materials (30%): R${item2Amount.toLocaleString()} ZAR`,
        `   - Durable classroom furniture, gross-motor play equipment, and NCF-aligned Bilingual Storybooks.`,
        `3. Practitioner Capacity Building, Governance & Audit (20%): R${item3Amount.toLocaleString()} ZAR`,
        `   - Staff training, municipal environmental health compliance certification, and accounting officer verification.`,
        `TOTAL GRANT REQUESTED FROM ${matchedGrant.provider.toUpperCase()}: R${requestedZAR.toLocaleString()} ZAR`,
      ].join('\n');

  const executiveSummary = `${schoolName} (${npoLabel}), located in ${municipality}, ${province}, respectfully submits this funding motivation to ${matchedGrant.provider} under the ${matchedGrant.title} window for an allocation of R${requestedZAR.toLocaleString()} ZAR. Our centre currently serves ${childrenCount} vulnerable young children (ages 0–5 and Grade R) from low-income and SASSA Child Support Grant households, holding ${regLabel}. This grant will directly fund ${projectFocus.toLowerCase()}, guaranteeing compliance with the South African National Curriculum Framework (NCF 0–4) and National Integrated Early Childhood Development Policy.`;

  const fullProposalText = `OFFICIAL SOUTH AFRICAN ECD GRANT PROPOSAL & MOTIVATION LETTER

DATE: ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}
TO: The Grants Adjudication Committee, ${matchedGrant.provider}
PROGRAMME WINDOW: ${matchedGrant.title}
APPLICANT INSTITUTION: ${schoolName} (${npoLabel})
PROVINCE & MUNICIPALITY: ${municipality}, ${province}, Republic of South Africa
REGISTRATION STATUS: ${regLabel}
AMOUNT REQUESTED: R${requestedZAR.toLocaleString()} ZAR

================================================================================
1. EXECUTIVE SUMMARY & INSTITUTIONAL BACKGROUND
================================================================================
${executiveSummary}

As a community-rooted Early Childhood Development facility in ${province}, ${schoolName} operates 5 days a week (07:00 – 17:30) providing safe custodial care, structured early cognitive stimulation, and daily cooked meals so parents and single caregivers can seek employment or attend work with peace of mind.

================================================================================
2. STATEMENT OF COMMUNITY NEED & BENEFICIARY PROFILE
================================================================================
In our immediate catchment area in ${municipality} (${province}), early childhood poverty and nutritional stunting remain urgent barriers to Grade R and Foundation Phase readiness. Out of our enrolled learners, ${childrenCount} children come from households earning below the provincial means-test threshold or relying on SASSA Child Support Grants.

Without targeted grant support for ${projectFocus.toLowerCase()}, families cannot absorb higher monthly tuition fees without withdrawing their children from structured early learning.

================================================================================
3. PROJECT OBJECTIVES & ALIGNMENT WITH DBE / NCF STANDARDS
================================================================================
With the requested R${requestedZAR.toLocaleString()} ZAR funding from ${matchedGrant.provider}, ${schoolName} will execute three measurable milestones over the next 12 months:
1. Immediate Implementation: Execute ${projectFocus} within 45 days of tranche disbursement using verified local South African suppliers.
2. Nutritional & Pedagogical Impact: Deliver daily balanced meals (breakfast and warm lunch) alongside structured NCF 0–4 emergent literacy, numeracy, and gross-motor routines for ${childrenCount} children.
3. Statutory & Audit Compliance: Maintain daily learner attendance registers, parent means-test affidavits, and Municipal Environmental Health Certificates in our permanent 5-year audit file.

================================================================================
4. RING-FENCED BUDGET BREAKDOWN (ZAR)
================================================================================
${budgetBreakdown}

================================================================================
5. GOVERNANCE, FINANCIAL CONTROLS & SUSTAINABILITY
================================================================================
${schoolName} is governed by an active Non-Profit Management Committee (Chairperson, Treasurer, Secretary, and Parent Representatives). All grant disbursements are received into our dedicated two-signatory NPO bank account. Every expenditure is backed by original supplier tax invoices, EFT proofs, and quarterly reconciliation ledgers reviewed by an independent Accounting Officer.

We thank ${matchedGrant.provider} for its continued investment in South Africa's youngest citizens and welcome an on-site verification visit by your provincial adjudication officers at any time.

Yours faithfully,

_______________________________________
The Principal & NPO Chairperson
${schoolName} (${npoLabel})
${municipality}, ${province}`;

  return {
    grantId: matchedGrant.id,
    grantTitle: matchedGrant.title,
    funderName: matchedGrant.provider,
    requestedAmountZAR: requestedZAR,
    executiveSummary,
    budgetBreakdown,
    fullProposalText,
    complianceTips: [
      'Attach a certified copy of your NPO Certificate and signed NPO Constitution (not older than 3 months).',
      'Include your bank confirmation letter confirming two non-related NPO committee signatories.',
      isDbeSubsidy
        ? `Ensure all ${childrenCount} qualifying learners have signed Parent Means-Test Affidavits and Road-to-Health clinic card copies on file.`
        : 'Attach 3 comparable quotes from South African suppliers for every capital or equipment line item.',
    ],
    generatedAt: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  let body: FundingAssistantRequestBody;
  try {
    body = (await req.json()) as FundingAssistantRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  if (!body || !body.schoolName?.trim()) {
    return NextResponse.json({ error: 'School name is required to draft a grant proposal.' }, { status: 400 });
  }

  const fallbackProposal = buildDeterministicSaEcdProposal(body);

  if (hasValidGeminiApiKey()) {
    try {
      const ai = getGeminiClient();
      const matchedGrant =
        VERIFIED_SA_ECD_GRANTS.find((g) => g.id === body.grantId) || VERIFIED_SA_ECD_GRANTS[0];

      const prompt = `Draft a comprehensive, persuasive South African Early Childhood Development (ECD) grant proposal and formal motivation letter in ZAR for:
- Preschool Name: ${body.schoolName}
- Province & Municipality: ${body.municipality || 'Local Municipality'}, ${body.province || 'Gauteng'}
- NPO Number: ${body.npoNumber || 'Registered NPO'}
- DBE Registration Status: ${body.registrationStatus}
- Qualifying Children Count: ${body.qualifyingChildren}
- Target Grant Window: ${matchedGrant.title} (Administered by ${matchedGrant.provider})
- Requested Funding Amount: R${fallbackProposal.requestedAmountZAR.toLocaleString()} ZAR
- Specific Project Need / Funding Focus: ${body.projectFocus || 'Daily child nutrition, NQF Level 4 practitioner stipends, and infrastructure safety upgrades'}

Important South African Policy Facts to Incorporate:
- Early Childhood Development transferred from DSD to the Department of Basic Education (DBE).
- The official gazetted DBE ECD per-child subsidy is R24.00 per child per operational day (up to 264 days/year, ring-fenced 50% nutrition, 30% practitioner stipends, 20% stimulation materials/admin).
- Reference the National Curriculum Framework (NCF 0-4), Children's Act Partial Care norms, and two-signatory NPO governance.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a senior South African ECD grant writer and Department of Basic Education compliance specialist. Return a structured JSON object containing an executiveSummary, a line-item budgetBreakdown in ZAR totaling the requested amount, a formal fullProposalText ready for submission to a South African grant committee, and 3 actionable complianceTips.',
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description: '2-3 sentence executive summary of the grant application in ZAR.',
              },
              budgetBreakdown: {
                type: Type.STRING,
                description: 'Multi-line itemised budget in ZAR matching the 50/30/20 or capital grant allocation.',
              },
              fullProposalText: {
                type: Type.STRING,
                description: 'Complete formal South African grant motivation letter and implementation plan.',
              },
              complianceTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 specific South African statutory documents to attach to this submission.',
              },
            },
            required: ['executiveSummary', 'budgetBreakdown', 'fullProposalText', 'complianceTips'],
          },
        },
      });

      const rawText = (response.text || '').trim();
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (parsed.executiveSummary && parsed.fullProposalText) {
          return NextResponse.json({
            grantId: fallbackProposal.grantId,
            grantTitle: fallbackProposal.grantTitle,
            funderName: fallbackProposal.funderName,
            requestedAmountZAR: fallbackProposal.requestedAmountZAR,
            executiveSummary: String(parsed.executiveSummary).trim(),
            budgetBreakdown: String(parsed.budgetBreakdown || fallbackProposal.budgetBreakdown).trim(),
            fullProposalText: String(parsed.fullProposalText).trim(),
            complianceTips: Array.isArray(parsed.complianceTips)
              ? parsed.complianceTips.map(String).slice(0, 4)
              : fallbackProposal.complianceTips,
            generatedAt: new Date().toISOString(),
          } satisfies GeneratedGrantProposalResponse);
        }
      }
    } catch {
      // Fall back to deterministic domain-accurate South African proposal
    }
  }

  return NextResponse.json(fallbackProposal);
}
