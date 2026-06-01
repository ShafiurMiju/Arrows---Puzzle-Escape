module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset'],
    // Keep the worklets plugin last; it rewrites the AST for Reanimated v4.
    plugins: ['react-native-worklets/plugin'],
  };
};
