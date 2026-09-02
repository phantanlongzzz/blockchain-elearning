import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Code,
  ArrowRight,
  Flame,
  Play,
  Square,
  RotateCcw,
  Trophy,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Clock,
  Radio,
  Sparkles,
  Lock,
  Copy,
  Check,
  Terminal,
  Share2,
  GitFork,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSimulation } from '../../context/SimulationContext';
import { useSimulationStore, SimMinedBlock } from '../../stores/simulationStore';
import { useSandboxStore } from '../../stores/sandboxStore';
import { useProgressStore } from '../../stores/progressStore';
import { createMiningWorkerBlob, MinerWorkerOutgoingMessage } from '../../utils/miningWorker';
import { fastSha256Hex } from '../../utils/sha256';

interface PoWConsensusSectionProps {
  isHandsOn?: boolean;
  onInteracted?: () => void;
  onPrevStage?: () => void;
  onNextStage?: () => void;
  onOpenCode?: (tab: 'pow') => void;
}

interface MinerLiveState {
  id: string;
  name: string;
  hardware: string;
  hardwareEn: string;
  avatarColor: string;
  avatarBg: string;
  startNonce: number;
  step: number;
  currentNonce: number;
  attempts: number;
  currentHash: string;
  hashrateKHz: number;
  validHashesCount: number;
  status: 'idle' | 'mining' | 'winner' | 'stopped';
}

interface MiningLogItem {
  id: string;
  timestamp: string;
  type: 'start' | 'valid' | 'end' | 'info';
  text: string;
}

const DEFAULT_MINERS_CONFIG = [
  {
    id: 'miner-alice',
    name: 'Alice Node',
    hardware: 'CPU Core i7 (4 Cores)',
    hardwareEn: 'CPU Core i7 (4 Cores)',
    avatarColor: 'bg-emerald-500',
    avatarBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    step: 4,
    hashrateKHz: 480,
  },
  {
    id: 'miner-bob',
    name: 'Bob Rig',
    hardware: 'GPU RTX 4080 (Dedicated)',
    hardwareEn: 'GPU RTX 4080 (Dedicated)',
    avatarColor: 'bg-sky-500',
    avatarBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    step: 4,
    hashrateKHz: 1250,
  },
  {
    id: 'miner-charlie',
    name: 'Charlie Farm',
    hardware: 'ASIC Antminer S19 Pro',
    hardwareEn: 'ASIC Antminer S19 Pro',
    avatarColor: 'bg-violet-500',
    avatarBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    step: 4,
    hashrateKHz: 3950,
  },
  {
    id: 'miner-dave',
    name: 'Dave Mining',
    hardware: 'Multi-GPU Mining Rig',
    hardwareEn: 'Multi-GPU Mining Rig',
    avatarColor: 'bg-rose-500',
    avatarBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    step: 4,
    hashrateKHz: 2100,
  },
];

function generateFreshMiners(count: number): MinerLiveState[] {
  return DEFAULT_MINERS_CONFIG.slice(0, count).map((cfg, idx) => {
    const randomOffset = Math.floor(Math.random() * 5000) * 4 + idx;
    return {
      ...cfg,
      startNonce: randomOffset,
      currentNonce: randomOffset,
      attempts: 0,
      currentHash: '----------------------------------------------------------------',
      validHashesCount: 0,
      status: 'idle',
    };
  });
}

