import fs from 'fs';

const file = 'src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx';
const content = fs.readFileSync(file, 'utf-8');

const returnIndex = content.indexOf('  return (\n    <div className="w-full flex flex-col');
if (returnIndex === -1) {
  console.log("Could not find return statement");
  process.exit(1);
}

const beforeReturn = content.substring(0, returnIndex);

const newUI = `  return (
    <div className="w-full flex flex-col gap-8 font-sans select-none pb-12">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-transparent gap-4">
        
        {/* Playback Controls */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex bg-[#0C0F14] border border-slate-800 p-1 rounded-[10px]">
            <button
              onClick={() => {
                if (!isPlaying && elapsedSeconds >= duration) handleReset();
                setIsPlaying(!isPlaying);
              }}
              className={\`w-9 h-9 flex items-center justify-center rounded-[6px] transition-colors cursor-pointer \${
                isPlaying 
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-white text-black hover:bg-slate-200'
              }\`}
            >
              {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
            </button>
            <button
              onClick={handleReset}
              className="w-9 h-9 flex items-center justify-center rounded-[6px] text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <div className="font-medium text-slate-500">{isVi ? 'Tốc độ' : 'Speed'}</div>
            <div className="flex gap-3 font-mono text-slate-400">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaySpeed(spd)}
                  className={\`transition-colors cursor-pointer \${
                    playSpeed === spd ? 'text-white' : 'hover:text-slate-300'
                  }\`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <div className="font-medium text-slate-500">{isVi ? 'Thời lượng' : 'Duration'}</div>
            <div className="flex gap-3 font-mono text-slate-400">
              {[
                { label: '30s', val: 30 },
                { label: '1m', val: 60 },
                { label: '2m', val: 120 },
                { label: '5m', val: 300 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => {
                    setDuration(item.val);
                    if (!isPlaying) setElapsedSeconds(0);
                  }}
                  className={\`transition-colors cursor-pointer \${
                    duration === item.val ? 'text-white' : 'hover:text-slate-300'
                  }\`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Progress & Status */}
        <div className="flex items-center gap-8">
           <div className="flex flex-col text-right gap-1.5">
             <div className="text-xs font-medium text-slate-500">{currentStageText}</div>
             <div className="text-sm font-mono text-slate-300 tabular-nums flex items-center justify-end gap-2">
               <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                 <div className="h-full bg-white transition-all duration-300 ease-linear" style={{ width: \`\${Math.min(100, (elapsedSeconds / duration) * 100)}%\` }} />
               </div>
               {formatTime(elapsedSeconds)} / {formatTime(duration)}
             </div>
           </div>
           <div className="flex flex-col text-right gap-1.5 border-l border-slate-800 pl-8">
             <div className="text-xs font-medium text-slate-500">{isVi ? 'Tổng khối' : 'Total Blocks'}</div>
             <div className="text-sm font-mono text-slate-300 tabular-nums">
               {trunk.length + (activeFork ? activeFork.branchA.length + activeFork.branchB.length : 0) + staleBranches.reduce((acc, b) => acc + b.length, 0) - 1}
             </div>
           </div>
        </div>
      </div>

      {/* MEMPOOL VISUALIZER */}
      <div className="flex flex-col gap-3">
        <div className="text-sm font-sans font-medium text-slate-400 pl-1">
          Mempool
        </div>
        <div className="bg-[#0C0F14] rounded-[16px] border border-slate-800 p-6 w-full">
          <div ref={mempoolScrollRef} className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
            {INITIAL_MEMPOOL_TXS.map((tx) => (
              <div 
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="relative p-3 rounded-[10px] transition-all duration-150 flex flex-col justify-between min-w-[120px] h-[72px] shrink-0 cursor-pointer select-none border box-border bg-[#11161D] border-slate-800 text-slate-300 hover:border-slate-600"
              >
                <div className="flex items-center justify-between mb-2 w-full">
                  <span className="font-mono font-medium text-[12px] text-white">
                    {tx.txCode}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {tx.amount}
                  </span>
                </div>
                <div className="text-[11px] font-sans text-slate-500 flex items-center justify-between">
                  <span>{tx.from}</span> <span className="text-slate-600">→</span> <span>{tx.to}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BLOCKCHAIN VISUALIZATION ARENA */}
      <div className="flex flex-col gap-3">
        <div className="text-sm font-sans font-medium text-slate-400 pl-1">
          Blockchain
        </div>
        <div 
          ref={treeScrollRef}
          className="w-full overflow-x-auto overflow-y-hidden bg-[#0C0F14] border border-slate-800 rounded-[16px] min-h-[340px] flex items-center p-8 custom-scrollbar scroll-smooth"
        >
          <div className="flex items-center min-w-max relative py-16">
            {trunk.map((blk, idx) => {
              const isLastTrunk = idx === trunk.length - 1;
              const hasForkNext = isLastTrunk && activeFork !== null;
              const stales = staleBranches.filter(branch => branch[0].prevHash === blk.hash);

              return (
                <React.Fragment key={blk.id}>
                  <div className="flex flex-col relative shrink-0">
                    <CompactBlockCard 
                      block={blk} 
                      onClick={() => setSelectedBlock(blk)} 
                      isVi={isVi} 
                    />
                    
                    {/* Render stale blocks hanging off this trunk block */}
                    {stales.map((staleBranch, sIdx) => (
                      <div key={staleBranch[0].id} className="absolute left-[80px] flex items-center shrink-0" style={{ top: \`\${(sIdx + 1) * 80}px\` }}>
                        {/* Connector down then right */}
                        <div className="w-4 h-full absolute -left-4 top-0 border-l border-b border-slate-700/60 rounded-bl-[10px]" style={{ height: '40px', transform: 'translateY(-40px)' }} />
                        
                        <div className="flex items-center">
                          {staleBranch.map((staleBlock, sbIdx) => (
                            <React.Fragment key={staleBlock.id}>
                              <CompactBlockCard block={staleBlock} onClick={() => setSelectedBlock(staleBlock)} isVi={isVi} />
                              {sbIdx < staleBranch.length - 1 && (
                                <div className="w-6 h-px bg-slate-700 shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main line connection */}
                  {!hasForkNext && idx < trunk.length - 1 && (
                    <div className="w-6 h-px bg-slate-700 shrink-0" />
                  )}

                  {/* Fork Junction */}
                  {hasForkNext && (
                    <div className="flex items-center relative z-0 px-2 shrink-0">
                      <div className="w-4 h-px bg-slate-700" />
                      <div className="w-px h-[100px] bg-slate-700 relative flex flex-col justify-between items-center">
                        <div className="w-4 h-px bg-slate-700 self-start absolute top-0 left-0" />
                        <div className="w-4 h-px bg-slate-700 self-start absolute bottom-0 left-0" />
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#0C0F14] border border-slate-700 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded-[6px] z-20">
                          Fork
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Active Fork Branches */}
            {activeFork && (
              <div className="flex flex-col gap-8 z-10 shrink-0 py-1 pl-1">
                {/* BRANCH A */}
                <div className="flex items-center min-h-[60px]">
                  {activeFork.branchA.map((blk, bIdx) => (
                    <React.Fragment key={blk.id}>
                      <CompactBlockCard block={blk} onClick={() => setSelectedBlock(blk)} isVi={isVi} />
                      {bIdx < activeFork.branchA.length - 1 && (
                        <div className="w-6 h-px bg-slate-700 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                {/* BRANCH B */}
                <div className="flex items-center min-h-[60px]">
                  {activeFork.branchB.map((blk, bIdx) => (
                    <React.Fragment key={blk.id}>
                      <CompactBlockCard block={blk} onClick={() => setSelectedBlock(blk)} isVi={isVi} />
                      {bIdx < activeFork.branchB.length - 1 && (
                        <div className="w-6 h-px bg-slate-700 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedBlock && (
        <BlockDetailModal block={selectedBlock} onClose={() => setSelectedBlock(null)} isVi={isVi} />
      )}
      {selectedTx && (
        <TxDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} isVi={isVi} />
      )}
    </div>
  );
};

const CompactBlockCard: React.FC<{ block: P2PBlock; onClick: () => void; isVi: boolean }> = ({ block, onClick, isVi }) => {
  const isGenesis = block.minerName === 'Genesis';
  const isStale = block.status === 'stale';
  const isLeading = block.status === 'competing' && block.isLeading;
  const mTheme = isGenesis ? GENESIS_THEME : getMinerColorTheme(block.minerName, block.blockNumber);

  return (
    <div
      onClick={onClick}
      title={isVi ? \`Khối #\${block.displayNumber} - \${block.minerName}\` : \`Block #\${block.displayNumber} - \${block.minerName}\`}
      className={\`relative p-2 rounded-[10px] transition-all duration-150 flex flex-col items-center justify-between w-[80px] h-[64px] shrink-0 cursor-pointer select-none border box-border \${
        isStale
          ? 'bg-transparent border-dashed border-slate-700/60 opacity-50 text-slate-500 hover:opacity-100 hover:bg-[#11161D]'
          : isLeading
          ? 'border-[#EAB308] bg-[#0E131A] hover:bg-[#131922]'
          : \`\${mTheme.border} \${mTheme.bg} hover:border-slate-500 hover:bg-[#0E131A]\`
      }\`}
    >
      <div className={\`text-sm font-mono font-bold tabular-nums tracking-wider \${
        isStale ? 'text-slate-500' : isLeading ? 'text-[#EAB308]' : mTheme.text
      }\`}>
        #{block.displayNumber}
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-sans font-medium text-slate-300 truncate w-full px-1">
        <span 
          className="w-1.5 h-1.5 rounded-[6px] shrink-0" 
          style={{ backgroundColor: isStale ? '#64748b' : mTheme.primary }}
        />
        <span className="truncate">{block.minerName}</span>
      </div>
    </div>
  );
};

const BlockDetailModal: React.FC<{ block: P2PBlock; onClose: () => void; isVi: boolean }> = ({ block, onClose, isVi }) => {
  const isGenesis = block.minerName === 'Genesis';
  const mTheme = isGenesis ? GENESIS_THEME : getMinerColorTheme(block.minerName, block.blockNumber);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-[#0C0F14] border border-slate-800 rounded-[16px] p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className={\`text-sm font-mono px-2 py-1 rounded-[6px] border font-bold \${mTheme.badge}\`}>
              #{block.displayNumber}
            </span>
            <span className="text-base font-sans font-medium text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-[6px]" style={{ backgroundColor: mTheme.primary }} />
              <span>{block.minerName}</span>
            </span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white cursor-pointer px-1 text-lg font-mono transition-colors">✕</button>
        </div>
        
        <div className="flex flex-col gap-2 font-mono text-sm">
          <div className="flex justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-500">{isVi ? 'Độ khó (PoW):' : 'Difficulty (PoW):'}</span>
            <span className="text-emerald-400 font-medium">{block.cumulativeWork}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-500">Nonce:</span>
            <span className="text-slate-300 font-medium">{block.nonce}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-500">{isVi ? 'Thời gian:' : 'Timestamp:'}</span>
            <span className="text-slate-300">{block.timestamp}</span>
          </div>
          
          <div className="flex flex-col gap-1.5 py-2 border-b border-slate-800/60">
            <span className="text-slate-500">Hash:</span>
            <span className="text-emerald-300 break-all text-xs bg-[#11161D] p-2 rounded-[6px] border border-slate-800">{block.hash}</span>
          </div>
          <div className="flex flex-col gap-1.5 py-2">
            <span className="text-slate-500">Previous Hash:</span>
            <span className="text-slate-400 break-all text-xs bg-[#11161D] p-2 rounded-[6px] border border-slate-800">{block.prevHash}</span>
          </div>
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/60 mt-1">
            <span className="text-slate-500">{isVi ? 'Giao dịch:' : 'Transactions:'}</span>
            <div className="bg-[#11161D] p-2 rounded-[6px] border border-slate-800 flex flex-col gap-1 text-xs text-slate-300">
              {block.txs.map((t, i) => (
                <div key={i}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TxDetailModal: React.FC<{ tx: MempoolTx; onClose: () => void; isVi: boolean }> = ({ tx, onClose, isVi }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-[#0C0F14] border border-slate-800 rounded-[16px] p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-base font-sans font-medium text-white">
            {tx.txCode}
          </span>
          <button onClick={onClose} className="text-slate-500 hover:text-white cursor-pointer px-1 text-lg font-mono transition-colors">✕</button>
        </div>
        <div className="flex flex-col gap-2 font-mono text-sm">
          <div className="flex justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-500">{isVi ? 'Từ:' : 'From:'}</span>
            <span className="font-medium text-white">{tx.from}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-500">{isVi ? 'Đến:' : 'To:'}</span>
            <span className="font-medium text-white">{tx.to}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-500">{isVi ? 'Số lượng:' : 'Amount:'}</span>
            <span className="font-medium text-emerald-400">{tx.amount} BTC</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">{isVi ? 'Phí:' : 'Fee:'}</span>
            <span className="text-slate-300">{tx.fee} BTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

const finalContent = beforeReturn + newUI;
fs.writeFileSync(file, finalContent);
