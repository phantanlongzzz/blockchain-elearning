import React, { useState } from 'react';
import {
  RotateCcw,
  ArrowRight,
  Unlock,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface SignedMessagesSimulationProps {
  isHandsOn?: boolean;
  onInteracted?: () => void;
  onPrevStage?: () => void;
  onNextStage?: () => void;
}

export const SignedMessagesSimulation: React.FC<SignedMessagesSimulationProps> = ({
  onInteracted,
  onPrevStage,
  onNextStage,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [messageData, setMessageData] = useState<'ATTACK' | 'RETREAT'>('ATTACK');
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<'valid' | 'invalid'>('valid');

  const COMMANDER_PUBKEY = '04a18f92b7c4d5e6...89ef';
  const ORIGINAL_SIGNATURE = '30450221008f3d...9a21b4 (ECDSA Secp256k1)';

  const handleTamperMessage = () => {
    setMessageData('RETREAT');
    setIsTampered(true);
    setVerificationStatus('invalid');
    onInteracted?.();
  };

  const handleRestoreMessage = () => {
    setMessageData('ATTACK');
    setIsTampered(false);
    setVerificationStatus('valid');
    onInteracted?.();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* 1. Header */}
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 font-sans tracking-tight">
              {isVi ? 'Thông điệp ký số' : 'Signed messages simulation'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isVi
                ? 'Chữ ký số mật mã ngăn chặn giả mạo dữ liệu trong quá trình truyền tải.'
                : 'Digital signatures mathematically protect message integrity across untrusted networks.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isTampered ? (
              <button
                type="button"
                onClick={handleRestoreMessage}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isVi ? 'Khôi phục gốc' : 'Restore original'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTamperMessage}
                className="px-3.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{isVi ? 'Sửa đổi dữ liệu' : 'Tamper payload'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Message Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Message Payload & Verification */}
        <div className="lg:col-span-7 bg-[#0B0E12] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-300 font-medium">
                {isVi ? 'Gói thông điệp' : 'Message packet'}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">ECDSA Secp256k1</span>
            </div>

            {/* Packet Box */}
            <div
              className={`p-4 rounded-lg border transition-colors space-y-3.5 ${
                verificationStatus === 'valid'
                  ? 'bg-[#080C10] border-slate-800'
                  : 'bg-rose-950/20 border-rose-500/40'
              }`}
            >
              {/* Sender Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="text-slate-400">
                  {isVi ? 'Người ký: ' : 'Sender: '}
                  <span className="text-slate-200 font-medium">
                    {isVi ? 'Chỉ huy' : 'Commander'}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 truncate max-w-xs">
                  PubKey: {COMMANDER_PUBKEY}
                </span>
              </div>

              {/* Payload */}
              <div className="p-3 rounded-md bg-[#04060b] border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase text-slate-500 font-medium block">
                  {isVi ? 'Nội dung thông điệp (Payload)' : 'Payload'}
                </span>
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-sm font-semibold ${
                      messageData === 'ATTACK' ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {messageData === 'ATTACK'
                      ? isVi ? 'Tấn công' : 'ATTACK'
                      : isVi ? 'Rút lui' : 'RETREAT'}
                  </span>
                  {isTampered && (
                    <span className="text-[10px] text-rose-400 font-medium">
                      {isVi ? 'Đã bị sửa đổi' : 'Tampered'}
                    </span>
                  )}
                </div>
              </div>

              {/* Signature */}
              <div className="p-3 rounded-md bg-[#04060b] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase text-slate-500 font-medium">
                    {isVi ? 'Chữ ký số (ECDSA)' : 'Digital signature'}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      verificationStatus === 'valid' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {verificationStatus === 'valid'
                      ? isVi ? 'Hợp lệ' : 'Valid'
                      : isVi ? 'Không hợp lệ' : 'Invalid'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  {ORIGINAL_SIGNATURE}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Banner */}
          <div className="p-3.5 rounded-lg bg-[#080C10] border border-slate-800 flex items-center gap-3 text-xs">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                verificationStatus === 'valid' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <div>
              <span className="font-semibold text-slate-100">
                {verificationStatus === 'valid'
                  ? isVi ? 'Xác minh thành công' : 'Signature verified'
                  : isVi ? 'Chữ ký không hợp lệ' : 'Verification failed'}
              </span>
              <p className="text-slate-400 text-xs mt-0.5">
                {verificationStatus === 'valid'
                  ? isVi
                    ? 'Thông điệp nguyên bản và được ký đúng bởi khóa bí mật của Chỉ huy.'
                    : 'Message is authentic and verified with the sender’s public key.'
                  : isVi
                    ? 'Dữ liệu bị sửa đổi làm lệch mã hash. Các nút mạng loại bỏ gói tin.'
                    : 'Tampered data breaks hash match. Nodes drop the invalid packet.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Why signatures are not enough */}
        <div className="lg:col-span-5 bg-[#0B0E12] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-xs font-medium text-slate-300 font-sans">
                {isVi ? 'Vì sao chữ ký số chưa đủ?' : 'Why signatures alone are not enough'}
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isVi
                ? 'Chữ ký số giải quyết danh tính và tính toàn vẹn, nhưng mạng phi tập trung mở cần giải quyết 2 bài toán lớn khác:'
                : 'Digital signatures verify identity and integrity, but decentralized networks face two additional challenges:'}
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-[#080C10] border border-slate-800/80 space-y-1">
                <div className="text-xs font-medium text-slate-200">
                  {isVi ? '1. Chi tiêu kép (Double spending)' : '1. Double spending'}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isVi
                    ? 'Người dùng có thể ký 2 giao dịch hợp lệ cùng tiêu 1 số tiền gửi cho 2 nút khác nhau.'
                    : 'A user can sign two valid transactions spending the same coin to different nodes.'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#080C10] border border-slate-800/80 space-y-1">
                <div className="text-xs font-medium text-slate-200">
                  {isVi ? '2. Tấn công Sybil (Sybil attack)' : '2. Sybil attack'}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isVi
                    ? 'Kẻ tấn công có thể tạo hàng triệu danh tính ảo để chiếm đa số biểu quyết.'
                    : 'An attacker can create millions of virtual identities to dominate simple voting.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080C10] border border-emerald-500/20 text-slate-400 text-xs leading-relaxed">
              <span className="font-medium text-emerald-400">
                {isVi ? 'Đột phá của Nakamoto: ' : 'Nakamoto’s breakthrough: '}
              </span>
              {isVi
                ? 'Gắn quyền đề xuất khối với tài nguyên hữu hạn (năng lượng tính toán trong PoW hoặc tiền ký quỹ trong PoS).'
                : 'Tie block proposal power to scarce resources (computational work in PoW or capital stake in PoS).'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        {onPrevStage ? (
          <button
            type="button"
            onClick={onPrevStage}
            className="px-4 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            {isVi ? 'Quay lại' : 'Back'}
          </button>
        ) : (
          <div />
        )}

        {onNextStage && (
          <button
            type="button"
            onClick={onNextStage}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Tiếp tục: Bằng chứng công việc (PoW)' : 'Next: Proof of Work'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
