import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCommerce } from '../../src/context/CommerceContext';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { spacing, radius, typography, shadows } from '../../src/design-system';

type MenuItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  href?: string;
};

const menuItems: MenuItem[] = [
  { icon: 'receipt-outline', label: 'My Orders' },
  { icon: 'heart-outline', label: 'Wishlist', href: '/(tabs)/wishlist' },
  { icon: 'location-outline', label: 'Addresses' },
  { icon: 'settings-outline', label: 'Settings' },
  { icon: 'help-circle-outline', label: 'Help' },
];

export default function AccountScreen() {
  const { colors } = useAppTheme();
  const { user, logout, isAuthenticated } = useCommerce();

  const userName = user?.name ?? 'Guest';
  const userEmail = user?.email ?? 'guest@example.com';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Text h3 style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Account
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: colors.accentLight }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{userName}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{userEmail}</Text>
          </View>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.surface }]}>
          {menuItems.map((item, index) => {
            const isLast = index === menuItems.length - 1;
            const content = (
              <>
                <View style={styles.menuLeft}>
                  <Ionicons name={item.icon} size={22} color={colors.textPrimary} />
                  <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </>
            );

            return (
              <View key={item.label}>
                {item.href ? (
                  <Link href={item.href} asChild>
                    <TouchableOpacity
                      style={StyleSheet.flatten([
                        styles.menuRow,
                        !isLast && { borderBottomColor: colors.borderSubtle, borderBottomWidth: StyleSheet.hairlineWidth },
                      ])}
                      activeOpacity={0.6}
                    >
                      {content}
                    </TouchableOpacity>
                  </Link>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.menuRow,
                      !isLast && { borderBottomColor: colors.borderSubtle, borderBottomWidth: StyleSheet.hairlineWidth },
                    ]}
                    activeOpacity={0.6}
                  >
                    {content}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: colors.borderStrong }]}
          activeOpacity={0.7}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  avatarText: {
    ...typography.h2,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h3,
    marginBottom: spacing.xxs,
  },
  profileEmail: {
    ...typography.caption,
  },
  menuSection: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuLabel: {
    ...typography.bodyStrong,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  signOutText: {
    ...typography.button,
  },
});
