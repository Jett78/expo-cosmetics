import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

const GENERIC_ERROR = 'Google sign in failed. Please try again.';

type GoogleAuthCallbacks = {
  onSuccess: (idToken: string) => void;
  onError: (message: string) => void;
};

function describeNativeError(error: unknown): string {
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return 'Google Play Services is required for Google sign in. Please update it and try again.';
    }
    if (error.code === statusCodes.SIGN_IN_REQUIRED) {
      return 'No Google account is available on this device. Please add an account and try again.';
    }
  }
  return GENERIC_ERROR;
}

export function useGoogleAuth({ onSuccess, onError }: GoogleAuthCallbacks) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({ scheme: 'la-cosmetics' }),
  });

  const [nativeReady, setNativeReady] = useState(Platform.OS === 'web');

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      ...(IOS_CLIENT_ID ? { iosClientId: IOS_CLIENT_ID } : {}),
    });
    setNativeReady(true);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || !response) {
      return;
    }
    if (response.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) {
        onSuccessRef.current(idToken);
      } else {
        onErrorRef.current(GENERIC_ERROR);
      }
    } else if (response.type === 'error') {
      onErrorRef.current(GENERIC_ERROR);
    }
  }, [response]);

  const signIn = useCallback(async () => {
    if (Platform.OS === 'web') {
      if (!request) {
        return;
      }
      try {
        await promptAsync();
      } catch {
        onErrorRef.current(GENERIC_ERROR);
      }
      return;
    }

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      if (result.type !== 'success') {
        return;
      }
      const idToken = result.data.idToken;
      if (idToken) {
        onSuccessRef.current(idToken);
      } else {
        onErrorRef.current(GENERIC_ERROR);
      }
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        (error.code === statusCodes.SIGN_IN_CANCELLED || error.code === statusCodes.IN_PROGRESS)
      ) {
        return;
      }
      onErrorRef.current(describeNativeError(error));
    }
  }, [promptAsync, request]);

  const isReady = Platform.OS === 'web' ? Boolean(request) : nativeReady;

  return { signIn, isReady };
}
