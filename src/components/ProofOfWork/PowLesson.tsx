/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, RotateCcw, CheckCircle2, Plus, X, Pause, Clock, Activity, 
  FileText, Trophy, Trash2, Code2, Info, Check, ShieldCheck
} from 'lucide-react';
import { createMiningWorkerBlob } from '../../utils/miningWorker';
import { useLanguage } from '../../i18n/LanguageContext';
import { SimulationCodeModal } from './SimulationCodeModal';

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
  status: 'idle' | 'mining' | 'winner' | 'error';
  blocksWon: number;
}

interface BlockRecord {
  index: number;
  hash: string;
  minerName: string;
  timestamp: string;
  difficulty: number;
}

interface LogEvent {
  id: string;
  time: string;
  message: string;
}

function getWorkerConfig(power: number) {
  const norm = Math.max(1, Math.min(100, power));
  // Batch size and throttle scaled with power to ensure distinct hardware speeds
  // while computing 100% genuine SHA-256 hashes inside Web Worker
  const batchSize = Math.max(30, Math.round(norm * 14));
  const speedThrottleMs = Math.max(2, Math.round(22 - (norm / 100) * 19));
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
  const [difficulty, setDifficulty] = useState<number>(3);
  
  const [miners, setMiners] = useState<MinerVisual[]>([]);
  const [blockchain, setBlockchain] = useState<BlockRecord[]>([]);
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [showCodeModal, setShowCodeModal] = useState(false);
  
  const [showAddMiner, setShowAddMiner] = useState(false);
  const [newMinerName, setNewMinerName] = useState('');
  const [newMinerType, setNewMinerType] = useState<'CPU'|'GPU'|'ASIC'|'Quantum'>('GPU');
  const [newMinerPower, setNewMinerPower] = useState(50);

  const workersRef = useRef<Record<string, Worker>>({});
  const blobUrlRef = useRef<string | null>(null);
  const intendedStateRef = useRef<'mining' | 'paused'>('mining');
  const isHandlingWinnerRef = useRef(false);

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
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, [terminateWorkers]);

  const handleReset = useCallback(() => {
    terminateWorkers();
    isHandlingWinnerRef.current = false;
    setAppState('idle');
    setRemainingTime(duration);
    setBlockchain([{ 
      index: 0, 
      hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f', 
      minerName: 'Satoshi', 
      timestamp: '00:00', 
      difficulty: 0 
    }]);
    setLogs([]);
    addLog(isVi ? 'Đã khởi tạo lại hệ thống.' : 'System reset.');
    setMiners(prev => prev.map(m => ({ 
      ...m, 
      hashrate: 0, 
      attempts: 0, 
      blocksWon: 0,
      currentNonce: Math.floor(Math.random() * 50000), 
      currentHash: '----------------------------------------------------------------', 
      status: 'idle' 
    })));
  }, [duration, isVi, addLog, terminateWorkers]);

  useEffect(() => {
    if (scenario === 'normal') {
      setMiners([
        { id: 'alice', name: 'Alice', type: 'CPU', colorClass: 'slate', power: 10, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: Math.floor(Math.random() * 10000), currentHash: '----------------------------------------------------------------', status: 'idle' },
        { id: 'bob', name: 'Bob', type: 'GPU', colorClass: 'blue', power: 40, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: 20000 + Math.floor(Math.random() * 10000), currentHash: '----------------------------------------------------------------', status: 'idle' },
        { id: 'charlie', name: 'Charlie', type: 'ASIC', colorClass: 'amber', power: 80, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: 50000 + Math.floor(Math.random() * 10000), currentHash: '----------------------------------------------------------------', status: 'idle' },
        { id: 'dave', name: 'Dave', type: 'Quantum', colorClass: 'rose', power: 100, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: 90000 + Math.floor(Math.random() * 10000), currentHash: '----------------------------------------------------------------', status: 'idle' },
      ]);
    } else if (scenario === 'attack51') {
      setMiners([
        { id: 'alice', name: 'Alice', type: 'CPU', colorClass: 'slate', power: 5, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: Math.floor(Math.random() * 10000), currentHash: '----------------------------------------------------------------', status: 'idle' },
        { id: 'bob', name: 'Bob', type: 'GPU', colorClass: 'blue', power: 10, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: 20000 + Math.floor(Math.random() * 10000), currentHash: '----------------------------------------------------------------', status: 'idle' },
        { id: 'charlie-pool', name: '51% Attacker Pool', type: 'ASIC', colorClass: 'rose', power: 95, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: 50000 + Math.floor(Math.random() * 10000), currentHash: '----------------------------------------------------------------', status: 'idle' },
      ]);
    } else if (scenario === 'hashrate') {
      setMiners([
        { id: 'miner-1', name: 'Custom Miner 1', type: 'ASIC', colorClass: 'emerald', power: 50, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: Math.floor(Math.random() * 10000), currentHash: '----------------------------------------------------------------', status: 'idle' },
        { id: 'miner-2', name: 'Custom Miner 2', type: 'ASIC', colorClass: 'blue', power: 50, hashrate: 0, attempts: 0, blocksWon: 0, currentNonce: 30000 + Math.floor(Math.random() * 10000), currentHash: '----------------------------------------------------------------', status: 'idle' },
      ]);
    }
    
    terminateWorkers();
    isHandlingWinnerRef.current = false;
    setAppState('idle');
    setBlockchain([{ 
      index: 0, 
      hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f', 
      minerName: 'Satoshi', 
      timestamp: '00:00', 
      difficulty: 0 
    }]);
    setLogs([{ id: Date.now().toString(), time: new Date().toISOString().substring(11, 19), message: `Scenario switched to ${scenario}.` }]);
  }, [scenario, terminateWorkers]);

  useEffect(() => {
    if (appState === 'idle') {
      setRemainingTime(duration);
    }
  }, [duration, appState]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (appState === 'mining' || appState === 'animating_win') {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setAppState('completed');
            terminateWorkers();
            addLog(isVi ? '■ Hết thời gian. Mô phỏng hoàn tất.' : '■ Time expired. Simulation completed.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [appState, addLog, isVi, terminateWorkers]);

  const handleWinner = useCallback((msg: any) => { 
    if (appStateRef.current !== 'mining' || isHandlingWinnerRef.current) return; 
    isHandlingWinnerRef.current = true;
    appStateRef.current = 'animating_win'; 
    terminateWorkers();
    
    setAppState('animating_win');
    
    setMiners(prev => prev.map(m => m.id === msg.minerId 
      ? { 
          ...m, 
          hashrate: msg.hashrate || m.hashrate, 
          currentHash: msg.hash, 
          currentNonce: msg.nonce, 
          status: 'winner', 
          attempts: msg.attempts,
          blocksWon: (m.blocksWon || 0) + 1
        } 
      : { 
          ...m, 
          // Preserve measured hashrate
          hashrate: m.hashrate,
          status: 'idle' 
        }
    ));
    
    const minerName = minersRef.current.find(m => m.id === msg.minerId)?.name || msg.minerId;
    const nextBlockIndex = blockchainRef.current.length;
    addLog(`✓ ${minerName} ${isVi ? 'giải khối thành công' : 'solved block successfully'} (Nonce: ${msg.nonce.toLocaleString()})`);
    
    setTimeout(() => {
      const newBlock: BlockRecord = {
        index: nextBlockIndex,
        hash: msg.hash,
        minerName: minerName,
        timestamp: formatTime(duration - remainingTimeRef.current),
        difficulty: difficultyRef.current
      };
      
      setBlockchain(prev => {
        // Prevent duplicate block indexes
        if (prev.some(b => b.index === newBlock.index)) return prev;
        return [...prev, newBlock];
      });
      addLog(`Block #${newBlock.index} ${isVi ? 'đã nối vào chuỗi thành công.' : 'successfully appended to blockchain.'}`);
      
      setTimeout(() => {
        isHandlingWinnerRef.current = false;
        if (appStateRef.current !== 'completed') {
          setMiners(prev => prev.map(m => ({ 
            ...m, 
            status: 'idle', 
            // Preserve measured hashrate
            hashrate: m.hashrate, 
            currentNonce: m.currentNonce + 1, 
            currentHash: '----------------------------------------------------------------' 
          })));
          
          if (intendedStateRef.current === 'mining' && remainingTimeRef.current > 0) {
            setAppState('mining');
          } else if (intendedStateRef.current === 'paused') {
            setAppState('paused');
          }
        }
      }, 1200);
    }, 1000);
  }, [addLog, duration, isVi, terminateWorkers]);

  useEffect(() => {
    if (appState === 'mining') {
      if (!blobUrlRef.current) {
        blobUrlRef.current = createMiningWorkerBlob();
      }
      terminateWorkers();
      
      const targetPrefix = '0'.repeat(difficultyRef.current);
      const currentBlocks = blockchainRef.current.length;
      
      minersRef.current.forEach(m => {
        const worker = new Worker(blobUrlRef.current!);
        workersRef.current[m.id] = worker;
        
        worker.onmessage = (e) => {
          const msg = e.data;
          if (msg.type === 'TELEMETRY') {
            setMiners(prev => prev.map(prevM => prevM.id === msg.minerId ? {
              ...prevM, 
              hashrate: msg.hashrate || prevM.hashrate, 
              attempts: msg.attempts, 
              currentNonce: msg.currentNonce, 
              currentHash: msg.currentHash,
              status: 'mining'
            } : prevM));
          } else if (msg.type === 'WINNER') {
            handleWinner(msg);
          }
        };
        
        const config = getWorkerConfig(m.power);
        worker.postMessage({
          type: 'START',
          config: {
            minerId: m.id,
            headerPrefix: `block-${currentBlocks}-${m.id}:`,
            startNonce: m.currentNonce,
            step: 1,
            targetPrefix,
            batchSize: config.batchSize,
            speedThrottleMs: config.speedThrottleMs,
            continuous: false,
            startAttempts: m.attempts
          }
        });
      });
    } else {
      terminateWorkers();
    }
  }, [appState, handleWinner, terminateWorkers]);

  const handleStart = () => {
    intendedStateRef.current = 'mining';
    setAppState('mining');
    addLog(isVi ? '● Bắt đầu cuộc đua khai thác...' : '● Mining race started...');
  };

  const handlePause = () => {
    intendedStateRef.current = 'paused';
    setAppState('paused');
    terminateWorkers();
    // Preserve measured hashrate instead of wiping to 0
    setMiners(prev => prev.map(m => ({ ...m, status: 'idle' })));
    addLog(isVi ? '⏸ Đã tạm dừng mô phỏng.' : '⏸ Simulation paused.');
  };
  
  const handleAddMinerSubmit = () => {
    if (!newMinerName.trim()) return;
    const id = `miner-${Date.now()}`;
    setMiners(prev => [...prev, {
      id,
      name: newMinerName,
      type: newMinerType,
      colorClass: newMinerType === 'Quantum' ? 'rose' : newMinerType === 'ASIC' ? 'amber' : newMinerType === 'GPU' ? 'blue' : 'slate',
      power: newMinerPower,
      hashrate: 0,
      attempts: 0,
      blocksWon: 0,
      currentNonce: Math.floor(Math.random() * 50000),
      currentHash: '----------------------------------------------------------------',
      status: 'idle'
    }]);
    setShowAddMiner(false);
    setNewMinerName('');
    setNewMinerPower(50);
    addLog(`${isVi ? 'Đã thêm thợ đào' : 'Added miner'}: ${newMinerName}`);
  };

  const handleRemoveMiner = (id: string) => {
    if (miners.length <= 1) return;
    setMiners(prev => prev.filter(m => m.id !== id));
    addLog(isVi ? 'Đã xóa thợ đào.' : 'Miner removed.');
  };

  const getMinerAvatar = (type: string) => {
    switch (type) {
      case 'CPU': return '🧑‍💻';
      case 'GPU': return '🥷';
      case 'ASIC': return '🤖';
      case 'Quantum': return '👽';
      default: return '🧑';
    }
  };

  const getMinerStatusText = (miner: MinerVisual, currentAppState: AppState) => {
    if (miner.status === 'winner') {
      return (
        <span className="text-emerald-400 flex items-center gap-1 font-semibold text-xs">
          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> 
          {isVi ? 'Giải khối thành công' : 'Block solved successfully'}
        </span>
      );
    }
    if (currentAppState === 'completed') {
      if (miner.blocksWon > 0) {
        return (
          <span className="text-emerald-400 flex items-center gap-1 font-semibold text-xs">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> 
            {isVi ? `Giải khối thành công (${miner.blocksWon})` : `Block solved (${miner.blocksWon})`}
          </span>
        );
      }
      return (
        <span className="text-slate-400 text-[11px] leading-tight text-right block" title={isVi ? 'Không tìm thấy trong thời gian mô phỏng' : 'No block found during simulation'}>
          {isVi ? 'Không tìm thấy trong thời gian mô phỏng' : 'No block found in time'}
        </span>
      );
    }
    if (currentAppState === 'mining') {
      return (
        <span className="text-emerald-400 flex items-center gap-1.5 font-medium text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          {isVi ? 'Đang khai thác' : 'Mining'}
        </span>
      );
    }
    if (miner.status === 'error') {
      return (
        <span className="text-red-400 flex items-center gap-1 text-xs">
          <X size={13} /> {isVi ? 'Lỗi' : 'Error'}
        </span>
      );
    }
    return (
      <span className="text-slate-500 flex items-center gap-1 text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" /> {isVi ? 'Đang chờ' : 'Idle'}
      </span>
    );
  };

  const totalBlocksMined = blockchain.length - 1;

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        
        {/* Header & Scenarios */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                POW CONSENSUS · REAL WEB WORKERS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              {isVi ? 'Phòng Khai Thác Proof of Work' : 'Proof of Work Mining Laboratory'}
            </h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm">
              {isVi 
                ? 'Thử nghiệm cơ chế Proof of Work với Web Workers đa luồng và đo lường Hashrate thực tế.' 
                : 'Experiment with multi-threaded Web Worker Proof of Work and real-time Hashrate telemetry.'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-[#0D1117] p-1 rounded-xl border border-slate-800 shrink-0 overflow-x-auto no-scrollbar">
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
              className="p-2 bg-[#0D1117] hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shrink-0"
              title={isVi ? 'Xem mã nguồn thuật toán' : 'View algorithm code'}
            >
              <Code2 size={16} />
              <span className="hidden sm:inline">{isVi ? 'Mã Nguồn' : 'Code'}</span>
            </button>
          </div>
        </header>

        {/* Compact Controls Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Duration */}
          <div className="p-4 bg-[#0C0F14] rounded-xl border border-slate-800/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[11px] text-slate-400 font-display font-bold uppercase tracking-wider block">
                {isVi ? 'Thời gian mô phỏng' : 'Simulation Duration'}
              </label>
              <span className="text-xs font-mono tabular-nums text-slate-400 font-semibold">{duration}s</span>
            </div>
            <div className="flex gap-2">
              {[30, 45, 60].map(val => (
                <button 
                  key={val}
                  onClick={() => setDuration(val)}
                  disabled={appState !== 'idle' && appState !== 'completed'}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono tabular-nums font-semibold transition-all ${
                    duration === val 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-[#11161D] text-slate-400 border border-slate-800 hover:border-slate-700'
                  } disabled:opacity-50 cursor-pointer`}
                >
                  {val === 60 ? '1 min' : `${val}s`}
                </button>
              ))}
            </div>
          </div>
          
          {/* Difficulty */}
          <div className="p-4 bg-[#0C0F14] rounded-xl border border-slate-800/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[11px] text-slate-400 font-display font-bold uppercase tracking-wider block">
                {isVi ? 'Độ khó (Difficulty)' : 'Mining Difficulty'}
              </label>
              <span className="text-xs font-mono tabular-nums text-emerald-400 font-bold">
                "{'0'.repeat(difficulty)}..."
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(val => (
                <button 
                  key={val}
                  onClick={() => setDifficulty(val)}
                  disabled={appState !== 'idle' && appState !== 'completed'}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono tabular-nums font-semibold transition-all ${
                    difficulty === val 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-[#11161D] text-slate-400 border border-slate-800 hover:border-slate-700'
                  } disabled:opacity-50 cursor-pointer`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
          
          {/* Execution Controls & Compact Timer */}
          <div className="p-4 bg-[#0C0F14] rounded-xl border border-slate-800/90 shadow-sm flex items-center justify-between gap-3 sm:col-span-2 lg:col-span-1">
            {/* Elegant Compact Timer */}
            <div className="flex items-center gap-2 bg-[#11161D] border border-slate-800 px-3.5 py-2 rounded-xl shrink-0" title={isVi ? 'Thời gian còn lại' : 'Remaining time'}>
              <Clock size={15} className={appState === 'mining' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'} />
              <span className={`font-mono tabular-nums font-bold text-base ${appState === 'mining' ? 'text-white' : 'text-slate-300'}`}>
                {formatTime(remainingTime)}
              </span>
            </div>

            {/* Start / Pause / Resume & Reset */}
            <div className="flex gap-2 flex-1">
              {appState === 'idle' ? (
                <button 
                  onClick={handleStart} 
                  disabled={miners.length === 0} 
                  className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-display font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Play size={15} className="fill-current" /> {isVi ? 'Bắt Đầu' : 'Start'}
                </button>
              ) : appState === 'completed' ? (
                <button 
                  onClick={handleReset} 
                  className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-display font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <RotateCcw size={15} /> {isVi ? 'Chạy Lại' : 'Run Again'}
                </button>
              ) : appState === 'mining' ? (
                <button 
                  onClick={handlePause} 
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black font-display font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Pause size={15} className="fill-current" /> {isVi ? 'Tạm Dừng' : 'Pause'}
                </button>
              ) : (
                <button 
                  onClick={handleStart} 
                  disabled={appState === 'animating_win'} 
                  className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-display font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Play size={15} className="fill-current" /> {isVi ? 'Tiếp Tục' : 'Resume'}
                </button>
              )}
              
              <button 
                onClick={handleReset} 
                className="px-3.5 py-2 bg-[#11161D] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                title={isVi ? 'Khởi tạo lại' : 'Reset'}
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* TARGET & TELEMETRY — Responsive Lifecycle */}
        {appState === 'completed' ? (
          /* COMPLETED: Sleek, compact single-line telemetry row to eliminate dead space */
          <div className="bg-[#0C0F14] border border-slate-800/80 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-display font-bold text-slate-400 uppercase tracking-wider">Target:</span>
              <span className="text-emerald-400 font-bold">{'0'.repeat(difficulty)}</span>
              <span className="text-slate-600">{'x'.repeat(Math.min(24, 64 - difficulty))}...</span>
              <span className="text-slate-600">·</span>
              <span>{isVi ? 'Độ khó' : 'Difficulty'}: <strong className="text-white font-bold">{difficulty}</strong></span>
              <span className="text-slate-600">·</span>
              <span>{isVi ? 'Tiền tố' : 'Prefix'}: <strong className="text-emerald-400 font-mono">"{'0'.repeat(difficulty)}"</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={12} />
                {isVi ? 'Mô phỏng hoàn tất' : 'Simulation Completed'}
              </span>
            </div>
          </div>
        ) : (
          /* IDLE / RUNNING / PAUSED: Compact Target Strip */
          <div className="bg-[#0C0F14] border border-slate-800/90 rounded-xl px-4 py-2.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Target Visual String */}
            <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
              <span className="text-[10px] sm:text-xs font-display font-bold text-slate-400 uppercase tracking-wider shrink-0">
                TARGET:
              </span>
              <div 
                className="font-mono tracking-widest text-[11px] sm:text-xs bg-[#11161D] px-3 py-1 rounded-lg border border-slate-800/80 flex items-center overflow-x-auto no-scrollbar max-w-full"
                title={isVi ? 'Hash phải bắt đầu bằng số 0 theo độ khó đã chọn.' : 'Hash must start with leading zero(s) matching the chosen difficulty.'}
              >
                <span className="text-emerald-400 font-bold">{'0'.repeat(difficulty)}</span>
                <span className="text-slate-600">{'x'.repeat(64 - difficulty)}</span>
              </div>
            </div>

            {/* Telemetry Metrics & Status */}
            <div className="flex items-center gap-4 sm:gap-5 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-slate-800/60 pt-2 md:pt-0">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-display font-bold text-[10px] sm:text-xs uppercase">
                  {isVi ? 'ĐỘ KHÓ:' : 'DIFFICULTY:'}
                </span>
                <span className="font-mono tabular-nums font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-xs">
                  {difficulty}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                <span className="text-slate-500 font-display font-bold text-[10px] sm:text-xs uppercase">
                  {isVi ? 'YÊU CẦU:' : 'REQUIRED PREFIX:'}
                </span>
                <span className="font-mono text-xs text-slate-300 font-medium">
                  "{'0'.repeat(difficulty)}"
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-display font-bold text-[10px] sm:text-xs uppercase">
                  {isVi ? 'TRẠNG THÁI:' : 'STATUS:'}
                </span>
                {appState === 'mining' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ● {isVi ? 'Đang Khai Thác' : 'Mining'}
                  </span>
                ) : appState === 'animating_win' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 size={12} />
                    {isVi ? 'Giải khối thành công' : 'Block Solved'}
                  </span>
                ) : appState === 'paused' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    ⏸ {isVi ? 'Tạm Dừng' : 'Paused'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-400 border border-slate-700">
                    ○ {isVi ? 'Sẵn Sàng' : 'Ready'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Miner Lanes (Cuộc Đua Khai Thác) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-display font-bold text-slate-300 tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {isVi ? 'CUỘC ĐUA KHAI THÁC (MINING ARENA)' : 'MINING RACE ARENA'}
            </h3>
            {scenario === 'normal' && miners.length < 6 && (appState === 'idle' || appState === 'completed') && (
              <button 
                onClick={() => setShowAddMiner(true)} 
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 font-sans px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus size={14} /> {isVi ? 'Thêm Thợ Đào' : 'Add Miner'}
              </button>
            )}
          </div>

          {miners.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center text-slate-500 bg-[#0C0F14]">
              <p className="mb-3 text-sm">{isVi ? 'Không có thợ đào nào.' : 'No miners available.'}</p>
              <button 
                onClick={() => setShowAddMiner(true)} 
                className="px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-lg flex items-center gap-2 hover:bg-emerald-400"
              >
                <Plus size={15}/> {isVi ? 'Thêm Thợ Đào' : 'Add Miner'}
              </button>
            </div>
          ) : miners.map(m => (
            <div 
              key={m.id} 
              className={`relative p-4 rounded-xl border transition-all duration-300 ${
                m.status === 'winner' 
                  ? 'bg-[#0A140F] border-emerald-500/50 shadow-[0_0_24px_rgba(16,185,129,0.12)]' 
                  : appState === 'completed' && m.blocksWon > 0
                  ? 'bg-[#0C1210] border-emerald-500/30'
                  : 'bg-[#0C0F14] border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 relative z-10">
                {/* Miner Identity */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <span className="text-2xl filter grayscale contrast-125">{getMinerAvatar(m.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-white text-base leading-tight">{m.name}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {m.type}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 bg-[#090A0F] h-1.5 rounded-full overflow-hidden border border-slate-800 max-w-[120px]">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-300" 
                          style={{ width: `${m.power}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-mono tabular-nums text-slate-400">{m.power}%</span>
                    </div>
                  </div>
                </div>

                {/* Activity Lane (Real-Time Nonce & Hash) */}
                <div className="flex-1 h-11 bg-[#090A0F] rounded-xl border border-slate-800/90 overflow-hidden relative flex items-center px-4 shadow-inner min-w-0">
                  {appState === 'mining' && m.status !== 'winner' && (
                    <div 
                      className="absolute inset-0 opacity-20 mix-blend-screen" 
                      style={{
                        background: `linear-gradient(90deg, transparent, rgba(16, 185, 129, 1) 50%, transparent)`,
                        width: '40%',
                        animation: `scan ${Math.max(0.3, 1500 / (m.hashrate || 100))}s linear infinite`
                      }} 
                    />
                  )}
                  {(m.status === 'winner' || (appState === 'completed' && m.blocksWon > 0)) && (
                    <div className="absolute inset-0 bg-emerald-500/10" />
                  )}
                  
                  <div className="relative z-10 flex w-full justify-between items-center text-xs font-mono tabular-nums text-slate-400 gap-3">
                    <span className="truncate shrink-0 font-medium">
                      Nonce: <span className="text-white font-bold">{m.currentNonce.toLocaleString()}</span>
                    </span>
                    <span className={`truncate font-mono text-[11px] sm:text-xs transition-colors duration-200 ${
                      m.status === 'winner' || (appState === 'completed' && m.blocksWon > 0) ? 'text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      Hash: {m.status === 'winner' 
                        ? m.currentHash 
                        : m.currentHash.length > 28 
                          ? m.currentHash.substring(0, 10) + '...' + m.currentHash.substring(m.currentHash.length - 8)
                          : m.currentHash
                      }
                    </span>
                  </div>
                </div>

                {/* Real-time Mining Stats - MUST REMAIN MEANINGFUL AFTER STOP/COMPLETE */}
                <div className="flex items-center justify-between xl:justify-end gap-4 sm:gap-5 min-w-[320px] border-t xl:border-t-0 border-slate-800/60 pt-2 xl:pt-0">
                  {/* Real Hashrate (Preserved after completion) */}
                  <div className="text-left xl:text-right w-24">
                    <div className="text-[10px] text-slate-500 font-display font-bold uppercase tracking-wider">
                      {isVi ? 'Tốc độ' : 'Hashrate'}
                    </div>
                    <div className="font-mono tabular-nums text-emerald-400 font-bold text-xs sm:text-sm">
                      {(m.hashrate || 0).toLocaleString()} H/s
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
                  
                  {/* Miner Status Badge & Actions */}
                  <div className="flex items-center justify-end w-44 border-l border-slate-800/80 pl-3">
                    <div className="text-xs font-sans font-medium flex-1 text-right">
                      {getMinerStatusText(m, appState)}
                    </div>
                    {miners.length > 1 && (appState === 'idle' || appState === 'completed') && (
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
          ))}
        </div>

        {/* COMPLETION SUMMARY CARD (When simulation reaches 00:00) */}
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
                  <p className="text-xs text-slate-400 mt-0.5">
                    {duration}s · {totalBlocksMined} {isVi ? 'Khối đã khai thác' : 'Blocks mined'} · {miners.length} {isVi ? 'Thợ đào tham gia' : 'Miners'}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleReset} 
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-display font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
              >
                <RotateCcw size={14} /> {isVi ? 'Chạy Lại Thử Nghiệm' : 'Run Experiment Again'}
              </button>
            </div>

            {/* Core Takeaway & Winner breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Winner Ranking */}
              <div className="p-3.5 bg-[#11161D] rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-display font-bold text-slate-400 uppercase tracking-wider block">
                  {isVi ? 'Kết Quả Từng Thợ Đào' : 'Miner Results Breakdown'}
                </span>
                <div className="space-y-1.5 text-xs">
                  {miners.map(m => (
                    <div key={m.id} className="flex items-center justify-between py-1 border-b border-slate-800/50 last:border-0 font-mono">
                      <span className="text-slate-300 font-sans font-medium flex items-center gap-1.5">
                        {getMinerAvatar(m.type)} {m.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-[11px]">{(m.hashrate || 0).toLocaleString()} H/s</span>
                        {m.blocksWon > 0 ? (
                          <span className="text-emerald-400 font-bold font-sans text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {m.blocksWon} {isVi ? 'khối' : 'blocks'}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-sans text-[11px]">
                            0 {isVi ? 'khối' : 'blocks'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Takeaway */}
              <div className="p-3.5 bg-[#11161D] rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-display font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Info size={14} /> {isVi ? 'Bài Học Cốt Lõi' : 'Core Takeaway'}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isVi 
                      ? 'Hashrate cao hơn làm tăng xác suất toán học để tìm được Block trước. Tuy nhiên hàm băm SHA-256 có tính xác suất ngẫu nhiên cao, do đó miner có hashrate thấp vẫn có cơ hội giải khối thành công trước miner mạnh hơn.' 
                      : 'Higher hashrate increases the mathematical probability of finding a block first. However, SHA-256 is strictly probabilistic, allowing lower-hashrate miners a genuine chance to find solutions ahead of more powerful rigs.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Blockchain Timeline */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs sm:text-sm font-display font-bold text-slate-300 tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {isVi ? 'CHUỖI KHỐI ĐÃ KHAI THÁC (BLOCKCHAIN TIMELINE)' : 'BLOCKCHAIN TIMELINE'}
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {isVi ? `Tổng số khối: ${blockchain.length}` : `Total blocks: ${blockchain.length}`}
            </span>
          </div>

          <div className="flex overflow-x-auto pb-3 gap-3 items-center no-scrollbar px-1">
            {blockchain.map((block, idx) => (
              <React.Fragment key={`${block.index}-${block.hash}`}>
                <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0C0F14] flex flex-col items-center min-w-[150px] shadow-md shrink-0">
                  <span className="text-[10px] font-mono tabular-nums text-slate-500">Block #{block.index}</span>
                  <span className="font-display font-bold text-white text-base my-0.5">
                    {block.index === 0 ? 'GENESIS' : block.minerName}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {block.hash.substring(0, 10)}...
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 mt-1">{block.timestamp}</span>
                </div>
                {idx < blockchain.length - 1 && (
                  <div className="w-8 h-px bg-slate-700 relative shrink-0">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-[3px] border-y-transparent border-l-[5px] border-l-slate-500" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Live Logs & Technical Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1 border-t border-slate-800/60">
          <div className="p-4 rounded-xl border border-slate-800/90 bg-[#0C0F14]">
            <h3 className="text-xs sm:text-sm font-display font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Activity size={15} className="text-emerald-400"/> 
              {isVi ? 'Nhật Ký Sự Kiện Khai Thác' : 'Mining Event Log'}
            </h3>
            <div className="h-[180px] overflow-y-auto font-mono tabular-nums text-xs text-slate-400 space-y-1.5 pr-2 custom-scrollbar">
              {logs.map(log => (
                <div key={log.id} className="flex gap-2.5">
                  <span className="text-slate-500 shrink-0">[{log.time}]</span>
                  <span className={log.message.includes('✓') ? 'text-emerald-400 font-bold' : log.message.includes('■') ? 'text-amber-400 font-bold' : ''}>
                    {log.message}
                  </span>
                </div>
              ))}
              {logs.length === 0 && <div className="text-slate-600 italic">No events yet.</div>}
            </div>
          </div>
          
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
                    <span>Diff: {difficulty} | Power: {m.power}% | Speed: {m.hashrate.toLocaleString()} H/s</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Nonce: <span className="text-white font-semibold">{m.currentNonce.toLocaleString()}</span></div>
                    <div className="text-right">Attempts: <span className="text-white font-semibold">{m.attempts.toLocaleString()}</span></div>
                  </div>
                  <div className="truncate text-slate-500 text-[10px] mt-0.5">
                    Hash: <span className={m.status === 'winner' || (appState === 'completed' && m.blocksWon > 0) ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{m.currentHash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Add Miner Modal */}
      {showAddMiner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#0C0F14] border border-slate-800 rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-display font-bold text-white">{isVi ? 'Thêm Thợ Đào Mới' : 'Add New Miner'}</h3>
              <button onClick={() => setShowAddMiner(false)} className="text-slate-500 hover:text-white cursor-pointer"><X size={18}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">{isVi ? 'Tên thợ đào' : 'Miner Name'}</label>
                <input 
                  type="text" 
                  value={newMinerName} 
                  onChange={e => setNewMinerName(e.target.value)} 
                  placeholder="e.g. David, Node-X" 
                  className="w-full bg-[#11161D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors" 
                />
              </div>
              
              <div>
                <label className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">{isVi ? 'Loại phần cứng' : 'Hardware Type'}</label>
                <div className="flex gap-2">
                  {(['CPU', 'GPU', 'ASIC', 'Quantum'] as const).map(t => (
                    <button 
                      key={t} 
                      onClick={() => setNewMinerType(t)} 
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                        newMinerType === t 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-[#11161D] text-slate-400 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">{isVi ? 'Sức mạnh (Hashpower)' : 'Hashpower'}</label>
                  <span className="text-xs font-mono tabular-nums text-emerald-400 font-bold">{newMinerPower}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={newMinerPower} 
                  onChange={e => setNewMinerPower(parseInt(e.target.value))} 
                  className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500" 
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={handleAddMinerSubmit} 
                disabled={!newMinerName.trim()} 
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-display font-bold text-sm rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                {isVi ? 'Thêm Vào Cuộc Đua' : 'Add to Race'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Code Modal */}
      <SimulationCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        activeExecutionState={appState === 'mining' ? 'mining' : appState === 'animating_win' ? 'winner' : 'idle'}
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
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
