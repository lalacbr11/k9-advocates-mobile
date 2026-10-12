import { bookingTimeZone } from '../domain/booking';
import { isServiceCode, services } from '../domain/services';
import { resolveBookingTime } from './bookingTime';
import type { TimeResolution } from './bookingTime';

export type ValidationCode = Extract<TimeResolution, { ok: false }>['code']
  | 'required' | 'required_stable_id' | 'unknown_dog' | 'invalid_status' | 'invalid_time_zone'
  | 'unexpected_booking_field' | 'unexpected_datetime_field' | 'duplicate_booking_id' | 'booking_id_changed' | 'invalid_service' | 'service_schedule_mismatch' | 'invalid_schedule_kind' | 'unexpected_schedule_field'
  | 'overnight_requires_later_date' | 'end_must_follow_start' | 'departure_before_arrival' | 'invalid_status_transition';
export type ValidationIssue = Readonly<{ field: string; code: ValidationCode }>;
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const identifier = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && value === value.trim();

// Runtime validation remains necessary even when TypeScript callers are typed.
export function validateBooking(input: unknown, knownDogIds?: readonly string[]): readonly ValidationIssue[] {
  const errors: ValidationIssue[] = [];
  const issue = (field: string, code: ValidationCode) => errors.push({ field, code });
  if (!record(input)) return [{ field: 'booking', code: 'required' }];
  const fields = ['id', 'dogId', 'status', 'timeZone', 'serviceCode', 'schedule', 'actualArrival', 'actualDeparture'];
  if (Object.keys(input).some(field => !fields.includes(field))) issue('booking', 'unexpected_booking_field');
  if (!identifier(input.id)) issue('id', 'required_stable_id');
  if (!identifier(input.dogId)) issue('dogId', 'required_stable_id');
  else if (knownDogIds && !knownDogIds.includes(input.dogId)) issue('dogId', 'unknown_dog');
  if (input.status !== 'confirmed' && input.status !== 'cancelled') issue('status', 'invalid_status');
  if (input.timeZone !== bookingTimeZone) issue('timeZone', 'invalid_time_zone');
  const validService = isServiceCode(input.serviceCode);
  if (!validService) issue('serviceCode', 'invalid_service');
  const readTime = (value: unknown, field: string): number | undefined => {
    if (!record(value)) { issue(field, 'required'); return; }
    if (Object.keys(value).some(key => key !== 'date' && key !== 'time')) issue(field, 'unexpected_datetime_field');
    const resolved = resolveBookingTime(value.date, value.time);
    if (!resolved.ok) { issue(field, resolved.code); return; }
    return resolved.epochMilliseconds;
  };
  if (!record(input.schedule)) issue('schedule', 'required');
  else {
    const schedule = input.schedule;
    if (isServiceCode(input.serviceCode) && schedule.kind !== services[input.serviceCode].scheduleKind) issue('schedule.kind', 'service_schedule_mismatch');
    const allowedFields = schedule.kind === 'overnight' ? ['kind', 'checkIn', 'checkOut']
      : schedule.kind === 'daycare' ? ['kind', 'date', 'dropOffTime', 'pickupTime']
      : schedule.kind === 'training' ? ['kind', 'date', 'startTime', 'endTime'] : [];
    if (allowedFields.length && Object.keys(schedule).some(field => !allowedFields.includes(field))) issue('schedule', 'unexpected_schedule_field');
    let start: number | undefined;
    let end: number | undefined;
    if (schedule.kind === 'overnight') {
      start = readTime(schedule.checkIn, 'schedule.checkIn');
      end = readTime(schedule.checkOut, 'schedule.checkOut');
      if (record(schedule.checkIn) && record(schedule.checkOut) && start !== undefined && end !== undefined &&
          String(schedule.checkOut.date) <= String(schedule.checkIn.date)) issue('schedule.checkOut', 'overnight_requires_later_date');
    } else if (schedule.kind === 'daycare' || schedule.kind === 'training') {
      const startField = schedule.kind === 'daycare' ? 'dropOffTime' : 'startTime';
      const endField = schedule.kind === 'daycare' ? 'pickupTime' : 'endTime';
      start = readTime({ date: schedule.date, time: schedule[startField] }, `schedule.${startField}`);
      end = readTime({ date: schedule.date, time: schedule[endField] }, `schedule.${endField}`);
    } else issue('schedule.kind', 'invalid_schedule_kind');
    if (start !== undefined && end !== undefined && start >= end) issue('schedule', 'end_must_follow_start');
  }
  const arrival = input.actualArrival === undefined ? undefined : readTime(input.actualArrival, 'actualArrival');
  const departure = input.actualDeparture === undefined ? undefined : readTime(input.actualDeparture, 'actualDeparture');
  // No invented restriction against early/late movements or departure-only observations.
  if (arrival !== undefined && departure !== undefined && departure < arrival) issue('actualDeparture', 'departure_before_arrival');
  return errors;
}
