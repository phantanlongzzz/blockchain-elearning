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
      <div className="pb-4 border-b border-[#1C2430] space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 font-sans tracking-tight">
              {isVi ? 'Quy trình ký và xác minh chữ ký số' : 'Digital signature verification'}
            </h2>
            <p className="text-sm text-[#A5AFBF] mt-1">
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
                className="px-3.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isVi ? 'Sửa thành 100 BTC' : 'Change to 100 BTC'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white bg-[#10151D] hover:bg-[#161D27] border border-[#1C2430] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isVi ? 'Khôi phục gốc' : 'Restore original'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Visual Pipeline (5 Steps) */}
      <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1C2430] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Step 1: Payload */}
          <div
            className={`p-3 rounded-lg border transition-colors space-y-2 text-xs ${
              isTampered
                ? 'bg-rose-950/20 border-rose-500/40'
                : 'bg-[#10151D] border-[#1C2430]'
            }`}
          >
            <div className="text-[#717B8C] font-mono text-[10px] uppercase font-medium">
              1. {isVi ? 'Giao dịch' : 'Payload'}
            </div>
            <div className="font-mono space-y-0.5">
              <div className="text-slate-300">{sender} → {receiver}</div>
              <div className={`font-semibold ${isTampered ? 'text-rose-400' : 'text-slate-100'}`}>
                {amount} BTC
              </div>
            </div>
          </div>

          {/* Step 2: Digest */}
          <div
            className={`p-3 rounded-lg border transition-colors space-y-2 text-xs ${
              isTampered
                ? 'bg-rose-950/20 border-rose-500/40'
                : 'bg-[#10151D] border-[#1C2430]'
            }`}
          >
            <div className="text-[#717B8C] font-mono text-[10px] uppercase font-medium">
              2. SHA-256
            </div>
            <div className="font-mono text-xs break-all text-slate-300">
              <span className={isTampered ? 'text-rose-400 font-semibold' : 'text-success'}>
                {currentDigest.slice(0, 12)}...
              </span>
            </div>
          </div>

          {/* Step 3: Private Key */}
          <div className="p-3 rounded-lg bg-[#10151D] border border-[#1C2430] space-y-2 text-xs">
            <div className="text-[#717B8C] font-mono text-[10px] uppercase font-medium">
              3. {isVi ? 'Khóa riêng' : 'Private key'}
            </div>
            <div className="font-mono text-xs text-[#A5AFBF] truncate">
              0x8f12... (Alice)
            </div>
          </div>

          {/* Step 4: Signature */}
          <div className="p-3 rounded-lg bg-[#10151D] border border-[#1C2430] space-y-2 text-xs">
            <div className="text-[#717B8C] font-mono text-[10px] uppercase font-medium">
              4. {isVi ? 'Chữ ký số' : 'Signature'}
            </div>
            <div className="font-mono text-xs text-[#A5AFBF] truncate">
              {ORIGINAL_SIGNATURE.slice(0, 14)}...
            </div>
          </div>

          {/* Step 5: Verification */}
          <div
            className={`p-3 rounded-lg border transition-colors space-y-2 text-xs ${
              verificationResult
                ? 'bg-[#10151D] border-[#1C2430]'
                : 'bg-rose-950/20 border-rose-500/40'
            }`}
          >
            <div className="text-[#717B8C] font-mono text-[10px] uppercase font-medium">
              5. {isVi ? 'Xác minh' : 'Verify'}
            </div>
            <div className="font-mono text-xs font-semibold">
              <span className={verificationResult ? 'text-success' : 'text-rose-400'}>
                {verificationResult
                  ? isVi ? 'Hợp lệ ✓' : 'Valid ✓'
                  : isVi ? 'Không hợp lệ ✕' : 'Invalid ✕'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Verification Status */}
        <div className="p-3.5 rounded-lg bg-[#10151D] border border-[#1C2430] flex items-center gap-3 text-xs">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              verificationResult ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />
          <div>
            <span className="font-semibold text-slate-100">
              {verificationResult
                ? isVi ? 'Giao dịch hợp lệ' : 'Transaction valid'
                : isVi ? 'Phát hiện sửa đổi dữ liệu' : 'Data tampering detected'}
            </span>
            <p className="text-[#A5AFBF] text-xs mt-0.5">
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
      <div className="flex items-center justify-between pt-4 border-t border-[#1C2430]">
        {onPrevStage ? (
          <button
            type="button"
            onClick={onPrevStage}
            className="px-4 py-1.5 rounded-lg text-xs text-[#A5AFBF] hover:text-slate-200 border border-[#1C2430] hover:border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
            <span>{isVi ? 'Quay lại' : 'Back'}</span>
          </button>
        ) : (
          <div />
        )}

        {onNextStage && (
          <button
            type="button"
            onClick={onNextStage}
 className="px-5 py-2 rounded-lg bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Tiếp tục: Dấu thời gian' : 'Next: Timestamp'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
