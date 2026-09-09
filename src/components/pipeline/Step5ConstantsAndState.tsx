import React, { useState } from 'react';
import { INITIAL_H, K } from '../../utils/sha256';
import { uint32ToHex } from '../../utils/binary';

interface Step5ConstantsAndStateProps {
  isVi: boolean;
}

const PRIMES_8 = [2, 3, 5, 7, 11, 13, 17, 19];
const VAR_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const Step5ConstantsAndState: React.FC<Step5ConstantsAndStateProps> = ({
  isVi,
}) => {
  const [showAllK, setShowAllK] = useState<boolean>(false);

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-6 font-sans">
      {/* Title & Concept */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">
          {isVi ? 'Bước 5: Khởi tạo giá trị băm và hằng số vòng' : 'Step 5: Initialize hash values & round constants'}
        </h3>
        <p className="text-sm text-slate-300">
          {isVi
            ? 'Trước khi bước vào 64 vòng nén, 8 biến trạng thái (A đến H) được gán bằng 8 giá trị băm khởi tạo (H₀…H₇). Thuật toán cũng chuẩn bị sẵn 64 hằng số (K₀…K₆₃) tương ứng cho từng vòng.'
            : 'Before compression, 8 working variables (A through H) are set to initial values (H₀..H₇). 64 constants (K₀..K₆₃) are also prepared.'}
        </p>
      </div>

      {/* 8 Working Variables A..H */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{isVi ? '8 Biến làm việc ban đầu (A … H = H₀ … H₇):' : '8 Initial working variables (A … H = H₀ … H₇):'}</span>
          <span>{isVi ? 'Phần thập phân căn bậc 2 của 8 số nguyên tố đầu' : 'Fractional part of √primes'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs">
          {INITIAL_H.map((val, idx) => {
            const hex = uint32ToHex(val);
            const varName = VAR_NAMES[idx];
            const prime = PRIMES_8[idx];

            return (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-left"
              >
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span className="text-sky-400 font-bold">{varName}</span>
                  <span className="text-slate-500 font-sans">√{prime}</span>
                </div>
                <div className="font-bold text-white truncate select-all">0x{hex}</div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">H[{idx}]</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 64 Round Constants K[0..63] */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{isVi ? '64 Hằng số vòng (K₀ … K₆₃):' : '64 Round constants (K₀ … K₆₃):'}</span>
          <button
            type="button"
            onClick={() => setShowAllK(!showAllK)}
            className="text-sky-400 hover:text-sky-300 underline cursor-pointer"
          >
            {showAllK ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Xem toàn bộ 64 hằng số' : 'Show all 64')}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 font-mono text-xs max-h-48 overflow-y-auto p-0.5">
          {(showAllK ? K : K.slice(0, 16)).map((kVal, idx) => (
            <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800/80 text-left">
              <div className="text-[10px] text-slate-500">K[{idx}]</div>
              <div className="font-bold text-slate-300 truncate select-all">0x{uint32ToHex(kVal)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
