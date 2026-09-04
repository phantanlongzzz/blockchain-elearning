import React, { useState, useRef, useEffect } from 'react';
import { CopyX, Search, Sparkles, AlertCircle, Play, CheckCircle, RefreshCw } from 'lucide-react';
import { fastSha256Hex } from '../utils/sha256';
import { truncateHashToBits } from '../utils/binary';
import { InlineMath } from './MathView';
import { useLanguage } from '../i18n/LanguageContext';

export const CollisionVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [reducedBits, setReducedBits] = useState<number>(12);
  const [isSearching, setIsSearching] = useState(false);
  const isSearchingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      isSearchingRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const [collisionResult, setCollisionResult] = useState<{
    inputA: string;
    inputB: string;
    fullHashA: string;
    fullHashB: string;
    truncatedHash: string;
    attempts: number;
    timeMs: number;
  } | null>(null);

  const runReducedCollisionSearch = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSearching(true);
    isSearchingRef.current = true;
    setCollisionResult(null);

    const startTime = performance.now();
    const seenHashes = new Map<string, { input: string; fullHex: string }>();
    let attempts = 0;
    const maxAttempts = 150000;

    // Run in chunks using setTimeout to prevent UI lockup and allow frame rendering
    const searchChunk = () => {
      if (!isSearchingRef.current) return;
      for (let i = 0; i < 3000; i++) {
        attempts++;
        const candidate = `research_probe_${Math.random().toString(36).substring(2, 9)}_${attempts}`;
        const hex = fastSha256Hex(candidate);
        const truncated = truncateHashToBits(hex, reducedBits);

        if (seenHashes.has(truncated)) {
          const match = seenHashes.get(truncated)!;
          if (match.input !== candidate) {
            const timeMs = Number((performance.now() - startTime).toFixed(2));
            setCollisionResult({
              inputA: match.input,
              inputB: candidate,
              fullHashA: match.fullHex,
              fullHashB: hex,
              truncatedHash: truncated,
              attempts,
              timeMs,
            });
            setIsSearching(false);
            isSearchingRef.current = false;
            return;
          }
        } else {
          seenHashes.set(truncated, { input: candidate, fullHex: hex });
        }

        if (attempts >= maxAttempts) {
          setIsSearching(false);
          isSearchingRef.current = false;
          return;
        }
      }

      if (isSearchingRef.current) {
        timerRef.current = window.setTimeout(searchChunk, 0);
      }
    };

    timerRef.current = window.setTimeout(searchChunk, 0);
  };

  const bitOptions = [
    {
      bits: 8,
      label: isVi
        ? 'Rút gọn 8-Bit (2⁸ = 256 trạng thái, ~19 lần thử)'
        : '8-Bit Truncation (2⁸ = 256 states, ~19 attempts)',
      estAttempts: 19,
    },
    {
      bits: 12,
      label: isVi
        ? 'Rút gọn 12-Bit (2¹² = 4.096 trạng thái, ~75 lần thử)'
        : '12-Bit Truncation (2¹² = 4,096 states, ~75 attempts)',
      estAttempts: 75,
    },
    {
      bits: 16,
      label: isVi
        ? 'Rút gọn 16-Bit (2¹⁶ = 65.536 trạng thái, ~300 lần thử)'
        : '16-Bit Truncation (2¹⁶ = 65,536 states, ~300 attempts)',
      estAttempts: 300,
    },
    {
      bits: 20,
      label: isVi
        ? 'Rút gọn 20-Bit (2²⁰ = 1.048.576 trạng thái, ~1.200 lần thử)'
        : '20-Bit Truncation (2²⁰ = 1,048,576 states, ~1,200 attempts)',
      estAttempts: 1200,
    },
  ];

  return (
    <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-6 sm:p-8 shadow-lg font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2430] pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans font-bold text-text-primary uppercase tracking-wider">
              {isVi ? 'Phòng Thí Nghiệm Va Chạm & Nghịch Lý Sinh Nhật' : 'Interactive Collision Lab & Birthday Paradox'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0F131A] border border-[#1C2430] text-text-muted">
              {isVi ? 'Thực Nghiệm Lý Thuyết' : 'Theoretical Experiment'}
            </span>
          </div>
          <p className="text-xs text-[#A5AFBF] mt-1 font-sans">
            {isVi
              ? 'Thử nghiệm cách tấn công sinh nhật tìm thấy va chạm nhanh chóng trong không gian rút gọn, và lý do tại sao SHA-256 256-bit hoàn chỉnh hoàn toàn bất khả thi để phá vỡ bằng tính toán.'
              : 'Test how birthday attacks find collisions rapidly in reduced bit spaces, and why 256-bit full SHA-256 remains computationally unbreakable.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <select
            value={reducedBits}
            onChange={(e) => {
              setReducedBits(Number(e.target.value));
              setCollisionResult(null);
            }}
            disabled={isSearching}
            className="bg-[#0B0F15] border border-[#1C2430] text-[#F2F4F7] text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-teach-1 font-sans"
          >
            {bitOptions.map((opt) => (
              <option key={opt.bits} value={opt.bits}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={runReducedCollisionSearch}
            disabled={isSearching}
 className="px-4 py-2 rounded-lg bg-text-primary hover:bg-white/90 disabled:opacity-50 text-bg-primary font-semibold font-sans font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{isVi ? 'Đang tìm kiếm...' : 'Searching...'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isVi ? 'Tìm Va Chạm' : 'Find Collision'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collision Result Display */}
      {collisionResult ? (
        <div className="rounded-lg bg-[#0F131A] border border-teach-1/40 p-5 font-sans text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#1C2430] pb-3">
            <div className="flex items-center gap-2 text-teach-1 font-bold font-sans text-sm">
              <CheckCircle className="w-4 h-4 text-teach-1" />
              <span>
                {isVi ? (
                  <>
                    Phát hiện va chạm mô phỏng sau <span className="font-mono">{collisionResult.attempts.toLocaleString()}</span> lần thử (<span className="font-mono">{collisionResult.timeMs} ms</span>)!
                  </>
                ) : (
                  <>
                    Simulated Collision Discovered in <span className="font-mono">{collisionResult.attempts.toLocaleString()}</span> Attempts (<span className="font-mono">{collisionResult.timeMs} ms</span>)!
                  </>
                )}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#090A0F] text-teach-1 border border-[#1C2430] text-[11px] font-mono">
              {isVi ? `Trùng Tiền Tố: ${reducedBits} Bits` : `Matching Prefix: ${reducedBits} Bits`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-[#090A0F] rounded-lg border border-[#1C2430]">
              <span className="text-[10px] text-[#717B8C] uppercase block mb-1 font-sans font-semibold">
                {isVi ? 'Thông Điệp Thử Nghiệm 1' : 'Candidate Message 1'}
              </span>
              <div className="text-[#F2F4F7] font-mono font-bold mb-2 break-all">{collisionResult.inputA}</div>
              <span className="text-[10px] text-[#717B8C] uppercase block mb-0.5 font-sans">
                {isVi ? 'Mã băm SHA-256 256-bit đầy đủ:' : 'Full 256-bit SHA-256 Digest:'}
              </span>
              <div className="text-[#A5AFBF] text-[11px] font-mono break-all">{collisionResult.fullHashA}</div>
            </div>

            <div className="p-3.5 bg-[#090A0F] rounded-lg border border-[#1C2430]">
              <span className="text-[10px] text-[#717B8C] uppercase block mb-1 font-sans font-semibold">
                {isVi ? 'Thông Điệp Thử Nghiệm 2 (Khác Biệt)' : 'Candidate Message 2 (Distinct)'}
              </span>
              <div className="text-[#F2F4F7] font-mono font-bold mb-2 break-all">{collisionResult.inputB}</div>
              <span className="text-[10px] text-[#717B8C] uppercase block mb-0.5 font-sans">
                {isVi ? 'Mã băm SHA-256 256-bit đầy đủ:' : 'Full 256-bit SHA-256 Digest:'}
              </span>
              <div className="text-[#A5AFBF] text-[11px] font-mono break-all">{collisionResult.fullHashB}</div>
            </div>
          </div>

          <div className="p-3.5 bg-[#090A0F] rounded-lg border border-border-primary flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[#A5AFBF] font-sans">
                {isVi ? `${reducedBits} Bit Đầu Tiên Trùng Nhau: ` : `First ${reducedBits} Bits Collided: `}
              </span>
              <strong className="text-teach-1 text-sm tracking-widest font-mono">{collisionResult.truncatedHash}</strong>
            </div>
            <div className="text-[#717B8C] text-[11px] font-sans">
              {isVi
                ? 'Lưu ý: Các giá trị băm 256-bit đầy đủ vẫn hoàn toàn khác biệt!'
                : 'Notice: The full 256-bit digests remain completely distinct!'}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-lg bg-[#090A0F] border border-dashed border-[#1C2430] text-center font-sans text-xs text-[#A5AFBF]">
          <CopyX className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="font-semibold text-[#F2F4F7] mb-1 font-sans text-sm">
            {isVi ? 'Sẵn Sàng Thử Nghiệm Tấn Công Va Chạm Theo Nghịch Lý Sinh Nhật' : 'Ready to test Birthday Attack Collision Dynamics'}
          </p>
          <p className="text-[#717B8C] max-w-md mx-auto leading-relaxed">
            {isVi
              ? 'Chọn không gian bit rút gọn (ví dụ: 12-bit hoặc 16-bit) và nhấn "Tìm Va Chạm" để quan sát cách va chạm xảy ra trong không gian nhỏ so với không gian thực 256-bit.'
              : 'Select a truncated bit space (e.g. 12-bit or 16-bit) and click "Find Collision" to see how hashing collisions occur in reduced spaces versus true 256-bit spaces.'}
          </p>
        </div>
      )}

      {/* Comparison Table: Truncated vs Full 256-bit */}
      <div className="mt-6 pt-5 border-t border-[#1C2430] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-[#A5AFBF]">
        <div className="p-3.5 rounded-lg bg-[#090A0F] border border-[#1C2430]">
          <span className="text-[#717B8C] block mb-1 font-sans font-semibold">
            {isVi ? 'Công Thức Giới Hạn Sinh Nhật:' : 'Birthday Bound Formula:'}
          </span>
          <div className="text-teach-1 font-bold text-sm">
            <InlineMath math="\approx 1.17 \times \sqrt{2^n}" />
          </div>
          <p className="text-[11px] text-[#717B8C] mt-1 font-sans">
            {isVi ? 'Giảm độ phức tạp căn bậc hai cho va chạm' : 'Square root reduction for collisions'}
          </p>
        </div>
        <div className="p-3.5 rounded-lg bg-[#090A0F] border border-[#1C2430]">
          <span className="text-[#717B8C] block mb-1 font-sans font-semibold">
            {isVi ? 'Khối Lượng Tính Toán SHA-256 Gốc:' : 'Full SHA-256 Collision Work:'}
          </span>
          <div className="text-teach-1 font-bold text-sm">
            <InlineMath math="2^{128} \text{ Operations}" />
          </div>
          <p className="text-[11px] text-[#717B8C] mt-1 font-sans">
            <InlineMath math="\approx 3.4 \times 10^{38}" /> {isVi ? 'phép tính băm' : 'hash computations'}
          </p>
        </div>
        <div className="p-3.5 rounded-lg bg-[#090A0F] border border-[#1C2430]">
          <span className="text-[#717B8C] block mb-1 font-sans font-semibold">
            {isVi ? 'Kết Luận Khoa Học:' : 'Scientific Conclusion:'}
          </span>
          <span className="text-success font-bold text-sm font-sans">
            {isVi ? 'Bất Khả Thi Về Tính Toán' : 'Computationally Infeasible'}
          </span>
          <p className="text-[11px] text-[#717B8C] mt-1 font-sans">
            {isVi ? 'Chưa từng có va chạm SHA-256 nào được phát hiện' : 'No SHA-256 collision has ever been found'}
          </p>
        </div>
      </div>
    </div>
  );
};

