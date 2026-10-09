# AGENTS.md — K9 Advocates Mobile

Guidance for AI coding assistants working in this repository.

K9 Advocates Mobile is an internal iPhone app for K9 Advocates LLC, built with Expo, React Native, and TypeScript. It is in early development. Prioritize mobile-first patterns, clear TypeScript, and native iPhone conventions.

## Project configuration

| Item | Value |
|---|---|
| Expo SDK | 57 |
| React Native | 0.86.3 |
| Language | TypeScript (`strict: true`, extends `expo/tsconfig.base`) |
| Package manager | npm (`package-lock.json`) |
| Entry point | `index.ts` (registers `App` with `registerRootComponent`) |
| Root component | `App.tsx` (active tab, search text, profile history, and selected calendar date) |
| Screens | `src/screens/` |
| Test runner | Node's built-in test runner (`npm test`) |
| Local testing | iPhone 16 Pro simulator with Expo Go |

## Current architecture

- `index.ts` registers the root component from `App.tsx`. `App.tsx` switches between the Dashboard, Dogs, Clients, and Calendar tabs with React state, using a bottom tab bar (`ScreenNavigation`) shared by every screen. It keeps a profile history so dog and client profiles can link to each other with a working back link, and the selected calendar date for the Daily Schedule. Switching tabs clears both. Tapping **Calendar** while already on the monthly calendar scrolls it to the top.
- No navigation library is installed. Expo Router is **not** used, and there is no `src/app/` directory. A navigation library has not been chosen yet. Do not add one or restructure folders unless the developer asks for it.

| Folder | Contents |
|---|---|
| `src/screens/` | `DashboardScreen`, `DogsScreen` and `ClientsScreen` (directories and search), `DogProfileScreen`, `ClientProfileScreen`, `CalendarScreen`, `DailyScheduleScreen` |
| `src/components/` | Shared UI: `CalendarMonth`, `ClientCard`, `DogAvatar`, `DogCard`, `Screen`, `ScreenNavigation` (bottom tab bar) |
| `src/data/dogRecords.ts` | The shared fictional dog records used by every screen. Each dog refers to its owner by `clientId`. |
| `src/data/clientRecords.ts` | The shared fictional client (owner) records with stable IDs, phone numbers, and emails |
| `src/data/bookings.ts` | Fictional bookings with fixed dates, which refer to dogs by ID. The single source for both the Dashboard and the Calendar. |
| `src/data/dogPhotos.ts` | Bundled dog photos (`assets/dogs/`) with source and license details |
| `src/data/dogs.ts` | Combines the dog records with their owners and photos for the screens |
| `src/logic/dogs.ts` | Pure search, filter, schedule, and preview functions |
| `src/logic/clients.ts` | Pure client search and dog/owner lookup functions |
| `src/logic/navigation.ts` | Pure profile history and Calendar tab reselection functions used by `App.tsx` |
| `src/logic/calendar.ts` | Pure date, month grid, and booking-per-date functions |
| `src/logic/schedule.ts` | Pure daily schedule functions shared by the Dashboard and the Daily Schedule |
| `src/theme.ts` | Brand colors, typography, spacing, and border radius |
| `tests/` | Automated tests for the data and logic; see `tests/README.md` |

- Keep `src/data/dogRecords.ts`, `src/data/clientRecords.ts`, `src/data/bookings.ts`, and `src/logic/` free of React Native imports. `npm test` compiles them with plain TypeScript outside the app, so platform code there would break the tests. Photos and other platform code belong in `src/data/dogs.ts` or the screens.
- Screens should get dog and client data from the shared records rather than defining their own copies. Store owner details only in the client records.
- Get schedule data for any screen from `src/data/bookings.ts` through `src/logic/schedule.ts`; do not add a separate schedule for one screen.
- Use `react-native-safe-area-context` for safe areas. React Native's built-in `SafeAreaView` is deprecated.
- Store booking dates as `YYYY-MM-DD` calendar dates and use the helpers in `src/logic/calendar.ts` for date calculations, so time zones and daylight saving cannot shift a booking. Booking end dates are inclusive.
- Fictional contact details must use the reserved 555-0100 to 555-0199 phone range and the `example.com` email domain.
- If tests need a new data or logic module, add it to the file list in `scripts/run-tests.cjs`. Add new test files to the same script.
- There is no backend, database, or authentication service yet. Do not add one without an explicit request.

## Expo version: verify, don't assume

Expo ships breaking changes with every SDK release. Before writing code that touches an Expo or React Native API:

1. Confirm the `expo` major version in `package.json` (currently 57).
2. Use the matching versioned docs: https://docs.expo.dev/versions/v57.0.0/
3. For anything else, start from https://docs.expo.dev/llms.txt and follow its links. Don't rely on memory.

## Commands

```bash
npm install                 # install dependencies from package-lock.json
npm run ios                 # start the dev server and open the iOS Simulator
npx expo start              # start the dev server
npx expo install <package>  # add packages; resolves SDK-compatible versions
npx tsc --noEmit            # type check
npm test                    # run the automated data and logic tests
npx expo-doctor             # diagnose dependency and config issues
```

- Always use `npx expo install` instead of `npm install <package>` to add Expo-compatible packages.
- Run `npx tsc --noEmit` and `npm test` before declaring a task done.
- The automated tests cover data and logic only. Check screen changes manually in the iOS Simulator.
- No linter is configured. Don't run or require linting unless a lint configuration is added.

## Rules

- **Expo Go compatibility:** Before adding a library with native code, verify whether it is supported by the installed Expo Go version. If the required native module is not included, explain that a development build will be necessary.
- **Native folders:** `ios/` and `android/` are not committed and are generated when needed. Never create or edit them by hand; configure native behavior in `app.json`.
- **Dependencies and configuration:** Don't add dependencies or change `package.json`, `app.json`, `tsconfig.json`, or `.gitignore` unless the task requires it, and explain the change.
- **Prefer Expo modules** over third-party libraries when one fits.

## Protected systems

- The existing **K9 Advocates desktop Hub** (Python/Streamlit) and its **SQLite database** are a separate project. Never read from, write to, modify, migrate, or connect to them from this repository. Any future connection will go through a secure backend that has not been designed yet.

## Public repository

This repository is public and used as a professional portfolio.

- Never commit real customer or dog data, credentials, API keys, tokens, `.env` files, production databases, or other secrets.
- Use only fictional client and dog data in code, tests, and examples.
- Use only approved K9 Advocates brand assets.

## Design direction

Follow the K9 Advocates brand identity (https://k9advocatesnj.com): warm cream, charcoal, and muted gold tones, elegant typography, a premium feel, and native iPhone navigation and layouts.
