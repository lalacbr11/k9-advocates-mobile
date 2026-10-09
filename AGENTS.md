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
| Current screen | `App.tsx` |
| Local testing | iPhone 16 Pro simulator with Expo Go |

## Current architecture

- The app is a single screen. `index.ts` registers the root component from `App.tsx`.
- No navigation library is installed. Expo Router is **not** used, and there is no `src/app/` directory.
- Navigation architecture will be decided when multiple screens are implemented. Do not add a navigation library or restructure folders unless the developer asks for it.
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
npx expo-doctor             # diagnose dependency and config issues
```

- Always use `npx expo install` instead of `npm install <package>` to add Expo-compatible packages.
- Run `npx tsc --noEmit` before declaring a task done.
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
