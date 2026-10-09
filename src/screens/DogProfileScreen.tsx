import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DogAvatar from '../components/DogAvatar';
import Screen from '../components/Screen';
import type { ClientRecord } from '../data/clientRecords';
import type { Dog } from '../data/dogs';
import { theme } from '../theme';

const { colors, typography, spacing, borderRadius } = theme;

export default function DogProfileScreen({ dog, navigation, onBack, backLabel, onSelectOwner }: {
  dog: Dog; navigation: ReactNode; onBack: () => void;
  backLabel: string; onSelectOwner: (client: ClientRecord) => void;
}) {
  const details = [
    ['Breed', dog.breed], ['Age', dog.age],
    ['Weight', dog.weight], ['Sex', dog.sex], ['Service', dog.service],
  ];
  return (
    <Screen>
      {navigation}
      <Pressable accessibilityRole="button" accessibilityLabel={`Back to ${backLabel}`} onPress={onBack}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        <Text style={styles.backLabel}>‹ {backLabel}</Text>
      </Pressable>
      <View style={styles.identity}>
        <DogAvatar name={dog.name} photo={dog.photo} size={112} />
        <View style={styles.identityText}>
          <Text accessibilityRole="header" style={styles.title}>{dog.name}</Text>
          <Text style={styles.secondary}>{dog.breed}</Text>
        </View>
      </View>
      <View style={styles.panel}>
        <Pressable accessibilityRole="button" accessibilityLabel={`View owner ${dog.client.name}'s profile`}
          onPress={() => onSelectOwner(dog.client)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <Text style={styles.secondary}>Owner</Text>
          <Text style={styles.ownerLink}>{dog.client.name} ›</Text>
        </Pressable>
        {details.map(([label, value]) => (
          <View key={label} style={[styles.row, styles.divider]}>
            <Text style={styles.secondary}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Care notes</Text>
      <View style={styles.notes}><Text style={styles.value}>{dog.notes}</Text></View>
      <Text style={styles.secondary}>Prototype · Fictional dog and owner details.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  identityText: { flexGrow: 1, flexBasis: 160, gap: spacing.xs },
  back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', paddingRight: spacing.md },
  backLabel: { ...typography.button, color: colors.mutedGold },
  title: { ...typography.heading, color: colors.warmCream },
  sectionTitle: { ...typography.subheading, color: colors.warmCream },
  secondary: { ...typography.caption, color: colors.mutedGray },
  ownerLink: { ...typography.button, color: colors.mutedGold },
  value: { ...typography.body, color: colors.warmCream, flexShrink: 1 },
  panel: { backgroundColor: colors.softCharcoal, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md },
  row: { paddingVertical: spacing.sm, minHeight: 48, gap: spacing.xs },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.darkGold },
  notes: { padding: spacing.md, backgroundColor: colors.softCharcoal, borderRadius: borderRadius.md },
  pressed: { opacity: 0.75 },
});
