import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '../src/components/Skeleton';
import { Accordion } from '../src/components/common/Accordion';
import { radius, spacing, typography } from '../src/design-system';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { useFaqs } from '../src/services/faq/hooks';

export default function FaqScreen() {
  const { colors } = useAppTheme();
  const { data: faqs, isLoading, isError, refetch, isRefetching } = useFaqs();

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>FAQ</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {[0, 1, 2, 3, 4].map((item) => (
            <View key={item} style={[styles.skeletonCard, { backgroundColor: colors.surface }]}>
              <Skeleton width='80%' height={16} borderRadius={4} />
              <Skeleton width='40%' height={12} borderRadius={4} style={{ marginTop: 10 }} />
            </View>
          ))}
        </ScrollView>
      ) : isError ? (
        <View style={styles.centerContent}>
          <View style={[styles.stateIcon, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
            <Ionicons name='cloud-offline-outline' size={36} color={colors.danger} />
          </View>
          <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>Couldn't load FAQs</Text>
          <Text style={[styles.stateSubtitle, { color: colors.textMuted }]}>
            Check your connection and try again.
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
            onPress={() => refetch()}
          >
            <Ionicons name='refresh' size={16} color='#FFFFFF' />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !faqs || faqs.length === 0 ? (
        <View style={styles.centerContent}>
          <View style={[styles.stateIcon, { backgroundColor: colors.surfaceMuted }]}>
            <Ionicons name='chatbubble-ellipses-outline' size={38} color={colors.textMuted} />
          </View>
          <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>No FAQs yet</Text>
          <Text style={[styles.stateSubtitle, { color: colors.textMuted }]}>
            We haven't published any answers yet. Reach out to us from the Contact page instead.
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
            onPress={() => router.push('/contact')}
          >
            <Ionicons name='call-outline' size={16} color='#FFFFFF' />
            <Text style={styles.retryBtnText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>How can we help?</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Answers to the most common questions about our products, shipping, and more.
            </Text>
          </View>

          <Accordion
            items={faqs.map((faq) => ({
              id: faq.id,
              question: faq.question,
              answer: faq.answer,
            }))}
          />

          <View style={[styles.helpCard, { backgroundColor: colors.accentLight }]}>
            <Ionicons name='help-buoy-outline' size={22} color={colors.accent} />
            <View style={styles.helpTextBlock}>
              <Text style={[styles.helpTitle, { color: colors.textPrimary }]}>
                Still have a question?
              </Text>
              <Text style={[styles.helpSubtitle, { color: colors.textSecondary }]}>
                Our team is happy to help you with anything you need.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.helpBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.85}
              onPress={() => router.push('/contact')}
            >
              <Text style={styles.helpBtnText}>Ask us</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  stateIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  stateTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stateSubtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing.sm,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  retryBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    textTransform: 'none',
  },
  skeletonCard: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 37, 32, 0.06)',
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  heroCard: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 37, 32, 0.06)',
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    lineHeight: 22,
  },
  helpCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  helpTextBlock: {
    gap: spacing.xxs,
  },
  helpTitle: {
    ...typography.bodyStrong,
  },
  helpSubtitle: {
    ...typography.caption,
    lineHeight: 18,
  },
  helpBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  helpBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 14,
    textTransform: 'none',
  },
});
