// Voice testing utility
export const testVoice = async () => {
  console.log('Testing voice synthesis...');
  
  // Check if ElevenLabs API key is configured
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  console.log('ElevenLabs API Key configured:', !!apiKey);
  
  if (apiKey) {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey
        }
      });
      
      if (response.ok) {
        const voices = await response.json();
        console.log('Available ElevenLabs voices:', voices.voices?.slice(0, 5).map(v => v.name));
      } else {
        console.error('Failed to fetch ElevenLabs voices:', response.status);
      }
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
    }
  }
  
  // Check browser voices
  if ('speechSynthesis' in window) {
    const voices = speechSynthesis.getVoices();
    console.log('Browser voices available:', voices.length);
    console.log('Sample voices:', voices.slice(0, 5).map(v => `${v.name} (${v.lang})`));
  } else {
    console.log('Browser speech synthesis not supported');
  }
};

// Test with a simple phrase
export const testSpeak = async () => {
  const testText = "This is a test of the voice synthesis system.";
  console.log('Testing with:', testText);
  
  try {
    const { synthesizeSpeech } = await import('./voiceService.js');
    await synthesizeSpeech(testText);
  } catch (error) {
    console.error('Test failed:', error);
  }
};
