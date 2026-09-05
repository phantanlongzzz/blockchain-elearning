import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  FlaskConical,
  Check,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ConsensusLessonStage } from './types';
import { ConsensusFundamentals } from './ConsensusFundamentals';
import { ByzantineGeneralsLab } from './ByzantineGeneralsLab';
import { OralMessagesSimulation } from './OralMessagesSimulation';
import { SignedMessagesSimulation } from './SignedMessagesSimulation';
import { PoWConsensusSection } from './PoWConsensusSection';
import { PoSConsensusSection } from './PoSConsensusSection';
import { PoWVsPoSInteractive } from './PoWVsPoSInteractive';
import { ConsensusFinalChallenge } from './ConsensusFinalChallenge';
import { ConsensusCodeModal } from './ConsensusCodeModal';

export const ConsensusEvolutionLab: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const { markModuleInteracted } = useAuth();

  const [activeStage, setActiveStage] = useState<ConsensusLessonStage>('fundamentals');
  const [labMode, setLabMode] = useState<'guided' | 'hands-on'>('guided');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [codeModalDefaultTab, setCodeModalDefaultTab] = useState<'byzantine' | 'pow' | 'pos'>('byzantine');

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [completedStages, setCompletedStages] = useState<Record<ConsensusLessonStage, boolean>>({
    fundamentals: true,
    'byzantine-problem': false,
    'oral-messages': false,
    'signed-messages': false,
    'pow-consensus': false,
    'pos-consensus': false,
    'pow-vs-pos': false,
    'final-challenge': false,
  });

  // Auto-scroll active tab into view smoothly when active stage changes
  useEffect(() => {
    const activeTabEl = tabRefs.current[activeStage];
    if (activeTabEl) {
      activeTabEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeStage]);

  const handleStageInteract = useCallback((stage: ConsensusLessonStage) => {
    markModuleInteracted('consensusMechanisms' as any);
    setCompletedStages((prev) => {
      if (prev[stage]) return prev;
      return { ...prev, [stage]: true };
    });
  }, [markModuleInteracted]);

  const openCodeModalWithTab = (tab: 'byzantine' | 'pow' | 'pos') => {
    setCodeModalDefaultTab(tab);
    setIsCodeModalOpen(true);
  };

  const STAGES_CONFIG: {
    id: ConsensusLessonStage;
    num: string;
    isSub?: boolean;
    title: { vi: string; en: string };
  }[] = [
    {
      id: 'fundamentals',
      num: '01',
      title: { vi: 'Bản chất đồng thuận', en: 'Consensus Essentials' },
    },
    {
      id: 'byzantine-problem',
      num: '02',
      title: { vi: 'Bài toán Byzantine', en: 'Byzantine Problem' },
    },
    {
      id: 'oral-messages',
      num: '02A',
      isSub: true,
      title: { vi: 'Truyền miệng', en: 'Oral Messages' },
    },
    {
      id: 'signed-messages',
      num: '02B',
      isSub: true,
      title: { vi: 'Chữ ký số', en: 'Signed Messages' },
    },
    {
      id: 'pow-consensus',
      num: '03',
      title: { vi: 'Proof of Work', en: 'Proof of Work' },
    },
    {
      id: 'pos-consensus',
      num: '04',
      title: { vi: 'Proof of Stake', en: 'Proof of Stake' },
    },
    {
      id: 'pow-vs-pos',
      num: '05',
      title: { vi: 'So sánh PoW vs PoS', en: 'PoW vs PoS Comparison' },
    },
    {
      id: 'final-challenge',
      num: '06',
      title: { vi: 'Thử thách tổng kết', en: 'Final Challenge' },
    },
  ];

  const currentStageIndex = STAGES_CONFIG.findIndex((s) => s.id === activeStage);
  const completedCount = Object.values(completedStages).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / STAGES_CONFIG.length) * 100);

  const goToNextStage = () => {
    if (currentStageIndex < STAGES_CONFIG.length - 1) {
      const nextStage = STAGES_CONFIG[currentStageIndex + 1].id;
      setActiveStage(nextStage);
      handleStageInteract(nextStage);
    }
  };

  const goToPrevStage = () => {
    if (currentStageIndex > 0) {
      setActiveStage(STAGES_CONFIG[currentStageIndex - 1].id);
    }
  };

  return (
    <div id="lesson4-consensus" className="space-y-8 scroll-mt-24">
      {/* Module Title Banner */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#0c101c] border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-border-primary text-text-primary text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'BUỔI 4 · CHUYÊN ĐỀ ĐỒNG THUẬN' : 'LESSON 4 · CONSENSUS MODULE'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display tracking-tight">
                {language === 'vi'
                  ? 'Cơ Chế Đồng Thuận Trong Blockchain'
                  : 'Consensus Mechanisms in Blockchain'}
              </h2>
              <p className="text-sm text-slate-400 max-w-3xl font-sans leading-relaxed">
                {language === 'vi'
                  ? 'Từ Bài Toán Các Vị Tướng Byzantine, Thông Điệp Ký Số đến Hai Trụ Cột Proof of Work và Proof of Stake.'
                  : 'From the Byzantine Generals Problem and Cryptographic Signatures to the twin pillars: Proof of Work and Proof of Stake.'}
              </p>
            </div>

            {/* Mode Selector & Code Modal Button */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-0.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center">
                <button
                  type="button"
                  id="btn-mode-guided"
                  onClick={() => setLabMode('guided')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                    labMode === 'guided'
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 inline mr-1" />
                  {language === 'vi' ? 'Hướng Dẫn' : 'Guided'}
                </button>
                <button
                  type="button"
                  id="btn-mode-hands-on"
                  onClick={() => setLabMode('hands-on')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                    labMode === 'hands-on'
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5 inline mr-1" />
                  {language === 'vi' ? 'Tự Do' : 'Hands-on'}
                </button>
              </div>

              <button
                type="button"
                id="btn-view-source-code"
                onClick={() => openCodeModalWithTab('byzantine')}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 text-xs font-mono border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'vi' ? 'Xem Mã Nguồn' : 'View Code'}</span>
              </button>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                {language === 'vi' ? 'Tiến độ chuyên đề:' : 'Module Progress:'}{' '}
                <span className="text-text-primary font-semibold">
                  {completedCount}/{STAGES_CONFIG.length} {language === 'vi' ? 'phần hoàn thành' : 'sections completed'}
                </span>
              </span>
              <span className="text-text-primary font-semibold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stage Navigation Tabs */}
      <div
        role="tablist"
        aria-label={isVi ? 'Danh sách bài học đồng thuận' : 'Consensus lesson modules'}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth p-1 bg-[#0B0E12] border border-slate-800 rounded-xl"
      >
        {STAGES_CONFIG.map((stage) => {
          const isActive = activeStage === stage.id;
          const isDone = completedStages[stage.id];

          return (
            <button
              key={stage.id}
              ref={(el) => {
                tabRefs.current[stage.id] = el;
              }}
              id={`tab-${stage.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${stage.id}`}
              tabIndex={0}
              type="button"
              onClick={() => {
                setActiveStage(stage.id);
                handleStageInteract(stage.id);
              }}
              className={`min-w-[145px] shrink-0 px-3 py-2.5 rounded-lg border text-left transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 ${
                isActive
                  ? 'bg-white/[0.08] border-border-primary text-text-primary'
                  : stage.isSub
                  ? 'bg-[#080C10] border-slate-800/60 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  : 'bg-[#080C10] border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-mono font-semibold ${
                      isActive ? 'text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    {stage.num}
                  </span>
                  {stage.isSub && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                      {isVi ? 'Phụ lục' : 'Sub'}
                    </span>
                  )}
                </div>
                {isDone && (
                  <Check className="w-3 h-3 text-success/80 shrink-0" aria-label="Completed" />
                )}
              </div>
              <div
                className={`text-xs mt-1 truncate ${
                  isActive ? 'text-slate-100 font-semibold' : 'text-slate-300 font-medium'
                }`}
              >
                {isVi ? stage.title.vi : stage.title.en}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Content Renderer */}
      <div className="transition-all duration-300">
        {activeStage === 'fundamentals' && (
          <ConsensusFundamentals
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('fundamentals')}
            onNextStage={goToNextStage}
          />
        )}

        {activeStage === 'byzantine-problem' && (
          <ByzantineGeneralsLab
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('byzantine-problem')}
            onPrevStage={goToPrevStage}
            onNextStage={goToNextStage}
          />
        )}

        {activeStage === 'oral-messages' && (
          <OralMessagesSimulation
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('oral-messages')}
            onPrevStage={goToPrevStage}
            onNextStage={goToNextStage}
          />
        )}

        {activeStage === 'signed-messages' && (
          <SignedMessagesSimulation
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('signed-messages')}
            onPrevStage={goToPrevStage}
            onNextStage={goToNextStage}
          />
        )}

        {activeStage === 'pow-consensus' && (
          <PoWConsensusSection
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('pow-consensus')}
            onPrevStage={goToPrevStage}
            onNextStage={goToNextStage}
            onOpenCode={() => openCodeModalWithTab('pow')}
          />
        )}

        {activeStage === 'pos-consensus' && (
          <PoSConsensusSection
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('pos-consensus')}
            onPrevStage={goToPrevStage}
            onNextStage={goToNextStage}
            onOpenCode={() => openCodeModalWithTab('pos')}
          />
        )}

        {activeStage === 'pow-vs-pos' && (
          <PoWVsPoSInteractive
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('pow-vs-pos')}
            onPrevStage={goToPrevStage}
            onNextStage={goToNextStage}
          />
        )}

        {activeStage === 'final-challenge' && (
          <ConsensusFinalChallenge
            isHandsOn={labMode === 'hands-on'}
            onInteracted={() => handleStageInteract('final-challenge')}
            onPrevStage={goToPrevStage}
          />
        )}
      </div>

      {/* Global Code Modal */}
      <ConsensusCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        defaultTab={codeModalDefaultTab}
      />
    </div>
  );
};
