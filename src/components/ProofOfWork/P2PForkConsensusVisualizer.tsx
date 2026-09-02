/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  GitFork, Play, Pause, RotateCcw, ArrowRight, ArrowLeft, CheckCircle2, 
  XCircle, AlertTriangle, ShieldCheck, Zap, Info, Layers, Clock, Server, 
  Cpu, Database, Sparkles, Check, ChevronRight, Hash, Users, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  MINER_COLORS, 
  getMinerColorTheme, 
  GENESIS_THEME, 
  MinerColorToken 
} from '../../utils/minerColors';

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

export interface P2PNode {
  id: string;
  name: string;
  minerName: string;
  region: string;
  activeTip: 'trunk' | 'branchA' | 'branchB';
  status: 'idle' | 'mining' | 'propagating' | 'reorging' | 'synced';
  currentHashrate: string;
}

const INITIAL_MEMPOOL_TXS: MempoolTx[] = [
  { id: 'tx-1', txCode: 'TX-01', from: 'Alice', to: 'Bob', amount: 2.0, fee: 0.0005, status: 'mempool' },
  { id: 'tx-2', txCode: 'TX-02', from: 'Bob', to: 'Charlie', amount: 1.0, fee: 0.0003, status: 'mempool' },
  { id: 'tx-3', txCode: 'TX-03', from: 'Dave', to: 'Eve', amount: 0.5, fee: 0.0002, status: 'mempool' },
  { id: 'tx-4', txCode: 'TX-04', from: 'Charlie', to: 'Alice', amount: 3.0, fee: 0.0008, status: 'mempool' },
  { id: 'tx-5', txCode: 'TX-05', from: 'Eve', to: 'Frank', amount: 1.2, fee: 0.0004, status: 'mempool' },
  { id: 'tx-6', txCode: 'TX-06', from: 'Frank', to: 'Grace', amount: 0.8, fee: 0.0002, status: 'mempool' },
  { id: 'tx-7', txCode: 'TX-07', from: 'Grace', to: 'Henry', amount: 1.5, fee: 0.0006, status: 'mempool' },
  { id: 'tx-8', txCode: 'TX-08', from: 'Henry', to: 'Alice', amount: 0.4, fee: 0.0001, status: 'mempool' },
];

const INITIAL_NODES: P2PNode[] = [
  { id: 'node-alice', name: 'Node #1 (East)', minerName: 'Alice', region: 'US-East', activeTip: 'trunk', status: 'idle', currentHashrate: '220 H/s' },
  { id: 'node-bob', name: 'Node #2 (West)', minerName: 'Bob', region: 'US-West', activeTip: 'trunk', status: 'idle', currentHashrate: '1.25 KH/s' },
  { id: 'node-charlie', name: 'Node #3 (Europe)', minerName: 'Charlie', region: 'EU-Central', activeTip: 'trunk', status: 'idle', currentHashrate: '3.95 KH/s' },
  { id: 'node-dave', name: 'Node #4 (Asia)', minerName: 'Dave', region: 'AP-East', activeTip: 'trunk', status: 'idle', currentHashrate: '2.10 KH/s' },
  { id: 'node-eve', name: 'Node #5 (South)', minerName: 'Eve', region: 'SA-East', activeTip: 'trunk', status: 'idle', currentHashrate: '450 H/s' },
  { id: 'node-frank', name: 'Node #6 (North)', minerName: 'Frank', region: 'CA-Central', activeTip: 'trunk', status: 'idle', currentHashrate: '890 H/s' },
];

