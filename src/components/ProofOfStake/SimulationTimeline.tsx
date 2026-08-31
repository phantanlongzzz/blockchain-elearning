import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CheckCircle2, Coins, Users, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';

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
  const { strings, language } = useLanguage();

  const steps = [
    {
      id: 1 as const,
      num: '01',
      title: language === 'vi' ? '1. Đặt cọc ETH' : '1. ETH Stake',
      desc: language === 'vi' ? 'Điều chỉnh lượng ETH' : 'Adjust ETH deposit',
      icon: Coins,
    },
    {
      id: 2 as const,
      num: '02',
      title: language === 'vi' ? '2. Chọn người giải khối' : '2. Select Block Solver',
      desc: selectedProposerName
        ? `${selectedProposerName} ${language === 'vi' ? 'được chọn' : 'selected'}`
        : language === 'vi'
        ? 'Xác suất theo cọc'
        : 'Weighted probability',
      icon: Users,
    },
    {
      id: 3 as const,
      num: '03',
      title: language === 'vi' ? '3. Kiểm tra khối' : '3. Verify Block',
      desc:
        scenarioOutcome === 'honest'
          ? language === 'vi'
            ? '+8 ETH Thưởng'
            : '+8 ETH Reward'
          : scenarioOutcome === 'fraud'
          ? language === 'vi'
            ? 'Tịch thu tiền cọc'
            : 'Deposit Confiscated'
          : language === 'vi'
          ? 'Làm đúng vs Gian lận'
          : 'Honest vs Cheating',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="bg-[#0C0F14] border border-[#1C2430] rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {steps.map((step, idx) => {
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onSelectStep?.(step.id)}
                className={`flex-1 p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-[rgba(0,201,141,0.08)] border-[#00C98D] text-[#00C98D] ring-1 ring-[#00C98D]'
                    : isCompleted
                    ? 'bg-[rgba(0,201,141,0.04)] border-[rgba(0,201,141,0.35)] text-[#00C98D] hover:border-[rgba(0,201,141,0.6)]'
                    : 'bg-[#0F131A] border-[#1C2430] text-[#A5AFBF] hover:border-[#2C384A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isActive
                        ? 'bg-[#00C98D] text-[#090A0F] border-[#00C98D] shadow-sm'
                        : isCompleted
                        ? 'bg-[rgba(0,201,141,0.15)] border-[rgba(0,201,141,0.4)] text-[#00C98D]'
                        : 'bg-[#0B0F15] border-[#1C2430] text-[#717B8C]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold font-sans tracking-tight truncate text-[#F2F4F7]">
                        {step.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A5AFBF] truncate mt-0.5 font-sans">
                      {step.desc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00C98D]" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-[#00C98D] animate-pulse block" />
                  ) : (
                    <span className="text-[10px] font-mono text-[#717B8C] font-bold">
                      #{step.num}
                    </span>
                  )}
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-1 text-[#717B8C]">
                  <ChevronRight className="w-5 h-5 text-[#1C2430]" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

