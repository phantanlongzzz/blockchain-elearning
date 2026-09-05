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
      className="relative min-h-[85vh] py-8 sm:py-12 flex flex-col justify-center overflow-hidden font-sans rounded-3xl bg-gradient-to-b from-[#090D16]/80 via-[#060912]/90 to-[#04060B] border border-white/[0.07] shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
    >
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ========================================================================= */}
        {/* TWO-COLUMN HERO GRID (16:9 AESTHETIC COMPOSITION)                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT COLUMN: Core Value Proposition, Typography & CTAs */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 text-left">
            {/* Tech Tags Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0B0F19]/60 backdrop-blur-md border border-white/[0.08] text-xs font-mono text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,210,255,0.6)]" />
              <span className="font-semibold text-cyan-300">NIST FIPS 180-4</span>
              <span className="text-slate-500">•</span>
              <span>SECP256k1</span>
              <span className="text-slate-500">•</span>
              <span>PoW / PoS</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#F8FAFC] font-display">
                Demystifying Blockchain{' '}
                <span className="block mt-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
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
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-start-simulation-btn"
                onClick={() => navigateTo('hash', 'generator')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm transition-all duration-200 ease-out shadow-[0_0_20px_rgba(0,210,255,0.25)] hover:shadow-[0_0_30px_rgba(0,210,255,0.4)] active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>{isVi ? 'Bắt đầu mô phỏng' : 'Start Simulation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="https://github.com/phantanlongzzz/blockchain-elearning"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-300 hover:text-white font-medium text-sm transition-all duration-200 ease-out flex items-center gap-2 cursor-pointer"
              >
                <Github className="w-4 h-4 text-slate-300" />
                <span>{isVi ? 'Xem mã nguồn đồ án' : 'View Source Code'}</span>
              </a>
            </div>

            {/* Metrics & Progress Glass Card */}
            <div className="p-5 rounded-xl bg-[#0B0F19]/60 backdrop-blur-md border border-white/[0.07] hover:border-cyan-500/20 transition-all duration-200 shadow-[0_8px_30px_rgb(0,0,0,0.35)] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
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
              <div className="p-4 rounded-xl bg-[#0B0F19]/70 backdrop-blur-md border border-cyan-500/30 flex items-center justify-between gap-3 text-xs shadow-md">
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
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-[11px] font-medium transition-colors shrink-0 cursor-pointer border border-cyan-500/30"
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
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.6)]" />
              <h2 className="text-xs font-mono font-medium tracking-wide text-slate-300 uppercase">
                {isVi ? 'Cấu trúc Lộ trình Đào tạo' : 'Curriculum Architecture'} · 4 Phân hệ
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">NIST FIPS & BTC Core Spec</span>
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
                  className="group rounded-xl bg-[#0B0F19]/60 backdrop-blur-md border border-white/[0.07] hover:border-cyan-500/30 hover:bg-[#0B0F19]/80 p-5 transition-all duration-200 ease-out flex flex-col justify-between relative text-left w-full cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 group-hover:text-cyan-400 transition-colors">
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
