import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ShieldCheck,
  FlaskConical,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Layers,
  Radio,
  Pickaxe,
  GitFork,
  BookOpen,
  Terminal,
  Activity,
  CheckCircle2,
  Sparkles,
  Compass,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  E2ETransaction,
  E2EMiner,
  E2EBlock,
  E2ENetworkNode,
  E2EPacket,
  E2EEventLog,
  E2EExperimentConfig,
  SimulationMode,
  SimulationSpeed,
} from './types';
import { buildMerkleTree } from '../../utils/merkle';
import { fastSha256Hex } from '../../utils/sha256';
import { createMiningWorkerBlob, MinerWorkerOutgoingMessage } from '../../utils/miningWorker';
import {
  calculateBlockWork,
  mineBlockSynchronous,
  resolveCanonicalChain,
} from '../../utils/consensusEngine';

import { TransactionCreateStep } from './TransactionCreateStep';
import { MempoolStep } from './MempoolStep';
import { BlockConstructionPanel } from './BlockConstructionPanel';
import { ConcurrentMiningArena } from './ConcurrentMiningArena';
import { NetworkBroadcastGraph } from './NetworkBroadcastGraph';
import { ForkAndLongestChainPipeline } from './ForkAndLongestChainPipeline';
import { FinalLedgerExplorer } from './FinalLedgerExplorer';
import { ConsensusEventLog } from './ConsensusEventLog';
import { ExperimentParametersModal } from './ExperimentParametersModal';
import { AuditSelfTestModal } from './AuditSelfTestModal';

// Laboratory Upgraded Modules
import { FaultInjectionPanel } from './FaultInjectionPanel';
import { NodeInspectorModal } from './NodeInspectorModal';
import { EducationalInsightBanner } from './EducationalInsightBanner';
import { LabRecorderTimeline } from './LabRecorderTimeline';
import { useNextStepGuidance } from '../../guidance/useNextStepGuidance';

export type ConsensusPhaseId = 'proposal' | 'validation' | 'consensus';

export interface ConsensusPhaseInfo {
  id: ConsensusPhaseId;
  number: string;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  steps: number[];
}

export const CONSENSUS_PHASES: ConsensusPhaseInfo[] = [
  {
    id: 'proposal',
    number: 'PHASE 1',
    nameVi: 'Đề xuất khối',
    nameEn: 'Block Proposal',
    descVi: 'Mempool → Đóng gói Header → Đua tính toán Proof-of-Work',
    descEn: 'Mempool → Header Packing → Proof-of-Work Mining Race',
    steps: [1, 2, 3, 4],
  },
  {
    id: 'validation',
    number: 'PHASE 2',
    nameVi: 'Lan truyền & Thẩm định',
    nameEn: 'P2P Gossip & Validation',
    descVi: 'Mạng P2P Gossip → Từng nút độc lập kiểm tra 4 điều kiện mật mã',
    descEn: 'P2P Gossip Relay → Nodes independently verify 4 crypto checks',
    steps: [5],
  },
  {
    id: 'consensus',
    number: 'PHASE 3',
    nameVi: 'Đồng thuận Nakamoto & Sổ cái',
    nameEn: 'Nakamoto Consensus & Ledger',
    descVi: 'Phân nhánh chuỗi (Fork) → Quy tắc chuỗi nặng nhất → Sổ cái bất biến',
    descEn: 'Fork Resolution → Heaviest Chain Rule → Canonical Ledger',
    steps: [6, 7],
  },
];

export type DrawerTab = 'none' | 'faults' | 'logs' | 'insights';

function getStepSubtitle(step: number, lang: 'vi' | 'en'): string {
  switch (step) {
    case 1:
      return lang === 'vi' ? 'Tạo giao dịch mẫu và tính toán mã băm SHA-256' : 'Create sample transaction and calculate SHA-256 hash';
    case 2:
      return lang === 'vi' ? 'Chọn giao dịch có phí ưu tiên cao để đóng gói vào khối' : 'Select high-fee transactions for candidate block';
    case 3:
      return lang === 'vi' ? 'Xây dựng cây Merkle và cấu trúc Block Header hoàn chỉnh' : 'Build Merkle tree and pack complete Block Header';
    case 4:
      return lang === 'vi' ? 'Đua tính toán song song thay đổi Nonce để thỏa mãn độ khó' : 'Concurrent multi-miner race finding valid Nonce target';
    case 5:
      return lang === 'vi' ? 'Lan truyền Gossip qua mạng P2P và từng nút độc lập thẩm định' : 'Gossip relay through P2P network with independent node verification';
    case 6:
      return lang === 'vi' ? 'Mô phỏng phân nhánh chuỗi cạnh tranh và áp dụng chuỗi nặng nhất' : 'Simulate competing chain fork and apply Heaviest Chain rule';
    case 7:
      return lang === 'vi' ? 'Khối đạt tính bất biến và được ghi vĩnh viễn vào sổ cái phân tán' : 'Block achieves finality and is permanently recorded in distributed ledger';
    default:
      return '';
  }
}

function getContextualMetrics(
  step: number,
  lang: 'vi' | 'en',
  mempool: E2ETransaction[],
  selectedTxIds: string[],
  nextBlockHeight: number,
  selectedTxs: E2ETransaction[],
  previousHash: string,
  config: { difficulty: number; minerCount: number; networkLatencyMs: number },
  miners: E2EMiner[],
  totalMiningAttempts: number,
  nodes: E2ENetworkNode[],
  cumulativeWorkA: number,
  cumulativeWorkB: number,
  blockchain: E2EBlock[]
): string {
  switch (step) {
    case 1:
      return lang === 'vi'
        ? `Mempool: ${mempool.length} giao dịch chờ · Ví nguồn sẵn sàng`
        : `Mempool: ${mempool.length} pending txs · Sender wallet ready`;
    case 2: {
      const selectedBTC = mempool
        .filter((t) => selectedTxIds.includes(t.id))
        .reduce((a, c) => a + c.amount, 0);
      return lang === 'vi'
        ? `${mempool.length} giao dịch · ${selectedTxIds.length} đã chọn · ${selectedBTC.toFixed(3)} BTC`
        : `${mempool.length} txs · ${selectedTxIds.length} selected · ${selectedBTC.toFixed(3)} BTC`;
    }
    case 3:
      return lang === 'vi'
        ? `Khối #${nextBlockHeight} · ${selectedTxs.length} giao dịch · PrevHash: ${previousHash.substring(0, 8)}...`
        : `Block #${nextBlockHeight} · ${selectedTxs.length} txs · PrevHash: ${previousHash.substring(0, 8)}...`;
    case 4:
      return lang === 'vi'
        ? `Độ khó: ${config.difficulty} zeroes · ${config.minerCount} thợ đào · ${totalMiningAttempts.toLocaleString()} băm`
        : `Difficulty: ${config.difficulty} zeroes · ${config.minerCount} miners · ${totalMiningAttempts.toLocaleString()} hashes`;
    case 5: {
      const verifiedCount = nodes.filter((n) => n.validationState.isAccepted !== null).length;
      return lang === 'vi'
        ? `${verifiedCount}/${nodes.length} nút đã thẩm định 4 điều kiện · Độ trễ: ${config.networkLatencyMs}ms`
        : `${verifiedCount}/${nodes.length} nodes verified 4 rules · ${config.networkLatencyMs}ms latency`;
    }
    case 6:
      return lang === 'vi'
        ? `Chuỗi A: ${cumulativeWorkA} work · Chuỗi B: ${cumulativeWorkB} work · Quy tắc: Chuỗi nặng nhất`
        : `Chain A: ${cumulativeWorkA} work · Chain B: ${cumulativeWorkB} work · Rule: Heaviest Chain`;
    case 7:
      return lang === 'vi'
        ? `${blockchain.length} khối chính thức · Đỉnh chuỗi: #${blockchain[blockchain.length - 1]?.height ?? 0} · 100% toàn vẹn`
        : `${blockchain.length} canonical blocks · Tip: #${blockchain[blockchain.length - 1]?.height ?? 0} · 100% intact`;
    default:
      return '';
  }
}

function formatTimestamp(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
}

const INITIAL_TRANSACTIONS: E2ETransaction[] = [
  {
    id: 'tx-init-1',
    sender: 'Alice',
    recipient: 'Bob',
    amount: 10.0,
    feeBTC: 0.0005,
    timestamp: '14:00:10',
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    status: 'mempool',
  },
  {
    id: 'tx-init-2',
    sender: 'Charlie',
    recipient: 'Dave',
    amount: 5.25,
    feeBTC: 0.0008,
    timestamp: '14:00:15',
    hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    status: 'mempool',
  },
  {
    id: 'tx-init-3',
    sender: 'Eva',
    recipient: 'Frank',
    amount: 2.5,
    feeBTC: 0.0002,
    timestamp: '14:00:20',
    hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    status: 'mempool',
  },
];

const INITIAL_MINERS: E2EMiner[] = [
  {
    id: 'miner-alice',
    name: 'Alice Node',
    avatarColor: '#22c55e',
    hashrateKHz: 450,
    currentNonce: 0,
    currentHash: '',
    attempts: 0,
    status: 'idle',
    rangeStart: 0,
    rangeStep: 4,
  },
  {
    id: 'miner-bob',
    name: 'Bob Node',
    avatarColor: '#38bdf8',
    hashrateKHz: 820,
    currentNonce: 1,
    currentHash: '',
    attempts: 0,
    status: 'idle',
    rangeStart: 1,
    rangeStep: 4,
  },
  {
    id: 'miner-charlie',
    name: 'Charlie Node',
    avatarColor: '#8b5cf6',
    hashrateKHz: 210,
    currentNonce: 2,
    currentHash: '',
    attempts: 0,
    status: 'idle',
    rangeStart: 2,
    rangeStep: 4,
  },
  {
    id: 'miner-dave',
    name: 'Dave Node',
    avatarColor: '#f43f5e',
    hashrateKHz: 600,
    currentNonce: 3,
    currentHash: '',
    attempts: 0,
    status: 'idle',
    rangeStart: 3,
    rangeStep: 4,
  },
];

