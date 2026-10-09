const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = mkdtempSync(path.join(tmpdir(), 'k9-tests-'));
try {
  // Compile only platform-independent production modules with the installed TypeScript.
  execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'),
    'src/data/dogRecords.ts', 'src/data/dashboard.ts', 'src/logic/dogs.ts',
    '--ignoreConfig', '--outDir', output, '--rootDir', 'src', '--module', 'commonjs',
    '--target', 'ES2020', '--strict', '--skipLibCheck', '--noEmitOnError',
  ], { cwd: root, stdio: 'inherit' });
  execFileSync(process.execPath, ['--test', 'tests/dogs.test.cjs'], {
    cwd: root, stdio: 'inherit', env: { ...process.env, K9_TEST_OUTPUT: output },
  });
} catch (error) {
  process.exitCode = error.status || 1;
} finally {
  rmSync(output, { recursive: true, force: true });
}
