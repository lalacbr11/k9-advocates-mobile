import type { DogMovement } from '../logic/dogs';

// Fictional daily schedule only. Dog names and services come from shared records.
export const demoMovements: readonly DogMovement[] = [
  { dogId: 'hazel', time: '11:30 AM', type: 'Arrival' },
  { dogId: 'cleo', time: '4:30 PM', type: 'Departure' },
  { dogId: 'willow', time: '5:00 PM', type: 'Departure' },
];
