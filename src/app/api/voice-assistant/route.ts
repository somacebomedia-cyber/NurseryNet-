import { NextRequest, NextResponse } from 'next/server';
import { ThinkingLevel } from '@google/genai';
import { getGeminiClient, getValidGeminiApiKey, hasValidGeminiApiKey } from '@/lib/gemini';
import { POST as runLiveSearchRoute } from '@/app/api/live-search/route';
import { LiveSearchResponse } from '@/lib/live-search-types';
import { VoiceAssistantResponse } from '@/lib/voice-types';
import { ECD_BENCHMARKS, PROVINCES } from '@/data/preschools';

interface VoiceRequestBody {
  transcript: string;
  currentPath?: string;
  history?: { role: 'user' | 'assistant'; text: string }[];
}

function detectProvince(text: string): string | undefined {
  const lower = text.toLowerCase();
  const aliases: Record<string, string> = {
    'kwazulu-natal': 'KwaZulu-Natal',
    'kwazulu natal': 'KwaZulu-Natal',
    kzn: 'KwaZulu-Natal',
    umzimkhulu: 'KwaZulu-Natal',
    durban: 'KwaZulu-Natal',
    pietermaritzburg: 'KwaZulu-Natal',
    gauteng: 'Gauteng',
    johannesburg: 'Gauteng',
    soweto: 'Gauteng',
    pretoria: 'Gauteng',
    sandton: 'Gauteng',
    midrand: 'Gauteng',
    centurion: 'Gauteng',
    'western cape': 'Western Cape',
    'cape town': 'Western Cape',
    stellenbosch: 'Western Cape',
    khayelitsha: 'Western Cape',
    'eastern cape': 'Eastern Cape',
    gqeberha: 'Eastern Cape',
    'port elizabeth': 'Eastern Cape',
    'east london': 'Eastern Cape',
    mthatha: 'Eastern Cape',
    limpopo: 'Limpopo',
    polokwane: 'Limpopo',
    mpumalanga: 'Mpumalanga',
    mbombela: 'Mpumalanga',
    nelspruit: 'Mpumalanga',
    'free state': 'Free State',
    bloemfontein: 'Free State',
    'north west': 'North West',
    rustenburg: 'North West',
    mahikeng: 'North West',
    'northern cape': 'Northern Cape',
    kimberley: 'Northern Cape',
  };

  for (const [key, prov] of Object.entries(aliases)) {
    if (lower.includes(key)) return prov;
  }
  for (const prov of PROVINCES) {
    if (lower.includes(prov.toLowerCase())) return prov;
  }
  return undefined;
}

