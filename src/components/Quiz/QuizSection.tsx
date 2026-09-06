import React, { useState } from 'react';
import { GraduationCap, Award, History, CheckCircle2, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
          <span>{strings.quiz.badge}</span>
          <span className="w-1 h-1 rounded-full bg-cyan-400/40"></span>
          <span className="font-mono text-cyan-300">v1.0</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          {strings.quiz.title}
        </h2>

        <p className="text-base text-slate-400 mt-3 leading-relaxed">
          {strings.quiz.subtitle}
        </p>

        {/* User quick status & actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0B101E]/85 border border-cyan-500/20 text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="font-sans text-xs text-slate-300 font-medium">
                {strings.auth.welcomeBack}{' '}
                <strong className="text-slate-100 font-semibold">{user?.name}</strong>
              </span>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-300 font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{strings.auth.signIn}</span>
            </button>
          )}

          <button
            onClick={() => setQuizHistoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0E1526]/80 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 text-xs font-medium border border-white/[0.08] hover:border-cyan-500/30 transition-all cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {strings.quizHistory.title} ({pastAttempts.length})
            </span>
          </button>

          <button
            onClick={() => setCertificatesModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0E1526]/80 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 text-xs font-medium border border-white/[0.08] hover:border-cyan-500/30 transition-all cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-cyan-400" />
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
              className="relative p-6 sm:p-8 bg-[#0B101E]/85 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(0,210,255,0.08)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 overflow-hidden group before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-500/[0.04] before:to-transparent before:pointer-events-none"
            >
              <div className="space-y-3 flex-1 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,210,255,0.2)]">
                    ★ {language === 'vi' ? 'Đề thi tiêu điểm' : 'Featured Assessment'}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                    v{mod.version}
                  </span>
                  <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 rounded-full">
                    {mod.questions.length} {strings.quiz.questionCount}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {language === 'vi' ? mod.title.vi : mod.title.en}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {language === 'vi' ? mod.description.vi : mod.description.en}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{strings.quiz.timeEstimate}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span>
                      {strings.quiz.passingScoreReq}: <strong className="text-success font-semibold">≥ {mod.passingScore}%</strong>
                    </span>
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex-shrink-0">
                <button
                  id={`btn-start-${mod.quizId}`}
                  onClick={() => handleStartQuiz(mod)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-sans text-xs font-semibold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(0,210,255,0.35)] hover:shadow-[0_0_25px_rgba(0,210,255,0.5)] transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <span>{strings.quiz.startQuiz}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Specialized Topic Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {QUIZ_MODULES.slice(1).map((mod) => (
              <div
                key={mod.quizId}
                id={`quiz-card-${mod.quizId}`}
                className="p-5 bg-[#0E1526]/70 backdrop-blur-md border border-white/[0.08] hover:border-cyan-500/40 hover:bg-cyan-500/[0.03] hover:shadow-[0_8px_30px_rgba(0,210,255,0.12)] rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                      v{mod.version}
                    </span>
                    <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 rounded-full">
                      {mod.questions.length} {strings.quiz.questionCount}
                    </span>
                  </div>

                  <h4 className="font-sans text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {language === 'vi' ? mod.title.vi : mod.title.en}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'vi'
                      ? mod.description.vi
                      : mod.description.en}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400">
                    {strings.quiz.passingScoreReq}: <strong className="text-success font-semibold">≥ {mod.passingScore}%</strong>
                  </span>

                  <button
                    id={`btn-start-${mod.quizId}`}
                    onClick={() => handleStartQuiz(mod)}
                    className="px-4 py-2 rounded-xl text-xs font-sans font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(0,210,255,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
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
