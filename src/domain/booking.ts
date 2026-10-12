import type { OvernightService, TrainingService } from './services';

export const bookingTimeZone = 'America/New_York' as const;
export const defaultBookingStatus = 'confirmed' as const;
export type BookingStatus = 'confirmed' | 'cancelled';

export type LocalDateTime = Readonly<{
  date: string; // YYYY-MM-DD in the business time zone.
  time: string; // HH:mm, minute precision; never an AM/PM display string.
}>;
export type BookingSchedule =
  | Readonly<{ kind: 'overnight'; checkIn: LocalDateTime; checkOut: LocalDateTime }>
  | Readonly<{ kind: 'daycare'; date: string; dropOffTime: string; pickupTime: string }>
  | Readonly<{ kind: 'training'; date: string; startTime: string; endTime: string }>;

type BookingBase = Readonly<{
  id: string;
  dogId: string;
  status: BookingStatus;
  timeZone: typeof bookingTimeZone;
  // Actual movements are independent observations, never replacements for scheduled times.
  actualArrival?: LocalDateTime;
  actualDeparture?: LocalDateTime;
}>;
export type Booking = BookingBase & (
  | Readonly<{ serviceCode: OvernightService; schedule: Extract<BookingSchedule, { kind: 'overnight' }> }>
  | Readonly<{ serviceCode: 'dog_daycare'; schedule: Extract<BookingSchedule, { kind: 'daycare' }> }>
  | Readonly<{ serviceCode: TrainingService; schedule: Extract<BookingSchedule, { kind: 'training' }> }>
);
// Distribute over service variants to retain their schedule relationships.
type Draft<T> = T extends Booking ? Omit<T, 'status'> & { readonly status?: BookingStatus } : never;
export type BookingDraft = Draft<Booking>;
