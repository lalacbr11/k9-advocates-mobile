const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { inspect } = require('../scripts/check-privacy.cjs');
const root = path.resolve(__dirname, '..');
const scan = (file, text = '') => inspect(file, Buffer.from(text));

test('database, sidecar, export, credential and private capture paths fail', () => {
  for (const file of ['local.DB', 'local.sqlite3', 'local.sqlite-wal', 'local.db-shm', 'local.db-journal', 'backup.dump', 'records.CSV', 'records.XLSX', 'records.export.json', 'exports/records.json', '.env.local', 'credentials.json', 'signing.pem', 'local-captures/photo.png']) {
    assert.ok(scan(file).errors.length, `Expected blocked path: ${file}`);
  }
  assert.ok(scan('disguised.txt', 'SQLite format 3\0').errors.length);
});
test('normal JSON and approved synthetic contacts are allowed without disabling secret detection', () => {
  for (const file of ['package.json', 'app.json', 'tests/fixtures/synthetic.json']) assert.deepEqual(scan(file, '{}'), { errors: [], warnings: [] });
  assert.equal(scan('src/data/clientRecords.ts', "email: 'demo@example.com', phone: '(201) 555-0101'").errors.length, 0);
  assert.ok(scan('src/data/clientRecords.ts', "phone: '(201) 555-0200'").errors.length);
  const fake = 'gh' + 'p_' + 'A'.repeat(36);
  assert.ok(scan('tests/fixtures/synthetic.json', fake).errors.length);
  assert.ok(scan('.env.example', 'API_KEY="' + 'Z'.repeat(24) + '"').errors.length);
  assert.equal(scan('.env.example', 'API_KEY="YOUR_API_KEY"').errors.length, 0);
});
test('common credential detectors reject synthetic pattern probes without returning values', () => {
  const probes = [
    '-----BEGIN ' + 'PRIVATE KEY-----',
    'AK' + 'IA' + 'A'.repeat(16),
    'sk_' + 'live_' + 'A'.repeat(20),
    'xox' + 'b-' + 'A'.repeat(24),
    'https://' + 'user:syntheticpassword@host.invalid',
    'password="' + 'syntheticpassword' + '"',
    'npm_' + 'A'.repeat(36),
    'eyJ' + 'A'.repeat(12) + '.' + 'B'.repeat(12) + '.' + 'C'.repeat(12),
    'Bearer ' + 'D'.repeat(24),
    'rk_' + 'live_' + 'E'.repeat(24),
  ];
  for (const probe of probes) {
    const result = scan('sample.txt', probe);
    assert.ok(result.errors.length);
    assert.ok(!JSON.stringify(result).includes(probe));
  }
});
test('manual review findings do not become clear violations', () => {
  assert.ok(scan('docs/screenshots/demo.png').warnings.length);
  assert.equal(scan('docs/screenshots/demo.png').errors.length, 0);
  assert.ok(scan('data/unknown.json', '{}').warnings.length);
  assert.ok(scan('notes.md', 'review@synthetic.invalid').warnings.length);
  assert.equal(scan('notes.md', '1791800000').warnings.length, 0);
});
test('ignore rules exclude private artifacts while preserving source JSON and reviewed screenshots', () => {
  const ignored = ['sample.db', 'sample.sqlite-wal', 'sample.sqlite3-shm', 'sample.db-journal', 'exports/sample.json', 'sample.csv', 'sample.xlsx', '.env.local', 'local-captures/photo.png', 'signing.pem', 'exports/backup.sql', 'backup.SQL', 'secrets/key.txt', 'credentials/config.json', 'logs/debug.txt', 'out/result.json'];
  for (const file of ignored) {
    const result = spawnSync('git', ['check-ignore', '--no-index', '-q', file], { cwd: root });
    assert.equal(result.status, 0, `Expected ignored path: ${file}`);
  }
  for (const file of ['app.json', 'package.json', 'tests/fixtures/synthetic.json', 'src/data/example.json', 'docs/screenshots/demo.png', '.env.example', 'src/storage/migrations/001_initial.sql', 'src/storage/migrations/nested/002_index.SQL', 'src/k9.db.ts', 'src/app.log.ts', 'src/app.log.1.ts', 'src/secrets/helpers.ts', 'src/credentials/types.ts', 'src/logs/index.ts', 'src/out/types.ts']) {
    assert.equal(spawnSync('git', ['check-ignore', '--no-index', '-q', file], { cwd: root }).status, 1, `Expected allowed path: ${file}`);
  }
});
test('CLI checks staged bytes and deleted history, redacts values, and reports failures', () => {
  const temp = mkdtempSync(path.join(tmpdir(), 'k9-privacy-test-'));
  const git = args => execFileSync('git', args, { cwd: temp, stdio: ['ignore', 'pipe', 'pipe'] });
  const run = args => spawnSync(process.execPath, ['scripts/check-privacy.cjs', ...args], { cwd: temp, encoding: 'utf8' });
  const fake = 'gh' + 'p_' + 'B'.repeat(36);
  try {
    mkdirSync(path.join(temp, 'scripts'));
    copyFileSync(path.join(root, 'scripts/check-privacy.cjs'), path.join(temp, 'scripts/check-privacy.cjs'));
    git(['init', '-q']);
    writeFileSync(path.join(temp, 'sample.txt'), fake);
    git(['add', '.']);
    writeFileSync(path.join(temp, 'sample.txt'), 'safe');
    const staged = run([]);
    assert.equal(staged.status, 1);
    assert.ok(staged.stdout.includes('[index]'));
    assert.ok(!staged.stdout.includes(fake));
    git(['-c', 'user.name=Synthetic Tester', '-c', 'user.email=test@example.com', 'commit', '-qm', 'Synthetic detector test']);
    git(['rm', '-q', '-f', 'sample.txt']);
    git(['-c', 'user.name=Synthetic Tester', '-c', 'user.email=test@example.com', 'commit', '-qm', 'Remove synthetic test file']);
    assert.equal(run([]).status, 0);
    const history = run(['--history']);
    assert.equal(history.status, 1);
    assert.ok(history.stdout.includes('[history]'));
    assert.ok(!history.stdout.includes(fake));
    const failure = spawnSync(process.execPath, [path.join(root, 'scripts/check-privacy.cjs')], { env: { ...process.env, PATH: '' }, encoding: 'utf8' });
    assert.equal(failure.status, 2);
    assert.ok(!failure.stderr.includes(fake));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});


test('SQL migration source is allowed while SQL exports and source-like extensions are distinguished', () => {
  for (const file of ['src/storage/migrations/001_initial.sql', 'src/storage/migrations/nested/002_index.SQL', 'src/k9.db.ts', 'src/app.log.ts', 'src/app.log.1.ts', 'src/store.sqlite.ts', 'src/store.db-wal.ts']) {
    assert.equal(scan(file, '-- synthetic schema source').errors.length, 0);
  }
  for (const file of ['export.sql', 'exports/backup.sql', 'src/exports/customers.sql', 'src/storage/migrations-copy/001.sql', 'src/storage/migrations/local.db']) assert.ok(scan(file).errors.length);
  for (const dir of ['credentials', 'secrets', 'logs', 'out']) {
    assert.equal(scan(`src/${dir}/helpers.ts`).errors.length, 0);
    assert.ok(scan(`${dir}/private.txt`).errors.length);
  }
});

test('all development-data locations reject realistic contacts without revealing matched values', () => {
  // Deliberately invalid synthetic detector inputs; never use real contacts.
  const nonExample = 'person' + '@synthetic.invalid';
  const nonReserved = ['(201) 555-0200', '2015550200', '+1 201-555-0200'];
  const locations = ['src/data/dogs.ts', 'src/data/notes.json', 'src/storage/seedDemoData.ts', 'src/storage/demoSeed.ts', 'tests/clientFixtures.ts', 'scripts/seed-demo.cjs', 'seeds/demo.json', 'tests/fixtures/clients.json', 'src/storage/migrations/001_seed.sql'];
  for (const file of locations) {
    assert.ok(scan(file, nonExample).errors.length, file);
    for (const phone of nonReserved) {
      const result = scan(file, JSON.stringify({ phone }));
      assert.ok(result.errors.length, file);
      assert.ok(!JSON.stringify(result).includes(phone));
    }
    assert.equal(scan(file, 'demo@example.com (201) 555-0101 +1 201-555-0199 2015550100').errors.length, 0, file);
  }
});

test('migration files are actually stageable and hidden migrations fail safely', () => {
  const temp = mkdtempSync(path.join(tmpdir(), 'k9-migration-privacy-test-'));
  const git = args => execFileSync('git', args, { cwd: temp, stdio: ['ignore', 'pipe', 'pipe'] });
  const run = () => spawnSync(process.execPath, ['scripts/check-privacy.cjs'], { cwd: temp, encoding: 'utf8' });
  try {
    mkdirSync(path.join(temp, 'scripts'));
    mkdirSync(path.join(temp, 'src/storage/migrations'), { recursive: true });
    copyFileSync(path.join(root, 'scripts/check-privacy.cjs'), path.join(temp, 'scripts/check-privacy.cjs'));
    const { readFileSync } = require('node:fs');
    // Reopening the parents works even if an earlier rule ignored storage.
    writeFileSync(path.join(temp, '.gitignore'), '/src/storage/\n' + readFileSync(path.join(root, '.gitignore'), 'utf8'));
    writeFileSync(path.join(temp, 'src/storage/migrations/001_schema.sql'), '-- synthetic schema probe');
    writeFileSync(path.join(temp, 'export.sql'), '-- synthetic export probe');
    git(['init', '-q']);
    git(['add', 'src/storage/migrations/001_schema.sql']);
    assert.ok(git(['ls-files']).toString().includes('001_schema.sql'));
    assert.equal(run().status, 0);
    git(['add', '-f', 'export.sql']);
    const rejected = run();
    assert.equal(rejected.status, 1);
    assert.ok(rejected.stdout.includes('export.sql'));
    git(['rm', '--cached', 'export.sql']);
    assert.equal(run().status, 0);
    // A deeper rule can override root exceptions; the checker must report it.
    writeFileSync(path.join(temp, 'src/.gitignore'), '/storage/\n');
    const hidden = run();
    assert.equal(hidden.status, 1);
    assert.ok(hidden.stdout.includes('migration source is hidden'));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
