import React, { useState } from 'react';
import { uint32ToHex } from '../../utils/binary';

interface Step3SixteenWordsProps {
  input: string;
  w: number[];
  paddedBytes: Uint8Array;
  isVi: boolean;
}

export const Step3SixteenWords: React.FC<Step3SixteenWordsProps> = ({
  input,
  w,
  isVi,
}) => {
  const [selectedWordIdx, setSelectedWordIdx] = useState<number>(0);

  const inputBytesCount = new TextEncoder().encode(input).length;
  const first16Words = (w || []).slice(0, 16);

  const selectedWord = first16Words[selectedWordIdx] ?? 0;
  const wordHex = uint32ToHex(selectedWord);
  const wordBin = (selectedWord >>> 0).toString(2).padStart(32, '0');

  // 4 constituent bytes for selected word
  const bytes = [
    (selectedWord >>> 24) & 0xff,
    (selectedWord >>> 16) & 0xff,
    (selectedWord >>> 8) & 0xff,
    selectedWord & 0xff,
  ];

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-6 font-sans">
      {/* Title & Concept */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">
          {isVi ? 'Bước 3: Chia khối thành 16 từ (Words)' : 'Step 3: Split block into 16 words'}
        </h3>
        <p className="text-sm text-slate-300">
          {isVi
            ? 'Khối 512-bit đã đệm được chia thành 16 khối nhỏ 32-bit (gọi là Word, ký hiệu từ W₀ đến W₁₅). Mỗi Word gồm 4 bytes ghép lại theo thứ tự Big-Endian.'
            : 'The 512-bit block is divided into 16 32-bit words (denoted W₀ to W₁₅). Each word is 4 bytes combined in Big-Endian order.'}
        </p>
      </div>

      {/* Grid of 16 words */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{isVi ? 'Nhấp vào một Word để xem chi tiết 4 bytes:' : 'Click a Word to view its 4 bytes:'}</span>
          <span className="font-mono">W₀ … W₁₅</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono">
          {first16Words.map((val, idx) => {
            const hex = uint32ToHex(val);
            const isSelected = selectedWordIdx === idx;
            const startByte = idx * 4;
            const hasMsg = startByte < inputBytesCount;
            const isLen = idx >= 14;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedWordIdx(idx)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-sky-950 border-sky-500 text-white'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className={isSelected ? 'text-sky-400 font-bold' : 'text-slate-400'}>
                    W[{idx}]
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {hasMsg ? 'data' : isLen ? 'len' : 'pad'}
                  </span>
                </div>
                <div className="text-xs font-bold text-white tracking-wide truncate">
                  0x{hex}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected word inspection */}
      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3 text-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sky-400">W[{selectedWordIdx}]</span>
            <span className="font-mono text-white font-bold text-base">0x{wordHex}</span>
            <span className="text-xs text-slate-400 font-sans">
              ({isVi ? `Byte #${selectedWordIdx * 4} đến #${selectedWordIdx * 4 + 3}` : `Bytes #${selectedWordIdx * 4} to #${selectedWordIdx * 4 + 3}`})
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Dec: {selectedWord >>> 0}
          </span>
        </div>

        {/* 4 Bytes breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          {bytes.map((b, bIdx) => {
            const hex = b.toString(16).padStart(2, '0').toUpperCase();
            const bin = b.toString(2).padStart(8, '0');
            const isAscii = b >= 32 && b <= 126;

            return (
              <div key={bIdx} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Byte {bIdx}</span>
                  {isAscii && <span className="text-sky-300 font-bold">&lsquo;{String.fromCharCode(b)}&rsquo;</span>}
                </div>
                <div className="font-bold text-amber-300">0x{hex}</div>
                <div className="text-[11px] text-emerald-400">{bin}</div>
              </div>
            );
          })}
        </div>

        {/* Binary representation */}
        <div className="text-xs font-mono text-emerald-400 bg-slate-900 p-2.5 rounded border border-slate-800 tracking-wider break-all select-all">
          {wordBin.match(/.{1,8}/g)?.join(' ') || wordBin}
        </div>
      </div>
    </div>
  );
};
