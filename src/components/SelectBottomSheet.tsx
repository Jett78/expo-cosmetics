import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { radius, spacing, typography } from '../design-system';
import { useAppTheme } from '../hooks/useAppTheme';

export type SelectOption = {
  label: string;
  value: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
};

export default function SelectBottomSheet({
  visible,
  onClose,
  title,
  options,
  value,
  onSelect,
  placeholder = 'No options available',
}: Props) {
  const { colors } = useAppTheme();

  const [mounted, setMounted] = useState(false);
  const progress = useSharedValue(0);

  const finishHide = useCallback(() => setMounted(false), []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withDelay(50, withTiming(1, { duration: 300 }));
    } else {
      progress.value = withTiming(0, { duration: 250 }, () => {
        runOnJS(finishHide)();
      });
    }
  }, [visible, progress, finishHide]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.5,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 320 }],
  }));

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    onClose();
  };

  if (!mounted) return null;

  return (
    <Modal transparent visible onRequestClose={onClose} animationType='none'>
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <Pressable style={styles.backdropTap} onPress={onClose} />
      <View style={styles.sheetHost} pointerEvents='box-none'>
        <Animated.View style={[styles.sheet, { backgroundColor: colors.surface }, sheetStyle]}>
          <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
            <Text style={[typography.h3, { color: colors.textPrimary }]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name='close' size={24} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
          >
            {options.length === 0 ? (
              <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center' }]}>
                {placeholder}
              </Text>
            ) : (
              options.map((option) => {
                const isActive = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    style={[
                      styles.optionRow,
                      { backgroundColor: isActive ? colors.accent : colors.surfaceMuted },
                    ]}
                  >
                    <Text
                      style={[
                        typography.body,
                        {
                          color: isActive ? colors.textInverse : colors.textPrimary,
                          fontWeight: isActive ? '600' : '400',
                          flexShrink: 1,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isActive && (
                      <Ionicons name='checkmark-circle' size={20} color={colors.textInverse} />
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const ABS_FILL = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

const styles = StyleSheet.create({
  backdrop: {
    ...ABS_FILL,
    backgroundColor: '#000',
  },
  backdropTap: {
    ...ABS_FILL,
  },
  sheetHost: {
    ...ABS_FILL,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    padding: spacing.xl,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
});
