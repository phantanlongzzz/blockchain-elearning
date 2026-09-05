/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Network, Box } from 'lucide-react';

import { useLanguage } from '../../i18n/LanguageContext';
import { SimulationNavigation } from './SimulationNavigation';


export interface MempoolTx {
  id: string;
  txCode: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  status: 'mempool' | 'candidate_a' | 'candidate_b' | 'confirmed' | 'returned_stale';
}

export interface P2PBlock {
  id: string;
  blockNumber: number;
  displayNumber: string;
  height: number;
  minerName: string;
  minerRole: string;
  branch: 'trunk' | 'branchA' | 'branchB';
  status: 'canonical' | 'competing' | 'stale';
  isLeading?: boolean;
  hash: string;
  prevHash: string;
  merkleRoot: string;
  nonce: number;
  timestamp: string;
  txs: string[];
  coinbaseReward: number;
  cumulativeWork: number;
}

const INITIAL_MEMPOOL_TXS: MempoolTx[] = [
  { id: 'tx-1', txCode: 'TX-01', from: 'Alice', to: 'Bob', amount: 2.5, fee: 0.0005, status: 'mempool' },
  { id: 'tx-2', txCode: 'TX-02', from: 'Bob', to: 'Charlie', amount: 1.0, fee: 0.0003, status: 'mempool' },
  { id: 'tx-3', txCode: 'TX-03', from: 'Dave', to: 'Eve', amount: 0.5, fee: 0.0002, status: 'mempool' },
  { id: 'tx-4', txCode: 'TX-04', from: 'Charlie', to: 'Alice', amount: 3.2, fee: 0.0008, status: 'mempool' },
  { id: 'tx-5', txCode: 'TX-05', from: 'Eve', to: 'Frank', amount: 1.2, fee: 0.0004, status: 'mempool' },
  { id: 'tx-6', txCode: 'TX-06', from: 'Frank', to: 'Grace', amount: 0.8, fee: 0.0002, status: 'mempool' },
];

const GENESIS_BLOCK: P2PBlock = {
  id: 'block-0',
  blockNumber: 0,
  displayNumber: '0',
  height: 0,
  minerName: 'Genesis',
  minerRole: 'Network Genesis',
  branch: 'trunk',
  status: 'canonical',
  isLeading: true,
  hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
  prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
  merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
  nonce: 2083236893,
  timestamp: '00:00:00',
  txs: ['Coinbase: 50.0 BTC → Satoshi (Genesis Reward)'],
  coinbaseReward: 50.0,
  cumulativeWork: 0,
};

const MINERS = [
  { name: 'Alice', weight: 10, role: 'CPU Miner' },
  { name: 'Bob', weight: 40, role: 'GPU Miner' },
  { name: 'Charlie', weight: 80, role: 'ASIC Miner' },
  { name: 'Dave', weight: 100, role: 'Quantum Miner' },
];

function getWeightedMiner(avoidMiner?: string, streak?: number) {
  let adjusted = MINERS.map(m => ({ ...m }));
  if (avoidMiner && streak && streak >= 3) {
    const m = adjusted.find(x => x.name === avoidMiner);
    if (m) {
      m.weight = m.weight / (streak * 2); // Heavily penalize long streaks
    }
  }
  const total = adjusted.reduce((acc, m) => acc + m.weight, 0);
  let r = Math.random() * total;
  for (const m of adjusted) {
    if (r < m.weight) return m;
    r -= m.weight;
  }
  return adjusted[adjusted.length - 1];
}

function generateHash(prevHash: string, nonce: number) {
  const chars = '0123456789abcdef';
  let h = '000000';
  for (let i = 0; i < 58; i++) h += chars[Math.floor(Math.random() * chars.length)];
  return h;
}

export interface P2PForkConsensusVisualizerProps {
  blockchain: any[];
  appState: string;
  focusedBlockIndex: number;
  navigateTimeline: (direction: 'prev' | 'next') => void;
  scrollToLatestBlock: () => void;
  onSelectBlock?: (block: any) => void;
}

