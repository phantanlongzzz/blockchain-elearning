import React, { useState, useEffect } from 'react';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { fastSha256Hex } from '../../utils/sha256';

interface TimestampExplorerProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
  onPrevStage?: () => void;
}

export const TimestampExplorer: React.FC<TimestampExplorerProps> = ({
  onInteracted,
  onNextStage,
  onPrevStage,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Sequential blocks state
  const [customTimeSeconds, setCustomTimeSeconds] = useState<number>(1715429447); // 12:20:47 UTC
  const [originalTimeSeconds] = useState<number>(1715429447);
  const [blockHash, setBlockHash] = useState<string>('');
  const [originalBlockHash, setOriginalBlockHash] = useState<string>('');

  const PREV_HASH_102 = '00008f1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a';
  const MERKLE_ROOT_102 = '3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b';
  const NONCE_102 = 72914;

  // Format seconds to human readable time
  const formatTime = (epochSeconds: number) => {
    const d = new Date(epochSeconds * 1000);
    return d.toUTCString().replace('GMT', 'UTC');
  };

  const isTimeChanged = customTimeSeconds !== originalTimeSeconds;

  // Compute block hash when timestamp updates
  useEffect(() => {
    const compute = async () => {
      const headerRaw = `102|${PREV_HASH_102}|${MERKLE_ROOT_102}|${customTimeSeconds}|${NONCE_102}`;
      const hash = await fastSha256Hex(headerRaw);
      setBlockHash(hash);

      if (!originalBlockHash) {
        setOriginalBlockHash(hash);
      }
    };
    compute();
  }, [customTimeSeconds, originalBlockHash]);

  const handleAdjustTime = (secondsDelta: number) => {
    setCustomTimeSeconds((prev) => prev + secondsDelta);
    if (onInteracted) onInteracted();
  };

  const handleResetTime = () => {
    setCustomTimeSeconds(originalTimeSeconds);
    if (onInteracted) onInteracted();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Sequential Timeline of Blocks */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#0B0F19]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-cyan-400" />
            </div>
            <h4 className="text-base font-bold text-white font-sans">
              {isVi ? 'Chuỗi khối theo trục thời gian' : 'Chronological Block Sequence'}
            </h4>
          </div>
          <span className="text-xs font-mono text-cyan-300/80 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
            ~10 min/block
          </span>
        </div>

        {/* 3 Chronological Blocks in Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Block #100 */}
          <div className="p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.05] space-y-3 opacity-75">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-slate-300">Block #100</span>
              <span className="text-slate-500 font-sans text-[11px]">{isVi ? 'Đã xác thực' : 'Validated'}</span>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] font-mono text-xs space-y-1">
              <div className="text-slate-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>12:00:03 UTC</span>
              </div>
              <div className="text-slate-500 text-[10px]">UNIX: 1715428803</div>
            </div>
            <div className="text-[11px] font-mono text-slate-400 truncate">
              Hash: 0000f1a2b3c4...
            </div>
          </div>

          {/* Block #101 */}
          <div className="p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.05] space-y-3 opacity-90">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-slate-300">Block #101</span>
              <span className="text-slate-500 font-sans text-[11px]">{isVi ? 'Đã xác thực' : 'Validated'}</span>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] font-mono text-xs space-y-1">
              <div className="text-slate-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>12:10:12 UTC</span>
              </div>
              <div className="text-slate-500 text-[10px]">UNIX: 1715429412</div>
            </div>
            <div className="text-[11px] font-mono text-slate-400 truncate">
              Hash: 00008f1c2d3e...
            </div>
          </div>

          {/* Block #102 - Active Interactive Block */}
          <div
            className={`p-4 rounded-xl border transition-all space-y-3 ${
              isTimeChanged
                ? 'bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(0,210,255,0.15)]'
                : 'bg-black/40 backdrop-blur-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,210,255,0.08)]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-white">Block #102</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold font-sans">
                {isVi ? 'Đang chọn' : 'Active'}
              </span>
            </div>
            <div
              className={`p-3 rounded-lg border font-mono text-xs space-y-1 ${
                isTimeChanged
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-200'
              }`}
            >
              <div className="font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatTime(customTimeSeconds).slice(17, 25)} UTC</span>
                {isTimeChanged && (
                  <span className="text-[10px] text-cyan-300 font-semibold font-sans ml-auto">
                    {isVi ? '(Đã sửa)' : '(Modified)'}
                  </span>
                )}
              </div>
              <div className="text-slate-400 text-[10px]">UNIX: {customTimeSeconds}</div>
            </div>
            <div className="text-[11px] font-mono truncate text-cyan-300">
              Hash: {blockHash.slice(0, 16)}...
            </div>
          </div>
        </div>

        {/* Interactive Timestamp Modifier Controls */}
        <div className="p-5 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.05] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h5 className="text-sm font-semibold text-slate-100 font-sans">
                {isVi
                  ? 'Thử nghiệm thay đổi Timestamp của Block #102'
                  : 'Modify Block #102 Timestamp'}
              </h5>
              <p className="text-xs text-slate-400 mt-0.5">
                {isVi
                  ? 'Thay đổi thời gian để quan sát mã băm Header đổi theo'
                  : 'Change timestamp to see resulting header hash mutation'}
              </p>
            </div>

            {isTimeChanged && (
              <button
                type="button"
                onClick={handleResetTime}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-sans flex items-center gap-1.5 cursor-pointer border border-white/[0.08] self-start sm:self-auto transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isVi ? 'Khôi phục' : 'Reset'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleAdjustTime(1)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/30 text-slate-200 hover:text-white border border-white/[0.08] text-xs font-mono font-semibold cursor-pointer transition-all"
            >
              +1s
            </button>
            <button
              type="button"
              onClick={() => handleAdjustTime(60)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/30 text-slate-200 hover:text-white border border-white/[0.08] text-xs font-mono font-semibold cursor-pointer transition-all"
            >
              +1m (+60s)
            </button>
            <button
              type="button"
              onClick={() => handleAdjustTime(3600)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/30 text-slate-200 hover:text-white border border-white/[0.08] text-xs font-mono font-semibold cursor-pointer transition-all"
            >
              +1h (+3600s)
            </button>
          </div>

          {/* Educational Note */}
          <div className="p-4 rounded-xl bg-[#0B0F19]/60 border border-white/[0.06] text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-cyan-300">{isVi ? 'Nguyên lý:' : 'Principle:'} </span>
            <span>
              {isVi
                ? 'Timestamp là một trường bắt buộc trong Block Header. Khi timestamp thay đổi dù chỉ 1 giây, toàn bộ chuỗi băm của khối thay đổi hoàn toàn do hiệu ứng tuyết lở SHA-256.'
                : 'Timestamp is a fixed field in the Block Header. Modifying the timestamp by even 1 second alters the entire block hash via SHA-256.'}
            </span>
          </div>
        </div>

        {/* Bridge Link */}
        <div className="pt-4 flex items-center justify-between gap-3 text-xs border-t border-white/[0.06]">
          <button
            type="button"
            id="btn-prev-stage-from-timestamp"
            onClick={onPrevStage}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] hover:border-cyan-500/30 text-xs flex items-center gap-1.5 cursor-pointer font-sans transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isVi ? 'Quay lại: Chữ Ký Số' : 'Back: Digital Signature'}</span>
          </button>
          <button
            type="button"
            id="btn-next-stage-from-timestamp"
            onClick={onNextStage}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.3)] font-sans transition-all"
          >
            <span>{isVi ? 'Tiếp: Merkle Root' : 'Next: Merkle Root'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

