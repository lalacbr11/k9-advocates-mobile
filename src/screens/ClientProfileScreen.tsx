import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DogCard from '../components/DogCard';
import Screen from '../components/Screen';
import type { ClientRecord } from '../data/clientRecords';
import { dogs } from '../data/dogs';
import type { Dog } from '../data/dogs';
import { getClientDogs } from '../logic/clients';
import { theme } from '../theme';

const { colors, typography, spacing, borderRadius } = theme;

export default function ClientProfileScreen({ client, navigation, onBack, backLabel, onSelectDog }: {
  client: ClientRecord;
  navigation: ReactNode;
  onBack: () => void;
  backLabel: string;
  onSelectDog: (dog: Dog) => void;
}) {
  const linkedDogs = getClientDogs(dogs, client.id);
  return (
    <Screen>
      {navigation}
      <Pressable accessibilityRole="button" accessibilityLabel={`Back to ${backLabel}`} onPress={onBack}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        <Text style={styles.backLabel}>‹ {backLabel}</Text>
      </Pressable>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>{client.name}</Text>
        <Text style={styles.secondary}>Client profile</Text>
      </View>
      <View style={styles.panel}>
        <View style={styles.row}>
          <Text style={styles.secondary}>Phone</Text>
          <Text selectable style={styles.value}>{client.phone}</Text>
        </View>
        <View style={[styles.row, styles.divider]}>
          <Text style={styles.secondary}>Email</Text>
          <Text selectable style={styles.value}>{client.email}</Text>
        </View>
      </View>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Linked dogs · {linkedDogs.length}</Text>
      <View style={styles.list}>
        {linkedDogs.map((dog) => <DogCard key={dog.id} dog={dog} onPress={() => onSelectDog(dog)} />)}
        {linkedDogs.length === 0 && <Text style={styles.secondary}>No dogs linked to this client.</Text>}
      </View>
      <Text style={styles.secondary}>Prototype · Fictional contact details and dog records.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', paddingRight: spacing.md },
  backLabel: { ...typography.button, color: colors.mutedGold },
  title: { ...typography.heading, color: colors.warmCream },
  sectionTitle: { ...typography.subheading, color: colors.warmCream },
  secondary: { ...typography.caption, color: colors.mutedGray },
  value: { ...typography.body, color: colors.warmCream },
  panel: { backgroundColor: colors.softCharcoal, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md },
  row: { paddingVertical: spacing.md, gap: spacing.xs },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.darkGold },
  list: { gap: spacing.sm },
  pressed: { opacity: 0.75 },
});
