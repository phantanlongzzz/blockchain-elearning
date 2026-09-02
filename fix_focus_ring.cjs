const fs = require('fs');
let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');

const searchStr = `className={\`relative py-3 px-4 rounded-xl transition-all duration-200 flex flex-col items-center justify-center min-w-[100px] shrink-0 cursor-pointer select-none border box-border \${
                          isLatestTip 
                            ? 'border-[#00C98D] bg-[#00C98D]/10' 
                            : \`\${theme.border} \${theme.bg} hover:border-slate-400 hover:bg-[#0E131A]\`
                        }\`}`;

const replaceStr = `className={\`relative py-3 px-4 rounded-xl transition-all duration-200 flex flex-col items-center justify-center min-w-[100px] shrink-0 cursor-pointer select-none border box-border \${
                          isLatestTip 
                            ? 'border-[#00C98D] bg-[#00C98D]/10' 
                            : \`\${theme.border} \${theme.bg} hover:border-slate-400 hover:bg-[#0E131A]\`
                        } \${idx === focusedBlockIndex ? 'ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : ''}\`}`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync('src/components/ProofOfWork/PowLesson.tsx', content);
