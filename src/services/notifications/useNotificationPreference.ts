import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';

import { useCommerce } from '../../context/CommerceContext';
import { registerDeviceToken, unregisterDeviceToken } from './api';
import {
  clearRegisteredToken,
  getPushPreference,
  getRegisteredToken,
  saveRegisteredToken,
  setPushPreference,
} from './preferences';
import {
  getExpoPushToken,
  getNotificationPermissionStatus,
  registerForPushNotifications,
  requestNotificationPermissions,
} from './registration';

export type NotificationToggleState = {
  enabled: boolean;
  checking: boolean;
  toggle: (value: boolean) => Promise<void>;
};

export function useNotificationPreference(): NotificationToggleState {
  const { token: authToken } = useCommerce();
  const [enabled, setEnabled] = useState(false);
  const [checking, setChecking] = useState(true);
  const awaitingSettingsRef = useRef(false);
  const authTokenRef = useRef<string | null>(authToken);

  useEffect(() => {
    authTokenRef.current = authToken;
  }, [authToken]);

  const registerWithBackend = useCallback(async () => {
    const auth = authTokenRef.current;
    if (!auth) {
      console.warn('[Push] toggle-register skipped: no auth token');
      return;
    }

    const pushToken = await registerForPushNotifications();
    if (!pushToken) {
      console.warn('[Push] toggle-register aborted: no push token');
      return;
    }

    try {
      await registerDeviceToken(
        { token: pushToken, platform: Platform.OS === 'ios' ? 'ios' : 'android' },
        auth
      );
      await saveRegisteredToken(pushToken);
      console.log('[Push] device token registered via toggle');
    } catch (error) {
      console.warn(
        '[Push] toggle register-device API failed:',
        error instanceof Error ? error.message : String(error)
      );
    }
  }, []);

  const unregisterFromBackend = useCallback(async () => {
    const auth = authTokenRef.current;
    const savedToken = await getRegisteredToken();
    const pushToken = savedToken ?? (await getExpoPushToken());

    if (pushToken && auth) {
      try {
        await unregisterDeviceToken(pushToken, auth);
        console.log('[Push] device token unregistered');
      } catch (error) {
        console.warn(
          '[Push] unregister-device API failed:',
          error instanceof Error ? error.message : String(error)
        );
      }
    } else {
      console.warn('[Push] unregister skipped: no token or auth');
    }
    await clearRegisteredToken();
  }, []);

  const evaluate = useCallback(async () => {
    const [pref, status] = await Promise.all([
      getPushPreference(),
      getNotificationPermissionStatus(),
    ]);
    const on = pref !== false && status === 'granted';
    setEnabled(on);
    setChecking(false);
    return { pref, status, on };
  }, []);

  useFocusEffect(
    useCallback(() => {
      evaluate();
    }, [evaluate])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;

      (async () => {
        const result = await evaluate();
        if (awaitingSettingsRef.current && result.on) {
          awaitingSettingsRef.current = false;
          await setPushPreference(true);
          await registerWithBackend();
          setEnabled(true);
        }
      })();
    });

    return () => subscription.remove();
  }, [evaluate, registerWithBackend]);

  const toggle = useCallback(
    async (value: boolean) => {
      if (value) {
        const status = await getNotificationPermissionStatus();

        if (status === 'granted') {
          await setPushPreference(true);
          await registerWithBackend();
          setEnabled(true);
          return;
        }

        if (status === 'undetermined') {
          const granted = await requestNotificationPermissions();
          if (granted) {
            await setPushPreference(true);
            await registerWithBackend();
            setEnabled(true);
          } else {
            Alert.alert(
              'Notifications turned off',
              'You declined notifications. You can allow them later from this switch or your phone settings.'
            );
          }
          return;
        }

        // Permission already blocked at the OS level — prompt can't be shown again.
        Alert.alert(
          'Enable notifications',
          'Notifications are blocked for this app. Allow them in your phone settings to receive order updates.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                awaitingSettingsRef.current = true;
                Linking.openSettings();
              },
            },
          ]
        );
        return;
      }

      awaitingSettingsRef.current = false;
      await setPushPreference(false);
      await unregisterFromBackend();
      setEnabled(false);
    },
    [registerWithBackend, unregisterFromBackend]
  );

  return { enabled, checking, toggle };
}
