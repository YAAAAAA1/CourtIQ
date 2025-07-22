// Metro config using polling instead of file watching
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Disable all file watching
process.env.WATCHMAN_DISABLED = '1';
process.env.EXPO_USE_WATCHMAN = '0';
process.env.METRO_NO_WATCH = '1';

const config = getDefaultConfig(__dirname);

// Disable Watchman
config.resolver.useWatchman = false;

// Use polling instead of file watching
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    // Disable file watching middleware
    return (req, res, next) => {
      if (req.url.includes('/file-watcher')) {
        res.statusCode = 404;
        res.end();
        return;
      }
      return middleware(req, res, next);
    };
  }
};

// Minimal resolver configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add support for nativewind
module.exports = withNativeWind(config, { 
  input: './src/global.css',
  configPath: 'tailwind.config.js',
  projectRoot: __dirname,
  isCSSFile: (filePath) => filePath.endsWith('.css'),
}); 