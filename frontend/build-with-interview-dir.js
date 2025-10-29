const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Next.js application...');

// Run Next.js build
execSync('npm run build', { stdio: 'inherit' });

console.log('📁 Creating interview directory structure...');

// Ensure interview directory exists
const outDir = path.join(__dirname, 'out');
const interviewDir = path.join(outDir, 'interview');

if (!fs.existsSync(interviewDir)) {
  fs.mkdirSync(interviewDir, { recursive: true });
}

// Copy interview.html to interview/index.html
const interviewHtml = path.join(outDir, 'interview.html');
const interviewIndex = path.join(interviewDir, 'index.html');

if (fs.existsSync(interviewHtml)) {
  fs.copyFileSync(interviewHtml, interviewIndex);
  console.log('✅ Created interview/index.html');
} else {
  console.log('⚠️ interview.html not found, creating empty index.html');
  fs.writeFileSync(interviewIndex, '<!DOCTYPE html><html><head><title>Interview</title></head><body><div id="__next"></div></body></html>');
}

// Create admin/memo-details directory structure
console.log('📁 Creating admin/memo-details directory structure...');
const adminMemoDetailsDir = path.join(outDir, 'admin', 'memo-details');

if (!fs.existsSync(adminMemoDetailsDir)) {
  fs.mkdirSync(adminMemoDetailsDir, { recursive: true });
}

// Copy admin/memo-details.html to admin/memo-details/index.html
const adminMemoDetailsHtml = path.join(outDir, 'admin', 'memo-details.html');
const adminMemoDetailsIndex = path.join(adminMemoDetailsDir, 'index.html');

if (fs.existsSync(adminMemoDetailsHtml)) {
  fs.copyFileSync(adminMemoDetailsHtml, adminMemoDetailsIndex);
  console.log('✅ Created admin/memo-details/index.html');
} else {
  console.log('⚠️ admin/memo-details.html not found, creating empty index.html');
  fs.writeFileSync(adminMemoDetailsIndex, '<!DOCTYPE html><html><head><title>Admin Memo Details</title></head><body><div id="__next"></div></body></html>');
}

// Create admin/memos/[id] directory structure for backward compatibility
console.log('📁 Creating admin/memos/[id] directory structure for backward compatibility...');
const adminMemosDir = path.join(outDir, 'admin', 'memos');
const adminMemosIdDir = path.join(adminMemosDir, '[id]');

if (!fs.existsSync(adminMemosIdDir)) {
  fs.mkdirSync(adminMemosIdDir, { recursive: true });
}

// Create a catch-all page for admin memo details that redirects to the new structure
const adminMemosIdIndex = path.join(adminMemosIdDir, 'index.html');
fs.writeFileSync(adminMemosIdIndex, `<!DOCTYPE html>
<html>
<head>
  <title>Admin Memo Details</title>
  <script>
    // Client-side routing for admin memo details
    const path = window.location.pathname;
    const memoId = path.split('/').pop();
    
    // Redirect to the new admin memo details page
    if (memoId && memoId !== 'admin' && memoId !== 'memos') {
      window.location.href = '/admin/memo-details/' + memoId;
    } else {
      window.location.href = '/admin/memos';
    }
  </script>
</head>
<body>
  <div id="__next">
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <div>Loading memo details...</div>
    </div>
  </div>
</body>
</html>`);
console.log('✅ Created admin/memos/[id]/index.html for backward compatibility');

console.log('✅ Build completed with proper directory structure!');
