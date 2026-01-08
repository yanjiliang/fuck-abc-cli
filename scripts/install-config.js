const fs = require('fs');
const path = require('path');
const os = require('os');

const configDir = path.join(os.homedir(), '.english-optimizer');
const sourceFile = path.join(__dirname, '..', 'config.yaml');
const targetFile = path.join(configDir, 'config.yaml');

console.log('📝 Installing configuration file...');

// Create config directory if it doesn't exist
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
  console.log(`✅ Created directory: ${configDir}`);
}

// Copy config file
if (fs.existsSync(sourceFile)) {
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ Installed configuration to: ${targetFile}`);
  console.log('\n🎉 Configuration file installed successfully!');
  console.log('You can now edit ~/.english-optimizer/config.yaml to customize your settings.');
} else {
  console.error('❌ Error: config.yaml not found in project root.');
  process.exit(1);
}
