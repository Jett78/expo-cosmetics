import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

import { spacing, radius, typography } from '../../design-system';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { ApiBlog } from '../../types/blog';

type BlogCardProps = {
  blog: ApiBlog;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export default function BlogCard({ blog }: BlogCardProps) {
  const { colors } = useAppTheme();
  const cleanDescription = stripHtml(blog.description);

  const cardStyle = StyleSheet.flatten([styles.card, { backgroundColor: colors.surface }]);

  return (
    <Link href={`/blog/${blog.slug}`} asChild>
      <Pressable style={cardStyle}>
      <Image
        source={{ uri: blog.imageLink.original }}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.content}>
        {blog.category?.title && (
          <Text style={[styles.category, { color: colors.accent }]} numberOfLines={1}>
            {blog.category.title}
          </Text>
        )}
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {blog.title}
        </Text>
        <Text style={[styles.excerpt, { color: colors.textSecondary }]} numberOfLines={2}>
          {cleanDescription}
        </Text>
      </View>
    </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  category: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.bodyStrong,
    fontWeight: '700',
    lineHeight: 20,
  },
  excerpt: {
    ...typography.caption,
    lineHeight: 18,
  },
});
