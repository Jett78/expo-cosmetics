import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Animated,
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { radius, spacing, typography } from '../../design-system';
import { useAppTheme } from '../../hooks/useAppTheme';

export type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
  defaultOpenId?: string;
};

function AccordionRow({
  item,
  isOpen,
  isLast,
  onToggle,
}: {
  item: AccordionItem;
  isOpen: boolean;
  isLast: boolean;
  onToggle: () => void;
}) {
  const { colors } = useAppTheme();
  const rotation = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(rotation, {
      toValue: isOpen ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View
      style={[
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={onToggle}
        accessibilityRole='button'
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={item.question}
      >
        <Text style={[styles.question, { color: colors.textPrimary }]}>{item.question}</Text>
        <Animated.View style={[styles.chevron, { transform: [{ rotate }] }]}>
          <Ionicons name='chevron-down' size={18} color={colors.accent} />
        </Animated.View>
      </TouchableOpacity>

      {isOpen ? (
        <Text style={[styles.answer, { color: colors.textSecondary }]}>{item.answer}</Text>
      ) : null}
    </View>
  );
}

export function Accordion({ items, defaultOpenId }: AccordionProps) {
  const { colors } = useAppTheme();
  const [openId, setOpenId] = React.useState<string | null>(defaultOpenId ?? null);

  const handleToggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((current) => (current === id ? null : id));
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      {items.map((item, index) => (
        <AccordionRow
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          isLast={index === items.length - 1}
          onToggle={() => handleToggle(item.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 56,
  },
  question: {
    ...typography.bodyStrong,
    flex: 1,
    lineHeight: 21,
  },
  chevron: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answer: {
    ...typography.body,
    lineHeight: 23,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
});
