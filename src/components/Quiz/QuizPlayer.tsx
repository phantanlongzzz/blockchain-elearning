import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  List,
  Sparkles,
} from 'lucide-react';
import { QuizModule, QuizAttempt, QuizAnswerRecord, QuizQuestion } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { randomizeQuizQuestions } from '../../utils/quizUtils';

interface QuizPlayerProps {
  module: QuizModule;
  onComplete: (attempt: QuizAttempt) => void;
  onCancel: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  module,
  onComplete,
  onCancel,
}) => {
  const { strings, language } = useLanguage();
  const { saveQuizAttempt } = useAuth();

  // Randomize questions exactly once per mount (per attempt)
  const [questions] = useState<QuizQuestion[]>(() => randomizeQuizQuestions(module.questions));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    {}
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSubmitQuiz = useCallback(() => {
    let correctCount = 0;
    const answerRecords: QuizAnswerRecord[] = [];
    const topicBreakdown: Record<string, { correct: number; total: number }> =
      {};

    questions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      const isCorrect = selected === q.correctOptionId;
      if (isCorrect) correctCount++;

      answerRecords.push({
        questionId: q.id,
        selectedOption: -1, // Deprecated
        selectedOptionId: selected,
        optionOrder: q.options.map(opt => opt.id),
        isCorrect,
      });

      if (!topicBreakdown[q.topic]) {
        topicBreakdown[q.topic] = { correct: 0, total: 0 };
      }
      topicBreakdown[q.topic].total++;
      if (isCorrect) {
        topicBreakdown[q.topic].correct++;
      }
    });

    const finalScore = Math.round((correctCount / totalQuestions) * 100);

    const newAttempt = saveQuizAttempt({
      quizId: module.quizId,
      quizTitle: module.title,
      quizVersion: module.version,
      score: finalScore,
      correctAnswers: correctCount,
      totalQuestions,
      durationSeconds: elapsedSeconds,
      answers: answerRecords,
      topicBreakdown,
      questionOrder: questions.map(q => q.id),
    });

    onComplete(newAttempt);
  }, [
    questions,
    selectedAnswers,
    totalQuestions,
    saveQuizAttempt,
    module,
    elapsedSeconds,
    onComplete,
  ]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        const optIndex = parseInt(e.key, 10) - 1;
        if (currentQuestion.options[optIndex]) {
          handleSelectOption(currentQuestion.options[optIndex].id);
        }
      } else if (e.key === 'ArrowRight' && currentIndex < totalQuestions - 1) {
        setCurrentIndex((i) => i + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions, handleSelectOption, currentQuestion]);

  const qText =
    language === 'vi'
      ? currentQuestion.question.vi
      : currentQuestion.question.en;
  const currentSelected = selectedAnswers[currentQuestion.id];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div
      id="quiz-player-container"
      className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 relative"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              v{module.version}
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {language === 'vi' ? module.title.vi : module.title.en}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {strings.quiz.questionOf} {currentIndex + 1} / {totalQuestions} ·{' '}
            {answeredCount} {strings.quiz.answered}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            onClick={() => setShowNavigator(!showNavigator)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-medium transition-colors"
          >
            <List className="w-3.5 h-3.5 text-sky-400" />
            <span>{strings.quiz.jumpToQuestion}</span>
          </button>

          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Exit quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-4">
        <div
          className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Question Navigator Drawer */}
      {showNavigator && (
        <div className="p-4 mb-4 bg-slate-950/80 border border-slate-800 rounded-xl animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {strings.quiz.jumpToQuestion}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {answeredCount}/{totalQuestions} {strings.quiz.answered}
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;

              let btnClass =
                'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white';
              if (isAnswered) {
                btnClass =
                  'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold';
              }
              if (isCurrent) {
                btnClass =
                  'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowNavigator(false);
                  }}
                  className={`p-2 rounded-lg border text-xs text-center font-mono transition-all ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="my-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
              #{currentIndex + 1}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${
                currentQuestion.difficulty === 'easy'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : currentQuestion.difficulty === 'medium'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {currentQuestion.difficulty}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
              {currentQuestion.topic}
            </span>
          </div>
        </div>

        <h4 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
          {qText}
        </h4>

        {/* Options */}
        <div className="space-y-2.5 pt-2">
          {currentQuestion.options.map((opt, optIdx) => {
            const isSelected = currentSelected === opt.id;
            const optText = language === 'vi' ? opt.vi : opt.en;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-4 active:scale-[0.99] ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold shadow-md'
                    : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="leading-snug">{optText}</span>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{strings.quiz.prevQuestion}</span>
        </button>

        <div className="flex items-center gap-3">
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="flex items-center gap-1.5 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <span>{strings.quiz.nextQuestion}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{strings.quiz.finishQuiz}</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog before Final Submit */}
      {showConfirmModal && (
        <div
          id="confirm-submit-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
        >
          <div
            id="confirm-submit-modal-container"
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-center space-y-4"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-bold text-white">
              {strings.quiz.confirmSubmitTitle}
            </h4>

            <p className="text-xs text-slate-300">
              {strings.quiz.confirmSubmitDesc}
            </p>

            {answeredCount < totalQuestions && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs text-left">
                ⚠️ {strings.quiz.unansweredWarning} ({totalQuestions - answeredCount}{' '}
                {strings.quiz.unanswered})
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                {strings.quiz.cancelSubmit}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmitQuiz();
                }}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md"
              >
                {strings.quiz.submitNow}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
