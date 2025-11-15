const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  crypto: require.resolve('react-native-crypto'),
};

config.resolver.assetExts = [...(config.resolver.assetExts || []), 'png', 'jpg', 'jpeg', 'gif', 'svg'];

module.exports = config;