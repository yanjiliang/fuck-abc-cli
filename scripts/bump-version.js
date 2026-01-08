const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read current version
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const currentVersion = packageJson.version;

console.log(`\n📦 Current version: ${currentVersion}\n`);

// Get new version from command line argument
const newVersion = process.argv[2];

if (!newVersion) {
  console.log('Usage: npm run version <new-version>');
  console.log('Example: npm run version 1.0.2');
  console.log('Or use semantic versioning:');
  console.log('  npm run release:patch  (1.0.1 -> 1.0.2)');
  console.log('  npm run release:minor  (1.0.1 -> 1.1.0)');
  console.log('  npm run release:major  (1.0.1 -> 2.0.0)\n');
  process.exit(1);
}

// Validate version format (semver)
const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
if (!versionRegex.test(newVersion)) {
  console.error('❌ Invalid version format. Expected: x.y.z (e.g., 1.0.2)');
  process.exit(1);
}

// Update version
packageJson.version = newVersion;

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✅ Version updated to: ${newVersion}\n`);
console.log('Run these commands to commit and push:');
console.log('  git add package.json');
console.log(`  git commit -m "Bump version to ${newVersion}"`);
console.log('  git push\n');
console.log('Then publish:');
console.log('  npm publish\n');
