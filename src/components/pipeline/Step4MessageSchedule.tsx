import React, { useState } from 'react';
import { uint32ToHex } from '../../utils/binary';
import { InlineMath } from '../MathView';

interface Step4MessageScheduleProps {
  w: number[];
  isVi: boolean;
}

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
  const [showFormulas, setShowFormulas] = useState<boolean>(false);

  const words = w && w.length === 64 ? w : new Array(64).fill(0);
  const t = Math.max(16, Math.min(63, selectedT));

  const wt2 = words[t - 2] ?? 0;
  const wt7 = words[t - 7] ?? 0;
  const wt15 = words[t - 15] ?? 0;
  const wt16 = words[t - 16] ?? 0;

  const s1 = sigma1(wt2);
  const s0 = sigma0(wt15);
  const sum = (s1 + wt7 + s0 + wt16) >>> 0;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-6 font-sans">
      {/* Title & Concept */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">
          {isVi ? 'Bước 4: Mở rộng mảng Word từ 16 lên 64' : 'Step 4: Expand 16 words to 64 words'}
        </h3>
        <p className="text-sm text-slate-300">
          {isVi
            ? 'Vì thuật toán nén cần chạy qua 64 vòng lặp, 16 từ ban đầu (W₀…W₁₅) được mở rộng thành 64 từ (W₀…W₆₃) theo công thức truy hồi.'
            : 'Because compression runs for 64 rounds, the initial 16 words (W₀..W₁₅) are expanded into 64 words (W₀..W₆₃).'}
        </p>
      </div>

      {/* Recurrence Formula */}
      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-center text-sm">
        <div className="text-sky-300 font-mono">
          <InlineMath math="W_t = \sigma_1(W_{t-2}) + W_{t-7} + \sigma_0(W_{t-15}) + W_{t-16} \pmod{2^{32}}" />
        </div>
        <button
          type="button"
          onClick={() => setShowFormulas(!showFormulas)}
          className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
        >
          {showFormulas
            ? (isVi ? 'Ẩn chi tiết hàm bitwise' : 'Hide bitwise details')
            : (isVi ? 'Xem chi tiết hàm xoay bit (σ₀, σ₁)' : 'View bitwise functions (σ₀, σ₁)')}
        </button>

        {showFormulas && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-left text-slate-300">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <strong className="text-sky-400">σ₀(x)</strong> = ROTR⁷(x) ⊕ ROTR¹⁸(x) ⊕ SHR³(x)
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <strong className="text-sky-400">σ₁(x)</strong> = ROTR¹⁷(x) ⊕ ROTR¹⁹(x) ⊕ SHR¹⁰(x)
            </div>
          </div>
        )}
      </div>

      {/* 64 words grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{isVi ? 'Nhấp vào một Word từ W[16]…W[63] để xem cách tính:' : 'Click a Word from W[16]…W[63] to inspect operands:'}</span>
          <div className="flex items-center gap-3">
            <span className="text-sky-400">W₀…W₁₅ (Gốc)</span>
            <span className="text-indigo-400">W₁₆…W₆₃ (Mở rộng)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 max-h-56 overflow-y-auto p-0.5 font-mono text-xs">
          {words.map((val, idx) => {
            const isOrig = idx < 16;
            const isSelected = selectedT === idx;
            const hex = uint32ToHex(val);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (idx >= 16) setSelectedT(idx);
                }}
                className={`p-2 rounded border text-left cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-indigo-950 border-indigo-400 text-white'
                    : isOrig
                      ? 'bg-slate-950 border-slate-800/80 text-sky-400'
                      : 'bg-slate-950 border-slate-800/80 text-indigo-300 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] text-slate-500">W[{idx}]</div>
                <div className="font-bold truncate select-all">0x{hex}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculation for selected W[t] */}
      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-slate-800 font-sans">
          <span>{isVi ? `Phép tính tạo ra W[${t}]:` : `Operands computing W[${t}]:`}</span>
          <strong className="text-white font-mono text-sm">0x{uint32ToHex(sum)}</strong>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
          <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
            <span className="text-slate-500 block">σ₁(W[{t - 2}])</span>
            <span className="font-bold text-sky-400">0x{uint32ToHex(s1)}</span>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
            <span className="text-slate-500 block">W[{t - 7}]</span>
            <span className="font-bold text-slate-200">0x{uint32ToHex(wt7)}</span>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
            <span className="text-slate-500 block">σ₀(W[{t - 15}])</span>
            <span className="font-bold text-sky-400">0x{uint32ToHex(s0)}</span>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
            <span className="text-slate-500 block">W[{t - 16}]</span>
            <span className="font-bold text-slate-200">0x{uint32ToHex(wt16)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
