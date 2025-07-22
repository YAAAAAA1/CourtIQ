// Bypass Metro config that avoids file watching completely
const { withNativeWind } = require('nativewind/metro');

// Completely disable Watchman and file watching
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

// Mock the file map
const mockFileMap = {
  matchFiles: () => [],
  getModule: () => ({}),
};

// Create a minimal config
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: { experimentalImportSupport: false, inlineRequires: true },
    }),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'main'],
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
    assetExts: ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ttf', 'otf'],
  },
  watchman: false,
  watch: false,
  watchFolders: [],
  resetCache: true,
  cacheStores: [],
  server: {
    enhanceMiddleware: (middleware) => (req, res, next) => {
      if (req.url.startsWith('/onchange') || req.url.includes('watch')) {
        return res.end(JSON.stringify({ files: [] }));
      }
      return middleware(req, res, next);
    },
  },
  watcher: {
    createWatcher: () => mockWatcher,
  },
  // Mock the file map
  getFileMap: () => mockFileMap,
};

// Apply NativeWind
const configWithNativeWind = withNativeWind(config, {
  input: './src/global.css',
  configPath: 'tailwind.config.js',
  projectRoot: __dirname,
  isCSSFile: (filePath) => filePath.endsWith('.css'),
});

// Final config overrides
Object.assign(configWithNativeWind, {
  watchman: false,
  watch: false,
  watchFolders: [],
  cacheStores: [],
  getFileMap: () => mockFileMap,
});

module.exports = configWithNativeWind;
