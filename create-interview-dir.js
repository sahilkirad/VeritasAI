const fs = require('fs');
const path = require('path');

console.log('📁 Creating interview directory structure...');

const outDir = path.join(__dirname, 'frontend', 'out');
const interviewDir = path.join(outDir, 'interview');

// Ensure interview directory exists
if (!fs.existsSync(interviewDir)) {
  fs.mkdirSync(interviewDir, { recursive: true });
  console.log('✅ Created interview directory');
}

// Copy interview.html to interview/index.html
const interviewHtml = path.join(outDir, 'interview.html');
const interviewIndex = path.join(interviewDir, 'index.html');

if (fs.existsSync(interviewHtml)) {
  fs.copyFileSync(interviewHtml, interviewIndex);
  console.log('✅ Created interview/index.html');
} else {
  console.log('⚠️ interview.html not found, creating empty index.html');
  fs.writeFileSync(interviewIndex, `<!DOCTYPE html>
<html>
<head>
  <title>Interview</title>
  <script>
    // Client-side routing for interview
    const path = window.location.pathname;
    const interviewId = path.split('/').pop();
    
    // Redirect to the main interview page with the interview ID
    if (interviewId && interviewId !== 'interview') {
      window.location.href = '/interview?interviewId=' + interviewId;
    } else {
      window.location.href = '/interview';
    }
  </script>
</head>
<body>
  <div id="__next">
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <div>Loading interview...</div>
    </div>
  </div>
</body>
</html>`);
}

console.log('✅ Interview directory structure created!');
