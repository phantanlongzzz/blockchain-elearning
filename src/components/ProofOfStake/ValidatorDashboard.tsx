import React from 'react';
import { PoSValidator } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { UserPlus, UserMinus, ArrowRight, Plus, Minus } from 'lucide-react';
import { getValidatorPreset, PARTICIPANT_PRESETS } from './posConstants';

interface ValidatorDashboardProps {
  validators: PoSValidator[];
  onAddParticipant?: () => void;
  onRemoveParticipant?: () => void;
  onUpdateStake?: (id: string, delta: number) => void;
  canAddMore?: boolean;
  canRemove?: boolean;
  onProceedToStep2?: () => void;
}

export const ValidatorDashboard: React.FC<ValidatorDashboardProps> = ({
  validators,
  onAddParticipant,
  onRemoveParticipant,
  onUpdateStake,
  canAddMore = true,
  canRemove = true,
  onProceedToStep2,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const totalStake = validators.reduce((sum, v) => sum + Math.max(0, v.stake), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Section Header & Actions (Clean Hierarchy, Whitespace Driven) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#F2F4F7]">
            {isVi ? 'Danh sách người tham gia' : 'Participants & Stake Distribution'}
          </h3>
          <p className="text-xs text-[#9AA5B5] mt-0.5">
            {isVi
              ? 'Điều chỉnh số ETH đặt cọc để quan sát xác suất được chọn thay đổi.'
              : 'Adjust deposited ETH to observe probability changes in real-time.'}
          </p>
        </div>

        {/* Action Controls: Add, Remove, Total Stake Info */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Add participant (Primary) */}
          {onAddParticipant && (
            <button
              type="button"
              id="pos-add-participant-btn"
              onClick={onAddParticipant}
              disabled={!canAddMore}
              className="px-3 py-1.5 rounded-lg bg-[#00C98D] hover:bg-[#00B982] text-[#090A0F] font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer shadow-sm"
              title={isVi ? 'Thêm người tham gia mới' : 'Add new participant'}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isVi ? '+ Thêm người tham gia' : '+ Add participant'}</span>
            </button>
          )}

          {/* Remove participant (Secondary, Lower visual weight) */}
          {onRemoveParticipant && (
            <button
              type="button"
              id="pos-remove-participant-btn"
              onClick={onRemoveParticipant}
              disabled={!canRemove}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#9AA5B5] hover:text-rose-400 border border-white/[0.06] text-xs flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
              title={isVi ? 'Xóa người tham gia vừa thêm' : 'Remove recently added participant'}
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span>{isVi ? 'Xóa người tham gia' : 'Remove participant'}</span>
            </button>
          )}

          {/* Total Stake Info (Currency in Yellow/Amber) */}
          <div className="px-3 py-1.5 rounded-lg bg-[#0C0F14] border border-white/[0.08] text-xs font-sans">
            <span className="text-[#9AA5B5] mr-1.5">
              {isVi ? 'Tổng cộng:' : 'Total:'}
            </span>
            <span className="font-mono font-bold text-[#F2F4F7]">
              {totalStake.toFixed(0)}
            </span>
            <span className="font-mono font-bold text-amber-400 ml-1">
              ETH
            </span>
          </div>
        </div>
      </div>

      {/* 2. Validator Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {validators.map((validator) => {
          const preset = getValidatorPreset(validator.id, validator.name);
          const hasDeposit = validator.stake > 0;
          const probability = totalStake > 0 ? (validator.stake / totalStake) * 100 : 0;

          return (
            <div
              key={validator.id}
              id={`pos-validator-card-${validator.id}`}
              className={`rounded-xl p-4 sm:p-5 border transition-all flex flex-col justify-between space-y-4 ${
                hasDeposit
                  ? 'bg-[#0C0F14] border-white/[0.08] hover:border-white/[0.16] shadow-sm'
                  : 'bg-[#0C0F14]/50 border-white/[0.04] opacity-70'
              }`}
            >
              {/* Identity: Avatar & Name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-[#090A0F] shadow-sm shrink-0"
                  style={{ backgroundColor: preset.color }}
                >
                  {validator.name[0]}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-[#F2F4F7] truncate">
                    {validator.name}
                  </h4>
                  <span className="text-[11px] text-[#717B8C] block">
                    {hasDeposit
                      ? isVi
                        ? 'Đã đặt cọc'
                        : 'Staked'
                      : isVi
                      ? 'Chưa đặt cọc (0 ETH)'
                      : 'No deposit (0 ETH)'}
                  </span>
                </div>
              </div>

              {/* Primary Data: Stake Amount (ETH in Amber/Yellow) */}
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-[#F2F4F7]">
                    {validator.stake.toFixed(0)}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    ETH
                  </span>
                </div>
              </div>

              {/* Divider & Controls */}
              <div className="border-t border-white/[0.06] pt-3 space-y-3">
                {/* Stake Adjustment Controls: -10 ETH and +10 ETH */}
                {onUpdateStake && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id={`pos-minus-stake-btn-${validator.id}`}
                      onClick={() => onUpdateStake(validator.id, -10)}
                      disabled={validator.stake <= 0}
                      className="px-2 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed border border-white/[0.06] text-[#F2F4F7] text-xs font-mono font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
                      title={isVi ? 'Giảm 10 ETH' : 'Decrease 10 ETH'}
                    >
                      <Minus className="w-3 h-3 text-rose-400" />
                      <span>-10 ETH</span>
                    </button>

                    <button
                      type="button"
                      id={`pos-plus-stake-btn-${validator.id}`}
                      onClick={() => onUpdateStake(validator.id, 10)}
                      className="px-2 py-1.5 rounded-lg bg-[#00C98D]/10 hover:bg-[#00C98D]/20 border border-[#00C98D]/30 text-[#00C98D] text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
                      title={isVi ? 'Tăng 10 ETH' : 'Increase 10 ETH'}
                    >
                      <Plus className="w-3 h-3 text-[#00C98D]" />
                      <span>+10 ETH</span>
                    </button>
                  </div>
                )}

                {/* Probability Indicator: Minimalist Progress Line */}
                <div className="space-y-1">
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-[#00C98D] rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, probability)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#717B8C] font-sans">
                      {isVi ? 'Xác suất' : 'Probability'}
                    </span>
                    <span className="font-semibold text-[#F2F4F7]">
                      {probability.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Core Principle Callout (Lightweight, No Heavy Outer Card) */}
      <div className="border-l-2 border-[#00C98D] pl-3.5 py-1 text-xs text-[#9AA5B5] leading-relaxed">
        <strong className="text-[#00C98D] font-semibold">
          {isVi ? '💡 Quy luật cốt lõi: ' : '💡 Core Principle: '}
        </strong>
        {isVi
          ? 'Đặt cọc càng nhiều ETH → xác suất được chọn giải khối tiếp theo càng cao.'
          : 'More ETH deposited → higher probability of being chosen as block solver.'}
      </div>

      {/* 4. Primary CTA: Continue to Step 2 (Right-aligned, Clean Divider) */}
      {onProceedToStep2 && (
        <div className="border-t border-white/[0.08] pt-4 flex justify-end">
          <button
            type="button"
            id="pos-proceed-to-step2-btn"
            onClick={onProceedToStep2}
            className="px-5 py-2.5 rounded-lg bg-[#00C98D] hover:bg-[#00B982] text-[#090A0F] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <span>{isVi ? 'Tiếp tục: Chọn người giải khối' : 'Continue: Select Block Solver'}</span>
            <ArrowRight className="w-4 h-4 text-[#090A0F]" />
          </button>
        </div>
      )}
    </div>
  );
};
