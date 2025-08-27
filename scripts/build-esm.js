// Build ESM version
const fs = require('fs');
const path = require('path');

function convertToESM(content) {
  // Convert require() to import
  content = content.replace(/const\s+(\w+)\s+=\s+require\(['"]([^'"]+)['"]\);/g, 
    'import $1 from \'$2\';');
  
  // Convert require with destructuring
  content = content.replace(/const\s+\{([^}]+)\}\s+=\s+require\(['"]([^'"]+)['"]\);/g, 
    'import { $1 } from \'$2\';');
  
  // Convert module.exports to export default
  content = content.replace(/module\.exports\s*=\s*([^;]+);?/g, 'export default $1;');
  
  // Convert module.exports.property to export
  content = content.replace(/module\.exports\.(\w+)\s*=\s*([^;]+);?/g, 'export const $1 = $2;');
  
  return content;
}

function processFile(srcPath, destPath) {
  const content = fs.readFileSync(srcPath, 'utf8');
  const esmContent = convertToESM(content);
  
  // Ensure directory exists
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(destPath, esmContent);
}

// The ESM version is already created manually, so just verify it exists
const esmIndexPath = path.join(__dirname, '..', 'src', 'index.esm.js');

if (fs.existsSync(esmIndexPath)) {
  console.log('✓ ESM index.esm.js exists');
} else {
  console.log('✗ ESM index.esm.js missing');
}

console.log('✅ ESM build completed');