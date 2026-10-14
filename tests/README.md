# Automated tests

From a fresh checkout, install the locked dependencies and run:

```sh
npm ci
npm test
npx tsc --noEmit
```

Use Node.js 22.13 or newer, matching Expo SDK 57's minimum Node version.
The suite uses Node's built-in test runner and the project's existing TypeScript
compiler. No additional test dependencies or simulator are required.

`npm test` compiles the platform-independent shared dog and client records,
bookings, search/filter/preview logic, client relationships, profile navigation,
calendar logic, and daily schedule logic into a temporary directory, runs the tests, and removes the
temporary output. A compilation or test failure exits nonzero.

| File | Covers |
|---|---|
| `dogs.test.cjs` | Dog search, service filters, dog records, the ID-based movement resolver, scheduled-dogs preview |
| `clients.test.cjs` | Client search, client records, dog/owner relationships, profile navigation history, Calendar tab reselection |
| `calendar.test.cjs` | Calendar dates, month grids, booking date ranges, arrival/continuing-stay/departure details, booking records |
| `schedule.test.cjs` | Daily schedule shared by the Dashboard and Calendar: scheduled dogs, arrivals and departures, empty days, stable-ID grouping, multiple/overlapping bookings, same-name dogs, filter counts |

These tests cover data and pure logic. They do not verify native rendering,
navigation gestures, keyboard behavior, photo loading, or accessibility. Manual
simulator evidence is recorded in the QA records in `docs/qa/`.

Repository privacy checks run with `npm run privacy` before completion and commits and
`npm run privacy:history` for reachable Git history. See
[repository privacy guidance](../docs/REPOSITORY_PRIVACY.md) for scope and limitations.
`npm test` also runs `privacy.test.cjs`, covering detection, ignore rules, staged
content, historical violations, redacted output, migration trackability, exact filename
extensions, root directory exclusions, and strict synthetic contact checks.

`booking-domain.test.cjs` covers the v0.5 domain:
six service codes, dashboard grouping, service-specific scheduling, synthetic dog
IDs, statuses, actual movements, conflict warnings, half-open interval boundaries,
and New York daylight-saving behavior. Times use `HH:mm`. Ambiguous fall-back
times return `ambiguous_time` pending an approved disambiguation policy; nonexistent
spring-forward times return `nonexistent_time`. The v0.4 fixtures and existing pure schedule selectors remain unchanged.
The v0.5 UI uses a temporary session adapter for those selectors.

The canonical booking boundary rejects unsupported top-level, schedule, and local
date/time fields rather than copying legacy fields into new bookings. Use
`evaluateBooking` for creation (duplicate IDs fail), `evaluateBookingEdit` with the
original stable ID for edits, and `changeBookingStatus` for cancellation/restore.
Edits and restores can exclude one matching existing record; multiple matches fail.
Pass the full existing collection for reliable duplicate-ID and conflict detection.

Conflict reports separate `warnings`, `invalidRecords` (indices/optional IDs and
structured validation issues), and `candidateErrors`. Malformed existing records
are reported and skipped; they cannot block other valid warnings. Evaluations pass
known dog IDs to check relationships; standalone conflict checks need that optional
context to detect unavailable dogs. Invalid records are not proof of availability.

Cancellation requires only a stable ID and a Confirmed → Cancelled transition and
preserves legacy data without asserting it is canonical. Restoration requires full
canonical validation and conflict checking. Supported years are 2000–2100 inclusive;
time and interval resolution return structured errors for unsupported years and
DST gaps/folds. Early departure retains scheduled conflicts; Board & Train stays
do not count as training appointments.

`booking-form.test.cjs` covers New York/default Calendar dates, six service
schedules, required fields, arbitrary-minute picker carriers, DST rejection,
conflict acknowledgement and invalidation, incomplete checks, duplicate IDs,
separate notes, dirty forms, fixture conversion, shared schedule projection, and
dog/owner search. It does not replace simulator verification of the bottom sheet,
wheel gestures, keyboard avoidance, safe areas, discard prompt, or return navigation.
The test runner compiles `bookingForm.ts` without React Native imports.
