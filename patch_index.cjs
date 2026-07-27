const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace(
  '<meta name="theme-color" content="#1e3a8a" />',
  \`<meta name="theme-color" content="#1e3a8a" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="EduGlobal365" />\`
);
fs.writeFileSync('index.html', content);
