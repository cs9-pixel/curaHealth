import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  ShieldCheck,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  CalendarCheck,
  AlertCircle,
  HelpCircle,
  Info,
  PhoneCall,
  Clock,
  AlertTriangle,
  Mic,
  MicOff,
  Square,
  X,
  Volume2,
  VolumeX,
  Volume1,
  Headphones,
} from 'lucide-react';
import { ChatMessage } from '../types';

interface AssistantViewProps {
  messages: ChatMessage[];
  loading: boolean;
  offlineMode: boolean;
  onSendMessage: (query: string) => void;
  onResetChat: () => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  messages,
  loading,
  offlineMode,
  onSendMessage,
  onResetChat,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Web Speech API Voice Dictation State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMicMutedWarning, setIsMicMutedWarning] = useState(false);

  // Text-To-Speech (TTS) State
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(false);
  const lastSpokenMsgIdRef = useRef<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isRecordingIntentRef = useRef(false);
  const finalizedTextRef = useRef('');
  const timerRef = useRef<any>(null);
  const restartTimeoutRef = useRef<any>(null);
  const baseInputRef = useRef('');
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceCounterRef = useRef(0);

  useEffect(() => {
    // Check Web Speech API availability for recognition & synthesis
    const SpeechAPI =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechAPI) {
      setSpeechSupported(false);
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTtsSupported(false);
    }

    return () => {
      isRecordingIntentRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (mediaStreamRef.current) {
        try {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch {}
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {}
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text cleaner to strip markdown stars, bullets, links, and emojis for clear voice pronunciation
  const cleanTextForSpeech = (rawText: string): string => {
    return rawText
      // Remove markdown links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove bold/italics/code markdown marks
      .replace(/[*_#`~]/g, '')
      // Remove emojis & graphical Unicode symbols
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
      // Remove bullet markers and leading hyphens
      .replace(/^[•\-*]\s+/gm, '')
      // Smooth out line breaks into readable pauses
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setIsSpeaking(false);
  };

  const speakMessage = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Toggle off if already speaking this message
    if (speakingId === id && isSpeaking) {
      stopSpeaking();
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';

    // Pick clear natural English voice if available
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferredVoice =
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Siri') ||
                v.name.includes('Enhanced'))
          ) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }
    } catch {}

    utterance.onstart = () => {
      setSpeakingId(id);
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setSpeakingId(null);
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Auto-speak newly arrived assistant responses when autoSpeakEnabled is true
  useEffect(() => {
    if (!autoSpeakEnabled || messages.length === 0 || loading) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'assistant' && lastMsg.id !== lastSpokenMsgIdRef.current) {
      lastSpokenMsgIdRef.current = lastMsg.id;
      speakMessage(lastMsg.id, lastMsg.content);
    }
  }, [messages, autoSpeakEnabled, loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const startRecording = async () => {
    setSpeechError(null);
    setIsMicMutedWarning(false);
    setLiveTranscript('');
    finalizedTextRef.current = '';
    baseInputRef.current = input.trim();
    isRecordingIntentRef.current = true;

    // 1. Request microphone via getUserMedia for hardware access & browser permission prompt
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Set up Web Audio API volume level detection for real visualizer
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.5;
            source.connect(analyser);
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            silenceCounterRef.current = 0;
            const checkVolume = () => {
              if (!isRecordingIntentRef.current) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const avg = sum / bufferLength;
              const normalized = Math.min(100, Math.round((avg / 128) * 100));
              setAudioLevel(normalized);

              // Detect hardware mic silence / muted device
              if (normalized < 2) {
                silenceCounterRef.current += 1;
                if (silenceCounterRef.current > 35) {
                  setIsMicMutedWarning(true);
                }
              } else {
                silenceCounterRef.current = 0;
                setIsMicMutedWarning(false);
              }

              animationFrameRef.current = requestAnimationFrame(checkVolume);
            };
            checkVolume();
          }
        } catch (audioErr) {
          console.warn('AudioContext volume meter note:', audioErr);
        }
      } catch (micErr: any) {
        console.warn('Microphone permission check:', micErr);
        isRecordingIntentRef.current = false;
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          setSpeechError('Microphone permission denied. Please click the camera/microphone icon in your browser address bar to allow microphone access.');
        } else if (micErr.name === 'NotFoundError' || micErr.name === 'DevicesNotFoundError') {
          setSpeechError('No microphone hardware detected on this device. Please connect an audio input device.');
        } else {
          setSpeechError(`Could not access microphone: ${micErr.message || 'Please check mic permissions.'}`);
        }
        return;
      }
    }

    // 2. Initialize Web Speech Recognition
    const SpeechAPI =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechAPI) {
      setSpeechSupported(false);
      setIsRecording(true);
      setRecordingSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      setSpeechError('Live speech recognition is not natively supported in this browser (e.g. Firefox). You can tap any quick dictation prompt below or use Chrome/Edge/Safari.');
      return;
    }

    setSpeechSupported(true);
    setIsRecording(true);
    setRecordingSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    const initRecognitionSession = () => {
      if (!isRecordingIntentRef.current) return;

      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {}
        }

        const recognition = new SpeechAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          let interim = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalizedTextRef.current = (
                finalizedTextRef.current +
                (finalizedTextRef.current ? ' ' : '') +
                transcriptChunk.trim()
              ).trim();
            } else {
              interim += transcriptChunk;
            }
          }

          const currentLive = (
            finalizedTextRef.current +
            (interim ? (finalizedTextRef.current ? ' ' : '') + interim.trim() : '')
          ).trim();

          setLiveTranscript(currentLive);

          const fullText = baseInputRef.current
            ? `${baseInputRef.current} ${currentLive}`.trim()
            : currentLive;
          setInput(fullText);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning:', event.error);
          // 'no-speech' is just silence; NEVER abort the user's recording session
          if (event.error === 'no-speech') {
            return;
          }
          if (event.error === 'aborted') {
            return;
          }
          if (event.error === 'not-allowed') {
            setSpeechError('Microphone permission blocked. Please enable microphone access in your browser settings.');
            stopRecording();
            return;
          }
          if (event.error === 'network') {
            setSpeechError('Speech network connection glitch. Reconnecting speech recognition...');
            return;
          }
          setSpeechError(`Voice recognition: ${event.error}`);
        };

        recognition.onend = () => {
          // Auto-reconnect if user is still actively recording (did not click Stop/Done)
          if (isRecordingIntentRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = setTimeout(() => {
              if (isRecordingIntentRef.current) {
                initRecognitionSession();
              }
            }, 150);
          } else {
            setIsRecording(false);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.warn('SpeechRecognition start notice:', err);
        if (err.name !== 'InvalidStateError') {
          setSpeechError(`Speech recognition notice: ${err.message || 'Unable to start speech engine'}`);
        }
      }
    };

    initRecognitionSession();
  };

  const stopRecording = () => {
    isRecordingIntentRef.current = false;
    clearTimeout(restartTimeoutRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // Stop MediaStream tracks
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      mediaStreamRef.current = null;
    }

    // Close AudioContext
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);
    setIsMicMutedWarning(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSendLiveRecording = () => {
    stopRecording();
    if (input.trim() && !loading) {
      onSendMessage(input.trim());
      setInput('');
      setLiveTranscript('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
    setLiveTranscript('');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row gap-6 pb-2">
      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">Cura Clinical AI</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Clinical Guide
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Grounded healthcare assistance, appointment inquiry, & policies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Speech Playback Indicator & Stop Button */}
            {isSpeaking && (
              <button
                type="button"
                id="btn-stop-speech-header"
                onClick={stopSpeaking}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors shadow-2xs animate-pulse"
                title="Stop audio playback"
              >
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 bg-rose-600 dark:bg-rose-400 rounded-full animate-pulse h-2" />
                  <span className="w-0.5 bg-rose-600 dark:bg-rose-400 rounded-full animate-pulse h-3 [animation-delay:0.15s]" />
                  <span className="w-0.5 bg-rose-600 dark:bg-rose-400 rounded-full animate-pulse h-1.5 [animation-delay:0.3s]" />
                </div>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="text-[11px]">Stop Speech</span>
              </button>
            )}

            {/* Auto-Read Responses Toggle */}
            {ttsSupported && (
              <button
                type="button"
                id="btn-toggle-auto-tts"
                onClick={() => {
                  const next = !autoSpeakEnabled;
                  setAutoSpeakEnabled(next);
                  if (!next) stopSpeaking();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
                  autoSpeakEnabled
                    ? 'bg-teal-50 border-teal-300 text-teal-700 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
                title={
                  autoSpeakEnabled
                    ? 'Auto-read enabled: copilot reads new replies aloud. Click to disable.'
                    : 'Click to automatically read out new copilot replies via Text-to-Speech'
                }
              >
                <Headphones className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline">
                  Auto-Read: <strong className="font-semibold">{autoSpeakEnabled ? 'On' : 'Off'}</strong>
                </span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Verified Clinical Protocol</span>
            </div>
            <button
              onClick={() => {
                stopSpeaking();
                onResetChat();
              }}
              title="Reset conversation"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isThisSpeaking = speakingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-teal-600 text-white shadow-2xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1.5 min-w-0">
                  {/* Playing Audio Equalizer Banner */}
                  {!isUser && isThisSpeaking && (
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-xs font-medium w-fit animate-fadeIn">
                      <div className="flex items-center gap-0.5 h-3">
                        <span className="w-1 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse h-2" />
                        <span className="w-1 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse h-3.5 [animation-delay:0.15s]" />
                        <span className="w-1 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse h-1.5 [animation-delay:0.3s]" />
                        <span className="w-1 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse h-2.5 [animation-delay:0.45s]" />
                      </div>
                      <span className="text-[11px] font-semibold">Reading medical advice aloud...</span>
                      <button
                        type="button"
                        onClick={stopSpeaking}
                        className="ml-1 text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200 underline text-[10px]"
                      >
                        Stop
                      </button>
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed transition-colors ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-xs'
                        : isThisSpeaking
                        ? 'bg-teal-50/50 dark:bg-teal-950/30 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-teal-300/70 dark:border-teal-700 shadow-2xs'
                        : 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/60 dark:border-slate-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Message Meta & Actions */}
                  <div
                    className={`flex items-center gap-2 text-[11px] text-slate-400 px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>
                      {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && (
                      <>
                        <span>·</span>
                        {/* Text-to-Speech Button */}
                        {ttsSupported && (
                          <>
                            <button
                              type="button"
                              id={`btn-tts-${msg.id}`}
                              onClick={() => speakMessage(msg.id, msg.content)}
                              className={`inline-flex items-center gap-1 transition-colors ${
                                isThisSpeaking
                                  ? 'text-teal-700 dark:text-teal-300 font-semibold'
                                  : 'hover:text-teal-600 dark:hover:text-teal-400 text-slate-500 dark:text-slate-400'
                              }`}
                              title={isThisSpeaking ? 'Stop listening to this response' : 'Listen to this medical advice'}
                              aria-label={isThisSpeaking ? 'Stop audio playback' : 'Listen to response'}
                            >
                              {isThisSpeaking ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 animate-pulse" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Listen</span>
                                </>
                              )}
                            </button>
                            <span>·</span>
                          </>
                        )}

                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="hover:text-slate-600 dark:hover:text-slate-200 inline-flex items-center gap-1 text-slate-500 dark:text-slate-400"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-teal-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Grounded Sources Pill */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.sources.map((src, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[10px] font-medium bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md"
                        >
                          <BookOpen className="w-2.5 h-2.5 text-teal-600" />
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-xl shrink-0 bg-teal-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-xs bg-slate-100 border border-slate-200/60 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Suggestions:
          </span>
          {[
            'What is the cancellation policy?',
            'How long does a prescription refill take?',
            'Who is eligible for telemedicine?',
            'Check status for appointment APT-043',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSendMessage(prompt)}
              className="text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Voice Dictation Active Live Banner */}
        {isRecording && (
          <div className="px-4 py-3 bg-rose-50/95 dark:bg-rose-950/60 border-t border-rose-200/80 dark:border-rose-900/60 space-y-2.5 transition-all animate-fadeIn">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
                </div>

                {/* Real-time reactive audio volume equalizer */}
                <div
                  className="flex items-end gap-1 h-5 px-1 shrink-0"
                  title={`Microphone input level: ${audioLevel}%`}
                >
                  <span
                    className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, Math.min(20, 4 + (audioLevel / 100) * 16))}px` }}
                  />
                  <span
                    className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(6, Math.min(20, 6 + (audioLevel / 100) * 20))}px` }}
                  />
                  <span
                    className="w-1 bg-rose-600 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(8, Math.min(20, 8 + (audioLevel / 100) * 24))}px` }}
                  />
                  <span
                    className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(6, Math.min(20, 6 + (audioLevel / 100) * 18))}px` }}
                  />
                  <span
                    className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, Math.min(20, 4 + (audioLevel / 100) * 14))}px` }}
                  />
                </div>

                <div className="text-xs truncate">
                  <span className="font-semibold text-rose-700 dark:text-rose-300">
                    Listening... (0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds})
                  </span>
                  {liveTranscript ? (
                    <span className="ml-2 text-slate-800 dark:text-slate-100 font-medium italic truncate max-w-sm sm:max-w-md inline-block align-bottom">
                      "{liveTranscript}"
                    </span>
                  ) : (
                    <span className="ml-2 text-slate-500 dark:text-slate-400 hidden sm:inline">
                      Speak your medical query clearly into your microphone...
                    </span>
                  )}
                  {isMicMutedWarning && (
                    <span className="ml-2 text-amber-600 dark:text-amber-400 text-[11px] font-medium hidden md:inline">
                      ⚠️ Low volume — please ensure your hardware microphone is unmuted.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="btn-voice-done"
                  onClick={stopRecording}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Square className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>Done</span>
                </button>

                <button
                  type="button"
                  id="btn-voice-send"
                  onClick={handleSendLiveRecording}
                  disabled={!input.trim() || loading}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Voice Query</span>
                </button>
              </div>
            </div>

            {/* Quick Medical Voice Dictation Assist Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider shrink-0">
                Or tap to dictate:
              </span>
              {[
                'Doctor, I have a dry cough and mild fever for 2 days',
                'How do I request a prescription refill for blood pressure?',
                'Can I check my upcoming consultation appointments?',
                'What are the fasting guidelines before a lipid profile blood test?',
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    const combined = baseInputRef.current
                      ? `${baseInputRef.current} ${sample}`
                      : sample;
                    setInput(combined);
                    setLiveTranscript(sample);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-800/90 border border-rose-200 dark:border-rose-900 text-slate-700 dark:text-slate-200 hover:text-teal-700 hover:border-teal-400 shrink-0 transition-colors"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Speech Dictation Error Alert */}
        {speechError && (
          <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-850 dark:text-amber-300 transition-all gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="leading-snug">{speechError}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSpeechError(null);
                  startRecording();
                }}
                className="px-2 py-0.5 rounded bg-amber-200/70 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-200 font-semibold text-[11px] transition-colors"
              >
                Retry Mic
              </button>
              <button
                onClick={() => setSpeechError(null)}
                className="p-1 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 rounded-md transition-colors"
                title="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 bg-white dark:bg-slate-900"
        >
          {/* Record Voice Dictation Button */}
          <button
            type="button"
            id="btn-record-voice"
            onClick={toggleRecording}
            disabled={loading}
            title={
              isRecording
                ? 'Listening to your microphone. Click to stop voice dictation.'
                : 'Click to start voice recording & dictation'
            }
            aria-label={isRecording ? 'Stop voice recording' : 'Record voice query'}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm animate-pulse ring-2 ring-rose-500/30'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200/80 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 text-white" />
                <span className="font-mono">
                  0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
                </span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline">Record Voice</span>
              </>
            )}
          </button>

          <input
            type="text"
            id="assistant-query-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening to your voice... (speak now)'
                : 'Type or dictate your healthcare inquiry...'
            }
            disabled={loading}
            className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />

          <button
            type="submit"
            id="btn-send-query"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-sm inline-flex items-center gap-2 transition-all shadow-xs shrink-0"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Side Info Panel */}
      <div className="w-full lg:w-80 space-y-4 shrink-0">
        {/* Capabilities Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            CLINICAL ASSISTANCE SCOPE
          </span>
          <div className="space-y-2.5">
            {/* Voice Dictation Scope Feature */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Voice Medical Dictation</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dictate symptoms, test requirements, or clinic questions hands-free via Web Speech API.
                </p>
              </div>
            </div>

            {/* Text-to-Speech Audio Responses */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Text-to-Speech Audio</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Listen to clinical responses with natural voice speech synthesis and optional auto-read.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Verified Health Protocols</p>
                <p className="text-[11px] text-slate-500">
                  Fasting requirements, medication guidance, and appointment preparation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <CalendarCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Consultation Queries</p>
                <p className="text-[11px] text-slate-500">
                  Instant status check for references (e.g. APT-043, APT-001).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Clinic Policies & TPA</p>
                <p className="text-[11px] text-slate-500">
                  Cancellation timelines, prescription refill windows, and insurance cashless desks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency & Helpline Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" />
              Emergency Helplines
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              24/7
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">National Ambulance</span>
                <span className="block text-[10px] text-slate-400">Trauma & Emergency</span>
              </div>
              <span className="font-display font-bold text-slate-900 text-sm">108 / 112</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">CuraCare Support Desk</span>
                <span className="block text-[10px] text-slate-400">Toll-Free Patient Desk</span>
              </div>
              <span className="font-mono font-semibold text-teal-700 text-xs">1800-200-8800</span>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Clinical Disclaimer</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Cura Clinical AI offers evidence-grounded health information and clinic logistics assistance. It does not provide medical diagnoses or replace direct clinical evaluation by a licensed physician.
          </p>
        </div>
      </div>
    </div>
  );
};
