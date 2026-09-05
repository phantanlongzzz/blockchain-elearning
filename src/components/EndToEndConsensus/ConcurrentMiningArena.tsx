import React from 'react';
import {
  Play,
  Square,
  RotateCcw,
  GitFork,
  Trophy,
  Activity,
} from 'lucide-react';
import { E2EMiner, E2EBlock } from './types';

interface ConcurrentMiningArenaProps {
  miners: E2EMiner[];
  isMining: boolean;
  onStartMining: () => void;
  onStopMining: () => void;
  onSimulateFork: () => void;
  onResetMiners: () => void;
  targetBlockHeight: number;
  winnerBlock: E2EBlock | null;
  elapsedTimeSec: number;
  totalAttempts: number;
  difficulty: number;
  language: 'vi' | 'en';
}

export const ConcurrentMiningArena: React.FC<ConcurrentMiningArenaProps> = ({
  miners,
  isMining,
  onStartMining,
  onStopMining,
  onSimulateFork,
  onResetMiners,
  targetBlockHeight,
  winnerBlock,
  elapsedTimeSec,
  totalAttempts,
  difficulty,
  language,
}) => {
  const totalHashRate = miners.reduce((acc, curr) => acc + (curr.hashrateKHz || 0), 0);
  const targetPrefix = '0'.repeat(difficulty);

  return (
    <div id="e2e-concurrent-mining-arena" className="space-y-6 font-sans">
      {/* Step Header & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-zinc-100">
            {language === 'vi' ? 'Đua khai thác song song (Mining Race)' : 'Multi-Miner Mining Race'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            {language === 'vi'
              ? 'Các thợ đào chạy đa luồng tính toán song song, thay đổi Nonce để tìm mã băm thỏa mãn độ khó.'
              : 'Miners iterate through Nonce values concurrently in parallel worker threads to find a valid SHA-256 target hash.'}
          </p>
        </div>

        {/* Inline Telemetry */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-zinc-400">
            <span className="font-semibold text-financial font-mono">{totalHashRate.toLocaleString()}</span> KH/s
          </div>
          <div className="text-zinc-600">·</div>
          <div className="text-zinc-400">
            <span className="font-semibold text-zinc-100">{totalAttempts.toLocaleString()}</span> {language === 'vi' ? 'lần thử' : 'attempts'}
          </div>
          <div className="text-zinc-600">·</div>
          <div className="text-zinc-400">
            <span className="font-semibold text-zinc-100">{elapsedTimeSec.toFixed(2)}s</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[#0c101c] border border-zinc-800 rounded-xl overflow-hidden space-y-0">
        {/* Controls Toolbar */}
        <div className="p-3.5 sm:p-4 bg-[#080c16] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isMining ? (
              <button
                type="button"
                id="btn-start-mining-e2e"
                onClick={onStartMining}
 className="px-4 py-2 rounded-lg bg-financial hover:bg-financial/90 text-black font-semibold font-medium text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'vi' ? 'Bắt đầu đào' : 'Start Mining Race'}</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-stop-mining-e2e"
                onClick={onStopMining}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-zinc-950 font-medium text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'vi' ? 'Dừng đua' : 'Stop Race'}</span>
              </button>
            )}

            <button
              type="button"
              id="btn-simulate-fork-e2e"
              onClick={onSimulateFork}
              disabled={isMining}
              className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-purple-300 hover:text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <GitFork className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === 'vi' ? 'Mô phỏng phân nhánh' : 'Simulate Fork Race'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">
              {language === 'vi' ? 'Mục tiêu:' : 'Target:'} <span className="text-amber-400">"{targetPrefix}..."</span>
            </span>
            <button
              type="button"
              onClick={onResetMiners}
              disabled={isMining}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors disabled:opacity-50 cursor-pointer"
              title="Đặt lại trạng thái thợ đào"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Winner Banner if Winner exists */}
        {winnerBlock && (
          <div className="p-3.5 bg-white/[0.02] border-b border-border-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-zinc-200 font-medium">
                {language === 'vi' ? 'Thợ đào chiến thắng:' : 'Winning Miner:'}{' '}
                <strong className="text-text-primary font-semibold">{winnerBlock.minerName}</strong> ·{' '}
                {language === 'vi' ? 'Khối' : 'Block'} #{winnerBlock.height} · Nonce: {winnerBlock.nonce.toLocaleString()}
              </span>
            </div>
            <span className="font-mono text-[11px] text-zinc-400 truncate max-w-sm">
              Hash: {winnerBlock.hash}
            </span>
          </div>
        )}

        {/* Unified Miner Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#080c16]/70 text-zinc-400 text-[11px] font-medium border-b border-zinc-800">
              <tr>
                <th scope="col" className="py-3 px-4 w-12 text-center">
                  {language === 'vi' ? 'Hạng' : 'Rank'}
                </th>
                <th scope="col" className="py-3 px-4">
                  {language === 'vi' ? 'Thợ đào' : 'Miner'}
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  {language === 'vi' ? 'Hashrate' : 'Hashrate'}
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  {language === 'vi' ? 'Nonce hiện tại' : 'Current Nonce'}
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  {language === 'vi' ? 'Số lần thử' : 'Attempts'}
                </th>
                <th scope="col" className="py-3 px-4">
                  {language === 'vi' ? 'Mã băm hiện tại / Trạng thái' : 'Current Hash / Status'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
              {miners.map((miner, idx) => {
                const isWinner = winnerBlock?.minerId === miner.id;
                const isCurrentMining = isMining && miner.status === 'mining';

                return (
                  <tr
                    key={miner.id}
                    className={`transition-colors ${
                      isWinner
                        ? 'bg-emerald-950/20 text-zinc-100 font-semibold'
                        : isCurrentMining
                        ? 'bg-zinc-900/30'
                        : 'hover:bg-zinc-900/20'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center text-zinc-500 font-sans text-[11px]">
                      {isWinner ? (
                        <Trophy className="w-3.5 h-3.5 text-amber-400 mx-auto" />
                      ) : (
                        `#${idx + 1}`
                      )}
                    </td>

                    {/* Miner Name */}
                    <td className="py-3.5 px-4 font-sans font-medium text-zinc-200">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: miner.avatarColor || '#3b82f6' }}
                        />
                        <span>{miner.name}</span>
                        {isWinner && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.08] text-text-secondary font-medium">
                            {language === 'vi' ? 'Tìm thấy khối' : 'Winner'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Hashrate */}
                    <td className="py-3.5 px-4 text-right text-zinc-300">
                      {(miner.hashrateKHz || 0).toLocaleString()} KH/s
                    </td>

                    {/* Nonce */}
                    <td className="py-3.5 px-4 text-right text-zinc-200">
                      {(miner.currentNonce || 0).toLocaleString()}
                    </td>

                    {/* Attempts */}
                    <td className="py-3.5 px-4 text-right text-zinc-400">
                      {(miner.attempts || 0).toLocaleString()}
                    </td>

                    {/* Current Hash / Status */}
                    <td className="py-3.5 px-4">
                      {miner.status === 'idle' && miner.attempts === 0 ? (
                        <span className="text-zinc-500 font-sans text-xs italic">
                          {language === 'vi' ? 'Chờ bắt đầu' : 'Idle'}
                        </span>
                      ) : isWinner ? (
                        <div className="flex items-center gap-2">
                          <span className="text-text-secondary truncate max-w-xs font-mono text-[11px]">
                            {miner.currentHash?.substring(0, 18) || '...'}
                          </span>
                          <span className="text-success font-sans text-[11px]">✓ Hợp lệ</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 truncate max-w-xs font-mono text-[11px]">
                            {miner.currentHash ? `${miner.currentHash.substring(0, 18)}...` : '—'}
                          </span>
                          {isCurrentMining && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-sans">
                              <Activity className="w-3 h-3 animate-pulse" />
                              {language === 'vi' ? 'Đang tính toán' : 'Mining'}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
