#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync, copyFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'https://aidajo-backend.replit.app';

console.log('🚀 Starting production build...');

// Clean previous build
if (existsSync('dist')) {
  rmSync('dist', { recursive: true });
}

// Create dist directory
mkdirSync('dist', { recursive: true });

try {
  // 1. Build the frontend with production API URL
  console.log('📦 Building frontend...');
  process.env.VITE_API_BASE_URL = BACKEND_URL;
  execSync('vite build', { stdio: 'inherit' });

  // 2. Copy static files to dist
  console.log('📁 Copying static files...');
  if (existsSync('client/dist')) {
    execSync('cp -r client/dist/* dist/', { stdio: 'inherit' });
  }

  // 3. Create .htaccess for SPA routing (for Hostinger)
  console.log('🔧 Creating .htaccess for SPA routing...');
  const htaccess = `
# Enable rewrite engine
RewriteEngine On

# Handle SPA routing - redirect all requests to index.html except for files that exist
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
`;
  
  writeFileSync('dist/.htaccess', htaccess.trim());

  // 4. Create deployment info
  console.log('📋 Creating deployment info...');
  const deploymentInfo = {
    buildTime: new Date().toISOString(),
    backendUrl: BACKEND_URL,
    version: process.env.npm_package_version || '1.0.0'
  };
  
  writeFileSync('dist/deployment-info.json', JSON.stringify(deploymentInfo, null, 2));

  console.log('✅ Production build completed successfully!');
  console.log('📁 Files ready in ./dist/ directory');
  console.log('🌐 Backend URL configured:', BACKEND_URL);
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Upload the contents of ./dist/ to your Hostinger public_html folder');
  console.log('2. Deploy the backend to Replit Deployments');
  console.log('3. Update the BACKEND_URL in this script if needed');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}