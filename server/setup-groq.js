#!/usr/bin/env node

/**
 * Quick Setup Script for Groq API
 * Helps users configure their Groq API key easily
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 AstraLearn Groq API Setup');
console.log('================================\n');

console.log('This script will help you configure your Groq API key for AstraLearn.\n');

console.log('📝 Steps to get your Groq API key:');
console.log('1. Visit: https://console.groq.com/keys');
console.log('2. Sign up or sign in to your account');
console.log('3. Click "Create API Key"');
console.log('4. Copy your API key (starts with "gsk_")\n');

rl.question('🔑 Enter your Groq API key (or press Enter to skip): ', (apiKey) => {
  if (!apiKey.trim()) {
    console.log('\n⚠️  No API key entered. You can add it manually to server/.env');
    console.log('   Add this line: GROQ_API_KEY=gsk_your_actual_key_here\n');
    rl.close();
    return;
  }

  // Validate key format
  if (!apiKey.startsWith('gsk_')) {
    console.log('\n❌ Invalid API key format. Groq API keys should start with "gsk_"');
    console.log('   Please check your key and try again.\n');
    rl.close();
    return;
  }

  // Update .env file
  const envPath = path.join(process.cwd(), '.env');
  
  try {
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Check if GROQ_API_KEY already exists
    if (envContent.includes('GROQ_API_KEY=')) {
      // Replace existing key
      envContent = envContent.replace(/GROQ_API_KEY=.*$/m, `GROQ_API_KEY=${apiKey}`);
    } else {
      // Add new key
      envContent += `\n# AI Configuration - Groq API\nGROQ_API_KEY=${apiKey}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Groq API key saved to .env file!');
    console.log('\n🧪 Testing your API key...');
    
    // Test the API key
    import('./test-groq.js').then(() => {
      console.log('\n🎉 Setup complete! You can now use AI features in AstraLearn.');
      console.log('\n📚 Next steps:');
      console.log('   1. Start the server: npm run dev');
      console.log('   2. Test AI chat in the application');
      console.log('   3. Check health: curl http://localhost:5000/api/ai/health\n');
    }).catch((error) => {
      console.log('\n⚠️  API key saved but test failed. Please check your key is valid.');
      console.log(`   Error: ${error.message}\n`);
    });

  } catch (error) {
    console.log('\n❌ Error saving API key:', error.message);
    console.log('   Please add it manually to server/.env');
    console.log(`   Add this line: GROQ_API_KEY=${apiKey}\n`);
  }

  rl.close();
});
