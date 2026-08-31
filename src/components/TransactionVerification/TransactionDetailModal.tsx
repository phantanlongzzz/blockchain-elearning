import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Boxes,
  Key,
  Hash,
  FileText,
  Clock,
  Layers,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { TransactionItem } from '../../types';
import { SignatureFlowVisualizer } from './SignatureFlowVisualizer';
import { useLanguage } from '../../i18n/LanguageContext';

interface TransactionDetailModalProps {
  transaction: TransactionItem | null;
  onClose: () => void;
  onTamper: (tx: TransactionItem) => void;
  onRestore: (tx: TransactionItem) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onTamper,
  onRestore,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!transaction) return null;

  const isOk = transaction.isValid;
  const isTampered = transaction.isTampered;

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0B0E12] border border-[#00D084]/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-[#E7E9ED] font-mono text-xs space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1B2027] pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isOk
                  ? 'bg-[#00D084]/15 border-[#00D084]/40 text-[#00D084]'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
              }`}
            >
              {isOk ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-wider font-mono">
                  {isVi ? `CHI TIẾT GIAO DỊCH: ${transaction.txNumber}` : `TRANSACTION DETAILS: ${transaction.txNumber}`}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-sans ${
                    isOk
                      ? 'bg-[#00D084]/10 text-[#00D084] border border-[#00D084]/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {isOk
                    ? (isVi ? '✓ HỢP LỆ' : '✓ STATUS: VERIFIED')
                    : (isVi ? '✕ KHÔNG HỢP LỆ' : '✕ STATUS: FAILED')}
                </span>
              </div>
              <p className="text-[11px] text-[#9AA2AE] font-sans mt-0.5">
                {isVi
                  ? 'Xác thực mã băm SHA-256 (NIST FIPS 180-4) & Chữ ký số ECDSA SECP256K1'
                  : 'NIST FIPS 180-4 SHA-256 Digest & ECDSA SECP256K1 Digital Signature Verification'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#0F1217] hover:bg-[#1A2028] text-[#9AA2AE] hover:text-white border border-[#1B2027] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tamper Alert if transaction has been tampered */}
        {isTampered && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/60 text-rose-300 space-y-2 font-sans">
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>{isVi ? 'PHÁT HIỆN DỮ LIỆU ĐÃ BỊ SỬA ĐỔI' : 'DATA TAMPERING DETECTED'}</span>
              </span>
              <button
                onClick={() => onRestore(transaction)}
                className="px-3 py-1 rounded-lg bg-[#00D084] hover:bg-[#00A86B] text-black text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isVi ? 'Khôi phục gốc' : 'Revert to Original'}</span>
              </button>
            </div>
            <p className="text-xs font-sans text-[#C5CBD3] leading-relaxed">
              {isVi
                ? 'Dữ liệu gói tin đã bị can thiệp sau khi ký số. Mã băm SHA-256 tính lại không còn khớp với chữ ký số ECDSA tạo bởi khóa bí mật của người gửi.'
                : "The payload data was altered post-signing. The SHA-256 message digest no longer matches the ECDSA digital signature signed by the sender's private key."}
            </p>
            {transaction.originalValues && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-rose-900/60 font-sans">
                <div>
                  <span className="text-[#9AA2AE]">{isVi ? 'Giá trị ban đầu: ' : 'Original Value: '}</span>
                  <strong className="text-[#00D084] font-mono">
                    {transaction.tamperedField === 'amount'
                      ? `${transaction.originalValues.amount} BTC`
                      : transaction.originalValues.receiver.slice(0, 16) + '...'}
                  </strong>
                </div>
                <div>
                  <span className="text-[#9AA2AE]">{isVi ? 'Giá trị đã sửa: ' : 'Modified Value: '}</span>
                  <strong className="text-rose-400 font-mono">
                    {transaction.tamperedField === 'amount'
                      ? `${transaction.amount} BTC`
                      : transaction.receiver.slice(0, 16) + '...'}
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cryptographic Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
          <div className="p-3 rounded-xl bg-[#090C10] border border-[#1B2027]">
            <span className="text-[#68717D] block mb-1 uppercase text-[10px] font-semibold">
              {isVi ? 'Thuật toán chữ ký' : 'Signature Algorithm'}
            </span>
            <strong className="text-[#00D084] text-xs sm:text-sm font-mono">{transaction.algorithm.split('·')[0].trim() || 'ECDSA'}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#090C10] border border-[#1B2027]">
            <span className="text-[#68717D] block mb-1 uppercase text-[10px] font-semibold">
              {isVi ? 'Đường cong Elliptic' : 'Elliptic Curve'}
            </span>
            <strong className="text-purple-300 text-xs sm:text-sm font-mono">{transaction.ellipticCurve}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#090C10] border border-[#1B2027]">
            <span className="text-[#68717D] block mb-1 uppercase text-[10px] font-semibold">
              {isVi ? 'Thuật toán băm' : 'Hash Algorithm'}
            </span>
            <strong className="text-[#00D084] text-xs sm:text-sm font-mono">{transaction.hashAlgorithm}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#090C10] border border-[#1B2027]">
            <span className="text-[#68717D] block mb-1 uppercase text-[10px] font-semibold">
              {isVi ? 'Kết quả xác thực' : 'Verification Result'}
            </span>
            <strong className={isOk ? 'text-[#00D084] text-xs sm:text-sm font-mono' : 'text-rose-400 text-xs sm:text-sm font-mono'}>
              {isOk ? (isVi ? '✓ THÀNH CÔNG (HỢP LỆ)' : 'SUCCESS (VALID)') : (isVi ? '✕ THẤT BẠI (KHÔNG HỢP LỆ)' : 'FAILED (INVALID)')}
            </strong>
          </div>
        </div>

        {/* Detailed Fields Section */}
        <div className="space-y-3 font-mono">
          {/* Sender Public Key */}
          <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#1B2027] space-y-1">
            <div className="flex items-center justify-between text-[#9AA2AE] text-[10px] uppercase font-semibold font-sans">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#00D084]" />
                <span>{isVi ? 'KHÓA CÔNG KHAI NGƯỜI GỬI (SECP256K1 0x04...):' : 'SENDER PUBLIC KEY (SECP256K1 0x04...):'}</span>
              </span>
              <button
                onClick={() => copyText(transaction.sender, 'senderPub')}
                className="text-[#9AA2AE] hover:text-[#00D084] flex items-center gap-1 text-[10px] cursor-pointer"
              >
                {copiedKey === 'senderPub' ? <Check className="w-3 h-3 text-[#00D084]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'senderPub' ? (isVi ? 'Đã chép' : 'Copied') : (isVi ? 'Sao chép' : 'Copy Key')}</span>
              </button>
            </div>
            <div className="p-2 rounded bg-[#0F1217] text-[#E7E9ED] break-all select-all text-[11px] font-mono">
              {transaction.sender}
            </div>
          </div>

          {/* Receiver Public Key */}
          <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#1B2027] space-y-1">
            <div className="flex items-center justify-between text-[#9AA2AE] text-[10px] uppercase font-semibold font-sans">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>{isVi ? 'ĐỊA CHỈ VÍ / KHÓA CÔNG KHAI NGƯỜI NHẬN:' : 'RECEIVER PUBLIC KEY / WALLET ADDRESS:'}</span>
              </span>
              <button
                onClick={() => copyText(transaction.receiver, 'receiverPub')}
                className="text-[#9AA2AE] hover:text-[#00D084] flex items-center gap-1 text-[10px] cursor-pointer"
              >
                {copiedKey === 'receiverPub' ? <Check className="w-3 h-3 text-[#00D084]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'receiverPub' ? (isVi ? 'Đã chép' : 'Copied') : (isVi ? 'Sao chép' : 'Copy Key')}</span>
              </button>
            </div>
            <div
              className={`p-2 rounded break-all select-all text-[11px] font-mono ${
                transaction.tamperedField === 'receiver'
                  ? 'bg-rose-950/40 text-rose-300 border border-rose-500/50'
                  : 'bg-[#0F1217] text-[#E7E9ED]'
              }`}
            >
              {transaction.receiver}
            </div>
          </div>

          {/* Amount and Timestamp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
            <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#1B2027]">
              <span className="text-[#68717D] block mb-0.5 text-[10px] uppercase font-semibold">
                {isVi ? 'SỐ TIỀN GIAO DỊCH' : 'TRANSACTION AMOUNT'}
              </span>
              <span className="text-lg font-bold text-[#00D084] font-mono">
                {Number(transaction.amount).toFixed(4)} BTC
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#1B2027]">
              <span className="text-[#68717D] block mb-0.5 text-[10px] uppercase font-semibold">
                {isVi ? 'DẤU THỜI GIAN (UTC)' : 'TIMESTAMP (UTC)'}
              </span>
              <span className="text-sm font-bold text-[#E7E9ED] font-mono">
                {transaction.timestamp}
              </span>
            </div>
          </div>

          {/* Message SHA-256 Digest */}
          <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#1B2027] space-y-1">
            <div className="flex items-center justify-between text-[#9AA2AE] text-[10px] uppercase font-semibold font-sans">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#00D084]" />
                <span>{isVi ? 'MÃ BĂM THÔNG ĐIỆP SHA-256 (256-Bit / 64 Hex):' : 'TRANSACTION SHA-256 MESSAGE DIGEST (256-Bit / 64 Hex):'}</span>
              </span>
              <button
                onClick={() => copyText(transaction.currentDigest, 'digest')}
                className="text-[#9AA2AE] hover:text-[#00D084] flex items-center gap-1 text-[10px] cursor-pointer"
              >
                {copiedKey === 'digest' ? <Check className="w-3 h-3 text-[#00D084]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'digest' ? (isVi ? 'Đã chép' : 'Copied') : (isVi ? 'Sao chép' : 'Copy Hash')}</span>
              </button>
            </div>
            <div className="p-2 rounded bg-[#0F1217] text-[#00D084] break-all select-all text-[11px] font-mono font-bold">
              {transaction.currentDigest}
            </div>
          </div>

          {/* Digital Signature */}
          <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#1B2027] space-y-1">
            <div className="flex items-center justify-between text-[#9AA2AE] text-[10px] uppercase font-semibold font-sans">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#00D084]" />
                <span>{isVi ? 'CHỮ KÝ SỐ ECDSA (64-Byte / 128 Hex):' : 'ECDSA DIGITAL SIGNATURE (Compact 64-Byte / 128 Hex):'}</span>
              </span>
              <button
                onClick={() => copyText(transaction.signature, 'signature')}
                className="text-[#9AA2AE] hover:text-[#00D084] flex items-center gap-1 text-[10px] cursor-pointer"
              >
                {copiedKey === 'signature' ? <Check className="w-3 h-3 text-[#00D084]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'signature' ? (isVi ? 'Đã chép' : 'Copied') : (isVi ? 'Sao chép' : 'Copy Signature')}</span>
              </button>
            </div>
            <div className="p-2 rounded bg-[#0F1217] text-[#00D084] break-all select-all text-[11px] font-mono">
              {transaction.signature}
            </div>
          </div>
        </div>

        {/* Visual Signature Flow Visualizer */}
        <div>
          <SignatureFlowVisualizer transaction={transaction} />
        </div>

        {/* Block Connection Card (If linked to a block) */}
        {transaction.blockIndex && (
          <div className="p-4 rounded-2xl bg-[#090C10] border border-[#00D084]/30 space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-[#1B2027] pb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#00D084]" />
                <span>{isVi ? `LIÊN KẾT KHỐI SỔ CÁI: KHỐI #${transaction.blockIndex}` : `BLOCKCHAIN LEDGER CONNECTION: BLOCK #${transaction.blockIndex}`}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#00D084]/15 text-[#00D084] text-[10px] font-bold border border-[#00D084]/30">
                {isVi ? 'Đã Đóng Khối' : 'Confirmed In Block'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-[#68717D] block mb-0.5">{isVi ? 'Mã băm khối:' : 'Block Hash:'}</span>
                <span className="text-[#00D084] font-mono break-all font-bold">
                  {transaction.blockHash ? `${transaction.blockHash.slice(0, 14)}...` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[#68717D] block mb-0.5">{isVi ? 'Mã băm trước:' : 'Previous Hash:'}</span>
                <span className="text-[#9AA2AE] font-mono break-all">
                  {transaction.previousBlockHash ? `${transaction.previousBlockHash.slice(0, 14)}...` : '0000...'}
                </span>
              </div>
              <div>
                <span className="text-[#68717D] block mb-0.5">Nonce:</span>
                <span className="text-amber-400 font-mono font-bold">
                  {transaction.nonce ?? 1042}
                </span>
              </div>
              <div>
                <span className="text-[#68717D] block mb-0.5">{isVi ? 'Độ khó PoW:' : 'PoW Difficulty:'}</span>
                <span className="text-[#9AA2AE] font-mono">
                  {transaction.difficulty ?? 3} {isVi ? 'Số 0 đầu' : 'Leading Zeros'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1B2027] font-sans">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTamper(transaction)}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isVi ? 'Mô phỏng sửa đổi' : 'Simulate Tampering'}</span>
            </button>

            {isTampered && (
              <button
                onClick={() => onRestore(transaction)}
                className="px-4 py-2 rounded-xl bg-[#00D084]/20 hover:bg-[#00D084]/30 text-[#00D084] border border-[#00D084]/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isVi ? 'Khôi phục hợp lệ' : 'Restore Valid State'}</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0F1217] hover:bg-[#1A2028] text-[#C5CBD3] hover:text-white border border-[#1B2027] text-xs transition-colors cursor-pointer"
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

