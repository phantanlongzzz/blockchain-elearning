import React, { useState, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Filter,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { ALL_QUIZ_QUESTIONS } from '../../data/quizData';
import { QuizQuestion } from '../../types';
import { getReviewQuestions } from '../../utils/quizUtils';

export const QuizReviewModal: React.FC = () => {
  const { reviewAttempt, setReviewAttempt } = useAuth();
  const { strings, language } = useLanguage();
  const [filterOnlyIncorrect, setFilterOnlyIncorrect] = useState(false);

  // We memoize the reconstructed questions to avoid re-running on every render
  const reconstructedQuestions = useMemo(() => {
    if (!reviewAttempt) return [];
    return getReviewQuestions(reviewAttempt, ALL_QUIZ_QUESTIONS);
  }, [reviewAttempt]);

  if (!reviewAttempt) return null;

  const questionsWithAnswers = reviewAttempt.answers
    .map((ans) => {
      const q = reconstructedQuestions.find(q => q.id === ans.questionId);
      return {
        question: q,
        answer: ans,
      };
    })
    .filter((item) => item.question !== undefined);

  const displayedItems = filterOnlyIncorrect
    ? questionsWithAnswers.filter((item) => !item.answer.isCorrect)
    : questionsWithAnswers;

  return (
    <div
      id="quiz-review-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in"
      onClick={() => setReviewAttempt(null)}
    >
      <div
        id="quiz-review-modal-container"
        className="relative w-full max-w-3xl bg-[#0C0F14] border border-[#1C2430] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-review-modal"
          onClick={() => setReviewAttempt(null)}
          className="absolute top-4 right-4 p-2 text-[#717B8C] hover:text-[#F2F4F7] rounded-lg hover:bg-[#11161E] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-4 border-b border-[#1C2430] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#11161E] text-[#00C98D] border border-[#00C98D]/30">
                v{reviewAttempt.quizVersion}
              </span>
              <h3 className="text-lg font-bold text-[#F2F4F7] tracking-tight">
                {language === 'vi'
                  ? reviewAttempt.quizTitle.vi
                  : reviewAttempt.quizTitle.en}
              </h3>
            </div>
            <p className="text-xs text-[#717B8C] mt-0.5">
              {strings.quiz.yourScore}:{' '}
              <span
                className={`font-mono font-bold ${
                  reviewAttempt.score >= 70
                    ? 'text-[#00C98D]'
                    : 'text-rose-400'
                }`}
              >
                {reviewAttempt.score}%
              </span>{' '}
              ({reviewAttempt.correctAnswers}/{reviewAttempt.totalQuestions}{' '}
              {strings.quiz.correctCount})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterOnlyIncorrect(!filterOnlyIncorrect)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                filterOnlyIncorrect
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-[#11161E] text-[#A5AFBF] border-[#1C2430] hover:text-[#F2F4F7]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                {language === 'vi' ? 'Chỉ câu sai' : 'Incorrect only'}
              </span>
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {displayedItems.map((item, idx) => {
            const q = item.question!;
            const ans = item.answer;
            const isCorrect = ans.isCorrect;
            const qText = language === 'vi' ? q.question.vi : q.question.en;
            const options = language === 'vi' ? q.options.vi : q.options.en;
            const explanation =
              language === 'vi' ? q.explanation.vi : q.explanation.en;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-colors ${
                  isCorrect
                    ? 'bg-[#11161E]/50 border-[#1C2430]'
                    : 'bg-rose-950/10 border-rose-500/30'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[#11161E] text-[#F2F4F7] border border-[#1C2430]">
                      #{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${
                        q.difficulty === 'easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : q.difficulty === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-[#00C98D]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{strings.quiz.passedBadge}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400">
                        <XCircle className="w-4 h-4" />
                        <span>{strings.quiz.failedBadge}</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-[#F2F4F7] mb-4">
                  {qText}
                </p>

                {/* Options List */}
                <div className="space-y-2 mb-4">
                  {options.map((opt, optIdx) => {
                    const isUserSelected =
                      ans.selectedOptionId === opt.id ||
                      ans.selectedOption === optIdx; // fallback for old records
                    const isCorrectAnswer = q.correctOptionId === opt.id;

                    let optClass =
                      'bg-[#080C10] border-[#1C2430] text-[#717B8C]';
                    if (isCorrectAnswer) {
                      optClass =
                        'bg-[#00C98D]/10 border-[#00C98D]/50 text-[#00C98D] font-semibold';
                    } else if (isUserSelected && !isCorrect) {
                      optClass =
                        'bg-rose-950/30 border-rose-500/50 text-rose-300 line-through';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${optClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded flex items-center justify-center bg-[#11161E] text-[#A5AFBF] font-mono text-[10px] flex-shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{language === 'vi' ? opt.vi : opt.en}</span>
                        </div>

                        <div className="flex-shrink-0 text-[10px] uppercase font-bold tracking-wider">
                          {isCorrectAnswer ? (
                            <span className="text-[#00C98D] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{strings.quiz.correctAnswerLabel}</span>
                            </span>
                          ) : isUserSelected ? (
                            <span className="text-rose-400 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{strings.quiz.yourAnswer}</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                <div className="p-3.5 bg-[#080C10] border border-[#1C2430] rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#00C98D] font-semibold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{strings.quiz.explanationLabel}</span>
                  </div>
                  <p className="text-[#A5AFBF] leading-relaxed pl-5">
                    {explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#1C2430] flex justify-end">
          <button
            onClick={() => setReviewAttempt(null)}
            className="px-4 py-2 bg-[#11161E] hover:bg-[#161D26] text-[#F2F4F7] text-xs font-medium rounded-xl border border-[#1C2430] transition-colors cursor-pointer"
          >
            {strings.profile.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
