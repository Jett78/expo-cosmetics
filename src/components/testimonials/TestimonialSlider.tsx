import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { spacing, radius, typography } from '../../design-system';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { ApiTestimonial } from '../../types/testimonial';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 12;
const ITEM_WIDTH = SCREEN_WIDTH - 32 - GAP;

type TestimonialSliderProps = {
  testimonials: ApiTestimonial[];
};

export default function TestimonialSlider({ testimonials }: TestimonialSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { colors } = useAppTheme();

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % testimonials.length;
        flatListRef.current?.scrollToOffset({ offset: next * (ITEM_WIDTH + GAP), animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={testimonials}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + GAP}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (ITEM_WIDTH + GAP));
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: ITEM_WIDTH, backgroundColor: colors.surface }]}>
            <Ionicons name="chatbubble" size={28} color={colors.accent} style={styles.quoteIcon} />
            <Text style={[styles.message, { color: colors.textPrimary }]} numberOfLines={4}>
              {item.message}
            </Text>
            <View style={styles.authorRow}>
              <Image
                source={{ uri: item.avatarLink.original }}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.authorInfo}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.designation, { color: colors.textSecondary }]}>{item.designation}</Text>
              </View>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      {testimonials.length > 1 && (
        <View style={styles.dots}>
          {testimonials.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing['2xl'],
    marginHorizontal: spacing.xl,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginRight: GAP,
  },
  quoteIcon: {
    marginBottom: spacing.md,
    opacity: 0.6,
  },
  message: {
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
  },
  authorInfo: {
    flex: 1,
  },
  name: {
    ...typography.bodyStrong,
    fontWeight: '700',
  },
  designation: {
    ...typography.caption,
    marginTop: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#F84EA0',
  },
});
