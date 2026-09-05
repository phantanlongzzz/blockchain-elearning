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
  onNextStage,
  onPrevStage,
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
      <div className="p-6 sm:p-7 rounded-2xl bg-[#0B0F19]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-6">
        {/* Simulation Control Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          {/* Step Pill Indicators */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {STEPS_INFO.map((s) => (
              <button
                key={s.step}
                type="button"
                id={`btn-lifecycle-step-${s.step}`}
                onClick={() => {
                  setIsAutoRunning(false);
                  setCurrentStep(s.step);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-sans text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  currentStep === s.step
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(0,210,255,0.4)]'
                    : currentStep > s.step
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:text-white hover:border-cyan-500/30'
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
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 text-slate-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer border border-white/[0.08] hover:border-cyan-500/30 transition-all font-sans"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isVi ? 'Trước' : 'Prev'}</span>
            </button>

            <button
              type="button"
              id="btn-lifecycle-autorun"
              onClick={toggleAutoRun}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-sans ${
                isAutoRunning
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.5)]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/30 text-cyan-300 border border-white/[0.08]'
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
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer font-sans shadow-[0_0_15px_rgba(0,210,255,0.3)]"
            >
              <span>{isVi ? 'Tiếp' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id="btn-lifecycle-reset"
              onClick={handleResetSimulation}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] transition-all cursor-pointer"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Step Description Card */}
        <div className="p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.05] flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-semibold font-mono shrink-0 text-xs shadow-[0_0_10px_rgba(0,210,255,0.2)]">
            {currentStep}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-white font-sans">
              {STEPS_INFO[currentStep - 1].title[language as 'vi' | 'en'] || STEPS_INFO[currentStep - 1].title.vi}
            </h4>
            <p className="text-xs text-slate-400 font-sans">
              {STEPS_INFO[currentStep - 1].desc[language as 'vi' | 'en'] || STEPS_INFO[currentStep - 1].desc.vi}
            </p>
          </div>
        </div>

        {/* STEP-SPECIFIC VISUAL STAGES */}
        <div className="p-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.06] min-h-[280px] flex flex-col justify-center">
          {/* STEP 1: CREATE TRANSACTION */}
          {currentStep === 1 && (
            <div className="max-w-md mx-auto w-full space-y-4 text-center">
              <div className="p-5 rounded-xl bg-[#0B0F19]/80 border border-cyan-500/30 space-y-3 shadow-[0_0_20px_rgba(0,210,255,0.08)]">
                <div className="flex items-center justify-between text-xs font-mono border-b border-white/[0.06] pb-2">
                  <span className="text-white font-semibold">GIAO DỊCH MỚI ({txAlice.id})</span>
                  <span className="text-slate-400 font-sans text-[11px] bg-white/[0.04] px-2 py-0.5 rounded">Chưa ký</span>
                </div>
                <div className="space-y-1.5 text-left font-mono text-xs">
                  <div className="text-slate-300">
                    <span className="text-slate-400 font-sans">Người gửi (From):</span> {txAlice.sender} (Alice)
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400 font-sans">Người nhận (To):</span> {txAlice.receiver} (Bob)
                  </div>
                  <div className="text-cyan-300 font-semibold text-sm font-mono">
                    <span className="text-slate-400 font-sans font-normal text-xs">Số tiền:</span> {txAlice.amount} {txAlice.unit}
                  </div>
                  <div className="text-slate-500 text-[11px] font-sans">
                    Thời gian: {txAlice.timestamp}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-sans">
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
                <div className="p-3.5 rounded-xl bg-[#0B0F19]/80 border border-white/[0.06] space-y-1">
                  <div className="text-slate-400 text-[10px] font-sans">1. Dữ liệu TX</div>
                  <div className="font-semibold text-white">Alice → Bob: <span className="text-cyan-300 font-mono">10 BTC</span></div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0F19]/80 border border-white/[0.06] space-y-1">
                  <div className="text-slate-400 text-[10px] flex items-center justify-center gap-1 font-sans">
                    <Lock className="w-3 h-3 text-cyan-400" />
                    2. Alice Private Key
                  </div>
                  <div className="font-semibold text-slate-200">0x8f12...49a1</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0F19]/80 border border-cyan-500/40 space-y-1 shadow-[0_0_15px_rgba(0,210,255,0.15)]">
                  <div className="text-cyan-300 text-[10px] flex items-center justify-center gap-1 font-sans">
                    <KeyRound className="w-3 h-3" />
                    3. Chữ Ký (r, s)
                  </div>
                  <div className="font-semibold text-cyan-300">✓ ĐÃ KÝ SỐ</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0F19]/80 border border-white/[0.06] text-center font-mono text-xs text-slate-300 truncate">
                Digital Signature: 3045022100e4a78c1b9f42d591837c9f8034b...5910220268a73bc
              </div>
            </div>
          )}

          {/* STEP 3: VERIFY SIGNATURE */}
          {currentStep === 3 && (
            <div className="max-w-lg mx-auto w-full space-y-4 text-center">
              <div className="p-5 rounded-xl bg-[#0B0F19]/80 border border-cyan-500/40 space-y-3 shadow-[0_0_20px_rgba(0,210,255,0.12)]">
                <div className="flex items-center justify-center gap-2 text-cyan-300 font-semibold font-sans text-sm">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span>XÁC THỰC CHỮ KÝ THÀNH CÔNG</span>
                </div>
                <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] font-mono text-xs text-slate-300 space-y-1.5 text-left">
                  <div>
                    <span className="text-slate-400 font-sans">Khóa công khai:</span> 04e6c9...4719b2 (Alice)
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans">Thuật toán:</span> ECDSA · SECP256K1
                  </div>
                  <div className="text-cyan-300 font-semibold font-sans">
                    Trạng thái: HỢP LỆ — Sẵn sàng đưa vào Mempool & Block Body
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ADD TO BLOCK BODY */}
          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto w-full space-y-4">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400 pb-1">
                <span className="text-white font-semibold flex items-center gap-2 font-sans">
                  <Boxes className="w-4 h-4 text-cyan-400" />
                  BLOCK BODY (4 Giao dịch được đóng gói)
                </span>
                <span className="font-sans text-cyan-300/80">Kích thước: 1.02 MB</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                {BODY_TXS.map((tx) => (
                  <div
                    key={tx.id}
                    className={`p-3.5 rounded-xl border space-y-1 transition-all ${
                      tx.isNew
                        ? 'bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.15)]'
                        : 'bg-[#0B0F19]/80 border-white/[0.06] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={tx.isNew ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
                        {tx.id} {tx.isNew && '← VỪA THÊM'}
                      </span>
                      <span className="text-cyan-300 font-semibold font-mono">
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
              <div className="text-white font-semibold flex items-center justify-center gap-2 font-sans">
                <GitFork className="w-4 h-4 text-cyan-400" />
                <span>CÂY MERKLE TỔNG HỢP VÀO BLOCK HEADER</span>
              </div>
              <div className="p-5 rounded-xl bg-[#0B0F19]/80 border border-cyan-500/30 space-y-2 shadow-[0_0_20px_rgba(0,210,255,0.12)]">
                <div className="text-slate-300 text-[11px] font-semibold font-sans">
                  BẢN BĂM MERKLE ROOT (32 BYTES)
                </div>
                <div className="p-3 rounded-lg bg-black/40 text-cyan-300 font-mono font-medium break-all text-xs border border-cyan-500/20">
                  {liveMerkleRoot}
                </div>
                <div className="text-[10px] text-slate-400 font-sans">
                  Đại diện toán học duy nhất cho toàn bộ giao dịch trong Body
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: FINALIZE BLOCK HEADER */}
          {currentStep === 6 && (
            <div className="max-w-2xl mx-auto w-full space-y-4 font-mono text-xs">
              <div className="p-5 rounded-xl bg-[#0B0F19]/80 border border-cyan-500/40 space-y-4 shadow-[0_0_20px_rgba(0,210,255,0.15)]">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-white font-semibold text-sm font-sans">
                    BLOCK #42 HOÀN TẤT CẤU TRÚC
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold font-sans">
                    VALID BLOCK ✓
                  </span>
                </div>

                {/* Header 4 Fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                    <span className="text-slate-400 block text-[10px] font-sans">Prev Hash</span>
                    <span className="text-cyan-300 truncate block">{playPrevHash.slice(0, 8)}...</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                    <span className="text-slate-400 block text-[10px] font-sans">Timestamp</span>
                    <span className="text-slate-200">{playTimestamp}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                    <span className="text-slate-400 block text-[10px] font-sans">Merkle Root</span>
                    <span className="text-cyan-300 truncate block">{liveMerkleRoot.slice(0, 8)}...</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                    <span className="text-slate-400 block text-[10px] font-sans">Nonce</span>
                    <span className="text-slate-200">{playNonce}</span>
                  </div>
                </div>

                {/* Final Block SHA-256 Hash */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-cyan-500/30 text-center space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold font-sans">
                    BLOCK HASH = SHA-256(BLOCK HEADER)
                  </div>
                  <div className="text-xs font-semibold text-cyan-300 break-all">{liveBlockHash}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* POST-SIMULATION INTERACTIVE TAMPER TESTING PLAYGROUND (When step === 6 or interactive) */}
        {currentStep === 6 && (
          <div className="p-5 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.06] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h5 className="text-sm font-semibold text-white font-sans">
                {isVi
                  ? 'Phòng thí nghiệm tương tác dữ liệu khối'
                  : 'Post-Simulation Interactive Experiment'}
              </h5>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              {isVi
                ? 'Hãy thử thay đổi các trường dữ liệu dưới đây để quan sát Merkle Root và Block Hash phản ứng tức thì theo thời gian thực:'
                : 'Experiment modifying fields below to observe live cascading recalculations in Merkle Root and Block Hash:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              {/* Change TX3 Amount */}
              <div className="p-3.5 rounded-xl bg-[#0B0F19]/80 border border-white/[0.06] space-y-2">
                <span className="text-slate-200 font-medium block text-[11px] font-sans">
                  1. Sửa TX #3 (Alice → Bob)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTx3Amount(100.0)}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-sans font-medium cursor-pointer"
                  >
                    100 BTC
                  </button>
                  <button
                    type="button"
                    onClick={() => setTx3Amount(10.0)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white text-[10px] font-sans cursor-pointer border border-white/[0.08]"
                  >
                    10 BTC
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 font-sans">→ Merkle Root & Hash đổi</div>
              </div>

              {/* Change Timestamp */}
              <div className="p-3.5 rounded-xl bg-[#0B0F19]/80 border border-white/[0.06] space-y-2">
                <span className="text-slate-200 font-medium block text-[11px] font-sans">
                  2. Sửa Timestamp
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayTimestamp((prev) => prev + 600)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/30 text-slate-200 hover:text-white border border-white/[0.08] text-[10px] font-sans font-medium cursor-pointer"
                  >
                    +10 Phút
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayTimestamp(1715428800)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white text-[10px] font-sans cursor-pointer border border-white/[0.08]"
                  >
                    Gốc
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 font-sans">→ Header & Hash đổi</div>
              </div>

              {/* Change Previous Hash */}
              <div className="p-3.5 rounded-xl bg-[#0B0F19]/80 border border-white/[0.06] space-y-2">
                <span className="text-slate-200 font-medium block text-[11px] font-sans">
                  3. Sửa Prev Hash
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayPrevHash('0000ff99e81b2c4d6e8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d')}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-sans font-medium cursor-pointer"
                  >
                    Đổi Hash #41
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayPrevHash('0000a3f9e81b2c4d6e8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d')}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white text-[10px] font-sans cursor-pointer border border-white/[0.08]"
                  >
                    Gốc
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 font-sans">→ Đứt gãy liên kết chuỗi</div>
              </div>

              {/* Change Nonce */}
              <div className="p-3.5 rounded-xl bg-[#0B0F19]/80 border border-white/[0.06] space-y-2">
                <span className="text-slate-200 font-medium block text-[11px] font-sans">
                  4. Sửa Nonce (+1)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayNonce((prev) => prev + 1)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/30 text-slate-200 hover:text-white border border-white/[0.08] text-[10px] font-sans font-medium cursor-pointer"
                  >
                    +1 Nonce
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayNonce(48291)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white text-[10px] font-sans cursor-pointer border border-white/[0.08]"
                  >
                    Gốc
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 font-sans">→ Thử nghiệm đào PoW</div>
              </div>
            </div>
          </div>
        )}

        {/* EXPERIMENT MODE INVITATION BANNER */}
        <div className="p-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.06] space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 font-sans">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <span>{isVi ? 'Thực hành nâng cao · Hands-on Lab' : 'Advanced Practice · Hands-on Lab'}</span>
              </div>
              <h4 className="text-base font-semibold text-white font-sans">
                {isVi
                  ? 'Tự tay xây dựng và thao tác một Block hoàn chỉnh'
                  : 'Build and manipulate your own live Block from scratch'}
              </h4>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed font-sans">
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 font-sans shadow-[0_0_15px_rgba(0,210,255,0.3)]"
              >
                <FlaskConical className="w-4 h-4" />
                <span>{isVi ? 'Mở Chế Độ Thực Hành' : 'Open Hands-On Lab'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Bridge Link */}
        <div className="pt-4 flex items-center justify-between gap-3 text-xs border-t border-white/[0.06]">
          {onPrevStage ? (
            <button
              type="button"
              id="btn-prev-stage-from-lifecycle"
              onClick={onPrevStage}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] hover:border-cyan-500/30 text-xs flex items-center gap-1.5 cursor-pointer font-sans transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isVi ? 'Quay lại: Merkle Root' : 'Back: Merkle Root'}</span>
            </button>
          ) : <div />}

          {onNextStage && (
            <button
              type="button"
              id="btn-next-stage-from-lifecycle"
              onClick={onNextStage}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.3)] font-sans transition-all"
            >
              <span>{isVi ? 'Tiếp: Tổng Kết' : 'Next: Summary'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
