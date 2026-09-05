/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useProgressStore } from '../../stores/progressStore';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LessonFooter: React.FC = () => {
  const { language } = useLanguage();
  const {
    canGoPrev,
    canGoNext,
    prevLessonMeta,
    nextLessonMeta,
    prevLesson,
    nextLesson,
    currentLessonId,
    currentLessonIndex,
    totalLessons,
  } = useNavigation();

  const progressStore = useProgressStore();
  const currentProgress = progressStore.getLessonProgress(currentLessonId);
  const isLessonCompleted = currentProgress?.status === 'completed';

  const isVi = language === 'vi';

  return (
    <footer className="mt-12 pt-8 pb-12 border-t border-[#1C2430] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Previous Lesson Button */}
          {canGoPrev && prevLessonMeta ? (
            <button
              onClick={prevLesson}
              className="w-full sm:w-auto flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#0C0F14] border border-[#1C2430] hover:border-border-primary hover:bg-[#11161E] text-left transition-all group shadow-md cursor-pointer"
              id="btn-prev-lesson"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0F131A] border border-[#1C2430] flex items-center justify-center text-[#A5AFBF] group-hover:text-text-primary group-hover:border-border-primary transition-colors shrink-0">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-[#717B8C] uppercase tracking-wider">
                  {isVi ? '← Bài trước' : '← Previous Lesson'}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#F2F4F7] group-hover:text-text-primary truncate max-w-[200px] sm:max-w-[260px]">
                  {isVi ? prevLessonMeta.shortTitleVi : prevLessonMeta.shortTitleEn}
                </div>
              </div>
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          {/* Center Checkpoint Badge */}
          <div className="text-center font-mono text-xs text-[#717B8C] flex items-center gap-2">
            <span>
              {isVi ? 'Bài' : 'Lesson'} {currentLessonIndex + 1} / {totalLessons}
            </span>
            {isLessonCompleted && (
              <span className="inline-flex items-center gap-1 text-[10px] text-text-primary bg-white/[0.04] px-2 py-0.5 rounded-md border border-border-primary">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isVi ? 'Đã hoàn thành' : 'Completed'}</span>
              </span>
            )}
          </div>

          {/* Next Lesson Button with Global Next-Step Guidance Pulse */}
          {canGoNext && nextLessonMeta ? (
            <button
              onClick={nextLesson}
              className={`w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 px-5 py-3.5 rounded-xl transition-all group cursor-pointer ${
                isLessonCompleted
                  ? 'guidance-amber-pulse bg-[#0C0F14] border-[#F59E0B] text-[#F2F4F7] hover:border-[#F59E0B]'
                  : 'bg-[#0C0F14] border border-[#1C2430] hover:border-border-primary hover:bg-[#11161E] text-right'
              }`}
              id="btn-next-lesson"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-end gap-1.5">
                  {isLessonCompleted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" />
                  )}
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                      isLessonCompleted ? 'text-[#F59E0B] font-bold' : 'text-text-primary'
                    }`}
                  >
                    {isLessonCompleted
                      ? isVi
                        ? '✦ Sẵn sàng sang bài tiếp theo →'
                        : '✦ Ready for Next Lesson →'
                      : isVi
                      ? 'Bài tiếp theo →'
                      : 'Next Lesson →'}
                  </span>
                </div>
                <div
                  className={`text-xs sm:text-sm font-semibold truncate max-w-[200px] sm:max-w-[260px] ${
                    isLessonCompleted
                      ? 'text-[#F2F4F7] group-hover:text-[#F59E0B]'
                      : 'text-[#F2F4F7] group-hover:text-text-primary'
                  }`}
                >
                  {isVi ? nextLessonMeta.shortTitleVi : nextLessonMeta.shortTitleEn}
                </div>
              </div>
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                  isLessonCompleted
                    ? 'bg-[#F59E0B] text-[#090A0F] border-[#F59E0B] group-hover:bg-[#F59E0B]/90 shadow-sm'
                    : 'bg-[#0F131A] border border-[#1C2430] text-text-primary group-hover:bg-[#11161E] group-hover:border-border-primary'
                }`}
              >
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ) : (
            <div className="w-full sm:w-auto flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0C0F14] border border-border-primary text-text-primary font-mono text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isVi ? 'Đã hoàn thành toàn bộ khóa học!' : 'Curriculum Completed!'}</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

