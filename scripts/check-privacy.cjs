// Dependency-free guardrail. Never print matched content or Git command stderr.
const { execFileSync, spawnSync } = require('node:child_process');
const { readFileSync, lstatSync } = require('node:fs');
const path = require('node:path');

const privateDirs = /^(exports|data-exports|backups|local-data|private-data|captures|local-captures|local-screenshots|private-screenshots|recordings|secrets|credentials|logs|out|debug-output)(\/|$)/i;
const migrationSource = /^src\/storage\/migrations\/(?:[^/]+\/)*[^/]+\.[sS][qQ][lL]$/;
const forbiddenFile = /\.(db|sqlite|sqlite3)(?:-(?:wal|shm|journal))?$|-(wal|shm|journal)$|\.(csv|tsv|xls|xlsx|xlsm|dump|bak|backup|jsonl|ndjson|p8|p12|pfx|key|pem|keystore|jks|mobileprovision|provisionprofile|log|debug|trace|tmp|temp)$|\.log\.\d+$|\.export\.json$/i;
const developmentData = /^(?:src\/data\/|tests\/fixtures\/|src\/storage\/migrations\/)|(?:^|\/)(?:seeds?|synthetic|fixtures)\/|(?:^|\/)[^/]*(?:seed|synthetic|fixture)[^/]*\.(?:ts|tsx|js|cjs|mjs|json|sql)$/i;
const credentialFile = /(^|\/)(credentials\.json|\.envrc|\.env(?:\..+)?|[^/]+\.env|service-account[^/]*\.json|[^/]*-credentials\.json)$/i;
const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b/],
  ['service token', /\b(?:sk_live_[A-Za-z0-9]{16,}|sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[A-Za-z0-9_-]{35})\b/],
  ['npm token', /\bnpm_[A-Za-z0-9]{36,}\b/],
  ['JWT token', /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/],
  ['restricted API token', /\brk_live_[A-Za-z0-9]{16,}\b/],
  ['credential in URL', /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/i],
];
const placeholder = /^(?:|changeme|placeholder|redacted|example|dummy|fake|test|your[_ -].*|<[^>]+>|\$\{[^}]+\})$/i;

