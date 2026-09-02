/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
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

export const P2PForkConsensusVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Active Stage (1 to 7)
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [selectedBlock, setSelectedBlock] = useState<P2PBlock | null>(null);
  const [selectedTx, setSelectedTx] = useState<MempoolTx | null>(null);
  const [interactiveWinnerBranch, setInteractiveWinnerBranch] = useState<'branchA' | 'branchB'>('branchA');

  // Camera & Auto-Focus State
  const [autoCamera, setAutoCamera] = useState<boolean>(true);
  const [cameraPaused, setCameraPaused] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const mempoolScrollRef = useRef<HTMLDivElement>(null);
  const treeScrollRef = useRef<HTMLDivElement>(null);
  const forkJunctionRef = useRef<HTMLDivElement>(null);
  const leadingTipRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);

  // Auto-focus camera controller (Event-driven)
  const moveCameraToFocus = useCallback((target?: 'fork' | 'leading' | 'mempool' | 'start') => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = prefersReducedMotion ? 'auto' : 'smooth';

    isProgrammaticScrollRef.current = true;
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 500);

    if (target === 'mempool' || currentStage === 1) {
      if (mempoolScrollRef.current) {
        mempoolScrollRef.current.scrollTo({ left: 0, behavior });
      }
      if (treeScrollRef.current) {
        treeScrollRef.current.scrollTo({ left: 0, behavior });
      }
    } else if (target === 'fork' || currentStage === 4) {
      if (forkJunctionRef.current) {
        forkJunctionRef.current.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
      } else if (treeScrollRef.current) {
        treeScrollRef.current.scrollTo({ left: treeScrollRef.current.scrollWidth * 0.5, behavior });
      }
    } else if (target === 'leading' || currentStage >= 5) {
      if (leadingTipRef.current) {
        leadingTipRef.current.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
      } else if (treeScrollRef.current) {
        treeScrollRef.current.scrollTo({ left: treeScrollRef.current.scrollWidth, behavior });
      }
    } else if (treeScrollRef.current) {
      treeScrollRef.current.scrollTo({ left: treeScrollRef.current.scrollWidth * 0.3, behavior });
    }
  }, [currentStage]);

  // Trigger camera on stage changes
  useEffect(() => {
    if (autoCamera && !cameraPaused) {
      const timer = setTimeout(() => {
        moveCameraToFocus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStage, interactiveWinnerBranch, autoCamera, cameraPaused, moveCameraToFocus]);

  const handleTreeScroll = () => {
    if (isProgrammaticScrollRef.current) return;
    if (autoCamera && !cameraPaused) {
      setCameraPaused(true);
    }
  };

  const handleResumeCamera = () => {
    setCameraPaused(false);
    setAutoCamera(true);
    moveCameraToFocus();
  };

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      const delay = 3200 / playSpeed;
      timerRef.current = window.setTimeout(() => {
        setCurrentStage((prev) => {
          if (prev >= 7) {
            setIsPlaying(false);
            return 7;
          }
          return prev + 1;
        });
      }, delay);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStage, playSpeed]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStage(1);
    setSelectedBlock(null);
    setSelectedTx(null);
    setInteractiveWinnerBranch('branchA');
    setCameraPaused(false);
    setAutoCamera(true);
    setTimeout(() => {
      if (treeScrollRef.current) {
        treeScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleNext = () => {
    setCurrentStage((prev) => Math.min(7, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStage((prev) => Math.max(1, prev - 1));
  };

  // Dynamic Mempool transactions based on stages
  const mempoolTxs = useMemo(() => {
    return INITIAL_MEMPOOL_TXS.map((tx, idx) => {
      if (currentStage === 1) {
        return { ...tx, status: 'mempool' as const };
      }
      if (currentStage === 2 || currentStage === 3) {
        if (idx < 2) return { ...tx, status: 'candidate_a' as const };
        if (idx >= 2 && idx < 4) return { ...tx, status: 'candidate_b' as const };
        return { ...tx, status: 'mempool' as const };
      }
      if (currentStage >= 4 && currentStage <= 5) {
        if (idx < 2) return { ...tx, status: 'candidate_a' as const };
        if (idx >= 2 && idx < 4) return { ...tx, status: 'candidate_b' as const };
        return { ...tx, status: 'mempool' as const };
      }
      if (currentStage >= 6) {
        if (interactiveWinnerBranch === 'branchA') {
          if (idx < 2 || idx >= 4) return { ...tx, status: 'confirmed' as const };
          return { ...tx, status: 'returned_stale' as const };
        } else {
          if (idx >= 2 && idx < 4) return { ...tx, status: 'confirmed' as const };
          return { ...tx, status: 'returned_stale' as const };
        }
      }
      return tx;
    });
  }, [currentStage, interactiveWinnerBranch]);

  // NATURAL BLOCKCHAIN HISTORY: Starting strictly from Genesis (#0)
  const trunkBlocks: P2PBlock[] = useMemo(() => {
    const list: P2PBlock[] = [
      {
        id: 'block-0',
        blockNumber: 0,
        displayNumber: '0',
        height: 0,
        minerName: 'Genesis',
        minerRole: 'Network Genesis',
        branch: 'trunk',
        status: 'canonical',
        isLeading: currentStage === 1,
        hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
        prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
        merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
        nonce: 2083236893,
        timestamp: '00:00:00',
        txs: ['Coinbase: 50.0 BTC → Satoshi (Genesis Reward)'],
        coinbaseReward: 50.0,
        cumulativeWork: 0,
      }
    ];

    if (currentStage >= 2) {
      list.push({
        id: 'block-1',
        blockNumber: 1,
        displayNumber: '1',
        height: 1,
        minerName: 'Alice',
        minerRole: 'GPU Miner',
        branch: 'trunk',
        status: 'canonical',
        isLeading: currentStage === 2,
        hash: '000000a12e847c0938bfe4918237461928374619283746192837461928374619',
        prevHash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
        merkleRoot: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        nonce: 38210,
        timestamp: '00:01:00',
        txs: ['Coinbase: 6.25 BTC → Alice', 'TX-00: Satoshi → Hal 10 BTC'],
        coinbaseReward: 6.25,
        cumulativeWork: 1,
      });
    }

    if (currentStage >= 3) {
      list.push(
        {
          id: 'block-2',
          blockNumber: 2,
          displayNumber: '2',
          height: 2,
          minerName: 'Bob',
          minerRole: 'ASIC Miner',
          branch: 'trunk',
          status: 'canonical',
          hash: '0000003b89f02938471029384710293847102938471029384710293847102938',
          prevHash: '000000a12e847c0938bfe4918237461928374619283746192837461928374619',
          merkleRoot: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
          nonce: 51294,
          timestamp: '00:02:00',
          txs: ['Coinbase: 6.25 BTC → Bob', 'TX-01: Alice → Bob 2.5 BTC'],
          coinbaseReward: 6.25,
          cumulativeWork: 2,
        },
        {
          id: 'block-3',
          blockNumber: 3,
          displayNumber: '3',
          height: 3,
          minerName: 'Charlie',
          minerRole: 'ASIC Miner',
          branch: 'trunk',
          status: 'canonical',
          isLeading: currentStage === 3,
          hash: '0000009c81273645192837461928374619283746192837461928374619283746',
          prevHash: '0000003b89f02938471029384710293847102938471029384710293847102938',
          merkleRoot: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
          nonce: 89401,
          timestamp: '00:03:00',
          txs: ['Coinbase: 6.25 BTC → Charlie', 'TX-02: Bob → Charlie 1.0 BTC'],
          coinbaseReward: 6.25,
          cumulativeWork: 3,
        }
      );
    }

    return list;
  }, [currentStage]);

  // Branch A Blocks (#4A -> #5A -> #6A)
  const branchABlocks: P2PBlock[] = useMemo(() => {
    if (currentStage < 4) return [];

    const blocks: P2PBlock[] = [
      {
        id: 'block-4a',
        blockNumber: 4,
        displayNumber: '4A',
        height: 4,
        minerName: 'Bob',
        minerRole: 'ASIC Miner',
        branch: 'branchA',
        status: currentStage >= 6 
          ? (interactiveWinnerBranch === 'branchA' ? 'canonical' : 'stale') 
          : 'competing',
        isLeading: currentStage === 4,
        hash: '0000008f10293847102938471029384710293847102938471029384710293847',
        prevHash: '0000009c81273645192837461928374619283746192837461928374619283746',
        merkleRoot: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        nonce: 48291,
        timestamp: '00:04:00',
        txs: ['Coinbase: 6.25 BTC → Bob', 'TX-01 (Alice→Bob)', 'TX-02 (Bob→Charlie)'],
        coinbaseReward: 6.25,
        cumulativeWork: 4,
      }
    ];

    if (currentStage >= 5) {
      if (interactiveWinnerBranch === 'branchA') {
        blocks.push({
          id: 'block-5a',
          blockNumber: 5,
          displayNumber: '5A',
          height: 5,
          minerName: 'Charlie',
          minerRole: 'ASIC Miner',
          branch: 'branchA',
          status: currentStage >= 6 ? 'canonical' : 'competing',
          isLeading: currentStage === 5,
          hash: '0000003c890123456789abcdef0123456789abcdef0123456789abcdef0123456',
          prevHash: '0000008f10293847102938471029384710293847102938471029384710293847',
          merkleRoot: 'b2c3d4e5f6a7890123456789abcdef0123456789abcdef0123456789abcdef01',
          nonce: 91402,
          timestamp: '00:05:00',
          txs: ['Coinbase: 6.25 BTC → Charlie', 'TX-03 (Dave→Eve)'],
          coinbaseReward: 6.25,
          cumulativeWork: 5,
        });

        if (currentStage >= 6) {
          blocks.push({
            id: 'block-6a',
            blockNumber: 6,
            displayNumber: '6A',
            height: 6,
            minerName: 'Alice',
            minerRole: 'GPU Miner',
            branch: 'branchA',
            status: 'canonical',
            isLeading: true,
            hash: '0000001a456789abcdef0123456789abcdef0123456789abcdef0123456789ab',
            prevHash: '0000003c890123456789abcdef0123456789abcdef0123456789abcdef0123456',
            merkleRoot: 'c3d4e5f6a7b890123456789abcdef0123456789abcdef0123456789abcdef012',
            nonce: 139402,
            timestamp: '00:06:00',
            txs: ['Coinbase: 6.25 BTC → Alice', 'TX-06 (Frank→Grace)'],
            coinbaseReward: 6.25,
            cumulativeWork: 6,
          });
        }
      }
    }

    return blocks;
  }, [currentStage, interactiveWinnerBranch]);

  // Branch B Blocks (#4B -> #5B)
  const branchBBlocks: P2PBlock[] = useMemo(() => {
    if (currentStage < 4) return [];

    const blocks: P2PBlock[] = [
      {
        id: 'block-4b',
        blockNumber: 4,
        displayNumber: '4B',
        height: 4,
        minerName: 'Dave',
        minerRole: 'GPU Miner',
        branch: 'branchB',
        status: currentStage >= 6 
          ? (interactiveWinnerBranch === 'branchB' ? 'canonical' : 'stale') 
          : 'competing',
        isLeading: currentStage === 4 && interactiveWinnerBranch === 'branchB',
        hash: '0000007d829103948571029384756102938475610293847561029384756102938',
        prevHash: '0000009c81273645192837461928374619283746192837461928374619283746',
        merkleRoot: 'c9d8e7f6a5b41234567890abcdef1234567890abcdef1234567890abcdef1234',
        nonce: 62482,
        timestamp: '00:04:00',
        txs: ['Coinbase: 6.25 BTC → Dave', 'TX-04 (Charlie→Alice)', 'TX-05 (Eve→Frank)'],
        coinbaseReward: 6.25,
        cumulativeWork: 4,
      }
    ];

    if (currentStage >= 5 && interactiveWinnerBranch === 'branchB') {
      blocks.push({
        id: 'block-5b',
        blockNumber: 5,
        displayNumber: '5B',
        height: 5,
        minerName: 'Eve',
        minerRole: 'CPU Miner',
        branch: 'branchB',
        status: currentStage >= 6 ? 'canonical' : 'competing',
        isLeading: true,
        hash: '0000005e123456789abcdef0123456789abcdef0123456789abcdef0123456789',
        prevHash: '0000007d829103948571029384756102938475610293847561029384756102938',
        merkleRoot: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        nonce: 118920,
        timestamp: '00:05:00',
        txs: ['Coinbase: 6.25 BTC → Eve', 'TX-01 (Alice→Bob)'],
        coinbaseReward: 6.25,
        cumulativeWork: 5,
      });
    }

    return blocks;
  }, [currentStage, interactiveWinnerBranch]);

  // Clean 7-Stage Flow
  const STAGES = [
    { num: 1, titleVi: 'Hàng đợi Mempool', titleEn: 'Mempool Queue' },
    { num: 2, titleVi: 'Khối Ứng Viên', titleEn: 'Candidate Block' },
    { num: 3, titleVi: 'Cuộc Đua Khai Thác', titleEn: 'Mining Race' },
    { num: 4, titleVi: 'Phân Nhánh (Fork)', titleEn: 'Fork Occurs' },
    { num: 5, titleVi: 'Kéo Dài Nhánh', titleEn: 'Branch Extension' },
    { num: 6, titleVi: 'Chuỗi Dài Nhất & Stale', titleEn: 'Longest Chain & Stale' },
    { num: 7, titleVi: 'Đồng Thuận & Khôi Phục TX', titleEn: 'Consensus & Recovery' },
  ];

  return (
    <div id="p2p-fork-consensus-visualizer" className="bg-[#07090E] border border-slate-800 rounded-2xl p-4 sm:p-5 text-slate-100 font-sans shadow-2xl space-y-4">
      
      {/* 1. TOP SIMULATION CONTROLS (COMPACT) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-display font-bold text-white tracking-wide">
            {isVi ? 'Phân Nhánh & Đồng Thuận Nakamoto' : 'Fork & Nakamoto Consensus'}
          </h2>
        </div>

        {/* Minimal Controls: Play/Pause, Reset, Speed, Step indicator */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Step Indicator */}
          <div className="flex items-center bg-[#0C0F14] border border-slate-800 rounded-xl px-2 py-1 text-xs font-mono">
            <button
              onClick={handlePrev}
              disabled={currentStage === 1}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              title={isVi ? 'Bước trước' : 'Previous step'}
            >
              <ArrowLeft size={12} />
            </button>
            <span className="font-bold px-2 text-emerald-400">
              {currentStage}/7
            </span>
            <button
              onClick={handleNext}
              disabled={currentStage === 7}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              title={isVi ? 'Bước tiếp' : 'Next step'}
            >
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Speed */}
          <div className="flex bg-[#0C0F14] border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
            {[1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaySpeed(spd)}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                  playSpeed === spd ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isPlaying 
                ? 'bg-amber-500 hover:bg-amber-400 text-black' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-black'
            }`}
          >
            {isPlaying ? <Pause size={12} className="fill-current" /> : <Play size={12} className="fill-current" />}
            <span>{isPlaying ? (isVi ? 'Tạm Dừng' : 'Pause') : (isVi ? 'Tự Động' : 'Start')}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-1.5 bg-[#0C0F14] hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            title={isVi ? 'Khởi tạo lại' : 'Reset'}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* 2. COMPACT STAGE PROGRESS INDICATOR (FLOW PILLS) */}
      <div className="flex items-center overflow-x-auto gap-1.5 py-0.5 no-scrollbar">
        {STAGES.map((stg, idx) => {
          const isActive = currentStage === stg.num;
          const isPassed = currentStage > stg.num;

          return (
            <React.Fragment key={stg.num}>
              <button
                onClick={() => {
                  setCurrentStage(stg.num);
                  setIsPlaying(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-display font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold ring-1 ring-emerald-500/20'
                    : isPassed
                    ? 'bg-[#0C0F14] text-slate-300 border border-slate-800 hover:border-slate-700'
                    : 'bg-[#080B10] text-slate-500 border border-slate-850 hover:text-slate-400'
                }`}
              >
                <span className={`text-[10px] font-mono ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {stg.num}
                </span>
                <span>{isVi ? stg.titleVi : stg.titleEn}</span>
              </button>
              {idx < STAGES.length - 1 && (
                <span className="text-slate-700 text-xs shrink-0 select-none">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 3. MEMPOOL SEPARATE VISUAL PANEL */}
      <div className="p-3 sm:p-4 rounded-xl bg-[#090C11] border border-slate-800/90 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-display font-bold text-slate-300 uppercase tracking-wider">
              MEMPOOL
            </span>
            <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.2 rounded bg-slate-800/60">
              {mempoolTxs.length} TX
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            {currentStage >= 6 && (
              <span className="inline-flex items-center gap-1 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>{isVi ? 'Hoàn trả Mempool' : 'Returned Stale'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Mempool Cards: Displaying only TX Code, From -> To, Amount */}
        <div 
          ref={mempoolScrollRef}
          className="flex overflow-x-auto py-1 gap-2 items-center custom-scrollbar"
        >
          {mempoolTxs.map((tx) => {
            const isCandA = tx.status === 'candidate_a';
            const isCandB = tx.status === 'candidate_b';
            const isConfirmed = tx.status === 'confirmed';
            const isReturned = tx.status === 'returned_stale';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className={`p-2 rounded-xl border text-xs font-mono shrink-0 transition-all flex flex-col justify-between min-w-[125px] cursor-pointer ${
                  isConfirmed
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : isCandA
                    ? 'bg-sky-950/30 border-sky-500/30 text-sky-300'
                    : isCandB
                    ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                    : isReturned
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30 animate-pulse'
                    : 'bg-[#0E131A] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[11px] text-white">
                    {tx.txCode}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {tx.amount} BTC
                  </span>
                </div>

                <div className="text-[10px] text-slate-300 font-sans truncate">
                  <span>{tx.from}</span> → <span>{tx.to}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BLOCKCHAIN NETWORK & FORK TREE VISUAL PANEL */}
      <div className="p-3.5 sm:p-5 rounded-xl bg-[#090C11] border border-slate-800/90 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
          <span className="text-xs font-display font-bold text-slate-300 uppercase tracking-wider">
            {isVi ? 'MẠNG LƯỚI BLOCKCHAIN' : 'BLOCKCHAIN NETWORK'}
          </span>

          <div className="flex items-center gap-2">
            {(currentStage >= 4 && currentStage <= 6) && (
              <div className="flex items-center gap-1.5 bg-[#11161D] border border-slate-800 p-1 rounded-lg text-xs font-mono">
                <span className="text-slate-400 text-[10px] mr-0.5">{isVi ? 'Nhánh thắng:' : 'Winner:'}</span>
                <button
                  onClick={() => setInteractiveWinnerBranch('branchA')}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    interactiveWinnerBranch === 'branchA'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bob (#4A)
                </button>
                <button
                  onClick={() => setInteractiveWinnerBranch('branchB')}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    interactiveWinnerBranch === 'branchB'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dave (#4B)
                </button>
              </div>
            )}

            {cameraPaused && (
              <button
                onClick={handleResumeCamera}
                className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 animate-pulse"
                title={isVi ? 'Cuộn đến khối mới nhất' : 'Jump to latest block'}
              >
                <span>↳</span>
                <span>{isVi ? 'Đến khối mới nhất' : 'Jump to Latest'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tree Canvas */}
        <div 
          ref={treeScrollRef}
          onScroll={handleTreeScroll}
          className="p-3 sm:p-5 overflow-x-auto min-h-[220px] bg-[#07090E] rounded-xl border border-slate-850 flex items-center custom-scrollbar"
        >
          <div className="flex items-center gap-2 min-w-max mx-auto py-2">
            
            {/* Trunk: Genesis (#0) -> #1 -> #2 -> #3 */}
            <div className="flex items-center gap-2">
              {trunkBlocks.map((blk, idx) => {
                return (
                  <React.Fragment key={blk.id}>
                    <CompactBlockCard 
                      block={blk} 
                      onClick={() => setSelectedBlock(blk)} 
                      isVi={isVi} 
                    />
                    {idx < trunkBlocks.length - 1 && (
                      <div className="w-3 h-0.5 bg-slate-700 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Fork Junction Connector */}
            {currentStage >= 4 ? (
              <div ref={forkJunctionRef} className="flex items-center relative z-0 px-1">
                <div className="w-4 h-0.5 bg-slate-700" />
                <div className="w-0.5 h-[140px] bg-slate-700 relative flex flex-col justify-between items-center">
                  <div className="w-4 h-0.5 bg-slate-700 self-start absolute top-0 left-0" />
                  <div className="w-4 h-0.5 bg-slate-700 self-start absolute bottom-0 left-0" />
                  
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#0C0F14] border border-amber-500/40 text-amber-300 text-[9px] font-mono px-1.5 py-0.2 rounded z-20">
                    Fork
                  </div>
                </div>
              </div>
            ) : currentStage === 3 ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-slate-700" />
                <div className="w-16 h-[56px] rounded-xl border border-dashed border-slate-800 bg-[#0C0F14]/40 flex items-center justify-center text-center">
                  <span className="text-[10px] font-mono text-slate-500">#4 ?</span>
                </div>
              </div>
            ) : null}

            {/* Branches: Branch A (Top) & Branch B (Bottom) */}
            {currentStage >= 4 && (
              <div className="flex flex-col gap-5 z-10 py-1">
                
                {/* BRANCH A (Bob #4A -> Charlie #5A -> Alice #6A) */}
                <div className="flex items-center gap-2 min-h-[70px]">
                  {branchABlocks.map((blk, bIdx) => {
                    const isTheLeadingTip = blk.isLeading;
                    return (
                      <React.Fragment key={blk.id}>
                        <div ref={isTheLeadingTip ? leadingTipRef : undefined}>
                          <CompactBlockCard 
                            block={blk} 
                            onClick={() => setSelectedBlock(blk)} 
                            isVi={isVi} 
                          />
                        </div>
                        {bIdx < branchABlocks.length - 1 && (
                          <div className="w-3 h-0.5 bg-slate-700 shrink-0" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* BRANCH B (Dave #4B) */}
                <div className="flex items-center gap-2 min-h-[70px]">
                  {branchBBlocks.map((blk, bIdx) => {
                    const isTheLeadingTip = blk.isLeading && interactiveWinnerBranch === 'branchB';
                    return (
                      <React.Fragment key={blk.id}>
                        <div ref={isTheLeadingTip ? leadingTipRef : undefined}>
                          <CompactBlockCard 
                            block={blk} 
                            onClick={() => setSelectedBlock(blk)} 
                            isVi={isVi} 
                          />
                        </div>
                        {bIdx < branchBBlocks.length - 1 && (
                          <div className="w-3 h-0.5 bg-slate-700 shrink-0" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* Block Details Modal (Progressive Disclosure) */}
      {selectedBlock && (
        <BlockDetailModal
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
          isVi={isVi}
        />
      )}

      {/* Tx Details Modal */}
      {selectedTx && (
        <TxDetailModal
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
          isVi={isVi}
        />
      )}

    </div>
  );
};

// =========================================================================
// SUBCOMPONENTS: Small Clean BlockCard & Modal
// =========================================================================

interface CompactBlockCardProps {
  block: P2PBlock;
  onClick: () => void;
  isVi: boolean;
}

const CompactBlockCard: React.FC<CompactBlockCardProps> = ({ block, onClick, isVi }) => {
  const isStale = block.status === 'stale';
  const isLeading = block.isLeading;
  const isGenesis = block.minerName === 'Genesis';
  const mTheme = isGenesis ? GENESIS_THEME : getMinerColorTheme(block.minerName, block.blockNumber);

  return (
    <div
      onClick={onClick}
      title={`Block #${block.displayNumber} - ${block.minerName} (Click to inspect)`}
      className={`relative p-2 rounded-xl transition-all duration-150 flex flex-col items-center justify-between min-w-[72px] sm:min-w-[80px] h-[60px] shrink-0 cursor-pointer select-none border box-border ${
        isStale
          ? 'bg-slate-950/60 border-dashed border-slate-700/60 opacity-40 text-slate-500 hover:opacity-80'
          : isLeading
          ? 'border-amber-400 bg-amber-500/10 shadow-sm ring-1 ring-amber-400/40'
          : `${mTheme.border} ${mTheme.bg} hover:border-slate-400 hover:bg-[#0E131A]`
      }`}
    >
      {/* Block Number */}
      <div className={`text-sm sm:text-base font-mono font-black tabular-nums tracking-wider ${
        isStale ? 'text-slate-500' : isLeading ? 'text-amber-300' : mTheme.text
      }`}>
        #{block.displayNumber}
      </div>

      {/* Miner Identity */}
      <div className="flex items-center gap-1 text-[11px] font-sans font-medium text-slate-200 truncate max-w-full">
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
            <span className={`text-xs font-mono px-2 py-0.5 rounded border font-bold ${mTheme.badge}`}>
              Block #{block.displayNumber}
            </span>
            <span className="text-sm font-display font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: mTheme.primary }} />
              <span>{block.minerName}</span>
            </span>
            {block.status === 'canonical' && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ✓ Canonical
              </span>
            )}
            {block.status === 'stale' && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                ✕ Stale
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white cursor-pointer px-1 text-sm font-mono"
          >
            ✕
          </button>
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
              <span className="text-emerald-400 font-bold">{block.cumulativeWork} blocks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isVi ? 'Thưởng Coinbase:' : 'Coinbase Reward:'}</span>
              <span className="text-amber-400 font-bold">+{block.coinbaseReward} BTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nonce:</span>
              <span className="text-white font-bold">{block.nonce.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-display font-bold uppercase tracking-wider block mb-1">
              Block Hash (SHA-256)
            </label>
            <div className="bg-[#11161D] p-2 rounded-xl border border-slate-800 text-[11px] text-emerald-400 break-all select-all font-mono">
              {block.hash}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-display font-bold uppercase tracking-wider block mb-1">
              Previous Hash
            </label>
            <div className="bg-[#11161D] p-2 rounded-xl border border-slate-800 text-[11px] text-slate-400 break-all select-all font-mono">
              {block.prevHash}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-display font-bold uppercase tracking-wider block mb-1">
              {isVi ? 'Giao dịch trong khối' : 'Included Transactions'}
            </label>
            <div className="bg-[#11161D] p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1 max-h-[100px] overflow-y-auto">
              {block.txs.map((t, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-emerald-400">●</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#11161D] hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
        </div>
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
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer px-1 font-mono">
            ✕
          </button>
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
          <div className="flex justify-between">
            <span className="text-slate-500">{isVi ? 'Trạng thái:' : 'Status:'}</span>
            <span className="font-bold text-amber-400 uppercase">{tx.status.replace('_', ' ')}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-[#11161D] hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
        >
          {isVi ? 'Đóng' : 'Close'}
        </button>
      </div>
    </div>
  );
};
