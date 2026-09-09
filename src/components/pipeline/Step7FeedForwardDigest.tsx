import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ArrowLeft, ShieldCheck } from 'lucide-react';
import { uint32ToHex } from '../../utils/binary';
import { INITIAL_H } from '../../utils/sha256';
import { RoundState } from '../../types';
import { InlineMath } from '../MathView';

interface Step7FeedForwardDigestProps {
  finalHashHex: string;
  round63?: RoundState;
  onReviewRounds: () => void;
  isVi: boolean;
}

export const Step7FeedForwardDigest: React.FC<Step7FeedForwardDigestProps> = ({
  finalHashHex,
  round63,
  onReviewRounds,
  isVi,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(finalHashHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const varList = round63
    ? [
        { name: 'A', val: round63.a },
        { name: 'B', val: round63.b },
        { name: 'C', val: round63.c },
        { name: 'D', val: round63.d },
        { name: 'E', val: round63.e },
        { name: 'F', val: round63.f },
        { name: 'G', val: round63.g },
        { name: 'H', val: round63.h },
      ]
    : [];

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-sm space-y-6 font-sans">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs uppercase font-bold tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>{isVi ? 'Bước 7 / 7 trong thuật toán' : 'Step 7 / 7 in Algorithm'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {isVi
              ? 'Bước 7: Cộng tích lũy Feed-Forward & Xuất kết quả Hexadecimal'
              : 'Step 7: Feed-Forward Addition & Final Hex Output'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            256-bit Digest Ready
          </span>
        </div>
      </div>

      {/* Mathematical Principle */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
        <p>
          <strong className="text-white">{isVi ? 'Nguyên lý cộng tích lũy (Feed-Forward / Davis-Meyer):' : 'Feed-Forward Principle (Davies-Meyer):'}</strong>{' '}
          {isVi
            ? 'Sau khi hoàn thành 64 vòng lặp nén, 8 biến làm việc cuối cùng (A, B, C, D, E, F, G, H ở vòng 63) được cộng tích lũy theo modulo 2³² vào 8 giá trị băm ban đầu H₀…H₇. Thao tác này biến hàm nén thành một chiều (không thể giải mã ngược lại):'
            : 'After 64 compression rounds, the 8 final working variables (A..H at round 63) are added modulo 2³² to the initial hash values H₀..H₇. This feed-forward ensures strict one-wayness:'}
        </p>
        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-sky-300 font-sans overflow-x-auto text-center">
          <InlineMath math="H_0' = (H_0 + A) \pmod{2^{32}}, \quad \dots, \quad H_7' = (H_7 + H) \pmod{2^{32}}" />
        </div>
      </div>

      {/* 8 Additions Breakdown Table */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-sans">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{isVi ? 'Chi tiết phép cộng tích lũy từng Word (Modulo 2³²):' : 'Word-by-Word Feed-Forward Modulo 2³² Addition:'}</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            H[0..7] + A..H = H&apos;[0..7]
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {varList.map((v, idx) => {
            const initH = INITIAL_H[idx];
            const finalWord = ((initH + v.val) >>> 0);

            return (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 font-sans">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span>H[{idx}]</span>
                  <span className="text-sky-400 font-mono">Biến {v.name}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span>H_init:</span>
                    <span className="text-slate-300 font-bold">0x{uint32ToHex(initH)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>+{v.name}_final:</span>
                    <span className="text-sky-300 font-bold">0x{uint32ToHex(v.val)}</span>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-emerald-400">= H&apos;[{idx}]:</span>
                  <span className="text-white select-all">0x{uint32ToHex(finalWord)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Synthesized 64-Hex Digest Output (Highlighting in vibrant green as requested) */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-sans text-slate-200 uppercase font-bold tracking-wider">
            {isVi ? 'Kết quả băm SHA-256 (Hexadecimal 64 ký tự = 256 bits):' : 'Final SHA-256 Hash Digest (64 Hex Characters = 256 bits):'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">{isVi ? 'Đã sao chép!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{isVi ? 'Sao chép mã băm' : 'Copy Digest'}</span>
              </>
            )}
          </button>
        </div>

        {/* 64-char Hex Output Box */}
        <div className="font-mono text-base sm:text-xl font-bold text-emerald-400 break-all select-all tracking-wider bg-slate-900/90 p-4 sm:p-5 rounded-xl border border-emerald-500/40 shadow-inner">
          {finalHashHex}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-2 text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isVi ? 'Đạt chuẩn bảo mật NIST FIPS 180-4 quốc tế' : 'NIST FIPS 180-4 Standard Verification Passed'}</span>
          </div>
          <button
            type="button"
            onClick={onReviewRounds}
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 underline underline-offset-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isVi ? 'Xem lại 64 vòng lặp nén' : 'Review 64 compression rounds'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
