// Standalone Metro config that doesn't use file watching
const { withNativeWind } = require('nativewind/metro');

// Disable all file watching and caching
process.env.WATCHMAN_DISABLED = '1';
process.env.EXPO_USE_WATCHMAN = '0';
process.env.METRO_NO_WATCH = '1';

// Mock the file watcher
class MockWatcher {
  on() { return this; }
  end() {}
  isReady() { return true; }
  getWatchers() { return {}; }
  getInfo() { return { watchers: [], worker: { type: 'mock' } }; }
}

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
  server: {
    enhanceMiddleware: (middleware) => (req, res, next) => {
      if (req.url.startsWith('/onchange') || req.url.includes('watch')) {
        return res.end(JSON.stringify({ files: [] }));
      }
      return middleware(req, res, next);
    },
  },
  createModuleIdFactory: () => (path) => {
    let hash = 0;
    for (let i = 0; i < path.length; i++) {
      const char = path.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
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

// Final config overrides
Object.assign(configWithNativeWind, {
  watchman: false,
  watch: false,
  watchFolders: [],
  watcher: { createWatcher: () => new MockWatcher() },
  cacheStores: [],
});

module.exports = configWithNativeWind;
