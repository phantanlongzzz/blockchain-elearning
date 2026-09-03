const fs = require('fs');

let code = fs.readFileSync('src/components/HashVisualizer.tsx', 'utf8');

// Word H{idx} label
code = code.replace(
  'font-bold text-[#2DD4BF]">Word H{idx}</span>',
  'font-semibold text-[#5F6B7A] uppercase tracking-wider">Word H{idx}</span>'
);

// activeWordIndex container
code = code.replace(
  "bg-[#151B24] border-[#2DD4BF]/60 shadow-sm ring-1 ring-[#2DD4BF]/40",
  "bg-[#151B24] border-[#2DD4BF]/50 shadow-sm ring-1 ring-[#2DD4BF]/30"
);

// hover text for word
code = code.replace(
  'group-hover:text-[#2DD4BF]',
  'group-hover:text-[#7DD3FC]'
);

// 0x{word} value in footer
code = code.replace(
  'text-[#2DD4BF] font-semibold">0x{word}</span>',
  'text-[#7DD3FC] font-semibold">0x{word}</span>'
);

// activeByteIndex container
code = code.replace(
  "bg-[#2DD4BF]/15 border-[#2DD4BF] text-[#2DD4BF] shadow-sm ring-1 ring-[#2DD4BF]/40",
  "bg-[#2DD4BF]/15 border-[#2DD4BF]/60 text-[#2DD4BF] shadow-sm ring-1 ring-[#2DD4BF]/40"
);

// Binary bit isHovered
code = code.replace(
  "bg-[#2DD4BF] text-[#090A0F] font-extrabold scale-125 z-10 shadow-sm",
  "bg-[#2DD4BF] text-[#0A0D12] font-extrabold scale-125 z-10 shadow-sm"
);

// Binary bit isOne
code = code.replace(
  "bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 hover:border-[#2DD4BF] font-semibold",
  "bg-[#7DD3FC]/15 text-[#7DD3FC] border border-[#7DD3FC]/30 hover:border-[#7DD3FC]/60 font-semibold"
);

// And wait, the Check icon in the copy button might have been replaced to text-[#2DD4BF], let's check
fs.writeFileSync('src/components/HashVisualizer.tsx', code);
