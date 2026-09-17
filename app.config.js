const IS_DEV_CLIENT = process.env.EXPO_PUBLIC_USE_DEV_CLIENT !== 'false';

module.exports = {
  expo: {
    name: process.env.EXPO_PUBLIC_APP_NAME ?? 'La Cosmetics',
    slug: process.env.EXPO_PUBLIC_APP_SLUG ?? 'la-cosmetics',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    scheme: 'la-cosmetics',
    splash: {
      image: './assets/la-cos.png',
      resizeMode: 'contain',
      backgroundColor: '#FDF8F6',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.la.cosmetics',
      infoPlist: {
        NSCameraUsageDescription: 'Camera access is used for visual product search.',
        NSPhotoLibraryUsageDescription: 'Photo library access is used for visual product search.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FDF8F6',
      },
      package: 'com.glow.cosmetics',
      permissions: ['CAMERA', 'READ_MEDIA_IMAGES'],
      blockedPermissions: ['android.permission.RECORD_AUDIO'],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      ...(IS_DEV_CLIENT ? ['expo-dev-client'] : []),
      'expo-splash-screen',
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos from your gallery.',
          cameraPermission: 'The app uses your camera for visual product search.',
        },
      ],
    ],
    jsEngine: 'hermes',
    extra: {
      router: {
        origin: false,
      },
      liquidGlassDefaultEnabled: process.env.EXPO_PUBLIC_LIQUID_GLASS_ENABLED !== 'false',
      visualSearchProvider: process.env.EXPO_PUBLIC_VISUAL_SEARCH_PROVIDER ?? 'none',
    },
  },
};
