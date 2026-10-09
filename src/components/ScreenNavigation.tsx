import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export type Tab = 'Dashboard' | 'Dogs' | 'Clients' | 'Calendar';
const { colors, typography, spacing, borderRadius } = theme;

export default function ScreenNavigation({ active, onSelect }: {
  active: Tab;
  onSelect: (tab: Tab) => void;
}) {
  return (
    <View style={styles.bar}>
      {(['Dashboard', 'Dogs', 'Clients', 'Calendar'] as const).map((tab) => (
        <Pressable key={tab} accessibilityRole="tab" accessibilityState={{ selected: active === tab }}
          onPress={() => onSelect(tab)} style={({ pressed }) => [styles.tab, active === tab && styles.selected, pressed && styles.pressed]}>
          <Text style={[styles.label, active === tab && styles.selectedLabel]}>{tab}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', gap: spacing.xs, backgroundColor: colors.softCharcoal, borderRadius: borderRadius.md, padding: spacing.xs },
  tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, borderRadius: borderRadius.sm },
  selected: { backgroundColor: colors.warmCream },
  label: { ...typography.button, fontSize: 14, lineHeight: 20, color: colors.warmCream },
  selectedLabel: { color: colors.charcoal },
  pressed: { opacity: 0.75 },
});
