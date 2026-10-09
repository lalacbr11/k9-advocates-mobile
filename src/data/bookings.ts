import type { DogRecord } from './dogRecords';

export type Booking = {
  id: string;
  dogId: string;
  service: DogRecord['service'];
  startDate: string; // Calendar dates (YYYY-MM-DD), not UTC instants.
  endDate: string; // Inclusive: departure day remains on the daily schedule.
  arrivalTime: string;
  departureTime: string;
};

// Fixed fictional demo dates keep the prototype and its QA reproducible.
export const demoCalendarStart = '2026-10-01';
export const bookings: readonly Booking[] = [
  { id: 'booking-001', dogId: 'atlas', service: 'Boarding', startDate: '2026-10-08', endDate: '2026-10-12', arrivalTime: '9:00 AM', departureTime: '4:00 PM' },
  { id: 'booking-002', dogId: 'hazel', service: 'Boarding', startDate: '2026-10-09', endDate: '2026-10-11', arrivalTime: '11:30 AM', departureTime: '3:00 PM' },
  { id: 'booking-003', dogId: 'willow', service: 'Daycare', startDate: '2026-10-09', endDate: '2026-10-09', arrivalTime: '8:00 AM', departureTime: '5:00 PM' },
  { id: 'booking-004', dogId: 'cleo', service: 'Daycare', startDate: '2026-10-09', endDate: '2026-10-09', arrivalTime: '9:00 AM', departureTime: '4:30 PM' },
  { id: 'booking-005', dogId: 'finn', service: 'Training', startDate: '2026-10-10', endDate: '2026-10-10', arrivalTime: '10:00 AM', departureTime: '11:00 AM' },
  { id: 'booking-006', dogId: 'otis', service: 'Training', startDate: '2026-10-09', endDate: '2026-10-09', arrivalTime: '2:00 PM', departureTime: '3:00 PM' },
  { id: 'booking-007', dogId: 'atlas', service: 'Boarding', startDate: '2026-10-30', endDate: '2026-11-03', arrivalTime: '9:00 AM', departureTime: '4:00 PM' },
  { id: 'booking-008', dogId: 'willow', service: 'Daycare', startDate: '2026-11-02', endDate: '2026-11-02', arrivalTime: '8:00 AM', departureTime: '5:00 PM' },
  { id: 'booking-009', dogId: 'hazel', service: 'Boarding', startDate: '2026-12-30', endDate: '2027-01-02', arrivalTime: '11:30 AM', departureTime: '3:00 PM' },
];
