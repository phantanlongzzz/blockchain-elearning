import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { PythonListPlayground } from './PythonListPlayground';
import { LinkedListPlayground } from './LinkedListPlayground';
import { LinkedListVsBlockchain } from './LinkedListVsBlockchain';
import { HashPointerBlockchainLab } from './HashPointerBlockchainLab';
import { CryptographyFoundations } from './CryptographyFoundations';
import { DataToBlockchainPipeline } from './DataToBlockchainPipeline';
import { TheoryToPracticeBridge } from './TheoryToPracticeBridge';

export type Lesson1Stage =
  | 'pythonList'
  | 'linkedList'
  | 'vsBlockchain'
  | 'tamperLab'
  | 'cryptography'
  | 'pipeline'
  | 'theoryToPractice';

export const DataStructuresFoundations: React.FC = () => {
  const { strings, language } = useLanguage();
  const { markModuleInteracted, learningProgress } = useAuth();
  const [activeStage, setActiveStage] = useState<Lesson1Stage>('pythonList');

  // Track completed stages for progress calculation
  const [completedStages, setCompletedStages] = useState<Record<string, boolean>>({
    pythonList: true,
  });

  const handleInteraction = (stage?: Lesson1Stage) => {
    markModuleInteracted('foundations');
    if (stage) {
      setCompletedStages((prev) => ({ ...prev, [stage]: true }));
    }
  };

  const handleStageChange = (newStage: Lesson1Stage) => {
    setActiveStage(newStage);
    handleInteraction(newStage);
  };

  // 6 Compact Stages
  const STAGES: {
    id: Lesson1Stage;
    num: string;
    title: { vi: string; en: string };
  }[] = [
    {
      id: 'pythonList',
      num: '01',
      title: { vi: 'Python List', en: 'Python List' },
    },
    {
      id: 'linkedList',
      num: '02',
      title: { vi: 'Danh Sách Liên Kết', en: 'Linked List' },
    },
    {
      id: 'vsBlockchain',
      num: '03',
      title: { vi: 'Chuyển Đổi', en: 'Morphing' },
    },
    {
      id: 'tamperLab',
      num: '04',
      title: { vi: 'Kháng Giả Mạo', en: 'Tamper Lab' },
    },
    {
      id: 'cryptography',
      num: '05',
      title: { vi: 'Mật Mã Học', en: 'Cryptography' },
    },
    {
      id: 'pipeline',
      num: '06',
      title: { vi: 'Mô Phỏng Toàn Cảnh', en: 'Master Pipeline' },
    },
  ];

  const currentStageIndex = STAGES.findIndex((s) => s.id === activeStage);
  const progressPercent = Math.round(
    ((currentStageIndex >= 0 ? currentStageIndex + 1 : 1) / STAGES.length) * 100
  );

  return (
    <section
      id="foundations"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Section Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-zinc-400 font-medium tracking-wide">
              {strings.foundations.badge}
            </span>
            <span className="text-zinc-600 text-xs">·</span>
            <span className="text-xs font-mono text-zinc-500">
              {strings.foundations.levelBadge}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span>
              {language === 'vi' ? 'Tiến độ:' : 'Progress:'}{' '}
              <strong className="text-zinc-200 font-semibold">{progressPercent}%</strong>{' '}
              ({currentStageIndex + 1}/{STAGES.length})
            </span>
            {learningProgress?.foundations && (
              <span className="inline-flex items-center gap-1 text-text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {language === 'vi' ? 'Đã lưu tương tác' : 'Saved'}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight">
            {strings.foundations.title}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
            {strings.foundations.subtitle}
          </p>
        </div>
      </div>

      {/* Modern Compact Stage Navigation Toolbar */}
      <div className="bg-[#090a0f] p-1.5 rounded-xl border border-zinc-800/80">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
          {STAGES.map((stage, idx) => {
            const isActive = activeStage === stage.id;
            const isDone = completedStages[stage.id];

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleStageChange(stage.id)}
                className={`px-3 py-2.5 rounded-lg text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-zinc-800/90 text-zinc-100 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-[11px] font-mono shrink-0 font-medium ${
                      isActive
                        ? 'text-text-primary'
                        : isDone
                        ? 'text-zinc-500'
                        : 'text-zinc-600'
                    }`}
                  >
                    {stage.num}
                  </span>
                  <span className="text-xs font-medium truncate">
                    {stage.title[language]}
                  </span>
                </div>

                {isDone && !isActive && (
                  <Check className="w-3 h-3 text-zinc-500 shrink-0" />
                )}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content Container of Selected Stage */}
      <div>
        {activeStage === 'pythonList' && (
          <PythonListPlayground
            onInteracted={() => handleInteraction('pythonList')}
            onNextStage={() => handleStageChange('linkedList')}
          />
        )}
        {activeStage === 'linkedList' && (
          <LinkedListPlayground
            onInteracted={() => handleInteraction('linkedList')}
            onNextStage={() => handleStageChange('vsBlockchain')}
          />
        )}
        {activeStage === 'vsBlockchain' && (
          <LinkedListVsBlockchain
            onInteracted={() => handleInteraction('vsBlockchain')}
            onNextStage={() => handleStageChange('tamperLab')}
          />
        )}
        {activeStage === 'tamperLab' && (
          <HashPointerBlockchainLab
            onInteracted={() => handleInteraction('tamperLab')}
            onNextStage={() => handleStageChange('cryptography')}
          />
        )}
        {activeStage === 'cryptography' && (
          <CryptographyFoundations
            onInteracted={() => handleInteraction('cryptography')}
            onNextStage={() => handleStageChange('pipeline')}
          />
        )}
        {activeStage === 'pipeline' && (
          <DataToBlockchainPipeline
            onInteracted={() => handleInteraction('pipeline')}
            onGoToQuiz={() => {
              const quizEl = document.getElementById('quiz-section');
              if (quizEl) {
                quizEl.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        )}
        {activeStage === 'theoryToPractice' && <TheoryToPracticeBridge />}
      </div>

      {/* Minimal Footer Lab Bridge */}
      <div className="p-4 rounded-xl bg-[#090a0f] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-xs font-mono text-zinc-400 font-medium">
            {language === 'vi' ? 'Tiếp nối:' : 'Next module:'}{' '}
            <span className="text-zinc-200">
              {language === 'vi'
                ? 'Phòng Thí Nghiệm SHA-256 (64 Vòng Lặp & Ma Trận Băm)'
                : 'SHA-256 Deep Laboratory (64 Compression Rounds)'}
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            {language === 'vi'
              ? 'Quan sát trực tiếp thanh ghi A-H và hằng số K_t theo chuẩn FIPS 180-4.'
              : 'Inspect internal registers A-H and round constants K_t per FIPS 180-4.'}
          </p>
        </div>

        <a
          href="#hash-generator"
          className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <span>
            {language === 'vi'
              ? 'Mở Phòng Thí Nghiệm SHA-256'
              : 'Open SHA-256 Laboratory'}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
        </a>
      </div>
    </section>
  );
};
