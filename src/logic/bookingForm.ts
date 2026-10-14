import type { Booking, BookingDraft } from '../domain/booking';
import { bookingTimeZone } from '../domain/booking';
import { services } from '../domain/services';
import type { ServiceCode } from '../domain/services';
import type { Booking as LegacyBooking } from '../data/bookings';
import { evaluateBooking, validateBooking } from './bookingValidation';
import type { BookingEvaluation, ValidationIssue } from './bookingValidation';
import { scheduleBoundaries } from './bookingTime';

export type BookingForm = Readonly<{
  dogId: string; serviceCode: ServiceCode | ''; startDate: string; endDate: string;
  startTime: string; endTime: string; notes: string;
}>;

export function newYorkToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: bookingTimeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    calendar: 'gregory', numberingSystem: 'latn',
  }).formatToParts(now);
  const get = (type: string) => parts.find(part => part.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function initialBookingForm(calendarDate?: string, now?: Date): BookingForm {
  const date = calendarDate ?? newYorkToday(now);
  return { dogId: '', serviceCode: '', startDate: date, endDate: date, startTime: '', endTime: '', notes: '' };
}

export function formIsDirty(form: BookingForm, initial: BookingForm): boolean {
  return (Object.keys(initial) as (keyof BookingForm)[]).some(key => form[key] !== initial[key]);
}

function formDraft(form: BookingForm, id: string): BookingDraft {
  const base = { id, dogId: form.dogId, timeZone: bookingTimeZone };
  if (form.serviceCode === 'dog_boarding' || form.serviceCode === 'board_and_train') {
    return { ...base, serviceCode: form.serviceCode, schedule: { kind: 'overnight',
      checkIn: { date: form.startDate, time: form.startTime }, checkOut: { date: form.endDate, time: form.endTime } } };
  }
  if (form.serviceCode === 'dog_daycare') {
    return { ...base, serviceCode: form.serviceCode, schedule: { kind: 'daycare', date: form.startDate,
      dropOffTime: form.startTime, pickupTime: form.endTime } };
  }
  // Empty selection is checked before this function is evaluated by the form boundary.
  return { ...base, serviceCode: form.serviceCode as 'private_training' | 'puppy_training' | 'behaviour_training',
    schedule: { kind: 'training', date: form.startDate, startTime: form.startTime, endTime: form.endTime } };
}

export function evaluateBookingForm(form: BookingForm, id: string, dogIds: readonly string[], existing: readonly unknown[]): BookingEvaluation {
  if (!form.serviceCode) return { ok: false, errors: [
    ...(!form.dogId ? [{ field: 'dogId', code: 'required' as const }] : []),
    { field: 'serviceCode', code: 'required' },
  ] };
  return evaluateBooking(formDraft(form, id), dogIds, existing);
}

export function reviewToken(form: BookingForm, result: Extract<BookingEvaluation, { ok: true }>): string | undefined {
  if (!result.warnings.length && !result.invalidRecords.length) return;
  // Tie acknowledgement to the candidate and current diagnostics. Never reuse it after edits.
  return JSON.stringify([form, result.warnings, result.invalidRecords]);
}

export function prepareDemoSave(form: BookingForm, id: string, dogIds: readonly string[], existing: readonly unknown[], acknowledgement?: string) {
  const result = evaluateBookingForm(form, id, dogIds, existing);
  if (!result.ok) return { kind: 'invalid' as const, errors: result.errors };
  const token = reviewToken(form, result);
  if (token && token !== acknowledgement) return { kind: 'review' as const, result, token };
  return { kind: 'saved' as const, booking: result.booking, notes: form.notes };
}

export function displayTime(time: string): string {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return 'Select time';
  const hour = Number(time.slice(0, 2));
  return `${hour % 12 || 12}:${time.slice(3)} ${hour < 12 ? 'AM' : 'PM'}`;
}

// Native pickers use UTC only as a wall-clock carrier. The resulting strings are
// interpreted in New York by domain validation, including DST gaps and folds.
export function pickerCarrier(value: string, mode: 'date' | 'time'): Date {
  return mode === 'date' ? new Date(`${value}T12:00:00.000Z`) : new Date(`2000-01-15T${value || '09:00'}:00.000Z`);
}
export function pickerWallValue(value: Date, mode: 'date' | 'time'): string {
  return mode === 'date' ? value.toISOString().slice(0, 10) : value.toISOString().slice(11, 16);
}

export function validationMessage(issue: ValidationIssue): string {
  const field = issue.field.includes('checkOut') ? 'Check-out' : issue.field.includes('checkIn') ? 'Check-in'
    : issue.field.includes('pickup') ? 'Pick-up' : issue.field.includes('dropOff') ? 'Drop-off'
    : issue.field.includes('endTime') ? 'Session end' : issue.field.includes('startTime') ? 'Session start'
    : issue.field === 'dogId' ? 'Dog' : issue.field === 'serviceCode' ? 'Service' : 'Schedule';
  switch (issue.code) {
    case 'nonexistent_time': return `${field}: this time does not exist in New York when clocks move forward. Choose another time.`;
    case 'ambiguous_time': return `${field}: this time occurs twice in New York when clocks move back. Choose another time.`;
    case 'unsupported_year': return `${field}: choose a year from 2000 through 2100.`;
    case 'end_must_follow_start': return 'The end must be later than the start.';
    case 'overnight_requires_later_date': return 'Check-out must be on a later date than check-in.';
    case 'invalid_date': return `${field}: choose a valid calendar date.`;
    case 'invalid_time': return `${field}: select a time.`;
    case 'unknown_dog': return 'Select a dog from the fictional directory.';
    case 'duplicate_booking_id': return 'This demo booking ID is already in use. Close the form and try again.';
    default: return `${field}: please check the required selection and schedule.`;
  }
}

function legacyTime(value: string): string {
  const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(value);
  if (!match) return value; // Invalid fixture content must fail domain validation.
  return `${String(Number(match[1]) % 12 + (match[3] === 'PM' ? 12 : 0)).padStart(2, '0')}:${match[2]}`;
}

export function demoBookingFromFixture(value: LegacyBooking, dogIds: readonly string[]): Booking {
  const serviceCode = value.service === 'Boarding' ? 'dog_boarding' : value.service === 'Daycare' ? 'dog_daycare' : 'private_training';
  const form: BookingForm = { dogId: value.dogId, serviceCode, startDate: value.startDate, endDate: value.endDate,
    startTime: legacyTime(value.arrivalTime), endTime: legacyTime(value.departureTime), notes: '' };
  if (serviceCode !== 'dog_boarding' && value.startDate !== value.endDate) throw new Error('Invalid fictional same-day fixture');
  const result = evaluateBookingForm(form, value.id, dogIds, []);
  if (!result.ok) throw new Error('Invalid fictional booking fixture');
  return result.booking;
}

// Temporary presentation adapter keeps existing v0.4 selectors and filters intact.
// Full labels remain available separately; this is never passed to domain validation.
export function sessionScheduleBookings(bookings: readonly Booking[]): readonly LegacyBooking[] {
  return bookings.filter(booking => booking.status === 'confirmed' && !validateBooking(booking).length).map(booking => {
    const [start, end] = scheduleBoundaries(booking.schedule);
    return { id: booking.id, dogId: booking.dogId,
      service: services[booking.serviceCode].scheduleKind === 'training' ? 'Training' : booking.serviceCode === 'dog_daycare' ? 'Daycare' : 'Boarding',
      startDate: start.date, endDate: end.date, arrivalTime: displayTime(start.time), departureTime: displayTime(end.time) };
  });
}

export function searchBookingDogs<T extends { name: string; client: { name: string } }>(dogs: readonly T[], query: string): readonly T[] {
  const text = query.trim().toLowerCase();
  return dogs.filter(dog => `${dog.name} ${dog.client.name}`.toLowerCase().includes(text));
}
