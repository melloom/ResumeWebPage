// Transcribe audio using OpenAI Whisper API directly

// Pick extension Whisper expects based on MIME type
function extForMime(mime) {
  const m = (mime || '').toLowerCase();
  if (m.includes('ogg') || m.includes('oga')) return 'ogg';
  if (m.includes('webm')) return 'webm';
  if (m.includes('wav')) return 'wav';
  if (m.includes('mp3') || m.includes('mpeg') || m.includes('mpga')) return 'mp3';
  if (m.includes('mp4') || m.includes('m4a')) return 'm4a';
  if (m.includes('flac')) return 'flac';
  return 'webm';
}

export const transcribeAudio = async (audioBlob) => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) { console.error('[Whisper] No API key'); return ''; }

    if (!audioBlob || audioBlob.size < 500) {
      console.log('[Whisper] Skipping tiny/empty blob:', audioBlob?.size);
      return '';
    }

    const mimeType = audioBlob.type || '';
    const ext = extForMime(mimeType);
    const fileName = `recording.${ext}`;

    console.log(`[Whisper] Sending: size=${audioBlob.size}, mime="${mimeType}", file="${fileName}"`);

    // Use File object directly — don't re-wrap with new Blob (avoids corrupting container headers)
    const file = new File([audioBlob], fileName, { type: mimeType || `audio/${ext}` });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Whisper API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[Whisper] Result:', data.text?.slice(0, 60) || '(empty)');
    return data.text || '';
  } catch (error) {
    console.error('[Whisper] Transcription error:', error);
    return '';
  }
};
