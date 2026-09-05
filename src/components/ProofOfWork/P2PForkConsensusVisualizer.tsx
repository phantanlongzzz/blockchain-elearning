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
}

export const P2PForkConsensusVisualizer: React.FC<P2PForkConsensusVisualizerProps> = ({ 
  blockchain, 
  appState,
  focusedBlockIndex,
  navigateTimeline,
  scrollToLatestBlock
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
    minerRole: 'Miner',
    branch: 'trunk',
    status: 'canonical',
    isLeading: i === visibleBlockchain.length - 1,
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
      const blockEl = document.getElementById(`p2p-block-${focusedBlockIndex}`);
      if (blockEl) {
        blockEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        treeScrollRef.current.scrollTo({ left: treeScrollRef.current.scrollWidth, behavior: 'smooth' });
      }
    }
  }, [focusedBlockIndex, trunk.length]);

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
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 mr-2">
              <Network size={12} className="text-text-muted" />
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
        <div className="relative min-h-[340px] flex items-center bg-[#0E131A] rounded-xl border border-slate-800/50 p-6 overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.3 }} />
          
          <div ref={treeScrollRef} className="w-full overflow-x-auto custom-scrollbar relative z-10 pb-4">
            <div className="flex items-center gap-12 min-w-max px-8 py-16">
              {trunk.map((blk, idx) => {
                const isGenesis = blk.blockNumber === 0;
                return (
                  <div key={blk.id} id={`p2p-block-${blk.blockNumber}`} className="relative flex flex-col items-center group">
                    <div className="absolute -top-8 text-[10px] font-mono text-slate-500">
                      #{blk.displayNumber}
                    </div>
                    {idx < trunk.length - 1 && (
                      <div className="absolute left-[100%] top-1/2 -translate-y-1/2 w-12 flex items-center z-0">
                        <div className="h-0.5 w-full bg-emerald-500/40 relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-border-secondary rotate-45" />
                        </div>
                      </div>
                    )}
                    <div
                      onClick={() => setSelectedBlock(blk)}
                      className={`relative z-10 w-32 rounded-xl border p-3 cursor-pointer transition-all duration-300 bg-[#0A0D12] ${
                        blk.isLeading 
                          ? 'border-border-primary ring-1 ring-white/20' 
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${blk.isLeading ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
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
                          <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center border border-border-primary text-text-muted">
                            <Box size={20} />
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <div className={`text-xs font-medium truncate ${blk.isLeading ? 'text-text-primary font-semibold' : 'text-slate-300'}`}>
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
