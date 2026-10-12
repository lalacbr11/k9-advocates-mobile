const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const output = process.env.K9_TEST_OUTPUT;
const load = file => require(path.join(output, file));
const { services, isServiceCode } = load('domain/services.js');
const { bookingTimeZone } = load('domain/booking.js');
const { resolveBookingTime, scheduledInterval } = load('logic/bookingTime.js');
const { validateBooking, evaluateBooking, evaluateBookingEdit, validateStatusTransition, changeBookingStatus } = load('logic/bookingValidation.js');
const { findBookingConflicts } = load('logic/bookingConflicts.js');
const dogs = ['synthetic-dog-a', 'synthetic-dog-b'];
function sample(serviceCode = 'private_training', overrides = {}) {
  const kind = services[serviceCode].scheduleKind;
  const schedule = kind === 'overnight'
    ? { kind, checkIn: { date: '2026-10-12', time: '09:00' }, checkOut: { date: '2026-10-14', time: '16:00' } }
    : kind === 'daycare' ? { kind, date: '2026-10-12', dropOffTime: '08:00', pickupTime: '17:00' }
    : { kind, date: '2026-10-12', startTime: '10:00', endTime: '11:00' };
  return { id: 'synthetic-booking-a', dogId: dogs[0], status: 'confirmed', timeZone: bookingTimeZone, serviceCode, schedule, ...overrides };
}
const codes = booking => validateBooking(booking, dogs).map(error => error.code);