const INITIAL_NODES: E2ENetworkNode[] = [
  {
    id: 'node-alice',
    name: 'Alice Node',
    role: 'miner',
    x: 90,
    y: 110,
    region: 'US-East',
    validationState: { prevHash: null, merkleRoot: null, txValid: null, powValid: null, isAccepted: null },
    receivedBlockId: null,
  },
  {
    id: 'node-bob',
    name: 'Bob Node',
    role: 'miner',
    x: 420,
    y: 90,
    region: 'EU-Central',
    validationState: { prevHash: null, merkleRoot: null, txValid: null, powValid: null, isAccepted: null },
    receivedBlockId: null,
  },
  {
    id: 'node-charlie',
    name: 'Charlie Node',
    role: 'validator',
    x: 110,
    y: 270,
    region: 'AP-Tokyo',
    validationState: { prevHash: null, merkleRoot: null, txValid: null, powValid: null, isAccepted: null },
    receivedBlockId: null,
  },
  {
    id: 'node-dave',
    name: 'Dave Node',
    role: 'miner',
    x: 440,
    y: 250,
    region: 'SA-East',
    validationState: { prevHash: null, merkleRoot: null, txValid: null, powValid: null, isAccepted: null },
    receivedBlockId: null,
  },
];

const INITIAL_BLOCKS: E2EBlock[] = [
  {
    height: 0,
    id: 'block-0-genesis',
    branchId: 'main',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
    nonce: 208392,
    timestamp: '13:50:00',
    merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    difficulty: 3,
    transactions: [],
    minerId: 'miner-satoshi',
    minerName: 'Satoshi Nakamoto',
    cumulativeWork: 4096,
    status: 'canonical',
    rewardBTC: 50.0,
  },
  {
    height: 1,
    id: 'block-1',
    branchId: 'main',
    previousHash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
    hash: '0000a4b7f32991823908f9c1b827e8a9d18c9918274a5e1e4baab89f3a32518a',
    nonce: 4821,
    timestamp: '13:53:20',
    merkleRoot: '9f83a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
    difficulty: 3,
    transactions: [
      {
        id: 'tx-001',
        sender: 'Satoshi',
        recipient: 'Hal Finney',
        amount: 10.0,
        feeBTC: 0.0001,
        timestamp: '13:52:10',
        hash: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
        status: 'confirmed',
      },
    ],
    minerId: 'miner-alice',
    minerName: 'Alice Node',
    cumulativeWork: 8192,
    status: 'canonical',
    rewardBTC: 2.0001,
  },
  {
    height: 2,
    id: 'block-2',
    branchId: 'main',
    previousHash: '0000a4b7f32991823908f9c1b827e8a9d18c9918274a5e1e4baab89f3a32518a',
    hash: '0000c8129038d1726a9172836b1298374a5e1e4baab89f3a32518a88c31bc87f',
    nonce: 12904,
    timestamp: '13:56:45',
    merkleRoot: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    difficulty: 3,
    transactions: [
      {
        id: 'tx-002',
        sender: 'Hal Finney',
        recipient: 'Charlie',
        amount: 3.5,
        feeBTC: 0.0002,
        timestamp: '13:55:00',
        hash: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
        status: 'confirmed',
      },
    ],
    minerId: 'miner-bob',
    minerName: 'Bob Node',
    cumulativeWork: 12288,
    status: 'canonical',
    rewardBTC: 2.0002,
  },
];

const LAB_STEPS = [
  { step: 1, labelVi: '01 Giao dịch', labelEn: '01 Tx', nameVi: 'Tạo giao dịch', nameEn: 'Transaction' },
  { step: 2, labelVi: '02 Mempool', labelEn: '02 Mempool', nameVi: 'Bể giao dịch chờ', nameEn: 'Mempool' },
  { step: 3, labelVi: '03 Khối', labelEn: '03 Block', nameVi: 'Khối ứng viên', nameEn: 'Candidate Block' },
  { step: 4, labelVi: '04 Khai thác', labelEn: '04 Mining', nameVi: 'Đua khai thác', nameEn: 'Mining Race' },
  { step: 5, labelVi: '05 Lan truyền', labelEn: '05 P2P', nameVi: 'Mạng P2P Gossip', nameEn: 'P2P Gossip' },
  { step: 6, labelVi: '06 Phân nhánh', labelEn: '06 Fork', nameVi: 'Phân nhánh chuỗi', nameEn: 'Fork Resolution' },
  { step: 7, labelVi: '07 Sổ cái', labelEn: '07 Ledger', nameVi: 'Sổ cái chính thức', nameEn: 'Canonical Ledger' },
];

