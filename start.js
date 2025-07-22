// Custom start script to bypass Watchman issues
const { execSync } = require('child_process');

// Get command line arguments
const args = process.argv.slice(2).join(' ');

console.log('Starting Expo development server with Watchman disabled...');

// Set environment variables to disable Watchman and use our fixed config
process.env.WATCHMAN_DISABLED = '1';
process.env.EXPO_USE_WATCHMAN = '0';
process.env.EXPO_METRO_CONFIG = 'metro.config.fixed.js';
process.env.METRO_NO_WATCHMAN = '1';
process.env.EXPO_DEBUG = '1';

// Build the command
let command = 'npx expo start';

// Add any additional arguments
if (args) {
  command += ` ${args}`;
}

try {
  // Start the Expo server with our custom Metro config
  console.log(`Running: ${command}`);
  
  execSync(command, { 
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.error('Failed to start Expo development server:', error);
  process.exit(1);
}
