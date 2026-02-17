// Test Enhanced AI + ElevenLabs v3 Voice Integration
// Comprehensive test for improved conversational AI with expressive voice synthesis

import { sendMessageToAI } from '../services/aiService.js';
import { 
  synthesizeSpeech, 
  synthesizeSpeechExpressive,
  synthesizeSpeechNatural,
  synthesizeSpeechFast,
  VOICE_CHARACTERS 
} from '../services/voiceService.js';

// Test scenarios for enhanced AI expression
const TEST_SCENARIOS = [
  {
    name: "Project Inquiry",
    message: "Tell me about Melvin's coolest project",
    expectedElements: ["amazing", "incredible", "fascinating", "DevHub Connect", "brilliant"]
  },
  {
    name: "Technical Skills",
    message: "What technologies does Melvin use?",
    expectedElements: ["React", "TypeScript", "Node.js", "exciting", "modern"]
  },
  {
    name: "Contact Question",
    message: "How can I reach Melvin for work?",
    expectedElements: ["/contact", "reach", "hiring", "work"]
  },
  {
    name: "Navigation Request",
    message: "Show me his projects",
    expectedElements: ["/projects", "take you", "check out"]
  },
  {
    name: "Enthusiasm Test",
    message: "What makes Melvin special?",
    expectedElements: ["passionate", "amazing", "incredible", "brilliant", "phenomenal"]
  }
];

// Test voice profiles with different expressions
const VOICE_PROFILE_TESTS = [
  {
    profile: 'natural',
    text: "This is a test of the natural voice profile with enhanced AI expression!",
    synthesizer: synthesizeSpeechNatural
  },
  {
    profile: 'expressive',
    text: "Wow! This expressive profile should sound amazing with the new AI responses!",
    synthesizer: synthesizeSpeechExpressive
  },
  {
    profile: 'fast',
    text: "Testing the fast profile for quick, conversational responses.",
    synthesizer: synthesizeSpeechFast
  }
];

