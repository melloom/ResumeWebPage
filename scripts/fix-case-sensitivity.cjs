// This script ensures folder names match the casing used in imports
// Run this before deploying to Netlify

const fs = require('fs');
const path = require('path');

// Paths that need to be consistent
const pathMappings = [
  {
    importPath: 'components/Resume',
    actualPath: 'components/resume',
    action: 'rename' // 'rename' or 'update-imports'
  }
];

// Root directory of the project
const rootDir = path.resolve(__dirname, '..');

function fixCaseSensitivity() {
  console.log('Fixing case sensitivity issues for Netlify deployment...');
  
  pathMappings.forEach(mapping => {
    const fullImportPath = path.join(rootDir, 'src', mapping.importPath);
    const fullActualPath = path.join(rootDir, 'src', mapping.actualPath);
    
    if (mapping.action === 'rename' && fs.existsSync(fullActualPath)) {
      // Create a temporary directory with the right name
      const tempPath = fullActualPath + '-temp';
      
      if (!fs.existsSync(path.dirname(fullImportPath))) {
        fs.mkdirSync(path.dirname(fullImportPath), { recursive: true });
      }
      
      console.log(`Renaming ${fullActualPath} to ${fullImportPath}`);
      
      try {
        // Use a two-step rename for case-sensitive changes
        fs.renameSync(fullActualPath, tempPath);
        fs.renameSync(tempPath, fullImportPath);
        console.log(`✓ Successfully renamed directory`);
      } catch (error) {
        console.error(`Error renaming directory: ${error.message}`);
      }
    } else {
      console.log(`Path not found or no action needed for ${fullActualPath}`);
    }
  });
  
  console.log('Case sensitivity fix complete!');
}

fixCaseSensitivity();
