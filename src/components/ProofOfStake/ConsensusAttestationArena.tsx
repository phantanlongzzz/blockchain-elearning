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
  RefreshCw,
  UserCheck,
  AlertTriangle,
  FileCheck2,
  FileX2,
  Coins,
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
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
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
          {/* Honest Scenario Button */}
          <button
            type="button"
            id="pos-scenario-honest-btn"
            onClick={() => onSelectScenario('honest')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              scenarioOutcome === 'honest'
                ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/30'
                : 'bg-[#0F131A] border-[#1C2430] hover:border-slate-700 text-[#A5AFBF]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                  scenarioOutcome === 'honest'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-[#0B0F15] border-[#1C2430] text-emerald-400'
                }`}
              >
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold font-sans text-[#F2F4F7]">
                  {language === 'vi' ? '✓ Làm đúng (Ghi khối hợp lệ)' : '✓ Honest (Valid Block)'}
                </div>
                <p className="text-[11px] text-[#A5AFBF] mt-0.5">
                  {language === 'vi' ? (
                    <>
                      Ghi đúng giao dịch → Nhận <span className="text-amber-400 font-semibold">+8 ETH thưởng</span>
                    </>
                  ) : (
                    <>
                      Valid transactions → Earn <span className="text-amber-400 font-semibold">+8 ETH reward</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            {scenarioOutcome === 'honest' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          </button>

          {/* Fraud Scenario Button */}
          <button
            type="button"
            id="pos-scenario-fraud-btn"
            onClick={() => onSelectScenario('fraud')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              scenarioOutcome === 'fraud'
                ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/30'
                : 'bg-[#0F131A] border-[#1C2430] hover:border-rose-500/40 text-[#A5AFBF]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                  scenarioOutcome === 'fraud'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
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
                  {language === 'vi' ? (
                    <>
                      Ghi sai dữ liệu → Bị tịch thu <span className="text-rose-400 font-semibold">50% tiền cọc</span>
                    </>
                  ) : (
                    <>
                      Invalid data → <span className="text-rose-400 font-semibold">50% deposit confiscated</span>
                    </>
                  )}
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
            {/* Step 1: Write Block (Neutral Dark Card) */}
            <div className="p-3.5 rounded-xl border border-[#1C2430] bg-[#0B0E12] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0F131A] text-slate-400 border border-slate-800">
                  01. {language === 'vi' ? 'GHI KHỐI' : 'WRITE BLOCK'}
                </span>
                {scenarioOutcome === 'honest' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {scenarioOutcome === 'honest'
                  ? language === 'vi'
                    ? `${proposerName} ghi các giao dịch hoàn toàn hợp lệ vào khối mới.`
                    : `${proposerName} writes completely valid transactions into the new block.`
                  : language === 'vi'
                  ? `${proposerName} cố tình ghi sai dữ liệu (ví dụ: tự ý thêm tiền vào ví của mình).`
                  : `${proposerName} deliberately writes invalid data (e.g. counterfeit coins).`}
              </p>
            </div>

            {/* Step 2: Peer Checks (Neutral Dark Card) */}
            <div className="p-3.5 rounded-xl border border-[#1C2430] bg-[#0B0E12] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0F131A] text-slate-400 border border-slate-800">
                  02. {language === 'vi' ? 'KIỂM TRA' : 'PEER CHECKS'}
                </span>
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-1 text-[11px] font-mono max-h-[90px] overflow-y-auto pr-1">
                {peers.map((p) => {
                  return (
                    <div key={p.id} className="flex items-center justify-between text-slate-300">
                      <span className="truncate max-w-[90px] text-slate-400">{p.name}:</span>
                      <span className={scenarioOutcome === 'honest' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {scenarioOutcome === 'honest'
                          ? `✓ ${language === 'vi' ? 'Hợp lệ' : 'Valid'}`
                          : `✕ ${language === 'vi' ? 'Phát hiện sai!' : 'Fraud!'}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Blockchain Commit (Neutral Dark Card) */}
            <div className="p-3.5 rounded-xl border border-[#1C2430] bg-[#0B0E12] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0F131A] text-slate-400 border border-slate-800">
                  03. {language === 'vi' ? 'SỔ CÁI' : 'LEDGER'}
                </span>
                {scenarioOutcome === 'honest' ? (
                  <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Boxes className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {scenarioOutcome === 'honest'
                  ? language === 'vi'
                    ? 'Khối hợp lệ và được toàn mạng lưới đồng thuận chấp nhận vào sổ cái.'
                    : 'Block is valid and committed into the canonical blockchain ledger.'
                  : language === 'vi'
                  ? 'Khối không hợp lệ bị mạng lưới từ chối và loại bỏ ngay lập tức.'
                  : 'Fraudulent block is instantly rejected and discarded by the network.'}
              </p>
            </div>

            {/* Step 4: Reward / Penalty (Gold for Reward / Rose for Slashing) */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                scenarioOutcome === 'honest'
                  ? 'bg-amber-500/5 border-amber-500/35 text-slate-200'
                  : 'bg-rose-950/20 border-rose-500/35 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    scenarioOutcome === 'honest'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}
                >
                  04. {scenarioOutcome === 'honest' ? (language === 'vi' ? 'PHẦN THƯỞNG' : 'REWARD') : (language === 'vi' ? 'TỊCH THU CỌC' : 'SLASHING')}
                </span>
                {scenarioOutcome === 'honest' ? (
                  <Award className="w-4 h-4 text-amber-400" />
                ) : (
                  <Flame className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div className="space-y-1">
                <div
                  className={`text-base font-black font-mono tracking-tight ${
                    scenarioOutcome === 'honest' ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {scenarioOutcome === 'honest' ? '+8.00 ETH' : `-${slashedAmount.toFixed(0)} ETH (-50%)`}
                </div>
                <p
                  className={`text-[11px] leading-tight ${
                    scenarioOutcome === 'honest' ? 'text-amber-200/90' : 'text-rose-200/90'
                  }`}
                >
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

          {/* Outcome Summary Banner (Balanced Semantic Hierarchy) */}
          <div className="p-4 rounded-xl border border-[#1C2430] bg-[#0B0E12] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              {scenarioOutcome === 'honest' ? (
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold font-sans text-[#F2F4F7] flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                  {scenarioOutcome === 'honest' ? (
                    language === 'vi' ? (
                      <>
                        <span className="text-emerald-400">✓ Khối hợp lệ</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-300">Được chấp nhận vào sổ cái</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-amber-400 font-mono font-bold">+8 ETH Thưởng</span>
                      </>
                    ) : (
                      <>
                        <span className="text-emerald-400">✓ Valid Block</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-300">Committed to Ledger</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-amber-400 font-mono font-bold">+8 ETH Reward</span>
                      </>
                    )
                  ) : language === 'vi' ? (
                    <>
                      <span className="text-rose-400">✕ Phát hiện sai phạm!</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-300">Khối bị từ chối</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-rose-400 font-mono font-bold">Tịch thu {slashedAmount.toFixed(0)} ETH cọc</span>
                    </>
                  ) : (
                    <>
                      <span className="text-rose-400">✕ Fraud Detected!</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-300">Block Discarded</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-rose-400 font-mono font-bold">-{slashedAmount.toFixed(0)} ETH Slashed</span>
                    </>
                  )}
                </h4>
                <p className="text-xs mt-1 font-mono text-slate-400">
                  {scenarioOutcome === 'honest' ? (
                    language === 'vi' ? (
                      <>
                        <span>Tiền đặt cọc của {proposerName}: </span>
                        <span className="text-slate-300">{initialStake.toFixed(0)} ETH</span>
                        <span className="text-slate-600 mx-1">→</span>
                        <span className="text-amber-400 font-bold">{(initialStake + 8).toFixed(0)} ETH</span>
                        <span className="text-amber-500/80 text-[11px] ml-1">(+8.00 ETH)</span>
                      </>
                    ) : (
                      <>
                        <span>{proposerName}'s deposit: </span>
                        <span className="text-slate-300">{initialStake.toFixed(0)} ETH</span>
                        <span className="text-slate-600 mx-1">→</span>
                        <span className="text-amber-400 font-bold">{(initialStake + 8).toFixed(0)} ETH</span>
                        <span className="text-amber-500/80 text-[11px] ml-1">(+8.00 ETH)</span>
                      </>
                    )
                  ) : language === 'vi' ? (
                    <>
                      <span>Tiền đặt cọc của {proposerName}: </span>
                      <span className="text-slate-300">{initialStake.toFixed(0)} ETH</span>
                      <span className="text-slate-600 mx-1">→</span>
                      <span className="text-rose-400 font-bold">{remainingStake.toFixed(0)} ETH</span>
                      <span className="text-rose-500/80 text-[11px] ml-1">(-{slashedAmount.toFixed(0)} ETH)</span>
                    </>
                  ) : (
                    <>
                      <span>{proposerName}'s deposit: </span>
                      <span className="text-slate-300">{initialStake.toFixed(0)} ETH</span>
                      <span className="text-slate-600 mx-1">→</span>
                      <span className="text-rose-400 font-bold">{remainingStake.toFixed(0)} ETH</span>
                      <span className="text-rose-500/80 text-[11px] ml-1">(-{slashedAmount.toFixed(0)} ETH)</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="pos-toggle-scenario-btn"
              onClick={() => onSelectScenario(scenarioOutcome === 'honest' ? 'fraud' : 'honest')}
              className="px-4 py-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] border border-[#1C2430] hover:border-slate-700 text-xs font-bold text-[#F2F4F7] transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'vi' ? 'Thử kịch bản còn lại' : 'Try Other Scenario'}</span>
            </button>
          </div>

          {/* Educational Principle Takeaway (Economic Incentives in Gold/Amber) */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/25 flex items-start gap-3">
            <Coins className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong className="text-amber-300 font-bold block mb-0.5">
                {language === 'vi' ? 'Động lực kinh tế trong Proof of Stake:' : 'Economic Incentives in Proof of Stake:'}
              </strong>
              {language === 'vi' ? (
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
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#090A0F] border border-emerald-500 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ml-auto shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#090A0F]" />
            <span>{language === 'vi' ? 'Làm lại từ đầu' : 'Restart Simulation'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

