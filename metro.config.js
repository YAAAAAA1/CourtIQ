const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

// Add support for SVG files
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Configure asset and source extensions
config.resolver.assetExts = config.resolver.assetExts
  .filter(ext => !['svg', 'css', 'scss', 'sass', 'less'].includes(ext))
  .concat(['db', 'sqlite']);

config.resolver.sourceExts = [
  ...new Set([
    ...config.resolver.sourceExts,
    'svg',
    'cjs',
    'mjs',
    'css',
    'scss',
    'sass',
    'less',
  ]),
];

// Add support for path aliases
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => {
      if (name === '@') {
        return path.join(__dirname, 'src');
      }
      return path.join(process.cwd(), `node_modules/${name}`);
    },
  }
);

// Configure watchman
config.watchFolders = [__dirname];
config.resolver.useWatchman = false;

// Disable new architecture
process.env.RCT_NEW_ARCH_ENABLED = '0';
process.env.EXPO_USE_NEW_ARCH = '0';
process.env.REACT_NATIVE_USE_NEW_ARCH = '0';
process.env.REACT_NATIVE_USE_TURBO_MODULES = '0';
process.env.EXPO_USE_WATCHMAN = '0';

// Configure transformer
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Disable experimental features
config.resolver.unstable_enableSymlinks = false;
config.resolver.unstable_enablePackageExports = false;

// Add NativeWind support if available
try {
  const { withNativeWind } = require('nativewind/metro');
  module.exports = withNativeWind(config, { input: './src/global.css' });
} catch (error) {
  console.warn('NativeWind is not available, skipping...');
  module.exports = config;
}
