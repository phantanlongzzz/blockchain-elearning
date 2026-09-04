import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  KeyRound,
  ShieldCheck,
  Boxes,
  GitFork,
  Lock,
  FlaskConical,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { fastSha256Hex } from '../../utils/sha256';
import { calculateTxHash, calculateCombinedHash } from '../../utils/merkle';

interface FullBlockLifecycleSimulationProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
  onPrevStage?: () => void;
  onOpenHandsOnLab?: () => void;
}

export const FullBlockLifecycleSimulation: React.FC<FullBlockLifecycleSimulationProps> = ({
  onInteracted,
  onOpenHandsOnLab,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // 6 Lifecycle steps: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);

  // Playground state for post-simulation interaction
  const [tx3Amount, setTx3Amount] = useState<number>(10.0);
  const [playTimestamp, setPlayTimestamp] = useState<number>(1715428800);
  const [playPrevHash, setPlayPrevHash] = useState<string>(
    '0000a3f9e81b2c4d6e8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d'
  );
  const [playNonce, setPlayNonce] = useState<number>(48291);

  // Live computed values
  const [liveMerkleRoot, setLiveMerkleRoot] = useState<string>('');
  const [liveBlockHash, setLiveBlockHash] = useState<string>('');

  const autoRunTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Step 1 Transaction details
  const txAlice = {
    id: 'TX-03',
    sender: 'Alice',
    receiver: 'Bob',
    amount: tx3Amount,
    unit: 'BTC',
    timestamp: '12:05 UTC',
  };

  const BODY_TXS = [
    { id: 'TX-01', from: 'David', to: 'Alice', amount: 5.0, unit: 'BTC' },
    { id: 'TX-02', from: 'Bob', to: 'Charlie', amount: 2.5, unit: 'BTC' },
    { id: 'TX-03', from: 'Alice', to: 'Bob', amount: tx3Amount, unit: 'BTC', isNew: true },
    { id: 'TX-04', from: 'Charlie', to: 'Eve', amount: 1.2, unit: 'BTC' },
  ];

  // Recompute Merkle Root and Block Hash
  useEffect(() => {
    const compute = async () => {
      const h1 = calculateTxHash({ sender: 'David', receiver: 'Alice', amount: 5.0, timestamp: '12:01' });
      const h2 = calculateTxHash({ sender: 'Bob', receiver: 'Charlie', amount: 2.5, timestamp: '12:03' });
      const h3 = calculateTxHash({ sender: 'Alice', receiver: 'Bob', amount: tx3Amount, timestamp: '12:05' });
      const h4 = calculateTxHash({ sender: 'Charlie', receiver: 'Eve', amount: 1.2, timestamp: '12:08' });

      const h12 = calculateCombinedHash(h1, h2);
      const h34 = calculateCombinedHash(h3, h4);
      const root = calculateCombinedHash(h12, h34);
      setLiveMerkleRoot(root);

      const headerRaw = `42|${playPrevHash}|${root}|${playTimestamp}|${playNonce}`;
      const bHash = await fastSha256Hex(headerRaw);
      setLiveBlockHash(bHash);
    };
    compute();
  }, [tx3Amount, playTimestamp, playPrevHash, playNonce]);

  // Handle Auto-Run progression
  useEffect(() => {
    if (isAutoRunning) {
      autoRunTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 6) {
            setIsAutoRunning(false);
            return 6;
          }
          return prev + 1;
        });
      }, 3500);
    } else {
      if (autoRunTimerRef.current) {
        clearInterval(autoRunTimerRef.current);
        autoRunTimerRef.current = null;
      }
    }
    return () => {
      if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    };
  }, [isAutoRunning]);

  const handleNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
      if (onInteracted) onInteracted();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      if (onInteracted) onInteracted();
    }
  };

  const handleResetSimulation = () => {
    setIsAutoRunning(false);
    setCurrentStep(1);
    setTx3Amount(10.0);
    setPlayTimestamp(1715428800);
    setPlayPrevHash('0000a3f9e81b2c4d6e8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d');
    setPlayNonce(48291);
    if (onInteracted) onInteracted();
  };

  const toggleAutoRun = () => {
    setIsAutoRunning((prev) => !prev);
    if (onInteracted) onInteracted();
  };

  const STEPS_INFO = [
    {
      step: 1,
      title: { vi: 'BƯỚC 1: TẠO GIAO DỊCH (CREATE TX)', en: 'STEP 1: CREATE TRANSACTION' },
      short: { vi: 'Tạo TX', en: 'Create TX' },
      desc: {
        vi: 'Alice khởi tạo giao dịch chuyển 10 BTC cho Bob từ ví cá nhân.',
        en: 'Alice initiates a transaction sending 10 BTC to Bob from her wallet.',
      },
    },
    {
      step: 2,
      title: { vi: 'BƯỚC 2: KÝ SỐ GIAO DỊCH (SIGN TX)', en: 'STEP 2: SIGN TRANSACTION' },
      short: { vi: 'Ký Số', en: 'Sign TX' },
      desc: {
        vi: 'Băm dữ liệu giao dịch bằng SHA-256 và ký bằng Khóa Riêng Tư của Alice (SECP256K1).',
        en: 'Hash transaction data with SHA-256 and sign with Alice’s Private Key.',
      },
    },
    {
      step: 3,
      title: { vi: 'BƯỚC 3: XÁC THỰC MẠNG LƯỚI (VERIFY)', en: 'STEP 3: NETWORK VERIFICATION' },
      short: { vi: 'Xác Thực', en: 'Verify' },
      desc: {
        vi: 'Các nút mạng (Node) dùng Khóa Công Khai của Alice để xác minh chữ ký hợp lệ.',
        en: 'Network nodes verify the signature using Alice’s Public Key.',
      },
    },
    {
      step: 4,
      title: { vi: 'BƯỚC 4: ĐƯA VÀO BLOCK BODY (PACKAGING)', en: 'STEP 4: ADD TO BLOCK BODY' },
      short: { vi: 'Vào Body', en: 'Block Body' },
      desc: {
        vi: 'Giao dịch hợp lệ được gom từ Mempool và đưa vào Block Body cùng các giao dịch khác.',
        en: 'Valid transaction is pulled from Mempool into Block Body alongside others.',
      },
    },
    {
      step: 5,
      title: { vi: 'BƯỚC 5: TẠO CÂY & MERKLE ROOT', en: 'STEP 5: BUILD MERKLE ROOT' },
      short: { vi: 'Merkle Root', en: 'Merkle Root' },
      desc: {
        vi: 'Toàn bộ giao dịch trong Body được băm thành Merkle Root 32 bytes và gắn vào Block Header.',
        en: 'All transactions are hashed into a 32-byte Merkle Root placed in Block Header.',
      },
    },
    {
      step: 6,
      title: { vi: 'BƯỚC 6: HOÀN THIỆN BLOCK & TÍNH HASH', en: 'STEP 6: FINALIZE BLOCK HASH' },
      short: { vi: 'Tính Hash', en: 'Block Hash' },
      desc: {
        vi: 'Băm toàn bộ Block Header (PrevHash + Timestamp + MerkleRoot + Nonce) để tạo Block Hash chính thức.',
        en: 'Hash Block Header (PrevHash + Timestamp + MerkleRoot + Nonce) to yield Block Hash.',
      },
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Main Simulation Arena */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0B0E12] border border-[#1C2430] space-y-6">
        {/* Simulation Control Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C2430]">
          {/* Step Pill Indicators */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {STEPS_INFO.map((s) => (
              <button
                key={s.step}
                type="button"
                id={`btn-lifecycle-step-${s.step}`}
                onClick={() => {
                  setIsAutoRunning(false);
                  setCurrentStep(s.step);
                }}
                className={`px-3 py-1.5 rounded-md font-sans text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  currentStep === s.step
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : currentStep > s.step
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'bg-[#10151D] text-[#A5AFBF] border border-[#1C2430] hover:text-slate-200'
                }`}
              >
                {s.step}. {s.short[language as 'vi' | 'en'] || s.short.vi}
              </button>
            ))}
          </div>

          {/* Action Buttons: Prev, Next, AutoRun, Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-lifecycle-prev"
              disabled={currentStep <= 1}
              onClick={handlePrevStep}
              className="px-3 py-1.5 rounded-md bg-[#10151D] hover:bg-[#161D27] disabled:opacity-40 text-slate-200 text-xs flex items-center gap-1 cursor-pointer border border-[#1C2430] font-sans"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isVi ? 'Trước' : 'Prev'}</span>
            </button>

            <button
              type="button"
              id="btn-lifecycle-autorun"
              onClick={toggleAutoRun}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-sans ${
                isAutoRunning
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isAutoRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Tạm dừng' : 'Pause'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Tự động chạy' : 'Auto'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-lifecycle-next"
              disabled={currentStep >= 6}
              onClick={handleNextStep}
              className="px-3.5 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer font-sans shadow-sm"
            >
              <span>{isVi ? 'Tiếp' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id="btn-lifecycle-reset"
              onClick={handleResetSimulation}
              className="p-2 rounded-md bg-[#10151D] hover:bg-[#161D27] text-[#A5AFBF] hover:text-slate-200 border border-[#1C2430] transition-colors cursor-pointer"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Step Description Card */}
        <div className="p-4 rounded-lg bg-[#10151D] border border-[#1C2430] flex items-start gap-3">
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-semibold font-mono shrink-0 text-xs">
            {currentStep}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-white font-sans">
              {STEPS_INFO[currentStep - 1].title[language as 'vi' | 'en'] || STEPS_INFO[currentStep - 1].title.vi}
            </h4>
            <p className="text-xs text-[#A5AFBF] font-sans">
              {STEPS_INFO[currentStep - 1].desc[language as 'vi' | 'en'] || STEPS_INFO[currentStep - 1].desc.vi}
            </p>
          </div>
        </div>

        {/* STEP-SPECIFIC VISUAL STAGES */}
        <div className="p-5 rounded-xl bg-[#10151D] border border-[#1C2430] min-h-[280px] flex flex-col justify-center">
          {/* STEP 1: CREATE TRANSACTION */}
          {currentStep === 1 && (
            <div className="max-w-md mx-auto w-full space-y-4 text-center">
              <div className="p-5 rounded-xl bg-[#0B0E12] border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono border-b border-[#1C2430] pb-2">
                  <span className="text-emerald-400 font-semibold">GIAO DỊCH MỚI ({txAlice.id})</span>
                  <span className="text-[#717B8C] font-sans text-[11px]">Chưa ký</span>
                </div>
                <div className="space-y-1.5 text-left font-mono text-xs">
                  <div className="text-slate-300">
                    <span className="text-[#717B8C] font-sans">Người gửi (From):</span> {txAlice.sender} (Alice)
                  </div>
                  <div className="text-slate-300">
                    <span className="text-[#717B8C] font-sans">Người nhận (To):</span> {txAlice.receiver} (Bob)
                  </div>
                  <div className="text-emerald-400 font-semibold text-sm">
                    <span className="text-[#717B8C] font-sans font-normal text-xs">Số tiền:</span> {txAlice.amount} {txAlice.unit}
                  </div>
                  <div className="text-[#717B8C] text-[11px] font-sans">
                    Thời gian: {txAlice.timestamp}
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#A5AFBF] font-sans">
                {isVi
                  ? 'Giao dịch thô đã được tạo. Bước tiếp theo: Ký số bằng khóa bí mật của Alice.'
                  : 'Raw transaction created. Next: Sign with Alice’s private key.'}
              </p>
            </div>
          )}

          {/* STEP 2: SIGN TRANSACTION */}
          {currentStep === 2 && (
            <div className="max-w-xl mx-auto w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-center">
                <div className="p-3.5 rounded-lg bg-[#0B0E12] border border-[#1C2430] space-y-1">
                  <div className="text-[#A5AFBF] text-[10px] font-sans">1. Dữ liệu TX</div>
                  <div className="font-semibold text-white">Alice → Bob: 10 BTC</div>
                </div>
                <div className="p-3.5 rounded-lg bg-[#0B0E12] border border-[#1C2430] space-y-1">
                  <div className="text-[#A5AFBF] text-[10px] flex items-center justify-center gap-1 font-sans">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    2. Alice Private Key
                  </div>
                  <div className="font-semibold text-slate-200">0x8f12...49a1</div>
                </div>
                <div className="p-3.5 rounded-lg bg-[#0B0E12] border border-emerald-500/50 space-y-1">
                  <div className="text-emerald-400 text-[10px] flex items-center justify-center gap-1 font-sans">
                    <KeyRound className="w-3 h-3" />
                    3. Chữ Ký (r, s)
                  </div>
                  <div className="font-semibold text-emerald-300">✓ ĐÃ KÝ SỐ</div>
                </div>
              </div>
              <div className="p-3 rounded-md bg-[#0B0E12] border border-[#1C2430] text-center font-mono text-xs text-emerald-400 truncate">
                Digital Signature: 3045022100e4a78c1b9f42d591837c9f8034b...5910220268a73bc
              </div>
            </div>
          )}

          {/* STEP 3: VERIFY SIGNATURE */}
          {currentStep === 3 && (
            <div className="max-w-lg mx-auto w-full space-y-4 text-center">
              <div className="p-5 rounded-xl bg-[#0B0E12] border border-emerald-500/50 space-y-3">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold font-sans text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>XÁC THỰC CHỮ KÝ THÀNH CÔNG</span>
                </div>
                <div className="p-3 rounded-lg bg-[#10151D] border border-[#1C2430] font-mono text-xs text-slate-300 space-y-1.5 text-left">
                  <div>
                    <span className="text-[#717B8C] font-sans">Khóa công khai:</span> 04e6c9...4719b2 (Alice)
                  </div>
                  <div>
                    <span className="text-[#717B8C] font-sans">Thuật toán:</span> ECDSA · SECP256K1
                  </div>
                  <div className="text-emerald-300 font-semibold font-sans">
                    Trạng thái: HỢP LỆ — Sẵn sàng đưa vào Mempool & Block Body
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ADD TO BLOCK BODY */}
          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto w-full space-y-4">
              <div className="flex items-center justify-between font-mono text-xs text-[#A5AFBF] pb-1">
                <span className="text-[#F1F5F9] font-semibold flex items-center gap-1.5 font-sans">
                  <Boxes className="w-4 h-4 text-slate-400" />
                  BLOCK BODY (4 Giao dịch được đóng gói)
                </span>
                <span className="font-sans">Kích thước: 1.02 MB</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                {BODY_TXS.map((tx) => (
                  <div
                    key={tx.id}
                    className={`p-3 rounded-lg border space-y-1 transition-all ${
                      tx.isNew
                        ? 'bg-[#0B0E12] border-emerald-500/60'
                        : 'bg-[#0B0E12] border-[#1C2430] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={tx.isNew ? 'text-emerald-300 font-semibold' : 'text-[#8B949E]'}>
                        {tx.id} {tx.isNew && '← VỪA THÊM'}
                      </span>
                      <span className="text-[#F1F5F9] font-semibold font-mono">
                        {tx.amount} {tx.unit}
                      </span>
                    </div>
                    <div className="text-slate-200 font-sans">
                      {tx.from} → {tx.to}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: BUILD MERKLE ROOT */}
          {currentStep === 5 && (
            <div className="max-w-xl mx-auto w-full space-y-3 font-mono text-xs text-center">
              <div className="text-emerald-400 font-semibold flex items-center justify-center gap-1.5 font-sans">
                <GitFork className="w-4 h-4" />
                <span>CÂY MERKLE TỔNG HỢP VÀO BLOCK HEADER</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0B0E12] border border-emerald-500/40 space-y-2">
                <div className="text-slate-300 text-[11px] font-semibold font-sans">
                  BẢN BĂM MERKLE ROOT (32 BYTES)
                </div>
                <div className="p-2.5 rounded bg-[#10151D] text-emerald-300 font-mono font-medium break-all text-xs border border-emerald-500/20">
                  {liveMerkleRoot}
                </div>
                <div className="text-[10px] text-[#A5AFBF] font-sans">
                  Đại diện toán học duy nhất cho toàn bộ giao dịch trong Body
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: FINALIZE BLOCK HEADER */}
          {currentStep === 6 && (
            <div className="max-w-2xl mx-auto w-full space-y-4 font-mono text-xs">
              <div className="p-5 rounded-xl bg-[#0B0E12] border border-emerald-500/50 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1C2430] pb-2">
                  <span className="text-emerald-400 font-semibold text-sm font-sans">
                    BLOCK #42 HOÀN TẤT CẤU TRÚC
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold font-sans">
                    VALID BLOCK ✓
                  </span>
                </div>

                {/* Header 4 Fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-[#10151D] border border-[#1C2430]">
                    <span className="text-[#717B8C] block text-[10px] font-sans">Prev Hash</span>
                    <span className="text-emerald-300 truncate block">{playPrevHash.slice(0, 8)}...</span>
                  </div>
                  <div className="p-2 rounded bg-[#10151D] border border-[#1C2430]">
                    <span className="text-[#717B8C] block text-[10px] font-sans">Timestamp</span>
                    <span className="text-slate-200">{playTimestamp}</span>
                  </div>
                  <div className="p-2 rounded bg-[#10151D] border border-[#1C2430]">
                    <span className="text-[#717B8C] block text-[10px] font-sans">Merkle Root</span>
                    <span className="text-emerald-300 truncate block">{liveMerkleRoot.slice(0, 8)}...</span>
                  </div>
                  <div className="p-2 rounded bg-[#10151D] border border-[#1C2430]">
                    <span className="text-[#717B8C] block text-[10px] font-sans">Nonce</span>
                    <span className="text-slate-200">{playNonce}</span>
                  </div>
                </div>

                {/* Final Block SHA-256 Hash */}
                <div className="p-3 rounded-lg bg-[#10151D] border border-emerald-500/30 text-center space-y-1">
                  <div className="text-[10px] text-[#A5AFBF] uppercase font-semibold font-sans">
                    BLOCK HASH = SHA-256(BLOCK HEADER)
                  </div>
                  <div className="text-xs font-semibold text-emerald-300 break-all">{liveBlockHash}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* POST-SIMULATION INTERACTIVE TAMPER TESTING PLAYGROUND (When step === 6 or interactive) */}
        {currentStep === 6 && (
          <div className="p-5 rounded-xl bg-[#10151D] border border-[#1C2430] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h5 className="text-xs sm:text-sm font-semibold text-white font-sans">
                {isVi
                  ? 'Phòng thí nghiệm tương tác dữ liệu khối'
                  : 'Post-Simulation Interactive Experiment'}
              </h5>
            </div>
            <p className="text-xs text-[#A5AFBF] font-sans">
              {isVi
                ? 'Hãy thử thay đổi các trường dữ liệu dưới đây để quan sát Merkle Root và Block Hash phản ứng tức thì theo thời gian thực:'
                : 'Experiment modifying fields below to observe live cascading recalculations in Merkle Root and Block Hash:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              {/* Change TX3 Amount */}
              <div className="p-3 rounded-lg bg-[#0B0E12] border border-[#1C2430] space-y-2">
                <span className="text-slate-200 font-medium block text-[11px] font-sans">
                  1. Sửa TX #3 (Alice → Bob)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTx3Amount(100.0)}
                    className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-sans font-medium cursor-pointer"
                  >
                    100 BTC
                  </button>
                  <button
                    type="button"
                    onClick={() => setTx3Amount(10.0)}
                    className="px-2 py-1 rounded bg-[#10151D] text-slate-300 text-[10px] font-sans cursor-pointer border border-[#1C2430]"
                  >
                    10 BTC
                  </button>
                </div>
                <div className="text-[10px] text-[#717B8C] font-sans">→ Merkle Root & Hash đổi</div>
              </div>

              {/* Change Timestamp */}
              <div className="p-3 rounded-lg bg-[#0B0E12] border border-[#1C2430] space-y-2">
                <span className="text-slate-200 font-medium block text-[11px] font-sans">
                  2. Sửa Timestamp
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPlayTimestamp((prev) => prev + 600)}
                    className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-sans font-medium cursor-pointer"
                  >
                    +10 Phút
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayTimestamp(1715428800)}
                    className="px-2 py-1 rounded bg-[#10151D] text-slate-300 text-[10px] font-sans cursor-pointer border border-[#1C2430]"
                  >
                    Gốc
                  </button>
                </div>
                <div className="text-[10px] text-[#717B8C] font-sans">→ Header & Hash đổi</div>
              </div>

              {/* Change Previous Hash */}
              <div className="p-3 rounded-lg bg-[#0B0E12] border border-[#1C2430] space-y-2">
                <span className="text-slate-200 font-medium block text-[11px] font-sans">
                  3. Sửa Prev Hash
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPlayPrevHash('0000ff99e81b2c4d6e8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d')}
                    className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-sans font-medium cursor-pointer"
                  >
                    Đổi Hash #41
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayPrevHash('0000a3f9e81b2c4d6e8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d')}
                    className="px-2 py-1 rounded bg-[#10151D] text-slate-300 text-[10px] font-sans cursor-pointer border border-[#1C2430]"
                  >
                    Gốc
                  </button>
                </div>
                <div className="text-[10px] text-[#717B8C] font-sans">→ Đứt gãy liên kết chuỗi</div>
              </div>

              {/* Change Nonce */}
              <div className="p-3 rounded-lg bg-[#0B0E12] border border-[#1C2430] space-y-2">
                <span className="text-slate-200 font-medium block text-[11px] font-sans">
                  4. Sửa Nonce (+1)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPlayNonce((prev) => prev + 1)}
                    className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-sans font-medium cursor-pointer"
                  >
                    +1 Nonce
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayNonce(48291)}
                    className="px-2 py-1 rounded bg-[#10151D] text-slate-300 text-[10px] font-sans cursor-pointer border border-[#1C2430]"
                  >
                    Gốc
                  </button>
                </div>
                <div className="text-[10px] text-[#717B8C] font-sans">→ Thử nghiệm đào PoW</div>
              </div>
            </div>
          </div>
        )}

        {/* EXPERIMENT MODE INVITATION BANNER */}
        <div className="p-5 rounded-xl bg-[#10151D] border border-[#1C2430] space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 font-sans">
                <FlaskConical className="w-4 h-4" />
                <span>{isVi ? 'Thực hành nâng cao · Hands-on Lab' : 'Advanced Practice · Hands-on Lab'}</span>
              </div>
              <h4 className="text-base font-semibold text-white font-sans">
                {isVi
                  ? 'Tự tay xây dựng và thao tác một Block hoàn chỉnh'
                  : 'Build and manipulate your own live Block from scratch'}
              </h4>
              <p className="text-xs text-[#A5AFBF] max-w-2xl leading-relaxed font-sans">
                {isVi
                  ? 'Tự nhập người gửi, ký số ECDSA, gom vào Block Body, quan sát Cây Merkle tự động kết nối vào Block Header, và thử nghiệm giả mạo giao dịch để kiểm chứng bảo mật.'
                  : 'Enter custom transactions, sign with ECDSA, compile into Block Body, watch Merkle tree build live, and tamper with transactions to verify cryptographic integrity.'}
              </p>
            </div>

            {onOpenHandsOnLab && (
              <button
                type="button"
                id="btn-start-block-experiment"
                onClick={onOpenHandsOnLab}
                className="px-5 py-2.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 font-sans shadow-sm"
              >
                <FlaskConical className="w-4 h-4" />
                <span>{isVi ? 'Mở Chế Độ Thực Hành' : 'Open Hands-On Lab'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
