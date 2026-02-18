import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { elevenLabsService } from '@/autoscope/services/elevenLabsService';

// ─── Narration text ────────────────────────────────────────────────────────────
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

// Clean text for browser speech + transcript
const lifeStoryClean = lifeStoryRaw
  .replace(/<(laugh|chuckle|sigh|gasp)>/gi, '')
  .replace(/\s+/g, ' ')
  .trim();

// ─── Sentence splitting ────────────────────────────────────────────────────────
// Split on ". " "! " "? " boundaries, keeping the punctuation
const SENTENCES: string[] = lifeStoryClean
  .replace(/([.!?])\s+/g, '$1\n')
  .split('\n')
  .map(s => s.trim())
  .filter(s => s.length > 0);

// Precompute where each sentence starts in lifeStoryClean (for onboundary charIndex)
const SENTENCE_CHAR_STARTS: number[] = [];
let _charCursor = 0;
for (const s of SENTENCES) {
  SENTENCE_CHAR_STARTS.push(_charCursor);
  _charCursor += s.length + 1; // +1 for the space that was replaced with \n
}

// Word counts per sentence → cumulative word starts (for audio time → sentence)
const SENTENCE_WORD_STARTS: number[] = [];
const TOTAL_WORDS: number = (() => {
  let _w = 0;
  for (const s of SENTENCES) {
    SENTENCE_WORD_STARTS.push(_w);
    _w += s.split(/\s+/).length;
  }
  return _w;
})();

const sentenceFromChar = (charIdx: number): number => {
  for (let i = SENTENCE_CHAR_STARTS.length - 1; i >= 0; i--) {
    if (charIdx >= SENTENCE_CHAR_STARTS[i]) return i;
  }
  return 0;
};

const sentenceFromWord = (wordIdx: number): number => {
  for (let i = SENTENCE_WORD_STARTS.length - 1; i >= 0; i--) {
    if (wordIdx >= SENTENCE_WORD_STARTS[i]) return i;
  }
  return 0;
};

// ─── Component ────────────────────────────────────────────────────────────────
interface VoiceNarrationProps {
  className?: string;
  onNarrationChange?: (playing: boolean) => void;
}

const VoiceNarration = ({ className = '', onNarrationChange }: VoiceNarrationProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(-1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasTriedGenerate, setHasTriedGenerate] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number>(0);
  const durationRef = useRef(0);
  const isPlayingRef = useRef(false);

  // ─── RAF for ElevenLabs audio sync ────────────────────────────────────────
  const startRAF = useCallback(() => {
    const tick = () => {
      if (!audioRef.current || !durationRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const ct = audioRef.current.currentTime;
      setCurrentTime(ct);
      const wordDur = durationRef.current / TOTAL_WORDS;
      const wordIdx = Math.min(Math.floor(ct / wordDur), TOTAL_WORDS - 1);
      setActiveSentenceIdx(sentenceFromWord(wordIdx));
      if (isPlayingRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRAF = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  // ─── ElevenLabs generation (no fallback — waits as long as needed) ────────
  const generateAudio = async () => {
    setHasTriedGenerate(true);
    setIsLoading(true);
    try {
      const blob = await elevenLabsService.generateVoiceAudio(lifeStoryRaw);
      setAudioUrl(URL.createObjectURL(blob));
    } catch (_err) {
      // Generation failed — reset so user can try again
      setHasTriedGenerate(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-play as soon as ElevenLabs audio URL is ready
  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      isPlayingRef.current = true;
      setActiveSentenceIdx(0);
      startRAF();
      onNarrationChange?.(true);
    }).catch(() => {});
  }, [audioUrl, startRAF, onNarrationChange]);

  // ─── Toggle play / pause ───────────────────────────────────────────────────
  const togglePlay = async () => {
    if (isLoading) return; // already generating
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        isPlayingRef.current = false;
        stopRAF();
        onNarrationChange?.(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        isPlayingRef.current = true;
        startRAF();
        onNarrationChange?.(true);
      }
      return;
    }
    if (!hasTriedGenerate) {
      generateAudio();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !isMuted;
    setIsMuted(v => !v);
  };

  const fmt = (t: number) => `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;

  useEffect(() => () => {
    stopRAF();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl, stopRAF]);

  // ─── Derive visible sentences ──────────────────────────────────────────────
  const prevSentence = activeSentenceIdx > 0 ? SENTENCES[activeSentenceIdx - 1] : null;
  const currSentence = activeSentenceIdx >= 0 ? SENTENCES[activeSentenceIdx] : null;
  const nextSentence = activeSentenceIdx < SENTENCES.length - 1 ? SENTENCES[activeSentenceIdx + 1] : null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Centered transcript overlay ── */}
      <AnimatePresence>
        {isPlaying && activeSentenceIdx >= 0 && (
          <motion.div
            key="transcript"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-40 px-6 gap-4"
            style={{ paddingBottom: '90px' }}
          >
            {/* Previous sentence */}
            <AnimatePresence mode="wait">
              {prevSentence && (
                <motion.p
                  key={`prev-${activeSentenceIdx}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm sm:text-base text-white/25 font-medium text-center leading-relaxed select-none max-w-lg sm:max-w-2xl"
                >
                  {prevSentence}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Current sentence */}
            <AnimatePresence mode="wait">
              {currSentence && (
                <motion.p
                  key={`curr-${activeSentenceIdx}`}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl sm:text-3xl font-bold text-white text-center leading-snug select-none max-w-xl sm:max-w-2xl drop-shadow-[0_0_22px_rgba(96,165,250,0.7)]"
                >
                  {currSentence}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Next sentence */}
            <AnimatePresence mode="wait">
              {nextSentence && (
                <motion.p
                  key={`next-${activeSentenceIdx}`}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm sm:text-base text-white/25 font-medium text-center leading-relaxed select-none max-w-lg sm:max-w-2xl"
                >
                  {nextSentence}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Thin progress bar (ElevenLabs only) */}
            {duration > 0 && (
              <div className="mt-6 flex flex-col items-center gap-1">
                <div className="w-32 sm:w-48 h-px bg-white/12 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400/50 rounded-full"
                    style={{ width: `${(currentTime / duration) * 100}%`, transition: 'width 0.1s linear' }}
                  />
                </div>
                <span className="text-xs text-white/20 font-mono tabular-nums tracking-widest">
                  {fmt(currentTime)} / {fmt(duration)}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              durationRef.current = audioRef.current.duration;
              setDuration(audioRef.current.duration);
            }
          }}
          onEnded={() => {
            stopRAF();
            setIsPlaying(false);
            isPlayingRef.current = false;
            setActiveSentenceIdx(-1);
            setCurrentTime(0);
            onNarrationChange?.(false);
          }}
          preload="auto"
        />
      )}
    </>
  );
};

export default VoiceNarration;