test('six stable codes, exact labels, dashboard categories and schedule kinds', () => {
  assert.deepEqual(Object.keys(services), ['dog_boarding', 'dog_daycare', 'private_training', 'board_and_train', 'puppy_training', 'behaviour_training']);
  assert.deepEqual(Object.values(services).map(item => item.label), ['Dog Boarding', 'Dog Daycare', 'Private Training', 'Board & Train', 'Puppy Training', 'Behaviour Training']);
  for (const code of Object.keys(services)) {
    assert.ok(isServiceCode(code));
    assert.equal(services[code].category, ['dog_boarding', 'dog_daycare', 'board_and_train'].includes(code) ? 'Boarding & Care' : 'Training');
    assert.deepEqual(codes(sample(code)), []);
  }
  assert.equal(isServiceCode('__proto__'), false);
  assert.equal(isServiceCode('Dog Boarding'), false);
});
test('creation defaults to Confirmed and rejects missing IDs, unknown dogs, services, statuses and zones', () => {
  const draft = sample(); delete draft.status;
  assert.equal(evaluateBooking(draft, dogs).booking.status, 'confirmed');
  for (const field of ['id', 'dogId', 'serviceCode', 'timeZone', 'schedule', 'status']) {
    const value = sample(); delete value[field]; assert.ok(codes(value).length, field);
  }
  for (const overrides of [{ id: ' ' }, { dogId: 'unknown-synthetic-dog' }, { serviceCode: 'training' }, { status: 'pending' }, { timeZone: 'UTC' }]) assert.ok(codes(sample('private_training', overrides)).length);
  assert.ok(validateBooking(null, dogs).length);
});
test('every service requires all dates and times and its correct schedule kind', () => {
  for (const service of Object.keys(services)) {
    const booking = sample(service);
    if (booking.schedule.kind === 'overnight') {
      for (const boundary of ['checkIn', 'checkOut']) for (const field of ['date', 'time']) {
        const changed = structuredClone(booking); delete changed.schedule[boundary][field]; assert.ok(codes(changed).length);
      }
    } else for (const field of Object.keys(booking.schedule).filter(field => field !== 'kind')) {
      const changed = structuredClone(booking); delete changed.schedule[field]; assert.ok(codes(changed).length);
    }
    assert.ok(codes({ ...booking, schedule: sample(service === 'dog_daycare' ? 'dog_boarding' : 'dog_daycare').schedule }).includes('service_schedule_mismatch'));
  }
});
test('calendar validity and canonical HH:mm are enforced', () => {
  for (const date of ['2026-02-29', '2026-04-31', '2026-13-01', '26-10-12', '', undefined]) assert.equal(resolveBookingTime(date, '10:00').ok, false);
  for (const time of ['24:00', '10:60', '9:00', '09', '10:00 AM', '10:00:00', '', undefined]) assert.equal(resolveBookingTime('2026-10-12', time).ok, false);
  assert.equal(resolveBookingTime('2028-02-29', '00:00').ok, true);
  assert.equal(resolveBookingTime('2026-10-12', '23:59').ok, true);
});
test('overnight services require a later calendar date, allowing an earlier checkout clock time', () => {
  for (const service of ['dog_boarding', 'board_and_train']) {
    const booking = sample(service);
    booking.schedule.checkOut = { date: '2026-10-12', time: '18:00' };
    assert.ok(codes(booking).includes('overnight_requires_later_date'));
    booking.schedule.checkOut = { date: '2026-10-13', time: '07:00' };
    assert.deepEqual(codes(booking), []);
    booking.schedule.checkOut.date = '2026-10-11'; assert.ok(codes(booking).includes('end_must_follow_start'));
  }
});
test('daycare and all training appointments require a positive same-day interval', () => {
  for (const service of ['dog_daycare', 'private_training', 'puppy_training', 'behaviour_training']) {
    for (const end of ['10:00', '09:00']) {
      const booking = sample(service);
      if (service === 'dog_daycare') { booking.schedule.dropOffTime = '10:00'; booking.schedule.pickupTime = end; }
      else { booking.schedule.startTime = '10:00'; booking.schedule.endTime = end; }
      assert.ok(codes(booking).includes('end_must_follow_start'));
    }
  }
});
test('actual early departure preserves service and original schedule and never releases scheduled conflicts', () => {
  const booking = sample('board_and_train', { actualArrival: { date: '2026-10-12', time: '09:30' }, actualDeparture: { date: '2026-10-13', time: '12:00' } });
  const before = structuredClone(booking);
  const result = evaluateBooking(booking, dogs);
  assert.equal(result.ok, true);
  assert.equal(result.booking.serviceCode, 'board_and_train');
  assert.deepEqual(result.booking.schedule, before.schedule);
  const candidate = sample('private_training', { id: 'synthetic-booking-b', schedule: { kind: 'training', date: '2026-10-14', startTime: '10:00', endTime: '11:00' } });
  assert.equal(findBookingConflicts(candidate, [booking]).warnings[0].code, 'same_dog_overlap');
  assert.deepEqual(booking, before);
});
test('actual movements are optional, valid local times, and departure cannot precede recorded arrival', () => {
  const booking = sample('dog_boarding', { actualDeparture: { date: '2026-10-13', time: '12:00' } });
  assert.deepEqual(codes(booking), []);
  booking.actualArrival = { date: '2026-10-14', time: '09:00' };
  assert.ok(codes(booking).includes('departure_before_arrival'));
  booking.actualArrival = { date: '2026-10-12', time: '24:00' };
  assert.ok(codes(booking).includes('invalid_time'));
});
test('only Confirmed to Cancelled and Cancelled to Confirmed are transitions', () => {
  assert.deepEqual(validateStatusTransition('confirmed', 'cancelled'), []);
  assert.deepEqual(validateStatusTransition('cancelled', 'confirmed'), []);
  for (const pair of [['confirmed', 'confirmed'], ['cancelled', 'cancelled'], ['pending', 'confirmed'], ['confirmed', 'complete']]) assert.ok(validateStatusTransition(...pair).length);
});
test('same-dog confirmed overlaps warn across service types; different dogs may share boarding/daycare', () => {
  const boarding = sample('dog_boarding', { id: 'synthetic-booking-b' });
  const daycare = sample('dog_daycare');
  assert.deepEqual(findBookingConflicts(daycare, [boarding]).warnings, [{ code: 'same_dog_overlap', bookingId: boarding.id }]);
  assert.deepEqual(findBookingConflicts({ ...daycare, dogId: dogs[1] }, [boarding]).warnings, []);
  assert.deepEqual(findBookingConflicts(sample('board_and_train', { dogId: dogs[1] }), [boarding]).warnings, []);
  assert.equal(evaluateBooking(daycare, dogs, [boarding]).ok, true);
});
test('different-dog training overlaps warn across all training services', () => {
  for (const service of ['private_training', 'puppy_training', 'behaviour_training']) {
    const existing = sample(service, { id: 'synthetic-booking-b', dogId: dogs[1] });
    assert.deepEqual(findBookingConflicts(sample(), [existing]).warnings, [{ code: 'training_overlap', bookingId: existing.id }]);
  }
  const existing = sample('puppy_training', { id: 'synthetic-booking-b' });
  assert.deepEqual(findBookingConflicts(sample(), [existing]).warnings.map(item => item.code), ['same_dog_overlap', 'training_overlap']);
});
test('half-open intervals permit adjacent appointments and same-day checkout/check-in', () => {
  const appointment = sample('private_training', { id: 'synthetic-booking-b', schedule: { kind: 'training', date: '2026-10-12', startTime: '11:00', endTime: '12:00' } });
  assert.deepEqual(findBookingConflicts(sample(), [appointment]).warnings, []);
  const nextStay = sample('dog_boarding', { id: 'synthetic-booking-b', schedule: { kind: 'overnight', checkIn: { date: '2026-10-14', time: '16:00' }, checkOut: { date: '2026-10-15', time: '09:00' } } });
  assert.deepEqual(findBookingConflicts(sample('dog_boarding'), [nextStay]).warnings, []);
  nextStay.schedule.checkIn.time = '15:59';
  assert.equal(findBookingConflicts(sample('dog_boarding'), [nextStay]).warnings.length, 1);
});
test('cancelled candidates and existing bookings are excluded, and editing excludes its own stable ID', () => {
  const existing = sample('private_training', { id: 'synthetic-booking-b', status: 'cancelled' });
  assert.deepEqual(findBookingConflicts(sample(), [existing]).warnings, []);
  assert.deepEqual(findBookingConflicts({ ...sample(), status: 'cancelled' }, [sample('puppy_training', { id: 'synthetic-booking-b' })]).warnings, []);
  assert.deepEqual(findBookingConflicts(sample(), [sample()], { excludeBookingId: sample().id }).warnings, []);
});
test('restore checks conflicts and retains ID, service, schedule, and actual observations', () => {
  const cancelled = sample('private_training', { status: 'cancelled', actualArrival: { date: '2026-10-12', time: '09:55' } });
  const before = structuredClone(cancelled);
  const existing = sample('puppy_training', { id: 'synthetic-booking-b', dogId: dogs[1] });
  const result = changeBookingStatus(cancelled, 'confirmed', dogs, [existing]);
  assert.equal(result.ok, true);
  assert.equal(result.warnings[0].code, 'training_overlap');
  assert.deepEqual(result.booking, { ...before, status: 'confirmed' });
  assert.deepEqual(cancelled, before);
  assert.deepEqual(changeBookingStatus(result.booking, 'cancelled', dogs, [existing]).warnings, []);
  assert.equal(changeBookingStatus(cancelled, 'cancelled', dogs).ok, false);
});
test('DST gaps and folds are explicit errors rather than guessed times', () => {
  assert.deepEqual(resolveBookingTime('2026-03-08', '02:30'), { ok: false, code: 'nonexistent_time' });
  assert.deepEqual(resolveBookingTime('2026-11-01', '01:30'), { ok: false, code: 'ambiguous_time' });
  const schedule = { kind: 'training', date: '2026-03-08', startTime: '01:30', endTime: '03:30' };
  const result = scheduledInterval(schedule);
  assert.equal(result.ok, true);
  const [start, end] = result.interval;
  assert.equal(end - start, 60 * 60 * 1000);
  assert.ok(codes(sample('private_training', { schedule: { ...schedule, startTime: '02:30' } })).includes('nonexistent_time'));
  const cancelled = sample('private_training', { status: 'cancelled', schedule: { kind: 'training', date: '2026-11-01', startTime: '01:30', endTime: '02:30' } });
  assert.equal(changeBookingStatus(cancelled, 'confirmed', dogs).ok, false);
});
test('overnight stays span DST, month/year boundaries and do not depend on device time zone', () => {
  for (const [date, next, expectedHours] of [['2026-03-07', '2026-03-09', 47], ['2026-10-31', '2026-11-02', 49], ['2026-12-31', '2027-01-01', 24]]) {
    const schedule = { kind: 'overnight', checkIn: { date, time: '12:00' }, checkOut: { date: next, time: '12:00' } };
    const result = scheduledInterval(schedule);
  assert.equal(result.ok, true);
  const [start, end] = result.interval;
    assert.equal((end - start) / 3600000, expectedHours);
  }
  const modulePath = path.join(output, 'logic/bookingTime.js');
  const code = `const {resolveBookingTime}=require(${JSON.stringify(modulePath)});process.stdout.write(JSON.stringify(resolveBookingTime('2026-10-12','10:00')))`;
  const values = ['UTC', 'America/Los_Angeles', 'Asia/Tokyo'].map(TZ => execFileSync(process.execPath, ['-e', code], { env: { ...process.env, TZ }, encoding: 'utf8' }));
  assert.equal(new Set(values).size, 1);
});


