# K9 Advocates Mobile

An internal iPhone app for **K9 Advocates LLC**, a dog training, boarding, and daycare business. The app is designed for the business's administrators and is being developed as a public software development and QA portfolio project.

> **Project status: Early development (v0.3).** Project planning began on October 9, 2026. A prototype with a dashboard, a Dogs Directory, and a Clients Directory runs in the iOS Simulator using fictional sample data. It is not yet connected to a backend or real data, and records cannot be added or edited. All other features below are planned.

## App Preview

<p align="center">
  <img src="docs/screenshots/dashboard-v0.1.png" alt="K9 Advocates Mobile v0.1 dashboard prototype showing today's service counts, arrivals and departures, and scheduled dogs" width="240">
  <img src="docs/screenshots/dogs-directory-v0.2.png" alt="K9 Advocates Mobile v0.2 Dogs Directory with six fictional records, circular photos, and name search" width="240">
</p>

<p align="center">
  <img src="docs/screenshots/clients-directory-v0.3.png" alt="K9 Advocates Mobile v0.3 Clients Directory with fictional clients and name search" width="240">
  <img src="docs/screenshots/client-profile-morgan-v0.3.png" alt="K9 Advocates Mobile v0.3 Morgan Ellis client profile with fictional contact details and linked dog Atlas" width="240">
</p>

<p align="center"><em>Dashboard v0.1, Dogs Directory v0.2, and Clients Directory and profile v0.3 on the iPhone 16 Pro simulator. All client and dog data shown is fictional sample data.</em></p>

## Current Prototype

- **Dashboard (v0.1):** today's service counts, arrivals and departures, scheduled dogs, and service filters.
- **Dogs Directory (v0.2):** six fictional dogs, search by dog name, and read-only dog profiles with circular photos. Dogs without a photo show their initial.
- **Clients Directory (v0.3):** six fictional clients, search by client name, and read-only client profiles with phone, email, and linked dogs.
- **Dog and owner links (v0.3):** a dog's profile links to its owner, and a client's profile links to each of their dogs.
- **Navigation:** switch between Dashboard, Dogs, and Clients.

## Technology

| Area | Selection | Status |
|---|---|---|
| Framework | React Native | Selected |
| Toolchain | Expo | Selected (SDK 57) |
| Language | TypeScript | Selected |
| Backend architecture | — | Not yet decided |
| Cloud database | — | Not yet decided |
| Authentication service | — | Not yet decided |

## Planned Features

| Feature | Status |
|---|---|
| Administrator authentication | PLANNED |
| Business dashboard | IN PROGRESS (v0.1 prototype with sample data) |
| Client and dog profiles | IN PROGRESS (read-only dog profiles in v0.2 and client profiles in v0.3, with sample data) |
| Booking calendar | PLANNED (next milestone; see [Roadmap](#roadmap)) |
| Boarding, daycare, and training management | PLANNED |
| Payments and tips | PLANNED |
| Website inquiry management | PLANNED |
| Synchronization with the K9 Advocates desktop Hub | PLANNED (future) |
| Apple Calendar integration | PLANNED (future) |
| Quo integration | Possible future feature (not in initial MVP) |
| Customer portal | Possible later phase |

## Roadmap

**Next milestone: Calendar** (planned, not started)

- A dedicated Calendar tab.
- A vertically scrolling monthly booking calendar.
- Days with bookings highlighted.
- Tap a date to see every dog scheduled that day, including overnight stays, arrivals, and departures.
- Later: boarding-capacity indicators and website booking integration.

The existing K9 Advocates desktop Hub (Python/Streamlit with SQLite) is a separate project. Any future connection to it would go through a secure backend.

## Design Direction

The app will follow the existing K9 Advocates brand identity: warm cream, charcoal, and muted gold tones, elegant typography, and German Shepherd imagery, presented through native iPhone navigation and mobile-friendly layouts.

## Setup

Running the app on the iOS Simulator requires a Mac with Xcode installed, plus Node.js and npm.

```bash
git clone https://github.com/lalacbr11/k9-advocates-mobile.git
cd k9-advocates-mobile
npm install
npm run ios
```

`npm run ios` starts the Expo development server and opens the app in the iOS Simulator using Expo Go.

## Screenshots

See [App Preview](#app-preview) for genuine iPhone 16 Pro simulator captures of the dashboard, Dogs Directory, Clients Directory, and a client profile.

## Development Approach

This project is developed and maintained by **Laura Neugebauer**, using AI-assisted development and documentation.

AI tools support planning, coding, troubleshooting, and QA documentation. Laura directs the project, makes development decisions, and reviews and verifies the work.

## Data and Privacy

This repository is public. It does not contain, and must never contain, real customer information, production databases, credentials, API keys, or other secrets. All examples and test data are fictional.

## Documentation

- [CHANGELOG.md](CHANGELOG.md): notable changes and milestones
- [docs/DEVELOPMENT_LOG.md](docs/DEVELOPMENT_LOG.md): development history and technical decisions
- [docs/qa/](docs/qa/): QA test records
- [tests/README.md](tests/README.md): how to run the automated tests (`npm test`)

## Photo Credits

The dog photos represent fictional dogs only and do not show actual K9 Advocates clients. They are from [Pexels](https://www.pexels.com/) and used under the [Pexels License](https://www.pexels.com/license/). Credits are given voluntarily and do not imply endorsement by the photographers.

| Fictional dog | Photographer | Source |
|---|---|---|
| Atlas | Nano Erdozain | [Pexels](https://www.pexels.com/photo/close-up-of-a-german-shepherd-dog-18058222/) |
| Willow | Eduardo López | [Pexels](https://www.pexels.com/photo/portrait-of-black-labrador-retriever-16618519/) |
| Finn | Jay's Photography | [Pexels](https://www.pexels.com/photo/border-collie-in-black-and-white-16471124/) |
| Hazel | Zach Ward | [Pexels](https://www.pexels.com/photo/portrait-of-golden-retriever-16876004/) |
| Otis | JacLou- DL | [Pexels](https://www.pexels.com/photo/happy-brown-standard-poodle-in-green-field-34265054/) |

## License and Brand Ownership

No software license has been granted. K9 Advocates LLC retains its rights to the business name, logo, and original branded assets. Third-party images and other materials remain subject to their respective licenses.
