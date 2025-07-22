// Custom Metro config that avoids file watching completely
const { withNativeWind } = require('nativewind/metro');

// Force disable Watchman and file watching
process.env.WATCHMAN_DISABLED = '1';
process.env.EXPO_USE_WATCHMAN = '0';
process.env.METRO_NO_WATCH = '1';

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

// Create a minimal config
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'main'],
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
    assetExts: ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ttf', 'otf'],
  },
  // Disable Watchman and file watching
  watchman: false,
  watch: false,
  watchFolders: [],
  resetCache: true,
  // Mock the file crawler
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
  // Mock the file map
  createModuleIdFactory: () => (path) => {
    // Create a simple hash of the path
    let hash = 0;
    for (let i = 0; i < path.length; i++) {
      const char = path.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `module_${Math.abs(hash)}`;
  },
};

// Apply NativeWind
const configWithNativeWind = withNativeWind(config, {
  input: './src/global.css',
  configPath: 'tailwind.config.js',
  projectRoot: __dirname,
  isCSSFile: (filePath) => filePath.endsWith('.css'),
});

// Ensure Watchman and file watching are disabled in the final config
configWithNativeWind.watchman = false;
configWithNativeWind.watch = false;
configWithNativeWind.watchFolders = [];

// Mock the file watcher in the final config
configWithNativeWind.watcher = {
  createWatcher: () => mockWatcher,
};

// Mock the file map in the final config
configWithNativeWind.cacheStores = [];

module.exports = configWithNativeWind;
