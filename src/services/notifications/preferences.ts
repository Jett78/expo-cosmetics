import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_PREFERENCE_KEY = 'push_notifications_enabled';
const REGISTERED_TOKEN_KEY = 'push_registered_token';

/**
 * null = user never chose (default: auto-register on login, system prompt on first use)
 * 'true' / 'false' = explicit user choice, always respected
 */
export async function getPushPreference(): Promise<boolean | null> {
  try {
    const value = await AsyncStorage.getItem(PUSH_PREFERENCE_KEY);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

export async function setPushPreference(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(PUSH_PREFERENCE_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore storage failures
  }
}

export async function isPushEnabled(): Promise<boolean> {
  const pref = await getPushPreference();
  return pref !== false;
}

/**
 * Remember which Expo push token was registered for this device,
 * so "turn off" can unregister it even if permission was later
 * revoked at the OS level (when the token can't be fetched anymore).
 */
export async function saveRegisteredToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(REGISTERED_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export async function getRegisteredToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REGISTERED_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearRegisteredToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(REGISTERED_TOKEN_KEY);
  } catch {
    // ignore
  }
}
