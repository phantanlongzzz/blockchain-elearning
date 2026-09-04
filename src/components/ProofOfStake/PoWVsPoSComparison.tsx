import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Flame,
  Scale,
  Award,
  Sparkles,
} from 'lucide-react';

export const PoWVsPoSComparison: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openQA, setOpenQA] = useState<number | null>(0);

  const conceptCards = [
    {
      num: '01',
      title: strings.proofOfStake.conceptCards.card1Title,
      desc: strings.proofOfStake.conceptCards.card1Desc,
      icon: ShieldCheck,
      color: 'text-[#00C98D] border-[rgba(0,201,141,0.3)] bg-[rgba(0,201,141,0.05)]',
    },
    {
      num: '02',
      title: strings.proofOfStake.conceptCards.card2Title,
      desc: strings.proofOfStake.conceptCards.card2Desc,
      icon: Zap,
      color: 'text-[#F59E0B] border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.05)]',
    },
    {
      num: '03',
      title: strings.proofOfStake.conceptCards.card3Title,
      desc: strings.proofOfStake.conceptCards.card3Desc,
      icon: Scale,
      color: 'text-[#00C98D] border-[rgba(0,201,141,0.3)] bg-[rgba(0,201,141,0.05)]',
    },
    {
      num: '04',
      title: strings.proofOfStake.conceptCards.card4Title,
      desc: strings.proofOfStake.conceptCards.card4Desc,
      icon: Flame,
      color: 'text-[#EF4444] border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)]',
    },
  ];

  const qaList = [
    { id: 1, q: strings.proofOfStake.qaItems.q1, a: strings.proofOfStake.qaItems.a1 },
    { id: 2, q: strings.proofOfStake.qaItems.q2, a: strings.proofOfStake.qaItems.a2 },
    { id: 3, q: strings.proofOfStake.qaItems.q3, a: strings.proofOfStake.qaItems.a3 },
    { id: 4, q: strings.proofOfStake.qaItems.q4, a: strings.proofOfStake.qaItems.a4 },
    { id: 5, q: strings.proofOfStake.qaItems.q5, a: strings.proofOfStake.qaItems.a5 },
    { id: 6, q: strings.proofOfStake.qaItems.q6, a: strings.proofOfStake.qaItems.a6 },
  ];

  return (
    <div className="bg-[#0C0F14] border border-white/[0.08] rounded-xl overflow-hidden transition-all">
      {/* Collapsible Header */}
      <button
        type="button"
        id="pos-comparison-accordion-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#00C98D] shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#F2F4F7] font-display">
            {isVi ? 'SO SÁNH NÂNG CAO: PoW VÀ PoS' : 'ADVANCED COMPARISON: PoW VS PoS'}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#9AA5B5]">
          <span className="hidden sm:inline">
            {isOpen ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Mở rộng' : 'Expand')}
          </span>
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#9AA5B5] group-hover:text-[#F2F4F7] transition-colors">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-5 sm:p-6 border-t border-[#1C2430] bg-[#090A0F]/60 space-y-6 animate-in fade-in duration-200">
          {/* 4 Concept Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {conceptCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.num}
                  className="bg-[#0C0F14] border border-[#1C2430] rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-[#2C384A] transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${card.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#717B8C] group-hover:text-[#A5AFBF] transition-colors">
                        #{card.num}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F2F4F7] font-sans mb-1.5 leading-snug">
                      {card.title}
                    </h4>
                    <p className="text-xs text-[#A5AFBF] leading-relaxed font-sans">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side-by-Side Architectural Comparison: PoW vs PoS */}
          <div className="bg-[#0C0F14] border border-[#1C2430] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#1C2430]">
              <div className="w-8 h-8 rounded-lg bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.35)] flex items-center justify-center text-[#00C98D]">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F2F4F7] font-display">
                  {strings.proofOfStake.powVsPosTitle}
                </h3>
                <p className="text-xs text-[#A5AFBF]">
                  {strings.proofOfStake.powVsPosSubtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PoW Box */}
              <div className="bg-[#0F131A] border border-[#1C2430] rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1C2430]">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#F59E0B]" />
                      <span className="text-xs font-bold font-display uppercase tracking-wider text-[#F59E0B]">
                        {strings.proofOfStake.powLabel}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.35)] text-[#F59E0B]">
                      COMPUTATIONAL WORK
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs font-mono text-[#A5AFBF]">
                    {strings.proofOfStake.powFlow.map((step, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#090A0F] border border-[#1C2430] flex items-center justify-center text-[10px] text-[#F59E0B] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="leading-snug text-[#F2F4F7]">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1C2430] text-[11px] text-[#A5AFBF] italic">
                  <strong>Core Guarantee:</strong> {strings.proofOfStake.powFocus}
                </div>
              </div>

              {/* PoS Box */}
              <div className="bg-[#0F131A] border border-[rgba(0,201,141,0.35)] rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1C2430]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#00C98D]" />
                      <span className="text-xs font-bold font-display uppercase tracking-wider text-[#00C98D]">
                        {strings.proofOfStake.posLabel}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(0,201,141,0.12)] border border-[rgba(0,201,141,0.35)] text-[#00C98D]">
                      ECONOMIC COLLATERAL
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs font-mono text-[#A5AFBF]">
                    {strings.proofOfStake.posFlow.map((step, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#090A0F] border border-[rgba(0,201,141,0.35)] flex items-center justify-center text-[10px] text-[#00C98D] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="leading-snug text-[#F2F4F7]">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1C2430] text-[11px] text-[#A5AFBF] italic">
                  <strong>Core Guarantee:</strong> {strings.proofOfStake.posFocus}
                </div>
              </div>
            </div>
          </div>

          {/* Expandable "Think About It" Section */}
          <div className="bg-[#0C0F14] border border-[#1C2430] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#1C2430]">
              <div className="w-8 h-8 rounded-lg bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.35)] flex items-center justify-center text-[#00C98D]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F2F4F7] font-display">
                  {strings.proofOfStake.thinkAboutItTitle}
                </h3>
                <p className="text-xs text-[#A5AFBF]">
                  {strings.proofOfStake.thinkAboutItSubtitle}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {qaList.map((item, index) => {
                const isOpenQAItem = openQA === index;
                return (
                  <div
                    key={item.id}
                    className="bg-[#0F131A] border border-[#1C2430] rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      id={`pos-qa-toggle-${item.id}`}
                      onClick={() => setOpenQA(isOpenQAItem ? null : index)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-[#11161E] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-[#090A0F] border border-[#1C2430] flex items-center justify-center text-xs font-mono font-bold text-[#00C98D] shrink-0">
                          Q{item.id}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-[#F2F4F7] font-sans">
                          {item.q}
                        </span>
                      </div>
                      {isOpenQAItem ? (
                        <ChevronUp className="w-4 h-4 text-[#00C98D] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#717B8C] shrink-0" />
                      )}
                    </button>

                    {isOpenQAItem && (
                      <div className="px-4 pb-3.5 pt-1 text-xs text-[#A5AFBF] leading-relaxed font-sans border-t border-[#1C2430] bg-[#090A0F]/30">
                        <div className="p-3 rounded-lg bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.25)] text-[#F2F4F7] font-mono text-[11px] leading-relaxed">
                          {item.a}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
