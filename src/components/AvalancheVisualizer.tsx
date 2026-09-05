import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle2, Sparkles, Activity, Shuffle, Hash, Layers } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { hashSha256 } from '../utils/sha256';
import { calculateHammingDifference, calculateInputBitDifference } from '../utils/binary';
import { BitDiffResult } from '../types';
import { SimulationGuidePanel, GuideStep, SimulationQuestions, MicroConcept } from './common/SimulationGuidePanel';

export const AvalancheVisualizer: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';

  const [inputA, setInputA] = useState('Hello World');
  const [inputB, setInputB] = useState('Hello world');
  const [diffResult, setDiffResult] = useState<BitDiffResult | null>(null);
  const [hoveredBitIndex, setHoveredBitIndex] = useState<number | null>(null);
  const [guideMode, setGuideMode] = useState<'guided' | 'free'>('guided');
  const [guideStepIndex, setGuideStepIndex] = useState<number>(0);

  const compareHashes = useCallback(async (textA: string, textB: string) => {
    const [resA, resB] = await Promise.all([
      hashSha256(textA),
      hashSha256(textB),
    ]);

    const diff = calculateHammingDifference(resA.hex, resB.hex);
    setDiffResult(diff);
  }, []);

  useEffect(() => {
    compareHashes(inputA, inputB);
  }, [inputA, inputB, compareHashes]);

  const presets = useMemo(() => [
    {
      id: 'case-shift',
      name: 'Case Shift ("W" vs "w")',
      a: 'Hello World',
      b: 'Hello world',
      noteVi: 'Chỉ khác đúng 1 bit ở ký tự thứ 6 ("W" = 0x57 [01010111] vs "w" = 0x77 [01110111])',
      noteEn: 'Only 1 bit difference in the 6th character ("W" = 0x57 vs "w" = 0x77)',
    },
    {
      id: 'append-char',
      name: 'Append Period (".")',
      a: 'The quick brown fox jumps over the lazy dog',
      b: 'The quick brown fox jumps over the lazy dog.',
      noteVi: 'Thêm duy nhất 1 dấu chấm "." ở cuối chuỗi làm đảo ~50% toàn bộ 256 bit đầu ra',
      noteEn: 'Adding a single period "." flips ~50% of the entire 256-bit output digest',
    },
    {
      id: 'increment-digit',
      name: 'Digit Increment ("1" vs "2")',
      a: 'Blockchain0001',
      b: 'Blockchain0002',
      noteVi: 'Ký tự cuối cùng tăng từ "1" (0x31) lên "2" (0x32) tạo ra mã băm phân kỳ hoàn toàn',
      noteEn: 'Last character incremented from "1" (0x31) to "2" (0x32) triggers full hash divergence',
    },
    {
      id: 'single-bit',
      name: 'Single Bit ("0" vs "1")',
      a: '0',
      b: '1',
      noteVi: 'Biến thiên đầu vào nhỏ nhất có thể: 1 ký tự ASCII cách nhau 1 bit (0x30 vs 0x31)',
      noteEn: 'Minimal possible single-character variance: 1 bit difference (0x30 vs 0x31)',
    },
  ], []);

  const activePreset = presets.find((p) => p.a === inputA && p.b === inputB);
  const inputDiff = calculateInputBitDifference(inputA, inputB);

  // Compute hex diff statistics
  const hexDiffStats = useMemo(() => {
    if (!diffResult?.hexA || !diffResult?.hexB) return { totalHexChars: 64, changedHexChars: 0, percentHex: 0 };
    let changed = 0;
    for (let i = 0; i < 64; i++) {
      if (diffResult.hexA[i] !== diffResult.hexB[i]) {
        changed++;
      }
    }
    return {
      totalHexChars: 64,
      changedHexChars: changed,
      percentHex: (changed / 64) * 100,
    };
  }, [diffResult]);

  const avalancheSteps: GuideStep[] = [
    {
      stepNumber: 1,
      titleVi: 'Bước 1: Quan sát 2 chuỗi đầu vào gần như y hệt',
      titleEn: 'Step 1: Compare near-identical inputs',
      instructionVi: 'Thử chọn kịch bản mẫu có sẵn hoặc gõ 2 chuỗi chỉ khác nhau đúng 1 ký tự (ví dụ: "Hello World" và "Hello world").',
      instructionEn: 'Pick a sample preset or type two inputs that differ by only a single character.',
      targetActionVi: 'Bấm một trong các kịch bản mẫu phía dưới.',
      targetActionEn: 'Click one of the sample scenario pills below.',
      isCompleted: inputA !== '' && inputB !== '',
    },
    {
      stepNumber: 2,
      titleVi: 'Bước 2: Đo lường Khoảng cách Hamming (Hamming Distance)',
      titleEn: 'Step 2: Measure Hamming Distance',
      instructionVi: 'Xem bảng tổng kết tỷ lệ bit thay đổi trong 256 bit đầu ra của hàm băm SHA-256.',
      instructionEn: 'Inspect the summary metric of flipped output bits out of 256.',
      targetActionVi: 'Kiểm tra tỷ lệ phần trăm (thường xấp xỉ ~50%).',
      targetActionEn: 'Observe the percentage (ideally around 50%).',
      isCompleted: !!diffResult,
    },
    {
      stepNumber: 3,
      titleVi: 'Bước 3: Soi ma trận 256 bit (Cryptographic Heatmap)',
      titleEn: 'Step 3: Inspect 256-bit Heatmap Matrix',
      instructionVi: 'Rê chuột vào các ô sáng màu Cyan (bit bị đảo) và ô tối (bit giữ nguyên) để kiểm tra thông số nhị phân chi tiết.',
      instructionEn: 'Hover over glowing Cyan (flipped) and dark (unchanged) cells in the 256-bit matrix.',
      targetActionVi: 'Rê chuột qua lưới Heatmap 256 bit bên dưới.',
      targetActionEn: 'Hover over the 256-bit heatmap grid below.',
      isCompleted: hoveredBitIndex !== null || guideStepIndex === 2,
    },
  ];

  const avalancheQuestions: SimulationQuestions = {
    whatAmILookingAtVi: 'Bạn đang quan sát Hiệu ứng thác đổ (Avalanche Effect) - một thuộc tính mật mã học cốt lõi đảm bảo tính khuếch tán triệt để của hàm băm SHA-256.',
    whatAmILookingAtEn: 'You are observing the Avalanche Effect - a fundamental cryptographic property ensuring strict diffusion in SHA-256.',
    whatShouldIClickVi: 'Nhấp chọn các kịch bản mẫu phía dưới hoặc sửa trực tiếp 1 ký tự trong ô Đầu vào A / Đầu vào B.',
    whatShouldIClickEn: 'Select sample presets below or edit a single character in Input A / Input B.',
    whatJustHappenedVi: 'Chỉ thay đổi đúng 1 bit ở đầu vào khiến xấp xỉ ~50% (khoảng 128/256 bit) của mã băm đầu ra bị đảo lộn hoàn toàn.',
    whatJustHappenedEn: 'Flipping a single input bit caused ~50% (~128/256) of the resulting digest bits to invert unpredictably.',
    whyDidItHappenVi: '64 vòng lặp nén và các hàm phi tuyến (Ch, Maj, Σ, σ) khuếch tán từng bit đầu vào ra toàn bộ 8 biến trạng thái (a..h), ngăn chặn mọi nỗ lực suy đoán ngược.',
    whyDidItHappenEn: 'The 64 compression rounds and non-linear functions (Ch, Maj, Σ, σ) thoroughly diffuse input bits across all 8 state variables (a..h).',
  };

  const avalancheMicroConcepts: MicroConcept[] = [
    {
      term: 'Strict Avalanche Criterion (SAC)',
      explanationVi: 'Tiêu chuẩn mật mã học yêu cầu: khi 1 bit đầu vào bị đảo, mỗi bit đầu ra phải thay đổi với xác suất đúng 50%.',
      explanationEn: 'The cryptographic criterion stating that whenever a single input bit is complemented, each output bit should change with probability 50%.',
    },
    {
      term: 'Hamming Distance (Khoảng cách Hamming)',
      explanationVi: 'Số lượng vị trí bit khác nhau giữa hai chuỗi nhị phân có cùng độ dài (256 bit đối với SHA-256).',
      explanationEn: 'The number of bit positions in which two equal-length binary strings differ (256 bits for SHA-256).',
    },
    {
      term: 'Diffusion (Tính khuếch tán)',
      explanationVi: 'Cơ chế phân tán cấu trúc thống kê và sự phụ thuộc của bản rõ ra toàn bộ không gian mã băm đầu ra.',
      explanationEn: 'The mechanism spreading statistical patterns of the plaintext across the entire output digest space.',
    },
  ];

  return (
    <section id="avalanche" className="py-12 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teach-1/10 border border-teach-1/25 text-teach-1 text-xs font-mono font-semibold tracking-wider uppercase mb-3 shadow-[0_0_12px_rgba(0,210,255,0.15)]">
            <Activity className="w-3.5 h-3.5" />
            <span>{strings.avalanche.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F4F5] tracking-tight font-sans mb-2">
            {strings.avalanche.title}
          </h2>
          <p className="text-sm text-[#A1A1AA] leading-relaxed font-sans">
            {strings.avalanche.description}
          </p>
        </div>

        {/* Guided vs Free Mode & Questions Panel */}
        <SimulationGuidePanel
          mode={guideMode}
          onModeChange={setGuideMode}
          currentStepIndex={guideStepIndex}
          steps={avalancheSteps}
          onNextStep={() => setGuideStepIndex((prev) => Math.min(2, prev + 1))}
          onPrevStep={() => setGuideStepIndex((prev) => Math.max(0, prev - 1))}
          onResetGuide={() => {
            setGuideStepIndex(0);
            setInputA('Hello World');
            setInputB('Hello world');
          }}
          questions={avalancheQuestions}
          microConcepts={avalancheMicroConcepts}
          badgeTextVi="HIỆU ỨNG THÁC ĐỔ (AVALANCHE EFFECT)"
          badgeTextEn="AVALANCHE EFFECT VISUALIZER"
        />

        {/* Preset Selector - Segmented Pill Switcher */}
        <div className="flex flex-col items-center gap-2.5 mb-6">
          <div className="p-1 bg-[#070A12]/90 border border-white/[0.08] rounded-xl flex flex-wrap items-center justify-center gap-1 shadow-inner">
            <span className="text-[11px] font-mono text-[#71717A] px-2.5 py-1 uppercase tracking-wider font-semibold">
              {strings.avalanche.comparePresets}:
            </span>
            {presets.map((preset) => {
              const isActive = inputA === preset.a && inputB === preset.b;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setInputA(preset.a);
                    setInputB(preset.b);
                  }}
                  className={`text-xs font-mono px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-teach-1/15 text-teach-1 border-teach-1/40 shadow-[0_0_12px_rgba(0,210,255,0.2)] font-semibold'
                      : 'bg-transparent text-[#A1A1AA] hover:text-[#F4F4F5] border-transparent hover:bg-white/[0.04]'
                  }`}
                >
                  <Shuffle className={`w-3 h-3 ${isActive ? 'text-teach-1' : 'text-[#71717A]'}`} />
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Preset Note Banner */}
          {activePreset && (
            <div className="text-xs font-mono text-[#A1A1AA] bg-[#070A12]/60 border border-white/[0.06] px-4 py-1.5 rounded-full flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-teach-1 shrink-0" />
              <span>{isVi ? activePreset.noteVi : activePreset.noteEn}</span>
            </div>
          )}
        </div>

        {/* Dual Input and Hash Comparison Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Side A - Sky Blue / Cyan (teach-1) */}
          <div className="rounded-2xl bg-[#0B0F19]/60 backdrop-blur-md border border-teach-1/25 p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.35)] relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teach-1 shadow-[0_0_8px_rgba(0,210,255,0.6)]" />
                <span className="text-xs font-mono font-bold text-teach-1 uppercase tracking-wider">
                  {strings.avalanche.inputA}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#71717A]">
                {inputA.length} {strings.hashGenerator.lengthChars} · {new TextEncoder().encode(inputA).length * 8} {strings.hashGenerator.lengthBits}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="avalanche-input-a" className="sr-only">Input A</label>
                <input
                  id="avalanche-input-a"
                  type="text"
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                  className="w-full bg-[#070A12] border border-teach-1/30 rounded-xl px-4 py-2.5 text-sm sm:text-base font-mono text-[#F4F4F5] placeholder-[#52525B] focus:outline-none focus:border-teach-1 focus:ring-1 focus:ring-teach-1/50 transition-all"
                  placeholder="Enter original input text..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-[#A1A1AA] uppercase font-semibold">
                    {strings.avalanche.digestA}
                  </span>
                  <span className="text-[10px] font-mono text-teach-1/80">
                    256 bits · 64 hex nibbles
                  </span>
                </div>

                {/* Hex Display with Diff Highlighting */}
                <div className="p-3.5 rounded-xl bg-[#070A12] border border-teach-1/20 font-mono text-xs sm:text-[13px] text-[#F4F4F5] break-all select-all leading-relaxed tracking-wider shadow-inner">
                  {diffResult?.hexA ? (
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      {Array.from({ length: 8 }).map((_, wordIdx) => (
                        <span key={wordIdx} className="inline-flex">
                          {Array.from({ length: 8 }).map((_, charIdx) => {
                            const globalIdx = wordIdx * 8 + charIdx;
                            const charA = diffResult.hexA[globalIdx];
                            const charB = diffResult.hexB?.[globalIdx];
                            const isDifferent = charA !== charB;

                            return (
                              <span
                                key={globalIdx}
                                className={`transition-colors ${
                                  isDifferent
                                    ? 'text-teach-1 bg-teach-1/10 rounded-[2px] font-bold px-[1px]'
                                    : 'text-[#71717A] opacity-60'
                                }`}
                                title={`Hex #${globalIdx}: '${charA}' ${isDifferent ? `(Differs from B: '${charB}')` : '(Matching)'}`}
                              >
                                {charA}
                              </span>
                            );
                          })}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#52525B]">Calculating...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Side B - Violet / Purple (teach-2 / purple-400) */}
          <div className="rounded-2xl bg-[#0B0F19]/60 backdrop-blur-md border border-purple-500/25 p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.35)] relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                  {strings.avalanche.inputB}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#71717A]">
                {inputB.length} {strings.hashGenerator.lengthChars} · {new TextEncoder().encode(inputB).length * 8} {strings.hashGenerator.lengthBits}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="avalanche-input-b" className="sr-only">Input B</label>
                <input
                  id="avalanche-input-b"
                  type="text"
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  className="w-full bg-[#070A12] border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm sm:text-base font-mono text-[#F4F4F5] placeholder-[#52525B] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all"
                  placeholder="Enter modified input text..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-[#A1A1AA] uppercase font-semibold">
                    {strings.avalanche.digestB}
                  </span>
                  <span className="text-[10px] font-mono text-purple-400/80">
                    256 bits · 64 hex nibbles
                  </span>
                </div>

                {/* Hex Display with Diff Highlighting */}
                <div className="p-3.5 rounded-xl bg-[#070A12] border border-purple-500/20 font-mono text-xs sm:text-[13px] text-[#F4F4F5] break-all select-all leading-relaxed tracking-wider shadow-inner">
                  {diffResult?.hexB ? (
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      {Array.from({ length: 8 }).map((_, wordIdx) => (
                        <span key={wordIdx} className="inline-flex">
                          {Array.from({ length: 8 }).map((_, charIdx) => {
                            const globalIdx = wordIdx * 8 + charIdx;
                            const charB = diffResult.hexB[globalIdx];
                            const charA = diffResult.hexA?.[globalIdx];
                            const isDifferent = charA !== charB;

                            return (
                              <span
                                key={globalIdx}
                                className={`transition-colors ${
                                  isDifferent
                                    ? 'text-purple-300 bg-purple-500/15 rounded-[2px] font-bold px-[1px]'
                                    : 'text-[#71717A] opacity-60'
                                }`}
                                title={`Hex #${globalIdx}: '${charB}' ${isDifferent ? `(Differs from A: '${charA}')` : '(Matching)'}`}
                              >
                                {charB}
                              </span>
                            );
                          })}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#52525B]">Calculating...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Central Bit Difference & Hamming Distance Metrics Banner */}
        {diffResult && (
          <div className="rounded-2xl bg-[#0B0F19]/60 backdrop-blur-md border border-white/[0.08] p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.35)] mb-6 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
              {/* Metric 1: Hamming Distance */}
              <div className="border-b md:border-b-0 md:border-r border-white/[0.06] pb-5 md:pb-0 md:pr-6">
                <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider block mb-1 font-semibold">
                  {strings.avalanche.hammingDistance}
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-[#F4F4F5]">
                  <span className="text-teach-1">{diffResult.changedBits}</span>{' '}
                  <span className="text-base font-normal text-[#71717A] font-sans">/ 256 bits</span>
                </div>
                <p className="text-xs text-[#71717A] mt-1.5 font-mono">
                  Input diff: <span className="text-teach-1 font-semibold">{inputDiff.changedBits} bit{inputDiff.changedBits === 1 ? '' : 's'}</span> ({inputDiff.percentage.toFixed(1)}%)
                </p>
              </div>

              {/* Metric 2: Avalanche Percentage */}
              <div className="border-b md:border-b-0 md:border-r border-white/[0.06] pb-5 md:pb-0 md:pr-6">
                <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider block mb-1 font-semibold">
                  {strings.avalanche.avalanchePercentage}
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-teach-1">
                  <span>{diffResult.percentage.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-1.5 font-mono">
                  {strings.avalanche.targetIdeal}
                </p>
              </div>

              {/* Metric 3: Strict Avalanche Criterion (SAC) Verification */}
              <div>
                <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider block mb-1 font-semibold">
                  {strings.avalanche.statusTitle}
                </span>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-base sm:text-lg font-bold font-sans text-success">
                    {strings.avalanche.statusConfirmed}
                  </span>
                </div>
                <p className="text-xs text-[#71717A] mt-1.5 font-sans leading-relaxed">
                  {hexDiffStats.changedHexChars}/64 hex ({hexDiffStats.percentHex.toFixed(1)}%) · {strings.avalanche.statusExplanation}
                </p>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-6 pt-6 border-t border-white/[0.06] font-sans">
              <div className="flex justify-between text-xs text-[#71717A] font-mono mb-2">
                <span>{strings.avalanche.noChange}</span>
                <span className="text-teach-1 font-semibold">
                  {diffResult.changedBits} / 256 Bits Flipped ({diffResult.percentage.toFixed(1)}%)
                </span>
                <span>{strings.avalanche.fullInversion}</span>
              </div>
              <div className="w-full h-3 bg-[#070A12] rounded-full overflow-hidden border border-white/[0.08] p-0.5 relative">
                {/* 50% ideal reference line */}
                <div
                  className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/30 z-10"
                  title="50% Strict Avalanche Reference"
                />
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400 shadow-[0_0_12px_rgba(0,210,255,0.4)] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, diffResult.percentage))}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 256-Bit Cryptographic Heatmap Matrix */}
        {diffResult && (
          <div className="rounded-2xl bg-[#0B0F19]/60 backdrop-blur-md border border-white/[0.08] p-5 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.35)] font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-teach-1" />
                  <span className="text-xs font-mono font-bold text-[#F4F4F5] uppercase tracking-wider">
                    {strings.avalanche.matrixTitle}
                  </span>
                </div>
                <p className="text-xs text-[#71717A] mt-1 font-sans">
                  {strings.avalanche.matrixDesc}
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-[3px] bg-teach-1 shadow-[0_0_8px_rgba(0,210,255,0.5)] inline-block" />
                  <span className="text-[#F4F4F5]">{strings.avalanche.flippedBit} (<strong className="text-teach-1">{diffResult.changedBits}</strong>)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-[3px] bg-white/[0.04] border border-white/[0.08] inline-block" />
                  <span className="text-[#71717A]">{strings.avalanche.unchangedBit} (<strong className="text-[#A1A1AA]">{256 - diffResult.changedBits}</strong>)</span>
                </div>
              </div>
            </div>

            {/* 256 Heatmap Grid Cells */}
            <div className="grid grid-cols-16 sm:grid-cols-32 gap-1 sm:gap-1.5 p-4 sm:p-5 bg-[#070A12]/90 rounded-xl border border-white/[0.06] shadow-inner">
              {Array.from({ length: 256 }).map((_, idx) => {
                const isFlipped = diffResult.diffIndices.includes(idx);
                const bitA = diffResult.bitsA[idx];
                const bitB = diffResult.bitsB[idx];
                const isHovered = hoveredBitIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredBitIndex(idx)}
                    onMouseLeave={() => setHoveredBitIndex(null)}
                    className={`w-full aspect-square rounded-[3px] transition-all duration-150 cursor-pointer relative ${
                      isHovered
                        ? 'scale-150 z-30 ring-2 ring-white shadow-[0_0_16px_rgba(255,255,255,0.5)]'
                        : ''
                    } ${
                      isFlipped
                        ? 'bg-teach-1 shadow-[0_0_6px_rgba(0,210,255,0.35)] hover:shadow-[0_0_12px_rgba(0,210,255,0.7)]'
                        : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/20'
                    }`}
                    title={`Bit #${String(idx).padStart(3, '0')} | Hash A: ${bitA} • Hash B: ${bitB} | [${isFlipped ? (isVi ? 'ĐÃ ĐẢO BIT' : 'FLIPPED') : (isVi ? 'GIỮ NGUYÊN' : 'UNCHANGED')}]`}
                  />
                );
              })}
            </div>

            {/* Interactive Telemetry Inspector Bar */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#070A12] border border-white/[0.06] text-xs font-mono flex flex-wrap items-center justify-between gap-3 text-[#A1A1AA]">
              {hoveredBitIndex !== null ? (
                <>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-teach-1" />
                    <span>
                      {strings.avalanche.inspectingBit}<strong className="text-[#F4F4F5] text-sm">{String(hoveredBitIndex).padStart(3, '0')}</strong>
                    </span>
                    <span className="text-[#71717A] text-[11px]">
                      (Byte {Math.floor(hoveredBitIndex / 8)}, Word H{Math.floor(hoveredBitIndex / 32)})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 font-mono">
                    <span>
                      Digest A: <strong className="text-teach-1">{diffResult.bitsA[hoveredBitIndex]}</strong>
                    </span>
                    <span className="text-[#52525B]">•</span>
                    <span>
                      Digest B: <strong className="text-purple-400">{diffResult.bitsB[hoveredBitIndex]}</strong>
                    </span>
                    <span className="text-[#52525B]">•</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider ${
                        diffResult.diffIndices.includes(hoveredBitIndex)
                          ? 'bg-teach-1/15 text-teach-1 border border-teach-1/30 shadow-[0_0_8px_rgba(0,210,255,0.2)]'
                          : 'bg-white/5 text-[#71717A] border border-white/10'
                      }`}
                    >
                      {diffResult.diffIndices.includes(hoveredBitIndex)
                        ? `[${strings.avalanche.flippedStatus}]`
                        : `[${strings.avalanche.unchangedStatus}]`}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-[#71717A]">
                  <Activity className="w-3.5 h-3.5 text-teach-1/60 animate-pulse" />
                  <span>{strings.avalanche.hoverPrompt}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
