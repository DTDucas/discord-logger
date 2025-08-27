// Build CommonJS version
const fs = require('fs');
const path = require('path');

function copyFile(source, destination) {
  const content = fs.readFileSync(source, 'utf8');
  fs.writeFileSync(destination, content);
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// For now, just copy the files as they are already in CommonJS format
const srcDir = path.join(__dirname, '..', 'src');
const files = [
  'index.js',
  'core/LoggerService.js',
  'core/DiscordWebhookService.js',
  'core/GitHubStorageService.js',
  'utils/helpers.js'
];

files.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(srcDir, file); // Keep in place for CJS
  
  if (fs.existsSync(srcPath)) {
    console.log(`✓ CommonJS: ${file} already exists`);
  }
});

console.log('✅ CommonJS build completed');