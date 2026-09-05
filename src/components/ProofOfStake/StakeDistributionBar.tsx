import React, { useState } from 'react';
import { PoSValidator } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { ArrowRight, ArrowLeft, RefreshCw, Play, Trophy } from 'lucide-react';
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
  const isVi = language === 'vi';
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
    const isSelected = selectedProposerId === val.id;

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
      isSelected,
    };
  });

  const selectedValidator = validators.find((v) => v.id === selectedProposerId);
  const selectedName = selectedValidator ? selectedValidator.name : '';

  return (
    <div
      id="pos-stake-distribution-section"
      className="space-y-6 font-sans"
    >
      {/* 1. Header & Primary Selection Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#F2F4F7]">
            {isVi ? 'Chọn người giải khối theo xác suất' : 'Probability-Weighted Selection'}
          </h3>
        </div>

        {/* Action Button to trigger selection */}
        {onStartSelection && (
          <button
            type="button"
            id="pos-start-selection-btn"
            onClick={onStartSelection}
            disabled={isSelecting || totalActiveStake <= 0}
            className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm shrink-0 ${
              isSelecting
                ? 'bg-white/[0.06] text-text-primary border border-border-primary/40 cursor-wait'
                : 'bg-white/[0.1] hover:bg-white/[0.15] text-text-primary'
            }`}
          >
            {isSelecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-text-primary" />
                <span>{isVi ? 'Đang chọn người giải khối...' : 'Selecting Solver...'}</span>
              </>
            ) : selectedProposerId ? (
              <>
                <RefreshCw className="w-4 h-4 text-[#090A0F]" />
                <span>{isVi ? 'Quay chọn lại người giải khối' : 'Reselect Solver'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-[#090A0F]" />
                <span>{isVi ? 'Quay chọn người giải khối' : 'Select Solver'}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 2. Main 2-Column Visualization Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Donut Chart */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative py-2">
          <div className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] flex items-center justify-center">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full select-none">
              {/* Background Guide Circle */}
              <circle
                cx={center}
                cy={center}
                r={(outerRadius + innerRadius) / 2}
                fill="none"
                stroke="#1C2430"
                strokeWidth={outerRadius - innerRadius}
                opacity={0.4}
              />

              {/* Slices */}
              {totalActiveStake > 0 ? (
                slices.map((slice) => {
                  const isHighlighted = slice.isHovered || slice.isSelected;
                  const isDimmed = (hoveredId !== null && !slice.isHovered) || (selectedProposerId && !slice.isSelected);

                  return (
                    <g
                      key={slice.validator.id}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredId(slice.validator.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <path
                        d={slice.pathData}
                        fill={slice.colorHex}
                        opacity={isDimmed ? 0.3 : 1}
                        stroke={
                          slice.isSelected
                            ? '#FFFFFF'
                            : slice.isHovered
                            ? '#FFFFFF'
                            : '#090A0F'
                        }
                        strokeWidth={slice.isSelected ? 3 : slice.isHovered ? 2 : 1}
                        className="transition-opacity duration-150"
                      />

                      {/* Percentage label inside slice */}
                      {slice.percentage >= 6 && (
                        <text
                          x={slice.labelX}
                          y={slice.labelY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#FFFFFF"
                          className="font-mono font-bold text-[11px] pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                        >
                          {slice.percentage.toFixed(0)}%
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
                  <RefreshCw className="w-5 h-5 text-text-primary animate-spin mb-1" />
                  <span className="text-[11px] font-mono font-medium text-text-primary">
                    {isVi ? 'ĐANG CHỌN...' : 'SELECTING...'}
                  </span>
                </div>
              ) : selectedValidator ? (
                <div className="animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-0.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-sm font-bold text-[#F2F4F7]">
                    {selectedName}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xs font-mono font-bold text-[#F2F4F7]">
                      {selectedValidator.stake.toFixed(0)}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      ETH
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#717B8C] mb-0.5">
                    {isVi ? 'TỔNG ĐẶT CỌC' : 'TOTAL STAKE'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-[#F2F4F7] tracking-tight">
                      {totalActiveStake.toFixed(0)}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      ETH
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Legend & Selected Winner Details */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* Winner Announcement Callout (Minimalist, Amber/Teal Palette) */}
          {selectedValidator && !isSelecting && (
            <div className="p-3.5 rounded-xl bg-[#0C0F14] border border-white/[0.08] shadow-sm space-y-1 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-[#F2F4F7] font-semibold text-sm">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {selectedName} {isVi ? 'được chọn giải khối!' : 'selected as Block Solver!'}
                </span>
              </div>
              <p className="text-xs text-[#9AA5B5]">
                {isVi ? (
                  <>
                    Xác suất:{' '}
                    <span className="text-amber-400 font-mono font-bold">
                      {((selectedValidator.stake / totalActiveStake) * 100).toFixed(1)}%
                    </span>{' '}
                    · Đặt cọc:{' '}
                    <span className="text-amber-400 font-mono font-bold">
                      {selectedValidator.stake.toFixed(0)} ETH
                    </span>
                  </>
                ) : (
                  <>
                    Probability:{' '}
                    <span className="text-amber-400 font-mono font-bold">
                      {((selectedValidator.stake / totalActiveStake) * 100).toFixed(1)}%
                    </span>{' '}
                    · Stake:{' '}
                    <span className="text-amber-400 font-mono font-bold">
                      {selectedValidator.stake.toFixed(0)} ETH
                    </span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Participant Mini Cards */}
          <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
            {validators.map((val) => {
              const preset = getValidatorPreset(val.id, val.name);
              const isSelected = selectedProposerId === val.id;
              const isZeroStake = val.stake <= 0;
              const percentage = totalActiveStake > 0 ? (val.stake / totalActiveStake) * 100 : 0;

              return (
                <div
                  key={val.id}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#0C0F14] border-border-primary ring-1 ring-white/20 text-white shadow-sm'
                      : isZeroStake
                      ? 'bg-[#0C0F14]/40 border-white/[0.03] opacity-40'
                      : 'bg-[#0C0F14] border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: isZeroStake ? '#64748B' : preset.color }}
                      />
                      <span className={`text-xs font-semibold truncate ${isZeroStake ? 'text-[#717B8C]' : isSelected ? 'text-white' : 'text-[#F2F4F7]'}`}>
                        {val.name}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">
                        ✓ {isVi ? 'Được chọn' : 'Selected'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between text-[11px] font-mono">
                    <span className={isZeroStake ? 'text-[#717B8C]' : isSelected ? 'text-amber-400 font-bold' : 'text-[#A5AFBF]'}>
                      {val.stake.toFixed(0)} <span className="text-amber-400">ETH</span>
                    </span>
                    <span className={isZeroStake ? 'text-[#717B8C]' : isSelected ? 'text-amber-400 font-bold' : 'text-[#9AA5B5]'}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Navigation Controls between Steps */}
      <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
        {onBackToStep1 && (
          <button
            type="button"
            id="pos-back-to-step1-btn"
            onClick={onBackToStep1}
            className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#9AA5B5] hover:text-[#F2F4F7] border border-white/[0.06] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isVi ? 'Quay lại: Đặt cọc' : 'Back: Deposit'}</span>
          </button>
        )}

        {onProceedToStep3 && selectedProposerId && (
          <button
            type="button"
            id="pos-proceed-to-step3-btn"
            onClick={onProceedToStep3}
 className="px-5 py-2.5 rounded-lg bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer ml-auto"
          >
            <span>{isVi ? 'Tiếp tục: Ghi & Kiểm tra khối' : 'Continue: Verify Block'}</span>
            <ArrowRight className="w-4 h-4 text-[#090A0F]" />
          </button>
        )}
      </div>
    </div>
  );
};
