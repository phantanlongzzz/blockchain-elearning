import React, { useState } from 'react';
import { Network, ArrowRight, Calculator } from 'lucide-react';
import { uint32ToHex } from '../../utils/binary';
import { InlineMath } from '../MathView';

interface Step4MessageScheduleProps {
  w: number[]; // 64 words
  isVi: boolean;
}

// Bitwise helper calculations
function rotr(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}
function shr(n: number, x: number): number {
  return x >>> n;
}
function sigma0(x: number): number {
  return (rotr(7, x) ^ rotr(18, x) ^ shr(3, x)) >>> 0;
}
function sigma1(x: number): number {
  return (rotr(17, x) ^ rotr(19, x) ^ shr(10, x)) >>> 0;
}

export const Step4MessageSchedule: React.FC<Step4MessageScheduleProps> = ({
  w,
  isVi,
}) => {
  const [selectedT, setSelectedT] = useState<number>(16);

  const words = w && w.length === 64 ? w : new Array(64).fill(0);

  // For selected t >= 16: calculate operands
  const t = Math.max(16, Math.min(63, selectedT));
  const wt2 = words[t - 2] ?? 0;
  const wt7 = words[t - 7] ?? 0;
  const wt15 = words[t - 15] ?? 0;
  const wt16 = words[t - 16] ?? 0;

  const s1 = sigma1(wt2);
  const s0 = sigma0(wt15);
  const sum = (s1 + wt7 + s0 + wt16) >>> 0;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-sm space-y-6 font-sans">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs uppercase font-bold tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>{isVi ? 'Bước 4 / 7 trong thuật toán' : 'Step 4 / 7 in Algorithm'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {isVi
              ? 'Bước 4: Mở rộng mảng Word từ 16 lên 64 (W₀ … W₆₃)'
              : 'Step 4: Message Schedule Expansion (W₀ … W₆₃)'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono font-bold">
            16 Words Gốc + 48 Words Mở Rộng = 64 Words
          </span>
        </div>
      </div>

      {/* Recurrence Formula Callout */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
        <p>
          <strong className="text-white">{isVi ? 'Công thức truy hồi mật mã:' : 'Cryptographic Recurrence Formula:'}</strong>{' '}
          {isVi
            ? '16 từ ban đầu (W₀ đến W₁₅) được mở rộng thành 64 từ (W₁₆ đến W₆₃) để cung cấp dữ liệu cho 64 vòng lặp nén. Mỗi từ W[t] (t ≥ 16) được tính từ 4 từ đứng trước nó:'
            : 'The 16 initial words (W₀..W₁₅) are expanded into 64 words (W₁₆..W₆₃) to feed the 64 compression rounds. Each word W[t] (t ≥ 16) is computed from 4 previous words:'}
        </p>

        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-sky-300 font-sans overflow-x-auto text-center">
          <InlineMath math="W_t = \sigma_1(W_{t-2}) + W_{t-7} + \sigma_0(W_{t-15}) + W_{t-16} \pmod{2^{32}}" />
        </div>

        {/* Bitwise operations explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="font-bold text-sky-400 block font-mono">ROTRⁿ(x) — Xoay phải</span>
            <span className="text-slate-400 block">
              {isVi ? 'Dịch các bit sang phải n vị trí; các bit tràn ra ở cuối quay trở lại đầu bên trái.' : 'Rotates bits right by n positions; bits falling off the right wrap around to the left.'}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="font-bold text-emerald-400 block font-mono">SHRⁿ(x) — Dịch phải</span>
            <span className="text-slate-400 block">
              {isVi ? 'Dịch các bit sang phải n vị trí; chèn bit 0 vào đầu bên trái.' : 'Shifts bits right by n positions; vacated bits on the left are filled with zeros.'}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-400 block font-mono">⊕ — XOR (Exclusive OR)</span>
            <span className="text-slate-400 block">
              {isVi ? 'Trả về 1 nếu hai bit khác nhau, 0 nếu hai bit giống nhau.' : 'Returns 1 if bits differ, 0 if identical.'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-indigo-400 font-bold">σ₀(x)</span> = ROTR⁷(x) ⊕ ROTR¹⁸(x) ⊕ SHR³(x)
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-indigo-400 font-bold">σ₁(x)</span> = ROTR¹⁷(x) ⊕ ROTR¹⁹(x) ⊕ SHR¹⁰(x)
          </div>
        </div>
      </div>

      {/* 64 Words Grid with Legend */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
          <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-sky-400" />
            {isVi ? 'Danh sách 64 Word (Nhấp vào W[16]…W[63] để xem công thức tính):' : '64-Word Message Schedule (Click W[16]…W[63] to inspect recurrence):'}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
              <span className="text-slate-400">W[0..15] Gốc</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
              <span className="text-slate-400">W[16..63] Mở rộng</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 max-h-72 overflow-y-auto p-1 font-mono">
          {words.map((wordVal, idx) => {
            const isOriginal = idx < 16;
            const isSelected = selectedT === idx;
            const hex = uint32ToHex(wordVal);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (idx >= 16) setSelectedT(idx);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950 border-indigo-400 ring-2 ring-indigo-400/40 text-white shadow-md'
                    : isOriginal
                      ? 'bg-sky-950/40 border-sky-500/30 text-sky-300 hover:border-sky-400'
                      : 'bg-slate-950 border-slate-800 hover:border-indigo-500/50 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className={`font-bold ${isOriginal ? 'text-sky-400' : 'text-indigo-400'}`}>
                    W[{idx}]
                  </span>
                  {idx >= 16 && (
                    <span className="text-[10px] text-slate-500 font-sans">calc</span>
                  )}
                </div>
                <span className="text-xs font-bold text-white block select-all truncate">
                  0x{hex}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Word Recurrence Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-bold text-base sm:text-lg">
              {isVi ? `Chi tiết tính toán W[${t}]:` : `Detailed Computation for W[${t}]:`}
            </span>
            <span className="px-2.5 py-1 rounded bg-indigo-900/60 border border-indigo-500/50 text-indigo-300 font-mono font-bold text-sm">
              0x{uint32ToHex(words[t])}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            t = {t} (≥ 16)
          </span>
        </div>

        {/* 4 Operands Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-sans">1. Toán hạng W[t-2]:</span>
            <div className="flex justify-between items-center text-slate-200">
              <span>W[{t - 2}]:</span>
              <strong className="text-sky-400 font-bold">0x{uint32ToHex(wt2)}</strong>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-indigo-300">
              <span>σ₁(W[{t - 2}]):</span>
              <strong className="font-bold">0x{uint32ToHex(s1)}</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-sans">2. Toán hạng W[t-7]:</span>
            <div className="flex justify-between items-center text-slate-200">
              <span>W[{t - 7}]:</span>
              <strong className="text-sky-400 font-bold">0x{uint32ToHex(wt7)}</strong>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-sans">
              (Dùng trực tiếp giá trị)
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-sans">3. Toán hạng W[t-15]:</span>
            <div className="flex justify-between items-center text-slate-200">
              <span>W[{t - 15}]:</span>
              <strong className="text-sky-400 font-bold">0x{uint32ToHex(wt15)}</strong>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-indigo-300">
              <span>σ₀(W[{t - 15}]):</span>
              <strong className="font-bold">0x{uint32ToHex(s0)}</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-sans">4. Toán hạng W[t-16]:</span>
            <div className="flex justify-between items-center text-slate-200">
              <span>W[{t - 16}]:</span>
              <strong className="text-sky-400 font-bold">0x{uint32ToHex(wt16)}</strong>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-sans">
              (Dùng trực tiếp giá trị)
            </div>
          </div>
        </div>

        {/* Sum Formula in Action */}
        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5 text-slate-300">
            <span>W[{t}] = </span>
            <span className="text-indigo-400 font-bold">0x{uint32ToHex(s1)}</span>
            <span>+</span>
            <span className="text-sky-400 font-bold">0x{uint32ToHex(wt7)}</span>
            <span>+</span>
            <span className="text-indigo-400 font-bold">0x{uint32ToHex(s0)}</span>
            <span>+</span>
            <span className="text-sky-400 font-bold">0x{uint32ToHex(wt16)}</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/40 text-sm">
              0x{uint32ToHex(sum)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
