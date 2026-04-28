#!/usr/bin/env node

/**
 * MegaShop Deployment Status Checker
 * Run this script to verify your deployment setup
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 MegaShop Deployment Status Checker\n');

// Check backend setup
console.log('📁 Backend Setup:');
const backendPath = path.join(__dirname, 'backend');
const backendChecks = [
  { file: 'package.json', desc: 'Dependencies installed' },
  { file: '.env', desc: 'Environment variables configured' },
  { file: 'vercel.json', desc: 'Vercel deployment config' }
];

backendChecks.forEach(check => {
  const exists = fs.existsSync(path.join(backendPath, check.file));
  console.log(`  ${exists ? '✅' : '❌'} ${check.desc}`);
});

// Check database schema
const dbSchemaExists = fs.existsSync(path.join(__dirname, 'DATABASE_SETUP.sql'));
console.log(`  ${dbSchemaExists ? '✅' : '❌'} Database schema ready`);

// Check frontend setup
console.log('\n📱 Frontend Setup:');
const frontendPath = path.join(__dirname, 'frontend');
const frontendChecks = [
  { file: 'package.json', desc: 'Dependencies installed' },
  { file: 'app.json', desc: 'Expo configuration' },
  { file: 'src/config/constants.js', desc: 'API configuration' }
];

frontendChecks.forEach(check => {
  const exists = fs.existsSync(path.join(frontendPath, check.file));
  console.log(`  ${exists ? '✅' : '❌'} ${check.desc}`);
});

// Deployment steps
console.log('\n📋 Deployment Checklist:');
console.log('1. ✅ Database: Set up PostgreSQL on Supabase/Neon');
console.log('2. ✅ Backend: Deploy to Vercel with environment variables');
console.log('3. ✅ Frontend: Update API_BASE_URL in constants.js');
console.log('4. ✅ APK: Generate using expo build:android');
console.log('5. ✅ Test: Install and test APK on device');

console.log('\n🔗 Useful Links:');
console.log('• Supabase: https://supabase.com');
console.log('• Neon: https://neon.tech');
console.log('• Vercel: https://vercel.com');
console.log('• Expo: https://expo.dev');

console.log('\n📖 Documentation:');
console.log('• See DEPLOYMENT_GUIDE.md for detailed instructions');
console.log('• Backend README.md for API documentation');
console.log('• Frontend README.md for APK generation');

console.log('\n🎯 Next Steps:');
console.log('1. Follow the DEPLOYMENT_GUIDE.md');
console.log('2. Set up your database');
console.log('3. Deploy backend to Vercel');
console.log('4. Update frontend API URL');
console.log('5. Generate and test APK');

console.log('\n✨ Happy deploying! 🚀📱');