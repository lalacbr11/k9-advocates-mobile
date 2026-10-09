const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const output = process.env.K9_TEST_OUTPUT;
const { bookings } = require(path.join(output, 'data/bookings.js'));
const { dogRecords: dogs } = require(path.join(output, 'data/dogRecords.js'));
const { dailySchedule, scheduledDogs, scheduleMovements } = require(path.join(output, 'logic/schedule.js'));
const { filterByService, previewDogs } = require(path.join(output, 'logic/dogs.js'));

test('Dashboard and Calendar select the same five dogs on October 9; Finn is October 10', () => {
  const entries = dailySchedule(dogs, bookings, '2026-10-09');
  const dashboard = scheduledDogs(entries);
  assert.deepEqual(dashboard.map(dog => dog.id), entries.map(entry => entry.dog.id));
  assert.deepEqual(dashboard.map(dog => dog.id), ['atlas', 'hazel', 'willow', 'cleo', 'otis']);
  assert.deepEqual(['Boarding', 'Daycare', 'Training'].map(service => filterByService(dashboard, service).length), [2, 2, 1]);
  assert.equal(previewDogs(dashboard, 3).remaining, 2);
  assert.ok(dailySchedule(dogs, bookings, '2026-10-10').some(entry => entry.dog.id === 'finn'));
});
test('movements and schedule details derive from booking boundaries for every service', () => {
  const date = '2026-10-09';
  const entries = dailySchedule(dogs, bookings, date);
  const movements = scheduleMovements(entries, date);
  assert.equal(movements.length, 7);
  assert.ok(!movements.some(item => item.dog.id === 'atlas'));
  assert.ok(movements.some(item => item.dog.id === 'otis' && item.type === 'Arrival' && item.time === '2:00 PM'));
  assert.equal(scheduledDogs(entries)[0].scheduleDetail, 'Continuing boarding stay');
  const departure = dailySchedule(dogs, bookings, '2026-10-12');
  assert.deepEqual(scheduleMovements(departure, '2026-10-12').map(item => [item.dog.id, item.type, item.time]), [['atlas', 'Departure', '4:00 PM']]);
});
test('booking service overrides dog default and multiple bookings count once per dog/service', () => {
  const sample = { ...bookings[2], dogId: 'atlas' };
  const entries = dailySchedule(dogs, [sample, { ...sample, id: 'another' }], '2026-10-09');
  assert.equal(entries[0].dog, dogs[0]);
  assert.equal(scheduledDogs(entries).length, 1);
  assert.equal(scheduledDogs(entries)[0].service, 'Daycare');
  assert.equal(dogs[0].service, 'Boarding');
});
test('empty days, unknown dogs, and lookups leave source records intact', () => {
  const before = structuredClone({ dogs, bookings });
  const empty = dailySchedule(dogs, bookings, '2026-10-20');
  assert.deepEqual(scheduledDogs(empty), []);
  assert.deepEqual(scheduleMovements(empty, '2026-10-20'), []);
  assert.throws(() => dailySchedule([], bookings, '2026-10-09'), /Unknown dog/);
  dailySchedule(dogs, bookings, '2026-11-01');
  assert.deepEqual({ dogs, bookings }, before);
});
