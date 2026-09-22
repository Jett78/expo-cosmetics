import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { spacing, radius, typography } from '../../design-system';
import AppButton from '../common/AppButton';
import { useRouter } from 'expo-router';

type LoginModalProps = {
  visible: boolean;
  onClose: () => void;
};

const LoginModal = ({ visible, onClose }: LoginModalProps) => {
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
            Login Required
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
            Please login to add items to your bag or wishlist.
          </Text>
          <AppButton
            title="Login"
            onPress={() => {
              onClose();
              router.push('/(auth)/login');
            }}
            containerStyle={styles.button}
          />
          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={[typography.button, { color: colors.textSecondary }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  container: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
  },
  button: {
    marginBottom: spacing.md,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});

export default LoginModal;
