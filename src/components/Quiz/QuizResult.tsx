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
      className="bg-[#0C0F14] border border-[#1C2430] rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in space-y-6"
    >
      {/* Top Banner */}
      <div className="text-center space-y-2 pb-6 border-b border-[#1C2430]">
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border mx-auto shadow-sm ${
            isPassed
              ? 'bg-[#00C98D]/10 border-[#00C98D]/30 text-[#00C98D]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {isPassed ? (
            <Award className="w-8 h-8" />
          ) : (
            <RotateCcw className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-2xl font-bold text-[#F2F4F7] tracking-tight">
          {strings.quiz.quizComplete}
        </h3>

        <p className="text-xs text-[#A5AFBF]">
          {language === 'vi' ? module.title.vi : module.title.en} · v
          {module.version}
        </p>
      </div>

      {/* Score Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#11161E]/70 border border-[#1C2430] rounded-xl text-center">
          <span className="block text-[11px] uppercase tracking-wider text-[#A5AFBF] font-medium">
            {strings.quiz.yourScore}
          </span>
          <span
            className={`text-2xl sm:text-3xl font-black font-mono mt-0.5 block ${
              isPassed ? 'text-[#00C98D]' : 'text-rose-400'
            }`}
          >
            {attempt.score}%
          </span>
          <span
            className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-1.5 ${
              isPassed
                ? 'bg-[#00C98D]/15 text-[#00C98D] border border-[#00C98D]/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPassed ? strings.quiz.passedBadge : strings.quiz.failedBadge}
          </span>
        </div>

        <div className="p-4 bg-[#11161E]/70 border border-[#1C2430] rounded-xl text-center">
          <span className="block text-[11px] uppercase tracking-wider text-[#A5AFBF] font-medium">
            {strings.quiz.correctCount}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#F2F4F7] font-mono mt-0.5 block">
            {attempt.correctAnswers}/{attempt.totalQuestions}
          </span>
          <span className="text-[10px] text-[#717B8C] mt-1 block">
            {Math.round(
              (attempt.correctAnswers / attempt.totalQuestions) * 100
            )}
            {language === 'vi' ? '% Độ chính xác' : '% Accuracy'}
          </span>
        </div>

        <div className="p-4 bg-[#11161E]/70 border border-[#1C2430] rounded-xl text-center">
          <span className="block text-[11px] uppercase tracking-wider text-[#A5AFBF] font-medium">
            {strings.quiz.incorrectCount}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-rose-400 font-mono mt-0.5 block">
            {attempt.totalQuestions - attempt.correctAnswers}
          </span>
          <span className="text-[10px] text-[#717B8C] mt-1 block">
            {attempt.totalQuestions - attempt.correctAnswers} {language === 'vi' ? 'câu sai' : 'Questions'}
          </span>
        </div>

        <div className="p-4 bg-[#11161E]/70 border border-[#1C2430] rounded-xl text-center">
          <span className="block text-[11px] uppercase tracking-wider text-[#A5AFBF] font-medium">
            {strings.quiz.timeTaken}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#00C98D] font-mono mt-0.5 block">
            {formatDuration(attempt.durationSeconds || 0)}
          </span>
          <span className="text-[10px] text-[#717B8C] mt-1 block">
            {language === 'vi' ? 'Thời gian hoàn thành' : 'Recorded Pace'}
          </span>
        </div>
      </div>

      {/* Certificate Unlocked Banner if qualified */}
      {isEligibleForCert && (
        <div className="p-4 bg-[#080C10] border border-[#00C98D]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-[#00C98D]/15 text-[#00C98D] border border-[#00C98D]/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#00C98D]">
                {strings.quiz.eligibleForCert}
              </h4>
              <p className="text-xs text-[#A5AFBF] mt-0.5">
                {language === 'vi'
                  ? 'Bản ghi chứng nhận đánh giá năng lực đã được lưu vào hồ sơ của bạn.'
                  : 'Your assessment certificate record has been generated in your profile.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCertificatesModalOpen(true)}
            className="px-4 py-2 bg-[#00C98D] hover:bg-[#00C98D]/90 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{strings.certificates.title}</span>
          </button>
        </div>
      )}

      {/* Topic-by-Topic Performance Breakdown */}
      {attempt.topicBreakdown && Object.keys(attempt.topicBreakdown).length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-[#A5AFBF] uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid className="w-3.5 h-3.5 text-[#00C98D]" />
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
                  className="p-3 bg-[#11161E]/50 border border-[#1C2430] rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#F2F4F7] block">
                      {language === 'vi' ? label.vi : label.en}
                    </span>
                    <span className="text-[11px] text-[#717B8C] font-mono">
                      {stat.correct}/{stat.total} {strings.quiz.correctCount}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        isTopicPassed ? 'text-[#00C98D]' : 'text-rose-400'
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
      <div className="pt-6 border-t border-[#1C2430] flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onReturnToSelection}
          className="px-4 py-2.5 bg-[#11161E] hover:bg-[#161D26] text-[#A5AFBF] hover:text-[#F2F4F7] text-xs font-semibold rounded-xl border border-[#1C2430] transition-colors cursor-pointer"
        >
          {strings.quiz.returnToModules}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#11161E] hover:bg-[#161D26] text-[#F2F4F7] text-xs font-semibold rounded-xl border border-[#1C2430] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#00C98D]" />
            <span>{strings.quiz.retakeQuiz}</span>
          </button>

          <button
            onClick={onReview}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00C98D] hover:bg-[#00C98D]/90 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>{strings.quiz.reviewAnswers}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
