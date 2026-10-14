import type { Booking } from '../data/bookings';
import type { DogRecord } from '../data/dogRecords';
import { bookingDayDetails, bookingsForDate } from './calendar';

export function dailySchedule<T extends Pick<DogRecord, 'id'>>(dogs: readonly T[], bookings: readonly Booking[], date: string) {
  return bookingsForDate(bookings, date).map(booking => {
    const dog = dogs.find(dog => dog.id === booking.dogId);
    if (!dog) throw new Error(`Unknown dog in sample booking: ${booking.dogId}`);
    return { booking, dog, details: bookingDayDetails(booking, date) };
  });
}

export function scheduledDogs<T extends Pick<DogRecord, 'id'>>(entries: ReturnType<typeof dailySchedule<T>>) {
  // Count a dog once per service, even if it has multiple bookings that day.
  const grouped = new Map<string, T & { service: Booking['service']; scheduleDetail: string }>();
  for (const { booking, dog, details } of entries) {
    const key = `${dog.id}-${booking.service}`;
    const previous = grouped.get(key);
    grouped.set(key, { ...dog, service: booking.service,
      scheduleDetail: [previous?.scheduleDetail, details.join(' · ')].filter(Boolean).join(' · ') });
  }
  return [...grouped.values()];
}

export function scheduleMovements<T extends Pick<DogRecord, 'id'>>(entries: ReturnType<typeof dailySchedule<T>>, date: string) {
  return entries.flatMap(({ booking, dog }) => [
    ...(booking.startDate === date ? [{ id: `${booking.id}-arrival`, dog, service: booking.service, type: 'Arrival' as const, time: booking.arrivalTime }] : []),
    ...(booking.endDate === date ? [{ id: `${booking.id}-departure`, dog, service: booking.service, type: 'Departure' as const, time: booking.departureTime }] : []),
  ]);
}

// Preserve every booking while showing each stable dog identity only once.
export function groupScheduleByDog<T extends Pick<DogRecord, 'id'>>(entries: ReturnType<typeof dailySchedule<T>>) {
  const groups = new Map<string, { dog: T; bookings: typeof entries }>();
  for (const entry of entries) {
    const group = groups.get(entry.dog.id);
    if (group) group.bookings.push(entry);
    else groups.set(entry.dog.id, { dog: entry.dog, bookings: [entry] });
  }
  return [...groups.values()];
}

export function filterDogScheduleGroups<T extends Pick<DogRecord, 'id'>>(groups: ReturnType<typeof groupScheduleByDog<T>>, service: Booking['service'] | 'All') {
  // A matching dog keeps all its bookings visible, including other services.
  return groups.filter(group => service === 'All' || group.bookings.some(entry => entry.booking.service === service));
}
