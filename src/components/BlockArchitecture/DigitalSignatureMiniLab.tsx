import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { fastSha256Hex } from '../../utils/sha256';

interface DigitalSignatureMiniLabProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
  onPrevStage?: () => void;
}

export const DigitalSignatureMiniLab: React.FC<DigitalSignatureMiniLabProps> = ({
  onInteracted,
  onNextStage,
  onPrevStage,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [sender] = useState('Alice');
  const [receiver, setReceiver] = useState('Bob');
  const [amount, setAmount] = useState(10);
  const [isTampered, setIsTampered] = useState(false);

  const ORIGINAL_DIGEST = '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
  const ORIGINAL_SIGNATURE = '3045022100e4a78c1b9f42d591837c9f8034b...5910220268a73bc';

  const [currentDigest, setCurrentDigest] = useState(ORIGINAL_DIGEST);
  const [verificationResult, setVerificationResult] = useState<boolean>(true);

  useEffect(() => {
    const compute = async () => {
      const raw = `${sender}->${receiver}:${amount} BTC`;
      const hash = await fastSha256Hex(raw);
      setCurrentDigest(hash);

      if (isTampered || amount !== 10 || receiver !== 'Bob') {
        setVerificationResult(false);
      } else {
        setVerificationResult(true);
      }
    };
    compute();
  }, [sender, receiver, amount, isTampered]);

  const handleTamper = (newAmount: number, newReceiver?: string) => {
    setIsTampered(true);
    setAmount(newAmount);
    if (newReceiver) setReceiver(newReceiver);
    if (onInteracted) onInteracted();
  };

  const handleReset = () => {
    setIsTampered(false);
    setAmount(10);
    setReceiver('Bob');
    setVerificationResult(true);
    if (onInteracted) onInteracted();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* 1. Header */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#0B0F19]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white font-sans tracking-tight">
              {isVi ? 'Quy trình ký và xác minh chữ ký số' : 'Digital signature verification'}
            </h2>
            <p className="text-sm text-slate-400">
              {isVi
                ? 'Thử nghiệm tính toàn vẹn khi thay đổi nội dung giao dịch sau khi đã ký.'
                : 'Test how modifying transaction payload invalidates the cryptographic signature.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isTampered ? (
              <button
                type="button"
                onClick={() => handleTamper(100)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-sans font-medium flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.15)]"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isVi ? 'Sửa thành 100 BTC' : 'Change to 100 BTC'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isVi ? 'Khôi phục gốc' : 'Restore original'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Visual Pipeline (5 Steps) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {/* Step 1: Payload */}
          <div
            className={`p-3.5 rounded-xl border transition-all space-y-2 text-xs ${
              isTampered
                ? 'bg-rose-950/30 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                : 'bg-black/40 backdrop-blur-md border-white/[0.06]'
            }`}
          >
            <div className="text-slate-400 font-mono text-[10px] uppercase font-medium">
              1. {isVi ? 'Giao dịch' : 'Payload'}
            </div>
            <div className="font-mono space-y-0.5">
              <div className="text-slate-300">{sender} → {receiver}</div>
              <div className={`font-semibold ${isTampered ? 'text-rose-400' : 'text-cyan-300'}`}>
                {amount} BTC
              </div>
            </div>
          </div>

          {/* Step 2: Digest */}
          <div
            className={`p-3.5 rounded-xl border transition-all space-y-2 text-xs ${
              isTampered
                ? 'bg-rose-950/30 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                : 'bg-black/40 backdrop-blur-md border-white/[0.06]'
            }`}
          >
            <div className="text-slate-400 font-mono text-[10px] uppercase font-medium">
              2. SHA-256
            </div>
            <div className="font-mono text-xs break-all text-slate-300">
              <span className={isTampered ? 'text-rose-400 font-semibold' : 'text-cyan-300'}>
                {currentDigest.slice(0, 12)}...
              </span>
            </div>
          </div>

          {/* Step 3: Private Key */}
          <div className="p-3.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.06] space-y-2 text-xs">
            <div className="text-slate-400 font-mono text-[10px] uppercase font-medium">
              3. {isVi ? 'Khóa riêng' : 'Private key'}
            </div>
            <div className="font-mono text-xs text-slate-300 truncate">
              0x8f12... (Alice)
            </div>
          </div>

          {/* Step 4: Signature */}
          <div className="p-3.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.06] space-y-2 text-xs">
            <div className="text-slate-400 font-mono text-[10px] uppercase font-medium">
              4. {isVi ? 'Chữ ký số' : 'Signature'}
            </div>
            <div className="font-mono text-xs text-slate-300 truncate">
              {ORIGINAL_SIGNATURE.slice(0, 14)}...
            </div>
          </div>

          {/* Step 5: Verification */}
          <div
            className={`p-3.5 rounded-xl border transition-all space-y-2 text-xs ${
              verificationResult
                ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(0,210,255,0.15)]'
                : 'bg-rose-950/30 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
            }`}
          >
            <div className="text-slate-400 font-mono text-[10px] uppercase font-medium">
              5. {isVi ? 'Xác minh' : 'Verify'}
            </div>
            <div className="font-mono text-xs font-semibold">
              <span className={verificationResult ? 'text-cyan-300' : 'text-rose-400'}>
                {verificationResult
                  ? isVi ? 'Hợp lệ ✓' : 'Valid ✓'
                  : isVi ? 'Không hợp lệ ✕' : 'Invalid ✕'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Verification Status */}
        <div className="p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.05] flex items-center gap-3 text-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${
              verificationResult ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.8)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
            }`}
          />
          <div>
            <span className="font-semibold text-slate-100 font-sans">
              {verificationResult
                ? isVi ? 'Giao dịch hợp lệ' : 'Transaction valid'
                : isVi ? 'Phát hiện sửa đổi dữ liệu' : 'Data tampering detected'}
            </span>
            <p className="text-slate-400 text-xs mt-0.5 font-sans">
              {verificationResult
                ? isVi
                  ? 'Chữ ký khớp chính xác với mã hash của dữ liệu 10 BTC ban đầu.'
                  : 'Signature matches the hash digest of the original 10 BTC payload.'
                : isVi
                  ? 'Khi số tiền đổi thành 100 BTC, mã hash mới không còn khớp chữ ký. Giao dịch bị từ chối.'
                  : 'Changing amount to 100 BTC alters the hash, breaking verification.'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
        {onPrevStage ? (
          <button
            type="button"
            onClick={onPrevStage}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 inline" />
            <span>{isVi ? 'Quay lại' : 'Back'}</span>
          </button>
        ) : (
          <div />
        )}

        {onNextStage && (
          <button
            type="button"
            onClick={onNextStage}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-sans font-medium text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
          >
            <span>{isVi ? 'Tiếp tục: Dấu thời gian' : 'Next: Timestamp'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
