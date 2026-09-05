import React, { useState } from 'react';
import { Copy, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { E2EEventLog } from './types';

interface LabRecorderTimelineProps {
  logs: E2EEventLog[];
  onClearLogs: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  language: 'vi' | 'en';
}

export const LabRecorderTimeline: React.FC<LabRecorderTimelineProps> = ({
  logs,
  onClearLogs,
  isPaused,
  onTogglePause,
  language,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const filteredLogs = filterCategory === 'all'
    ? logs
    : logs.filter((l) => l.category === filterCategory);

  const handleCopyLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.category.toUpperCase()}] ${l.message} ${
            l.details ? `(${l.details})` : ''
          }`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryBadge = (category: E2EEventLog['category']) => {
    switch (category) {
      case 'tx':
        return { label: language === 'vi' ? 'GIAO DỊCH' : 'TX', class: 'text-blue-400 bg-blue-950/40 border-blue-500/30' };
      case 'mining':
        return { label: 'POW', class: 'text-amber-400 bg-amber-950/40 border-amber-500/30' };
      case 'broadcast':
        return { label: 'P2P', class: 'text-purple-400 bg-purple-950/40 border-purple-500/30' };
      case 'validation':
        return { label: 'VERIFY', class: 'text-success bg-success/10 border-success/30' };
      case 'consensus':
      case 'reward':
        return { label: language === 'vi' ? 'ĐỒNG THUẬN' : 'CONSENSUS', class: 'text-success bg-success/10 border-success/30' };
      case 'fork':
      case 'orphan':
        return { label: 'FORK', class: 'text-amber-300 bg-amber-950/50 border-amber-500/40' };
      case 'fault':
        return { label: language === 'vi' ? 'TIÊM LỖI' : 'FAULT', class: 'text-rose-400 bg-rose-950/50 border-rose-500/40' };
      default:
        return { label: 'EVENT', class: 'text-zinc-400 bg-zinc-900 border-zinc-800' };
    }
  };

  return (
    <div
      id="e2e-lab-recorder-timeline"
      className="bg-[#080c16] border border-zinc-800 rounded-xl overflow-hidden font-sans text-xs"
    >
      {/* Timeline Header Bar */}
      <div className="p-3 bg-[#0c101c] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-zinc-100 text-xs">
              {language === 'vi' ? 'Nhật ký thí nghiệm thời gian thực (Lab Recorder)' : 'Real-time Lab Recorder'}
            </span>
          </div>

          <span className="text-[10px] font-mono text-zinc-400 bg-[#060911] px-2 py-0.5 rounded border border-zinc-800">
            {logs.length} {language === 'vi' ? 'sự kiện' : 'events'}
          </span>

          {isPaused && (
            <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-500/30">
              {language === 'vi' ? 'Đang tạm dừng ghi' : 'Recording Paused'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Resume Recorder */}
          <button
            type="button"
            onClick={onTogglePause}
            className="px-2.5 py-1 rounded bg-[#060911] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
          >
            {isPaused ? (language === 'vi' ? 'Tiếp tục ghi' : 'Resume') : (language === 'vi' ? 'Tạm dừng ghi' : 'Pause')}
          </button>

          {/* Copy Logs */}
          <button
            type="button"
            onClick={handleCopyLogs}
            className="p-1.5 rounded bg-[#060911] hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title={language === 'vi' ? 'Sao chép nhật ký' : 'Copy logs'}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Logs */}
          <button
            type="button"
            onClick={onClearLogs}
            className="p-1.5 rounded bg-[#060911] hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
            title={language === 'vi' ? 'Xóa nhật ký' : 'Clear logs'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Expand / Collapse */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded bg-[#060911] hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px]">
            {['all', 'tx', 'mining', 'broadcast', 'validation', 'consensus', 'fork', 'fault'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Event Stream List */}
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs scrollbar-thin">
            {filteredLogs.length === 0 ? (
              <div className="p-4 text-center text-zinc-600 text-xs">
                {language === 'vi' ? 'Chưa có sự kiện nào được ghi nhận.' : 'No recorded events.'}
              </div>
            ) : (
              filteredLogs.map((log) => {
                const badge = getCategoryBadge(log.category);
                return (
                  <div
                    key={log.id}
                    className="p-2 rounded-lg bg-[#060911] border border-zinc-800/80 hover:border-zinc-700/80 flex items-start gap-2.5 transition-colors group"
                  >
                    <span className="text-[11px] text-zinc-500 shrink-0 font-mono mt-0.5">
                      {log.timestamp}
                    </span>

                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border shrink-0 uppercase tracking-wider ${badge.class}`}
                    >
                      {badge.label}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-200 text-xs font-sans leading-relaxed">{log.message}</p>
                      {log.details && (
                        <p className="text-[11px] font-mono text-zinc-500 mt-0.5 truncate group-hover:text-zinc-400 transition-colors">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
