import React from 'react';
import { PoSValidator } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Boxes,
  Award,
  Flame,
  CheckCircle2,
  ArrowLeft,
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
  const isVi = language === 'vi';

  const activeProposer = proposer || validators.find((v) => v.stake > 0) || validators[0];
  const proposerPreset = getValidatorPreset(activeProposer.id, activeProposer.name);
  const proposerName = activeProposer.name;
  const peers = validators.filter((v) => v.id !== activeProposer.id);

  const initialStake = activeProposer.stake || 500;
  const slashedAmount = initialStake * 0.5;
  const remainingStake = Math.max(0, initialStake - slashedAmount);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header & Active Solver Info */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#F2F4F7]">
            {isVi ? 'Ghi khối & Kiểm tra đồng thuận' : 'Block Creation & Peer Verification'}
          </h3>
          <p className="text-xs text-[#9AA5B5] mt-0.5">
            {isVi
              ? 'Thử nghiệm 2 kịch bản: Người giải khối làm đúng (Nhận thưởng) hoặc cố tình gian lận (Tịch thu tiền cọc).'
              : 'Explore 2 outcomes: Block Solver acts honestly (Earn reward) vs Fraudulent behavior (Slashed deposit).'}
          </p>
        </div>

        {/* Selected Writer Identifier Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0C0F14] border border-white/[0.08] self-start sm:self-auto text-xs">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proposerPreset.color }} />
          <span className="text-[#9AA5B5]">{isVi ? 'Người giải khối:' : 'Block Solver:'}</span>
          <span className="font-semibold text-[#F2F4F7]">{proposerName}</span>
        </div>
      </div>

      {/* 2. Scenario Selection Section */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0C0F14] border border-white/[0.08] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-semibold text-[#F2F4F7]">
            {isVi ? `Hãy chọn hành động của ${proposerName}:` : `Choose ${proposerName}'s action:`}
          </span>
          <span className="text-[11px] font-mono text-[#717B8C]">
            {isVi ? 'Chọn kịch bản để xem toàn bộ quy trình' : 'Select a scenario to view full workflow'}
          </span>
        </div>

        {/* 2 Scenario Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Honest Scenario Button */}
          <button
            type="button"
            id="pos-scenario-honest-btn"
            onClick={() => onSelectScenario('honest')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              scenarioOutcome === 'honest'
                ? 'bg-success/10 border-success/60 ring-1 ring-success/30'
                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] text-[#9AA5B5]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${
                  scenarioOutcome === 'honest'
                    ? 'bg-success/20 text-success border-success/40'
                    : 'bg-white/[0.04] border-white/[0.06] text-text-muted'
                }`}
              >
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-[#F2F4F7]">
                  {isVi ? '✓ Làm đúng (Ghi khối hợp lệ)' : '✓ Honest (Valid Block)'}
                </div>
                <p className="text-[11px] text-[#9AA5B5] mt-0.5">
                  {isVi ? (
                    <>
                      Ghi đúng giao dịch → Nhận <span className="text-amber-400 font-bold">+8 ETH thưởng</span>
                    </>
                  ) : (
                    <>
                      Valid transactions → Earn <span className="text-amber-400 font-bold">+8 ETH reward</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            {scenarioOutcome === 'honest' && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
          </button>

          {/* Fraud Scenario Button */}
          <button
            type="button"
            id="pos-scenario-fraud-btn"
            onClick={() => onSelectScenario('fraud')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              scenarioOutcome === 'fraud'
                ? 'bg-rose-950/20 border-rose-500/50 ring-1 ring-rose-500/30'
                : 'bg-white/[0.02] border-white/[0.06] hover:border-rose-500/30 text-[#9AA5B5]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${
                  scenarioOutcome === 'fraud'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-white/[0.04] border-white/[0.06] text-rose-400'
                }`}
              >
                <FileX2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-[#F2F4F7]">
                  {isVi ? '⚠ Gian lận (Cố tình ghi sai)' : '⚠ Cheat (Invalid Block)'}
                </div>
                <p className="text-[11px] text-[#9AA5B5] mt-0.5">
                  {isVi ? (
                    <>
                      Ghi sai dữ liệu → Bị tịch thu <span className="text-rose-400 font-bold">50% tiền cọc</span>
                    </>
                  ) : (
                    <>
                      Invalid data → <span className="text-rose-400 font-bold">50% deposit confiscated</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            {scenarioOutcome === 'fraud' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          </button>
        </div>
      </div>

      {/* 3. Visual 4-Step Verification Workflow */}
      {scenarioOutcome && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Step 1: Write Block */}
            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0C0F14] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/[0.04] text-[#9AA5B5] border border-white/[0.06]">
                  01. {isVi ? 'GHI KHỐI' : 'WRITE BLOCK'}
                </span>
                {scenarioOutcome === 'honest' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
              <p className="text-xs text-[#9AA5B5] leading-relaxed">
                {scenarioOutcome === 'honest'
                  ? isVi
                    ? `${proposerName} ghi các giao dịch hoàn toàn hợp lệ vào khối mới.`
                    : `${proposerName} writes completely valid transactions into the new block.`
                  : isVi
                  ? `${proposerName} cố tình ghi sai dữ liệu (ví dụ: tự ý thêm tiền vào ví của mình).`
                  : `${proposerName} deliberately writes invalid data (e.g. counterfeit coins).`}
              </p>
            </div>

            {/* Step 2: Peer Checks */}
            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0C0F14] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/[0.04] text-[#9AA5B5] border border-white/[0.06]">
                  02. {isVi ? 'KIỂM TRA' : 'PEER CHECKS'}
                </span>
                <UserCheck className="w-3.5 h-3.5 text-[#717B8C]" />
              </div>
              <div className="space-y-1 text-[11px] font-mono max-h-[90px] overflow-y-auto pr-1">
                {peers.map((p) => {
                  return (
                    <div key={p.id} className="flex items-center justify-between text-slate-300">
                      <span className="truncate max-w-[90px] text-[#717B8C]">{p.name}:</span>
                      <span className={scenarioOutcome === 'honest' ? 'text-success font-semibold' : 'text-rose-400 font-semibold'}>
                        {scenarioOutcome === 'honest'
                          ? `✓ ${isVi ? 'Hợp lệ' : 'Valid'}`
                          : `✕ ${isVi ? 'Phát hiện sai!' : 'Fraud!'}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Blockchain Commit */}
            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0C0F14] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/[0.04] text-[#9AA5B5] border border-white/[0.06]">
                  03. {isVi ? 'SỔ CÁI' : 'LEDGER'}
                </span>
                {scenarioOutcome === 'honest' ? (
                  <Boxes className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Boxes className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
              <p className="text-xs text-[#9AA5B5] leading-relaxed">
                {scenarioOutcome === 'honest'
                  ? isVi
                    ? 'Khối hợp lệ và được toàn mạng lưới đồng thuận chấp nhận vào sổ cái.'
                    : 'Block is valid and committed into the canonical blockchain ledger.'
                  : isVi
                  ? 'Khối không hợp lệ bị mạng lưới từ chối và loại bỏ ngay lập tức.'
                  : 'Fraudulent block is instantly rejected and discarded by the network.'}
              </p>
            </div>

            {/* Step 4: Reward / Penalty (Gold for Reward / Rose for Slashing) */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between bg-[#0C0F14] ${
                scenarioOutcome === 'honest'
                  ? 'border-amber-500/30'
                  : 'border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    scenarioOutcome === 'honest'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  }`}
                >
                  04. {scenarioOutcome === 'honest' ? (isVi ? 'PHẦN THƯỞNG' : 'REWARD') : (isVi ? 'TỊCH THU CỌC' : 'SLASHING')}
                </span>
                {scenarioOutcome === 'honest' ? (
                  <Award className="w-4 h-4 text-amber-400" />
                ) : (
                  <Flame className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div className="space-y-1">
                <div
                  className={`text-base font-bold font-mono tracking-tight ${
                    scenarioOutcome === 'honest' ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {scenarioOutcome === 'honest' ? '+8.00 ETH' : `-${slashedAmount.toFixed(0)} ETH (-50%)`}
                </div>
                <p
                  className={`text-[11px] leading-tight ${
                    scenarioOutcome === 'honest' ? 'text-amber-200/80' : 'text-rose-200/80'
                  }`}
                >
                  {scenarioOutcome === 'honest'
                    ? isVi
                      ? `${proposerName} nhận phần thưởng giải khối.`
                      : `${proposerName} earns block reward.`
                    : isVi
                    ? `Tịch thu 50% tiền cọc của ${proposerName}.`
                    : `50% of ${proposerName}'s deposit is confiscated.`}
                </p>
              </div>
            </div>
          </div>

          {/* Outcome Summary Banner */}
          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0C0F14] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              {scenarioOutcome === 'honest' ? (
                <div className="w-9 h-9 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center text-success shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-[#F2F4F7] flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                  {scenarioOutcome === 'honest' ? (
                    isVi ? (
                      <>
                        <span className="text-success">✓ Khối hợp lệ</span>
                        <span className="text-[#717B8C]">·</span>
                        <span className="text-[#F2F4F7]">Được chấp nhận vào sổ cái</span>
                        <span className="text-[#717B8C]">·</span>
                        <span className="text-amber-400 font-mono font-bold">+8 ETH Thưởng</span>
                      </>
                    ) : (
                      <>
                        <span className="text-success">✓ Valid Block</span>
                        <span className="text-[#717B8C]">·</span>
                        <span className="text-[#F2F4F7]">Committed to Ledger</span>
                        <span className="text-[#717B8C]">·</span>
                        <span className="text-amber-400 font-mono font-bold">+8 ETH Reward</span>
                      </>
                    )
                  ) : isVi ? (
                    <>
                      <span className="text-rose-400">✕ Phát hiện sai phạm!</span>
                      <span className="text-[#717B8C]">·</span>
                      <span className="text-[#F2F4F7]">Khối bị từ chối</span>
                      <span className="text-[#717B8C]">·</span>
                      <span className="text-rose-400 font-mono font-bold">Tịch thu {slashedAmount.toFixed(0)} ETH cọc</span>
                    </>
                  ) : (
                    <>
                      <span className="text-rose-400">✕ Fraud Detected!</span>
                      <span className="text-[#717B8C]">·</span>
                      <span className="text-[#F2F4F7]">Block Discarded</span>
                      <span className="text-[#717B8C]">·</span>
                      <span className="text-rose-400 font-mono font-bold">-{slashedAmount.toFixed(0)} ETH Slashed</span>
                    </>
                  )}
                </h4>
                <p className="text-xs mt-1 font-mono text-[#9AA5B5]">
                  {scenarioOutcome === 'honest' ? (
                    isVi ? (
                      <>
                        <span>Tiền đặt cọc của {proposerName}: </span>
                        <span className="text-[#F2F4F7]">{initialStake.toFixed(0)} ETH</span>
                        <span className="text-[#717B8C] mx-1">→</span>
                        <span className="text-amber-400 font-bold">{(initialStake + 8).toFixed(0)} ETH</span>
                        <span className="text-amber-400/80 text-[11px] ml-1">(+8.00 ETH)</span>
                      </>
                    ) : (
                      <>
                        <span>{proposerName}'s deposit: </span>
                        <span className="text-[#F2F4F7]">{initialStake.toFixed(0)} ETH</span>
                        <span className="text-[#717B8C] mx-1">→</span>
                        <span className="text-amber-400 font-bold">{(initialStake + 8).toFixed(0)} ETH</span>
                        <span className="text-amber-400/80 text-[11px] ml-1">(+8.00 ETH)</span>
                      </>
                    )
                  ) : isVi ? (
                    <>
                      <span>Tiền đặt cọc của {proposerName}: </span>
                      <span className="text-[#F2F4F7]">{initialStake.toFixed(0)} ETH</span>
                      <span className="text-[#717B8C] mx-1">→</span>
                      <span className="text-rose-400 font-bold">{remainingStake.toFixed(0)} ETH</span>
                      <span className="text-rose-400/80 text-[11px] ml-1">(-{slashedAmount.toFixed(0)} ETH)</span>
                    </>
                  ) : (
                    <>
                      <span>{proposerName}'s deposit: </span>
                      <span className="text-[#F2F4F7]">{initialStake.toFixed(0)} ETH</span>
                      <span className="text-[#717B8C] mx-1">→</span>
                      <span className="text-rose-400 font-bold">{remainingStake.toFixed(0)} ETH</span>
                      <span className="text-rose-400/80 text-[11px] ml-1">(-{slashedAmount.toFixed(0)} ETH)</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="pos-toggle-scenario-btn"
              onClick={() => onSelectScenario(scenarioOutcome === 'honest' ? 'fraud' : 'honest')}
              className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-[#F2F4F7] transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#9AA5B5]" />
              <span>{isVi ? 'Thử kịch bản còn lại' : 'Try Other Scenario'}</span>
            </button>
          </div>

          {/* Educational Principle Callout */}
          <div className="border-l-2 border-amber-500/60 pl-3.5 py-1 text-xs text-[#9AA5B5] leading-relaxed">
            <strong className="text-amber-300 font-semibold block mb-0.5">
              {isVi ? '💡 Động lực kinh tế trong Proof of Stake:' : '💡 Economic Incentives in Proof of Stake:'}
            </strong>
            {isVi ? (
              <>
                Người giải khối luôn có động lực kinh tế để làm việc trung thực — làm đúng thì nhận{' '}
                <span className="text-amber-400 font-semibold">phần thưởng ETH</span>, còn nếu cố tình gian lận sẽ bị cả mạng lưới phát hiện và{' '}
                <span className="text-rose-400 font-semibold">tịch thu tiền cọc (Slashing)</span>.
              </>
            ) : (
              <>
                Block Solvers are economically incentivized to act honestly — acting correctly earns{' '}
                <span className="text-amber-400 font-semibold">ETH rewards</span>, while attempting fraud guarantees peer detection and{' '}
                <span className="text-rose-400 font-semibold">deposit slashing</span>.
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. Navigation Controls */}
      <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
        {onBackToStep2 && (
          <button
            type="button"
            id="pos-back-to-step2-btn"
            onClick={onBackToStep2}
            className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#9AA5B5] hover:text-[#F2F4F7] border border-white/[0.06] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isVi ? 'Quay lại: Chọn người giải khối' : 'Back: Select Solver'}</span>
          </button>
        )}

        {onResetAll && (
          <button
            type="button"
            id="pos-reset-all-btn"
            onClick={onResetAll}
 className="px-5 py-2.5 rounded-lg bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer ml-auto shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#090A0F]" />
            <span>{isVi ? 'Làm lại từ đầu' : 'Restart Simulation'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
