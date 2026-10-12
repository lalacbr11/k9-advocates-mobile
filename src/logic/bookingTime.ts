import { bookingTimeZone } from '../domain/booking';
import type { BookingSchedule, LocalDateTime } from '../domain/booking';
import { parseCalendarDate } from './calendar';

export type TimeResolution =
  | { readonly ok: true; readonly epochMilliseconds: number }
  | { readonly ok: false; readonly code: 'invalid_date' | 'unsupported_year' | 'invalid_time' | 'nonexistent_time' | 'ambiguous_time' };

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: bookingTimeZone, calendar: 'gregory', numberingSystem: 'latn',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
function localParts(epoch: number) {
  const parts = formatter.formatToParts(new Date(epoch));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)!.value;
  return `${part('year').padStart(4, '0')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}`;
}

// Derive offsets from the zone database, not device time or hard-coded DST dates.
export function resolveBookingTime(date: unknown, time: unknown): TimeResolution {
  if (typeof date !== 'string') return { ok: false, code: 'invalid_date' };
  if (/^\d{4}-\d{2}-\d{2}$/.test(date) && (Number(date.slice(0, 4)) < 2000 || Number(date.slice(0, 4)) > 2100)) return { ok: false, code: 'unsupported_year' };
  try { parseCalendarDate(date); } catch { return { ok: false, code: 'invalid_date' }; }
  if (typeof time !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return { ok: false, code: 'invalid_time' };
  const wall = `${date}T${time}:00`;
  const naive = Date.parse(`${wall}Z`);
  const offsets = new Set<number>();
  // Nearby samples discover both sides of a New York offset transition.
  for (const hours of [-36, 0, 36]) {
    const sample = naive + hours * 60 * 60 * 1000;
    offsets.add(Date.parse(`${localParts(sample)}Z`) - sample);
  }
  const candidates = [...offsets].map(offset => naive - offset).filter(epoch => localParts(epoch) === wall);
  if (!candidates.length) return { ok: false, code: 'nonexistent_time' };
  if (candidates.length > 1) return { ok: false, code: 'ambiguous_time' };
  return { ok: true, epochMilliseconds: candidates[0] };
}

export function scheduleBoundaries(schedule: BookingSchedule): readonly [LocalDateTime, LocalDateTime] {
  switch (schedule.kind) {
    case 'overnight': return [schedule.checkIn, schedule.checkOut];
    case 'daycare': return [{ date: schedule.date, time: schedule.dropOffTime }, { date: schedule.date, time: schedule.pickupTime }];
    case 'training': return [{ date: schedule.date, time: schedule.startTime }, { date: schedule.date, time: schedule.endTime }];
  }
}

export type IntervalResolution =
  | { readonly ok: true; readonly interval: readonly [number, number] }
  | { readonly ok: false; readonly code: Extract<TimeResolution, { ok: false }>['code'] | 'end_must_follow_start' };

export function scheduledInterval(schedule: BookingSchedule): IntervalResolution {
  const [start, end] = scheduleBoundaries(schedule).map(value => resolveBookingTime(value.date, value.time));
  if (!start.ok) return start;
  if (!end.ok) return end;
  if (start.epochMilliseconds >= end.epochMilliseconds) return { ok: false, code: 'end_must_follow_start' };
  return { ok: true, interval: [start.epochMilliseconds, end.epochMilliseconds] };
}
