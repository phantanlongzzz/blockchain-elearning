import React, { useState, useMemo } from 'react';
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

interface StepDef {
  id: PipelineStepId;
  labelVi: string;
  labelEn: string;
}

const STEPS: StepDef[] = [
  { id: 'binary', labelVi: '1. Nhị phân', labelEn: '1. Binary' },
  { id: 'padding', labelVi: '2. Đệm bit', labelEn: '2. Padding' },
  { id: 'words16', labelVi: '3. 16 Word', labelEn: '3. 16 Words' },
  { id: 'schedule', labelVi: '4. Mở rộng', labelEn: '4. Schedule' },
  { id: 'constants', labelVi: '5. Hằng số', labelEn: '5. Constants' },
  { id: 'compression', labelVi: '6. 64 Vòng nén', labelEn: '6. 64 Rounds' },
  { id: 'output', labelVi: '7. Xuất Hex', labelEn: '7. Hex Output' },
];

export const InternalPipelineVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

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
  const currentStepIndex = STEPS.findIndex((s) => s.id === activeStep);

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setActiveStep(STEPS[currentStepIndex - 1].id);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setActiveStep(STEPS[currentStepIndex + 1].id);
    }
  };

  return (
    <section id="pipeline" className="py-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header - Clean, zero marketing fluff */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isVi ? 'Quy trình 7 bước của SHA-256' : 'The 7 Steps of SHA-256'}
          </h2>
          <p className="text-sm text-slate-400">
            {isVi
              ? 'Mô phỏng từng bước từ chuỗi văn bản đầu vào đến giá trị băm 256-bit cuối cùng.'
              : 'Step-by-step visual simulation from raw text input to final 256-bit hash digest.'}
          </p>
        </div>

        {/* Input & Presets Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-300 font-medium">
              {isVi ? 'Đầu vào thử nghiệm:' : 'Test input:'}
            </span>
            <input
              type="text"
              id="pipeline-test-input"
              value={pipelineInput}
              onChange={(e) => setPipelineInput(e.target.value)}
              placeholder="ABCD"
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-sky-500 w-36"
            />
            <div className="flex items-center gap-1">
              {['ABCD', 'abc', 'hello'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPipelineInput(preset)}
                  className={`text-xs px-2 py-1 rounded border font-mono cursor-pointer transition-colors ${
                    pipelineInput === preset
                      ? 'bg-slate-800 border-slate-600 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  &ldquo;{preset}&rdquo;
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {breakdown.originalBitsLength} bits &rarr; {breakdown.paddedBitsLength} bits
          </div>
        </div>

        {/* 7-Step Navigation Bar - Clean, flat segmented tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isVi ? 'Tiến trình thực hiện:' : 'Algorithm progression:'}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="px-2.5 py-1 rounded border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {isVi ? '← Trước' : '← Prev'}
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={currentStepIndex === STEPS.length - 1}
                className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {isVi ? 'Tiếp theo →' : 'Next →'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {STEPS.map((step, idx) => {
              const isActive = activeStep === step.id;
              const isPast = idx < currentStepIndex;

              return (
                <button
                  key={step.id}
                  id={`btn-step-${step.id}`}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`py-2 px-2.5 rounded-lg border text-center text-xs font-medium cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-800 border-sky-500 text-white font-bold'
                      : isPast
                        ? 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="block truncate">
                    {isVi ? step.labelVi : step.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE STEP CONTENT */}
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
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-1">
                <h3 className="text-lg font-bold text-white">
                  {isVi ? 'Bước 6: Vòng lặp nén 64 bước (Compression Loop)' : 'Step 6: 64-Round Compression Loop'}
                </h3>
                <p className="text-sm text-slate-300">
                  {isVi
                    ? 'Mỗi vòng nén diễn ra qua đúng 3 bước: 1. Dịch → 2. Trộn → 3. Tạo trạng thái mới. Sử dụng nút "Xem chi tiết" để xem công thức toán học nếu cần.'
                    : 'Each round operates in 3 steps: 1. Shift → 2. Mix → 3. New State. Use "View Details" for the mathematical formulas.'}
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

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          >
            {isVi ? '← Bước trước' : '← Previous step'}
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            disabled={currentStepIndex === STEPS.length - 1}
            className="text-sky-400 hover:text-sky-300 font-medium disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          >
            {isVi ? 'Bước tiếp theo →' : 'Next step →'}
          </button>
        </div>
      </div>
    </section>
  );
};
