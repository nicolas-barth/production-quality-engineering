import fs from 'fs';
import path from 'path';

const targets = [
  'playwright-report',
  'allure-report',
  'allure-results',
  'test-results',
  'cypress/videos',
  'cypress/screenshots',
  'cypress/downloads',
  'evidence/reports',
  'evidence/screenshots',
  'evidence/LAST-RUN.md',
];

console.log('\nCleaning test artifacts...\n');

for (const target of targets) {
  const fullPath = path.resolve(target);

  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, {
      recursive: true,
      force: true,
    });

    console.log(`✓ Removed: ${target}`);
  } else {
    console.log(`- Not found: ${target}`);
  }
}

console.log('\n✓ Cleanup completed.\n');
