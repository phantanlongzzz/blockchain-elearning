import React, { useState } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import { MerkleTransaction } from '../../types';
import { PRESET_MERKLE_TRANSACTIONS } from '../../data/merkleSeedData';

interface TransactionListProps {
  transactions: MerkleTransaction[];
  selectedTxId: string | null;
  onSelectTx: (id: string | null) => void;
  onAddTransaction: (sender: string, receiver: string, amount: number) => void;
  onDeleteTransaction: (id: string) => void;
  onTamperTransaction: (tx: MerkleTransaction) => void;
  onRestoreTransaction: (tx: MerkleTransaction) => void;
  onVerifyProof: (tx: MerkleTransaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  selectedTxId,
  onSelectTx,
  onAddTransaction,
  onDeleteTransaction,
  onTamperTransaction,
  onRestoreTransaction,
  onVerifyProof,
}) => {
  const [sender, setSender] = useState('Alice');
  const [receiver, setReceiver] = useState('Bob');
  const [amount, setAmount] = useState<number>(10.0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.trim() || !receiver.trim() || amount <= 0) return;
    onAddTransaction(sender.trim(), receiver.trim(), Number(amount));
    // Generate new random amount for quick successive adds
    setAmount(Number((Math.random() * 4 + 0.5).toFixed(2)));
  };

  const handleCopyHash = (e: React.MouseEvent, id: string, hash: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 1. Compact Transaction Creator */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#0C0F14] border border-[#1C2430] space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#1C2430]">
          <span className="font-sans text-sm font-semibold text-[#F2F4F7]">
            Tạo giao dịch
          </span>
          <span className="text-[10px] font-mono text-[#717B8C]">
            SHA-256
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#A5AFBF] text-[11px] font-sans font-medium block mb-1.5">
                Người gửi
              </label>
              <input
                type="text"
                required
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Alice"
                className="w-full bg-[#090A0F] border border-[#1C2430] rounded-lg px-3 py-2 text-xs font-sans text-[#F2F4F7] focus:outline-none focus:border-[rgba(0,201,141,0.5)] transition-colors"
              />
            </div>

            <div>
              <label className="text-[#A5AFBF] text-[11px] font-sans font-medium block mb-1.5">
                Người nhận
              </label>
              <input
                type="text"
                required
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="Bob"
                className="w-full bg-[#090A0F] border border-[#1C2430] rounded-lg px-3 py-2 text-xs font-sans text-[#F2F4F7] focus:outline-none focus:border-[rgba(0,201,141,0.5)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[#A5AFBF] text-[11px] font-sans font-medium block mb-1.5">
              Số tiền (BTC)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-[#090A0F] border border-[#1C2430] rounded-lg px-3 py-2 text-xs font-mono text-financial font-medium focus:outline-none focus:border-financial/50 transition-colors"
            />
          </div>

          {/* Quick Presets - Reduced visual weight */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 opacity-70">
            {PRESET_MERKLE_TRANSACTIONS.slice(0, 4).map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSender(preset.sender);
                  setReceiver(preset.receiver);
                  setAmount(preset.amount);
                }}
                className="px-2 py-0.5 rounded text-[10px] font-sans text-[#717B8C] hover:text-[#F2F4F7] transition-colors cursor-pointer"
              >
                {preset.sender.split(' ')[0]} → {preset.receiver.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            type="submit"
 className="w-full py-2 mt-2 rounded-lg bg-financial hover:bg-financial/90 text-black font-semibold font-semibold text-xs font-sans transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm giao dịch</span>
          </button>
        </form>
      </div>

      {/* 2. Flat Compact Transaction List */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#0C0F14] border border-[#1C2430] space-y-2 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#1C2430]">
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm font-semibold text-[#F2F4F7]">
              Danh sách giao dịch
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#0F131A] border border-[#1C2430] text-[10px] font-mono text-[#A5AFBF]">
              {transactions.length}
            </span>
          </div>
          <span className="text-[11px] font-sans text-[#717B8C]">
            Tầng Lá
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-6 text-center text-[#717B8C] font-sans text-xs">
            Chưa có giao dịch.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5 custom-scrollbar pt-2">
            {transactions.map((tx, idx) => {
              const isTampered = Boolean(tx.isTampered);
              const isSelected = selectedTxId === tx.id;

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTx(isSelected ? null : tx.id)}
                  className={`group px-3 py-2.5 rounded-lg border transition-all duration-150 cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-[#0F131A] border-teach-1 text-[#F2F4F7]'
                      : isTampered
                      ? 'bg-rose-950/20 border-rose-500/40 hover:bg-rose-950/30'
                      : 'bg-[#090A0F] border-[#1C2430] hover:border-[#151C26] hover:bg-[#0F131A]'
                  }`}
                >
                  {/* Top Row: Index + Participants + Amount */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-sans text-[12px] font-medium text-[#717B8C]">
                        Tx{idx}
                      </span>
                      <span className="truncate text-[12px] font-semibold text-[#F2F4F7] font-sans">
                        {tx.sender.split(' ')[0]} → {tx.receiver.split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-mono text-[11px] font-medium ${
                          isTampered ? 'text-rose-400' : 'text-financial'
                        }`}
                      >
                        {tx.amount.toFixed(2)} BTC
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Shortened Hash + Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#1C2430]/60 text-[11px]">
                    <div className="flex items-center gap-1 font-mono text-[#717B8C] truncate">
                      <span className="truncate">{tx.hash.slice(0, 8)}...{tx.hash.slice(-4)}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyHash(e, tx.id, tx.hash)}
                        className="text-[#717B8C] hover:text-[#F2F4F7] transition-colors p-0.5 cursor-pointer"
                        title="Copy SHA-256"
                      >
                        {copiedId === tx.id ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Verify Proof */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVerifyProof(tx);
                        }}
                        className="px-2 py-1 rounded bg-[#0F131A] hover:bg-[#11161E] text-teach-1 border border-[#1C2430] text-[10px] font-sans font-medium transition-colors cursor-pointer"
                      >
                        <span>Kiểm tra</span>
                      </button>

                      {/* Tamper / Restore */}
                      {isTampered ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestoreTransaction(tx);
                          }}
                          className="px-2 py-1 rounded bg-[#0F131A] hover:bg-[#11161E] text-teach-1 border border-[#1C2430] text-[10px] font-sans font-medium transition-colors cursor-pointer"
                        >
                          <span>Khôi phục</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTamperTransaction(tx);
                          }}
                          className="px-2 py-1 rounded bg-[#0F131A] hover:bg-[#11161E] text-[#F2F4F7] border border-[#1C2430] text-[10px] font-sans font-medium transition-colors cursor-pointer"
                        >
                          <span>Sửa dữ liệu</span>
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTransaction(tx.id);
                        }}
                        disabled={transactions.length <= 1}
                        className={`p-1 rounded text-[#717B8C] hover:text-rose-400 transition-colors cursor-pointer ${
                          transactions.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