export const P2PForkConsensusVisualizer: React.FC<P2PForkConsensusVisualizerProps> = ({ 
  blockchain, 
  appState,
  focusedBlockIndex,
  navigateTimeline,
  scrollToLatestBlock,
  onSelectBlock
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  
  const [selectedBlock, setSelectedBlock] = useState<P2PBlock | null>(null);
  const [selectedTx, setSelectedTx] = useState<MempoolTx | null>(null);
  
  const visibleBlockchain = blockchain.slice(0, focusedBlockIndex + 1);
  const trunk: P2PBlock[] = visibleBlockchain.length > 0 ? visibleBlockchain.map((b, i) => ({
    id: `block-${b.index}`,
    blockNumber: b.index,
    displayNumber: `${b.index}`,
    height: b.index,
    minerName: b.minerName || 'Genesis',
    minerRole: b.index === 0 ? 'Network Genesis' : 'Miner',
    branch: 'trunk',
    status: 'canonical',
    isLeading: i === visibleBlockchain.length - 1 && visibleBlockchain.length > 1,
    hash: b.hash || '0000000000000000000000000000000000000000000000000000000000000000',
    prevHash: b.prevHash,
    merkleRoot: '...',
    nonce: b.nonce,
    timestamp: b.timestamp,
    txs: [],
    coinbaseReward: 6.25,
    cumulativeWork: b.index
  })) : [{ ...GENESIS_BLOCK }];
  
  const treeScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (treeScrollRef.current) {
      const blockEl = document.getElementById(`p2p-block-${focusedBlockIndex}`);
      if (blockEl) {
        blockEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        treeScrollRef.current.scrollTo({ left: treeScrollRef.current.scrollWidth, behavior: 'smooth' });
      }
    }
  }, [focusedBlockIndex, trunk.length]);

  const handleBlockClick = (blk: P2PBlock) => {
    setSelectedBlock(blk);
    if (onSelectBlock) {
      const original = blockchain.find(b => b.index === blk.blockNumber);
      if (original) onSelectBlock(original);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* P2P NETWORK VISUALIZER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0D12] border border-slate-800 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-1 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.6)] animate-pulse" />
            <h3 className="text-xs sm:text-sm font-display font-bold text-slate-300 tracking-wider">
              {isVi ? 'Mạng Lưới P2P (Chuỗi Tuyến Tính)' : 'P2P Network (Linear Chain)'}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] mr-2">
              <Network size={12} className="text-cyan-400" />
              <span className="text-xs font-mono text-slate-300">4 {isVi ? 'Nút' : 'Nodes'}</span>
            </div>
            <SimulationNavigation 
              currentIndex={focusedBlockIndex}
              totalSteps={blockchain.length}
              onPrevious={() => navigateTimeline('prev')}
              onNext={() => navigateTimeline('next')}
              onLatest={scrollToLatestBlock}
              isVi={isVi}
              prefix="#"
            />
          </div>
        </div>

        {/* Tree Container */}
        <div className="relative min-h-[340px] flex items-center bg-[#070A12]/90 rounded-xl border border-white/[0.08] p-6 overflow-hidden backdrop-blur-md">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div ref={treeScrollRef} className="w-full overflow-x-auto custom-scrollbar relative z-10 pb-4">
            <div className="flex items-center gap-10 min-w-max px-8 py-14">
              {trunk.map((blk, idx) => {
                const isGenesis = blk.blockNumber === 0;
                const isAttacker = blk.minerName?.includes('Attacker') || blk.minerName?.includes('51%');
                const isLatestTip = blk.isLeading;
                const shortHash = blk.hash && blk.hash.length >= 8 ? blk.hash.substring(0, 8) : '00000000';

                return (
                  <div key={blk.id} id={`p2p-block-${blk.blockNumber}`} className="relative flex flex-col items-center group shrink-0">
                    {/* Block Height Label */}
                    <div className="absolute -top-7 font-mono text-xs text-slate-400 font-semibold tracking-wider select-none">
                      #{blk.displayNumber}
                    </div>

                    {/* Blockchain Connection Line (Data Pipeline) */}
                    {idx < trunk.length - 1 && (
                      <div className="absolute left-[100%] top-1/2 -translate-y-1/2 w-10 flex items-center z-0">
                        <div className="h-[2px] w-full bg-gradient-to-r from-cyan-500/30 via-cyan-400 to-cyan-500/30 shadow-[0_0_8px_rgba(0,210,255,0.35)] relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-cyan-400 rotate-45 shadow-[0_0_6px_rgba(0,210,255,0.5)]" />
                        </div>
                      </div>
                    )}

                    {/* Block Card */}
                    <div
                      onClick={() => handleBlockClick(blk)}
                      className={`relative z-10 w-36 bg-[#0B101E]/75 backdrop-blur-md border rounded-xl p-3 transition-all duration-200 cursor-pointer select-none ${
                        isLatestTip 
                          ? 'border-cyan-400/60 shadow-[0_0_15px_rgba(0,210,255,0.25)] ring-1 ring-cyan-400/30' 
                          : 'border-white/[0.08] hover:border-cyan-500/40 hover:shadow-[0_0_10px_rgba(0,210,255,0.15)]'
                      }`}
                    >
                      {/* Top Bar: Status Dot & Short Hash */}
                      <div className="flex items-center justify-between gap-1.5 mb-2.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div 
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isAttacker 
                                ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]' 
                                : 'bg-cyan-400 shadow-[0_0_6px_rgba(0,210,255,0.6)]'
                            } ${isLatestTip ? 'animate-pulse' : ''}`} 
                          />
                          <span className="font-mono text-[11px] text-slate-300 truncate">
                            {shortHash}...
                          </span>
                        </div>
                        {isLatestTip && (
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-1 py-0.2 rounded shrink-0">
                            Tip
                          </span>
                        )}
                      </div>
                      
                      {/* Center Box Icon */}
                      <div className="flex justify-center mb-2.5">
                        {isGenesis ? (
                          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center border border-success/30 text-success shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            <span className="text-lg">🌱</span>
                          </div>
                        ) : (
                          <div 
                            className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                              isLatestTip
                                ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.3)]'
                                : 'bg-white/[0.04] border-white/[0.08] text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30'
                            }`}
                          >
                            <Box size={20} className={isLatestTip ? 'animate-pulse' : ''} />
                          </div>
                        )}
                      </div>

                      {/* Miner Attribution */}
                      <div className="text-center">
                        <div className={`text-xs font-semibold truncate ${
                          isAttacker ? 'text-rose-300/80' : 'text-slate-200'
                        }`}>
                          {blk.minerName}
                        </div>
                        {!isGenesis && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
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
