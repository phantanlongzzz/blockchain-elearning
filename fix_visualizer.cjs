const fs = require('fs');

let code = fs.readFileSync('src/components/HashVisualizer.tsx', 'utf8');

// Global replaces
code = code.replace(/text-\[\#F2F4F7\]/g, 'text-[#E6EAF0]');
code = code.replace(/text-\[\#A5AFBF\]/g, 'text-[#8B95A5]');
code = code.replace(/text-\[\#717B8C\]/g, 'text-[#5F6B7A]');

code = code.replace(/bg-\[\#0C0F14\]/g, 'bg-[#10151D]');
code = code.replace(/bg-\[\#090A0F\]/g, 'bg-[#0A0D12]');
code = code.replace(/bg-\[\#0F131A\]/g, 'bg-[#151B24]');
code = code.replace(/bg-\[\#11161E\]/g, 'bg-[#151B24]');
code = code.replace(/border-\[\#1C2430\]/g, 'border-[#1E2936]');
code = code.replace(/border-\[\#2A3649\]/g, 'border-[#263241]');

// Heading
code = code.replace(
  'text-xs font-sans text-[#00C98D] font-bold uppercase tracking-wider',
  'text-xs font-sans text-[#E6EAF0] font-bold uppercase tracking-wider'
);
// 256-BIT badge
code = code.replace(
  'bg-[#0F131A] border border-[#1C2430] text-[#00C98D]',
  'bg-[#151B24] border border-[#1E2936] text-[#2DD4BF]'
);

// Tabs
code = code.replace(/bg-\[\#00C98D\]\/15 text-\[\#00C98D\] border border-\[\#00C98D\]\/40/g, 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30');

// Copy button
code = code.replace(
  'bg-[#0F131A] hover:bg-[#11161E] border border-[#1C2430] text-xs font-sans text-[#00C98D] hover:border-[#00C98D]/40',
  'bg-[#151B24] hover:bg-[#1E2936] border border-[#263241] text-xs font-sans text-[#E6EAF0] hover:text-[#2DD4BF] hover:border-[#2DD4BF]/40'
);
code = code.replace(/text-\[\#00C98D\]/g, 'text-[#2DD4BF]'); // change all remaining #00C98D to accent by default, wait, I need to be careful

fs.writeFileSync('src/components/HashVisualizer.tsx', code);
