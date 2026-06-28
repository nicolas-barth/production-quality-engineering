import { spawnSync } from 'child_process';

const args = process.argv.slice(2);
const scriptPath = args[0];

if (!scriptPath) {
  console.error('Usage: node scripts/run-k6.mjs <k6-script-path>');
  process.exit(1);
}

const probe = spawnSync('k6', ['version'], { shell: true, stdio: 'ignore' });

if (probe.status !== 0) {
  console.log('');
  console.log('[k6]');
  console.log('k6 is not installed.');
  console.log('Performance tests are optional.');
  console.log('See README for installation instructions.');
  console.log('');
  process.exit(0);
}

const result = spawnSync('k6', ['run', scriptPath, ...args.slice(1)], {
  shell: true,
  stdio: 'inherit',
});

process.exit(result.status ?? 0);
