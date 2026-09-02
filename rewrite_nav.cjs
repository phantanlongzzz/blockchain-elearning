const fs = require('fs');

const content = `import React from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface SimulationNavigationProps {
  currentIndex: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onLatest: () => void;
  isVi: boolean;
  prefix?: string;
}

export const SimulationNavigation: React.FC<SimulationNavigationProps> = ({
  currentIndex,
  totalSteps,
  onPrevious,
  onNext,
  onLatest,
  isVi,
  prefix = ''
}) => {
  const isLatest = currentIndex >= totalSteps - 1;

  const latestBtnClass = \`overflow-hidden transition-all duration-300 ease-in-out flex items-center \${!isLatest ? 'w-auto opacity-100 ml-1 border-l border-slate-800 pl-2' : 'w-0 opacity-0'}\`;

  return (
    <div className="flex items-center gap-2 bg-[#0C0F14] p-1 rounded-lg border border-slate-800 shadow-sm relative">
      <div className="flex items-center">
        <button
          onClick={onPrevious}
          disabled={currentIndex <= 0}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1A212E] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        
        <div className="px-2 min-w-[60px] text-center font-mono text-[11px] font-bold text-slate-300">
          {prefix}{currentIndex} / {Math.max(totalSteps - 1, 0)}
        </div>
        
        <button
          onClick={onNext}
          disabled={isLatest}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1A212E] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className={latestBtnClass}>
        <button
          onClick={onLatest}
          className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all font-mono text-[10px] uppercase font-bold flex items-center gap-1 whitespace-nowrap"
        >
          {isVi ? 'Đến mới nhất' : 'Latest'} <ArrowRight size={10} />
        </button>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/ProofOfWork/SimulationNavigation.tsx', content);
