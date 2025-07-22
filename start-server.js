#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

// Set higher limits for macOS
if (os.platform() === 'darwin') {
  try {
    // Try to set higher file descriptor limit
    process.setMaxListeners(0);
    
    // Set environment variables to disable file watching
    process.env.WATCHMAN_DISABLED = '1';
    process.env.EXPO_USE_WATCHMAN = '0';
    process.env.METRO_NO_WATCH = '1';
    process.env.METRO_DISABLE_FILE_WATCHING = '1';
    process.env.NODE_OPTIONS = '--max-old-space-size=4096';
    
    console.log('🚀 Starting Expo server with optimized settings...');
    console.log('📁 File watching disabled to prevent "too many open files" error');
    
    // Start expo with specific flags
    const expo = spawn('npx', ['expo', 'start', '--clear', '--no-dev'], {
      stdio: 'inherit',
      env: process.env,
      shell: true
    });
    
    expo.on('error', (error) => {
      console.error('❌ Failed to start Expo:', error);
      process.exit(1);
    });
    
    expo.on('exit', (code) => {
      console.log(`Expo process exited with code ${code}`);
      process.exit(code);
    });
    
  } catch (error) {
    console.error('❌ Error setting up server:', error);
    process.exit(1);
  }
} else {
  console.log('⚠️  This script is optimized for macOS');
  process.exit(1);
} 