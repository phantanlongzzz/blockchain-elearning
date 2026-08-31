import React, { useState, useMemo } from 'react';
import {
  Globe,
  Server,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Flame,
  Layers,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface NetworkTopologyExplorerProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
  onPrevStage?: () => void;
  isHandsOn?: boolean;
}

type TopologyMode = 'centralized' | 'distributed' | 'decentralized';

interface DistributedWorker {
  id: string;
  nameVi: string;
  nameEn: string;
  taskVi: string;
  taskEn: string;
  baseLoad: number;
  isOnline: boolean;
  resourceAllocation: string;
}

interface DecentralizedPeer {
  id: string;
  name: string;
  x: number;
  y: number;
  isOnline: boolean;
  peerConnections: string[];
}

export const NetworkTopologyExplorer: React.FC<NetworkTopologyExplorerProps> = ({
  onInteracted,
  onNextStage,
  onPrevStage,
}) => {
  const { language } = useLanguage();
  const [topology, setTopology] = useState<TopologyMode>('centralized');

  // Track visited topologies to reveal the critical thinking challenge
  const [visitedTopologies, setVisitedTopologies] = useState<Set<TopologyMode>>(
    new Set(['centralized'])
  );

  // ==========================================
  // 1. CENTRALIZED STATE
  // ==========================================
  const [isCentralServerOnline, setIsCentralServerOnline] = useState<boolean>(true);

  // ==========================================
  // 2. DISTRIBUTED STATE
  // ==========================================
  const [workers, setWorkers] = useState<DistributedWorker[]>([
    {
      id: 'w_a',
      nameVi: 'Nút xử lý A',
      nameEn: 'Worker Node A',
      taskVi: 'Tác vụ 1: Xử lý dữ liệu',
      taskEn: 'Task 1: Data processing',
      baseLoad: 40,
      isOnline: true,
      resourceAllocation: '4 Cores · 8GB RAM',
    },
    {
      id: 'w_b',
      nameVi: 'Nút xử lý B',
      nameEn: 'Worker Node B',
      taskVi: 'Tác vụ 2: Kết xuất hình ảnh',
      taskEn: 'Task 2: Image rendering',
      baseLoad: 50,
      isOnline: true,
      resourceAllocation: '8 Cores · 16GB RAM',
    },
    {
      id: 'w_c',
      nameVi: 'Nút xử lý C',
      nameEn: 'Worker Node C',
      taskVi: 'Tác vụ 3: Truy vấn chỉ mục',
      taskEn: 'Task 3: Index query',
      baseLoad: 45,
      isOnline: true,
      resourceAllocation: '4 Cores · 8GB RAM',
    },
    {
      id: 'w_d',
      nameVi: 'Nút xử lý D',
      nameEn: 'Worker Node D',
      taskVi: 'Tác vụ 4: Suy luận mô hình',
      taskEn: 'Task 4: Model inference',
      baseLoad: 60,
      isOnline: true,
      resourceAllocation: '12 Cores · 32GB RAM',
    },
  ]);
  const [failoverMessage, setFailoverMessage] = useState<string | null>(null);

  // ==========================================
  // 3. DECENTRALIZED STATE (P2P Mesh)
  // ==========================================
  const [peers, setPeers] = useState<DecentralizedPeer[]>([
    {
      id: 'p_alice',
      name: 'Alice',
      x: 20,
      y: 28,
      isOnline: true,
      peerConnections: ['p_bob', 'p_charlie'],
    },
    {
      id: 'p_bob',
      name: 'Bob',
      x: 80,
      y: 28,
      isOnline: true,
      peerConnections: ['p_alice', 'p_dave'],
    },
    {
      id: 'p_charlie',
      name: 'Charlie',
      x: 24,
      y: 75,
      isOnline: true,
      peerConnections: ['p_alice', 'p_dave'],
    },
    {
      id: 'p_dave',
      name: 'Dave',
      x: 76,
      y: 75,
      isOnline: true,
      peerConnections: ['p_bob', 'p_charlie'],
    },
  ]);

  // ==========================================
  // 4. QUIZ STATE
  // ==========================================
  const [quizAnswer, setQuizAnswer] = useState<'yes' | 'no' | null>(null);

  // Mode switcher handler
  const handleSelectTopology = (mode: TopologyMode) => {
    setTopology(mode);
    setVisitedTopologies((prev) => new Set([...prev, mode]));
    onInteracted?.();
  };

  // Centralized handlers
  const handleToggleCentralServer = () => {
    setIsCentralServerOnline((prev) => !prev);
    onInteracted?.();
  };

  // Distributed handlers
  const handleAddWorker = () => {
    if (workers.length >= 6) return;
    const pool = [
      {
        nameVi: 'Nút xử lý E',
        nameEn: 'Worker Node E',
        taskVi: 'Tác vụ 5: Bộ nhớ đệm',
        taskEn: 'Task 5: Cache layer',
        res: '4 Cores · 8GB RAM',
        load: 35,
      },
      {
        nameVi: 'Nút xử lý F',
        nameEn: 'Worker Node F',
        taskVi: 'Tác vụ 6: Thu thập nhật ký',
        taskEn: 'Task 6: Log collection',
        res: '6 Cores · 12GB RAM',
        load: 40,
      },
    ];
    const item = pool[workers.length - 4] || {
      nameVi: `Nút xử lý ${String.fromCharCode(65 + workers.length)}`,
      nameEn: `Worker Node ${String.fromCharCode(65 + workers.length)}`,
      taskVi: `Tác vụ ${workers.length + 1}: Xử lý bổ sung`,
      taskEn: `Task ${workers.length + 1}: Extra compute`,
      res: '4 Cores · 8GB RAM',
      load: 40,
    };
    const newWorker: DistributedWorker = {
      id: `w_${Date.now()}`,
      nameVi: item.nameVi,
      nameEn: item.nameEn,
      taskVi: item.taskVi,
      taskEn: item.taskEn,
      baseLoad: item.load,
      isOnline: true,
      resourceAllocation: item.res,
    };
    setWorkers((prev) => [...prev, newWorker]);
    onInteracted?.();
  };

  const handleRemoveWorker = () => {
    if (workers.length <= 2) return;
    setWorkers((prev) => prev.slice(0, prev.length - 1));
    onInteracted?.();
  };

  const handleToggleWorker = (id: string) => {
    setWorkers((prev) => {
      const target = prev.find((w) => w.id === id);
      const isGoingOffline = target ? target.isOnline : false;
      const updated = prev.map((w) => (w.id === id ? { ...w, isOnline: !w.isOnline } : w));

      if (isGoingOffline) {
        const name = language === 'vi' ? target?.nameVi : target?.nameEn;
        setFailoverMessage(
          language === 'vi'
            ? `${name} gặp sự cố: Tác vụ tự động được điều phối sang các nút còn lại mà hệ thống không dừng hoạt động.`
            : `${name} offline: Workload automatically rerouted to remaining active nodes without halting the system.`
        );
      } else {
        setFailoverMessage(null);
      }
      return updated;
    });
    onInteracted?.();
  };

  const handleResetWorkers = () => {
    setWorkers([
      {
        id: 'w_a',
        nameVi: 'Nút xử lý A',
        nameEn: 'Worker Node A',
        taskVi: 'Tác vụ 1: Xử lý dữ liệu',
        taskEn: 'Task 1: Data processing',
        baseLoad: 40,
        isOnline: true,
        resourceAllocation: '4 Cores · 8GB RAM',
      },
      {
        id: 'w_b',
        nameVi: 'Nút xử lý B',
        nameEn: 'Worker Node B',
        taskVi: 'Tác vụ 2: Kết xuất hình ảnh',
        taskEn: 'Task 2: Image rendering',
        baseLoad: 50,
        isOnline: true,
        resourceAllocation: '8 Cores · 16GB RAM',
      },
      {
        id: 'w_c',
        nameVi: 'Nút xử lý C',
        nameEn: 'Worker Node C',
        taskVi: 'Tác vụ 3: Truy vấn chỉ mục',
        taskEn: 'Task 3: Index query',
        baseLoad: 45,
        isOnline: true,
        resourceAllocation: '4 Cores · 8GB RAM',
      },
      {
        id: 'w_d',
        nameVi: 'Nút xử lý D',
        nameEn: 'Worker Node D',
        taskVi: 'Tác vụ 4: Suy luận mô hình',
        taskEn: 'Task 4: Model inference',
        baseLoad: 60,
        isOnline: true,
        resourceAllocation: '12 Cores · 32GB RAM',
      },
    ]);
    setFailoverMessage(null);
  };

  // Decentralized handlers
  const handleAddPeer = () => {
    if (peers.length >= 6) return;
    const pool = [
      { name: 'Eve', x: 50, y: 52, connections: ['p_alice', 'p_bob', 'p_charlie', 'p_dave'] },
      { name: 'Frank', x: 50, y: 16, connections: ['p_alice', 'p_bob'] },
    ];
    const nextIdx = peers.length - 4;
    const info = pool[nextIdx] || { name: `Peer ${peers.length + 1}`, x: 50, y: 50, connections: ['p_alice', 'p_dave'] };
    const newPeer: DecentralizedPeer = {
      id: `p_${info.name.toLowerCase()}`,
      name: info.name,
      x: info.x,
      y: info.y,
      isOnline: true,
      peerConnections: info.connections,
    };
    setPeers((prev) => [...prev, newPeer]);
    onInteracted?.();
  };

  const handleRemovePeer = () => {
    if (peers.length <= 3) return;
    setPeers((prev) => prev.slice(0, prev.length - 1));
    onInteracted?.();
  };

  const handleTogglePeer = (id: string) => {
    setPeers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isOnline: !p.isOnline } : p))
    );
    onInteracted?.();
  };

  const handleResetPeers = () => {
    setPeers([
      {
        id: 'p_alice',
        name: 'Alice',
        x: 20,
        y: 28,
        isOnline: true,
        peerConnections: ['p_bob', 'p_charlie'],
      },
      {
        id: 'p_bob',
        name: 'Bob',
        x: 80,
        y: 28,
        isOnline: true,
        peerConnections: ['p_alice', 'p_dave'],
      },
      {
        id: 'p_charlie',
        name: 'Charlie',
        x: 24,
        y: 75,
        isOnline: true,
        peerConnections: ['p_alice', 'p_dave'],
      },
      {
        id: 'p_dave',
        name: 'Dave',
        x: 76,
        y: 75,
        isOnline: true,
        peerConnections: ['p_bob', 'p_charlie'],
      },
    ]);
  };

  // Helper for computing peer connection routes
  const peerConnectionsList = useMemo(() => {
    const lines: {
      from: DecentralizedPeer;
      to: DecentralizedPeer;
      isOnline: boolean;
      id: string;
    }[] = [];
    const seen = new Set<string>();

    peers.forEach((p) => {
      p.peerConnections.forEach((targetId) => {
        const target = peers.find((o) => o.id === targetId);
        if (target) {
          const key = [p.id, target.id].sort().join('--');
          if (!seen.has(key)) {
            seen.add(key);
            lines.push({
              id: key,
              from: p,
              to: target,
              isOnline: p.isOnline && target.isOnline,
            });
          }
        }
      });
    });
    return lines;
  }, [peers]);

  // Calculate dynamic workload redistribution for distributed workers
  const onlineWorkers = workers.filter((w) => w.isOnline);
  const onlineWorkersCount = onlineWorkers.length;
  const totalOriginalLoad = workers.reduce((acc, w) => acc + w.baseLoad, 0);
  const dynamicWorkerLoads = useMemo(() => {
    if (onlineWorkersCount === 0) return {};
    const redistributedExtra = (workers.length - onlineWorkersCount) * 18;
    const extraPerOnline = redistributedExtra / onlineWorkersCount;
    const loads: Record<string, number> = {};
    workers.forEach((w) => {
      if (!w.isOnline) {
        loads[w.id] = 0;
      } else {
        loads[w.id] = Math.min(95, Math.round(w.baseLoad + extraPerOnline));
      }
    });
    return loads;
  }, [workers, onlineWorkersCount]);

  const hasExploredAll = visitedTopologies.size >= 3;

  return (
    <div className="space-y-6">
      {/* 1. Header & Tab Switcher */}
      <div className="p-6 rounded-2xl bg-[#090d16] border border-zinc-800/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'vi' ? 'Kiến trúc mạng' : 'Network architecture'}</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-100 tracking-tight">
              {language === 'vi' ? 'Ba mô hình mạng' : 'Three network models'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              {language === 'vi'
                ? 'So sánh cách dữ liệu, tài nguyên và quyền kiểm soát được phân bố trong hệ thống.'
                : 'Comparing how data, resources, and control are distributed in a system.'}
            </p>
          </div>

          {/* Tab Switcher: strictly one clean label per language */}
          <div className="p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-1 shrink-0 self-start md:self-auto">
            {(
              [
                { id: 'centralized', labelVi: 'Tập trung', labelEn: 'Centralized' },
                { id: 'distributed', labelVi: 'Phân tán', labelEn: 'Distributed' },
                { id: 'decentralized', labelVi: 'Phi tập trung', labelEn: 'Decentralized' },
              ] as const
            ).map((t) => {
              const isSelected = topology === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTopology(t.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
                  }`}
                >
                  {language === 'vi' ? t.labelVi : t.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Layout: Left Canvas (~67%) & Right Context Panel (~33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SIMULATION CANVAS */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-[#090d16] border border-zinc-800/80 shadow-sm space-y-4">
          {/* Canvas Sub-header with Title & Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  topology === 'centralized'
                    ? isCentralServerOnline
                      ? 'bg-emerald-400'
                      : 'bg-rose-500'
                    : topology === 'distributed'
                    ? onlineWorkersCount > 0
                      ? 'bg-emerald-400'
                      : 'bg-rose-500'
                    : 'bg-emerald-400'
                }`}
              />
              <h4 className="text-xs sm:text-sm font-semibold text-zinc-200">
                {topology === 'centralized' &&
                  (language === 'vi' ? 'Mô hình mạng tập trung' : 'Centralized network model')}
                {topology === 'distributed' &&
                  (language === 'vi' ? 'Mô hình mạng phân tán' : 'Distributed network model')}
                {topology === 'decentralized' &&
                  (language === 'vi' ? 'Mô hình mạng phi tập trung' : 'Decentralized network model')}
              </h4>
            </div>

            {/* Quick Interactive Actions */}
            {topology === 'centralized' && (
              <button
                type="button"
                onClick={handleToggleCentralServer}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${
                  isCentralServerOnline
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                {isCentralServerOnline ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>{language === 'vi' ? 'Vô hiệu hóa máy chủ' : 'Disable server'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'vi' ? 'Khôi phục máy chủ' : 'Restore server'}</span>
                  </>
                )}
              </button>
            )}

            {topology === 'distributed' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAddWorker}
                  disabled={workers.length >= 6}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{language === 'vi' ? 'Thêm nút' : 'Add node'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveWorker}
                  disabled={workers.length <= 2}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <Minus className="w-3 h-3" />
                  <span>{language === 'vi' ? 'Bớt nút' : 'Remove node'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetWorkers}
                  className="p-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  title={language === 'vi' ? 'Khôi phục trạng thái' : 'Reset workers'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {topology === 'decentralized' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAddPeer}
                  disabled={peers.length >= 6}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{language === 'vi' ? 'Thêm nút' : 'Add node'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemovePeer}
                  disabled={peers.length <= 3}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <Minus className="w-3 h-3" />
                  <span>{language === 'vi' ? 'Bớt nút' : 'Remove node'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetPeers}
                  className="p-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  title={language === 'vi' ? 'Khôi phục trạng thái' : 'Reset peers'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Canvas Rendering Area */}
          <div className="relative min-h-[380px] p-6 rounded-xl bg-zinc-950/90 border border-zinc-800/80 flex flex-col items-center justify-center overflow-hidden transition-all duration-200">
            {/* ============================================================== */}
            {/* 1. CENTRALIZED VISUALIZATION: STAR TOPOLOGY                    */}
            {/* ============================================================== */}
            {topology === 'centralized' && (
              <div className="w-full relative flex flex-col items-center justify-between py-2 min-h-[320px]">
                {/* SVG Connections & Data Flow Signals */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    {/* SVG Linear Gradients for gentle glowing packets */}
                    <radialGradient id="packetGlow" r="50%">
                      <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Static or Disconnected Lines */}
                  <g>
                    {/* Line to Alice (top center to bottom left) */}
                    <line
                      x1="50%"
                      y1="26%"
                      x2="18%"
                      y2="78%"
                      stroke={isCentralServerOnline ? '#10b981' : '#f43f5e'}
                      strokeWidth={isCentralServerOnline ? '2' : '1.5'}
                      strokeDasharray={isCentralServerOnline ? 'none' : '4,4'}
                      strokeOpacity={isCentralServerOnline ? 0.45 : 0.25}
                      className="transition-all duration-200"
                    />
                    {/* Line to Bob (top center to bottom center) */}
                    <line
                      x1="50%"
                      y1="26%"
                      x2="50%"
                      y2="78%"
                      stroke={isCentralServerOnline ? '#10b981' : '#f43f5e'}
                      strokeWidth={isCentralServerOnline ? '2' : '1.5'}
                      strokeDasharray={isCentralServerOnline ? 'none' : '4,4'}
                      strokeOpacity={isCentralServerOnline ? 0.45 : 0.25}
                      className="transition-all duration-200"
                    />
                    {/* Line to Charlie (top center to bottom right) */}
                    <line
                      x1="50%"
                      y1="26%"
                      x2="82%"
                      y2="78%"
                      stroke={isCentralServerOnline ? '#10b981' : '#f43f5e'}
                      strokeWidth={isCentralServerOnline ? '2' : '1.5'}
                      strokeDasharray={isCentralServerOnline ? 'none' : '4,4'}
                      strokeOpacity={isCentralServerOnline ? 0.45 : 0.25}
                      className="transition-all duration-200"
                    />
                  </g>

                  {/* Bidirectional Smooth Data Flow Packets (Active only when Server is Online) */}
                  {isCentralServerOnline && (
                    <g>
                      {/* Flow Server -> Alice */}
                      <circle r="3.5" fill="#34d399" opacity="0.9">
                        <animate
                          attributeName="cx"
                          values="50%; 18%"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cy"
                          values="26%; 78%"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      {/* Flow Alice -> Server */}
                      <circle r="3" fill="#6ee7b7" opacity="0.8">
                        <animate
                          attributeName="cx"
                          values="18%; 50%"
                          dur="2.4s"
                          begin="1.2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cy"
                          values="78%; 26%"
                          dur="2.4s"
                          begin="1.2s"
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Flow Server -> Bob */}
                      <circle r="3.5" fill="#34d399" opacity="0.9">
                        <animate
                          attributeName="cx"
                          values="50%; 50%"
                          dur="2.4s"
                          begin="0.4s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cy"
                          values="26%; 78%"
                          dur="2.4s"
                          begin="0.4s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      {/* Flow Bob -> Server */}
                      <circle r="3" fill="#6ee7b7" opacity="0.8">
                        <animate
                          attributeName="cx"
                          values="50%; 50%"
                          dur="2.4s"
                          begin="1.6s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cy"
                          values="78%; 26%"
                          dur="2.4s"
                          begin="1.6s"
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Flow Server -> Charlie */}
                      <circle r="3.5" fill="#34d399" opacity="0.9">
                        <animate
                          attributeName="cx"
                          values="50%; 82%"
                          dur="2.4s"
                          begin="0.8s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cy"
                          values="26%; 78%"
                          dur="2.4s"
                          begin="0.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      {/* Flow Charlie -> Server */}
                      <circle r="3" fill="#6ee7b7" opacity="0.8">
                        <animate
                          attributeName="cx"
                          values="82%; 50%"
                          dur="2.4s"
                          begin="2.0s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cy"
                          values="78%; 26%"
                          dur="2.4s"
                          begin="2.0s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  )}
                </svg>

                {/* Central Server Node */}
                <div
                  className={`relative z-10 px-5 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                    isCentralServerOnline
                      ? 'bg-zinc-900 border-zinc-700 shadow-md text-zinc-100'
                      : 'bg-rose-950/20 border-rose-800/80 text-rose-300'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isCentralServerOnline
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-100">
                      {language === 'vi' ? 'Máy chủ trung tâm' : 'Central Server'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCentralServerOnline ? 'bg-emerald-400' : 'bg-rose-500'
                        }`}
                      />
                      <span
                        className={`text-[11px] font-mono ${
                          isCentralServerOnline ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCentralServerOnline
                          ? language === 'vi'
                            ? 'Trực tuyến'
                            : 'Online'
                          : language === 'vi'
                          ? 'Ngoại tuyến'
                          : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Star Topology Clients Grid: Alice, Bob, Charlie */}
                <div className="grid grid-cols-3 gap-3 sm:gap-8 w-full max-w-lg z-10 mt-16">
                  {[
                    { name: 'Alice', initial: 'A' },
                    { name: 'Bob', initial: 'B' },
                    { name: 'Charlie', initial: 'C' },
                  ].map((client) => (
                    <div
                      key={client.name}
                      className={`p-3 rounded-xl border flex flex-col items-center space-y-1.5 transition-all duration-200 ${
                        isCentralServerOnline
                          ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200'
                          : 'bg-zinc-900/40 border-zinc-800/50 text-zinc-500 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCentralServerOnline
                            ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                            : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                        }`}
                      >
                        {client.initial}
                      </div>
                      <span className="text-xs font-medium text-zinc-200">{client.name}</span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCentralServerOnline ? 'bg-emerald-400' : 'bg-rose-500'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-mono ${
                            isCentralServerOnline ? 'text-zinc-400' : 'text-rose-400'
                          }`}
                        >
                          {isCentralServerOnline
                            ? language === 'vi'
                              ? 'Đã kết nối'
                              : 'Connected'
                            : language === 'vi'
                            ? 'Mất kết nối'
                            : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Failure Educational Message */}
                {!isCentralServerOnline && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-950/30 border border-rose-800/80 text-xs text-rose-300 flex items-center gap-2 max-w-md animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>
                      {language === 'vi'
                        ? 'Máy chủ trung tâm gặp sự cố. Toàn bộ các nút phụ thuộc vào máy chủ bị mất kết nối.'
                        : 'Central server failed. All dependent nodes have lost connection.'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 2. DISTRIBUTED VISUALIZATION: DISTRIBUTED WORKER CLUSTER        */}
            {/* ============================================================== */}
            {topology === 'distributed' && (
              <div className="w-full space-y-4">
                {/* Coordinator header */}
                <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-medium text-zinc-200">
                        {language === 'vi' ? 'Bộ điều phối' : 'Coordinator'}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {language === 'vi'
                          ? 'Nhiều máy cùng tham gia xử lý và chia sẻ khối lượng công việc. Cách tổ chức điều phối có thể khác nhau tùy hệ thống.'
                          : 'Multiple machines participate in processing and sharing workload. Coordination methods may vary across systems.'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700/60 shrink-0 ml-2">
                    {onlineWorkersCount}/{workers.length} {language === 'vi' ? 'trực tuyến' : 'online'}
                  </span>
                </div>

                {/* Worker Nodes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
                  {workers.map((worker, idx) => {
                    const currentLoad = dynamicWorkerLoads[worker.id] || 0;
                    return (
                      <div
                        key={worker.id}
                        className={`p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-2.5 relative overflow-hidden ${
                          worker.isOnline
                            ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200'
                            : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-500 opacity-60'
                        }`}
                      >
                        {/* Traffic Activity Pulse indicator for active worker */}
                        {worker.isOnline && (
                          <div className="absolute top-0 right-0 left-0 h-[2px] bg-emerald-500/20 overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 animate-pulse"
                              style={{ width: '100%', animationDuration: `${1.5 + idx * 0.3}s` }}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                worker.isOnline ? 'bg-emerald-400' : 'bg-rose-500'
                              }`}
                            />
                            <span className="text-xs font-medium text-zinc-200">
                              {language === 'vi' ? worker.nameVi : worker.nameEn}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleWorker(worker.id)}
                            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                              worker.isOnline
                                ? 'bg-zinc-800 text-zinc-400 hover:text-rose-400'
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                            }`}
                          >
                            {worker.isOnline
                              ? language === 'vi'
                                ? 'Tắt'
                                : 'Off'
                              : language === 'vi'
                              ? 'Bật'
                              : 'On'}
                          </button>
                        </div>

                        <div className="space-y-1.5 text-[11px] bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
                          {worker.isOnline ? (
                            <>
                              <div className="text-zinc-300 truncate">
                                {language === 'vi' ? worker.taskVi : worker.taskEn}
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                <span>
                                  {language === 'vi' ? 'Tải' : 'Load'}: {currentLoad}%
                                </span>
                                <span className="font-mono text-zinc-500">{worker.resourceAllocation}</span>
                              </div>
                              <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    currentLoad > 75 ? 'bg-amber-400' : 'bg-emerald-400'
                                  }`}
                                  style={{ width: `${currentLoad}%` }}
                                />
                              </div>
                            </>
                          ) : (
                            <div className="text-rose-400 text-[10px] py-1">
                              {language === 'vi'
                                ? 'Ngoại tuyến · Tác vụ đã chuyển giao'
                                : 'Offline · Workload rerouted'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {failoverMessage && (
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2 animate-fadeIn">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{failoverMessage}</span>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 3. DECENTRALIZED VISUALIZATION: P2P MESH                        */}
            {/* ============================================================== */}
            {topology === 'decentralized' && (
              <div className="w-full relative min-h-[320px] flex items-center justify-center">
                {/* SVG Connections and P2P packet flow between peers */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {peerConnectionsList.map((link) => (
                    <g key={link.id}>
                      <line
                        x1={`${link.from.x}%`}
                        y1={`${link.from.y}%`}
                        x2={`${link.to.x}%`}
                        y2={`${link.to.y}%`}
                        stroke={link.isOnline ? '#10b981' : '#f43f5e'}
                        strokeWidth={link.isOnline ? '1.5' : '1'}
                        strokeDasharray={link.isOnline ? 'none' : '3,3'}
                        strokeOpacity={link.isOnline ? 0.55 : 0.2}
                        className="transition-all duration-200"
                      />

                      {/* Small traveling packet along active P2P link */}
                      {link.isOnline && (
                        <circle r="3" fill="#34d399" opacity="0.8">
                          <animate
                            attributeName="cx"
                            values={`${link.from.x}%; ${link.to.x}%`}
                            dur="2.8s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="cy"
                            values={`${link.from.y}%; ${link.to.y}%`}
                            dur="2.8s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  ))}
                </svg>

                {/* Peer Nodes positioned on Mesh Topology */}
                <div className="relative w-full h-[300px] z-10">
                  {peers.map((peer) => {
                    const activeNeighbors = peer.peerConnections.filter((targetId) => {
                      const target = peers.find((p) => p.id === targetId);
                      return target && target.isOnline;
                    }).length;

                    return (
                      <div
                        key={peer.id}
                        style={{
                          position: 'absolute',
                          left: `${peer.x}%`,
                          top: `${peer.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        className={`w-36 sm:w-40 p-2.5 rounded-xl border transition-all duration-200 space-y-1.5 ${
                          peer.isOnline
                            ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200 shadow-sm'
                            : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                peer.isOnline ? 'bg-emerald-400' : 'bg-rose-500'
                              }`}
                            />
                            <span className="text-xs font-medium text-zinc-100">{peer.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTogglePeer(peer.id)}
                            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                              peer.isOnline
                                ? 'bg-zinc-800 text-zinc-400 hover:text-rose-400'
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                            }`}
                          >
                            {peer.isOnline
                              ? language === 'vi'
                                ? 'Tắt'
                                : 'Off'
                              : language === 'vi'
                              ? 'Bật'
                              : 'On'}
                          </button>
                        </div>

                        <div className="bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-800/80 text-[10px] text-zinc-400 leading-snug">
                          {peer.isOnline ? (
                            <>
                              <div>
                                {language === 'vi' ? 'Nút ngang hàng' : 'Peer node'}
                              </div>
                              <div className="text-zinc-500 font-mono pt-0.5">
                                {activeNeighbors} {language === 'vi' ? 'kết nối hoạt động' : 'active links'}
                              </div>
                            </>
                          ) : (
                            <div className="text-rose-400">
                              {language === 'vi' ? 'Ngoại tuyến · Tự định tuyến lại' : 'Offline · Traffic rerouted'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Experiment Hint */}
          <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-zinc-200">
                {language === 'vi' ? 'Thử nghiệm tương tác: ' : 'Interactive test: '}
              </span>
              {topology === 'centralized' && (
                <span>
                  {language === 'vi'
                    ? 'Nhấp vào nút "Vô hiệu hóa máy chủ" để quan sát sự cố điểm lỗi duy nhất khi toàn bộ các nút phụ thuộc mất liên lạc.'
                    : 'Click "Disable server" to observe how a Single Point of Failure halts communication across all dependent nodes.'}
                </span>
              )}
              {topology === 'distributed' && (
                <span>
                  {language === 'vi'
                    ? 'Thử tắt một nút xử lý để quan sát cách công việc được phân phối lại mà toàn bộ hệ thống không nhất thiết dừng theo.'
                    : 'Try turning off a worker node to observe how workload is dynamically redistributed without stopping the whole system.'}
                </span>
              )}
              {topology === 'decentralized' && (
                <span>
                  {language === 'vi'
                    ? 'Thử tắt một nút bất kỳ: Các nút ngang hàng còn lại vẫn tiếp tục truyền thông tin qua những đường kết nối khác.'
                    : 'Try turning off any peer: The remaining peers continue routing data directly through alternate links.'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTEXT PANEL */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-[#090d16] border border-zinc-800/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Dynamic Content Per Tab */}
            {topology === 'centralized' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-zinc-400">
                    {language === 'vi' ? 'Mô hình 1' : 'Model 1'}
                  </div>
                  <h4 className="text-base font-bold text-zinc-100">
                    {language === 'vi' ? 'Mạng tập trung' : 'Centralized network'}
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {language === 'vi'
                      ? 'Một máy chủ trung tâm điều phối và kiểm soát hoạt động của các nút trong hệ thống.'
                      : 'A central server coordinates and controls the operations of nodes in the system.'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <div className="text-xs">
                    <span className="font-semibold text-emerald-400">
                      {language === 'vi' ? 'Ưu điểm: ' : 'Advantages: '}
                    </span>
                    <span className="text-zinc-300">
                      {language === 'vi'
                        ? 'Dễ quản lý · Dễ kiểm soát · Điều phối đơn giản'
                        : 'Easy to manage · Strict control · Simple coordination'}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-rose-400">
                      {language === 'vi' ? 'Hạn chế: ' : 'Limitations: '}
                    </span>
                    <span className="text-zinc-300">
                      {language === 'vi'
                        ? 'Phụ thuộc vào máy chủ trung tâm · Một điểm lỗi có thể ảnh hưởng toàn bộ hệ thống'
                        : 'Dependent on central server · Single point of failure can impact entire system'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 pt-1">
                    <span className="font-medium text-zinc-300">
                      {language === 'vi' ? 'Ví dụ: ' : 'Example: '}
                    </span>
                    <span>
                      {language === 'vi'
                        ? 'Ngân hàng truyền thống, ứng dụng web một máy chủ.'
                        : 'Traditional banking, single-server web applications.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {topology === 'distributed' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-zinc-400">
                    {language === 'vi' ? 'Mô hình 2' : 'Model 2'}
                  </div>
                  <h4 className="text-base font-bold text-zinc-100">
                    {language === 'vi' ? 'Mạng phân tán' : 'Distributed network'}
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {language === 'vi'
                      ? 'Nhiều máy cùng tham gia lưu trữ hoặc xử lý dữ liệu, giúp phân bổ khối lượng công việc.'
                      : 'Multiple machines participate in storing or processing data to share the workload.'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <div className="text-xs">
                    <span className="font-semibold text-emerald-400">
                      {language === 'vi' ? 'Ưu điểm: ' : 'Advantages: '}
                    </span>
                    <span className="text-zinc-300">
                      {language === 'vi'
                        ? 'Tăng khả năng chịu tải · Tối ưu hiệu năng tính toán · Dễ mở rộng tài nguyên'
                        : 'High scalability · Resilient workload dispatch · Efficient resource use'}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-rose-400">
                      {language === 'vi' ? 'Hạn chế: ' : 'Limitations: '}
                    </span>
                    <span className="text-zinc-300">
                      {language === 'vi'
                        ? 'Độ phức tạp điều phối cao · Đồng bộ dữ liệu phức tạp'
                        : 'High coordination complexity · Complex data synchronization'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 pt-1">
                    <span className="font-medium text-zinc-300">
                      {language === 'vi' ? 'Ví dụ: ' : 'Example: '}
                    </span>
                    <span>
                      {language === 'vi'
                        ? 'Cụm máy chủ đám mây, hệ thống lưu trữ phân tán.'
                        : 'Cloud server clusters, distributed storage systems.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {topology === 'decentralized' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-zinc-400">
                    {language === 'vi' ? 'Mô hình 3' : 'Model 3'}
                  </div>
                  <h4 className="text-base font-bold text-zinc-100">
                    {language === 'vi' ? 'Mạng phi tập trung' : 'Decentralized network'}
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {language === 'vi'
                      ? 'Quyền kiểm soát và ra quyết định được phân bổ giữa nhiều nút thay vì tập trung vào một thực thể duy nhất.'
                      : 'Control and decision-making authority are distributed across multiple nodes instead of a single entity.'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <div className="text-xs">
                    <span className="font-semibold text-emerald-400">
                      {language === 'vi' ? 'Ưu điểm: ' : 'Advantages: '}
                    </span>
                    <span className="text-zinc-300">
                      {language === 'vi'
                        ? 'Không có điểm lỗi duy nhất · Kháng kiểm duyệt · Người dùng tự chủ'
                        : 'No single point of failure · Censorship resistant · User sovereignty'}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-rose-400">
                      {language === 'vi' ? 'Hạn chế: ' : 'Limitations: '}
                    </span>
                    <span className="text-zinc-300">
                      {language === 'vi'
                        ? 'Hiệu năng xử lý thấp hơn · Cơ chế đồng thuận phức tạp'
                        : 'Lower throughput · Complex consensus mechanisms'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 pt-1">
                    <span className="font-medium text-zinc-300">
                      {language === 'vi' ? 'Ví dụ: ' : 'Example: '}
                    </span>
                    <span>
                      {language === 'vi'
                        ? 'Mạng lưới Bitcoin, giao thức BitTorrent.'
                        : 'Bitcoin network, BitTorrent protocol.'}
                    </span>
                  </div>
                </div>

                {/* Key Takeaway: Distributed != Decentralized */}
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-xs font-semibold text-zinc-200">
                    {language === 'vi' ? 'Điểm cần nhớ' : 'Key takeaway'}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {language === 'vi'
                      ? 'Phân tán nói về cách tài nguyên hoặc hoạt động được phân bố. Phi tập trung nói về cách quyền kiểm soát và ra quyết định được phân bố.'
                      : 'Distributed refers to how resources or operations are shared. Decentralized refers to how control and decision-making authority are allocated.'}
                  </p>
                </div>
              </div>
            )}

            {/* Critical Thinking Challenge: revealed once user explored or at bottom */}
            {hasExploredAll && (
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5 transition-all duration-200">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'vi' ? 'Thử thách tư duy' : 'Critical thinking'}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-snug font-medium">
                  {language === 'vi'
                    ? 'Một hệ thống có thể vừa Phân tán vừa Phi tập trung không?'
                    : 'Can a system be both Distributed and Decentralized?'}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setQuizAnswer('yes');
                      onInteracted?.();
                    }}
                    className={`py-1.5 px-3 rounded-md text-xs font-medium border transition-colors cursor-pointer text-center ${
                      quizAnswer === 'yes'
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold'
                        : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:text-zinc-100'
                    }`}
                  >
                    {language === 'vi' ? 'Có thể' : 'Yes, it can'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizAnswer('no');
                      onInteracted?.();
                    }}
                    className={`py-1.5 px-3 rounded-md text-xs font-medium border transition-colors cursor-pointer text-center ${
                      quizAnswer === 'no'
                        ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-semibold'
                        : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:text-zinc-100'
                    }`}
                  >
                    {language === 'vi' ? 'Không thể' : 'No, it cannot'}
                  </button>
                </div>

                {quizAnswer !== null && (
                  <div
                    className={`p-2.5 rounded-lg text-xs leading-relaxed transition-all ${
                      quizAnswer === 'yes'
                        ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/30 border border-rose-500/30 text-rose-200'
                    }`}
                  >
                    <div className="font-semibold mb-0.5">
                      {quizAnswer === 'yes'
                        ? language === 'vi'
                          ? 'Chính xác'
                          : 'Correct'
                        : language === 'vi'
                        ? 'Chưa chính xác'
                        : 'Incorrect'}
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-snug">
                      {language === 'vi'
                        ? 'Phân tán nói về cách tài nguyên hoặc hoạt động được phân bố. Phi tập trung nói về cách quyền kiểm soát và ra quyết định được phân bố. Hai khái niệm có liên quan nhưng không đồng nghĩa.'
                        : 'Distributed refers to how resources or operations are shared. Decentralized refers to how control and decision-making authority are allocated. The two concepts are related but not synonymous.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
            {onPrevStage && (
              <button
                type="button"
                onClick={onPrevStage}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
              >
                {language === 'vi' ? '← Quay lại' : '← Back'}
              </button>
            )}
            {onNextStage && (
              <button
                type="button"
                onClick={onNextStage}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ml-auto"
              >
                <span>{language === 'vi' ? 'Tiếp tục: Bài toán tiêu đúp' : 'Next: Double spending'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
