const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/components');
console.log('Inspecting components:', files.length);

files.forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  const usesLanguage = code.includes('useLanguage');
  const usesStrings = code.includes('strings');
  const usesIsVi = code.includes('isVi');

  console.log(`\nCOMPONENT: ${f} (useLanguage: ${usesLanguage}, strings: ${usesStrings}, isVi: ${usesIsVi})`);
});
