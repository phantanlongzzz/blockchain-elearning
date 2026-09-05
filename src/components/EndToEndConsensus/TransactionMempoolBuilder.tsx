import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square, Clock, Coins, Send } from 'lucide-react';
import { E2ETransaction } from './types';
import { calculateTxHash } from '../../utils/merkle';

interface TransactionMempoolBuilderProps {
  mempool: E2ETransaction[];
  selectedTxIds: string[];
  onToggleSelectTx: (txId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCreateTx: (tx: E2ETransaction) => void;
  onDeleteTx: (txId: string) => void;
  isMining: boolean;
  language: 'vi' | 'en';
}

const PRESET_TXS = [
  { sender: 'Alice', recipient: 'Bob', amount: 10.0, fee: 0.0005 },
  { sender: 'Charlie', recipient: 'Dave', amount: 5.25, fee: 0.0008 },
  { sender: 'Eva', recipient: 'Frank', amount: 2.5, fee: 0.0002 },
  { sender: 'Satoshi', recipient: 'Hal Finney', amount: 50.0, fee: 0.001 },
  { sender: 'Grace', recipient: 'Heidi', amount: 1.15, fee: 0.0003 },
];

export const TransactionMempoolBuilder: React.FC<TransactionMempoolBuilderProps> = ({
  mempool,
  selectedTxIds,
  onToggleSelectTx,
  onSelectAll,
  onDeselectAll,
  onCreateTx,
  onDeleteTx,
  isMining,
  language,
}) => {
  const [sender, setSender] = useState('Alice');
  const [recipient, setRecipient] = useState('Bob');
  const [amount, setAmount] = useState<number>(10.0);
  const [fee, setFee] = useState<number>(0.0005);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.trim() || !recipient.trim() || amount <= 0) return;

    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

    const txHash = calculateTxHash({
      sender: sender.trim(),
      receiver: recipient.trim(),
      amount: Number(amount),
      timestamp,
    });