export const P2PForkConsensusVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Active Stage (1 to 8)
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // 1x, 2x, 0.5x
  const [selectedBlock, setSelectedBlock] = useState<P2PBlock | null>(null);
  const [interactiveWinnerBranch, setInteractiveWinnerBranch] = useState<'branchA' | 'branchB'>('branchA');

  const timerRef = useRef<number | null>(null);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      const delay = (3500 / playSpeed);
      timerRef.current = window.setTimeout(() => {
        setCurrentStage((prev) => {
          if (prev >= 8) {
            setIsPlaying(false);
            return 8;
          }
          return prev + 1;
        });
      }, delay);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStage, playSpeed]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStage(1);
    setSelectedBlock(null);
    setInteractiveWinnerBranch('branchA');
  };

  const handleNext = () => {
    setCurrentStage((prev) => Math.min(8, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStage((prev) => Math.max(1, prev - 1));
  };

  // Compute Mempool items state based on current stage
  const mempoolTxs = useMemo(() => {
    return INITIAL_MEMPOOL_TXS.map((tx, idx) => {
      if (currentStage === 1) {
        return { ...tx, status: 'mempool' as const };
      }
      if (currentStage === 2 || currentStage === 3) {
        if (idx < 3) return { ...tx, status: 'candidate_a' as const };
        if (idx >= 3 && idx < 6) return { ...tx, status: 'candidate_b' as const };
        return { ...tx, status: 'mempool' as const };
      }
      if (currentStage >= 4 && currentStage <= 6) {
        if (idx < 3) return { ...tx, status: 'candidate_a' as const };
        if (idx >= 3 && idx < 6) return { ...tx, status: 'candidate_b' as const };
        return { ...tx, status: 'mempool' as const };
      }
      if (currentStage >= 7) {
        // In stage 7 & 8, branch A (or chosen winner branch) transactions are confirmed.
        // If Branch A won, TX 1, 2, 3 + TX 7, 8 confirmed in 4A.
        // TX 4, 5, 6 from stale Branch B return to mempool!
        if (interactiveWinnerBranch === 'branchA') {
          if (idx < 3 || idx >= 6) return { ...tx, status: 'confirmed' as const };
          return { ...tx, status: 'returned_stale' as const };
        } else {
          if (idx >= 3 && idx < 6) return { ...tx, status: 'confirmed' as const };
          return { ...tx, status: 'returned_stale' as const };
        }
      }
      return tx;
    });
  }, [currentStage, interactiveWinnerBranch]);

  // Compute Nodes state based on current stage
  const p2pNodes = useMemo(() => {
    return INITIAL_NODES.map((node) => {
      if (currentStage <= 3) {
        return { ...node, activeTip: 'trunk' as const, status: currentStage === 3 ? ('mining' as const) : ('idle' as const) };
      }
      if (currentStage === 4) {
        // Fork just occurred
        return { ...node, activeTip: node.id.includes('alice') || node.id.includes('charlie') || node.id.includes('dave') ? ('branchA' as const) : ('branchB' as const), status: 'mining' as const };
      }
      if (currentStage === 5) {
        // P2P propagation: US-East/EU on Branch A, US-West/SA on Branch B
        const isEast = node.region.includes('East') || node.region.includes('EU');
        return { 
          ...node, 
          activeTip: isEast ? ('branchA' as const) : ('branchB' as const), 
          status: 'propagating' as const 
        };
      }
      if (currentStage === 6) {
        // Branch A (or winner) found block 4A
        return { 
          ...node, 
          activeTip: node.id.includes('alice') || node.id.includes('charlie') ? (interactiveWinnerBranch) : (interactiveWinnerBranch === 'branchA' ? 'branchB' : 'branchA'), 
          status: 'reorging' as const 
        };
      }
      if (currentStage >= 7) {
        // Re-org complete, all nodes sync to winner canonical chain
        return { ...node, activeTip: interactiveWinnerBranch, status: 'synced' as const };
      }
      return node;
    });
  }, [currentStage, interactiveWinnerBranch]);

  // Block definitions based on current stage
  const trunkBlocks: P2PBlock[] = [
    {
      id: 'genesis',
      blockNumber: 0,
      displayNumber: '0',
      height: 0,
      minerName: 'Satoshi',
      minerRole: 'Genesis Creator',
      branch: 'trunk',
      status: 'canonical',
      hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
      nonce: 2083236893,
      timestamp: '18:15:05',
      txs: ['Coinbase: 50.0 BTC → Satoshi'],
      coinbaseReward: 50.0,
      cumulativeWork: 1,
    },
    {
      id: 'block-1',
      blockNumber: 1,
      displayNumber: '1',
      height: 1,
      minerName: 'Alice',
      minerRole: 'CPU Miner',
      branch: 'trunk',
      status: 'canonical',
      hash: '0000a7b4c92ef01823d456789abcde0123456789abcdef0123456789abcdef01',
      prevHash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
      merkleRoot: '8f92ab103982cd34028471928374928172938471928374928172938471928374',
      nonce: 49102,
      timestamp: '18:15:20',
      txs: ['Coinbase: 3.125 BTC → Alice', 'TX-00: Dave → Satoshi 0.1 BTC'],
      coinbaseReward: 3.125,
      cumulativeWork: 2,
    },
    {
      id: 'block-2',
      blockNumber: 2,
      displayNumber: '2',
      height: 2,
      minerName: 'Charlie',
      minerRole: 'ASIC Miner',
      branch: 'trunk',
      status: 'canonical',
      hash: '0000f3910c2837d9182736451928374619283746192837461928374619283746',
      prevHash: '0000a7b4c92ef01823d456789abcde0123456789abcdef0123456789abcdef01',
      merkleRoot: '3b89f02938471029384710293847102938471029384710293847102938471029',
      nonce: 87103,
      timestamp: '18:15:35',
      txs: ['Coinbase: 3.125 BTC → Charlie', 'TX-09: Frank → Bob 0.5 BTC'],
      coinbaseReward: 3.125,
      cumulativeWork: 3,
    },
  ];

  // Branch A Blocks
  const branchABlocks: P2PBlock[] = useMemo(() => {
    if (currentStage < 4) return [];

    const blocks: P2PBlock[] = [
      {
        id: 'block-3a',
        blockNumber: 3,
        displayNumber: '3A',
        height: 3,
        minerName: 'Alice',
        minerRole: 'CPU Miner',
        branch: 'branchA',
        status: currentStage >= 7 
          ? (interactiveWinnerBranch === 'branchA' ? 'canonical' : 'stale') 
          : 'competing',
        isLeading: currentStage === 4 || (currentStage === 5 && interactiveWinnerBranch === 'branchA'),
        hash: '0000a9f110293847102938471029384710293847102938471029384710293847',
        prevHash: '0000f3910c2837d9182736451928374619283746192837461928374619283746',
        merkleRoot: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        nonce: 84291,
        timestamp: '18:15:50',
        txs: ['Coinbase: 3.125 BTC → Alice', 'TX-01 (Alice→Bob)', 'TX-02 (Bob→Charlie)', 'TX-03 (Dave→Eve)'],
        coinbaseReward: 3.125,
        cumulativeWork: 4,
      }
    ];

    if (currentStage >= 6) {
      if (interactiveWinnerBranch === 'branchA') {
        blocks.push({
          id: 'block-4a',
          blockNumber: 4,
          displayNumber: '4A',
          height: 4,
          minerName: 'Dave',
          minerRole: 'Quantum Miner',
          branch: 'branchA',
          status: currentStage >= 7 ? 'canonical' : 'competing',
          isLeading: true,
          hash: '00004ad890123456789abcdef0123456789abcdef0123456789abcdef0123456',
          prevHash: '0000a9f110293847102938471029384710293847102938471029384710293847',
          merkleRoot: 'f0e1d2c3b4a59876543210fedcba9876543210fedcba9876543210fedcba9876',
          nonce: 142095,
          timestamp: '18:16:05',
          txs: ['Coinbase: 3.125 BTC → Dave', 'TX-07 (Grace→Henry)', 'TX-08 (Henry→Alice)'],
          coinbaseReward: 3.125,
          cumulativeWork: 5,
        });
      }
    }

    return blocks;
  }, [currentStage, interactiveWinnerBranch]);

  // Branch B Blocks
  const branchBBlocks: P2PBlock[] = useMemo(() => {
    if (currentStage < 4) return [];

    const blocks: P2PBlock[] = [
      {
        id: 'block-3b',
        blockNumber: 3,
        displayNumber: '3B',
        height: 3,
        minerName: 'Bob',
        minerRole: 'GPU Miner',
        branch: 'branchB',
        status: currentStage >= 7 
          ? (interactiveWinnerBranch === 'branchB' ? 'canonical' : 'stale') 
          : 'competing',
        isLeading: currentStage === 4 || (currentStage === 5 && interactiveWinnerBranch === 'branchB'),
        hash: '0000b4c829103948571029384756102938475610293847561029384756102938',
        prevHash: '0000f3910c2837d9182736451928374619283746192837461928374619283746',
        merkleRoot: 'c9d8e7f6a5b41234567890abcdef1234567890abcdef1234567890abcdef1234',
        nonce: 103482,
        timestamp: '18:15:50',
        txs: ['Coinbase: 3.125 BTC → Bob', 'TX-04 (Charlie→Alice)', 'TX-05 (Eve→Frank)', 'TX-06 (Frank→Grace)'],
        coinbaseReward: 3.125,
        cumulativeWork: 4,
      }
    ];

    if (currentStage >= 6) {
      if (interactiveWinnerBranch === 'branchB') {
        blocks.push({
          id: 'block-4b',
          blockNumber: 4,
          displayNumber: '4B',
          height: 4,
          minerName: 'Eve',
          minerRole: 'CPU Miner',
          branch: 'branchB',
          status: currentStage >= 7 ? 'canonical' : 'competing',
          isLeading: true,
          hash: '00007ec123456789abcdef0123456789abcdef0123456789abcdef0123456789',
          prevHash: '0000b4c829103948571029384756102938475610293847561029384756102938',
          merkleRoot: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
          nonce: 168920,
          timestamp: '18:16:05',
          txs: ['Coinbase: 3.125 BTC → Eve', 'TX-01 (Alice→Bob)', 'TX-02 (Bob→Charlie)'],
          coinbaseReward: 3.125,
          cumulativeWork: 5,
        });
      }
    }

    return blocks;
  }, [currentStage, interactiveWinnerBranch]);

  // Stage Meta Descriptions
  const STAGE_CONFIGS = [
    {
      num: 1,
      titleVi: 'Giai đoạn 1: Hàng đợi Mempool',
      titleEn: 'Stage 1: Pending Mempool Pool',
      subtitleVi: 'Các giao dịch chưa xác nhận được phát tán vào Mempool dùng chung trước khi thợ đào gom vào khối ứng viên.',
      subtitleEn: 'Unconfirmed transactions sit in the shared Mempool before miners bundle them into candidate blocks.',
      tag: 'P2P MEMPOOL'
    },
    {
      num: 2,
      titleVi: 'Giai đoạn 2: Xây dựng Khối Ứng Viên',
      titleEn: 'Stage 2: Candidate Block Assembly',
      subtitleVi: 'Mỗi thợ đào tự chọn các giao dịch từ Mempool, tính Merkle Root, đặt Previous Hash và thêm giao dịch thưởng Coinbase.',
      subtitleEn: 'Miners independently pick transactions, compute Merkle Root, reference the latest tip PrevHash, and attach Coinbase reward.',
      tag: 'CANDIDATE BLOCK'
    },
    {
      num: 3,
      titleVi: 'Giai đoạn 3: Cuộc Đua Khai Thác PoW',
      titleEn: 'Stage 3: Mining Race Competition',
      subtitleVi: 'Các thợ đào chạy song song hàng triệu phép thử Nonce để tìm chuỗi băm SHA-256 thỏa mãn độ khó mục tiêu.',
      subtitleEn: 'Miners iterate millions of nonces concurrently searching for a SHA-256 hash meeting the difficulty target.',
      tag: 'POW RACE'
    },
    {
      num: 4,
      titleVi: 'Giai đoạn 4: Phân Nhánh Chuỗi Tạm Thời',
      titleEn: 'Stage 4: Temporary Blockchain Fork',
      subtitleVi: 'Alice và Bob tìm thấy khối hợp lệ gần như cùng lúc tại độ cao #3. Mạng lưới tạm thời chia làm 2 nhánh cạnh tranh (3A & 3B).',
      subtitleEn: 'Alice and Bob solve valid blocks nearly simultaneously at height #3. The network splits into competing branches (3A & 3B).',
      tag: 'FORK EVENT'
    },
    {
      num: 5,
      titleVi: 'Giai đoạn 5: Lan Truyền Mạng Ngang Hàng P2P',
      titleEn: 'Stage 5: P2P Network Propagation',
      subtitleVi: 'Do độ trễ mạng Internet, các node ở khu vực Đông nhận khối 3A trước, còn các node phía Tây nhận khối 3B trước.',
      subtitleEn: 'Due to network latency, Eastern nodes receive Block 3A first, while Western nodes accept Block 3B first.',
      tag: 'P2P PROPAGATION'
    },
    {
      num: 6,
      titleVi: 'Giai đoạn 6: Quy Tắc Chuỗi Dài Nhất (Nakamoto)',
      titleEn: 'Stage 6: Longest Chain Extension',
      subtitleVi: 'Thợ đào tiếp tục giải khối tiếp theo. Nhánh nào tìm được khối mới trước sẽ có tổng công việc PoW tích lũy lớn hơn.',
      subtitleEn: 'Miners continue hashing on their local tip. Whichever branch discovers the next block becomes the heavier chain.',
      tag: 'LONGEST CHAIN'
    },
    {
      num: 7,
      titleVi: 'Giai đoạn 7: Xác Định Chuỗi Chính Thức (Canonical)',
      titleEn: 'Stage 7: Canonical Chain Convergence',
      subtitleVi: 'Toàn bộ các node trong mạng đồng thuận chuyển sang nhánh dài nhất làm chuỗi chính thức (Canonical Chain).',
      subtitleEn: 'All nodes re-organize and converge on the longest valid branch as the single Canonical Chain.',
      tag: 'CANONICAL CONSENSUS'
    },
    {
      num: 8,
      titleVi: 'Giai đoạn 8: Xử Lý Khối Thừa (Stale) & Hoàn Trả TX',
      titleEn: 'Stage 8: Stale Block & Mempool Recovery',
      subtitleVi: 'Khối nhánh thua chuyển thành Stale/Orphan. Các giao dịch chưa được xác nhận trên chuỗi chính sẽ quay lại Mempool an toàn.',
      subtitleEn: 'Losing branch block becomes Stale/Orphan. Unconfirmed transactions safely return to the Mempool to prevent fund loss.',
      tag: 'STALE & MEMPOOL RECOVERY'
    }
  ];

  const currentStageMeta = STAGE_CONFIGS[currentStage - 1];

  return (
    <div id="p2p-fork-consensus-visualizer" className="bg-[#07090E] border border-slate-800 rounded-2xl p-5 sm:p-7 text-slate-100 font-sans shadow-2xl space-y-6">
      
      {/* Visualizer Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
              <GitFork size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold text-white tracking-wide">
                  {isVi ? 'Mạng P2P, Phân Nhánh Khối & Giải Quyết Đồng Thuận' : 'P2P Network, Block Fork & Longest Chain Resolution'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {currentStageMeta.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                {isVi 
                  ? 'Mô phỏng chân thực chuỗi khối phi tập trung: Từ hàng đợi Mempool đến phân nhánh và quy tắc chuỗi dài nhất Nakamoto.' 
                  : 'Realistic decentralized blockchain simulation: From Mempool queue to temporary forks and Nakamoto consensus.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls: Play, Step Prev/Next, Speed, Reset */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3.5 py-1.5 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isPlaying 
                ? 'bg-amber-500 hover:bg-amber-400 text-black' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-black'
            }`}
          >
            {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
            <span>{isPlaying ? (isVi ? 'Tạm Dừng' : 'Pause') : (isVi ? 'Tự Động Chạy' : 'Auto Play')}</span>
          </button>

          <div className="flex items-center bg-[#0C0F14] border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={handlePrev}
              disabled={currentStage === 1}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              title={isVi ? 'Bước trước' : 'Previous step'}
            >
              <ArrowLeft size={14} />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-emerald-400">
              {currentStage}/8
            </span>
            <button
              onClick={handleNext}
              disabled={currentStage === 8}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              title={isVi ? 'Bước tiếp theo' : 'Next step'}
            >
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center bg-[#0C0F14] border border-slate-800 rounded-xl px-2 py-1 gap-1 text-[11px] font-mono">
            <span className="text-slate-500 mr-1">{isVi ? 'Tốc độ:' : 'Speed:'}</span>
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaySpeed(spd)}
                className={`px-1.5 py-0.5 rounded ${playSpeed === spd ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="p-2 bg-[#0C0F14] hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            title={isVi ? 'Khởi động lại mô phỏng' : 'Reset simulation'}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* 8-Stage Progress Stepper Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {STAGE_CONFIGS.map((stg) => {
          const isActive = currentStage === stg.num;
          const isPassed = currentStage > stg.num;

          return (
            <button
              key={stg.num}
              onClick={() => {
                setCurrentStage(stg.num);
                setIsPlaying(false);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                  : isPassed
                  ? 'bg-[#0C0F14] border-slate-800 hover:border-slate-700 opacity-90'
                  : 'bg-[#090C10] border-slate-850 opacity-50 hover:opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-emerald-400' : isPassed ? 'text-slate-300' : 'text-slate-500'}`}>
                  0{stg.num}
                </span>
                {isPassed && <Check size={12} className="text-emerald-400" />}
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
              <span className={`text-[11px] font-display font-bold truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {isVi ? stg.titleVi.split(':')[1] : stg.titleEn.split(':')[1]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Stage Callout Banner */}
      <div className="p-4 rounded-xl bg-[#0C0F14] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              {isVi ? currentStageMeta.titleVi : currentStageMeta.titleEn}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-4xl">
            {isVi ? currentStageMeta.subtitleVi : currentStageMeta.subtitleEn}
          </p>
        </div>

        {/* Interactive fork decision if at stage 6 or 7 */}
        {(currentStage >= 4 && currentStage <= 7) && (
          <div className="flex items-center gap-2 shrink-0 bg-[#11161D] border border-slate-800 p-2 rounded-xl">
            <span className="text-[11px] font-mono text-slate-400">{isVi ? 'Mô phỏng nhánh thắng:' : 'Simulate winner:'}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setInteractiveWinnerBranch('branchA')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  interactiveWinnerBranch === 'branchA'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-800/40 border border-transparent'
                }`}
              >
                Nhánh A (Alice/Dave)
              </button>
              <button
                onClick={() => setInteractiveWinnerBranch('branchB')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  interactiveWinnerBranch === 'branchB'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-800/40 border border-transparent'
                }`}
              >
                Nhánh B (Bob/Eve)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: MEMPOOL (STAGE 1 REQUIREMENT) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0D12] border border-slate-800/90 space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-xs sm:text-sm font-display font-bold text-slate-200 tracking-wider uppercase">
              {isVi ? 'HÀNG ĐỢI GIAO DỊCH MEMPOOL' : 'MEMPOOL TRANSACTION POOL'}
            </h3>
            <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-800/60 border border-slate-800">
              {mempoolTxs.filter(t => t.status === 'mempool' || t.status === 'returned_stale').length} {isVi ? 'đang chờ' : 'pending'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span>{isVi ? 'Chờ' : 'Pending'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isVi ? 'Ứng viên A' : 'Candidate A'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>{isVi ? 'Ứng viên B' : 'Candidate B'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{isVi ? 'Hoàn trả Stale' : 'Returned Stale'}</span>
            </span>
          </div>
        </div>

        {/* Compact Horizontal Mempool Chips */}
        <div className="flex overflow-x-auto py-1.5 gap-2.5 items-center custom-scrollbar">
          {mempoolTxs.map((tx) => {
            const isCandA = tx.status === 'candidate_a';
            const isCandB = tx.status === 'candidate_b';
            const isConfirmed = tx.status === 'confirmed';
            const isReturned = tx.status === 'returned_stale';

            return (
              <div
                key={tx.id}
                className={`p-2.5 rounded-xl border text-xs font-mono shrink-0 transition-all flex flex-col justify-between min-w-[170px] ${
                  isConfirmed
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : isCandA
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                    : isCandB
                    ? 'bg-sky-950/30 border-sky-500/30 text-sky-400'
                    : isReturned
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30 animate-pulse'
                    : 'bg-[#11161D] border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[11px] text-white flex items-center gap-1">
                    <span>{tx.txCode}</span>
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    isConfirmed 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : isCandA
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCandB
                      ? 'bg-sky-500/20 text-sky-400'
                      : isReturned
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isConfirmed ? (isVi ? 'Xác nhận' : 'Confirmed') : isCandA ? 'Alice 3A' : isCandB ? 'Bob 3B' : isReturned ? (isVi ? 'Hoàn Mempool' : 'Re-queued') : 'Mempool'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-200 font-sans truncate mb-1">
                  <span className="font-semibold">{tx.from}</span> → <span className="font-semibold">{tx.to}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="font-bold text-white">{tx.amount} BTC</span>
                  <span className="text-slate-500">fee: {tx.fee}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: P2P FORK TREE VISUALIZER (STAGES 2, 3, 4, 6, 7, 8) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0A0D12] border border-slate-800/90 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-xs sm:text-sm font-display font-bold text-slate-200 tracking-wider uppercase">
              {isVi ? 'CÂY PHÂN NHÁNH CHUỖI & ĐỒNG THUẬN NAKAMOTO' : 'BLOCKCHAIN FORK TREE & NAKAMOTO CONSENSUS'}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-[8px]">✓</span>
              <span>{isVi ? 'Chuỗi chính (Canonical)' : 'Canonical Chain'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{isVi ? 'Khối dẫn đầu / Mới nhất' : 'Leading Tip'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-slate-700 bg-slate-900 text-slate-500 text-[8px] flex items-center justify-center">✕</span>
              <span>{isVi ? 'Khối thừa (Stale/Orphan)' : 'Stale Block'}</span>
            </span>
          </div>
        </div>

        {/* Fork Tree Visual Canvas */}
        <div className="p-4 sm:p-6 overflow-x-auto min-h-[380px] bg-[#07090E] rounded-xl border border-slate-850 flex items-center custom-scrollbar">
          <div className="flex items-center gap-4 min-w-max mx-auto py-2">
            
            {/* Trunk: Genesis -> Block 1 -> Block 2 */}
            <div className="flex items-center gap-4">
              {trunkBlocks.map((blk, idx) => (
                <React.Fragment key={blk.id}>
                  <BlockCard 
                    block={blk} 
                    onClick={() => setSelectedBlock(blk)} 
                    isVi={isVi} 
                  />
                  {idx < trunkBlocks.length - 1 && (
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div className="w-6 h-0.5 bg-emerald-500/40" />
                      <span className="text-[9px] font-mono text-emerald-400/80 mt-0.5">link</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Fork Junction Connector */}
            {currentStage >= 4 ? (
              <div className="flex items-center relative z-0 px-1">
                <div className="w-6 h-0.5 bg-slate-700" />
                <div className="w-0.5 h-[220px] bg-slate-700 relative flex flex-col justify-between items-center">
                  <div className="w-6 h-0.5 bg-slate-700 self-start absolute top-0 left-0" />
                  <div className="w-6 h-0.5 bg-slate-700 self-start absolute bottom-0 left-0" />
                  
                  {/* Fork Alert Badge */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#0C0F14] border border-amber-500/50 text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap z-20 shadow-md flex items-center gap-1">
                    <GitFork size={12} />
                    <span>{isVi ? 'Phân Nhánh' : 'Fork Split'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-6 h-0.5 bg-slate-700" />
                <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-[#0C0F14]/50 flex flex-col items-center justify-center min-w-[140px] text-center">
                  <span className="text-xs font-mono text-slate-500">{isVi ? 'Đang chuẩn bị đào #3' : 'Preparing Block #3'}</span>
                  <span className="text-[10px] text-slate-600 mt-1">{isVi ? 'Chưa phân nhánh' : 'No fork active'}</span>
                </div>
              </div>
            )}

            {/* Branches: Branch A (Top) and Branch B (Bottom) */}
            {currentStage >= 4 && (
              <div className="flex flex-col gap-8 z-10 py-2">
                
                {/* BRANCH A ROW (Alice -> Dave) */}
                <div className="flex items-center gap-4 min-h-[140px]">
                  <div className="text-[11px] font-mono font-bold text-emerald-400 w-20 shrink-0">
                    <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-center">
                      Nhánh A
                    </div>
                  </div>

                  {branchABlocks.map((blk, bIdx) => (
                    <React.Fragment key={blk.id}>
                      <BlockCard 
                        block={blk} 
                        onClick={() => setSelectedBlock(blk)} 
                        isVi={isVi} 
                      />
                      {bIdx < branchABlocks.length - 1 && (
                        <div className="flex flex-col items-center justify-center shrink-0">
                          <div className="w-6 h-0.5 bg-emerald-500/40" />
                          <span className="text-[9px] font-mono text-emerald-400/80 mt-0.5">link</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Empty slot placeholder for next block if at stage 4 or 5 */}
                  {currentStage <= 5 && (
                    <div className="w-32 h-[135px] rounded-xl border border-dashed border-slate-800 bg-[#0C0F14]/30 flex flex-col items-center justify-center text-center p-3">
                      <span className="text-[11px] font-mono text-slate-500">Khối #4A</span>
                      <span className="text-[9px] text-slate-600 mt-1">{isVi ? 'Đang khai thác...' : 'Mining...'}</span>
                    </div>
                  )}
                </div>

                {/* BRANCH B ROW (Bob -> Eve) */}
                <div className="flex items-center gap-4 min-h-[140px]">
                  <div className="text-[11px] font-mono font-bold text-sky-400 w-20 shrink-0">
                    <div className="px-2 py-1 rounded bg-sky-500/10 border border-sky-500/30 text-center">
                      Nhánh B
                    </div>
                  </div>

                  {branchBBlocks.map((blk, bIdx) => (
                    <React.Fragment key={blk.id}>
                      <BlockCard 
                        block={blk} 
                        onClick={() => setSelectedBlock(blk)} 
                        isVi={isVi} 
                      />
                      {bIdx < branchBBlocks.length - 1 && (
                        <div className="flex flex-col items-center justify-center shrink-0">
                          <div className="w-6 h-0.5 bg-sky-500/40" />
                          <span className="text-[9px] font-mono text-sky-400/80 mt-0.5">link</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Empty slot placeholder for next block if at stage 4 or 5 */}
                  {currentStage <= 5 && (
                    <div className="w-32 h-[135px] rounded-xl border border-dashed border-slate-800 bg-[#0C0F14]/30 flex flex-col items-center justify-center text-center p-3">
                      <span className="text-[11px] font-mono text-slate-500">Khối #4B</span>
                      <span className="text-[9px] text-slate-600 mt-1">{isVi ? 'Đang khai thác...' : 'Mining...'}</span>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: P2P NETWORK PROPAGATION STATUS (STAGE 5 REQUIREMENT) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0D12] border border-slate-800/90 space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-xs sm:text-sm font-display font-bold text-slate-200 tracking-wider uppercase">
              {isVi ? 'TRẠNG THÁI CÁC NÚT MẠNG P2P TOÀN CẦU' : 'GLOBAL P2P NETWORK NODE PROPAGATION'}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {isVi ? 'Mỗi node độc lập xác thực và duy trì đỉnh chuỗi (Chain Tip)' : 'Each node independently validates and tracks its local chain tip'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {p2pNodes.map((node) => {
            const mTheme = getMinerColorTheme(node.minerName);
            const isTipA = node.activeTip === 'branchA';
            const isTipB = node.activeTip === 'branchB';

            return (
              <div 
                key={node.id} 
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all bg-[#0C0F14] ${
                  node.status === 'reorging'
                    ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse'
                    : isTipA
                    ? 'border-emerald-500/40 hover:border-emerald-500/70'
                    : isTipB
                    ? 'border-sky-500/40 hover:border-sky-500/70'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-bold text-xs text-white truncate">{node.name}</span>
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: mTheme.primary }}
                      title={node.minerName}
                    />
                  </div>

                  <div className="space-y-1 text-[11px] font-mono text-slate-400 mb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isVi ? 'Khu vực:' : 'Region:'}</span>
                      <span className="text-slate-300">{node.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isVi ? 'Tốc độ:' : 'Hashrate:'}</span>
                      <span className="text-emerald-400 font-bold">{node.currentHashrate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase">{isVi ? 'Đỉnh Chuỗi:' : 'Local Tip:'}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    node.activeTip === 'trunk'
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : isTipA
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  }`}>
                    {node.activeTip === 'trunk' ? 'Block #2' : isTipA ? 'Branch A (#3A)' : 'Branch B (#3B)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: EDUCATIONAL SUMMARY & QUIZ QUICK CHECK */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Core Architectural Rule */}
        <div className="p-4 rounded-xl bg-[#0C0F14] border border-slate-800 space-y-2 lg:col-span-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">
              {isVi ? 'Quy Tắc Nakamoto: Chuỗi Nặng Nhất (Heaviest / Longest Chain Rule)' : 'Nakamoto Consensus: Heaviest / Longest Chain Rule'}
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {isVi 
              ? 'Trong mạng blockchain phi tập trung, không có máy chủ trung tâm nào quyết định khối nào đúng. Khi xảy ra phân nhánh (Fork), các thợ đào tiếp tục giải thuật toán trên đỉnh khối mà họ nhận được trước. Khi một nhánh được bổ sung khối tiếp theo, tổng công việc PoW tích lũy (Cumulative Difficulty) của nhánh đó sẽ vượt trội. Mọi node khác tự động tái tổ chức chuỗi (Re-org) sang nhánh dài nhất.' 
              : 'In decentralized blockchains, no central server arbitrates block legitimacy. When a temporary fork occurs, nodes build atop whichever block arrived first locally. As soon as another block extends either branch, the cumulative Proof-of-Work makes that chain strictly heavier. All honest nodes automatically reorganize (re-org) to the longest chain.'}
          </p>
        </div>

        {/* Stale Block & Mempool Safe Recovery */}
        <div className="p-4 rounded-xl bg-[#0C0F14] border border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">
              {isVi ? 'Xử Lý Khối Mồ Côi & Mempool' : 'Stale Blocks & Mempool Safety'}
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {isVi
              ? 'Khối thuộc nhánh thua (như Khối #3B) bị loại thành Stale Block. Phần thưởng đào khối của Bob bị vô hiệu hóa. Tuy nhiên, toàn bộ giao dịch người dùng (TX) trong khối thua chưa có trên chuỗi thắng sẽ tự động quay trở lại Mempool an toàn.'
              : 'Blocks on the abandoned branch (such as Block #3B) become Stale/Orphaned. The miner reward is revoked, but unconfirmed user transactions safely return to the Mempool to prevent double spending and loss.'}
          </p>
        </div>
      </div>

      {/* Block Details Modal */}
      {selectedBlock && (
        <BlockDetailModal
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
          isVi={isVi}
        />
      )}

    </div>
  );
};

// =========================================================================
// SUBCOMPONENTS: BlockCard & Modal
// =========================================================================

interface BlockCardProps {
  block: P2PBlock;
  onClick: () => void;
  isVi: boolean;
}

const BlockCard: React.FC<BlockCardProps> = ({ block, onClick, isVi }) => {
  const isGenesis = block.blockNumber === 0;
  const isCanonical = block.status === 'canonical';
  const isStale = block.status === 'stale';
  const isLeading = block.isLeading;
  const mTheme = isGenesis ? GENESIS_THEME : getMinerColorTheme(block.minerName, block.blockNumber);

  return (
    <div
      onClick={onClick}
      className={`relative p-3.5 rounded-xl transition-all duration-200 flex flex-col items-center justify-between min-w-[145px] sm:min-w-[155px] shrink-0 cursor-pointer select-none border-2 box-border ${
        isStale
          ? 'bg-slate-950/80 border-dashed border-slate-700/80 opacity-55 text-slate-500 hover:opacity-85'
          : isLeading
          ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-block-pulse'
          : `${mTheme.border} ${mTheme.bg} hover:border-slate-400 hover:bg-[#0E131A] shadow-sm`
      }`}
    >
      {/* Leading Tip Gold Star Badge */}
      {isLeading && !isStale && (
        <div className="absolute -top-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-amber-400 text-black shadow-md flex items-center gap-1">
          <span>★</span>
          <span>{isVi ? 'DẪN ĐẦU' : 'LEADING TIP'}</span>
        </div>
      )}

      {/* Canonical Green Status Badge */}
      {isCanonical && !isLeading && (
        <div className="absolute -top-2 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <Check size={9} />
          <span>CANONICAL</span>
        </div>
      )}

      {/* Stale Badge */}
      {isStale && (
        <div className="absolute -top-2 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
          <XCircle size={9} />
          <span>STALE</span>
        </div>
      )}

      {/* Block Display Number */}
      <div className={`text-2xl sm:text-3xl font-mono font-black tabular-nums tracking-wider my-0.5 ${
        isStale ? 'text-slate-500' : isGenesis ? 'text-slate-300' : mTheme.text
      }`}>
        {block.displayNumber}
      </div>

      {/* Miner Identity Badge */}
      <div className="my-1 text-center max-w-full">
        {isGenesis ? (
          <span className="font-display font-semibold text-slate-400 text-[11px] tracking-wide uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            GENESIS
          </span>
        ) : (
          <span className={`inline-flex items-center gap-1.5 font-display font-bold text-[11px] tracking-wide px-2 py-0.5 rounded border max-w-full truncate ${
            isStale ? 'bg-slate-900 border-slate-800 text-slate-500' : mTheme.badge
          }`}>
            <span 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: isStale ? '#64748b' : mTheme.primary }}
            />
            <span className="truncate">{block.minerName}</span>
          </span>
        )}
      </div>

      {/* Truncated Hash */}
      <span className="text-[10px] font-mono tabular-nums text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800/80 truncate max-w-full">
        {block.hash.slice(0, 4)}...{block.hash.slice(-4)}
      </span>

      {/* Nonce & Cumulative Work */}
      <div className="flex items-center justify-between w-full mt-2 pt-1 border-t border-slate-800/60 text-[9px] font-mono text-slate-500">
        <span>N: {block.nonce.toLocaleString()}</span>
        <span className={isCanonical ? 'text-emerald-400 font-bold' : ''}>Work: {block.cumulativeWork}</span>
      </div>
    </div>
  );
};

const BlockDetailModal: React.FC<{ block: P2PBlock; onClose: () => void; isVi: boolean }> = ({ block, onClose, isVi }) => {
  const isGenesis = block.blockNumber === 0;
  const mTheme = isGenesis ? GENESIS_THEME : getMinerColorTheme(block.minerName, block.blockNumber);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#0C0F14] border border-slate-800 rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono px-2.5 py-0.5 rounded border font-bold ${mTheme.badge}`}>
              Khối #{block.displayNumber}
            </span>
            <h3 className="text-base font-display font-bold text-white">
              {isGenesis ? 'Genesis Block' : block.minerName}
            </h3>
            {block.status === 'canonical' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ✓ Canonical
              </span>
            )}
            {block.status === 'stale' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                ✕ Stale
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <div className="bg-[#11161D] p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{isVi ? 'Thợ đào:' : 'Miner:'}</span>
              <span className="flex items-center gap-2 font-bold font-sans">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mTheme.primary }} />
                <span className={mTheme.text}>{block.minerName} ({block.minerRole})</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isVi ? 'Thời gian:' : 'Timestamp:'}</span>
              <span className="text-slate-300">{block.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isVi ? 'Công việc tích lũy (PoW):' : 'Cumulative Work:'}</span>
              <span className="text-emerald-400 font-bold">{block.cumulativeWork} blocks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isVi ? 'Phần thưởng Coinbase:' : 'Coinbase Reward:'}</span>
              <span className="text-amber-400 font-bold">+{block.coinbaseReward} BTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isVi ? 'Winning Nonce:' : 'Winning Nonce:'}</span>
              <span className="text-white font-bold">{block.nonce.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-display font-bold uppercase tracking-wider block mb-1">
              SHA-256 Hash
            </label>
            <div className="bg-[#11161D] p-2.5 rounded-xl border border-slate-800 text-[11px] text-emerald-400 break-all select-all">
              {block.hash}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-display font-bold uppercase tracking-wider block mb-1">
              Previous Block Hash
            </label>
            <div className="bg-[#11161D] p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 break-all select-all">
              {block.prevHash}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-display font-bold uppercase tracking-wider block mb-1">
              {isVi ? 'Giao dịch trong khối' : 'Included Transactions'}
            </label>
            <div className="bg-[#11161D] p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              {block.txs.map((t, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-emerald-400">●</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
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
