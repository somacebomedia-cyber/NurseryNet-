import { LiveSearchHighlight, LiveSearchResponse, LiveSearchSource } from './live-search-types';

export type VoiceActionType =
  | 'search_directory'
  | 'claim_school'
  | 'search_funding'
  | 'navigate';

export interface VoiceAction {
  type: VoiceActionType;
  query?: string;
  province?: string;
  municipality?: string;
  runLiveSearch?: boolean;
  highlight?: LiveSearchHighlight;
  liveSearchPayload?: LiveSearchResponse;
  path?: string;
}

export interface VoiceAssistantResponse {
  spokenText: string;
  displaySummary: string;
  intent: 'preschool_search' | 'claim_school' | 'funding_info' | 'general_ecd';
  action?: VoiceAction;
  highlights?: LiveSearchHighlight[];
  sources?: LiveSearchSource[];
  liveSearchPayload?: LiveSearchResponse;
}

export interface VoiceTurnMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  highlights?: LiveSearchHighlight[];
  sources?: LiveSearchSource[];
  action?: VoiceAction;
}

export const VOICE_ACTION_EVENT = 'nurserynet:voice-action';
export const PENDING_VOICE_ACTION_KEY = 'nurserynet_pending_voice_action_v1';

export function dispatchVoiceAction(action: VoiceAction) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PENDING_VOICE_ACTION_KEY, JSON.stringify(action));
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(new CustomEvent<VoiceAction>(VOICE_ACTION_EVENT, { detail: action }));
}

export function consumePendingVoiceAction(): VoiceAction | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PENDING_VOICE_ACTION_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_VOICE_ACTION_KEY);
    return JSON.parse(raw) as VoiceAction;
  } catch {
    return null;
  }
}
