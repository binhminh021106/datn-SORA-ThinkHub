const appJson = require('./app.json');

module.exports = () => {
  const iosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

  const plugins = appJson.expo.plugins.map((plugin) => {
    if (plugin === '@react-native-google-signin/google-signin' && iosUrlScheme) {
      return [
        '@react-native-google-signin/google-signin',
        { iosUrlScheme },
      ];
    }

    return plugin;
  });

  return {
    ...appJson.expo,
    plugins,
  };
};
