import type { ClientRecord } from '../data/clientRecords';
import type { DogRecord } from '../data/dogRecords';
import { searchByName } from './dogs';

export function searchClients(clients: readonly ClientRecord[], query: string): readonly ClientRecord[] {
  return searchByName(clients, query);
}

export function getDogOwner(clients: readonly ClientRecord[], dog: Pick<DogRecord, 'clientId'>): ClientRecord {
  const owner = clients.find((client) => client.id === dog.clientId);
  if (!owner) throw new Error(`Unknown client for demo dog: ${dog.clientId}`);
  return owner;
}

export function getClientDogs<T extends Pick<DogRecord, 'clientId'>>(dogs: readonly T[], clientId: string): readonly T[] {
  return dogs.filter((dog) => dog.clientId === clientId);
}
