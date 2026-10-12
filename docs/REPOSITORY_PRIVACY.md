# Repository privacy checks

This public repository must contain only synthetic client, dog, and booking data. Never access, copy, import, or connect to the separate desktop Hub or its database. This applies to source, fixtures, documentation, screenshots, logs, and manually entered demo records.

Before declaring development tasks complete and before committing, run:

```sh
npm run privacy
npm test
npx tsc --noEmit
git diff --check
```

`privacy:check` is an alias for `privacy`. Before a release, or when reviewing previously committed material, also run `npm run privacy:history`.

These are required manual workflow commands, not an enforced Git hook. No hook is installed. Review warnings as well as resolving failures.

## What the check does

The dependency-free Node script checks tracked working files, nonignored untracked files, and exact index content. A safe working copy cannot hide a staged violation. History mode additionally checks paths and file versions in all commits reachable from local Git refs, plus reachable commit/tag objects. Findings combine repeated path/category results across scopes and never print matched values or Git stderr.

Clear violations return exit code 1: prohibited database/export/credential/debug/private-capture paths, SQLite signatures, common credential patterns (including npm, JWT, Bearer, and restricted API tokens), literal credential assignments, and non-synthetic contacts in designated development-data locations. Execution failures return 2. Exit code 0 can still include manual-review findings.

Strict contact checks apply to all files under `src/data/`, `tests/fixtures/`, and `src/storage/migrations/`; directories named seed/seeds, synthetic, or fixtures; and source/data filenames containing seed, synthetic, or fixture. Email addresses must use exactly `example.com`. US phone numbers must use the 555-0100 through 555-0199 range, with an area code and optional US country code. Formatted, compact, and labeled phone values are checked. These path-based rules do not prove that names or free-text notes are fictional.

Elsewhere, non-example email addresses and non-reserved phone-like strings generate manual-review findings. Unknown JSON files and images/documents/archives outside approved asset directories also require review. Fixture/config paths still undergo secret detection. Placeholder credentials in `.env.example` are allowed; recognizable credentials are not.

## Exclusions and SQL migration source

Local private directories are anchored to the repository root: `/exports/`, `/data-exports/`, `/backups/`, `/local-data/`, `/private-data/`, `/captures/`, `/local-captures/`, `/local-screenshots/`, `/private-screenshots/`, `/recordings/`, `/debug-output/`, `/secrets/`, `/credentials/`, `/logs/`, and `/out/`. Legitimate nested directories such as `src/credentials/` and `src/logs/` remain trackable; nested JSON exports require human review and must not contain real data.

Database extensions (`.db`, `.sqlite`, `.sqlite3`), WAL/SHM/journal sidecars, tabular exports (`.csv`, `.tsv`, `.xls`, `.xlsx`, `.xlsm`), backups/dumps (`.bak`, `.backup`, `.dump`), JSON export forms (`.export.json`, `.jsonl`, `.ndjson`), temporary/debug files, environment files, and signing credentials are protected. The scanner matches terminal extensions, including numeric log rotations, so `k9.db.ts` and `app.log.ts` are valid source names. Ignore patterns cover numeric log rotations through three digits. Existing Expo and dependency/build exclusions remain in place. Ordinary source/configuration/synthetic-fixture JSON is not globally ignored.

SQL files are ignored and rejected everywhere except **`src/storage/migrations/`**, including its subdirectories. This exception is for reviewed versioned migration source only, never database exports or real data. Root rules explicitly reopen `src/`, `src/storage/`, and `src/storage/migrations/`. Migration files still undergo contact and secret scanning; the directory does not exempt unsafe content. The scanner probes migration trackability and reports ignored untracked SQL files there, so deeper/global/local ignore rules cannot silently hide them. It does not parse SQL to prove a file is a migration rather than a dump; reviewing SQL contents remains required.

Reviewed synthetic screenshots may remain in `docs/screenshots/`. Review visible names, contacts, notifications, background content, and metadata before staging. Local captures belong in the ignored root capture directories. Reviewed brand/dog assets under `assets/` are exempt from image warnings only, not content checks.

## Limitations and response

`.gitignore` cannot protect already tracked files. Inspect staged diffs and filenames alongside running the scanner. Avoid logging full forms, contact records, or database rows. A filename exception is not permission to add real data.

The scanner does not fetch remote refs, read the Hub, scan ignored local file content, inspect reflogs/unreachable Git objects, OCR images, unpack archives, or comprehensively identify obfuscated secrets and international contact formats. It checks ignored migration paths without reading their contents. Large/unsupported inputs or Git failures cause a safe failure rather than a clean result.

GitHub-side secret scanning and push-protection settings are not verified by these local commands. Pattern scanning and manual review complement each other; neither is a privacy certification.

If a violation is found, stop before committing/pushing and notify the owner without copying sensitive values. Do not delete evidence or rewrite history automatically. Credential rotation and history remediation require a separate approved response.

Tests in `tests/privacy.test.cjs` cover prohibited files, source-name regressions, root directory rules, synthetic contacts, migration staging and hidden-source detection, exact staged content, deleted historical files, redacted output, and exit codes. Disposable test repositories use only generated synthetic probes, never real credentials or contacts.
