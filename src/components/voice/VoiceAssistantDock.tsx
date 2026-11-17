"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Globe,
  BadgeCheck,
  ExternalLink,
  Clock,
  Loader2,
  Radio,
  Square,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  dispatchVoiceAction,
  VoiceAction,
  VoiceAssistantResponse,
  VoiceTurnMessage,
} from '@/lib/voice-types';
import { LiveSearchHighlight } from '@/lib/live-search-types';
import LiveSearchSources from '@/components/directory/LiveSearchSources';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

const QUICK_VOICE_PROMPTS = [
  {
    label: 'Find Nawi Learn Toddler Centre',
    prompt: 'Find Nawi Learn Toddler Centre in Umzimkhulu',
  },
  {
    label: 'Add & claim Nawi Learn',
    prompt: 'Add and claim Nawi Learn Toddler Centre on the directory',
  },
  {
    label: 'DSD R17/day subsidy guide',
    prompt: 'How do I apply for the R17 per child DSD ECD subsidy?',
  },
  {
    label: 'Search Soweto preschools',
    prompt: 'Find registered preschools in Soweto',
  },
];

export default function VoiceAssistantDock() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [barLevels, setBarLevels] = useState<number[]>(() => Array(14).fill(18));

  const [messages, setMessages] = useState<VoiceTurnMessage[]>([
    {
      id: 'welcome-voice',
      role: 'assistant',
      text: "Sawubona! I'm your NurseryNet Live Voice Assistant. Tap the microphone and ask me to find any South African preschool (even unlisted ones like Nawi Learn Toddler Centre), claim your school listing, or explain DSD subsidies.",
      timestamp: new Date().toISOString(),
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<VoiceTurnMessage[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(Boolean(SpeechRec));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, liveTranscript, isOpen]);

  const stopAudioVisualizer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setBarLevels(Array(14).fill(18));
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceState((prev) => (prev === 'speaking' ? 'idle' : prev));
  }, []);

  const speakResponse = useCallback(
    (text: string) => {
      if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setVoiceState('idle');
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-ZA';
        utterance.rate = 1.02;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
          voices.find((v) => v.lang.toLowerCase().includes('en-za')) ||
          voices.find(
            (v) =>
              v.lang.toLowerCase().startsWith('en') &&
              /natural|google|female|samantha|karen|victoria/i.test(v.name)
          ) ||
          voices.find((v) => v.lang.toLowerCase().startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          setVoiceState('speaking');
        };
        utterance.onend = () => {
          setVoiceState('idle');
        };
        utterance.onerror = () => {
          setVoiceState('idle');
        };

        setVoiceState('speaking');
        window.speechSynthesis.speak(utterance);
      } catch {
        setVoiceState('idle');
      }
    },
    [isMuted]
  );

  // Animate bars during speaking state
  useEffect(() => {
    if (voiceState !== 'speaking') return;
    const interval = setInterval(() => {
      setBarLevels(
        Array.from({ length: 14 }, (_, idx) => {
          const wave = Math.sin(Date.now() / 140 + idx * 0.6) * 28 + 38;
          return Math.max(16, Math.min(92, Math.round(wave + (Math.random() * 20 - 10))));
        })
      );
    }, 90);
    return () => {
      clearInterval(interval);
      setBarLevels(Array(14).fill(18));
    };
  }, [voiceState]);

  const executeVoiceAction = useCallback(
    (action: VoiceAction) => {
      dispatchVoiceAction(action);

      if (action.type === 'search_directory' || action.type === 'claim_school') {
        if (pathname !== '/directory') {
          router.push('/directory');
        }
      } else if (action.type === 'search_funding') {
        if (pathname !== '/funding') {
          router.push('/funding');
        }
      } else if (action.type === 'navigate' && action.path) {
        if (pathname !== action.path) {
          router.push(action.path);
        }
      }
    },
    [pathname, router]
  );

  const sendVoiceTurn = useCallback(
    async (rawInput: string) => {
      const cleaned = rawInput.trim();
      if (!cleaned) return;

      stopSpeaking();
      setMicError(null);
      setLiveTranscript('');
      setVoiceState('processing');

      const userMsg: VoiceTurnMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: cleaned,
        timestamp: new Date().toISOString(),
      };

      const historyPayload = messagesRef.current.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await fetch('/api/voice-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: cleaned,
            currentPath: pathname,
            history: historyPayload,
          }),
        });

        const data = (await res.json()) as VoiceAssistantResponse & { error?: string };

        if (!res.ok || data.error) {
          const fallbackErr =
            data.error || 'I had trouble processing that request. Please try speaking again.';
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              text: fallbackErr,
              timestamp: new Date().toISOString(),
            },
          ]);
          setVoiceState('idle');
          return;
        }

        const assistantMsg: VoiceTurnMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.spokenText || data.displaySummary,
          timestamp: new Date().toISOString(),
          highlights: data.highlights,
          sources: data.sources,
          action: data.action,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (data.action) {
          executeVoiceAction(data.action);
        }

        speakResponse(data.spokenText || data.displaySummary);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: 'Could not reach the NurseryNet voice service. Please check your connection and try again.',
            timestamp: new Date().toISOString(),
          },
        ]);
        setVoiceState('idle');
      }
    },
    [executeVoiceAction, pathname, speakResponse, stopSpeaking]
  );

  const startMicrophoneVisualizer = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateBars = () => {
        analyser.getByteFrequencyData(dataArray);
        const nextBars = Array.from({ length: 14 }, (_, i) => {
          const val = dataArray[i + 1] || 0;
          return Math.max(16, Math.min(96, Math.round((val / 255) * 85 + 16)));
        });
        setBarLevels(nextBars);
        animFrameRef.current = requestAnimationFrame(updateBars);
      };
      animFrameRef.current = requestAnimationFrame(updateBars);
    } catch {
      // Visualizer is optional if mic stream is already claimed by SpeechRecognition
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    stopAudioVisualizer();
    setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
  }, [stopAudioVisualizer]);

  const startListening = useCallback(() => {
    setIsOpen(true);
    stopSpeaking();
    setMicError(null);

    if (typeof window === 'undefined') return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setSpeechSupported(false);
      setMicError(
        'Browser speech recognition is unavailable in this view. Use the quick voice prompts or type below to talk with the voice assistant.'
      );
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'en-ZA';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      let finalCaptured = '';

      recognition.onstart = () => {
        setVoiceState('listening');
        setLiveTranscript('');
        startMicrophoneVisualizer();
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalCaptured += transcriptPiece;
          } else {
            interim += transcriptPiece;
          }
        }
        setLiveTranscript((finalCaptured || interim).trim());
      };

      recognition.onerror = (event: any) => {
        stopAudioVisualizer();
        setVoiceState('idle');
        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          setMicError(
            'Microphone access was blocked. Allow microphone permission or tap any voice prompt below.'
          );
        } else if (event?.error !== 'aborted' && event?.error !== 'no-speech') {
          setMicError('Could not capture audio clearly. Tap the mic to try again or use a prompt below.');
        }
      };

      recognition.onend = () => {
        stopAudioVisualizer();
        recognitionRef.current = null;
        const spoken = finalCaptured.trim();
        if (spoken) {
          sendVoiceTurn(spoken);
        } else {
          setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setVoiceState('idle');
      setMicError('Unable to start microphone capture. Tap a voice prompt or type below.');
    }
  }, [sendVoiceTurn, startMicrophoneVisualizer, stopAudioVisualizer, stopSpeaking]);

  const handleToggleMic = () => {
    if (voiceState === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClaimHighlightFromVoice = (item: LiveSearchHighlight) => {
    executeVoiceAction({
      type: 'claim_school',
      query: item.title,
      highlight: item,
    });
  };

  const handleOpenInDirectoryFromVoice = (item: LiveSearchHighlight) => {
    executeVoiceAction({
      type: 'search_directory',
      query: item.title,
      runLiveSearch: true,
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expanded Voice Conversational Dock */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[410px] max-h-[80vh] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Top Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-primary via-purple-700 to-indigo-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm">
                <Radio
                  className={`w-5 h-5 text-white ${
                    voiceState === 'listening' || voiceState === 'speaking' ? 'animate-pulse' : ''
                  }`}
                />
                <span
                  className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-purple-800 ${
                    voiceState === 'listening'
                      ? 'bg-rose-400 animate-ping'
                      : voiceState === 'speaking'
                      ? 'bg-emerald-400 animate-pulse'
                      : voiceState === 'processing'
                      ? 'bg-amber-300 animate-pulse'
                      : 'bg-emerald-400'
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-sm tracking-tight">
                    NurseryNet Live Voice
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                    {voiceState === 'listening'
                      ? 'Listening'
                      : voiceState === 'processing'
                      ? 'Thinking'
                      : voiceState === 'speaking'
                      ? 'Speaking'
                      : 'Live'}
                  </span>
                </div>
                <p className="text-[11px] text-white/80">
                  Find preschools, claim listings &amp; ask ECD questions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const nextMute = !isMuted;
                  setIsMuted(nextMute);
                  if (nextMute) stopSpeaking();
                }}
                className="p-2 rounded-lg text-white/85 hover:text-white hover:bg-white/15 transition-colors"
                title={isMuted ? 'Unmute voice output' : 'Mute voice output'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  stopListening();
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-2 rounded-lg text-white/85 hover:text-white hover:bg-white/15 transition-colors"
                title="Minimize voice assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Audio Waveform & Mic Control Strip */}
          <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={handleToggleMic}
                disabled={voiceState === 'processing'}
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-md ${
                  voiceState === 'listening'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/25'
                    : 'bg-primary hover:bg-primary/90 text-white'
                }`}
                title={voiceState === 'listening' ? 'Stop listening' : 'Tap to speak'}
              >
                {voiceState === 'listening' ? (
                  <MicOff className="w-5 h-5" />
                ) : voiceState === 'processing' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                {/* 14-Bar Live Audio Visualizer */}
                <div className="flex items-center gap-1 h-6">
                  {barLevels.map((lvl, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 rounded-full transition-all duration-75 ${
                        voiceState === 'listening'
                          ? 'bg-rose-500'
                          : voiceState === 'speaking'
                          ? 'bg-primary'
                          : 'bg-muted-foreground/30'
                      }`}
                      style={{ height: `${Math.max(20, lvl)}%` }}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-medium text-muted-foreground truncate mt-1">
                  {voiceState === 'listening'
                    ? liveTranscript || 'Speak now — e.g. "Find Nawi Learn Toddler Centre"...'
                    : voiceState === 'processing'
                    ? 'Searching directory & live South African web...'
                    : voiceState === 'speaking'
                    ? 'Speaking response aloud...'
                    : 'Tap the mic or choose a voice prompt below'}
                </p>
              </div>
            </div>

            {voiceState === 'speaking' && (
              <Button
                size="sm"
                variant="outline"
                onClick={stopSpeaking}
                className="h-8 px-2.5 text-xs font-bold rounded-lg shrink-0 gap-1"
              >
                <Square className="w-3 h-3 fill-current" />
                Stop
              </Button>
            )}
          </div>

          {micError && (
            <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              {micError}
            </div>
          )}

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground font-medium rounded-br-sm'
                      : 'bg-muted/70 text-foreground border border-border rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Discovered Preschool / Funding Cards */}
                {msg.highlights && msg.highlights.length > 0 && (
                  <div className="w-full mt-2 space-y-2">
                    {msg.highlights.slice(0, 2).map((item, idx) => (
                      <div
                        key={`${msg.id}-hl-${idx}`}
                        className="p-3 rounded-xl bg-background border border-border shadow-sm space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-heading font-bold text-xs text-foreground truncate">
                              {item.title}
                            </h4>
                            {item.subtitle && (
                              <p className="text-[11px] text-muted-foreground truncate">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          {item.feeOrAmount && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shrink-0">
                              {item.feeOrAmount}
                            </span>
                          )}
                        </div>

                        {(item.hoursOrDeadline || item.websiteUrl) && (
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            {item.hoursOrDeadline && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-primary" />
                                {item.hoursOrDeadline}
                              </span>
                            )}
                            {item.websiteUrl && (
                              <a
                                href={item.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary font-bold hover:underline"
                              >
                                <Globe className="w-3 h-3" />
                                Official Website
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        )}

                        <div className="pt-1.5 border-t border-border/60 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleOpenInDirectoryFromVoice(item)}
                            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                          >
                            View in Directory
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          <Button
                            size="sm"
                            onClick={() => handleClaimHighlightFromVoice(item)}
                            className="h-7 px-2.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <BadgeCheck className="w-3.5 h-3.5" />
                            Add &amp; Claim
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.sources && msg.sources.length > 0 && (
                  <div className="w-full mt-1.5 px-1">
                    <LiveSearchSources sources={msg.sources.slice(0, 3)} />
                  </div>
                )}
              </div>
            ))}
            <div ref={scrollEndRef} />
          </div>

          {/* Starter Voice Prompts */}
          <div className="px-3.5 py-2 bg-muted/30 border-t border-border">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {QUICK_VOICE_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendVoiceTurn(qp.prompt)}
                  disabled={voiceState === 'processing'}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-background hover:bg-primary/10 hover:text-primary border border-border text-foreground whitespace-nowrap transition-colors shrink-0"
                >
                  “{qp.label}”
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!textInput.trim() || voiceState === 'processing') return;
              const toSend = textInput;
              setTextInput('');
              sendVoiceTurn(toSend);
            }}
            className="p-3 bg-card border-t border-border flex items-center gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                speechSupported
                  ? 'Speak with the mic or type a question...'
                  : 'Ask to find or claim a preschool...'
              }
              className="flex-1 text-xs py-2 px-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!textInput.trim() || voiceState === 'processing'}
              className="h-8 w-8 p-0 rounded-xl shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}

      {/* Floating Launcher Bar */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <button
            onClick={startListening}
            className="h-12 px-4 rounded-2xl bg-gradient-to-r from-primary via-purple-700 to-indigo-800 hover:opacity-95 text-white shadow-xl flex items-center gap-2.5 font-heading font-bold text-sm transition-all border border-white/15"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
            </span>
            <Mic className="w-4 h-4" />
            <span>Live Voice Assistant</span>
          </button>
        )}

        {isOpen && (
          <button
            onClick={handleToggleMic}
            className={`h-12 px-4 rounded-2xl shadow-xl flex items-center gap-2 font-heading font-bold text-sm transition-all text-white ${
              voiceState === 'listening'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {voiceState === 'listening' ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Tap to Speak</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
