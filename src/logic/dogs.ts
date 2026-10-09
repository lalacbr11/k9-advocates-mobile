import type { DogRecord } from '../data/dogRecords';

export function searchByName<T extends Pick<DogRecord, 'name'>>(dogs: readonly T[], query: string): readonly T[] {
  const name = query.trim().toLocaleLowerCase('en-US');
  return dogs.filter((dog) => dog.name.toLocaleLowerCase('en-US').includes(name));
}

export function filterByService<T extends Pick<DogRecord, 'service'>>(dogs: readonly T[], service: DogRecord['service'] | 'All'): readonly T[] {
  return dogs.filter((dog) => service === 'All' || dog.service === service);
}

export type DogMovement = {
  dogId: string;
  time: string;
  type: 'Arrival' | 'Departure';
};

export function resolveMovements<T extends Pick<DogRecord, 'id'>>(dogs: readonly T[], movements: readonly DogMovement[]) {
  return movements.map(({ dogId, ...movement }) => {
    const dog = dogs.find((record) => record.id === dogId);
    if (!dog) throw new Error(`Unknown dog in sample schedule: ${dogId}`);
    return { ...movement, dog };
  });
}

export function previewDogs<T>(dogs: readonly T[], limit: number) {
  const count = Math.max(0, Math.floor(limit));
  const preview = dogs.slice(0, count);
  return { dogs: preview, remaining: dogs.length - preview.length };
}
