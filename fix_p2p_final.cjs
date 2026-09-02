const fs = require('fs');
let content = fs.readFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', 'utf8');

// I will just use regex to replace the entire body of P2PForkConsensusVisualizer

const topPart = content.split(`export const P2PForkConsensusVisualizer: React.FC<P2PForkConsensusVisualizerProps> = ({ blockchain, appState }) => {`)[0];

const newBody = `export const P2PForkConsensusVisualizer: React.FC<P2PForkConsensusVisualizerProps> = ({ blockchain, appState }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  
  const [selectedBlock, setSelectedBlock] = useState<P2PBlock | null>(null);
  const [selectedTx, setSelectedTx] = useState<MempoolTx | null>(null);
  
  const trunk: P2PBlock[] = blockchain.length > 0 ? blockchain.map((b, i) => ({
    id: \`block-\${b.index}\`,
    blockNumber: b.index,
    displayNumber: \`\${b.index}\`,
    height: b.index,
    minerName: b.minerName || 'Genesis',
    minerRole: 'Miner',
    branch: 'trunk',
    status: 'canonical',
    isLeading: i === blockchain.length - 1,
    hash: b.hash,
    prevHash: b.prevHash,
    merkleRoot: '...',
    nonce: b.nonce,
    timestamp: b.timestamp,
    txs: [],
    coinbaseReward: 6.25,
    cumulativeWork: b.index
  })) : [{ ...GENESIS_BLOCK }];
  
  const activeFork = null;
  const staleBranches: P2PBlock[][] = [];
  
  const treeScrollRef = useRef<HTMLDivElement>(null);
  const mempoolScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (treeScrollRef.current) {
      treeScrollRef.current.scrollTo({ left: treeScrollRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, [trunk.length]);

  return (
    <div className="flex flex-col gap-4">
      {/* P2P NETWORK VISUALIZER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0D12] border border-slate-800 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-1 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <h3 className="text-xs sm:text-sm font-display font-bold text-slate-300 tracking-wider">
              {isVi ? 'Mạng Lưới P2P' : 'P2P Network'}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700/50">
              <Network size={12} className="text-emerald-400" />
              <span className="text-xs font-mono text-slate-300">4 {isVi ? 'Nút' : 'Nodes'}</span>
            </div>
          </div>
        </div>

        {/* Tree Container */}
        <div className="relative min-h-[340px] flex items-center bg-[#0E131A] rounded-xl border border-slate-800/50 p-6 overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.3 }} />
          
          <div ref={treeScrollRef} className="w-full overflow-x-auto custom-scrollbar relative z-10 pb-4">
            <div className="flex items-center gap-12 min-w-max px-8 py-16">
              {trunk.map((blk, idx) => {
                const isGenesis = blk.blockNumber === 0;
                return (
                  <div key={blk.id} className="relative flex flex-col items-center group">
                    <div className="absolute -top-8 text-[10px] font-mono text-slate-500">
                      #{blk.displayNumber}
                    </div>
                    {idx < trunk.length - 1 && (
                      <div className="absolute left-[100%] top-1/2 -translate-y-1/2 w-12 flex items-center z-0">
                        <div className="h-0.5 w-full bg-emerald-500/40 relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-emerald-500/40 rotate-45" />
                        </div>
                      </div>
                    )}
                    <div
                      onClick={() => setSelectedBlock(blk)}
                      className={\`relative z-10 w-32 rounded-xl border p-3 cursor-pointer transition-all duration-300 bg-[#0A0D12] \${
                        blk.isLeading 
                          ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' 
                          : 'border-slate-700 hover:border-slate-500'
                      }\`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={\`w-2 h-2 rounded-full \${blk.isLeading ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}\`} />
                        <span className="text-[10px] font-mono font-medium text-slate-400">
                          {blk.hash.substring(0, 8)}
                        </span>
                      </div>
                      
                      <div className="flex justify-center mb-2">
                        {isGenesis ? (
                          <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
                            <span className="text-xl">🌱</span>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                            <Box size={20} />
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <div className={\`text-xs font-medium truncate \${blk.isLeading ? 'text-emerald-400' : 'text-slate-300'}\`}>
                          {blk.minerName}
                        </div>
                        {!isGenesis && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {blk.minerRole}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', topPart + newBody);
