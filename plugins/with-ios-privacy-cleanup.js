const { withInfoPlist } = require("expo/config-plugins");

const UNUSED_IOS_PERMISSION_KEYS = [
  "NSCameraUsageDescription",
  "NSLocationAlwaysAndWhenInUseUsageDescription",
  "NSLocationAlwaysUsageDescription",
  "NSLocationWhenInUseUsageDescription",
  "NSMicrophoneUsageDescription",
  "NSPhotoLibraryUsageDescription",
];

module.exports = function withIosPrivacyCleanup(config) {
  return withInfoPlist(config, (pluginConfig) => {
    for (const key of UNUSED_IOS_PERMISSION_KEYS) {
      delete pluginConfig.modResults[key];
    }
    return pluginConfig;
  });
};
