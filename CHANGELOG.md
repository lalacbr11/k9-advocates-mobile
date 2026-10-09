# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.3.0] - 2026-10-09 — Clients & Owners

### Added
- Clients tab with a Clients Directory of six fictional clients and search by client name.
- Read-only client profiles with phone, email, and linked dogs.
- Links from a dog's profile to its owner and from a client's profile to each of their dogs, with back links that name the previous screen.
- Seven automated tests for clients and profile navigation (13 in total).
- QA record for Clients & Owners (`docs/qa/v0.3-clients-owners-qa.md`).
- Clients Directory and client profile screenshots (`docs/screenshots/clients-directory-v0.3.png`, `docs/screenshots/client-profile-morgan-v0.3.png`) shown in the README App Preview.
- Calendar milestone added to the README roadmap.

### Changed
- Owner details moved out of the dog records into shared client records with stable IDs (`src/data/clientRecords.ts`). Dogs refer to their owner by `clientId`.
- App version updated to 0.3.0 in `app.json`, `package.json`, and `package-lock.json`.
- `AGENTS.md`, `tests/README.md`, and the README updated for the Clients feature.

## [0.2.0] - 2026-10-09 — Dogs Directory

### Added
- Dashboard and Dogs navigation.
- Dogs Directory with six fictional dog records and search by dog name.
- Read-only dog profiles with owner, breed, age, weight, sex, service, and care notes.
- Reusable `DogAvatar` component with circular photos (56 points in the directory, 112 points on profiles) and an initials fallback for dogs without a photo.
- Five locally bundled Pexels dog photos, with photographer, source, and license details in `src/data/dogPhotos.ts` and a Photo Credits section in the README.
- QA record for the Dogs Directory (`docs/qa/v0.2-dogs-directory-qa.md`).
- Dogs Directory screenshot (`docs/screenshots/dogs-directory-v0.2.png`) shown in the README App Preview.
- Six automated tests for the shared dog data and logic, run with `npm test` (instructions in `tests/README.md`). No new dependencies.

### Changed
- Dashboard moved from `App.tsx` into its own screen file (`src/screens/DashboardScreen.tsx`).
- Dashboard and Dogs Directory now use the same shared fictional dog records (`src/data/dogRecords.ts`). Arrivals and departures refer to dogs by ID, and the "more dogs" count is calculated.
- Search, filter, schedule, and preview logic separated from photo handling (`src/logic/dogs.ts`).
- App version updated to 0.2.0 in `app.json`, `package.json`, and `package-lock.json`.
- README updated with the current prototype features and v0.2 status.
- `AGENTS.md` updated for the multi-screen structure, shared data and logic modules, and `npm test`.

## [0.1.0] - 2026-10-09 — Initial Development

### Added
- Repository initialized with a .gitignore.
- README with the project overview, selected technology stack, planned features, development approach, data and privacy policy, and license and brand ownership statement.
- CHANGELOG and development log (`docs/DEVELOPMENT_LOG.md`).
- Expo project scaffolded with React Native and TypeScript (Expo SDK 57, React Native 0.86).
- Dark-themed placeholder welcome screen (`App.tsx`) displaying the K9 Advocates name.
- Brand theme tokens (`src/theme.ts`) for colors, typography, spacing, and border radius.
- Dashboard prototype with fictional sample data: service counts, arrivals and departures, scheduled dogs, and service filters.
- README App Preview section with the v0.1 dashboard screenshot.

### Changed
- README Development Approach section revised to describe AI-assisted development in neutral terms.
- `.gitignore` updated to exclude local Expo files, macOS system files, local AI assistant configuration, and native build outputs.
- `.gitignore` updated to exclude Apple signing credentials, provisioning profiles, and EAS local signing configuration.
- Placeholder welcome screen replaced by the dashboard prototype.