test('single-day schedules cannot smuggle a second date or other unsupported schedule fields', () => {
  for (const service of ['dog_daycare', 'private_training']) {
    const booking = sample(service);
    booking.schedule.endDate = '2026-10-13';
    assert.ok(codes(booking).includes('unexpected_schedule_field'));
  }
  assert.deepEqual(scheduledInterval({ kind: 'training', date: '2026-11-01', startTime: '01:30', endTime: '02:30' }), { ok: false, code: 'ambiguous_time' });
});

test('malformed existing records are reported while later valid overlaps still warn', () => {
  const valid = sample('puppy_training', { id: 'synthetic-valid-b', dogId: dogs[1] });
  const damaged = [null, {}, sample('private_training', { id: 'synthetic-bad-time', schedule: { kind: 'training', date: '2026-10-12', startTime: '99:00', endTime: '11:00' } }), sample('private_training', { id: 'synthetic-bad-service', serviceCode: 'legacy' }), sample('private_training', { id: 'synthetic-unknown-dog', dogId: 'synthetic-missing' })];
  const report = findBookingConflicts(sample(), [...damaged, valid], { knownDogIds: dogs });
  assert.equal(report.invalidRecords.length, damaged.length);
  assert.deepEqual(report.invalidRecords.map(item => item.index), [0, 1, 2, 3, 4]);
  assert.deepEqual(report.warnings, [{ code: 'training_overlap', bookingId: valid.id }]);
  for (const result of [evaluateBooking(sample(), dogs, [...damaged, valid]), evaluateBookingEdit(sample(), sample().id, dogs, [...damaged, valid, sample()]), changeBookingStatus({ ...sample(), status: 'cancelled' }, 'confirmed', dogs, [...damaged, valid])]) {
    assert.equal(result.ok, true);
    assert.equal(result.invalidRecords.length, damaged.length);
    assert.equal(result.warnings.length, 1);
  }
  assert.ok(findBookingConflicts({ ...sample(), schedule: null }, [valid]).candidateErrors.length);
});
test('legacy cancellation validates only identity/status, but restoration still rejects invalid data', () => {
  for (const legacy of [{ id: 'synthetic-legacy', status: 'confirmed', startDate: '2026-10-12' }, { ...sample(), dogId: 'synthetic-unavailable' }, { ...sample(), schedule: null }]) {
    const before = structuredClone(legacy);
    const cancelled = changeBookingStatus(legacy, 'cancelled', [], [null]);
    assert.equal(cancelled.ok, true);
    assert.deepEqual(cancelled.booking, { ...before, status: 'cancelled' });
    assert.deepEqual(legacy, before);
    assert.equal(changeBookingStatus(cancelled.booking, 'confirmed', dogs).ok, false);
  }
  for (const legacy of [null, { status: 'confirmed' }, { id: 'synthetic-legacy', status: 'pending' }]) assert.equal(changeBookingStatus(legacy, 'cancelled', []).ok, false);
});
test('supported years are 2000 through 2100 and invalid years never throw', () => {
  for (const year of ['0000', '0001', '1999', '2101', '9999']) {
    assert.deepEqual(resolveBookingTime(`${year}-01-01`, '10:00'), { ok: false, code: 'unsupported_year' });
    assert.deepEqual(scheduledInterval({ kind: 'training', date: `${year}-01-01`, startTime: '10:00', endTime: '11:00' }), { ok: false, code: 'unsupported_year' });
    assert.ok(codes(sample('private_training', { schedule: { kind: 'training', date: `${year}-01-01`, startTime: '10:00', endTime: '11:00' } })).includes('unsupported_year'));
  }
  assert.equal(resolveBookingTime('2000-01-01', '00:00').ok, true);
  assert.equal(resolveBookingTime('2100-12-31', '23:59').ok, true);
  assert.equal(resolveBookingTime('2100-02-29', '10:00').code, 'invalid_date');
  assert.ok(codes(sample('dog_boarding', { actualDeparture: { date: '2101-01-01', time: '10:00' } })).includes('unsupported_year'));
});
test('creation rejects reused IDs, including malformed rows; edit/restore exclude only explicit identity', () => {
  const booking = sample();
  for (const existing of [[booking], [{ id: booking.id, status: 'confirmed' }]]) {
    const result = evaluateBooking(booking, dogs, existing);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(issue => issue.code === 'duplicate_booking_id'));
  }
  assert.ok(findBookingConflicts(booking, [booking]).warnings.length);
  assert.equal(evaluateBookingEdit(booking, booking.id, dogs, [booking]).ok, true);
  assert.equal(evaluateBookingEdit({ ...booking, id: 'synthetic-renamed' }, booking.id, dogs, [booking]).ok, false);
  assert.equal(evaluateBookingEdit(booking, booking.id, dogs, [booking, booking]).ok, false);
  assert.equal(changeBookingStatus({ ...booking, status: 'cancelled' }, 'confirmed', dogs, [booking]).ok, true);
});
test('canonical boundary rejects unsupported legacy fields at every persisted object level', () => {
  for (const field of ['startDate', 'endDate', 'arrivalTime', 'departureTime', 'service']) {
    const result = evaluateBooking({ ...sample(), [field]: 'legacy-value' }, dogs);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(issue => issue.code === 'unexpected_booking_field'));
  }
  const booking = sample('dog_boarding');
  booking.schedule.checkIn.startDate = '2026-10-12';
  assert.ok(codes(booking).includes('unexpected_datetime_field'));
  assert.ok(codes(sample('private_training', { actualArrival: { date: '2026-10-12', time: '10:00', legacy: true } })).includes('unexpected_datetime_field'));
});
test('Board & Train does not create a training-appointment warning for a different dog', () => {
  const stay = sample('board_and_train', { id: 'synthetic-stay', dogId: dogs[1] });
  assert.deepEqual(findBookingConflicts(sample(), [stay]).warnings, []);
});
