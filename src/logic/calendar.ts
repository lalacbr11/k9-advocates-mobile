import type { Booking } from '../data/bookings';

// UTC is used only for calendar arithmetic so DST and device timezone cannot shift a day.
export function parseCalendarDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Invalid calendar date: ${value}`);
  const date = new Date(`${value}T12:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid calendar date: ${value}`);
  }
  return date;
}
export function dateKey(date: Date): string { return date.toISOString().slice(0, 10); }
export function localToday(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function monthSequence(start: string, count: number): readonly string[] {
  const date = parseCalendarDate(start);
  if (!Number.isInteger(count) || count < 0) throw new Error('Invalid month count');
  return Array.from({ length: count }, (_, index) => dateKey(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + index, 1, 12))));
}
export function monthGrid(month: string): readonly (string | null)[] {
  const date = parseCalendarDate(month);
  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12));
  const days = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 12)).getUTCDate();
  const cells = Math.ceil((first.getUTCDay() + days) / 7) * 7;
  return Array.from({ length: cells }, (_, index) => {
    const day = index - first.getUTCDay() + 1;
    return day < 1 || day > days ? null : dateKey(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), day, 12)));
  });
}
export function formatCalendarDate(date: string, options: Intl.DateTimeFormatOptions): string {
  return parseCalendarDate(date).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}
export function bookingsForDate(records: readonly Booking[], date: string): readonly Booking[] {
  parseCalendarDate(date);
  return records.filter((booking) => booking.startDate <= date && date <= booking.endDate);
}
export function bookingDayDetails(booking: Booking, date: string): readonly string[] {
  if (!bookingsForDate([booking], date).length) return [];
  const details: string[] = [];
  if (date === booking.startDate) details.push(`Arrival · ${booking.arrivalTime}`);
  if (date === booking.endDate) details.push(`Departure · ${booking.departureTime}`);
  if (!details.length) details.push('Continuing boarding stay');
  return details;
}
