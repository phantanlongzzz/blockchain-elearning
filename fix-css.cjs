const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

if (!code.includes('--color-money')) {
  code = code.replace(
    ':root {',
    ':root {\n  --color-money: #F5C451;'
  );
  
  // Add a utility class as well just in case, or tailwind handles it if we use text-[var(--color-money)]
  code = code + '\n\n@utility text-money {\n  color: var(--color-money);\n}\n';
  fs.writeFileSync('src/index.css', code);
}
