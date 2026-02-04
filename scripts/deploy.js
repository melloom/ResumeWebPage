/**
 * Deployment script for Netlify
 * Handles cleaning up .netlify folder and other pre-deployment tasks
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Function to safely remove a directory if it exists
const safeRemoveDir = (dirPath) => {
  const fullPath = path.join(projectRoot, dirPath);
  
  // Check if directory exists
  if (fs.existsSync(fullPath)) {
    console.log(`Removing directory: ${dirPath}`);
    try {
      if (process.platform === 'win32') {
        // On Windows, use rimraf-like approach
        execSync(`rmdir /s /q "${fullPath}"`, { stdio: 'inherit' });
      } else {
        // On UNIX systems
        execSync(`rm -rf "${fullPath}"`, { stdio: 'inherit' });
      }
      console.log(`✅ Successfully removed ${dirPath}`);
    } catch (error) {
      console.error(`❌ Failed to remove ${dirPath}:`, error.message);
    }
  } else {
    console.log(`Directory not found (skipping): ${dirPath}`);
  }
};

// Function to clean build artifacts
const cleanBuildArtifacts = () => {
  // Directories to clean
  const dirsToClean = [
    '.netlify',
    'netlify',
    'dist',
  ];
  
  dirsToClean.forEach(safeRemoveDir);
  
  // Copy netlify.toml to project root if it doesn't exist
  const netlifyTomlPath = path.join(projectRoot, 'netlify.toml');
  if (!fs.existsSync(netlifyTomlPath)) {
    console.log('Creating netlify.toml in project root...');
    try {
      const templatePath = path.join(projectRoot, 'src', 'netlify.toml');
      if (fs.existsSync(templatePath)) {
        fs.copyFileSync(templatePath, netlifyTomlPath);
        console.log('✅ netlify.toml created successfully');
      } else {
        console.log('⚠️ No template netlify.toml found in src directory');
      }
    } catch (error) {
      console.error('❌ Failed to create netlify.toml:', error.message);
    }
  }
};

// Run the script
console.log('🚀 Starting deployment preparation...');
cleanBuildArtifacts();
console.log('✅ Deployment preparation completed');
