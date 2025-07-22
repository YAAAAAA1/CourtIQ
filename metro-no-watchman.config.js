// Minimal Metro config that avoids Watchman completely
const { withNativeWind } = require('nativewind/metro');
const { FileStore } = require('metro-cache');
const path = require('path');

// Force disable Watchman
process.env.WATCHMAN_DISABLED = '1';
process.env.EXPO_USE_WATCHMAN = '0';

// Create a minimal config
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'main'],
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
    assetExts: ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ttf', 'otf', 'woff', 'woff2'],
  },
  // Disable Watchman
  watchman: false,
  // Use a simple file watcher
  watch: false,
  // No watch folders
  watchFolders: [],
  // File system configuration
  projectRoot: __dirname,
  // Cache configuration
  cacheStores: [
    new FileStore({
      root: path.join(__dirname, 'node_modules/.cache/metro'),
    }),
  ],
  // Disable the file watcher
  resetCache: true,
  // Disable symlinks
  resolver: {
    unstable_enableSymlinks: false,
    unstable_enablePackageExports: false,
  },
  // Disable the file crawler
  server: {
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        if (req.url.startsWith('/onchange') || req.url.includes('watchman')) {
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

// Ensure Watchman is disabled in the final config
configWithNativeWind.watchman = false;
configWithNativeWind.watch = false;
configWithNativeWind.watchFolders = [];

// Export the final config
module.exports = configWithNativeWind;
