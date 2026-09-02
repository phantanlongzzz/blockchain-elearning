/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Compass,
  Sliders,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface GuideStep {
  stepNumber: number;
  titleVi: string;
  titleEn: string;
  instructionVi: string;
  instructionEn: string;
  targetActionVi: string;
  targetActionEn: string;
  isCompleted: boolean;
}

export interface SimulationQuestions {
  whatAmILookingAtVi: string;
  whatAmILookingAtEn: string;
  whatShouldIClickVi: string;
  whatShouldIClickEn: string;
  whatJustHappenedVi: string;
  whatJustHappenedEn: string;
  whyDidItHappenVi: string;
  whyDidItHappenEn: string;
}

export interface MicroConcept {
  term: string;
  explanationVi: string;
  explanationEn: string;
}

interface SimulationGuidePanelProps {
  mode: 'guided' | 'free';
  onModeChange: (mode: 'guided' | 'free') => void;
  currentStepIndex: number;
  steps: GuideStep[];
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onResetGuide?: () => void;
  questions: SimulationQuestions;
  microConcepts?: MicroConcept[];
  badgeTextVi?: string;
  badgeTextEn?: string;
}

export const SimulationGuidePanel: React.FC<SimulationGuidePanelProps> = ({
  mode,
  onModeChange,
  currentStepIndex,
  steps,
  onNextStep,
  onPrevStep,
  onResetGuide,
  questions,
  microConcepts = [],
  badgeTextVi,
  badgeTextEn,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState<boolean>(false);

  const currentStep = steps[currentStepIndex] || steps[0];
  const allCompleted = steps.every((s) => s.isCompleted);

  const questionList = [
    {
      id: 1,
      qVi: '1. Bạn đang nhìn thấy gì?',
      qEn: '1. What are you seeing?',
      aVi: questions.whatAmILookingAtVi,
      aEn: questions.whatAmILookingAtEn,
      color: 'border-emerald-500/30 bg-slate-900/90 text-emerald-400',
    },
    {
      id: 2,
      qVi: '2. Cần làm gì tiếp theo?',
      qEn: '2. What to do next?',
      aVi: questions.whatShouldIClickVi,
      aEn: questions.whatShouldIClickEn,
      color: 'border-emerald-500/30 bg-slate-900/90 text-emerald-400',
    },
    {
      id: 3,
      qVi: '3. Kết quả vừa nhận được?',
      qEn: '3. What just happened?',
      aVi: questions.whatJustHappenedVi,
      aEn: questions.whatJustHappenedEn,
      color: 'border-amber-500/30 bg-slate-900/90 text-amber-400',
    },
    {
      id: 4,
      qVi: '4. Vì sao lại như vậy?',
      qEn: '4. Why did it happen?',
      aVi: questions.whyDidItHappenVi,
      aEn: questions.whyDidItHappenEn,
      color: 'border-emerald-500/30 bg-slate-900/90 text-emerald-400',
    },
  ];

  return (
    <div className="space-y-4 mb-6 font-sans">
      {/* 1. Mode Switcher & Top Bar */}
      <div className="bg-[#0c101c] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            {mode === 'guided' ? <Compass className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-400">
                {badgeTextVi && isVi ? badgeTextVi : badgeTextEn || (isVi ? 'PHƯƠNG PHÁP HỌC TRỰC QUAN' : 'VISUAL LEARNING')}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 font-sans">
              {mode === 'guided'
                ? isVi
                  ? 'Chế độ Hướng dẫn Từng bước'
                  : 'Step-by-Step Guided Mode'
                : isVi
                ? 'Chế độ Thử nghiệm Tự do'
                : 'Free Sandbox Experiment Mode'}
            </h3>
          </div>
        </div>

        {/* Segmented Mode Toggle Buttons */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800 font-mono text-xs">
          <button
            type="button"
            onClick={() => onModeChange('guided')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'guided'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isVi ? 'HƯỚNG DẪN' : 'GUIDED'}</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('free')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'free'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isVi ? 'TỰ DO' : 'SANDBOX'}</span>
          </button>
        </div>
      </div>

      {/* 2. Active Guidance Banner (When in Guided Mode) */}
      {mode === 'guided' && currentStep && (
        <div
          className={`p-4 sm:p-5 rounded-xl border transition-all shadow-sm animate-in fade-in duration-200 ${
            currentStep.isCompleted
              ? 'bg-emerald-950/20 border-emerald-500/50 text-slate-100'
              : 'bg-[#0d1322] border-emerald-500/40 text-slate-100'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 rounded-md text-xs font-mono font-bold uppercase">
                  {isVi
                    ? `BƯỚC ${currentStepIndex + 1}/${steps.length}`
                    : `STEP ${currentStepIndex + 1}/${steps.length}`}
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-100 font-sans">
                  {isVi ? currentStep.titleVi : currentStep.titleEn}
                </span>
                {currentStep.isCompleted && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded-md text-[11px] font-mono font-bold">
                    <Check className="w-3 h-3" />
                    <span>{isVi ? 'XONG' : 'DONE'}</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {isVi ? currentStep.instructionVi : currentStep.instructionEn}
              </p>

              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 pt-0.5">
                <span className="text-amber-300 font-bold">👉 {isVi ? 'THAO TÁC:' : 'ACTION:'}</span>
                <span className="text-slate-200 font-semibold">
                  {isVi ? currentStep.targetActionVi : currentStep.targetActionEn}
                </span>
              </div>
            </div>

            {/* Step Navigation Controls */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end pt-2 lg:pt-0 shrink-0">
              {currentStepIndex > 0 && onPrevStep && (
                <button
                  type="button"
                  onClick={onPrevStep}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono cursor-pointer transition-all"
                >
                  {isVi ? '← Lùi lại' : '← Back'}
                </button>
              )}

              {currentStepIndex < steps.length - 1 && onNextStep && (
                <button
                  type="button"
                  onClick={onNextStep}
                  disabled={!currentStep.isCompleted}
                  className={`px-4 py-2 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    currentStep.isCompleted
                      ? 'guidance-amber-pulse bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.28)]'
                      : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {currentStep.isCompleted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                  )}
                  <span>{isVi ? 'Bước Tiếp Theo →' : 'Next Step →'}</span>
                </button>
              )}

              {allCompleted && onResetGuide && (
                <button
                  type="button"
                  onClick={onResetGuide}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-mono font-bold cursor-pointer transition-all"
                >
                  {isVi ? 'Lặp Lại Hướng Dẫn' : 'Restart Guide'}
                </button>
              )}
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'bg-emerald-400'
                    : step.isCompleted
                    ? 'bg-emerald-400'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. 4-Question Framework & Micro Concepts (Collapsible "Tìm hiểu thêm" - Level 3) */}
      <div className="bg-[#0c101c] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIsQuestionsExpanded(!isQuestionsExpanded)}
          className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-slate-900/50 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                {isVi ? 'HỎI ĐÁP NHANH & THUẬT NGỮ' : 'QUICK Q&A & CORE CONCEPTS'}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-200">
                {isVi
                  ? 'Giải thích 4 bước tư duy · Khái niệm cốt lõi'
                  : '4-step thinking framework · Key concepts'}
              </div>
            </div>
          </div>

          <div className="text-slate-400 flex items-center gap-2 text-xs font-mono shrink-0">
            <span>{isQuestionsExpanded ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Mở rộng' : 'Expand')}</span>
            {isQuestionsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isQuestionsExpanded && (
          <div className="p-4 sm:p-5 border-t border-slate-800 space-y-4 bg-slate-950/40 animate-in fade-in duration-150">
            {/* 4 Questions Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {questionList.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg border ${item.color} space-y-1.5 transition-all`}
                >
                  <div className="font-mono font-bold uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isVi ? item.qVi : item.qEn}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {isVi ? item.aVi : item.aEn}
                  </p>
                </div>
              ))}
            </div>

            {/* Micro Concepts */}
            {microConcepts.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-[11px] uppercase font-mono font-bold block mb-2">
                  {isVi ? 'THUẬT NGỮ CỐT LÕI:' : 'CORE CONCEPTS:'}
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  {microConcepts.map((concept, idx) => (
                    <div key={idx} className="group relative inline-block">
                      <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-emerald-300 rounded-md cursor-help hover:border-emerald-400 hover:text-emerald-200 transition-all font-semibold">
                        💡 {concept.term}
                      </span>
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#0d1322] border border-emerald-500/50 rounded-lg text-xs font-sans text-slate-200 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                        <div className="font-bold font-mono text-emerald-300 mb-1 border-b border-slate-800 pb-1">
                          {concept.term}
                        </div>
                        <div className="text-[11px] leading-relaxed text-slate-300">
                          {isVi ? concept.explanationVi : concept.explanationEn}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
