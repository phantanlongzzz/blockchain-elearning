/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lightbulb, Info } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface MicroExplanationProps {
  term: string;
  explanationVi: string;
  explanationEn: string;
  className?: string;
}

export const MicroExplanation: React.FC<MicroExplanationProps> = ({
  term,
  explanationVi,
  explanationEn,
  className = '',
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className={`relative inline-flex items-center gap-1 font-mono ${className}`}>
      <span className="font-bold text-emerald-300 border-b border-dashed border-emerald-400/60 cursor-help">
        {term}
      </span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center text-emerald-400 hover:text-emerald-200 transition-all cursor-pointer p-0.5"
        title={isVi ? explanationVi : explanationEn}
      >
        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
      </button>

      {isOpen && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#0D1322] border border-emerald-500/60 rounded-xl text-xs font-sans text-[#E5E7EB] shadow-2xl z-50 pointer-events-none block animate-in fade-in zoom-in-95 duration-150">
          <span className="font-bold font-mono text-emerald-300 block mb-1 border-b border-[#1E293B] pb-1">
            💡 {term}
          </span>
          <span className="text-[11px] leading-relaxed text-[#94A3B8] block font-sans">
            {isVi ? explanationVi : explanationEn}
          </span>
        </span>
      )}
    </span>
  );
};
