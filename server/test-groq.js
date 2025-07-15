#!/usr/bin/env node

/**
 * Groq API Test Script
 * Tests the Groq API integration for AstraLearn
 */

import dotenv from 'dotenv';
import Groq from 'groq-sdk';

// Load environment variables
dotenv.config();

async function testGroqAPI() {
  console.log('🧪 Testing Groq API Integration...\n');

  // Check if API key is configured
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GROQ_API_KEY not found in environment variables');
    console.log('📝 Please set your Groq API key in .env file:');
    console.log('   GROQ_API_KEY=gsk_your_actual_key_here');
    console.log('\n🔗 Get your key from: https://console.groq.com/keys');
    process.exit(1);
  }

  // Mask API key for display
  const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`🔑 API Key configured: ${maskedKey}`);

  // Initialize Groq client
  const groq = new Groq({
    apiKey: apiKey,
  });

  try {
    // Test 1: List available models
    console.log('\n📋 Fetching available models...');
    const models = await groq.models.list();
    const activeModels = models.data.filter(model => model.active);
    
    console.log(`✅ Found ${activeModels.length} active models:`);
    activeModels.slice(0, 5).forEach(model => {
      console.log(`   - ${model.id}`);
    });

    // Test 2: Simple chat completion
    console.log('\n💬 Testing chat completion...');
    const chatResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for AstraLearn, an educational platform. Be concise and helpful."
        },
        {
          role: "user",
          content: "Hello! Please confirm that the Groq API is working correctly by saying 'Groq API is operational for AstraLearn!'"
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 100,
    });

    const response = chatResponse.choices[0]?.message?.content;
    console.log(`✅ Chat response: ${response}`);
    console.log(`📊 Usage: ${JSON.stringify(chatResponse.usage)}`);

    // Test 3: Educational context test
    console.log('\n🎓 Testing educational context...');
    const eduResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI tutor helping students learn JavaScript. Provide clear, beginner-friendly explanations."
        },
        {
          role: "user",
          content: "What is a JavaScript variable?"
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 200,
    });

    const eduResponseText = eduResponse.choices[0]?.message?.content;
    console.log(`✅ Educational response: ${eduResponseText.substring(0, 100)}...`);

    // Test 4: Performance test
    console.log('\n⚡ Testing response speed...');
    const startTime = Date.now();
    
    await groq.chat.completions.create({
      messages: [
        { role: "user", content: "Say 'Speed test complete!'" }
      ],
      model: "llama-3.1-8b-instant", // Fastest model
      temperature: 0,
      max_tokens: 10,
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    console.log(`✅ Response time: ${responseTime}ms`);

    console.log('\n🎉 All tests passed! Groq API is ready for AstraLearn.');
    console.log('\n📈 Performance Summary:');
    console.log(`   - Models available: ${activeModels.length}`);
    console.log(`   - Response time: ${responseTime}ms`);
    console.log(`   - Status: ✅ Operational`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.status === 401) {
      console.log('\n🔑 API Key Error:');
      console.log('   - Check that your GROQ_API_KEY is correct');
      console.log('   - Verify the key format starts with "gsk_"');
      console.log('   - Generate a new key at: https://console.groq.com/keys');
    } else if (error.status === 429) {
      console.log('\n⏰ Rate Limit Error:');
      console.log('   - You have exceeded the rate limit');
      console.log('   - Wait a moment and try again');
      console.log('   - Check your usage at: https://console.groq.com/dashboard');
    } else {
      console.log('\n🔧 Debug Info:');
      console.log(`   - Error type: ${error.type || 'Unknown'}`);
      console.log(`   - Status code: ${error.status || 'None'}`);
      console.log(`   - API Key (masked): ${maskedKey}`);
    }
    
    process.exit(1);
  }
}

// Run the test
testGroqAPI().catch(console.error);
