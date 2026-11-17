import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getGeminiClient, hasValidGeminiApiKey } from '@/lib/gemini';
import type { CustomApplicationField } from '@/lib/application-types';

interface CandidateSchoolSummary {
  id: string;
  name: string;
  city: string;
  suburb: string;
  province: string;
  monthlyFeeZAR: number;
  isVerified: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      promptText = '',
      documentImageBase64 = '',
      documentMimeType = 'image/jpeg',
      customFields = [] as CustomApplicationField[],
      candidateSchools = [] as CandidateSchoolSummary[],
    } = body;

    if (!promptText.trim() && !documentImageBase64) {
      return NextResponse.json(
        { error: 'Please provide family details or upload an admission document to autofill.' },
        { status: 400 }
      );
    }

    if (!hasValidGeminiApiKey()) {
      return NextResponse.json(
        {
          error:
            'Gemini API key is missing or invalid. Please configure a valid GEMINI_API_KEY in Settings > Secrets.',
          code: 'GEMINI_API_KEY_INVALID',
        },
        { status: 401 }
      );
    }

    const ai = getGeminiClient();

    const customFieldsContext =
      Array.isArray(customFields) && customFields.length > 0
        ? customFields
            .map((f, idx) => {
              const opts =
                f.type === 'select' && f.options?.length
                  ? ` (Allowed options: ${f.options.join(' | ')})`
                  : f.type === 'checkbox'
                  ? ' (Allowed values: "Yes" or "No")'
                  : '';
              return `${idx + 1}. Label: "${f.label}" | Type: ${f.type}${opts}`;
            })
            .join('\n')
        : 'None';

    const schoolsContext =
      Array.isArray(candidateSchools) && candidateSchools.length > 0
        ? candidateSchools
            .slice(0, 20)
            .map(
              (s) =>
                `- ID: "${s.id}" | ${s.name} (${s.suburb}, ${s.city}, ${s.province}) | R${s.monthlyFeeZAR}/mo | Verified: ${s.isVerified}`
            )
            .join('\n')
        : 'None';

    const systemInstruction = `You are an Agentic Preschool Enrolment Assistant for NurseryNet South Africa.
Your job is to extract and infer complete preschool application fields from a parent's free-form note, voice transcript, WhatsApp message, or uploaded South African birth certificate / clinic card / ID document.

Rules:
1. Date of Birth & Age Group:
   - Today's date is 2026-11-17.
   - Format childDateOfBirth as YYYY-MM-DD. If the parent gives an age (e.g. "2 years old" or "18 months") without an exact date, infer a reasonable YYYY-MM-DD birth date matching that age.
   - Map childAgeGroup to EXACTLY one of:
     - "Infant / Baby Care (3–12 months)"
     - "Toddler (1–3 years)"
     - "Preschool (3–4 years)"
     - "Grade R / Pre-Primary (5–6 years)"
2. Preferred Start Date:
   - Map preferredStartDate to EXACTLY one of:
     - "Immediate Enrolment"
     - "Next Month"
     - "January 2027 (Term 1)"
     - "April 2027 (Term 2)"
3. Parent Relationship:
   - Map parentRelationship to EXACTLY one of: "Mother", "Father", "Legal Guardian", "Grandparent".
4. Custom School Questions:
   - For EVERY custom field listed below, provide an entry in customFieldAnswers with the exact "questionLabel" and the best matching "answer".
   - If a custom field is of type "select", you MUST pick one of its allowed options.
   - If a custom field is of type "checkbox", you MUST output "Yes" or "No".
5. Multi-School Recommendations:
   - If the parent asks to also apply to or add matching schools (e.g. by suburb, city, or budget), return their matching IDs in recommendedSchoolIds from the candidate list. Otherwise return an empty array.

Custom School Fields to populate:
${customFieldsContext}

Candidate Preschools (if parent requests batch matching):
${schoolsContext}`;

    const parts: any[] = [];
    if (documentImageBase64) {
      const cleanedBase64 = documentImageBase64.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: documentMimeType || 'image/jpeg',
          data: cleanedBase64,
        },
      });
    }
    parts.push({
      text:
        promptText.trim() ||
        'Extract all child, parent, ID, date of birth, and enrolment details from this document.',
    });

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            childFullName: { type: Type.STRING },
            childDateOfBirth: { type: Type.STRING, description: 'YYYY-MM-DD' },
            childAgeGroup: { type: Type.STRING },
            preferredStartDate: { type: Type.STRING },
            parentFullName: { type: Type.STRING },
            parentRelationship: { type: Type.STRING },
            parentIdOrPassport: { type: Type.STRING },
            parentPhone: { type: Type.STRING },
            parentEmail: { type: Type.STRING },
            residentialAddress: { type: Type.STRING },
            medicalAllergies: { type: Type.STRING },
            emergencyContactName: { type: Type.STRING },
            emergencyContactPhone: { type: Type.STRING },
            customFieldAnswers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionLabel: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ['questionLabel', 'answer'],
              },
            },
            recommendedSchoolIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            agentReasoningSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 concise bullet steps explaining what the agent extracted, calculated, and mapped.',
            },
            agentSummary: {
              type: Type.STRING,
              description: 'One concise sentence summarizing the autofilled application.',
            },
          },
          required: [
            'childFullName',
            'childDateOfBirth',
            'childAgeGroup',
            'preferredStartDate',
            'parentFullName',
            'parentRelationship',
            'parentPhone',
            'parentEmail',
            'customFieldAnswers',
            'agentReasoningSteps',
            'agentSummary',
          ],
        },
      },
    });

    const rawText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(rawText);

    return NextResponse.json({
      autofill: parsed,
    });
  } catch (err: any) {
    console.error('Agentic autofill error:', err);
    const message = err?.message || 'Failed to run agentic autofill';
    const isAuthError =
      message.includes('GEMINI_API_KEY') ||
      message.includes('API_KEY_INVALID') ||
      message.includes('PERMISSION_DENIED') ||
      err?.status === 401 ||
      err?.status === 403;

    return NextResponse.json(
      {
        error: isAuthError
          ? 'Please check or select your Gemini API key in the Settings > Secrets panel.'
          : message,
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
