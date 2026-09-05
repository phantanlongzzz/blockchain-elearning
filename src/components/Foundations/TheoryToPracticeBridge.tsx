import React from 'react';
import {
  ArrowRight,
  Binary,
  KeyRound,
  Sparkles,
  Boxes,
  Cpu,
  Coins,
  FileCheck2,
  ExternalLink,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EVOLUTION_STAGES } from '../../data/foundationsData';

export const TheoryToPracticeBridge: React.FC = () => {
  const { strings, language } = useLanguage();

  const LAB_CARDS = [
    {
      id: 'lab-sha256',
      href: '#hash-generator',
      title: strings.foundations.theoryToPractice.labSha256Title,
      description: strings.foundations.theoryToPractice.labSha256Desc,
      icon: <Binary className="w-5 h-5 text-text-muted" />,
      badge: 'NIST FIPS 180-4',
      badgeColor: 'bg-white/[0.04] text-text-primary border-border-primary',
      difficulty: language === 'vi' ? 'Cơ bản · 64 vòng lặp' : 'Foundational · 64 Rounds',
    },
    {
      id: 'lab-tx',
      href: '#transactions',
      title: strings.foundations.theoryToPractice.labTxTitle,
      description: strings.foundations.theoryToPractice.labTxDesc,
      icon: <KeyRound className="w-5 h-5 text-text-muted" />,
      badge: 'SECP256k1 ECDSA',
      badgeColor: 'bg-white/[0.04] text-text-primary border-border-primary',
      difficulty: language === 'vi' ? 'Nâng cao · Ký số số hóa' : 'Advanced · Digital Signatures',
    },
    {
      id: 'lab-merkle',
      href: '#merkle-tree',
      title: strings.foundations.theoryToPractice.labMerkleTitle,
      description: strings.foundations.theoryToPractice.labMerkleDesc,
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      badge: 'O(log N) SPV Proof',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      difficulty: language === 'vi' ? 'Trung cấp · Cây băm nhị phân' : 'Intermediate · Binary Trees',
    },
    {
      id: 'lab-blockchain',
      href: '#blockchain',
      title: strings.foundations.theoryToPractice.labBlockchainTitle,
      description: strings.foundations.theoryToPractice.labBlockchainDesc,
      icon: <Boxes className="w-5 h-5 text-text-muted" />,
      badge: 'Immutable Ledger',
      badgeColor: 'bg-white/[0.04] text-text-primary border-border-primary',
      difficulty: language === 'vi' ? 'Toàn cảnh · Chuỗi khối' : 'Comprehensive · Distributed Ledger',
    },
    {
      id: 'lab-pow',
      href: '#proof-of-work',
      title: strings.foundations.theoryToPractice.labPowTitle,
      description: strings.foundations.theoryToPractice.labPowDesc,
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
      badge: 'Nakamoto Consensus',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      difficulty: language === 'vi' ? 'Nghiên cứu · Đào khối' : 'Deep Dive · Mining Simulator',
    },
    {
      id: 'lab-pos',
      href: '#proof-of-stake',
      title: strings.foundations.theoryToPractice.labPosTitle,
      description: strings.foundations.theoryToPractice.labPosDesc,
      icon: <Coins className="w-5 h-5 text-text-muted" />,
      badge: 'Casper & Slashing',
      badgeColor: 'bg-white/[0.04] text-text-primary border-border-primary',
      difficulty: language === 'vi' ? 'Hiện đại · Đặt cọc xác thực' : 'Modern · Validator Staking',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0B0E12] border border-border-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-text-secondary text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>{strings.foundations.theoryToPractice.badge}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {strings.foundations.theoryToPractice.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            {strings.foundations.theoryToPractice.subtitle}
          </p>
        </div>

        <a
          href="#quiz-section"
 className="px-4 py-2 rounded-xl bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-bold font-mono text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-lg self-start md:self-auto"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>{language === 'vi' ? 'Làm Bài Đánh Giá Buổi 1' : 'Take Lesson 1 Quiz'}</span>
        </a>
      </div>

      {/* Evolutionary Progression Step Cards */}
      <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800 space-y-6">
        <div>
          <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-text-muted" />
            <span>{strings.foundations.theoryToPractice.roadmapTitle}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            {strings.foundations.theoryToPractice.roadmapSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EVOLUTION_STAGES.map((step, idx) => (
            <div
              key={step.step}
              className="p-4 rounded-xl bg-[#05070c] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-bold mb-2">
                  <span className="text-text-muted">STEP 0{step.step}</span>
                  <span className="text-[10px] text-slate-600 font-normal">
                    {step.tag}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-slate-200 group-hover:text-text-primary transition-colors">
                  {step.title[language]}
                </h5>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {step.desc[language]}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>Phase 0{step.step}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Labs Grid */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-text-muted" />
            <span>{strings.foundations.theoryToPractice.labsTitle}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            {strings.foundations.theoryToPractice.labsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LAB_CARDS.map((lab) => (
            <a
              key={lab.id}
              href={lab.href}
              className="p-5 rounded-2xl bg-[#090d16] border border-slate-800 hover:border-border-primary hover:bg-white/[0.02] transition-all flex flex-col justify-between group shadow-lg cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 group-hover:border-border-primary transition-colors">
                    {lab.icon}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${lab.badgeColor}`}
                  >
                    {lab.badge}
                  </span>
                </div>

                <div>
                  <h5 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-text-primary transition-colors">
                    {lab.title}
                  </h5>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {lab.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 text-[11px]">{lab.difficulty}</span>
                <span className="text-text-primary font-bold flex items-center gap-1 group-hover:underline">
                  <span>{strings.foundations.theoryToPractice.openLab}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
