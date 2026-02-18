/**
 * Run once to pre-generate narration audio files:
 *   node scripts/generate-narration.js
 *
 * Saves:  public/narration-1.mp3
 *         public/narration-2.mp3
 *
 * After running, the site serves these static files — no ElevenLabs quota used on each visit.
 */

const fs      = require('fs');
const path    = require('path');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // fallback to .env

const API_KEY  = process.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = 'c6SfcYrb2t09NHXiT80T';
const MODEL_ID = 'eleven_multilingual_v2';
const PUBLIC   = path.join(__dirname, '..', 'public');

if (!API_KEY) {
  console.error('❌  VITE_ELEVENLABS_API_KEY is not set in .env');
  process.exit(1);
}

// ─── Text (must match VoiceNarration.tsx exactly) ────────────────────────────
const part1 = `I'm Melvin Peralta.

I grew up in New York. In the Bronx. With a single parent. We didn't have much. I'm not saying that for sympathy — it's just the truth. When you grow up like that, you learn what pressure feels like early. You learn what it means to hear "no" a lot. You learn how to make things stretch, how to read a room, how to stay tough even when you're tired, and how to keep going... without anyone promising you it's going to work out.

And for a long time, I carried this quiet feeling in the back of my mind. I want more than this.

Not <chuckle> "more" like fancy stuff. More like... stability. Peace. Options. The ability to help my family without it feeling impossible. The ability to look in the mirror and know I made something of myself. When you come from the bottom, you don't just want to win — you want to change your whole reality.

I didn't have a clear map. I didn't have people handing me opportunities. I didn't grow up around tech or business or "here's the blueprint." I had the same thing a lot of people have: a phone, a laptop when I could get one, and this stubborn belief that if I kept learning, something would eventually open up.

At first, I tried to do it the normal way. Keep my head down, get through things, hope the right doors appear. But I realized something. Doors don't always open for people like me. Sometimes you have to build your own.

That's what building became for me.`;

const part2 = `I got pulled into tech because it felt like one of the few places where the work can speak louder than your background. Code doesn't care where you're from. A working product doesn't care what you started with. Either it runs or it doesn't. Either the UI makes sense or it doesn't. Either you shipped or you didn't.

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

// ─── Generate one part ───────────────────────────────────────────────────────
async function generate(text, filename) {
  console.log(`⏳  Generating ${filename} (${text.length} chars)...`);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.82,
        style: 0.55,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`ElevenLabs ${res.status}: ${err}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(path.join(PUBLIC, filename), buf);
  console.log(`✅  Saved public/${filename}  (${(buf.length / 1024).toFixed(0)} KB)`);
}

// ─── Run ─────────────────────────────────────────────────────────────────────
(async () => {
  try {
    await generate(part1, 'narration-1.mp3');
    await generate(part2, 'narration-2.mp3');
    console.log('\n🎉  Done! Add narration-1.mp3 and narration-2.mp3 to git and push.');
  } catch (err) {
    console.error('\n❌ ', err.message);
    process.exit(1);
  }
})();
