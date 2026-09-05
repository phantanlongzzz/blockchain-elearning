import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, X, List, Sparkles } from 'lucide-react';
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
      className="bg-[#0C0F14] border border-[#1C2430] rounded-2xl shadow-xl p-6 sm:p-8 relative"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C2430]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-success/10 text-success border border-success/30">
              v{module.version}
            </span>
            <h3 className="text-lg font-bold text-[#F2F4F7] tracking-tight">
              {language === 'vi' ? module.title.vi : module.title.en}
            </h3>
          </div>
          <p className="text-xs text-[#717B8C] mt-0.5">
            {strings.quiz.questionOf} {currentIndex + 1} / {totalQuestions} ·{' '}
            {answeredCount} {strings.quiz.answered}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#11161E] rounded-xl border border-[#1C2430] text-xs font-mono text-[#F2F4F7]">
            <Clock className="w-3.5 h-3.5 text-success" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            onClick={() => setShowNavigator(!showNavigator)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#11161E] hover:bg-[#161D26] text-[#A5AFBF] hover:text-[#F2F4F7] rounded-xl border border-[#1C2430] text-xs font-medium transition-colors cursor-pointer"
          >
            <List className="w-3.5 h-3.5 text-success" />
            <span>{strings.quiz.jumpToQuestion}</span>
          </button>

          <button
            onClick={onCancel}
            className="p-1.5 text-[#717B8C] hover:text-[#F2F4F7] rounded-lg hover:bg-[#11161E] transition-colors cursor-pointer"
            aria-label="Exit quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#11161E] h-1.5 rounded-full overflow-hidden my-4">
        <div
          className="bg-success h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Question Navigator Drawer */}
      {showNavigator && (
        <div className="p-4 mb-4 bg-[#080C10] border border-[#1C2430] rounded-xl animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#A5AFBF] uppercase tracking-wider">
              {strings.quiz.jumpToQuestion}
            </span>
            <span className="text-xs text-[#717B8C] font-mono">
              {answeredCount}/{totalQuestions} {strings.quiz.answered}
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;

              let btnClass =
                'bg-[#11161E] border-[#1C2430] text-[#717B8C] hover:text-[#F2F4F7]';
              if (isAnswered) {
                btnClass =
                  'bg-success/15 border-success/30 text-success font-bold';
              }
              if (isCurrent) {
                btnClass =
                  'bg-success border-success text-slate-950 font-bold shadow-md';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowNavigator(false);
                  }}
                  className={`p-2 rounded-lg border text-xs text-center font-mono transition-all cursor-pointer ${btnClass}`}
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
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-[#11161E] text-[#F2F4F7] border border-[#1C2430]">
              #{currentIndex + 1}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${
                currentQuestion.difficulty === 'easy'
                  ? 'bg-success/15 text-success border border-success/30'
                  : currentQuestion.difficulty === 'medium'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {currentQuestion.difficulty}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#11161E] text-[#717B8C] border border-[#1C2430] uppercase">
              {currentQuestion.topic}
            </span>
          </div>
        </div>

        <h4 className="text-base sm:text-lg font-semibold text-[#F2F4F7] leading-relaxed">
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
                className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-4 cursor-pointer active:scale-[0.99] ${
                  isSelected
                    ? 'bg-success/10 border-success text-success font-semibold'
                    : 'bg-[#11161E]/70 hover:bg-[#11161E] border-[#1C2430] text-[#A5AFBF] hover:border-[#1C2430] hover:text-[#F2F4F7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-success text-slate-950 font-bold'
                        : 'bg-[#1C2430] text-[#A5AFBF]'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="leading-snug">{optText}</span>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[#1C2430] flex-shrink-0"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-[#1C2430] flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#11161E] hover:bg-[#161D26] disabled:opacity-40 text-[#F2F4F7] text-xs font-semibold rounded-xl border border-[#1C2430] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{strings.quiz.prevQuestion}</span>
        </button>

        <div className="flex items-center gap-3">
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#11161E] hover:bg-[#161D26] text-[#F2F4F7] text-xs font-semibold rounded-xl border border-[#1C2430] transition-colors cursor-pointer"
            >
              <span>{strings.quiz.nextQuestion}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmModal(true)}
 className="flex items-center gap-2 px-5 py-2.5 bg-info hover:bg-info/90 text-white font-semibold text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
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
            className="w-full max-w-md bg-[#0C0F14] border border-[#1C2430] rounded-2xl shadow-2xl p-6 text-center space-y-4"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 border border-success/30 text-success mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-bold text-[#F2F4F7]">
              {strings.quiz.confirmSubmitTitle}
            </h4>

            <p className="text-xs text-[#A5AFBF]">
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
                className="flex-1 px-4 py-2 bg-[#11161E] hover:bg-[#161D26] text-[#A5AFBF] hover:text-[#F2F4F7] text-xs font-semibold rounded-xl border border-[#1C2430] transition-colors cursor-pointer"
              >
                {strings.quiz.cancelSubmit}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmitQuiz();
                }}
 className="flex-1 px-4 py-2 bg-info hover:bg-info/90 text-white font-semibold text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
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
