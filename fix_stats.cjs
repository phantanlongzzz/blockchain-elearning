const fs = require('fs');

let code = fs.readFileSync('src/components/HashStatistics.tsx', 'utf8');

code = code.replace(/text-\[\#F2F4F7\]/g, 'text-[#E6EAF0]');
code = code.replace(/text-\[\#A5AFBF\]/g, 'text-[#8B95A5]');

code = code.replace(/bg-\[\#0C0F14\]/g, 'bg-[#10151D]');
code = code.replace(/bg-\[\#0F131A\]/g, 'bg-[#151B24]');
code = code.replace(/border-\[\#1C2430\]/g, 'border-[#1E2936]');
code = code.replace(/hover:border-\[\#2A3649\]/g, 'hover:border-[#263241]');

code = code.replace(/text-\[\#00C98D\]/g, 'text-[#E6EAF0]'); // titles
// Let's manually fix the icon color to accent
code = code.replace(
  '<Icon className="w-4 h-4 text-[#E6EAF0]" />',
  '<Icon className="w-4 h-4 text-[#2DD4BF]" />'
);

// We need to fix InlineMath classname to match
code = code.replace(
  'className="text-[#E6EAF0] font-bold"',
  'className="text-[#E6EAF0] font-bold"'
);

fs.writeFileSync('src/components/HashStatistics.tsx', code);
