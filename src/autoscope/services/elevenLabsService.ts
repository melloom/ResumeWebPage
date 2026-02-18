// Direct fetch to ElevenLabs — works in both dev and production (CORS is supported)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const API_BASE = 'https://api.elevenlabs.io/v1';

// Custom voice for AutoScope (deep professional male)
const DEEP_MALE_VOICE_ID = 'c6SfcYrb2t09NHXiT80T';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

class ElevenLabsService {
  isConfigured(): boolean {
    return !!ELEVENLABS_API_KEY;
  }

  async generateVoiceAudio(
    text: string,
    _voiceId: string = DEEP_MALE_VOICE_ID,
    settings: VoiceSettings = {
      stability: 0.45,
      similarity_boost: 0.82,
      style: 0.55,
      use_speaker_boost: true,
    }
  ): Promise<Blob> {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('VITE_ELEVENLABS_API_KEY is not set.');
    }

    const response = await fetch(
      `${API_BASE}/text-to-speech/${DEEP_MALE_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: settings,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text().catch(() => response.statusText);
      throw new Error(`ElevenLabs API ${response.status}: ${err}`);
    }

    return response.blob();
  }
}

export const elevenLabsService = new ElevenLabsService();
export default ElevenLabsService;
