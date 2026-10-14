import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AppState } from 'react-native';
import type { Booking } from '../domain/booking';
import { bookings as fixtures } from '../data/bookings';
import { dogRecords } from '../data/dogRecords';
import { services } from '../domain/services';
import { demoBookingFromFixture, newYorkToday, prepareDemoSave, sessionScheduleBookings } from '../logic/bookingForm';
import type { BookingForm } from '../logic/bookingForm';

const dogIds = dogRecords.map(dog => dog.id);
type SessionEntry = Readonly<{ booking: Booking; notes: string }>;
type Session = {
  today: string;
  bookings: readonly Booking[];
  scheduleBookings: ReturnType<typeof sessionScheduleBookings>;
  serviceLabel: (id: string) => string;
  reserveId: () => string;
  save: (form: BookingForm, id: string, acknowledgement?: string) => ReturnType<typeof prepareDemoSave>;
};
const BookingSession = createContext<Session | null>(null);

export function BookingSessionProvider({ children }: { children: ReactNode }) {
  const [today, setToday] = useState(() => newYorkToday());
  useEffect(() => {
    const refresh = () => setToday(newYorkToday());
    const timer = setInterval(refresh, 30_000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  const [entries, setEntries] = useState<readonly SessionEntry[]>(() => fixtures.map(fixture => ({
    booking: demoBookingFromFixture(fixture, dogIds), notes: '',
  })));
  const current = useRef(entries);
  const sequence = useRef(0);
  const bookings = entries.map(entry => entry.booking);
  const session: Session = {
    today,
    bookings,
    scheduleBookings: sessionScheduleBookings(bookings),
    serviceLabel: id => {
      const booking = bookings.find(item => item.id === id);
      return booking ? services[booking.serviceCode].label : 'Booking';
    },
    reserveId: () => {
      let id: string;
      do { id = `demo-session-${++sequence.current}`; } while (current.current.some(entry => entry.booking.id === id));
      return id;
    },
    save: (form, id, acknowledgement) => {
      // Recheck the current collection at save time, even if the form's preview is older.
      const result = prepareDemoSave(form, id, dogIds, current.current.map(entry => entry.booking), acknowledgement);
      if (result.kind === 'saved') {
        current.current = [...current.current, { booking: result.booking, notes: result.notes }];
        setEntries(current.current);
      }
      return result;
    },
  };
  return <BookingSession.Provider value={session}>{children}</BookingSession.Provider>;
}

export function useBookingSession(): Session {
  const session = useContext(BookingSession);
  if (!session) throw new Error('Booking session provider is required');
  return session;
}
