import React, { useState } from 'react';
import { PoSValidator } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { PieChart, ArrowRight, ArrowLeft, Sparkles, RefreshCw, Play, Trophy } from 'lucide-react';
import { getValidatorPreset } from './posConstants';

interface StakeDistributionBarProps {
  validators: PoSValidator[];
  selectedProposerId?: string | null;
  isSelecting?: boolean;
  onStartSelection?: () => void;
  onProceedToStep3?: () => void;
  onBackToStep1?: () => void;
}

export const StakeDistributionBar: React.FC<StakeDistributionBarProps> = ({
  validators,
  selectedProposerId,
  isSelecting = false,
  onStartSelection,
  onProceedToStep3,
  onBackToStep1,
}) => {
  const { language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Active validators with deposit > 0
  const activeValidators = validators.filter((v) => v.stake > 0);
  const totalActiveStake = activeValidators.reduce((acc, v) => acc + v.stake, 0);

  // Donut SVG geometry
  const size = 300;
  const center = size / 2;
  const outerRadius = 126;
  const innerRadius = 78;

  let cumulativeAngle = -Math.PI / 2;

  const slices = activeValidators.map((val) => {
    const percentage = totalActiveStake > 0 ? (val.stake / totalActiveStake) * 100 : 0;
    const angleDelta = (percentage / 100) * (2 * Math.PI);

    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angleDelta;
    cumulativeAngle = endAngle;

    const midAngle = startAngle + angleDelta / 2;
    const midRadius = (outerRadius + innerRadius) / 2;

    const gap = activeValidators.length > 1 ? 0.02 : 0;
    const effectiveStart = startAngle + gap;
    const effectiveEnd = Math.max(effectiveStart, endAngle - gap);

    const xOuter1 = center + outerRadius * Math.cos(effectiveStart);
    const yOuter1 = center + outerRadius * Math.sin(effectiveStart);
    const xOuter2 = center + outerRadius * Math.cos(effectiveEnd);
    const yOuter2 = center + outerRadius * Math.sin(effectiveEnd);

    const xInner2 = center + innerRadius * Math.cos(effectiveEnd);
    const yInner2 = center + innerRadius * Math.sin(effectiveEnd);
    const xInner1 = center + innerRadius * Math.cos(effectiveStart);
    const yInner1 = center + innerRadius * Math.sin(effectiveStart);

    const largeArc = angleDelta > Math.PI ? 1 : 0;

    const pathData =
      angleDelta >= 2 * Math.PI - 0.001
        ? `M ${center} ${center - outerRadius}
           A ${outerRadius} ${outerRadius} 0 1 1 ${center} ${center + outerRadius}
           A ${outerRadius} ${outerRadius} 0 1 1 ${center} ${center - outerRadius}
           M ${center} ${center - innerRadius}
           A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center + innerRadius}
           A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius} Z`
        : `M ${xOuter1} ${yOuter1}
           A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${xOuter2} ${yOuter2}
           L ${xInner2} ${yInner2}
           A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${xInner1} ${yInner1}
           Z`;

    const labelX = center + midRadius * Math.cos(midAngle);
    const labelY = center + midRadius * Math.sin(midAngle);
    const preset = getValidatorPreset(val.id, val.name);

    return {
      validator: val,
      preset,
      percentage,
      pathData,
      labelX,
      labelY,
      colorHex: preset.color,
      colorGlow: preset.glow,
      textClass: preset.textClass,
      isHovered: hoveredId === val.id,
      isSelected: selectedProposerId === val.id,
    };
  });

  const selectedValidator = validators.find((v) => v.id === selectedProposerId);
  const selectedName = selectedValidator ? selectedValidator.name : '';

  return (
    <div
      id="pos-stake-distribution-section"
      className="bg-[#0C0F14] border border-[#1C2430] rounded-2xl p-5 sm:p-6 shadow-xl space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C2430]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.35)] flex items-center justify-center text-[#00C98D] shrink-0">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[rgba(0,201,141,0.12)] text-[#00C98D] border border-[rgba(0,201,141,0.35)]">
                {language === 'vi' ? 'BƯỚC 2' : 'STEP 2'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#F2F4F7] font-display">
                {language === 'vi' ? 'Chọn người giải khối theo xác suất' : 'Probability-Weighted Selection'}
              </h3>
            </div>
            <p className="text-xs text-[#A5AFBF] mt-0.5">
              {language === 'vi'
                ? 'Hệ thống quay vòng xác suất: ai đặt cọc càng nhiều ETH thì diện tích ô càng lớn, xác suất được chọn càng cao.'
                : 'Weighted lottery wheel: participants with more deposited ETH have a proportionally larger slice and higher selection probability.'}
            </p>
          </div>
        </div>

        {/* Action Button to trigger selection */}
        {onStartSelection && (
          <button
            type="button"
            id="pos-start-selection-btn"
            onClick={onStartSelection}
            disabled={isSelecting || totalActiveStake <= 0}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0 ${
              isSelecting
                ? 'bg-[rgba(0,201,141,0.12)] text-[#00C98D] border border-[rgba(0,201,141,0.4)] cursor-wait animate-pulse'
                : 'bg-[#00C98D] hover:bg-[#00B982] text-[#090A0F]'
            }`}
          >
            {isSelecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#00C98D]" />
                <span>{language === 'vi' ? 'ĐANG CHỌN NGƯỜI GIẢI KHỐI...' : 'SELECTING BLOCK SOLVER...'}</span>
              </>
            ) : selectedProposerId ? (
              <>
                <RefreshCw className="w-4 h-4 text-[#090A0F]" />
                <span>{language === 'vi' ? 'Chọn lại người giải khối' : 'Reselect Block Solver'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-[#090A0F]" />
                <span>{language === 'vi' ? 'Bắt đầu chọn người giải khối' : 'Select Block Solver'}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Donut Chart */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative py-2">
          <div className="relative w-[300px] h-[300px] flex items-center justify-center">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-lg select-none">
              {/* Background Guide Circle */}
              <circle
                cx={center}
                cy={center}
                r={(outerRadius + innerRadius) / 2}
                fill="none"
                stroke="#1C2430"
                strokeWidth={outerRadius - innerRadius}
                opacity={0.6}
              />

              {/* Slices */}
              {totalActiveStake > 0 ? (
                slices.map((slice) => {
                  const isHighlighted = slice.isHovered || slice.isSelected;
                  const isDimmed = (hoveredId !== null && !slice.isHovered) || (selectedProposerId && !slice.isSelected);

                  return (
                    <g
                      key={slice.validator.id}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredId(slice.validator.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <path
                        d={slice.pathData}
                        fill={slice.colorHex}
                        opacity={isDimmed ? 0.35 : 1}
                        stroke={
                          slice.isSelected
                            ? '#FFFFFF'
                            : slice.isHovered
                            ? '#FFFFFF'
                            : '#090A0F'
                        }
                        strokeWidth={slice.isSelected ? 3.5 : slice.isHovered ? 2.5 : 1.5}
                        style={{
                          filter: slice.isSelected
                            ? `drop-shadow(0 0 12px ${slice.colorGlow})`
                            : slice.isHovered
                            ? `drop-shadow(0 0 8px ${slice.colorGlow})`
                            : undefined,
                          transition: 'all 0.25s ease-out',
                        }}
                      />

                      {/* Percentage label inside slice */}
                      {slice.percentage >= 6 && (
                        <text
                          x={slice.labelX}
                          y={slice.labelY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#FFFFFF"
                          className="font-mono font-black text-[12px] pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                        >
                          {slice.percentage.toFixed(1)}%
                        </text>
                      )}
                    </g>
                  );
                })
              ) : null}
            </svg>

            {/* Donut Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {isSelecting ? (
                <div className="flex flex-col items-center">
                  <RefreshCw className="w-5 h-5 text-[#00C98D] animate-spin mb-1" />
                  <span className="text-[11px] font-mono font-medium text-[#00C98D]">
                    {language === 'vi' ? 'ĐANG CHỌN...' : 'SELECTING...'}
                  </span>
                </div>
              ) : selectedValidator ? (
                <div className="animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-[rgba(0,201,141,0.15)] flex items-center justify-center text-[#00C98D] mb-0.5">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-black text-[#F2F4F7] font-display">
                    {selectedName}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#00C98D]">
                    {selectedValidator.stake.toFixed(0)} ETH
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#717B8C] mb-0.5">
                    {language === 'vi' ? 'TỔNG ĐẶT CỌC' : 'TOTAL STAKE'}
                  </span>
                  <span className="text-2xl font-black font-mono text-[#00C98D] tracking-tight">
                    {totalActiveStake.toFixed(0)}
                  </span>
                  <span className="text-[11px] font-mono text-[#717B8C]">ETH</span>
                </div>
              )}
            </div>
          </div>

          {/* Educational Note directly under Visualization */}
          <div className="mt-3 text-center">
            <p className="text-xs sm:text-sm font-semibold text-[#00C98D] font-sans">
              {language === 'vi'
                ? 'Đặt cọc càng nhiều ETH → xác suất được chọn càng cao.'
                : 'More ETH deposited → higher chance of being selected.'}
            </p>
          </div>
        </div>

        {/* Right: Legend & Winner Announcement */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* Winner Announcement Banner */}
          {selectedValidator ? (
            <div className="p-4 rounded-xl bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.35)] shadow-sm space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-[#00C98D] font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#00C98D] shrink-0" />
                <span>
                  {selectedName} {language === 'vi' ? 'được chọn giải khối!' : 'was selected as Block Solver!'}
                </span>
              </div>
              <p className="text-xs text-[#A5AFBF] leading-relaxed">
                <strong className="text-[#F2F4F7]">{selectedName}</strong>{' '}
                {language === 'vi'
                  ? `có xác suất được chọn là ${((selectedValidator.stake / totalActiveStake) * 100).toFixed(1)}% tương ứng với lượng ETH đặt cọc.`
                  : `has a selection probability of ${((selectedValidator.stake / totalActiveStake) * 100).toFixed(1)}% corresponding to their deposited ETH stake.`}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0F131A] border border-[#1C2430] text-xs text-[#A5AFBF] leading-relaxed">
              <div className="font-bold text-[#F2F4F7] mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00C98D]" />
                <span>{language === 'vi' ? 'Cách thức lựa chọn:' : 'How Selection Works:'}</span>
              </div>
              {language === 'vi'
                ? 'Nhấn nút "Bắt đầu chọn người giải khối" phía trên. Hệ thống sẽ chọn ngẫu nhiên một người — ai đặt cọc càng nhiều ETH thì cơ hội trúng càng lớn.'
                : 'Click "Select Block Solver" above. The system randomly selects one block solver — higher ETH deposit gives a higher winning probability.'}
            </div>
          )}

          {/* Participant Mini Cards */}
          <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
            {validators.map((val) => {
              const preset = getValidatorPreset(val.id, val.name);
              const isSelected = selectedProposerId === val.id;
              const percentage = totalActiveStake > 0 ? (val.stake / totalActiveStake) * 100 : 0;

              return (
                <div
                  key={val.id}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[rgba(0,201,141,0.12)] border-[#00C98D] shadow-sm ring-1 ring-[#00C98D]'
                      : val.stake > 0
                      ? 'bg-[#0F131A] border-[#1C2430]'
                      : 'bg-[#0B0F15]/40 border-[#1C2430]/40 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: preset.color }} />
                      <span className="text-xs font-bold text-[#F2F4F7] truncate">{val.name}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[9px] font-bold px-1 rounded bg-[rgba(0,201,141,0.2)] text-[#00C98D]">
                        ✓ {language === 'vi' ? 'Chọn' : 'Chosen'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between text-[11px] font-mono">
                    <span className="text-[#A5AFBF]">{val.stake.toFixed(0)} ETH</span>
                    <span className={val.stake > 0 ? preset.textClass : 'text-[#717B8C]'}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Controls between Steps */}
      <div className="pt-4 border-t border-[#1C2430] flex flex-col sm:flex-row items-center justify-between gap-3">
        {onBackToStep1 && (
          <button
            type="button"
            id="pos-back-to-step1-btn"
            onClick={onBackToStep1}
            className="px-4 py-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] border border-[#1C2430] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Quay lại: Đặt cọc' : 'Back: Deposit'}</span>
          </button>
        )}

        {onProceedToStep3 && selectedProposerId && (
          <button
            type="button"
            id="pos-proceed-to-step3-btn"
            onClick={onProceedToStep3}
            className="px-5 py-2.5 rounded-xl bg-[#00C98D] hover:bg-[#00B982] text-[#090A0F] font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer font-display"
          >
            <span>{language === 'vi' ? 'Tiếp tục: Ghi & Kiểm tra khối' : 'Continue: Verify Block'}</span>
            <ArrowRight className="w-4 h-4 text-[#090A0F]" />
          </button>
        )}
      </div>
    </div>
  );
};
