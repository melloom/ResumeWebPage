// Test ElevenLabs v3 Voice Service Upgrade
// Run this to verify v3 functionality works correctly

import { 
  synthesizeSpeech, 
  synthesizeSpeechFast,
  synthesizeSpeechExpressive,
  synthesizeSpeechNatural,
  VOICE_PROFILES,
  VOICE_CHARACTERS,
  getVoiceProfiles,
  getVoiceCharacters
} from '../services/voiceService.js';

// Test basic v3 functionality
export const testVoiceV3 = async () => {
  console.log('🎤 Testing ElevenLabs v3 Voice Service...');
  
  // Test voice profiles
  console.log('📋 Available Voice Profiles:', getVoiceProfiles());
  console.log('🎭 Available Voice Characters:', getVoiceCharacters());
  
  const testText = "Hello! I'm testing the new ElevenLabs v3 voice features in Melvin's portfolio.";
  
  try {
    // Test default v3 synthesis
    console.log('🔊 Testing default v3 synthesis...');
    const defaultResult = await synthesizeSpeech(testText);
    console.log('✅ Default synthesis result:', defaultResult);
    
    // Wait a moment between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test fast profile
    console.log('⚡ Testing fast profile...');
    const fastResult = await synthesizeSpeechFast("This is the fast voice profile test.");
    console.log('✅ Fast synthesis result:', fastResult);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test expressive profile  
    console.log('🎭 Testing expressive profile...');
    const expressiveResult = await synthesizeSpeechExpressive("This is the expressive voice profile test!");
    console.log('✅ Expressive synthesis result:', expressiveResult);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test natural profile
    console.log('🌿 Testing natural profile...');
    const naturalResult = await synthesizeSpeechNatural("This is the natural voice profile test.");
    console.log('✅ Natural synthesis result:', naturalResult);
    
    // Test custom options
    console.log('🛠️ Testing custom voice character...');
    const customResult = await synthesizeSpeech("Testing friendly voice character.", {
      voiceId: VOICE_CHARACTERS.friendly,
      profile: 'expressive'
    });
    console.log('✅ Custom voice result:', customResult);
    
    console.log('🎉 All v3 voice tests completed successfully!');
    return { success: true, message: 'All tests passed' };
    
  } catch (error) {
    console.error('❌ Voice v3 test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test function that can be called from console
window.testVoiceV3 = testVoiceV3;

export default testVoiceV3;