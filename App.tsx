import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Keyboard, StyleSheet, View } from 'react-native';
import ScreenNavigation from './src/components/ScreenNavigation';
import type { Tab } from './src/components/ScreenNavigation';
import type { Dog } from './src/data/dogs';
import DashboardScreen from './src/screens/DashboardScreen';
import DogsScreen from './src/screens/DogsScreen';
import DogProfileScreen from './src/screens/DogProfileScreen';
import { theme } from './src/theme';

export default function App() {
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [query, setQuery] = useState('');
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const selectTab = (next: Tab) => {
    Keyboard.dismiss();
    setSelectedDog(null);
    setTab(next);
  };
  const navigation = <ScreenNavigation active={tab} onSelect={selectTab} />;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {/* Keep the dashboard mounted to preserve its filters and scroll position. */}
      <View style={[styles.screen, tab !== 'Dashboard' && styles.hidden]}>
        <DashboardScreen navigation={navigation} />
      </View>
      {tab === 'Dogs' && (selectedDog ? (
        <DogProfileScreen dog={selectedDog} navigation={navigation} onBack={() => setSelectedDog(null)} />
      ) : (
        <DogsScreen navigation={navigation} query={query} onQueryChange={setQuery}
          onSelectDog={(dog) => { Keyboard.dismiss(); setSelectedDog(dog); }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.charcoal },
  screen: { flex: 1 },
  hidden: { display: 'none' },
});
