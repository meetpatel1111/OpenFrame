const fs = require('fs');
const path = require('path');
const zip = require('adm-zip');

// Create a portable package
const outputDir = path.join(__dirname, 'dist');
const appDir = path.join(outputDir, 'OpenFrame-win32-x64');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy application files
const sourceDir = path.join(__dirname, 'build');
const targetDir = path.join(appDir, 'resources', 'app');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy built files
copyRecursiveSync(sourceDir, targetDir);

// Copy package.json
fs.copyFileSync(
  path.join(__dirname, 'package.json'),
  path.join(targetDir, 'package.json')
);

// Copy node_modules (only production dependencies)
const nodeModulesSource = path.join(__dirname, 'node_modules');
const nodeModulesTarget = path.join(targetDir, 'node_modules');

if (fs.existsSync(nodeModulesSource)) {
  console.log('Copying node_modules...');
  copyRecursiveSync(nodeModulesSource, nodeModulesTarget);
}

console.log('Portable package created at:', appDir);
