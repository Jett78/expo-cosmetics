import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { NotificationData, NotificationResponse } from './types';

type NotificationTapListener = (data: NotificationData) => void;

const tapListeners = new Set<NotificationTapListener>();

export function onNotificationTap(listener: NotificationTapListener): () => void {
  tapListeners.add(listener);
  return () => tapListeners.delete(listener);
}

function extractData(response: NotificationResponse): NotificationData {
  const content = response.notification.request.content;
  const data = content.data ?? {};
  return data as NotificationData;
}

export function handleNotificationResponse(response: NotificationResponse): void {
  const data = extractData(response);

  for (const listener of tapListeners) {
    try {
      listener(data);
    } catch {
      // ignore listener errors
    }
  }
}

export function addNotificationResponseListener(
  handler: (response: NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(handler);
}

export function configureNotificationBehavior(): void {
  if (Platform.OS === 'web') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}
