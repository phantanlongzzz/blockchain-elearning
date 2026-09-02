import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  ArrowRight,
  Calculator,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { GeneralNode, NetworkPacket } from './types';

interface ByzantineGeneralsLabProps {
  isHandsOn?: boolean;
  onInteracted?: () => void;
  onPrevStage?: () => void;
  onNextStage?: () => void;
}

export const ByzantineGeneralsLab: React.FC<ByzantineGeneralsLabProps> = ({
  onInteracted,
  onPrevStage,
  onNextStage,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Scenario config: 'honest' | 'traitor-commander' | 'traitor-lieutenant'
  const [scenario, setScenario] = useState<'honest' | 'traitor-commander' | 'traitor-lieutenant'>('traitor-lieutenant');
  const [commanderOrder, setCommanderOrder] = useState<'ATTACK' | 'RETREAT'>('ATTACK');
  const [traitorId, setTraitorId] = useState<string>('charlie');

  // Simulation run state
  const [simStep, setSimStep] = useState<number>(0); // 0 = idle, 1 = commander sending, 2 = lieutenants forwarding, 3 = decided
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePackets, setActivePackets] = useState<NetworkPacket[]>([]);

  // Threshold interactive experimenter
  const [toleratedTraitors, setToleratedTraitors] = useState<number>(1);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Nodes initial setup
  const [nodes, setNodes] = useState<GeneralNode[]>([
    {
      id: 'commander',
      name: isVi ? 'Chỉ huy' : 'Commander',
      role: 'commander',
      isTraitor: false,
      x: 50,
      y: 16,
      forwardedOrdersReceived: {},
      status: 'idle',
    },
    {
      id: 'alice',
      name: 'Alice',
      role: 'lieutenant',
      isTraitor: false,
      x: 20,
      y: 54,
      forwardedOrdersReceived: {},
      status: 'idle',
    },
    {
      id: 'bob',
      name: 'Bob',
      role: 'lieutenant',
      isTraitor: false,
      x: 40,
      y: 82,
      forwardedOrdersReceived: {},
      status: 'idle',
    },
    {
      id: 'charlie',
      name: 'Charlie',
      role: 'lieutenant',
      isTraitor: true,
      x: 60,
      y: 82,
      forwardedOrdersReceived: {},
      status: 'idle',
    },
    {
      id: 'dave',
      name: 'Dave',
      role: 'lieutenant',
      isTraitor: false,
      x: 80,
      y: 54,
      forwardedOrdersReceived: {},
      status: 'idle',
    },
  ]);

  const animTimerRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    animTimerRef.current.forEach((t) => clearTimeout(t));
    animTimerRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Update nodes when scenario changes
  useEffect(() => {
    setNodes((prev) =>
      prev.map((n) => {
        if (scenario === 'honest') {
          return { ...n, isTraitor: false, directOrderReceived: null, forwardedOrdersReceived: {}, decision: null, status: 'idle' };
        }
        if (scenario === 'traitor-commander') {
          return {
            ...n,
            isTraitor: n.role === 'commander',
            directOrderReceived: null,
            forwardedOrdersReceived: {},
            decision: null,
            status: 'idle',
          };
        }
        // traitor-lieutenant
        return {
          ...n,
          isTraitor: n.id === traitorId,
          directOrderReceived: null,
          forwardedOrdersReceived: {},
          decision: null,
          status: 'idle',
        };
      })
    );
    setSimStep(0);
    setIsPlaying(false);
    setActivePackets([]);
    clearTimers();
  }, [scenario, traitorId]);

  const handleStartSimulation = () => {
    clearTimers();
    setIsPlaying(true);
    setSimStep(1);
    onInteracted?.();

    // Stage 1: Commander sends orders to all lieutenants
    const lieutenants = nodes.filter((n) => n.role === 'lieutenant');
    const packetsStage1: NetworkPacket[] = lieutenants.map((lt, idx) => {
      let payload: 'ATTACK' | 'RETREAT' = commanderOrder;
      if (scenario === 'traitor-commander') {
        payload = idx % 2 === 0 ? 'ATTACK' : 'RETREAT';
      }
      return {
        id: `c-to-${lt.id}`,
        fromId: 'commander',
        toId: lt.id,
        payload,
        isSigned: false,
        progress: 0,
        color: payload === 'ATTACK' ? '#ef4444' : '#22c55e',
      };
    });

    setActivePackets(packetsStage1);

    // Timer to finish Stage 1
    const t1 = setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.role === 'commander') return { ...n, status: 'sending' };
          const p = packetsStage1.find((pkg) => pkg.toId === n.id);
          return p ? { ...n, directOrderReceived: p.payload, status: 'receiving' } : n;
        })
      );

      // Stage 2: Lieutenants forward to each other
      setSimStep(2);
      const stage2Packets: NetworkPacket[] = [];
      const currentLieutenants = nodes.filter((n) => n.role === 'lieutenant');

      currentLieutenants.forEach((sender) => {
        currentLieutenants.forEach((receiver) => {
          if (sender.id !== receiver.id) {
            let forwardedPayload: 'ATTACK' | 'RETREAT' = commanderOrder;
            if (scenario === 'traitor-lieutenant' && sender.id === traitorId) {
              forwardedPayload = receiver.id === 'alice' ? 'ATTACK' : 'RETREAT';
            } else if (scenario === 'traitor-commander') {
              forwardedPayload = sender.directOrderReceived || commanderOrder;
            }

            stage2Packets.push({
              id: `${sender.id}-to-${receiver.id}`,
              fromId: sender.id,
              toId: receiver.id,
              payload: forwardedPayload,
              isSigned: false,
              isTampered: sender.id === traitorId,
              progress: 0,
              color: forwardedPayload === 'ATTACK' ? '#ef4444' : '#22c55e',
            });
          }
        });
      });

      setActivePackets(stage2Packets);

      // Timer to finish Stage 2 and decide (Stage 3)
      const t2 = setTimeout(() => {
        setSimStep(3);
        setIsPlaying(false);
        setActivePackets([]);

        setNodes((prev) =>
          prev.map((n) => {
            if (n.role === 'commander') {
              return { ...n, status: 'decided', decision: commanderOrder };
            }

            const receivedDirect = n.directOrderReceived || commanderOrder;
            const receivedFromPeers: Record<string, 'ATTACK' | 'RETREAT'> = {};

            stage2Packets
              .filter((p) => p.toId === n.id)
              .forEach((p) => {
                receivedFromPeers[p.fromId] = p.payload;
              });

            const allVotes = [receivedDirect, ...Object.values(receivedFromPeers)];
            const attackVotes = allVotes.filter((v) => v === 'ATTACK').length;
            const retreatVotes = allVotes.filter((v) => v === 'RETREAT').length;

            const decision: 'ATTACK' | 'RETREAT' | 'UNDECIDED' =
              attackVotes > retreatVotes ? 'ATTACK' : retreatVotes > attackVotes ? 'RETREAT' : 'UNDECIDED';

            return {
              ...n,
              forwardedOrdersReceived: receivedFromPeers,
              decision: n.isTraitor ? (commanderOrder === 'ATTACK' ? 'RETREAT' : 'ATTACK') : decision,
              status: 'decided',
            };
          })
        );
      }, 1600);

      animTimerRef.current.push(t2);
    }, 1400);

    animTimerRef.current.push(t1);
  };

  const handleReset = () => {
    clearTimers();
    setIsPlaying(false);
    setSimStep(0);
    setActivePackets([]);
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        directOrderReceived: null,
        forwardedOrdersReceived: {},
        decision: null,
        status: 'idle',
      }))
    );
  };

  const honestLieutenants = nodes.filter((n) => n.role === 'lieutenant' && !n.isTraitor);
  const honestDecisions = honestLieutenants.map((n) => n.decision).filter(Boolean);
  const allHonestAgreed =
    honestDecisions.length > 0 &&
    honestDecisions.every((d) => d === honestDecisions[0]) &&
    honestDecisions[0] !== 'UNDECIDED';

  const minNodesRequired = 3 * toleratedTraitors + 1;

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* 1. Page Header */}
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 font-sans tracking-tight">
              {isVi ? 'Bài toán các vị tướng Byzantine' : 'Byzantine generals problem'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isVi
                ? 'Mô phỏng khả năng đạt đồng thuận khi mạng lưới có nút gửi thông tin sai lệch.'
                : 'Simulate consensus resilience when network nodes broadcast conflicting messages.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isVi ? 'Khôi phục' : 'Reset'}</span>
            </button>
            <button
              type="button"
              onClick={handleStartSimulation}
              disabled={isPlaying}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>
                {isPlaying
                  ? isVi
                    ? 'Đang mô phỏng...'
                    : 'Simulating...'
                  : isVi
                  ? 'Bắt đầu mô phỏng'
                  : 'Start simulation'}
              </span>
            </button>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Scenario */}
          <div className="p-2.5 rounded-lg bg-[#0B0E12] border border-slate-800/80 space-y-1">
            <label className="text-[11px] text-slate-400 font-medium block">
              {isVi ? 'Kịch bản' : 'Scenario'}
            </label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as any)}
              className="w-full bg-[#080C10] border border-slate-800 text-xs text-slate-200 rounded-md px-2 py-1 focus:outline-none focus:border-emerald-500"
            >
              <option value="traitor-lieutenant">
                {isVi ? '1 Tướng phản bội (Charlie)' : '1 Traitor Lieutenant (Charlie)'}
              </option>
              <option value="traitor-commander">
                {isVi ? 'Chỉ huy phản bội (Lệnh mâu thuẫn)' : 'Traitor Commander'}
              </option>
              <option value="honest">
                {isVi ? 'Toàn bộ trung thực' : 'All honest'}
              </option>
            </select>
          </div>

          {/* Commander Order - Segmented Control */}
          <div className="p-2.5 rounded-lg bg-[#0B0E12] border border-slate-800/80 space-y-1">
            <label className="text-[11px] text-slate-400 font-medium block">
              {isVi ? 'Lệnh chỉ huy' : 'Commander order'}
            </label>
            <div className="grid grid-cols-2 p-0.5 rounded-md bg-[#080C10] border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setCommanderOrder('ATTACK')}
                className={`py-1 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  commanderOrder === 'ATTACK'
                    ? 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isVi ? 'Tấn công' : 'Attack'}
              </button>
              <button
                type="button"
                onClick={() => setCommanderOrder('RETREAT')}
                className={`py-1 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  commanderOrder === 'RETREAT'
                    ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isVi ? 'Rút lui' : 'Retreat'}
              </button>
            </div>
          </div>

          {/* Traitor Designation */}
          <div className="p-2.5 rounded-lg bg-[#0B0E12] border border-slate-800/80 space-y-1">
            <label className="text-[11px] text-slate-400 font-medium block">
              {isVi ? 'Nút phản bội' : 'Traitor node'}
            </label>
            <select
              value={traitorId}
              disabled={scenario !== 'traitor-lieutenant'}
              onChange={(e) => setTraitorId(e.target.value)}
              className="w-full bg-[#080C10] border border-slate-800 text-xs text-slate-200 rounded-md px-2 py-1 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
            >
              <option value="charlie">Charlie</option>
              <option value="bob">Bob</option>
              <option value="alice">Alice</option>
              <option value="dave">Dave</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Interactive Network Simulation (Primary) + 3f+1 Threshold (Secondary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Network Canvas */}
        <div className="lg:col-span-8 bg-[#0B0E12] border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[430px] space-y-4">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
            <span className="text-slate-300 font-medium">
              {isVi ? 'Mô hình mạng lưới' : 'Network simulation'}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {simStep === 0
                ? isVi ? 'Sẵn sàng' : 'Ready'
                : simStep === 1
                ? isVi ? 'Chỉ huy phát lệnh' : 'Commander broadcasting'
                : simStep === 2
                ? isVi ? 'Các nút trao đổi' : 'Nodes exchanging'
                : isVi ? 'Đã có kết quả' : 'Concluded'}
            </span>
          </div>

          {/* Network Graph */}
          <div className="relative w-full h-[280px] my-auto">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {nodes
                .filter((n) => n.role === 'lieutenant')
                .map((lt) => {
                  const cmd = nodes.find((n) => n.role === 'commander')!;
                  return (
                    <line
                      key={`cmd-${lt.id}`}
                      x1={`${cmd.x}%`}
                      y1={`${cmd.y}%`}
                      x2={`${lt.x}%`}
                      y2={`${lt.y}%`}
                      stroke="#334155"
                      strokeWidth="1.5"
                      strokeDasharray={simStep === 1 ? '4 4' : 'none'}
                    />
                  );
                })}

              {nodes
                .filter((n) => n.role === 'lieutenant')
                .map((n1, i, arr) =>
                  arr.slice(i + 1).map((n2) => (
                    <line
                      key={`${n1.id}-${n2.id}`}
                      x1={`${n1.x}%`}
                      y1={`${n1.y}%`}
                      x2={`${n2.x}%`}
                      y2={`${n2.y}%`}
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray={simStep === 2 ? '4 4' : 'none'}
                    />
                  ))
                )}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const isCmd = node.role === 'commander';
              return (
                <div
                  key={node.id}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute p-2.5 rounded-lg border transition-colors min-w-[110px] sm:min-w-[130px] z-10 ${
                    node.isTraitor
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                      : isCmd
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-[#0B0E12] border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>
                      {isCmd
                        ? isVi ? 'Chỉ huy' : 'Commander'
                        : node.isTraitor
                        ? isVi ? 'Phản bội' : 'Traitor'
                        : isVi ? 'Trung thực' : 'Honest'}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        node.isTraitor ? 'bg-rose-400' : 'bg-emerald-400'
                      }`}
                    />
                  </div>

                  <div className="text-xs font-semibold text-slate-100">{node.name}</div>

                  {node.decision && (
                    <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">{isVi ? 'Bầu:' : 'Vote:'}</span>
                      <span
                        className={`font-semibold ${
                          node.decision === 'ATTACK' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {node.decision === 'ATTACK'
                          ? isVi ? 'Tấn công' : 'Attack'
                          : isVi ? 'Rút lui' : 'Retreat'}
                      </span>
                    </div>
                  )}

                  {node.directOrderReceived && !node.decision && (
                    <div className="mt-1 text-[10px] font-mono text-slate-400">
                      {isVi ? 'Nhận:' : 'Got:'}{' '}
                      {node.directOrderReceived === 'ATTACK'
                        ? isVi ? 'Tấn công' : 'Attack'
                        : isVi ? 'Rút lui' : 'Retreat'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Outcome Status (Secondary) */}
          {simStep === 3 && (
            <div className="p-3.5 rounded-lg bg-[#0B0E12] border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    allHonestAgreed ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span className="font-semibold text-slate-100">
                  {allHonestAgreed
                    ? isVi
                      ? 'Đã đạt đồng thuận'
                      : 'Consensus achieved'
                    : isVi
                    ? 'Đồng thuận thất bại'
                    : 'Consensus failed'}
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">
                  —{' '}
                  {allHonestAgreed
                    ? isVi
                      ? 'Các nút trung thực đạt đa số thống nhất.'
                      : 'Honest nodes converged on majority decision.'
                    : isVi
                    ? 'Thông tin mâu thuẫn ngăn cản đa số thống nhất.'
                    : 'Conflicting messages prevented agreement.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: 3f + 1 Threshold Calculator (Tertiary) */}
        <div className="lg:col-span-4 bg-[#0B0E12] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-medium text-slate-300 font-sans">
                {isVi ? 'Ngưỡng chịu lỗi (3f + 1)' : 'Byzantine threshold (3f + 1)'}
              </h3>
              <Calculator className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isVi
                ? 'Để chịu được f nút gian lận trong mô hình truyền miệng, hệ thống cần tối thiểu 3f + 1 nút (tỉ lệ trung thực > 66.7%).'
                : 'To tolerate f Byzantine nodes without digital signatures, the network requires at least 3f + 1 nodes (>66.7% honest).'}
            </p>

            {/* Formula Block */}
            <div className="p-3 rounded-lg bg-[#080C10] border border-slate-800/80 text-center space-y-1">
              <div className="text-lg font-mono font-bold text-emerald-400">
                N ≥ 3f + 1
              </div>
              <div className="text-[11px] text-slate-500">
                {isVi ? 'Yêu cầu đa số tuyệt đối > 2/3' : 'Requires > 2/3 supermajority'}
              </div>
            </div>

            {/* Stepper */}
            <div className="p-3 rounded-lg bg-[#080C10] border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  {isVi ? 'Số nút độc hại (f):' : 'Tolerated traitors (f):'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setToleratedTraitors((prev) => Math.max(1, prev - 1))}
                    className="w-6 h-6 rounded bg-[#0B0E12] hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center cursor-pointer text-xs"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-mono font-semibold text-emerald-400 text-xs">
                    {toleratedTraitors}
                  </span>
                  <button
                    type="button"
                    onClick={() => setToleratedTraitors((prev) => Math.min(5, prev + 1))}
                    className="w-6 h-6 rounded bg-[#0B0E12] hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center cursor-pointer text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">{isVi ? 'Số nút tối thiểu:' : 'Min nodes required:'}</span>
                <span className="text-emerald-400 font-semibold">
                  {minNodesRequired} {isVi ? 'nút' : 'nodes'}
                </span>
              </div>
            </div>

            {/* Collapsible Info */}
            <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-[#080C10]">
              <button
                type="button"
                onClick={() => setShowExplanation((prev) => !prev)}
                className="w-full p-2.5 flex items-center justify-between text-xs text-slate-300 hover:bg-slate-900/60 cursor-pointer"
              >
                <span className="flex items-center gap-1.5 text-[11px] text-amber-300">
                  <AlertTriangle className="w-3 h-3" />
                  {isVi ? 'Vì sao 3 nút không thể chịu 1 kẻ phản bội?' : 'Why 3 nodes cannot tolerate 1 traitor?'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                    showExplanation ? 'rotate-180 text-slate-300' : ''
                  }`}
                />
              </button>
              {showExplanation && (
                <div className="p-2.5 text-xs text-slate-400 bg-[#0B0E12] border-t border-slate-800/60 leading-relaxed">
                  {isVi
                    ? 'Với 3 nút (1 chỉ huy + 2 phó tướng) và 1 kẻ phản bội (f=1), N=3 < 3(1)+1 = 4. Tỉ lệ biểu quyết luôn là 1-1, không có cách nào xác định ai đang nói dối.'
                    : 'With 3 nodes and 1 traitor (f=1), N=3 < 4. The vote results in a 1-1 tie with no way to determine who lied.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
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
            onClick={onNextStage}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Tiếp tục: Thông điệp truyền miệng' : 'Next: Oral Messages'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
