import React, { useState } from 'react';
import { X, Zap, Sparkles, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { MerkleTransaction } from '../../types';
import { generateMerkleProof, verifyMerkleProof } from '../../utils/merkle';

interface MerkleProofModalProps {
  transaction: MerkleTransaction | null;
  allTransactions: MerkleTransaction[];
  onClose: () => void;
}

export const MerkleProofModal: React.FC<MerkleProofModalProps> = ({
  transaction,
  allTransactions,
  onClose,
}) => {
  if (!transaction) return null;

  const proof = generateMerkleProof(allTransactions, transaction.id);
  const { steps, expectedRoot, isValid } = proof;
  const verification = verifyMerkleProof(transaction.hash, steps, expectedRoot);

  const [activeStep, setActiveStep] = useState<number>(steps.length);
  const [copiedRoot, setCopiedRoot] = useState(false);

  const totalLeaves = allTransactions.length;
  const proofStepsCount = steps.length;
  const theoreticalSteps = Math.ceil(Math.log2(totalLeaves || 1));

  const handleCopyRoot = () => {
    navigator.clipboard.writeText(expectedRoot);
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0C0F14] border border-[#1C2430] p-6 sm:p-8 shadow-2xl text-[#F2F4F7] font-mono text-xs space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C2430] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F131A] border border-[#1C2430] flex items-center justify-center text-teach-1">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#F2F4F7] tracking-wider font-mono">
                  XÁC MINH BẰNG CHỨNG MERKLE
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teach-1/10 text-teach-1 border border-teach-1/30">
                  Xác thực O(log n)
                </span>
              </div>
              <p className="text-xs text-[#A5AFBF] font-sans mt-0.5">
                Chứng minh một giao dịch thuộc về khối mà không cần tải toàn bộ tập giao dịch.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Transaction Card */}
        <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1C2430] space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-teach-1 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Giao dịch mục tiêu cần xác minh:</span>
            </span>
            <span className="text-[#717B8C] font-mono">ID: {transaction.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#0F131A] border border-[#1C2430]">
            <div>
              <span className="text-[10px] text-[#717B8C] block uppercase">
                Người gửi
              </span>
              <span className="text-[#F2F4F7] font-bold">{transaction.sender}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#717B8C] block uppercase">
                Người nhận
              </span>
              <span className="text-[#F2F4F7] font-bold">{transaction.receiver}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#717B8C] block uppercase">
                Số tiền
              </span>
              <span className="text-financial font-bold">{transaction.amount.toFixed(4)} BTC</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#090A0F] border border-[#1C2430] flex items-center justify-between gap-2">
            <span className="text-[#717B8C] uppercase text-[10px] font-bold">
              Mã băm lá mục tiêu:
            </span>
            <span className="text-teach-1 font-mono text-[11px] truncate flex-1">{transaction.hash}</span>
          </div>
        </div>

        {/* Step-by-Step Proof Verification Pipeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F2F4F7] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-teach-1" />
              <span>
                Đường dẫn mật mã ({proofStepsCount} bước băm anh em)
              </span>
            </span>
            <span className="text-[10px] text-[#717B8C]">
              Lý thuyết: ⌈log₂({totalLeaves})⌉ = {theoreticalSteps} phép băm
            </span>
          </div>

          {steps.length === 0 ? (
            <div className="p-4 text-center text-[#717B8C] border border-dashed border-[#1C2430] rounded-xl">
              Cây chỉ có 1 lá. Mã băm của lá chính là Gốc Merkle.
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {steps.map((step, idx) => {
                const isLeft = step.siblingPosition === 'left';
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#090A0F] border border-[#1C2430] font-mono text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-teach-1 font-bold text-[11px]">
                        BƯỚC #{idx + 1} · TẦNG {step.level} → {step.level + 1}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0F131A] border border-[#1C2430] text-[#A5AFBF]">
                        Nút anh em ở bên {step.siblingPosition === 'left' ? 'TRÁI' : 'PHẢI'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {/* Left Item */}
                      <div className={`p-2 rounded-xl border ${isLeft ? 'bg-[#0F131A] border-[#1C2430] text-[#A5AFBF]' : 'bg-[#0F131A] border-teach-1/30 text-teach-1'}`}>
                        <div className="text-[9px] uppercase font-bold opacity-75 mb-0.5">
                          {isLeft ? 'Mã băm anh em (Trái):' : 'Mã băm hiện tại (Trái):'}
                        </div>
                        <span className="truncate block">
                          {isLeft ? step.siblingHash.slice(0, 16) + '...' : step.currentHash.slice(0, 16) + '...'}
                        </span>
                      </div>

                      {/* Right Item */}
                      <div className={`p-2 rounded-xl border ${!isLeft ? 'bg-[#0F131A] border-[#1C2430] text-[#A5AFBF]' : 'bg-[#0F131A] border-teach-1/30 text-teach-1'}`}>
                        <div className="text-[9px] uppercase font-bold opacity-75 mb-0.5">
                          {!isLeft ? 'Mã băm anh em (Phải):' : 'Mã băm hiện tại (Phải):'}
                        </div>
                        <span className="truncate block">
                          {!isLeft ? step.siblingHash.slice(0, 16) + '...' : step.currentHash.slice(0, 16) + '...'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0F131A] border border-[#1C2430] text-[10px]">
                      <span className="text-[#717B8C] uppercase font-bold">
                        Kết quả SHA-256:
                      </span>
                      <span className="text-teach-1 truncate flex-1">{step.parentHash}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Verification Result Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            verification.isValid
              ? 'bg-teach-1/10 border-teach-1/30 text-[#F2F4F7]'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {verification.isValid ? (
              <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-mono font-bold text-sm">
                {verification.isValid
                  ? '✓ GIAO DỊCH ĐƯỢC XÁC THỰC HỢP LỆ VỚI GỐC MERKLE'
                  : '✕ XÁC MINH BẰNG CHỨNG THẤT BẠI'}
              </div>
              <p className="text-xs text-[#A5AFBF] font-sans mt-0.5">
                Mã băm gốc tính lại khớp chính xác với Gốc Merkle trong Block Header.
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-[11px] shrink-0">
            <span className="text-[#717B8C] block text-[9px] uppercase">
              Gốc Đã Chốt
            </span>
            <span className="text-[#F59E0B] font-bold">{expectedRoot.slice(0, 12)}...</span>
          </div>
        </div>

        {/* Footer info & close */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1C2430] text-[11px]">
          <span className="text-[#717B8C] font-sans">
            Nút mạng rút gọn (SPV light client) chỉ cần lưu block header và xác minh giao dịch trong O(log n).
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#F2F4F7] border border-[#1C2430] font-mono font-bold cursor-pointer transition-all"
          >
            Đóng Trình Soi
          </button>
        </div>
      </div>
    </div>
  );
};
