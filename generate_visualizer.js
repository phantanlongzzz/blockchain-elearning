const fs = require('fs');

const code = `
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { getMinerColorTheme, GENESIS_THEME } from '../../utils/minerColors';

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

export const P2PForkConsensusVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Controls
  const [duration, setDuration] = useState<number>(60);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Blockchain State
  const [trunk, setTrunk] = useState<P2PBlock[]>([GENESIS_BLOCK]);
  const [activeFork, setActiveFork] = useState<{ branchA: P2PBlock[], branchB: P2PBlock[] } | null>(null);
  const [staleBlocks, setStaleBlocks] = useState<P2PBlock[]>([]);
  
  // Mining stats
  const [lastMiner, setLastMiner] = useState<string>('');
  const [minerStreak, setMinerStreak] = useState<number>(0);
  const [blockCounter, setBlockCounter] = useState<number>(1);

  // UI State
  const [selectedBlock, setSelectedBlock] = useState<P2PBlock | null>(null);
  const [selectedTx, setSelectedTx] = useState<MempoolTx | null>(null);
  const [currentStageText, setCurrentStageText] = useState(isVi ? 'Đang Khai Thác' : 'Mining Blocks');

  // Refs for loop
  const stateRef = useRef({
    trunk, activeFork, staleBlocks, lastMiner, minerStreak, blockCounter, isPlaying, playSpeed, duration, elapsedSeconds,
    miningCountdown: 0
  });
  
  // Auto-focus Refs
  const treeScrollRef = useRef<HTMLDivElement>(null);
  const mempoolScrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    stateRef.current = { trunk, activeFork, staleBlocks, lastMiner, minerStreak, blockCounter, isPlaying, playSpeed, duration, elapsedSeconds, miningCountdown: stateRef.current.miningCountdown };
  }, [trunk, activeFork, staleBlocks, lastMiner, minerStreak, blockCounter, isPlaying, playSpeed, duration, elapsedSeconds]);

  const moveCameraToFocus = useCallback(() => {
    if (treeScrollRef.current) {
      treeScrollRef.current.scrollTo({ left: treeScrollRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, []);

  const createBlock = (parent: P2PBlock, minerInfo: typeof MINERS[0], branch: 'trunk'|'branchA'|'branchB', specificHeight?: number): P2PBlock => {
    const height = specificHeight ?? (parent.height + 1);
    const nonce = Math.floor(Math.random() * 100000);
    const mins = Math.floor(stateRef.current.elapsedSeconds / 60);
    const secs = Math.floor(stateRef.current.elapsedSeconds % 60);
    return {
      id: \`block-\${Math.random().toString(36).substring(2, 9)}\`,
      blockNumber: height,
      displayNumber: \`\${height}\${branch === 'branchA' ? 'A' : branch === 'branchB' ? 'B' : ''}\`,
      height,
      minerName: minerInfo.name,
      minerRole: minerInfo.role,
      branch,
      status: branch === 'trunk' ? 'canonical' : 'competing',
      isLeading: true,
      hash: generateHash(parent.hash, nonce),
      prevHash: parent.hash,
      merkleRoot: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      nonce,
      timestamp: \`00:\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`,
      txs: [\`Coinbase: 6.25 BTC → \${minerInfo.name}\`, 'Random Tx...'],
      coinbaseReward: 6.25,
      cumulativeWork: parent.cumulativeWork + 1,
    };
  };

  const processMiningRound = () => {
    const st = stateRef.current;
    
    if (st.activeFork) {
      // Fork is active, miners compete on branches
      const miner = getWeightedMiner(st.lastMiner, st.minerStreak);
      const newStreak = miner.name === st.lastMiner ? st.minerStreak + 1 : 1;
      
      const tie = Math.random() < 0.15; // 15% chance to extend both simultaneously (very rare)
      if (tie) {
        const minerB = getWeightedMiner(miner.name, 1);
        const parentA = st.activeFork.branchA[st.activeFork.branchA.length - 1];
        const parentB = st.activeFork.branchB[st.activeFork.branchB.length - 1];
        const blockA = createBlock(parentA, miner, 'branchA');
        const blockB = createBlock(parentB, minerB, 'branchB');
        setActiveFork({
          branchA: [...st.activeFork.branchA, blockA],
          branchB: [...st.activeFork.branchB, blockB]
        });
        setLastMiner(miner.name);
        setMinerStreak(newStreak);
        setCurrentStageText(isVi ? 'Kéo Dài Nhánh' : 'Branch Extension');
        setTimeout(moveCameraToFocus, 100);
        return;
      }
      
      const extendA = Math.random() > 0.5;
      if (extendA) {
        const parentA = st.activeFork.branchA[st.activeFork.branchA.length - 1];
        const blockA = createBlock(parentA, miner, 'branchA');
        const newBranchA = [...st.activeFork.branchA, blockA];
        
        if (newBranchA.length > st.activeFork.branchB.length) {
          // Branch A wins!
          const newTrunk = [...st.trunk];
          newBranchA.forEach(b => {
             b.status = 'canonical';
             b.branch = 'trunk';
             b.displayNumber = \`\${b.height}\`;
             newTrunk.push(b);
          });
          const stales = [...st.staleBlocks];
          st.activeFork.branchB.forEach(b => {
             b.status = 'stale';
             stales.push(b);
          });
          setTrunk(newTrunk);
          setStaleBlocks(stales);
          setActiveFork(null);
          setCurrentStageText(isVi ? 'Đồng Thuận & Loại Bỏ Khối Cũ' : 'Consensus & Stale Blocks');
        } else {
          setActiveFork({ ...st.activeFork, branchA: newBranchA });
          setCurrentStageText(isVi ? 'Kéo Dài Nhánh' : 'Branch Extension');
        }
      } else {
        const parentB = st.activeFork.branchB[st.activeFork.branchB.length - 1];
        const blockB = createBlock(parentB, miner, 'branchB');
        const newBranchB = [...st.activeFork.branchB, blockB];
        
        if (newBranchB.length > st.activeFork.branchA.length) {
          // Branch B wins!
          const newTrunk = [...st.trunk];
          newBranchB.forEach(b => {
             b.status = 'canonical';
             b.branch = 'trunk';
             b.displayNumber = \`\${b.height}\`;
             newTrunk.push(b);
          });
          const stales = [...st.staleBlocks];
          st.activeFork.branchA.forEach(b => {
             b.status = 'stale';
             stales.push(b);
          });
          setTrunk(newTrunk);
          setStaleBlocks(stales);
          setActiveFork(null);
          setCurrentStageText(isVi ? 'Đồng Thuận & Loại Bỏ Khối Cũ' : 'Consensus & Stale Blocks');
        } else {
          setActiveFork({ ...st.activeFork, branchB: newBranchB });
          setCurrentStageText(isVi ? 'Kéo Dài Nhánh' : 'Branch Extension');
        }
      }
      setLastMiner(miner.name);
      setMinerStreak(newStreak);
      
    } else {
      // No active fork
      const isFork = Math.random() < 0.15; // 15% chance to create a fork
      if (isFork) {
        const minerA = getWeightedMiner();
        const minerB = getWeightedMiner(minerA.name, 1);
        const parent = st.trunk[st.trunk.length - 1];
        
        const blockA = createBlock(parent, minerA, 'branchA', parent.height + 1);
        const blockB = createBlock(parent, minerB, 'branchB', parent.height + 1);
        
        setActiveFork({ branchA: [blockA], branchB: [blockB] });
        setCurrentStageText(isVi ? 'Phân Nhánh Xảy Ra!' : 'Fork Occurs!');
      } else {
        const miner = getWeightedMiner(st.lastMiner, st.minerStreak);
        const newStreak = miner.name === st.lastMiner ? st.minerStreak + 1 : 1;
        const parent = st.trunk[st.trunk.length - 1];
        
        const newBlock = createBlock(parent, miner, 'trunk');
        
        setTrunk([...st.trunk, newBlock]);
        setLastMiner(miner.name);
        setMinerStreak(newStreak);
        setCurrentStageText(isVi ? 'Khai Thác Khối Mới' : 'Mining Blocks');
      }
    }
    setTimeout(moveCameraToFocus, 100);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const tickIntervalMs = 250;
    const interval = setInterval(() => {
      const st = stateRef.current;
      const stepSeconds = (tickIntervalMs / 1000) * st.playSpeed;
      
      setElapsedSeconds(prev => {
        const next = prev + stepSeconds;
        if (next >= st.duration) {
          setIsPlaying(false);
          setCurrentStageText(isVi ? 'Hoàn Thành Mô Phỏng' : 'Simulation Completed');
          return st.duration;
        }
        return next;
      });

      // Handle mining countdown
      stateRef.current.miningCountdown -= stepSeconds;
      if (stateRef.current.miningCountdown <= 0) {
        processMiningRound();
        
        // Calculate new random interval based on duration to hit target blocks
        const targetBlocks = st.duration === 30 ? 8 : st.duration === 60 ? 15 : st.duration === 120 ? 25 : 55;
        const avgInterval = st.duration / targetBlocks;
        const randomInterval = avgInterval * (0.6 + Math.random() * 0.8); // +/- 40% variance
        stateRef.current.miningCountdown = randomInterval;
      }
      
    }, tickIntervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, moveCameraToFocus, isVi]);

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedSeconds(0);
    setTrunk([{ ...GENESIS_BLOCK }]);
    setActiveFork(null);
    setStaleBlocks([]);
    setLastMiner('');
    setMinerStreak(0);
    setBlockCounter(1);
    setCurrentStageText(isVi ? 'Đang Khai Thác' : 'Mining Blocks');
    stateRef.current.miningCountdown = 0;
    setTimeout(() => {
      if (treeScrollRef.current) {
        treeScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none pb-12">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#11161D] border border-slate-800 rounded-2xl p-3 gap-3">
        
        {/* Playback Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-[#0C0F14] border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => {
                if (!isPlaying && elapsedSeconds >= duration) handleReset();
                setIsPlaying(!isPlaying);
              }}
              className={\`w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer \${
                isPlaying 
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
              }\`}
            >
              {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-1" />}
            </button>
            <button
              onClick={handleReset}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-display font-semibold text-slate-400">
              {isVi ? 'Tốc độ:' : 'Speed:'}
            </span>
            <div className="flex bg-[#0C0F14] border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaySpeed(spd)}
                  className={\`px-2 py-0.5 rounded-lg font-semibold transition-all \${
                    playSpeed === spd
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  } cursor-pointer\`}
                >
                  {spd}×
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-display font-semibold text-slate-400">
              {isVi ? 'Thời lượng:' : 'Duration:'}
            </span>
            <div className="flex bg-[#0C0F14] border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
              {[
                { label: '30s', val: 30 },
                { label: isVi ? '1 phút' : '1 min', val: 60 },
                { label: isVi ? '2 phút' : '2 min', val: 120 },
                { label: isVi ? '5 phút' : '5 min', val: 300 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => {
                    setDuration(item.val);
                    if (!isPlaying) setElapsedSeconds(0);
                  }}
                  className={\`px-2.5 py-0.5 rounded-lg transition-all \${
                    duration === item.val
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  } cursor-pointer\`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Progress */}
        <div className="flex flex-col items-end min-w-[120px]">
          <div className="flex items-center gap-2 mb-1.5">
            <Clock size={12} className="text-slate-400" />
            <span className="text-sm font-mono font-bold text-white tracking-widest tabular-nums">
              {formatTime(elapsedSeconds)} / {formatTime(duration)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300 ease-linear"
              style={{ width: \`\${Math.min(100, (elapsedSeconds / duration) * 100)}%\` }}
            />
          </div>
        </div>
      </div>

      {/* STATUS BAR */}
      <div className="flex items-center gap-2 py-1">
        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          {currentStageText}
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-[#0C0F14] border border-slate-800 text-slate-300 text-xs font-mono">
          {isVi ? 'Tổng số khối:' : 'Total Blocks:'} {trunk.length + (activeFork ? activeFork.branchA.length + activeFork.branchB.length : 0) + staleBlocks.length}
        </div>
      </div>

      {/* BLOCKCHAIN VISUALIZATION ARENA */}
      <div 
        ref={treeScrollRef}
        className="w-full overflow-x-auto overflow-y-hidden bg-[#0C0F14] border border-slate-800 rounded-2xl min-h-[300px] flex items-center p-6 custom-scrollbar scroll-smooth"
      >
        <div className="flex items-center min-w-max relative py-12">
          {trunk.map((blk, idx) => {
            const isLastTrunk = idx === trunk.length - 1;
            const hasForkNext = isLastTrunk && activeFork !== null;
            const stales = staleBlocks.filter(s => s.prevHash === blk.hash);

            return (
              <React.Fragment key={blk.id}>
                <div className="flex flex-col relative shrink-0">
                  <CompactBlockCard 
                    block={blk} 
                    onClick={() => setSelectedBlock(blk)} 
                    isVi={isVi} 
                  />
                  
                  {/* Render stale blocks hanging off this trunk block */}
                  {stales.map((stale, sIdx) => (
                    <div key={stale.id} className="absolute left-[80px] flex items-center shrink-0" style={{ top: \`\${(sIdx + 1) * 80}px\` }}>
                      {/* Connector down then right */}
                      <div className="w-4 h-full absolute -left-4 top-0 border-l-2 border-b-2 border-slate-700/60 rounded-bl-lg" style={{ height: '30px', transform: 'translateY(-30px)' }} />
                      <CompactBlockCard block={stale} onClick={() => setSelectedBlock(stale)} isVi={isVi} />
                    </div>
                  ))}
                </div>

                {/* Main line connection */}
                {!hasForkNext && idx < trunk.length - 1 && (
                  <div className="w-4 h-0.5 bg-slate-700 shrink-0" />
                )}

                {/* Fork Junction */}
                {hasForkNext && (
                  <div className="flex items-center relative z-0 px-1 shrink-0">
                    <div className="w-4 h-0.5 bg-slate-700" />
                    <div className="w-0.5 h-[90px] bg-slate-700 relative flex flex-col justify-between items-center">
                      <div className="w-4 h-0.5 bg-slate-700 self-start absolute top-0 left-0" />
                      <div className="w-4 h-0.5 bg-slate-700 self-start absolute bottom-0 left-0" />
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#0C0F14] border border-amber-500/40 text-amber-300 text-[9px] font-mono px-1.5 py-0.2 rounded z-20">
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
            <div className="flex flex-col gap-6 z-10 shrink-0 py-1 pl-1">
              {/* BRANCH A */}
              <div className="flex items-center min-h-[60px]">
                {activeFork.branchA.map((blk, bIdx) => (
                  <React.Fragment key={blk.id}>
                    <CompactBlockCard block={blk} onClick={() => setSelectedBlock(blk)} isVi={isVi} />
                    {bIdx < activeFork.branchA.length - 1 && (
                      <div className="w-4 h-0.5 bg-slate-700 shrink-0" />
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
                      <div className="w-4 h-0.5 bg-slate-700 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MEMPOOL VISUALIZER (Static visualization for aesthetic consistency) */}
      <div className="bg-[#11161D] rounded-2xl border border-slate-800 p-4 w-full">
        <h3 className="text-xs font-display font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          {isVi ? 'Mạng Lưới / Mempool (Hoạt Động Giả Lập)' : 'Network / Mempool (Simulated Activity)'}
        </h3>
        <div ref={mempoolScrollRef} className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {INITIAL_MEMPOOL_TXS.map((tx) => (
            <div 
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="relative p-2 rounded-xl transition-all duration-150 flex flex-col items-center justify-between min-w-[72px] sm:min-w-[80px] h-[60px] shrink-0 cursor-pointer select-none border box-border bg-[#0E131A] border-slate-800 text-slate-300 hover:border-slate-700"
            >
              <div className="flex items-center justify-between mb-1 w-full">
                <span className="font-bold text-[11px] text-white">
                  {tx.txCode}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {tx.amount}
                </span>
              </div>
              <div className="text-[10px] text-slate-300 font-sans truncate w-full text-center">
                <span>{tx.from}</span> → <span>{tx.to}</span>
              </div>
            </div>
          ))}
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
      title={\`Block #\${block.displayNumber} - \${block.minerName} (Click to inspect)\`}
      className={\`relative p-2 rounded-xl transition-all duration-150 flex flex-col items-center justify-between w-[80px] h-[60px] shrink-0 cursor-pointer select-none border box-border \${
        isStale
          ? 'bg-slate-950/60 border-dashed border-slate-700/60 opacity-40 text-slate-500 hover:opacity-80'
          : isLeading
          ? 'border-amber-400 bg-amber-500/10 shadow-sm ring-1 ring-amber-400/40'
          : \`\${mTheme.border} \${mTheme.bg} hover:border-slate-400 hover:bg-[#0E131A]\`
      }\`}
    >
      <div className={\`text-sm sm:text-base font-mono font-black tabular-nums tracking-wider \${
        isStale ? 'text-slate-500' : isLeading ? 'text-amber-300' : mTheme.text
      }\`}>
        #{block.displayNumber}
      </div>
      <div className="flex items-center justify-center gap-1 text-[11px] font-sans font-medium text-slate-200 truncate w-full px-1">
        <span 
          className="w-1.5 h-1.5 rounded-full shrink-0" 
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-[#0C0F14] border border-slate-800 rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-3.5">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className={\`text-xs font-mono px-2 py-0.5 rounded border font-bold \${mTheme.badge}\`}>
              Block #{block.displayNumber}
            </span>
            <span className="text-sm font-display font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: mTheme.primary }} />
              <span>{block.minerName}</span>
            </span>
            {block.status === 'canonical' && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ✓ {isVi ? 'Chuỗi chính' : 'Canonical'}
              </span>
            )}
            {block.status === 'stale' && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                ✕ {isVi ? 'Khối cũ (Stale)' : 'Stale'}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer px-1 text-sm font-mono">✕</button>
        </div>
        <div className="space-y-2 text-xs font-mono">
          <div className="bg-[#11161D] p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{isVi ? 'Thợ đào:' : 'Miner:'}</span>
              <span className="font-bold text-white">{block.minerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isVi ? 'Thời gian:' : 'Timestamp:'}</span>
              <span className="text-slate-300">{block.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isVi ? 'PoW tích lũy:' : 'Cumulative Work:'}</span>
              <span className="text-emerald-400 font-bold">{block.cumulativeWork} {isVi ? 'khối' : 'blocks'}</span>
            </div>
          </div>
          <div className="bg-[#11161D] p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500">Hash:</span>
              <span className="text-emerald-300 break-all text-[10px]">{block.hash}</span>
            </div>
            <div className="flex flex-col gap-1 pt-1 border-t border-slate-800/80">
              <span className="text-slate-500">Prev Hash:</span>
              <span className="text-slate-400 break-all text-[10px]">{block.prevHash}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-2.5 mt-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-all cursor-pointer">
          {isVi ? 'Đóng' : 'Close'}
        </button>
      </div>
    </div>
  );
};

const TxDetailModal: React.FC<{ tx: MempoolTx; onClose: () => void; isVi: boolean }> = ({ tx, onClose, isVi }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-[#0C0F14] border border-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
          <span className="text-sm font-display font-bold text-white">
            {tx.txCode} ({isVi ? 'Giao Dịch' : 'Transaction'})
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer px-1 font-mono">✕</button>
        </div>
        <div className="bg-[#11161D] p-3 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">{isVi ? 'Người gửi:' : 'Sender:'}</span>
            <span className="font-bold text-white">{tx.from}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{isVi ? 'Người nhận:' : 'Receiver:'}</span>
            <span className="font-bold text-white">{tx.to}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{isVi ? 'Số lượng:' : 'Amount:'}</span>
            <span className="font-bold text-emerald-400">{tx.amount} BTC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{isVi ? 'Phí giao dịch:' : 'Fee:'}</span>
            <span className="text-slate-300">{tx.fee} BTC</span>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-2 bg-[#11161D] hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer">
          {isVi ? 'Đóng' : 'Close'}
        </button>
      </div>
    </div>
  );
};
`

fs.writeFileSync('/tmp/new_visualizer.tsx', code);
