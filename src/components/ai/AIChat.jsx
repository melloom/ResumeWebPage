import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { FaRobot, FaPaperPlane, FaSpinner, FaMicrophone, FaVolumeUp, FaVolumeMute, FaKeyboard, FaTrash } from 'react-icons/fa';
import { sendMessageToAI } from '../../services/aiService';
import { synthesizeSpeech, stopSpeaking } from '../../services/voiceService';
import { transcribeAudio } from '../../services/transcribeService';
import styles from './AIChat.module.css';

// Detect SpeechRecognition support once
const SpeechRecognitionAPI = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition || null)
  : null;

// Silence detection config (fallback MediaRecorder path)
const SPEECH_THRESHOLD = 0.03;     // above this = user is speaking
const SILENCE_DURATION = 1400;     // ms of quiet after speech before auto-send (gives natural pause room)
const MIN_RECORD_TIME = 400;       // ms minimum before silence detection kicks in
const MIN_USEFUL_RECORD_MS = 1200; // discard recordings shorter than this (avoids Whisper hallucinations)
const MAX_RECORD_TIME = 30000;     // max recording time
const NO_SPEECH_TIMEOUT = 6000;    // restart recording if no speech detected in this time
const SILENCE_THRESHOLD = 0.015;   // only used for no-speech timeout (before user speaks)

// Live SpeechRecognition config
const LIVE_SILENCE_MS = 1400;
const MIN_TRANSCRIPT_LENGTH = 2;
const MIN_GROWTH_TO_RESET_SILENCE = 2;
const RESUME_AFTER_SPEECH_MS = 400; // delay before restarting mic after AI finishes

const STORAGE_KEY = 'ai-chat-history';
const STORAGE_TTL_MS = 24 * 60 * 60 * 1000;

function dedupeRepeatedDisplay(text) {
  if (!text || text.length < 15) return text;
  const t = text.trim();
  const parts = t.split(/\s*[.?]\s+/).map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0];
    if (parts.every(p => p === first)) return first + (t.endsWith('?') ? '?' : t.endsWith('.') ? '.' : '');
  }
  return text;
}

// Deduplicate Whisper hallucinations (short audio → repeated transcription)
function dedupeWhisperResult(text) {
  if (!text) return text;
  const t = text.trim();
  // Split on sentence endings and check for repeated segments
  const sentences = t.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(Boolean);
  if (sentences.length >= 2) {
    const first = sentences[0];
    if (sentences.every(s => s === first)) return first;
  }
  // Also check for simple repetition like "Hello Hello" or "Is he good? Is he good?"
  const half = Math.floor(t.length / 2);
  const firstHalf = t.slice(0, half).trim();
  const secondHalf = t.slice(half).trim();
  if (firstHalf.length > 3 && firstHalf === secondHalf) return firstHalf;
  return t;
}

const NAV_PATHS = ['/contact', '/projects', '/about', '/resume', '/ai-lab', '/'];
function extractPathFromResponse(text) {
  if (!text || typeof text !== 'string') return null;
  const t = text.trim();
  for (const path of NAV_PATHS) {
    if (path === '/') {
      if (/\b(?:home|go to \/)\b/i.test(t) || t.includes(' / ')) return '/';
    } else if (t.includes(path)) return path;
  }
  return null;
}

