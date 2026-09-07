import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Activity,
  Hash,
  ChevronDown,
  BookOpen,
  Play,
  CheckCircle2,
  HelpCircle,
  Pin,
  ArrowRight,
  TrendingUp,
  ArrowDown
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { hashSha256 } from '../utils/sha256';
import { calculateHammingDifference, calculateInputBitDifference } from '../utils/binary';
import { BitDiffResult } from '../types';
import { runAvalancheMonteCarlo, MonteCarloResult } from '../utils/monteCarlo';

// Helper to convert byte value (0-255) to 8-element bit array (MSB to LSB)
function byteTo8Bits(byteVal: number): number[] {
  const bits: number[] = [];
  for (let i = 7; i >= 0; i--) {
    bits.push((byteVal >> i) & 1);
  }
  return bits;
}

export const AvalancheVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // 1. Core comparison inputs
  const [inputA, setInputA] = useState('Hello World');
  const [inputB, setInputB] = useState('Hello world');
  const [diffResult, setDiffResult] = useState<BitDiffResult | null>(null);

  // 2. Interactive Word and Bit state
  const [focusedWordIndex, setFocusedWordIndex] = useState<number | null>(null);
  const [selectedBitIndex, setSelectedBitIndex] = useState<number | null>(17); // Default pinned to bit 17
  const [hoveredBitIndex, setHoveredBitIndex] = useState<number | null>(null);
  const matrixContainerRef = useRef<HTMLDivElement>(null);

  // 3. Disclosures
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);
  const [showTheory, setShowTheory] = useState(false);

  // 4. Monte Carlo state
  const [mcSampleSize, setMcSampleSize] = useState<number>(1000);
  const [mcRunning, setMcRunning] = useState(false);
  const [mcProgress, setMcProgress] = useState<{ completed: number; total: number } | null>(null);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);

  // Compute SHA-256 for inputs
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

  // Clean, human-readable presets with zero syntax clutter
  const presets = useMemo(() => [
    {
      id: 'case-shift',
      titleVi: 'Đổi chữ hoa sang thường',
      titleEn: 'Uppercase to Lowercase',
      subtitleVi: 'Ký tự W thành w',
      subtitleEn: 'Character W to w',
      a: 'Hello World',
      b: 'Hello world',
    },
    {
      id: 'single-bit',
      titleVi: 'Đổi số 0 sang 1',
      titleEn: 'Digit 0 to 1',
      subtitleVi: 'Khác đúng 1 bit nhị phân',
      subtitleEn: 'Exactly 1 bit difference',
      a: '0',
      b: '1',
    },
    {
      id: 'increment-digit',
      titleVi: 'Tăng số thứ tự nonce',
      titleEn: 'Increment Nonce Sequence',
      subtitleVi: 'Đổi số 1 thành 2 ở cuối',
      subtitleEn: 'Increment trailing digit',
      a: 'Blockchain0001',
      b: 'Blockchain0002',
    },
    {
      id: 'append-char',
      titleVi: 'Thêm dấu chấm cuối câu',
      titleEn: 'Append Trailing Period',
      subtitleVi: 'Tăng thêm 1 byte ở đuôi',
      subtitleEn: 'Appends 1 byte at the end',
      a: 'The quick brown fox jumps over the lazy dog',
      b: 'The quick brown fox jumps over the lazy dog.',
    },
  ], []);

  const inputDiff = calculateInputBitDifference(inputA, inputB);

  // Visual micro-scaffolding: Compute exact byte divergence between inputA and inputB
  const inputByteScaffold = useMemo(() => {
    if (inputA === inputB) {
      return { mode: 'identical' as const };
    }

    const minLen = Math.min(inputA.length, inputB.length);
    for (let i = 0; i < minLen; i++) {
      if (inputA[i] !== inputB[i]) {
        const byteA = inputA.charCodeAt(i);
        const byteB = inputB.charCodeAt(i);
        const bitsA = byteTo8Bits(byteA);
        const bitsB = byteTo8Bits(byteB);
        const flippedIndices: number[] = [];
        for (let k = 0; k < 8; k++) {
          if (bitsA[k] !== bitsB[k]) flippedIndices.push(k);
        }
        return {
          mode: 'char-diff' as const,
          charIndex: i + 1,
          charA: inputA[i],
          charB: inputB[i],
          bitsA,
          bitsB,
          flippedIndices,
          flippedCount: flippedIndices.length,
        };
      }
    }

    // If one string is a prefix of another
    if (inputA.length !== inputB.length) {
      const isLongerB = inputB.length > inputA.length;
      const extraChar = isLongerB ? inputB[inputA.length] : inputA[inputB.length];
      const byteVal = extraChar.charCodeAt(0);
      return {
        mode: 'append-diff' as const,
        extraChar,
        bits: byteTo8Bits(byteVal),
      };
    }

    return { mode: 'identical' as const };
  }, [inputA, inputB]);

  // Group 256 output digest bits into 8 32-bit Words (H₀ to H₇)
  const wordGroups = useMemo(() => {
    if (!diffResult) return [];
    return Array.from({ length: 8 }).map((_, wordIdx) => {
      const wordStartBit = wordIdx * 32;
      const wordEndBit = wordStartBit + 31;
      let wordFlippedCount = 0;

      const bytes = Array.from({ length: 4 }).map((_, byteInWordIdx) => {
        const byteIdx = wordIdx * 4 + byteInWordIdx;
        const byteStartBit = byteIdx * 8;
        let byteFlippedCount = 0;

        const bits = Array.from({ length: 8 }).map((_, bitInByteIdx) => {
          const bitIdx = byteStartBit + bitInByteIdx;
          const isFlipped = diffResult.diffIndices.includes(bitIdx);
          if (isFlipped) {
            byteFlippedCount++;
            wordFlippedCount++;
          }
          const bitA = diffResult.bitsA[bitIdx];
          const bitB = diffResult.bitsB[bitIdx];
          return {
            bitIdx,
            byteIdx,
            bitInByteIdx,
            isFlipped,
            bitA,
            bitB,
          };
        });

        return {
          byteIdx,
          byteStartBit,
          byteFlippedCount,
          bits,
        };
      });

      return {
        wordIdx,
        wordStartBit,
        wordEndBit,
        wordFlippedCount,
        bytes,
      };
    });
  }, [diffResult]);

  // Active inspected bit
  const activeBitIndex = hoveredBitIndex !== null ? hoveredBitIndex : selectedBitIndex;

  // Keyboard navigation for the 256-bit matrix
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (activeBitIndex === null) return;
    let nextIndex = activeBitIndex;

    switch (e.key) {
      case 'ArrowLeft':
        nextIndex = Math.max(0, activeBitIndex - 1);
        e.preventDefault();
        break;
      case 'ArrowRight':
        nextIndex = Math.min(255, activeBitIndex + 1);
        e.preventDefault();
        break;
      case 'ArrowUp':
        nextIndex = Math.max(0, activeBitIndex - 32);
        e.preventDefault();
        break;
      case 'ArrowDown':
        nextIndex = Math.min(255, activeBitIndex + 32);
        e.preventDefault();
        break;
      case 'Home':
        nextIndex = 0;
        e.preventDefault();
        break;
      case 'End':
        nextIndex = 255;
        e.preventDefault();
        break;
      case 'Enter':
      case ' ':
        setSelectedBitIndex(activeBitIndex);
        e.preventDefault();
        break;
      default:
        return;
    }

    setSelectedBitIndex(nextIndex);
  };

  // Run Monte Carlo simulation asynchronously
  const handleRunMonteCarlo = async (size: number) => {
    setMcRunning(true);
    setMcProgress({ completed: 0, total: size });
    try {
      const result = await runAvalancheMonteCarlo(size, (completed, total) => {
        setMcProgress({ completed, total });
      });
      setMcResult(result);
    } finally {
      setMcRunning(false);
      setMcProgress(null);
    }
  };

  const changedBits = diffResult?.changedBits ?? 0;
  const percentage = diffResult?.percentage ?? 0;

  return (
    <section id="avalanche" className="py-6 sm:py-10 font-sans text-slate-100 bg-[#090d16]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

        {/* 1. HEADER: CLEAR PURPOSE & ACCESSIBLE TOGGLES */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-sky-500/20" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                {isVi ? 'Hiệu Ứng Thác Lũ' : 'Avalanche Effect Visualizer'}
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-200 mt-1 max-w-2xl leading-relaxed font-sans">
              {isVi
                ? 'Quan sát trực quan: chỉ cần thay đổi 1 bit cực nhỏ ở đầu vào, mã băm SHA-256 đầu ra sẽ đảo ngẫu nhiên xấp xỉ một nửa số bit.'
                : 'See how flipping just 1 tiny input bit causes the 256-bit SHA-256 digest to randomly invert approximately half its bits.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="btn-toggle-mc"
              onClick={() => {
                setShowMonteCarlo(true);
                setTimeout(() => {
                  const el = document.getElementById('monte-carlo-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    el.classList.add('ring-2', 'ring-sky-400');
                    setTimeout(() => el.classList.remove('ring-2', 'ring-sky-400'), 1800);
                  }
                }, 50);
              }}
              className="px-3.5 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer flex items-center gap-2 font-sans bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200 hover:text-white hover:border-sky-500/50 shadow-xs"
            >
              <Activity className="w-4 h-4 text-sky-400" />
              <span>{isVi ? 'Kiểm định ngẫu nhiên' : 'Monte Carlo Test'}</span>
              <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              id="btn-toggle-theory"
              onClick={() => {
                setShowTheory(true);
                setTimeout(() => {
                  const el = document.getElementById('theory-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    el.classList.add('ring-2', 'ring-indigo-400');
                    setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-400'), 1800);
                  }
                }, 50);
              }}
              className="px-3.5 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer flex items-center gap-2 font-sans bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200 hover:text-white hover:border-indigo-500/50 shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>{isVi ? 'Lý thuyết toán học' : 'Theory'}</span>
              <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </header>

        {/* 2. PRESETS: CLEAN HUMAN LABELS (ZERO SYNTAX CLUTTER, 100% UNIFORM) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset) => {
            const isActive = inputA === preset.a && inputB === preset.b;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setInputA(preset.a);
                  setInputB(preset.b);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between font-sans ${
                  isActive
                    ? 'bg-sky-950/40 border-sky-500 text-white ring-1 ring-sky-400/40 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-sm text-white">
                    {isVi ? preset.titleVi : preset.titleEn}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-normal">
                  {isVi ? preset.subtitleVi : preset.subtitleEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. STEP 1: INPUT WORKBENCH & BIT-LEVEL GRAPHICAL SCAFFOLDING */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2 font-sans">
              <span className="w-1.5 h-4 bg-sky-400 rounded-full" />
              <span>{isVi ? 'Bước 1: So sánh hai chuỗi văn bản đầu vào' : 'Step 1: Compare Two Input Messages'}</span>
            </span>
          </div>

          {/* Dual Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="avalanche-input-a" className="text-sm font-medium text-sky-300 flex items-center justify-between font-sans">
                <span>{isVi ? 'Thông điệp A' : 'Message A'}</span>
                <span className="text-xs text-slate-300">{inputA.length} ký tự</span>
              </label>
              <input
                id="avalanche-input-a"
                type="text"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm sm:text-base font-sans text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40"
                placeholder="Nhập thông điệp A..."
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="avalanche-input-b" className="text-sm font-medium text-indigo-300 flex items-center justify-between font-sans">
                <span>{isVi ? 'Thông điệp B' : 'Message B'}</span>
                <span className="text-xs text-slate-300">{inputB.length} ký tự</span>
              </label>
              <input
                id="avalanche-input-b"
                type="text"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm sm:text-base font-sans text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40"
                placeholder="Nhập thông điệp B..."
              />
            </div>
          </div>

          {/* VISUAL BIT SCAFFOLDING (UNIFIED CYAN SEMANTIC ACCENT TOKEN) */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-sm sm:text-base text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-sky-400" />
                <span>{isVi ? 'Kính lúp nhị phân: Điểm khác biệt giữa hai đầu vào' : 'Binary Magnifier: Input Difference'}</span>
              </span>
              <span className="text-sm font-medium text-sky-300">
                {isVi ? 'Độ lệch đầu vào:' : 'Input diff:'} <strong className="font-bold text-sky-400">{inputDiff.changedBits} bit</strong>
              </span>
            </div>

            {inputByteScaffold.mode === 'char-diff' ? (
              <div className="space-y-3 pt-1">
                <p className="text-sm text-slate-200 leading-relaxed">
                  {isVi
                    ? `Tại ký tự thứ ${inputByteScaffold.charIndex}, máy tính chuyển ký tự thành 8 ô bit nhị phân:`
                    : `At character position ${inputByteScaffold.charIndex}, computer encodes character into 8 binary bits:`}
                </p>

                <div className="space-y-2.5">
                  {/* Row A */}
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-sm font-bold text-sky-300 shrink-0 font-sans">
                      Ký tự &apos;{inputByteScaffold.charA}&apos;:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      {inputByteScaffold.bitsA.map((bitVal, idx) => {
                        const isFlipped = inputByteScaffold.flippedIndices.includes(idx);
                        return (
                          <span
                            key={idx}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                              isFlipped
                                ? 'bg-sky-400 text-slate-950 ring-2 ring-sky-300/80 scale-105 shadow-sm shadow-sky-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {bitVal}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row B */}
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-sm font-bold text-indigo-300 shrink-0 font-sans">
                      Ký tự &apos;{inputByteScaffold.charB}&apos;:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      {inputByteScaffold.bitsB.map((bitVal, idx) => {
                        const isFlipped = inputByteScaffold.flippedIndices.includes(idx);
                        return (
                          <span
                            key={idx}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                              isFlipped
                                ? 'bg-sky-400 text-slate-950 ring-2 ring-sky-300/80 scale-105 shadow-sm shadow-sky-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {bitVal}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-300 pt-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                  <span>
                    {isVi
                      ? `7 ô bit hoàn toàn giống hệt nhau, chỉ có đúng ${inputByteScaffold.flippedCount} ô bit màu xanh cyan bị thay đổi!`
                      : `7 bits are identical; only ${inputByteScaffold.flippedCount} highlighted cyan bit changed!`}
                  </span>
                </div>
              </div>
            ) : inputByteScaffold.mode === 'append-diff' ? (
              <div className="space-y-2.5">
                <p className="text-sm text-slate-200">
                  {isVi
                    ? `Thêm một ký tự '${inputByteScaffold.extraChar}' ở cuối chuỗi tương đương thêm 8 bit nhị phân mới:`
                    : `Appending '${inputByteScaffold.extraChar}' introduces 8 new binary bits:`}
                </p>
                <div className="flex items-center gap-1.5 font-mono">
                  {inputByteScaffold.bits.map((bitVal, idx) => (
                    <span
                      key={idx}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs sm:text-sm font-bold bg-sky-400 text-slate-950 ring-1 ring-sky-300/80"
                    >
                      {bitVal}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-300">
                {isVi ? 'Hai thông điệp đang giống nhau hoàn toàn.' : 'Both messages are currently identical.'}
              </div>
            )}
          </div>
        </div>

        {/* 4. STEP 2: THE AVALANCHE HERO CONTRAST (UNIFIED SEMANTIC TOKEN ACCROSS INPUT & OUTPUT) */}
        {diffResult && (
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-sm font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-sky-400 rounded-full" />
                <span>{isVi ? 'Bước 2: Khuếch tán từ đầu vào sang đầu ra' : 'Step 2: Avalanche Diffusion from Input to Output'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Left: Input Change (Cyan Accent) */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 text-center space-y-1.5">
                <span className="text-sm text-slate-300 font-medium block">
                  {isVi ? 'Biến thiên ở đầu vào' : 'Input Change'}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-sky-400 font-mono tracking-tight">
                  {inputDiff.changedBits} <span className="text-base font-normal text-slate-300 font-sans ml-1">bit</span>
                </div>
                <span className="text-xs sm:text-sm text-slate-300 block">
                  {isVi ? 'Chỉ một chi tiết cực nhỏ' : 'Minimal change'}
                </span>
              </div>

              {/* Middle: SHA-256 Diffusion Machine */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-slate-800 border border-slate-700 text-sky-400 shadow-inner">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <span className="block text-sm font-semibold text-slate-200">
                  SHA-256 (64 vòng nén)
                </span>
                <span className="block text-xs sm:text-sm text-slate-300">
                  {isVi ? 'Khuếch tán toàn phần' : 'Complete diffusion'}
                </span>
              </div>

              {/* Right: Output Avalanche (Cyan Accent) */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-sky-500/40 text-center space-y-1.5 shadow-sm">
                <span className="text-sm text-sky-300 font-medium block">
                  {isVi ? 'Số bit đầu ra bị đảo' : 'Output Inverted Bits'}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-sky-400 font-mono tracking-tight">
                  {changedBits} <span className="text-base font-normal text-slate-300 font-sans ml-1">/ 256 bit</span>
                </div>
                <span className="text-sm font-semibold text-sky-300 block">
                  ~{percentage.toFixed(1)}% {isVi ? 'bị đảo ngẫu nhiên' : 'flipped'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. STEP 3: WORD DIFFUSION GAUGE (VISUAL COLOR TINT, NO NUMBER OVERLOAD) */}
        {diffResult && (
          <div className="space-y-3 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-sky-400 rounded-full" />
                <span>{isVi ? 'Bước 3: Mức độ khuếch tán qua 8 từ (H₀…H₇)' : 'Step 3: Diffusion Across 8 Words (H₀…H₇)'}</span>
              </span>

              {focusedWordIndex !== null && (
                <button
                  type="button"
                  onClick={() => setFocusedWordIndex(null)}
                  className="text-xs sm:text-sm text-sky-400 hover:text-sky-300 underline cursor-pointer"
                >
                  {isVi ? 'Xem toàn bộ 8 từ' : 'Show all words'}
                </button>
              )}
            </div>

            {/* 8 Visual Word Diffusion Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {wordGroups.map((word) => {
                const isFocused = focusedWordIndex === word.wordIdx;
                const ratio = word.wordFlippedCount / 32;
                const isBalanced = ratio >= 0.4 && ratio <= 0.6;

                return (
                  <button
                    key={word.wordIdx}
                    type="button"
                    onClick={() => setFocusedWordIndex(isFocused ? null : word.wordIdx)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isFocused
                        ? 'bg-sky-950/60 border-sky-400 text-white ring-2 ring-sky-400/50 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold font-mono text-white">H{word.wordIdx}</span>
                      <span className={`text-xs font-semibold font-mono ${isBalanced ? 'text-emerald-400' : 'text-sky-400'}`}>
                        {word.wordFlippedCount}/32
                      </span>
                    </div>

                    {/* Visual progress bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className={`h-full transition-all ${isBalanced ? 'bg-emerald-400' : 'bg-sky-400'}`}
                        style={{ width: `${Math.round(ratio * 100)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. STEP 4: ACADEMIC STANDARD 256-BIT DIGEST DIFFUSION MATRIX */}
        {diffResult && (
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-sm font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                  {isVi ? 'Ma trận khuếch tán 256 bit đầu ra' : '256-Bit Output Diffusion Matrix'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {isVi
                    ? 'Mỗi ô biểu diễn một bit trạng thái sau 64 vòng nén SHA-256. Màu xanh cyan biểu thị bit bị đảo do hiệu ứng thác lũ; màu xám than biểu thị bit giữ nguyên.'
                    : 'Each cell represents one output bit after 64 SHA-256 compression rounds. Cyan indicates an inverted bit; slate indicates an unchanged bit.'}
                </p>
              </div>

              {/* High Contrast Legend */}
              <div className="flex items-center gap-4 text-xs sm:text-sm shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-xs bg-sky-400 inline-block" />
                  <span className="text-slate-200">
                    {isVi ? 'Đổi bit:' : 'Flipped:'} <strong className="text-sky-300 font-bold font-mono ml-0.5">{changedBits}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-xs bg-slate-800 border border-slate-600 inline-block" />
                  <span className="text-slate-300">
                    {isVi ? 'Giữ nguyên:' : 'Unchanged:'} <strong className="text-slate-200 font-bold font-mono ml-0.5">{256 - changedBits}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Matrix Container */}
            <div
              ref={matrixContainerRef}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              aria-label="256-bit matrix. Use arrow keys to navigate."
              className="space-y-2 bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 shadow-inner overflow-x-auto focus:outline-hidden focus:ring-1 focus:ring-sky-400/50"
            >
              {wordGroups.map((word) => {
                const isWordHighlighted = focusedWordIndex === null || focusedWordIndex === word.wordIdx;
                const isCurrentWordActive = focusedWordIndex === word.wordIdx;

                return (
                  <div
                    key={word.wordIdx}
                    className={`flex items-center gap-2 sm:gap-3 min-w-[620px] p-1 rounded-lg transition-all ${
                      isCurrentWordActive
                        ? 'bg-sky-950/30 border border-sky-500/40'
                        : isWordHighlighted
                        ? 'opacity-100'
                        : 'opacity-35 hover:opacity-80'
                    }`}
                  >
                    {/* Word Tag */}
                    <button
                      type="button"
                      onClick={() => setFocusedWordIndex(isCurrentWordActive ? null : word.wordIdx)}
                      className="w-16 shrink-0 font-mono text-sm text-left cursor-pointer"
                    >
                      <span className={`font-bold ${isCurrentWordActive ? 'text-sky-300' : 'text-slate-300'}`}>
                        H{word.wordIdx}
                      </span>
                    </button>

                    {/* 4 Bytes */}
                    <div className="flex items-center gap-2 grow">
                      {word.bytes.map((byte) => (
                        <div
                          key={byte.byteIdx}
                          className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/60 p-1 sm:p-1.5 rounded-md border border-slate-800/80"
                        >
                          {byte.bits.map((bit) => {
                            const isHovered = hoveredBitIndex === bit.bitIdx;
                            const isSelected = selectedBitIndex === bit.bitIdx;
                            const isActive = isHovered || isSelected;

                            return (
                              <button
                                key={bit.bitIdx}
                                type="button"
                                onClick={() => setSelectedBitIndex(bit.bitIdx)}
                                onMouseEnter={() => setHoveredBitIndex(bit.bitIdx)}
                                onMouseLeave={() => setHoveredBitIndex(null)}
                                aria-label={`Bit ${bit.bitIdx}: ${bit.isFlipped ? 'Flipped' : 'Unchanged'}`}
                                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-xs transition-all cursor-pointer relative flex items-center justify-center ${
                                  isActive
                                    ? 'scale-125 z-20 ring-2 ring-sky-300 ring-offset-2 ring-offset-slate-950 shadow-md shadow-sky-500/40'
                                    : 'hover:scale-110'
                                } ${
                                  bit.isFlipped
                                    ? 'bg-sky-400 hover:bg-sky-300'
                                    : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                                }`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clean, Academic Inspector */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 shadow-inner flex flex-wrap items-center justify-between gap-3">
              {activeBitIndex !== null && diffResult ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-white font-bold bg-slate-800 px-3 py-1 rounded">
                    <Pin className="w-4 h-4 text-sky-400" />
                    <span>Bit số {activeBitIndex}</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <span>Thuộc từ: <strong className="text-sky-300 font-mono">H{Math.floor(activeBitIndex / 32)}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>Byte: <strong className="text-white font-mono">{Math.floor(activeBitIndex / 8)}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>
                    Giá trị: <strong className="text-sky-300 font-mono">{diffResult.bitsA[activeBitIndex]}</strong> sang <strong className="text-indigo-300 font-mono">{diffResult.bitsB[activeBitIndex]}</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    diffResult.diffIndices.includes(activeBitIndex)
                      ? 'bg-sky-950 text-sky-300 border border-sky-700'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {diffResult.diffIndices.includes(activeBitIndex)
                      ? (isVi ? 'BỊ ĐẢO' : 'FLIPPED')
                      : (isVi ? 'GIỮ NGUYÊN' : 'UNCHANGED')}
                  </span>
                </div>
              ) : (
                <div className="text-slate-300 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>
                    {isVi
                      ? 'Chạm/click hoặc dùng phím mũi tên để soi từng bit.'
                      : 'Tap/click or use arrow keys to inspect any bit.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. COLLAPSIBLE ACCORDION: MONTE CARLO TEST */}
        <div id="monte-carlo-section" className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm font-sans scroll-mt-6 transition-all duration-300">
          <button
            type="button"
            id="btn-accordion-monte-carlo"
            onClick={() => setShowMonteCarlo((prev) => !prev)}
            aria-expanded={showMonteCarlo}
            className="w-full px-4 py-4 bg-slate-900/90 hover:bg-slate-800 flex items-center justify-between text-left text-sm sm:text-base font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-sky-400" />
              <span>{isVi ? 'Kiểm định ngẫu nhiên nhiều mẫu (Monte Carlo)' : 'Monte Carlo Statistical Verification'}</span>
            </span>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showMonteCarlo ? 'rotate-180' : ''}`} />
          </button>

          {showMonteCarlo && (
            <div className="p-4 sm:p-6 border-t border-slate-800 space-y-5 text-slate-200 leading-relaxed">
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                {isVi
                  ? 'Máy tính sẽ tự động sinh ngẫu nhiên hàng nghìn thông điệp, lật đúng 1 bit ở mỗi thông điệp và đo xem hiệu ứng thác lũ có thực sự đảo quanh mức ~50% hay không.'
                  : 'Automated trial generates thousands of random inputs, flips exactly 1 bit per trial, and measures whether diffusion consistently stays around ~50%.'}
              </p>

              {/* Sample Size Controls & Trigger Workbench */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-200">
                    {isVi ? 'Số lượng mẫu thử:' : 'Sample size:'}
                  </span>
                  <div className="inline-flex rounded-lg p-0.5 bg-slate-900 border border-slate-800">
                    {[100, 1000, 5000].map((size) => (
                      <button
                        key={size}
                        type="button"
                        disabled={mcRunning}
                        onClick={() => setMcSampleSize(size)}
                        className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-sans transition-colors cursor-pointer ${
                          mcSampleSize === size
                            ? 'bg-sky-500/20 text-sky-200 font-bold border border-sky-500/40 shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {size.toLocaleString()} mẫu
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-run-monte-carlo"
                  disabled={mcRunning}
                  onClick={() => handleRunMonteCarlo(mcSampleSize)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    mcRunning
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm hover:shadow-sky-500/20'
                  }`}
                >
                  <Play className={`w-4 h-4 ${mcRunning ? 'animate-spin' : ''}`} />
                  <span>
                    {mcRunning
                      ? (isVi ? `Đang thử nghiệm: ${mcProgress?.completed ?? 0}/${mcProgress?.total ?? mcSampleSize}...` : `Testing: ${mcProgress?.completed ?? 0}/${mcProgress?.total ?? mcSampleSize}...`)
                      : (isVi ? 'Bắt đầu kiểm định' : 'Run Verification')}
                  </span>
                </button>
              </div>

              {/* Progress Bar */}
              {mcRunning && mcProgress && (
                <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-sm text-slate-200 font-medium">
                    <span>{isVi ? 'Tiến độ thử nghiệm:' : 'Progress:'}</span>
                    <span className="font-bold text-sky-300 font-mono">
                      {Math.round((mcProgress.completed / mcProgress.total) * 100)}% ({mcProgress.completed} / {mcProgress.total})
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-100"
                      style={{ width: `${(mcProgress.completed / mcProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Monte Carlo Results */}
              {mcResult && !mcRunning && (
                <div className="space-y-5 pt-1 font-sans">
                  {/* Results Grid with Clear Typographic Hierarchy */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Mean */}
                    <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-sm font-medium text-slate-300 block">
                        {isVi ? 'Trung bình số bit đổi' : 'Mean Bit Flips'}
                      </span>
                      <div className="flex items-baseline">
                        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-300 tracking-tight">
                          {mcResult.observedMean}
                        </span>
                        <span className="text-sm font-normal text-slate-300 ml-1.5">bit</span>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-300 mt-1 block">
                        {isVi ? 'Kỳ vọng lý thuyết: 128 bit' : 'Expected: 128 bits'}
                      </span>
                    </div>

                    {/* Card 2: Std Dev */}
                    <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-sm font-medium text-slate-300 block">
                        {isVi ? 'Độ lệch chuẩn' : 'Standard Deviation'}
                      </span>
                      <div className="flex items-baseline">
                        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                          {mcResult.observedStdDev}
                        </span>
                        <span className="text-sm font-normal text-slate-300 ml-1.5">bit</span>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-300 mt-1 block">
                        {isVi ? 'Lý thuyết: 8.00 bit' : 'Theoretical: 8.00 bits'}
                      </span>
                    </div>

                    {/* Card 3: Min - Max Range */}
                    <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-sm font-medium text-slate-300 block">
                        {isVi ? 'Khoảng Min – Max' : 'Observed Range'}
                      </span>
                      <div className="flex items-baseline">
                        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                          {mcResult.minDistance} – {mcResult.maxDistance}
                        </span>
                        <span className="text-sm font-normal text-slate-300 ml-1.5">bit</span>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-300 mt-1 block">
                        {isVi ? `Cỡ mẫu: ${mcResult.totalSamples.toLocaleString()} phép thử` : `Sample size: ${mcResult.totalSamples.toLocaleString()} trials`}
                      </span>
                    </div>

                    {/* Card 4: Execution Time */}
                    <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-sm font-medium text-slate-300 block">
                        {isVi ? 'Thời gian thực thi' : 'Execution Time'}
                      </span>
                      <div className="flex items-baseline">
                        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                          {mcResult.executionTimeMs.toLocaleString()}
                        </span>
                        <span className="text-sm font-normal text-slate-300 ml-1.5">ms</span>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-300 mt-1 block">
                        Web Crypto API
                      </span>
                    </div>
                  </div>

                  {/* Distribution Histogram Chart */}
                  <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-semibold text-sm sm:text-base text-white">
                        {isVi
                          ? 'Phân phối thực nghiệm vs. Phân phối nhị thức lý thuyết B(256, 0.5)'
                          : 'Observed Distribution vs. Theoretical Binomial B(256, 0.5)'}
                      </span>
                      <div className="flex items-center gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 bg-sky-400 rounded-xs inline-block" />
                          <span className="text-slate-200">{isVi ? 'Thực nghiệm' : 'Observed'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-1 bg-slate-300 inline-block rounded-full" />
                          <span className="text-slate-200">{isVi ? 'Lý thuyết B(256, 0.5)' : 'Theoretical B(256, 0.5)'}</span>
                        </div>
                      </div>
                    </div>

                    {/* SVG Chart */}
                    <div className="h-48 w-full pt-2">
                      <svg className="w-full h-full" viewBox="0 0 600 160" preserveAspectRatio="none">
                        {/* Guidelines */}
                        <line x1="0" y1="40" x2="600" y2="40" stroke="#334155" strokeDasharray="3 3" />
                        <line x1="0" y1="80" x2="600" y2="80" stroke="#334155" strokeDasharray="3 3" />
                        <line x1="0" y1="120" x2="600" y2="120" stroke="#334155" strokeDasharray="3 3" />

                        {(() => {
                          const maxPct = Math.max(
                            25,
                            ...mcResult.bins.map((b) => Math.max(b.observedPercent, b.theoreticalPercent))
                          );
                          const barWidth = 600 / mcResult.bins.length;

                          return (
                            <>
                              {/* Observed bars (Cyan) */}
                              {mcResult.bins.map((bin, idx) => {
                                const barHeight = (bin.observedPercent / maxPct) * 120;
                                const x = idx * barWidth + barWidth * 0.15;
                                const y = 140 - barHeight;
                                return (
                                  <g key={idx}>
                                    <rect
                                      x={x}
                                      y={y}
                                      width={barWidth * 0.7}
                                      height={barHeight}
                                      fill="#38bdf8"
                                      opacity="0.85"
                                      rx="2"
                                    >
                                      <title>{`${bin.label}: ${bin.observedCount} mẫu (${bin.observedPercent.toFixed(1)}%) - Lý thuyết: ${bin.theoreticalPercent.toFixed(1)}%`}</title>
                                    </rect>
                                  </g>
                                );
                              })}

                              {/* Theoretical curve (Slate-200 / Silver reference curve) */}
                              <polyline
                                fill="none"
                                stroke="#cbd5e1"
                                strokeWidth="2"
                                strokeDasharray="4 2"
                                points={mcResult.bins
                                  .map((bin, idx) => {
                                    const cx = idx * barWidth + barWidth * 0.5;
                                    const cy = 140 - (bin.theoreticalPercent / maxPct) * 120;
                                    return `${cx},${cy}`;
                                  })
                                  .join(' ')}
                              />
                              {mcResult.bins.map((bin, idx) => {
                                const cx = idx * barWidth + barWidth * 0.5;
                                const cy = 140 - (bin.theoreticalPercent / maxPct) * 120;
                                return (
                                  <circle
                                    key={idx}
                                    cx={cx}
                                    cy={cy}
                                    r="2.5"
                                    fill="#cbd5e1"
                                  />
                                );
                              })}

                              {/* X-axis labels */}
                              {mcResult.bins.map((bin, idx) => {
                                const cx = idx * barWidth + barWidth * 0.5;
                                return (
                                  <text
                                    key={idx}
                                    x={cx}
                                    y="155"
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#cbd5e1"
                                    fontFamily="sans-serif"
                                  >
                                    {bin.label}
                                  </text>
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>

                  {/* High-Grade Executive Report Synthesis */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-xl border border-emerald-500/30 text-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm sm:text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{isVi ? 'Báo cáo tổng hợp đánh giá thực nghiệm' : 'Empirical Evaluation Report'}</span>
                    </div>

                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                      {isVi ? (
                        <>
                          Sau <strong className="font-bold text-white">{mcResult.totalSamples.toLocaleString()} phép thử ngẫu nhiên</strong> có kiểm soát, 
                          trung bình số bit bị đảo quan sát được là <strong className="font-bold text-sky-300">{mcResult.observedMean} bit</strong> (chiếm xấp xỉ <strong className="font-bold text-emerald-400">{((mcResult.observedMean / 256) * 100).toFixed(1)}%</strong>). 
                          Kết quả này trùng khớp gần như tuyệt đối với kỳ vọng lý thuyết 128 bit của phân phối nhị thức, chứng minh hàm băm SHA-256 hoàn toàn thỏa mãn tiêu chuẩn khuếch tán thác lũ ngẫu nhiên.
                        </>
                      ) : (
                        <>
                          Across <strong className="font-bold text-white">{mcResult.totalSamples.toLocaleString()} controlled random trials</strong>, 
                          the observed mean bit flip count is <strong className="font-bold text-sky-300">{mcResult.observedMean} bits</strong> (approximately <strong className="font-bold text-emerald-400">{((mcResult.observedMean / 256) * 100).toFixed(1)}%</strong>). 
                          This empirical result closely aligns with the 128-bit expectation of the binomial distribution, confirming SHA-256 achieves robust avalanche diffusion.
                        </>
                      )}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                      <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        {isVi
                          ? 'Độ lệch chuẩn thực tế đạt ' + mcResult.observedStdDev + ' bit so với chuẩn lý thuyết 8.00 bit.'
                          : 'Observed standard deviation is ' + mcResult.observedStdDev + ' bits vs. theoretical standard 8.00 bits.'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 8. COLLAPSIBLE ACCORDION: THEORETICAL FOUNDATIONS */}
        <div id="theory-section" className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm font-sans scroll-mt-6 transition-all duration-300">
          <button
            type="button"
            id="btn-accordion-theory"
            onClick={() => setShowTheory((prev) => !prev)}
            aria-expanded={showTheory}
            className="w-full px-4 py-4 bg-slate-900/90 hover:bg-slate-800 flex items-center justify-between text-left text-sm sm:text-base font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>{isVi ? 'Cơ sở lý thuyết & Tiêu chuẩn SAC' : 'Strict Avalanche Criterion (SAC) Theory'}</span>
            </span>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showTheory ? 'rotate-180' : ''}`} />
          </button>

          {showTheory && (
            <div className="p-4 sm:p-6 border-t border-slate-800 space-y-5 text-slate-200 leading-relaxed font-sans">
              <div className="space-y-2">
                <h4 className="font-bold text-white text-base">
                  {isVi ? '1. Tiêu chuẩn thác đổ nghiêm ngặt (SAC)' : '1. Strict Avalanche Criterion (SAC)'}
                </h4>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {isVi
                    ? 'Được Webster & Tavares đề xuất năm 1985: Khi bất kỳ một bit đầu vào nào bị đảo, mỗi bit ở đầu ra phải thay đổi với xác suất đúng bằng 50%. Tính chất này đảm bảo kẻ tấn công không thể tìm ra bất kỳ quy luật nào giữa thông điệp gốc và mã băm.'
                    : 'Introduced by Webster & Tavares in 1985: When any single input bit is inverted, each output bit must change with exactly 50% probability. This ensures attackers cannot deduce any correlation between input and digest.'}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800">
                <h4 className="font-bold text-white text-base">
                  {isVi ? '2. Tại sao đổi ~50% bit làm đổi gần hết ký tự Hex?' : '2. Why ~50% Bit Flips Change ~94% of Hex Digits'}
                </h4>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {isVi
                    ? 'Một ký tự Hex đại diện cho 4 bit nhị phân. Ký tự đó chỉ giữ nguyên nếu cả 4 bit cùng không đổi (xác suất là (1/2)⁴ = 6.25%). Xác suất bị đổi là 93.75%. Vì vậy, 60/64 ký tự Hex khác biệt là hoàn toàn khớp với việc ~50% bit bị đảo.'
                    : 'Each Hex character represents 4 bits. A hex digit stays unchanged only if all 4 bits remain identical (probability (1/2)⁴ = 6.25%). The probability of changing is 93.75%, explaining why ~60 out of 64 hex characters differ when 50% of bits flip.'}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
