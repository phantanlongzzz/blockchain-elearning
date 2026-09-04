import React from 'react';
import {
  X,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ChevronRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const QuizHistoryModal: React.FC = () => {
  const {
    quizHistoryModalOpen,
    setQuizHistoryModalOpen,
    getQuizAttempts,
    setReviewAttempt,
    user,
  } = useAuth();
  const { strings, language } = useLanguage();

  if (!quizHistoryModalOpen) return null;

  const attempts = getQuizAttempts();

  const handleReview = (attempt: any) => {
    setReviewAttempt(attempt);
    setQuizHistoryModalOpen(false);
  };

  return (
    <div
      id="quiz-history-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090A0F]/85 backdrop-blur-sm animate-fade-in font-sans"
      onClick={() => setQuizHistoryModalOpen(false)}
    >
      <div
        id="quiz-history-modal-container"
        className="relative w-full max-w-2xl bg-[#0C0F14] border border-[#1C2430] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-history-modal"
          onClick={() => setQuizHistoryModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#717B8C] hover:text-[#F2F4F7] rounded-lg hover:bg-[#11161E] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-4 border-b border-[#1C2430] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teach-1/10 border border-teach-1/30 text-teach-1">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F2F4F7] tracking-tight">
              {strings.quizHistory.title}
            </h3>
            <p className="text-xs text-[#717B8C]">
              {strings.quizHistory.subtitle}
            </p>
          </div>
        </div>

        {/* Attempts List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {attempts.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-[#1C2430] rounded-xl bg-[#090A0F]/40">
              <History className="w-10 h-10 text-[#4D5665] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#A5AFBF]">
                {strings.quizHistory.emptyHistory}
              </p>
              <button
                onClick={() => {
                  setQuizHistoryModalOpen(false);
                  const el = document.getElementById('quiz-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
 className="mt-4 px-4 py-2 bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                {strings.quizHistory.emptyAction}
              </button>
            </div>
          ) : (
            attempts.map((att) => {
              const isPassed = att.score >= 70;
              const dateStr = new Date(att.completedAt).toLocaleString(
                language === 'vi' ? 'vi-VN' : 'en-US',
                {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              );

              return (
                <div
                  key={att.id}
                  className="p-4 bg-[#11161E]/70 hover:bg-[#11161E] border border-[#1C2430] hover:border-[#24313D] rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#090A0F] text-[#A5AFBF] border border-[#1C2430] font-mono">
                        v{att.quizVersion}
                      </span>
                      <h4 className="text-sm font-bold text-[#F2F4F7]">
                        {language === 'vi'
                          ? att.quizTitle.vi
                          : att.quizTitle.en}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#717B8C] font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#4D5665]" />
                        {dateStr}
                      </span>
                      {att.durationSeconds ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#4D5665]" />
                          {Math.floor(att.durationSeconds / 60)}m{' '}
                          {att.durationSeconds % 60}s
                        </span>
                      ) : null}
                      <span>
                        {att.correctAnswers}/{att.totalQuestions}{' '}
                        {strings.quiz.correctCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold font-mono ${
                          isPassed ? 'text-success' : 'text-rose-400'
                        }`}
                      >
                        {att.score}%
                      </span>
                      <span
                        className={`block text-[10px] uppercase font-bold tracking-wider ${
                          isPassed ? 'text-success' : 'text-rose-400'
                        }`}
                      >
                        {isPassed
                          ? strings.quiz.passedBadge
                          : strings.quiz.failedBadge}
                      </span>
                    </div>

                    <button
                      onClick={() => handleReview(att)}
                      className="flex items-center gap-1 px-3 py-2 bg-[#151C26] hover:bg-[#1C2430] text-[#F2F4F7] border border-[#1C2430] hover:border-teach-1/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>{strings.quizHistory.reviewAttempt}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-teach-1" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#1C2430] flex justify-end">
          <button
            onClick={() => setQuizHistoryModalOpen(false)}
            className="px-4 py-2 bg-[#11161E] hover:bg-[#151C26] text-[#A5AFBF] hover:text-[#F2F4F7] text-xs font-medium rounded-xl border border-[#1C2430] transition-colors cursor-pointer"
          >
            {strings.profile.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
