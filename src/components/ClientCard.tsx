import { Pressable, StyleSheet, Text } from 'react-native';
import type { ClientRecord } from '../data/clientRecords';
import { theme } from '../theme';

const { colors, typography, spacing, borderRadius } = theme;

export default function ClientCard({ client, dogNames, onPress }: {
  client: ClientRecord;
  dogNames: readonly string[];
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`View ${client.name}'s client profile`}
      onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Text style={styles.name}>{client.name} ›</Text>
      <Text style={styles.secondary}>{client.phone}</Text>
      <Text style={styles.secondary}>{dogNames.length ? `Dogs: ${dogNames.join(', ')}` : 'No linked dogs'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.softCharcoal, padding: spacing.md, borderRadius: borderRadius.md, gap: spacing.xs, minHeight: 44 },
  name: { ...typography.button, color: colors.warmCream },
  secondary: { ...typography.caption, color: colors.mutedGray },
  pressed: { opacity: 0.75 },
});
