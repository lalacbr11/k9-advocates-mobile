import type { ImageSourcePropType } from 'react-native';
import { demoDogPhotos } from './dogPhotos';
import { dogRecords } from './dogRecords';
import type { DogRecord } from './dogRecords';
import { searchByName } from '../logic/dogs';

export type Dog = DogRecord & { photo?: ImageSourcePropType };

// Attach bundled photos separately so records and business logic remain platform-independent.
export const dogs: readonly Dog[] = dogRecords.map((dog) => ({
  ...dog,
  photo: demoDogPhotos[dog.id as keyof typeof demoDogPhotos]?.source,
}));

export function searchDogs(query: string): readonly Dog[] {
  return searchByName(dogs, query);
}
