const fs = require('fs');

let code = fs.readFileSync('src/components/HashGenerator.tsx', 'utf8');

// Colors
code = code.replace(/text-\[\#F2F4F7\]/g, 'text-[#E6EAF0]');
code = code.replace(/text-\[\#A5AFBF\]/g, 'text-[#8B95A5]');
code = code.replace(/text-\[\#717B8C\]/g, 'text-[#5F6B7A]');

code = code.replace(/bg-\[\#0C0F14\]/g, 'bg-[#10151D]'); // surface
code = code.replace(/bg-\[\#090A0F\]/g, 'bg-[#0A0D12]'); // primary bg
code = code.replace(/bg-\[\#0B0F15\]/g, 'bg-[#0A0D12]'); // input bg
code = code.replace(/border-\[\#1C2430\]/g, 'border-[#1E2936]');
code = code.replace(/border-\[\#2A3649\]/g, 'border-[#263241]');

// Eyebrow badge
code = code.replace(
  'inline-flex items-center gap-2 text-[#00C98D] text-xs font-mono font-semibold tracking-wider uppercase mb-3',
  'inline-flex items-center gap-2 text-[#2DD4BF] text-xs font-mono font-semibold tracking-wider uppercase mb-3'
);

// Input message heading
code = code.replace(
  'text-xs font-sans font-bold text-[#00C98D] uppercase tracking-wider">\n                  {strings.hashGenerator.inputMessage}',
  'text-xs font-sans font-bold text-[#E6EAF0] uppercase tracking-wider">\n                  {strings.hashGenerator.inputMessage}'
);

// Output message heading
code = code.replace(
  'text-xs font-sans font-bold text-[#00C98D] uppercase tracking-wider">\n                    {strings.hashGenerator.outputLabel}',
  'text-xs font-sans font-bold text-[#E6EAF0] uppercase tracking-wider">\n                    {strings.hashGenerator.outputLabel}'
);

// Engine tag
code = code.replace(
  'text-[#00C98D]/80">\n                    {strings.hashGenerator.processEngine}',
  'text-[#8B95A5]">\n                    {strings.hashGenerator.processEngine}'
);

// Tabs
code = code.replace(/bg-\[\#00C98D\]\/15 text-\[\#00C98D\] border border-\[\#00C98D\]\/30/g, 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30');
// Test vector active
code = code.replace(/bg-\[\#00C98D\]\/15 text-\[\#00C98D\] border-\[\#00C98D\]\/40/g, 'bg-[#2DD4BF]/10 text-[#2DD4BF] border-[#2DD4BF]/40');

// Textarea focus
code = code.replace(/focus:border-\[\#00C98D\]/g, 'focus:border-[#2DD4BF]');
code = code.replace(/focus:ring-\[\#00C98D\]/g, 'focus:ring-[#2DD4BF]');

// Length bytes bits
code = code.replace(/strong className="text-\[\#00C98D\]"/g, 'strong className="text-[#7DD3FC]"');

// Refresh button
code = code.replace(/hover:text-\[\#00C98D\]/g, 'hover:text-[#2DD4BF]');

// Drop zone
code = code.replace(/border-\[\#00C98D\]\/30 hover:border-\[\#00C98D\]/g, 'border-[#1E2936] hover:border-[#2DD4BF]');
code = code.replace(/text-\[\#00C98D\] mx-auto/g, 'text-[#2DD4BF] mx-auto');
code = code.replace(/bg-\[\#00C98D\]\/10 border border-\[\#00C98D\]\/40 text-xs font-mono text-\[\#00C98D\]/g, 'bg-[#2DD4BF]/10 border border-[#2DD4BF]/40 text-xs font-mono text-[#2DD4BF]');

// Compute time
code = code.replace(/strong className="text-\[\#00C98D\]">\{hashResult/g, 'strong className="text-[#2DD4BF]">{hashResult');

// Copy button
code = code.replace(
  'bg-[#00C98D] hover:bg-[#00C98D]/90 text-[#090A0F] font-sans font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer',
  'bg-[#151B24] hover:bg-[#1E2936] text-[#E6EAF0] border border-[#263241] hover:border-[#2DD4BF]/50 hover:text-[#2DD4BF] font-sans font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer'
);
code = code.replace(/text-\[\#090A0F\]"/g, 'text-current"');

// Output hex container
code = code.replace(
  'p-4 rounded-lg bg-[#090A0F] border border-[#1C2430] mb-6 group relative',
  'p-4 rounded-lg bg-[#0A0D12] border border-[#263241] hover:border-[#7DD3FC]/40 transition-colors mb-6 group relative'
);

// Output hex text
code = code.replace(
  'font-mono text-base sm:text-xl lg:text-2xl font-bold tracking-[0.05em] tabular-nums text-[#00C98D] break-all select-all leading-relaxed',
  'font-mono text-base sm:text-xl lg:text-2xl font-bold tracking-[0.05em] tabular-nums text-[#7DD3FC] break-all select-all leading-relaxed'
);

fs.writeFileSync('src/components/HashGenerator.tsx', code);
