import type { Booking } from '../domain/booking';
import { services } from '../domain/services';
import { scheduledInterval } from './bookingTime';
import { validateBooking } from './bookingChecks';
import type { ValidationIssue } from './bookingChecks';

export type BookingConflict = Readonly<{
  code: 'same_dog_overlap' | 'training_overlap';
  bookingId: string;
}>;
export type InvalidExistingBooking = Readonly<{
  index: number;
  bookingId?: string;
  errors: readonly ValidationIssue[];
}>;
export type ConflictReport = Readonly<{
  warnings: readonly BookingConflict[];
  invalidRecords: readonly InvalidExistingBooking[];
  candidateErrors: readonly ValidationIssue[];
}>;
export function existingBookingId(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null || !('id' in value)) return;
  return typeof value.id === 'string' ? value.id : undefined;
}

// Half-open [start, end). Only explicit edit/restore context excludes an ID.
// Actual early departure never shortens the scheduled interval.
export function findBookingConflicts(candidate: Booking, existing: readonly unknown[], options: {
  readonly excludeBookingId?: string;
  readonly knownDogIds?: readonly string[];
} = {}): ConflictReport {
  const warnings: BookingConflict[] = [];
  const invalidRecords: InvalidExistingBooking[] = [];
  const candidateErrors = validateBooking(candidate, options.knownDogIds);
  const resolved = !candidateErrors.length && candidate.status === 'confirmed' ? scheduledInterval(candidate.schedule) : undefined;
  const interval = resolved?.ok ? resolved.interval : undefined;
  existing.forEach((value, index) => {
    const errors = validateBooking(value, options.knownDogIds);
    if (errors.length) {
      invalidRecords.push({ index, bookingId: existingBookingId(value), errors });
      return;
    }
    const booking = value as Booking;
    if (!interval || booking.status === 'cancelled' || booking.id === options.excludeBookingId) return;
    const [start, end] = interval;
    const other = scheduledInterval(booking.schedule);
    if (!other.ok) {
      invalidRecords.push({ index, bookingId: booking.id, errors: [{ field: 'schedule', code: other.code }] });
      return;
    }
    const [otherStart, otherEnd] = other.interval;
    if (!(start < otherEnd && otherStart < end)) return;
    if (booking.dogId === candidate.dogId) warnings.push({ code: 'same_dog_overlap', bookingId: booking.id });
    if (services[booking.serviceCode].scheduleKind === 'training' && services[candidate.serviceCode].scheduleKind === 'training') {
      warnings.push({ code: 'training_overlap', bookingId: booking.id });
    }
  });
  return { warnings, invalidRecords, candidateErrors };
}
