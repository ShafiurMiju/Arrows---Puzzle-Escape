module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // NOTE: react-native-reanimated v4 relies on react-native-worklets. With
    // babel-preset-expo (Expo SDK 54+) the Worklets Babel plugin is added and
    // ordered automatically — do NOT add 'react-native-worklets/plugin' here,
    // or it runs twice and breaks the build.
  };
};
