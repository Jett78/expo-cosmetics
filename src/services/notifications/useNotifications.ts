import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useCommerce } from '../../context/CommerceContext';
import { registerDeviceToken, unregisterDeviceToken } from './api';
import {
  addNotificationResponseListener,
  configureNotificationBehavior,
  handleNotificationResponse,
  onNotificationTap,
} from './handlers';
import { clearRegisteredToken, getPushPreference, saveRegisteredToken } from './preferences';
import { registerForPushNotifications } from './registration';
import type { NotificationData } from './types';

configureNotificationBehavior();

export function useNotifications() {
  const { token: authToken, isAuthenticated } = useCommerce();
  const registeredTokenRef = useRef<string | null>(null);
  const registeredWithAuthRef = useRef<string | null>(null);

  const registerDevice = useCallback(async () => {
    const currentAuth = registeredWithAuthRef.current;
    if (!currentAuth) {
      console.warn('[Push] registerDevice skipped: no auth token');
      return;
    }

    const pushToken = await registerForPushNotifications();
    if (!pushToken) {
      console.warn('[Push] registerDevice aborted: no push token');
      return;
    }

    if (registeredTokenRef.current === pushToken) return;

    try {
      await registerDeviceToken(
        {
          token: pushToken,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        },
        currentAuth
      );
      registeredTokenRef.current = pushToken;
      await saveRegisteredToken(pushToken);
      console.log('[Push] device token registered with backend');
    } catch (error) {
      console.warn(
        '[Push] register-device API failed:',
        error instanceof Error ? error.message : String(error)
      );
    }
  }, []);

  const unregisterDevice = useCallback(async () => {
    const pushToken = registeredTokenRef.current;
    const authUsed = registeredWithAuthRef.current;

    if (!pushToken || !authUsed) return;

    try {
      await unregisterDeviceToken(pushToken, authUsed);
    } catch {
      // ignore
    } finally {
      registeredTokenRef.current = null;
      registeredWithAuthRef.current = null;
      await clearRegisteredToken();
    }
  }, []);

  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && authToken) {
      registeredWithAuthRef.current = authToken;
      wasAuthenticatedRef.current = true;
      (async () => {
        const pref = await getPushPreference();
        if (pref === false) {
          console.log('[Push] auto-register skipped: preference OFF');
          return;
        }
        console.log('[Push] auto-register triggered (pref:', pref, ')');
        registerDevice();
      })();
    } else if (wasAuthenticatedRef.current) {
      // Transition authed -> unauthed: clean up before token is gone from context
      wasAuthenticatedRef.current = false;
      unregisterDevice();
    }
  }, [isAuthenticated, authToken, registerDevice, unregisterDevice]);

  return {
    registerDevice,
    unregisterDevice,
  };
}

export function useNotificationNavigation(navigate: (data: NotificationData) => void): void {
  const navigateRef = useRef(navigate);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    const subscription = addNotificationResponseListener((response) => {
      handleNotificationResponse(response);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = onNotificationTap((data) => {
      navigateRef.current(data);
    });

    return unsubscribe;
  }, []);
}
