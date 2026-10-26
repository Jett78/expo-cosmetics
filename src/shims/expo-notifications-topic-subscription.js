// Workaround for https://github.com/expo/expo/issues/52175 (upstream fix pending in
// https://github.com/expo/expo/pull/52182): expo-notifications' Android build requires its
// TopicSubscriptionModule at import time, but Expo Go never registers
// ExpoTopicSubscriptionModule, so any import of the package crashes the app. Look the module
// up optionally with an empty fallback, matching the upstream fix: topic APIs then throw
// UnavailabilityError only if called (the app never calls them), while dev/production builds
// resolve the real native module exactly as before. Redirected here from metro.config.js;
// remove both once expo-notifications ships the upstream fix.
import { requireOptionalNativeModule } from 'expo';

export default requireOptionalNativeModule('ExpoTopicSubscriptionModule') ?? {};
