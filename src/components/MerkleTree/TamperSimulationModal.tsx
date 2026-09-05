import React, { useState } from 'react';
import { X, AlertTriangle, Flame } from 'lucide-react';
import { MerkleTransaction } from '../../types';
import { calculateTxHash } from '../../utils/merkle';

interface TamperSimulationModalProps {
  transaction: MerkleTransaction | null;
  onClose: () => void;
  onApplyTamper: (
    txId: string,
    newSender: string,
    newReceiver: string,
    newAmount: number
  ) => void;
}

export const TamperSimulationModal: React.FC<TamperSimulationModalProps> = ({
  transaction,
  onClose,
  onApplyTamper,
}) => {
  if (!transaction) return null;

  const [sender, setSender] = useState(transaction.sender);
  const [receiver, setReceiver] = useState(transaction.receiver);
  const [amount, setAmount] = useState<number>(transaction.amount);

  // Live recalculated preview hash
  const previewHash = calculateTxHash({
    sender: sender.trim(),
    receiver: receiver.trim(),
    amount: Number(amount),
    timestamp: transaction.timestamp,
  });

  const isChanged =
    sender.trim() !== transaction.sender ||
    receiver.trim() !== transaction.receiver ||
    Number(amount) !== transaction.amount;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyTamper(transaction.id, sender.trim(), receiver.trim(), Number(amount));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0C0F14] border border-rose-500/40 p-6 sm:p-8 shadow-2xl text-[#F2F4F7] font-mono text-xs space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C2430] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#F2F4F7] tracking-wider font-mono">
                  MÔ PHỎNG TẤN CÔNG SỬA ĐỔI DỮ LIỆU
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400">
                  Thác Đổ Mật Mã
                </span>
              </div>
              <p className="text-xs text-[#A5AFBF] font-sans mt-0.5">
                Thay đổi tham số giao dịch và quan sát hiệu ứng thác đổ lan truyền lên Gốc Merkle.
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

        {/* Quick Tamper Presets */}
        <div className="p-3.5 rounded-xl bg-[#090A0F] border border-rose-500/30 space-y-2">
          <span className="text-rose-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Kịch bản tấn công nhanh:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAmount(amount * 100)}
              className="px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-[11px] font-mono font-medium transition-colors cursor-pointer"
            >
              Thổi phồng số tiền (×100)
            </button>
            <button
              type="button"
              onClick={() => setReceiver('0xDEADBEEF Kẻ Tấn Công')}
              className="px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-[11px] font-mono font-medium transition-colors cursor-pointer"
            >
              Chiếm đoạt địa chỉ nhận
            </button>
            <button
              type="button"
              onClick={() => {
                setSender(transaction.sender);
                setReceiver(transaction.receiver);
                setAmount(transaction.amount);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#0F131A] hover:bg-[#11161E] border border-[#1C2430] text-[#A5AFBF] hover:text-[#F2F4F7] text-[11px] font-mono font-medium transition-colors cursor-pointer"
            >
              Đặt lại ban đầu
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#A5AFBF] text-[10px] uppercase font-mono block mb-1">
                Người gửi:
              </label>
              <input
                type="text"
                required
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full bg-[#090A0F] border border-[#1C2430] rounded-lg px-3 py-2 text-xs font-mono text-[#F2F4F7] focus:outline-none focus:border-rose-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-[#A5AFBF] text-[10px] uppercase font-mono block mb-1">
                Người nhận:
              </label>
              <input
                type="text"
                required
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="w-full bg-[#090A0F] border border-[#1C2430] rounded-lg px-3 py-2 text-xs font-mono text-[#F2F4F7] focus:outline-none focus:border-rose-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[#A5AFBF] text-[10px] uppercase font-mono block mb-1">
              Số tiền (BTC):
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-[#090A0F] border border-[#1C2430] rounded-lg px-3 py-2 text-xs font-mono text-rose-300 font-bold focus:outline-none focus:border-rose-400 transition-colors"
            />
          </div>

          {/* Hash Comparison (Before vs After) */}
          <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1C2430] space-y-3">
            <span className="text-[#A5AFBF] uppercase font-mono font-bold text-[10px] block">
              So sánh mã băm mật mã:
            </span>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-[#0F131A] border border-[#1C2430]">
                <div className="flex items-center justify-between text-[10px] text-[#717B8C] mb-0.5 font-mono">
                  <span>MÃ BĂM LÁ BAN ĐẦU:</span>
                  <span className="text-success font-bold">Đã chốt</span>
                </div>
                <div className="text-[10px] font-mono text-[#A5AFBF] break-all">{transaction.hash}</div>
              </div>

              <div className={`p-2.5 rounded-lg border ${isChanged ? 'bg-rose-950/30 border-rose-500/50 text-rose-200' : 'bg-[#0F131A] border-[#1C2430] text-[#717B8C]'}`}>
                <div className="flex items-center justify-between text-[10px] mb-0.5 font-mono">
                  <span className={isChanged ? 'text-rose-400 font-bold' : 'text-[#717B8C]'}>
                    MÃ BĂM LÁ TÍNH LẠI MỚI:
                  </span>
                  {isChanged && (
                    <span className="text-rose-400 font-bold">
                      CẢNH BÁO: ĐÃ ĐỔI
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono break-all text-rose-300">{previewHash}</div>
              </div>
            </div>
          </div>

          {/* Explanatory Cascade Box */}
          <p className="text-[11px] font-sans text-[#717B8C] leading-relaxed">
            Chỉ cần sửa một giao dịch đơn lẻ, mã băm 256-bit sẽ thay đổi hoàn toàn. Khi áp dụng, các nút cha trực tiếp phía trên nhánh này sẽ chuyển sang màu đỏ và lan truyền thẳng lên Gốc Merkle, trong khi các nhánh khác không bị ảnh hưởng.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1C2430]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#F2F4F7] border border-[#1C2430] font-mono font-bold cursor-pointer transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Flame className="w-4 h-4" />
              <span>Kích hoạt sửa đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
