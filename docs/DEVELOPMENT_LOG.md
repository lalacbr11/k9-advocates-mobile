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
**Commit:** Not yet committed

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
- **Brand palette (resolved in this session, pending commit):** The placeholder welcome screen colors were replaced by the dashboard, which uses the brand palette defined in `src/theme.ts`.
- **iOS signing files (resolved in this session, pending commit):** `.gitignore` now excludes Apple signing credentials and provisioning profiles (`*.p8`, `*.p12`, `*.pfx`, `*.key`, `*.mobileprovision`, `*.provisionprofile`) and the EAS local signing configuration (`credentials.json`).
- **Visual refinements (open):** Possible visual refinements to the approved compact layout.

### Not Yet Decided
- Backend architecture
- Cloud database provider
- Authentication service
