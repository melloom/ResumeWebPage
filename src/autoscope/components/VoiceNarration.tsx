import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { elevenLabsService } from '@/autoscope/services/elevenLabsService';

// ─── Narration text ─────────────────────────────────────────────────────────
const lifeStoryRaw = `I'm Melvin Peralta.

I grew up in New York. In the Bronx. With a single parent. We didn't have much. I'm not saying that for sympathy — it's just the truth. When you grow up like that, you learn what pressure feels like early. You learn what it means to hear "no" a lot. You learn how to make things stretch, how to read a room, how to stay tough even when you're tired, and how to keep going... without anyone promising you it's going to work out.

And for a long time, I carried this quiet feeling in the back of my mind. I want more than this.

Not <chuckle> "more" like fancy stuff. More like... stability. Peace. Options. The ability to help my family without it feeling impossible. The ability to look in the mirror and know I made something of myself. When you come from the bottom, you don't just want to win — you want to change your whole reality.

I didn't have a clear map. I didn't have people handing me opportunities. I didn't grow up around tech or business or "here's the blueprint." I had the same thing a lot of people have: a phone, a laptop when I could get one, and this stubborn belief that if I kept learning, something would eventually open up.

At first, I tried to do it the normal way. Keep my head down, get through things, hope the right doors appear. But I realized something. Doors don't always open for people like me. Sometimes you have to build your own.

That's what building became for me.`;

