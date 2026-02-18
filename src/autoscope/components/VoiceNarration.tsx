import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, Volume2, VolumeX, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { elevenLabsService } from '@/autoscope/services/elevenLabsService';

// ─── Narration text (must match generate-narration.js exactly) ───────────────
const lifeStoryRaw = `I'm Melvin Peralta.

I grew up in New York. In the Bronx. With a single parent. We didn't have much. I'm not saying that for sympathy — it's just the truth. When you grow up like that, you learn what pressure feels like early. You learn what it means to hear "no" a lot. You learn how to make things stretch, how to read a room, how to stay tough even when you're tired, and how to keep going... without anyone promising you it's going to work out.

And for a long time, I carried this quiet feeling in the back of my mind. I want more than this.

Not <chuckle> "more" like fancy stuff. More like... stability. Peace. Options. The ability to help my family without it feeling impossible. The ability to look in the mirror and know I made something of myself. When you come from the bottom, you don't just want to win — you want to change your whole reality.

I didn't have a clear map. I didn't have people handing me opportunities. I didn't grow up around tech or business or "here's the blueprint." I had the same thing a lot of people have: a phone, a laptop when I could get one, and this stubborn belief that if I kept learning, something would eventually open up.

At first, I tried to do it the normal way. Keep my head down, get through things, hope the right doors appear. But I realized something. Doors don't always open for people like me. Sometimes you have to build your own.

That's what building became for me.

I got pulled into tech because it felt like one of the few places where the work can speak louder than your background. Code doesn't care where you're from. A working product doesn't care what you started with. Either it runs or it doesn't. Either the UI makes sense or it doesn't. Either you shipped or you didn't.

And I loved that. <chuckle> Because for the first time, effort had a clear outcome. I could put time into something and actually see progress. Even if I was learning slow, even if I messed up, I could keep going and the results would show up right in front of me. That was addictive — in the best way.

I started stacking small wins. A page that finally looked right. A feature that finally worked. A bug that used to embarrass me that I learned how to fix. A project that went from idea... to real.

Little by little, building gave me something I didn't always feel growing up: control. Not control over everything — but control over my direction. And that changed me.

Now, when I build, I'm not just trying to make something cool. I'm trying to make things that feel solid. Things people can trust. I care about the details because details aren't just details to me — they're pride. They're proof.

A site that works smoothly on mobile is pride. Copy that sounds human is pride. An app that doesn't break when someone uses it differently than expected is pride. A system that feels clean, fast, and intentional — is pride.

I also build with a mindset I learned from life, not just tech: nothing is ever perfect, but you can always improve it. I'm not scared of messy starts. I'm not scared of changing requirements. I'm not scared of "we're not sure yet." <chuckle> I'm used to real life being like that. And I've learned how to turn that uncertainty into something clear.

That's why I'm drawn to products and tools — especially the kind that combine clean UI with real logic, automation, and AI. Not AI for hype. AI for leverage. AI that reduces friction, saves time, and makes the user feel capable instead of overwhelmed.

If you're looking for someone who only does well when everything is perfect — that's not me.

I work best when it's real: limited time, imperfect information, changing needs, and a high standard. Because that's my comfort zone. That's what I grew up in. And now I use that same energy to execute, to solve problems, and to ship things that actually hold up.

So when you scroll through this site, I want you to see more than projects. I want you to see a pattern: someone who decided the starting line wasn't going to be the finish line. Someone who took what he had... and kept building anyway.

I'm still hungry. I'm still learning. I'm still leveling up.

But I'm not chasing a title. I'm chasing a life I'm proud of.

If something here matches what you're building — reach out. I'm easy to work with, direct when it matters, and serious about doing work that's clean, not just finished.

And no matter what I build next, the goal stays the same: keep turning pressure into progress.`;

// Clean expression tags
const clean = (raw: string) =>
  raw.replace(/<(laugh|chuckle|sigh|gasp)>/gi, '').replace(/\s+/g, ' ').trim();

const cleanText = clean(lifeStoryRaw);

// ─── Sentence splitting ───────────────────────────────────────────────────────
const SENTENCES: string[] = cleanText
  .replace(/([.!?])\s+/g, '$1\n')
  .split('\n')
  .map(s => s.trim())
  .filter(s => s.length > 0);

// Character-based timing: longer sentences get proportionally more time
const SENT_CHARS = SENTENCES.map(s => s.length + 1); // +1 for inter-sentence gap
const TOTAL_CHARS = SENT_CHARS.reduce((a, b) => a + b, 0);
// Cumulative end-position (in chars) for each sentence
const SENT_END: number[] = SENT_CHARS.reduce((acc: number[], c) => {
  acc.push((acc[acc.length - 1] ?? 0) + c);
  return acc;
}, []);

