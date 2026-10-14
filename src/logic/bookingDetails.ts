import type { BookingSchedule } from '../domain/booking';

// Keep schedule-specific terminology and the original wall-clock values together.
export function bookingScheduleRows(schedule: BookingSchedule) {
  switch (schedule.kind) {
    case 'overnight': return [
      { label: 'Check-in', ...schedule.checkIn },
      { label: 'Check-out', ...schedule.checkOut },
    ];
    case 'daycare': return [
      { label: 'Drop-off', date: schedule.date, time: schedule.dropOffTime },
      { label: 'Pick-up', date: schedule.date, time: schedule.pickupTime },
    ];
    case 'training': return [
      { label: 'Session start', date: schedule.date, time: schedule.startTime },
      { label: 'Session end', date: schedule.date, time: schedule.endTime },
    ];
  }
}

export function bookingCardAction(ids: readonly string[]) {
  if (ids.length === 0) return { kind: 'none' as const };
  if (ids.length === 1) return { kind: 'open' as const, id: ids[0] };
  return { kind: 'choose' as const };
}
