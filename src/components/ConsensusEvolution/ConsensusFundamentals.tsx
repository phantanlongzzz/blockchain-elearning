import React, { useState } from 'react';
import { RotateCcw, ArrowRight, Info, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface NodeState {
  id: string;
  name: string;
  vote: 'ATTACK' | 'RETREAT';
}

interface ConsensusFundamentalsProps {
  isHandsOn?: boolean;
  onInteracted?: () => void;
  onNextStage?: () => void;
}

export const ConsensusFundamentals: React.FC<ConsensusFundamentalsProps> = ({
  onInteracted,
  onNextStage,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [nodes, setNodes] = useState<NodeState[]>([
    { id: 'alice', name: 'Alice', vote: 'ATTACK' },
    { id: 'bob', name: 'Bob', vote: 'RETREAT' },
    { id: 'charlie', name: 'Charlie', vote: 'ATTACK' },
    { id: 'dave', name: 'Dave', vote: 'RETREAT' },
  ]);

  const [showDefinition, setShowDefinition] = useState(false);
  const [expandedTheoryIndex, setExpandedTheoryIndex] = useState<number | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const attackCount = nodes.filter((n) => n.vote === 'ATTACK').length;
  const retreatCount = nodes.filter((n) => n.vote === 'RETREAT').length;
  const agreementCount = Math.max(attackCount, retreatCount);
  const hasConsensus = attackCount === nodes.length || retreatCount === nodes.length;

  const setNodeVote = (id: string, vote: 'ATTACK' | 'RETREAT') => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, vote } : n)));
    onInteracted?.();
  };

  const handleApplyMajorityProtocol = () => {
    setIsResolving(true);
    setTimeout(() => {
      const majorityVote: 'ATTACK' | 'RETREAT' = attackCount >= retreatCount ? 'ATTACK' : 'RETREAT';
      setNodes((prev) => prev.map((n) => ({ ...n, vote: majorityVote })));
      setIsResolving(false);
      onInteracted?.();
    }, 400);
  };

  const handleReset = () => {
    setNodes([
      { id: 'alice', name: 'Alice', vote: 'ATTACK' },
      { id: 'bob', name: 'Bob', vote: 'RETREAT' },
      { id: 'charlie', name: 'Charlie', vote: 'ATTACK' },
      { id: 'dave', name: 'Dave', vote: 'RETREAT' },
    ]);
    setShowDefinition(false);
    setExpandedTheoryIndex(null);
  };

  const toggleTheory = (index: number) => {
    setExpandedTheoryIndex((prev) => (prev === index ? null : index));
    onInteracted?.();
  };

  const theoryItems = [
    {
      num: '01',
      titleVi: 'Không có cơ quan trung ương',
      titleEn: 'No central authority',
      descVi: 'Không một nút nào có quyền hạn đơn phương áp đặt dữ liệu lên các nút khác trong mạng.',
      descEn: 'No single node has authority to unilaterally impose data on other nodes.',
    },
    {
      num: '02',
      titleVi: 'Không có đồng hồ toàn cục',
      titleEn: 'No global clock',
      descVi: 'Độ trễ mạng khiến các nút nhận và quan sát thông điệp tại các thời điểm và thứ tự khác nhau.',
      descEn: 'Network latency causes nodes to receive messages at different timestamps and orders.',
    },
    {
      num: '03',
      titleVi: 'Có nút lỗi hoặc gian lận',
      titleEn: 'Faulty or malicious nodes',
      descVi: 'Nút mạng có thể bị mất kết nối, lỗi phần cứng hoặc cố tình phát tán dữ liệu mâu thuẫn (Byzantine).',
      descEn: 'Nodes can fail, crash, or deliberately send conflicting data to disrupt the network.',
    },
    {
      num: '04',
      titleVi: 'Cần đạt trạng thái thống nhất',
      titleEn: 'Unified deterministic state',
      descVi: 'Mọi nút trung thực cuối cùng đều phải đồng thuận trên đúng một phiên bản sổ cái duy nhất.',
      descEn: 'All honest nodes must eventually converge on the exact same single ledger state.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header: Minimal, Sentence-Case with Info trigger */}
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-100 font-sans tracking-tight">
              {isVi ? 'Bản chất đồng thuận' : 'Consensus essentials'}
            </h2>
            <button
              type="button"
              onClick={() => setShowDefinition((prev) => !prev)}
              aria-label="Toggle definition"
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                showDefinition
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="self-start sm:self-auto text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isVi ? 'Khôi phục' : 'Reset'}</span>
          </button>
        </div>

        <p className="text-sm text-slate-400">
          {isVi
            ? 'Thay đổi quyết định của từng nút để quan sát cách mạng phân tán đạt được hoặc mất trạng thái đồng thuận.'
            : 'Change node decisions to observe how a decentralized network reaches or loses consensus.'}
        </p>

        {showDefinition && (
          <div className="mt-2 text-xs text-slate-300 bg-[#080C10] border border-slate-800 p-3 rounded-lg leading-relaxed">
            {isVi
              ? 'Consensus là cơ chế giúp các node trong mạng thống nhất về trạng thái chung của blockchain mà không cần người điều phối trung tâm.'
              : 'Consensus is the mechanism that helps network nodes agree on the shared blockchain state without a central coordinator.'}
          </div>
        )}
      </div>

      {/* 2. Main Layout: Interactive Simulation (Primary) + Theory (Tertiary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 4 Node Interactive Simulation (Primary) */}
        <div className="lg:col-span-7 bg-[#0B0E12] border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-medium text-slate-300 font-sans">
              {isVi ? 'Các nút mạng' : 'Network nodes'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              4 {isVi ? 'nút' : 'nodes'}
            </span>
          </div>

          {/* 4 Clean Node Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nodes.map((node) => {
              const isAttack = node.vote === 'ATTACK';
              return (
                <div
                  key={node.id}
                  className="p-3.5 rounded-lg bg-[#080C10] border border-slate-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{node.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {isAttack
                        ? isVi
                          ? 'Tấn công'
                          : 'Attack'
                        : isVi
                        ? 'Rút lui'
                        : 'Retreat'}
                    </span>
                  </div>

                  {/* Compact Segmented Control */}
                  <div className="grid grid-cols-2 p-0.5 rounded-md bg-[#080C10] border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setNodeVote(node.id, 'ATTACK')}
                      className={`py-1 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        isAttack
                          ? 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isVi ? 'Tấn công' : 'Attack'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNodeVote(node.id, 'RETREAT')}
                      className={`py-1 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        !isAttack
                          ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isVi ? 'Rút lui' : 'Retreat'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secondary: Compact Consensus Result Bar */}
          <div className="pt-2">
            <div className="p-4 rounded-lg bg-[#080C10] border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasConsensus ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span className="font-semibold text-slate-100">
                    {hasConsensus
                      ? isVi
                        ? 'Đã đạt đồng thuận'
                        : 'Consensus achieved'
                      : isVi
                      ? 'Chưa đạt đồng thuận'
                      : 'No consensus'}
                  </span>
                </div>
                <div className="text-slate-400 font-mono text-[11px] pl-4">
                  {agreementCount}/4 {isVi ? 'nút đồng ý' : 'nodes agree'}
                  {' · '}
                  {isVi
                    ? `${attackCount} Tấn công, ${retreatCount} Rút lui`
                    : `${attackCount} Attack, ${retreatCount} Retreat`}
                </div>
              </div>

              {!hasConsensus && (
                <button
                  type="button"
                  disabled={isResolving}
                  onClick={handleApplyMajorityProtocol}
                  className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isResolving
                    ? isVi
                      ? 'Đang xử lý...'
                      : 'Resolving...'
                    : isVi
                    ? 'Chạy quy tắc đa số'
                    : 'Apply majority rule'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Tertiary Theory Section (Flattened List with Progressive Disclosure) */}
        <div className="lg:col-span-5 bg-[#0B0E12] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-xs font-medium text-slate-300 font-sans">
              {isVi ? '4 thách thức của mạng phân tán' : '4 distributed network challenges'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isVi
                ? 'Lý do blockchain cần giao thức đồng thuận.'
                : 'Why blockchains require consensus protocols.'}
            </p>
          </div>

          <div className="divide-y divide-slate-800/80 border border-slate-800/80 rounded-lg overflow-hidden bg-[#080C10]">
            {theoryItems.map((item, idx) => {
              const isExpanded = expandedTheoryIndex === idx;
              return (
                <div key={item.num} className="transition-colors">
                  <div
                    onClick={() => toggleTheory(idx)}
                    className="p-3 flex items-center justify-between text-xs hover:bg-slate-900/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500 text-[11px]">{item.num}</span>
                      <span className="text-slate-200 font-medium">
                        {isVi ? item.titleVi : item.titleEn}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                        isExpanded ? 'rotate-180 text-slate-300' : ''
                      }`}
                    />
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 text-xs text-slate-400 bg-[#0B0E12] leading-relaxed border-t border-slate-800/60">
                      {isVi ? item.descVi : item.descEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Next Stage Navigation */}
      {onNextStage && (
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onNextStage}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>{isVi ? 'Tiếp tục: Bài toán Byzantine' : 'Next: Byzantine Problem'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
