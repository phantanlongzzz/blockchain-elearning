import React from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
} from 'lucide-react';
import { QuizAttempt, QuizModule } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface QuizResultProps {
  attempt: QuizAttempt;
  module: QuizModule;
  onRetake: () => void;
  onReturnToSelection: () => void;
  onReview: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  attempt,
  module,
  onRetake,
  onReturnToSelection,
  onReview,
}) => {
  const { strings, language } = useLanguage();
  const { setCertificatesModalOpen, user } = useAuth();

  const isPassed = attempt.score >= module.passingScore;
  const isEligibleForCert =
    attempt.quizId === 'comprehensive-v1' && attempt.score >= 75;

  const topicLabels: Record<string, { en: string; vi: string }> = {
    sha256: { en: 'SHA-256 & Primitives', vi: 'SHA-256 & Hàm Băm' },
    transaction: { en: 'Transactions & States', vi: 'Cấu Trúc Giao Dịch' },
    signature: { en: 'Chữ Ký Số (ECDSA)', vi: 'Chữ Ký Số ECDSA' },
    mempool: { en: 'Mempool & Gas Fee', vi: 'Hàng Đợi Mempool' },
    'merkle-tree': { en: 'Merkle Tree & Proofs', vi: 'Cây Merkle & Bằng Chứng' },
    blockchain: { en: 'Blockchain & PrevHash', vi: 'Khối & Chuỗi Liên Kết' },
    'proof-of-work': { en: 'Proof of Work', vi: 'Khai Thác PoW' },
    'proof-of-stake': { en: 'Proof of Stake', vi: 'Cơ Chế Đồng Thuận PoS' },
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder}s`;
  };

  return (
    <div
      id="quiz-result-container"
      className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in space-y-6"
    >
      {/* Top Banner */}
      <div className="text-center space-y-2 pb-6 border-b border-slate-800">
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border mx-auto shadow-xl ${
            isPassed
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {isPassed ? (
            <Award className="w-8 h-8" />
          ) : (
            <RotateCcw className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-2xl font-bold text-white tracking-tight">
          {strings.quiz.quizComplete}
        </h3>

        <p className="text-xs text-slate-400">
          {language === 'vi' ? module.title.vi : module.title.en} · v
          {module.version}
        </p>
      </div>

      {/* Score Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl text-center">
          <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            {strings.quiz.yourScore}
          </span>
          <span
            className={`text-2xl sm:text-3xl font-black font-mono mt-0.5 block ${
              isPassed ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {attempt.score}%
          </span>
          <span
            className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-1.5 ${
              isPassed
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPassed ? strings.quiz.passedBadge : strings.quiz.failedBadge}
          </span>
        </div>

        <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl text-center">
          <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            {strings.quiz.correctCount}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-white font-mono mt-0.5 block">
            {attempt.correctAnswers}/{attempt.totalQuestions}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {Math.round(
              (attempt.correctAnswers / attempt.totalQuestions) * 100
            )}
            {language === 'vi' ? '% Độ chính xác' : '% Accuracy'}
          </span>
        </div>

        <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl text-center">
          <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            {strings.quiz.incorrectCount}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-rose-400 font-mono mt-0.5 block">
            {attempt.totalQuestions - attempt.correctAnswers}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {attempt.totalQuestions - attempt.correctAnswers} {language === 'vi' ? 'câu sai' : 'Questions'}
          </span>
        </div>

        <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl text-center">
          <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            {strings.quiz.timeTaken}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono mt-0.5 block">
            {formatDuration(attempt.durationSeconds || 0)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {language === 'vi' ? 'Thời gian hoàn thành' : 'Recorded Pace'}
          </span>
        </div>
      </div>

      {/* Certificate Unlocked Banner if qualified */}
      {isEligibleForCert && (
        <div className="p-4 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                {strings.quiz.eligibleForCert}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'vi'
                  ? 'Bản ghi chứng nhận đánh giá năng lực đã được lưu vào hồ sơ của bạn.'
                  : 'Your assessment certificate record has been generated in your profile.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCertificatesModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{strings.certificates.title}</span>
          </button>
        </div>
      )}

      {/* Topic-by-Topic Performance Breakdown */}
      {attempt.topicBreakdown && Object.keys(attempt.topicBreakdown).length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {language === 'vi'
                ? 'Kết Quả Theo Từng Chuyên Đề'
                : 'Performance Breakdown by Topic'}
            </span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.entries(attempt.topicBreakdown).map(([topic, rawStat]) => {
              const stat = rawStat as { correct: number; total: number };
              const label =
                topicLabels[topic] || { en: topic, vi: topic };
              const percent = Math.round((stat.correct / stat.total) * 100);
              const isTopicPassed = percent >= 70;

              return (
                <div
                  key={topic}
                  className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">
                      {language === 'vi' ? label.vi : label.en}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {stat.correct}/{stat.total} {strings.quiz.correctCount}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        isTopicPassed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onReturnToSelection}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
        >
          {strings.quiz.returnToModules}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>{strings.quiz.retakeQuiz}</span>
          </button>

          <button
            onClick={onReview}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>{strings.quiz.reviewAnswers}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
