// Simple test to check environment variables
console.log('=== ENVIRONMENT CHECK ===');
console.log('VITE_OPENAI_API_KEY exists:', !!import.meta.env.VITE_OPENAI_API_KEY);
console.log('VITE_ELEVENLABS_API_KEY exists:', !!import.meta.env.VITE_ELEVENLABS_API_KEY);
console.log('VITE_ELEVENLABS_API_KEY value:', import.meta.env.VITE_ELEVENLABS_API_KEY?.substring(0, 10) + '...');

// Test if we can access the voice service
import('./voiceService.js').then(module => {
  console.log('Voice service imported successfully');
}).catch(err => {
  console.error('Error importing voice service:', err);
});
