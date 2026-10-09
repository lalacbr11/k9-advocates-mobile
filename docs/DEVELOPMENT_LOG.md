# Development Log

A record of development sessions, technical decisions, challenges, and solutions for K9 Advocates Mobile.

## Project Roles

| Role | Contributor |
|---|---|
| Project developer and decision-maker | Laura Neugebauer |
| Business stakeholder | K9 Advocates LLC |

This project uses AI-assisted development and documentation. AI tools support planning, coding, troubleshooting, QA, and documentation. Laura directs the project, makes development decisions, and reviews and verifies the work.

---

## 2026-10-09 — Project Kickoff and Documentation Setup

**Milestone:** Project planning

### Work Completed
- Officially started the K9 Advocates Mobile project.
- Reviewed the initial repository contents (README.md and .gitignore).
- Established the documentation workflow and initial documentation structure.
- Drafted the README with AI assistance. Laura reviewed it, approved it with two edits (clarifying that application development has not yet started, and refining the license and brand ownership statement), and committed it.
- Drafted the CHANGELOG and this development log.

### Decisions
| Decision | Detail |
|---|---|
| Technology stack | React Native, Expo, and TypeScript selected (see rationale below). |
| Repository visibility | Public, for portfolio purposes. Real customer data, production databases, credentials, and secrets must never be committed. |
| License | No software license granted for now; may be reconsidered later. |
| Brand ownership | K9 Advocates LLC retains its rights to the business name, logo, and original branded assets. Third-party materials remain subject to their own licenses. |
| Branding | The app will use K9 Advocates LLC's existing logo, website colors, and German Shepherd imagery, through approved brand assets only. |
| Test data | Only fictional client and dog data will be used in public documentation and examples. |
| Quo integration | A possible future feature, not part of the initial MVP. |
| Project scope | The mobile app is separate from the existing desktop K9 Advocates Hub, which began earlier. The desktop Hub and its SQLite database must remain untouched. |

### Technology Stack Rationale
The goal is to build a real iPhone application with a native mobile experience.

- **React Native** allows mobile interfaces to be built using JavaScript and React concepts.
- **Expo** simplifies development and testing, and will eventually simplify building the app for iOS.
- **TypeScript** provides static type checking to help catch mistakes during development.

The stack was also chosen to support Laura's continued learning and professional portfolio development.

### Not Yet Decided
- Backend architecture
- Cloud database provider
- Authentication service
- Expo SDK version

### Testing
None. No application code exists yet.

### Known Issues
None.

### Pending Setup Tasks
- Update `.gitignore` when the Expo project is initialized, so that generated files, local configuration, secrets, and other files that should not be committed are excluded.

### Next Steps
**Next milestone: K9 Advocates Mobile Dashboard v0.1**

- Define the initial MVP screens.
- Design the mobile dashboard using the existing K9 Advocates website branding.
- Initialize the React Native, Expo, and TypeScript project.
- Test the app on an iPhone using Expo Go, if it's compatible with the selected SDK and features.
- Begin implementing the first dashboard components.

---

## 2026-10-09 — v0.1 Initial Development: Project Setup and First Launch

**Milestone:** v0.1 — Initial Development
**Commit:** `4a23a45`

### Work Completed
- Initialized the React Native project with Expo and TypeScript.
- Configured the local development environment, including installing Xcode and setting up the iPhone 16 Pro simulator.
- Created a dark-themed placeholder welcome screen in `App.tsx` showing "K9 ADVOCATES", "Mobile Management", and a welcome message.
- Updated `.gitignore` to exclude local Expo files (`.expo/`, `.expo-shared/`), macOS system files, local AI assistant configuration, and native build outputs (`ios/Pods/`, `android/.gradle/`). This completes the pending setup task from the kickoff session.
- Committed and pushed the working project to GitHub.

### Files Added or Changed
- Added: `App.tsx`, `index.ts`, `app.json`, `package.json`, `package-lock.json`, `tsconfig.json`, `assets/`, `AGENTS.md`, `LICENSE`
- Changed: `.gitignore`

