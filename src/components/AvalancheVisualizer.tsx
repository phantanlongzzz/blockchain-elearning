import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Activity, Shuffle, Hash, Layers, ChevronDown, ChevronUp, BookOpen, Info, HelpCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { hashSha256 } from '../utils/sha256';
import { calculateHammingDifference, calculateInputBitDifference } from '../utils/binary';
import { BitDiffResult } from '../types';

export const AvalancheVisualizer: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';

  // Core inputs
  const [inputA, setInputA] = useState('Hello World');
  const [inputB, setInputB] = useState('Hello world');
  const [diffResult, setDiffResult] = useState<BitDiffResult | null>(null);
  const [hoveredBitIndex, setHoveredBitIndex] = useState<number | null>(null);
  
  // Collapsible deep dive & guidance sections (collapsed by default to keep sandbox prominent)
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

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

  // Meaningful educational presets
  const presets = useMemo(() => [
    {
      id: 'case-shift',
      name: 'Chữ hoa ↔ thường ("W" ↔ "w")',
      nameEn: 'Case Shift ("W" ↔ "w")',
      a: 'Hello World',
      b: 'Hello world',
      noteVi: 'Khác đúng 1 bit ở ký tự thứ 6 ("W" = 0x57 [01010111] vs "w" = 0x77 [01110111])',
      noteEn: 'Differs by exactly 1 bit in 6th char ("W" = 0x57 vs "w" = 0x77)',
    },
    {
      id: 'single-bit',
      name: 'Ký tự 1 bit ("0" ↔ "1")',
      nameEn: '1-Bit ASCII ("0" ↔ "1")',
      a: '0',
      b: '1',
      noteVi: 'Đầu vào ngắn nhất khác nhau 1 bit: "0" (0x30 [00110000]) vs "1" (0x31 [00110001])',
      noteEn: 'Minimal 1-bit input: "0" (0x30) vs "1" (0x31)',
    },
    {
      id: 'increment-digit',
      name: 'Tăng chữ số ("1" ↔ "2")',
      nameEn: 'Digit Increment ("1" ↔ "2")',
      a: 'Blockchain0001',
      b: 'Blockchain0002',
      noteVi: 'Mô phỏng thay đổi nonce hoặc transaction index ở đuôi thông điệp',
      noteEn: 'Simulates changing a trailing nonce or transaction index',
    },
    {
      id: 'append-char',
      name: 'Thêm dấu chấm (".")',
      nameEn: 'Append Period (".")',
      a: 'The quick brown fox jumps over the lazy dog',
      b: 'The quick brown fox jumps over the lazy dog.',
      noteVi: 'Thêm đúng 1 byte (dấu ".") ở cuối chuỗi văn bản hoàn chỉnh',
      noteEn: 'Appends exactly 1 byte (period ".") to a full sentence',
    },
  ], []);

  const activePreset = presets.find((p) => p.a === inputA && p.b === inputB);
  const inputDiff = calculateInputBitDifference(inputA, inputB);

  // Group 256 bits into 8 32-bit Words (W0 to W7), each having 4 Bytes (8 bits each)
  const wordGroups = useMemo(() => {
    if (!diffResult) return [];
    return Array.from({ length: 8 }).map((_, wordIdx) => {
      const wordStartBit = wordIdx * 32;
      const wordEndBit = wordStartBit + 31;
      const bytes = Array.from({ length: 4 }).map((_, byteInWordIdx) => {
        const byteIdx = wordIdx * 4 + byteInWordIdx;
        const byteStartBit = byteIdx * 8;
        const bits = Array.from({ length: 8 }).map((_, bitInByteIdx) => {
          const bitIdx = byteStartBit + bitInByteIdx;
          const isFlipped = diffResult.diffIndices.includes(bitIdx);
          const bitA = diffResult.bitsA[bitIdx];
          const bitB = diffResult.bitsB[bitIdx];
          return {
            bitIdx,
            isFlipped,
            bitA,
            bitB,
          };
        });
        return {
          byteIdx,
          byteStartBit,
          bits,
        };
      });
      return {
        wordIdx,
        wordStartBit,
        wordEndBit,
        bytes,
      };
    });
  }, [diffResult]);

  // Statistical details
  const changedBits = diffResult?.changedBits ?? 0;
  const percentage = diffResult?.percentage ?? 0;
  const isWithinTwoSigma = changedBits >= 112 && changedBits <= 144;

  return (
    <section id="avalanche" className="py-6 sm:py-10 relative font-sans text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">

        {/* 1. COMPACT HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                {isVi ? 'Hiệu Ứng Avalanche' : 'Avalanche Effect'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                SHA-256 Diffusion
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {isVi
                ? 'Thay đổi dù chỉ 1 bit ở đầu vào khiến xấp xỉ một nửa (~50%) số bit mã băm đầu ra bị đảo ngẫu nhiên.'
                : 'Flipping a single input bit unpredictably inverts approximately half (~50%) of the 256 output digest bits.'}
            </p>
          </div>

          {/* Quick toggle to guide / deep dive */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              id="btn-toggle-guide"
              onClick={() => setShowGuide((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                showGuide
                  ? 'bg-cyan-950/60 border-cyan-600/80 text-cyan-300'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isVi ? 'Hướng dẫn' : 'Guide'}</span>
            </button>
            <button
              type="button"
              id="btn-toggle-deep-dive"
              onClick={() => setShowDeepDive((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                showDeepDive
                  ? 'bg-amber-950/60 border-amber-600/80 text-amber-300'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{isVi ? 'Cơ sở lý thuyết' : 'Theory'}</span>
            </button>
          </div>
        </div>

        {/* GUIDANCE BANNER (COLLAPSIBLE, OPTIONAL) */}
        {showGuide && (
          <div className="bg-[#0b0f19] border border-cyan-900/50 rounded-xl p-4 text-xs space-y-3 text-zinc-300 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                {isVi ? 'Gợi ý thực hành quan sát khuếch tán' : 'Experimental Observation Guide'}
              </span>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800/80">
                <strong className="text-zinc-200 block mb-1">1. {isVi ? 'Chọn kịch bản mẫu' : 'Choose Preset'}</strong>
                <p className="text-zinc-400">
                  {isVi
                    ? 'Bấm các kịch bản "W" ↔ "w" hoặc "0" ↔ "1" để xem tác động của đúng 1 bit đổi.'
                    : 'Click presets like "W" ↔ "w" or "0" ↔ "1" to observe the exact 1-bit shift.'}
                </p>
              </div>
              <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800/80">
                <strong className="text-zinc-200 block mb-1">2. {isVi ? 'Đối chiếu mã băm Hex' : 'Compare Hex Digests'}</strong>
                <p className="text-zinc-400">
                  {isVi
                    ? 'Quan sát các ký tự đổi màu trong 64 ký tự Hex giữa 2 đầu vào.'
                    : 'Observe highlighted characters across the 64 hex characters.'}
                </p>
              </div>
              <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800/80">
                <strong className="text-zinc-200 block mb-1">3. {isVi ? 'Tra cứu lưới 256 bit' : 'Inspect 256-bit Grid'}</strong>
                <p className="text-zinc-400">
                  {isVi
                    ? 'Rê chuột lên 8 từ (W0..W7) để xem vị trí bit nhị phân cụ thể bị lật hay giữ nguyên.'
                    : 'Hover over the 8 words (W0..W7) to inspect specific bit coordinates and status.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRESETS SELECTOR (COMPACT, DIRECTLY ABOVE INPUTS) */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 bg-[#090e18] p-1.5 rounded-xl border border-zinc-800/80 text-xs">
            <span className="text-[11px] font-mono text-zinc-500 px-2 py-1 uppercase tracking-wider font-semibold shrink-0">
              {isVi ? 'Kịch bản mẫu:' : 'Presets:'}
            </span>
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
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 font-semibold shadow-xs'
                      : 'bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/60'
                  }`}
                >
                  <Shuffle className={`w-3 h-3 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span>{isVi ? preset.name : preset.nameEn}</span>
                </button>
              );
            })}
          </div>

          {/* Active Preset Context Note */}
          {activePreset && (
            <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/30 border border-cyan-800/40 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{isVi ? activePreset.noteVi : activePreset.noteEn}</span>
            </div>
          )}
        </div>

        {/* 3. DUAL INPUT AND HASH COMPARISON (THE CORE SANDBOX) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Side A - Sky Blue / Cyan */}
          <div className="rounded-xl bg-[#0b0f19] border border-cyan-500/25 p-4 sm:p-5 relative">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  {strings.avalanche.inputA}
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {inputA.length} {isVi ? 'ký tự' : 'chars'} · {new TextEncoder().encode(inputA).length * 8} bits
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="avalanche-input-a" className="sr-only">Input A</label>
                <input
                  id="avalanche-input-a"
                  type="text"
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                  className="w-full bg-[#060810] border border-cyan-500/30 rounded-lg px-3.5 py-2 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all"
                  placeholder={isVi ? 'Nhập chuỗi văn bản gốc A...' : 'Enter original input text...'}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                    {strings.avalanche.digestA}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400/70">
                    64 hex · 8 từ 32-bit (256 bit)
                  </span>
                </div>

                {/* Hex Display with Word Grouping & Diff Highlighting */}
                <div className="p-3 rounded-lg bg-[#060810] border border-cyan-500/20 font-mono text-xs text-zinc-200 break-all select-all leading-relaxed shadow-inner">
                  {diffResult?.hexA ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {Array.from({ length: 8 }).map((_, wordIdx) => {
                        const wordHex = diffResult.hexA.slice(wordIdx * 8, wordIdx * 8 + 8);
                        return (
                          <div key={wordIdx} className="bg-zinc-900/60 px-1.5 py-0.5 rounded border border-zinc-800/60 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-600 select-none mr-1">W{wordIdx}:</span>
                            <span className="tracking-wider">
                              {Array.from({ length: 8 }).map((_, charIdx) => {
                                const globalIdx = wordIdx * 8 + charIdx;
                                const charA = diffResult.hexA[globalIdx];
                                const charB = diffResult.hexB?.[globalIdx];
                                const isDiff = charA !== charB;
                                return (
                                  <span
                                    key={globalIdx}
                                    className={isDiff ? 'text-cyan-300 font-bold' : 'text-zinc-500 opacity-60'}
                                    title={`Hex #${globalIdx}: '${charA}' ${isDiff ? `(khác B: '${charB}')` : '(trùng khớp)'}`}
                                  >
                                    {charA}
                                  </span>
                                );
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-zinc-600">{isVi ? 'Đang tính toán...' : 'Calculating...'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Side B - Violet / Purple */}
          <div className="rounded-xl bg-[#0b0f19] border border-purple-500/25 p-4 sm:p-5 relative">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                  {strings.avalanche.inputB}
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {inputB.length} {isVi ? 'ký tự' : 'chars'} · {new TextEncoder().encode(inputB).length * 8} bits
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="avalanche-input-b" className="sr-only">Input B</label>
                <input
                  id="avalanche-input-b"
                  type="text"
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  className="w-full bg-[#060810] border border-purple-500/30 rounded-lg px-3.5 py-2 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all"
                  placeholder={isVi ? 'Nhập chuỗi văn bản biến thiên B...' : 'Enter modified input text...'}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                    {strings.avalanche.digestB}
                  </span>
                  <span className="text-[10px] font-mono text-purple-400/70">
                    64 hex · 8 từ 32-bit (256 bit)
                  </span>
                </div>

                {/* Hex Display with Word Grouping & Diff Highlighting */}
                <div className="p-3 rounded-lg bg-[#060810] border border-purple-500/20 font-mono text-xs text-zinc-200 break-all select-all leading-relaxed shadow-inner">
                  {diffResult?.hexB ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {Array.from({ length: 8 }).map((_, wordIdx) => {
                        return (
                          <div key={wordIdx} className="bg-zinc-900/60 px-1.5 py-0.5 rounded border border-zinc-800/60 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-600 select-none mr-1">W{wordIdx}:</span>
                            <span className="tracking-wider">
                              {Array.from({ length: 8 }).map((_, charIdx) => {
                                const globalIdx = wordIdx * 8 + charIdx;
                                const charB = diffResult.hexB[globalIdx];
                                const charA = diffResult.hexA?.[globalIdx];
                                const isDiff = charA !== charB;
                                return (
                                  <span
                                    key={globalIdx}
                                    className={isDiff ? 'text-purple-300 font-bold' : 'text-zinc-500 opacity-60'}
                                    title={`Hex #${globalIdx}: '${charB}' ${isDiff ? `(khác A: '${charA}')` : '(trùng khớp)'}`}
                                  >
                                    {charB}
                                  </span>
                                );
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-zinc-600">{isVi ? 'Đang tính toán...' : 'Calculating...'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. SAMPLE HAMMING DISTANCE & STATISTICAL EXPECTATION BANNER */}
        {diffResult && (
          <div className="rounded-xl bg-[#0b0f19] border border-zinc-800/90 p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Metric 1: Observed Sample Hamming Distance */}
              <div className="border-b md:border-b-0 md:border-r border-zinc-800/80 pb-3 md:pb-0 md:pr-4">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1 font-semibold">
                  {isVi ? 'Khoảng cách Hamming mẫu thử' : 'Sample Hamming Distance'}
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
                  <span className="text-cyan-400">{changedBits}</span>{' '}
                  <span className="text-sm font-normal text-zinc-500 font-sans">/ 256 bit</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  {isVi ? 'Tỷ lệ đảo bit mẫu:' : 'Sample bit flip ratio:'}{' '}
                  <strong className="text-cyan-300">{percentage.toFixed(1)}%</strong>
                </p>
              </div>

              {/* Metric 2: Input Variance */}
              <div className="border-b md:border-b-0 md:border-r border-zinc-800/80 pb-3 md:pb-0 md:pr-4">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1 font-semibold">
                  {isVi ? 'Biến thiên đầu vào quan sát' : 'Observed Input Variance'}
                </span>
                <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-200">
                  <span className="text-amber-400">{inputDiff.changedBits}</span>{' '}
                  <span className="text-sm font-normal text-zinc-500 font-sans">
                    {isVi ? `bit đầu vào khác biệt` : `input bit${inputDiff.changedBits === 1 ? '' : 's'} changed`}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 font-mono">
                  {isVi ? 'Đo lường trên 1 mẫu thử (N = 1)' : 'Measured on 1 input pair (N = 1)'}
                </p>
              </div>

              {/* Metric 3: Scientific Theoretical Expectation */}
              <div>
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1 font-semibold">
                  {isVi ? 'Đối chiếu kỳ vọng lý thuyết' : 'Theoretical Expectation'}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isWithinTwoSigma ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-sm font-semibold font-mono text-zinc-200">
                    μ = 128 bit (50.0%)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {isWithinTwoSigma
                    ? (isVi ? '✓ Nằm trong khoảng tin cậy 95% (112 – 144 bit)' : '✓ Within 95% confidence interval (112 – 144 bits)')
                    : (isVi ? 'Ngoại biên xác suất (>2σ, phân phối ngẫu nhiên)' : 'Tail probability event (>2σ, normal in random process)')}
                </p>
              </div>
            </div>

            {/* Visual Progress Bar vs 50% Ideal Anchor */}
            <div className="pt-3 border-t border-zinc-800/80 space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400">
                <span>0%</span>
                <span className="text-cyan-300 font-semibold">
                  {isVi ? `Mẫu thử: ${changedBits}/256 bit (${percentage.toFixed(1)}%)` : `Sample: ${changedBits}/256 bits (${percentage.toFixed(1)}%)`}
                </span>
                <span>100%</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 p-0.5 relative">
                {/* 50% Theoretical Reference Line */}
                <div
                  className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50 z-10"
                  title={isVi ? 'Kỳ vọng lý thuyết: 50.0% (128 bit)' : 'Theoretical expectation: 50.0% (128 bits)'}
                />
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                <span>{isVi ? 'Không khuếch tán' : 'No diffusion'}</span>
                <span className="text-zinc-400">{isVi ? '▲ Mốc 50% (128 bit)' : '▲ Ideal 50% (128 bits)'}</span>
                <span>{isVi ? 'Đảo ngược hoàn toàn' : 'Full inversion'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. 256-BIT OUTPUT STRUCTURE: 8 WORDS × 32 BITS (WITH BYTE BOUNDARIES) */}
        {diffResult && (
          <div className="rounded-xl bg-[#0b0f19] border border-zinc-800/90 p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                  {isVi ? 'Cấu trúc 256 bit đầu ra (8 Từ × 32 bit)' : '256-Bit Output Structure (8 Words × 32 Bits)'}
                </h3>
              </div>

              {/* Bit Counts Legend */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-cyan-400 inline-block" />
                  <span className="text-zinc-200">
                    {isVi ? 'Đảo bit:' : 'Flipped:'} <strong className="text-cyan-300">{changedBits}</strong>
                  </span>
                </div>
                <span className="text-zinc-700">·</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-zinc-800 border border-zinc-700 inline-block" />
                  <span className="text-zinc-400">
                    {isVi ? 'Giữ nguyên:' : 'Unchanged:'} <strong className="text-zinc-300">{256 - changedBits}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Note clarifying that these 8 words are the final digest segments, not internal A-H variables */}
            <p className="text-[11px] text-zinc-400 italic">
              {isVi
                ? 'Ghi chú cấu trúc: 8 từ (Word 0 đến Word 7) biểu diễn 8 phân đoạn 32-bit của chuỗi mã băm đầu ra cuối cùng (H₀..H₇), mỗi từ gồm 4 byte phân cách rõ ràng.'
                : 'Structural note: 8 words (Word 0 to Word 7) represent the 8 32-bit segments of the final hash digest (H₀..H₇), each containing 4 clearly delimited bytes.'}
            </p>

            {/* 8 Words Rows Grid */}
            <div className="space-y-2 bg-[#060810] p-3 sm:p-4 rounded-xl border border-zinc-800/80 shadow-inner overflow-x-auto">
              {wordGroups.map((word) => (
                <div key={word.wordIdx} className="flex items-center gap-2 sm:gap-3 min-w-[580px]">
                  {/* Word Header Label */}
                  <div className="w-20 shrink-0 font-mono text-[11px] text-zinc-400 flex items-center justify-between border-r border-zinc-800 pr-2">
                    <span className="font-bold text-cyan-300">W{word.wordIdx}</span>
                    <span className="text-[10px] text-zinc-500">[{word.wordStartBit}–{word.wordEndBit}]</span>
                  </div>

                  {/* 4 Bytes in this 32-bit Word */}
                  <div className="flex items-center gap-2 grow">
                    {word.bytes.map((byte) => (
                      <div
                        key={byte.byteIdx}
                        className="flex items-center gap-0.5 sm:gap-1 bg-zinc-900/40 p-1 rounded border border-zinc-800/50"
                        title={`Byte #${byte.byteIdx} (Bit ${byte.byteStartBit}–${byte.byteStartBit + 7})`}
                      >
                        {byte.bits.map((bit) => {
                          const isHovered = hoveredBitIndex === bit.bitIdx;
                          return (
                            <button
                              key={bit.bitIdx}
                              type="button"
                              onMouseEnter={() => setHoveredBitIndex(bit.bitIdx)}
                              onMouseLeave={() => setHoveredBitIndex(null)}
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] transition-all cursor-pointer relative ${
                                isHovered ? 'scale-150 z-20 ring-2 ring-white shadow-md' : ''
                              } ${
                                bit.isFlipped
                                  ? 'bg-cyan-400 hover:bg-cyan-300'
                                  : 'bg-zinc-800/80 border border-zinc-700/60 hover:bg-zinc-700'
                              }`}
                              aria-label={`Bit ${bit.bitIdx}: ${bit.isFlipped ? 'Flipped' : 'Unchanged'}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Telemetry Bar on Hover */}
            <div className="p-2.5 rounded-lg bg-[#060810] border border-zinc-800 text-xs font-mono flex flex-wrap items-center justify-between gap-2 text-zinc-300">
              {hoveredBitIndex !== null ? (
                <>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {isVi ? 'Kiểm tra Bit #' : 'Inspecting Bit #'}<strong className="text-white text-sm">{String(hoveredBitIndex).padStart(3, '0')}</strong>
                    </span>
                    <span className="text-zinc-500 text-[11px]">
                      (Từ W{Math.floor(hoveredBitIndex / 32)}, Byte {Math.floor(hoveredBitIndex / 8)}, vị trí bit {hoveredBitIndex % 8} trong Byte)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span>
                      Hash A: <strong className="text-cyan-300">{diffResult.bitsA[hoveredBitIndex]}</strong>
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span>
                      Hash B: <strong className="text-purple-300">{diffResult.bitsB[hoveredBitIndex]}</strong>
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider ${
                        diffResult.diffIndices.includes(hoveredBitIndex)
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {diffResult.diffIndices.includes(hoveredBitIndex)
                        ? (isVi ? 'ĐÃ ĐẢO BIT' : 'FLIPPED')
                        : (isVi ? 'GIỮ NGUYÊN' : 'UNCHANGED')}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-zinc-500">
                  <Activity className="w-3.5 h-3.5 text-cyan-400/60" />
                  <span>
                    {isVi
                      ? 'Rê chuột lên ô bit bất kỳ để tra cứu vị trí Từ (W0..W7), Byte (0..31) và giá trị nhị phân.'
                      : 'Hover over any bit cell to inspect Word (W0..W7), Byte (0..31) and binary bit values.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. DEEP DIVE & THEORETICAL FOUNDATIONS (COLLAPSIBLE ACCORDION) */}
        <div className="rounded-xl bg-[#0b0f19] border border-zinc-800/80 overflow-hidden">
          <button
            type="button"
            id="btn-accordion-deep-dive"
            onClick={() => setShowDeepDive((prev) => !prev)}
            className="w-full px-4 py-3 bg-zinc-900/40 hover:bg-zinc-900/80 flex items-center justify-between text-left text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{isVi ? 'Cơ sở lý thuyết: Tiêu chuẩn SAC & Phân tích xác suất' : 'Theoretical Foundations: SAC & Probability Analysis'}</span>
            </span>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${showDeepDive ? 'rotate-180' : ''}`} />
          </button>

          {showDeepDive && (
            <div className="p-4 sm:p-5 border-t border-zinc-800/80 space-y-4 text-xs text-zinc-300 leading-relaxed animate-fadeIn">
              {/* SAC Clarification */}
              <div className="space-y-1.5">
                <h4 className="font-semibold text-zinc-100 flex items-center gap-1.5 text-sm">
                  <Info className="w-4 h-4 text-cyan-400" />
                  {isVi ? '1. Tiêu chuẩn Thác đổ Nghiêm ngặt (Strict Avalanche Criterion - SAC)' : '1. Strict Avalanche Criterion (SAC)'}
                </h4>
                <p className="text-zinc-400">
                  {isVi
                    ? 'Được đề xuất bởi Webster & Tavares (1985), SAC quy định: khi đảo bất kỳ 1 bit đầu vào (vị trí i), mỗi bit đầu ra (vị trí j) phải thay đổi với xác suất đúng bằng 1/2: P(ΔYⱼ = 1 | ΔXᵢ = 1) = 0.5. Mẫu thử trên giao diện này minh họa tính trực quan của 1 cặp đầu vào (N = 1). Một kiểm định SAC khoa học hoàn chỉnh cần kiểm tra thống kê trên hàng ngàn vector đầu vào ngẫu nhiên cho tất cả vị trí bit.'
                    : 'Introduced by Webster & Tavares (1985), SAC requires that whenever an input bit i is inverted, each output bit j changes with probability 1/2: P(ΔYⱼ = 1 | ΔXᵢ = 1) = 0.5. The visualizer shows an empirical single-sample demonstration (N = 1). A rigorous SAC verification requires statistical testing across thousands of random input vectors for every bit position.'}
                </p>
              </div>

              {/* Hex vs Bit Percentage Resolution */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                <h4 className="font-semibold text-zinc-100 text-sm">
                  {isVi ? '2. Giải thích sự khác biệt giữa Tỷ lệ Bit (~50%) và Tỷ lệ ký tự Hex (~94%)' : '2. Why ~50% Bit Flips Yield ~94% Changed Hex Digits'}
                </h4>
                <p className="text-zinc-400">
                  {isVi
                    ? 'Mỗi ký tự Hex đại diện cho 4 bit nhị phân (1 nibble, 2⁴ = 16 khả năng). Một ký tự Hex chỉ giữ nguyên nếu cả 4 bit của nó đều không đổi, xác suất là (1/2)⁴ = 1/16 = 6.25%. Ngược lại, xác suất ký tự Hex bị thay đổi là 1 - 0.0625 = 93.75%. Vì vậy, việc 60 đến 62 trong số 64 ký tự Hex bị đổi màu là hoàn toàn bình thường và phù hợp toán học với tỷ lệ đảo bit 50%.'
                    : 'Each hex character represents 4 bits (1 nibble). A hex character remains unchanged only if all 4 of its bits remain identical, which occurs with probability (1/2)⁴ = 1/16 = 6.25%. Consequently, the probability of a hex character changing is 1 - 0.0625 = 93.75%, explaining why ~60/64 hex characters typically differ while bit divergence is ~50%.'}
                </p>
              </div>

              {/* Binomial Distribution */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                <h4 className="font-semibold text-zinc-100 text-sm">
                  {isVi ? '3. Phân phối nhị thức của Khoảng cách Hamming' : '3. Binomial Distribution of Hamming Distance'}
                </h4>
                <p className="text-zinc-400">
                  {isVi
                    ? 'Số bit đảo X giữa 2 mã băm độc lập tuân theo phân phối nhị thức X ~ B(n = 256, p = 0.5). Kỳ vọng lý thuyết μ = n·p = 128 bit. Phương sai σ² = n·p·(1 - p) = 64, tương đương độ lệch chuẩn σ = 8 bit. Khoảng 95.4% các cặp mẫu thử ngẫu nhiên sẽ có khoảng cách Hamming nằm trong đoạn [μ - 2σ, μ + 2σ] = [112, 144] bit (tức 43.8% đến 56.3%).'
                    : 'The number of flipped bits X follows a Binomial distribution X ~ B(n = 256, p = 0.5) with mean μ = 128 bits and standard deviation σ = 8 bits. Approximately 95.4% of random sample pairs fall within [112, 144] bits (43.8% to 56.3%).'}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
