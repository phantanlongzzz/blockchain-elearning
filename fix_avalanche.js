import fs from 'fs';

const file = 'src/components/AvalancheVisualizer.tsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replaceAll('text-[#00C98D]">{diffResult.changedBits}', 'text-[#EAB308]">{diffResult.changedBits}');
content = content.replaceAll('text-[#00C98D]">{inputDiff.changedBits}', 'text-[#EAB308]">{inputDiff.changedBits}');
content = content.replaceAll('text-[#00C98D] font-semibold font-mono">', 'text-[#EAB308] font-semibold font-mono">');
content = content.replaceAll('bg-[#00C98D] transition-all duration-300"', 'bg-[#EAB308] transition-all duration-300"');
content = content.replaceAll('<strong className="font-mono text-rose-400">{diffResult.changedBits}</strong>', '<strong className="font-mono text-[#EAB308]">{diffResult.changedBits}</strong>');
content = content.replaceAll('bg-rose-500 inline-block', 'bg-[#EAB308] inline-block');
content = content.replaceAll('bg-rose-500/80 text-white font-bold border border-rose-400', 'bg-[#EAB308] text-[#090A0F] font-bold border border-[#EAB308]');

fs.writeFileSync(file, content);
