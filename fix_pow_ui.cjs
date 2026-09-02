const fs = require('fs');
let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');

// 1. Add ID to block div
content = content.replace(
  `onClick={() => setSelectedBlock(block)}`,
  `id={\`timeline-block-\${block.index}\`}
                        onClick={() => setSelectedBlock(block)}`
);

// 2. Add navigation buttons
const searchStr = `<span className="text-xs font-mono text-slate-400">
                    {isVi ? \`Tổng: \${blockchain.length}\` : \`Total: \${blockchain.length}\`}
                  </span>`;

const replaceStr = `<span className="text-xs font-mono text-slate-400 mr-2">
                    {isVi ? \`Tổng: \${blockchain.length}\` : \`Total: \${blockchain.length}\`}
                  </span>
                  <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
                    <button
                      onClick={() => navigateTimeline('prev')}
                      disabled={focusedBlockIndex === 0}
                      className="px-2 py-1 rounded bg-[#11161D] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-mono"
                    >
                      <ChevronLeft size={12} />
                      {isVi ? 'Trước' : 'Prev'}
                    </button>
                    <button
                      onClick={() => navigateTimeline('next')}
                      disabled={focusedBlockIndex >= blockchain.length - 1}
                      className="px-2 py-1 rounded bg-[#11161D] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-mono"
                    >
                      {isVi ? 'Sau' : 'Next'}
                      <ChevronRight size={12} />
                    </button>
                    {focusedBlockIndex < blockchain.length - 1 && (
                      <button
                        onClick={scrollToLatestBlock}
                        className="px-2 py-1 ml-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer text-[11px] font-mono whitespace-nowrap"
                      >
                        {isVi ? 'Mới nhất' : 'Latest'} →
                      </button>
                    )}
                  </div>`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync('src/components/ProofOfWork/PowLesson.tsx', content);
