/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useProgressStore } from '../../stores/progressStore';
import { CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { AnimatedNumber } from '../AnimatedNumber';

export const ModuleProgressRail: React.FC = () => {
  const { language } = useLanguage();
  const {
    currentModule,
    currentLesson,
    navigateTo,
  } = useNavigation();

  const progressMap = useProgressStore((s) => s.progressMap);
  const getTotalProgress = useProgressStore((s) => s.getTotalProgress);
  const totalProgress = useMemo(() => getTotalProgress(), [progressMap, getTotalProgress]);

  const isVi = language === 'vi';

  return (
    <div className="bg-[#070B14]/65 backdrop-blur-xl border-b border-white/[0.06] font-sans sticky top-14 sm:top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* ROW 2: Breadcrumb Path & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Breadcrumb Path */}
          <div className="flex items-center overflow-hidden text-xs font-sans tracking-normal">
            <span className="font-sans text-xs font-semibold text-cyan-400 tracking-wider uppercase shrink-0">
              {isVi ? currentModule.titleVi : currentModule.titleEn}
            </span>
            <span className="text-slate-600 mx-2 select-none">&gt;</span>
            <span className="font-sans text-xs font-medium text-slate-300 truncate">
              {isVi ? currentLesson.titleVi : currentLesson.titleEn}
            </span>
          </div>

          {/* Time & Global Progress Bar */}
          <div className="flex items-center gap-3.5 shrink-0 text-xs font-sans text-slate-400 tracking-normal">
            <span className="flex items-center gap-1.5 text-xs font-sans text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {currentLesson.estimatedMinutes} {isVi ? 'phút' : 'mins'}
              </span>
            </span>

            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 bg-white/[0.08] h-1 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${totalProgress.percentage}%` }}
                />
              </div>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                <AnimatedNumber value={totalProgress.completedCount} />/{totalProgress.totalCount} (<AnimatedNumber value={totalProgress.percentage} />%)
              </span>
            </div>
          </div>
        </div>

        {/* ROW 3: Segmented Glass Slider for Module Lessons */}
        {currentModule.lessons.length > 1 && (
          <div className="mt-1.5 pt-1.5 border-t border-white/[0.04] overflow-x-auto no-scrollbar pb-0.5">
            <div className="inline-flex items-center gap-1 p-1 bg-black/40 backdrop-blur-md border border-white/[0.06] rounded-xl">
              {currentModule.lessons.map((lesson, idx) => {
                const isSelected = lesson.id === currentLesson.id;
                const lessonProg = progressMap[lesson.id];
                const isDone = lessonProg?.status === 'completed';
                const prefix = `${String(idx + 1).padStart(2, '0')}. `;

                return (
                  <button
                    key={lesson.id}
                    id={`tab-lesson-${lesson.id}`}
                    onClick={() => navigateTo(currentModule.id, lesson.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans tracking-normal transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-[0_0_12px_rgba(0,210,255,0.2)] font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent font-medium'
                    }`}
                  >
                    <span>
                      {prefix}{isVi ? lesson.shortTitleVi : lesson.shortTitleEn}
                    </span>
                    {isDone && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
