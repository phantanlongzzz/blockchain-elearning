import React, { useState } from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';
import { E2EEventLog } from './types';

interface ConsensusEventLogProps {
  logs: E2EEventLog[];
  onClearLogs: () => void;
  language: 'vi' | 'en';
}

export const ConsensusEventLog: React.FC<ConsensusEventLogProps> = ({
  logs,
  onClearLogs,
  language,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const filteredLogs = filterCategory === 'all'
    ? logs
    : logs.filter((l) => l.category === filterCategory);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.category.toUpperCase()}] ${l.message} ${l.details ? `(${l.details})` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryBadgeClass = (category: E2EEventLog['category']) => {
    switch (category) {
      case 'tx':
        return 'text-blue-400 bg-blue-950/40 border-blue-500/30';
      case 'mining':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      case 'broadcast':
      case 'validation':
        return 'text-purple-400 bg-purple-950/40 border-purple-500/30';
      case 'consensus':
      case 'reward':
        return 'text-success bg-success/10 border-success/30';
      case 'fork':
      case 'orphan':
        return 'text-rose-400 bg-rose-950/40 border-rose-500/30';
      default:
        return 'text-zinc-400 bg-zinc-900 border-zinc-800';
    }
  };

  return (
    <div id="e2e-consensus-event-log" className="space-y-6 font-sans">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-zinc-100">
            {language === 'vi' ? 'Nhật ký sự kiện đồng thuận (Event Log)' : 'Consensus Event Log'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            {language === 'vi'
              ? 'Toàn bộ sự kiện ký giao dịch, khai thác, lan truyền P2P và phân định chuỗi được ghi nhận thời gian thực.'
              : 'Real-time telemetry log recording all transaction broadcasts, mining cycles, P2P validations, and fork events.'}
          </p>
        </div>

        <span className="text-xs font-mono text-zinc-400 bg-[#080c16] px-3 py-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
          {logs.length} {language === 'vi' ? 'bản ghi' : 'entries'}
        </span>
      </div>

      {/* Main Log Container */}
      <div className="bg-[#0c101c] border border-zinc-800 rounded-xl overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-3.5 sm:p-4 bg-[#080c16] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="inline-flex rounded-lg bg-[#060911] border border-zinc-800 p-0.5 text-xs font-mono">
            {['all', 'tx', 'mining', 'validation', 'consensus', 'fork'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLogs}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sao chép toàn bộ nhật ký"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (language === 'vi' ? 'Đã sao chép' : 'Copied') : (language === 'vi' ? 'Sao chép' : 'Copy')}</span>
            </button>

            <button
              type="button"
              onClick={onClearLogs}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 text-zinc-400 hover:text-rose-400 text-xs transition-colors cursor-pointer"
              title="Xóa nhật ký"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Log Entries Feed */}
        <div className="max-h-96 overflow-y-auto divide-y divide-zinc-800/60 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-zinc-500 italic py-10 text-center font-sans text-xs">
              {language === 'vi' ? 'Chưa có sự kiện nào được ghi nhận.' : 'No events recorded yet.'}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#0c101c] hover:bg-zinc-900/30 transition-colors flex items-start gap-3"
              >
                <span className="text-zinc-500 shrink-0 text-[11px]">
                  {log.timestamp}
                </span>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase shrink-0 ${getCategoryBadgeClass(log.category)}`}>
                  {log.category}
                </span>
                <div className="flex-1 text-xs">
                  <span className="text-zinc-200">{log.message}</span>
                  {log.details && (
                    <span className="text-zinc-400 ml-2 text-[11px]">
                      — {log.details}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
