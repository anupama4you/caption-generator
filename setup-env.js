#!/usr/bin/env node

/**
 * Environment Setup Helper Script
 * Run this to create .env files from .env.example
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateRandomSecret(length = 64) {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

async function main() {
  console.log('\n🚀 Caption Generator - Environment Setup\n');
  console.log('This script will help you create your .env files.\n');

  // Check if .env files already exist
  const backendEnvExists = fs.existsSync(path.join(__dirname, 'backend', '.env'));
  const frontendEnvExists = fs.existsSync(path.join(__dirname, 'frontend', '.env'));

  if (backendEnvExists || frontendEnvExists) {
    console.log('⚠️  Warning: .env files already exist!');
    const overwrite = await question('Do you want to overwrite them? (yes/no): ');
    if (overwrite.toLowerCase() !== 'yes') {
      console.log('\n❌ Setup cancelled. Your existing .env files are safe.\n');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Please provide the following information:\n');

  // Get Supabase Database URL
  console.log('1️⃣  SUPABASE DATABASE URL');
  console.log('   Get this from: https://supabase.com → Your Project → Settings → Database');
  const databaseUrl = await question('   Enter your Supabase connection string: ');

  // Get OpenAI API Key
  console.log('\n2️⃣  OPENAI API KEY');
  console.log('   Get this from: https://platform.openai.com → API Keys');
  const openaiKey = await question('   Enter your OpenAI API key: ');

  // Generate JWT Secrets
  console.log('\n3️⃣  JWT SECRETS');
  console.log('   Generating secure random secrets...');
  const jwtSecret = generateRandomSecret();
  const jwtRefreshSecret = generateRandomSecret();
  console.log('   ✅ Generated!');

  // Backend Port
  const port = '5000';
  const frontendUrl = 'http://localhost:5173';

  // Create backend .env
  const backendEnvContent = `# Database (Supabase PostgreSQL)
DATABASE_URL="${databaseUrl}"

# JWT Secrets (Auto-generated)
JWT_SECRET="${jwtSecret}"
JWT_REFRESH_SECRET="${jwtRefreshSecret}"

# OpenAI API
OPENAI_API_KEY="${openaiKey}"

# Server Configuration
PORT=${port}
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="${frontendUrl}"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  // Create frontend .env
  const frontendEnvContent = `# Backend API URL
VITE_API_URL=http://localhost:${port}/api
`;

  // Write files
  console.log('\n📁 Creating .env files...');

  fs.mkdirSync(path.join(__dirname, 'backend'), { recursive: true });
  fs.mkdirSync(path.join(__dirname, 'frontend'), { recursive: true });

  fs.writeFileSync(path.join(__dirname, 'backend', '.env'), backendEnvContent);
  fs.writeFileSync(path.join(__dirname, 'frontend', '.env'), frontendEnvContent);

  console.log('   ✅ backend/.env created');
  console.log('   ✅ frontend/.env created');

  console.log('\n🎉 Environment setup complete!\n');
  console.log('Next steps:');
  console.log('  1. cd backend && npm install');
  console.log('  2. npx prisma generate');
  console.log('  3. npx prisma migrate dev');
  console.log('  4. npx prisma db seed');
  console.log('  5. npm run dev');
  console.log('\n  Then in another terminal:');
  console.log('  6. cd frontend && npm install');
  console.log('  7. npm run dev');
  console.log('\n  Open http://localhost:5173 to see your app!\n');

  rl.close();
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
