import fs from 'fs';
import { execSync } from 'child_process';

const files = execSync('find src/components -type f -name "*.tsx"').toString().split('\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  content = content.replace(
    /<div className="inline-flex items-center gap-[0-9.]+ px-[0-9.]+ py-[0-9.]+ rounded-(?:full|md|lg|xl) bg-[^"]+ border border-[^"]+ text-[^"]+ text-[a-z]+ font-[a-z]+ tracking-[a-z]+ uppercase mb-[0-9]+">/g,
    (match) => {
      const textColorMatch = match.match(/text-\[[^\]]+\]/) || match.match(/text-[a-z]+-[0-9]+/);
      const textColor = textColorMatch ? textColorMatch[0] : 'text-emerald-400';
      return `<div className="flex items-center justify-center gap-2 ${textColor} text-xs font-mono tracking-wider uppercase mb-3 font-semibold">`;
    }
  );

  if (content !== originalContent) {
    console.log(`Updated ${file}`);
    fs.writeFileSync(file, content);
  }
});
