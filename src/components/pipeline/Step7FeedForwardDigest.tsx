import React, { useState } from 'react';
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
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-6 font-sans">
      {/* Title & Concept */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">
          {isVi ? 'Bước 7: Cộng tích lũy và xuất mã băm' : 'Step 7: Feed-forward addition & hex digest'}
        </h3>
        <p className="text-sm text-slate-300">
          {isVi
            ? 'Sau 64 vòng nén, 8 biến làm việc (A…H) được cộng theo modulo 2³² vào 8 giá trị băm ban đầu (H₀…H₇). Kết quả sau đó được ghép thành chuỗi 64 ký tự Hex (256 bit).'
            : 'After 64 rounds, the 8 working variables (A..H) are added modulo 2³² to the initial hash values (H₀..H₇), producing the final 64-hex (256-bit) digest.'}
        </p>
      </div>

      {/* Formula */}
      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center text-sm font-mono text-sky-300">
        <InlineMath math="H_0' = (H_0 + A) \pmod{2^{32}}, \quad \dots, \quad H_7' = (H_7 + H) \pmod{2^{32}}" />
      </div>

      {/* 8 Additions Breakdown Table */}
      <div className="space-y-2">
        <div className="text-xs text-slate-400">
          {isVi ? 'Phép cộng từng Word (H_ban_đầu + Biến_vòng_63 = H_mới):' : 'Word-by-word addition (H_init + Var_round63 = H_final):'}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          {varList.map((v, idx) => {
            const initH = INITIAL_H[idx];
            const finalWord = ((initH + v.val) >>> 0);

            return (
              <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px] font-sans">
                  <span>H[{idx}] + {v.name}</span>
                </div>
                <div className="text-slate-400 text-[11px] flex justify-between">
                  <span>0x{uint32ToHex(initH)}</span>
                  <span>+ 0x{uint32ToHex(v.val)}</span>
                </div>
                <div className="pt-1 border-t border-slate-800 text-emerald-400 font-bold flex justify-between text-xs">
                  <span>H&apos;[{idx}]:</span>
                  <span className="text-white select-all">0x{uint32ToHex(finalWord)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Hex Digest Output Box */}
      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">
            {isVi ? 'Giá trị băm SHA-256 hoàn chỉnh (64 ký tự Hex = 256 bits):' : 'Complete SHA-256 Digest (64 Hex characters = 256 bits):'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans cursor-pointer transition-colors"
          >
            {copied ? (isVi ? 'Đã sao chép!' : 'Copied!') : (isVi ? 'Sao chép' : 'Copy')}
          </button>
        </div>

        <div className="font-mono text-sm sm:text-base font-bold text-emerald-400 break-all select-all tracking-wider bg-slate-900 p-3.5 rounded border border-emerald-500/30">
          {finalHashHex}
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onReviewRounds}
            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            {isVi ? '← Quay lại xem 64 vòng nén' : '← Back to 64 compression rounds'}
          </button>
        </div>
      </div>
    </div>
  );
};
