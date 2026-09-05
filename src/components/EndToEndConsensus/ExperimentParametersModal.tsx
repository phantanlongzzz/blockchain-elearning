import React from 'react';
import { FlaskConical, X, RotateCcw } from 'lucide-react';
import { E2EExperimentConfig } from './types';

interface ExperimentParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: E2EExperimentConfig;
  onChangeConfig: (newConfig: Partial<E2EExperimentConfig>) => void;
  onResetAll: () => void;
  lastExperimentSummary: {
    winnerName: string;
    totalAttempts: number;
    miningTimeSec: number;
    forkOccurred: boolean;
    mainBranch: string;
    orphanedCount: number;
  } | null;
  language: 'vi' | 'en';
}

export const ExperimentParametersModal: React.FC<ExperimentParametersModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onResetAll,
  lastExperimentSummary,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-[#0D1322] border border-[#1E293B] rounded-2xl w-full max-w-lg shadow-2xl p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-primary flex items-center justify-center text-text-secondary">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#E5E7EB] font-display">
                {language === 'vi' ? '🧪 Cấu Hình Thí Nghiệm Phòng Lab (Experiment Setup)' : '🧪 Consensus Experiment Setup'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {language === 'vi' ? 'Tùy chỉnh thông số mạng P2P, độ khó và xác suất phân nhánh' : 'Customize P2P network, difficulty & fork simulation'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#111827] border border-transparent hover:border-[#1E293B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Parameters Controls */}
        <div className="space-y-4 text-xs font-mono">
          {/* Miner count */}
          <div>
            <div className="flex items-center justify-between mb-1 text-[#94A3B8]">
              <span>{language === 'vi' ? 'SỐ LƯỢNG THỢ ĐÀO' : 'NUMBER OF MINERS'}:</span>
              <span className="font-bold text-text-primary font-mono">{config.minerCount} miners</span>
            </div>
            <input
              type="range"
              min="2"
              max="4"
              value={config.minerCount}
              onChange={(e) => onChangeConfig({ minerCount: parseInt(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Difficulty */}
          <div>
            <div className="flex items-center justify-between mb-1 text-[#94A3B8]">
              <span>{language === 'vi' ? 'ĐỘ KHÓ ĐÀO (SỐ 0 Ở ĐẦU)' : 'MINING DIFFICULTY'}:</span>
              <span className="font-bold text-amber-400">{config.difficulty} leading zeros</span>
            </div>
            <input
              type="range"
              min="2"
              max="4"
              value={config.difficulty}
              onChange={(e) => onChangeConfig({ difficulty: parseInt(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Network Latency */}
          <div>
            <div className="flex items-center justify-between mb-1 text-[#94A3B8]">
              <span>{language === 'vi' ? 'ĐỘ TRỄ MẠNG GOSSIP (LATENCY)' : 'NETWORK GOSSIP LATENCY'}:</span>
              <span className="font-bold text-purple-400">{config.networkLatencyMs} ms</span>
            </div>
            <input
              type="range"
              min="300"
              max="2000"
              step="100"
              value={config.networkLatencyMs}
              onChange={(e) => onChangeConfig({ networkLatencyMs: parseInt(e.target.value) })}
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Last Experiment Summary if any */}
        {lastExperimentSummary && (
          <div className="p-3.5 rounded-xl bg-[#111827] border border-border-primary text-xs font-mono space-y-1.5">
            <span className="text-[10px] uppercase text-text-secondary font-bold block">
              {language === 'vi' ? 'KẾT QUẢ THÍ NGHIỆM GẦN NHẤT:' : 'LATEST EXPERIMENT RESULT:'}
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#94A3B8]">
              <div>Winner: <span className="font-bold text-[#E5E7EB]">{lastExperimentSummary.winnerName}</span></div>
              <div>Time: <span className="font-bold text-amber-400">{lastExperimentSummary.miningTimeSec.toFixed(2)}s</span></div>
              <div>Attempts: <span className="font-bold text-[#E5E7EB]">{lastExperimentSummary.totalAttempts.toLocaleString()}</span></div>
              <div>Fork Occurred: <span className="font-bold text-purple-300">{lastExperimentSummary.forkOccurred ? 'Yes' : 'No'}</span></div>
              <div>Main Chain: <span className="font-bold text-text-primary">{lastExperimentSummary.mainBranch}</span></div>
              <div>Orphaned Blocks: <span className="font-bold text-rose-400">{lastExperimentSummary.orphanedCount}</span></div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#1E293B]">
          <button
            type="button"
            onClick={() => {
              onResetAll();
              onClose();
            }}
            className="px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Đặt Lại Toàn Bộ Lab' : 'Reset All State'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'vi' ? 'Áp Dụng' : 'Apply Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
