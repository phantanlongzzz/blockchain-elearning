import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Clock,
  GitFork,
  Workflow,
  CheckCircle2,
  BookmarkCheck,
  GraduationCap,
  FileCode2,
  HelpCircle,
  Cpu,
  Zap,
  FlaskConical,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { BlockStructureExplorer } from './BlockStructureExplorer';
import { DigitalSignatureMiniLab } from './DigitalSignatureMiniLab';
import { TimestampExplorer } from './TimestampExplorer';
import { MerkleRootInteractive } from './MerkleRootInteractive';
import { FullBlockLifecycleSimulation } from './FullBlockLifecycleSimulation';
import { BlockEducationalSummary } from './BlockEducationalSummary';
import { InteractiveBlockHandsOnLab } from './InteractiveBlockHandsOnLab';

export type Lesson2Stage =
  | 'structure'
  | 'signature'
  | 'timestamp'
  | 'merkle'
  | 'lifecycle'
  | 'summary';

export const BlockArchitectureLab: React.FC = () => {
  const { strings, language } = useLanguage();
  const { markModuleInteracted, learningProgress } = useAuth();
  const [labMode, setLabMode] = useState<'guided' | 'hands-on'>('guided');
  const [activeStage, setActiveStage] = useState<Lesson2Stage>('structure');

  // Track completed stages for progress calculation
  const [completedStages, setCompletedStages] = useState<Record<string, boolean>>({
    structure: true,
  });

  const handleInteraction = (stage?: Lesson2Stage) => {
    markModuleInteracted('blockArchitecture' as any);
    if (stage) {
      setCompletedStages((prev) => ({ ...prev, [stage]: true }));
    }
  };

  const handleStageChange = (newStage: Lesson2Stage) => {
    setActiveStage(newStage);
    handleInteraction(newStage);
  };

  // 5 Main Parts + Final Architectural Summary
  const STAGES: {
    id: Lesson2Stage;
    num: number;
    title: { vi: string; en: string };
    shortTitle: { vi: string; en: string };
    icon: React.ElementType;
    color: string;
    description: { vi: string; en: string };
  }[] = [
    {
      id: 'structure',
      num: 1,
      title: {
        vi: 'Cấu Trúc Khối',
        en: 'Block Structure',
      },
      shortTitle: { vi: 'Cấu Trúc Khối', en: 'Block Structure' },
      icon: Boxes,
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40',
      description: {
        vi: 'Header & Body',
        en: 'Header & Body',
      },
    },
    {
      id: 'signature',
      num: 2,
      title: {
        vi: 'Chữ Ký Số',
        en: 'Digital Signature',
      },
      shortTitle: { vi: 'Chữ Ký Số', en: 'Digital Signature' },
      icon: KeyRound,
      color: 'border-purple-500 text-purple-400 bg-purple-950/40',
      description: {
        vi: 'Xác minh danh tính',
        en: 'Verify identity',
      },
    },
    {
      id: 'timestamp',
      num: 3,
      title: {
        vi: 'Dấu Thời Gian',
        en: 'Timestamp',
      },
      shortTitle: { vi: 'Dấu Thời Gian', en: 'Timestamp' },
      icon: Clock,
      color: 'border-amber-500 text-amber-400 bg-amber-950/40',
      description: {
        vi: 'Thời gian trong Header',
        en: 'Time in Header',
      },
    },
    {
      id: 'merkle',
      num: 4,
      title: {
        vi: 'Merkle Root',
        en: 'Merkle Root',
      },
      shortTitle: { vi: 'Merkle Root', en: 'Merkle Root' },
      icon: GitFork,
      color: 'border-indigo-500 text-indigo-400 bg-indigo-950/40',
      description: {
        vi: 'Tóm lược giao dịch',
        en: 'Summarize TXs',
      },
    },
    {
      id: 'lifecycle',
      num: 5,
      title: {
        vi: 'Vòng Đời Giao Dịch',
        en: 'Transaction Lifecycle',
      },
      shortTitle: { vi: 'Vòng Đời', en: 'Lifecycle' },
      icon: Workflow,
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40',
      description: {
        vi: 'Tạo → Ký → Đóng Block',
        en: 'Create → Sign → Block',
      },
    },
    {
      id: 'summary',
      num: 6,
      title: {
        vi: 'Tổng Kết & Code',
        en: 'Summary & Code',
      },
      shortTitle: { vi: 'Tổng Kết', en: 'Summary' },
      icon: GraduationCap,
      color: 'border-blue-500 text-blue-400 bg-blue-950/40',
      description: {
        vi: 'Sơ đồ & Mã nguồn',
        en: 'Diagram & Source',
      },
    },
  ];

  // Current stage index (0-5)
  const currentStageIndex = STAGES.findIndex((s) => s.id === activeStage);

  return (
    <section
      id="lesson2-block"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold tracking-wide">
              {language === 'vi' ? 'BUỔI 2' : 'LESSON 2'}
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {language === 'vi' ? 'KIẾN TRÚC BLOCK' : 'BLOCK ARCHITECTURE'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-400" />
            <span>
              {language === 'vi'
                ? 'Bên Trong Một Blockchain Block'
                : 'Inside a Blockchain Block'}
            </span>
          </h2>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 shadow-inner flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLabMode('guided')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                labMode === 'guided'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Hướng Dẫn' : 'Guided'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLabMode('hands-on');
                handleInteraction();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                labMode === 'hands-on'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-300" />
              <span>{language === 'vi' ? 'Thực Hành Tự Do' : 'Hands-on Lab'}</span>
            </button>
          </div>
        </div>
      </div>

      {labMode === 'hands-on' ? (
        /* INTERACTIVE HANDS-ON LAB */
        <InteractiveBlockHandsOnLab
          onInteracted={() => handleInteraction()}
          onSwitchToGuided={() => setLabMode('guided')}
        />
      ) : (
        /* GUIDED MODE: Clean Stage Navigation Bar */
        <>
          {/* Compact Stage Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              const isActive = activeStage === stage.id;
              const isDone = completedStages[stage.id];

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleStageChange(stage.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 group ${
                    isActive
                      ? `${stage.color} ring-1 ring-emerald-400/40 shadow-md`
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'opacity-100' : 'opacity-60'}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">
                      {stage.shortTitle[language]}
                    </div>
                  </div>
                  {isDone && !isActive && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Stage Content Renderer */}
          <div className="mt-6">
            {activeStage === 'structure' && (
              <BlockStructureExplorer
                onInteracted={() => handleInteraction('structure')}
                onNextStage={() => handleStageChange('signature')}
              />
            )}
            {activeStage === 'signature' && (
              <DigitalSignatureMiniLab
                onInteracted={() => handleInteraction('signature')}
                onNextStage={() => handleStageChange('timestamp')}
                onPrevStage={() => handleStageChange('structure')}
              />
            )}
            {activeStage === 'timestamp' && (
              <TimestampExplorer
                onInteracted={() => handleInteraction('timestamp')}
                onNextStage={() => handleStageChange('merkle')}
                onPrevStage={() => handleStageChange('signature')}
              />
            )}
            {activeStage === 'merkle' && (
              <MerkleRootInteractive
                onInteracted={() => handleInteraction('merkle')}
                onNextStage={() => handleStageChange('lifecycle')}
                onPrevStage={() => handleStageChange('timestamp')}
              />
            )}
            {activeStage === 'lifecycle' && (
              <FullBlockLifecycleSimulation
                onInteracted={() => handleInteraction('lifecycle')}
                onNextStage={() => handleStageChange('summary')}
                onPrevStage={() => handleStageChange('merkle')}
                onOpenHandsOnLab={() => setLabMode('hands-on')}
              />
            )}
            {activeStage === 'summary' && (
              <BlockEducationalSummary
                onInteracted={() => handleInteraction('summary')}
                onPrevStage={() => handleStageChange('lifecycle')}
                onOpenHandsOnLab={() => setLabMode('hands-on')}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
};
