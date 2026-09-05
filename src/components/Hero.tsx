/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowRight, 
  Github, 
  Zap, 
  GraduationCap 
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useNavigation, ModuleId } from '../context/NavigationContext';
import { InteractiveBlockInspector } from './Hero/InteractiveBlockInspector';

export const Hero: React.FC = () => {
  const { language } = useLanguage();
  const { navigateTo } = useNavigation();
  const isVi = language === 'vi';

  const learningAreas = [
    {
      id: 'hash',
      title: isVi ? 'Hàm băm SHA-256' : 'SHA-256 Hash Functions',
    },
    {
      id: 'theory',
      title: isVi ? 'Mật mã học & Cấu trúc khối' : 'Cryptography & Block Architecture',
    },
    {
      id: 'simulation',
      title: isVi ? 'Mô phỏng Giao dịch & Đồng thuận' : 'Transaction Simulation & Consensus',
    },
    {
      id: 'blockchain',
      title: isVi ? 'Sổ cái & Cây Merkle' : 'Ledger & Merkle Trees',
    },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] py-8 sm:py-12 flex flex-col justify-center overflow-hidden font-sans rounded-3xl bg-gradient-to-b from-[#090D16]/80 via-[#060912]/90 to-[#04060B] border border-white/[0.07] shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
    >
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ========================================================================= */}
        {/* TWO-COLUMN HERO GRID (16:9 AESTHETIC COMPOSITION)                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT COLUMN: Core Value Proposition, Typography & CTAs */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 text-left">
            {/* Tech Tags Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0B0F19]/60 backdrop-blur-md border border-white/[0.08] text-xs font-mono text-slate-300 shadow-sm group">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse group-hover:[animation-play-state:paused] shadow-[0_0_8px_rgba(0,210,255,0.6)]" />
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
                <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradientFlow_6s_ease_infinite] hover:[animation-play-state:paused] drop-shadow-[0_0_20px_rgba(0,210,255,0.25)] cursor-default">
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
          </div>

          {/* RIGHT COLUMN: Interactive 3D-styled Block Header & Merkle Inspector */}
          <div className="lg:col-span-6 xl:col-span-6">
            <InteractiveBlockInspector />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HOMEPAGE 4 MODULES EXPLORATION CARDS (CLEAN TITLE-ONLY CARDS)             */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-white/[0.06]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningAreas.map((area, index) => (
              <button
                key={area.id}
                id={`hero-card-module-${area.id}`}
                onClick={() => navigateTo(area.id as ModuleId)}
                className="group relative flex items-center justify-between p-4 rounded-xl bg-[#0B101E]/70 backdrop-blur-md border border-white/[0.08] hover:border-cyan-500/40 hover:bg-cyan-500/[0.04] hover:shadow-[0_0_20px_rgba(0,210,255,0.15)] transition-all duration-200 w-full text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  {/* Số thứ tự phân hệ */}
                  <span className="font-mono text-sm font-bold text-cyan-400/80 group-hover:text-cyan-300">
                    0{index + 1}
                  </span>
                  {/* Tiêu đề phân hệ */}
                  <span className="font-sans text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {area.title}
                  </span>
                </div>
                {/* Mũi tên điều hướng vi mô */}
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RESEARCHER IDENTITY FOOTER / METADATA BAR                                */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 flex-wrap">
            <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Đồ án môn học: <strong className="text-slate-200 font-semibold">Công nghệ Blockchain</strong></span>
            <span className="text-white/20">·</span>
            <span>Sinh viên: <strong className="text-slate-200 font-semibold">Phan Tấn Long</strong></span>
            <span className="text-white/20">·</span>
            <span>MSSV: <strong className="text-slate-200 font-semibold">2312679</strong></span>
          </div>

          <a
            href="https://github.com/phantanlongzzz/blockchain-elearning"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-cyan-300 transition-colors font-mono text-[11px] flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <Github className="w-3.5 h-3.5" />
            <span>github.com/phantanlongzzz/blockchain-elearning</span>
          </a>
        </div>
      </div>
    </section>
  );
};
