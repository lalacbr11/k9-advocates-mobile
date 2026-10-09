import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import ClientCard from '../components/ClientCard';
import Screen from '../components/Screen';
import { clientRecords } from '../data/clientRecords';
import type { ClientRecord } from '../data/clientRecords';
import { dogRecords } from '../data/dogRecords';
import { getClientDogs, searchClients } from '../logic/clients';
import { theme } from '../theme';

const { colors, typography, spacing, borderRadius } = theme;

export default function ClientsScreen({ navigation, query, onQueryChange, onSelectClient }: {
  navigation: ReactNode;
  query: string;
  onQueryChange: (query: string) => void;
  onSelectClient: (client: ClientRecord) => void;
}) {
  const results = searchClients(clientRecords, query);
  return (
    <Screen>
      {navigation}
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>Clients directory</Text>
        <Text style={styles.secondary}>The people behind the dogs in your care.</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.label}>Search by client name</Text>
        <TextInput value={query} onChangeText={onQueryChange} placeholder="Search clients"
          accessibilityLabel="Search by client name" placeholderTextColor={colors.mutedGray}
          autoCapitalize="none" autoCorrect={false} returnKeyType="search" clearButtonMode="while-editing"
          style={styles.search} />
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.secondary}>
        {results.length} {results.length === 1 ? 'client' : 'clients'}{query.trim() ? ' found' : ' in the directory'}
      </Text>
      <View style={styles.list}>
        {results.map((client) => (
          <ClientCard key={client.id} client={client}
            dogNames={getClientDogs(dogRecords, client.id).map((dog) => dog.name)}
            onPress={() => onSelectClient(client)} />
        ))}
        {results.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.label}>No clients found</Text>
            <Text style={styles.secondary}>Try another name or clear your search.</Text>
          </View>
        )}
      </View>
      <Text style={styles.secondary}>Prototype · All client details are fictional.</Text>
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