const lifeStoryRaw2 = `I got pulled into tech because it felt like one of the few places where the work can speak louder than your background. Code doesn't care where you're from. A working product doesn't care what you started with. Either it runs or it doesn't. Either the UI makes sense or it doesn't. Either you shipped or you didn't.

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

// Clean each part (strip expression tags)
const clean = (raw: string) =>
  raw.replace(/<(laugh|chuckle|sigh|gasp)>/gi, '').replace(/\s+/g, ' ').trim();

const cleanPart1 = clean(lifeStoryRaw);
const cleanPart2 = clean(lifeStoryRaw2);
const fullClean = cleanPart1 + ' ' + cleanPart2;

// ─── Sentence splitting (over full text) ────────────────────────────────────
const SENTENCES: string[] = fullClean
  .replace(/([.!?])\s+/g, '$1\n')
  .split('\n')
  .map(s => s.trim())
  .filter(s => s.length > 0);

// Sentence boundaries per part (for audio time → sentence mapping)
const part1Sentences = cleanPart1
  .replace(/([.!?])\s+/g, '$1\n')
  .split('\n')
  .map(s => s.trim())
  .filter(s => s.length > 0);
const PART1_SENTENCE_COUNT = part1Sentences.length;

// Word counts for time-based sync
const wordsIn = (s: string) => s.split(/\s+/).length;
const PART1_WORDS = part1Sentences.reduce((n, s) => n + wordsIn(s), 0);
const PART2_WORDS = SENTENCES.slice(PART1_SENTENCE_COUNT).reduce((n, s) => n + wordsIn(s), 0);

const sentenceFromWord = (wordIdx: number, totalWords: number, sentenceOffset: number, sentenceCount: number) => {
  const ratio = Math.min(wordIdx / totalWords, 0.9999);
  return sentenceOffset + Math.min(Math.floor(ratio * sentenceCount), sentenceCount - 1);
};

// ─── Component ───────────────────────────────────────────────────────────────
interface VoiceNarrationProps {
  className?: string;
  onNarrationChange?: (playing: boolean) => void;
}

const VoiceNarration = ({ className = '', onNarrationChange }: VoiceNarrationProps) => {
  const [isPlaying, setIsPlaying]       = useState(false);
  const [isMuted, setIsMuted]           = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(-1);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);

  // Two audio chunks
  const [url1, setUrl1] = useState<string | null>(null);
  const [url2, setUrl2] = useState<string | null>(null);
  const [started, setStarted] = useState(false); // whether generation has been triggered
  const currentPartRef = useRef<1 | 2>(1);

  const audio1Ref = useRef<HTMLAudioElement>(null);
  const audio2Ref = useRef<HTMLAudioElement>(null);
  const rafRef    = useRef<number>(0);
  const dur1Ref   = useRef(0);
  const dur2Ref   = useRef(0);
  const isPlayingRef = useRef(false);

  // ─── RAF sync ──────────────────────────────────────────────────────────────
  const startRAF = useCallback((part: 1 | 2) => {
    const tick = () => {
      const audio = part === 1 ? audio1Ref.current : audio2Ref.current;
      const dur   = part === 1 ? dur1Ref.current   : dur2Ref.current;
      const sentOff   = part === 1 ? 0 : PART1_SENTENCE_COUNT;
      const sentCount = part === 1 ? PART1_SENTENCE_COUNT : SENTENCES.length - PART1_SENTENCE_COUNT;
      const totalW    = part === 1 ? PART1_WORDS : PART2_WORDS;

      if (!audio || !dur) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const ct = audio.currentTime;
      setCurrentTime(ct);
      const wordDur = dur / totalW;
      const wordIdx = Math.min(Math.floor(ct / wordDur), totalW - 1);
      setActiveSentenceIdx(sentenceFromWord(wordIdx, totalW, sentOff, sentCount));
      if (isPlayingRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRAF = useCallback(() => cancelAnimationFrame(rafRef.current), []);

  // ─── Load audio — static files first, API fallback ────────────────────────
  const generate = async () => {
    setStarted(true);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Try pre-generated static files first (zero quota cost, instant load)
      const [r1, r2] = await Promise.all([
        fetch('/narration-1.mp3'),
        fetch('/narration-2.mp3'),
      ]);

      if (r1.ok && r2.ok) {
        const [b1, b2] = await Promise.all([r1.blob(), r2.blob()]);
        setUrl1(URL.createObjectURL(b1));
        setUrl2(URL.createObjectURL(b2));
        return;
      }

      // Static files not found — fall back to ElevenLabs API
      if (!elevenLabsService.isConfigured()) {
        setErrorMsg('Voice narration is currently down — come back later!');
        setStarted(false);
        return;
      }

      const [blob1, blob2] = await Promise.all([
        elevenLabsService.generateVoiceAudio(lifeStoryRaw),
        elevenLabsService.generateVoiceAudio(lifeStoryRaw2),
      ]);
      setUrl1(URL.createObjectURL(blob1));
      setUrl2(URL.createObjectURL(blob2));
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      const isQuota = msg.includes('quota') || msg.includes('429') || msg.includes('exceeded') || msg.includes('limit');
      setErrorMsg(isQuota
        ? 'Voice narration is currently down — come back later!'
        : 'Voice generation failed. Please try again.'
      );
      setStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-play part 1 when its URL is ready
  useEffect(() => {
    if (!url1 || !audio1Ref.current) return;
    currentPartRef.current = 1;
    audio1Ref.current.play().then(() => {
      setIsPlaying(true);
      isPlayingRef.current = true;
      setActiveSentenceIdx(0);
      startRAF(1);
      onNarrationChange?.(true);
    }).catch(() => {});
  }, [url1, startRAF, onNarrationChange]);

  // ─── Toggle play / pause ──────────────────────────────────────────────────
  const togglePlay = async () => {
    if (isLoading) return;
    setErrorMsg(null);

    if (!started) { generate(); return; }

    const curAudio = currentPartRef.current === 1 ? audio1Ref.current : audio2Ref.current;
    if (!curAudio) return;

    if (isPlaying) {
      curAudio.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
      stopRAF();
      onNarrationChange?.(false);
    } else {
      await curAudio.play();
      setIsPlaying(true);
      isPlayingRef.current = true;
      startRAF(currentPartRef.current);
      onNarrationChange?.(true);
    }
  };

  const toggleMute = () => {
    if (audio1Ref.current) audio1Ref.current.muted = !isMuted;
    if (audio2Ref.current) audio2Ref.current.muted = !isMuted;
    setIsMuted(v => !v);
  };

  // Part 1 ended → start part 2
  const onPart1Ended = useCallback(() => {
    stopRAF();
    if (!audio2Ref.current || !url2) {
      // Part 2 not ready yet — wait for it (url2 effect will trigger play)
      currentPartRef.current = 2;
      return;
    }
    currentPartRef.current = 2;
    audio2Ref.current.play().then(() => {
      startRAF(2);
    }).catch(() => {});
  }, [url2, stopRAF, startRAF]);

  // If part 2 URL arrives while we're waiting for it after part 1 ended
  useEffect(() => {
    if (!url2 || !audio2Ref.current) return;
    if (currentPartRef.current === 2 && !isPlaying) {
      audio2Ref.current.play().then(() => {
        setIsPlaying(true);
        isPlayingRef.current = true;
        startRAF(2);
      }).catch(() => {});
    }
  }, [url2, isPlaying, startRAF]);

  // Part 2 ended
  const onPart2Ended = useCallback(() => {
    stopRAF();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setActiveSentenceIdx(-1);
    setCurrentTime(0);
    onNarrationChange?.(false);
  }, [stopRAF, onNarrationChange]);

  const fmt = (t: number) => `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '00')}`;

  useEffect(() => () => {
    stopRAF();
    if (url1) URL.revokeObjectURL(url1);
    if (url2) URL.revokeObjectURL(url2);
  }, [url1, url2, stopRAF]);

  // ─── Derive visible sentences ─────────────────────────────────────────────
  const prev = activeSentenceIdx > 0 ? SENTENCES[activeSentenceIdx - 1] : null;
  const curr = activeSentenceIdx >= 0 && activeSentenceIdx < SENTENCES.length ? SENTENCES[activeSentenceIdx] : null;
  const next = activeSentenceIdx >= 0 && activeSentenceIdx < SENTENCES.length - 1 ? SENTENCES[activeSentenceIdx + 1] : null;

  const totalDur = dur1Ref.current + dur2Ref.current;
  const elapsed  = currentPartRef.current === 1
    ? currentTime
    : dur1Ref.current + currentTime;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Transcript overlay — true center of viewport ── */}
      <AnimatePresence>
        {isPlaying && activeSentenceIdx >= 0 && (
          <motion.div
            key="transcript"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 pointer-events-none z-40 flex flex-col items-center justify-center px-6"
          >
            {/* Inner content — offset up by half the pill height so it looks truly centered */}
            <div className="flex flex-col items-center gap-3 max-w-xl sm:max-w-2xl text-center" style={{ marginBottom: '80px' }}>

              <AnimatePresence mode="wait">
                {prev && (
                  <motion.p
                    key={`prev-${activeSentenceIdx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm sm:text-base font-medium leading-relaxed select-none text-white/25"
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
                    className="text-xl sm:text-3xl font-bold leading-snug select-none text-white drop-shadow-[0_0_22px_rgba(96,165,250,0.75)]"
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
                    className="text-sm sm:text-base font-medium leading-relaxed select-none text-white/25"
                  >
                    {next}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Progress bar (once part 1 duration is known) */}
              {totalDur > 0 && (
                <div className="mt-4 flex flex-col items-center gap-1">
                  <div className="w-32 sm:w-48 h-px bg-white/12 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400/50 rounded-full"
                      style={{ width: `${(elapsed / totalDur) * 100}%`, transition: 'width 0.1s linear' }}
                    />
                  </div>
                  <span className="text-xs text-white/20 font-mono tabular-nums tracking-widest">
                    {fmt(elapsed)} / {fmt(totalDur)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/80 backdrop-blur border border-red-500/40 text-red-200 text-xs px-4 py-2 rounded-full max-w-xs text-center pointer-events-none">
          {errorMsg}
        </div>
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
          {isLoading ? 'Generating...' : isPlaying ? 'Narrating' : 'Hear My Story'}
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

      {/* Hidden audio elements */}
      {url1 && (
        <audio
          ref={audio1Ref}
          src={url1}
          onLoadedMetadata={() => {
            if (audio1Ref.current) { dur1Ref.current = audio1Ref.current.duration; setDuration(d => d + audio1Ref.current!.duration); }
          }}
          onEnded={onPart1Ended}
          preload="auto"
        />
      )}
      {url2 && (
        <audio
          ref={audio2Ref}
          src={url2}
          onLoadedMetadata={() => {
            if (audio2Ref.current) { dur2Ref.current = audio2Ref.current.duration; setDuration(d => d + audio2Ref.current!.duration); }
          }}
          onEnded={onPart2Ended}
          preload="auto"
        />
      )}
    </>
  );
};

export default VoiceNarration;
