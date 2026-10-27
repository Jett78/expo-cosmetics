import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { BlurView, type BlurViewProps } from 'expo-blur';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../hooks/useAppTheme';
import { spacing, radius, typography } from '../../design-system';
import type { ApiBanner } from '../../types/banner';
import { resolveBannerLink } from '../../utils/resolveBannerLink';

type PopupBannerModalProps = {
  visible: boolean;
  banner: ApiBanner | null;
  onClose: () => void;
  blurTarget?: BlurViewProps['blurTarget'];
};

const MAX_WIDTH = 340;

function shouldOpenExternally(link: string): boolean {
  if (!/^https?:\/\//i.test(link)) return false;

  try {
    const { searchParams } = new URL(link);
    return !searchParams.has('query') && !searchParams.has('brandId');
  } catch {
    return false;
  }
}

export default function PopupBannerModal({
  visible,
  banner,
  onClose,
  blurTarget,
}: PopupBannerModalProps) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  if (!banner) return null;

  const imageUri =
    banner.imageLink?.['768'] ?? banner.imageLink?.['480'] ?? banner.imageLink?.original ?? banner.image;

  const cardWidth = Math.min(width - spacing['3xl'] * 2, MAX_WIDTH);
  const imageHeight = Math.min(height * 0.5, cardWidth * 1.4);

  const handleImagePress = () => {
    onClose();

    const link = banner.buttonLink;
    if (!link) return;

    if (shouldOpenExternally(link)) {
      WebBrowser.openBrowserAsync(link);
      return;
    }

    const { route, params } = resolveBannerLink(link);
    router.push({ pathname: route, params });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView
        blurTarget={blurTarget ?? undefined}
        blurMethod='dimezisBlurView'
        intensity={30}
        tint='dark'
        style={StyleSheet.absoluteFill}
      />
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.card, { backgroundColor: colors.surface, width: cardWidth }]}>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
            <Text style={[typography.button, { color: colors.textSecondary }]}>✕</Text>
          </Pressable>

          <Pressable onPress={handleImagePress} style={styles.imagePressable}>
            <Image
              source={{ uri: imageUri }}
              style={[styles.image, { height: imageHeight }]}
              contentFit="cover"
              transition={200}
            />
          </Pressable>

          {banner.description ? (
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary, marginTop: spacing.xs },
              ]}
            >
              {banner.description}
            </Text>
          ) : null}

          {banner.buttonText && banner.buttonLink ? (
            <Pressable
              style={[styles.ctaBtn, { backgroundColor: colors.accent }]}
              onPress={handleImagePress}
            >
              <Text style={[typography.button, { color: colors.surface }]}>
                {banner.buttonText}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePressable: {
    width: '100%',
  },
  image: {
    width: '100%',
  },
  ctaBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    minWidth: 160,
    alignItems: 'center',
  },
});
