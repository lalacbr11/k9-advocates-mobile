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

`npm test` compiles the platform-independent shared dog and client records, demo
schedule, search/filter/preview logic, client relationships, and profile
navigation history into a temporary directory, runs the tests, and removes the
temporary output. A compilation or test failure exits nonzero.

| File | Covers |
|---|---|
| `dogs.test.cjs` | Dog search, service filters, dog records, arrivals and departures, scheduled-dogs preview |
| `clients.test.cjs` | Client search, client records, dog/owner relationships, profile navigation history |

These tests cover data and pure logic. They do not verify native rendering,
navigation gestures, keyboard behavior, photo loading, or accessibility. Manual
simulator evidence remains in `docs/qa/v0.2-dogs-directory-qa.md`.
