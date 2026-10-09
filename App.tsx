import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Keyboard, StyleSheet, View } from 'react-native';
import ScreenNavigation from './src/components/ScreenNavigation';
import type { Tab } from './src/components/ScreenNavigation';
import { dogs } from './src/data/dogs';
import { clientRecords } from './src/data/clientRecords';
import { backFromProfile, openProfile } from './src/logic/navigation';
import type { ProfileRoute } from './src/logic/navigation';
import DashboardScreen from './src/screens/DashboardScreen';
import DogsScreen from './src/screens/DogsScreen';
import DogProfileScreen from './src/screens/DogProfileScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import ClientProfileScreen from './src/screens/ClientProfileScreen';
import { theme } from './src/theme';

export default function App() {
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [dogQuery, setDogQuery] = useState('');
  const [clientQuery, setClientQuery] = useState('');
  const [history, setHistory] = useState<readonly ProfileRoute[]>([]);
  const selectTab = (next: Tab) => {
    Keyboard.dismiss();
    setHistory([]);
    setTab(next);
  };
  const showProfile = (route: ProfileRoute) => {
    Keyboard.dismiss();
    setHistory((previous) => openProfile(previous, route));
  };
  const onBack = () => setHistory(backFromProfile);
  const route = history[history.length - 1];
  const previous = history[history.length - 2];
  const backLabel = previous
    ? (previous.kind === 'dog' ? dogs.find((dog) => dog.id === previous.id)?.name : clientRecords.find((client) => client.id === previous.id)?.name) ?? 'Directory'
    : tab === 'Dogs' ? 'Dogs directory' : 'Clients directory';
  const selectedDog = route?.kind === 'dog' ? dogs.find((dog) => dog.id === route.id) : undefined;
  const selectedClient = route?.kind === 'client' ? clientRecords.find((client) => client.id === route.id) : undefined;
  const navigation = <ScreenNavigation active={tab} onSelect={selectTab} />;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {/* Keep the dashboard mounted to preserve its filters and scroll position. */}
      <View style={[styles.screen, (tab !== 'Dashboard' || !!route) && styles.hidden]}>
        <DashboardScreen navigation={navigation} />
      </View>
      {selectedDog ? (
        <DogProfileScreen key={`dog-${selectedDog.id}`} dog={selectedDog} navigation={navigation}
          onBack={onBack} backLabel={backLabel}
          onSelectOwner={(client) => showProfile({ kind: 'client', id: client.id })} />
      ) : selectedClient ? (
        <ClientProfileScreen key={`client-${selectedClient.id}`} client={selectedClient} navigation={navigation}
          onBack={onBack} backLabel={backLabel}
          onSelectDog={(dog) => showProfile({ kind: 'dog', id: dog.id })} />
      ) : tab === 'Dogs' ? (
        <DogsScreen navigation={navigation} query={dogQuery} onQueryChange={setDogQuery}
          onSelectDog={(dog) => showProfile({ kind: 'dog', id: dog.id })} />
      ) : tab === 'Clients' ? (
        <ClientsScreen navigation={navigation} query={clientQuery} onQueryChange={setClientQuery}
          onSelectClient={(client) => showProfile({ kind: 'client', id: client.id })} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.charcoal },
  screen: { flex: 1 },
  hidden: { display: 'none' },
});
