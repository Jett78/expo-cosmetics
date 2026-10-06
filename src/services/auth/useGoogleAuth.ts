import { ResponseType, makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { getGoogleSigninNative, isNativeGoogleSigninAvailable } from './googleNative';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

const GENERIC_ERROR = 'Google sign in failed. Please try again.';

type GoogleAuthCallbacks = {
  onSuccess: (idToken: string) => void;
  onError: (message: string) => void;
};

function describeNativeError(error: unknown): string {
  const nativeModule = getGoogleSigninNative();
  if (nativeModule && nativeModule.isErrorWithCode(error)) {
    if (error.code === nativeModule.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return 'Google Play Services is required for Google sign in. Please update it and try again.';
    }
    if (error.code === nativeModule.statusCodes.SIGN_IN_REQUIRED) {
      return 'No Google account is available on this device. Please add an account and try again.';
    }
  }
  return GENERIC_ERROR;
}

export function useGoogleAuth({ onSuccess, onError }: GoogleAuthCallbacks) {
  const [nativeAvailable, setNativeAvailable] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    responseType: ResponseType.IdToken,
    redirectUri: makeRedirectUri({ scheme: 'la-cosmetics', path: 'oauthredirect' }),
  });

  const [nativeReady, setNativeReady] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setNativeAvailable(false);
      return;
    }
    setNativeAvailable(isNativeGoogleSigninAvailable());
  }, []);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!nativeAvailable) {
      return;
    }
    const nativeModule = getGoogleSigninNative();
    if (!nativeModule) {
      return;
    }
    nativeModule.GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      ...(IOS_CLIENT_ID ? { iosClientId: IOS_CLIENT_ID } : {}),
    });
    setNativeReady(true);
  }, [nativeAvailable]);

  useEffect(() => {
    if (!response) {
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
    if (nativeAvailable) {
      const nativeModule = getGoogleSigninNative();
      if (!nativeModule) {
        onErrorRef.current(GENERIC_ERROR);
        return;
      }
      try {
        await nativeModule.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const result = await nativeModule.GoogleSignin.signIn();
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
          nativeModule.isErrorWithCode(error) &&
          (error.code === nativeModule.statusCodes.SIGN_IN_CANCELLED ||
            error.code === nativeModule.statusCodes.IN_PROGRESS)
        ) {
          return;
        }
        console.warn(
          '[GoogleSignIn] native error',
          nativeModule.isErrorWithCode(error) ? error.code : error
        );
        onErrorRef.current(describeNativeError(error));
      }
      return;
    }

    if (!request) {
      return;
    }
    try {
      await promptAsync();
    } catch {
      onErrorRef.current(GENERIC_ERROR);
    }
  }, [nativeAvailable, promptAsync, request]);

  const isReady = nativeAvailable ? nativeReady : Boolean(request);

  return { signIn, isReady };
}