### Decisions
| Decision | Detail |
|---|---|
| Expo SDK | SDK 57, as installed by the project template (`expo ~57.0.27`, `react-native 0.86.3`, `react 19.2.3`, `typescript ~6.0.3`). |
| App entry point | Single-screen `App.tsx` for the initial launch. Navigation has not been introduced yet. |
| Local testing | iOS Simulator (iPhone 16 Pro) with Expo Go. |

### Testing
| Test | Environment | Result |
|---|---|---|
| Launch the app and display the welcome screen | Expo Go, iPhone 16 Pro simulator | Passed: the app launched and the welcome screen displayed |

Testing was manual. No automated tests, linting, or type checking were recorded for this session.

### Known Issues
None recorded.

### Open Items
- **License (resolved in `1f8f524`):** A `LICENSE` file was committed with the Expo project template and appeared to conflict with the README statement that no software license has been granted. The Expo template `LICENSE` was removed.
- **AGENTS.md (resolved in `1f8f524`):** `AGENTS.md`, an AI coding-assistant guidance file from the Expo template, was committed. Its guidance on Expo Router and the `src/app/` structure did not match the single-file `App.tsx` setup. It was updated to reflect the actual project structure.
- **App name and version (resolved in `1f8f524`):** The app name and version in `app.json` and `package.json` were the template values (`k9-mobile-starter`, `1.0.0`). They were corrected to K9 Advocates Mobile v0.1.0.
- **Interface style (resolved in `1f8f524`):** `app.json` set `userInterfaceStyle` to `light`, while the welcome screen uses a dark theme. It was set to `dark`.
- **iOS signing files (open):** `.gitignore` does not yet exclude iOS signing and credential files (for example `*.p8`, `*.p12`, `*.mobileprovision`). Address this before the first build is created.
- **Brand palette (open):** The welcome screen uses placeholder grays, not the K9 Advocates brand palette (warm cream, charcoal, muted gold). Replace them with the approved brand palette; brand styling is planned for the dashboard milestone.

### Not Yet Decided
- Backend architecture
- Cloud database provider
- Authentication service

### Next Steps
**Next milestone: Design and implement the first K9 Advocates Mobile dashboard.**

---

## 2026-10-09 — v0.1 Dashboard Prototype

**Milestone:** v0.1 — Dashboard
**Commit:** `3050c70`

### Work Completed
- Codex created `src/theme.ts` with brand tokens inspired by the K9 Advocates website: colors, typography, spacing, and border radius.
- Codex replaced the placeholder welcome screen in `App.tsx` with a working dashboard prototype that uses fictional sample data.
- The dashboard shows service counts, arrivals and departures, scheduled dogs, and service filters that work.
- Nina, the business stakeholder, asked for the most important daily information to fit on the first iPhone screen without scrolling.
- Codex made the layout more compact and checked it in the iPhone 16 Pro simulator.
- Nina approved the compact layout.

### Files Added or Changed
- Added: `src/theme.ts`
- Changed: `App.tsx`, `.gitignore`

### Decisions
| Decision | Detail |
|---|---|
| Dashboard layout | The compact layout is approved for v0.1. Visual refinements may follow later. |
| Layout trade-off | Laura preferred the more spacious original design but approved the compact version because it better supports daily operations. |
| Theme tokens | Brand colors, typography, spacing, and border radius are defined in one place, `src/theme.ts`. |
| Sample data | The dashboard uses fictional sample data only. |

### Testing
| Test | Environment | Result |
|---|---|---|
| Type check (`npx tsc --noEmit`) | Local | Passed |
| Compact layout fits the most important daily information on the first screen without scrolling | Expo Go, iPhone 16 Pro simulator | Passed: checked by Codex and approved by Nina |

Testing was manual, except for the type check. No automated tests were recorded for this session.

### Known Issues
None recorded.

### Open Items
- **Brand palette (resolved in `3050c70`):** The placeholder welcome screen colors were replaced by the dashboard, which uses the brand palette defined in `src/theme.ts`.
- **iOS signing files (resolved in `3050c70`):** `.gitignore` now excludes Apple signing credentials and provisioning profiles (`*.p8`, `*.p12`, `*.pfx`, `*.key`, `*.mobileprovision`, `*.provisionprofile`) and the EAS local signing configuration (`credentials.json`).
- **Visual refinements (open):** Possible visual refinements to the approved compact layout.

