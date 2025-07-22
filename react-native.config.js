const path = require('path');

module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
  dependencies: {
    // Removed react-native-reanimated dependency
  },
  // Support for TypeScript module resolution
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'main'],
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json'],
  },
  // Metro configuration
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
