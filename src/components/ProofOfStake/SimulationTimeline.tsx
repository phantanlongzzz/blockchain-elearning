import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CheckCircle2 } from 'lucide-react';

interface SimulationTimelineProps {
  activeStep: 1 | 2 | 3;
  onSelectStep?: (step: 1 | 2 | 3) => void;
  selectedProposerName?: string;
  scenarioOutcome?: 'honest' | 'fraud' | null;
}

export const SimulationTimeline: React.FC<SimulationTimelineProps> = ({
  activeStep,
  onSelectStep,
  selectedProposerName,
  scenarioOutcome,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const steps = [
    {
      id: 1 as const,
      num: '01',
      title: isVi ? 'Đặt cọc ETH' : 'ETH Staking',
      desc: isVi ? 'Điều chỉnh lượng cọc' : 'Adjust deposit',
    },
    {
      id: 2 as const,
      num: '02',
      title: isVi ? 'Chọn người giải khối' : 'Select Validator',
      desc: selectedProposerName
        ? `${selectedProposerName} ${isVi ? 'được chọn' : 'selected'}`
        : isVi
        ? 'Xác suất theo cọc'
        : 'Weighted probability',
    },
    {
      id: 3 as const,
      num: '03',
      title: isVi ? 'Kiểm tra khối' : 'Verify Block',
      desc:
        scenarioOutcome === 'honest'
          ? isVi
            ? '+8 ETH Thưởng'
            : '+8 ETH Reward'
          : scenarioOutcome === 'fraud'
          ? isVi
            ? 'Tịch thu tiền cọc'
            : 'Slashed Deposit'
          : isVi
          ? 'Đồng thuận & Phạt'
          : 'Consensus & Slash',
    },
  ];

  return (
    <nav
      aria-label="Simulation steps"
      className="py-2 px-1 font-sans"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4 relative">
        {steps.map((step, idx) => {
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step Button */}
              <button
                type="button"
                onClick={() => onSelectStep?.(step.id)}
                className="group flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00C98D] rounded-lg p-1.5 transition-colors cursor-pointer shrink-0"
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Step Indicator (Number / Check) */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#00C98D] text-[#090A0F] shadow-sm ring-4 ring-[#00C98D]/20'
                      : isCompleted
                      ? 'bg-[#00C98D]/15 text-[#00C98D] border border-[#00C98D]/30 group-hover:border-[#00C98D]/60'
                      : 'bg-white/[0.04] text-[#717B8C] border border-white/[0.08] group-hover:text-[#A5AFBF] group-hover:border-white/[0.15]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00C98D]" />
                  ) : (
                    <span>{step.num}</span>
                  )}
                </div>

                {/* Step Text Info */}
                <div className="min-w-0">
                  <div
                    className={`text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
                      isActive
                        ? 'text-[#F2F4F7]'
                        : isCompleted
                        ? 'text-[#A5AFBF] group-hover:text-[#F2F4F7]'
                        : 'text-[#717B8C] group-hover:text-[#A5AFBF]'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div
                    className={`text-[11px] truncate font-mono hidden sm:block ${
                      step.id === 3 && scenarioOutcome === 'honest'
                        ? 'text-amber-400 font-semibold'
                        : step.id === 3 && scenarioOutcome === 'fraud'
                        ? 'text-rose-400 font-semibold'
                        : 'text-[#717B8C]'
                    }`}
                  >
                    {step.desc}
                  </div>
                </div>
              </button>

              {/* Connecting Line between steps */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 bg-white/[0.06] relative overflow-hidden rounded-full min-w-[20px]">
                  <div
                    className={`h-full transition-all duration-300 ${
                      activeStep > idx + 1
                        ? 'bg-[#00C98D]/60 w-full'
                        : activeStep === idx + 1
                        ? 'bg-[#00C98D]/30 w-1/2'
                        : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
