import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Pickaxe,
  Zap,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Play,
  Square,
  Flame,
  Cpu,
  Layers,
  Code2,
  X,
  Radio,
  ArrowRight,
  Sparkles,
  Lock,
  Terminal,
  HelpCircle,
  Copy,
  Check,
  Info,
  RotateCcw,
  Timer,
  Activity,
  Award,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSimulation } from '../../context/SimulationContext';
import { BlockchainBlock } from '../../types';
import {
  createMiningWorkerBlob,
  MinerWorkerOutgoingMessage,
} from '../../utils/miningWorker';

export interface MinerState {
  id: string;
  name: string;
  avatarColor: string;
  startNonce: number;
  step: number;
  currentNonce: number;
  attempts: number;
  currentHash: string;
  hashrateKHz: number;
  validHashesCount: number;
  status: 'idle' | 'mining' | 'winner' | 'stopped';
}

export interface DiscoveredHash {
  id: string;
  minerId: string;
  minerName: string;
  avatarColor: string;
  nonce: number;
  hash: string;
  attempts: number;
  timestamp: string;
}

interface MiningLogEntry {
  id: string;
  timestamp: string;
  type: 'miner_attempt' | 'miner_valid' | 'network_info' | 'race_start' | 'race_end';
  text: string;
}

interface MiningRaceArenaProps {
  isOpen?: boolean;
  onClose?: () => void;
  targetBlock?: BlockchainBlock;
  difficulty?: number;
  onBlockMined?: (blockIndex: number, winningNonce: number, winningHash: string) => void;
  onOpenCodeViewer?: () => void;
  autoStart?: boolean;
  onInteracted?: () => void;
  embedded?: boolean;
}

