type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin');

let nativeModule: GoogleSigninModule | null = null;
let loadAttempted = false;
let loadFailed = false;

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
    loadFailed = true;
  }

  return nativeModule;
};

export const getGoogleSigninNative = (): GoogleSigninModule | null => loadNativeModule();

export const isNativeGoogleSigninAvailable = (): boolean => !loadFailed && loadNativeModule() !== null;

export const signOutNative = (): void => {
  if (loadFailed) {
    return;
  }
  
  try {
    const mod = loadNativeModule();
    if (!mod) {
      return;
    }
    mod.GoogleSignin.signOut().catch(() => {});
  } catch (error) {
    // Silently fail if native module not available
  }
};
