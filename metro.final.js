// Final attempt at a Metro config that avoids file watching
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Completely disable Watchman and file watching
process.env.WATCHMAN_DISABLED = '1';
process.env.EXPO_USE_WATCHMAN = '0';
process.env.METRO_NO_WATCH = '1';

// Get default config
const defaultConfig = getDefaultConfig(__dirname);

// Mock the file watcher
const mockWatcher = {
  on: () => mockWatcher,
  end: () => {},
  isReady: () => true,
  getWatchers: () => ({}),
  getInfo: () => ({
    watchers: [],
    worker: { type: 'mock' },
  }),
};

// Create a custom config
const config = {
  ...defaultConfig,
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    ...defaultConfig.resolver,
    resolverMainFields: ['react-native', 'browser', 'main'],
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
    assetExts: [...defaultConfig.resolver.assetExts, 'glb', 'gltf', 'svg', 'ttf', 'otf'],
  },
  // Disable Watchman and file watching
  watchman: false,
  watch: false,
  watchFolders: [],
  resetCache: true,
  // Mock the file watcher
  watcher: {
    createWatcher: () => mockWatcher,
  },
  // Disable the file crawler
  server: {
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        if (req.url.startsWith('/onchange') || req.url.includes('watch')) {
          res.end(JSON.stringify({ files: [] }));
          return;
        }
        return middleware(req, res, next);
      };
    },
  },
};

// Apply NativeWind
const configWithNativeWind = withNativeWind(config, {
  input: './src/global.css',
  configPath: 'tailwind.config.js',
  projectRoot: __dirname,
  isCSSFile: (filePath) => filePath.endsWith('.css'),
});

// Final config overrides
configWithNativeWind.watchman = false;
configWithNativeWind.watch = false;
configWithNativeWind.watchFolders = [];

// Export the final config
module.exports = configWithNativeWind;