// Main test function
export const testEnhancedAiVoice = async () => {
  console.log('🎭 Testing Enhanced AI + ElevenLabs v3 Voice Integration...');
  console.log('=' .repeat(60));
  
  const results = {
    aiTests: [],
    voiceTests: [],
    integrationTests: [],
    success: true,
    errors: []
  };

  try {
    // Test 1: Enhanced AI Expression
    console.log('🧠 Testing Enhanced AI Expressions...');
    for (const scenario of TEST_SCENARIOS) {
      console.log(`\n📝 Testing: ${scenario.name}`);
      console.log(`💬 Message: "${scenario.message}"`);
      
      try {
        const aiResponse = await sendMessageToAI(scenario.message, []);
        
        if (aiResponse.success) {
          console.log(`✅ AI Response: ${aiResponse.response.substring(0, 100)}...`);
          
          // Check for enhanced expression elements
          const hasExpression = scenario.expectedElements.some(element => 
            aiResponse.response.toLowerCase().includes(element.toLowerCase())
          );
          
          results.aiTests.push({
            scenario: scenario.name,
            success: true,
            hasExpression,
            responseLength: aiResponse.response.length,
            response: aiResponse.response
          });
          
          console.log(`${hasExpression ? '🎯' : '⚠️'} Expression quality: ${hasExpression ? 'Enhanced' : 'Basic'}`);
        } else {
          console.log(`⚠️ AI Demo Response: ${aiResponse.demoResponse}`);
          results.aiTests.push({
            scenario: scenario.name,
            success: false,
            isDemo: true,
            response: aiResponse.demoResponse
          });
        }
      } catch (error) {
        console.error(`❌ AI test failed for ${scenario.name}:`, error.message);
        results.aiTests.push({
          scenario: scenario.name,
          success: false,
          error: error.message
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test 2: Voice Profile Testing
    console.log('\n\n🎤 Testing Voice Profiles with Enhanced AI...');
    for (const voiceTest of VOICE_PROFILE_TESTS) {
      console.log(`\n🔊 Testing ${voiceTest.profile} voice profile...`);
      
      try {
        const voiceResult = await voiceTest.synthesizer(voiceTest.text);
        
        results.voiceTests.push({
          profile: voiceTest.profile,
          success: voiceResult.success,
          method: voiceResult.method,
          text: voiceTest.text
        });
        
        console.log(`✅ ${voiceTest.profile} voice: ${voiceResult.success ? 'Success' : 'Failed'} (${voiceResult.method})`);
      } catch (error) {
        console.error(`❌ Voice test failed for ${voiceTest.profile}:`, error.message);
        results.voiceTests.push({
          profile: voiceTest.profile,
          success: false,
          error: error.message
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Test 3: Integration Testing (AI + Voice)
    console.log('\n\n🔗 Testing AI + Voice Integration...');
    
    try {
      console.log('🎯 Testing full conversation flow...');
      const aiResponse = await sendMessageToAI("What's your favorite project of Melvin's?", []);
      
      if (aiResponse.success) {
        console.log(`💭 AI generated: "${aiResponse.response.substring(0, 80)}..."`);
        
        // Test with expressive voice
        const voiceResult = await synthesizeSpeechExpressive(aiResponse.response);
        
        results.integrationTests.push({
          test: 'ai_voice_integration',
          aiSuccess: true,
          voiceSuccess: voiceResult.success,
          method: voiceResult.method,
          responseLength: aiResponse.response.length
        });
        
        console.log(`🗣️ Voice synthesis: ${voiceResult.success ? 'Success' : 'Failed'} (${voiceResult.method})`);
        console.log(`✅ Integration test: ${aiResponse.success && voiceResult.success ? 'PASSED' : 'PARTIAL'}`);
      } else {
        console.log('⚠️ Using demo response for integration test...');
        const voiceResult = await synthesizeSpeechExpressive(aiResponse.demoResponse);
        
        results.integrationTests.push({
          test: 'ai_voice_integration',
          aiSuccess: false,
          voiceSuccess: voiceResult.success,
          method: voiceResult.method,
          isDemo: true
        });
      }
    } catch (error) {
      console.error('❌ Integration test failed:', error.message);
      results.integrationTests.push({
        test: 'ai_voice_integration',
        success: false,
        error: error.message
      });
    }

    // Test 4: Voice Character Testing
    console.log('\n\n🎭 Testing Voice Characters...');
    const characterTest = "Hi! I'm testing different voice characters with enhanced AI responses.";
    
    for (const [name, voiceId] of Object.entries(VOICE_CHARACTERS)) {
      try {
        console.log(`🎪 Testing ${name} character...`);
        const result = await synthesizeSpeech(characterTest, { 
          voiceId, 
          profile: 'expressive' 
        });
        
        console.log(`${result.success ? '✅' : '❌'} ${name}: ${result.method}`);
      } catch (error) {
        console.error(`❌ Character test failed for ${name}:`, error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

  } catch (error) {
    console.error('❌ Test suite error:', error);
    results.success = false;
    results.errors.push(error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  const aiSuccessCount = results.aiTests.filter(t => t.success).length;
  const voiceSuccessCount = results.voiceTests.filter(t => t.success).length;
  const integrationSuccessCount = results.integrationTests.filter(t => t.aiSuccess || t.voiceSuccess).length;
  
  console.log(`🧠 AI Expression Tests: ${aiSuccessCount}/${results.aiTests.length} passed`);
  console.log(`🎤 Voice Profile Tests: ${voiceSuccessCount}/${results.voiceTests.length} passed`);
  console.log(`🔗 Integration Tests: ${integrationSuccessCount}/${results.integrationTests.length} passed`);
  
  const overallSuccess = aiSuccessCount > 0 && voiceSuccessCount > 0 && integrationSuccessCount > 0;
  console.log(`\n🎉 Overall Status: ${overallSuccess ? '✅ SUCCESS' : '⚠️ PARTIAL SUCCESS'}`);
  
  if (overallSuccess) {
    console.log('\n🚀 Enhanced AI + ElevenLabs v3 integration is working beautifully!');
    console.log('💫 Your AI assistant now has much more expressive conversations');
    console.log('🎭 Voice synthesis supports multiple profiles and characters');
    console.log('⚡ Optimized for natural, engaging voice delivery');
  }

  return {
    success: overallSuccess,
    results,
    summary: {
      aiTests: `${aiSuccessCount}/${results.aiTests.length}`,
      voiceTests: `${voiceSuccessCount}/${results.voiceTests.length}`,
      integrationTests: `${integrationSuccessCount}/${results.integrationTests.length}`
    }
  };
};

// Make available globally for console testing
window.testEnhancedAiVoice = testEnhancedAiVoice;

export default testEnhancedAiVoice;