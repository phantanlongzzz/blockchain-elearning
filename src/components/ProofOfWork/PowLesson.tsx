/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, RotateCcw, CheckCircle2, Plus, X, Pause, Clock, Activity, 
  FileText, Trophy, Trash2, Code2, Info, Check, ArrowRight, ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react';
import { createMiningWorkerBlob } from '../../utils/miningWorker';
import { useLanguage } from '../../i18n/LanguageContext';
import { SimulationCodeModal } from './SimulationCodeModal';
import { SimulationNavigation } from './SimulationNavigation';
import { P2PForkConsensusVisualizer } from './P2PForkConsensusVisualizer';
import { 
  MINER_COLORS, 
  getMinerColorTheme, 
  GENESIS_THEME, 
  ATTACKER_THEME, 
  MinerColorToken 
} from '../../utils/minerColors';

type Scenario = 'normal' | 'hashrate' | 'attack51';
type AppState = 'idle' | 'mining' | 'animating_win' | 'paused' | 'completed';

interface MinerVisual {
  id: string;
  name: string;
  type: 'CPU' | 'GPU' | 'ASIC' | 'Quantum';
  colorClass: string;
  power: number; // 1-100
  
  hashrate: number;
  attempts: number;
  currentNonce: number;
  currentHash: string;
  status: 'idle' | 'mining' | 'winner' | 'paused' | 'stopped';
  blocksWon: number;
  lastWonBlock?: number;
}

interface BlockRecord {
  index: number;
  hash: string;
  minerName: string;
  nonce?: number;
  prevHash?: string;
  timestamp: string;
  difficulty: number;
}

export type MinerTheme = MinerColorToken;

export const MINER_THEMES: Record<string, MinerTheme> = {
  alice: MINER_COLORS.Alice,
  bob: MINER_COLORS.Bob,
  charlie: MINER_COLORS.Charlie,
  dave: MINER_COLORS.Dave,
  eve: MINER_COLORS.Eve,
  frank: MINER_COLORS.Frank,
  grace: MINER_COLORS.Grace,
  henry: MINER_COLORS.Henry,
  'charlie-pool': ATTACKER_THEME,
  '51% attacker pool': ATTACKER_THEME,
  'miner-1': MINER_COLORS.Alice,
  'miner-2': MINER_COLORS.Bob,
  genesis: GENESIS_THEME
};

export const ALPHABET_MINER_POOL = [
  { name: 'Alice', type: 'CPU' as const, power: 10, colorClass: 'emerald' },
  { name: 'Bob', type: 'GPU' as const, power: 40, colorClass: 'sky' },
  { name: 'Charlie', type: 'ASIC' as const, power: 80, colorClass: 'violet' },
  { name: 'Dave', type: 'Quantum' as const, power: 100, colorClass: 'rose' },
  { name: 'Eve', type: 'CPU' as const, power: 25, colorClass: 'cyan' },
  { name: 'Frank', type: 'GPU' as const, power: 55, colorClass: 'orange' },
  { name: 'Grace', type: 'ASIC' as const, power: 75, colorClass: 'pink' },
  { name: 'Henry', type: 'Quantum' as const, power: 90, colorClass: 'indigo' },
];

export const getMinerTheme = (nameOrId: string, index?: number): MinerTheme => {
  return getMinerColorTheme(nameOrId, index);
};

interface LogEvent {
  id: string;
  time: string;
  message: string;
}

export const formatHashrate = (hr: number): string => {
  if (!hr || hr <= 0) return '0 H/s';
  if (hr < 1000) {
    return `${Math.round(hr)} H/s`;
  }
  return `${(hr / 1000).toFixed(2)} KH/s`;
};

function getWorkerConfig(power: number, speedMult: number = 1) {
  const norm = Math.max(1, Math.min(100, power));
  // Batch size and speed throttles mapped to give realistic, distinct hardware speeds:
  // Alice (CPU 10%): ~200 H/s
  // Bob (GPU 40%): ~1.1 KH/s
  // Charlie (ASIC 80%): ~5.0 KH/s
  // Dave (Quantum 100%): ~11.6 KH/s
  const baseBatch = Math.max(3, Math.round(norm * 0.35));
  const batchSize = Math.max(3, Math.round(baseBatch * speedMult));
  const speedThrottleMs = Math.max(2, Math.round((16 - (norm / 100) * 13) / speedMult));
  return { batchSize, speedThrottleMs };
}

