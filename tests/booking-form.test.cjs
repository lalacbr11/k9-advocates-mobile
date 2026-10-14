const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const load = file => require(path.join(process.env.K9_TEST_OUTPUT, file));
const form = load('logic/bookingForm.js');
const { bookings: fixtures } = load('data/bookings.js');
const { dogRecords } = load('data/dogRecords.js');
const { clientRecords } = load('data/clientRecords.js');
const { services } = load('domain/services.js');
const { dailySchedule } = load('logic/schedule.js');
const { bookingsForDate } = load('logic/calendar.js');
const dogIds = dogRecords.map(dog => dog.id);
const session = fixtures.map(booking => form.demoBookingFromFixture(booking, dogIds));
const initial = form.initialBookingForm('2026-10-09');
const daycare = { ...initial, dogId: 'willow', serviceCode: 'dog_daycare', startTime: '09:17', endTime: '16:43' };

test('Dashboard defaults to New York today; Calendar preserves its selected date', () => {
  const now = new Date('2026-10-14T02:30:00Z');
  assert.equal(form.newYorkToday(now), '2026-10-13');
  assert.equal(form.initialBookingForm(undefined, now).startDate, '2026-10-13');
  assert.equal(form.initialBookingForm('2026-12-31', now).startDate, '2026-12-31');
  assert.equal(form.newYorkToday(new Date('2026-03-08T04:30:00Z')), '2026-03-07');
});

test('empty form requires dog and service, with readable required time and order errors', () => {
  const result = form.evaluateBookingForm(initial, 'demo-new', dogIds, session);
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map(error => error.field), ['dogId', 'serviceCode']);
  const missingTime = form.evaluateBookingForm({ ...daycare, startTime: '' }, 'demo-new', dogIds, session);
  assert.equal(missingTime.ok, false);
  assert.ok(missingTime.errors.some(error => form.validationMessage(error).includes('select a time')));
  const reversed = form.evaluateBookingForm({ ...daycare, endTime: '08:00' }, 'demo-new', dogIds, session);
  assert.ok(reversed.errors.some(error => error.code === 'end_must_follow_start'));
});

test('all six service choices produce the approved canonical schedules and Confirmed status', () => {
  for (const code of Object.keys(services)) {
    const input = { ...daycare, serviceCode: code, endDate: '2026-10-10' };
    const result = form.evaluateBookingForm(input, `demo-${code}`, dogIds, []);
    assert.equal(result.ok, true, code);
    assert.equal(result.booking.serviceCode, code);
    assert.equal(result.booking.schedule.kind, services[code].scheduleKind);
    assert.equal(result.booking.status, 'confirmed');
    assert.equal(result.booking.timeZone, 'America/New_York');
    assert.equal('notes' in result.booking, false);
  }
  const result = form.evaluateBookingForm({ ...daycare, serviceCode: 'dog_boarding' }, 'demo-new', dogIds, []);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.code === 'overnight_requires_later_date'));
});

test('native picker carriers preserve arbitrary minutes and invalid DST wall times without conversion', () => {
  for (const time of ['00:00', '02:30', '09:17', '12:00', '23:59']) {
    assert.equal(form.pickerWallValue(form.pickerCarrier(time, 'time'), 'time'), time);
  }
  assert.equal(form.pickerWallValue(form.pickerCarrier('2026-03-08', 'date'), 'date'), '2026-03-08');
  assert.equal(form.displayTime('00:07'), '12:07 AM');
  assert.equal(form.displayTime('12:17'), '12:17 PM');
  assert.equal(form.displayTime('23:59'), '11:59 PM');
  for (const [date, time, expected] of [['2026-03-08', '02:30', 'nonexistent_time'], ['2026-11-01', '01:30', 'ambiguous_time']]) {
    const result = form.evaluateBookingForm({ ...daycare, startDate: date, startTime: time }, 'demo-new', dogIds, []);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(error => error.code === expected));
    assert.ok(result.errors.map(form.validationMessage).join(' ').includes('New York'));
  }
});

test('overlaps require acknowledgement; changing schedule or current diagnostics invalidates it', () => {
  const first = form.prepareDemoSave(daycare, 'demo-new', dogIds, session);
  assert.equal(first.kind, 'review');
  assert.ok(first.result.warnings.some(warning => warning.bookingId === 'booking-003'));
  assert.equal(form.prepareDemoSave(daycare, 'demo-new', dogIds, session, first.token).kind, 'saved');
  assert.equal(form.prepareDemoSave({ ...daycare, endTime: '16:44' }, 'demo-new', dogIds, session, first.token).kind, 'review');
  const added = { ...session[2], id: 'demo-other' };
  assert.equal(form.prepareDemoSave(daycare, 'demo-new', dogIds, [...session, added], first.token).kind, 'review');
  assert.equal(form.prepareDemoSave(daycare, 'booking-003', dogIds, session, first.token).kind, 'invalid');
});