function formatTimeWithMs(date: Date): string {
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${m}:${s}.${ms}`;
}

const BASE_MINERS: Omit<MinerState, 'startNonce' | 'currentNonce' | 'attempts' | 'currentHash' | 'hashrateKHz' | 'validHashesCount' | 'status'>[] = [
  {
    id: 'miner-alpha',
    name: 'Miner Alpha',
    avatarColor: 'from-emerald-500 to-blue-600',
    step: 4,
  },
  {
    id: 'miner-beta',
    name: 'Miner Beta',
    avatarColor: 'from-purple-500 to-indigo-600',
    step: 4,
  },
  {
    id: 'miner-gamma',
    name: 'Miner Gamma',
    avatarColor: 'from-emerald-500 to-teal-600',
    step: 4,
  },
  {
    id: 'miner-delta',
    name: 'Miner Delta',
    avatarColor: 'from-amber-500 to-orange-600',
    step: 4,
  },
];

function generateFreshMiners(count: number): MinerState[] {
  return BASE_MINERS.slice(0, count).map((m, idx) => {
    const randomOffset = Math.floor(Math.random() * 5000) * 4 + idx;
    return {
      ...m,
      startNonce: randomOffset,
      currentNonce: randomOffset,
      attempts: 0,
      currentHash: '----------------------------------------------------------------',
      hashrateKHz: 0,
      validHashesCount: 0,
      status: 'idle',
    };
  });
}

export const MiningRaceArena: React.FC<MiningRaceArenaProps> = ({
  isOpen,
  onClose,
  targetBlock,
  difficulty: initialDifficulty = 3,
  onBlockMined,
  onOpenCodeViewer,
}) => {
  const { language } = useLanguage();
  const { setSimulationActive } = useSimulation();

  // User Configurable Parameters
  const [durationSec, setDurationSec] = useState<number>(30); // 30s | 60s | 300s (5min)
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(initialDifficulty || 3);
  const [minerCount, setMinerCount] = useState<number>(4); // 2 | 3 | 4

  // Live Mining State
  const [miners, setMiners] = useState<MinerState[]>(() => generateFreshMiners(4));
  const [isRacing, setIsRacing] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(30);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [discoveredBlocks, setDiscoveredBlocks] = useState<DiscoveredHash[]>([]);
  const [miningLogs, setMiningLogs] = useState<MiningLogEntry[]>([]);
  const [copiedLogs, setCopiedLogs] = useState(false);

  // Final Results after timer expires
  const [raceResults, setRaceResults] = useState<{
    winner: MinerState;
    rankedMiners: (MinerState & { rank: number; shareOfWorkPercent: number })[];
    totalNetworkAttempts: number;
    totalValidBlocks: number;
    averageHashrateKHz: number;
  } | null>(null);

  // Active Worker & Interval References
  const workersRef = useRef<Worker[]>([]);
  const workerBlobUrlRef = useRef<string | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const isRacingRef = useRef<boolean>(false);
  const minersRef = useRef<MinerState[]>(miners);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);
  const durationRef = useRef<number>(durationSec);
  const startTimeRef = useRef<number>(0);

  durationRef.current = durationSec;
  minersRef.current = miners;

  const targetPrefix = '0'.repeat(selectedDifficulty);

  // Sync initial difficulty if prop changes
  useEffect(() => {
    if (initialDifficulty && !isRacingRef.current) {
      setSelectedDifficulty(initialDifficulty);
    }
  }, [initialDifficulty]);

  // Adjust miners if count changes while idle
  useEffect(() => {
    if (!isRacingRef.current) {
      setMiners(generateFreshMiners(minerCount));
      setRemainingTime(durationSec);
    }
  }, [minerCount, durationSec]);

  // Set simulation banner in navbar
  useEffect(() => {
    if (isOpen) {
      setSimulationActive(
        true,
        language === 'vi' ? 'PHÒNG THÍ NGHIỆM PROOF-OF-WORK' : 'PROOF-OF-WORK ARENA'
      );
    } else {
      setSimulationActive(false);
    }
  }, [isOpen, language, setSimulationActive]);

  // Auto scroll logs to bottom
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [miningLogs]);

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
  }, []);

  // Cleanup on unmount or closing
  useEffect(() => {
    return () => {
      terminateAllWorkers();
    };
  }, [terminateAllWorkers]);

  // Finalize Race when timer reaches 0 or operator stops
  const finishRace = useCallback(() => {
    isRacingRef.current = false;
    setIsRacing(false);
    terminateAllWorkers();
    setSimulationActive(false);

    const currentMiners = [...minersRef.current];
    const totalNetworkAttempts = currentMiners.reduce((sum, m) => sum + m.attempts, 0);
    const totalValidBlocks = currentMiners.reduce((sum, m) => sum + m.validHashesCount, 0);
    const totalHashrate = currentMiners.reduce((sum, m) => sum + m.hashrateKHz, 0);

    // Primary ranking criterion: TOTAL COMPUTATIONAL WORK / HASH ATTEMPTS (tie-breaker: valid hashes found)
    const sorted = [...currentMiners].sort((a, b) => {
      if (b.attempts !== a.attempts) {
        return b.attempts - a.attempts;
      }
      return b.validHashesCount - a.validHashesCount;
    });

    const winner = sorted[0];

    const rankedMiners = sorted.map((m, idx) => ({
      ...m,
      rank: idx + 1,
      shareOfWorkPercent: totalNetworkAttempts > 0 ? Number(((m.attempts / totalNetworkAttempts) * 100).toFixed(1)) : 0,
      status: (m.id === winner.id ? 'winner' : 'stopped') as MinerState['status'],
    }));

    setMiners(rankedMiners);
    setRaceResults({
      winner,
      rankedMiners,
      totalNetworkAttempts,
      totalValidBlocks,
      averageHashrateKHz: Number(totalHashrate.toFixed(1)),
    });

    const finishTime = formatTimeWithMs(new Date());
    setMiningLogs((prev) => [
      ...prev,
      {
        id: `finish-${Date.now()}`,
        timestamp: finishTime,
        type: 'race_end',
        text: `[${finishTime}] 🏁 TIME LIMIT REACHED! Computational race concluded. Winner: ${winner.name.toUpperCase()} with ${winner.attempts.toLocaleString()} total hash attempts!`,
      },
    ]);

    // If candidate block provided, notify parent
    if (targetBlock && onBlockMined && winner) {
      onBlockMined(targetBlock.index, winner.currentNonce, winner.currentHash);
    }
  }, [onBlockMined, setSimulationActive, targetBlock, terminateAllWorkers]);

  // Reset entire race state
  const resetRace = useCallback(() => {
    terminateAllWorkers();
    isRacingRef.current = false;
    setIsRacing(false);
    setSimulationActive(false);
    setElapsedSeconds(0);
    setRemainingTime(durationSec);
    setDiscoveredBlocks([]);
    setRaceResults(null);
    setMiningLogs([]);

    const freshMiners = generateFreshMiners(minerCount);
    minersRef.current = freshMiners;
    setMiners(freshMiners);
  }, [durationSec, minerCount, setSimulationActive, terminateAllWorkers]);

  // Start the Competitive Proof-of-Work Race
  const startMiningRace = useCallback(() => {
    terminateAllWorkers();

    const freshMiners = generateFreshMiners(minerCount).map((m) => ({
      ...m,
      status: 'mining' as const,
    }));

    minersRef.current = freshMiners;
    setMiners(freshMiners);
    setDiscoveredBlocks([]);
    setRaceResults(null);
    setElapsedSeconds(0);
    setRemainingTime(durationSec);

    isRacingRef.current = true;
    setIsRacing(true);
    setSimulationActive(
      true,
      language === 'vi' ? 'CUỘC ĐUA PROOF-OF-WORK' : 'PROOF-OF-WORK RACE'
    );

    const startTime = performance.now();
    startTimeRef.current = startTime;

    const startTimestamp = formatTimeWithMs(new Date());
    setMiningLogs([
      {
        id: `start-net-${Date.now()}`,
        timestamp: startTimestamp,
        type: 'race_start',
        text: `[${startTimestamp}] 🚀 Mining Race Started: Duration ${durationSec}s | Difficulty: ${selectedDifficulty} (Target: "${targetPrefix}...") | Miners: ${minerCount}`,
      },
    ]);

    // Create single reusable Web Worker blob
    const blobUrl = createMiningWorkerBlob();
    workerBlobUrlRef.current = blobUrl;

    const telemetryMap: {
      [id: string]: {
        currentNonce: number;
        attempts: number;
        currentHash: string;
        hashrateKHz: number;
        validHashesCount: number;
      };
    } = {};

    freshMiners.forEach((m) => {
      telemetryMap[m.id] = {
        currentNonce: m.startNonce,
        attempts: 0,
        currentHash: m.currentHash,
        hashrateKHz: 0,
        validHashesCount: 0,
      };
    });

    // Spawn concurrent Web Workers for each miner
    const spawnedWorkers: Worker[] = [];

    freshMiners.forEach((miner, idx) => {
      const worker = new Worker(blobUrl);

      worker.onmessage = (e: MessageEvent<MinerWorkerOutgoingMessage>) => {
        if (!isRacingRef.current) return;
        const msg = e.data;
        if (!msg) return;

        if (msg.type === 'TELEMETRY') {
          telemetryMap[msg.minerId] = {
            currentNonce: msg.currentNonce,
            attempts: msg.attempts,
            currentHash: msg.currentHash,
            hashrateKHz: msg.measuredHashrateKHz,
            validHashesCount: telemetryMap[msg.minerId]?.validHashesCount || 0,
          };
        } else if (msg.type === 'VALID_HASH') {
          // Miner found a valid block meeting the target prefix!
          // In PoW, this is an achievement, but the computational race continues until timer expiry
          const currentValid = (telemetryMap[msg.minerId]?.validHashesCount || 0) + 1;
          telemetryMap[msg.minerId] = {
            ...telemetryMap[msg.minerId],
            currentNonce: msg.nonce,
            attempts: msg.attempts,
            currentHash: msg.hash,
            validHashesCount: currentValid,
          };

          const discTime = formatTimeWithMs(new Date());
          const newBlock: DiscoveredHash = {
            id: `disc-${msg.minerId}-${Date.now()}-${Math.random()}`,
            minerId: msg.minerId,
            minerName: miner.name,
            avatarColor: miner.avatarColor,
            nonce: msg.nonce,
            hash: msg.hash,
            attempts: msg.attempts,
            timestamp: discTime,
          };

          setDiscoveredBlocks((prev) => [newBlock, ...prev.slice(0, 19)]);

          setMiningLogs((prev) => [
            ...prev,
            {
              id: `vld-${Date.now()}-${Math.random()}`,
              timestamp: discTime,
              type: 'miner_valid',
              text: `[${discTime}] 🎯 VALID BLOCK FOUND by ${miner.name}! Nonce: ${msg.nonce.toLocaleString()} | Hash: ${msg.hash.slice(0, 16)}...`,
            },
          ]);
        }
      };

      // Header prefix for SHA-256
      const headerPrefix = `edu-pow-race:diff-${selectedDifficulty}:block-target:`;

      worker.postMessage({
        type: 'START',
        config: {
          minerId: miner.id,
          headerPrefix,
          startNonce: miner.startNonce,
          step: minerCount,
          targetPrefix,
          continuous: true, // MUST remain continuous until countdown completes
          batchSize: selectedDifficulty <= 2 ? 400 : 700,
        },
      });

      spawnedWorkers.push(worker);
    });

    workersRef.current = spawnedWorkers;

    // Real-time Countdown and Telemetry Synchronization Interval
    timerIntervalRef.current = window.setInterval(() => {
      if (!isRacingRef.current) return;

      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const totalDur = durationRef.current;
      const remaining = Math.max(0, totalDur - elapsed);

      setElapsedSeconds(Math.floor(elapsed));
      setRemainingTime(Math.ceil(remaining));

      // Synchronize batch telemetry into React state
      setMiners((prev) =>
        prev.map((m) => {
          const t = telemetryMap[m.id];
          if (!t) return m;
          return {
            ...m,
            currentNonce: t.currentNonce,
            attempts: t.attempts,
            currentHash: t.currentHash,
            hashrateKHz: t.hashrateKHz,
            validHashesCount: t.validHashesCount,
            status: 'mining' as const,
          };
        })
      );

      // Check if time limit reached
      if (remaining <= 0) {
        finishRace();
      }
    }, 100);
  }, [
    initialDifficulty,
    durationSec,
    finishRace,
    language,
    minerCount,
    selectedDifficulty,
    setSimulationActive,
    targetPrefix,
    terminateAllWorkers,
  ]);

  const copyLogsToClipboard = async () => {
    const plain = miningLogs.map((l) => l.text).join('\n');
    await navigator.clipboard.writeText(plain);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  if (!isOpen) return null;

  const totalCurrentAttempts = miners.reduce((acc, m) => acc + m.attempts, 0);
  const totalCurrentHashrate = miners.reduce((acc, m) => acc + m.hashrateKHz, 0);
  const totalValidBlocksDiscovered = miners.reduce((acc, m) => acc + m.validHashesCount, 0);
  const progressPercent = Math.min(100, Math.max(0, ((durationSec - remainingTime) / durationSec) * 100));

  return (
    <div
      id="mining-race-arena-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto font-sans"
    >
      <div className="relative w-full max-w-6xl rounded-2xl bg-[#080C14] border border-emerald-500/30 shadow-sm flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0B101B] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
              <Pickaxe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                  {language === 'vi' ? 'ĐỘC QUYỀN PROOF-OF-WORK' : 'DEDICATED PoW LAB'}
                </span>
                <span className="text-slate-500 text-xs font-mono">Nakamoto Race Engine</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display uppercase tracking-wide">
                {language === 'vi'
                  ? 'Phòng Thí Nghiệm Đua Đào Khối Thời Gian Thực'
                  : 'Time-Limited Competitive Mining Arena'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCodeViewer && (
              <button
                type="button"
                onClick={onOpenCodeViewer}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 text-xs font-mono border border-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Code2 className="w-4 h-4" />
                <span>{language === 'vi' ? 'Mã Nguồn' : 'Code'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top Control Bar: Duration, Difficulty, Miners & Main Actions */}
          <div className="p-5 rounded-xl bg-[#0D1424] border border-slate-800/90 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Parameter 1: Duration Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{language === 'vi' ? 'Thời Lượng Thi Đấu:' : 'Mining Duration:'}</span>
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { val: 30, label: '30s' },
                    { val: 60, label: '60s (1m)' },
                    { val: 300, label: '300s (5m)' },
                  ].map((d) => (
                    <button
                      key={d.val}
                      type="button"
                      disabled={isRacing}
                      onClick={() => setDurationSec(d.val)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                        durationSec === d.val
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parameter 2: Difficulty Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{language === 'vi' ? 'Độ Khó (Mục tiêu):' : 'Target Difficulty:'}</span>
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { val: 1, label: language === 'vi' ? "Độ khó 1 ('0')" : "Diff 1 ('0')" },
                    { val: 2, label: language === 'vi' ? "Độ khó 2 ('00')" : "Diff 2 ('00')" },
                    { val: 3, label: language === 'vi' ? "Độ khó 3 ('000')" : "Diff 3 ('000')" },
                    { val: 4, label: language === 'vi' ? "Độ khó 4 ('0000')" : "Diff 4 ('0000')" },
                  ].map((d) => (
                    <button
                      key={d.val}
                      type="button"
                      disabled={isRacing}
                      onClick={() => setSelectedDifficulty(d.val)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                        selectedDifficulty === d.val
                          ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parameter 3: Number of Miners */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{language === 'vi' ? 'Số Lượng Thợ Đào:' : 'Miners Count:'}</span>
                </label>
                <div className="flex items-center gap-2">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      disabled={isRacing}
                      onClick={() => setMinerCount(num)}
                      className={`w-9 h-8 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                        minerCount === num
                          ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
                {!isRacing ? (
                  <button
                    type="button"
                    id="btn-start-pow-race"
                    onClick={startMiningRace}
                    aria-label={language === 'vi' ? 'Bắt đầu cuộc đua đào khối PoW' : 'Start PoW mining race'}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold uppercase font-display text-xs tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                  >
                    <Play className="w-4 h-4 fill-current text-slate-950" />
                    <span>{language === 'vi' ? 'BẮT ĐẦU ĐUA ĐÀO' : 'START MINING RACE'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="btn-stop-pow-race"
                    onClick={finishRace}
                    aria-label={language === 'vi' ? 'Dừng cuộc đua đào' : 'Stop mining race early'}
                    className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold uppercase font-display text-xs tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>{language === 'vi' ? 'DỪNG SỚM' : 'STOP RACE'}</span>
                  </button>
                )}

                <button
                  type="button"
                  id="btn-reset-pow-race"
                  onClick={resetRace}
                  aria-label={language === 'vi' ? 'Đặt lại cuộc đua và số nonce' : 'Reset race and nonces'}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                  title="Reset Race & Nonces"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Countdown & Network Telemetry Status Bar */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#080C14] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-mono">
                  {language === 'vi' ? 'Thời Gian Còn Lại:' : 'Time Remaining:'}
                </span>
                <span className="font-mono text-base font-extrabold text-emerald-300">
                  {remainingTime}s
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#080C14] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-mono">
                  {language === 'vi' ? 'Tổng Lượt Băm:' : 'Total Attempts:'}
                </span>
                <span className="font-mono text-base font-extrabold text-purple-300">
                  {totalCurrentAttempts.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#080C14] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-mono">
                  {language === 'vi' ? 'Tổng Hashrate:' : 'Total Hashrate:'}
                </span>
                <span className="font-mono text-base font-extrabold text-amber-300">
                  {totalCurrentHashrate.toFixed(1)} kH/s
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#080C14] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-mono">
                  {language === 'vi' ? 'Khối Hợp Lệ:' : 'Valid Blocks:'}
                </span>
                <span className="font-mono text-base font-extrabold text-emerald-300">
                  {totalValidBlocksDiscovered}
                </span>
              </div>
            </div>

            {/* Countdown Progress Bar */}
            {isRacing && (
              <div className="space-y-1">
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 transition-all duration-100 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Elapsed: {elapsedSeconds}s</span>
                  <span>Target: {durationSec}s</span>
                </div>
              </div>
            )}
          </div>

          {/* Winner Podium & Educational Takeaway Banner (Appears when Race Ends) */}
          {raceResults && (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/10 via-[#0E1528] to-[#080C14] border-2 border-amber-500/50 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                        {language === 'vi' ? 'KẾT QUẢ CUỘC ĐUA ĐỒNG THUẬN' : 'CONSENSUS RACE RESULTS'}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white font-display uppercase tracking-wide">
                      {language === 'vi'
                        ? `Người Chiến Thắng: ${raceResults.winner.name}`
                        : `Winner: ${raceResults.winner.name}`}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Total Attempts: </span>
                    <span className="text-amber-300 font-bold">{raceResults.totalNetworkAttempts.toLocaleString()}</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Valid Blocks: </span>
                    <span className="text-emerald-300 font-bold">{raceResults.totalValidBlocks}</span>
                  </div>
                </div>
              </div>

              {/* Core Educational Principle Box */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 leading-relaxed font-sans flex items-start gap-3">
                <div>
                  <span className="font-bold text-amber-300 block mb-0.5 uppercase tracking-wide font-display">
                    {language === 'vi' ? 'Nguyên Lý Cốt Lõi Của Proof-of-Work:' : 'Core Proof-of-Work Principle:'}
                  </span>
                  <p className="text-slate-300">
                    {language === 'vi'
                      ? 'Proof-of-Work là một cuộc đua tính toán công bằng. Các thợ đào liên tục tính toán các hàm băm SHA-256 độc lập. Thợ đào nào thực hiện khối lượng tính toán (tổng số lượt băm) càng lớn trong cùng khoảng thời gian thì xác suất toán học tìm thấy khối hợp lệ càng cao.'
                      : 'Proof-of-Work is a computational race. Miners repeatedly calculate hashes. The more computational work a miner performs within the available time, the greater its chance of finding a valid block.'}
                  </p>
                </div>
              </div>

              {/* Miner Ranking Podium */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {raceResults.rankedMiners.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border transition-all ${
                      m.rank === 1
                        ? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-500/60 shadow-sm'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${
                            m.rank === 1
                              ? 'bg-amber-400 text-black font-extrabold'
                              : m.rank === 2
                              ? 'bg-slate-400 text-black font-bold'
                              : m.rank === 3
                              ? 'bg-amber-800 text-white font-bold'
                              : 'bg-slate-800 text-slate-400 font-bold'
                          }`}
                        >
                          #{m.rank}
                        </span>
                        {m.name}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {m.shareOfWorkPercent}% work
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>Hash Attempts:</span>
                        <span className="text-white font-bold">{m.attempts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Hashrate:</span>
                        <span className="text-purple-300 font-semibold">{m.hashrateKHz} kH/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valid Blocks:</span>
                        <span className="text-emerald-400 font-bold">{m.validHashesCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concurrent Miners Live Arena Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                {language === 'vi' ? 'Tiến Độ Khai Thác Song Song' : 'Live Concurrent Miners Arena'}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Target: {targetPrefix}... (Difficulty {selectedDifficulty})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {miners.map((miner) => {
                const isWinner = raceResults?.winner.id === miner.id;
                return (
                  <div
                    key={miner.id}
                    className={`p-5 rounded-xl border transition-all ${
                      isWinner
                        ? 'bg-amber-950/20 border-amber-500/60 shadow-sm'
                        : miner.status === 'mining'
                        ? 'bg-[#0B101E] border-emerald-500/40 shadow-sm'
                        : 'bg-[#080C14] border-slate-800/90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3 h-3 rounded-sm bg-gradient-to-r ${miner.avatarColor}`}
                        />
                        <span className="font-display font-bold text-sm text-white">{miner.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {miner.validHashesCount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{miner.validHashesCount} valid</span>
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase inline-flex items-center gap-1.5 ${
                            miner.status === 'mining'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : isWinner
                              ? 'bg-amber-500 text-black font-extrabold'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {miner.status === 'mining' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          )}
                          {isWinner ? 'WINNER 🏆' : miner.status}
                        </span>
                      </div>
                    </div>

                    {/* Telemetry Metrics - Clean flat row without nested box borders */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-center py-2 px-3 bg-slate-950/60 rounded-lg">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">Nonce</span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {miner.currentNonce.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">
                          {language === 'vi' ? 'Lượt Băm' : 'Attempts'}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-300">
                          {miner.attempts.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">
                          {language === 'vi' ? 'Tốc Độ' : 'Speed'}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {miner.hashrateKHz} kH/s
                        </span>
                      </div>
                    </div>

                    {/* Latest Hash Output */}
                    <div className="p-2.5 rounded-lg bg-slate-950/80 text-[11px] font-mono break-all leading-tight">
                      <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5 font-sans">
                        {language === 'vi' ? 'Mã Băm SHA-256 Gần Nhất:' : 'Latest Calculated SHA-256:'}
                      </span>
                      <span className="text-amber-400 font-bold">
                        {miner.currentHash.slice(0, selectedDifficulty)}
                      </span>
                      <span className="text-slate-300">
                        {miner.currentHash.slice(selectedDifficulty)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Valid Blocks Discovery Feed & Real-Time Console Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Discovered Valid Blocks Feed */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-[#090D18] border border-slate-800 flex flex-col h-64">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {language === 'vi' ? 'Khối Hợp Lệ Vừa Tìm Được' : 'Valid Blocks Discovered'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Total: {discoveredBlocks.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {discoveredBlocks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono text-center p-4">
                    <span>{language === 'vi' ? 'Chưa tìm thấy khối hợp lệ nào...' : 'No valid blocks found yet...'}</span>
                    <span className="text-[10px] text-slate-600 mt-1">
                      Miners are searching for hash starting with "{targetPrefix}"
                    </span>
                  </div>
                ) : (
                  discoveredBlocks.map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs font-mono space-y-1 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-sm bg-gradient-to-r ${b.avatarColor}`} />
                          {b.minerName}
                        </span>
                        <span className="text-[10px] text-slate-400">{b.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 break-all">
                        <span className="text-emerald-400 font-bold">{b.hash.slice(0, selectedDifficulty)}</span>
                        <span>{b.hash.slice(selectedDifficulty, 28)}...</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>Nonce: #{b.nonce.toLocaleString()}</span>
                        <span>Attempts: {b.attempts.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Live Event Logs Stream */}
            <div className="lg:col-span-7 p-4 rounded-xl bg-[#090D18] border border-slate-800 flex flex-col h-64">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {language === 'vi' ? 'Nhật Ký Khai Thác (Console)' : 'Mining Event Logs'}
                </span>
                <button
                  type="button"
                  onClick={copyLogsToClipboard}
                  className="text-[10px] font-mono text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedLogs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLogs ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div
                ref={logsContainerRef}
                className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300 pr-1"
              >
                {miningLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                    Console idle. Click "Start Mining Race" to begin.
                  </div>
                ) : (
                  miningLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`leading-relaxed ${
                        log.type === 'race_start'
                          ? 'text-emerald-300 font-bold'
                          : log.type === 'race_end'
                          ? 'text-amber-300 font-bold'
                          : log.type === 'miner_valid'
                          ? 'text-emerald-300 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      {log.text}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#0B101B] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>NIST FIPS 180-4 SHA-256 Multi-threaded Web Worker Consensus Lab</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-emerald-300 font-bold">
              Elapsed: {elapsedSeconds}s / {durationSec}s
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display font-semibold uppercase tracking-wider text-xs border border-slate-700 cursor-pointer"
            >
              {language === 'vi' ? 'Đóng' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
