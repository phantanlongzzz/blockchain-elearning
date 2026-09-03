const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Replace the Google Fonts link
content = content.replace(
  /<link href="https:\/\/fonts.googleapis.com\/css2[^"]+" rel="stylesheet" \/>/g,
  '<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&subset=latin,vietnamese&display=swap" rel="stylesheet" />'
);

fs.writeFileSync('index.html', content);
