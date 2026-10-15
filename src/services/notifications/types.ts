import * as Notifications from 'expo-notifications';

export type NotificationData = {
  type?: string;
  orderId?: string;
  deepLink?: string;
  [key: string]: unknown;
};

export type OrderNotificationType =
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_out_for_delivery'
  | 'order_delivered'
  | 'order_cancelled'
  | 'refund_processed';

export type RegisterDevicePayload = {
  token: string;
  platform: 'ios' | 'android';
  deviceId?: string;
};

export type RegisterDeviceResponse = {
  success: boolean;
  statusCode: string;
  message: string;
  data?: unknown;
};

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export type ReceivedNotification = Notifications.Notification;
export type NotificationResponse = Notifications.NotificationResponse;
