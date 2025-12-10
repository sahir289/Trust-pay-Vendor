/**
 * Commit Version Script for Vercel Deployments
 * 
 * This script commits version changes back to git after auto-versioning.
 * It runs as a postbuild step during Vercel deployments.
 * 
 * IMPORTANT: Only runs on PRODUCTION environment (main branch)
 * - Commits version changes back to git
 * - Prevents future builds from bumping the same version again
 * - Keeps other branches synchronized
 * 
 * Usage:
 * - Runs automatically during Vercel builds via postbuild script
 * - Manual: node scripts/commit-version.cjs
 */

/* eslint-env node */
// @ts-nocheck

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if running in Vercel environment
const isVercel = process.env.VERCEL === '1';
const vercelGitBranch = process.env.VERCEL_GIT_COMMIT_REF; // Branch name
const vercelToken = process.env.GITHUB_TOKEN || process.env.VERCEL_GIT_PROVIDER_TOKEN; // GitHub token

// Only commit on production (main branch)
const isProduction = isVercel && vercelGitBranch === 'main';

// Skip if not production
if (!isProduction) {
  process.exit(0);
}

// Skip if no GitHub token (can't push)
if (!vercelToken) {
  process.exit(0);
}

try {
  // Read current version from package.json
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;

  // Check if version files have changes
  const gitStatus = execSync('git status --porcelain package*.json', { encoding: 'utf8' }).trim();
  
  if (!gitStatus) {
    // No changes to commit
    process.exit(0);
  }

  // Configure git with Vercel info
  execSync('git config user.name "Vercel Auto-Version"', { stdio: 'pipe' });
  execSync('git config user.email "noreply@vercel.com"', { stdio: 'pipe' });

  // Add version files
  execSync('git add package.json package-lock.json', { stdio: 'pipe' });

  // Create commit with version info
  const commitMessage = `chore: auto-bump version to ${currentVersion} [skip ci]`;
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });

  // Push back to main branch using HTTPS with token
  const repoOwner = 'sahir289';
  const repoName = 'Trust-pay-ui';
  const remoteUrl = `https://x-access-token:${vercelToken}@github.com/${repoOwner}/${repoName}.git`;
  
  execSync(`git push "${remoteUrl}" HEAD:main`, { stdio: 'pipe' });

  console.log(`Version ${currentVersion} committed to git`);

} catch (error) {
  // Fail silently - don't break the build
  console.log('Version commit failed (non-critical)');
}