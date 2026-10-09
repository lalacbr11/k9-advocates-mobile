import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import DogCard from '../components/DogCard';
import Screen from '../components/Screen';
import { searchDogs } from '../data/dogs';
import type { Dog } from '../data/dogs';
import { theme } from '../theme';

const { colors, typography, spacing, borderRadius } = theme;

export default function DogsScreen({ navigation, query, onQueryChange, onSelectDog }: {
  navigation: ReactNode;
  query: string;
  onQueryChange: (query: string) => void;
  onSelectDog: (dog: Dog) => void;
}) {
  const results = searchDogs(query);
  return (
    <Screen>
      {navigation}
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>Dogs directory</Text>
        <Text style={styles.secondary}>The dogs in your care, all in one place.</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.label}>Search by dog name</Text>
        <TextInput value={query} onChangeText={onQueryChange} placeholder="Search dogs"
          accessibilityLabel="Search by dog name" placeholderTextColor={colors.mutedGray}
          autoCapitalize="none" autoCorrect={false} returnKeyType="search" clearButtonMode="while-editing"
          style={styles.search} />
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.secondary}>
        {results.length} {results.length === 1 ? 'dog' : 'dogs'}{query.trim() ? ' found' : ' in the directory'}
      </Text>
      <View style={styles.list}>
        {results.map((dog) => <DogCard key={dog.id} dog={dog} onPress={() => onSelectDog(dog)} />)}
        {results.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.label}>No dogs found</Text>
            <Text style={styles.secondary}>Try another name or clear your search.</Text>
          </View>
        )}
      </View>
      <Text style={styles.secondary}>Prototype · All dog and owner records are fictional.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  title: { ...typography.subheading, color: colors.warmCream },
  label: { ...typography.body, color: colors.warmCream },
  secondary: { ...typography.caption, color: colors.mutedGray },
  search: { ...typography.body, minHeight: 48, backgroundColor: colors.softCharcoal, color: colors.warmCream, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.darkGold },
  list: { gap: spacing.sm },
  empty: { padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.softCharcoal, borderRadius: borderRadius.md },
});
