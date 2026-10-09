import { Pressable, StyleSheet, Text, View } from 'react-native';
import DogAvatar from './DogAvatar';
import type { Dog } from '../data/dogs';
import { theme } from '../theme';

const { colors, typography, spacing, borderRadius } = theme;

export default function DogCard({ dog, onPress }: { dog: Dog; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`View ${dog.name}'s profile, owner ${dog.client.name}`}
      onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <DogAvatar name={dog.name} photo={dog.photo} />
      <View style={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.name}>{dog.name}</Text>
          <Text style={styles.service}>{dog.service} ›</Text>
        </View>
        <Text style={styles.owner}>Owner: {dog.client.name}</Text>
        <Text style={styles.detail}>{dog.breed} · {dog.age}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.softCharcoal, borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.sm, minHeight: 44, flexDirection: 'row', alignItems: 'center' },
  content: { flex: 1, gap: spacing.xs },
  heading: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  name: { ...typography.body, fontWeight: '500', color: colors.warmCream },
  service: { ...typography.caption, color: colors.mutedGold },
  owner: { ...typography.body, color: colors.warmCream },
  detail: { ...typography.caption, color: colors.mutedGray },
  pressed: { opacity: 0.75 },
});
