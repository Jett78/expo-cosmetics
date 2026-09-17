import { useMemo } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Dimensions, Platform, ActivityIndicator, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useBlogBySlug } from '../../src/services/blog/hooks';
import { spacing, radius, typography, shadows } from '../../src/design-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogDetailScreen() {
  const rawSlug = useLocalSearchParams().slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : (rawSlug as string ?? '');
  const { colors } = useAppTheme();

  const { data, isLoading, error } = useBlogBySlug(slug);

  const blog = data?.blog;
  const imageLink = data?.imageLink;

  const heroImage = useMemo(() => {
    if (imageLink) {
      return imageLink['1024'] || imageLink['768'] || imageLink['480'] || '';
    }
    return blog?.imageLink?.['1024'] || blog?.imageLink?.['768'] || blog?.imageLink?.['original'] || '';
  }, [imageLink, blog]);

  const cleanDescription = useMemo(
    () => (blog?.description ? stripHtml(blog.description) : ''),
    [blog],
  );

  const handleShare = async () => {
    if (!blog) return;
    try {
      await Share.share({
        message: `${blog.title}\n\nRead more on L.A. Cosmetics Nepal`,
      });
    } catch {}
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !blog) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>
            Blog not found
          </Text>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <Text style={[typography.button, { color: colors.accent }]}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: heroImage }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />

          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.7)' }]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={[styles.shareButton, { backgroundColor: 'rgba(255,255,255,0.7)' }]}
            accessibilityLabel="Share blog"
          >
            <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {/* Category Badge */}
          {blog.category?.title && (
            <View style={[styles.categoryBadge, { backgroundColor: colors.accent }]}>
              <Text style={[typography.caption, { color: colors.textInverse }]}>
                {blog.category.title}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text style={[typography.h1, { color: colors.textPrimary, marginTop: spacing.md }]}>
            {blog.title}
          </Text>

          {/* Date */}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={[typography.captionLarge, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
              {formatDate(blog.createdAt)}
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          {/* Description */}
          <Text style={[styles.description, { color: colors.textMuted }]}>
            {cleanDescription}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  backBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.65,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  shareButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  content: {
    padding: spacing.xl,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    marginBottom: spacing.xl,
  },
  description: {
    ...typography.body,
    lineHeight: 26,
  },
});
