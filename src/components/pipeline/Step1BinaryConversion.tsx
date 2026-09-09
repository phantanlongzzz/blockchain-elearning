import React, { useState } from 'react';
import { Binary, ArrowRight, Sparkles } from 'lucide-react';

interface Step1BinaryConversionProps {
  input: string;
  onInputChange: (val: string) => void;
  isVi: boolean;
}

export const Step1BinaryConversion: React.FC<Step1BinaryConversionProps> = ({
  input,
  onInputChange,
  isVi,
}) => {
  const [activeCharIndex, setActiveCharIndex] = useState<number | null>(0);

  // Encode UTF-8 / ASCII bytes
  const encoder = new TextEncoder();
  const bytes = Array.from(encoder.encode(input));
  const totalBits = bytes.length * 8;

  // Presets from video and standard testing
  const presets = [
    { label: 'ABCD', desc: isVi ? 'Ví dụ chuẩn trong video' : 'Classic video example' },
    { label: 'abc', desc: isVi ? 'Chuẩn NIST FIPS 180-4' : 'NIST FIPS test vector' },
    { label: 'hello', desc: isVi ? 'Từ ngữ thông dụng' : 'Common greeting' },
    { label: '123456', desc: isVi ? 'Dãy số' : 'Numeric string' },
  ];

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-sm space-y-6 font-sans">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs uppercase font-bold tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>{isVi ? 'Bước 1 / 7 trong thuật toán' : 'Step 1 / 7 in Algorithm'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {isVi
              ? 'Bước 1: Chuyển đổi đầu vào sang dạng Nhị phân (Binary Conversion)'
              : 'Step 1: Input to Binary Conversion'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-300 font-mono font-bold">
            {bytes.length} bytes = {totalBits} bits
          </span>
        </div>
      </div>

      {/* Explanation Callout */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-300 leading-relaxed space-y-2">
        <p>
          <strong className="text-white">{isVi ? 'Nguyên lý hoạt động:' : 'Core Principle:'}</strong>{' '}
          {isVi
            ? 'Máy tính không xử lý trực tiếp ký tự chữ cái. Mỗi ký tự trong chuỗi được chuyển đổi thành mã nhị phân 8-bit (ASCII / UTF-8). Chuỗi nhị phân này là dữ liệu thô ban đầu để SHA-256 tiếp tục xử lý.'
            : 'Computers do not process letters directly. Each character is encoded into an 8-bit binary byte (ASCII / UTF-8). This raw bitstream forms the starting payload for SHA-256.'}
        </p>
        <p className="text-xs text-slate-400 font-mono">
          {isVi
            ? 'Ví dụ trong video: Chuỗi "ABCD" gồm 4 ký tự × 8 = 32 bits (01000001 01000010 01000011 01000100).'
            : 'Example from video: String "ABCD" has 4 characters × 8 = 32 bits (01000001 01000010 01000011 01000100).'}
        </p>
      </div>

      {/* Input & Quick Presets */}
      <div className="space-y-3">
        <label htmlFor="step1-input" className="block text-xs uppercase font-semibold text-slate-300 tracking-wider">
          {isVi ? 'Nhập văn bản thử nghiệm:' : 'Enter test text:'}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="step1-input"
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="ABCD"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isVi ? 'Mẫu nhanh:' : 'Presets:'}
            </span>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onInputChange(p.label)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-mono font-medium ${
                  input === p.label
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
                title={p.desc}
              >
                &ldquo;{p.label}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Character by Character Interactive Table */}
      {bytes.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold uppercase tracking-wider">
              {isVi ? 'Bảng phân rã từng ký tự (Nhấp để xem chi tiết):' : 'Per-Character Breakdown (Click to inspect):'}
            </span>
            <span className="text-slate-400">
              {bytes.length} {isVi ? 'ký tự' : 'characters'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {bytes.map((byteVal, idx) => {
              const char = input[idx] || String.fromCharCode(byteVal);
              const hex = byteVal.toString(16).padStart(2, '0').toUpperCase();
              const binary = byteVal.toString(2).padStart(8, '0');
              const isSelected = activeCharIndex === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveCharIndex(idx)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-950 border-sky-500 ring-2 ring-sky-500/30 text-white'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="text-xl font-bold font-mono text-sky-400 mb-1">
                    {char === ' ' ? '␣' : char}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Dec: <span className="text-white font-semibold">{byteVal}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Hex: <span className="text-amber-300 font-semibold">0x{hex}</span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-emerald-400 font-bold tracking-tight">
                    {binary}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Character Deep Dive */}
          {activeCharIndex !== null && bytes[activeCharIndex] !== undefined && (
            <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-sky-900/50 text-sky-300 border border-sky-600/50 font-bold text-sm">
                  Ký tự #{activeCharIndex + 1}: &ldquo;{input[activeCharIndex] || String.fromCharCode(bytes[activeCharIndex])}&rdquo;
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:inline" />
                <span className="text-slate-300">
                  ASCII: <strong className="text-white">{bytes[activeCharIndex]}</strong>
                </span>
                <span className="text-slate-300">
                  Hex: <strong className="text-amber-300">0x{bytes[activeCharIndex].toString(16).padStart(2, '0').toUpperCase()}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm tracking-wider">
                <Binary className="w-4 h-4" />
                <span>{bytes[activeCharIndex].toString(2).padStart(8, '0')}</span>
              </div>
            </div>
          )}

          {/* Complete Concatenated Binary Stream */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
              <span className="font-semibold text-slate-200">
                {isVi ? 'Chuỗi nhị phân liên tục hoàn chỉnh (Dữ liệu vào Bước 2):' : 'Complete Concatenated Bitstream (Passed to Step 2):'}
              </span>
              <span className="text-sky-400 font-bold">{totalBits} bits</span>
            </div>
            <div className="p-3 bg-slate-900/90 rounded-lg text-emerald-400 text-xs sm:text-sm break-all font-bold tracking-wider leading-relaxed select-all border border-slate-800">
              {bytes.map((b) => b.toString(2).padStart(8, '0')).join(' ')}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 italic">
          {isVi ? 'Hãy nhập ít nhất 1 ký tự để xem chuyển đổi nhị phân.' : 'Please enter at least 1 character to inspect binary conversion.'}
        </div>
      )}
    </div>
  );
};
