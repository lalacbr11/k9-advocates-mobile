import { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Keyboard, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import ScreenNavigation from './src/components/ScreenNavigation';
import type { Tab } from './src/components/ScreenNavigation';
import { dogs } from './src/data/dogs';
import { clientRecords } from './src/data/clientRecords';
import { backFromProfile, openProfile, shouldScrollCalendarToTop } from './src/logic/navigation';
import type { ProfileRoute } from './src/logic/navigation';
import DashboardScreen from './src/screens/DashboardScreen';
import DogsScreen from './src/screens/DogsScreen';
import DogProfileScreen from './src/screens/DogProfileScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import ClientProfileScreen from './src/screens/ClientProfileScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import type { CalendarScreenHandle } from './src/screens/CalendarScreen';
import DailyScheduleScreen from './src/screens/DailyScheduleScreen';
import { theme } from './src/theme';

export default function App() {
  const calendarRef = useRef<CalendarScreenHandle>(null);
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dogQuery, setDogQuery] = useState('');
  const [clientQuery, setClientQuery] = useState('');
  const [history, setHistory] = useState<readonly ProfileRoute[]>([]);
  const selectTab = (next: Tab) => {
    Keyboard.dismiss();
    if (shouldScrollCalendarToTop(tab, next, selectedDate !== null, history.length > 0)) {
      calendarRef.current?.scrollToTop();
      return;
    }
    setHistory([]);
    setSelectedDate(null);
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
    : tab === 'Calendar' ? 'Daily schedule' : tab === 'Dogs' ? 'Dogs directory' : 'Clients directory';
  const selectedDog = route?.kind === 'dog' ? dogs.find((dog) => dog.id === route.id) : undefined;
  const selectedClient = route?.kind === 'client' ? clientRecords.find((client) => client.id === route.id) : undefined;
  const navigation = null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <View style={styles.root}>
      <StatusBar style="light" />
      {/* Keep the dashboard mounted to preserve its filters and scroll position. */}
      <View style={[styles.screen, (tab !== 'Dashboard' || !!route) && styles.hidden]}>
        <DashboardScreen navigation={navigation} />
      </View>
      <View style={[styles.screen, (tab !== 'Calendar' || !!selectedDate || !!route) && styles.hidden]}>
        <CalendarScreen ref={calendarRef} onSelectDate={setSelectedDate} />
      </View>
      {selectedDog ? (
        <DogProfileScreen key={`dog-${selectedDog.id}`} dog={selectedDog} navigation={navigation}
          onBack={onBack} backLabel={backLabel}
          onSelectOwner={(client) => showProfile({ kind: 'client', id: client.id })} />
      ) : selectedClient ? (
        <ClientProfileScreen key={`client-${selectedClient.id}`} client={selectedClient} navigation={navigation}
          onBack={onBack} backLabel={backLabel}
          onSelectDog={(dog) => showProfile({ kind: 'dog', id: dog.id })} />
      ) : tab === 'Calendar' && selectedDate ? (
        <DailyScheduleScreen date={selectedDate} onBack={() => setSelectedDate(null)}
          onSelectDog={(dog) => showProfile({ kind: 'dog', id: dog.id })} />
      ) : tab === 'Dogs' ? (
        <DogsScreen navigation={navigation} query={dogQuery} onQueryChange={setDogQuery}
          onSelectDog={(dog) => showProfile({ kind: 'dog', id: dog.id })} />
      ) : tab === 'Clients' ? (
        <ClientsScreen navigation={navigation} query={clientQuery} onQueryChange={setClientQuery}
          onSelectClient={(client) => showProfile({ kind: 'client', id: client.id })} />
      ) : null}
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.footer}>
        <ScreenNavigation active={tab} onSelect={selectTab} />
      </SafeAreaView>
    </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.charcoal },
  screen: { flex: 1 },
  footer: { backgroundColor: theme.colors.softCharcoal },
  hidden: { display: 'none' },
});
