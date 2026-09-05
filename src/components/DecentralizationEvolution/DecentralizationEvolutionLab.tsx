import React, { useState, useEffect } from 'react';
import { Coins, ShieldAlert, Globe, AlertTriangle, Boxes, Cpu, Award, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Lesson3Stage } from './types';
import { MoneyEvolutionSection } from './MoneyEvolutionSection';
import { TrustProblemSimulation } from './TrustProblemSimulation';
import { NetworkTopologyExplorer } from './NetworkTopologyExplorer';
import { DoubleSpendingLab } from './DoubleSpendingLab';
import { BuildBlockchainLab } from './BuildBlockchainLab';
import { BitcoinEcosystemLab } from './BitcoinEcosystemLab';
import { FinalChallengeSection } from './FinalChallengeSection';

export const DecentralizationEvolutionLab: React.FC = () => {
  const { language } = useLanguage();
  const { markModuleInteracted } = useAuth();

  const [activeStage, setActiveStage] = useState<Lesson3Stage>('money-evolution');
  const [labMode, setLabMode] = useState<'guided' | 'hands-on'>('guided');
  const [completedStages, setCompletedStages] = useState<Record<Lesson3Stage, boolean>>({
    'money-evolution': false,
    'trust-problem': false,
    'network-topology': false,
    'double-spending': false,
    'build-blockchain': false,
    'bitcoin-ecosystem': false,
    'final-challenge': false,
  });

  const handleStageInteract = (stage: Lesson3Stage) => {
    markModuleInteracted('decentralizationEvolution');
    setCompletedStages((prev) => ({ ...prev, [stage]: true }));
  };

  const STAGES_CONFIG: {
    id: Lesson3Stage;
    num: string;
    title: { vi: string; en: string };
    icon: React.ElementType;
  }[] = [
    {
      id: 'money-evolution',
      num: '01',
      title: { vi: 'Sự Tiến Hóa Tiền Tệ', en: 'Money Evolution' },
      icon: Coins,
    },
    {
      id: 'trust-problem',
      num: '02',
      title: { vi: 'Nghịch Lý Niềm Tin', en: 'Trust Paradox' },
      icon: ShieldAlert,
    },
    {
      id: 'network-topology',
      num: '03',
      title: { vi: 'Kiến Trúc Mạng', en: 'Network Topologies' },
      icon: Globe,
    },
    {
      id: 'double-spending',
      num: '04',
      title: { vi: 'Thí Nghiệm Tiêu Đúp', en: 'Double Spending' },
      icon: AlertTriangle,
    },
    {
      id: 'build-blockchain',
      num: '05',
      title: { vi: 'Xây Dựng Blockchain', en: 'Build Blockchain' },
      icon: Boxes,
    },
    {
      id: 'bitcoin-ecosystem',
      num: '06',
      title: { vi: 'Hệ Sinh Thái Bitcoin', en: 'Bitcoin Ecosystem' },
      icon: Cpu,
    },
    {
      id: 'final-challenge',
      num: '07',
      title: { vi: 'Thử Thách Tổng Kết', en: 'Final Challenge' },
      icon: Award,
    },
  ];

  const currentStageIndex = STAGES_CONFIG.findIndex((s) => s.id === activeStage);
  const completedCount = Object.values(completedStages).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / STAGES_CONFIG.length) * 100);

  return (
    <section id="lesson3-decentralization" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Main Section Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="text-text-primary">Buổi 3</span>
              <span className="text-zinc-600">·</span>
              <span>{language === 'vi' ? 'Giáo trình Blockchain' : 'Blockchain Curriculum'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-100 tracking-tight">
              {language === 'vi'
                ? 'Sự Tiến Hóa Của Tiền Tệ'
                : 'Money Evolution & The Rise of Blockchain'}
            </h2>
            <p className="text-base font-medium text-zinc-300 tracking-normal">
              {language === 'vi'
                ? 'Niềm Tin, Mạng Lưới & Căn Nguyên Ra Đời Của Blockchain'
                : 'Trust, Networks & Why Blockchain Needed to Exist'}
            </p>
            <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
              {language === 'vi'
                ? 'Khám phá chuỗi tiến hóa logic từ hàng đổi hàng, thợ kim hoàn, ngân hàng trung ương đến phát minh đột phá Bitcoin — Không học vẹt lý thuyết, hãy trực tiếp thao tác để tự khám phá câu trả lời.'
                : 'Discover the evolutionary journey from barter to central banking and Bitcoin through interactive simulations — without abstract jargon.'}
            </p>
          </div>

          {/* Mode Switcher: Minimal Segmented Control */}
          <div
            className="inline-flex items-center p-1 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 self-start md:self-center"
            role="group"
            aria-label="Learning Mode"
          >
            <button
              type="button"
              onClick={() => setLabMode('guided')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                labMode === 'guided'
                  ? 'bg-zinc-800 text-text-primary font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {language === 'vi' ? 'Hướng dẫn' : 'Guided'}
            </button>
            <button
              type="button"
              onClick={() => setLabMode('hands-on')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                labMode === 'hands-on'
                  ? 'bg-zinc-800 text-text-primary font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {language === 'vi' ? 'Thực hành' : 'Hands-on'}
            </button>
          </div>
        </div>

        {/* 7-Stage Flat Step Navigation (Linear/Vercel style, scrollable, no truncate) */}
        <div className="pt-2 border-b border-zinc-800/80">
          <nav
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1"
            aria-label="Lesson Stages"
          >
            {STAGES_CONFIG.map((s) => {
              const isCurrent = activeStage === s.id;
              const isDone = completedStages[s.id];
              const titleText = s.title[language];

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActiveStage(s.id);
                    handleStageInteract(s.id);
                  }}
                  className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'text-zinc-100 bg-zinc-900/90 font-semibold'
                      : isDone
                      ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
                  }`}
                >
                  {/* Step Index Number */}
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.5 rounded transition-colors ${
                      isCurrent
                        ? 'bg-white/[0.08] text-text-primary font-bold'
                        : isDone
                        ? 'bg-zinc-800 text-text-secondary'
                        : 'bg-zinc-900 text-zinc-500 group-hover:text-zinc-400'
                    }`}
                  >
                    {s.num}
                  </span>

                  {/* Full Title (never truncated) */}
                  <span className="tracking-tight">{titleText}</span>

                  {/* Completion indicator */}
                  {isDone && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 ml-0.5" />
                  )}

                  {/* Bottom Active Indicator Bar */}
                  {isCurrent && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Dynamic Content Renderer based on active stage */}
      <div className="transition-all duration-300">
        {activeStage === 'money-evolution' && (
          <MoneyEvolutionSection
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('money-evolution')}
            onNextStage={() => {
              setActiveStage('trust-problem');
              handleStageInteract('trust-problem');
            }}
          />
        )}

        {activeStage === 'trust-problem' && (
          <TrustProblemSimulation
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('trust-problem')}
            onPrevStage={() => setActiveStage('money-evolution')}
            onNextStage={() => {
              setActiveStage('network-topology');
              handleStageInteract('network-topology');
            }}
          />
        )}

        {activeStage === 'network-topology' && (
          <NetworkTopologyExplorer
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('network-topology')}
            onPrevStage={() => setActiveStage('trust-problem')}
            onNextStage={() => {
              setActiveStage('double-spending');
              handleStageInteract('double-spending');
            }}
          />
        )}

        {activeStage === 'double-spending' && (
          <DoubleSpendingLab
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('double-spending')}
            onPrevStage={() => setActiveStage('network-topology')}
            onNextStage={() => {
              setActiveStage('build-blockchain');
              handleStageInteract('build-blockchain');
            }}
          />
        )}

        {activeStage === 'build-blockchain' && (
          <BuildBlockchainLab
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('build-blockchain')}
            onPrevStage={() => setActiveStage('double-spending')}
            onNextStage={() => {
              setActiveStage('bitcoin-ecosystem');
              handleStageInteract('bitcoin-ecosystem');
            }}
          />
        )}

        {activeStage === 'bitcoin-ecosystem' && (
          <BitcoinEcosystemLab
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('bitcoin-ecosystem')}
            onPrevStage={() => setActiveStage('build-blockchain')}
            onNextStage={() => {
              setActiveStage('final-challenge');
              handleStageInteract('final-challenge');
            }}
          />
        )}

        {activeStage === 'final-challenge' && (
          <FinalChallengeSection
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('final-challenge')}
            onPrevStage={() => setActiveStage('bitcoin-ecosystem')}
            onCompleteLesson={() => {
              handleStageInteract('final-challenge');
              markModuleInteracted('decentralizationEvolution');
            }}
          />
        )}
      </div>
    </section>
  );
};