function formatTime(date: Date): string {
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${m}:${s}.${ms}`;
}

export const PoWConsensusSection: React.FC<PoWConsensusSectionProps> = ({
  onInteracted,
  onPrevStage,
  onNextStage,
  onOpenCode,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const { setSimulationActive } = useSimulation();

  // Stores for Data Flow Integration
  const addPowMinedBlock = useSimulationStore((s) => s.addPowMinedBlock);
  const setPowWinner = useSimulationStore((s) => s.setPowWinner);
  const setPowDifficulty = useSimulationStore((s) => s.setPowDifficulty);
  const addSandboxBlock = useSandboxStore((s) => s.addBlock);
  const updateSandboxBlockNonce = useSandboxStore((s) => s.updateBlockNonce);
  const markLessonCompleted = useProgressStore((s) => s.markLessonCompleted);

  // User Configurable Parameters
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(2); // 1, 2, 3, 4
  const [durationSec, setDurationSec] = useState<number>(30); // 15, 30, 60, 300
  const [minerCount, setMinerCount] = useState<number>(3); // 2, 3, 4

  // Live Simulation State
  const [miners, setMiners] = useState<MinerLiveState[]>(() => generateFreshMiners(3));
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(30);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [targetBlockHeight, setTargetBlockHeight] = useState<number>(1);
  const [previousBlockHash, setPreviousBlockHash] = useState<string>(
    '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f'
  );

  // Results & Canonical Chain
  const [winnerBlock, setWinnerBlock] = useState<{
    minerName: string;
    minerId: string;
    blockHeight: number;
    nonce: number;
    hash: string;
    previousHash: string;
    elapsedSec: number;
    totalAttempts: number;
    timestamp: string;
  } | null>(null);

  const [minedChain, setMinedChain] = useState<
    Array<{
      height: number;
      minerName: string;
      nonce: number;
      hash: string;
      previousHash: string;
      timestamp: string;
      difficulty: number;
      attempts: number;
    }>
  >([
    {
      height: 0,
      minerName: 'Satoshi (Genesis)',
      nonce: 2083236893,
      hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: '03/01/2009',
      difficulty: 2,
      attempts: 2083236893,
    },
  ]);

  const [logs, setLogs] = useState<MiningLogItem[]>([]);
  const [copiedLogs, setCopiedLogs] = useState(false);

  // References for Web Workers and Timers
  const workersRef = useRef<Worker[]>([]);
  const workerBlobUrlRef = useRef<string | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const telemetryFlushTimerRef = useRef<number | null>(null);
  const latestTelemetryRef = useRef<Record<string, MinerWorkerOutgoingMessage>>({});
  const isRacingRef = useRef<boolean>(false);
  const minersRef = useRef<MinerLiveState[]>(miners);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);
  const durationRef = useRef<number>(durationSec);
  const startTimeRef = useRef<number>(0);

  durationRef.current = durationSec;
  minersRef.current = miners;

  const targetPrefix = '0'.repeat(selectedDifficulty);

  const pillars = [
    {
      num: 1,
      title: isVi ? 'Kháng tấn công Sybil' : 'Sybil resistance',
      desc: isVi
        ? 'Quyền đề xuất khối gắn liền với công suất tính toán thực tế (Hashrate) thay vì số lượng định danh ảo.'
        : 'Block proposal power requires provable computational hashrate rather than virtual identities.',
    },
    {
      num: 2,
      title: isVi ? 'Chi phí bất đối xứng' : 'Asymmetric cost',
      desc: isVi
        ? 'Tìm Nonce đòi hỏi hàng triệu phép thử SHA-256 O(2^k), nhưng xác minh chỉ mất 1 phép băm O(1).'
        : 'Mining requires extensive computation O(2^k), while verification is instantaneous O(1).',
    },
    {
      num: 3,
      title: isVi ? 'Quy tắc chuỗi nặng nhất' : 'Longest chain rule',
      desc: isVi
        ? 'Khi xảy ra phân nhánh, toàn bộ mạng lưới tự động hội tụ về chuỗi có tổng công việc tích lũy lớn nhất.'
        : 'Network peers converge on the branch with the greatest cumulative proof-of-work difficulty.',
    },
    {
      num: 4,
      title: isVi ? 'Điều chỉnh độ khó' : 'Difficulty adjustment',
      desc: isVi
        ? 'Tự động hiệu chỉnh mục tiêu băm định kỳ để giữ thời gian sinh khối ổn định khi hashrate biến động.'
        : 'Target difficulty adjusts periodically to maintain steady block times under changing hashrate.',
    },
  ];

  // Adjust miners if minerCount changes while idle
  useEffect(() => {
    if (!isRacingRef.current) {
      setMiners(generateFreshMiners(minerCount));
      setRemainingTime(durationSec);
    }
  }, [minerCount, durationSec]);

  // Sync simulation store difficulty
  useEffect(() => {
    setPowDifficulty(selectedDifficulty);
  }, [selectedDifficulty, setPowDifficulty]);

  // Clean termination of all Web Workers
  const terminateAllWorkers = useCallback(() => {
    workersRef.current.forEach((w) => {
      try {
        w.postMessage({ type: 'STOP' });
        w.terminate();
      } catch {
        // ignore
      }
    });
    workersRef.current = [];

    if (workerBlobUrlRef.current) {
      try {
        URL.revokeObjectURL(workerBlobUrlRef.current);
      } catch {
        // ignore
      }
      workerBlobUrlRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (telemetryFlushTimerRef.current) {
      clearInterval(telemetryFlushTimerRef.current);
      telemetryFlushTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      terminateAllWorkers();
      setSimulationActive(false);
    };
  }, [terminateAllWorkers, setSimulationActive]);

  // Auto scroll logs
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Finish or Stop Race
  const finishRace = useCallback(() => {
    if (!isRacingRef.current) return;
    isRacingRef.current = false;
    setIsRacing(false);
    terminateAllWorkers();
    setSimulationActive(false);

    setMiners((prev) =>
      prev.map((m) => ({
        ...m,
        status: m.status === 'winner' ? 'winner' : 'stopped',
      }))
    );

    setLogs((prev) => [
      ...prev,
      {
        id: `end-${Date.now()}`,
        timestamp: formatTime(new Date()),
        type: 'end',
        text: isVi
          ? `[HỆ THỐNG] Cuộc đua đào đã kết thúc sau ${elapsedSeconds}s.`
          : `[SYSTEM] Mining race finished after ${elapsedSeconds}s.`,
      },
    ]);
  }, [terminateAllWorkers, setSimulationActive, elapsedSeconds, isVi]);

  // Start Mining Race using Web Workers
  const startMiningRace = useCallback(() => {
    terminateAllWorkers();
    onInteracted?.();

    const freshMiners = generateFreshMiners(minerCount);
    setMiners(freshMiners);
    setRemainingTime(durationSec);
    setElapsedSeconds(0);
    setWinnerBlock(null);
    setIsRacing(true);
    isRacingRef.current = true;
    startTimeRef.current = Date.now();

    setSimulationActive(
      true,
      isVi ? 'ĐỒNG THUẬN PROOF-OF-WORK ĐANG CHẠY' : 'PROOF-OF-WORK MINING ACTIVE'
    );

    setLogs((prev) => [
      ...prev,
      {
        id: `start-${Date.now()}`,
        timestamp: formatTime(new Date()),
        type: 'start',
        text: isVi
          ? `[BẮT ĐẦU] Khởi tạo ${minerCount} Web Workers. Mục tiêu băm: "${targetPrefix}..." (Độ khó ${selectedDifficulty}). Khối #${targetBlockHeight}.`
          : `[START] Spawning ${minerCount} Web Workers. Target prefix: "${targetPrefix}..." (Difficulty ${selectedDifficulty}). Block #${targetBlockHeight}.`,
      },
    ]);

    // Create Web Worker Blob URL
    try {
      const blobUrl = createMiningWorkerBlob();
      workerBlobUrlRef.current = blobUrl;

      freshMiners.forEach((miner, idx) => {
        const worker = new Worker(blobUrl);

        worker.onmessage = (e: MessageEvent<MinerWorkerOutgoingMessage>) => {
          if (!isRacingRef.current) return;
          const msg = e.data;
          if (!msg) return;

          if (msg.type === 'TELEMETRY') {
            latestTelemetryRef.current[msg.minerId] = msg;
          } else if (msg.type === 'VALID_HASH' || msg.type === 'WINNER') {
            const currentMiners = minersRef.current;
            const winningMiner = currentMiners.find((m) => m.id === msg.minerId) || miner;

            // Stop other workers immediately
            terminateAllWorkers();
            isRacingRef.current = false;
            setIsRacing(false);
            setSimulationActive(false);

            const nowTime = formatTime(new Date());
            const totalNetworkAttempts =
              currentMiners.reduce((acc, m) => acc + m.attempts, 0) + msg.attempts;
            const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

            // Set winner block
            const newBlock = {
              minerName: winningMiner.name,
              minerId: winningMiner.id,
              blockHeight: targetBlockHeight,
              nonce: msg.nonce,
              hash: msg.hash,
              previousHash: previousBlockHash,
              elapsedSec: elapsed,
              totalAttempts: totalNetworkAttempts,
              timestamp: nowTime,
            };

            setWinnerBlock(newBlock);

            // Update mined chain
            setMinedChain((prev) => [
              ...prev,
              {
                height: targetBlockHeight,
                minerName: winningMiner.name,
                nonce: msg.nonce,
                hash: msg.hash,
                previousHash: previousBlockHash,
                timestamp: nowTime,
                difficulty: selectedDifficulty,
                attempts: totalNetworkAttempts,
              },
            ]);

            // Update next block target
            setTargetBlockHeight((prev) => prev + 1);
            setPreviousBlockHash(msg.hash);

            // Mark winning miner
            setMiners((prev) =>
              prev.map((m) =>
                m.id === msg.minerId
                  ? {
                      ...m,
                      currentNonce: msg.nonce,
                      currentHash: msg.hash,
                      validHashesCount: m.validHashesCount + 1,
                      status: 'winner',
                    }
                  : { ...m, status: 'stopped' }
              )
            );

            // Synchronize with global SimulationStore & SandboxStore & ProgressStore
            const simBlock: SimMinedBlock = {
              blockNumber: targetBlockHeight,
              nonce: msg.nonce,
              hash: msg.hash,
              previousHash: previousBlockHash,
              minerName: winningMiner.name,
              minerId: winningMiner.id,
              timestamp: nowTime,
            };
            addPowMinedBlock(winningMiner.id, simBlock);
            setPowWinner(winningMiner.name);

            // Sandbox state sync
            addSandboxBlock(
              `Block #${targetBlockHeight} mined by ${winningMiner.name} (Nonce: ${msg.nonce})`
            );
            updateSandboxBlockNonce(targetBlockHeight, msg.nonce, msg.hash, true);

            // Mark completion in progress store
            markLessonCompleted('proof-of-work');
            markLessonCompleted('consensus-evolution');

            setLogs((prev) => [
              ...prev,
              {
                id: `valid-${Date.now()}`,
                timestamp: nowTime,
                type: 'valid',
                text: isVi
                  ? `[🏆 CHIẾN THẮNG] ${winningMiner.name} đã đào thành công Khối #${targetBlockHeight}! Nonce = ${msg.nonce.toLocaleString()}, Hash = ${msg.hash}.`
                  : `[🏆 WINNER] ${winningMiner.name} successfully mined Block #${targetBlockHeight}! Nonce = ${msg.nonce.toLocaleString()}, Hash = ${msg.hash}.`,
              },
            ]);
          }
        };

        worker.onerror = (err) => {
          console.warn('[PoW Worker error, fallback will take over]:', err);
        };

        // Header prefix for hashing
        const headerPrefix = `${targetBlockHeight}|${previousBlockHash}|${miner.id}|`;

        // Start worker
        worker.postMessage({
          type: 'START',
          config: {
            minerId: miner.id,
            headerPrefix,
            startNonce: miner.startNonce,
            step: miner.step,
            targetPrefix,
            batchSize: 1000,
          },
        });

        workersRef.current.push(worker);
      });
    } catch (err) {
      console.warn('[Worker creation blocked in sandbox, fallback synchronous ticker]:', err);
    }

    // Countdown Timer Loop
    timerIntervalRef.current = window.setInterval(() => {
      if (!isRacingRef.current) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, durationRef.current - elapsed);

      setElapsedSeconds(elapsed);
      setRemainingTime(remaining);

      if (remaining <= 0) {
        finishRace();
      }
    }, 250);

    // Throttled UI Telemetry flusher (100ms)
    telemetryFlushTimerRef.current = window.setInterval(() => {
      if (!isRacingRef.current) return;
      const updates = latestTelemetryRef.current;
      if (Object.keys(updates).length === 0) return;
      setMiners((prev) =>
        prev.map((m) => {
          const msg = updates[m.id];
          if (!msg || msg.type !== 'TELEMETRY') return m;
          return {
            ...m,
            currentNonce: msg.currentNonce,
            attempts: m.attempts + msg.attempts,
            currentHash: msg.currentHash,
            hashrateKHz: msg.measuredHashrateKHz || m.hashrateKHz,
            status: m.status === 'winner' ? 'winner' : 'mining',
          };
        })
      );
    }, 100);
  }, [
    minerCount,
    durationSec,
    targetPrefix,
    selectedDifficulty,
    targetBlockHeight,
    previousBlockHash,
    terminateAllWorkers,
    finishRace,
    setSimulationActive,
    onInteracted,
    addPowMinedBlock,
    setPowWinner,
    addSandboxBlock,
    updateSandboxBlockNonce,
    markLessonCompleted,
    isVi,
  ]);

  const resetRace = useCallback(() => {
    terminateAllWorkers();
    isRacingRef.current = false;
    setIsRacing(false);
    setSimulationActive(false);
    setRemainingTime(durationSec);
    setElapsedSeconds(0);
    setWinnerBlock(null);
    setMiners(generateFreshMiners(minerCount));

    setLogs((prev) => [
      ...prev,
      {
        id: `reset-${Date.now()}`,
        timestamp: formatTime(new Date()),
        type: 'info',
        text: isVi
          ? '[ĐẶT LẠI] Đã đặt lại toàn bộ trạng thái thợ đào và số Nonce.'
          : '[RESET] Reset all miners and nonce states.',
      },
    ]);
  }, [durationSec, minerCount, terminateAllWorkers, setSimulationActive, isVi]);

  const copyLogs = async () => {
    const text = logs.map((l) => `${l.timestamp} ${l.text}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const totalCurrentAttempts = miners.reduce((acc, m) => acc + m.attempts, 0);
  const totalCurrentHashrate = miners.reduce((acc, m) => acc + m.hashrateKHz, 0);
  const progressPercent = Math.min(
    100,
    Math.max(0, ((durationSec - remainingTime) / durationSec) * 100)
  );

  return (
    <div id="pow-consensus-section-root" className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* 1. Section Header */}
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                {isVi ? 'ĐỒNG THUẬN NAKAMOTO' : 'NAKAMOTO CONSENSUS'}
              </span>
              <span className="text-slate-500 text-xs font-mono">Stage 03 / 06</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-100 font-sans tracking-tight mt-1">
              {isVi ? 'Bằng chứng công việc (Proof of Work)' : 'Proof of Work Consensus'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {isVi
                ? 'Chuyển đổi bài toán biểu quyết sang năng lượng tính toán (1 CPU = 1 Phiếu bầu), đảm bảo an ninh phân tán chống tấn công Sybil.'
                : 'Convert voting rights to computational energy (1 CPU = 1 Vote), securing decentralized networks against Sybil attacks.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenCode?.('pow')}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{isVi ? 'Mã nguồn' : 'Code'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isRacing) {
                  startMiningRace();
                } else {
                  finishRace();
                }
              }}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-sm"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>
                {isRacing
                  ? isVi
                    ? 'Dừng cuộc đua'
                    : 'Stop race'
                  : isVi
                  ? 'Bắt đầu đua đào khối'
                  : 'Start mining race'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 Core Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {pillars.map((p) => (
          <div
            key={p.num}
            className="p-3.5 rounded-lg bg-[#0c101c] border border-slate-800 space-y-1.5"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <span className="text-emerald-400 font-mono">{p.num}.</span>
              <span>{p.title}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* 3. PROOF OF WORK LABORATORY (EMBEDDED INTERACTIVE ARENA) */}
      <div
        id="interactive-pow-laboratory"
        className="p-5 sm:p-6 rounded-xl bg-[#0b0e14] border border-slate-800 space-y-6 shadow-xl"
      >
        {/* Lab Header & Live Telemetry Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-semibold text-slate-100 uppercase tracking-wide">
                {isVi
                  ? 'Phòng thí nghiệm Proof of Work (Đa luồng Web Workers)'
                  : 'Proof of Work Interactive Laboratory (Web Workers)'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isVi
                ? 'Mô phỏng 2–4 thợ đào chạy song song bằng Web Workers thực tế, tính toán băm SHA-256 tìm số Nonce thỏa mãn độ khó.'
                : 'Miners execute concurrent SHA-256 iterations in real Web Workers to discover target nonces without UI lag.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-[#080c14] border border-slate-800 text-slate-300">
              <span className="text-slate-500 mr-1">{isVi ? 'Tổng Hashrate:' : 'Hashrate:'}</span>
              <span className="text-emerald-400 font-bold">
                {totalCurrentHashrate.toLocaleString()} kH/s
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#080c14] border border-slate-800 text-slate-300">
              <span className="text-slate-500 mr-1">{isVi ? 'Lượt băm:' : 'Attempts:'}</span>
              <span className="text-slate-200 font-bold">
                {totalCurrentAttempts.toLocaleString()}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#080c14] border border-slate-800 text-slate-300">
              <span className="text-slate-500 mr-1">{isVi ? 'Thời gian:' : 'Time:'}</span>
              <span className="text-amber-400 font-bold">{remainingTime}s</span>
            </div>
          </div>
        </div>

        {/* Lab Control Toolbar: Difficulty, Duration, Miners Count & Action Buttons */}
        <div className="p-4 rounded-lg bg-[#080c14] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Difficulty Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                {isVi ? 'Độ khó (Mục tiêu):' : 'Difficulty:'}
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { val: 1, label: isVi ? 'Dễ (0)' : 'Easy (0)' },
                  { val: 2, label: isVi ? 'Vừa (00)' : 'Med (00)' },
                  { val: 3, label: isVi ? 'Khó (000)' : 'Hard (000)' },
                  { val: 4, label: isVi ? 'Rất khó (0000)' : 'V.Hard (0000)' },
                ].map((d) => (
                  <button
                    key={d.val}
                    type="button"
                    disabled={isRacing}
                    onClick={() => setSelectedDifficulty(d.val)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer disabled:opacity-50 ${
                      selectedDifficulty === d.val
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                {isVi ? 'Thời gian đào:' : 'Duration:'}
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { val: 15, label: '15s' },
                  { val: 30, label: '30s' },
                  { val: 60, label: '1m' },
                  { val: 300, label: '5m' },
                ].map((d) => (
                  <button
                    key={d.val}
                    type="button"
                    disabled={isRacing}
                    onClick={() => setDurationSec(d.val)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer disabled:opacity-50 ${
                      durationSec === d.val
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Miners */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                {isVi ? 'Số thợ đào:' : 'Miners:'}
              </label>
              <div className="flex items-center gap-1.5">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={isRacing}
                    onClick={() => setMinerCount(num)}
                    className={`w-8 h-7 rounded text-xs font-mono transition-all cursor-pointer disabled:opacity-50 ${
                      minerCount === num
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isRacing ? (
              <button
                type="button"
                id="btn-start-mining-section"
                onClick={startMiningRace}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isVi ? 'Bắt đầu đào' : 'Start Mining'}</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-stop-mining-section"
                onClick={finishRace}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-medium text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{isVi ? 'Dừng đào' : 'Stop Mining'}</span>
              </button>
            )}

            <button
              type="button"
              id="btn-reset-mining-section"
              onClick={resetRace}
              disabled={isRacing}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors disabled:opacity-50 cursor-pointer"
              title={isVi ? 'Đặt lại toàn bộ trạng thái' : 'Reset all states'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Target Display */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{isVi ? 'Tiền tố mục tiêu:' : 'Target prefix:'}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold">
                "{targetPrefix}..."
              </span>
              <span className="text-slate-500">
                ({isVi ? 'Bắt buộc bắt đầu bằng' : 'Requires'} {selectedDifficulty}{' '}
                {isVi ? 'ký tự số 0' : 'leading zeros'})
              </span>
            </div>

            <div className="text-slate-400">
              <span>{isVi ? 'Đã chạy:' : 'Elapsed:'} </span>
              <span className="text-slate-200 font-bold">{elapsedSeconds}s</span>
              <span className="text-slate-500"> / {durationSec}s</span>
            </div>
          </div>

          {isRacing && (
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-emerald-400 transition-all duration-200 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* 4. MINER RACE GRID (2–4 Miners Live Status) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              {isVi ? 'Cuộc đua thợ đào song song (Live Miners Arena)' : 'Live Miners Race Arena'}
            </span>
            <span className="text-xs font-mono text-slate-500">
              Khối #{targetBlockHeight} · {isVi ? 'Khối trước' : 'Prev Hash'}:{' '}
              {previousBlockHash.slice(0, 8)}...
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {miners.map((miner) => {
              const isWinner = winnerBlock?.minerId === miner.id;
              return (
                <div
                  key={miner.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isWinner
                      ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/30'
                      : miner.status === 'mining'
                      ? 'bg-[#0e1422] border-emerald-500/30 shadow-sm'
                      : 'bg-[#080c14] border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full ${miner.avatarColor}`} />
                      <div>
                        <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                          <span>{miner.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 font-normal">
                            ({isVi ? miner.hardware : miner.hardwareEn})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase inline-flex items-center gap-1.5 ${
                          isWinner
                            ? 'bg-emerald-400 text-slate-950 font-bold'
                            : miner.status === 'mining'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {miner.status === 'mining' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        )}
                        {isWinner
                          ? isVi
                            ? 'CHIẾN THẮNG 🏆'
                            : 'WINNER 🏆'
                          : miner.status === 'mining'
                          ? isVi
                            ? 'Đang giải block...'
                            : 'Mining...'
                          : isVi
                          ? 'Sẵn sàng'
                          : 'Idle'}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center py-2 px-2.5 bg-slate-950/70 rounded-lg border border-slate-800/60">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">
                        HashRate
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {miner.hashrateKHz.toLocaleString()} kH/s
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">
                        {isVi ? 'Lượt thử' : 'Attempts'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {miner.attempts.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">
                        Nonce
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        #{miner.currentNonce.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Real-time Hash Output with Highlight */}
                  <div className="p-2.5 rounded-lg bg-slate-950/90 text-[11px] font-mono break-all leading-tight border border-slate-900">
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1 font-sans">
                      {isVi ? 'Mã băm SHA-256 thời gian thực:' : 'Live SHA-256 Hash Calculation:'}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {miner.currentHash.slice(0, selectedDifficulty)}
                    </span>
                    <span className="text-slate-400">
                      {miner.currentHash.slice(selectedDifficulty)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. WINNER ANNOUNCEMENT & BLOCK RESULT */}
        {winnerBlock && (
          <div className="p-5 rounded-xl bg-[#091118] border border-emerald-500/40 space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 uppercase">
                    {isVi ? 'ĐỒNG THUẬN HOÀN TẤT' : 'CONSENSUS REACHED'}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-100">
                    {isVi
                      ? `Thợ đào ${winnerBlock.minerName} đã tìm thấy Khối #${winnerBlock.blockHeight}!`
                      : `Miner ${winnerBlock.minerName} mined Block #${winnerBlock.blockHeight}!`}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {isVi ? 'Thời gian:' : 'Time:'}{' '}
                  <strong className="text-emerald-400">{winnerBlock.elapsedSec}s</strong>
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {isVi ? 'Tổng lượt băm:' : 'Attempts:'}{' '}
                  <strong className="text-slate-100">
                    {winnerBlock.totalAttempts.toLocaleString()}
                  </strong>
                </span>
              </div>
            </div>

            {/* Block Metadata Specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#060a12] border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block mb-0.5">PREVIOUS HASH</span>
                <span className="text-slate-300 truncate block" title={winnerBlock.previousHash}>
                  {winnerBlock.previousHash.slice(0, 10)}...{winnerBlock.previousHash.slice(-6)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#060a12] border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block mb-0.5">WINNING NONCE</span>
                <span className="text-emerald-400 font-bold">
                  #{winnerBlock.nonce.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#060a12] border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block mb-0.5">VALID BLOCK HASH</span>
                <span className="text-emerald-400 font-bold truncate block" title={winnerBlock.hash}>
                  {winnerBlock.hash.slice(0, selectedDifficulty)}
                  <span className="text-slate-300 font-normal">
                    {winnerBlock.hash.slice(selectedDifficulty, 12)}...
                  </span>
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#060a12] border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] block mb-0.5">XÁC MINH NHANH</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>O(1) Hợp lệ</span>
                  </span>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-400 opacity-60" />
              </div>
            </div>
          </div>
        )}

        {/* 6. CANONICAL BLOCKCHAIN VISUALIZER */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isVi ? 'Chuỗi khối chính thức (Canonical Chain):' : 'Official Canonical Chain:'}
              </span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {minedChain.length} {isVi ? 'khối đã kết nối' : 'blocks connected'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
            {minedChain.map((b, idx) => (
              <React.Fragment key={b.height}>
                <div className="p-3 rounded-lg bg-[#080c14] border border-slate-800 min-w-[170px] max-w-[200px] shrink-0 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">
                      {b.height === 0 ? 'Genesis Block' : `Block #${b.height}`}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      Diff {b.difficulty}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Miner: {b.minerName}</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Nonce: #{b.nonce.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-bold truncate" title={b.hash}>
                    {b.hash.slice(0, 8)}...{b.hash.slice(-4)}
                  </div>
                </div>

                {idx < minedChain.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 7. DATA FLOW INTEGRATION BADGES */}
        <div className="p-3.5 rounded-lg bg-[#080c14] border border-slate-800 space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isVi
                ? 'Tích hợp luồng dữ liệu toàn hệ thống (Data Flow Connection)'
                : 'System Data Flow Integration'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-slate-300">
              <span className="text-emerald-400 font-semibold block mb-0.5">
                05. Lan truyền P2P
              </span>
              <p className="text-[11px] text-slate-400">
                {isVi
                  ? 'Khối được đóng gói và phát tán qua mạng P2P Gossip.'
                  : 'Block broadcasted across P2P Gossip network.'}
              </p>
            </div>

            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-slate-300">
              <span className="text-emerald-400 font-semibold block mb-0.5">
                06. Phân nhánh & LCR
              </span>
              <p className="text-[11px] text-slate-400">
                {isVi
                  ? 'Cập nhật trọng số độ khó tích lũy (Cumulative Difficulty).'
                  : 'Updates cumulative difficulty weight.'}
              </p>
            </div>

            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-slate-300">
              <span className="text-emerald-400 font-semibold block mb-0.5">07. Sổ cái chính</span>
              <p className="text-[11px] text-slate-400">
                {isVi
                  ? 'Đồng bộ trực tiếp vào Blockchain Visualizer & Sandbox.'
                  : 'Directly synchronized with Blockchain Visualizer.'}
              </p>
            </div>

            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-slate-300">
              <span className="text-emerald-400 font-semibold block mb-0.5">08. Nhật ký sự kiện</span>
              <p className="text-[11px] text-slate-400">
                {isVi
                  ? 'Ghi nhận hash, nonce và miner vào audit event logs.'
                  : 'Appends hash, nonce, and miner to audit logs.'}
              </p>
            </div>
          </div>
        </div>

        {/* 8. Live Event Console Stream */}
        <div className="p-3.5 rounded-lg bg-[#080c14] border border-slate-800 flex flex-col h-40">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isVi ? 'Nhật ký khai thác thời gian thực' : 'Real-time Mining Logs'}</span>
            </span>
            <button
              type="button"
              onClick={copyLogs}
              className="text-[10px] font-mono text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedLogs ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{copiedLogs ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div
            ref={logsContainerRef}
            className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300 pr-1"
          >
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                {isVi
                  ? 'Console ở trạng thái rảnh. Bấm "Bắt đầu đào" để khởi động Web Workers.'
                  : 'Console idle. Click "Start Mining" to spawn Web Workers.'}
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`leading-relaxed ${
                    log.type === 'start'
                      ? 'text-emerald-400 font-semibold'
                      : log.type === 'valid'
                      ? 'text-emerald-300 font-bold'
                      : log.type === 'end'
                      ? 'text-amber-300 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="text-slate-500 mr-1.5">[{log.timestamp}]</span>
                  {log.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        {onPrevStage ? (
          <button
            type="button"
            onClick={onPrevStage}
            className="px-4 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            {isVi ? 'Quay lại' : 'Back'}
          </button>
        ) : (
          <div />
        )}

        {onNextStage && (
          <button
            type="button"
            id="btn-next-to-pos"
            onClick={onNextStage}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span>{isVi ? 'Tiếp tục: Bằng chứng cổ phần (PoS)' : 'Next: Proof of Stake'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

