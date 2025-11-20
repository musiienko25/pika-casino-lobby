#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * Analyzes the bundle size and provides recommendations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Starting Bundle Size Analysis...\n');

// Build the application
console.log('🔨 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Read build output
const buildDir = path.join(process.cwd(), '.next');
const buildManifestPath = path.join(buildDir, 'build-manifest.json');

if (!fs.existsSync(buildManifestPath)) {
  console.error('❌ Build manifest not found');
  process.exit(1);
}

const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));

// Analyze bundle sizes
console.log('\n📊 Bundle Size Analysis:\n');

const analyzeFiles = (files) => {
  let totalSize = 0;
  const fileSizes = [];

  files.forEach((file) => {
    const filePath = path.join(buildDir, 'static', file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeInKB = (stats.size / 1024).toFixed(2);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      totalSize += stats.size;
      fileSizes.push({
        file,
        size: stats.size,
        sizeKB: parseFloat(sizeInKB),
        sizeMB: parseFloat(sizeInMB),
      });
    }
  });

  return { totalSize, fileSizes };
};

// Analyze pages
Object.entries(buildManifest.pages || {}).forEach(([page, files]) => {
  const { totalSize, fileSizes } = analyzeFiles(files);
  const totalKB = (totalSize / 1024).toFixed(2);
  const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

  console.log(`📄 Page: ${page}`);
  console.log(`   Total Size: ${totalKB} KB (${totalMB} MB)`);
  
  // Show top 5 largest files
  const topFiles = fileSizes
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);
  
  if (topFiles.length > 0) {
    console.log('   Top 5 Largest Files:');
    topFiles.forEach(({ file, sizeKB }) => {
      console.log(`     - ${file}: ${sizeKB} KB`);
    });
  }
  console.log('');
});

// Recommendations
console.log('💡 Recommendations:\n');
console.log('1. Use dynamic imports for non-critical components');
console.log('2. Optimize images with next/image');
console.log('3. Remove unused dependencies');
console.log('4. Use tree-shaking for better code elimination');
console.log('5. Consider code splitting for large components');
console.log('\n✅ Analysis complete!');

