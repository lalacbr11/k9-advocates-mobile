
import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

import ScreenNavigation from './src/components/ScreenNavigation';
import type { Tab } from './src/components/ScreenNavigation';

import { dogs } from './src/data/dogs';
import { clientRecords } from './src/data/clientRecords';

import {
  backFromProfile,
  openProfile,
  shouldScrollCalendarToTop,
} from './src/logic/navigation';
import type { ProfileRoute } from './src/logic/navigation';

import DashboardScreen from './src/screens/DashboardScreen';
import DogsScreen from './src/screens/DogsScreen';
import DogProfileScreen from './src/screens/DogProfileScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import ClientProfileScreen from './src/screens/ClientProfileScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import type { CalendarScreenHandle } from './src/screens/CalendarScreen';
import DailyScheduleScreen from './src/screens/DailyScheduleScreen';
import NewBookingScreen from './src/screens/NewBookingScreen';
import BookingDetailsScreen from './src/screens/BookingDetailsScreen';

import { theme } from './src/theme';
import {
  BookingSessionProvider,
  useBookingSession,
} from './src/context/BookingSession';

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <BookingSessionProvider>
        <AppContent />
      </BookingSessionProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { bookings } = useBookingSession();

  const [bookingEntry, setBookingEntry] = useState<{ date?: string } | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (!savedNotice) return;

    const timer = setTimeout(() => setSavedNotice(false), 4500);

    return () => clearTimeout(timer);
  }, [savedNotice]);

  const calendarRef = useRef<CalendarScreenHandle>(null);

  const [tab, setTab] = useState<Tab>('Dashboard');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [dogQuery, setDogQuery] = useState('');
  const [clientQuery, setClientQuery] = useState('');

  const [history, setHistory] = useState<readonly ProfileRoute[]>([]);

  const addBooking = () => {
    Keyboard.dismiss();

    setBookingEntry({
      date: tab === 'Calendar'
        ? selectedDate ?? undefined
        : undefined,
    });
  };

  const selectTab = (next: Tab) => {
    Keyboard.dismiss();

    if (
      shouldScrollCalendarToTop(
        tab,
        next,
        selectedDate !== null,
        history.length > 0
      )
    ) {
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

  const onBack = () => {
    setHistory(backFromProfile);
  };

  const route = history[history.length - 1];
  const previous = history[history.length - 2];

  const backLabel = previous
    ? previous.kind === 'dog'
      ? dogs.find((dog) => dog.id === previous.id)?.name ?? 'Dog Profile'
      : previous.kind === 'client'
        ? clientRecords.find((client) => client.id === previous.id)?.name ?? 'Client Profile'
        : 'Booking Details'
    : tab === 'Calendar'
      ? 'Daily schedule'
      : tab === 'Dogs'
        ? 'Dogs directory'
        : tab === 'Dashboard'
          ? 'Dashboard'
          : 'Clients directory';

  const selectedDog =
    route?.kind === 'dog'
      ? dogs.find((dog) => dog.id === route.id)
      : undefined;

  const selectedClient =
    route?.kind === 'client'
      ? clientRecords.find((client) => client.id === route.id)
      : undefined;

  const selectedBooking =
    route?.kind === 'booking'
      ? bookings.find((booking) => booking.id === route.id)
      : undefined;

  const navigation = null;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={[styles.screen, !!bookingEntry && styles.hidden]}>

        {/* Keep Dashboard mounted to preserve filters and scroll position. */}
        <View
          style={[
            styles.screen,
            (tab !== 'Dashboard' || !!route) && styles.hidden,
          ]}
        >
          <DashboardScreen
            navigation={navigation}
            onAddBooking={addBooking}
            onSelectDog={(dog) => showProfile({ kind: 'dog', id: dog.id })}
            onSelectBooking={(bookingId) => showProfile({ kind: 'booking', id: bookingId })}
          />

        </View>

        {/* Keep Calendar mounted to preserve its position. */}
        <View
          style={[
            styles.screen,
            (tab !== 'Calendar' || !!selectedDate || !!route) && styles.hidden,
          ]}
        >
          <CalendarScreen
            ref={calendarRef}
            onSelectDate={setSelectedDate}
            onAddBooking={addBooking}
          />
        </View>

        {selectedDog ? (
          <DogProfileScreen
            key={`dog-${selectedDog.id}`}
            dog={selectedDog}
            navigation={navigation}
            onBack={onBack}
            backLabel={backLabel}
            onSelectOwner={(client) =>
              showProfile({ kind: 'client', id: client.id })
            }
          />
        ) : selectedClient ? (
          <ClientProfileScreen
            key={`client-${selectedClient.id}`}
            client={selectedClient}
            navigation={navigation}
            onBack={onBack}
            backLabel={backLabel}
            onSelectDog={(dog) =>
              showProfile({ kind: 'dog', id: dog.id })
            }
          />
        ) : selectedBooking ? (
          <BookingDetailsScreen
            booking={selectedBooking}
            onBack={onBack}
          />
        ) : route?.kind === 'booking' ? (
          <View style={styles.missingBooking}>
            <Text style={styles.missingBookingText}>
              Booking not found
            </Text>
            <Text
              accessibilityRole="button"
              onPress={onBack}
              style={styles.missingBookingBack}
            >
              Back
            </Text>
          </View>
        ) : tab === 'Calendar' && selectedDate ? (
          <DailyScheduleScreen
            date={selectedDate}
            onBack={() => setSelectedDate(null)}
            onAddBooking={addBooking}
            onSelectBooking={(bookingId) => showProfile({ kind: 'booking', id: bookingId })}
            onSelectDog={(dog) =>
              showProfile({ kind: 'dog', id: dog.id })
            }
          />
        ) : tab === 'Dogs' ? (
          <DogsScreen
            navigation={navigation}
            query={dogQuery}
            onQueryChange={setDogQuery}
            onSelectDog={(dog) =>
              showProfile({ kind: 'dog', id: dog.id })
            }
          />
        ) : tab === 'Clients' ? (
          <ClientsScreen
            navigation={navigation}
            query={clientQuery}
            onQueryChange={setClientQuery}
            onSelectClient={(client) =>
              showProfile({ kind: 'client', id: client.id })
            }
          />
        ) : null}

        {savedNotice && (
          <View
            style={styles.notice}
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.noticeText}>
              Booking saved for this demo session only
            </Text>
          </View>
        )}

        <SafeAreaView
          edges={['bottom', 'left', 'right']}
          style={styles.footer}
        >
          <ScreenNavigation
            active={tab}
            onSelect={selectTab}
          />
        </SafeAreaView>
      </View>

      {bookingEntry && (
        <NewBookingScreen
          calendarDate={bookingEntry.date}
          onClose={() => setBookingEntry(null)}
          onSaved={() => {
            setBookingEntry(null);
            setSavedNotice(true);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.charcoal,
  },
  screen: {
    flex: 1,
  },
  footer: {
    backgroundColor: theme.colors.softCharcoal,
  },
  hidden: {
    display: 'none',
  },
  notice: {
    padding: 12,
    backgroundColor: '#DCE8D5',
  },
  noticeText: {
    ...theme.typography.caption,
    textAlign: 'center',
    color: theme.colors.charcoal,
  },
  missingBooking: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missingBookingText: {
    ...theme.typography.subheading,
    color: theme.colors.warmCream,
  },
  missingBookingBack: {
    ...theme.typography.button,
    color: theme.colors.mutedGold,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
  },
});
