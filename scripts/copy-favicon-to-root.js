const fs = require('fs');
const path = require('path');

// Define source and destination paths
const sourceDir = path.join(__dirname, '../public/icons');
const destDir = path.join(__dirname, '../dist'); // Vite builds to 'dist' by default

// Files to copy to root
const filesToCopy = [
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'safari-pinned-tab.svg',
  'logo192.png',
  'logo512.png',
  'maskable_icon.png'
];

/**
 * Copy favicon files from public/icons to build root
 */
function copyFaviconsToRoot() {
  console.log('📂 Copying favicon files to build root directory...');

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    console.log(`Creating build directory: ${destDir}`);
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Create source directory if it doesn't exist
  if (!fs.existsSync(sourceDir)) {
    console.log(`Creating icons directory: ${sourceDir}`);
    fs.mkdirSync(sourceDir, { recursive: true });
  }

  // Keep track of successful copies
  let successCount = 0;
  let warningCount = 0;

  // Copy each file
  filesToCopy.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);

    try {
      // Only copy if source file exists
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied: ${file}`);
        successCount++;
      } else {
        console.warn(`⚠️ Source file not found: ${sourcePath}`);
        warningCount++;
        
        // If we have a 16x16 or 32x32 PNG but missing favicon.ico, generate it
        if (file === 'favicon.ico' && fs.existsSync(path.join(sourceDir, 'favicon-32x32.png'))) {
          console.log(`ℹ️ Hint: You can generate favicon.ico from favicon-32x32.png using the generate-icons.js script`);
        }
      }
    } catch (error) {
      console.error(`❌ Error copying ${file}:`, error.message);
      warningCount++;
    }
  });

  console.log(`\n📝 Summary: ${successCount} files copied, ${warningCount} warnings\n`);

  // Don't exit with error code for missing files to allow build to continue
  if (warningCount > 0) {
    console.log(`⚠️ Some favicon files are missing. Run the generate-icons.js script first to create all required icons.\n`);
  }
}

// Run the copy function
copyFaviconsToRoot();
