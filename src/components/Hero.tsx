/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Terminal,
  ArrowDown,
  Sparkles,
  Copy,
  Check,
  Cpu,
  ShieldAlert,
  ArrowRight,
  ListTree,
  FlaskConical,
  Boxes,
  Layers,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useNavigation, MODULES_REGISTRY, ModuleId, LessonId } from '../context/NavigationContext';
import { useProgressStore } from '../stores/progressStore';
import { hashSha256 } from '../utils/sha256';
import { formatHexWords, hexToBinary } from '../utils/binary';

export const Hero: React.FC = () => {
  const { strings, language } = useLanguage();
  const { navigateTo } = useNavigation();
  const progressMap = useProgressStore((s) => s.progressMap);
  const getTotalProgress = useProgressStore((s) => s.getTotalProgress);
  const getResumeLesson = useProgressStore((s) => s.getResumeLesson);
  const resetProgress = useProgressStore((s) => s.resetProgress);

  const totalProgress = useMemo(() => getTotalProgress(), [progressMap, getTotalProgress]);
  const resumeInfo = useMemo(() => getResumeLesson(), [progressMap, getResumeLesson]);

  const [heroInput, setHeroInput] = useState('Hello World');
  const [hashOutput, setHashOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);

  const isVi = language === 'vi';

  // Find metadata for resume target lesson
  const resumeModuleMeta = MODULES_REGISTRY.find((m) => m.id === resumeInfo.moduleId) || MODULES_REGISTRY[1];
  const resumeLessonMeta =
    resumeModuleMeta.lessons.find((l) => l.id === resumeInfo.lessonId) || resumeModuleMeta.lessons[0];

  const calculateHash = useCallback(async (text: string) => {
    setIsScrambling(true);
    const result = await hashSha256(text);
    // Quick scramble effect
    setTimeout(() => {
      setHashOutput(result.hex);
      setIsScrambling(false);
    }, 120);
  }, []);

  useEffect(() => {
    calculateHash(heroInput);
  }, [heroInput, calculateHash]);

  const copyHash = async () => {
    if (!hashOutput) return;
    await navigator.clipboard.writeText(hashOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const samplePresets = [
    { label: 'Hello World', value: 'Hello World' },
    { label: 'Hello world (1 char diff)', value: 'Hello world' },
    { label: 'Empty String', value: '' },
    { label: 'Bitcoin Genesis', value: 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks' },
  ];

  const words = hashOutput ? formatHexWords(hashOutput) : [];
  const binaryPreview = hashOutput ? hexToBinary(hashOutput).slice(0, 64) : '';

  const learningAreas = [
    {
      id: 'hash',
      title: strings.nav.overviewCards.hashTitle,
      subtitle: strings.nav.overviewCards.hashSubtitle,
      desc: 'SHA-256, Avalanche Effect, One-Way Property, Brute Force & Hash Properties',
      icon: Cpu,
      accent: 'emerald',
    },
    {
      id: 'theory',
      title: strings.nav.overviewCards.theoryTitle,
      subtitle: strings.nav.overviewCards.theorySubtitle,
      desc: 'Cryptography, Block Structure, Decentralization & Consensus Mechanisms',
      icon: ListTree,
      accent: 'blue',
    },
    {
      id: 'simulation',
      title: strings.nav.overviewCards.simulationTitle,
      subtitle: strings.nav.overviewCards.simulationSubtitle,
      desc: 'Transaction Simulator, Mempool, PoW Mining Competition & PoS Validators',
      icon: FlaskConical,
      accent: 'purple',
    },
    {
      id: 'blockchain',
      title: strings.nav.overviewCards.blockchainTitle,
      subtitle: strings.nav.overviewCards.blockchainSubtitle,
      desc: 'Genesis Block, Chain Integrity, Merkle Tree & Tampering Detection',
      icon: Boxes,
      accent: 'emerald',
    },
  ];

  // Helper to get completed count for a specific module
  const getModuleCompletedCount = (modId: string) => {
    const mod = MODULES_REGISTRY.find((m) => m.id === modId);
    if (!mod) return { completed: 0, total: 0 };
    const completed = mod.lessons.filter((l) => progressMap[l.id]?.status === 'completed').length;
    return { completed, total: mod.lessons.length };
  };

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] pt-6 sm:pt-10 pb-16 flex flex-col justify-center items-center overflow-hidden font-sans"
    >
      {/* Background glow & subtle ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/5 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center font-sans">
        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f5f5f5] mb-3 font-display">
          {strings.hero.title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl font-medium text-zinc-200 tracking-normal mb-3 font-display leading-snug">
          {strings.hero.subtitle}
        </p>

        {/* Supporting text */}
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-5 leading-relaxed font-sans">
          {strings.hero.description}
        </p>

        {/* Student Researcher Identity */}
        <div className="inline-flex items-center flex-wrap justify-center gap-2 text-xs font-sans text-zinc-400 mb-10 sm:mb-12">
          <span className="text-emerald-400 font-medium">{strings.hero.researcherLabel}</span>
          <span className="font-semibold text-zinc-200">Phan Tấn Long</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400">CTK47B</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400 font-mono">ID: 2312679</span>
        </div>

        {/* ============================================================ */}
        {/* LEARNING PROGRESS & RESUME LEARNING HERO CARD                */}
        {/* ============================================================ */}
        <div
          id="hero-progress-banner"
          className="max-w-3xl mx-auto bg-[#111111] border border-[#292929] rounded-xl p-5 sm:p-6 mb-8 text-left shadow-lg relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {isVi ? 'TIẾN ĐỘ HỌC TẬP CỦA BẠN' : 'YOUR LEARNING PROGRESS'}
                </span>
                <span className="text-[11px] font-mono text-[#a1a1aa] ml-auto sm:ml-0 font-medium">
                  {totalProgress.completedCount}/{totalProgress.totalCount} {isVi ? 'bài hoàn thành' : 'completed'} ({totalProgress.percentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#0a0a0a] h-2 rounded-full overflow-hidden border border-[#292929]">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(totalProgress.percentage, 5)}%` }}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <span className="text-[#71717a]">{isVi ? 'Đang học gần nhất:' : 'Next up:'}</span>
                <span className="font-semibold text-[#f5f5f5] truncate">
                  {isVi ? resumeLessonMeta.titleVi : resumeLessonMeta.titleEn}
                </span>
              </div>
            </div>

            {/* Direct Resume Button */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                id="btn-resume-learning"
                onClick={() => navigateTo(resumeInfo.moduleId as ModuleId, resumeInfo.lessonId as LessonId)}
                aria-label={isVi ? 'Tiếp tục học bài học gần nhất' : 'Resume recent lesson'}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0a0a0a] font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none active:scale-95"
              >
                <PlayCircle className="w-4 h-4" />
                <span>{isVi ? 'Tiếp tục học' : 'Resume Learning'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 font-sans">
          <button
            onClick={() => navigateTo('hash', 'generator')}
            id="hero-primary-cta"
            aria-label={strings.hero.trySha256}
            className="px-5 py-2.5 rounded-lg bg-[#111111] hover:bg-[#181818] text-[#f5f5f5] font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 border border-[#292929] hover:border-emerald-500/40 flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>{strings.hero.trySha256}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateTo('simulation', 'proof-of-work')}
            id="hero-secondary-cta"
            aria-label={isVi ? 'Vào phòng thực nghiệm PoW' : 'Enter PoW simulation lab'}
            className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0a0a0a] font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 uppercase tracking-wider cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none active:scale-95"
          >
            <FlaskConical className="w-4 h-4 text-[#0a0a0a]" />
            <span>{isVi ? 'Phòng Thực Nghiệm PoW' : 'PoW Simulation Lab'}</span>
          </button>
        </div>

        {/* Hero Live Animated Hash Simulation Card */}
        <div
          id="hero-hash-preview-card"
          className="relative max-w-3xl mx-auto rounded-xl bg-[#111111] border border-[#292929] p-5 sm:p-6 shadow-xl text-left backdrop-blur-xl transition-all hover:border-emerald-500/40 mb-14"
        >
          {/* Card Header Bar */}
          <div className="flex items-center justify-between border-b border-[#292929] pb-3 mb-4 font-sans">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-semibold text-[#f5f5f5] ml-2 tracking-wide font-display">
                {strings.hero.engineTitle}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="text-[11px] text-emerald-400 font-mono">NIST FIPS 180-4</span>
            </div>
          </div>

          {/* Quick interactive input inside hero */}
          <div className="mb-4 font-sans">
            <div className="flex items-center justify-between text-xs text-[#a1a1aa] mb-1.5">
              <span className="uppercase tracking-wider font-semibold text-emerald-400">{strings.hero.liveInputLabel}</span>
              <span className="text-[#71717a] font-mono">{heroInput.length} {strings.hashGenerator.lengthChars} · {new TextEncoder().encode(heroInput).length} {strings.hashGenerator.lengthBytes}</span>
            </div>
            <div className="relative">
              <input
                id="hero-quick-input"
                type="text"
                value={heroInput}
                onChange={(e) => setHeroInput(e.target.value)}
                placeholder={strings.hero.inputPlaceholder}
                className="w-full bg-[#0a0a0a] border border-[#292929] rounded-lg px-4 py-2.5 text-sm sm:text-base font-sans text-[#f5f5f5] placeholder-[#71717a] focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 transition-colors shadow-inner"
              />
            </div>

            {/* Preset quick test vectors */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="text-[11px] font-sans text-[#71717a] self-center mr-1">{strings.hero.presetsLabel}</span>
              {samplePresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setHeroInput(preset.value)}
                  className={`text-xs font-sans px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    heroInput === preset.value
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                      : 'bg-[#0a0a0a] text-[#a1a1aa] hover:text-[#f5f5f5] border border-[#292929]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hashing Flow Connector */}
          <div className="flex items-center justify-center my-3 text-emerald-400">
            <div className="h-px bg-gradient-to-r from-transparent via-[#292929] to-transparent flex-1" />
            <div className="px-2.5 py-0.5 rounded-md bg-[#181818] border border-[#292929] text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center">
              <span>SHA-256 (64 ROUNDS)</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#292929] to-transparent flex-1" />
          </div>

          {/* 256-bit Hexadecimal Output Display */}
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
              <span className="uppercase tracking-wider font-semibold text-emerald-400">{strings.hero.digestLabel}</span>
              <button
                id="hero-copy-hash-btn"
                onClick={copyHash}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg bg-[#0a0a0a] border border-[#292929] hover:border-emerald-500/40 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? strings.hero.copied : strings.hero.copyHash}</span>
              </button>
            </div>

            {/* 8 32-bit Words Grid */}
            <div className="bg-[#0a0a0a] border border-[#292929] rounded-lg p-3 sm:p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs sm:text-sm">
                {words.map((word, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredWordIndex(idx)}
                    onMouseLeave={() => setHoveredWordIndex(null)}
                    className={`p-2.5 rounded-lg transition-all text-center ${
                      hoveredWordIndex === idx
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                        : 'bg-[#111111] text-[#f5f5f5] border border-[#292929] hover:border-[#383838]'
                    }`}
                  >
                    <div className="text-[10px] text-[#71717a] mb-0.5 font-sans">W{idx}</div>
                    <div className="font-bold tracking-wider font-mono">{word}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Binary Bitstream Preview */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#71717a] bg-[#0a0a0a] px-3.5 py-2 rounded-lg border border-[#292929]">
              <div className="flex items-center gap-2 truncate">
                <span className="text-emerald-400 shrink-0 font-bold font-sans">{strings.hero.binaryPreview}</span>
                <span className="text-emerald-400/80 break-all font-mono">{binaryPreview}...</span>
              </div>
              <span className="text-emerald-400 font-semibold font-mono shrink-0 ml-2">{strings.hero.bitsBytes}</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* HOMEPAGE NAVIGATION VISUALIZATION                            */}
        {/* 4 Compact learning area cards with direct section routing    */}
        {/* ============================================================ */}
        <div className="max-w-5xl mx-auto text-left">
          <div className="border-b border-[#292929] pb-3 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h2 className="text-xs font-mono font-medium tracking-wide text-[#a1a1aa]">
                {strings.nav.projectTitle} · Các phân hệ học tập
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">4 phân hệ chính</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningAreas.map((area, index) => {
              const Icon = area.icon;
              const { completed, total } = getModuleCompletedCount(area.id);
              const isModuleDone = total > 0 && completed === total;

              return (
                <button
                  key={area.id}
                  id={`hero-card-module-${area.id}`}
                  onClick={() => navigateTo(area.id as ModuleId)}
                  className="group rounded-xl bg-[#111111] border border-[#292929] hover:border-emerald-500/40 p-5 transition-all duration-200 flex flex-col justify-between hover:bg-[#181818] relative text-left w-full cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#292929] group-hover:border-emerald-400/40 group-hover:bg-emerald-500/10 flex items-center justify-center text-emerald-400 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-mono text-[#71717a] group-hover:text-emerald-400 transition-colors">
                        0{index + 1}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold font-sans text-[#f5f5f5] group-hover:text-emerald-300 transition-colors tracking-normal">
                          {area.title}
                        </h3>
                      </div>
                      <p className="text-xs text-emerald-400 font-medium mt-0.5">
                        {area.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-2">
                      {area.desc}
                    </p>
                  </div>

                  <div className="pt-3 mt-4 border-t border-[#292929] flex items-center justify-between text-[11px] font-sans">
                    <div className="flex items-center gap-1 text-[10px]">
                      {isModuleDone ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {isVi ? 'Đã hoàn thành' : 'Completed'}
                        </span>
                      ) : (
                        <span className="text-[#71717a]">
                          {completed}/{total} {isVi ? 'bài' : 'lessons'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-300 text-xs">
                      <span>{isVi ? 'Khám phá' : 'Explore'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