### Not Yet Decided
- Backend architecture
- Cloud database provider
- Authentication service

---

## 2026-10-09 — v0.2 Dogs Directory

**Milestone:** v0.2 — Dogs Directory
**Commit:** Not yet committed

### Work Completed
- Added Dashboard and Dogs navigation at the top of each screen. Switching tabs keeps the dashboard mounted, so its filter and scroll position are preserved. No navigation library was added.
- Moved the dashboard out of `App.tsx` into `src/screens/DashboardScreen.tsx`. `App.tsx` now manages the active tab, the search text, and the selected dog.
- Added a Dogs Directory with six fictional dog records, each with a fictional owner.
- Added search by dog name. Matching ignores case and leading or trailing spaces, and matches part of a name. An empty state is shown when no dogs match.
- Added individual dog profiles showing owner, breed, age, weight, sex, service, and care notes, with a back link to the directory.
- Added a reusable `DogAvatar` component. It shows circular photos at 56 points in the directory and 112 points on profiles.
- Bundled five Pexels photos locally in `assets/dogs/`. Cleo intentionally has no photo and shows her initial instead. The avatar also falls back to the initial if a photo fails to load.
- Recorded each photo's photographer, Pexels source URL, license URL, and retrieval date in `src/data/dogPhotos.ts`.
- Codex moved the dashboard onto the shared dog records in `src/data/dogs.ts`, including each dog's schedule text, so the dashboard and directory use one list.
- Codex updated the app version to `0.2.0` in `app.json`, `package.json`, and `package-lock.json`.
- Added an iPhone 16 Pro simulator screenshot of the Dogs Directory (`docs/screenshots/dogs-directory-v0.2.png`) and showed it in the README next to the dashboard screenshot.
- Codex changed the dashboard's arrivals and departures to refer to the shared dog records by ID (`src/data/dashboard.ts`), and the "more dogs" count is now calculated.
- Codex separated the fictional dog records (`src/data/dogRecords.ts`) and the search, filter, schedule, and preview logic (`src/logic/dogs.ts`) from photo handling. `src/data/dogs.ts` attaches the bundled photos to the records.
- Codex added six automated tests (`tests/dogs.test.cjs`) for the shared data and logic, run with `npm test`. Instructions are in `tests/README.md`. No new dependencies were added.

### Files Added or Changed
- Added: `src/screens/DashboardScreen.tsx`, `src/screens/DogsScreen.tsx`, `src/screens/DogProfileScreen.tsx`, `src/components/DogAvatar.tsx`, `src/components/DogCard.tsx`, `src/components/Screen.tsx`, `src/components/ScreenNavigation.tsx`, `src/data/dogs.ts`, `src/data/dogRecords.ts`, `src/data/dashboard.ts`, `src/data/dogPhotos.ts`, `src/logic/dogs.ts`, `assets/dogs/` (five JPEG photos), `scripts/run-tests.cjs`, `tests/dogs.test.cjs`, `tests/README.md`, `docs/screenshots/dogs-directory-v0.2.png`, `docs/qa/v0.2-dogs-directory-qa.md`
- Changed: `App.tsx`, `app.json`, `package.json` (version and `test` script), `package-lock.json`, `AGENTS.md`, `README.md`, `CHANGELOG.md`, `docs/DEVELOPMENT_LOG.md`

### Decisions
| Decision | Detail |
|---|---|
| Navigation | Two-tab navigation is handled with React state in `App.tsx`. Choosing a navigation library is still deferred until more screens are needed. |
| Shared sample data | The dashboard and the Dogs Directory read the same fictional dog records from `src/data/dogRecords.ts`. Arrivals and departures refer to dogs by ID. |
| Logic separated from photos | Records and logic do not depend on React Native, so they can be tested without a simulator. Photos are attached separately in `src/data/dogs.ts`. |
| Automated tests | Tests use Node's built-in test runner and the project's existing TypeScript compiler, so no test dependencies were added. They cover data and logic only, not screens, navigation, photos, or accessibility. |
| Dog photos | Stock photos from Pexels represent fictional dogs only. They are bundled with the app, not loaded from the internet. |
| Photo credits | Pexels does not require attribution, but photographer credits and source links are kept voluntarily. |
| Missing photos | Dogs without a photo show their initial in a gold-bordered circle. |

