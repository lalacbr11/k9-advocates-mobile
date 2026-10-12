export const services = {
  dog_boarding: { label: 'Dog Boarding', category: 'Boarding & Care', scheduleKind: 'overnight' },
  dog_daycare: { label: 'Dog Daycare', category: 'Boarding & Care', scheduleKind: 'daycare' },
  private_training: { label: 'Private Training', category: 'Training', scheduleKind: 'training' },
  board_and_train: { label: 'Board & Train', category: 'Boarding & Care', scheduleKind: 'overnight' },
  puppy_training: { label: 'Puppy Training', category: 'Training', scheduleKind: 'training' },
  behaviour_training: { label: 'Behaviour Training', category: 'Training', scheduleKind: 'training' },
} as const;

export type ServiceCode = keyof typeof services;
export type DashboardCategory = typeof services[ServiceCode]['category'];
export type OvernightService = 'dog_boarding' | 'board_and_train';
export type TrainingService = 'private_training' | 'puppy_training' | 'behaviour_training';

export function isServiceCode(value: unknown): value is ServiceCode {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(services, value);
}
