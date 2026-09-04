import React, { useState } from 'react';
import {
  GitFork,
  AlertTriangle,
  Trophy,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Zap,
  Flame,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { E2EBlock } from './types';

interface ForkAndLongestChainPipelineProps {
  forkActive: boolean;
  parentBlock: E2EBlock | null;
  branchABlocks: E2EBlock[];
  branchBBlocks: E2EBlock[];
  cumulativeWorkA: number;
  cumulativeWorkB: number;
  activeMainBranch: 'branchA' | 'branchB' | 'tied';
  orphanedBlocks: E2EBlock[];
  onMineNextOnBranch: (branch: 'branchA' | 'branchB') => void;
  onAutoResolveFork: () => void;
  onResetFork: () => void;
  isMining: boolean;
  language: 'vi' | 'en';
}

export const ForkAndLongestChainPipeline: React.FC<ForkAndLongestChainPipelineProps> = ({
  forkActive,
  parentBlock,
  branchABlocks,
  branchBBlocks,
  cumulativeWorkA,
  cumulativeWorkB,
  activeMainBranch,
  orphanedBlocks,
  onMineNextOnBranch,
  onAutoResolveFork,
  onResetFork,
  isMining,
  language,
}) => {
  const [activeGuidedStep, setActiveGuidedStep] = useState<number>(() => {
    if (orphanedBlocks.length > 0) return 5;
    if (branchABlocks.length > 1 || branchBBlocks.length > 1) return 4;
    return 1;
  });

  const isTied = activeMainBranch === 'tied';
  const totalWork = Math.max(1, cumulativeWorkA + cumulativeWorkB);
  const percentA = Math.round((cumulativeWorkA / totalWork) * 100);
  const percentB = Math.round((cumulativeWorkB / totalWork) * 100);

  const guidedSteps = [
    {
      step: 1,
      titleVi: '1. Phân nhánh xảy ra',
      titleEn: '1. Fork Occurs',
      descVi: 'Hai thợ đào (Alice & Bob) tìm được khối hợp lệ tại cùng chiều cao đồng thời.',
      descEn: 'Two miners (Alice & Bob) found valid blocks at the same height simultaneously.',
    },
    {
      step: 2,
      titleVi: '2. Phân cực mạng P2P',
      titleEn: '2. P2P Network Split',
      descVi: 'Các nút chấp nhận khối đến trước theo vị trí địa lý. Mạng tạm thời có 2 chain tip.',
      descEn: 'Nodes accept whichever block arrives first locally. Network temporarily holds two chain tips.',
    },
    {
      step: 3,
      titleVi: '3. Đua đào tiếp nối',
      titleEn: '3. Continued Mining',
      descVi: 'Các thợ đào tiếp tục giải PoW trên đỉnh nhánh họ đang giữ.',
      descEn: 'Miners continue the PoW race on their current branch tip.',
    },
    {
      step: 4,
      titleVi: '4. So sánh PoW tích lũy',
      titleEn: '4. Cumulative Work Rule',
      descVi: 'Quy tắc Nakamoto: Chuỗi có tổng công việc tích lũy (Cumulative PoW) lớn nhất sẽ thắng.',
      descEn: 'Nakamoto Rule: The branch with the highest cumulative proof-of-work is chosen.',
    },
    {
      step: 5,
      titleVi: '5. Phân định đồng thuận',
      titleEn: '5. Consensus Reorg',
      descVi: 'Toàn bộ mạng hội tụ và công nhận nhánh nặng nhất làm chuỗi chính thức.',
      descEn: 'The entire network converges on the heaviest branch as canonical.',
    },
    {
      step: 6,
      titleVi: '6. Khối mồ côi & Mempool',
      titleEn: '6. Orphaned & Mempool',
      descVi: 'Khối nhánh thua chuyển thành mồ côi. Giao dịch chưa xác nhận trở lại Mempool an toàn.',
      descEn: 'Losing branch blocks become Orphaned. Unconfirmed transactions return safely to the Mempool.',
    },
  ];

  return (
    <div id="e2e-fork-longest-chain-pipeline" className="space-y-6 font-sans">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-100">
              {language === 'vi'
                ? 'Phân nhánh & Giải quyết xung đột (Fork & Heaviest Chain)'
                : 'Fork Competition & Heaviest Chain Rule'}
            </h3>
            {forkActive ? (
              isTied ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-sans bg-amber-950/40 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  {language === 'vi' ? 'Đang phân nhánh' : 'Fork active'}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-sans bg-success/10 text-success border border-success/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  {language === 'vi'
                    ? `Đã phân định: ${activeMainBranch === 'branchA' ? 'Nhánh A (Alice)' : 'Nhánh B (Bob)'}`
                    : `Resolved: ${activeMainBranch === 'branchA' ? 'Branch A (Alice)' : 'Branch B (Bob)'}`}
                </span>
              )
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-sans bg-zinc-900 text-zinc-400 border border-zinc-800">
                {language === 'vi' ? 'Chuỗi đơn nhất' : 'Single chain'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            {language === 'vi'
              ? 'Mô phỏng xung đột hai khối được tìm thấy đồng thời. Mạng giải quyết bằng công việc tích lũy (Cumulative PoW = Σ 16^Difficulty).'
              : 'Simulate conflicting blocks mined simultaneously. Consensus resolves strictly by Cumulative PoW (Σ 16^Difficulty).'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onMineNextOnBranch('branchA')}
            disabled={isMining}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>+ {language === 'vi' ? 'Đào trên Nhánh A' : 'Mine on Branch A'}</span>
          </button>

          <button
            type="button"
            onClick={() => onMineNextOnBranch('branchB')}
            disabled={isMining}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-400 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>+ {language === 'vi' ? 'Khai thác trên Nhánh B' : 'Mine on Branch B'}</span>
          </button>

          <button
            type="button"
            onClick={onAutoResolveFork}
            disabled={isMining}
 className="px-3.5 py-1.5 rounded-lg bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Tự động phân định' : 'Auto-resolve'}</span>
          </button>

          <button
            type="button"
            onClick={onResetFork}
            disabled={isMining}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Đặt lại phân nhánh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Fork Container */}
      <div className="bg-[#0c101c] border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-6">
        {/* Cumulative Work Comparison Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-medium">
              Nhánh A (Alice): {cumulativeWorkA.toLocaleString()} PoW ({percentA}%)
            </span>
            <span className="text-amber-400 font-medium">
              Nhánh B (Bob): {cumulativeWorkB.toLocaleString()} PoW ({percentB}%)
            </span>
          </div>

          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${percentA}%` }}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${percentB}%` }}
            />
          </div>
        </div>

        {/* Competing Branches Visual Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Branch A */}
          <div
            className={`p-4 rounded-xl border transition-colors ${
              activeMainBranch === 'branchA'
                ? 'bg-[#080c16] border-border-primary shadow-sm'
                : 'bg-[#080c16] border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-semibold text-zinc-100 text-xs">
                  Nhánh A (Alice Node)
                </span>
              </div>
              {activeMainBranch === 'branchA' && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/[0.06] text-text-secondary border border-border-primary font-medium">
                  {language === 'vi' ? 'Chuỗi chính (Canonical)' : 'Canonical Chain'}
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Số khối trên nhánh:</span>
                <span className="font-mono text-zinc-200">{branchABlocks.length} khối</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>PoW tích lũy:</span>
                <span className="font-mono text-emerald-400 font-semibold">{cumulativeWorkA.toLocaleString()} work</span>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                {branchABlocks.map((blk) => (
                  <div
                    key={blk.id}
                    className="p-2 rounded bg-[#060911] border border-zinc-800 text-[11px] font-mono flex items-center justify-between"
                  >
                    <span className="text-zinc-300">Khối #{blk.height} (Nonce: {blk.nonce})</span>
                    <span className="text-zinc-500">{blk.hash.substring(0, 10)}...</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Branch B */}
          <div
            className={`p-4 rounded-xl border transition-colors ${
              activeMainBranch === 'branchB'
                ? 'bg-[#080c16] border-amber-500/50 shadow-sm'
                : 'bg-[#080c16] border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-semibold text-zinc-100 text-xs">
                  Nhánh B (Bob Node)
                </span>
              </div>
              {activeMainBranch === 'branchB' && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-300 border border-amber-500/30 font-medium">
                  {language === 'vi' ? 'Chuỗi chính (Canonical)' : 'Canonical Chain'}
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Số khối trên nhánh:</span>
                <span className="font-mono text-zinc-200">{branchBBlocks.length} khối</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>PoW tích lũy:</span>
                <span className="font-mono text-amber-400 font-semibold">{cumulativeWorkB.toLocaleString()} work</span>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                {branchBBlocks.map((blk) => (
                  <div
                    key={blk.id}
                    className="p-2 rounded bg-[#060911] border border-zinc-800 text-[11px] font-mono flex items-center justify-between"
                  >
                    <span className="text-zinc-300">Khối #{blk.height} (Nonce: {blk.nonce})</span>
                    <span className="text-zinc-500">{blk.hash.substring(0, 10)}...</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Orphaned Blocks Section if any */}
        {orphanedBlocks.length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2 text-xs">
            <span className="font-semibold text-rose-300 block">
              {language === 'vi' ? 'Khối mồ côi (Orphaned Blocks) & Thu hồi giao dịch:' : 'Orphaned Blocks & Transaction Recovery:'}
            </span>
            <p className="text-zinc-400 text-[11px]">
              {language === 'vi'
                ? `Có ${orphanedBlocks.length} khối bị loại bỏ khỏi chuỗi chính thức. Tất cả các giao dịch hợp lệ chưa có trên chuỗi thắng đã được tự động hoàn trả an toàn về Mempool.`
                : `${orphanedBlocks.length} blocks were orphaned. All unconfirmed valid transactions are safely restored back to the Mempool.`}
            </p>
          </div>
        )}

        {/* Educational Stepper Tabs */}
        <div className="pt-4 border-t border-zinc-800 space-y-3">
          <span className="text-xs font-medium text-zinc-300 block">
            {language === 'vi' ? 'Quy trình giải quyết phân nhánh từng bước:' : 'Step-by-step Fork Resolution:'}
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {guidedSteps.map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveGuidedStep(s.step)}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  activeGuidedStep === s.step
                    ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                    : 'bg-[#080c16] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="font-semibold text-[11px] truncate text-zinc-200">
                  {language === 'vi' ? s.titleVi : s.titleEn}
                </div>
                <div className="text-[10px] text-zinc-400 line-clamp-2 mt-1 font-sans leading-snug">
                  {language === 'vi' ? s.descVi : s.descEn}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
