const path = require('path');
const fs = require('fs');

// Get the app directory
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

// List of allowed directories for module resolution
const allowedDirs = [
  'app',
  'components',
  'hooks',
  'lib',
  'types',
  'assets',
  'constants',
  'navigation',
  'screens',
  'services',
  'store',
  'styles',
  'utils',
];

module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Module resolver
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: [
            '.ios.js',
            '.android.js',
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.json',
          ],
          alias: {
            // Map each allowed directory to its path
            ...allowedDirs.reduce(
              (acc, dir) => ({
                ...acc,
                [`@/${dir}`]: `./${dir}`,
              }),
              {}
            ),
          },
        },
      ],
    ],
  };
};
