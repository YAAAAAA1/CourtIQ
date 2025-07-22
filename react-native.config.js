const path = require('path');

module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
  dependencies: {
    // Fix for duplicate React installations
    'react-native-reanimated': {
      platforms: {
        ios: {
          podspecPath: path.join(__dirname, 'node_modules/react-native-reanimated/RNReanimated.podspec'),
        },
      },
    },
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
