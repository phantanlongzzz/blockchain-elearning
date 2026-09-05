import React, { useState } from 'react';
import { ListTree, Layers, Cpu, Boxes, Lock, GitCommit, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const EvolutionRoadmap: React.FC = () => {
  const { strings, language } = useLanguage();
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 'step-1',
      title: strings.foundations.evolution.step1Title,
      desc: strings.foundations.evolution.step1Desc,
      icon: ListTree,
      color: 'bg-white/[0.04] border-border-primary text-text-primary',
      badge: 'RAM Array',
      code: 'my_list = [10, "Alice", True]',
    },
    {
      id: 'step-2',
      title: strings.foundations.evolution.step2Title,
      desc: strings.foundations.evolution.step2Desc,
      icon: Layers,
      color: 'bg-white/[0.04] border-border-primary text-text-primary',
      badge: 'Pointer Chain',
      code: 'head -> Node_A -> Node_B -> None',
    },
    {
      id: 'step-3',
      title: strings.foundations.evolution.step3Title,
      desc: strings.foundations.evolution.step3Desc,
      icon: GitCommit,
      color: 'bg-white/[0.04] border-border-primary text-text-primary',
      badge: 'Node Class',
      code: 'class Node: data, next',
    },
    {
      id: 'step-4',
      title: strings.foundations.evolution.step4Title,
      desc: strings.foundations.evolution.step4Desc,
      icon: Cpu,
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      badge: 'SHA-256 Digest',
      code: 'hash_ptr = SHA256(prev_data)',
    },
    {
      id: 'step-5',
      title: strings.foundations.evolution.step5Title,
      desc: strings.foundations.evolution.step5Desc,
      icon: Boxes,
      color: 'bg-white/[0.04] border-border-primary text-text-primary',
      badge: 'Block Header',
      code: 'Block: { index, prev_hash, data, hash }',
    },
    {
      id: 'step-6',
      title: strings.foundations.evolution.step6Title,
      desc: strings.foundations.evolution.step6Desc,
      icon: Lock,
      color: 'bg-white/[0.04] border-border-primary text-text-primary',
      badge: 'Consensus & Ledger',
      code: 'Blockchain = Hash Pointers + PoW/PoS + Merkle',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0B0E12] border border-border-primary">
        <div className="flex items-center gap-2 text-text-secondary text-xs font-mono font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>{strings.foundations.tabs.evolution}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white">
          {strings.foundations.evolution.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          {strings.foundations.evolution.subtitle}
        </p>
      </div>

      {/* 6-Step Stepper Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = activeStep === idx;

          return (
            <div
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? `bg-gradient-to-b ${step.color} shadow-lg scale-[1.02]`
                  : 'bg-[#090d16] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-border-primary flex items-center justify-center text-text-muted">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                    {step.badge}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white font-mono">
                  {step.title}
                </h4>

                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 font-mono text-[11px] text-text-secondary truncate">
                <code>{step.code}</code>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Inspection of Selected Step */}
      <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-text-secondary font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>
            {language === 'vi'
              ? 'Chi Tiết Giai Đoạn Đang Chọn:'
              : 'Selected Evolution Phase:'}
          </span>
          <span className="text-white">{steps[activeStep].title}</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {steps[activeStep].desc}
        </p>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-text-secondary flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">Core Architecture:</span>
          <code>{steps[activeStep].code}</code>
        </div>
      </div>
    </div>
  );
};
