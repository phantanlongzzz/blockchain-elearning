/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useProgressStore } from '../../stores/progressStore';
import { CheckCircle2, Clock, ChevronRight } from 'lucide-react';

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
    <div className="bg-[#090A0F]/95 border-b border-[#1C2430] font-sans sticky top-16 sm:top-18 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Module Identity & Breadcrumbs */}
          <div className="flex items-center gap-2 overflow-hidden text-xs">
            <span className="font-sans font-bold px-2 py-0.5 rounded-md bg-[#00C98D]/10 text-[#00C98D] border border-[#00C98D]/30 shrink-0 text-[11px] uppercase tracking-wider">
              {isVi ? currentModule.titleVi : currentModule.titleEn}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#717B8C] shrink-0" />
            <h1 className="font-semibold text-[#F2F4F7] truncate text-xs sm:text-sm font-sans">
              {isVi ? currentLesson.titleVi : currentLesson.titleEn}
            </h1>
          </div>

          {/* Global Course Progress Indicator connected to progressStore */}
          <div className="flex items-center gap-3.5 shrink-0 font-sans text-[11px] text-[#A5AFBF]">
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#00C98D]" />
              <span>
                {currentLesson.estimatedMinutes} {isVi ? 'phút' : 'mins'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 font-mono">
              <div className="w-20 bg-[#0C0F14] border border-[#1C2430] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#00C98D] h-full rounded-full transition-all duration-300"
                  style={{ width: `${totalProgress.percentage}%` }}
                />
              </div>
              <span className="text-[#A5AFBF] text-[10px]">
                {totalProgress.completedCount}/{totalProgress.totalCount} ({totalProgress.percentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Lesson Sub-Tabs for Current Module */}
        {currentModule.lessons.length > 1 && (
          <div className="mt-2.5 pt-2 border-t border-[#1C2430] flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 font-sans">
            {currentModule.lessons.map((lesson, idx) => {
              const isSelected = lesson.id === currentLesson.id;
              const lessonProg = progressMap[lesson.id];
              const isDone = lessonProg?.status === 'completed';

              return (
                <button
                  key={lesson.id}
                  id={`tab-lesson-${lesson.id}`}
                  onClick={() => navigateTo(currentModule.id, lesson.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#11161E] text-[#00C98D] border border-[#00C98D]/40 shadow-sm font-semibold'
                      : 'bg-[#0C0F14] text-[#A5AFBF] border border-[#1C2430] hover:text-[#F2F4F7] hover:bg-[#11161E]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone
                        ? 'bg-[#00C98D]/20 text-[#00C98D] border border-[#00C98D]/40'
                        : isSelected
                        ? 'bg-[#00C98D] text-[#090A0F]'
                        : 'bg-[#11161E] text-[#A5AFBF]'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3 h-3 text-[#00C98D]" /> : idx + 1}
                  </span>
                  <span>{isVi ? lesson.shortTitleVi : lesson.shortTitleEn}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
