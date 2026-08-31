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

const files = walk('src');

const suspiciousFiles = [];

files.forEach(file => {
  if (file.startsWith('src/i18n') || file.endsWith('.worker.ts') || file.endsWith('.d.ts')) return;
  const content = fs.readFileSync(file, 'utf8');
  
  // Check if file uses language context
  const usesLang = content.includes('useLanguage') || content.includes('useTranslation') || content.includes('isVi');

  // Find string literals in code: "..." or '...' or `...` that look like English sentences
  const englishSentenceRegex = /["'`]([A-Z][a-z]{2,}(?:\s+[a-zA-Z0-9_\-.:/()]+){2,})["'`]/g;
  let match;
  const englishPhrases = [];
  while ((match = englishSentenceRegex.exec(content)) !== null) {
    const phrase = match[1];
    // Exclude imports, tailwind classes, URLs, hex, code identifiers, math formulas
    if (phrase.includes('flex ') || phrase.includes('text-') || phrase.includes('bg-') || phrase.includes('border-') || phrase.includes('hover:') || phrase.includes('http') || phrase.includes('rounded-') || phrase.includes('font-') || phrase.includes('shadow-') || phrase.includes('transition-') || phrase.includes('p-') || phrase.includes('m-') || phrase.includes('items-') || phrase.includes('justify-')) continue;
    if (phrase.startsWith('src/') || phrase.startsWith('./') || phrase.startsWith('../') || phrase.includes('.tsx') || phrase.includes('.ts') || phrase.includes('.png') || phrase.includes('.svg')) continue;
    
    // Check if it's already part of a ternary: isVi ? '...' : '...'
    const surroundingStart = Math.max(0, match.index - 50);
    const surroundingEnd = Math.min(content.length, match.index + match[0].length + 50);
    const surrounding = content.substring(surroundingStart, surroundingEnd);
    const isInsideBilingualTernary = surrounding.includes('isVi') || surrounding.includes('language ===');

    if (!isInsideBilingualTernary && !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(phrase)) {
      englishPhrases.push({ phrase, index: match.index });
    }
  }

  if (englishPhrases.length > 0 || !usesLang) {
    suspiciousFiles.push({ file, usesLang, phrasesCount: englishPhrases.length, samples: englishPhrases.slice(0, 5).map(p => p.phrase) });
  }
});

console.log(`Found ${suspiciousFiles.length} files to check:`);
suspiciousFiles.forEach(f => {
  console.log(`- ${f.file} (usesLang: ${f.usesLang}, unlocalized English phrases: ${f.phrasesCount})`);
  if (f.samples.length > 0) {
    console.log(`    Samples: ${f.samples.join(' | ')}`);
  }
});
