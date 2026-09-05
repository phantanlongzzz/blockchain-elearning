/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface StepCompletionFeedbackProps {
  completedTextVi: string;
  completedTextEn: string;
  nextActionTextVi?: string;
  nextActionTextEn?: string;
  onProceedNext?: () => void;
  className?: string;
  inline?: boolean;
}

export const StepCompletionFeedback: React.FC<StepCompletionFeedbackProps> = ({
  completedTextVi,
  completedTextEn,
  nextActionTextVi,
  nextActionTextEn,
  onProceedNext,
  className = '',
  inline = false,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const completedText = isVi ? completedTextVi : completedTextEn;
  const nextActionText = isVi ? nextActionTextVi : nextActionTextEn;

  if (inline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30 text-success text-xs font-sans shadow-sm animate-in fade-in duration-200 ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
        <span className="font-medium text-slate-100">{completedText}</span>
        {nextActionText && (
          <>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300 font-medium flex items-center gap-1">
              <span>{nextActionText}</span>
              <ArrowRight className="w-3 h-3 text-amber-400" />
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-success/15 via-[#11161d] to-amber-950/30 border border-success/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans animate-in fade-in slide-in-from-top-1 duration-200 ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-md bg-success/20 border border-success/40 flex items-center justify-center text-success shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-mono text-success font-semibold uppercase tracking-wide flex items-center gap-1">
            <span>{isVi ? '✓ Hành động đã hoàn tất' : '✓ Action Completed'}</span>
          </div>
          <p className="text-slate-200 font-medium truncate mt-0.5">{completedText}</p>
        </div>
      </div>

      {nextActionText && onProceedNext && (
        <button
          type="button"
          onClick={onProceedNext}
          className="self-end sm:self-center px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
        >
          <span>{nextActionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
