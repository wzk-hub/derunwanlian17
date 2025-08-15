#!/usr/bin/env node

/**
 * Pre-build script for Netlify deployment
 * Handles pnpm lockfile synchronization issues
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🚀 Starting pre-build checks...');

// Check if pnpm-lock.yaml exists
if (!fs.existsSync('pnpm-lock.yaml')) {
  console.log('📦 No lockfile found, will be created during install');
} else {
  console.log('📦 Lockfile exists, checking sync...');
}

// Function to run commands safely
function runCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Try pnpm install with different strategies
console.log('📦 Installing dependencies...');

// Strategy 1: Try with no-frozen-lockfile
if (runCommand('pnpm install --no-frozen-lockfile', 'Installing with no-frozen-lockfile')) {
  console.log('✅ Dependencies installed successfully');
} else {
  // Strategy 2: Clear cache and try again
  console.log('⚠️ First attempt failed, clearing cache...');
  runCommand('pnpm store prune', 'Clearing pnpm store');
  
  if (runCommand('pnpm install --no-frozen-lockfile --force', 'Force installing dependencies')) {
    console.log('✅ Dependencies installed with force flag');
  } else {
    console.log('❌ All installation strategies failed');
    process.exit(1);
  }
}

// Build the project
if (runCommand('pnpm build', 'Building project')) {
  console.log('🎉 Build completed successfully!');
} else {
  console.log('❌ Build failed');
  process.exit(1);
}

console.log('✅ Pre-build script completed successfully!');