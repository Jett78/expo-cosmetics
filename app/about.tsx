import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radius, spacing, typography } from '../src/design-system';
import { useAppTheme } from '../src/hooks/useAppTheme';

const STORY_IMAGE = 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1074';
const MISSION_IMAGE = 'https://images.unsplash.com/photo-1521316730702-829a8e30dfd0?q=80&w=1170';

const storyParagraphs = [
  'At La Cosmetics, beauty is more than skin deep. Since our beginning, we have been dedicated to creating skincare and cosmetic products that combine science, nature, and care.',
  'From luxurious creams to everyday essentials, each product is crafted with safe, high-quality ingredients designed to bring out your natural glow.',
  'We are committed to cruelty-free testing, eco-friendly packaging, and sustainable sourcing — because beauty should never come at the cost of the planet.',
  'Our mission is simple: to inspire confidence, embrace individuality, and help every customer feel radiant inside and out.',
];

const stats = [
  { value: '1M+', label: 'Happy Customers' },
  { value: '10+', label: 'Years of Excellence' },
  { value: '25+', label: 'Countries Reached' },
  { value: '100%', label: 'Cruelty-Free Certified' },
];

const values = [
  {
    icon: 'heart-outline' as const,
    title: 'Cruelty-Free Beauty',
    desc: 'All our products are 100% cruelty-free and never tested on animals.',
  },
  {
    icon: 'leaf-outline' as const,
    title: 'Clean & Sustainable',
    desc: 'We use natural extracts, recyclable packaging, and eco-friendly practices.',
  },
  {
    icon: 'people-outline' as const,
    title: 'Empowering Confidence',
    desc: 'Designed to embrace individuality and help everyone feel beautiful.',
  },
];

export default function AboutScreen() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}
          activeOpacity={0.6}
          accessibilityLabel='Go back'
        >
          <Ionicons name='chevron-back' size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>About Us</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Our Story */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
            <Ionicons name='sparkles-outline' size={12} color={colors.accent} />
            <Text style={[styles.badgeText, { color: colors.accent }]}>OUR STORY</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Our Story</Text>

          {storyParagraphs.map((paragraph) => (
            <Text key={paragraph} style={[styles.paragraph, { color: colors.textSecondary }]}>
              {paragraph}
            </Text>
          ))}

          <View style={[styles.imageFrame, { borderColor: colors.borderSubtle }]}>
            <Image
              source={{ uri: STORY_IMAGE }}
              style={styles.storyImage}
              contentFit='cover'
              transition={250}
              accessibilityLabel='Cosmetics and skincare products'
            />
          </View>
        </View>

        {/* Our Impact */}
        <View style={[styles.impactCard, { backgroundColor: colors.accentLight }]}>
          <Text style={[styles.impactTitle, { color: colors.textPrimary }]}>Our Impact</Text>
          <Text style={[styles.impactSubtitle, { color: colors.textSecondary }]}>
            Celebrating milestones that show our dedication to beauty, wellness, and sustainability.
          </Text>

          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View
                key={stat.label}
                style={[
                  styles.statCard,
                  { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.accent }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Our Mission */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.pill, { backgroundColor: colors.accent }]}>
            <Text style={styles.pillText}>Our Mission</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Redefining Beauty, Naturally
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We believe in clean beauty that empowers confidence while caring for people and the
            planet.
          </Text>

          <View style={[styles.imageFrame, { borderColor: colors.borderSubtle }]}>
            <Image
              source={{ uri: MISSION_IMAGE }}
              style={styles.missionImage}
              contentFit='cover'
              transition={250}
              accessibilityLabel='Cosmetic products on display'
            />
          </View>

          <View style={styles.valuesList}>
            {values.map((value) => (
              <View
                key={value.title}
                style={[
                  styles.valueRow,
                  { borderColor: colors.borderSubtle, backgroundColor: colors.backgroundMuted },
                ]}
              >
                <View style={[styles.valueIcon, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name={value.icon} size={20} color={colors.accent} />
                </View>
                <View style={styles.valueText}>
                  <Text style={[styles.valueTitle, { color: colors.textPrimary }]}>
                    {value.title}
                  </Text>
                  <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>
                    {value.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaBlock}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/shop')}
          >
            <Ionicons name='bag-outline' size={17} color='#FFFFFF' />
            <Text style={styles.primaryBtnText}>Shop Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.borderStrong }]}
            activeOpacity={0.85}
            onPress={() => router.push('/contact')}
          >
            <Ionicons name='chatbubble-ellipses-outline' size={17} color={colors.accent} />
            <Text style={[styles.secondaryBtnText, { color: colors.accent }]}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  sectionCard: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 37, 32, 0.06)',
    padding: spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  paragraph: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  imageFrame: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  storyImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(45, 37, 32, 0.04)',
  },
  missionImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: 'rgba(45, 37, 32, 0.04)',
  },
  impactCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  impactTitle: {
    ...typography.h2,
    textAlign: 'center',
  },
  impactSubtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xxs,
  },
  statValue: {
    ...typography.h1,
    fontSize: 30,
    lineHeight: 36,
  },
  statLabel: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 17,
  },
  pill: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
  },
  pillText: {
    ...typography.label,
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 1,
  },
  valuesList: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  valueIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    flex: 1,
    gap: 2,
  },
  valueTitle: {
    ...typography.bodyStrong,
  },
  valueDesc: {
    ...typography.caption,
    fontSize: 13,
    lineHeight: 19,
  },
  ctaBlock: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg + 2,
    borderRadius: radius.pill,
  },
  primaryBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 15,
    textTransform: 'none',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    ...typography.button,
    fontSize: 15,
    textTransform: 'none',
  },
});
