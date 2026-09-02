import fs from 'fs';

let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');

// 1. Auto Focus
content = content.replace(
`  // Event-based smart camera: Auto-scroll blockchain timeline to newly mined / leading block
  useEffect(() => {
    if (!autoFollow || userScrolledAwayRef.current) return;
    if (timelineScrollRef.current && blockchain.length > 1) {`,
`  // Event-based smart camera: Auto-scroll blockchain timeline to newly mined / leading block
  useEffect(() => {
    if (!autoFollow) return;
    
    // Auto-focus rule: return focus to the new event (new block mined)
    userScrolledAwayRef.current = false;
    setIsAutoFollowPaused(false);
    
    if (timelineScrollRef.current && blockchain.length > 0) {`
);

// 2. Language fixes for view selector
content = content.replace(
  `{isVi ? 'CHẾ ĐỘ MÔ PHỎNG CHUỖI KHỐI' : 'BLOCKCHAIN VISUALIZATION MODE'}`,
  `{isVi ? 'CHẾ ĐỘ MÔ PHỎNG' : 'VISUALIZATION MODE'}`
);

content = content.replace(
  `{isVi ? 'Mạng P2P & Phân Nhánh (Fork & Longest Chain)' : 'P2P Network & Fork Resolution'}`,
  `{isVi ? 'Mạng P2P & Phân nhánh' : 'P2P Network'}`
);

content = content.replace(
  `{isVi ? 'Chuỗi Tuyến Tính (Live Mining Timeline)' : 'Linear Mining Timeline'}`,
  `{isVi ? 'Chuỗi tuyến tính' : 'Linear Timeline'}`
);

// 3. Compact blocks and removal of huge empty space
// We want to replace the timeline render block. Let's find the exact section.
const timelineStartIdx = content.indexOf(`{/* HORIZONTAL BLOCKCHAIN TIMELINE */}`);
const timelineEndIdx = content.indexOf(`{/* LAYER 4: COLLAPSIBLE TELEMETRY & LOGS`);

if (timelineStartIdx !== -1 && timelineEndIdx !== -1) {
  const newTimelineHTML = `
            {/* HORIZONTAL BLOCKCHAIN TIMELINE */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0D12] border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 px-1 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h3 className="text-xs sm:text-sm font-display font-bold text-slate-300 tracking-wider">
                    {isVi ? 'Chuỗi khối' : 'Blockchain'}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-mono text-slate-400">
                    {isVi ? \`Tổng: \${blockchain.length}\` : \`Total: \${blockchain.length}\`}
                  </span>
                </div>
              </div>

              <div 
                ref={timelineScrollRef}
                onScroll={handleTimelineScroll}
                className="flex overflow-x-auto py-3 pb-4 gap-3 items-center custom-scrollbar px-2 max-w-full"
              >
                {blockchain.map((block, idx) => {
                  const isLatestTip = idx === blockchain.length - 1 && blockchain.length > 1;
                  const theme = getMinerTheme(block.minerName, block.index);
                  const isGenesis = block.index === 0;

                  return (
                    <React.Fragment key={\`\${block.index}-\${block.hash}\`}>
                      <div 
                        onClick={() => setSelectedBlock(block)}
                        className={\`relative py-3 px-4 rounded-xl transition-all duration-200 flex flex-col items-center justify-center w-[90px] shrink-0 cursor-pointer select-none border box-border \${
                          isLatestTip 
                            ? 'border-[#00C98D] bg-[#00C98D]/10' 
                            : \`\${theme.border} \${theme.bg} hover:border-slate-400 hover:bg-[#0E131A]\`
                        }\`}
                      >
                        <div className={\`text-2xl font-mono font-bold tracking-wider \${isGenesis ? 'text-slate-300' : theme.text} mb-1\`}>
                          #{block.index}
                        </div>
                        <div className="text-center w-full">
                          {isGenesis ? (
                            <span className="font-sans font-medium text-slate-400 text-xs truncate block w-full">Genesis</span>
                          ) : (
                            <span className={\`font-sans font-medium text-xs truncate block w-full \${theme.text}\`}>
                              {block.minerName}
                            </span>
                          )}
                        </div>
                      </div>
                      {idx < blockchain.length - 1 && (
                        <div className="w-4 h-px bg-slate-700 relative shrink-0">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-[3px] border-y-transparent border-l-[5px] border-l-slate-500" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        `;
  
  content = content.substring(0, timelineStartIdx) + newTimelineHTML.trim() + '\n\n        ' + content.substring(timelineEndIdx);
}

fs.writeFileSync('src/components/ProofOfWork/PowLesson.tsx', content);