function inspect(file, buffer) {
  const errors = new Set();
  const warnings = new Set();
  if (privateDirs.test(file) || forbiddenFile.test(file) || (/\.sql$/i.test(file) && !migrationSource.test(file)) || (credentialFile.test(file) && !/(^|\/)\.env\.example$/.test(file))) {
    errors.add('prohibited database/export/credential/debug/capture path');
  }
  if (buffer.subarray(0, 16).toString() === 'SQLite format 3\0') errors.add('SQLite database content');
  // Content detection still runs for every text file, including approved fixtures.
  const binary = buffer.includes(0);
  if (!binary) {
    const content = buffer.toString('utf8');
    for (const [label, pattern] of patterns) if (pattern.test(content)) errors.add(label);
    const assignment = /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|refresh[_-]?token|client[_-]?secret|password|secret[_-]?key|aws[_-]?secret[_-]?access[_-]?key)["']?\s*[:=]\s*["']([^"'\r\n]{8,})["']/gi;
    for (const match of content.matchAll(assignment)) {
      if (!placeholder.test(match[1])) errors.add('literal credential assignment');
    }
    const bearer = /\bBearer\s+([A-Za-z0-9._~+/-]{16,}=*)/gi;
    for (const match of content.matchAll(bearer)) if (!placeholder.test(match[1])) errors.add('Bearer token');
    const strict = developmentData.test(file);
    const emails = content.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
    if (emails.some(email => !email.toLowerCase().endsWith('@example.com'))) {
      (strict ? errors : warnings).add(strict ? 'non-synthetic development-data email' : 'non-example email; verify provenance');
    }
    let phones = content.match(/(?<![\w])(?:\+?1[ .-]?)?(?:\(\d{3}\)|\d{3})[ .-]?\d{3}[ .-]?\d{4}(?![\w])/g) || [];
    if (!strict) phones = phones.filter(phone => /[ .()+-]/.test(phone));
    // Also inspect labeled phone fields, including compact or otherwise malformed values.
    for (const match of content.matchAll(/\b(?:phone(?:Number)?|mobile|telephone|tel)["']?\s*[:=]\s*["']([^"'\r\n]+)["']/gi)) phones.push(match[1]);
    const isFictionalPhone = value => {
      let digits = value.replace(/\D/g, '');
      if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
      return /^[2-9]\d{2}55501\d{2}$/.test(digits);
    };
    if (phones.some(phone => !isFictionalPhone(phone))) {
      (strict ? errors : warnings).add(strict ? 'non-reserved development-data contact number' : 'phone-like content; verify synthetic data');
    }
  }
  if (/\.(png|jpe?g|webp|heic|gif|mov|mp4|pdf|docx|zip|gz|7z)$/i.test(file) && !file.startsWith('assets/')) warnings.add('image/document/archive requires visual or manual review');
  if (/\.json$/i.test(file) && !['package.json', 'package-lock.json', 'app.json', 'tsconfig.json'].includes(file) && !file.startsWith('tests/fixtures/')) warnings.add('JSON data/configuration requires manual review');
  return { errors: [...errors], warnings: [...warnings] };
}

function main() {
  const root = path.resolve(__dirname, '..');
  const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  const records = new Map();
  let scanned = 0;
  function check(scope, file, buffer) {
    scanned++;
    const result = inspect(file, buffer);
    for (const severity of ['errors', 'warnings']) for (const reason of result[severity]) {
      // Aggregate findings by safe path and category, never by matched value.
      const key = JSON.stringify([severity, file, reason]);
      const existing = records.get(key);
      if (existing) existing.scopes.add(scope);
      else records.set(key, { severity, scopes: new Set([scope]), file, reason });
    }
  }
  // A local/global exclude must not silently hide future migration source.
  const probe = 'src/storage/migrations/__privacy_trackability_probe__.sql';
  const ignored = spawnSync('git', ['check-ignore', '--no-index', '-q', probe], { cwd: root, stdio: 'ignore' });
  if (ignored.status !== 0 && ignored.status !== 1) throw new Error('Cannot verify migration tracking');
  if (ignored.status === 0) records.set('migration-exclude', {
    severity: 'errors', scopes: new Set(['configuration']), file: 'src/storage/migrations/', reason: 'migration source is hidden by Git ignore configuration',
  });
  for (const file of git(['ls-files', '--others', '--ignored', '--exclude-standard', '-z', '--', 'src/storage/migrations/']).toString().split('\0').filter(Boolean)) {
    if (migrationSource.test(file)) records.set(`ignored:${file}`, {
      severity: 'errors', scopes: new Set(['configuration']), file, reason: 'migration source is hidden by Git ignore configuration',
    });
  }
  const files = git(['ls-files', '-z', '--cached', '--others', '--exclude-standard']).toString().split('\0').filter(Boolean);
  for (const file of new Set(files)) {
    const absolute = path.join(root, file);
    try {
      const stat = lstatSync(absolute);
      if (stat.isSymbolicLink()) {
        records.set(`symlink:${file}`, { severity: 'errors', scopes: new Set(['working']), file, reason: 'symlink cannot be safely inspected' });
      } else if (stat.isFile()) check('working', file, readFileSync(absolute));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      // Deleted working files are still checked in the index below.
    }
  }
  // Inspect exact index bytes too: a safe working copy must not hide a staged secret.
  const index = git(['ls-files', '--stage', '-z']).toString().split('\0').filter(Boolean);
  for (const entry of index) {
    const match = /^(\d+) ([a-f0-9]+) (\d)\t([\s\S]+)$/.exec(entry);
    if (!match || match[1] === '160000') throw new Error('Unsupported index entry');
    check('index', match[4], git(['cat-file', 'blob', match[2]]));
  }
  if (process.argv.includes('--history')) {
    // Every reachable historical tree, including deleted and renamed paths.
    const trees = new Set(git(['log', '--all', '--format=%T']).toString().trim().split('\n').filter(Boolean));
    const seen = new Set();
    for (const tree of trees) {
      for (const entry of git(['ls-tree', '-r', '-z', tree]).toString().split('\0').filter(Boolean)) {
        const match = /^\d+ blob ([a-f0-9]+)\t([\s\S]+)$/.exec(entry);
        if (!match) throw new Error('Unsupported history entry');
        const key = `${match[1]}:${match[2]}`;
        if (seen.has(key)) continue;
        seen.add(key);
        check('history', match[2], git(['cat-file', 'blob', match[1]]));
      }
    }
    // Commit/tag messages can leak secrets too; no message text is printed.
    const objects = new Set([
      ...git(['rev-list', '--objects', '--all', '--no-object-names']).toString().trim().split('\n'),
      ...git(['for-each-ref', '--format=%(objectname)', 'refs/tags']).toString().trim().split('\n'),
    ].filter(Boolean));
    for (const object of objects) {
      const type = git(['cat-file', '-t', object]).toString().trim();
      if (type === 'commit' || type === 'tag') check('history', `${type}-message`, git(['cat-file', type, object]));
    }
  }
  const findings = [...records.values()];
  for (const finding of findings) console.log(`${finding.severity === 'errors' ? 'FAIL' : 'REVIEW'} [${[...finding.scopes].join(', ')}] ${JSON.stringify(finding.file)}: ${finding.reason}`);
  const errors = findings.filter(finding => finding.severity === 'errors').length;
  const warnings = findings.length - errors;
  console.log(`Privacy check: ${scanned} file/object versions inspected; ${errors} violations; ${warnings} manual-review findings.`);
  console.log('Pattern scanning cannot certify data as synthetic or inspect text inside images/archives. Ignored local files and unreachable Git objects are not scanned.');
  process.exitCode = errors ? 1 : 0;
}

module.exports = { inspect };
if (require.main === module) {
  try { main(); } catch {
    console.error('Privacy check could not complete safely. No file contents or command errors were printed.');
    process.exitCode = 2;
  }
}
