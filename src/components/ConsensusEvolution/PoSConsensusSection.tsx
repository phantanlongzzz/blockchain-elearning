import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Code,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ProofOfStakeLab } from '../ProofOfStake/ProofOfStakeLab';

interface ValidatorState {
  id: string;
  name: string;
  stake: number;
  isSelectedProposer?: boolean;
  isSlashed?: boolean;
}

interface PoSConsensusSectionProps {
  isHandsOn?: boolean;
  onInteracted?: () => void;
  onPrevStage?: () => void;
  onNextStage?: () => void;
  onOpenCode?: (tab: 'pos') => void;
}

export const PoSConsensusSection: React.FC<PoSConsensusSectionProps> = ({
  onInteracted,
  onPrevStage,
  onNextStage,
  onOpenCode,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [validators, setValidators] = useState<ValidatorState[]>([
    { id: 'alice', name: 'Alice', stake: 10 },
    { id: 'bob', name: 'Bob', stake: 20 },
    { id: 'charlie', name: 'Charlie', stake: 50 },
    { id: 'dave', name: 'Dave', stake: 100 },
  ]);

  const [selectedProposerId, setSelectedProposerId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [slashingSimulated, setSlashingSimulated] = useState<boolean>(false);
  const [showFullPoSLabModal, setShowFullPoSLabModal] = useState<boolean>(false);

  const totalStake = validators.reduce((sum, v) => sum + (v.isSlashed ? 0 : v.stake), 0);

  const handleUpdateStake = (id: string, delta: number) => {
    setValidators((prev) =>
      prev.map((v) => (v.id === id ? { ...v, stake: Math.max(5, v.stake + delta), isSlashed: false } : v))
    );
    setSelectedProposerId(null);
    setSlashingSimulated(false);
  };

  const handleRunProposerSelection = () => {
    setIsSelecting(true);
    setSelectedProposerId(null);
    setSlashingSimulated(false);
    onInteracted?.();

    setTimeout(() => {
      const activeValidators = validators.filter((v) => !v.isSlashed);
      const activeTotalStake = activeValidators.reduce((sum, v) => sum + v.stake, 0);
      let rand = Math.random() * activeTotalStake;
      let chosen = activeValidators[0].id;

      for (const v of activeValidators) {
        if (rand < v.stake) {
          chosen = v.id;
          break;
        }
        rand -= v.stake;
      }

      setSelectedProposerId(chosen);
      setIsSelecting(false);
    }, 700);
  };

  const handleSimulateSlashing = () => {
    setSlashingSimulated(true);
    onInteracted?.();
    setValidators((prev) =>
      prev.map((v) => (v.id === 'dave' ? { ...v, isSlashed: true, stake: 0 } : v))
    );
    setSelectedProposerId(null);
  };

  const handleReset = () => {
    setValidators([
      { id: 'alice', name: 'Alice', stake: 10 },
      { id: 'bob', name: 'Bob', stake: 20 },
      { id: 'charlie', name: 'Charlie', stake: 50 },
      { id: 'dave', name: 'Dave', stake: 100 },
    ]);
    setSelectedProposerId(null);
    setSlashingSimulated(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* 1. Header */}
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 font-sans tracking-tight">
              {isVi ? 'Bằng chứng cổ phần (Proof of Stake)' : 'Proof of stake consensus'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isVi
                ? 'Lựa chọn người đề xuất khối theo trọng số vốn ký quỹ (Staking) và trừng phạt vi phạm (Slashing).'
                : 'Select block proposers weighted by locked capital and deter Byzantine actions with slashing.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenCode?.('pos')}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{isVi ? 'Mã nguồn' : 'Code'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFullPoSLabModal(true)}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isVi ? 'Mở PoS Lab' : 'Open PoS Lab'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Staking Sandbox */}
      <div className="p-5 rounded-xl bg-[#0c101c] border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-medium text-slate-300">
              {isVi ? 'Hội đồng xác thực' : 'Validator pool'}
            </span>
            <div className="text-xs text-slate-500 mt-0.5">
              {isVi ? 'Tổng tiền cọc: ' : 'Total active stake: '}
              <span className="text-emerald-400 font-medium font-mono">{totalStake} ETH</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isVi ? 'Khôi phục' : 'Reset'}</span>
            </button>
            <button
              type="button"
              onClick={handleSimulateSlashing}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>{isVi ? 'Mô phỏng Slashing (Dave)' : 'Simulate Slashing'}</span>
            </button>
            <button
              type="button"
              onClick={handleRunProposerSelection}
              disabled={isSelecting}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>
                {isSelecting
                  ? isVi ? 'Đang chọn...' : 'Selecting...'
                  : isVi ? 'Chọn người đề xuất khối' : 'Select Proposer'}
              </span>
            </button>
          </div>
        </div>

        {/* 4 Validator Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {validators.map((val) => {
            const percentage = totalStake > 0 ? ((val.stake / totalStake) * 100).toFixed(1) : '0';
            const isWinner = selectedProposerId === val.id;

            return (
              <div
                key={val.id}
                className={`p-3.5 rounded-lg border transition-colors flex flex-col justify-between space-y-3 ${
                  val.isSlashed
                    ? 'bg-rose-950/20 border-rose-500/30 opacity-60'
                    : isWinner
                    ? 'bg-emerald-950/30 border-emerald-500/60'
                    : 'bg-[#080c16] border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200">{val.name}</span>
                    {isWinner && (
                      <span className="text-[10px] font-medium text-emerald-400">
                        {isVi ? 'Đề xuất khối ✓' : 'Proposer ✓'}
                      </span>
                    )}
                    {val.isSlashed && (
                      <span className="text-[10px] font-medium text-rose-400">
                        {isVi ? 'Bị Slashing' : 'Slashed'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>{isVi ? 'Tiền cọc:' : 'Stake:'}</span>
                      <span className="text-slate-200 font-mono font-medium">{val.stake} ETH</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>{isVi ? 'Tỉ lệ chọn:' : 'Probability:'}</span>
                      <span className="text-emerald-400 font-mono font-medium">{percentage}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1 rounded-full bg-slate-900 overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {!val.isSlashed && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-[11px] text-slate-500">{isVi ? 'Cọc:' : 'Adjust:'}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateStake(val.id, -10)}
                        className="w-5 h-5 rounded bg-[#04060b] hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center cursor-pointer text-xs"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStake(val.id, 10)}
                        className="w-5 h-5 rounded bg-[#04060b] hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center cursor-pointer text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Slashing outcome banner */}
        {slashingSimulated && (
          <div className="p-3.5 rounded-lg bg-[#080c16] border border-rose-500/40 text-xs flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
            <div>
              <span className="font-semibold text-rose-300">
                {isVi ? 'Hình phạt Slashing được thi hành' : 'Slashing penalty executed'}
              </span>
              <p className="text-slate-400 text-xs mt-0.5">
                {isVi
                  ? 'Dave bị phát hiện ký 2 khối mâu thuẫn trong cùng một slot. Toàn bộ 100 ETH cọc bị thiêu hủy.'
                  : 'Dave committed equivocation (double-signing). 100% of his 100 ETH stake was burned.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Full PoS Lab Modal */}
      {showFullPoSLabModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100">
                {isVi ? 'Phòng thí nghiệm Proof of Stake' : 'Proof of stake laboratory'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFullPoSLabModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>
            </div>
            <ProofOfStakeLab onInteracted={onInteracted} />
          </div>
        </div>
      )}

      {/* Navigation footer */}
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
            <span>{isVi ? 'Tiếp tục: So sánh PoW vs PoS' : 'Next: Compare PoW vs PoS'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
