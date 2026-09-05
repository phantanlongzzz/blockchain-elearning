import React, { useState } from 'react';
import {
  Boxes,
  KeyRound,
  Clock,
  GitFork,
  Workflow,
  CheckCircle2,
  GraduationCap,
  FlaskConical,
  Sparkles,
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
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const { markModuleInteracted } = useAuth();
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
    num: string;
    title: { vi: string; en: string };
    shortTitle: { vi: string; en: string };
    icon: React.ElementType;
    description: { vi: string; en: string };
  }[] = [
    {
      id: 'structure',
      num: '01',
      title: {
        vi: 'Cấu Trúc Khối',
        en: 'Block Structure',
      },
      shortTitle: { vi: 'Cấu Trúc Khối', en: 'Block Structure' },
      icon: Boxes,
      description: {
        vi: 'Header & Body',
        en: 'Header & Body',
      },
    },
    {
      id: 'signature',
      num: '02',
      title: {
        vi: 'Chữ Ký Số',
        en: 'Digital Signature',
      },
      shortTitle: { vi: 'Chữ Ký Số', en: 'Digital Signature' },
      icon: KeyRound,
      description: {
        vi: 'Xác minh danh tính',
        en: 'Verify identity',
      },
    },
    {
      id: 'timestamp',
      num: '03',
      title: {
        vi: 'Dấu Thời Gian',
        en: 'Timestamp',
      },
      shortTitle: { vi: 'Dấu Thời Gian', en: 'Timestamp' },
      icon: Clock,
      description: {
        vi: 'Thời gian trong Header',
        en: 'Time in Header',
      },
    },
    {
      id: 'merkle',
      num: '04',
      title: {
        vi: 'Merkle Root',
        en: 'Merkle Root',
      },
      shortTitle: { vi: 'Merkle Root', en: 'Merkle Root' },
      icon: GitFork,
      description: {
        vi: 'Tóm lược giao dịch',
        en: 'Summarize TXs',
      },
    },
    {
      id: 'lifecycle',
      num: '05',
      title: {
        vi: 'Vòng Đời Giao Dịch',
        en: 'Transaction Lifecycle',
      },
      shortTitle: { vi: 'Vòng Đời Khối', en: 'Block Lifecycle' },
      icon: Workflow,
      description: {
        vi: 'Tạo → Ký → Đóng Block',
        en: 'Create → Sign → Block',
      },
    },
    {
      id: 'summary',
      num: '06',
      title: {
        vi: 'Tổng Kết & Mã Nguồn',
        en: 'Summary & Code',
      },
      shortTitle: { vi: 'Tổng Kết', en: 'Summary' },
      icon: GraduationCap,
      description: {
        vi: 'Sơ đồ & Mã nguồn',
        en: 'Diagram & Source',
      },
    },
  ];

  const completedCount = Object.values(completedStages).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / STAGES.length) * 100);

  return (
    <section
      id="lesson2-block"
      className="space-y-8 scroll-mt-24 font-sans"
    >
      {/* Module Title Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0F19]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/[0.05] rounded-full blur-[120px] pointer-events-none -mr-20 -mt-20" />
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-medium uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isVi ? '2.2 KIẾN TRÚC KHỐI & VÒNG ĐỜI KHỐI' : '2.2 BLOCK ARCHITECTURE & LIFECYCLE'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
                {isVi
                  ? 'Kiến Trúc Khối & Vòng Đời Khối'
                  : 'Block Architecture & Lifecycle'}
              </h2>
              <p className="text-sm text-slate-400 max-w-3xl font-sans leading-relaxed">
                {isVi
                  ? 'Khám phá cấu tạo chi tiết của Block Header, Block Body, Cây Merkle và quy trình ký số bảo vệ sổ cái phi tập trung.'
                  : 'Explore the internal anatomy of Block Header, Block Body, Merkle Trees, and digital signatures securing the decentralized ledger.'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.08] flex items-center">
                <button
                  type="button"
                  id="btn-mode-guided"
                  onClick={() => setLabMode('guided')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    labMode === 'guided'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(0,210,255,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 inline" />
                  <span>{isVi ? 'Hướng Dẫn' : 'Guided'}</span>
                </button>
                <button
                  type="button"
                  id="btn-mode-hands-on"
                  onClick={() => {
                    setLabMode('hands-on');
                    handleInteraction();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    labMode === 'hands-on'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(0,210,255,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5 inline" />
                  <span>{isVi ? 'Tự Do' : 'Hands-on'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-2 pt-2 border-t border-white/[0.05]">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-slate-400">
                {isVi ? 'Tiến độ chuyên đề:' : 'Module Progress:'}{' '}
                <span className="text-slate-200 font-medium font-mono">
                  {completedCount}/{STAGES.length} {isVi ? 'phần hoàn thành' : 'sections completed'}
                </span>
              </span>
              <span className="text-cyan-300 font-semibold font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden border border-white/[0.06]">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(0,210,255,0.6)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
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
        /* GUIDED MODE */
        <div className="space-y-6">
          {/* Stage Navigation Tabs */}
          <div
            role="tablist"
            aria-label={isVi ? 'Danh sách giai đoạn bài học cấu trúc khối' : 'Block architecture lesson stages'}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth p-1.5 bg-[#0B0F19]/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
          >
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              const isActive = activeStage === stage.id;
              const isDone = completedStages[stage.id];

              return (
                <button
                  key={stage.id}
                  id={`tab-${stage.id}`}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  type="button"
                  onClick={() => handleStageChange(stage.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-[#0B1220]/90 to-[#080D1A]/95 text-white border border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.2)] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(0,210,255,0.8)]'
                        : isDone
                        ? 'bg-white/[0.08] text-slate-300'
                        : 'bg-white/[0.04] text-slate-500'
                    }`}
                  >
                    {stage.num}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="font-sans whitespace-nowrap">{stage.shortTitle[language]}</span>
                  {isDone && !isActive && (
                    <CheckCircle2 className="w-3 h-3 text-cyan-400/80 shrink-0 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Stage Content Renderer */}
          <div>
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
        </div>
      )}
    </section>
  );
};

