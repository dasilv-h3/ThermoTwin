const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Tree-shaking improvements:
// - unstable_allowRequireContext: safe, enables `require.context` used by Expo Router
// - inlineRequires: defer require() calls until first usage to shrink the
//   initial evaluation graph (helps dead-code elimination and startup).
// - unstable_transformProfile "hermes-stable" ensures Hermes-aware output.
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: true,
      inlineRequires: true,
    },
  }),
};

// Prefer "module" field over "main" for ESM-first packages — lets Metro pick
// the ESM build, which is far more tree-shakable than CJS.
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
  resolverMainFields: ['react-native', 'module', 'browser', 'main'],
};

module.exports = config;
