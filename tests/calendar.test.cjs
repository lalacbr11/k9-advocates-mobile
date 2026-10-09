const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const output = process.env.K9_TEST_OUTPUT;
const { bookings } = require(path.join(output, 'data/bookings.js'));
const { dogRecords } = require(path.join(output, 'data/dogRecords.js'));
const { parseCalendarDate, monthSequence, monthGrid, bookingsForDate, bookingDayDetails, formatCalendarDate, localToday } = require(path.join(output, 'logic/calendar.js'));

test('date parsing rejects invalid dates, leap days and non-canonical input', () => {
  assert.equal(parseCalendarDate('2024-02-29').getUTCDate(), 29);
  for (const value of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-1-01', 'nonsense']) assert.throws(() => parseCalendarDate(value));
  assert.equal(formatCalendarDate('2026-10-09', { weekday: 'long' }), 'Friday');
  assert.equal(localToday(new Date(2026, 9, 9, 23, 59)), '2026-10-09');
});
test('consecutive months cross years without carrying the starting day', () => {
  assert.deepEqual(monthSequence('2026-12-31', 3), ['2026-12-01', '2027-01-01', '2027-02-01']);
  assert.deepEqual(monthSequence('2026-10-01', 0), []);
  assert.throws(() => monthSequence('2026-10-01', -1));
});
test('seven-column Sunday-first grids align dates and pad complete weeks', () => {
  const october = monthGrid('2026-10-01');
  assert.equal(october.length % 7, 0);
  assert.deepEqual(october.slice(0, 5), [null, null, null, null, '2026-10-01']);
  assert.equal(october.filter(Boolean).length, 31);
  assert.equal(monthGrid('2024-02-01').filter(Boolean).length, 29);
  assert.equal(monthGrid('2026-02-01')[0], '2026-02-01');
  assert.equal(monthGrid('2026-08-01').length, 42);
});
test('boarding includes arrival, intermediate stay and departure, excludes surrounding dates', () => {
  const atlas = [bookings[0]];
  for (const date of ['2026-10-08', '2026-10-09', '2026-10-12']) assert.equal(bookingsForDate(atlas, date).length, 1);
  for (const date of ['2026-10-07', '2026-10-13']) assert.deepEqual(bookingsForDate(atlas, date), []);
  assert.deepEqual(bookingDayDetails(atlas[0], '2026-10-08'), ['Arrival · 9:00 AM']);
  assert.deepEqual(bookingDayDetails(atlas[0], '2026-10-09'), ['Continuing boarding stay']);
  assert.deepEqual(bookingDayDetails(atlas[0], '2026-10-12'), ['Departure · 4:00 PM']);
  assert.deepEqual(bookingDayDetails(atlas[0], '2026-10-13'), []);
});
test('same-day bookings show both movements and only occur on their booked day', () => {
  const willow = bookings.find(booking => booking.id === 'booking-003');
  assert.deepEqual(bookingDayDetails(willow, '2026-10-09'), ['Arrival · 8:00 AM', 'Departure · 5:00 PM']);
  assert.deepEqual(bookingsForDate([willow], '2026-10-10'), []);
  assert.deepEqual(bookingsForDate(bookings, '2026-10-20'), []);
  assert.deepEqual(bookingsForDate([], '2026-10-09'), []);
});
test('stays cross month, year and daylight-saving boundaries without date shifts', () => {
  assert.ok(bookingsForDate(bookings, '2026-11-01').some(booking => booking.id === 'booking-007'));
  assert.ok(bookingsForDate(bookings, '2027-01-02').some(booking => booking.id === 'booking-009'));
  assert.equal(bookingsForDate(bookings, '2027-01-03').length, 0);
});
test('demo bookings reference shared dogs, use valid ranges and preserve source data', () => {
  assert.equal(new Set(bookings.map(booking => booking.id)).size, bookings.length);
  for (const booking of bookings) {
    assert.ok(dogRecords.some(dog => dog.id === booking.dogId));
    parseCalendarDate(booking.startDate); parseCalendarDate(booking.endDate);
    assert.ok(booking.startDate <= booking.endDate);
    if (booking.service !== 'Boarding') assert.equal(booking.startDate, booking.endDate);
    assert.ok(booking.arrivalTime && booking.departureTime);
  }
  const before = structuredClone(bookings);
  assert.equal(bookingsForDate(bookings, '2026-10-09').length, 5);
  bookingsForDate(bookings, '2026-11-02');
  assert.deepEqual(bookings, before);
});
