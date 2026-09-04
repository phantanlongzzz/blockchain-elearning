import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface SimulationTimelineProps {
  activeStep: 1 | 2 | 3;
  onSelectStep?: (step: 1 | 2 | 3) => void;
  selectedProposerName?: string;
  scenarioOutcome?: 'honest' | 'fraud' | null;
}

export const SimulationTimeline: React.FC<SimulationTimelineProps> = ({
  activeStep,
  onSelectStep,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const steps = [
    {
      id: 1 as const,
      num: '01',
      title: isVi ? 'Đặt cọc ETH' : 'ETH Staking',
    },
    {
      id: 2 as const,
      num: '02',
      title: isVi ? 'Chọn người giải khối' : 'Select Block Solver',
    },
    {
      id: 3 as const,
      num: '03',
      title: isVi ? 'Kiểm tra khối' : 'Verify Block',
    },
  ];

  return (
    <nav
      aria-label="Simulation steps"
      className="w-full py-2 font-sans select-none"
    >
      <div className="grid grid-cols-3 w-full relative">
        {steps.map((step, idx) => {
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;

          return (
            <div
              key={step.id}
              className="relative flex flex-col items-center group"
            >
              {/* Connector line between steps (from center of current step to center of next step) */}
              {idx < steps.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-[2px] bg-white/[0.08] z-0">
                  <div
                    className={`h-full bg-[#00C98D] transition-all duration-300 ${
                      activeStep > step.id ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}

              {/* Step Button */}
              <button
                type="button"
                onClick={() => onSelectStep?.(step.id)}
                className="relative z-10 flex flex-col items-center text-center cursor-pointer focus-visible:outline-none group max-w-full px-1"
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Step Circle with Number */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00C98D] text-[#090A0F] shadow-[0_0_12px_rgba(0,201,141,0.25)] ring-4 ring-[#00C98D]/20'
                      : isCompleted
                      ? 'bg-[#0C0F14] text-[#00C98D] border border-[#00C98D]/60 ring-2 ring-[#00C98D]/15 group-hover:border-[#00C98D]'
                      : 'bg-[#0C0F14] text-[#717B8C] border border-white/[0.12] group-hover:border-white/[0.2] group-hover:text-[#A5AFBF]'
                  }`}
                >
                  {step.num}
                </div>

                {/* Step Title (Only the main title, no extra descriptions) */}
                <span
                  className={`mt-2 text-xs sm:text-sm tracking-tight transition-colors line-clamp-2 ${
                    isActive
                      ? 'text-[#F2F4F7] font-semibold'
                      : isCompleted
                      ? 'text-[#A5AFBF] font-medium group-hover:text-[#F2F4F7]'
                      : 'text-[#717B8C] font-normal group-hover:text-[#A5AFBF]'
                  }`}
                >
                  {step.title}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
};
