import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Trash2,
  Copy,
  Check,
  HelpCircle,
  Coins,
} from 'lucide-react';
import { E2ETransaction } from './types';

interface MempoolStepProps {
  mempool: E2ETransaction[];
  selectedTxIds: string[];
  onToggleSelectTx: (txId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteTx: (txId: string) => void;
  isMining: boolean;
  language: 'vi' | 'en';
}

export const MempoolStep: React.FC<MempoolStepProps> = ({
  mempool,
  selectedTxIds,
  onToggleSelectTx,
  onSelectAll,
  onDeselectAll,
  onDeleteTx,
  isMining,
  language,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const pendingCount = mempool.filter((t) => t.status === 'mempool').length;
  const selectedCount = selectedTxIds.length;
  const totalSelectedBTC = mempool
    .filter((t) => selectedTxIds.includes(t.id))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(id);
    setTimeout(() => setCopiedTxId(null), 1800);
  };

  return (
    <div id="e2e-mempool-step" className="space-y-6 font-sans">
      {/* Step Header & Inline Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-100">
              {language === 'vi' ? 'Bể giao dịch chờ (Mempool)' : 'Pending Transaction Pool (Mempool)'}
            </h3>
            {/* Info Tooltip Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTooltip((prev) => !prev)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 cursor-pointer"
                title="Thông tin cơ chế ưu tiên phí"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              {showTooltip && (
                <div className="absolute left-0 top-full mt-1 z-30 w-72 p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 shadow-xl">
                  {language === 'vi'
                    ? 'Thợ đào (Miners) luôn tự động ưu tiên chọn các giao dịch có tỷ lệ phí (fee rate) cao nhất vào khối ứng viên để tối đa hóa phần thưởng kinh tế.'
                    : 'Miners automatically prioritize transactions with higher fee rates to maximize their economic reward when assembling candidate blocks.'}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            {language === 'vi'
              ? 'Tập hợp các giao dịch chưa xác nhận đang chờ được thợ đào chọn lọc đóng gói.'
              : 'Collection of unconfirmed signed transactions waiting for miner inclusion.'}
          </p>
        </div>

        {/* Flat Inline Telemetry */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-zinc-400">
            <span className="font-semibold text-amber-400">{pendingCount}</span> {language === 'vi' ? 'chờ' : 'pending'}
          </div>
          <div className="text-zinc-600">·</div>
          <div className="text-zinc-400">
            <span className="font-semibold text-emerald-400">{selectedCount} / {mempool.length}</span> {language === 'vi' ? 'TXs đã chọn' : 'TXs selected'}
          </div>
          <div className="text-zinc-600">·</div>
          <div className="text-zinc-400">
            <span className="font-semibold text-zinc-100">{totalSelectedBTC.toFixed(3)} BTC</span> {language === 'vi' ? 'khối lượng' : 'output'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#0c101c] border border-zinc-800 rounded-xl overflow-hidden">
        {/* Table Controls Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-zinc-800 bg-[#080c16]">
          <span className="text-xs font-medium text-zinc-300">
            {language === 'vi' ? 'Danh sách giao dịch' : 'Transaction Table'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSelectAll}
              disabled={isMining || mempool.length === 0}
              className="text-xs px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {language === 'vi' ? 'Chọn tất cả' : 'Select all'}
            </button>
            <button
              type="button"
              onClick={onDeselectAll}
              disabled={isMining || selectedTxIds.length === 0}
              className="text-xs px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {language === 'vi' ? 'Bỏ chọn' : 'Deselect all'}
            </button>
          </div>
        </div>

        {/* Flat Transactions Table */}
        {mempool.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Coins className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-zinc-400">
              {language === 'vi'
                ? 'Mempool hiện đang rỗng. Hãy quay lại Bước 1 để tạo giao dịch mới.'
                : 'Mempool is currently empty. Return to Step 1 to create new transactions.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#080c16]/50 text-zinc-400 text-[11px] font-medium border-b border-zinc-800">
                <tr>
                  <th scope="col" className="py-2.5 px-3 w-10">
                    <span className="sr-only">Chọn</span>
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    {language === 'vi' ? 'Giao dịch (Người gửi → Người nhận)' : 'Transaction (Sender → Recipient)'}
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-right">
                    {language === 'vi' ? 'Số lượng' : 'Amount'}
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-right">
                    {language === 'vi' ? 'Phí' : 'Fee'}
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    {language === 'vi' ? 'Thời gian' : 'Time'}
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    TXID
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-right">
                    {language === 'vi' ? 'Thao tác' : 'Action'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {mempool.map((tx) => {
                  const isSelected = selectedTxIds.includes(tx.id);
                  const shortHash = `${tx.hash.substring(0, 8)}...${tx.hash.substring(56)}`;

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => !isMining && onToggleSelectTx(tx.id)}
                      className={`hover:bg-zinc-900/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          aria-label="Chọn giao dịch"
                          className={`text-xs ${isSelected ? 'text-emerald-400' : 'text-zinc-600'}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Sender -> Recipient */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-zinc-200">
                          {tx.sender} <span className="text-zinc-500">→</span> {tx.recipient}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-amber-400">
                        {tx.amount.toFixed(3)} BTC
                      </td>

                      {/* Fee */}
                      <td className="py-3 px-3 text-right font-mono text-zinc-300">
                        +{tx.feeBTC} BTC
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-3 text-zinc-500 font-mono text-[11px]">
                        {tx.timestamp}
                      </td>

                      {/* TXID with copy */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-400">
                          <span>{shortHash}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(tx.hash, tx.id);
                            }}
                            className="p-1 hover:text-zinc-200 text-zinc-600 transition-colors"
                            title="Sao chép TXID"
                          >
                            {copiedTxId === tx.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Delete Action */}
                      <td className="py-3 px-3 text-right">
                        {!isMining && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTx(tx.id);
                            }}
                            className="p-1 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                            title="Xóa khỏi Mempool"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
