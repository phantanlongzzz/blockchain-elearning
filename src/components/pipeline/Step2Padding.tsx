import React, { useState } from 'react';
import { Layers, Info } from 'lucide-react';
import { DetailedSha256Breakdown } from '../../types';

interface Step2PaddingProps {
  input: string;
  breakdown: DetailedSha256Breakdown;
  isVi: boolean;
}

export const Step2Padding: React.FC<Step2PaddingProps> = ({
  input,
  breakdown,
  isVi,
}) => {
  const [viewMode, setViewMode] = useState<'bits' | 'bytes'>('bits');

  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(input);
  const originalBitLength = inputBytes.length * 8;

  // Build the padded binary string for block 0
  let originalBinaryStr = '';
  inputBytes.forEach((b) => {
    originalBinaryStr += b.toString(2).padStart(8, '0');
  });

  // Calculate padding lengths
  const partOriginal = originalBinaryStr;
  const partOne = '1';
  
  // For single block or block 0
  const zerosCount = (512 - 64 - (originalBitLength + 1) % 512 + 512) % 512;
  const partZeros = '0'.repeat(zerosCount);
  const partLen = originalBitLength.toString(2).padStart(64, '0');

  const totalBlock0Bits = partOriginal.length + 1 + partZeros.length + partLen.length;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-sm space-y-6 font-sans">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs uppercase font-bold tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>{isVi ? 'Bước 2 / 7 trong thuật toán' : 'Step 2 / 7 in Algorithm'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {isVi
              ? 'Bước 2: Đệm Bit (Padding & Append Length)'
              : 'Step 2: Bit Padding & Length Encoding'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('bits')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'bits'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isVi ? 'Xem dạng Bit' : 'Bits View'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('bytes')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'bytes'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isVi ? 'Xem 64 Byte Hex' : '64 Bytes Grid'}
            </button>
          </div>
        </div>
      </div>

      {/* Principle Callout */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-300 leading-relaxed space-y-2">
        <p>
          <strong className="text-white">{isVi ? 'Quy tắc đệm chuẩn SHA-256:' : 'SHA-256 Padding Rules:'}</strong>{' '}
          {isVi
            ? 'Khối đầu vào của SHA-256 bắt buộc phải là bội số của 512 bits. Quá trình đệm gồm đúng 3 thao tác tuần tự:'
            : 'The input to SHA-256 must strictly be an exact multiple of 512 bits. The padding follows 3 sequential steps:'}
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-slate-300 pl-2">
          <li>
            <strong className="text-amber-400">{isVi ? '1. Thêm bit 1' : '1. Append single 1-bit'}</strong>{' '}
            {isVi ? 'vào ngay sau bit cuối cùng của chuỗi dữ liệu gốc.' : 'immediately after the original bitstream.'}
          </li>
          <li>
            <strong className="text-emerald-400">{isVi ? '2. Thêm các bit 0' : '2. Append 0-bits'}</strong>{' '}
            {isVi
              ? `sao cho độ dài đạt 448 bits (tức cách mốc 512 bits đúng 64 bits). Cần thêm ${zerosCount} bit 0.`
              : `such that length reaches 448 bits (64 bits shy of 512 bits). Needs ${zerosCount} zero bits.`}
          </li>
          <li>
            <strong className="text-rose-400">{isVi ? '3. Thêm 64 bit độ dài gốc' : '3. Append 64-bit Length'}</strong>{' '}
            {isVi
              ? `ở dạng số nhị phân không dấu (ghi giá trị ${originalBitLength} bit của thông điệp ban đầu).`
              : `as an unsigned 64-bit binary integer (stores ${originalBitLength} bits length).`}
          </li>
        </ol>
      </div>

      {/* Visual Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
        <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/40">
          <span className="text-xs text-sky-300 block font-sans font-semibold">
            {isVi ? 'Dữ liệu gốc' : 'Original Data'}
          </span>
          <span className="text-lg sm:text-xl font-bold text-white mt-1 block">
            {originalBitLength} <span className="text-xs text-sky-400 font-sans">bits</span>
          </span>
          <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">
            ({inputBytes.length} bytes)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40">
          <span className="text-xs text-amber-300 block font-sans font-semibold">
            {isVi ? 'Bit 1 Đệm' : 'Appended 1'}
          </span>
          <span className="text-lg sm:text-xl font-bold text-amber-400 mt-1 block">
            1 <span className="text-xs text-amber-300 font-sans">bit</span>
          </span>
          <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">
            (Byte 0x80)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
          <span className="text-xs text-emerald-300 block font-sans font-semibold">
            {isVi ? 'Số Bit 0 Đệm' : 'Zero Padding'}
          </span>
          <span className="text-lg sm:text-xl font-bold text-emerald-400 mt-1 block">
            {zerosCount} <span className="text-xs text-emerald-300 font-sans">bits</span>
          </span>
          <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">
            (Căn mốc 448)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40">
          <span className="text-xs text-rose-300 block font-sans font-semibold">
            {isVi ? '64-Bit Độ Dài Gốc' : '64-Bit Length'}
          </span>
          <span className="text-lg sm:text-xl font-bold text-rose-400 mt-1 block">
            64 <span className="text-xs text-rose-300 font-sans">bits</span>
          </span>
          <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">
            ({originalBitLength} decimal)
          </span>
        </div>
      </div>

      {/* Color Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-sans">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block" />
            <strong className="text-white">{isVi ? 'Gốc' : 'Original'}:</strong> {originalBitLength} bit
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
            <strong className="text-white">{isVi ? 'Bit 1' : '1-bit'}:</strong> 1 bit
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
            <strong className="text-white">{isVi ? 'Bit 0 đệm' : 'Zeros'}:</strong> {zerosCount} bit
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded-sm bg-rose-400 inline-block" />
            <strong className="text-white">{isVi ? 'Độ dài' : 'Length'}:</strong> 64 bit
          </span>
        </div>
        <span className="text-slate-400 font-mono font-bold">
          {isVi ? 'Tổng' : 'Total'}: {totalBlock0Bits} bits (64 bytes)
        </span>
      </div>

      {/* VIEW MODE 1: Highlighted Bit Stream */}
      {viewMode === 'bits' ? (
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
            <span className="font-semibold text-slate-200">
              {isVi ? 'Trực quan hóa khối 512 bits đã đệm (Khối #0):' : 'Padded 512-Bit Block Inspection (Block #0):'}
            </span>
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              512 bits = 64 bytes
            </span>
          </div>

          <div className="p-4 bg-slate-900 rounded-lg text-xs sm:text-[13px] break-all leading-relaxed font-bold border border-slate-800/90 select-all max-h-72 overflow-y-auto">
            {/* Original Data in Sky */}
            <span className="text-sky-300" title={`Dữ liệu gốc: ${originalBitLength} bits`}>
              {partOriginal}
            </span>
            {/* Appended 1-bit in Amber */}
            <span className="text-amber-400 bg-amber-500/20 px-0.5 rounded font-black ring-1 ring-amber-500/40" title="Bit 1 đệm (1 bit)">
              {partOne}
            </span>
            {/* Zeros in Emerald */}
            <span className="text-emerald-400" title={`Bit 0 đệm: ${zerosCount} bits`}>
              {partZeros}
            </span>
            {/* Length in Rose */}
            <span className="text-rose-400 bg-rose-500/10 px-0.5 rounded font-black border-b border-rose-500/50" title={`64-bit độ dài: ${originalBitLength}`}>
              {partLen}
            </span>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: 64 Byte Grid */
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-300 font-sans">
            <span className="font-semibold text-slate-200">
              {isVi ? 'Lưới 64 Byte trong khối 512 bit (Khối #0):' : '64-Byte Grid of 512-Bit Block (Block #0):'}
            </span>
            <span className="text-xs text-slate-400">
              {isVi ? 'Rê chuột để xem vị trí Byte' : 'Hover to view Byte offset'}
            </span>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 text-center font-mono">
            {Array.from(breakdown.paddedMessageBytes.slice(0, 64)).map((byteVal: number, idx: number) => {
              const isMsg = idx < inputBytes.length;
              const isOneBit = idx === inputBytes.length;
              const isLength = idx >= 56;
              const hexStr = Number(byteVal).toString(16).padStart(2, '0').toUpperCase();

              return (
                <div
                  key={idx}
                  className={`p-2 rounded text-xs border font-mono transition-transform hover:scale-110 ${
                    isMsg
                      ? 'bg-sky-950/80 border-sky-500/50 text-sky-300 font-bold'
                      : isOneBit
                        ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 font-bold'
                        : isLength
                          ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                  title={`Byte #${idx}: 0x${hexStr} (${isMsg ? 'Dữ liệu gốc' : isOneBit ? 'Bit 1 (0x80)' : isLength ? '64-bit Length' : 'Bit 0 đệm'})`}
                >
                  {hexStr}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-2.5 text-xs text-slate-400 font-sans bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p>
          {isVi
            ? 'Khối 512 bit hoàn chỉnh sau khi đệm sẽ được chuyển sang Bước 3 để chia nhỏ thành 16 Word (mỗi Word gồm 32 bits).'
            : 'The completed 512-bit block is now fed into Step 3 to be split into 16 32-bit Words.'}
        </p>
      </div>
    </div>
  );
};