const formatTime = (secs: number) => {
  const m = Math.floor(Math.max(0, secs) / 60).toString().padStart(2, '0');
  const s = Math.floor(Math.max(0, secs) % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const PowLesson: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [scenario, setScenario] = useState<Scenario>('normal');
  const [appState, setAppState] = useState<AppState>('idle');
  const [duration, setDuration] = useState<number>(30);
  const [remainingTime, setRemainingTime] = useState<number>(30);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<number>(3);
  
  const [miners, setMiners] = useState<MinerVisual[]>([]);
  const [blockchain, setBlockchain] = useState<BlockRecord[]>([]);
  const [justAddedBlockIndex, setJustAddedBlockIndex] = useState<number | null>(null);
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number>(0);
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockRecord | null>(null);
  const [activeVisualizerView, setActiveVisualizerView] = useState<'p2p_network' | 'timeline'>('p2p_network');
  const [autoFollow, setAutoFollow] = useState<boolean>(true);
  const [isAutoFollowPaused, setIsAutoFollowPaused] = useState<boolean>(false);
  const [showTelemetryDetails, setShowTelemetryDetails] = useState<boolean>(false);
  
  const usedNamesRef = useRef<Set<string>>(new Set(['Alice', 'Bob', 'Charlie', 'Dave']));

  const workersRef = useRef<Record<string, Worker>>({});
  const blobUrlRef = useRef<string | null>(null);
  const intendedStateRef = useRef<'mining' | 'paused'>('mining');
  const isHandlingWinnerRef = useRef(false);
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const timerEndedRef = useRef(false);
  const currentBlockSaltRef = useRef<string>(Math.random().toString(36).substring(2, 9));
  const latestTelemetryRef = useRef<Record<string, any>>({});
  const telemetryFlushTimerRef = useRef<number | null>(null);

  const appStateRef = useRef(appState);
  useEffect(() => { appStateRef.current = appState; }, [appState]);

  const minersRef = useRef(miners);
  useEffect(() => { minersRef.current = miners; }, [miners]);

  const blockchainRef = useRef(blockchain);
  useEffect(() => { blockchainRef.current = blockchain; }, [blockchain]);

  const difficultyRef = useRef(difficulty);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);

  const remainingTimeRef = useRef(remainingTime);
  useEffect(() => { remainingTimeRef.current = remainingTime; }, [remainingTime]);

  const addLog = useCallback((msg: string) => {
    const timeStr = new Date().toISOString().substring(11, 19);
    setLogs(prev => [{ id: `${Date.now()}-${Math.random()}`, time: timeStr, message: msg }, ...prev].slice(0, 50));
  }, []);

  const terminateWorkers = useCallback(() => {
    Object.values(workersRef.current).forEach((w: Worker) => {
      try {
        w.terminate();
      } catch (e) {
        // ignore
      }
    });
    workersRef.current = {};
  }, []);

  useEffect(() => {
    return () => {
      terminateWorkers();
      if (telemetryFlushTimerRef.current) {
        clearInterval(telemetryFlushTimerRef.current);
        telemetryFlushTimerRef.current = null;
      }
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, [terminateWorkers]);

  // Throttled UI telemetry flusher for high-performance rendering without state churn
  useEffect(() => {
    if (appState === 'mining') {
      telemetryFlushTimerRef.current = window.setInterval(() => {
        const updates = latestTelemetryRef.current;
        if (Object.keys(updates).length === 0) return;
        setMiners((prev) =>
          prev.map((prevM) => {
            const msg = updates[prevM.id];
            if (!msg) return prevM;
            return {
              ...prevM,
              hashrate: msg.hashrate || prevM.hashrate,
              attempts: msg.attempts,
              currentNonce: msg.currentNonce,
              currentHash: msg.currentHash,
              status: prevM.status === 'winner' ? 'winner' : 'mining',
            };
          })
        );
      }, 100);
    } else {
      if (telemetryFlushTimerRef.current) {
        clearInterval(telemetryFlushTimerRef.current);
        telemetryFlushTimerRef.current = null;
      }
    }
    return () => {
      if (telemetryFlushTimerRef.current) {
        clearInterval(telemetryFlushTimerRef.current);
        telemetryFlushTimerRef.current = null;
      }
    };
  }, [appState]);

  const handleReset = useCallback(() => {
    terminateWorkers();
    isHandlingWinnerRef.current = false;
    timerEndedRef.current = false;
    currentBlockSaltRef.current = Math.random().toString(36).substring(2, 9);
    setAppState('idle');
    setRemainingTime(duration);
    setBlockchain([{ 
      index: 0, 
      hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f', 
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      minerName: 'Satoshi', 
      nonce: 2083236893,
      timestamp: '00:00', 
      difficulty: 0
    }]);
    setLogs([]);
    addLog(isVi ? 'Đã khởi tạo lại hệ thống.' : 'System reset.');
    usedNamesRef.current = new Set(['Alice', 'Bob', 'Charlie', 'Dave']);
    setMiners(prev => prev.map(m => ({ 
      ...m, 
      hashrate: 0, 
      attempts: 0, 
      blocksWon: 0,
      lastWonBlock: undefined,
      currentNonce: Math.floor(Math.random() * 0x7FFFFFFF), 
      currentHash: '----------------------------------------------------------------', 
      status: 'idle' 
    })));
  }, [duration, isVi, addLog, terminateWorkers]);

  useEffect(() => {
    if (scenario === 'normal') {
      usedNamesRef.current = new Set(['Alice', 'Bob', 'Charlie', 'Dave']);
      setMiners([
        { id: 'alice', name: 'Alice', type: 'CPU', colorClass: 'emerald', power: 10, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: Math.floor(Math.random() * 0x7FFFFFFF), currentHash: '----------------------------------------------------------------', status: 'idle' },
        { id: 'bob', name: 'Bob', type: 'GPU', colorClass: 'sky', power: 40, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: Math.floor(Math.random() * 0x7FFFFFFF), currentHash: '----------------------------------------------------------------', status: 'idle' },
        { id: 'charlie', name: 'Charlie', type: 'ASIC', colorClass: 'violet', power: 80, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: Math.floor(Math.random() * 0x7FFFFFFF), currentHash: '----------------------------------------------------------------', status: 'idle' },
        { id: 'dave', name: 'Dave', type: 'Quantum', colorClass: 'rose', power: 100, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: Math.floor(Math.random() * 0x7FFFFFFF), currentHash: '----------------------------------------------------------------', status: 'idle' },
      ]);
    } else if (scenario === 'attack51') {
      usedNamesRef.current = new Set(['Alice', 'Bob', '51% Attacker Pool']);
      setMiners([
        { id: 'alice', name: 'Alice', type: 'CPU', colorClass: 'emerald', power: 5, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: Math.floor(Math.random() * 0x7FFFFFFF), currentHash: '----------------------------------------------------------------', status: 'idle' },
        { id: 'bob', name: 'Bob', type: 'GPU', colorClass: 'sky', power: 10, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: Math.floor(Math.random() * 0x7FFFFFFF), currentHash: '----------------------------------------------------------------', status: 'idle' },
        { id: 'charlie-pool', name: '51% Attacker Pool', type: 'ASIC', colorClass: 'rose', power: 95, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: Math.floor(Math.random() * 0x7FFFFFFF), currentHash: '----------------------------------------------------------------', status: 'idle' },
      ]);
    } else if (scenario === 'hashrate') {
      usedNamesRef.current = new Set(['Custom Miner 1', 'Custom Miner 2']);
      setMiners([
        { id: 'miner-1', name: 'Custom Miner 1', type: 'ASIC', colorClass: 'emerald', power: 50, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: Math.floor(Math.random() * 0x7FFFFFFF), currentHash: '----------------------------------------------------------------', status: 'idle' },
        { id: 'miner-2', name: 'Custom Miner 2', type: 'ASIC', colorClass: 'sky', power: 50, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: Math.floor(Math.random() * 0x7FFFFFFF), currentHash: '----------------------------------------------------------------', status: 'idle' },
      ]);
    }
    
    terminateWorkers();
    isHandlingWinnerRef.current = false;
    timerEndedRef.current = false;
    currentBlockSaltRef.current = Math.random().toString(36).substring(2, 9);
    setAppState('idle');
    setBlockchain([{ 
      index: 0, 
      hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f', 
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      minerName: 'Satoshi', 
      nonce: 2083236893,
      timestamp: '00:00', 
      difficulty: 0
    }]);
    setLogs([{ id: Date.now().toString(), time: new Date().toISOString().substring(11, 19), message: `Scenario switched to ${scenario}.` }]);
  }, [scenario, terminateWorkers]);

  useEffect(() => {
    if (appState === 'idle') {
      setRemainingTime(duration);
      timerEndedRef.current = false;
    }
  }, [duration, appState]);

  // Precise simulation countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (appState === 'mining' || appState === 'animating_win') {
      const stepMs = Math.round(1000 / playSpeed);
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            if (!timerEndedRef.current) {
              timerEndedRef.current = true;
              setAppState('completed');
              terminateWorkers();
              addLog(isVi ? 'Hết thời gian. Mô phỏng hoàn tất.' : 'Time expired. Simulation completed.');
            }
            return 0;
          }
          return prev - 1;
        });
      }, stepMs);
    }
    return () => clearInterval(interval);
  }, [appState, playSpeed, addLog, isVi, terminateWorkers]);

  const userScrolledAwayRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);

  // Handle user manual scroll on horizontal blockchain timeline (UX Rule: Do not fight user scroll)
  
  const navigateTimeline = useCallback((direction: 'prev' | 'next') => {
    setBlockchain(prevBlockchain => {
      setFocusedBlockIndex(prevIdx => {
        const total = prevBlockchain.length;
        if (total === 0) return prevIdx;
        
        let newIndex = prevIdx;
        if (direction === 'prev') {
          newIndex = Math.max(0, prevIdx - 1);
        } else {
          newIndex = Math.min(total - 1, prevIdx + 1);
        }
        
        setIsAutoFollowPaused(true);
        userScrolledAwayRef.current = true;
        
        setTimeout(() => {
          const blockEl = document.getElementById(`timeline-block-${newIndex}`);
          if (blockEl && timelineScrollRef.current) {
            isProgrammaticScrollRef.current = true;
            blockEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            setTimeout(() => {
              isProgrammaticScrollRef.current = false;
            }, 500);
          }
        }, 10);

        return newIndex;
      });
      return prevBlockchain;
    });
  }, []);

  useEffect(() => {
    if (activeVisualizerView !== 'timeline') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateTimeline('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateTimeline('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVisualizerView, navigateTimeline]);

  const handleTimelineScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;
    if (timelineScrollRef.current) {
      const el = timelineScrollRef.current;
      const distanceFromEnd = el.scrollWidth - el.clientWidth - el.scrollLeft;
      
      const centerPos = el.scrollLeft + el.clientWidth / 2;
      let closestIdx = 0;
      let minDiff = Infinity;
      
      const children = Array.from(el.children) as HTMLElement[];
      children.forEach((child) => {
        if (child.id && child.id.startsWith('timeline-block-')) {
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const diff = Math.abs(childCenter - centerPos);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = parseInt(child.id.replace('timeline-block-', ''), 10);
          }
        }
      });
      
      if (!isNaN(closestIdx)) {
        setFocusedBlockIndex(closestIdx);
      }

      if (distanceFromEnd > 140) {
        userScrolledAwayRef.current = true;
        setIsAutoFollowPaused(true);
      } else if (distanceFromEnd < 40) {
        userScrolledAwayRef.current = false;
        setIsAutoFollowPaused(false);
      }
    }
  }, []);

  // Event-based smart camera: Auto-scroll blockchain timeline to newly mined / leading block
  useEffect(() => {
    if (!autoFollow) return;
    
    // Auto-focus rule: return focus to the new event (new block mined)
    setFocusedBlockIndex(blockchain.length - 1);
    userScrolledAwayRef.current = false;
    setIsAutoFollowPaused(false);
    
    if (timelineScrollRef.current && blockchain.length > 0) {
      const el = timelineScrollRef.current;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior = prefersReduced ? 'auto' : 'smooth';

      isProgrammaticScrollRef.current = true;
      el.scrollTo({
        left: el.scrollWidth,
        behavior
      });

      const timer = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [blockchain.length, autoFollow]);

  const scrollToLatestBlock = () => {
    userScrolledAwayRef.current = false;
    setIsAutoFollowPaused(false);
    setAutoFollow(true);
    setFocusedBlockIndex(blockchain.length - 1);
    if (timelineScrollRef.current) {
      const el = timelineScrollRef.current;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      isProgrammaticScrollRef.current = true;
      el.scrollTo({
        left: el.scrollWidth,
        behavior: prefersReduced ? 'auto' : 'smooth'
      });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    }
  };

  const launchWorkerForMiner = useCallback((miner: MinerVisual, blockIdx: number, freshSalt?: string) => {
    if (!blobUrlRef.current) {
      blobUrlRef.current = createMiningWorkerBlob();
    }
    
    const config = getWorkerConfig(miner.power, playSpeed);
    const targetPrefix = '0'.repeat(difficultyRef.current);
    const salt = freshSalt || currentBlockSaltRef.current;
    const randomNonce = Math.floor(Math.random() * 0x7FFFFFFF);

    let worker = workersRef.current[miner.id];
    if (!worker) {
      worker = new Worker(blobUrlRef.current);
      workersRef.current[miner.id] = worker;

      worker.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === 'TELEMETRY') {
          latestTelemetryRef.current[msg.minerId] = msg;
        } else if (msg.type === 'WINNER') {
          handleWinner(msg);
        }
      };

      worker.postMessage({
        type: 'START',
        config: {
          minerId: miner.id,
          headerPrefix: `block-${blockIdx}-${salt}:`,
          startNonce: randomNonce,
          step: 1,
          targetPrefix,
          batchSize: config.batchSize,
          speedThrottleMs: config.speedThrottleMs,
          continuous: false,
          startAttempts: miner.attempts
        }
      });
    } else {
      worker.postMessage({
        type: 'UPDATE_BLOCK',
        headerPrefix: `block-${blockIdx}-${salt}:`,
        targetPrefix,
        startNonce: randomNonce,
        startAttempts: miner.attempts,
        batchSize: config.batchSize,
        speedThrottleMs: config.speedThrottleMs,
        resume: true
      });
    }
  }, [playSpeed]);

  const handleWinner = useCallback((msg: any) => { 
    if (appStateRef.current !== 'mining' || isHandlingWinnerRef.current) return; 
    isHandlingWinnerRef.current = true;
    
    const winningMinerId = msg.minerId;
    const currentMiners = minersRef.current;
    const winningMinerObj = currentMiners.find(m => m.id === winningMinerId);
    const minerName = winningMinerObj?.name || winningMinerId;
    const nextBlockIndex = blockchainRef.current.length;
    const prevBlock = blockchainRef.current[blockchainRef.current.length - 1];

    // 1. Highlight the winner in amber/yellow and preserve telemetry
    setMiners(prev => prev.map(m => m.id === winningMinerId 
      ? { 
          ...m, 
          hashrate: msg.hashrate || m.hashrate, 
          currentHash: msg.hash, 
          currentNonce: msg.nonce, 
          status: 'winner', 
          attempts: msg.attempts,
          blocksWon: (m.blocksWon || 0) + 1,
          lastWonBlock: nextBlockIndex
        } 
      : { 
          ...m, 
          hashrate: m.hashrate,
          status: 'mining' 
        }
    ));

    // 2. Exact event log sequence with standardized academic terminology
    addLog(`${minerName} ${isVi ? 'giải block thành công' : 'solved block successfully'} (Nonce: ${msg.nonce.toLocaleString()})`);

    const newBlock: BlockRecord = {
      index: nextBlockIndex,
      hash: msg.hash,
      prevHash: prevBlock?.hash || '0000000000000000000000000000000000000000000000000000000000000000',
      minerName: minerName,
      nonce: msg.nonce,
      timestamp: formatTime(duration - remainingTimeRef.current),
      difficulty: difficultyRef.current
    };

    setBlockchain(prev => {
      if (prev.some(b => b.index === newBlock.index)) return prev;
      return [...prev, newBlock];
    });

    setJustAddedBlockIndex(nextBlockIndex);
    setTimeout(() => {
      setJustAddedBlockIndex(prev => prev === nextBlockIndex ? null : prev);
    }, 1500);

    addLog(isVi ? `Block #${newBlock.index} đã nối vào chuỗi thành công.` : `Block #${newBlock.index} successfully appended to blockchain.`);

    // 3. Smooth transition to next block after 1.2s winner animation window
    setTimeout(() => {
      isHandlingWinnerRef.current = false;
      
      if (appStateRef.current === 'mining' && remainingTimeRef.current > 0) {
        const freshSalt = Math.random().toString(36).substring(2, 9);
        currentBlockSaltRef.current = freshSalt;

        // Return winning miner to active mining state
        setMiners(prev => prev.map(m => ({
          ...m,
          status: 'mining',
          currentNonce: Math.floor(Math.random() * 0x7FFFFFFF)
        })));

        // Broadcast new block simultaneously to all active miners with fresh random nonces
        const shuffled = [...minersRef.current].sort(() => Math.random() - 0.5);
        shuffled.forEach(m => {
          launchWorkerForMiner(m, nextBlockIndex + 1, freshSalt);
        });
      }
    }, 1200);
  }, [addLog, duration, isVi, launchWorkerForMiner]);

  // Starts all workers on entering 'mining' state
  useEffect(() => {
    if (appState === 'mining') {
      const currentBlocks = blockchainRef.current.length;
      const freshSalt = Math.random().toString(36).substring(2, 9);
      currentBlockSaltRef.current = freshSalt;
      
      const shuffled = [...minersRef.current].sort(() => Math.random() - 0.5);
      shuffled.forEach(m => {
        launchWorkerForMiner(m, currentBlocks, freshSalt);
      });
    } else if (appState === 'paused' || appState === 'completed' || appState === 'idle') {
      terminateWorkers();
    }
  }, [appState, launchWorkerForMiner, terminateWorkers]);

  const handleStart = () => {
    intendedStateRef.current = 'mining';
    timerEndedRef.current = false;
    currentBlockSaltRef.current = Math.random().toString(36).substring(2, 9);
    setAppState('mining');
    setMiners(prev => prev.map(m => ({ ...m, status: 'mining' })));
    addLog(isVi ? 'Bắt đầu cuộc đua khai thác...' : 'Mining race started...');
  };

  const handlePause = () => {
    intendedStateRef.current = 'paused';
    setAppState('paused');
    terminateWorkers();
    setMiners(prev => prev.map(m => ({ ...m, status: 'paused' })));
    addLog(isVi ? 'Đã tạm dừng mô phỏng.' : 'Simulation paused.');
  };
  
  const handleQuickAddMiner = () => {
    if (miners.length >= 8) return;
    
    // Find next unused name from alphabetical pool
    let template = ALPHABET_MINER_POOL.find(p => !usedNamesRef.current.has(p.name));
    
    if (!template) {
      const count = usedNamesRef.current.size + 1;
      const types: ('CPU' | 'GPU' | 'ASIC' | 'Quantum')[] = ['CPU', 'GPU', 'ASIC', 'Quantum'];
      const powers = [25, 50, 75, 95];
      const colors = ['emerald', 'sky', 'violet', 'rose', 'cyan', 'orange', 'pink', 'indigo'];
      template = {
        name: `Node-${count}`,
        type: types[count % types.length],
        power: powers[count % powers.length],
        colorClass: colors[count % colors.length]
      };
    }
    
    usedNamesRef.current.add(template.name);
    
    const id = `miner-${template.name.toLowerCase()}-${Date.now()}`;
    const isRunning = appState === 'mining' || appState === 'animating_win';
    
    const newMiner: MinerVisual = {
      id,
      name: template.name,
      type: template.type,
      colorClass: (template as { colorClass?: string }).colorClass || 'emerald',
      power: template.power,
      hashrate: 0,
      attempts: 0,
      blocksWon: 0,
      currentNonce: Math.floor(Math.random() * 0x7FFFFFFF),
      currentHash: '----------------------------------------------------------------',
      status: isRunning ? 'mining' : 'idle'
    };

    setMiners(prev => [...prev, newMiner]);
    addLog(`${newMiner.name} ${isVi ? 'tham gia cuộc đua khai thác.' : 'joined the mining race.'}`);

    if (isRunning) {
      setTimeout(() => {
        launchWorkerForMiner(newMiner, blockchainRef.current.length, currentBlockSaltRef.current);
      }, 30);
    }
  };

  const handleRemoveMiner = (id: string) => {
    if (miners.length <= 1) return;
    
    const minerToRemove = miners.find(m => m.id === id);
    
    if (workersRef.current[id]) {
      try {
        workersRef.current[id].terminate();
        delete workersRef.current[id];
      } catch (e) {
        // ignore
      }
    }

    setMiners(prev => prev.filter(m => m.id !== id));
    if (minerToRemove) {
      addLog(`${minerToRemove.name} ${isVi ? 'rời khỏi cuộc đua khai thác.' : 'left the mining race.'}`);
    }
  };

  const getMinerStatusBadge = (miner: MinerVisual, currentAppState: AppState) => {
    if (miner.status === 'winner') {
      return (
        <span className="text-amber-400 font-semibold text-xs whitespace-nowrap">
          {isVi 
            ? 'Giải block thành công' 
            : 'Solved block successfully'}
        </span>
      );
    }
    const lastBlock = blockchain.length > 1 ? blockchain[blockchain.length - 1] : null;
    const isLastBlockSolver = lastBlock !== null && (lastBlock.minerName === miner.name || lastBlock.minerName === miner.id);

    if (currentAppState === 'completed') {
      if (isLastBlockSolver) {
        return (
          <span className="text-amber-400 font-semibold text-xs whitespace-nowrap">
            {isVi ? 'Người giải cuối' : 'Last block solver'}
          </span>
        );
      }
      return (
        <span className="text-slate-400 text-xs font-mono">
          {isVi ? 'Đã dừng' : 'Stopped'}
        </span>
      );
    }
    if (currentAppState === 'paused') {
      return (
        <span className="text-amber-400 font-medium text-xs font-mono">
          {isVi ? 'Tạm dừng' : 'Paused'}
        </span>
      );
    }
    if (currentAppState === 'mining' || currentAppState === 'animating_win') {
      return (
        <span className="text-emerald-400 font-medium text-xs font-mono">
          {isVi ? 'Đang giải block...' : 'Solving block...'}
        </span>
      );
    }
    return (
      <span className="text-slate-500 text-xs font-mono">
        {isVi ? 'Sẵn sàng' : 'Ready'}
      </span>
    );
  };

  const totalBlocksMined = blockchain.length - 1;

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        
        {/* LAYER 1: MINING CONTROL */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              Proof of Work
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-[#0C0F14] p-1 rounded-xl border border-slate-800 shrink-0 overflow-x-auto no-scrollbar">
              {(['normal', 'hashrate', 'attack51'] as Scenario[]).map(s => (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  disabled={appState !== 'idle' && appState !== 'completed'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-display transition-all whitespace-nowrap ${
                    scenario === s 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  } disabled:opacity-50 cursor-pointer`}
                >
                  {s === 'normal' ? (isVi ? 'Đua Tiêu Chuẩn' : 'Standard Race') : 
                   s === 'hashrate' ? (isVi ? 'Lợi Thế Hashrate' : 'Hashrate Advantage') : 
                   (isVi ? 'Tấn Công 51%' : '51% Attack')}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCodeModal(true)}
              className="p-2 bg-[#0C0F14] hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shrink-0"
              title={isVi ? 'Xem mã nguồn thuật toán' : 'View algorithm code'}
            >
              <Code2 size={15} />
              <span className="hidden sm:inline">{isVi ? 'Mã Nguồn' : 'Code'}</span>
            </button>
          </div>
        </header>

        {/* Compact Configuration & Execution Bar */}
        <div className="flex flex-col gap-4 p-4 sm:p-5 bg-[#0A0D11] rounded-xl border border-slate-800 shadow-sm">
          {/* CẤU HÌNH THÍ NGHIỆM */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
              {isVi ? 'Cấu hình thí nghiệm' : 'Experiment Configuration'}
            </span>
            <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-3">
              {/* Duration Selector */}
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-[11px] font-medium text-slate-400 select-none">{isVi ? 'Thời lượng' : 'Duration'}</label>
                <select 
                  value={duration} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDuration(val);
                    if (appState === 'idle' || appState === 'completed') {
                      setRemainingTime(val);
                    }
                  }}
                  disabled={appState !== 'idle' && appState !== 'completed'}
                  className="h-10 px-3 py-2 bg-[#11161D] border border-slate-700/60 rounded-lg text-sm font-medium text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all cursor-pointer appearance-none pr-8 relative disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  <option value={30}>30 {isVi ? 'giây' : 'sec'}</option>
                  <option value={60}>1 {isVi ? 'phút' : 'min'}</option>
                  <option value={120}>2 {isVi ? 'phút' : 'min'}</option>
                  <option value={300}>5 {isVi ? 'phút' : 'min'}</option>
                </select>
              </div>

              {/* Playback Speed Controls */}
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-[11px] font-medium text-slate-400 select-none">{isVi ? 'Tốc độ' : 'Speed'}</label>
                <div className="h-10 flex bg-[#11161D] p-1 rounded-lg border border-slate-700/60">
                  {[1, 2, 4].map(spd => (
                    <button
                      key={spd}
                      onClick={() => setPlaySpeed(spd)}
                      className={`flex-1 sm:px-4 flex items-center justify-center rounded-md text-sm font-mono transition-colors ${
                        playSpeed === spd
                          ? 'bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      } cursor-pointer`}
                    >
                      {spd}×
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selector */}
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-[11px] font-medium text-slate-400 select-none">{isVi ? 'Độ khó' : 'Difficulty'}</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  disabled={appState !== 'idle' && appState !== 'completed'}
                  className="h-10 px-3 py-2 bg-[#11161D] border border-slate-700/60 rounded-lg text-sm font-medium text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all cursor-pointer appearance-none pr-8 relative disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  <option value={1}>1 — {isVi ? 'Dễ' : 'Easy'}</option>
                  <option value={2}>2 — {isVi ? 'Trung bình' : 'Medium'}</option>
                  <option value={3}>3 — {isVi ? 'Khó' : 'Hard'}</option>
                  <option value={4}>4 — {isVi ? 'Rất khó' : 'Very Hard'}</option>
                </select>
              </div>

              {/* Target Prefix Summary */}
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-[11px] font-medium text-slate-400 select-none">{isVi ? 'Tiền tố' : 'Prefix'}</label>
                <div className="h-10 flex items-center px-4 bg-[#11161D] border border-slate-700/60 rounded-lg text-sm text-slate-300 font-mono select-none">
                  "{'0'.repeat(difficulty)}"
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-slate-800/80 my-0.5" />

          {/* ĐIỀU KHIỂN */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
              {isVi ? 'Điều khiển' : 'Controls'}
            </span>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Status Indicator */}
                <div className="flex items-center gap-2.5 min-w-[120px] select-none">
                  {appState === 'idle' && (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      <span className="text-sm font-medium text-slate-400">{isVi ? 'Sẵn sàng' : 'Ready'}</span>
                    </>
                  )}
                  {appState === 'mining' && (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      <span className="text-sm font-medium text-emerald-400">{isVi ? 'Đang khai thác' : 'Mining'}</span>
                    </>
                  )}
                  {(appState === 'completed' || appState === 'animating_win') && (
                    <>
                      <Check size={16} strokeWidth={2.5} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-300">{isVi ? 'Hoàn tất' : 'Completed'}</span>
                    </>
                  )}
                  {appState === 'paused' && (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="text-sm font-medium text-slate-400">{isVi ? 'Tạm dừng' : 'Paused'}</span>
                    </>
                  )}
                </div>

                {/* Timer */}
                <div className="flex items-center gap-2 select-none" title={isVi ? 'Thời gian còn lại' : 'Remaining time'}>
                  <Clock size={16} className={appState === 'mining' ? 'text-emerald-500/80' : 'text-slate-500'} />
                  <span className={`font-mono font-semibold text-base tracking-wider ${appState === 'mining' ? 'text-white' : 'text-slate-300'}`}>
                    {formatTime(remainingTime)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                {appState === 'idle' ? (
                  <button 
                    onClick={handleStart} 
                    disabled={miners.length === 0} 
                    className="flex-1 sm:flex-none h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Play size={14} className="fill-current" /> {isVi ? 'Bắt Đầu' : 'Start'}
                  </button>
                ) : appState === 'completed' || appState === 'animating_win' ? (
                  <button 
                    onClick={handleReset} 
                    className="flex-1 sm:flex-none h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <RotateCcw size={14} /> {isVi ? 'Chạy Lại' : 'Run Again'}
                  </button>
                ) : appState === 'mining' ? (
                  <button 
                    onClick={handlePause} 
                    className="flex-1 sm:flex-none h-10 px-6 bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Pause size={14} className="fill-current" /> {isVi ? 'Dừng' : 'Pause'}
                  </button>
                ) : (
                  <button 
                    onClick={handleStart} 
                    disabled={appState === 'animating_win'} 
                    className="flex-1 sm:flex-none h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Play size={14} className="fill-current" /> {isVi ? 'Tiếp Tục' : 'Resume'}
                  </button>
                )}

                {/* Reset button only visible if not completed and not idle */}
                {(appState === 'mining' || appState === 'paused') && (
                  <button 
                    onClick={handleReset} 
                    className="h-10 px-4 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    title={isVi ? 'Đặt lại' : 'Reset'}
                  >
                    <RotateCcw size={14} /> <span className="hidden sm:inline text-sm font-medium">{isVi ? 'Đặt lại' : 'Reset'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MINING ARENA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-display font-bold text-slate-300 tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {isVi ? 'CUỘC ĐUA KHAI THÁC' : 'MINING RACE ARENA'}
            </h3>
            <button 
              onClick={handleQuickAddMiner}
              disabled={miners.length >= 8}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all select-none ${
                miners.length >= 8
                  ? 'bg-slate-900/60 text-slate-600 border-slate-800 cursor-not-allowed'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 active:scale-[0.98] cursor-pointer'
              }`}
            >
              {miners.length >= 8 
                ? (isVi ? 'Đã đạt tối đa (8)' : 'Max reached (8)')
                : (isVi ? 'Thêm Thợ Đào' : 'Add Miner')}
            </button>
          </div>

          {miners.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center text-slate-500 bg-[#0C0F14]">
              <p className="mb-3 text-sm">{isVi ? 'Không có thợ đào nào.' : 'No miners available.'}</p>
              <button 
                onClick={handleQuickAddMiner} 
                className="px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-lg flex items-center gap-2 hover:bg-emerald-400 cursor-pointer"
              >
                {isVi ? 'Thêm Thợ Đào' : 'Add Miner'}
              </button>
            </div>
          ) : miners.map(m => {
            const mTheme = getMinerTheme(m.name);
            const initial = m.name ? m.name.charAt(0).toUpperCase() : 'M';
            const lastBlock = blockchain.length > 1 ? blockchain[blockchain.length - 1] : null;
            const isLastBlockSolver = lastBlock !== null && (lastBlock.minerName === m.name || lastBlock.minerName === m.id);
            const isWinnerCard = m.status === 'winner' || (appState === 'completed' && isLastBlockSolver);

            return (
              <div 
                key={m.id} 
                className={`relative p-4 rounded-xl border transition-all duration-300 ${
                  isWinnerCard 
                    ? 'bg-[#141108] border-amber-400 animate-block-pulse shadow-[0_0_20px_rgba(245,158,11,0.12)]' 
                    : 'bg-[#0C0F14] border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 relative z-10">
                  {/* Miner Identity with Letter Circle Avatar */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 border ${mTheme.bg} ${mTheme.text} ${mTheme.border}`}>
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-white text-base leading-tight truncate">{m.name}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                          {m.type}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 bg-[#090A0F] h-1.5 rounded-full overflow-hidden border border-slate-800 max-w-[120px]">
                          <div 
                            className={`${mTheme.progressBar} h-full transition-all duration-300`} 
                            style={{ width: `${m.power}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-mono tabular-nums text-slate-400">{m.power}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Lane (Real-Time Nonce & Hash - Static in-place, NO sliding/scrolling) */}
                  <div className="flex-1 h-11 bg-[#090A0F] rounded-xl border border-slate-800/90 overflow-hidden relative flex items-center px-4 shadow-inner min-w-0">
                    {isWinnerCard && (
                      <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
                    )}
                    
                    <div className="relative z-10 flex w-full justify-between items-center text-xs font-mono tabular-nums text-slate-400 gap-3">
                      <span className="truncate shrink-0 font-medium">
                        Nonce: <span className="text-white font-bold">{m.currentNonce.toLocaleString()}</span>
                      </span>
                      <span className={`truncate font-mono text-[11px] sm:text-xs ${
                        isWinnerCard ? 'text-amber-400 font-bold' : 'text-slate-400'
                      }`}>
                        Hash: {isWinnerCard 
                          ? m.currentHash 
                          : m.currentHash.length > 28 
                            ? m.currentHash.substring(0, 10) + '...' + m.currentHash.substring(m.currentHash.length - 8)
                            : m.currentHash
                        }
                      </span>
                    </div>
                  </div>

                  {/* Real-time Mining Stats (Hashrate, Attempts, Blocks, Status) */}
                  <div className="flex items-center justify-between xl:justify-end gap-4 sm:gap-5 min-w-[340px] border-t xl:border-t-0 border-slate-800/60 pt-2 xl:pt-0">
                    {/* Real Hashrate */}
                    <div className="text-left xl:text-right w-24">
                      <div className="text-[10px] text-slate-500 font-display font-bold uppercase tracking-wider">
                        {isVi ? 'Tốc độ' : 'Hashrate'}
                      </div>
                      <div className="font-mono tabular-nums text-emerald-400 font-bold text-xs sm:text-sm">
                        {formatHashrate(m.hashrate)}
                      </div>
                    </div>

                    {/* Real Cumulative Attempts */}
                    <div className="text-right w-20">
                      <div className="text-[10px] text-slate-500 font-display font-bold uppercase tracking-wider">
                        {isVi ? 'Đã thử' : 'Attempts'}
                      </div>
                      <div className="font-mono tabular-nums text-white font-bold text-xs sm:text-sm">
                        {(m.attempts || 0).toLocaleString()}
                      </div>
                    </div>

                    {/* Blocks Won Total */}
                    <div className="text-right w-16">
                      <div className="text-[10px] text-slate-500 font-display font-bold uppercase tracking-wider">
                        {isVi ? 'Số khối' : 'Blocks'}
                      </div>
                      <div className="font-mono tabular-nums text-emerald-400 font-bold text-xs sm:text-sm">
                        {m.blocksWon || 0}
                      </div>
                    </div>
                    
                    {/* Miner Status Badge & Delete Action */}
                    <div className="flex items-center justify-end w-44 border-l border-slate-800/80 pl-3">
                      <div className="text-xs font-sans font-medium flex-1 text-right">
                        {getMinerStatusBadge(m, appState)}
                      </div>
                      {miners.length > 1 && (
                        <button 
                          onClick={() => handleRemoveMiner(m.id)} 
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all ml-2 cursor-pointer shrink-0"
                          title={isVi ? 'Xóa thợ đào' : 'Remove miner'}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* COMPLETION SUMMARY CARD */}
        {appState === 'completed' && (
          <div className="p-5 rounded-2xl bg-[#0C0F14] border border-emerald-500/30 shadow-lg space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                    {isVi ? 'MÔ PHỎNG HOÀN TẤT' : 'SIMULATION COMPLETED'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {duration}s · {totalBlocksMined} {isVi ? 'khối' : 'Blocks'} · {miners.length} {isVi ? 'thợ đào' : 'Miners'}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleReset} 
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-display font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm"
              >
                <RotateCcw size={14} /> {isVi ? 'Chạy Lại' : 'Run Again'}
              </button>
            </div>

            {/* Winner Ranking and Core Takeaway */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Winner Ranking */}
              <div className="p-3.5 bg-[#11161D] rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-display font-bold text-slate-400 uppercase tracking-wider block">
                  {isVi ? 'Kết Quả Từng Thợ Đào' : 'Miner Results'}
                </span>
                <div className="space-y-1.5 text-xs font-mono">
                  {miners.map(m => {
                    const summaryTheme = getMinerTheme(m.name);
                    return (
                      <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-slate-800/50 last:border-0">
                        <span className="text-slate-300 font-sans font-medium flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center font-display font-bold text-[10px] shrink-0 border ${summaryTheme.bg} ${summaryTheme.text} ${summaryTheme.border}`}>
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          {m.name}
                          <span className="text-[10px] text-slate-500 font-mono">({m.type})</span>
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-[11px] font-mono">{formatHashrate(m.hashrate)}</span>
                          <span className={`font-bold font-mono text-xs px-2 py-0.5 rounded border ${
                            m.blocksWon > 0 
                              ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                              : 'text-slate-500 bg-slate-800/40 border-slate-800'
                          }`}>
                            {m.blocksWon} {isVi ? 'khối' : 'Blocks'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Core Learning Message */}
              <div className="p-3.5 bg-[#11161D] rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-display font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Info size={14} /> {isVi ? 'Bài Học Cốt Lõi' : 'Core Takeaway'}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {isVi 
                      ? 'Hashrate cao hơn làm tăng xác suất toán học để tìm được Block trước. Tuy nhiên hàm băm SHA-256 có tính xác suất ngẫu nhiên cao, do đó miner có hashrate thấp vẫn có cơ hội giải khối thành công trước miner mạnh hơn.' 
                      : 'Higher hashrate increases the mathematical probability of finding a block first. However, SHA-256 is strictly probabilistic, allowing lower-hashrate miners a genuine chance to find solutions ahead of more powerful rigs.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* VISUALIZATION VIEW SELECTOR & MAIN VIEW */}
        <div className="pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0C0F14] p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-display font-bold text-slate-300 uppercase tracking-wider">
                {isVi ? 'CHẾ ĐỘ MÔ PHỎNG' : 'VISUALIZATION MODE'}
              </span>
            </div>

            <div className="flex items-center bg-[#11161D] p-1 rounded-lg border border-slate-800 gap-1 text-xs">
              <button
                onClick={() => setActiveVisualizerView('p2p_network')}
                className={`px-3 py-1.5 rounded-md font-display font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeVisualizerView === 'p2p_network'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <span>🌐</span>
                <span>{isVi ? 'Mạng P2P & Phân nhánh' : 'P2P Network'}</span>
              </button>

              <button
                onClick={() => setActiveVisualizerView('timeline')}
                className={`px-3 py-1.5 rounded-md font-display font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeVisualizerView === 'timeline'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <span>⛓️</span>
                <span>{isVi ? 'Chuỗi tuyến tính' : 'Linear Timeline'}</span>
              </button>
            </div>
          </div>

          {activeVisualizerView === 'p2p_network' ? (
            <P2PForkConsensusVisualizer 
              blockchain={blockchain} 
              appState={appState}
              focusedBlockIndex={focusedBlockIndex}
              navigateTimeline={navigateTimeline}
              scrollToLatestBlock={scrollToLatestBlock}
            />
          ) : (
            
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0D12] border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 px-1 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h3 className="text-xs sm:text-sm font-display font-bold text-slate-300 tracking-wider">
                    {isVi ? 'Chuỗi khối' : 'Blockchain'}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-mono text-slate-400 mr-2">
                    {isVi ? `Tổng: ${blockchain.length}` : `Total: ${blockchain.length}`}
                  </span>
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

              <div 
                ref={timelineScrollRef}
                onScroll={handleTimelineScroll}
                className="flex overflow-x-auto py-3 pb-4 gap-3 items-center custom-scrollbar px-2 max-w-full"
              >
                {blockchain.map((block, idx) => {
                  const isLatestTip = idx === blockchain.length - 1 && blockchain.length > 1;
                  const theme = getMinerTheme(block.minerName, block.index);
                  const isGenesis = block.index === 0;

                  return (
                    <React.Fragment key={`${block.index}-${block.hash}`}>
                      <div 
                        id={`timeline-block-${block.index}`}
                        onClick={() => setSelectedBlock(block)}
                        className={`relative py-3 px-4 rounded-xl transition-all duration-200 flex flex-col items-center justify-center min-w-[100px] shrink-0 cursor-pointer select-none border box-border ${
                          isLatestTip 
                            ? 'border-[#00C98D] bg-[#00C98D]/10' 
                            : `${theme.border} ${theme.bg} hover:border-slate-400 hover:bg-[#0E131A]`
                        } ${idx === focusedBlockIndex ? 'ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : ''}`}
                      >
                        <div className={`text-2xl font-mono font-bold tracking-wider ${isGenesis ? 'text-slate-300' : theme.text} mb-1`}>
                          #{block.index}
                        </div>
                        <div className="text-center w-full">
                          {isGenesis ? (
                            <span className="font-sans font-medium text-slate-400 text-xs truncate block w-full">Genesis</span>
                          ) : (
                            <span className={`font-sans font-medium text-xs truncate block w-full ${theme.text}`}>
                              {block.minerName}
                            </span>
                          )}
                        </div>
                      </div>
                      {idx < blockchain.length - 1 && (
                        <div className="w-4 h-px bg-slate-700 relative shrink-0">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-[3px] border-y-transparent border-l-[5px] border-l-slate-500" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* LAYER 4: COLLAPSIBLE TELEMETRY & LOGS (PROGRESSIVE DISCLOSURE) */}
        <div className="pt-1 border-t border-slate-800/60">
          <button
            onClick={() => setShowTelemetryDetails(prev => !prev)}
            className="w-full py-2 px-3 bg-[#0C0F14] hover:bg-[#11161D] rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 font-display font-semibold">
              <Activity size={14} className={showTelemetryDetails ? 'text-emerald-400' : 'text-slate-500'} />
              <span>{isVi ? 'Nhật Ký Sự Kiện & Chi Tiết Nút Thợ Đào' : 'Event Log & Node Telemetry'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                {logs.length} {isVi ? 'sự kiện' : 'events'}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {showTelemetryDetails ? (isVi ? '▲ Thu gọn' : '▲ Collapse') : (isVi ? '▼ Mở rộng để xem' : '▼ Expand to inspect')}
            </span>
          </button>

          {showTelemetryDetails && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3 animate-in fade-in duration-200">
              {/* Mining Event Log */}
              <div className="p-4 rounded-xl border border-slate-800/90 bg-[#0C0F14]">
                <h3 className="text-xs sm:text-sm font-display font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <Activity size={15} className="text-slate-400"/> 
                  {isVi ? 'Nhật Ký Sự Kiện Khai Thác' : 'Mining Event Log'}
                </h3>
                <div className="h-[180px] overflow-y-auto font-mono tabular-nums text-xs space-y-1.5 pr-2 custom-scrollbar">
                  {logs.map(log => (
                    <div key={log.id} className="flex gap-2.5 text-[#F5F5F5]">
                      <span className="text-slate-400 shrink-0 font-normal">[{log.time}]</span>
                      <span className="text-white font-normal leading-relaxed">
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {logs.length === 0 && <div className="text-slate-400 italic">{isVi ? 'Chưa có sự kiện nào.' : 'No events yet.'}</div>}
                </div>
              </div>
              
              {/* Node Technical Telemetry */}
              <div className="p-4 rounded-xl border border-slate-800/90 bg-[#0C0F14]">
                <h3 className="text-xs sm:text-sm font-display font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <FileText size={15} className="text-amber-400"/> 
                  {isVi ? 'Chi Tiết Kỹ Thuật Nút Thợ Đào' : 'Node Technical Telemetry'}
                </h3>
                <div className="space-y-2 h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                  {miners.map(m => (
                    <div key={m.id} className="text-xs font-mono tabular-nums bg-[#11161D] p-2.5 rounded-lg border border-slate-800/80">
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span className="font-bold text-white font-sans">{m.name} ({m.type})</span>
                        <span>{isVi ? 'Độ khó' : 'Diff'}: {difficulty} | {isVi ? 'Sức mạnh' : 'Power'}: {m.power}% | {isVi ? 'Tốc độ' : 'Speed'}: {formatHashrate(m.hashrate)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>Nonce: <span className="text-white font-semibold">{m.currentNonce.toLocaleString()}</span></div>
                        <div className="text-right">{isVi ? 'Đã thử' : 'Attempts'}: <span className="text-white font-semibold">{m.attempts.toLocaleString()}</span></div>
                      </div>
                      <div className="truncate text-slate-500 text-[10px] mt-0.5">
                        Hash: <span className={m.status === 'winner' ? 'text-amber-400 font-bold' : 'text-slate-300'}>{m.currentHash}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Selected Block Details Modal */}
      {selectedBlock && (() => {
        const modalTheme = getMinerTheme(selectedBlock.minerName, selectedBlock.index);
        const isLeadingModalBlock = selectedBlock.index === blockchain[blockchain.length - 1]?.index && blockchain.length > 1;

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0C0F14] border border-slate-800 rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded border font-bold ${modalTheme.badge}`}>
                    Block #{selectedBlock.index}
                  </span>
                  <h3 className="text-base font-display font-bold text-white">
                    {selectedBlock.index === 0 ? 'Genesis Block' : selectedBlock.minerName}
                  </h3>
                  {isLeadingModalBlock && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-black">
                      ★ {isVi ? 'Khối Dẫn Đầu' : 'Leading Tip'}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedBlock(null)} 
                  className="text-slate-500 hover:text-white cursor-pointer"
                >
                  <X size={18}/>
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="bg-[#11161D] p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{isVi ? 'Thợ đào:' : 'Miner:'}</span>
                    <span className="flex items-center gap-2 font-bold font-sans">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: modalTheme.primary }} />
                      <span className={modalTheme.text}>{selectedBlock.minerName}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isVi ? 'Thời gian:' : 'Timestamp:'}</span>
                    <span className="text-slate-300">{selectedBlock.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isVi ? 'Độ khó:' : 'Difficulty:'}</span>
                    <span className="text-emerald-400 font-bold">{selectedBlock.difficulty}</span>
                  </div>
                  {selectedBlock.nonce !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isVi ? 'Nonce hợp lệ:' : 'Winning Nonce:'}</span>
                      <span className="text-white font-bold">{selectedBlock.nonce.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-display font-bold uppercase tracking-wider block mb-1">
                    SHA-256 Hash
                  </label>
                  <div className="bg-[#11161D] p-2.5 rounded-xl border border-slate-800 text-[11px] text-emerald-400 break-all select-all">
                    {selectedBlock.hash}
                  </div>
                </div>

                {selectedBlock.prevHash && (
                  <div>
                    <label className="text-[10px] text-slate-500 font-display font-bold uppercase tracking-wider block mb-1">
                      {isVi ? 'Hash Khối Trước' : 'Previous Block Hash'}
                    </label>
                    <div className="bg-[#11161D] p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 break-all select-all">
                      {selectedBlock.prevHash}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="w-full py-2 bg-[#11161D] hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                >
                  {isVi ? 'Đóng' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Simulation Code Modal */}
      <SimulationCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        activeExecutionState={appState === 'mining' ? 'mining' : appState === 'animating_win' ? 'winner' : 'idle'}
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #090A0F;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1C2430;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}} />
    </div>
  );
};
