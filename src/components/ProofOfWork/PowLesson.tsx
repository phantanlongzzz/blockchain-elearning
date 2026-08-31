/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Pickaxe,
  Zap,
  RotateCcw,
  Clock,
  Trophy,
  Gauge,
  Play,
  Square,
  Sparkles,
  GitFork,
  Plus,
  Minus,
  Coins,
  Cpu,
  Dices,
  ShieldAlert,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePowSimulation } from '../../engine/pow/PowSimulationController';
import { SimulationCodeModal } from './SimulationCodeModal';
import { ForkTreeVisualizer } from './ForkTreeVisualizer';
import { SimulationGuidePanel, GuideStep, SimulationQuestions, MicroConcept } from '../common/SimulationGuidePanel';
import type { Miner, MinedBlock } from '../../engine/types';

export type { Miner, MinedBlock };

export type ChallengeType = 'power' | 'luck' | 'difficulty' | 'attack51';

export const PowLesson: React.FC = () => {
  const { language, strings } = useLanguage();
  const isVi = language === 'vi';
  const t = strings;

  // UI (PowLesson) -> Simulation Controller (usePowSimulation)
  const {
    miners,
    isRacing,
    isGameOver,
    timeLeft,
    durationSec,
    difficulty,
    raceOutcome,
    recentMinedToast,
    startRace,
    stopRace,
    resetRace,
    setDurationSec,
    setDifficulty,
    handleAddMiner,
    handleRemoveMiner,
  } = usePowSimulation(3);

  // Guided Mode & Sandbox Mode State
  const [guideMode, setGuideMode] = useState<'guided' | 'free'>('guided');
  const [guideStepIndex, setGuideStepIndex] = useState<number>(0);

  // Local UI-only state (explainer panels, modals, challenge presets)
  const [showDifficultyExplainer, setShowDifficultyExplainer] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeType | null>(null);

  const targetPrefix = '0'.repeat(difficulty);
  const maxBlocks = Math.max(0, ...miners.map((m) => m.chain.length));
  const isForkTied = raceOutcome?.isTie || false;
  const singleWinner = raceOutcome?.winner || null;

  // Dynamic Guide Steps
  const powGuideSteps: GuideStep[] = [
    {
      stepNumber: 1,
      titleVi: 'Chọn độ khó',
      titleEn: 'Select Mining Difficulty',
      instructionVi: 'Độ khó quy định số lượng số 0 liên tiếp bắt buộc ở đầu chuỗi mã băm SHA-256 (0, 00, 000 hoặc 0000).',
      instructionEn: 'Difficulty dictates how many leading zeros are required in the SHA-256 block hash.',
      targetActionVi: 'Hãy nhấp chọn "Vừa (00...)" hoặc độ khó bạn muốn thử.',
      targetActionEn: 'Click to select "Medium (00...)" or your preferred difficulty.',
      isCompleted: difficulty >= 1,
    },
    {
      stepNumber: 2,
      titleVi: 'Chọn Thời Gian Cuộc Đua (Duration)',
      titleEn: 'Select Race Duration',
      instructionVi: 'Thiết lập thời gian tối đa để các thợ đào chạy đua tìm khối theo phân phối xác suất Poisson.',
      instructionEn: 'Set the maximum countdown duration for miners to discover blocks under the Poisson model.',
      targetActionVi: 'Chọn thời gian "15 giây" hoặc "30 giây".',
      targetActionEn: 'Select duration "15s" or "30s".',
      isCompleted: durationSec > 0,
    },
    {
      stepNumber: 3,
      titleVi: 'Kích Hoạt Cuộc Đua Thợ Đào',
      titleEn: 'Launch the Mining Race',
      instructionVi: 'Khi bấm bắt đầu, Web Worker chạy ngầm sẽ thử hàng nghìn giá trị Nonce ngẫu nhiên cho từng thợ đào.',
      instructionEn: 'When started, background Web Workers simulate rapid Nonce attempts for each miner.',
      targetActionVi: 'Bấm nút "BẮT ĐẦU CUỘC ĐUA" màu xanh dương.',
      targetActionEn: 'Click the blue "START RACE" button.',
      isCompleted: isRacing || isGameOver,
    },
    {
      stepNumber: 4,
      titleVi: 'Quan Sát Kết Quả & Chuỗi Dài Nhất',
      titleEn: 'Observe Outcome & Longest Chain Rule',
      instructionVi: 'Xem thợ đào nào may mắn tìm thấy khối hợp lệ và cách mạng lưới chọn chuỗi có nhiều khối nhất làm chuỗi chính.',
      instructionEn: 'Observe which miner finds valid blocks and how the network converges on the longest canonical chain.',
      targetActionVi: 'Đợi hết thời gian đua hoặc khối được tìm thấy, sau đó xem phân tích kết quả.',
      targetActionEn: 'Wait for the race to finish and view the canonical outcome analysis.',
      isCompleted: isGameOver,
    },
  ];

  // 4 Core Questions Framework
  const powQuestions: SimulationQuestions = {
    whatAmILookingAtVi: 'Bạn đang quan sát các máy đào độc lập (Alice, Bob, Charlie) đua nhau tính toán hàm băm SHA-256 với các mức phần cứng (HashRate) khác nhau.',
    whatAmILookingAtEn: 'You are observing independent miners (Alice, Bob, Charlie) competing to compute SHA-256 hashes with varied hardware HashRates.',
    whatShouldIClickVi: 'Thiết lập cấu hình và bắt đầu quá trình mô phỏng khai thác.',
    whatShouldIClickEn: 'Select Difficulty (e.g. Medium 00...), select Duration 15s or 30s, and click "START RACE". You can also add more miners.',
    whatJustHappenedVi: 'Một thợ đào may mắn tìm thấy giá trị Nonce sinh ra chuỗi Hash bắt đầu bằng số 0 theo đúng độ khó yêu cầu, đóng gói khối mới và phát tán vào chuỗi.',
    whatJustHappenedEn: 'A miner discovered a valid Nonce producing a SHA-256 hash satisfying the difficulty target, packaging a new block into the chain.',
    whyDidItHappenVi: 'Vì SHA-256 là hàm băm một chiều không thể đoán trước, cách duy nhất để tìm nghiệm là thử ngẫu nhiên hàng nghìn giá trị Nonce (Proof of Work). Thợ đào có máy mạnh hơn có xác suất cao hơn nhưng không chắc chắn 100% thắng.',
    whyDidItHappenEn: 'Because SHA-256 is an unpredictable one-way hash, brute-forcing Nonces is the only way to find a valid block. Higher hash power grants higher statistical odds, but outcomes remain stochastic.',
  };

  // Micro-concepts for crypto terms
  const powMicroConcepts: MicroConcept[] = [
    {
      term: 'Nonce',
      explanationVi: 'Một con số nguyên (Number used once) mà thợ đào thay đổi liên tục để giá trị băm SHA-256 bắt đầu bằng số lượng số 0 theo đúng độ khó yêu cầu.',
      explanationEn: 'An integer number changed repeatedly by miners until the resulting SHA-256 hash starts with the required number of zeros.',
    },
    {
      term: 'Hash (SHA-256)',
      explanationVi: 'Chuỗi ký tự cố định 256-bit (64 ký tự Hex) đại diện độc nhất cho dữ liệu khối. Thay đổi dù chỉ 1 ký tự thì Hash sẽ thay đổi hoàn toàn.',
      explanationEn: 'A deterministic 256-bit digest uniquely fingerprinting the block. Altering any byte completely randomizes the hash.',
    },
    {
      term: 'PoW (Proof of Work)',
      explanationVi: 'Cơ chế đồng thuận yêu cầu chứng minh đã tiêu tốn năng lượng tính toán thực tế để bảo vệ blockchain chống lại spam và gian lận.',
      explanationEn: 'Consensus mechanism requiring verifiable computational expenditure to secure the network against spam and tampering.',
    },
    {
      term: 'Longest Chain Rule',
      explanationVi: 'Quy tắc chuỗi dài nhất: Mạng lưới Bitcoin luôn tin tưởng và theo đuổi chuỗi khối nào tích lũy được nhiều công sức tính toán PoW nhất.',
      explanationEn: 'The Nakamoto consensus rule where all nodes converge on the chain with the most accumulated Proof of Work.',
    },
  ];

  // Challenge Preset handlers
  const handleSelectChallenge = (type: ChallengeType) => {
    setActiveChallenge(type);
    resetRace();

    if (type === 'power') {
      setDurationSec(30);
      setDifficulty(2);
    } else if (type === 'luck') {
      setDurationSec(15);
      setDifficulty(1);
    } else if (type === 'difficulty') {
      setDurationSec(15);
      setDifficulty(4);
    } else if (type === 'attack51') {
      setDurationSec(30);
      setDifficulty(2);
    }
  };

  const handleRunChallenge = (type: ChallengeType) => {
    handleSelectChallenge(type);
    setTimeout(() => {
      startRace();
    }, 60);
  };

  const handleNextGuideStep = () => {
    if (guideStepIndex < powGuideSteps.length - 1) {
      setGuideStepIndex(guideStepIndex + 1);
    }
  };

  const handlePrevGuideStep = () => {
    if (guideStepIndex > 0) {
      setGuideStepIndex(guideStepIndex - 1);
    }
  };

  const handleResetGuide = () => {
    setGuideStepIndex(0);
    resetRace();
  };

  // Sort miners by blocks descending, then attempts, then hashrate
  const sortedMiners = [...miners].sort((a, b) => {
    if (b.chain.length !== a.chain.length) {
      return b.chain.length - a.chain.length;
    }
    if (b.attempts !== a.attempts) {
      return b.attempts - a.attempts;
    }
    return b.hashRate - a.hashRate;
  });

  return (
    <section
      id="proof-of-work"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative scroll-mt-20 font-sans"
    >
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-500/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/5 blur-[150px] pointer-events-none rounded-full" />

      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-3 font-sans">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-emerald-400 text-xs font-mono">
          <Pickaxe className="w-3.5 h-3.5" />
          <span>{t.proofOfWork?.badge || (isVi ? 'Phòng thí nghiệm Proof of Work' : 'Proof of Work Lab')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100 tracking-tight font-display">
          {t.proofOfWork?.title || (isVi ? 'Cuộc đua thợ đào & chuỗi dài nhất' : 'Miners Race & Longest Chain Rule')}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-sans max-w-2xl mx-auto">
          {t.proofOfWork?.description ||
            (isVi
              ? 'Mô hình xác suất Poisson chuẩn Bitcoin: Thợ đào có HashRate cao hơn có xác suất tìm thấy block cao hơn nhưng không đảm bảo thắng. Mỗi lần chạy là ngẫu nhiên độc lập.'
              : 'Authentic Bitcoin Poisson model: Miners with higher HashRate have higher probability to find blocks, but each run is genuinely stochastic.')}
        </p>
      </div>

      {/* 2. Interactive Guided vs Free Mode & 4-Question Framework */}
      <SimulationGuidePanel
        mode={guideMode}
        onModeChange={setGuideMode}
        currentStepIndex={guideStepIndex}
        steps={powGuideSteps}
        onNextStep={handleNextGuideStep}
        onPrevStep={handlePrevGuideStep}
        onResetGuide={handleResetGuide}
        questions={powQuestions}
        microConcepts={powMicroConcepts}
        badgeTextVi="Mô phỏng Proof of Work"
        badgeTextEn="Proof of Work Simulation"
      />

      {/* 3. Duration, Difficulty & Primary Action Controls */}
      <div className="bg-[#0C0F14] border border-[#1C2430] rounded-xl p-6 mb-8 font-sans shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* DURATION */}
          <div className="lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r border-[#1C2430] pb-5 lg:pb-0 lg:pr-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#C5CBD3]">
                {isVi ? 'Thời gian thi đấu' : 'Race duration'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { sec: 15, label: '15s' },
                { sec: 30, label: '30s' },
                { sec: 60, label: '1m' },
                { sec: 300, label: '5m' },
              ].map((opt) => (
                <button
                  key={opt.sec}
                  onClick={() => setDurationSec(opt.sec)}
                  disabled={isRacing}
                  className={`py-2 px-1 text-center font-mono text-xs rounded-lg border transition-all cursor-pointer ${
                    durationSec === opt.sec
                      ? 'bg-[#00C98D] text-[#090A0F] border-[#00C98D] font-bold shadow-sm'
                      : 'bg-[#0F131A] text-[#A5AFBF] border-[#1C2430] hover:text-[#F2F4F7]'
                  } ${isRacing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* DIFFICULTY */}
          <div className="lg:col-span-5 space-y-2 border-b lg:border-b-0 lg:border-r border-[#1C2430] pb-5 lg:pb-0 lg:pr-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#C5CBD3]">
                {isVi ? 'Độ khó mục tiêu' : 'Target difficulty'}
              </span>
              <button
                onClick={() => setShowDifficultyExplainer(!showDifficultyExplainer)}
                className="text-[11px] font-mono text-[#00C98D] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>{isVi ? 'Xem giải thích' : 'How it works'}</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { diff: 1, labelVi: 'Dễ', labelEn: 'Easy', prefix: '0...' },
                { diff: 2, labelVi: 'Vừa', labelEn: 'Medium', prefix: '00...' },
                { diff: 3, labelVi: 'Khó', labelEn: 'Hard', prefix: '000...' },
                { diff: 4, labelVi: 'Rất khó', labelEn: 'V.Hard', prefix: '0000...' },
              ].map((lvl) => (
                <button
                  key={lvl.diff}
                  onClick={() => setDifficulty(lvl.diff)}
                  disabled={isRacing}
                  className={`py-2 px-1 text-center font-mono rounded-lg border transition-all cursor-pointer ${
                    difficulty === lvl.diff
                      ? 'bg-[#00C98D] text-[#090A0F] border-[#00C98D] font-bold shadow-sm'
                      : 'bg-[#0F131A] text-[#A5AFBF] border-[#1C2430] hover:text-[#F2F4F7]'
                  } ${isRacing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-xs font-bold">{isVi ? lvl.labelVi : lvl.labelEn}</div>
                  <div className={`text-[10px] font-mono mt-0.5 ${difficulty === lvl.diff ? 'text-[#090A0F] font-bold' : 'text-[#00C98D]'}`}>{lvl.prefix}</div>
                </button>
              ))}
            </div>

            {/* Explainer Box */}
            {showDifficultyExplainer && (
              <div className="mt-2 p-2.5 bg-[#090A0F] border border-[rgba(0,201,141,0.35)] rounded-lg text-[11px] text-[#A5AFBF] space-y-1 animate-in fade-in duration-150">
                <div className="text-[#00C98D] font-bold font-mono">
                  {isVi ? 'Mô hình thời gian chờ Poisson:' : 'Poisson Wait Times:'}
                </div>
                <div>
                  {isVi
                    ? '• Độ khó 1 (0...): Trung bình ~4 giây / block toàn mạng.'
                    : '• Diff 1 (0...): Mean ~4s / block network-wide.'}
                </div>
                <div>
                  {isVi
                    ? '• Độ khó 2 (00...): Trung bình ~8 giây / block toàn mạng.'
                    : '• Diff 2 (00...): Mean ~8s / block network-wide.'}
                </div>
                <div>
                  {isVi
                    ? '• Độ khó 3 (000...): Trung bình ~16 giây / block toàn mạng.'
                    : '• Diff 3 (000...): Mean ~16s / block network-wide.'}
                </div>
                <div>
                  {isVi
                    ? '• Độ khó 4 (0000...): Hiếm xuất hiện trong khoảng 30s.'
                    : '• Diff 4 (0000...): Rare in 30s.'}
                </div>
              </div>
            )}
          </div>

          {/* PRIMARY ACTION BUTTONS */}
          <div className="lg:col-span-3 flex flex-col gap-2.5">
            <span className="text-xs font-mono font-bold text-[#A5AFBF]">
              {isVi ? 'Thao tác' : 'Actions'}
            </span>

            {!isRacing ? (
              <button
                onClick={startRace}
                aria-label={t.proofOfWork?.startRace || (isVi ? 'Bắt đầu cuộc đua đào khối' : 'Start race')}
                className="w-full py-2.5 bg-[#00C98D] hover:bg-[#00B982] text-[#090A0F] font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00C98D] focus-visible:outline-none"
              >
                <Play className="w-3.5 h-3.5 fill-[#090A0F] text-[#090A0F]" />
                <span>{t.proofOfWork?.startRace || (isVi ? 'Bắt đầu đào' : 'Start race')}</span>
              </button>
            ) : (
              <button
                onClick={stopRace}
                aria-label={t.proofOfWork?.stopRace || (isVi ? 'Dừng cuộc đua đào khối' : 'Stop race')}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
              >
                <Square className="w-3.5 h-3.5 fill-white text-white" />
                <span>{t.proofOfWork?.stopRace || (isVi ? 'Dừng đào' : 'Stop race')}</span>
              </button>
            )}

            <button
              onClick={resetRace}
              aria-label={t.proofOfWork?.reset || (isVi ? 'Đặt lại cuộc đua' : 'Reset')}
              className="w-full py-2 bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] rounded-lg font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-[#00C98D] focus-visible:outline-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.proofOfWork?.reset || (isVi ? 'Đặt lại' : 'Reset')}</span>
            </button>
          </div>
        </div>

        {/* Live Countdown & Status Ribbon */}
        <div className="mt-6 pt-4 border-t border-[#1C2430] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#A5AFBF]">
              {t.proofOfWork?.timeLeft || (isVi ? 'Thời gian còn lại:' : 'Time Left:')}
            </span>
            <span
              className={`text-xl sm:text-2xl font-mono font-bold px-3 py-0.5 rounded-lg border ${
                timeLeft <= 5 && isRacing
                  ? 'bg-rose-950/80 text-rose-400 border-rose-500 animate-pulse'
                  : 'bg-[#0F131A] text-[#00C98D] border-[rgba(0,201,141,0.35)]'
              }`}
            >
              {Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, '0')}
                :{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-[#A5AFBF]">
                {t.proofOfWork?.targetPrefix || (isVi ? 'Mục tiêu số 0:' : 'Zero target prefix:')}
              </span>
              <span className="text-[#00C98D] font-bold bg-[rgba(0,201,141,0.08)] px-2.5 py-0.5 rounded-md border border-[rgba(0,201,141,0.35)]">
                {'0'.repeat(difficulty)}...
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#A5AFBF]">
                {t.proofOfWork?.statusLabel || (isVi ? 'Trạng thái:' : 'Status:')}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md border font-medium ${
                  isRacing
                    ? 'bg-[rgba(0,201,141,0.1)] text-[#00C98D] border-[#00C98D]'
                    : isGameOver
                    ? isForkTied
                    ? 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border-[#F59E0B]'
                    : 'bg-[rgba(0,201,141,0.1)] text-[#00C98D] border-[#00C98D]'
                  : 'bg-[#0F131A] text-[#717B8C] border-[#1C2430]'
                }`}
              >
                {isRacing
                  ? t.proofOfWork?.stateRacing || (isVi ? 'Đang đào' : 'Mining')
                  : isGameOver
                  ? isForkTied
                    ? t.proofOfWork?.stateForkTie || (isVi ? 'Phân nhánh' : 'Fork active')
                    : t.proofOfWork?.stateBlockFound || (isVi ? 'Đã tìm thấy khối' : 'Block found')
                  : t.proofOfWork?.stateReady || (isVi ? 'Sẵn sàng' : 'Ready')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Real-time Miners Leaderboard (Data Table replacing grid cards) */}
      <div className="bg-[#0C0F14] border border-[#1C2430] rounded-xl p-5 sm:p-6 mb-8 font-sans shadow-sm">
        <div className="flex flex-wrap items-center justify-between border-b border-[#1C2430] pb-4 mb-5 gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-mono font-bold text-[#F2F4F7] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#00C98D]" />
              <span>
                {isVi
                  ? `Bảng xếp hạng thợ đào (${miners.length} thợ đào)`
                  : `Miner leaderboard (${miners.length} miners)`}
              </span>
            </h3>
            <p className="text-xs text-[#A5AFBF] mt-0.5">
              {isVi
                ? 'So sánh tốc độ băm và kết quả khai thác.'
                : 'Compare hashrate and mining outcomes in real time.'}
            </p>
          </div>

          {/* Add / Remove Miner Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddMiner}
              disabled={isRacing || miners.length >= 8}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                isRacing || miners.length >= 8
                  ? 'bg-[#0F131A] text-[#717B8C] border-[#1C2430] cursor-not-allowed opacity-50'
                  : 'bg-[rgba(0,201,141,0.08)] hover:bg-[rgba(0,201,141,0.15)] text-[#00C98D] border-[rgba(0,201,141,0.35)] shadow-sm'
              }`}
              title={miners.length >= 8 ? (isVi ? 'Tối đa 8 thợ đào' : 'Max 8 miners') : ''}
            >
              <Plus className="w-3.5 h-3.5 text-[#00C98D]" />
              <span>{t.proofOfWork?.addMiner || (isVi ? '+ Thêm thợ đào' : '+ Add miner')}</span>
            </button>

            <button
              onClick={handleRemoveMiner}
              disabled={isRacing || miners.length <= 2}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                isRacing || miners.length <= 2
                  ? 'bg-[#0F131A] text-[#717B8C] border-[#1C2430] cursor-not-allowed opacity-50'
                  : 'bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border-[#1C2430]'
              }`}
              title={miners.length <= 2 ? (isVi ? 'Tối thiểu 2 thợ đào' : 'Min 2 miners') : ''}
            >
              <Minus className="w-3.5 h-3.5 text-[#A5AFBF]" />
              <span>{t.proofOfWork?.removeMiner || (isVi ? '− Bớt thợ đào' : '− Remove miner')}</span>
            </button>
          </div>
        </div>

        {/* Toast when block is mined */}
        {recentMinedToast && (
          <div className="mb-5 p-3 bg-[rgba(0,201,141,0.08)] border border-[#00C98D] text-[#00C98D] text-xs font-mono rounded-lg flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00C98D] shrink-0" />
              <span className="font-semibold">
                {recentMinedToast.minerName} {t.proofOfWork?.blockMinedToast || (isVi ? 'vừa tìm được khối' : 'mined block')} #{recentMinedToast.blockNum} (Nonce: {recentMinedToast.nonce.toLocaleString()})
              </span>
            </div>
            <span className="text-[11px] text-[#00C98D] font-mono">
              {t.proofOfWork?.appendedToLedger || (isVi ? 'Đã thêm vào sổ cái' : 'Appended to ledger')}
            </span>
          </div>
        )}

        {/* Responsive Leaderboard Table */}
        <div className="overflow-x-auto rounded-lg border border-[#1C2430] bg-[#090A0F]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1C2430] bg-[#0F131A] text-[11px] font-semibold text-[#A5AFBF] tracking-wide">
                <th className="py-3 px-3.5 text-center w-12">#</th>
                <th className="py-3 px-4">{isVi ? 'Thợ đào' : 'Miner'}</th>
                <th className="py-3 px-4">{isVi ? 'Phần cứng' : 'Hardware'}</th>
                <th className="py-3 px-4">{isVi ? 'Tốc độ băm' : 'Hashrate'}</th>
                <th className="py-3 px-4 text-center">{isVi ? 'Số khối' : 'Blocks'}</th>
                <th className="py-3 px-4">{isVi ? 'Số lần thử' : 'Attempts'}</th>
                <th className="py-3 px-4 text-center">{isVi ? 'Trạng thái' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2430]">
              {sortedMiners.map((miner, idx) => {
                const isLongest = isGameOver && miner.chain.length === maxBlocks && maxBlocks > 0;
                const isWinner = isLongest && !isForkTied;
                const isTied = isLongest && isForkTied;

                return (
                  <tr
                    key={miner.id}
                    className={`transition-colors ${
                      isWinner
                        ? 'bg-[rgba(0,201,141,0.08)] border-l-2 border-l-[#00C98D]'
                        : isTied
                        ? 'bg-[rgba(245,158,11,0.08)] border-l-2 border-l-[#F59E0B]'
                        : 'hover:bg-[#0F131A]'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3.5 text-center font-bold">
                      {isWinner ? (
                        <div className="flex items-center justify-center gap-1 text-[#00C98D]">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{idx + 1}</span>
                        </div>
                      ) : (
                        <span className="text-[#717B8C]">{idx + 1}</span>
                      )}
                    </td>

                    {/* Miner Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-md border flex items-center justify-center font-mono font-bold text-xs shrink-0 ${miner.avatarColor}`}
                        >
                          {miner.name[0]}
                        </div>
                        <div>
                          <div className={`font-semibold font-mono ${isWinner ? 'text-[#00C98D]' : 'text-[#F2F4F7]'}`}>
                            {miner.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Hardware */}
                    <td className="py-3 px-4 text-[#A5AFBF] font-sans text-xs">
                      {isVi ? miner.rigTypeVi : miner.rigTypeEn}
                    </td>

                    {/* Hashrate */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#00C98D] font-semibold">{miner.powerPercent}%</span>
                        <span className="text-[#717B8C] text-[10px]">({miner.hashRate} H/s)</span>
                      </div>
                    </td>

                    {/* Blocks Mined */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`text-sm font-semibold font-mono px-2 py-0.5 rounded ${
                            isWinner
                              ? 'bg-[rgba(0,201,141,0.1)] text-[#00C98D] border border-[#00C98D]'
                              : miner.chain.length > 0
                              ? 'bg-[#0F131A] text-[#F2F4F7] border border-[#1C2430]'
                              : 'text-[#717B8C]'
                          }`}
                        >
                          {miner.chain.length}
                        </span>
                      </div>
                    </td>

                    {/* Attempts & Telemetry */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="text-[#F2F4F7] text-xs">
                          {miner.attempts.toLocaleString()}{' '}
                          <span className="text-[10px] text-[#717B8C]">
                            {t.proofOfWork?.attempts || (isVi ? 'lần' : 'tries')}
                          </span>
                        </div>
                        {isRacing && (
                          <div className="text-[10px] text-[#00C98D] flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00C98D] animate-pulse" />
                            <span>Nonce: {miner.currentGuess.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {isWinner ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgba(0,201,141,0.1)] border border-[#00C98D] text-[#00C98D] text-[10px] font-semibold">
                          <Trophy className="w-3 h-3 text-[#00C98D]" />
                          <span>{t.proofOfWork?.winnerBadge || (isVi ? 'Chuỗi chính' : 'Canonical Chain')}</span>
                        </span>
                      ) : isTied ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgba(245,158,11,0.1)] border border-[#F59E0B] text-[#F59E0B] text-[10px] font-semibold">
                          <GitFork className="w-3 h-3 text-[#F59E0B]" />
                          <span>{t.proofOfWork?.forkBadge || (isVi ? 'Phân nhánh' : 'Fork Tie')}</span>
                        </span>
                      ) : isRacing ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-[#00C98D] bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.35)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00C98D] animate-pulse" />
                          <span>{isVi ? 'Đang đào' : 'Mining'}</span>
                        </span>
                      ) : (
                        <span className="text-[#717B8C] font-mono">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4.5. Fork Tree Visualizer */}
      <ForkTreeVisualizer miners={miners} isRacing={isRacing} isGameOver={isGameOver} />

      {/* 5. Post-Race Outcome & Reward + Action Bar */}
      {isGameOver && (
        <div
          className={`border rounded-xl p-6 sm:p-7 mb-8 font-sans shadow-sm animate-in fade-in duration-300 ${
            isForkTied
              ? 'bg-[#0C0F14] border-[rgba(245,158,11,0.6)]'
              : singleWinner
              ? 'bg-[#0C0F14] border-[rgba(0,201,141,0.6)]'
              : 'bg-[#0C0F14] border-[#1C2430]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between border-b border-[#1C2430] pb-4 mb-5 gap-3">
            <div className="flex items-center gap-3">
              {isForkTied ? (
                <GitFork className="w-6 h-6 text-[#F59E0B] shrink-0" />
              ) : singleWinner ? (
                <Trophy className="w-6 h-6 text-[#00C98D] shrink-0" />
              ) : (
                <Clock className="w-6 h-6 text-[#00C98D] shrink-0" />
              )}
              <div>
                <h3
                  className={`text-base sm:text-lg font-mono font-bold ${
                    isForkTied ? 'text-[#F59E0B]' : singleWinner ? 'text-[#00C98D]' : 'text-[#F2F4F7]'
                  }`}
                >
                  {isForkTied
                    ? isVi
                      ? `Phân nhánh hòa · ${maxBlocks} khối mỗi nhánh`
                      : `Fork tie detected · ${maxBlocks} blocks each`
                    : singleWinner
                    ? isVi
                      ? `${singleWinner.name} dẫn đầu · ${singleWinner.chain.length} khối`
                      : `${singleWinner.name} leads · ${singleWinner.chain.length} blocks`
                    : isVi
                    ? 'Hết thời gian cuộc đua'
                    : 'Race time expired'}
                </h3>
                <p className="text-xs text-[#A5AFBF] mt-0.5 leading-relaxed">
                  {isVi ? raceOutcome?.summaryMessageVi : raceOutcome?.summaryMessageEn}
                </p>
              </div>
            </div>
          </div>

          {/* Educational Takeaway on Longest Chain Rule */}
          <div className="p-4 bg-[#090A0F] border border-[rgba(0,201,141,0.35)] rounded-lg text-xs text-[#A5AFBF] space-y-1 mb-6">
            <div className="font-semibold font-mono text-[#00C98D]">
              {isVi ? 'Nguyên lý Proof of Work & quy tắc chuỗi dài nhất:' : 'Proof-of-Work & Longest Chain Rule:'}
            </div>
            <p className="text-[#A5AFBF] font-sans leading-relaxed">
              {isVi
                ? 'Thợ đào có HashRate cao hơn có nhiều cơ hội tìm thấy khối hơn theo phân phối Poisson. Tuy nhiên mỗi phép thử Nonce là ngẫu nhiên độc lập. Chuỗi tích lũy được nhiều khối hợp lệ nhất sẽ được toàn mạng đồng thuận làm Chuỗi chính (Longest Chain Rule).'
                : 'Miners with higher hash power statistically discover more blocks under Poisson distribution. However, every single nonce trial is independent. The chain with the most accumulated valid blocks becomes the canonical ledger (Longest Chain Rule).'}
            </p>
          </div>

          {/* Reward & Action Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 pt-4 border-t border-[#1C2430]">
            {/* LEFT: Result Data (Mining Reward Display) */}
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.35)] rounded-lg text-[#F59E0B] shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-mono font-medium text-[#A5AFBF]">
                  {t.proofOfWork?.minerReward || (isVi ? 'Phần thưởng khai thác' : 'Mining Reward')}
                </div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-[#F59E0B] tracking-tight">
                  +{(Math.max(1, maxBlocks) * 3.125).toFixed(3)} BTC
                </div>
              </div>
            </div>

            {/* RIGHT: Action Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={resetRace}
                className="px-4 py-2 bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] rounded-lg font-mono text-xs font-medium transition-all cursor-pointer"
              >
                {t.proofOfWork?.playAgain || (isVi ? 'Vòng đua mới' : 'New round')}
              </button>

              <button
                onClick={() => {
                  setDifficulty(Math.min(4, difficulty + 1));
                  resetRace();
                }}
                className="px-4 py-2 bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] rounded-lg font-mono text-xs font-medium transition-all cursor-pointer"
              >
                {t.proofOfWork?.increaseDifficulty || (isVi ? 'Tăng độ khó' : 'Increase difficulty')}
              </button>

              <button
                onClick={() => handleRunChallenge('luck')}
                className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#090A0F] font-mono font-bold text-xs rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#090A0F]" />
                <span>{t.proofOfWork?.tryLuck || (isVi ? 'Thử may mắn →' : 'Try luck factor →')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 4 Interactive Challenges */}
      <div className="bg-[#0C0F14] border border-[#1C2430] rounded-xl p-6 mb-8 font-sans shadow-sm">
        <div className="flex flex-wrap items-center justify-between border-b border-[#1C2430] pb-4 mb-6 gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-mono font-bold text-[#F2F4F7] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00C98D]" />
              <span>{t.proofOfWork?.challengesTitle || (isVi ? '4 bài tập thử thách tương tác' : '4 Interactive practice scenarios')}</span>
            </h3>
            <p className="text-xs text-[#A5AFBF] mt-0.5">
              {isVi
                ? 'Khám phá các nguyên lý cốt lõi của Proof of Work qua từng kịch bản thí nghiệm.'
                : 'Explore core Proof-of-Work mechanics through hands-on experiments.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
          {/* Challenge 1: Machine Power */}
          <div
            className={`p-5 rounded-lg border flex flex-col justify-between transition-all ${
              activeChallenge === 'power'
                ? 'bg-[rgba(0,201,141,0.06)] border-[#00C98D] shadow-sm'
                : 'bg-[#0F131A] border-[#1C2430]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#717B8C]">01</span>
                <span className="text-[10px] font-mono text-[#A5AFBF] px-2 py-0.5 bg-[#090A0F] rounded border border-[#1C2430]">
                  {isVi ? '30s · Vừa' : '30s · Medium'}
                </span>
              </div>

              <div className="text-sm font-bold text-[#F2F4F7] font-mono mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#00C98D]" />
                <span>{isVi ? 'Sức mạnh máy' : 'Machine Power'}</span>
              </div>

              <p className="text-xs text-[#A5AFBF] leading-relaxed mb-4">
                {isVi
                  ? 'Ai có xác suất tìm thấy khối tiếp theo cao hơn khi sức mạnh tính toán chênh lệch?'
                  : 'Who is more likely to find the next block when hash power is unequal?'}
              </p>
            </div>

            <div>
              {activeChallenge === 'power' && isRacing && (
                <div className="mb-3 p-2 bg-[rgba(0,201,141,0.1)] border border-[rgba(0,201,141,0.35)] rounded-md text-[11px] font-mono text-[#00C98D] flex items-center gap-1.5 animate-pulse">
                  <Zap className="w-3.5 h-3.5 text-[#00C98D]" />
                  <span>{isVi ? 'Đang chạy mô phỏng...' : 'Simulation running...'} ({timeLeft}s)</span>
                </div>
              )}

              {activeChallenge === 'power' && isGameOver && (
                <div className="mb-3 p-3 bg-[#090A0F] border border-[rgba(0,201,141,0.35)] rounded-lg text-xs space-y-2 animate-in fade-in">
                  <div>
                    <div className="text-[10px] font-mono font-semibold text-[#00C98D]">
                      {isVi ? 'Kết quả' : 'Result'}
                    </div>
                    <div className="text-[11px] text-[#F2F4F7] mt-0.5">
                      {singleWinner
                        ? isVi
                          ? `${singleWinner.name} (${singleWinner.powerPercent}% Hashrate) đã tìm thấy ${singleWinner.chain.length} khối.`
                          : `${singleWinner.name} (${singleWinner.powerPercent}% Hashrate) discovered ${singleWinner.chain.length} blocks.`
                        : isVi
                        ? `Phân nhánh hòa với ${maxBlocks} khối.`
                        : `Fork tie with ${maxBlocks} blocks.`}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1C2430]">
                    <div className="text-[10px] font-mono font-semibold text-[#F59E0B]">
                      {isVi ? 'Bài học' : 'Takeaway'}
                    </div>
                    <p className="text-[11px] text-[#A5AFBF] leading-relaxed mt-0.5">
                      {isVi
                        ? 'HashRate cao hơn mang lại nhiều cơ hội thử Nonce hơn, nhưng mỗi lần thử vẫn là ngẫu nhiên độc lập.'
                        : 'Higher hashrate gives a miner more opportunities to find a valid nonce, but each trial is an independent stochastic event.'}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleRunChallenge('power')}
                disabled={isRacing}
                className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isRacing
                    ? 'bg-[#0F131A] text-[#717B8C] border border-[#1C2430] cursor-not-allowed opacity-50'
                    : 'bg-[rgba(0,201,141,0.08)] hover:bg-[rgba(0,201,141,0.15)] text-[#00C98D] border border-[rgba(0,201,141,0.35)] active:scale-95'
                }`}
              >
                <Play className="w-3 h-3 text-[#00C98D] fill-[#00C98D]" />
                <span>{isVi ? 'Chạy kịch bản' : 'Run scenario'}</span>
              </button>
            </div>
          </div>

          {/* Challenge 2: Luck Factor */}
          <div
            className={`p-5 rounded-lg border flex flex-col justify-between transition-all ${
              activeChallenge === 'luck'
                ? 'bg-[rgba(0,201,141,0.06)] border-[#00C98D] shadow-sm'
                : 'bg-[#0F131A] border-[#1C2430]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#717B8C]">02</span>
                <span className="text-[10px] font-mono text-[#A5AFBF] px-2 py-0.5 bg-[#090A0F] rounded border border-[#1C2430]">
                  {isVi ? '15s · Dễ' : '15s · Easy'}
                </span>
              </div>

              <div className="text-sm font-bold text-[#F2F4F7] font-mono mb-2 flex items-center gap-1.5">
                <Dices className="w-4 h-4 text-[#00C98D]" />
                <span>{isVi ? 'Yếu tố may mắn' : 'Luck Factor'}</span>
              </div>

              <p className="text-xs text-[#A5AFBF] leading-relaxed mb-4">
                {isVi
                  ? 'Khi sức mạnh các máy tương đương, thợ đào nào sẽ giành chiến thắng?'
                  : 'With equal computing power for all miners, who will find the block?'}
              </p>
            </div>

            <div>
              {activeChallenge === 'luck' && isRacing && (
                <div className="mb-3 p-2 bg-[rgba(0,201,141,0.1)] border border-[rgba(0,201,141,0.35)] rounded-md text-[11px] font-mono text-[#00C98D] flex items-center gap-1.5 animate-pulse">
                  <Zap className="w-3.5 h-3.5 text-[#00C98D]" />
                  <span>{isVi ? 'Đang chạy mô phỏng...' : 'Simulation running...'} ({timeLeft}s)</span>
                </div>
              )}

              {activeChallenge === 'luck' && isGameOver && (
                <div className="mb-3 p-3 bg-[#090A0F] border border-[rgba(0,201,141,0.35)] rounded-lg text-xs space-y-2 animate-in fade-in">
                  <div>
                    <div className="text-[10px] font-mono font-semibold text-[#00C98D]">
                      {isVi ? 'Kết quả' : 'Result'}
                    </div>
                    <div className="text-[11px] text-[#F2F4F7] mt-0.5">
                      {singleWinner
                        ? isVi
                          ? `${singleWinner.name} may mắn tìm được ${singleWinner.chain.length} khối trước.`
                          : `${singleWinner.name} discovered ${singleWinner.chain.length} blocks first.`
                        : isVi
                        ? 'Các thợ đào cạnh tranh ngang ngửa.'
                        : 'Miners competed with equal outcomes.'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1C2430]">
                    <div className="text-[10px] font-mono font-semibold text-[#F59E0B]">
                      {isVi ? 'Bài học' : 'Takeaway'}
                    </div>
                    <p className="text-[11px] text-[#A5AFBF] leading-relaxed mt-0.5">
                      {isVi
                        ? 'Khi sức mạnh ngang nhau, xác suất tìm thấy khối chia đều. Người chiến thắng phụ thuộc hoàn toàn vào may mắn ngẫu nhiên.'
                        : 'With equal hashrate, winning probability is uniform. The winner is determined purely by stochastic chance.'}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleRunChallenge('luck')}
                disabled={isRacing}
                className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isRacing
                    ? 'bg-[#0F131A] text-[#717B8C] border border-[#1C2430] cursor-not-allowed opacity-50'
                    : 'bg-[rgba(0,201,141,0.08)] hover:bg-[rgba(0,201,141,0.15)] text-[#00C98D] border border-[rgba(0,201,141,0.35)] active:scale-95'
                }`}
              >
                <Play className="w-3 h-3 text-[#00C98D] fill-[#00C98D]" />
                <span>{isVi ? 'Chạy kịch bản' : 'Run scenario'}</span>
              </button>
            </div>
          </div>

          {/* Challenge 3: High Difficulty */}
          <div
            className={`p-5 rounded-lg border flex flex-col justify-between transition-all ${
              activeChallenge === 'difficulty'
                ? 'bg-[rgba(0,201,141,0.06)] border-[#00C98D] shadow-sm'
                : 'bg-[#0F131A] border-[#1C2430]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#717B8C]">03</span>
                <span className="text-[10px] font-mono text-[#A5AFBF] px-2 py-0.5 bg-[#090A0F] rounded border border-[#1C2430]">
                  {isVi ? '15s · Rất khó' : '15s · V.Hard'}
                </span>
              </div>

              <div className="text-sm font-bold text-[#F2F4F7] font-mono mb-2 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#00C98D]" />
                <span>{isVi ? 'Độ khó tăng cao' : 'High Difficulty'}</span>
              </div>

              <p className="text-xs text-[#A5AFBF] leading-relaxed mb-4">
                {isVi
                  ? 'Tốc độ tìm khối và số lượng lần thử thay đổi thế nào khi yêu cầu 4 số 0 (0000...)?'
                  : 'How do attempts and discovery rate change when requiring 4 leading zeros?'}
              </p>
            </div>

            <div>
              {activeChallenge === 'difficulty' && isRacing && (
                <div className="mb-3 p-2 bg-[rgba(0,201,141,0.1)] border border-[rgba(0,201,141,0.35)] rounded-md text-[11px] font-mono text-[#00C98D] flex items-center gap-1.5 animate-pulse">
                  <Zap className="w-3.5 h-3.5 text-[#00C98D]" />
                  <span>{isVi ? 'Đang chạy mô phỏng...' : 'Simulation running...'} ({timeLeft}s)</span>
                </div>
              )}

              {activeChallenge === 'difficulty' && isGameOver && (
                <div className="mb-3 p-3 bg-[#090A0F] border border-[rgba(0,201,141,0.35)] rounded-lg text-xs space-y-2 animate-in fade-in">
                  <div>
                    <div className="text-[10px] font-mono font-semibold text-[#00C98D]">
                      {isVi ? 'Kết quả' : 'Result'}
                    </div>
                    <div className="text-[11px] text-[#F2F4F7] mt-0.5">
                      {isVi
                        ? `Độ khó 0000... khiến toàn mạng chỉ tìm được ${maxBlocks} khối sau hàng nghìn lần thử.`
                        : `Difficulty 0000... resulted in only ${maxBlocks} block(s) found across thousands of trials.`}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1C2430]">
                    <div className="text-[10px] font-mono font-semibold text-[#F59E0B]">
                      {isVi ? 'Bài học' : 'Takeaway'}
                    </div>
                    <p className="text-[11px] text-[#A5AFBF] leading-relaxed mt-0.5">
                      {isVi
                        ? 'Độ khó càng cao, không gian nghiệm hợp lệ càng thu hẹp, đòi hỏi năng lượng và thời gian tính toán PoW tăng theo cấp số nhân.'
                        : 'Higher difficulty exponentially shrinks the valid hash target space, requiring substantially more computational work.'}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleRunChallenge('difficulty')}
                disabled={isRacing}
                className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isRacing
                    ? 'bg-[#0F131A] text-[#717B8C] border border-[#1C2430] cursor-not-allowed opacity-50'
                    : 'bg-[rgba(0,201,141,0.08)] hover:bg-[rgba(0,201,141,0.15)] text-[#00C98D] border border-[rgba(0,201,141,0.35)] active:scale-95'
                }`}
              >
                <Play className="w-3 h-3 text-[#00C98D] fill-[#00C98D]" />
                <span>{isVi ? 'Chạy kịch bản' : 'Run scenario'}</span>
              </button>
            </div>
          </div>

          {/* Challenge 4: 51% Attack */}
          <div
            className={`p-5 rounded-lg border flex flex-col justify-between transition-all ${
              activeChallenge === 'attack51'
                ? 'bg-[rgba(245,158,11,0.06)] border-[#F59E0B] shadow-sm'
                : 'bg-[#0F131A] border-[#1C2430]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#717B8C]">04</span>
                <span className="text-[10px] font-mono text-[#F59E0B] px-2 py-0.5 bg-[#090A0F] rounded border border-[#1C2430]">
                  {isVi ? 'Nâng cao · >50%' : 'Advanced · >50%'}
                </span>
              </div>

              <div className="text-sm font-bold text-[#F2F4F7] font-mono mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
                <span>{isVi ? 'Tấn công 51%' : '51% Attack'}</span>
              </div>

              <p className="text-xs text-[#A5AFBF] leading-relaxed mb-4">
                {isVi
                  ? 'Chuyện gì xảy ra khi 1 thợ đào nắm giữ hơn 50% sức mạnh tính toán toàn mạng?'
                  : 'What happens when 1 miner controls over 50% of the entire network hashrate?'}
              </p>
            </div>

            <div>
              {activeChallenge === 'attack51' && isRacing && (
                <div className="mb-3 p-2 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.35)] rounded-md text-[11px] font-mono text-[#F59E0B] flex items-center gap-1.5 animate-pulse">
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{isVi ? 'Đang chạy mô phỏng...' : 'Simulation running...'} ({timeLeft}s)</span>
                </div>
              )}

              {activeChallenge === 'attack51' && isGameOver && (
                <div className="mb-3 p-3 bg-[#090A0F] border border-[rgba(245,158,11,0.35)] rounded-lg text-xs space-y-2 animate-in fade-in">
                  <div>
                    <div className="text-[10px] font-mono font-semibold text-[#F59E0B]">
                      {isVi ? 'Kết quả' : 'Result'}
                    </div>
                    <div className="text-[11px] text-[#F2F4F7] mt-0.5">
                      {singleWinner
                        ? isVi
                          ? `${singleWinner.name} áp đảo và tạo chuỗi dài nhất (${singleWinner.chain.length} khối).`
                          : `${singleWinner.name} dominated and formed the longest chain (${singleWinner.chain.length} blocks).`
                        : isVi
                        ? `Toàn mạng đã tạo ${maxBlocks} khối.`
                        : `Network mined ${maxBlocks} blocks.`}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1C2430]">
                    <div className="text-[10px] font-mono font-semibold text-[#F59E0B]">
                      {isVi ? 'Bài học' : 'Takeaway'}
                    </div>
                    <p className="text-[11px] text-[#A5AFBF] leading-relaxed mt-0.5">
                      {isVi
                        ? 'Khi nắm >50% hashrate, thợ đào có xác suất áp đảo để liên tục tạo chuỗi dài nhất và chi phối sổ cái.'
                        : 'Controlling >50% hashrate allows a miner to statistically out-produce the honest network and dominate the Longest Chain Rule.'}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleRunChallenge('attack51')}
                disabled={isRacing}
                className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isRacing
                    ? 'bg-[#0F131A] text-[#717B8C] border border-[#1C2430] cursor-not-allowed opacity-50'
                    : 'bg-[rgba(245,158,11,0.08)] hover:bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border border-[rgba(245,158,11,0.35)] active:scale-95'
                }`}
              >
                <Play className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                <span>{isVi ? 'Chạy kịch bản' : 'Run scenario'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Technical Details Accordion */}
      <div className="bg-[#0C0F14] border border-[#1C2430] rounded-xl p-6 font-sans shadow-sm">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between text-xs font-mono font-medium text-[#A5AFBF] hover:text-[#F2F4F7] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#00C98D]" />
            <span>
              {isVi
                ? showTechnicalDetails
                  ? t.proofOfWork?.technicalDetailsHide || 'Ẩn chi tiết kỹ thuật'
                  : t.proofOfWork?.technicalDetailsShow || 'Xem chi tiết kỹ thuật & mã nguồn'
                : showTechnicalDetails
                ? t.proofOfWork?.technicalDetailsHide || 'Hide technical details'
                : t.proofOfWork?.technicalDetailsShow || 'View technical details & source code'}
            </span>
          </div>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechnicalDetails && (
          <div className="mt-6 pt-5 border-t border-[#1C2430] space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 bg-[#090A0F] border border-[#1C2430] rounded-lg">
                <span className="text-[10px] text-[#717B8C] block mb-1">Target Boundary (Hex)</span>
                <div className="text-[#00C98D] font-semibold break-all text-[11px]">
                  {'0'.repeat(difficulty)}{'f'.repeat(Math.max(0, 16 - difficulty))}...
                </div>
              </div>

              <div className="p-3 bg-[#090A0F] border border-[#1C2430] rounded-lg">
                <span className="text-[10px] text-[#717B8C] block mb-1">Poisson Process Model</span>
                <div className="text-[#00C98D] font-semibold text-[11px]">Δt = -ln(U) / (R_total / D)</div>
              </div>

              <div className="p-3 bg-[#090A0F] border border-[#1C2430] rounded-lg">
                <span className="text-[10px] text-[#717B8C] block mb-1">Worker Architecture</span>
                <div className="text-[#F2F4F7] font-semibold text-[11px]">
                  Web Worker Offloaded Engine
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#090A0F] border border-[#1C2430] rounded-lg font-mono text-xs">
              <span className="text-xs font-semibold text-[#00C98D] block mb-2">
                {isVi ? 'Công thức ghép tiêu đề khối (Block Header):' : 'Candidate block header hash composition:'}
              </span>
              <code className="text-[#F2F4F7] bg-[#0F131A] p-2.5 border border-[#1C2430] rounded-md block break-all text-[11px]">
                SHA-256( Version + BlockNumber + previousHash + MerkleRoot + Timestamp + Difficulty + Nonce + MinerID ) &lt; Target
              </code>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsCodeModalOpen(true)}
                className="px-4 py-2 bg-[#0F131A] hover:bg-[#11161E] text-[#00C98D] border border-[rgba(0,201,141,0.35)] rounded-lg font-mono text-xs font-medium flex items-center gap-2 cursor-pointer transition-all"
              >
                <Code2 className="w-4 h-4 text-[#00C98D]" />
                <span>{t.proofOfWork?.viewSourceCode || (isVi ? 'Xem mã nguồn Python & TypeScript' : 'View Python & TS Source Code')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Code Modal */}
      <SimulationCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        activeExecutionState={isGameOver ? 'winner' : isRacing ? 'mining' : 'idle'}
      />
    </section>
  );
};
