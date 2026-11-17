import { GoogleGenAI } from '@google/genai';

let cachedClient: GoogleGenAI | null = null;
let cachedKey: string | null = null;

export function getValidGeminiApiKey(): string | null {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY,
  ];

  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    const trimmed = raw.trim().replace(/^["']|["']$/g, '');
    // Real Google Gemini API keys start with "AIza" and are ~39 characters long
    if (trimmed.startsWith('AIza') && trimmed.length >= 30) {
      return trimmed;
    }
  }
  return null;
}

export function hasValidGeminiApiKey(): boolean {
  return getValidGeminiApiKey() !== null;
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = getValidGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_INVALID_OR_MISSING');
  }
  if (!cachedClient || cachedKey !== apiKey) {
    cachedKey = apiKey;
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}