export const EndToEndConsensusLab: React.FC = () => {
  const { language } = useLanguage();

  // Active Guided Step (1 - 7)
  const [guidedStep, setGuidedStep] = useState<number>(1);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('guided');
  const [simulationSpeed, setSimulationSpeed] = useState<SimulationSpeed>(1);
  const [isTimelinePaused, setIsTimelinePaused] = useState<boolean>(false);
  const [logViewMode, setLogViewMode] = useState<'timeline' | 'events'>('timeline');

  // Global Next-Step Guidance Hook
  const {
    isReadyForNext,
    lastCompletedActionVi,
    lastCompletedActionEn,
    nextRecommendedActionVi,
    nextRecommendedActionEn,
    nextActionTargetId,
    triggerStepCompleted,
    resetGuidance,
    startNextStep,
    getCtaGuidanceClasses,
  } = useNextStepGuidance({ initialState: 'AVAILABLE', initialStepId: 'step-1' });

  // Modals & Inspection State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [inspectingNode, setInspectingNode] = useState<E2ENetworkNode | null>(null);
  const [showInsights, setShowInsights] = useState<boolean>(false);

  // Fault Injection State
  const [tamperedBlockHeight, setTamperedBlockHeight] = useState<number | null>(null);

  // Drawer & Laboratory Tray State (Collapsed by default, opens contextual lab panels)
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>('none');

  // Auto-open faults tab when a tampering event is injected so causality is clear
  useEffect(() => {
    if (tamperedBlockHeight !== null) {
      setActiveDrawerTab('faults');
    }
  }, [tamperedBlockHeight]);

  // Current Active Phase
  const currentPhase = useMemo(() => {
    if (guidedStep <= 4) return CONSENSUS_PHASES[0];
    if (guidedStep === 5) return CONSENSUS_PHASES[1];
    return CONSENSUS_PHASES[2];
  }, [guidedStep]);

  // Configuration
  const [config, setConfig] = useState<E2EExperimentConfig>({
    minerCount: 4,
    difficulty: 3,
    networkLatencyMs: 600,
    forkSimulationEnabled: false,
    baseRewardBTC: 2.0,
  });

  // State
  const [mempool, setMempool] = useState<E2ETransaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>(['tx-init-1', 'tx-init-2']);
  const [miners, setMiners] = useState<E2EMiner[]>(INITIAL_MINERS);
  const [blockchain, setBlockchain] = useState<E2EBlock[]>(INITIAL_BLOCKS);
  const [nodes, setNodes] = useState<E2ENetworkNode[]>(INITIAL_NODES);
  const [packets, setPackets] = useState<E2EPacket[]>([]);
  const [eventLogs, setEventLogs] = useState<E2EEventLog[]>([
    {
      id: 'log-1',
      timestamp: '13:56:45',
      category: 'consensus',
      message: 'Chuỗi khối khởi tạo tại Khối #2 (Nhánh chính thức)',
    },
  ]);

  // Mining & Broadcast Runtime
  const [isMining, setIsMining] = useState<boolean>(false);
  const [winnerBlock, setWinnerBlock] = useState<E2EBlock | null>(null);
  const [broadcastActive, setBroadcastActive] = useState<boolean>(false);
  const [broadcastingBlock, setBroadcastingBlock] = useState<E2EBlock | null>(null);
  const [consensusReached, setConsensusReached] = useState<boolean>(false);

  // Fork State
  const [forkActive, setForkActive] = useState<boolean>(false);
  const [branchABlocks, setBranchABlocks] = useState<E2EBlock[]>([]);
  const [branchBBlocks, setBranchBBlocks] = useState<E2EBlock[]>([]);
  const [cumulativeWorkA, setCumulativeWorkA] = useState<number>(0);
  const [cumulativeWorkB, setCumulativeWorkB] = useState<number>(0);
  const [activeMainBranch, setActiveMainBranch] = useState<'branchA' | 'branchB' | 'tied'>('tied');
  const [orphanedBlocks, setOrphanedBlocks] = useState<E2EBlock[]>([]);

  // Telemetry for Experiment Summary
  const [lastExperimentSummary, setLastExperimentSummary] = useState<{
    winnerName: string;
    totalAttempts: number;
    miningTimeSec: number;
    forkOccurred: boolean;
    mainBranch: string;
    orphanedCount: number;
  } | null>(null);

  // Animation & Loop Refs
  const miningLoopRef = useRef<number | null>(null);
  const miningStartTimeRef = useRef<number>(0);
  const broadcastIntervalRef = useRef<number | null>(null);

  // Web Worker concurrency refs & state
  const workersRef = useRef<Worker[]>([]);
  const workerBlobUrlRef = useRef<string | null>(null);
  const telemetryIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const winnerDiscoveredRef = useRef<boolean>(false);
  const [miningElapsedTimeSec, setMiningElapsedTimeSec] = useState<number>(0);

  // Total attempts tracked
  const totalMiningAttempts = useMemo(() => {
    return miners.reduce((acc, curr) => acc + curr.attempts, 0);
  }, [miners]);

  // Cleanup all mining workers and intervals
  const stopAllMiningWorkers = useCallback(() => {
    if (miningLoopRef.current) {
      cancelAnimationFrame(miningLoopRef.current);
      miningLoopRef.current = null;
    }
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current);
      telemetryIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (workersRef.current.length > 0) {
      workersRef.current.forEach((worker) => {
        try {
          worker.postMessage({ type: 'STOP' });
          worker.terminate();
        } catch {
          // ignore
        }
      });
      workersRef.current = [];
    }

    if (workerBlobUrlRef.current) {
      try {
        URL.revokeObjectURL(workerBlobUrlRef.current);
      } catch {
        // ignore
      }
      workerBlobUrlRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllMiningWorkers();
      if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
    };
  }, [stopAllMiningWorkers]);

  // Canonical Tip
  const canonicalTip = blockchain[blockchain.length - 1];
  const nextBlockHeight = canonicalTip ? canonicalTip.height + 1 : 1;
  const previousHash = canonicalTip ? canonicalTip.hash : '0000000000000000000000000000000000000000000000000000000000000000';

  // Selected Transactions
  const selectedTxs = useMemo(() => {
    return mempool.filter((tx) => selectedTxIds.includes(tx.id));
  }, [mempool, selectedTxIds]);

  // Log Helper with Deduplication and Pause respect
  const addLog = useCallback(
    (
      category: E2EEventLog['category'],
      message: string,
      details?: string,
      eventKey?: string
    ) => {
      if (isTimelinePaused) return;

      setEventLogs((prev) => {
        if (eventKey && prev.some((l) => l.id === eventKey)) {
          return prev;
        }
        if (prev.length > 0 && prev[0].message === message && prev[0].category === category) {
          return prev;
        }
        const newLog: E2EEventLog = {
          id: eventKey || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: formatTimestamp(),
          category,
          message,
          details,
        };
        return [newLog, ...prev.slice(0, 199)];
      });
    },
    [isTimelinePaused]
  );

  // Derived Candidate Block for Step 05 (inherits from Step 04 winner, or candidate header)
  const step5CandidateBlock = useMemo<E2EBlock>(() => {
    if (winnerBlock) return winnerBlock;
    if (broadcastingBlock) return broadcastingBlock;

    const txsToUse = selectedTxs.length > 0 ? selectedTxs : mempool.slice(0, 2);
    const merkleRes = buildMerkleTree(
      txsToUse.map((t) => ({
        id: t.id,
        sender: t.sender,
        receiver: t.recipient,
        amount: t.amount,
        timestamp: t.timestamp,
        hash: t.hash,
      }))
    );
    const merkleRoot = merkleRes.rootHash;
    const defaultMiner = miners[0] || INITIAL_MINERS[0];
    const diff = config.difficulty;
    const targetPrefix = '0'.repeat(diff);

    let validNonce = 1000;
    let validHash = '';
    for (let i = 0; i < 40000; i++) {
      const n = 1000 + i;
      const h = fastSha256Hex(`${nextBlockHeight}:${previousHash}:${merkleRoot}:${n}:${defaultMiner.id}`);
      if (h.startsWith(targetPrefix)) {
        validNonce = n;
        validHash = h;
        break;
      }
    }
    if (!validHash) {
      validHash = `${targetPrefix}7b1c3d9e2f4a8b6c0d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9fa8`;
    }

    return {
      height: nextBlockHeight,
      id: `block-${nextBlockHeight}-candidate`,
      branchId: 'main',
      previousHash,
      hash: validHash,
      nonce: validNonce,
      timestamp: formatTimestamp(),
      merkleRoot,
      difficulty: diff,
      transactions: txsToUse.map((t) => ({ ...t })),
      minerId: defaultMiner.id,
      minerName: defaultMiner.name,
      cumulativeWork: (canonicalTip?.cumulativeWork || 0) + calculateBlockWork(diff),
      status: 'candidate',
      rewardBTC: config.baseRewardBTC + txsToUse.reduce((acc, t) => acc + (t.feeBTC || 0), 0),
    };
  }, [winnerBlock, broadcastingBlock, selectedTxs, mempool, nextBlockHeight, previousHash, config.difficulty, config.baseRewardBTC, miners, canonicalTip]);

  // Update Node position on drag
  const handleUpdateNodePosition = (id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  };

  // Mempool handlers
  const handleCreateTx = (tx: E2ETransaction) => {
    setMempool((prev) => [tx, ...prev]);
    setSelectedTxIds((prev) => [...prev, tx.id]);
    addLog('tx', `Giao dịch mới đã ký: ${tx.sender} → ${tx.recipient} (${tx.amount} BTC)`, `TXID: ${tx.hash.substring(0, 16)}...`);
    
    // Global Next-Step Guidance Trigger
    triggerStepCompleted({
      completedSummaryVi: `Đã tạo giao dịch mới (${tx.sender} → ${tx.recipient}: ${tx.amount} BTC) và đưa vào Mempool`,
      completedSummaryEn: `Created transaction (${tx.sender} → ${tx.recipient}: ${tx.amount} BTC) and added to Mempool`,
      nextActionVi: 'Xem Mempool & Đóng gói khối →',
      nextActionEn: 'Inspect Mempool & Pack Block →',
      nextStepId: 'step-2',
    });
  };

  const handleDeleteTx = (txId: string) => {
    setMempool((prev) => prev.filter((t) => t.id !== txId));
    setSelectedTxIds((prev) => prev.filter((id) => id !== txId));
  };

  const handleToggleSelectTx = (txId: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(txId) ? prev.filter((id) => id !== txId) : [...prev, txId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTxIds(mempool.map((t) => t.id));
  };

  const handleDeselectAll = () => {
    setSelectedTxIds([]);
  };

  // Reset Lab State
  const handleResetAll = () => {
    stopAllMiningWorkers();
    if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
    setIsMining(false);
    setMiningElapsedTimeSec(0);
    setWinnerBlock(null);
    setBroadcastActive(false);
    setBroadcastingBlock(null);
    setConsensusReached(false);
    setPackets([]);
    setForkActive(false);
    setBranchABlocks([]);
    setBranchBBlocks([]);
    setOrphanedBlocks([]);
    setMempool(INITIAL_TRANSACTIONS);
    setSelectedTxIds(['tx-init-1', 'tx-init-2']);
    setMiners(INITIAL_MINERS);
    setBlockchain(INITIAL_BLOCKS);
    setNodes(INITIAL_NODES);
    setTamperedBlockHeight(null);
    setGuidedStep(1);
    resetGuidance();
    addLog('consensus', 'Đã đặt lại trạng thái phòng thí nghiệm về khối Genesis + Block #2');
  };

  // Mining Engine Execution via Web Workers
  const handleStartMining = (simulateFork = false) => {
    if (isMining) return;

    stopAllMiningWorkers();

    setIsMining(true);
    setWinnerBlock(null);
    setBroadcastActive(false);
    setConsensusReached(false);
    setPackets([]);
    setMiningElapsedTimeSec(0);
    miningStartTimeRef.current = performance.now();

    timerIntervalRef.current = window.setInterval(() => {
      setMiningElapsedTimeSec((performance.now() - miningStartTimeRef.current) / 1000);
    }, 80);

    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        validationState: { prevHash: null, merkleRoot: null, txValid: null, powValid: null, isAccepted: null },
      }))
    );

    const merkleResult = buildMerkleTree(
      selectedTxs.map((t) => ({
        id: t.id,
        sender: t.sender,
        receiver: t.recipient,
        amount: t.amount,
        timestamp: t.timestamp,
        hash: t.hash,
      }))
    );
    const merkleRoot = merkleResult.rootHash;
    const targetPrefix = '0'.repeat(config.difficulty);

    addLog(
      'mining',
      `Khởi động cuộc đua đào khối #${nextBlockHeight} (${config.minerCount} thợ đào song song)`,
      `Mục tiêu: "${targetPrefix}..." | Độ khó: ${config.difficulty}`
    );

    const activeMiners: E2EMiner[] = miners.slice(0, config.minerCount).map((m, idx) => ({
      ...m,
      status: 'mining' as const,
      currentNonce: idx * 10000000,
      attempts: 0,
    }));
    setMiners(activeMiners);

    const isForkSim = simulateFork || config.forkSimulationEnabled;
    const headerPrefix = `${nextBlockHeight}:${previousHash}:${merkleRoot}:`;

    const latestTelemetry: {
      [minerId: string]: {
        currentNonce: number;
        attempts: number;
        currentHash: string;
        hashrateKHz: number;
      };
    } = {};

    activeMiners.forEach((m) => {
      latestTelemetry[m.id] = {
        currentNonce: m.currentNonce,
        attempts: 0,
        currentHash: m.currentHash,
        hashrateKHz: m.hashrateKHz,
      };
    });

    winnerDiscoveredRef.current = false;

    try {
      const blobUrl = createMiningWorkerBlob();
      workerBlobUrlRef.current = blobUrl;
      const workers: Worker[] = [];

      const handleWorkerWinner = (
        winnerMinerId: string,
        winningNonce: number,
        winningHash: string,
        winningAttempts: number
      ) => {
        if (winnerDiscoveredRef.current) return;
        winnerDiscoveredRef.current = true;

        stopAllMiningWorkers();
        setIsMining(false);

        const durationSec = (performance.now() - miningStartTimeRef.current) / 1000;
        setMiningElapsedTimeSec(durationSec);

        const winningMinerObj = activeMiners.find((m) => m.id === winnerMinerId) || activeMiners[0];
        const winner: E2EMiner = {
          ...winningMinerObj,
          currentNonce: winningNonce,
          currentHash: winningHash,
          attempts: winningAttempts,
          status: 'winner',
        };

        const totalAttempts = Object.values(latestTelemetry).reduce((acc, t) => acc + t.attempts, winningAttempts);

        if (isForkSim) {
          const rivalObj = activeMiners.find((m) => m.id !== winnerMinerId) || activeMiners[1] || activeMiners[0];

          const blockA: E2EBlock = {
            height: nextBlockHeight,
            id: `block-${nextBlockHeight}-branchA-${Date.now().toString(36)}`,
            branchId: 'branchA',
            previousHash,
            hash: winner.currentHash,
            nonce: winner.currentNonce,
            timestamp: formatTimestamp(),
            merkleRoot,
            difficulty: config.difficulty,
            transactions: selectedTxs.map((t) => ({ ...t })),
            minerId: winner.id,
            minerName: winner.name,
            cumulativeWork: (canonicalTip?.cumulativeWork || 0) + calculateBlockWork(config.difficulty),
            status: 'competing',
            rewardBTC: config.baseRewardBTC + selectedTxs.reduce((acc, t) => acc + (t.feeBTC || 0), 0),
          };

          const blockB = mineBlockSynchronous(
            canonicalTip,
            nextBlockHeight,
            'branchB',
            { id: rivalObj.id, name: rivalObj.name },
            selectedTxs.map((t) => ({ ...t })),
            config.difficulty,
            config.baseRewardBTC
          );

          const forkWinner: E2EMiner = {
            ...rivalObj,
            currentNonce: blockB.nonce,
            currentHash: blockB.hash,
            attempts: rivalObj.attempts + Math.floor(winningAttempts * 0.95) + 50,
            status: 'winner',
          };

          setWinnerBlock(blockA);
          setForkActive(true);

          setMiners((prev) =>
            prev.map((m) => {
              if (m.id === winner.id) return winner;
              if (m.id === forkWinner.id) return forkWinner;
              return { ...m, status: 'stopped' };
            })
          );

          addLog(
            'fork',
            `⚡ PHÂN NHÁNH ĐỒNG THỜI: Cả ${winner.name} và ${forkWinner.name} tìm thấy khối hợp lệ cùng lúc!`,
            `Nhánh A Nonce: ${winner.currentNonce.toLocaleString()} | Nhánh B Nonce: ${forkWinner.currentNonce.toLocaleString()}`
          );

          setBranchABlocks([blockA]);
          setBranchBBlocks([blockB]);
          setCumulativeWorkA(blockA.cumulativeWork);
          setCumulativeWorkB(blockB.cumulativeWork);
          setActiveMainBranch('tied');
        } else {
          const candidateBlock: E2EBlock = {
            height: nextBlockHeight,
            id: `block-${nextBlockHeight}-${Date.now().toString(36)}`,
            branchId: 'main',
            previousHash,
            hash: winner.currentHash,
            nonce: winner.currentNonce,
            timestamp: formatTimestamp(),
            merkleRoot,
            difficulty: config.difficulty,
            transactions: selectedTxs.map((t) => ({ ...t })),
            minerId: winner.id,
            minerName: winner.name,
            cumulativeWork: (canonicalTip?.cumulativeWork || 0) + calculateBlockWork(config.difficulty),
            status: 'candidate',
            rewardBTC: config.baseRewardBTC + selectedTxs.reduce((acc, t) => acc + (t.feeBTC || 0), 0),
          };

          setWinnerBlock(candidateBlock);
          setBroadcastingBlock(candidateBlock);

          setMiners((prev) =>
            prev.map((m) => (m.id === winner.id ? winner : { ...m, status: 'stopped' }))
          );

          addLog(
            'mining',
            `🏆 Thợ đào ${winner.name} đã chiến thắng sau ${durationSec.toFixed(2)}s! Nonce hợp lệ: ${winner.currentNonce.toLocaleString()}`,
            `Mã băm: ${winner.currentHash}`
          );
        }

        setLastExperimentSummary({
          winnerName: winner.name,
          totalAttempts,
          miningTimeSec: durationSec,
          forkOccurred: Boolean(isForkSim),
          mainBranch: isForkSim ? 'Competing Fork' : 'Canonical Chain',
          orphanedCount: 0,
        });

        // Global Next-Step Guidance Trigger for Mining Win
        triggerStepCompleted({
          completedSummaryVi: isForkSim
            ? `Cả ${winner.name} và đối thủ đã khai thác thành công (Tạo phân nhánh song song)`
            : `Thợ đào ${winner.name} đã tìm thấy Nonce hợp lệ (${winner.currentNonce.toLocaleString()}) cho Khối #${nextBlockHeight}`,
          completedSummaryEn: isForkSim
            ? `Both ${winner.name} and rival miner mined blocks simultaneously (Fork created)`
            : `Miner ${winner.name} discovered valid Nonce (${winner.currentNonce.toLocaleString()}) for Block #${nextBlockHeight}`,
          nextActionVi: isForkSim ? 'Xem phân nhánh & Lan truyền P2P →' : 'Lan truyền & Xác thực khối P2P →',
          nextActionEn: isForkSim ? 'Inspect Fork & P2P Gossip →' : 'P2P Gossip & Node Validation →',
          nextStepId: 'step-5',
        });
      };

      activeMiners.forEach((miner) => {
        const worker = new Worker(blobUrl);
        workers.push(worker);

        worker.onmessage = (e: MessageEvent<MinerWorkerOutgoingMessage>) => {
          const msg = e.data;
          if (!msg) return;

          if (msg.type === 'TELEMETRY') {
            latestTelemetry[msg.minerId] = {
              currentNonce: msg.currentNonce,
              attempts: msg.attempts,
              currentHash: msg.currentHash,
              hashrateKHz: msg.measuredHashrateKHz || miner.hashrateKHz,
            };
          } else if (msg.type === 'WINNER') {
            handleWorkerWinner(msg.minerId, msg.nonce, msg.hash, msg.attempts);
          }
        };

        const speedMultiplier = simulationSpeed;
        const batchSize = Math.max(300, Math.floor(miner.hashrateKHz * 1.5 * speedMultiplier));

        worker.postMessage({
          type: 'START',
          config: {
            minerId: miner.id,
            headerPrefix,
            startNonce: miner.currentNonce,
            step: 1,
            targetPrefix,
            batchSize,
          },
        });
      });

      workersRef.current = workers;

      telemetryIntervalRef.current = window.setInterval(() => {
        setMiners((prev) =>
          prev.map((m) => {
            const telemetry = latestTelemetry[m.id];
            if (telemetry && m.status === 'mining') {
              return {
                ...m,
                currentNonce: telemetry.currentNonce,
                attempts: telemetry.attempts,
                currentHash: telemetry.currentHash,
                hashrateKHz: telemetry.hashrateKHz || m.hashrateKHz,
              };
            }
            return m;
          })
        );
      }, 100);
    } catch {
      // Fallback synchronous mining
      const runFallbackMining = () => {
        let foundWinner: E2EMiner | null = null;

        const updated = activeMiners.map((miner) => {
          const chunk = Math.max(100, Math.floor(miner.hashrateKHz * 2 * simulationSpeed));
          let lastNonce = miner.currentNonce;
          let lastHash = miner.currentHash;

          for (let i = 0; i < chunk; i++) {
            lastNonce++;
            const headerString = `${nextBlockHeight}:${previousHash}:${merkleRoot}:${lastNonce}:${miner.id}`;
            lastHash = fastSha256Hex(headerString);

            if (lastHash.startsWith(targetPrefix)) {
              if (!foundWinner) {
                foundWinner = {
                  ...miner,
                  currentNonce: lastNonce,
                  currentHash: lastHash,
                  attempts: miner.attempts + i + 1,
                  status: 'winner',
                };
                break;
              }
            }
          }

          return {
            ...miner,
            currentNonce: lastNonce,
            currentHash: lastHash,
            attempts: miner.attempts + chunk,
            status: (foundWinner && foundWinner.id === miner.id ? 'winner' : 'mining') as E2EMiner['status'],
          };
        });

        setMiners(updated);

        if (foundWinner) {
          setIsMining(false);
          const winner = foundWinner as E2EMiner;
          const durationSec = (performance.now() - miningStartTimeRef.current) / 1000;
          setMiningElapsedTimeSec(durationSec);

          addLog(
            'mining',
            `🏆 Thợ đào ${winner.name} đã chiến thắng sau ${durationSec.toFixed(2)}s! Nonce hợp lệ: ${winner.currentNonce.toLocaleString()}`,
            `Mã băm: ${winner.currentHash}`
          );

          const candidateBlock: E2EBlock = {
            height: nextBlockHeight,
            id: `block-${nextBlockHeight}`,
            branchId: 'main',
            previousHash,
            hash: winner.currentHash,
            nonce: winner.currentNonce,
            timestamp: formatTimestamp(),
            merkleRoot,
            difficulty: config.difficulty,
            transactions: selectedTxs,
            minerId: winner.id,
            minerName: winner.name,
            cumulativeWork: (canonicalTip?.cumulativeWork || 0) + calculateBlockWork(config.difficulty),
            status: 'candidate',
            rewardBTC: config.baseRewardBTC + selectedTxs.reduce((acc, t) => acc + t.feeBTC, 0),
          };

          setWinnerBlock(candidateBlock);
          setBroadcastingBlock(candidateBlock);
          return;
        }

        miningLoopRef.current = requestAnimationFrame(runFallbackMining);
      };

      miningLoopRef.current = requestAnimationFrame(runFallbackMining);
    }
  };

  const handleStopMining = () => {
    stopAllMiningWorkers();
    setIsMining(false);
    setMiners((prev) => prev.map((m) => (m.status === 'mining' ? { ...m, status: 'stopped' } : m)));
    addLog('mining', 'Đã dừng cuộc đua khai thác.');
  };

  // Fork state reset
  const handleResetFork = () => {
    setForkActive(false);
    setBranchABlocks([]);
    setBranchBBlocks([]);
    setCumulativeWorkA(0);
    setCumulativeWorkB(0);
    setActiveMainBranch('tied');
    setOrphanedBlocks([]);
    addLog('fork', 'Đã đặt lại trạng thái phân nhánh. Chuỗi quay lại đỉnh chuỗi chính.');
  };

  // Mine on branch
  const handleMineNextOnBranch = (branch: 'branchA' | 'branchB') => {
    const isBranchA = branch === 'branchA';
    const targetBlocks = isBranchA ? branchABlocks : branchBBlocks;
    const parentBlock = targetBlocks[targetBlocks.length - 1] || canonicalTip;
    const newHeight = parentBlock.height + 1;
    const miner = isBranchA
      ? { id: 'miner-alice', name: 'Alice Node' }
      : { id: 'miner-bob', name: 'Bob Node' };

    const newBlock = mineBlockSynchronous(
      parentBlock,
      newHeight,
      branch,
      miner,
      [],
      config.difficulty,
      config.baseRewardBTC
    );

    if (isBranchA) {
      const updatedA = [...branchABlocks, newBlock];
      setBranchABlocks(updatedA);
      const newWorkA = newBlock.cumulativeWork;
      setCumulativeWorkA(newWorkA);
      addLog(
        'fork',
        `⛏️ Thợ đào ${miner.name} đã đào Khối #${newHeight} trên Nhánh A (Nonce: ${newBlock.nonce.toLocaleString()} | Hash: ${newBlock.hash.substring(0, 16)}...)`,
        `PoW tích lũy: ${newWorkA.toLocaleString()}`
      );

      if (newWorkA > cumulativeWorkB) {
        setActiveMainBranch('branchA');
      } else if (newWorkA < cumulativeWorkB) {
        setActiveMainBranch('branchB');
      } else {
        setActiveMainBranch('tied');
      }
    } else {
      const updatedB = [...branchBBlocks, newBlock];
      setBranchBBlocks(updatedB);
      const newWorkB = newBlock.cumulativeWork;
      setCumulativeWorkB(newWorkB);
      addLog(
        'fork',
        `⛏️ Thợ đào ${miner.name} đã đào Khối #${newHeight} trên Nhánh B (Nonce: ${newBlock.nonce.toLocaleString()} | Hash: ${newBlock.hash.substring(0, 16)}...)`,
        `PoW tích lũy: ${newWorkB.toLocaleString()}`
      );

      if (newWorkB > cumulativeWorkA) {
        setActiveMainBranch('branchB');
      } else if (newWorkB < cumulativeWorkA) {
        setActiveMainBranch('branchA');
      } else {
        setActiveMainBranch('tied');
      }
    }
  };

  // Auto Resolve Fork via Nakamoto Consensus
  const handleAutoResolveFork = () => {
    const tipA = branchABlocks[branchABlocks.length - 1];
    const tipB = branchBBlocks[branchBBlocks.length - 1];
    const workA = tipA?.cumulativeWork || cumulativeWorkA;
    const workB = tipB?.cumulativeWork || cumulativeWorkB;

    if (workA > workB) {
      resolveLongestChain('branchA', branchABlocks, branchBBlocks);
    } else if (workB > workA) {
      resolveLongestChain('branchB', branchABlocks, branchBBlocks);
    } else {
      const parentBlock = tipA || canonicalTip;
      const newHeight = parentBlock.height + 1;
      const newBlock = mineBlockSynchronous(
        parentBlock,
        newHeight,
        'branchA',
        { id: 'miner-alice', name: 'Alice Node' },
        [],
        config.difficulty,
        config.baseRewardBTC
      );
      const updatedA = [...branchABlocks, newBlock];
      setBranchABlocks(updatedA);
      setCumulativeWorkA(newBlock.cumulativeWork);
      resolveLongestChain('branchA', updatedA, branchBBlocks);
    }
  };

  // Nakamoto Consensus Resolution
  const resolveLongestChain = (
    winningBranchOverride?: 'branchA' | 'branchB',
    chainAOverride?: E2EBlock[],
    chainBOverride?: E2EBlock[]
  ) => {
    const chainA = chainAOverride || branchABlocks;
    const chainB = chainBOverride || branchBBlocks;
    if (chainA.length === 0 && chainB.length === 0) return;

    const result = resolveCanonicalChain(chainA, chainB, blockchain);
    const actualWinner = winningBranchOverride || result.winningBranch;

    setActiveMainBranch(actualWinner);

    addLog(
      'consensus',
      `🏆 PHÂN ĐỊNH NAKAMOTO: ${actualWinner === 'branchA' ? 'Nhánh A (Alice)' : 'Nhánh B (Bob)'} có tổng PoW tích lũy lớn hơn và trở thành chuỗi chính!`,
      result.resolutionReason
    );

    const forkStartHeight = result.canonicalBlocks[0]?.height ?? nextBlockHeight;
    setBlockchain((prev) => {
      const baselineAncestor = prev.filter((b) => b.height < forkStartHeight);
      const combined = [...baselineAncestor, ...result.canonicalBlocks];
      const uniqueMap = new Map<string, E2EBlock>();
      combined.forEach((b) => uniqueMap.set(b.hash, { ...b, status: 'canonical' }));
      return Array.from(uniqueMap.values()).sort((a, b) => a.height - b.height);
    });

    setOrphanedBlocks((prev) => {
      const uniqueMap = new Map<string, E2EBlock>();
      prev.forEach((b) => uniqueMap.set(b.hash, b));
      result.orphanedBlocks.forEach((b) => uniqueMap.set(b.hash, { ...b, status: 'orphaned' }));
      return Array.from(uniqueMap.values()).sort((a, b) => a.height - b.height);
    });

    if (result.returnedTransactions.length > 0) {
      setMempool((prev) => {
        const existingTxIds = new Set(prev.map((t) => t.id));
        const toAdd = result.returnedTransactions.filter((t) => !existingTxIds.has(t.id));
        return [...toAdd, ...prev];
      });
      addLog(
        'orphan',
        `🟠 Tái tổ chức chuỗi: ${result.returnedTransactions.length} giao dịch từ khối mồ côi đã trở lại Mempool an toàn.`
      );
    }

    const winningMinerName = actualWinner === 'branchA' ? 'Alice Node' : 'Bob Node';
    const losingMinerName = actualWinner === 'branchA' ? 'Bob Node' : 'Alice Node';
    addLog(
      'reward',
      `💰 Quyết toán phân định: ${winningMinerName} nhận phần thưởng khối chính thức. Khối của ${losingMinerName} trở thành khối mồ côi (0 BTC).`
    );

    setLastExperimentSummary({
      winnerName: winningMinerName,
      totalAttempts: (chainA.length + chainB.length) * 5000,
      miningTimeSec: miningElapsedTimeSec || 1.8,
      forkOccurred: true,
      mainBranch: actualWinner === 'branchA' ? 'Nhánh A (Alice)' : 'Nhánh B (Bob)',
      orphanedCount: result.orphanedBlocks.length,
    });

    setForkActive(false);

    // Global Next-Step Guidance Trigger for Fork Resolution
    triggerStepCompleted({
      completedSummaryVi: `Đã giải quyết phân nhánh chuỗi: ${winningMinerName} thắng theo Quy tắc chuỗi dài nhất`,
      completedSummaryEn: `Fork resolved: ${winningMinerName} won under Nakamoto Longest Chain Rule`,
      nextActionVi: 'Xem sổ cái chính thức →',
      nextActionEn: 'Inspect Canonical Ledger →',
      nextStepId: 'step-7',
    });
  };

  // Finalize Single Candidate Block into Canonical (When no fork exists)
  const handleFinalizeCandidateBlock = () => {
    let finalizedMinerName = 'Alice Node';
    let finalizedHeight = nextBlockHeight;
    let rewardAmount = config.baseRewardBTC;

    setBlockchain((prev) =>
      prev.map((b) => {
        if (b.status === 'candidate') {
          finalizedMinerName = b.minerName;
          finalizedHeight = b.height;
          rewardAmount = b.rewardBTC;
          return { ...b, status: 'canonical' as const };
        }
        return b;
      })
    );

    addLog(
      'consensus',
      `🏆 ĐỒNG THUẬN NAKAMOTO: Khối #${finalizedHeight} đã được toàn mạng chấp nhận làm Chuỗi chính thức (Canonical)!`,
      'Không có nhánh cạnh tranh hoặc khối đã vượt qua kiểm tra chuỗi nặng nhất. Khối chính thức đạt Finality.'
    );

    addLog(
      'reward',
      `💰 Quyết toán phần thưởng: ${finalizedMinerName} nhận +${rewardAmount.toFixed(4)} BTC (+${config.baseRewardBTC} coinbase + phí giao dịch)`
    );

    triggerStepCompleted({
      completedSummaryVi: `Đã hoàn tất đồng thuận Nakamoto cho Khối #${finalizedHeight}`,
      completedSummaryEn: `Completed Nakamoto consensus for Block #${finalizedHeight}`,
      nextActionVi: 'Xem sổ cái chính thức →',
      nextActionEn: 'Inspect Canonical Ledger →',
      nextStepId: 'step-7',
    });
  };

  // Failure Injection Handlers
  const handleTamperBlockData = (height: number) => {
    setTamperedBlockHeight(height);
    setBlockchain((prev) =>
      prev.map((b) => {
        if (b.height === height) {
          const tamperedTxs = b.transactions.map((t, idx) =>
            idx === 0 ? { ...t, amount: 999.0 } : t
          );
          const newMerkle = fastSha256Hex(`tampered-merkle-${Date.now()}`);
          const newHash = fastSha256Hex(`tampered-block-${height}-${Date.now()}`);
          return {
            ...b,
            transactions: tamperedTxs,
            merkleRoot: newMerkle,
            hash: newHash,
            isTampered: true,
            tamperReason: 'Satoshi → Hal Finney amount modified to 999.0 BTC',
          };
        }
        return b;
      })
    );

    addLog(
      'fault',
      `🚨 TIÊM LỖI: Dữ liệu Khối #${height} đã bị chỉnh sửa trái phép (10 BTC → 999 BTC)!`,
      `Hash của Khối #${height} đã lệch hoàn toàn so với liên kết mã băm của khối trước tại Khối #${height + 1}`
    );
  };

  const handleCorruptHash = (height: number) => {
    setTamperedBlockHeight(height);
    setBlockchain((prev) =>
      prev.map((b) => {
        if (b.height === height) {
          return {
            ...b,
            hash: 'ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00',
            isTampered: true,
            tamperReason: 'Block hash corrupted',
          };
        }
        return b;
      })
    );

    addLog('fault', `🚨 TIÊM LỖI: Mã băm của Khối #${height} bị giả mạo!`);
  };

  const handleCorruptMerkle = (height: number) => {
    setTamperedBlockHeight(height);
    setBlockchain((prev) =>
      prev.map((b) => {
        if (b.height === height) {
          return {
            ...b,
            merkleRoot: '0000000000000000000000000000000000000000000000000000000000000000',
            isTampered: true,
            tamperReason: 'Merkle root corrupted',
          };
        }
        return b;
      })
    );

    addLog('fault', `🚨 TIÊM LỖI: Merkle Root của Khối #${height} đã bị đặt về 0!`);
  };

  const handleCorruptPoW = (height: number) => {
    setTamperedBlockHeight(height);
    setBlockchain((prev) =>
      prev.map((b) => {
        if (b.height === height) {
          return {
            ...b,
            nonce: 0,
            hash: 'ffffa4b7f32991823908f9c1b827e8a9d18c9918274a5e1e4baab89f3a32518a',
            isTampered: true,
            tamperReason: 'PoW difficulty unmet',
          };
        }
        return b;
      })
    );

    addLog('fault', `🚨 TIÊM LỖI: Nonce của Khối #${height} bị sửa → Không đạt độ khó PoW!`);
  };

  const handleToggleNodeOnline = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const nextOffline = !n.isOffline;
          addLog(
            'fault',
            nextOffline
              ? `🔌 NÚT MẤT KẾT NỐI: ${n.name} đã ngắt kết nối khỏi mạng P2P.`
              : `⚡ NÚT TÁI KẾT NỐI: ${n.name} đã kết nối lại và bắt đầu đồng bộ chuỗi.`
          );
          return { ...n, isOffline: nextOffline, status: nextOffline ? 'offline' : 'idle' };
        }
        return n;
      })
    );
  };

  const handleResetFaults = () => {
    setTamperedBlockHeight(null);
    setBlockchain(INITIAL_BLOCKS);
    setNodes(INITIAL_NODES);
    addLog('consensus', '✅ Đã khôi phục tính toàn vẹn 100% của chuỗi khối.');
  };

  // Keyboard Shortcuts (Space for Play/Pause, R for Reset, N for Next Step, 1..7 for Steps)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isMining) {
          handleStopMining();
        } else {
          handleStartMining();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetAll();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setGuidedStep((prev) => Math.min(7, prev + 1));
      } else if (e.key >= '1' && e.key <= '7') {
        const stepNum = parseInt(e.key, 10);
        setGuidedStep(stepNum);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMining]);

  return (
    <section id="end-to-end-consensus" className="py-5 sm:py-8 bg-[#090d16] border-t border-zinc-800 text-zinc-100 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3.5">
        {/* 1. TOP HEADER & COMPACT CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 font-sans tracking-tight">
                {language === 'vi' ? 'Mô phỏng → Đồng thuận Blockchain' : 'Simulation → Blockchain Consensus'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 hidden sm:inline-block">
                Nakamoto Protocol
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {language === 'vi'
                ? 'Dòng chảy 3 giai đoạn: Đề xuất khối → Thẩm định độc lập P2P → Đồng thuận chuỗi nặng nhất'
                : '3-Phase Flow: Block Proposal → P2P Independent Validation → Heaviest Chain Consensus'}
            </p>
          </div>

          {/* Compact Top Utilities (Muted, low visual weight) */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Simulation Speed (0.5x, 1x, 2x, 4x) - ONLY on Step 4 (Mining) and Step 5 (P2P Broadcast) */}
            {(guidedStep === 4 || guidedStep === 5) && (
              <div className="flex items-center bg-zinc-900/90 rounded-lg p-0.5 border border-zinc-800 text-[11px] font-mono">
                {([0.5, 1, 2, 4] as SimulationSpeed[]).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setSimulationSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      simulationSpeed === spd ? 'bg-zinc-800 text-cyan-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={`${spd}x speed`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            )}

            {/* Simulation Mode Selector: Compact dropdown (Guided default, Free & Debug preserved) */}
            <div className="relative">
              <select
                value={simulationMode}
                onChange={(e) => setSimulationMode(e.target.value as SimulationMode)}
                className="bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2 py-1 cursor-pointer focus:outline-hidden focus:border-cyan-500 font-medium"
                aria-label={language === 'vi' ? 'Chế độ mô phỏng' : 'Simulation Mode'}
              >
                <option value="guided">{language === 'vi' ? 'Hướng dẫn (Guided)' : 'Guided Mode'}</option>
                <option value="free">{language === 'vi' ? 'Tự do (Free)' : 'Free Mode'}</option>
                <option value="debug">{language === 'vi' ? 'Gỡ lỗi (Debug)' : 'Debug Mode'}</option>
              </select>
            </div>

            {/* Theory Quick Entry */}
            <button
              type="button"
              onClick={() => setActiveDrawerTab(activeDrawerTab === 'insights' ? 'none' : 'insights')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeDrawerTab === 'insights'
                  ? 'bg-amber-950/60 border-amber-600/80 text-amber-300'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'vi' ? 'Lý thuyết' : 'Theory'}</span>
            </button>

            {/* Audit Modal */}
            <button
              type="button"
              id="btn-open-audit-modal"
              onClick={() => setIsAuditModalOpen(true)}
              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title={language === 'vi' ? 'Kiểm tra hệ thống' : 'Consensus Audit'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            {/* Config Modal */}
            <button
              type="button"
              id="btn-open-experiment-config"
              onClick={() => setIsConfigModalOpen(true)}
              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title={language === 'vi' ? 'Cấu hình tham số' : 'Simulation Parameters'}
            >
              <FlaskConical className="w-3.5 h-3.5" />
            </button>

            {/* Reset Lab */}
            <button
              type="button"
              id="btn-e2e-reset-lab"
              onClick={handleResetAll}
              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title={language === 'vi' ? 'Đặt lại phòng lab' : 'Reset Lab'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. UNIFIED COMPACT NAVIGATION: COMBINED PHASE + STEP + STEPPER + CONTEXTUAL METRIC */}
        <div className="bg-[#0b0f19] border border-zinc-800/80 rounded-xl px-3 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          {/* Left: Phase (most prominent) + Step (2nd prominent) + Subtitle */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {/* Current Phase Badge (Most prominent) */}
            <button
              type="button"
              onClick={() => {
                const targetStep = currentPhase.steps[0];
                setGuidedStep(targetStep);
                startNextStep(`step-${targetStep}`);
              }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPhase.id === 'proposal'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : currentPhase.id === 'validation'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
              }`}
              title={language === 'vi' ? 'Bấm để về đầu Pha này' : 'Click to jump to Phase start'}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentPhase.id === 'proposal'
                    ? 'bg-cyan-400 animate-pulse'
                    : currentPhase.id === 'validation'
                    ? 'bg-purple-400 animate-pulse'
                    : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span>{language === 'vi' ? currentPhase.nameVi : currentPhase.nameEn}</span>
            </button>

            <span className="text-zinc-600 select-none hidden sm:inline">·</span>

            {/* Current Step (2nd most prominent) */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-zinc-400 font-mono text-[11px] shrink-0">
                {language === 'vi' ? `Bước ${guidedStep}/7:` : `Step ${guidedStep}/7:`}
              </span>
              <span className="text-zinc-100 font-semibold text-sm truncate">
                {language === 'vi' ? LAB_STEPS[guidedStep - 1]?.nameVi : LAB_STEPS[guidedStep - 1]?.nameEn}
              </span>
            </div>
          </div>

          {/* Right: Stepper (Prev, Minimal Steps, Next) + Contextual Metric */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto flex-wrap sm:flex-nowrap">
            {/* Stepper with Previous/Next and minimal step indicators */}
            <div className="flex items-center gap-1 bg-zinc-900/90 px-1.5 py-0.5 rounded-lg border border-zinc-800/80 font-mono text-[11px]">
              <button
                type="button"
                disabled={guidedStep <= 1}
                onClick={() => {
                  const prev = Math.max(1, guidedStep - 1);
                  setGuidedStep(prev);
                  startNextStep(`step-${prev}`);
                }}
                className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                title={language === 'vi' ? 'Bước trước (Phím 1-7)' : 'Previous Step (Keys 1-7)'}
                aria-label="Previous Step"
              >
                ‹
              </button>

              {LAB_STEPS.map((s) => {
                const isActive = guidedStep === s.step;
                const isCompleted = guidedStep > s.step;
                const isTarget = isReadyForNext && nextActionTargetId === `step-${s.step}`;

                const accessibleLabel = isActive
                  ? (language === 'vi' ? `Bước ${s.step}: ${s.nameVi} (Đang chọn)` : `Step ${s.step}: ${s.nameEn} (Current)`)
                  : isCompleted
                  ? (language === 'vi' ? `Bước ${s.step}: ${s.nameVi} — đã hoàn thành` : `Step ${s.step}: ${s.nameEn} — completed`)
                  : (language === 'vi' ? `Bước ${s.step}: ${s.nameVi}` : `Step ${s.step}: ${s.nameEn}`);

                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      setGuidedStep(s.step);
                      startNextStep(`step-${s.step}`);
                    }}
                    className={`w-6 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500 text-zinc-950 font-bold shadow-xs'
                        : isTarget
                        ? 'guidance-amber-pulse bg-amber-500/20 text-amber-300 border border-amber-400 font-semibold text-[10px]'
                        : isCompleted
                        ? 'hover:bg-zinc-800/80'
                        : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/60 text-[10px]'
                    }`}
                    title={`${s.step}. ${language === 'vi' ? s.nameVi : s.nameEn}${isCompleted ? (language === 'vi' ? ' (Đã hoàn thành)' : ' (Completed)') : ''}`}
                    aria-label={accessibleLabel}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isActive ? (
                      s.step
                    ) : isCompleted ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/90 shrink-0" />
                    ) : (
                      s.step
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={guidedStep >= 7}
                onClick={() => {
                  const next = Math.min(7, guidedStep + 1);
                  setGuidedStep(next);
                  startNextStep(`step-${next}`);
                }}
                className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                title={language === 'vi' ? 'Bước kế tiếp (Phím N)' : 'Next Step (Key N)'}
                aria-label="Next Step"
              >
                ›
              </button>
            </div>

            {/* Contextual Metric (Only step-relevant metric) */}
            <div className="font-mono text-zinc-400 text-[11px] bg-zinc-900/60 px-2.5 py-1 rounded-md border border-zinc-800/60 flex items-center gap-1.5 whitespace-nowrap">
              <Activity className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>
                {getContextualMetrics(
                  guidedStep,
                  language,
                  mempool,
                  selectedTxIds,
                  nextBlockHeight,
                  selectedTxs,
                  previousHash,
                  config,
                  miners,
                  totalMiningAttempts,
                  nodes,
                  cumulativeWorkA,
                  cumulativeWorkB,
                  blockchain
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 4. COMPACT FAULT WARNING STATE (Only rendered if tampering occurred, doesn't push workspace down) */}
        {tamperedBlockHeight !== null && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-600/70 text-xs text-rose-300 font-mono">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse flex-shrink-0" />
              <span>
                {language === 'vi'
                  ? `CẢNH BÁO TIÊM LỖI: Dữ liệu Khối #${tamperedBlockHeight} đã bị thay đổi! Mạng P2P sẽ phát hiện sai lệch khi thẩm định.`
                  : `FAULT ALERT: Block #${tamperedBlockHeight} tampered! P2P validators will reject this upon validation.`}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveDrawerTab('faults')}
                className="text-xs text-rose-200 underline hover:text-white cursor-pointer"
              >
                {language === 'vi' ? 'Xem tác động' : 'Inspect'}
              </button>
              <button
                type="button"
                onClick={handleResetFaults}
                className="px-2 py-0.5 rounded bg-rose-800 hover:bg-rose-700 text-zinc-100 text-[11px] cursor-pointer"
              >
                {language === 'vi' ? 'Khôi phục' : 'Revert'}
              </button>
            </div>
          </div>
        )}

        {/* 5. PRIMARY WORKSPACE: STEP VISUALIZER */}
        <div className="min-h-[420px]">
          {guidedStep === 1 && (
            <TransactionCreateStep
              onCreateTx={handleCreateTx}
              isMining={isMining}
              language={language}
            />
          )}

          {guidedStep === 2 && (
            <MempoolStep
              mempool={mempool}
              selectedTxIds={selectedTxIds}
              onToggleSelectTx={handleToggleSelectTx}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onDeleteTx={handleDeleteTx}
              isMining={isMining}
              language={language}
            />
          )}

          {guidedStep === 3 && (
            <BlockConstructionPanel
              blockHeight={nextBlockHeight}
              previousHash={previousHash}
              selectedTxs={selectedTxs}
              difficulty={config.difficulty}
              onChangeDifficulty={(diff) => setConfig((prev) => ({ ...prev, difficulty: diff }))}
              isMining={isMining}
              baseRewardBTC={config.baseRewardBTC}
              language={language}
            />
          )}

          {guidedStep === 4 && (
            <ConcurrentMiningArena
              miners={miners.slice(0, config.minerCount)}
              isMining={isMining}
              onStartMining={handleStartMining}
              onStopMining={handleStopMining}
              onSimulateFork={() => handleStartMining(true)}
              onResetMiners={() => {
                setMiners(INITIAL_MINERS);
                setWinnerBlock(null);
                setMiningElapsedTimeSec(0);
              }}
              targetBlockHeight={nextBlockHeight}
              winnerBlock={winnerBlock}
              elapsedTimeSec={miningElapsedTimeSec}
              totalAttempts={totalMiningAttempts}
              difficulty={config.difficulty}
              language={language}
            />
          )}

          {guidedStep === 5 && (
            <NetworkBroadcastGraph
              nodes={nodes}
              onUpdateNodePosition={handleUpdateNodePosition}
              broadcastActive={broadcastActive}
              broadcastingBlock={broadcastingBlock}
              candidateBlock={step5CandidateBlock}
              packets={packets}
              consensusReached={consensusReached}
              forkActive={forkActive}
              onPropagationComplete={(finalBlock) => {
                setConsensusReached(true);
                const validatedCandidateBlock: E2EBlock = {
                  ...finalBlock,
                  status: 'candidate',
                };
                setBlockchain((prev) => {
                  const withoutFutureOrSame = prev.filter(
                    (b) => b.height < validatedCandidateBlock.height && b.hash !== validatedCandidateBlock.hash
                  );
                  return [...withoutFutureOrSame, validatedCandidateBlock];
                });
                const confirmedIds = new Set(finalBlock.transactions.map((t) => t.id));
                setMempool((prev) => prev.filter((t) => !confirmedIds.has(t.id)));
                setSelectedTxIds((prev) => prev.filter((id) => !confirmedIds.has(id)));
                addLog(
                  'validation',
                  `🛡️ THẨM ĐỊNH ĐỘC LẬP: Toàn bộ ${nodes.length} nút P2P đã kiểm tra 4 điều kiện mật mã và lưu Khối #${validatedCandidateBlock.height} vào đỉnh chuỗi cục bộ (Active Tip).`,
                  'Khối này là ứng viên tiềm năng (Candidate). Nó chỉ đạt Finality và quyết toán phần thưởng sau khi chuỗi hội tụ theo Nakamoto Consensus.'
                );

                // Global Next-Step Guidance Trigger for Propagation Completion
                triggerStepCompleted({
                  completedSummaryVi: `Toàn bộ ${nodes.length} nút mạng P2P đã độc lập thẩm định Khối #${validatedCandidateBlock.height} (Ứng viên cục bộ, chờ đồng thuận chuỗi)`,
                  completedSummaryEn: `All ${nodes.length} P2P network nodes independently verified Block #${validatedCandidateBlock.height} (Local candidate, awaiting chain consensus)`,
                  nextActionVi: forkActive ? 'Giải quyết phân nhánh chuỗi cạnh tranh →' : 'Tiến tới Phân nhánh & Đồng thuận Nakamoto →',
                  nextActionEn: forkActive ? 'Resolve Competing Fork →' : 'Proceed to Fork & Nakamoto Consensus →',
                  nextStepId: 'step-6',
                });
              }}
              onLogEvent={(category, message, details) => {
                addLog(category, message, details);
              }}
              language={language}
            />
          )}

          {guidedStep === 6 && (
            <ForkAndLongestChainPipeline
              forkActive={forkActive}
              parentBlock={canonicalTip}
              branchABlocks={branchABlocks}
              branchBBlocks={branchBBlocks}
              cumulativeWorkA={cumulativeWorkA}
              cumulativeWorkB={cumulativeWorkB}
              activeMainBranch={activeMainBranch}
              orphanedBlocks={orphanedBlocks}
              onMineNextOnBranch={handleMineNextOnBranch}
              onAutoResolveFork={handleAutoResolveFork}
              onResetFork={handleResetFork}
              isMining={isMining}
              language={language}
            />
          )}

          {guidedStep === 7 && (
            <FinalLedgerExplorer
              blocks={blockchain}
              language={language}
            />
          )}
        </div>

        {/* CONTEXTUAL ACTION BAR (Bottom Primary Controller per Phase/Step) */}
        <div className="bg-[#0c101c] border border-zinc-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          {/* Back Step */}
          <button
            type="button"
            id="btn-nav-prev-step"
            onClick={() => setGuidedStep((prev) => Math.max(1, prev - 1))}
            disabled={guidedStep === 1}
            className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {guidedStep > 1
                ? `${language === 'vi' ? 'Quay lại:' : 'Back:'} ${language === 'vi' ? LAB_STEPS[guidedStep - 2].nameVi : LAB_STEPS[guidedStep - 2].nameEn}`
                : language === 'vi' ? 'Quay lại' : 'Back'}
            </span>
          </button>

          {/* PHASE-SPECIFIC PRIMARY CONTEXTUAL ACTION */}
          <div className="flex-1 flex items-center justify-center w-full sm:w-auto">
            {guidedStep === 1 && (
              <button
                type="button"
                onClick={() => {
                  const sampleTx: E2ETransaction = {
                    id: `tx-sample-${Date.now()}`,
                    sender: 'Alice',
                    recipient: 'Dave',
                    amount: 1.25,
                    feeBTC: 0.0003,
                    timestamp: formatTimestamp(),
                    hash: fastSha256Hex(`Alice:Dave:1.25:0.0003:${Date.now()}`),
                    status: 'mempool',
                  };
                  handleCreateTx(sampleTx);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? '+ Tạo giao dịch mẫu vào Mempool' : '+ Create Sample Tx to Mempool'}</span>
              </button>
            )}

            {guidedStep === 2 && (
              <button
                type="button"
                onClick={() => {
                  setGuidedStep(3);
                  triggerStepCompleted({
                    completedSummaryVi: `Đã chọn ${selectedTxIds.length} giao dịch vào khối`,
                    completedSummaryEn: `Selected ${selectedTxIds.length} txs for block`,
                    nextActionVi: 'Kiểm tra Block Header →',
                    nextActionEn: 'Inspect Block Header →',
                    nextStepId: 'step-3',
                  });
                }}
                disabled={selectedTxIds.length === 0}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-40"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {language === 'vi'
                    ? `Đóng gói ${selectedTxIds.length} giao dịch vào Khối ứng viên →`
                    : `Pack ${selectedTxIds.length} txs into Candidate Block →`}
                </span>
              </button>
            )}

            {guidedStep === 3 && (
              <button
                type="button"
                onClick={() => {
                  setGuidedStep(4);
                  triggerStepCompleted({
                    completedSummaryVi: 'Đã hoàn tất đóng gói Header',
                    completedSummaryEn: 'Completed packing Block Header',
                    nextActionVi: 'Bắt đầu đua đào PoW →',
                    nextActionEn: 'Start Proof-of-Work Race →',
                    nextStepId: 'step-4',
                  });
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Pickaxe className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Tiến tới Đua đào PoW →' : 'Proceed to Mining Race →'}</span>
              </button>
            )}

            {guidedStep === 4 && (
              <div className="flex items-center gap-2">
                {winnerBlock ? (
                  <button
                    type="button"
                    onClick={() => {
                      setGuidedStep(5);
                    }}
                    className="guidance-amber-pulse px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? '📡 Tiến tới Lan truyền P2P →' : '📡 Proceed to P2P Broadcast →'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={isMining ? handleStopMining : handleStartMining}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md ${
                      isMining
                        ? 'bg-rose-500 hover:bg-rose-400 text-zinc-950'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                    }`}
                  >
                    <Pickaxe className="w-3.5 h-3.5" />
                    <span>
                      {isMining
                        ? language === 'vi' ? '⏹ Dừng đua đào' : '⏹ Stop Mining'
                        : language === 'vi' ? '⛏ Bắt đầu Đua đào PoW' : '⛏ Start Mining Race'}
                    </span>
                  </button>
                )}
              </div>
            )}

            {guidedStep === 5 && (
              <div className="flex items-center gap-2">
                {consensusReached ? (
                  <button
                    type="button"
                    onClick={() => {
                      setGuidedStep(6);
                      startNextStep('step-6');
                    }}
                    className="guidance-amber-pulse px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? '⚡ Tiến tới Phân nhánh & Chuỗi nặng nhất →' : '⚡ Proceed to Fork & Longest Chain →'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="btn-action-start-gossip"
                    onClick={() => {
                      const btn = document.getElementById('btn-start-p2p-propagation');
                      if (btn) btn.click();
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? '📡 Phát tán khối qua Gossip P2P' : '📡 Broadcast Block via P2P Gossip'}</span>
                  </button>
                )}
              </div>
            )}

            {guidedStep === 6 && (
              <div className="flex items-center gap-2">
                {forkActive ? (
                  <button
                    type="button"
                    onClick={handleAutoResolveFork}
                    className="guidance-amber-pulse px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? '🏆 Phân định Nakamoto (Chuỗi nặng nhất)' : '🏆 Resolve via Heaviest Chain'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalizeCandidateBlock}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? '🏆 Xác nhận Đồng thuận Nakamoto (Chuỗi đơn)' : '🏆 Confirm Nakamoto Consensus'}</span>
                  </button>
                )}
              </div>
            )}

            {guidedStep === 7 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium flex items-center gap-2 cursor-pointer transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'vi' ? 'Kiểm toán mật mã chuỗi' : 'Audit Cryptographic Integrity'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGuidedStep(1);
                    startNextStep('step-1');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Khởi tạo chu kỳ khối tiếp theo ↺' : 'Mine Next Block Cycle ↺'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Next Step */}
          {guidedStep < 7 ? (
            <button
              type="button"
              id="btn-nav-next-step"
              onClick={() => {
                if (isReadyForNext && nextActionTargetId) {
                  const targetNum = parseInt(nextActionTargetId.replace('step-', ''), 10);
                  if (!isNaN(targetNum)) {
                    setGuidedStep(targetNum);
                    startNextStep(nextActionTargetId);
                    return;
                  }
                }
                setGuidedStep((prev) => Math.min(7, prev + 1));
                startNextStep();
              }}
              className={`w-full sm:w-auto text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-sm ${
                isReadyForNext
                  ? 'guidance-amber-pulse bg-amber-500 hover:bg-amber-400 text-zinc-950 ring-2 ring-amber-400/80 font-bold px-4 py-2 rounded-xl'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans text-xs font-bold px-4 py-2 rounded-xl'
              }`}
            >
              <span>
                {isReadyForNext && nextRecommendedActionVi
                  ? language === 'vi'
                    ? nextRecommendedActionVi
                    : nextRecommendedActionEn || nextRecommendedActionVi
                  : language === 'vi'
                  ? `Tiếp: ${LAB_STEPS[guidedStep].nameVi}`
                  : `Next: ${LAB_STEPS[guidedStep].nameEn}`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-nav-complete-loop"
              onClick={() => setGuidedStep(1)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-text-primary text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{language === 'vi' ? 'Về Bước 1 ↺' : 'Back to Step 1 ↺'}</span>
            </button>
          )}
        </div>

        {/* UTILITY TRAY & DRAWER (Collapsible, holds Fault Injection, Consolidated Logs/Timeline, Theory) */}
        <div className="bg-[#0c101c] border border-zinc-800/80 rounded-xl overflow-hidden transition-all">
          {/* Drawer Header Tabs */}
          <div className="flex flex-wrap items-center justify-between p-2 bg-[#090d16]/70 border-b border-zinc-800/60 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-zinc-500 px-2 uppercase tracking-wider">
                {language === 'vi' ? 'Tiện ích:' : 'Tools:'}
              </span>

              {/* Tab 1: Fault Injection */}
              <button
                type="button"
                onClick={() => setActiveDrawerTab(activeDrawerTab === 'faults' ? 'none' : 'faults')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeDrawerTab === 'faults'
                    ? 'bg-rose-950/80 text-rose-200 border border-rose-700/80'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${tamperedBlockHeight !== null ? 'text-rose-400 animate-bounce' : 'text-zinc-400'}`} />
                <span>{language === 'vi' ? 'Tiêm lỗi & Phân tích nhân quả' : 'Fault Injection & Causality'}</span>
                {tamperedBlockHeight !== null && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-zinc-950 font-bold text-[10px]">
                    1
                  </span>
                )}
              </button>

              {/* Tab 2: Logs & Timeline (Consolidated) */}
              <button
                type="button"
                onClick={() => setActiveDrawerTab(activeDrawerTab === 'logs' ? 'none' : 'logs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeDrawerTab === 'logs'
                    ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-700/80'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'vi' ? 'Nhật ký & Timeline' : 'Logs & Timeline'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-mono text-[10px]">
                  {eventLogs.length}
                </span>
              </button>

              {/* Tab 3: Theory */}
              <button
                type="button"
                onClick={() => setActiveDrawerTab(activeDrawerTab === 'insights' ? 'none' : 'insights')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeDrawerTab === 'insights'
                    ? 'bg-amber-950/80 text-amber-200 border border-amber-700/80'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'vi' ? 'Lý thuyết & Mật mã' : 'Theory & Cryptography'}</span>
              </button>
            </div>

            {/* Collapse toggle */}
            <button
              type="button"
              onClick={() => setActiveDrawerTab(activeDrawerTab === 'none' ? 'faults' : 'none')}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <span>{activeDrawerTab === 'none' ? (language === 'vi' ? 'Mở rộng' : 'Expand') : (language === 'vi' ? 'Thu gọn' : 'Collapse')}</span>
              {activeDrawerTab === 'none' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Drawer Content Panel (Animated expand) */}
          {activeDrawerTab !== 'none' && (
            <div className="p-3 sm:p-4 bg-[#090d16] border-t border-zinc-800/60 animate-in slide-in-from-top-2">
              {activeDrawerTab === 'faults' && (
                <FaultInjectionPanel
                  blockchain={blockchain}
                  nodes={nodes}
                  onTamperBlockData={handleTamperBlockData}
                  onCorruptHash={handleCorruptHash}
                  onCorruptMerkle={handleCorruptMerkle}
                  onCorruptPoW={handleCorruptPoW}
                  onToggleNodeOnline={handleToggleNodeOnline}
                  onResetFaults={handleResetFaults}
                  tamperedBlockHeight={tamperedBlockHeight}
                  language={language}
                />
              )}

              {activeDrawerTab === 'logs' && (
                <div className="space-y-3">
                  {/* Sub-view switcher for Logs & Timeline: Never show both at once */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setLogViewMode('timeline')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          logViewMode === 'timeline'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        {language === 'vi' ? 'Timeline trực quan' : 'Visual Timeline'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogViewMode('events')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          logViewMode === 'events'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        {language === 'vi' ? 'Sổ nhật ký chi tiết' : 'Detailed Event Table'} ({eventLogs.length})
                      </button>
                    </div>
                  </div>

                  {logViewMode === 'timeline' ? (
                    <LabRecorderTimeline
                      logs={eventLogs}
                      onClearLogs={() => setEventLogs([])}
                      isPaused={isTimelinePaused}
                      onTogglePause={() => setIsTimelinePaused((prev) => !prev)}
                      language={language}
                    />
                  ) : (
                    <ConsensusEventLog
                      logs={eventLogs}
                      onClearLogs={() => setEventLogs([])}
                      language={language}
                    />
                  )}
                </div>
              )}

              {activeDrawerTab === 'insights' && (
                <EducationalInsightBanner
                  currentStep={guidedStep}
                  language={language}
                />
              )}
            </div>
          )}
        </div>

        {/* Node Inspector Modal */}
        <NodeInspectorModal
          node={inspectingNode}
          currentBlock={step5CandidateBlock}
          onClose={() => setInspectingNode(null)}
          onToggleOnline={handleToggleNodeOnline}
          language={language}
        />

        {/* Experiment Configuration Modal */}
        <ExperimentParametersModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          config={config}
          onChangeConfig={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
          onResetAll={handleResetAll}
          lastExperimentSummary={lastExperimentSummary}
          language={language}
        />

        {/* Audit Self-Test Modal */}
        <AuditSelfTestModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          onApplyTestDataToLab={(canonicalBlocks, orphanedBlocks, branchA, branchB, recoveredMempool) => {
            setBlockchain(canonicalBlocks);
            setOrphanedBlocks(orphanedBlocks);
            setBranchABlocks(branchA);
            setBranchBBlocks(branchB);
            if (branchA.length > 0) setCumulativeWorkA(branchA[branchA.length - 1].cumulativeWork);
            if (branchB.length > 0) setCumulativeWorkB(branchB[branchB.length - 1].cumulativeWork);
            setActiveMainBranch('branchA');
            setForkActive(false);
            if (recoveredMempool.length > 0) {
              setMempool((prev) => {
                const existing = new Set(prev.map((t) => t.id));
                const added = recoveredMempool.filter((t) => !existing.has(t.id));
                return [...added, ...prev];
              });
            }
            addLog(
              'consensus',
              '✅ Đã nạp kịch bản kiểm thử: 6 Khối chính thức, 2 Khối mồ côi, kiểm tra toán học PoW thành công!'
            );
          }}
          language={language}
        />
      </div>
    </section>
  );
};

export default EndToEndConsensusLab;
