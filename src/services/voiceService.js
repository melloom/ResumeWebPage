// ElevenLabs Voice Synthesis Service
// For production, this should be handled by your backend to protect the API key

const ELEVENLABS_CONFIG = {
  API_URL: 'https://api.elevenlabs.io/v1/text-to-speech',
  VOICE_ID: 'Gfpl8Yo74Is0W6cPUWWT',
  MODEL_ID: 'eleven_turbo_v2'
};

// Track current playback so it can be stopped
let currentAudio = null;
let currentUtterance = null;

// Stop any currently playing speech (works for both ElevenLabs and browser TTS)
export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    if (currentAudio.src.startsWith('blob:')) {
      URL.revokeObjectURL(currentAudio.src);
    }
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
};

export const synthesizeSpeech = async (text) => {
  // Stop any currently playing speech first
  stopSpeaking();

  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  if (!apiKey || !apiKey.startsWith('sk_')) {
    console.log('[TTS] No ElevenLabs key, using browser speech');
    return useBrowserSpeech(text);
  }

  try {
    console.log('[TTS] Calling ElevenLabs API...');
    const response = await fetch(
      `${ELEVENLABS_CONFIG.API_URL}/${ELEVENLABS_CONFIG.VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: ELEVENLABS_CONFIG.MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`ElevenLabs API Error: ${response.status} ${errBody.slice(0, 200)}`);
    }

    const audioBlob = await response.blob();
    console.log(`[TTS] ElevenLabs audio received: ${audioBlob.size} bytes`);

    if (audioBlob.size < 100) {
      console.warn('[TTS] ElevenLabs returned tiny audio, falling back');
      throw new Error('ElevenLabs returned empty audio');
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    return new Promise((resolve) => {
      // Safety timeout — if audio doesn't end/error within 30s, resolve anyway
      const safetyTimer = setTimeout(() => {
        console.warn('[TTS] Safety timeout — audio did not finish in 30s');
        URL.revokeObjectURL(audioUrl);
        if (currentAudio === audio) currentAudio = null;
        resolve({ success: false, method: 'elevenlabs' });
      }, 30000);

      audio.onended = () => {
        clearTimeout(safetyTimer);
        console.log('[TTS] ElevenLabs playback finished');
        URL.revokeObjectURL(audioUrl);
        if (currentAudio === audio) currentAudio = null;
        resolve({ success: true, method: 'elevenlabs' });
      };
      audio.onerror = (e) => {
        clearTimeout(safetyTimer);
        console.error('[TTS] Audio element error:', e);
        URL.revokeObjectURL(audioUrl);
        if (currentAudio === audio) currentAudio = null;
        resolve({ success: false, method: 'elevenlabs' });
      };
      audio.play().then(() => {
        console.log('[TTS] ElevenLabs audio playing...');
      }).catch((err) => {
        clearTimeout(safetyTimer);
        console.error('[TTS] Audio play() blocked:', err);
        URL.revokeObjectURL(audioUrl);
        if (currentAudio === audio) currentAudio = null;
        resolve({ success: false, method: 'elevenlabs' });
      });
    });
  } catch (error) {
    console.error('[TTS] ElevenLabs error, falling back to browser speech:', error.message);
    return useBrowserSpeech(text);
  }
};

// Fallback using browser's built-in speech synthesis
const useBrowserSpeech = (text) => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve({ success: false, method: 'none' });
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const voices = speechSynthesis.getVoices();

    const setup = (voiceList) => {
      // Preferred natural voices (order matters)
      const preferredVoices = [
        'Samantha',          // macOS natural voice
        'Google US English', // Chrome natural voice
        'Microsoft Zira',    // Windows natural voice
        'Microsoft David',   // Windows natural male
        'Alex',              // macOS default
        'Karen',             // Australian English
        'Daniel',            // British English
      ];

      let selectedVoice = null;
      for (const preferred of preferredVoices) {
        const found = voiceList.find(v =>
          v.name.toLowerCase().includes(preferred.toLowerCase()) &&
          v.lang.startsWith('en')
        );
        if (found) {
          selectedVoice = found;
          break;
        }
      }

      // Fallback: any English voice
      if (!selectedVoice) {
        selectedVoice = voiceList.find(v => v.lang.startsWith('en-')) || voiceList[0];
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      currentUtterance = utterance;

      utterance.onend = () => {
        if (currentUtterance === utterance) currentUtterance = null;
        resolve({ success: true, method: 'browser', voice: selectedVoice?.name });
      };

      utterance.onerror = () => {
        if (currentUtterance === utterance) currentUtterance = null;
        resolve({ success: false, method: 'browser' });
      };

      // Chrome workaround: long utterances get cut off.
      // Resuming periodically keeps the synthesis alive.
      let resumeTimer = null;
      if (/Chrome/i.test(navigator.userAgent) && !/Edge/i.test(navigator.userAgent)) {
        const keepAlive = () => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
            resumeTimer = setTimeout(keepAlive, 10000);
          }
        };
        utterance.onstart = () => {
          resumeTimer = setTimeout(keepAlive, 10000);
        };
        const origEnd = utterance.onend;
        utterance.onend = (e) => {
          clearTimeout(resumeTimer);
          origEnd?.(e);
        };
        const origError = utterance.onerror;
        utterance.onerror = (e) => {
          clearTimeout(resumeTimer);
          origError?.(e);
        };
      }

      window.speechSynthesis.speak(utterance);
    };

    if (voices.length > 0) {
      setup(voices);
    } else {
      // Voices might not be loaded yet
      speechSynthesis.onvoiceschanged = () => {
        setup(speechSynthesis.getVoices());
      };
      // Timeout fallback if voices never load
      setTimeout(() => {
        const v = speechSynthesis.getVoices();
        if (v.length > 0) setup(v);
        else resolve({ success: false, method: 'none' });
      }, 2000);
    }
  });
};

export default {
  synthesizeSpeech,
  stopSpeaking
};