function extractCleanPreschoolQuery(raw: string): string {
  let cleaned = raw
    .replace(
      /^(?:please\s+|can\s+you\s+|could\s+you\s+|i\s+want\s+to\s+|help\s+me\s+|let'?s\s+)?(?:find|search\s+for|search|look\s+up|locate|show\s+me|open|pull\s+up|load\s+up|load|add\s+and\s+claim|claim|add|register)\s+/i,
      ''
    )
    .replace(/\b(?:on\s+nurserynet|in\s+the\s+directory|to\s+the\s+directory|as\s+a\s+listing|listing|for\s+me|please)\b/gi, '')
    .replace(/[?.!]+$/g, '')
    .trim();

  if (!cleaned || cleaned.length < 2) {
    return raw.replace(/[?.!]+$/g, '').trim();
  }
  return cleaned;
}

async function callInternalLiveSearch(
  reqUrl: string,
  payload: Record<string, unknown>
): Promise<LiveSearchResponse | null> {
  try {
    const internalReq = new NextRequest(new URL('/api/live-search', reqUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res = await runLiveSearchRoute(internalReq);
    if (!res.ok) return null;
    const data = (await res.json()) as LiveSearchResponse;
    return data;
  } catch {
    return null;
  }
}

export async function GET() {
  const validKey = getValidGeminiApiKey();
  return NextResponse.json({
    liveCapable: Boolean(validKey),
    liveModel: 'gemini-3.8-live',
    voiceName: 'Zephyr',
  });
}

export async function POST(req: NextRequest) {
  let body: VoiceRequestBody;
  try {
    body = (await req.json()) as VoiceRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const transcript = (body.transcript || '').trim();
  if (!transcript) {
    return NextResponse.json(
      { error: 'Please speak or type a question for the NurseryNet Voice Assistant.' },
      { status: 400 }
    );
  }

  const lower = transcript.toLowerCase();
  const detectedProvince = detectProvince(transcript);

  // 1. Check for Claim / Add Preschool intent
  const isClaimIntent =
    /\b(claim|add\s+and\s+claim|add\s+my\s+preschool|add\s+my\s+school|add\s+my\s+cr[eè]che|claim\s+listing|publish\s+my\s+preschool|add\s+.*\s+to\s+directory)\b/i.test(
      lower
    );

  // 2. Check for Funding / Subsidy / DSD Grant intent
  const isFundingIntent =
    !isClaimIntent &&
    /\b(subsidy|subsidies|r17|grant|grants|funding|donor|dsd\s+registration|partial\s+care|npo\s+registration|stipend|bursary|sponsorship)\b/i.test(
      lower
    );

  // 3. Check for Preschool Search / Lookup intent
  const isSearchIntent =
    !isClaimIntent &&
    !isFundingIntent &&
    (/\b(find|search|look\s+up|show\s+me|where\s+is|preschool|preschools|toddler|centre|center|cr[eè]che|daycare|montessori|nursery|ecd|umzimkhulu|soweto|nawi)\b/i.test(
      lower
    ) ||
      Boolean(detectedProvince));

  // Handle Claim Intent
  if (isClaimIntent) {
    let targetQuery = extractCleanPreschoolQuery(transcript);
    if (
      (!targetQuery || /^(?:my\s+preschool|my\s+school|my\s+creche|it|this\s+school|this\s+preschool)$/i.test(targetQuery)) &&
      Array.isArray(body.history)
    ) {
      // Check recent conversation history for a school name
      for (let i = body.history.length - 1; i >= 0; i--) {
        const msg = body.history[i].text;
        const candidate = extractCleanPreschoolQuery(msg);
        if (candidate && candidate.length > 3 && !/claim|add\s+my/i.test(candidate)) {
          targetQuery = candidate;
          break;
        }
      }
    }

    if (!targetQuery || targetQuery.length < 3) {
      targetQuery = 'Nawi Learn Toddler Centre';
    }

    const liveData = await callInternalLiveSearch(req.url, {
      mode: 'directory',
      query: targetQuery,
      province: detectedProvince || '',
    });

    const topHighlight = liveData?.highlights?.[0] || {
      title: targetQuery,
      subtitle: detectedProvince ? `${detectedProvince}, South Africa` : 'South Africa',
      details: 'Discovered via NurseryNet Voice Assistant for owner claiming.',
    };

    const spokenText = topHighlight.websiteUrl
      ? `I found ${topHighlight.title} with its official website and details${
          topHighlight.feeOrAmount ? `, including fees of ${topHighlight.feeOrAmount}` : ''
        }. I've opened the Add and Claim listing form pre-filled so you can review and publish it to the directory.`
      : `I've prepared the Add and Claim listing form for ${topHighlight.title}. You can review the school details, verify ownership, and publish it immediately to the NurseryNet directory.`;

    const response: VoiceAssistantResponse = {
      spokenText,
      displaySummary: liveData?.summary || spokenText,
      intent: 'claim_school',
      highlights: liveData?.highlights?.slice(0, 3) || [topHighlight],
      sources: liveData?.sources || [],
      liveSearchPayload: liveData || undefined,
      action: {
        type: 'claim_school',
        query: targetQuery,
        province: detectedProvince,
        highlight: topHighlight,
        liveSearchPayload: liveData || undefined,
      },
    };

    return NextResponse.json(response);
  }

  // Handle Funding / DSD Subsidy Intent
  if (isFundingIntent) {
    const liveData = await callInternalLiveSearch(req.url, {
      mode: 'funding',
      query: transcript,
      province: detectedProvince || '',
    });

    const topGrant = liveData?.highlights?.[0];
    const spokenText =
      lower.includes('r17') || lower.includes('subsidy')
        ? `The South African Department of Social Development provides an ECD equitable share subsidy of R17 per qualifying child per day for up to 264 days a year. To apply, your centre needs Partial Care registration under Form 11, an NPO number, municipal health clearance, and quarterly attendance registers. I've pulled up the latest DSD and donor funding calls for you.`
        : topGrant
        ? `I found ${liveData?.highlights?.length || 1} active South African ECD funding opportunities, starting with ${topGrant.title}${
            topGrant.feeOrAmount ? ` offering ${topGrant.feeOrAmount}` : ''
          }. You can explore the eligibility requirements and official application links right here.`
        : `I've searched for South African ECD grants and Department of Social Development subsidies. Here are the key registration requirements and funding programmes available.`;

    const response: VoiceAssistantResponse = {
      spokenText,
      displaySummary: liveData?.summary || spokenText,
      intent: 'funding_info',
      highlights: liveData?.highlights?.slice(0, 4) || [],
      sources: liveData?.sources || [],
      liveSearchPayload: liveData || undefined,
      action: {
        type: 'search_funding',
        query: transcript,
        province: detectedProvince,
        liveSearchPayload: liveData || undefined,
      },
    };

    return NextResponse.json(response);
  }

  // Handle Preschool Search / Unlisted School Lookup Intent
  if (isSearchIntent) {
    const cleanQuery = extractCleanPreschoolQuery(transcript);
    const liveData = await callInternalLiveSearch(req.url, {
      mode: 'directory',
      query: cleanQuery,
      province: detectedProvince || '',
    });

    const topSchool = liveData?.highlights?.[0];
    let spokenText = '';

    if (topSchool) {
      const feePart = topSchool.feeOrAmount ? ` Monthly fees are ${topSchool.feeOrAmount}.` : '';
      const hoursPart = topSchool.hoursOrDeadline ? ` Operating hours are ${topSchool.hoursOrDeadline}.` : '';
      const webPart = topSchool.websiteUrl
        ? ` Its official website is ${topSchool.websiteUrl.replace(/^https?:\/\//, '')}.`
        : '';
      spokenText = `I found ${topSchool.title}${
        topSchool.subtitle ? ` in ${topSchool.subtitle}` : ''
      }.${feePart}${hoursPart}${webPart} I've loaded the live results in the directory so you can view details or claim the listing.`;
    } else {
      spokenText = `I searched our 20,291 South African preschool directory and the live web for ${cleanQuery}. I've opened the directory search results for you.`;
    }

    const response: VoiceAssistantResponse = {
      spokenText,
      displaySummary: liveData?.summary || spokenText,
      intent: 'preschool_search',
      highlights: liveData?.highlights?.slice(0, 4) || [],
      sources: liveData?.sources || [],
      liveSearchPayload: liveData || undefined,
      action: {
        type: 'search_directory',
        query: cleanQuery,
        province: detectedProvince,
        runLiveSearch: true,
        liveSearchPayload: liveData || undefined,
      },
    };

    return NextResponse.json(response);
  }

  // 4. General Conversational ECD Query (Use Gemini if valid API key, else domain-accurate ECD response)
  if (hasValidGeminiApiKey()) {
    try {
      const ai = getGeminiClient();
      const genRes = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: transcript,
        config: {
          systemInstruction:
            'You are the NurseryNet Voice Assistant for South African Early Childhood Development (ECD). Answer warmly and concisely in 2 to 3 spoken sentences suitable for voice output. Mention specific South African facts (ZAR fees, DSD registration, CAPS/Montessori, or claiming a preschool on NurseryNet) when relevant.',
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
      const text = (genRes.text || '').trim();
      if (text) {
        return NextResponse.json({
          spokenText: text,
          displaySummary: text,
          intent: 'general_ecd',
        } satisfies VoiceAssistantResponse);
      }
    } catch {
      // Fall through to resilient local ECD response
    }
  }

  const defaultSpoken = `Welcome to the NurseryNet Voice Assistant! I can help you search across ${ECD_BENCHMARKS.national.centres.toLocaleString()} South African preschools plus live web listings like Nawi Learn Toddler Centre, claim and publish your own preschool listing, or check DSD R17 per child day subsidy requirements. Just tell me what preschool or town you're looking for!`;

  return NextResponse.json({
    spokenText: defaultSpoken,
    displaySummary: defaultSpoken,
    intent: 'general_ecd',
  } satisfies VoiceAssistantResponse);
}
