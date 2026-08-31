import React from 'react';
import { PoSValidator } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Boxes,
  ShieldCheck,
  Award,
  Flame,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  FileCheck2,
  FileX2,
} from 'lucide-react';
import { getValidatorPreset } from './posConstants';

interface ConsensusAttestationArenaProps {
  proposer: PoSValidator | null;
  validators: PoSValidator[];
  scenarioOutcome: 'honest' | 'fraud' | null;
  onSelectScenario: (scenario: 'honest' | 'fraud') => void;
  onBackToStep2?: () => void;
  onResetAll?: () => void;
}

export const ConsensusAttestationArena: React.FC<ConsensusAttestationArenaProps> = ({
  proposer,
  validators,
  scenarioOutcome,
  onSelectScenario,
  onBackToStep2,
  onResetAll,
}) => {
  const { language } = useLanguage();

  const activeProposer = proposer || validators.find((v) => v.stake > 0) || validators[0];
  const proposerPreset = getValidatorPreset(activeProposer.id, activeProposer.name);
  const proposerName = activeProposer.name;
  const peers = validators.filter((v) => v.id !== activeProposer.id);

  const initialStake = activeProposer.stake || 500;
  const slashedAmount = initialStake * 0.5;
  const remainingStake = Math.max(0, initialStake - slashedAmount);

  return (
    <div className="bg-[#0C0F14] border border-[#1C2430] rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C2430]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.35)] flex items-center justify-center text-[#00C98D] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[rgba(0,201,141,0.12)] text-[#00C98D] border border-[rgba(0,201,141,0.35)]">
                {language === 'vi' ? 'BƯỚC 3' : 'STEP 3'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#F2F4F7] font-display">
                {language === 'vi' ? 'Ghi khối & Kiểm tra đồng thuận' : 'Block Creation & Peer Verification'}
              </h3>
            </div>
            <p className="text-xs text-[#A5AFBF] mt-0.5">
              {language === 'vi'
                ? 'Thử nghiệm 2 kịch bản: Người giải khối làm đúng (Nhận thưởng) hoặc cố tình gian lận (Tịch thu tiền cọc).'
                : 'Explore 2 outcomes: Block Solver acts honestly (Earn reward) vs Fraudulent behavior (Slashed deposit).'}
            </p>
          </div>
        </div>

        {/* Selected Writer Identifier */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F131A] border border-[#1C2430] self-start sm:self-auto">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: proposerPreset.color }} />
          <span className="text-xs text-[#A5AFBF]">{language === 'vi' ? 'Người giải khối:' : 'Block Solver:'}</span>
          <span className="font-bold text-[#F2F4F7] text-xs">{proposerName}</span>
        </div>
      </div>

      {/* Scenario Selection Prompt */}
      <div className="bg-[#0B0F15] border border-[#1C2430] rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-bold text-[#F2F4F7]">
            {language === 'vi' ? `Hãy chọn hành động của ${proposerName}:` : `Choose ${proposerName}'s action:`}
          </span>
          <span className="text-[11px] font-mono text-[#717B8C]">
            {language === 'vi' ? 'Chọn kịch bản để xem toàn bộ quy trình' : 'Select a scenario to view full workflow'}
          </span>
        </div>

        {/* 2 Scenario Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            id="pos-scenario-honest-btn"
            onClick={() => onSelectScenario('honest')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              scenarioOutcome === 'honest'
                ? 'bg-[rgba(0,201,141,0.12)] border-[#00C98D] text-[#00C98D] shadow-[0_0_20px_rgba(0,201,141,0.2)] ring-1 ring-[#00C98D]'
                : 'bg-[#0F131A] border-[#1C2430] hover:border-[rgba(0,201,141,0.35)] text-[#A5AFBF]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                  scenarioOutcome === 'honest'
                    ? 'bg-[#00C98D] text-[#090A0F] border-[#00C98D]'
                    : 'bg-[#0B0F15] border-[#1C2430] text-[#00C98D]'
                }`}
              >
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold font-sans text-[#F2F4F7]">
                  {language === 'vi' ? '✓ Làm đúng (Ghi khối hợp lệ)' : '✓ Honest (Valid Block)'}
                </div>
                <p className="text-[11px] text-[#A5AFBF] mt-0.5">
                  {language === 'vi' ? 'Ghi đúng giao dịch → Nhận +8 ETH thưởng' : 'Valid transactions → +8 ETH reward'}
                </p>
              </div>
            </div>
            {scenarioOutcome === 'honest' && <CheckCircle2 className="w-5 h-5 text-[#00C98D] shrink-0" />}
          </button>

          <button
            type="button"
            id="pos-scenario-fraud-btn"
            onClick={() => onSelectScenario('fraud')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              scenarioOutcome === 'fraud'
                ? 'bg-rose-950/40 border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.2)] ring-1 ring-rose-500'
                : 'bg-[#0F131A] border-[#1C2430] hover:border-rose-500/50 text-[#A5AFBF]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                  scenarioOutcome === 'fraud'
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-[#0B0F15] border-[#1C2430] text-rose-400'
                }`}
              >
                <FileX2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold font-sans text-[#F2F4F7]">
                  {language === 'vi' ? '⚠ Gian lận (Cố tình ghi sai)' : '⚠ Cheat (Invalid Block)'}
                </div>
                <p className="text-[11px] text-[#A5AFBF] mt-0.5">
                  {language === 'vi' ? 'Ghi sai dữ liệu → Bị tịch thu 50% tiền cọc' : 'Invalid data → 50% deposit confiscated'}
                </p>
              </div>
            </div>
            {scenarioOutcome === 'fraud' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Visual 4-Step Verification Workflow */}
      {scenarioOutcome && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Step 1: Write Block */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                scenarioOutcome === 'honest'
                  ? 'bg-[rgba(0,201,141,0.06)] border-[rgba(0,201,141,0.3)]'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0B0F15] text-[#717B8C]">
                  01. {language === 'vi' ? 'GHI KHỐI' : 'WRITE BLOCK'}
                </span>
                {scenarioOutcome === 'honest' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C98D]" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
              <p className="text-xs text-[#F2F4F7] leading-relaxed font-sans">
                {scenarioOutcome === 'honest'
                  ? language === 'vi'
                    ? `${proposerName} ghi các giao dịch hoàn toàn hợp lệ vào khối mới.`
                    : `${proposerName} writes completely valid transactions into the new block.`
                  : language === 'vi'
                  ? `${proposerName} cố tình ghi sai dữ liệu (ví dụ: tự ý thêm tiền vào ví của mình).`
                  : `${proposerName} deliberately writes invalid data (e.g. counterfeit coins).`}
              </p>
            </div>

            {/* Step 2: Peer Checks */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                scenarioOutcome === 'honest'
                  ? 'bg-[rgba(0,201,141,0.06)] border-[rgba(0,201,141,0.3)]'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0B0F15] text-[#717B8C]">
                  02. {language === 'vi' ? 'KIỂM TRA' : 'PEER CHECKS'}
                </span>
                <UserCheck className="w-3.5 h-3.5 text-[#00C98D]" />
              </div>
              <div className="space-y-1 text-[11px] font-mono max-h-[90px] overflow-y-auto pr-1">
                {peers.map((p) => {
                  return (
                    <div key={p.id} className="flex items-center justify-between text-[#C8D0DB]">
                      <span className="truncate max-w-[90px]">{p.name}:</span>
                      <span className={scenarioOutcome === 'honest' ? 'text-[#00C98D] font-bold' : 'text-rose-400 font-bold'}>
                        {scenarioOutcome === 'honest'
                          ? `✓ ${language === 'vi' ? 'Hợp lệ' : 'Valid'}`
                          : `✕ ${language === 'vi' ? 'Phát hiện sai!' : 'Fraud!'}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Blockchain Commit */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                scenarioOutcome === 'honest'
                  ? 'bg-[rgba(0,201,141,0.06)] border-[rgba(0,201,141,0.3)]'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0B0F15] text-[#717B8C]">
                  03. {language === 'vi' ? 'SỔ CÁI' : 'LEDGER'}
                </span>
                <Boxes className="w-3.5 h-3.5 text-[#00C98D]" />
              </div>
              <p className="text-xs text-[#F2F4F7] leading-relaxed font-sans">
                {scenarioOutcome === 'honest'
                  ? language === 'vi'
                    ? 'Khối hợp lệ và được toàn mạng lưới đồng thuận chấp nhận vào sổ cái.'
                    : 'Block is valid and committed into the canonical blockchain ledger.'
                  : language === 'vi'
                  ? 'Khối không hợp lệ bị mạng lưới từ chối và loại bỏ ngay lập tức.'
                  : 'Fraudulent block is instantly rejected and discarded by the network.'}
              </p>
            </div>

            {/* Step 4: Reward / Penalty */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                scenarioOutcome === 'honest'
                  ? 'bg-[rgba(0,201,141,0.12)] border-[#00C98D] text-[#00C98D]'
                  : 'bg-rose-950/40 border-rose-400 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0B0F15] text-[#C8D0DB]">
                  04. {scenarioOutcome === 'honest' ? (language === 'vi' ? 'PHẦN THƯỞNG' : 'REWARD') : (language === 'vi' ? 'TỊCH THU CỌC' : 'SLASHING')}
                </span>
                {scenarioOutcome === 'honest' ? (
                  <Award className="w-4 h-4 text-[#00C98D]" />
                ) : (
                  <Flame className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-black font-mono">
                  {scenarioOutcome === 'honest' ? '+8.00 ETH' : `-${slashedAmount.toFixed(0)} ETH (-50%)`}
                </div>
                <p className="text-[11px] opacity-90 leading-tight">
                  {scenarioOutcome === 'honest'
                    ? language === 'vi'
                      ? `${proposerName} nhận phần thưởng giải khối.`
                      : `${proposerName} earns block reward.`
                    : language === 'vi'
                    ? `Tịch thu 50% tiền cọc của ${proposerName}.`
                    : `50% of ${proposerName}'s deposit is confiscated.`}
                </p>
              </div>
            </div>
          </div>

          {/* Outcome Summary Pill */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${
              scenarioOutcome === 'honest'
                ? 'bg-[rgba(0,201,141,0.08)] border-[rgba(0,201,141,0.35)] text-[#00C98D]'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {scenarioOutcome === 'honest' ? (
                <div className="w-9 h-9 rounded-xl bg-[rgba(0,201,141,0.2)] border border-[rgba(0,201,141,0.4)] flex items-center justify-center text-[#00C98D] shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold font-display text-[#F2F4F7]">
                  {scenarioOutcome === 'honest'
                    ? language === 'vi'
                      ? 'Khối hợp lệ ✓ Được chấp nhận vào sổ cái ✓ +8 ETH Phần thưởng'
                      : 'Valid Block ✓ Accepted into Ledger ✓ +8 ETH Reward'
                    : language === 'vi'
                    ? `Phát hiện sai phạm! ✕ Khối bị từ chối ✕ Tịch thu ${slashedAmount.toFixed(0)} ETH tiền cọc`
                    : `Fraud Detected! ✕ Block Discarded ✕ ${slashedAmount.toFixed(0)} ETH Deposit Confiscated`}
                </h4>
                <p className="text-xs opacity-90 mt-0.5 font-mono text-[#A5AFBF]">
                  {scenarioOutcome === 'honest'
                    ? language === 'vi'
                      ? `Tiền đặt cọc của ${proposerName}: ${initialStake.toFixed(0)} ETH → ${(initialStake + 8).toFixed(0)} ETH`
                      : `${proposerName}'s deposit: ${initialStake.toFixed(0)} ETH → ${(initialStake + 8).toFixed(0)} ETH`
                    : language === 'vi'
                    ? `Tiền đặt cọc của ${proposerName}: ${initialStake.toFixed(0)} ETH → ${remainingStake.toFixed(0)} ETH`
                    : `${proposerName}'s deposit: ${initialStake.toFixed(0)} ETH → ${remainingStake.toFixed(0)} ETH`}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="pos-toggle-scenario-btn"
              onClick={() => onSelectScenario(scenarioOutcome === 'honest' ? 'fraud' : 'honest')}
              className="px-4 py-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] border border-[#1C2430] text-xs font-bold text-[#F2F4F7] transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Thử kịch bản còn lại' : 'Try Other Scenario'}</span>
            </button>
          </div>

          {/* Educational Principle Takeaway */}
          <div className="p-4 rounded-xl bg-[rgba(0,201,141,0.06)] border border-[rgba(0,201,141,0.3)] flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#00C98D] shrink-0 mt-0.5" />
            <div className="text-xs text-[#F2F4F7] leading-relaxed font-sans">
              <strong className="text-[#00C98D] font-bold block mb-0.5">
                {language === 'vi' ? 'Động lực kinh tế trong Proof of Stake:' : 'Economic Incentives in Proof of Stake:'}
              </strong>
              {language === 'vi'
                ? 'Người giải khối luôn có động lực kinh tế để làm việc trung thực — làm đúng thì nhận phần thưởng ETH, còn nếu cố tình gian lận sẽ bị cả mạng lưới phát hiện và tịch thu tiền cọc (Slashing).'
                : 'Block Solvers are economically incentivized to act honestly — acting correctly earns ETH rewards, while attempting fraud guarantees peer detection and loss of deposit.'}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="pt-4 border-t border-[#1C2430] flex flex-col sm:flex-row items-center justify-between gap-3">
        {onBackToStep2 && (
          <button
            type="button"
            id="pos-back-to-step2-btn"
            onClick={onBackToStep2}
            className="px-4 py-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] border border-[#1C2430] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Quay lại: Chọn người giải khối' : 'Back: Select Block Solver'}</span>
          </button>
        )}

        {onResetAll && (
          <button
            type="button"
            id="pos-reset-all-btn"
            onClick={onResetAll}
            className="px-5 py-2 rounded-xl bg-[#00C98D] hover:bg-[#00B982] text-[#090A0F] border border-[#00C98D] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ml-auto shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#090A0F]" />
            <span>{language === 'vi' ? 'Làm lại từ đầu' : 'Restart Simulation'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
