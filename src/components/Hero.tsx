/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  ArrowRight, 
  Cpu, 
  ListTree, 
  FlaskConical, 
  Boxes, 
  CheckCircle2, 
  PlayCircle,
  Github,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Zap,
  GraduationCap
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useNavigation, MODULES_REGISTRY, ModuleId, LessonId } from '../context/NavigationContext';
import { useProgressStore } from '../stores/progressStore';
import { InteractiveBlockInspector } from './Hero/InteractiveBlockInspector';

export const Hero: React.FC = () => {
  const { strings, language } = useLanguage();
  const { navigateTo } = useNavigation();
  const progressMap = useProgressStore((s) => s.progressMap);
  const getTotalProgress = useProgressStore((s) => s.getTotalProgress);
  const getResumeLesson = useProgressStore((s) => s.getResumeLesson);

  const totalProgress = useMemo(() => getTotalProgress(), [progressMap, getTotalProgress]);
  const resumeInfo = useMemo(() => getResumeLesson(), [progressMap, getResumeLesson]);
  const isVi = language === 'vi';

  // Find metadata for resume target lesson
  const resumeModuleMeta = MODULES_REGISTRY.find((m) => m.id === resumeInfo.moduleId) || MODULES_REGISTRY[1];
  const resumeLessonMeta =
    resumeModuleMeta.lessons.find((l) => l.id === resumeInfo.lessonId) || resumeModuleMeta.lessons[0];

  const learningAreas = [
    {
      id: 'hash',
      title: strings.nav.overviewCards.hashTitle,
      subtitle: strings.nav.overviewCards.hashSubtitle,
      desc: isVi 
        ? 'Mã hóa SHA-256, Hiệu ứng Thác đổ, Tính Đơn hướng, Thử sai Brute Force & Pipeline 64 vòng' 
        : 'SHA-256, Avalanche Effect, One-Way Property, Brute Force & 64-Round Pipeline',
      icon: Cpu,
    },
    {
      id: 'theory',
      title: strings.nav.overviewCards.theoryTitle,
      subtitle: strings.nav.overviewCards.theorySubtitle,
      desc: isVi 
        ? 'Mật mã học phi đối xứng ECDSA, Cấu trúc khối, Mạng P2P & Lịch sử Đồng thuận' 
        : 'ECDSA Asymmetric Cryptography, Block Structure, P2P Networks & Consensus History',
      icon: ListTree,
    },
    {
      id: 'simulation',
      title: strings.nav.overviewCards.simulationTitle,
      subtitle: strings.nav.overviewCards.simulationSubtitle,
      desc: isVi 
        ? 'Bộ mô phỏng Giao dịch UTXO, Mempool, Cuộc đua Đào PoW & Trình xác thực PoS' 
        : 'UTXO Transaction Simulator, Mempool, PoW Mining Competition & PoS Validators',
      icon: FlaskConical,
    },
    {
      id: 'blockchain',
      title: strings.nav.overviewCards.blockchainTitle,
      subtitle: strings.nav.overviewCards.blockchainSubtitle,
      desc: isVi 
        ? 'Khối Genesis, Tính toàn vẹn chuỗi, Cây Merkle & Phát hiện Giả mạo dữ liệu' 
        : 'Genesis Block, Chain Integrity, Merkle Tree & Tampering Detection',
      icon: Boxes,
    },
  ];

  const getModuleCompletedCount = (modId: string) => {
    const mod = MODULES_REGISTRY.find((m) => m.id === modId);
    if (!mod) return { completed: 0, total: 0 };
    const completed = mod.lessons.filter((l) => progressMap[l.id]?.status === 'completed').length;
    return { completed, total: mod.lessons.length };
  };

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] py-6 sm:py-10 flex flex-col justify-center overflow-hidden font-sans rounded-3xl bg-gradient-to-b from-[#090D16] to-[#050811] border border-white/[0.06]"
    >
      {/* ========================================================================= */}
      {/* STRICT LIGHTING: ONLY ONE SOFT RADIAL CYAN/BLUE FOCAL GLOW BEHIND HERO   */}
      {/* ========================================================================= */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,210,255,0.08),rgba(0,114,255,0.03),transparent_75%)] pointer-events-none z-0" 
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ========================================================================= */}
        {/* MINIMAL TOP HERO SUB-HEADER BAR                                          */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
              ◈
            </div>
            <div>
              <span className="font-display font-bold text-white tracking-tight text-base">
                BlockLab
              </span>
              <span className="text-[11px] text-slate-400 block font-sans">
                {isVi ? 'Nền tảng học tập trực quan về Blockchain & Mật mã' : 'Interactive Blockchain & Cryptography Education Platform'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
            <button
              onClick={() => navigateTo('theory', 'data-structures')}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer hidden md:inline-flex"
            >
              {isVi ? 'Lý thuyết' : 'Theory'}
            </button>
            <button
              onClick={() => navigateTo('simulation', 'transactions')}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer hidden md:inline-flex"
            >
              {isVi ? 'Mô phỏng 3.1' : 'Simulation 3.1'}
            </button>
            <button
              onClick={() => navigateTo('simulation', 'proof-of-work')}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer hidden sm:inline-flex"
            >
              {isVi ? 'Đồng thuận' : 'Consensus'}
            </button>
            <button
              onClick={() => navigateTo('hash', 'generator')}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer hidden sm:inline-flex"
            >
              {isVi ? 'Tài liệu NIST' : 'NIST Standards'}
            </button>
            <button
              onClick={() => navigateTo('hash', 'generator')}
              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 hover:text-white text-xs font-mono font-medium transition-all duration-150 ease-out cursor-pointer flex items-center gap-1.5"
            >
              <span>{isVi ? 'Khám phá bài Lab' : 'Explore Labs'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TWO-COLUMN HERO GRID (16:9 AESTHETIC COMPOSITION)                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT COLUMN: Core Value Proposition, Typography & CTAs */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 text-left">
            {/* Tech Tags Pill */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.08] text-xs font-mono text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,210,255,0.6)]" />
              <span className="font-semibold text-cyan-300">NIST FIPS 180-4</span>
              <span className="text-slate-500">•</span>
              <span>SECP256k1</span>
              <span className="text-slate-500">•</span>
              <span>PoW / PoS</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#F8FAFC] font-display">
                Demystifying Blockchain{' '}
                <span className="block mt-1 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  From Zero to Consensus
                </span>
              </h1>
            </div>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-xl font-sans font-normal">
              {isVi 
                ? 'Tương tác trực quan với hàm băm SHA-256, chữ ký số ECDSA, cây Merkle và các thuật toán đồng thuận theo chuẩn NIST FIPS 180-4.' 
                : 'Interact visually with SHA-256 hashing, ECDSA digital signatures, Merkle trees, and decentralized consensus algorithms certified to NIST FIPS 180-4.'}
            </p>

            {/* CTA Group */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                id="hero-start-simulation-btn"
                onClick={() => navigateTo('hash', 'generator')}
                className="px-5 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all duration-150 ease-out shadow-sm hover:shadow-cyan-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>{isVi ? 'Bắt đầu mô phỏng' : 'Start Simulation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="https://github.com/phantanlongzzz/blockchain-elearning"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] text-[#94A3B8] hover:text-[#F8FAFC] font-medium text-sm transition-all duration-150 ease-out flex items-center gap-2 cursor-pointer"
              >
                <Github className="w-4 h-4 text-slate-300" />
                <span>{isVi ? 'Xem mã nguồn đồ án' : 'View Source Code'}</span>
              </a>
            </div>

            {/* Metrics & Progress Glass Card */}
            <div className="p-4 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/[0.08] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-0.5">
                <div className="text-lg font-bold text-[#F8FAFC] tracking-tight">19</div>
                <div className="text-[11px] text-[#94A3B8] font-sans">
                  {isVi ? 'Phân hệ Tương tác' : 'Interactive Modules'}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-lg font-bold text-cyan-400 tracking-tight">0%</div>
                <div className="text-[11px] text-[#94A3B8] font-sans">
                  {isVi ? 'Trừu tượng hóa hộp đen' : 'Black-box Abstraction'}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-0.5">
                <div className="text-lg font-bold text-[#F6C453] tracking-tight">
                  {totalProgress.completedCount > 0 ? `${totalProgress.percentage}%` : 'NIST'}
                </div>
                <div className="text-[11px] text-[#94A3B8] font-sans">
                  {totalProgress.completedCount > 0 
                    ? (isVi ? 'Tiến độ của bạn' : 'Your Progress') 
                    : (isVi ? 'Tiêu chuẩn Mật mã' : 'Rigorous Standard')}
                </div>
              </div>
            </div>

            {/* Resume Learning Prompt if in progress */}
            {totalProgress.completedCount > 0 && (
              <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <PlayCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 truncate">
                    {isVi ? 'Bài học tiếp theo:' : 'Next up:'}{' '}
                    <strong className="text-white font-medium">
                      {isVi ? resumeLessonMeta.titleVi : resumeLessonMeta.titleEn}
                    </strong>
                  </span>
                </div>
                <button
                  onClick={() => navigateTo(resumeInfo.moduleId as ModuleId, resumeInfo.lessonId as LessonId)}
                  className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-[11px] font-medium transition-colors shrink-0 cursor-pointer"
                >
                  {isVi ? 'Tiếp tục' : 'Resume'} →
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Interactive 3D-styled Block Header & Merkle Inspector */}
          <div className="lg:col-span-6 xl:col-span-6">
            <InteractiveBlockInspector />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HOMEPAGE 4 MODULES EXPLORATION CARDS (MATTE GLASS SURFACES)              */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-white/[0.06] space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h2 className="text-xs font-mono font-medium tracking-wide text-slate-400 uppercase">
                {isVi ? 'Cấu trúc Lộ trình Đào tạo' : 'Curriculum Architecture'} · 4 Phân hệ
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">NIST FIPS & BTC Core Spec</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningAreas.map((area, index) => {
              const Icon = area.icon;
              const { completed, total } = getModuleCompletedCount(area.id);
              const isModuleDone = total > 0 && completed === total;

              return (
                <button
                  key={area.id}
                  id={`hero-card-module-${area.id}`}
                  onClick={() => navigateTo(area.id as ModuleId)}
                  className="group rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-cyan-500/30 p-5 transition-all duration-150 ease-out flex flex-col justify-between relative text-left w-full cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors">
                        0{index + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold font-sans text-[#F8FAFC] group-hover:text-white transition-colors tracking-tight">
                        {area.title}
                      </h3>
                      <p className="text-xs text-cyan-300/80 font-mono mt-0.5">
                        {area.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2 font-sans">
                      {area.desc}
                    </p>
                  </div>

                  <div className="pt-3 mt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-sans">
                    <div className="flex items-center gap-1 text-[10px] font-mono">
                      {isModuleDone ? (
                        <span className="text-success font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {isVi ? 'Hoàn thành' : 'Completed'}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {completed}/{total} {isVi ? 'bài học' : 'lessons'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 group-hover:text-cyan-300 text-xs font-mono transition-colors">
                      <span>{isVi ? 'Khám phá' : 'Enter'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RESEARCHER IDENTITY FOOTER                                               */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs font-sans text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-medium">Đồ án tốt nghiệp Công nghệ Thông tin</span>
            <span className="text-slate-600">·</span>
            <span>Sinh viên thực hiện: <strong className="text-white font-semibold">Phan Tấn Long</strong></span>
            <span className="text-slate-600">·</span>
            <span className="font-mono">MSSV: 2312679</span>
          </div>

          <a
            href="https://github.com/phantanlongzzz/blockchain-elearning"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-cyan-300 transition-colors font-mono text-[11px] flex items-center gap-1.5 cursor-pointer"
          >
            <Github className="w-3.5 h-3.5" />
            <span>github.com/phantanlongzzz/blockchain-elearning</span>
          </a>
        </div>
      </div>
    </section>
  );
};
