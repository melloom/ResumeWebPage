#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function generateCommitMessage() {
  const timestamp = new Date().toISOString();
  const date = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const time = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Get git status to see what changed
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const changes = status.trim().split('\n').filter(line => line.trim());
    
    if (changes.length === 0) {
      console.log('No changes to commit.');
      process.exit(0);
    }

    // Analyze changes to generate smart commit message
    const addedFiles = changes.filter(line => line.startsWith('A ') || line.startsWith('??')).length;
    const modifiedFiles = changes.filter(line => line.startsWith(' M') || line.startsWith('M')).length;
    const deletedFiles = changes.filter(line => line.startsWith(' D') || line.startsWith('D')).length;

    let message = '';
    
    if (addedFiles > 0 && modifiedFiles === 0 && deletedFiles === 0) {
      message = `feat: add ${addedFiles} file${addedFiles > 1 ? 's' : ''}`;
    } else if (modifiedFiles > 0 && addedFiles === 0 && deletedFiles === 0) {
      message = `update: modify ${modifiedFiles} file${modifiedFiles > 1 ? 's' : ''}`;
    } else if (deletedFiles > 0 && addedFiles === 0 && modifiedFiles === 0) {
      message = `remove: delete ${deletedFiles} file${deletedFiles > 1 ? 's' : ''}`;
    } else {
      const totalChanges = addedFiles + modifiedFiles + deletedFiles;
      message = `sync: ${totalChanges} change${totalChanges > 1 ? 's' : ''} - ${addedFiles} added, ${modifiedFiles} modified, ${deletedFiles} deleted`;
    }

    return `${message} (${date} ${time})`;
  } catch (error) {
    return `chore: auto-commit (${date} ${time})`;
  }
}

function getCurrentBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' });
    return branch.trim();
  } catch (error) {
    return 'main';
  }
}

function main() {
  try {
    console.log('🚀 Quick Git Push - Starting...');
    
    // Check if we're in a git repo
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ Not in a git repository!');
      process.exit(1);
    }

    // Generate commit message
    const commitMessage = generateCommitMessage();
    console.log(`📝 Generated commit message: "${commitMessage}"`);
    
    // Stage all changes
    console.log('📦 Staging changes...');
    execSync('git add .', { stdio: 'inherit' });
    
    // Check if there are staged changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const stagedChanges = status.trim().split('\n').filter(line => line.trim() && !line.startsWith('??'));
    
    if (stagedChanges.length === 0) {
      console.log('✅ No changes to commit. Everything is up to date!');
      process.exit(0);
    }
    
    // Commit changes
    console.log('💾 Committing changes...');
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    // Get current branch and push
    const branch = getCurrentBranch();
    console.log(`📤 Pushing to origin/${branch}...`);
    execSync(`git push origin ${branch}`, { stdio: 'inherit' });
    
    console.log('✅ Successfully pushed changes!');
    console.log(`🔗 Commit message: "${commitMessage}"`);
    
  } catch (error) {
    console.error('❌ Error during git operations:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateCommitMessage, getCurrentBranch };
