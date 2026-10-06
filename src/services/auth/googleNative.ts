type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin');

let nativeModule: GoogleSigninModule | null = null;
let loadAttempted = false;

const loadNativeModule = (): GoogleSigninModule | null => {
  if (loadAttempted) {
    return nativeModule;
  }
  loadAttempted = true;

  try {
    const mod = require('@react-native-google-signin/google-signin') as GoogleSigninModule;
    nativeModule = mod && typeof mod.GoogleSignin?.signOut === 'function' ? mod : null;
  } catch (error) {
    nativeModule = null;
  }

  return nativeModule;
};

export const getGoogleSigninNative = (): GoogleSigninModule | null => loadNativeModule();

export const isNativeGoogleSigninAvailable = (): boolean => loadNativeModule() !== null;

export const signOutNative = (): void => {
  const mod = loadNativeModule();
  if (!mod) {
    return;
  }
  Promise.resolve()
    .then(() => mod.GoogleSignin.signOut())
    .catch(() => {});
};
