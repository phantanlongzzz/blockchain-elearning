import React from 'react';
import { PoSValidator } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { Coins, UserPlus, UserMinus, ArrowRight, Sparkles, Plus, Minus } from 'lucide-react';
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

  const totalStake = validators.reduce((sum, v) => sum + Math.max(0, v.stake), 0);

  return (
    <div className="bg-[#0C0F14] border border-[#1C2430] rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Step Header & Add/Remove Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1C2430]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.35)] flex items-center justify-center text-[#00C98D] shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#F2F4F7] font-sans">
              {language === 'vi' ? 'Danh sách người tham gia & Đặt cọc ETH' : 'Participants & ETH Stake Distribution'}
            </h3>
            <p className="text-xs text-[#A5AFBF] mt-0.5 font-sans">
              {language === 'vi'
                ? 'Điều chỉnh số ETH đặt cọc của từng người để quan sát xác suất được chọn thay đổi ngay lập tức.'
                : 'Adjust each participant’s ETH deposit to observe real-time probability changes.'}
            </p>
          </div>
        </div>

        {/* Action Controls: Add Participant, Remove Participant, Total Deposit */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Add participant button */}
          {onAddParticipant && (
            <button
              type="button"
              id="pos-add-participant-btn"
              onClick={onAddParticipant}
              disabled={!canAddMore}
              className="px-3 py-1.5 rounded-lg bg-[rgba(0,201,141,0.12)] hover:bg-[rgba(0,201,141,0.2)] text-[#00C98D] border border-[rgba(0,201,141,0.35)] font-sans font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
              title={language === 'vi' ? 'Thêm người tham gia mới vào mạng lưới' : 'Add new participant to the network'}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? '+ Thêm người tham gia' : '+ Add participant'}</span>
            </button>
          )}

          {/* Remove participant button */}
          {onRemoveParticipant && (
            <button
              type="button"
              id="pos-remove-participant-btn"
              onClick={onRemoveParticipant}
              disabled={!canRemove}
              className="px-3 py-1.5 rounded-lg bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-rose-300 border border-[#1C2430] font-sans font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:hover:text-[#A5AFBF] transition-all cursor-pointer"
              title={language === 'vi' ? 'Xóa người tham gia vừa thêm' : 'Remove most recently added participant'}
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Xóa người tham gia' : 'Remove participant'}</span>
            </button>
          )}

          {/* Total Deposit Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F131A] border border-[#1C2430]">
            <span className="text-xs text-[#A5AFBF] font-sans">
              {language === 'vi' ? 'Tổng cọc:' : 'Total Stake:'}
            </span>
            <span className="font-mono font-bold text-[#00C98D] text-xs sm:text-sm">
              {totalStake.toFixed(0)} ETH
            </span>
          </div>
        </div>
      </div>

      {/* Simplified Participant Cards Grid with +10 ETH / -10 ETH Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {validators.map((validator) => {
          const preset = getValidatorPreset(validator.id, validator.name);
          const hasDeposit = validator.stake > 0;
          const probability = totalStake > 0 ? (validator.stake / totalStake) * 100 : 0;

          return (
            <div
              key={validator.id}
              id={`pos-validator-card-${validator.id}`}
              className={`rounded-xl p-4 sm:p-5 border transition-all relative flex flex-col justify-between space-y-4 ${
                hasDeposit
                  ? 'bg-[#0F131A] border-[#1C2430] hover:border-[#24313D] shadow-sm'
                  : 'bg-[#0F131A]/50 border-[#1C2430]/60 opacity-70'
              }`}
            >
              {/* Top: Avatar & Name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-[#090A0F] shadow-sm shrink-0"
                  style={{ backgroundColor: preset.color }}
                >
                  {validator.name[0]}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-[#F2F4F7] font-sans truncate">
                    {validator.name}
                  </h4>
                  <span className="text-[11px] text-[#A5AFBF] font-sans">
                    {hasDeposit
                      ? language === 'vi'
                        ? 'Đã đặt cọc'
                        : 'Staked'
                      : language === 'vi'
                      ? 'Chưa đặt cọc (0 ETH)'
                      : 'No deposit (0 ETH)'}
                  </span>
                </div>
              </div>

              {/* Middle: Clean Stake Amount Display */}
              <div className="space-y-0.5 py-0.5">
                <span className="text-xs text-[#A5AFBF] font-sans block">
                  {language === 'vi' ? 'Tiền đặt cọc' : 'Stake amount'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-[#F2F4F7]">
                    {validator.stake.toFixed(0)}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#00C98D]">ETH</span>
                </div>
              </div>

              {/* Stake Adjustment Controls: -10 ETH and +10 ETH */}
              {onUpdateStake && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    id={`pos-minus-stake-btn-${validator.id}`}
                    onClick={() => onUpdateStake(validator.id, -10)}
                    disabled={validator.stake <= 0}
                    className="px-2.5 py-1.5 rounded-md bg-[#0B0F15] hover:bg-[#11161E] disabled:opacity-30 disabled:cursor-not-allowed border border-[#1C2430] text-[#F2F4F7] text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                    title={language === 'vi' ? 'Giảm 10 ETH' : 'Decrease 10 ETH'}
                  >
                    <Minus className="w-3 h-3 text-rose-400" />
                    <span>-10 ETH</span>
                  </button>

                  <button
                    type="button"
                    id={`pos-plus-stake-btn-${validator.id}`}
                    onClick={() => onUpdateStake(validator.id, 10)}
                    className="px-2.5 py-1.5 rounded-md bg-[rgba(0,201,141,0.08)] hover:bg-[rgba(0,201,141,0.15)] border border-[rgba(0,201,141,0.35)] text-[#00C98D] text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shadow-sm"
                    title={language === 'vi' ? 'Tăng 10 ETH' : 'Increase 10 ETH'}
                  >
                    <Plus className="w-3 h-3 text-[#00C98D]" />
                    <span>+10 ETH</span>
                  </button>
                </div>
              )}

              {/* Bottom: Selection Probability Display */}
              <div
                className={`px-3 py-1.5 rounded-lg border text-center font-sans font-semibold text-xs transition-all ${
                  hasDeposit
                    ? 'bg-[#0B0F15] border-[#1C2430] text-[#00C98D]'
                    : 'bg-[#0B0F15]/40 border-[#1C2430] text-[#717B8C]'
                }`}
              >
                {hasDeposit ? (
                  <span className="font-mono">
                    <strong>{probability.toFixed(1)}%</strong>{' '}
                    <span className="font-sans font-normal text-[#A5AFBF]">
                      {language === 'vi' ? 'xác suất' : 'probability'}
                    </span>
                  </span>
                ) : (
                  <span className="text-[#717B8C]">
                    {language === 'vi' ? '0.0% xác suất' : '0.0% probability'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational Note & CTA to Step 2 */}
      <div className="p-4 rounded-xl bg-[#0F131A] border border-[#1C2430] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#00C98D] shrink-0" />
          <p className="text-xs sm:text-sm text-[#F2F4F7] font-sans leading-relaxed">
            <strong className="text-[#00C98D]">
              {language === 'vi' ? 'Quy luật cốt lõi: ' : 'Core Principle: '}
            </strong>
            {language === 'vi'
              ? 'Đặt cọc càng nhiều ETH → xác suất được chọn giải khối tiếp theo càng cao.'
              : 'More ETH deposited → higher probability of being chosen as block solver.'}
          </p>
        </div>

        {onProceedToStep2 && (
          <button
            type="button"
            id="pos-proceed-to-step2-btn"
            onClick={onProceedToStep2}
            className="px-4 py-2 rounded-lg bg-[#00C98D] hover:bg-[#00B982] text-[#090A0F] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 font-sans shadow-sm"
          >
            <span>{language === 'vi' ? 'Tiếp tục: Chọn người giải khối' : 'Continue: Select Block Solver'}</span>
            <ArrowRight className="w-4 h-4 text-[#090A0F]" />
          </button>
        )}
      </div>
    </div>
  );
};

