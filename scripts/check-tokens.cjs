const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const FORBIDDEN_PATTERNS = [
  { name: 'Forbidden text-emerald class', regex: /\btext-emerald-[0-9]+/g },
  { name: 'Forbidden bg-green / text-green class', regex: /\b(bg|text|border)-green-[0-9]+/g },
  { name: 'Forbidden border-emerald class (non-status)', regex: /\bborder-emerald-[0-9]+/g },
  { name: 'Legacy emerald hex #00C98D / #00B982', regex: /#(00C98D|00c98d|00B982|00b982)/g },
];

const srcFiles = walk('./src').filter(f => !f.endsWith('index.css'));

let totalWarnings = 0;
const warningsByFile = new Map();

srcFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, lineIdx) => {
    FORBIDDEN_PATTERNS.forEach(rule => {
      if (rule.regex.test(line)) {
        totalWarnings++;
        if (!warningsByFile.has(filePath)) {
          warningsByFile.set(filePath, []);
        }
        warningsByFile.get(filePath).push({
          line: lineIdx + 1,
          rule: rule.name,
          text: line.trim()
        });
      }
    });
  });
});

console.log('========================================');
console.log('🔍 Blockchain Lab Token Guardrails Scan');
console.log('========================================');

if (totalWarnings === 0) {
  console.log('✅ PASS: All files in src/ comply with Design Tokens! No forbidden color classes or legacy hex codes found.');
  process.exit(0);
} else {
  console.log(`⚠️  WARNING: Found ${totalWarnings} violation(s) across ${warningsByFile.size} file(s):\n`);
  for (const [file, items] of warningsByFile.entries()) {
    console.log(`📁 ${file}:`);
    items.forEach(item => {
      console.log(`   Line ${item.line} [${item.rule}]: ${item.text}`);
    });
    console.log('');
  }
  console.log('👉 Please use design tokens (e.g. text-text-primary, text-success, border-border-primary, text-financial) instead.');
  process.exit(1);
}
