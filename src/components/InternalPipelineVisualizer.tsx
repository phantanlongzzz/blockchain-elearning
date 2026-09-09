import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Binary, Layers, LayoutGrid, Network, Key, Cpu, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { computeDetailedSha256 } from '../utils/sha256';
import { Step1BinaryConversion } from './pipeline/Step1BinaryConversion';
import { Step2Padding } from './pipeline/Step2Padding';
import { Step3SixteenWords } from './pipeline/Step3SixteenWords';
import { Step4MessageSchedule } from './pipeline/Step4MessageSchedule';
import { Step5ConstantsAndState } from './pipeline/Step5ConstantsAndState';
import { Sha256RoundSimulator } from './Sha256RoundSimulator';
import { Step7FeedForwardDigest } from './pipeline/Step7FeedForwardDigest';

export type PipelineStepId =
  | 'binary'
  | 'padding'
  | 'words16'
  | 'schedule'
  | 'constants'
  | 'compression'
  | 'output';

export const InternalPipelineVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Default to "ABCD" as highlighted in the video source
  const [pipelineInput, setPipelineInput] = useState<string>('ABCD');
  const [activeStep, setActiveStep] = useState<PipelineStepId>('binary');

  // Compute breakdown dynamically for current message
  const breakdown = useMemo(() => {
    try {
      return computeDetailedSha256(pipelineInput || 'ABCD');
    } catch {
      return computeDetailedSha256('ABCD');
    }
  }, [pipelineInput]);

  const block0 = breakdown.blocks[0];

  // 7 Logical Steps Definition
  const steps: {
    id: PipelineStepId;
    num: number;
    titleVi: string;
    titleEn: string;
    shortVi: string;
    shortEn: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'binary',
      num: 1,
      titleVi: '1. Chuyển sang Nhị phân',
      titleEn: '1. Binary Conversion',
      shortVi: 'Mã ASCII 8-bit',
      shortEn: '8-bit ASCII',
      icon: Binary,
    },
    {
      id: 'padding',
      num: 2,
      titleVi: '2. Đệm Bit & Độ dài',
      titleEn: '2. Bit Padding',
      shortVi: 'Khối 512-bit',
      shortEn: '512-bit block',
      icon: Layers,
    },
    {
      id: 'words16',
      num: 3,
      titleVi: '3. Chia 16 Word (32-bit)',
      titleEn: '3. 16 Words Split',
      shortVi: 'W[0] … W[15]',
      shortEn: 'W[0] … W[15]',
      icon: LayoutGrid,
    },
    {
      id: 'schedule',
      num: 4,
      titleVi: '4. Mở rộng 64 Word',
      titleEn: '4. Schedule Expansion',
      shortVi: 'W[16] … W[63]',
      shortEn: 'W[16] … W[63]',
      icon: Network,
    },
    {
      id: 'constants',
      num: 5,
      titleVi: '5. Hằng số H & K',
      titleEn: '5. Constants & State',
      shortVi: 'Biến A…H',
      shortEn: 'A…H state',
      icon: Key,
    },
    {
      id: 'compression',
      num: 6,
      titleVi: '6. 64 Vòng Nén',
      titleEn: '6. Compression Loop',
      shortVi: 'Dịch • Trộn • Cập nhật',
      shortEn: 'Shift • Mix • Update',
      icon: Cpu,
    },
    {
      id: 'output',
      num: 7,
      titleVi: '7. Xuất Mã Băm Hex',
      titleEn: '7. Feed-Forward & Hex',
      shortVi: 'Chuỗi 64 ký tự Hex',
      shortEn: '64-hex 256-bit',
      icon: CheckCircle2,
    },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === activeStep);

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setActiveStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setActiveStep(steps[currentStepIndex + 1].id);
    }
  };

  return (
    <section id="pipeline" className="py-12 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 font-sans">
          <div className="flex items-center justify-center gap-2 text-sky-400 text-xs tracking-wider uppercase mb-2.5 font-semibold font-sans">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>{isVi ? 'Kiến trúc Mật mã học Chuẩn FIPS 180-4' : 'NIST FIPS 180-4 Standard Architecture'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans mb-3">
            {isVi ? '7 BƯỚC LOGIC CỐT LÕI CỦA THUẬT TOÁN SHA-256' : 'THE 7 CORE LOGICAL STEPS OF SHA-256'}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            {isVi
              ? 'Khám phá trực quan toàn bộ hành trình chuyển hóa thông điệp qua 7 bước: từ nhị phân thô, đệm khối 512 bit, mở rộng 64 từ, 64 vòng lặp nén đến mã băm 256-bit hoàn chỉnh.'
              : 'Inspect the full cryptographic journey across 7 logical steps: from raw binary conversion, 512-bit padding, message expansion, 64 compression rounds to the final 256-bit digest.'}
          </p>
        </div>

        {/* Universal Input & Presets Bar */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-sm font-sans shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-200 font-semibold font-sans whitespace-nowrap text-sm">
              {isVi ? 'Thông điệp đầu vào:' : 'Input Message:'}
            </span>
            <input
              type="text"
              id="pipeline-test-input"
              value={pipelineInput}
              onChange={(e) => setPipelineInput(e.target.value)}
              placeholder="ABCD"
              className="bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 w-44 font-mono text-sm font-bold"
            />
            <div className="flex items-center gap-1">
              {['ABCD', 'abc', 'hello'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPipelineInput(preset)}
                  className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all cursor-pointer ${
                    pipelineInput === preset
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  &ldquo;{preset}&rdquo;
                </button>
              ))}
            </div>
          </div>

          <div className="text-slate-300 flex flex-wrap items-center gap-4 sm:gap-6 font-sans text-xs sm:text-sm">
            <span>
              {isVi ? 'Độ dài gốc:' : 'Original Length:'}{' '}
              <strong className="text-white font-mono font-bold ml-1">{breakdown.originalBitsLength} bit</strong>
            </span>
            <span>
              {isVi ? 'Độ dài sau đệm:' : 'Padded Length:'}{' '}
              <strong className="text-emerald-400 font-mono font-bold ml-1">{breakdown.paddedBitsLength} bit</strong>
            </span>
            <span>
              {isVi ? 'Phân đoạn khối:' : 'Blocks:'}{' '}
              <strong className="text-sky-400 font-mono font-bold ml-1">{breakdown.blockCount} × 512 bit</strong>
            </span>
          </div>
        </div>

        {/* 7-Step Navigation Bar (Responsive Stepper) */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              {isVi ? 'Quy trình 7 bước (Chọn bước hoặc bấm Trước / Tiếp):' : '7-Step Pipeline (Click step or use Prev / Next):'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{isVi ? 'Trước' : 'Prev'}</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={currentStepIndex === steps.length - 1}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg border border-sky-500/50 bg-sky-950/60 text-sky-300 hover:bg-sky-900/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors font-semibold"
              >
                <span>{isVi ? 'Tiếp' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {steps.map((step, idx) => {
              const isActive = activeStep === step.id;
              const isPast = idx < currentStepIndex;
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  id={`btn-step-${step.id}`}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden font-sans ${
                    isActive
                      ? 'bg-slate-900 border-sky-500 ring-2 ring-sky-500/30 text-white shadow-md'
                      : isPast
                        ? 'bg-slate-950/90 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                        : 'bg-slate-950/50 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                        isActive
                          ? 'bg-sky-500 text-white'
                          : isPast
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600/50'
                            : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {step.num}
                    </span>
                    <StepIcon
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-sky-400' : isPast ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <span className="font-bold text-xs block truncate text-white">
                    {isVi ? step.titleVi : step.titleEn}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                    {isVi ? step.shortVi : step.shortEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE STEP CONTAINER */}
        <div>
          {/* STEP 1: BINARY CONVERSION */}
          {activeStep === 'binary' && (
            <Step1BinaryConversion
              input={pipelineInput}
              onInputChange={(val) => setPipelineInput(val)}
              isVi={isVi}
            />
          )}

          {/* STEP 2: BIT PADDING */}
          {activeStep === 'padding' && (
            <Step2Padding
              input={pipelineInput}
              breakdown={breakdown}
              isVi={isVi}
            />
          )}

          {/* STEP 3: 16 WORDS SPLIT */}
          {activeStep === 'words16' && (
            <Step3SixteenWords
              input={pipelineInput}
              w={block0?.w || []}
              paddedBytes={breakdown.paddedMessageBytes}
              isVi={isVi}
            />
          )}

          {/* STEP 4: MESSAGE SCHEDULE EXPANSION */}
          {activeStep === 'schedule' && (
            <Step4MessageSchedule
              w={block0?.w || []}
              isVi={isVi}
            />
          )}

          {/* STEP 5: CONSTANTS & INITIAL STATE */}
          {activeStep === 'constants' && (
            <Step5ConstantsAndState
              isVi={isVi}
            />
          )}

          {/* STEP 6: 64 COMPRESSION ROUNDS */}
          {activeStep === 'compression' && block0?.rounds && (
            <div className="space-y-4 font-sans">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 text-sky-400 text-xs uppercase font-bold tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span>{isVi ? 'Bước 6 / 7 trong thuật toán' : 'Step 6 / 7 in Algorithm'}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {isVi ? 'Bước 6: Vòng lặp nén 64 bước (Compression Loop)' : 'Step 6: 64 Compression Rounds Loop'}
                </h3>
                <p className="leading-relaxed">
                  {isVi
                    ? 'Mỗi vòng thực hiện đúng 3 bước trực quan: 1. Dịch → 2. Trộn → 3. Tạo trạng thái mới. Nhấn "Xem chi tiết" để khám phá toàn bộ công thức T₁, T₂, Σ, Ch, Maj.'
                    : 'Each round executes 3 visual steps: 1. Shift → 2. Mix → 3. New State. Click "View Details" to explore formulas for T₁, T₂, Σ, Ch, Maj.'}
                </p>
              </div>

              <Sha256RoundSimulator
                rounds={block0.rounds}
                onFeedForward={() => setActiveStep('output')}
                isVi={isVi}
              />
            </div>
          )}

          {/* STEP 7: FEED-FORWARD & HEX DIGEST */}
          {activeStep === 'output' && (
            <Step7FeedForwardDigest
              finalHashHex={breakdown.finalHashHex}
              round63={block0?.rounds[63]}
              onReviewRounds={() => setActiveStep('compression')}
              isVi={isVi}
            />
          )}
        </div>

        {/* Bottom Next/Prev Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/80 text-xs sm:text-sm">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>
              {currentStepIndex > 0
                ? `${isVi ? 'Quay lại' : 'Back to'} ${isVi ? steps[currentStepIndex - 1].titleVi : steps[currentStepIndex - 1].titleEn}`
                : isVi
                  ? 'Bước đầu tiên'
                  : 'First Step'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            disabled={currentStepIndex === steps.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-sky-500/50 bg-sky-950/70 text-sky-300 hover:bg-sky-900/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all font-bold"
          >
            <span>
              {currentStepIndex < steps.length - 1
                ? `${isVi ? 'Tiếp tục' : 'Continue to'} ${isVi ? steps[currentStepIndex + 1].titleVi : steps[currentStepIndex + 1].titleEn}`
                : isVi
                  ? 'Đã hoàn thành'
                  : 'Completed'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