const AIChat = forwardRef((props, ref) => {
  const {
    pageContext = null,
    compact = false,
    voiceOnly = false,
    autoStartVoice = false,
    onSuggestNavigation = null,
  } = props;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [voiceChatMode, setVoiceChatMode] = useState(voiceOnly);
  const [status, setStatus] = useState('idle');
  const [level, setLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micError, setMicError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const greetingTimeoutRef = useRef(null);

  // Voice refs
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const voiceActiveRef = useRef(false);
  const messagesRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const liveTranscriptRef = useRef('');
  const levelRef = useRef(0);
  const autoVoiceStartedRef = useRef(false);

  // SpeechRecognition refs
  const recognitionSegmentsRef = useRef([]);
  const recognitionSilenceTimerRef = useRef(null);
  const recognitionLastHeardRef = useRef(0);
  const recognitionLastHeardLengthRef = useRef(0);

  // Fallback recorder refs
  const mediaRecorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const recordStartTimeRef = useRef(0);
  const hasSpokenRef = useRef(false);

  // Circular dep breaker refs
  const startListeningRef = useRef(null);
  const startFallbackRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { liveTranscriptRef.current = liveTranscript; }, [liveTranscript]);

  useEffect(() => { if (voiceOnly) setVoiceChatMode(true); }, [voiceOnly]);

  // Auto-start voice when requested (widget open or AI Lab chat enter)
  useEffect(() => {
    if (!autoStartVoice) {
      autoVoiceStartedRef.current = false;
      return;
    }
    if (autoVoiceStartedRef.current) return;

    // Require an explicit user gesture: in compact mode, only start after widget is opened (isOpen handled upstream);
    // in non-compact voice-only contexts (AI Lab chat view), start after first render but only once.
    if (!voiceEnabled || isSpeakingRef.current || isLoadingRef.current || voiceActiveRef.current) return;
    autoVoiceStartedRef.current = true;
    startVoiceSession();
  }, [autoStartVoice, voiceEnabled, startVoiceSession]);

  // Hydrate messages from local storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.savedAt || !parsed?.messages) return;
      if (Date.now() - parsed.savedAt >= STORAGE_TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const restored = parsed.messages.map((m) => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : undefined,
      }));
      if (restored.length > 0) {
        setMessages(restored);
        setHasGreeted(true);
      }
    } catch {}
  }, []);

  // Auto-greet
  useEffect(() => {
    if (greetingTimeoutRef.current) clearTimeout(greetingTimeoutRef.current);
    if (hasGreeted || messages.length > 0) return;
    const greetedKey = 'ai-chat-greeted';
    const wasGreeted = localStorage.getItem(greetedKey);
    greetingTimeoutRef.current = setTimeout(() => {
      const content = !wasGreeted
        ? "Hey there! Welcome to Melvin's portfolio. I'm here to help you explore his work, learn about his projects, and discover what makes him a great developer. Feel free to ask me anything about his skills, experience, or the cool things he's built!"
        : "Welcome back! Ready to dive deeper into Melvin's work? I can tell you about his latest projects or help you find something specific.";
      if (!wasGreeted) localStorage.setItem(greetedKey, 'true');
      setMessages([{ id: Date.now(), type: 'ai', content, timestamp: new Date() }]);
      setHasGreeted(true);
      if (voiceEnabled) speakMessage(content);
    }, 1200);
    return () => { if (greetingTimeoutRef.current) clearTimeout(greetingTimeoutRef.current); };
  }, [hasGreeted, voiceEnabled, messages.length]);

  // Persist messages
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        savedAt: Date.now(),
        messages: messages.map(m => ({ ...m, timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : null })),
      }));
    } catch {}
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isTyping]);

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }, []);

  const useLiveMode = !!SpeechRecognitionAPI;

  // ---- Resume listening (works for both paths) ----
  const resumeListening = useCallback(() => {
    console.log('[Voice] resumeListening called — active:', voiceActiveRef.current, 'speaking:', isSpeakingRef.current, 'loading:', isLoadingRef.current);
    if (!voiceActiveRef.current) { setStatus('idle'); return; }
    if (isSpeakingRef.current || isLoadingRef.current) {
      // If still busy, retry shortly
      setTimeout(() => {
        if (voiceActiveRef.current && !isSpeakingRef.current && !isLoadingRef.current) {
          resumeListening();
        }
      }, 500);
      return;
    }
    if (useLiveMode && startListeningRef.current) {
      console.log('[Voice] Resuming SpeechRecognition');
      startListeningRef.current();
    } else if (!useLiveMode && startFallbackRef.current) {
      console.log('[Voice] Resuming fallback recording');
      startFallbackRef.current();
    } else {
      setStatus('idle');
    }
  }, [useLiveMode]);

  // ---- Speech synthesis ----
  const speakMessage = async (text) => {
    if (!voiceEnabled) {
      console.log('[Voice] speakMessage skipped — voice disabled');
      resumeListening();
      return;
    }
    try {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setStatus('speaking');
      console.log('[Voice] Speaking:', text.slice(0, 60) + '...');
      const result = await synthesizeSpeech(text);
      console.log('[Voice] Speech finished:', result);
    } catch (error) {
      console.error('[Voice] Speech synthesis error:', error);
    } finally {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setStatus('idle');
      console.log('[Voice] Will resume listening in', RESUME_AFTER_SPEECH_MS, 'ms');
      setTimeout(() => resumeListening(), RESUME_AFTER_SPEECH_MS);
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  };

  // ---- Audio visualization (runs for entire voice session) ----
  const startViz = useCallback((stream) => {
    // Clean up any existing viz first
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    try { audioCtxRef.current?.close?.(); } catch {}

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.65;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      analyser.getByteFrequencyData(data);
      let sum = 0;
      const voiceEnd = Math.floor(data.length * 0.6);
      for (let i = 0; i < voiceEnd; i++) sum += data[i];
      const avg = sum / voiceEnd;
      const norm = Math.min(1, avg / 100);
      levelRef.current = norm;
      setLevel(prev => prev * 0.5 + norm * 0.5);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopViz = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { analyserRef.current?.disconnect?.(); } catch {}
    try { audioCtxRef.current?.close?.(); } catch {}
    analyserRef.current = null;
    audioCtxRef.current = null;
    levelRef.current = 0;
    setLevel(0);
  }, []);

  // ---- Send message ----
  const sendMessage = useCallback(async (messageContent) => {
    const text = messageContent.trim();
    if (!text) return;

    const prev = messagesRef.current;
    const last = prev.length > 0 ? prev[prev.length - 1] : null;
    if (last?.type === 'user' && last.content === text) return;

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: text, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);
    isLoadingRef.current = true;
    setIsTyping(true);
    setStatus('processing');

    try {
      const history = messagesRef.current.filter(m => m.type !== 'system');
      const result = await sendMessageToAI(text, history, pageContext);
      const responseContent = result.success
        ? result.response
        : (result.demoResponse || "I'm having trouble connecting right now. Please try again later.");

      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', content: responseContent, timestamp: new Date() }]);
      setIsTyping(false);
      setIsLoading(false);
      isLoadingRef.current = false;

      if (compact && onSuggestNavigation) {
        const path = extractPathFromResponse(responseContent);
        if (path) onSuggestNavigation(path);
      }

      // Always speak if voice is enabled and we're in voice chat mode
      // Use voiceChatMode state OR voiceActiveRef — either means voice session
      const shouldSpeak = voiceEnabled && (voiceActiveRef.current || voiceChatMode);
      if (shouldSpeak) {
        // Re-activate voice if it was lost during processing
        if (!voiceActiveRef.current) {
          console.log('[Voice] Re-activating voice session (was deactivated during processing)');
          voiceActiveRef.current = true;
        }
        console.log('[Voice] AI responded, speaking now...');
        speakMessage(responseContent);
      } else {
        console.log('[Voice] AI responded, no voice mode active');
        resumeListening();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, type: 'ai',
        content: "Something went wrong. Please try again later or explore Melvin's portfolio directly.",
        timestamp: new Date()
      }]);
      setIsTyping(false);
      setIsLoading(false);
      isLoadingRef.current = false;
      resumeListening();
    }
  }, [voiceEnabled, pageContext, resumeListening]);

  // ==========================
  // PATH A: SpeechRecognition
  // ==========================
  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI || !voiceActiveRef.current) return;
    if (isSpeakingRef.current || isLoadingRef.current) return;

    if (recognitionSilenceTimerRef.current) {
      clearInterval(recognitionSilenceTimerRef.current);
      recognitionSilenceTimerRef.current = null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognitionSegmentsRef.current = [];
    recognitionLastHeardLengthRef.current = 0;
    recognitionLastHeardRef.current = Date.now();

    recognitionSilenceTimerRef.current = setInterval(() => {
      const idleFor = Date.now() - recognitionLastHeardRef.current;
      if (idleFor > LIVE_SILENCE_MS && recognitionRef.current) {
        const buffered = (liveTranscriptRef.current || '').trim();
        if (buffered.length >= MIN_TRANSCRIPT_LENGTH && voiceActiveRef.current) {
          sendMessage(buffered);
          liveTranscriptRef.current = '';
          setLiveTranscript('');
          recognitionSegmentsRef.current = [];
          recognitionLastHeardLengthRef.current = 0;
        }
        try { recognitionRef.current.stop(); } catch {}
      }
    }, 300);

    recognition.onresult = (event) => {
      const newParts = [];
      for (let i = event.resultIndex; i < event.results.length; i++) {
        newParts.push(event.results[i][0].transcript);
      }
      const updated = [...recognitionSegmentsRef.current.slice(0, event.resultIndex), ...newParts];
      recognitionSegmentsRef.current = updated;
      const full = updated.map(s => (s || '').trim()).filter(Boolean).join(' ').trim();
      liveTranscriptRef.current = full;
      setLiveTranscript(full);
      const prevLen = recognitionLastHeardLengthRef.current;
      if (full.length >= prevLen + MIN_GROWTH_TO_RESET_SILENCE || (full.length >= MIN_TRANSCRIPT_LENGTH && prevLen === 0)) {
        recognitionLastHeardRef.current = Date.now();
        recognitionLastHeardLengthRef.current = full.length;
      }
      setStatus('listening');
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (recognitionSilenceTimerRef.current) {
        clearInterval(recognitionSilenceTimerRef.current);
        recognitionSilenceTimerRef.current = null;
      }
      const transcript = (liveTranscriptRef.current || '').trim();
      liveTranscriptRef.current = '';
      setLiveTranscript('');
      recognitionSegmentsRef.current = [];
      recognitionLastHeardLengthRef.current = 0;
      if (transcript.length >= MIN_TRANSCRIPT_LENGTH && voiceActiveRef.current) {
        sendMessage(transcript);
      } else if (voiceActiveRef.current && !isSpeakingRef.current && !isLoadingRef.current) {
        setTimeout(() => { if (voiceActiveRef.current) startListening(); }, 200);
      }
    };

    recognition.onerror = (event) => {
      if (recognitionSilenceTimerRef.current) {
        clearInterval(recognitionSilenceTimerRef.current);
        recognitionSilenceTimerRef.current = null;
      }
      if (event.error === 'no-speech' || event.error === 'aborted') {
        if (voiceActiveRef.current && !isSpeakingRef.current && !isLoadingRef.current) {
          setTimeout(() => { if (voiceActiveRef.current) startListening(); }, 300);
        }
        return;
      }
      console.error('Speech recognition error:', event.error);
      if (voiceActiveRef.current) startFallbackRef.current?.();
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setStatus('listening');
    } catch (e) {
      console.error('Could not start recognition:', e);
      if (recognitionSilenceTimerRef.current) {
        clearInterval(recognitionSilenceTimerRef.current);
        recognitionSilenceTimerRef.current = null;
      }
      if (voiceActiveRef.current) startFallbackRef.current?.();
    }
  }, [sendMessage]);

  startListeningRef.current = startListening;

  // ==========================================
  // PATH B: MediaRecorder + Whisper (Firefox)
  // ==========================================

  const pickMimeType = () => {
    // Prefer ogg on Firefox (native), webm elsewhere
    const types = ['audio/ogg;codecs=opus', 'audio/ogg', 'audio/webm;codecs=opus', 'audio/webm'];
    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(t)) return t;
    }
    return '';
  };

  const stopSilenceDetection = useCallback(() => {
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const startSilenceDetection = useCallback(() => {
    stopSilenceDetection();
    let silentSince = 0;

    const autoStop = () => {
      stopSilenceDetection();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };

    silenceTimerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - recordStartTimeRef.current;

      if (elapsed >= MAX_RECORD_TIME) {
        hasSpokenRef.current = true;
        autoStop();
        return;
      }

      if (elapsed < MIN_RECORD_TIME) return;

      const currentLevel = levelRef.current;

      if (currentLevel > SPEECH_THRESHOLD) {
        // Actively speaking — mark it and reset silence timer
        hasSpokenRef.current = true;
        silentSince = 0;
      } else if (hasSpokenRef.current) {
        // User spoke but level dropped below speech threshold
        // Start/continue silence timer immediately (no ambiguous zone delay)
        if (silentSince === 0) silentSince = now;
        if ((now - silentSince) >= SILENCE_DURATION) {
          autoStop();
          return;
        }
      } else {
        // Haven't spoken yet — only count deep silence for no-speech timeout
        if (currentLevel <= SILENCE_THRESHOLD) {
          if (silentSince === 0) silentSince = now;
          if ((now - silentSince) >= NO_SPEECH_TIMEOUT) {
            autoStop();
          }
        }
      }
    }, 50);
  }, [stopSilenceDetection]);

  // Get a fresh mic stream
  const getMicStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true }
      });
      return stream;
    } catch {
      // Fallback with defaults
      return navigator.mediaDevices.getUserMedia({ audio: true });
    }
  }, []);

  const startFallbackRecording = useCallback(async () => {
    if (isSpeakingRef.current || isLoadingRef.current) return;
    if (!voiceActiveRef.current) return;

    // Check if current stream is alive
    let stream = streamRef.current;
    const streamAlive = stream && stream.active !== false && stream.getTracks().some(t => t.readyState === 'live');

    if (!streamAlive) {
      // Need a fresh stream + viz
      try {
        if (stream) stream.getTracks().forEach(t => { try { t.stop(); } catch {} });
        stream = await getMicStream();
        streamRef.current = stream;
        startViz(stream);
        // Listen for track ending so we know if stream dies
        stream.getTracks().forEach(t => {
          t.onended = () => {
            // If session is still active and this was our stream, flag it
            if (voiceActiveRef.current && streamRef.current === stream) {
              streamRef.current = null;
            }
          };
        });
      } catch (e) {
        console.error('Mic access error:', e);
        setMicError(e?.name === 'NotAllowedError'
          ? 'Microphone access denied. Allow the mic in your browser settings.'
          : 'Couldn\'t access microphone. Check that a mic is connected.');
        setStatus('idle');
        return;
      }
    }

    const mime = pickMimeType();
    if (!mime) {
      console.error('No supported audio MIME type');
      setStatus('idle');
      return;
    }

    let mediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
    } catch (e) {
      console.error('Could not create MediaRecorder:', e);
      // Stream probably died — clear it and retry once
      streamRef.current = null;
      if (voiceActiveRef.current) {
        setTimeout(() => { if (voiceActiveRef.current && startFallbackRef.current) startFallbackRef.current(); }, 500);
      }
      return;
    }

    recordingChunksRef.current = [];
    hasSpokenRef.current = false;
    recordStartTimeRef.current = Date.now();

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordingChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stopSilenceDetection();

      const chunks = [...recordingChunksRef.current];
      recordingChunksRef.current = [];
      const recordDuration = Date.now() - recordStartTimeRef.current;

      const restartListening = () => {
        if (voiceActiveRef.current && !isSpeakingRef.current && !isLoadingRef.current) {
          setTimeout(() => { if (voiceActiveRef.current && startFallbackRef.current) startFallbackRef.current(); }, 200);
        }
      };

      // Skip if no data or user never spoke
      if (chunks.length === 0 || !hasSpokenRef.current) {
        setLiveTranscript('');
        restartListening();
        return;
      }

      const blob = new Blob(chunks, { type: mime });

      // Skip tiny blobs or very short recordings (avoids Whisper hallucinations)
      if (blob.size < 500 || recordDuration < MIN_USEFUL_RECORD_MS) {
        console.log(`[Voice] Discarding short recording: ${recordDuration}ms, ${blob.size} bytes`);
        setLiveTranscript('');
        restartListening();
        return;
      }

      setStatus('processing');
      setLiveTranscript('Transcribing...');

      try {
        let transcript = await transcribeAudio(blob);
        setLiveTranscript('');

        // Deduplicate Whisper hallucinations (e.g. "Hello? Hello?" → "Hello?")
        if (transcript) {
          transcript = dedupeWhisperResult(transcript);
        }

        if (transcript && transcript.trim().length >= 2) {
          sendMessage(transcript.trim());
        } else {
          restartListening();
        }
      } catch (err) {
        console.error('[Voice] Transcription error:', err);
        setLiveTranscript('');
        restartListening();
      }
    };

    try {
      // No timeslice — collect all data in one chunk on stop()
      // Using timeslice (e.g. start(200)) causes Firefox to produce multiple OGG segments
      // that, when concatenated, have multiple container headers and Whisper rejects them
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setStatus('listening');
      setMicError(null);
    } catch (err) {
      console.error('MediaRecorder.start() error:', err);
      // Stream is dead — clear and retry
      stream.getTracks().forEach(t => { try { t.stop(); } catch {} });
      streamRef.current = null;
      if (voiceActiveRef.current) {
        setTimeout(() => { if (voiceActiveRef.current && startFallbackRef.current) startFallbackRef.current(); }, 500);
      }
      return;
    }

    startSilenceDetection();
  }, [sendMessage, startSilenceDetection, stopSilenceDetection, getMicStream, startViz]);

  startFallbackRef.current = startFallbackRecording;

  // ---- Session management ----
  const startVoiceSession = useCallback(async () => {
    if (!voiceEnabled) return;
    setMicError(null);
    voiceActiveRef.current = true;
    handleStopSpeaking();

    // Get mic stream for the session
    let stream;
    try {
      stream = await getMicStream();
      streamRef.current = stream;
      startViz(stream);
      // Track ended listener
      stream.getTracks().forEach(t => {
        t.onended = () => {
          if (voiceActiveRef.current && streamRef.current === stream) {
            streamRef.current = null;
          }
        };
      });
    } catch (e) {
      console.error('Mic access error:', e);
      voiceActiveRef.current = false;
      setStatus('idle');
      setMicError(e?.name === 'NotAllowedError'
        ? 'Microphone access denied. Allow the mic in your browser settings.'
        : 'Couldn\'t access microphone. Check that a mic is connected.');
      return;
    }

    if (useLiveMode) {
      startListening();
    } else {
      startFallbackRecording();
    }
  }, [startListening, useLiveMode, startFallbackRecording, getMicStream, startViz]);

  const stopVoiceSession = useCallback(() => {
    console.log('[Voice] stopVoiceSession called', new Error().stack?.split('\n')[2]?.trim());
    voiceActiveRef.current = false;
    setMicError(null);
    stopSilenceDetection();

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    if (recognitionSilenceTimerRef.current) {
      clearInterval(recognitionSilenceTimerRef.current);
      recognitionSilenceTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => { try { t.stop(); } catch {} });
      streamRef.current = null;
    }
    stopViz();
    setLiveTranscript('');
    setStatus('idle');
  }, [stopSilenceDetection, stopViz]);

  // When voice is muted, stop everything
  useEffect(() => {
    if (!voiceEnabled) {
      handleStopSpeaking();
      stopVoiceSession();
    }
  }, [voiceEnabled, stopVoiceSession]);

  const handleResetChat = useCallback(() => {
    handleStopSpeaking();
    stopVoiceSession();
    setVoiceChatMode(false);
    setMessages([]);
    setInput('');
    setLiveTranscript('');
    setHasGreeted(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, [stopVoiceSession]);

  useImperativeHandle(ref, () => ({
    sendMessage: (text) => sendMessage(text?.trim() ? text.trim() : ''),
    resetChat: () => handleResetChat()
  }), [sendMessage, handleResetChat]);

  // Orb click
  const handleOrbClick = useCallback(() => {
    if (!voiceEnabled) return;
    if (!voiceActiveRef.current || status === 'idle') {
      startVoiceSession();
    }
  }, [startVoiceSession, status]);

  // Stop voice session when leaving voice mode
  useEffect(() => {
    if (!voiceChatMode && voiceActiveRef.current) {
      stopVoiceSession();
    }
  }, [voiceChatMode, stopVoiceSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceActiveRef.current = false;
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
      if (recognitionSilenceTimerRef.current) clearInterval(recognitionSilenceTimerRef.current);
      if (recognitionRef.current) try { recognitionRef.current.abort(); } catch {}
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      if (streamRef.current) streamRef.current.getTracks().forEach(t => { try { t.stop(); } catch {} });
      stopViz();
      stopSpeaking();
    };
  }, [stopViz]);

  // Text input handlers
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const containerClass = `${styles.chatContainer} ${voiceChatMode ? styles.voiceMode : ''} ${compact ? styles.compact : ''}`;

  const getOrbIcon = () => {
    if (status === 'processing') return <FaSpinner className={styles.spinner} />;
    if (status === 'speaking') return <FaVolumeUp className={styles.speakingIcon} />;
    return <FaMicrophone />;
  };

  const getStatusLabel = () => {
    if (status === 'listening') return liveTranscript ? 'Listening...' : 'Go ahead, I\'m listening...';
    if (status === 'processing') return 'Thinking...';
    if (status === 'speaking' && !compact) return 'Speaking...';
    if (status === 'speaking' && compact) return '';
    if (voiceActiveRef.current) return 'Ready...';
    return 'Tap to start';
  };

  return (
    <div className={containerClass}>
      {!compact && (
        <div className={styles.avatarSection}>
          <div className={`${styles.avatar} ${isSpeaking ? styles.speaking : ''}`}>
            <div className={styles.avatarInner}>
              <FaRobot />
              <div className={styles.avatarWave}></div>
            </div>
          </div>
          <div className={styles.avatarInfo}>
            <h2>Melvin&apos;s AI Assistant</h2>
            <div className={styles.status}>
              <span className={`${styles.statusDot} ${isTyping ? styles.typing : ''}`}></span>
              {isSpeaking ? 'Speaking...' : isTyping ? 'Typing...' : status === 'listening' ? 'Listening...' : 'Online'}
            </div>
          </div>
          <button
            className={styles.voiceToggle}
            onClick={() => {
              const next = !voiceEnabled;
              if (!next) handleStopSpeaking();
              if (!next) stopVoiceSession();
              setVoiceEnabled(next);
            }}
            title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
          >
            {voiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>
          <button className={styles.resetButton} onClick={handleResetChat} title="Reset chat">
            <FaTrash />
          </button>
        </div>
      )}

      {!voiceChatMode && (
        <div className={styles.messagesContainer}>
          {messages.map(message => (
            <div key={message.id} className={`${styles.message} ${message.type === 'user' ? styles.userMessage : styles.aiMessage}`}>
              <div className={styles.messageBubble}>
                <p>{dedupeRepeatedDisplay(message.content)}</p>
                {message.type === 'ai' && voiceEnabled && (
                  <button className={styles.speakButton} onClick={() => speakMessage(message.content)} title="Speak message">
                    <FaVolumeUp />
                  </button>
                )}
              </div>
              <div className={styles.messageTime}>
                {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className={`${styles.message} ${styles.aiMessage}`}>
              <div className={styles.messageBubble}>
                <div className={styles.typingIndicator}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}

          {status === 'listening' && !compact && (
            <div className={`${styles.message} ${styles.userMessage} ${styles.liveMessage}`}>
              <div className={styles.messageBubble}>
                <div className={styles.liveBadge}>Live</div>
                <p>{liveTranscript || '...'}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {isSpeaking && !compact && (
        <div className={styles.speakingBar}>
          <FaVolumeUp className={styles.speakingIcon} />
          <span>Speaking...</span>
        </div>
      )}

      {!voiceOnly && !voiceChatMode && (
        <form className={styles.inputContainer} onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <button type="button" className={styles.voiceChatToggle} onClick={() => setVoiceChatMode(true)} title="Voice chat">
              <FaMicrophone />
            </button>
            <input
              ref={inputRef} type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className={styles.messageInput}
              disabled={isLoading}
            />
            <button type="submit" className={`${styles.sendButton} ${isLoading ? styles.disabled : ''}`} disabled={isLoading} title="Send">
              {isLoading ? <FaSpinner className={styles.spinner} /> : <FaPaperPlane />}
            </button>
          </div>
        </form>
      )}

      {(voiceChatMode || voiceOnly) && (
        <div className={styles.voicePanel}>
          <div className={styles.voiceOrbArea}>
            <div className={`${styles.voiceGlow} ${styles.voiceGlow1}`}
              style={{
                transform: `scale(${status === 'listening' ? 1 + level * 0.6 : 1})`,
                opacity: status === 'listening' ? 0.15 + level * 0.25 : 0,
              }}
            />
            <div className={`${styles.voiceGlow} ${styles.voiceGlow2}`}
              style={{
                transform: `scale(${status === 'listening' ? 1 + level * 0.35 : 1})`,
                opacity: status === 'listening' ? 0.2 + level * 0.3 : 0,
              }}
            />
            <button
              type="button"
              className={`${styles.voiceOrb} ${status === 'listening' ? styles.voiceOrbActive : ''} ${(status === 'processing' || status === 'speaking') ? styles.voiceOrbProcessing : ''}`}
              onClick={handleOrbClick}
              disabled={status === 'processing'}
              style={status === 'listening' ? {
                boxShadow: `0 0 ${Math.round(30 + level * 50)}px ${Math.round(8 + level * 20)}px rgba(99,102,241,${0.3 + level * 0.4})`,
                transform: `scale(${1 + level * 0.08})`,
              } : undefined}
            >
              {getOrbIcon()}
            </button>
          </div>

          {micError && <div className={styles.micError} role="alert">{micError}</div>}

          {(status === 'listening' || liveTranscript) && (
            <div className={compact ? styles.liveTranscriptCompact : styles.liveTranscript}>
              {liveTranscript ? `"${liveTranscript}"` : (useLiveMode ? 'Speak now...' : 'Listening... speak and I\'ll hear you.')}
            </div>
          )}

          {status === 'listening' && (
            compact ? (
              <div className={styles.levelHintCompact} aria-hidden="true">
                {level > 0.03 ? 'Hearing you' : 'Speak into your mic'}
              </div>
            ) : (
              <div className={styles.levelBarWrap} aria-hidden="true">
                <div className={styles.levelBar} style={{ width: `${Math.round(level * 100)}%` }} />
                <span className={styles.levelHint}>{level > 0.03 ? 'Hearing you' : 'Speak into your mic'}</span>
              </div>
            )
          )}

          <div className={styles.voiceStatusText}>{getStatusLabel()}</div>

          {compact && (
            <div className={styles.voicePanelActions}>
              <button type="button" className={styles.voiceToggle}
                onClick={() => {
                  const next = !voiceEnabled;
                  if (!next) handleStopSpeaking();
                  if (!next) stopVoiceSession();
                  setVoiceEnabled(next);
                }}
                title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
              >
                {voiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
              </button>
            </div>
          )}

          {!voiceOnly && (
            <button type="button" className={styles.voiceBackBtn}
              onClick={() => { stopVoiceSession(); setVoiceChatMode(false); }}
              title="Switch to text input"
            >
              <FaKeyboard /><span>Text</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

AIChat.displayName = 'AIChat';
export default AIChat;
