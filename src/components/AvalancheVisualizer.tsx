import React, { useState, useEffect, useCallback } from 'react';
import { GitCompare, Sparkles, RefreshCw, Zap, Binary, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { hashSha256 } from '../utils/sha256';
import { calculateHammingDifference, calculateInputBitDifference } from '../utils/binary';
import { BitDiffResult } from '../types';
import { SimulationGuidePanel, GuideStep, SimulationQuestions, MicroConcept } from './common/SimulationGuidePanel';

export const AvalancheVisualizer: React.FC = () => {
  const { strings } = useLanguage();
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

  const presets = [
    {
      name: 'Case Shift ("W" vs "w")',
      a: 'Hello World',
      b: 'Hello world',
      note: 'Only 1 bit difference in the 6th character (0x57 vs 0x77)',
    },
    {
      name: 'Single Character Append',
      a: 'The quick brown fox jumps over the lazy dog',
      b: 'The quick brown fox jumps over the lazy dog.',
      note: 'Adding a single period "." flips ~50% of the entire 256-bit digest',
    },
    {
      name: 'Single Digit Increment',
      a: 'Blockchain0001',
      b: 'Blockchain0002',
      note: 'Last character "1" (0x31) changed to "2" (0x32)',
    },
    {
      name: 'Single Bit Toggle ("0" vs "1")',
      a: '0',
      b: '1',
      note: 'Smallest possible single-character variance',
    },
  ];

  const inputDiff = calculateInputBitDifference(inputA, inputB);

  const avalancheSteps: GuideStep[] = [
    {
      stepNumber: 1,
      titleVi: 'Bước 1: Quan sát 2 chuỗi đầu vào gần như y hệt',
      titleEn: 'Step 1: Compare near-identical inputs',
      instructionVi: 'Thử chọn mẫu có sẵn hoặc gõ 2 chuỗi chỉ khác nhau đúng 1 ký tự (ví dụ: "Hello World" và "Hello world").',
      instructionEn: 'Pick a preset or type two inputs that differ by only a single character.',
      targetActionVi: 'Bấm một trong các nút mẫu phía dưới (Preset).',
      targetActionEn: 'Click one of the preset buttons below.',
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
      titleVi: 'Bước 3: Soi ma trận 256 bit (Bit Matrix Inspection)',
      titleEn: 'Step 3: Inspect 256-bit Matrix',
      instructionVi: 'Rê chuột vào từng ô bit màu đỏ (bit bị đảo) và ô xám (bit giữ nguyên) để kiểm tra giá trị nhị phân chi tiết.',
      instructionEn: 'Hover over red (flipped) and dark (unchanged) bits in the 256-cell matrix.',
      targetActionVi: 'Rê chuột qua lưới 256 bit bên dưới.',
      targetActionEn: 'Hover over the 256-bit matrix grid below.',
      isCompleted: hoveredBitIndex !== null || guideStepIndex === 2,
    },
  ];

  const avalancheQuestions: SimulationQuestions = {
    whatAmILookingAtVi: 'Bạn đang quan sát Hiệu ứng thác đổ (Avalanche Effect) - một thuộc tính mật mã học cốt lõi của hàm băm an toàn.',
    whatAmILookingAtEn: 'You are observing the Avalanche Effect - a fundamental cryptographic property of secure hash functions.',
    whatShouldIClickVi: 'Nhấp chọn các bộ mẫu so sánh hoặc chỉnh sửa 1 ký tự trong ô Đầu vào A / Đầu vào B.',
    whatShouldIClickEn: 'Select sample presets or edit a single character in Input A / Input B.',
    whatJustHappenedVi: 'Chỉ thay đổi đúng 1 bit ở đầu vào khiến ~50% (khoảng 128/256 bit) của mã băm đầu ra bị đảo lộn hoàn toàn.',
    whatJustHappenedEn: 'Flipping a single input bit caused ~50% (~128/256) of the resulting digest bits to invert unpredictably.',
    whyDidItHappenVi: 'Các vòng nén (64 vòng trong SHA-256) khuếch tán triệt để thông tin, đảm bảo kẻ gian không thể suy đoán đầu vào từ đầu ra.',
    whyDidItHappenEn: 'The 64 compression rounds thoroughly diffuse input bits, preventing attackers from deducing input patterns from output hashes.',
  };

  const avalancheMicroConcepts: MicroConcept[] = [
    {
      term: 'Avalanche Effect (Hiệu ứng thác đổ)',
      explanationVi: 'Đặc tính khiến một thay đổi siêu nhỏ ở đầu vào tạo ra kết quả đầu ra biến đổi hoàn toàn không thể đoán trước.',
      explanationEn: 'The property where a tiny change in input causes a drastic, pseudorandom transformation in the output.',
    },
    {
      term: 'Hamming Distance (Khoảng cách Hamming)',
      explanationVi: 'Số lượng vị trí bit khác nhau giữa hai chuỗi nhị phân có cùng độ dài.',
      explanationEn: 'The number of bit positions in which two equal-length binary strings differ.',
    },
    {
      term: 'Diffusion (Tính khuếch tán)',
      explanationVi: 'Kỹ thuật mật mã phân tán cấu trúc thống kê của bản rõ ra toàn bộ bản mã băm.',
      explanationEn: 'The cryptographic method that spreads statistical structure of plaintext across the entire ciphertext/hash.',
    },
  ];

  return (
    <section id="avalanche" className="py-12 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 text-text-muted text-xs font-mono font-semibold tracking-wider uppercase mb-3">
            <span>{strings.avalanche.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F2F4F7] tracking-tight font-sans mb-2">
            {strings.avalanche.title}
          </h2>
          <p className="text-sm text-[#A5AFBF] leading-relaxed font-sans">
            {strings.avalanche.description}
          </p>
        </div>

        {/* Guided vs Free Mode & 4 Questions */}
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

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="text-xs font-sans text-[#A5AFBF] font-semibold mr-1">
            {strings.avalanche.comparePresets}:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setInputA(preset.a);
                setInputB(preset.b);
              }}
              className={`text-xs font-sans px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                inputA === preset.a && inputB === preset.b
                  ? 'bg-teach-1/15 text-teach-1 border-teach-1/40 shadow-sm font-medium'
                  : 'bg-[#0C0F14] text-[#A5AFBF] hover:text-[#F2F4F7] border-[#1C2430] hover:border-[#2A3649]'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Dual Input and Hash Comparison Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Side A */}
          <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-5 sm:p-6 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#1C2430] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teach-1" />
                <span className="text-xs font-sans font-bold text-teach-1 uppercase tracking-wider">
                  {strings.avalanche.inputA}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#A5AFBF]">
                {inputA.length} {strings.hashGenerator.lengthChars} · {new TextEncoder().encode(inputA).length * 8} {strings.hashGenerator.lengthBits}
              </span>
            </div>

            <input
              id="avalanche-input-a"
              type="text"
              value={inputA}
              onChange={(e) => setInputA(e.target.value)}
              className="w-full bg-[#0B0F15] border border-[#1C2430] rounded-lg px-4 py-2.5 text-sm sm:text-base font-mono text-[#F2F4F7] placeholder-[#717B8C] focus:outline-none focus:border-teach-1 mb-4"
              placeholder="Enter original input text..."
            />

            <div>
              <span className="text-[11px] font-sans text-[#A5AFBF] block mb-1 uppercase font-semibold">
                {strings.avalanche.digestA}:
              </span>
              <div className="p-3 rounded-lg bg-[#090A0F] border border-[#1C2430] font-mono text-xs sm:text-sm text-teach-1 break-all select-all font-semibold leading-relaxed">
                {diffResult?.hexA}
              </div>
            </div>
          </div>

          {/* Side B */}
          <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-5 sm:p-6 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#1C2430] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="text-xs font-sans font-bold text-[#F59E0B] uppercase tracking-wider">
                  {strings.avalanche.inputB}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#A5AFBF]">
                {inputB.length} {strings.hashGenerator.lengthChars} · {new TextEncoder().encode(inputB).length * 8} {strings.hashGenerator.lengthBits}
              </span>
            </div>

            <input
              id="avalanche-input-b"
              type="text"
              value={inputB}
              onChange={(e) => setInputB(e.target.value)}
              className="w-full bg-[#0B0F15] border border-[#1C2430] rounded-lg px-4 py-2.5 text-sm sm:text-base font-mono text-[#F2F4F7] placeholder-[#717B8C] focus:outline-none focus:border-[#F59E0B] mb-4"
              placeholder="Enter modified input text..."
            />

            <div>
              <span className="text-[11px] font-sans text-[#A5AFBF] block mb-1 uppercase font-semibold">
                {strings.avalanche.digestB}:
              </span>
              <div className="p-3 rounded-lg bg-[#090A0F] border border-[#1C2430] font-mono text-xs sm:text-sm text-[#F59E0B] break-all select-all font-semibold leading-relaxed">
                {diffResult?.hexB}
              </div>
            </div>
          </div>
        </div>

        {/* Central Bit Difference & Hamming Distance Metrics Banner */}
        {diffResult && (
          <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-6 sm:p-8 shadow-lg mb-6 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
              {/* Metric 1: Changed bits */}
              <div className="border-b md:border-b-0 md:border-r border-[#1C2430] pb-4 md:pb-0 md:pr-6">
                <span className="text-xs font-sans text-[#A5AFBF] uppercase tracking-wider block mb-1 font-semibold">
                  {strings.avalanche.hammingDistance}
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-sans text-[#F2F4F7]">
                  <span className="font-mono text-[#EAB308]">{diffResult.changedBits}</span>{' '}
                  <span className="text-lg font-normal text-[#A5AFBF] font-sans">/ 256 bits</span>
                </div>
                <p className="text-xs text-[#A5AFBF] mt-1 font-sans">
                  Input diff: <span className="font-mono text-[#EAB308]">{inputDiff.changedBits} bit{inputDiff.changedBits === 1 ? '' : 's'}</span> flipped
                </p>
              </div>

              {/* Metric 2: Percentage */}
              <div className="border-b md:border-b-0 md:border-r border-[#1C2430] pb-4 md:pb-0 md:pr-6">
                <span className="text-xs font-sans text-[#A5AFBF] uppercase tracking-wider block mb-1 font-semibold">
                  {strings.avalanche.avalanchePercentage}
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-sans text-[#F59E0B]">
                  <span className="font-mono">{diffResult.percentage.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-[#A5AFBF] mt-1 font-sans">
                  {strings.avalanche.targetIdeal}: ~50.0%
                </p>
              </div>

              {/* Metric 3: Scientific evaluation */}
              <div>
                <span className="text-xs font-sans text-[#A5AFBF] uppercase tracking-wider block mb-1 font-semibold">
                  {strings.avalanche.statusTitle}
                </span>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-base sm:text-lg font-bold font-sans text-success">
                    {strings.avalanche.statusConfirmed}
                  </span>
                </div>
                <p className="text-xs text-[#A5AFBF] mt-1 font-sans">
                  {strings.avalanche.statusExplanation}
                </p>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-6 pt-6 border-t border-[#1C2430] font-sans">
              <div className="flex justify-between text-xs text-[#A5AFBF] mb-2">
                <span>{strings.avalanche.noChange}</span>
                <span className="text-[#EAB308] font-semibold font-mono">
                  {diffResult.changedBits} of 256 Bits Flipped ({diffResult.percentage.toFixed(1)}%)
                </span>
                <span>{strings.avalanche.fullInversion}</span>
              </div>
              <div className="w-full h-3 bg-[#090A0F] rounded-full overflow-hidden border border-[#1C2430] p-0.5 relative">
                {/* 50% ideal marker */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#2A3649] z-10" title="50% Strict Avalanche Reference" />
                <div
                  className="h-full rounded-full bg-[#EAB308] transition-all duration-300"
                  style={{ width: `${diffResult.percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 256-Bit Comparative Matrix Grid */}
        {diffResult && (
          <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-5 sm:p-7 shadow-lg font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C2430] pb-4 mb-5">
              <div>
                <span className="text-xs font-sans font-bold text-text-primary uppercase tracking-wider">
                  {strings.avalanche.matrixTitle}
                </span>
                <p className="text-xs text-[#A5AFBF] mt-0.5 font-sans">
                  {strings.avalanche.matrixDesc}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#EAB308] inline-block" />
                  <span className="text-[#F2F4F7]">{strings.avalanche.flippedBit} (<strong className="font-mono text-[#EAB308]">{diffResult.changedBits}</strong>)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#090A0F] border border-[#1C2430] inline-block" />
                  <span className="text-[#A5AFBF]">{strings.avalanche.unchangedBit} (<strong className="font-mono text-[#F2F4F7]">{256 - diffResult.changedBits}</strong>)</span>
                </div>
              </div>
            </div>

            {/* 256 Grid Cells */}
            <div className="grid grid-cols-16 sm:grid-cols-32 gap-1 p-3.5 bg-[#090A0F] rounded-xl border border-[#1C2430]">
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
                    className={`aspect-square rounded flex items-center justify-center font-mono text-[9px] sm:text-[10px] transition-all cursor-pointer ${
                      isHovered
                        ? 'scale-125 z-20 shadow-md border border-white'
                        : ''
                    } ${
                      isFlipped
                        ? 'bg-[#EAB308] text-[#090A0F] font-bold border border-[#EAB308]'
                        : 'bg-[#0F131A] text-[#717B8C] border border-[#1C2430] hover:text-[#A5AFBF]'
                    }`}
                    title={`Bit #${idx}: A=${bitA} -> B=${bitB} (${isFlipped ? 'FLIPPED' : 'UNCHANGED'})`}
                  >
                    {isFlipped ? '1' : '0'}
                  </div>
                );
              })}
            </div>

            {/* Interactive Inspector Bar */}
            <div className="mt-4 p-3 rounded-lg bg-[#090A0F] border border-[#1C2430] text-xs font-sans flex flex-wrap items-center justify-between gap-2 text-[#A5AFBF]">
              {hoveredBitIndex !== null ? (
                <>
                  <div>
                    Inspecting <span className="text-[#F2F4F7] font-bold font-mono">Bit #{hoveredBitIndex}</span> (Byte {Math.floor(hoveredBitIndex / 8)}, Word H{Math.floor(hoveredBitIndex / 32)})
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span>Digest A: <strong className="text-teach-1">{diffResult.bitsA[hoveredBitIndex]}</strong></span>
                    <span>Digest B: <strong className="text-[#F59E0B]">{diffResult.bitsB[hoveredBitIndex]}</strong></span>
                    <span className={diffResult.diffIndices.includes(hoveredBitIndex) ? 'text-[#EAB308] font-bold' : 'text-[#A5AFBF]'}>
                      {diffResult.diffIndices.includes(hoveredBitIndex) ? 'STATUS: FLIPPED' : 'STATUS: UNCHANGED'}
                    </span>
                  </div>
                </>
              ) : (
                <span>{strings.avalanche.hoverPrompt}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

