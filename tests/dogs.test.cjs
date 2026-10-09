const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { dogRecords: dogs } = require(path.join(process.env.K9_TEST_OUTPUT, 'data/dogRecords.js'));
// Fixture for the generic movement resolver, not a production daily schedule.
const demoMovements = [
  { dogId: 'hazel', time: '11:30 AM', type: 'Arrival' },
  { dogId: 'cleo', time: '4:30 PM', type: 'Departure' },
  { dogId: 'willow', time: '5:00 PM', type: 'Departure' },
];
const { searchByName, filterByService, resolveMovements, previewDogs } = require(path.join(process.env.K9_TEST_OUTPUT, 'logic/dogs.js'));

test('name search supports partial, case-insensitive and trimmed input', () => {
  assert.deepEqual(searchByName(dogs, '  AT ').map(dog => dog.id), ['atlas']);
  assert.deepEqual(searchByName(dogs, 'ILL').map(dog => dog.id), ['willow']);
});

test('blank search restores all dogs; unmatched and owner queries return none', () => {
  for (const query of ['', '   ']) assert.deepEqual(searchByName(dogs, query), dogs);
  for (const query of ['zzzzz', 'Morgan Ellis']) assert.deepEqual(searchByName(dogs, query), []);
  assert.deepEqual(searchByName([], 'atlas'), []);
});

test('service filters preserve two dogs per service and six in All', () => {
  assert.deepEqual(filterByService(dogs, 'All'), dogs);
  for (const service of ['Boarding', 'Daycare', 'Training']) {
    const result = filterByService(dogs, service);
    assert.equal(result.length, 2);
    assert.ok(result.every(dog => dog.service === service));
  }
  assert.deepEqual(filterByService([], 'Boarding'), []);
});

test('shared demo records have unique IDs and complete profile and schedule details', () => {
  assert.equal(dogs.length, 6);
  assert.equal(new Set(dogs.map(dog => dog.id)).size, dogs.length);
  for (const dog of dogs) {
    for (const key of ['id', 'name', 'clientId', 'breed', 'age', 'weight', 'sex', 'service', 'notes', 'scheduleDetail']) {
      assert.ok(typeof dog[key] === 'string' && dog[key].trim(), `${dog.id}: ${key}`);
    }
  }
});

test('arrivals and departures resolve to shared records with unchanged times and order', () => {
  const movements = resolveMovements(dogs, demoMovements);
  assert.deepEqual(movements.map(item => [item.dog.name, item.type, item.dog.service, item.time]), [
    ['Hazel', 'Arrival', 'Boarding', '11:30 AM'],
    ['Cleo', 'Departure', 'Daycare', '4:30 PM'],
    ['Willow', 'Departure', 'Daycare', '5:00 PM'],
  ]);
  for (const movement of movements) assert.equal(movement.dog, dogs.find(dog => dog.id === movement.dog.id));
  const changed = dogs.map(dog => dog.id === 'hazel' ? { ...dog, name: 'Demo renamed', service: 'Training' } : dog);
  assert.equal(resolveMovements(changed, demoMovements)[0].dog.name, 'Demo renamed');
  assert.equal(resolveMovements(changed, demoMovements)[0].dog.service, 'Training');
  assert.throws(() => resolveMovements([], demoMovements), /Unknown dog/);
});

test('preview derives remaining count for short, full and empty lists without mutating input', () => {
  const before = structuredClone(dogs);
  assert.deepEqual(previewDogs(dogs, 3), { dogs: dogs.slice(0, 3), remaining: 3 });
  assert.equal(previewDogs(dogs.slice(0, 2), 3).remaining, 0);
  assert.deepEqual(previewDogs([], 3), { dogs: [], remaining: 0 });
  assert.equal(previewDogs(dogs, 0).remaining, 6);
  searchByName(dogs, 'at');
  filterByService(dogs, 'Boarding');
  resolveMovements(dogs, demoMovements);
  assert.deepEqual(dogs, before);
});
