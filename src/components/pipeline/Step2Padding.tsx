import React, { useState } from 'react';
import { DetailedSha256Breakdown } from '../../types';

interface Step2PaddingProps {
  input: string;
  breakdown: DetailedSha256Breakdown;
  isVi: boolean;
}

export const Step2Padding: React.FC<Step2PaddingProps> = ({
  breakdown,
  isVi,
}) => {
  const [viewMode, setViewMode] = useState<'bits' | 'bytes'>('bits');

  const originalBits = breakdown.originalBitsLength;
  const paddedBits = breakdown.paddedBitsLength;
  const zerosCount = breakdown.paddingZerosCount;
  const paddedBytes = breakdown.paddedMessageBytes;

  // Total blocks
  const blockCount = breakdown.blockCount;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-6 font-sans">
      {/* Step Title & Concept */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">
          {isVi ? 'Bước 2: Đệm bit để đủ 512 bit' : 'Step 2: Pad bits to 512-bit block'}
        </h3>
        <p className="text-sm text-slate-300">
          {isVi
            ? 'Thuật toán SHA-256 xử lý dữ liệu theo từng khối 512 bit. Nếu dữ liệu chưa đủ kích thước, thuật toán thực hiện đệm theo đúng 3 quy tắc.'
            : 'SHA-256 processes data in 512-bit blocks. Input is padded using 3 strict rules.'}
        </p>
      </div>

      {/* 3 Clear Rules */}
      <div className="space-y-2 text-sm text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800">
        <div className="font-semibold text-white mb-1">
          {isVi ? '3 Quy tắc đệm chuẩn:' : '3 Padding Rules:'}
        </div>
        <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm">
          <li>
            <strong className="text-amber-300">{isVi ? 'Thêm bit 1:' : 'Append 1 bit:'}</strong>{' '}
            {isVi ? 'Gắn ngay sau dữ liệu gốc (tương ứng byte 0x80).' : 'Immediately after the original message (byte 0x80).'}
          </li>
          <li>
            <strong className="text-emerald-400">{isVi ? 'Thêm các bit 0:' : 'Append 0 bits:'}</strong>{' '}
            {isVi
              ? `Chèn liên tiếp các bit 0 (${zerosCount} bit) cho đến khi khối đạt đúng 448 bit (chừa 64 bit cuối).`
              : `Insert 0 bits (${zerosCount} bits) until block length reaches 448 bits (leaving 64 bits for length).`}
          </li>
          <li>
            <strong className="text-rose-400">{isVi ? 'Ghi độ dài 64-bit:' : 'Append 64-bit length:'}</strong>{' '}
            {isVi
              ? `64 bit cuối cùng lưu độ dài thông điệp ban đầu (${originalBits} bit).`
              : `The final 64 bits encode original message length (${originalBits} bits).`}
          </li>
        </ol>

        <div className="pt-2 text-xs font-mono text-slate-400 border-t border-slate-800">
          {originalBits} bit gốc + 1 bit đệm + {zerosCount} bit 0 + 64 bit độ dài = <strong className="text-white">{paddedBits} bit ({blockCount} khối 512-bit)</strong>
        </div>
      </div>

      {/* Visual Stream Container */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
              <span>{isVi ? `Dữ liệu gốc (${originalBits} bit)` : `Original (${originalBits}b)`}</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span>Bit 1 (0x80)</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>{isVi ? `Đệm 0 (${zerosCount} bit)` : `Zeros (${zerosCount}b)`}</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>{isVi ? 'Độ dài (64 bit)' : 'Length (64b)'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('bits')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                viewMode === 'bits' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bits (512)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('bytes')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                viewMode === 'bytes' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bytes (64)
            </button>
          </div>
        </div>

        {/* Bits view */}
        {viewMode === 'bits' ? (
          <div className="p-4 bg-slate-950 rounded-lg font-mono text-xs leading-relaxed break-all border border-slate-800 max-h-56 overflow-y-auto">
            {/* Original message bits */}
            <span className="text-sky-300 font-bold bg-sky-950/60 px-1 py-0.5 rounded">
              {Array.from(paddedBytes.slice(0, Math.floor(originalBits / 8)))
                .map((b) => Number(b).toString(2).padStart(8, '0'))
                .join('')}
            </span>

            {/* 1 bit (from 0x80) */}
            <span className="text-amber-300 font-bold bg-amber-950/60 px-1 py-0.5 rounded mx-0.5">
              1
            </span>

            {/* 0 bits */}
            <span className="text-emerald-500/80">
              {'0'.repeat(zerosCount)}
            </span>

            {/* 64 bit length */}
            <span className="text-rose-400 font-bold bg-rose-950/60 px-1 py-0.5 rounded ml-0.5">
              {originalBits.toString(2).padStart(64, '0')}
            </span>
          </div>
        ) : (
          /* Bytes view: 64 bytes in hex */
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 font-mono text-xs text-center">
              {Array.from(paddedBytes.slice(0, 64)).map((b, idx) => {
                const num = Number(b);
                const isMsg = idx < Math.floor(originalBits / 8);
                const isPad1 = idx === Math.floor(originalBits / 8);
                const isLen = idx >= 56;

                let color = 'text-slate-500 bg-slate-900/50';
                if (isMsg) color = 'text-sky-300 bg-sky-950/80 font-bold';
                else if (isPad1) color = 'text-amber-300 bg-amber-950/80 font-bold';
                else if (isLen) color = 'text-rose-400 bg-rose-950/80 font-bold';

                return (
                  <div
                    key={idx}
                    className={`py-1 rounded border border-slate-800/40 ${color}`}
                    title={`Byte ${idx}: 0x${num.toString(16).padStart(2, '0').toUpperCase()}`}
                  >
                    {num.toString(16).padStart(2, '0').toUpperCase()}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
