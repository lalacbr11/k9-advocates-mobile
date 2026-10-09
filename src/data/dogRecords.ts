export type DogRecord = {
  id: string;
  name: string;
  owner: string;
  breed: string;
  age: string;
  weight: string;
  sex: string;
  service: 'Boarding' | 'Daycare' | 'Training';
  notes: string;
  scheduleDetail: string;
};

// Cleo intentionally has no photo to demonstrate the fallback avatar.
// Entirely fictional records for the local prototype, including owner names.
export const dogRecords: readonly DogRecord[] = [
  { id: 'atlas', scheduleDetail: 'Staying overnight', name: 'Atlas', owner: 'Morgan Ellis', breed: 'German Shepherd', age: '4 years', weight: '78 lb', sex: 'Male · Neutered', service: 'Boarding', notes: 'Enjoys quiet walks. Allow time to settle before group activities.' },
  { id: 'willow', scheduleDetail: '8:00 AM – 5:00 PM', name: 'Willow', owner: 'Jamie Parker', breed: 'Labrador Retriever', age: '3 years', weight: '62 lb', sex: 'Female · Spayed', service: 'Daycare', notes: 'Enjoys retrieving games and small playgroups.' },
  { id: 'finn', scheduleDetail: '10:00 AM · Leash skills', name: 'Finn', owner: 'Alex Rowan', breed: 'Border Collie', age: '2 years', weight: '41 lb', sex: 'Male · Neutered', service: 'Training', notes: 'Practicing loose-leash walking and calm greetings.' },
  { id: 'hazel', scheduleDetail: 'Arriving at 11:30 AM', name: 'Hazel', owner: 'Taylor Brooks', breed: 'Golden Retriever', age: '5 years', weight: '65 lb', sex: 'Female · Spayed', service: 'Boarding', notes: 'Prefers a gentle introduction to new dogs.' },
  { id: 'otis', scheduleDetail: '2:00 PM · Foundations', name: 'Otis', owner: 'Casey Lane', breed: 'Standard Poodle', age: '1 year', weight: '48 lb', sex: 'Male · Neutered', service: 'Training', notes: 'Working on basic cues and settling on a mat.' },
  { id: 'cleo', scheduleDetail: '9:00 AM – 4:30 PM', name: 'Cleo', owner: 'Jordan Reed', breed: 'Mixed breed', age: '6 years', weight: '35 lb', sex: 'Female · Spayed', service: 'Daycare', notes: 'Enjoys short play sessions with regular rest breaks.' },
];