    const newTx: E2ETransaction = {
      id: `tx-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      sender: sender.trim(),
      recipient: recipient.trim(),
      amount: Number(amount),
      feeBTC: Number(fee),
      timestamp,
      hash: txHash,
      status: 'mempool',
    };

    onCreateTx(newTx);
    setJustAddedId(newTx.id);
    setTimeout(() => setJustAddedId(null), 1800);
  };

  const applyPreset = (preset: typeof PRESET_TXS[0]) => {
    setSender(preset.sender);
    setRecipient(preset.recipient);
    setAmount(preset.amount);
    setFee(preset.fee);
  };

  const pendingCount = mempool.filter((t) => t.status === 'mempool').length;
  const selectedCount = selectedTxIds.length;
  const totalSelectedBTC = mempool
    .filter((t) => selectedTxIds.includes(t.id))
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div id="e2e-tx-mempool-builder" className="space-y-4 font-sans">
      {/* Upper Grid: Create Tx Form & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Tx Creation Form */}
        <div className="lg:col-span-7 bg-[#0c101c] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-border-primary flex items-center justify-center text-text-muted">
                <Send className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-200 font-sans">
                  {language === 'vi' ? '1. Tạo giao dịch mới' : '1. Create new transaction'}
                </h4>
                <p className="text-[11px] text-slate-400 font-sans">
                  {language === 'vi'
                    ? 'Ký và phát hành giao dịch vào bộ nhớ đệm Mempool của mạng P2P'
                    : 'Sign and broadcast unconfirmed transactions to network mempool'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sender */}
              <div>
                <label className="block text-[11px] font-sans font-medium text-slate-400 mb-1">
                  {language === 'vi' ? 'Người gửi (Sender)' : 'Sender'}
                </label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="Alice"
                  disabled={isMining}
                  className="w-full bg-[#080c16] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-border-primary focus:ring-1 focus:ring-white/20 transition-colors disabled:opacity-50"
                  required
                />
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-[11px] font-sans font-medium text-slate-400 mb-1">
                  {language === 'vi' ? 'Người nhận (Recipient)' : 'Recipient'}
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Bob"
                  disabled={isMining}
                  className="w-full bg-[#080c16] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-border-primary focus:ring-1 focus:ring-white/20 transition-colors disabled:opacity-50"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[11px] font-sans font-medium text-slate-400 mb-1">
                  {language === 'vi' ? 'Số tiền (BTC)' : 'Amount (BTC)'}
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  disabled={isMining}
                  className="w-full bg-[#080c16] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-border-primary focus:ring-1 focus:ring-white/20 transition-colors disabled:opacity-50"
                  required
                />
              </div>

              {/* Fee */}
              <div>
                <label className="block text-[11px] font-sans font-medium text-slate-400 mb-1">
                  {language === 'vi' ? 'Phí giao dịch (BTC)' : 'Miner fee (BTC)'}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={fee}
                  onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
                  disabled={isMining}
                  className="w-full bg-[#080c16] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-border-primary focus:ring-1 focus:ring-white/20 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Presets & Create Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-sans">
                  {language === 'vi' ? 'Gợi ý:' : 'Presets:'}
                </span>
                {PRESET_TXS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    disabled={isMining}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {preset.sender} → {preset.recipient} ({preset.amount} BTC)
                  </button>
                ))}
              </div>

              <button
                type="submit"
                id="btn-create-e2e-tx"
                disabled={isMining}
 className="px-3.5 py-1.5 rounded-lg bg-financial hover:bg-financial/90 text-black font-semibold font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer font-sans"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Tạo giao dịch' : 'Create transaction'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Mempool Queue Stats & Controls */}
        <div className="lg:col-span-5 bg-[#0c101c] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-200 font-sans">
                    {language === 'vi' ? '2. Bể giao dịch chờ (Mempool)' : '2. Transaction Pool (Mempool)'}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans">
                    {language === 'vi' ? 'Các giao dịch đang chờ thợ đào đóng gói' : 'Pending unconfirmed txs'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-amber-950/40 text-amber-300 border border-amber-500/30">
                {pendingCount} {language === 'vi' ? 'chờ' : 'pending'}
              </span>
            </div>

            {/* Summary Telemetry */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2.5 rounded-lg bg-[#080c16] border border-slate-800">
                <span className="text-[11px] font-sans text-slate-400 block mb-0.5">
                  {language === 'vi' ? 'Đã chọn đóng gói' : 'Selected for block'}
                </span>
                <span className="text-sm font-semibold font-mono text-financial">
                  {selectedCount} / {mempool.length} TXs
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#080c16] border border-slate-800">
                <span className="text-[11px] font-sans text-slate-400 block mb-0.5">
                  {language === 'vi' ? 'Tổng khối lượng' : 'Total output'}
                </span>
                <span className="text-sm font-semibold font-mono text-amber-400">
                  {totalSelectedBTC.toFixed(3)} BTC
                </span>
              </div>
            </div>
          </div>

          {/* Quick Select Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                disabled={isMining || mempool.length === 0}
                className="text-xs font-sans px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {language === 'vi' ? 'Chọn tất cả' : 'Select all'}
              </button>
              <button
                type="button"
                onClick={onDeselectAll}
                disabled={isMining || selectedTxIds.length === 0}
                className="text-xs font-sans px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {language === 'vi' ? 'Bỏ chọn' : 'Deselect all'}
              </button>
            </div>
            <span className="text-[11px] text-slate-400 font-sans">
              {language === 'vi' ? 'Miners tự động ưu tiên' : 'Miners prioritize by fee'}
            </span>
          </div>
        </div>
      </div>

      {/* Mempool Transaction List */}
      <div className="bg-[#0c101c] border border-slate-800 rounded-xl p-4 shadow-sm font-sans">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300">
            {language === 'vi' ? 'Danh sách giao dịch trong Mempool' : 'Transactions in Mempool'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {mempool.length === 0 ? (language === 'vi' ? 'Mempool rỗng' : 'Empty pool') : `${mempool.length} items`}
          </span>
        </div>

        {mempool.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg bg-[#080c16]">
            <Coins className="w-6 h-6 text-slate-600 mx-auto mb-1.5 opacity-50" />
            <p className="text-xs text-slate-400 font-sans">
              {language === 'vi'
                ? 'Chưa có giao dịch trong Mempool. Hãy tạo giao dịch ở trên hoặc chọn gợi ý.'
                : 'Mempool is empty. Create a new transaction above to start.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {mempool.map((tx) => {
              const isSelected = selectedTxIds.includes(tx.id);
              const isNewlyAdded = justAddedId === tx.id;

              return (
                <div
                  key={tx.id}
                  onClick={() => !isMining && onToggleSelectTx(tx.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer relative ${
                    isNewlyAdded
                      ? 'bg-white/[0.06] border-border-primary'
                      : isSelected
                      ? 'bg-[#080c16] border-border-secondary'
                      : 'bg-[#080c16]/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Toggle select tx"
                        className={`text-xs ${isSelected ? 'text-text-primary font-semibold' : 'text-slate-500'}`}
                      >
                        {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-xs font-semibold text-slate-200">
                        {tx.sender} → {tx.recipient}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono font-medium text-amber-400">
                        {tx.amount} BTC
                      </span>
                      {!isMining && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTx(tx.id);
                          }}
                          className="p-1 rounded hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove tx from mempool"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-[#F6C453]">Fee: +{tx.feeBTC} BTC</span>
                    <span>{tx.timestamp}</span>
                  </div>

                  {/* Truncated Hash */}
                  <div className="mt-1.5 text-[10px] font-mono text-slate-400 truncate bg-[#060911] px-1.5 py-0.5 rounded border border-slate-800">
                    TXID: {tx.hash.substring(0, 16)}...{tx.hash.substring(56)}
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