// ─── Component ───────────────────────────────────────────────────────────────
interface VoiceNarrationProps {
  className?: string;
  onNarrationChange?: (playing: boolean) => void;
}

const VoiceNarration = ({ className = '', onNarrationChange }: VoiceNarrationProps) => {
  const [isPlaying, setIsPlaying]               = useState(false);
  const [isMuted, setIsMuted]                   = useState(false);
  const [isLoading, setIsLoading]               = useState(false);
  const [errorMsg, setErrorMsg]                 = useState<string | null>(null);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(-1);
  const [currentTime, setCurrentTime]           = useState(0);
  const [duration, setDuration]                 = useState(0);
  const [audioUrl, setAudioUrl]                 = useState<string | null>(null);
  const [started, setStarted]                   = useState(false);

  const audioRef     = useRef<HTMLAudioElement>(null);
  const rafRef       = useRef<number>(0);
  const durRef       = useRef(0);
  const isPlayingRef = useRef(false);

  // ─── RAF sync (60fps audio → sentence mapping) ────────────────────────────
  const startRAF = useCallback(() => {
    const tick = () => {
      const audio = audioRef.current;
      const dur   = durRef.current;
      if (!audio || !dur) { rafRef.current = requestAnimationFrame(tick); return; }

      const ct = audio.currentTime;
      setCurrentTime(ct);

      // Character-based sentence lookup — longer sentences get more time
      const charPos = (ct / dur) * TOTAL_CHARS;
      let sentIdx = SENTENCES.length - 1;
      for (let i = 0; i < SENT_END.length; i++) {
        if (charPos <= SENT_END[i]) { sentIdx = i; break; }
      }
      setActiveSentenceIdx(sentIdx);

      if (isPlayingRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRAF = useCallback(() => cancelAnimationFrame(rafRef.current), []);

  // Load audio — static file first, API fallback ─────────────────────────
  const generate = async () => {
    setStarted(true);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Try pre-generated static file first (zero quota cost)
      const r = await fetch('/narration.mp3');
      if (r.ok) {
        const blob = await r.blob();
        setAudioUrl(URL.createObjectURL(blob));
        console.log('[VoiceNarration] Static narration file loaded successfully');
        return;
      }

      // Static file not found — fall back to ElevenLabs API
      if (!elevenLabsService.isConfigured()) {
        setErrorMsg('Voice narration is currently down — come back later!');
        setStarted(false);
        return;
      }

      const blob = await elevenLabsService.generateVoiceAudio(lifeStoryRaw);
      setAudioUrl(URL.createObjectURL(blob));
      console.log('[VoiceNarration] ElevenLabs narration generated successfully');
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      const isQuota = msg.includes('quota') || msg.includes('429') || msg.includes('exceeded') || msg.includes('limit');
      setErrorMsg(isQuota
        ? 'Voice narration is currently down — come back later!'
        : 'Voice generation failed. Please try again.'
      );
      setStarted(false);
      console.error('[VoiceNarration] Generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-play when URL is ready (disabled for PWA compatibility)
  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    // Don't auto-play in PWA/mobile - require user interaction
    // This fixes audio playback issues in mobile browsers and PWA mode
    console.log('[VoiceNarration] Audio ready, waiting for user interaction');
  }, [audioUrl]);

  // ─── Toggle play / pause ──────────────────────────────────────────────────
  const togglePlay = async () => {
    if (isLoading) return;
    setErrorMsg(null);
    
    if (!started) { 
      generate(); 
      return; 
    }
    
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
      stopRAF();
      onNarrationChange?.(false);
    } else {
      // Enhanced mobile audio playback with better error handling
      try {
        console.log('[VoiceNarration] Attempting to play audio...');
        
        // Ensure audio is ready
        if (audio.readyState < 2) { // HAVE_NOTHING or LOADING
          console.log('[VoiceNarration] Audio not ready, waiting...');
          await new Promise(resolve => {
            const checkReady = () => {
              if (audio.readyState >= 2) resolve();
              else audio.addEventListener('loadeddata', resolve, { once: true });
            };
            checkReady();
          });
        }
        
        // Reset audio to beginning if needed
        if (audio.currentTime === 0 || audio.ended) {
          audio.currentTime = 0;
        }
        
        // Set audio attributes for better mobile PWA compatibility
        audio.setAttribute('playsinline', '');
        audio.setAttribute('webkit-playsinline', '');
        
        // Create audio context if needed (helps with mobile PWA)
        if (!window.AudioContext) {
          window.AudioContext = (window as any).webkitAudioContext;
        }
        
        // Resume audio context if suspended (common PWA issue)
        if (window.AudioContext) {
          const audioContext = new AudioContext();
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
        }
        
        // Attempt to play with user gesture context
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          console.log('[VoiceNarration] Audio playing successfully');
          setIsPlaying(true);
          isPlayingRef.current = true;
          setActiveSentenceIdx(0);
          startRAF();
          onNarrationChange?.(true);
        }
      } catch (error) {
        console.error('[VoiceNarration] Audio play failed:', error);
        
        // Handle common mobile audio errors
        if (error.name === 'NotAllowedError') {
          setErrorMsg('Tap again to enable audio playback');
        } else if (error.name === 'NotSupportedError') {
          setErrorMsg('Audio format not supported on this device');
        } else {
          setErrorMsg('Audio playback failed. Try again.');
        }
        
        // Reset state
        setIsPlaying(false);
        isPlayingRef.current = false;
        stopRAF();
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !isMuted;
    setIsMuted(v => !v);
  };

  const onEnded = useCallback(() => {
    stopRAF();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setActiveSentenceIdx(-1);
    setCurrentTime(0);
    onNarrationChange?.(false);
  }, [stopRAF, onNarrationChange]);

  const fmt = (t: number) => `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;

  useEffect(() => () => {
    stopRAF();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl, stopRAF]);

  // ─── Derive visible sentences ─────────────────────────────────────────────
  const prev = activeSentenceIdx > 0 ? SENTENCES[activeSentenceIdx - 1] : null;
  const curr = activeSentenceIdx >= 0 && activeSentenceIdx < SENTENCES.length ? SENTENCES[activeSentenceIdx] : null;
  const next = activeSentenceIdx >= 0 && activeSentenceIdx < SENTENCES.length - 1 ? SENTENCES[activeSentenceIdx + 1] : null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Transcript — rendered via portal to escape parent transforms ── */}
      {isPlaying && activeSentenceIdx >= 0 && createPortal(
        <AnimatePresence>
          <motion.div
            key="transcript"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 24px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '640px', textAlign: 'center' }}>

              <AnimatePresence mode="wait">
                {prev && (
                  <motion.p
                    key={`prev-${activeSentenceIdx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.6, userSelect: 'none', color: 'rgba(255,255,255,0.22)', margin: 0 }}
                  >
                    {prev}
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {curr && (
                  <motion.p
                    key={`curr-${activeSentenceIdx}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      fontSize: 'clamp(18px, 3vw, 28px)',
                      fontWeight: 700,
                      lineHeight: 1.35,
                      userSelect: 'none',
                      color: '#ffffff',
                      textShadow: '0 0 22px rgba(96,165,250,0.75)',
                      margin: 0,
                    }}
                  >
                    {curr}
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {next && (
                  <motion.p
                    key={`next-${activeSentenceIdx}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.6, userSelect: 'none', color: 'rgba(255,255,255,0.22)', margin: 0 }}
                  >
                    {next}
                  </motion.p>
                )}
              </AnimatePresence>

              {duration > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '160px', height: '1px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'rgba(96,165,250,0.5)', borderRadius: '999px', width: `${(currentTime / duration) * 100}%`, transition: 'width 0.1s linear' }} />
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                    {fmt(currentTime)} / {fmt(duration)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Error message — also portalled so it escapes transforms */}
      {errorMsg && createPortal(
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'rgba(127,29,29,0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(239,68,68,0.4)',
          color: 'rgba(252,165,165,1)',
          fontSize: '12px',
          padding: '8px 16px',
          borderRadius: '999px',
          maxWidth: '280px',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          {errorMsg}
        </div>,
        document.body
      )}

      {/* ── Compact pill control ── */}
      <div
        className={`flex items-center gap-2 bg-black/75 backdrop-blur-md border border-white/15 rounded-full px-3 py-2 shadow-xl ${className}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="relative flex-shrink-0">
          {isPlaying && (
            <span className="absolute inset-0 rounded-full bg-blue-500/40 animate-ping" />
          )}
          <Mic className={`w-3.5 h-3.5 ${isPlaying ? 'text-blue-400' : 'text-white/35'}`} />
        </div>

        <span className="text-xs text-white/65 font-medium whitespace-nowrap select-none">
          {isLoading ? 'Loading...' : isPlaying ? 'Narrating' : 'Hear My Story'}
        </span>

        <button
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-white" />
          ) : (
            <Play className="w-3.5 h-3.5 text-white" />
          )}
        </button>

        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="text-white/35 hover:text-white/90 transition-colors flex-shrink-0"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              durRef.current = audioRef.current.duration;
              setDuration(audioRef.current.duration);
              // Set narration volume - lower for PWA, normal for web
              const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
              audioRef.current.volume = isPWA ? 0.6 : 0.8; // 60% for PWA, 80% for web
            }
          }}
          onEnded={onEnded}
          preload="auto"
          playsInline
          crossOrigin="anonymous"
        />
      )}
    </>
  );
};

export default VoiceNarration;
