import React, { useState, useEffect } from 'react';
import {
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Hash,
  HelpCircle,
  Cpu,
  Boxes,
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
  const { strings, language } = useLanguage();

  // Sequential blocks state
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(102);
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
    <div className="space-y-6">
      {/* Sequential Timeline of Blocks */}
      <div className="p-5 sm:p-7 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              {language === 'vi'
                ? 'Chuỗi khối theo thời gian'
                : 'Chronological timeline'}
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-400">
            ~10 min/block
          </span>
        </div>

        {/* 3 Chronological Blocks in Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Block #100 */}
          <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800 space-y-2.5 opacity-80">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-300">BLOCK #100</span>
              <span className="text-slate-500">Confirmed</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 font-mono text-xs space-y-1">
              <div className="text-amber-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                12:00:03 UTC
              </div>
              <div className="text-slate-500 text-[10px]">UNIX: 1715428803</div>
            </div>
            <div className="text-[11px] font-mono text-slate-400 truncate">
              Hash: 0000f1a2b3c4...
            </div>
          </div>

          {/* Block #101 */}
          <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800 space-y-2.5 opacity-90">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-300">BLOCK #101</span>
              <span className="text-slate-500">Confirmed</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 font-mono text-xs space-y-1">
              <div className="text-amber-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                12:10:12 UTC
              </div>
              <div className="text-slate-500 text-[10px]">UNIX: 1715429412</div>
            </div>
            <div className="text-[11px] font-mono text-slate-400 truncate">
              Hash: 00008f1c2d3e...
            </div>
          </div>

          {/* Block #102 - Active Interactive Block */}
          <div
            className={`p-4 rounded-xl border-2 transition-all space-y-2.5 ${
              isTimeChanged
                ? 'bg-amber-950/20 border-amber-500 shadow-lg shadow-amber-950/30'
                : 'bg-[#0b101b] border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-emerald-400">BLOCK #102</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                Active
              </span>
            </div>
            <div
              className={`p-2.5 rounded-lg border font-mono text-xs space-y-1 ${
                isTimeChanged
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-black/40 border-slate-800 text-slate-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{formatTime(customTimeSeconds).slice(17, 25)} UTC</span>
                {isTimeChanged && (
                  <span className="text-[10px] text-amber-400 font-bold ml-auto">
                    {language === 'vi' ? '(ĐÃ ĐỔI)' : '(CHANGED)'}
                  </span>
                )}
              </div>
              <div className="text-slate-400 text-[10px]">UNIX: {customTimeSeconds}</div>
            </div>
            <div className="text-[11px] font-mono truncate text-amber-300">
              Hash: {blockHash.slice(0, 16)}...
            </div>
          </div>
        </div>

        {/* Interactive Timestamp Modifier Controls */}
        <div className="p-5 rounded-xl bg-[#070a12] border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-amber-300 font-mono">
                {language === 'vi'
                  ? 'Thử nghiệm thay đổi Timestamp của Block #102'
                  : 'Modify Block #102 Timestamp'}
              </h5>
              <p className="text-xs text-slate-400">
                {language === 'vi'
                  ? 'Thay đổi thời gian để xem mã băm Header đổi theo'
                  : 'Change timestamp to see resulting hash mutation'}
              </p>
            </div>

            {isTimeChanged && (
              <button
                type="button"
                onClick={handleResetTime}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Khôi phục' : 'Reset'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleAdjustTime(1)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold cursor-pointer"
            >
              +1s
            </button>
            <button
              type="button"
              onClick={() => handleAdjustTime(60)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold cursor-pointer"
            >
              +1m (+60s)
            </button>
            <button
              type="button"
              onClick={() => handleAdjustTime(3600)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold cursor-pointer"
            >
              +1h (+3600s)
            </button>
          </div>

          {/* Educational Note */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-amber-300">💡 {language === 'vi' ? 'Quy tắc:' : 'Takeaway:'} </span>
            <span>
              {language === 'vi'
                ? 'Timestamp là một phần dữ liệu trong Block Header. Khi timestamp thay đổi, Block Hash cũng thay đổi hoàn toàn.'
                : 'Timestamp is part of the Block Header data. When timestamp changes, the Block Hash mutates completely.'}
            </span>
          </div>
        </div>

        {/* Bridge Link */}
        <div className="pt-2 flex items-center justify-between gap-3 text-xs border-t border-slate-800/80">
          <button
            type="button"
            onClick={onPrevStage}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Quay lại' : 'Back'}</span>
          </button>
          <button
            type="button"
            onClick={onNextStage}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow"
          >
            <span>{language === 'vi' ? 'Tiếp: Merkle Root' : 'Next: Merkle Root'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
