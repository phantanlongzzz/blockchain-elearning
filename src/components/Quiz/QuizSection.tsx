import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Award,
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { QUIZ_MODULES } from '../../data/quizData';
import { QuizModule, QuizAttempt } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { QuizPlayer } from './QuizPlayer';
import { QuizResult } from './QuizResult';

export const QuizSection: React.FC = () => {
  const { strings, language } = useLanguage();
  const {
    user,
    isAuthenticated,
    setAuthModalOpen,
    setQuizHistoryModalOpen,
    setCertificatesModalOpen,
    setReviewAttempt,
    getQuizAttempts,
  } = useAuth();

  const [selectedModule, setSelectedModule] = useState<QuizModule | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);

  const pastAttempts = getQuizAttempts();

  const handleStartQuiz = (mod: QuizModule) => {
    setSelectedModule(mod);
    setActiveAttempt(null);
    setIsTakingQuiz(true);
  };

  const handleCompleteQuiz = (attempt: QuizAttempt) => {
    setActiveAttempt(attempt);
    setIsTakingQuiz(false);
  };

  const handleCancelQuiz = () => {
    setIsTakingQuiz(false);
    setSelectedModule(null);
    setActiveAttempt(null);
  };

  const handleRetake = () => {
    if (selectedModule) {
      setActiveAttempt(null);
      setIsTakingQuiz(true);
    }
  };

  const handleReturnToSelection = () => {
    setIsTakingQuiz(false);
    setSelectedModule(null);
    setActiveAttempt(null);
  };

  const handleOpenReview = () => {
    if (activeAttempt) {
      setReviewAttempt(activeAttempt);
    }
  };

  return (
    <section
      id="quiz-section"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{strings.quiz.badge}</span>
          <span className="w-1 h-1 rounded-full bg-amber-400"></span>
          <span className="font-mono">v1.0</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {strings.quiz.title}
        </h2>

        <p className="text-base text-slate-400 mt-3 leading-relaxed">
          {strings.quiz.subtitle}
        </p>

        {/* User quick status & actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                {strings.auth.welcomeBack}{' '}
                <strong className="text-white">{user?.name}</strong> (
                {user?.class})
              </span>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs text-amber-300 font-semibold transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{strings.auth.signIn}</span>
            </button>
          )}

          <button
            onClick={() => setQuizHistoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span>
              {strings.quizHistory.title} ({pastAttempts.length})
            </span>
          </button>

          <button
            onClick={() => setCertificatesModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{strings.certificates.title}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      {isTakingQuiz && selectedModule ? (
        <QuizPlayer
          module={selectedModule}
          onComplete={handleCompleteQuiz}
          onCancel={handleCancelQuiz}
        />
      ) : activeAttempt && selectedModule ? (
        <QuizResult
          attempt={activeAttempt}
          module={selectedModule}
          onRetake={handleRetake}
          onReturnToSelection={handleReturnToSelection}
          onReview={handleOpenReview}
        />
      ) : (
        /* Quiz Selection Grid */
        <div className="space-y-6">
          {/* Primary Featured: Comprehensive Certification Assessment v1.0 */}
          {QUIZ_MODULES.slice(0, 1).map((mod) => (
            <div
              key={mod.quizId}
              id={`quiz-card-${mod.quizId}`}
              className="relative p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/40 hover:border-amber-500/80 rounded-2xl shadow-2xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 overflow-hidden group"
            >
              <div className="space-y-3 flex-1 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    ★ {language === 'vi' ? 'Đề Đánh Giá Tổng Hợp' : 'Comprehensive Certification'}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    v{mod.version}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {mod.questions.length} {strings.quiz.questionCount}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                  {language === 'vi' ? mod.title.vi : mod.title.en}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {language === 'vi' ? mod.description.vi : mod.description.en}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{strings.quiz.timeEstimate}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {strings.quiz.passingScoreReq}: ≥ {mod.passingScore}%
                    </span>
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex-shrink-0">
                <button
                  id={`btn-start-${mod.quizId}`}
                  onClick={() => handleStartQuiz(mod)}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
                >
                  <span>{strings.quiz.startQuiz}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Specialized Topic Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {QUIZ_MODULES.slice(1).map((mod) => (
              <div
                key={mod.quizId}
                id={`quiz-card-${mod.quizId}`}
                className="p-5 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      v{mod.version}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {mod.questions.length} {strings.quiz.questionCount}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {language === 'vi' ? mod.title.vi : mod.title.en}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'vi'
                      ? mod.description.vi
                      : mod.description.en}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {strings.quiz.passingScoreReq}: ≥ {mod.passingScore}%
                  </span>

                  <button
                    id={`btn-start-${mod.quizId}`}
                    onClick={() => handleStartQuiz(mod)}
                    className="px-4 py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <span>{strings.quiz.startQuiz}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