test('multiple training overlaps are reported and adjacent appointments need no acknowledgement', () => {
  const training = { ...daycare, dogId: 'finn', serviceCode: 'puppy_training', startTime: '14:00', endTime: '15:00' };
  const second = { ...session[5], id: 'demo-other', dogId: 'hazel' };
  const result = form.prepareDemoSave(training, 'demo-new', dogIds, [...session, second]);
  assert.equal(result.kind, 'review');
  assert.equal(new Set(result.result.warnings.map(warning => warning.bookingId)).size, 2);
  assert.equal(form.prepareDemoSave({ ...training, startTime: '15:00', endTime: '16:00' }, 'demo-new', dogIds, session).kind, 'saved');
});

test('malformed existing bookings make checking incomplete, require acknowledgement, and remain unchanged', () => {
  const bad = { id: 'demo-damaged', status: 'confirmed' };
  const existing = [...session, bad];
  const before = JSON.stringify(existing);
  const input = { ...daycare, startDate: '2026-10-20' };
  const result = form.prepareDemoSave(input, 'demo-new', dogIds, existing);
  assert.equal(result.kind, 'review');
  assert.equal(result.result.warnings.length, 0);
  assert.equal(result.result.invalidRecords.length, 1);
  assert.equal(form.prepareDemoSave(input, 'demo-new', dogIds, existing, result.token).kind, 'saved');
  assert.equal(JSON.stringify(existing), before);
});

test('notes persist separately and count as unsaved changes without entering the canonical model', () => {
  assert.equal(form.formIsDirty(initial, initial), false);
  const withNotes = { ...daycare, startDate: '2026-10-20', notes: 'Fictional demo: bring a blue blanket.' };
  assert.equal(form.formIsDirty({ ...initial, notes: withNotes.notes }, initial), true);
  const result = form.prepareDemoSave(withNotes, 'demo-new', dogIds, []);
  assert.equal(result.kind, 'saved');
  assert.equal(result.notes, withNotes.notes);
  assert.equal('notes' in result.booking, false);
  assert.equal(withNotes.notes, 'Fictional demo: bring a blue blanket.');
});

test('fictional fixture conversion preserves all nine IDs and schedules; session views share new bookings', () => {
  assert.deepEqual(session.map(booking => booking.id), fixtures.map(booking => booking.id));
  assert.deepEqual(form.sessionScheduleBookings(session), fixtures);
  assert.equal(session[4].serviceCode, 'private_training');
  assert.equal(session[5].serviceCode, 'private_training');
  const result = form.prepareDemoSave({ ...daycare, startDate: '2026-10-20' }, 'demo-new', dogIds, session);
  assert.equal(result.kind, 'saved');
  const shared = form.sessionScheduleBookings([...session, result.booking]);
  assert.equal(bookingsForDate(shared, '2026-10-20')[0].id, 'demo-new');
  assert.equal(dailySchedule(dogRecords, shared, '2026-10-20')[0].booking.id, 'demo-new');
  assert.equal(form.sessionScheduleBookings([...session, { ...result.booking, status: 'cancelled' }]).length, 9);
});

test('dog sheet search matches fictional dog or owner without changing stable IDs', () => {
  const dogs = dogRecords.map(dog => ({ ...dog, client: clientRecords.find(client => client.id === dog.clientId) }));
  assert.equal(form.searchBookingDogs(dogs, '  ATLas ')[0].id, 'atlas');
  assert.ok(form.searchBookingDogs(dogs, dogs[0].client.name.toUpperCase()).some(dog => dog.id === dogs[0].id));
  assert.equal(form.searchBookingDogs(dogs, '').length, dogRecords.length);
  assert.equal(form.searchBookingDogs(dogs, 'fictional-no-match').length, 0);
});


test('booking details preserve service-specific wall times and overnight date boundaries', () => {
  const { bookingScheduleRows } = load('logic/bookingDetails.js');
  const overnight = { kind: 'overnight', checkIn: { date: '2026-10-31', time: '18:17' }, checkOut: { date: '2026-11-02', time: '09:43' } };
  const before = structuredClone(overnight);
  assert.deepEqual(bookingScheduleRows(overnight), [
    { label: 'Check-in', date: '2026-10-31', time: '18:17' },
    { label: 'Check-out', date: '2026-11-02', time: '09:43' },
  ]);
  assert.deepEqual(overnight, before);
  assert.deepEqual(bookingScheduleRows({ kind: 'daycare', date: '2026-10-14', dropOffTime: '00:07', pickupTime: '12:17' }), [
    { label: 'Drop-off', date: '2026-10-14', time: '00:07' },
    { label: 'Pick-up', date: '2026-10-14', time: '12:17' },
  ]);
  assert.deepEqual(bookingScheduleRows({ kind: 'training', date: '2026-10-14', startTime: '14:00', endTime: '15:00' }), [
    { label: 'Session start', date: '2026-10-14', time: '14:00' },
    { label: 'Session end', date: '2026-10-14', time: '15:00' },
  ]);
});

test('whole-card selection opens a sole booking, but never chooses arbitrarily among multiple bookings', () => {
  const { bookingCardAction } = load('logic/bookingDetails.js');
  assert.deepEqual(bookingCardAction([]), { kind: 'none' });
  assert.deepEqual(bookingCardAction(['demo-b']), { kind: 'open', id: 'demo-b' });
  assert.deepEqual(bookingCardAction(['demo-b', 'demo-a']), { kind: 'choose' });
  assert.deepEqual(bookingCardAction(['demo-a', 'demo-b']), { kind: 'choose' });
});
