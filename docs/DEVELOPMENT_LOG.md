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
