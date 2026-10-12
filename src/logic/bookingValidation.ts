import { defaultBookingStatus } from '../domain/booking';
import type { Booking, BookingDraft, BookingStatus } from '../domain/booking';
import { validateBooking } from './bookingChecks';
import type { ValidationIssue } from './bookingChecks';
import { existingBookingId, findBookingConflicts } from './bookingConflicts';
import type { BookingConflict, InvalidExistingBooking } from './bookingConflicts';

export { validateBooking } from './bookingChecks';
export type { ValidationCode, ValidationIssue } from './bookingChecks';
export type BookingEvaluation =
  | { readonly ok: false; readonly errors: readonly ValidationIssue[] }
  | { readonly ok: true; readonly booking: Booking; readonly warnings: readonly BookingConflict[]; readonly invalidRecords: readonly InvalidExistingBooking[] };
// Cancelling damaged legacy data is not an assertion that it is a canonical Booking.
export type StatusChangeResult = BookingEvaluation | {
  readonly ok: true;
  readonly booking: Readonly<Record<string, unknown> & { id: string; status: 'cancelled' }>;
  readonly warnings: readonly BookingConflict[];
  readonly invalidRecords: readonly InvalidExistingBooking[];
};

export function validateStatusTransition(current: unknown, next: unknown): readonly ValidationIssue[] {
  if ((current === 'confirmed' && next === 'cancelled') || (current === 'cancelled' && next === 'confirmed')) return [];
  return [{ field: 'status', code: 'invalid_status_transition' }];
}

function evaluateCanonical(draft: BookingDraft, knownDogIds: readonly string[], existing: readonly unknown[], excludeBookingId?: string): BookingEvaluation {
  const booking = { ...draft, status: draft.status === undefined ? defaultBookingStatus : draft.status } as Booking;
  const errors = [...validateBooking(booking, knownDogIds)];
  const matches = existing.filter(value => existingBookingId(value) === booking.id).length;
  if (matches > (excludeBookingId === booking.id ? 1 : 0)) errors.push({ field: 'id', code: 'duplicate_booking_id' });
  if (errors.length) return { ok: false, errors };
  const report = findBookingConflicts(booking, existing, { excludeBookingId, knownDogIds });
  return { ok: true, booking, warnings: report.warnings, invalidRecords: report.invalidRecords };
}

// Creation never excludes existing records with the same ID, including malformed records.
export function evaluateBooking(draft: BookingDraft, knownDogIds: readonly string[], existing: readonly unknown[] = []): BookingEvaluation {
  return evaluateCanonical(draft, knownDogIds, existing);
}

// The caller supplies the original stable ID; edits may not change it.
export function evaluateBookingEdit(draft: BookingDraft, originalBookingId: string, knownDogIds: readonly string[], existing: readonly unknown[]): BookingEvaluation {
  if (draft.id !== originalBookingId) return { ok: false, errors: [{ field: 'id', code: 'booking_id_changed' }] };
  return evaluateCanonical(draft, knownDogIds, existing, originalBookingId);
}

export function changeBookingStatus(value: unknown, next: BookingStatus, knownDogIds: readonly string[], existing: readonly unknown[] = []): StatusChangeResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return { ok: false, errors: [{ field: 'booking', code: 'required' }] };
  const booking = value as Record<string, unknown>;
  if (typeof booking.id !== 'string' || !booking.id.trim() || booking.id !== booking.id.trim()) return { ok: false, errors: [{ field: 'id', code: 'required_stable_id' }] };
  const errors = validateStatusTransition(booking.status, next);
  if (errors.length) return { ok: false, errors };
  if (next === 'cancelled') {
    // Preserve legacy observations unchanged; do not validate the dog or schedule.
    return { ok: true, booking: { ...booking, id: booking.id, status: 'cancelled' }, warnings: [], invalidRecords: [] };
  }
  // Restoration crosses the canonical boundary and always validates/checks conflicts.
  return evaluateCanonical({ ...booking, status: 'confirmed' } as BookingDraft, knownDogIds, existing, booking.id);
}
