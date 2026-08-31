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
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-review-modal"
          onClick={() => setReviewAttempt(null)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30">
                v{reviewAttempt.quizVersion}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {language === 'vi'
                  ? reviewAttempt.quizTitle.vi
                  : reviewAttempt.quizTitle.en}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {strings.quiz.yourScore}:{' '}
              <span
                className={`font-mono font-bold ${
                  reviewAttempt.score >= 70
                    ? 'text-emerald-400'
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filterOnlyIncorrect
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
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
                    ? 'bg-slate-800/30 border-slate-700/60'
                    : 'bg-rose-950/10 border-rose-500/30'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
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
                      <span className="flex items-center gap-1 text-emerald-400">
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

                <p className="text-sm font-semibold text-white mb-4">
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
                      'bg-slate-900/60 border-slate-800 text-slate-400';
                    if (isCorrectAnswer) {
                      optClass =
                        'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 font-semibold';
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
                          <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 text-slate-300 font-mono text-[10px] flex-shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{language === 'vi' ? opt.vi : opt.en}</span>
                        </div>

                        <div className="flex-shrink-0 text-[10px] uppercase font-bold tracking-wider">
                          {isCorrectAnswer ? (
                            <span className="text-emerald-400 flex items-center gap-1">
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
                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{strings.quiz.explanationLabel}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed pl-5">
                    {explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setReviewAttempt(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
          >
            {strings.profile.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