### Testing
Full test steps, results, and evidence types are in [docs/qa/v0.2-dogs-directory-qa.md](qa/v0.2-dogs-directory-qa.md).

| Test | Environment | Result |
|---|---|---|
| Open the Dogs Directory from the navigation | iPhone 16 Pro simulator, iOS 18.6 | Passed |
| Open Atlas's profile | iPhone 16 Pro simulator, iOS 18.6 | Passed |
| Search "at" returns only Atlas | iPhone 16 Pro simulator, iOS 18.6 | Passed |
| Clearing the search restores all six dogs | iPhone 16 Pro simulator, iOS 18.6 | Passed |
| Visual review of directory photos | iPhone 16 Pro simulator, iOS 18.6 | Passed: reviewed and approved |
| Cleo's initials avatar | iPhone 16 Pro simulator, iOS 18.6 | Passed: confirmed by screenshot |
| Search "zzzzz" shows zero dogs and "No dogs found" | iPhone 16 Pro simulator, iOS 18.6 | Passed: confirmed by screenshot |
| Final navigation and dashboard filter checks | iPhone 16 Pro simulator, iOS 18.6 | Passed: reported by the project owner |
| Dashboard regression after the final refactor: arrivals and departures (Hazel, Cleo, Willow), six scheduled dogs, and "3 more dogs" | iPhone 16 Pro simulator, iOS 18.6 | Passed: observed by the project owner |
| TypeScript, whitespace, asset, version alignment, search, shared-data, schedule-text, and mocked navigation checks | Local | Passed, as reported by Codex (earlier checks, not saved in the repository) |
| Automated test suite (`npm test`, six tests) | Local, Node.js 24.14.1 | Passed: 6 of 6, reported by Codex and re-run during documentation review |
| Type check (`npx tsc --noEmit`) and `git diff --check` | Local | Passed, reported by Codex and re-run during documentation review |
| Sensitive-file and common-secret scans | Local | No matches, as reported by Codex |
| Atlas's 112-point profile portrait | iPhone 16 Pro simulator | Passed, as reported by Codex |

Simulator testing was manual. The saved automated tests cover data and logic only; they do not test screens in the simulator. VoiceOver, physical-device testing, and other scenarios listed in the QA record were not tested.

### Known Issues
None recorded.

### Open Items
- **App version (resolved in this session, pending commit):** `app.json`, `package.json`, and `package-lock.json` now show version `0.2.0`.
- **Duplicate sample data (resolved in this session, pending commit):** The dashboard now uses the shared records in `src/data/dogs.ts` instead of its own copy.
- **Screenshot (resolved in this session, pending commit):** The README now shows the Dogs Directory screenshot alongside the dashboard screenshot.
- **Dashboard regression after refactor (resolved in this session, pending commit):** The project owner checked the dashboard in the simulator after the final refactor; it passed (TC-09 in the QA record).
- **AGENTS.md (resolved in this session, pending commit):** Updated for the multi-screen structure, the shared data and logic modules, and `npm test`.
- **Untested scenarios (open):** VoiceOver, physical-device testing, a manual re-check of the Dogs Directory and profiles after the final refactor, and the other scenarios listed as not tested in the QA record.
- **Arrivals and departures data (resolved in this session, pending commit):** Arrivals and departures now refer to the shared dog records by ID, and the "more dogs" count is calculated instead of fixed.
- **Automated checks (resolved in this session, pending commit):** Six automated tests are saved in `tests/dogs.test.cjs` and can be re-run with `npm test`.
- **Visual refinements (open):** Carried over from v0.1.

### Not Yet Decided
- Navigation library
- Backend architecture
- Cloud database provider
- Authentication service
