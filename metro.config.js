const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Workaround for https://github.com/expo/expo/issues/52175: expo-notifications' Android build
// eagerly requires ExpoTopicSubscriptionModule, which Expo Go never registers, so importing the
// package red-screens the app (upstream fix pending in expo/expo#52182). Redirect that single
// file to a local shim using requireOptionalNativeModule with an empty fallback: Expo Go then
// boots normally, dev/production builds still resolve the real native module, and iOS/web keep
// resolving their no-op stub untouched. Remove this override once expo-notifications ships the
// upstream fix.
const TOPIC_SUBSCRIPTION_SHIM = path.resolve(
  __dirname,
  'src/shims/expo-notifications-topic-subscription.js'
);

const previousResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolution =
    previousResolveRequest?.(context, moduleName, platform) ??
    context.resolveRequest(context, moduleName, platform);

  if (typeof resolution?.filePath === 'string') {
    const filePath = resolution.filePath.replace(/\\/g, '/');
    if (filePath.endsWith('expo-notifications/build/TopicSubscriptionModule.android.js')) {
      return { ...resolution, filePath: TOPIC_SUBSCRIPTION_SHIM };
    }
  }

  return resolution;
};

module.exports = config;
