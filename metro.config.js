// Metro configuration for Expo. Extends the default config to make sure audio
// asset extensions used by expo-audio are bundled.
// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts = Array.from(
  new Set([...config.resolver.assetExts, 'mp3', 'wav', 'ogg', 'm4a']),
);

module.exports = config;
