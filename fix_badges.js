import fs from 'fs';
import glob from 'glob';

const files = glob.sync('src/components/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // Pattern for centered section header badges
  // e.g. <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0C0F14] border border-[#1C2430] text-[#00C98D] text-xs font-mono tracking-wider uppercase mb-3">
  
  content = content.replace(
    /<div className="inline-flex items-center gap-[0-9.]+ px-[0-9.]+ py-[0-9.]+ rounded-(?:full|md|lg) bg-[^"]+ border border-[^"]+ text-[^"]+ text-[a-z]+ font-[a-z]+ tracking-[a-z]+ uppercase mb-[0-9]+">/g,
    (match) => {
      // Extract the text color to keep it
      const textColorMatch = match.match(/text-\[[^\]]+\]/);
      const textColor = textColorMatch ? textColorMatch[0] : 'text-emerald-400';
      return `<div className="flex items-center justify-center gap-2 ${textColor} text-xs font-mono tracking-wider uppercase mb-3 font-semibold">`;
    }
  );

  if (content !== originalContent) {
    console.log(`Updated ${file}`);
    fs.writeFileSync(file, content);
  }
});
