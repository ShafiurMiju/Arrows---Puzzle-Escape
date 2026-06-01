// Metro configuration for React Native CLI. Extends the default config to make
// sure audio asset extensions used by react-native-sound are bundled.
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    assetExts: Array.from(
      new Set([...defaultConfig.resolver.assetExts, 'mp3', 'wav', 'ogg', 'm4a']),
    ),
  },
};

module.exports = mergeConfig(defaultConfig, config);
