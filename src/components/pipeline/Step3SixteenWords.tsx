import React, { useState } from 'react';
import { LayoutGrid, Hash } from 'lucide-react';
import { uint32ToHex } from '../../utils/binary';

interface Step3SixteenWordsProps {
  input: string;
  w: number[]; // At least 16 words
  paddedBytes: Uint8Array;
  isVi: boolean;
}

export const Step3SixteenWords: React.FC<Step3SixteenWordsProps> = ({
  input,
  w,
  paddedBytes,
  isVi,
}) => {
  const [selectedWordIdx, setSelectedWordIdx] = useState<number>(0);

  const inputBytesCount = new TextEncoder().encode(input).length;

  // Extract first 16 words (W_0 to W_15)
  const first16Words = (w || []).slice(0, 16);

  const selectedWord = first16Words[selectedWordIdx] ?? 0;
  const wordHex = uint32ToHex(selectedWord);
  const wordBin = (selectedWord >>> 0).toString(2).padStart(32, '0');

  // 4 constituent bytes for selected word
  const byte0 = (selectedWord >>> 24) & 0xff;
  const byte1 = (selectedWord >>> 16) & 0xff;
  const byte2 = (selectedWord >>> 8) & 0xff;
  const byte3 = selectedWord & 0xff;
  const constituentBytes = [byte0, byte1, byte2, byte3];

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-sm space-y-6 font-sans">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs uppercase font-bold tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>{isVi ? 'Bước 3 / 7 trong thuật toán' : 'Step 3 / 7 in Algorithm'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {isVi
              ? 'Bước 3: Chia khối thành 16 Word 32-bit (W₀ … W₁₅)'
              : 'Step 3: Split Block into 16 32-bit Words (W₀ … W₁₅)'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-300 font-mono font-bold">
            16 Words × 32 bits = 512 bits
          </span>
        </div>
      </div>

      {/* Principle Explanation */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-300 leading-relaxed space-y-2">
        <p>
          <strong className="text-white">{isVi ? 'Nguyên lý chia Word:' : 'Word Division Principle:'}</strong>{' '}
          {isVi
            ? 'SHA-256 là thuật toán vận hành trên đơn vị Word 32-bit. Khối 512 bit đã đệm được cắt thành đúng 16 Word nhỏ (được ký hiệu là W₀ đến W₁₅). Mỗi Word gồm 4 bytes (32 bits) theo thứ tự Big-Endian (byte có trọng số cao nhất đứng trước).'
            : 'SHA-256 operates on 32-bit Word units. The padded 512-bit block is split into 16 initial Words (denoted W₀ to W₁₅). Each Word contains 4 bytes (32 bits) in Big-Endian order.'}
        </p>
        <p className="text-xs text-slate-400 font-mono">
          {isVi
            ? 'Ví dụ: Với chuỗi "ABCD", 4 byte mã ASCII lần lượt là 0x41, 0x42, 0x43, 0x44 ghép lại thành W[0] = 0x41424344.'
            : 'Example: For string "ABCD", ASCII bytes 0x41, 0x42, 0x43, 0x44 combine into W[0] = 0x41424344.'}
        </p>
      </div>

      {/* Grid of 16 Words */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />
            {isVi ? 'Danh sách 16 Word (Nhấp vào Word để kiểm tra 4 byte):' : '16 Words Grid (Click to inspect 4 bytes):'}
          </span>
          <span className="text-slate-400 font-mono">W[0] → W[15]</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {first16Words.map((wordVal, idx) => {
            const hex = uint32ToHex(wordVal);
            const isSelected = selectedWordIdx === idx;
            const startByte = idx * 4;
            const hasMsg = startByte < inputBytesCount;
            const isLenWord = idx >= 14;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedWordIdx(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-950 border-sky-500 ring-2 ring-sky-500/40 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold font-mono ${isSelected ? 'text-sky-300' : 'text-slate-400'}`}>
                    W[{idx}]
                  </span>
                  {hasMsg ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" title="Chứa dữ liệu gốc" />
                  ) : isLenWord ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Chứa độ dài 64-bit" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" title="Đệm 0" />
                  )}
                </div>
                <div className="font-mono text-xs sm:text-[13px] font-bold text-white tracking-wide truncate select-all">
                  0x{hex}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  Byte #{startByte}–{startByte + 3}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Word Deep Inspection */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-sky-900/60 border border-sky-600/60 text-sky-300 font-mono font-bold text-sm">
              W[{selectedWordIdx}]
            </span>
            <span className="text-white font-bold font-mono text-base sm:text-lg">
              0x{wordHex}
            </span>
            <span className="text-xs text-slate-400">
              (Bytes #{selectedWordIdx * 4} → #{selectedWordIdx * 4 + 3})
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Giá trị thập phân: <strong className="text-slate-200">{selectedWord >>> 0}</strong>
          </span>
        </div>

        {/* 4 Constituent Bytes */}
        <div className="space-y-2">
          <span className="text-xs text-slate-300 uppercase font-semibold tracking-wider block">
            {isVi ? '4 Byte cấu thành Word (Thứ tự Big-Endian):' : '4 Constituent Bytes (Big-Endian Order):'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            {constituentBytes.map((b, bIdx) => {
              const globalByteIndex = selectedWordIdx * 4 + bIdx;
              const hex = b.toString(16).padStart(2, '0').toUpperCase();
              const bin = b.toString(2).padStart(8, '0');
              const isPrintable = b >= 32 && b <= 126;

              return (
                <div key={bIdx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Byte {bIdx} (Tổng #{globalByteIndex})</span>
                    {isPrintable && (
                      <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-bold border border-sky-800">
                        &lsquo;{String.fromCharCode(b)}&rsquo;
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-amber-300">
                    0x{hex}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-bold tracking-tight">
                    {bin}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 32-bit Binary string display */}
        <div className="space-y-1 pt-2 font-mono">
          <span className="text-xs text-slate-400 font-sans">
            {isVi ? 'Biểu diễn nhị phân 32-bit (chia 4 nhóm 8 bit):' : '32-Bit Binary Representation (4 octet groups):'}
          </span>
          <div className="p-3 bg-slate-900 rounded-lg text-xs sm:text-sm text-emerald-400 font-bold tracking-wider select-all border border-slate-800">
            {wordBin.match(/.{1,8}/g)?.join(' ') || wordBin}
          </div>
        </div>
      </div>
    </div>
  );
};
