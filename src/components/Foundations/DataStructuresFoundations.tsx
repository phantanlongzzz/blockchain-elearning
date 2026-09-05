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
      title: { vi: 'Mảng RAM', en: 'RAM Array' },
    },
    {
      id: 'linkedList',
      num: '02',
      title: { vi: 'Linked List', en: 'Linked List' },
    },
    {
      id: 'vsBlockchain',
      num: '03',
      title: { vi: 'Con trỏ Hash', en: 'Hash Pointer' },
    },
    {
      id: 'tamperLab',
      num: '04',
      title: { vi: 'Chống giả mạo', en: 'Tamper Resistance' },
    },
    {
      id: 'cryptography',
      num: '05',
      title: { vi: 'Mật mã', en: 'Cryptography' },
    },
    {
      id: 'pipeline',
      num: '06',
      title: { vi: 'Tổng kết', en: 'Summary' },
    },
  ];

  const currentStageIndex = STAGES.findIndex((s) => s.id === activeStage);
  const progressPercent = Math.round(
    ((currentStageIndex >= 0 ? currentStageIndex + 1 : 1) / STAGES.length) * 100
  );

  return (
    <section
      id="foundations"
      className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6"
    >
      {/* Section Header */}
      <div className="space-y-1.5 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-semibold text-white tracking-tight">
            {language === 'vi' ? '2.1 Cấu trúc Dữ liệu Nền tảng' : '2.1 Foundational Data Structures'}
          </h1>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>
              {language === 'vi' ? 'Tiến độ:' : 'Progress:'}{' '}
              <strong className="text-slate-200 font-medium">{progressPercent}%</strong>{' '}
              ({currentStageIndex + 1}/{STAGES.length})
            </span>
            {learningProgress?.foundations && (
              <span className="inline-flex items-center gap-1 text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                {language === 'vi' ? 'Đã lưu' : 'Saved'}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          {language === 'vi'
            ? 'So sánh tính toàn vẹn giữa Mảng tuần tự (RAM), Danh sách liên kết và Con trỏ mã băm.'
            : 'Compare integrity between Sequential RAM Arrays, Linked Lists, and Hash Pointers.'}
        </p>
      </div>

      {/* Modern Compact Stepper 6 Steps */}
      <div className="bg-[#0B101E]/90 p-1.5 rounded-xl border border-white/[0.08]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {STAGES.map((stage) => {
            const isActive = activeStage === stage.id;
            const isDone = completedStages[stage.id];

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleStageChange(stage.id)}
                className={`px-3 py-2 rounded-lg text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-slate-800/90 text-white border border-cyan-500/40 shadow-sm ring-1 ring-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-xs font-mono shrink-0 font-medium ${
                      isActive
                        ? 'text-cyan-400'
                        : isDone
                        ? 'text-slate-500'
                        : 'text-slate-600'
                    }`}
                  >
                    {stage.num}
                  </span>
                  <span className="text-xs font-medium truncate font-mono">
                    {stage.title[language]}
                  </span>
                </div>

                {isDone && !isActive && (
                  <Check className="w-3 h-3 text-slate-500 shrink-0" />
                )}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
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
    </section>
  );
};
