// ElevenLabs Voice Synthesis Service (v3 API)
// For production, this should be handled by your backend to protect the API key

const ELEVENLABS_CONFIG = {
  API_URL: 'https://api.elevenlabs.io/v1/text-to-speech',
  VOICE_ID: 'EXAVITQu4vr4xnSDxMaL', // Sarah - friendly female voice
  MODEL_ID: 'eleven_multilingual_v2', // Best expressiveness + supports <laugh>/<chuckle> sound effects
  VOICE_SETTINGS: {
    stability: 0.35,          // Lower = more expressive, human-like variation
    similarity_boost: 0.75,
    style: 0.75,              // High style for personality and emotion
    use_speaker_boost: true,
    optimize_streaming_latency: 2,
    output_format: 'mp3_44100_128'
  }
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

// v3 Voice Configuration Options
export const VOICE_PROFILES = {
  natural: {
    model_id: 'eleven_turbo_v2_5',
    voice_settings: { ...ELEVENLABS_CONFIG.VOICE_SETTINGS, style: 0.3, stability: 0.6 }
  },
  expressive: {
    model_id: 'eleven_turbo_v2_5', 
    voice_settings: { ...ELEVENLABS_CONFIG.VOICE_SETTINGS, style: 0.8, stability: 0.4 }
  },
  fast: {
    model_id: 'eleven_flash_v2_5',
    voice_settings: { ...ELEVENLABS_CONFIG.VOICE_SETTINGS, optimize_streaming_latency: 4 }
  },
  multilingual: {
    model_id: 'eleven_multilingual_v2',
    voice_settings: { ...ELEVENLABS_CONFIG.VOICE_SETTINGS, similarity_boost: 0.8 }
  }
};

export const synthesizeSpeech = async (text, options = {}) => {
  // Stop any currently playing speech first
  stopSpeaking();

  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  if (!apiKey || !apiKey.startsWith('sk_')) {
    console.log('[TTS] No ElevenLabs key, using browser speech');
    return useBrowserSpeech(text);
  }

  // Apply voice profile if specified
  const profile = options.profile ? VOICE_PROFILES[options.profile] || VOICE_PROFILES.natural : null;
  const voiceId = options.voiceId || ELEVENLABS_CONFIG.VOICE_ID;
  const modelId = profile?.model_id || options.modelId || ELEVENLABS_CONFIG.MODEL_ID;
  const voiceSettings = profile?.voice_settings || options.voiceSettings || ELEVENLABS_CONFIG.VOICE_SETTINGS;

  try {
    console.log('[TTS] Calling ElevenLabs v3 API with profile:', options.profile || 'default');
    const response = await fetch(
      `${ELEVENLABS_CONFIG.API_URL}/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: voiceSettings,
          output_format: voiceSettings.output_format,
          optimize_streaming_latency: voiceSettings.optimize_streaming_latency,
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
      utterance.volume = 1.0;
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

// v3 Helper functions for easy voice profile usage
export const synthesizeSpeechFast = (text, options = {}) => {
  return synthesizeSpeech(text, { ...options, profile: 'fast' });
};

export const synthesizeSpeechExpressive = (text, options = {}) => {
  return synthesizeSpeech(text, { ...options, profile: 'expressive' });
};

export const synthesizeSpeechNatural = (text, options = {}) => {
  return synthesizeSpeech(text, { ...options, profile: 'natural' });
};

export const synthesizeSpeechMultilingual = (text, options = {}) => {
  return synthesizeSpeech(text, { ...options, profile: 'multilingual' });
};

// v3 Voice ID presets for different character types
export const VOICE_CHARACTERS = {
  friendly: 'EXAVITQu4vr4xnSDxMaL', // Sarah - friendly female (default)
  professional: 'Gfpl8Yo74Is0W6cPUWWT', // Original voice - professional male
  casual: '2EiwWnXFnvU5JabPnv8n', // Clyde - casual male
  energetic: 'pNInz6obpgDQGcFmaJgB', // Adam - energetic male
  warm: 'Xb7hH8MSUJpSbSDYk0k2', // Alice - warm female
};

// Get available voice profiles info
export const getVoiceProfiles = () => {
  return Object.keys(VOICE_PROFILES).map(key => ({
    name: key,
    description: key === 'natural' ? 'Balanced and natural speaking style' :
                key === 'expressive' ? 'More emotional and dynamic delivery' :
                key === 'fast' ? 'Optimized for speed with lower latency' :
                key === 'multilingual' ? 'Best for non-English content' : key,
    model: VOICE_PROFILES[key].model_id
  }));
};

// Get available voice characters
export const getVoiceCharacters = () => {
  return Object.entries(VOICE_CHARACTERS).map(([name, id]) => ({
    name,
    id,
    description: name.charAt(0).toUpperCase() + name.slice(1) + ' voice character'
  }));
};

export default {
  synthesizeSpeech,
  synthesizeSpeechFast,
  synthesizeSpeechExpressive, 
  synthesizeSpeechNatural,
  synthesizeSpeechMultilingual,
  stopSpeaking,
  VOICE_PROFILES,
  VOICE_CHARACTERS,
  getVoiceProfiles,
  getVoiceCharacters
};
