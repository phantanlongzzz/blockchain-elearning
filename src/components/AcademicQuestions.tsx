import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Hash,
  Boxes,
  Key,
  Layers,
  Network,
  Search,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const AcademicQuestions: React.FC = () => {
  const { strings } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('p1-1');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'ALL', label: strings.academicQA.categories.all },
    { id: 'P1: SHA-256', label: strings.academicQA.categories.p1 },
    { id: 'P2: Blockchain', label: strings.academicQA.categories.p2 },
    { id: 'P3: Signatures', label: strings.academicQA.categories.p3 },
    { id: 'P4: Mempool', label: strings.academicQA.categories.p4 },
    { id: 'P5: Merkle Tree', label: strings.academicQA.categories.p5 },
  ];

  const questionsList = strings.academicQA.questions || [];

  const filtered = questionsList.filter((q) => {
    const matchesCat = activeCategory === 'ALL' || q.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="academic-qa" className="py-20 relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3 font-sans">
        <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold tracking-wider uppercase">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{strings.academicQA.badge}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display uppercase">
          {strings.academicQA.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-sans">
          {strings.academicQA.subtitle}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0c1017] border border-emerald-500/30 shadow-lg mb-8 space-y-4 font-sans text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 font-sans">
          <div className="flex flex-wrap items-center gap-1.5 font-sans">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer font-sans ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 font-sans">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={strings.academicQA.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none font-sans"
            />
          </div>
        </div>
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-3 font-sans text-xs">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden shadow-sm ${
                isExpanded
                  ? 'bg-[#0c1017] border-emerald-500/40'
                  : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left focus:outline-none cursor-pointer font-sans"
              >
                <div className="flex items-center gap-3 font-sans">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 font-bold uppercase shrink-0 font-mono">
                    {item.category.split(':')[0]}
                  </span>
                  <h3 className="font-bold text-white text-xs sm:text-sm font-sans tracking-wide">
                    {item.question}
                  </h3>
                </div>

                <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 space-y-3 font-sans text-xs sm:text-sm animate-in fade-in duration-200">
                  <p className="text-slate-300 leading-relaxed font-sans">{item.answer}</p>
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 font-mono text-xs flex items-center gap-2">
                    <strong className="text-emerald-400 uppercase tracking-wider text-[10px] shrink-0 font-display">
                      {strings.academicQA.keyTakeaway}:
                    </strong>
                    <span className="font-sans">{item.keyTakeaway}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

