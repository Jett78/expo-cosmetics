import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { NotificationPermissionStatus } from './types';

const ANDROID_CHANNEL_ID = 'orders';

let androidChannelReady = false;

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android' || androidChannelReady) return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Order Updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FDF8F6',
    bypassDnd: false,
  });

  androidChannelReady = true;
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.granted) return 'granted';
  if (settings.status === 'undetermined') return 'undetermined';
  return 'denied';
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await ensureAndroidChannel();
  }

  const current = await getNotificationPermissionStatus();
  if (current === 'granted') return true;
  if (current === 'denied') return false;

  const result = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return result.granted;
}

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[Push] getExpoPushToken: not a physical device (emulator?)');
    return null;
  }

  try {
    const projectId =
      process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? Constants.expoConfig?.extra?.eas?.projectId;

    const result = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);

    console.log('[Push] Expo push token:', result.data);
    return result.data;
  } catch (error) {
    console.warn(
      '[Push] getExpoPushToken failed:',
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const granted = await requestNotificationPermissions();
    console.log('[Push] permission granted:', granted);
    if (!granted) return null;

    if (Platform.OS === 'android') {
      await ensureAndroidChannel();
    }

    return await getExpoPushToken();
  } catch (error) {
    console.warn(
      '[Push] registerForPushNotifications failed:',
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}
