const fs = require('fs');
const content = fs.readFileSync('src/components/Hero.tsx', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('Phan Tấn Long')) {
    console.log(`--- Line ${i + 1} ---`);
    console.log(lines.slice(Math.max(0, i - 10), Math.min(lines.length, i + 10)).join('\n'));
  }
});
