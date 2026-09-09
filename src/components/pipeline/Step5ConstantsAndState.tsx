import React, { useState } from 'react';
import { Key, ShieldCheck, Database } from 'lucide-react';
import { INITIAL_H, K } from '../../utils/sha256';
import { uint32ToHex } from '../../utils/binary';
import { InlineMath } from '../MathView';

interface Step5ConstantsAndStateProps {
  isVi: boolean;
}

// First 8 prime numbers for H
const PRIMES_8 = [2, 3, 5, 7, 11, 13, 17, 19];

export const Step5ConstantsAndState: React.FC<Step5ConstantsAndStateProps> = ({
  isVi,
}) => {
  const [selectedHIndex, setSelectedHIndex] = useState<number>(0);
  const [showAllK, setShowAllK] = useState<boolean>(false);

  const varNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-sm space-y-6 font-sans">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs uppercase font-bold tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>{isVi ? 'Bước 5 / 7 trong thuật toán' : 'Step 5 / 7 in Algorithm'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {isVi
              ? 'Bước 5: Khởi tạo Hằng số & Biến trạng thái (H, K, A…H)'
              : 'Step 5: Constants & Initial State Setup (H, K, A…H)'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Nothing-Up-My-Sleeve Numbers
          </span>
        </div>
      </div>

      {/* Cryptographic Origin Callout */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
        <p>
          <strong className="text-white">{isVi ? 'Nguồn gốc toán học minh bạch:' : 'Transparent Mathematical Origin:'}</strong>{' '}
          {isVi
            ? 'Để chứng minh NSA không cài "cửa sau" (backdoor) vào SHA-256, toàn bộ các hằng số được sinh ra từ các hằng số toán học tự nhiên thuần khiết:'
            : 'To prove no hidden backdoors exist, all constants in SHA-256 are mathematically derived from natural primes:'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="font-bold text-sky-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>{isVi ? '8 Giá trị băm ban đầu H₀…H₇:' : '8 Initial Hash Values H₀…H₇:'}</span>
            </div>
            <p className="text-slate-400">
              {isVi
                ? 'Lấy từ 32 bit đầu tiên của phần phân số căn bậc hai (√) của 8 số nguyên tố đầu tiên: 2, 3, 5, 7, 11, 13, 17, 19.'
                : 'Derived from the first 32 bits of the fractional parts of square roots (√) of first 8 primes: 2, 3, 5, 7, 11, 13, 17, 19.'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>{isVi ? '64 Hằng số vòng K₀…K₆₃:' : '64 Round Constants K₀…K₆₃:'}</span>
            </div>
            <p className="text-slate-400">
              {isVi
                ? 'Lấy từ 32 bit đầu tiên của phần phân số căn bậc ba (∛) của 64 số nguyên tố đầu tiên (từ số 2 đến 311).'
                : 'Derived from the first 32 bits of the fractional parts of cube roots (∛) of first 64 primes (from 2 up to 311).'}
            </p>
          </div>
        </div>
      </div>

      {/* 8 Working Variables A..H Initialized from H0..H7 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold uppercase tracking-wider">
            {isVi
              ? '8 Biến làm việc (A, B, C, D, E, F, G, H) được khởi tạo bằng đúng H₀…H₇:'
              : '8 Working Variables (A, B, C, D, E, F, G, H) Initialized to H₀…H₇:'}
          </span>
          <span className="text-slate-400 font-mono">
            A=H[0], B=H[1], ..., H=H[7]
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 font-mono">
          {INITIAL_H.map((hVal, idx) => {
            const hex = uint32ToHex(hVal);
            const varName = varNames[idx];
            const prime = PRIMES_8[idx];
            const isSelected = selectedHIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedHIndex(idx)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-950 border-sky-500 ring-2 ring-sky-500/40 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-sky-400 font-sans">
                    Biến {varName}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    √{prime}
                  </span>
                </div>
                <div className="text-xs font-bold text-white tracking-wide select-all">
                  0x{hex}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-sans">
                  H[{idx}] ban đầu
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail on selected H value */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-sky-900/60 text-sky-300 font-bold border border-sky-600/50">
            Biến {varNames[selectedHIndex]} = H[{selectedHIndex}]
          </span>
          <span className="text-slate-300">
            Căn bậc 2 số nguyên tố <strong className="text-white">√{PRIMES_8[selectedHIndex]}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Giá trị Hex:</span>
          <strong className="text-sky-400 font-bold text-sm">
            0x{uint32ToHex(INITIAL_H[selectedHIndex])}
          </strong>
        </div>
      </div>

      {/* 64 Round Constants K[0..63] Preview */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold uppercase tracking-wider">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{isVi ? 'Bảng 64 Hằng số vòng K[0..63] (Căn bậc 3 của 64 số nguyên tố):' : '64 Round Constants K[0..63] (Cube roots of 64 primes):'}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAllK(!showAllK)}
            className="text-xs text-sky-400 hover:text-sky-300 underline cursor-pointer font-sans"
          >
            {showAllK ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Xem toàn bộ 64 hằng số' : 'Expand all 64 constants')}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono max-h-56 overflow-y-auto p-1">
          {(showAllK ? K : K.slice(0, 16)).map((kVal, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800/90 text-left">
              <span className="text-[10px] text-amber-400 block font-sans">K[{idx}]</span>
              <span className="text-xs font-bold text-slate-200 block truncate">
                0x{uint32ToHex(kVal)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
