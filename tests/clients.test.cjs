const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const output = process.env.K9_TEST_OUTPUT;
const { clientRecords: clients } = require(path.join(output, 'data/clientRecords.js'));
const { dogRecords: dogs } = require(path.join(output, 'data/dogRecords.js'));
const { searchClients, getDogOwner, getClientDogs } = require(path.join(output, 'logic/clients.js'));
const { openProfile, backFromProfile } = require(path.join(output, 'logic/navigation.js'));

test('client name search handles partial names, case and surrounding whitespace', () => {
  assert.deepEqual(searchClients(clients, '  MORg ').map(client => client.id), ['client-001']);
  assert.deepEqual(searchClients(clients, 'PARKER').map(client => client.name), ['Jamie Parker']);
  assert.deepEqual(searchClients(clients, 'an').map(client => client.id), ['client-001', 'client-003', 'client-005', 'client-006']);
});

test('clearing client search restores all clients; unmatched searches return none', () => {
  for (const query of ['', '  ']) assert.deepEqual(searchClients(clients, query), clients);
  assert.deepEqual(searchClients(clients, 'zzzzz'), []);
  assert.deepEqual(searchClients([], 'Morgan'), []);
  assert.deepEqual(searchClients(clients, 'Atlas'), []);
});

test('demo clients have unique stable IDs and fictional contact details', () => {
  assert.equal(clients.length, 6);
  assert.equal(new Set(clients.map(client => client.id)).size, clients.length);
  for (const client of clients) {
    assert.ok(client.name.trim());
    assert.match(client.phone, /^\(201\) 555-01\d{2}$/);
    assert.match(client.email, /^[^@]+@example\.com$/);
  }
});

test('every dog resolves to one shared owner and appears in that client’s linked dogs', () => {
  for (const dog of dogs) {
    assert.equal('owner' in dog, false, 'Owner names belong only in client records');
    const owner = getDogOwner(clients, dog);
    assert.equal(owner, clients.find(client => client.id === dog.clientId));
    assert.ok(getClientDogs(dogs, owner.id).includes(dog));
  }
  assert.equal(getDogOwner(clients, dogs.find(dog => dog.id === 'atlas')).name, 'Morgan Ellis');
  assert.throws(() => getDogOwner(clients, { clientId: 'missing-client' }), /Unknown client/);
});

test('relationships support multiple dogs, clients without dogs, and owner renames', () => {
  const owner = clients[0];
  const multiple = [dogs[0], { ...dogs[1], clientId: owner.id }];
  assert.deepEqual(getClientDogs(multiple, owner.id).map(dog => dog.id), ['atlas', 'willow']);
  assert.deepEqual(getClientDogs(dogs, 'unlinked-demo-client'), []);
  assert.deepEqual(getClientDogs([], owner.id), []);
  const renamed = clients.map(client => client.id === owner.id ? { ...client, name: 'Demo Renamed' } : client);
  assert.equal(getDogOwner(renamed, dogs[0]).name, 'Demo Renamed');
  assert.equal(getClientDogs(dogs, owner.id)[0], dogs[0]);
});

test('client lookup and search do not modify source records', () => {
  const beforeClients = structuredClone(clients);
  const beforeDogs = structuredClone(dogs);
  searchClients(clients, 'Morgan');
  getDogOwner(clients, dogs[0]);
  getClientDogs(dogs, clients[0].id);
  assert.deepEqual(clients, beforeClients);
  assert.deepEqual(dogs, beforeDogs);
});

test('profile navigation supports both directions and back without owner/dog loops', () => {
  const dog = { kind: 'dog', id: 'atlas' };
  const client = { kind: 'client', id: 'client-001' };
  const fromDogs = openProfile(openProfile([], dog), client);
  assert.deepEqual(backFromProfile(fromDogs), [dog]);
  assert.deepEqual(openProfile(fromDogs, dog), [dog]);
  const fromClients = openProfile(openProfile([], client), dog);
  assert.deepEqual(backFromProfile(fromClients), [client]);
  assert.deepEqual(openProfile(fromClients, client), [client]);
  assert.deepEqual(backFromProfile([client]), []);
  assert.deepEqual(backFromProfile([]), []);
  assert.deepEqual(fromDogs, [dog, client]);
});
