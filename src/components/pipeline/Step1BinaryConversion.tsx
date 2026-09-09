import React from 'react';

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
  const encoder = new TextEncoder();
  const bytes = Array.from(encoder.encode(input));
  const totalBits = bytes.length * 8;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-6 font-sans">
      {/* Step Title & Concept */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">
          {isVi ? 'Bước 1: Chuyển đổi ký tự sang nhị phân' : 'Step 1: Convert characters to binary'}
        </h3>
        <p className="text-sm text-slate-300">
          {isVi
            ? 'Mỗi ký tự được ánh xạ sang mã số ASCII (hoặc UTF-8), sau đó biểu diễn dưới dạng 8 bit nhị phân (0 và 1).'
            : 'Each character maps to an ASCII/UTF-8 code, then represented as an 8-bit binary octet.'}
        </p>
      </div>

      {/* Input Field & Preset */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
        <label htmlFor="step1-input-field" className="text-slate-300 font-medium whitespace-nowrap">
          {isVi ? 'Nhập văn bản:' : 'Input text:'}
        </label>
        <div className="flex items-center gap-2 flex-1">
          <input
            id="step1-input-field"
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-sky-500 max-w-xs"
            placeholder="ABCD"
          />
          <span className="text-xs text-slate-400">
            {bytes.length} {isVi ? 'ký tự' : 'chars'} = {totalBits} bits
          </span>
        </div>
      </div>

      {/* Character Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-400 font-medium">
              <th className="pb-2 font-normal">{isVi ? 'Ký tự' : 'Character'}</th>
              <th className="pb-2 font-normal font-mono">Decimal (ASCII)</th>
              <th className="pb-2 font-normal font-mono">Hexadecimal</th>
              <th className="pb-2 font-normal font-mono">{isVi ? 'Nhị phân (8 bits)' : 'Binary (8 bits)'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs sm:text-sm">
            {bytes.map((byte, idx) => {
              const char = input[idx] ?? String.fromCharCode(byte);
              const hex = byte.toString(16).padStart(2, '0').toUpperCase();
              const bin = byte.toString(2).padStart(8, '0');

              return (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5 text-white font-bold font-sans">
                    &lsquo;{char}&rsquo;
                  </td>
                  <td className="py-2.5 text-slate-300">{byte}</td>
                  <td className="py-2.5 text-amber-300">0x{hex}</td>
                  <td className="py-2.5 text-emerald-400 font-bold tracking-wider">{bin}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Full binary stream */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>{isVi ? 'Chuỗi nhị phân nối liền (đầu vào cho Bước 2):' : 'Concatenated binary stream (input for Step 2):'}</span>
          <span>{totalBits} bits</span>
        </div>
        <div className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono text-xs sm:text-sm tracking-widest break-all select-all border border-slate-800/80">
          {bytes.map((b) => b.toString(2).padStart(8, '0')).join(' ')}
        </div>
      </div>
    </div>
  );
};
