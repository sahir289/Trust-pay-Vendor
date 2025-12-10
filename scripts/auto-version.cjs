/**
 * Auto Version Script for Vercel Deployments
 * 
 * This script automatically bumps the version in package.json based on git commit messages.
 * It runs as a prebuild step during Vercel deployments.
 * 
 * IMPORTANT: Only runs on PRODUCTION environment (main branch)
 * Staging builds will NOT auto-bump version.
 * 
 * Version Bump Rules:
 * - [major] or BREAKING CHANGE: → Major version bump (X.0.0)
 * - feat: or feature: → Minor version bump (x.Y.0)
 * - fix: or bugfix: → Patch version bump (x.y.Z)
 * - Default (no keyword) → Patch version bump (x.y.Z)
 * 
 * Usage:
 * - Runs automatically during Vercel builds via prebuild script
 * - Manual: node scripts/auto-version.cjs
 */

/* eslint-env node */
// @ts-nocheck

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if running in Vercel environment
const isVercel = process.env.VERCEL === '1';
const vercelEnv = process.env.VERCEL_ENV; // 'production' or 'preview' or 'development'
const vercelGitBranch = process.env.VERCEL_GIT_COMMIT_REF; // Branch name

// Only auto-bump on production (main branch)
const isProduction = isVercel && vercelGitBranch === 'main';

// Skip version bump if not production
if (!isProduction) {
  process.exit(0);
}

// Get the package.json path
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get commit messages for version analysis
let commitMessages = '';
try {
  // Get the latest commit message
  const latestCommit = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
  
  // Skip if this is a version bump commit (prevent double-bumping)
  if (latestCommit.startsWith('chore: auto-bump version to') && latestCommit.includes('[skip ci]')) {
    process.exit(0);
  }
  
  // If it's a merge commit, get the commits that were merged
  if (latestCommit.toLowerCase().includes('merge') || latestCommit.includes('Merge branch') || latestCommit.includes('Merge pull request')) {
    // Get commits from the last 5 commits (excluding version bumps)
    commitMessages = execSync('git log -5 --pretty=%B --grep="chore: auto-bump version" --invert-grep', { encoding: 'utf8' });
  } else {
    // Regular commit
    commitMessages = latestCommit;
  }
} catch {
  commitMessages = '';
}

// Parse current version
const currentVersion = packageJson.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

let newVersion = '';
let bumpType = 'patch'; // default

// Determine version bump type based on commit messages
if (commitMessages.includes('[major]') || commitMessages.includes('BREAKING CHANGE:')) {
  newVersion = `${major + 1}.0.0`;
  bumpType = 'major';
} else if (commitMessages.toLowerCase().includes('feat:') || commitMessages.toLowerCase().includes('feature:')) {
  newVersion = `${major}.${minor + 1}.0`;
  bumpType = 'minor';
} else if (commitMessages.toLowerCase().includes('fix:') || commitMessages.toLowerCase().includes('bugfix:')) {
  newVersion = `${major}.${minor}.${patch + 1}`;
  bumpType = 'patch';
} else {
  // Default to patch bump
  newVersion = `${major}.${minor}.${patch + 1}`;
  bumpType = 'patch';
}

// Log version change for Vercel build logs
console.log(`Version: ${currentVersion} → ${newVersion} (${bumpType})`);

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// Update package-lock.json if it exists
const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
  packageLock.version = newVersion;
  if (packageLock.packages && packageLock.packages['']) {
    packageLock.packages[''].version = newVersion;
  }
  fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2) + '\n');
}
