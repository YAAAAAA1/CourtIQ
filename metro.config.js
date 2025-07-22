// Minimal Metro config that extends @expo/metro-config and includes NativeWind
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Force disable Watchman and file watching
process.env.WATCHMAN_DISABLED = '1';
process.env.EXPO_USE_WATCHMAN = '0';
process.env.METRO_NO_WATCH = '1';

// Get the default config
const config = getDefaultConfig(__dirname);

// Add support for nativewind
module.exports = withNativeWind(config, { 
  input: './src/global.css',
  configPath: 'tailwind.config.js',
  projectRoot: __dirname,
  isCSSFile: (filePath) => filePath.endsWith('.css'),
});
