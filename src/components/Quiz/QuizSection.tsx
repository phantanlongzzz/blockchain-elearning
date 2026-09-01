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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C98D]/10 border border-[#00C98D]/30 text-[#00C98D] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{strings.quiz.badge}</span>
          <span className="w-1 h-1 rounded-full bg-[#00C98D]"></span>
          <span className="font-mono">v1.0</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F2F4F7] tracking-tight">
          {strings.quiz.title}
        </h2>

        <p className="text-base text-[#A5AFBF] mt-3 leading-relaxed">
          {strings.quiz.subtitle}
        </p>

        {/* User quick status & actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0C0F14] border border-[#1C2430] text-xs text-[#A5AFBF]">
              <span className="w-2 h-2 rounded-full bg-[#00C98D]"></span>
              <span>
                {strings.auth.welcomeBack}{' '}
                <strong className="text-[#F2F4F7]">{user?.name}</strong> (
                {user?.class})
              </span>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00C98D]/10 hover:bg-[#00C98D]/20 border border-[#00C98D]/30 text-xs text-[#00C98D] font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{strings.auth.signIn}</span>
            </button>
          )}

          <button
            onClick={() => setQuizHistoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#11161E] hover:bg-[#161D26] text-[#F2F4F7] text-xs font-medium border border-[#1C2430] transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-[#00C98D]" />
            <span>
              {strings.quizHistory.title} ({pastAttempts.length})
            </span>
          </button>

          <button
            onClick={() => setCertificatesModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#11161E] hover:bg-[#161D26] text-[#F2F4F7] text-xs font-medium border border-[#1C2430] transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-[#00C98D]" />
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
              className="relative p-6 sm:p-8 bg-[#0C0F14] border border-[#00C98D]/40 hover:border-[#00C98D]/80 rounded-2xl shadow-xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 overflow-hidden group"
            >
              <div className="space-y-3 flex-1 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00C98D]/15 text-[#00C98D] border border-[#00C98D]/30">
                    ★ {language === 'vi' ? 'Đề Đánh Giá Tổng Hợp' : 'Comprehensive Certification'}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#11161E] text-[#A5AFBF] border border-[#1C2430]">
                    v{mod.version}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#11161E] text-[#A5AFBF] border border-[#1C2430]">
                    {mod.questions.length} {strings.quiz.questionCount}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#F2F4F7] group-hover:text-[#00C98D] transition-colors">
                  {language === 'vi' ? mod.title.vi : mod.title.en}
                </h3>

                <p className="text-xs sm:text-sm text-[#A5AFBF] leading-relaxed max-w-2xl">
                  {language === 'vi' ? mod.description.vi : mod.description.en}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#717B8C] font-mono pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00C98D]" />
                    <span>{strings.quiz.timeEstimate}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00C98D]" />
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
                  className="px-6 py-3.5 bg-[#00C98D] hover:bg-[#00C98D]/90 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
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
                className="p-5 bg-[#0C0F14] hover:bg-[#11161E] border border-[#1C2430] hover:border-[#00C98D]/40 rounded-2xl transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#11161E] text-[#00C98D] border border-[#1C2430]">
                      v{mod.version}
                    </span>
                    <span className="text-xs text-[#717B8C] font-mono">
                      {mod.questions.length} {strings.quiz.questionCount}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#F2F4F7] group-hover:text-[#00C98D] transition-colors">
                    {language === 'vi' ? mod.title.vi : mod.title.en}
                  </h4>

                  <p className="text-xs text-[#A5AFBF] leading-relaxed">
                    {language === 'vi'
                      ? mod.description.vi
                      : mod.description.en}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1C2430] flex items-center justify-between">
                  <span className="text-[11px] text-[#717B8C] font-mono">
                    {strings.quiz.passingScoreReq}: ≥ {mod.passingScore}%
                  </span>

                  <button
                    id={`btn-start-${mod.quizId}`}
                    onClick={() => handleStartQuiz(mod)}
                    className="px-4 py-2 bg-[#11161E] hover:bg-[#00C98D] hover:text-slate-950 text-[#F2F4F7] text-xs font-semibold rounded-xl border border-[#1C2430] transition-all flex items-center gap-1.5 cursor-pointer"
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
