import React from 'react';
import { ArrowDown, CheckCircle2, XCircle, ShieldCheck, Key, FileText, Cpu, Hash } from 'lucide-react';
import { TransactionItem } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface SignatureFlowVisualizerProps {
  transaction: TransactionItem;
}

export const SignatureFlowVisualizer: React.FC<SignatureFlowVisualizerProps> = ({ transaction }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const isOk = transaction.isValid;

  const steps = [
    {
      number: 1,
      title: isVi ? 'DỮ LIỆU GIAO DỊCH' : 'TRANSACTION DATA',
      icon: FileText,
      value: `ID: ${transaction.txNumber} | Amount: ${transaction.amount} | To: ${transaction.receiver.slice(0, 10)}...`,
      desc: isVi
        ? 'Chuẩn hóa dữ liệu gồm người gửi, người nhận, số tiền và dấu thời gian thành chuỗi byte.'
        : 'Canonical serialization of sender, receiver, amount, and timestamp.',
      badge: isVi ? 'Dữ liệu' : 'Payload',
      color: 'border-[#1B2027] text-[#00D084] bg-[#0B0E12]',
    },
    {
      number: 2,
      title: isVi ? 'BĂM SHA-256' : 'SHA-256 HASHING',
      icon: Hash,
      value: `Digest: ${transaction.currentDigest.slice(0, 16)}...${transaction.currentDigest.slice(-8)}`,
      desc: isVi
        ? 'Chuyển đổi chuỗi byte giao dịch bất kỳ thành chuỗi tóm lược thông điệp 256-bit cố định.'
        : 'Transforms arbitrary transaction bytes into a fixed 256-bit scalar message digest.',
      badge: 'FIPS 180-4',
      color: 'border-[#1B2027] text-[#C5CBD3] bg-[#0B0E12]',
    },
    {
      number: 3,
      title: isVi ? 'CHỮ KÝ ECDSA & KHÓA CÔNG KHAI' : 'ECDSA SIGNATURE & PUBLIC KEY',
      icon: Key,
      value: `Sig: ${transaction.signature.slice(0, 14)}... | PubKey: ${transaction.sender.slice(0, 14)}...`,
      desc: isVi
        ? 'Trích xuất cặp số (r, s) của chữ ký số ECDSA trên đường cong elliptic secp256k1.'
        : 'Evaluates ECDSA (r, s) signature components over SECP256K1 elliptic curve.',
      badge: 'SECP256K1',
      color: 'border-[#1B2027] text-[#C5CBD3] bg-[#0B0E12]',
    },
    {
      number: 4,
      title: isVi ? 'XÁC MINH TOÁN HỌC' : 'MATHEMATICAL VERIFICATION',
      icon: isOk ? CheckCircle2 : XCircle,
      value: isOk
        ? (isVi ? 'Công thức: R = (u1 · G + u2 · Q) → x_R ≡ r (mod n) [KHỚP CHÍNH XÁC]' : 'Verification Formula: R = (u1 · G + u2 · Q) → x_R ≡ r (mod n) [MATCH]')
        : (isVi ? 'Công thức: Điểm tọa độ không khớp! Dữ liệu đã bị sửa sau khi ký.' : 'Verification Formula: Signature point mismatch! Digest modified post-signing.'),
      desc: isOk
        ? (isVi ? 'Chữ ký được xác thực thành công bởi khóa công khai người gửi. Đảm bảo tính toàn vẹn và chống chối bỏ.' : 'Signature authenticated by sender public key. Integrity and non-repudiation guaranteed.')
        : (isVi ? 'Kiểm tra toàn vẹn thất bại. Mã băm thông điệp không khớp với chữ ký số của người gửi.' : 'Integrity check failed. The message digest does not match the sender signature.'),
      badge: isOk ? (isVi ? '✓ HỢP LỆ' : '✓ VALID') : (isVi ? '✕ KHÔNG HỢP LỆ' : '✕ INVALID'),
      color: isOk
        ? 'border-[#00D084]/40 text-[#00D084] bg-[#00D084]/10'
        : 'border-rose-500/40 text-rose-300 bg-rose-950/30',
    },
  ];

  return (
    <div className="rounded-xl bg-[#090C10] border border-[#1B2027] p-4 font-mono text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-[#1B2027] pb-2">
        <span className="text-[#9AA2AE] font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#00D084]" />
          <span>{isVi ? 'Quy Trình Xác Thực Mật Mã Học' : 'Cryptographic Authentication Pipeline'}</span>
        </span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isOk
              ? 'bg-[#00D084]/15 text-[#00D084] border border-[#00D084]/30'
              : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
          }`}
        >
          {isOk
            ? (isVi ? 'ĐÃ XÁC THỰC CHÍNH CHỦ' : 'VALIDATED AUTHENTIC')
            : (isVi ? 'XÁC MINH THẤT BẠI' : 'VERIFICATION FAILED')}
        </span>
      </div>

      {/* Visual Pipeline Flow Nodes */}
      <div className="space-y-2 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.number}>
              <div className={`p-3 rounded-lg border transition-all ${step.color}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0F1217] border border-[#1B2027] flex items-center justify-center text-[10px] font-bold text-[#C5CBD3]">
                      {step.number}
                    </span>
                    <span className="font-bold text-[11px] uppercase tracking-wider">
                      {step.title}
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#090C10] border border-[#1B2027] font-bold text-[#9AA2AE]">
                    {step.badge}
                  </span>
                </div>
                <div className="text-[11px] text-[#E7E9ED] break-all select-all font-semibold my-1">
                  {step.value}
                </div>
                <p className="text-[10px] text-[#9AA2AE] font-sans leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="flex justify-center my-0.5">
                  <ArrowDown className="w-3.5 h-3.5 text-[#5A6472] animate-pulse" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

