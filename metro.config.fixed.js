// Custom Metro config that completely avoids Watchman
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Force disable Watchman
process.env.WATCHMAN_DISABLED = '1';
process.env.EXPO_USE_WATCHMAN = '0';

// Get the default Metro config with Expo defaults
const defaultConfig = getDefaultConfig(__dirname);

// Create a custom config with Watchman disabled
const config = {
  ...defaultConfig,
  // Disable Watchman
  watchman: false,
  // Disable the file watcher
  watch: false,
  // No watch folders
  watchFolders: [],
  // Reset cache
  resetCache: true,
  // Custom resolver
  resolver: {
    ...defaultConfig.resolver,
    resolverMainFields: ['react-native', 'browser', 'main'],
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
    assetExts: [...defaultConfig.resolver.assetExts, 'glb', 'gltf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ttf', 'otf', 'woff', 'woff2'],
  },
  // Custom transformer
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
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
