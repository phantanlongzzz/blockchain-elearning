import React, { useMemo, useState } from 'react';
import {
  Boxes,
  Copy,
  Check,
  GitFork,
  Coins,
} from 'lucide-react';
import { E2ETransaction } from './types';
import { buildMerkleTree } from '../../utils/merkle';

interface BlockConstructionPanelProps {
  blockHeight: number;
  previousHash: string;
  selectedTxs: E2ETransaction[];
  difficulty: number;
  onChangeDifficulty: (diff: number) => void;
  isMining: boolean;
  baseRewardBTC: number;
  language: 'vi' | 'en';
}

export const BlockConstructionPanel: React.FC<BlockConstructionPanelProps> = ({
  blockHeight,
  previousHash,
  selectedTxs,
  difficulty,
  onChangeDifficulty,
  isMining,
  baseRewardBTC,
  language,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const merkleResult = useMemo(() => {
    if (selectedTxs.length === 0) {
      return { rootHash: '0000000000000000000000000000000000000000000000000000000000000000' };
    }
    const merkleTxs = selectedTxs.map((tx) => ({
      id: tx.id,
      sender: tx.sender,
      receiver: tx.recipient,
      amount: tx.amount,
      timestamp: tx.timestamp,
      hash: tx.hash,
    }));
    return buildMerkleTree(merkleTxs);
  }, [selectedTxs]);

  const totalFees = selectedTxs.reduce((acc, curr) => acc + (curr.feeBTC || 0), 0);
  const totalCoinbase = baseRewardBTC + totalFees;
  const targetPrefix = '0'.repeat(difficulty);
  const probability = Math.pow(16, -difficulty);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const shortPrevHash = `${previousHash.substring(0, 10)}...${previousHash.substring(54)}`;
  const shortMerkle = `${merkleResult.rootHash.substring(0, 10)}...${merkleResult.rootHash.substring(54)}`;

  return (
    <div id="e2e-block-construction-panel" className="space-y-6 font-sans">
      {/* Step Header & Difficulty Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-zinc-100">
            {language === 'vi' ? 'Đóng gói khối ứng viên' : 'Candidate Block Construction'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            {language === 'vi'
              ? 'Tổng hợp mã băm khối trước, Merkle Root của giao dịch và cấu hình độ khó Proof-of-Work.'
              : 'Aggregate Previous Hash, Merkle Root of selected transactions, and set target PoW difficulty.'}
          </p>
        </div>

        {/* Compact Difficulty Segmented Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">
            {language === 'vi' ? 'Độ khó:' : 'Difficulty:'}
          </span>
          <div className="inline-flex rounded-lg bg-[#080c16] border border-zinc-800 p-0.5 font-mono text-xs">
            {[2, 3, 4].map((d) => (
              <button
                key={d}
                type="button"
                id={`btn-diff-${d}`}
                onClick={() => onChangeDifficulty(d)}
                disabled={isMining}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  difficulty === d
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                } disabled:opacity-50 cursor-pointer`}
              >
                {d} zeros
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Block Construction Container */}
      <div className="bg-[#0c101c] border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-5">
        {/* Top Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b border-zinc-800 text-xs">
          <div>
            <span className="text-zinc-400 block text-[11px] mb-0.5">
              {language === 'vi' ? 'Khối số' : 'Block height'}
            </span>
            <span className="font-semibold font-mono text-emerald-400 text-sm">
              #{blockHeight}
            </span>
          </div>

          <div>
            <span className="text-zinc-400 block text-[11px] mb-0.5">
              {language === 'vi' ? 'Tiền tố mục tiêu' : 'Target prefix'}
            </span>
            <span className="font-semibold font-mono text-amber-400 text-sm">
              "{targetPrefix}..."
            </span>
          </div>

          <div>
            <span className="text-zinc-400 block text-[11px] mb-0.5">
              {language === 'vi' ? 'Giao dịch trong khối' : 'Transactions'}
            </span>
            <span className="font-semibold font-mono text-zinc-200 text-sm">
              {selectedTxs.length} {language === 'vi' ? 'giao dịch' : 'txs'}
            </span>
          </div>

          <div>
            <span className="text-zinc-400 block text-[11px] mb-0.5">
              {language === 'vi' ? 'Xác suất / Thử' : 'Target probability'}
            </span>
            <span className="font-semibold font-mono text-zinc-300 text-sm">
              1 / {Math.round(1 / probability).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Hashes & Metadata Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Previous Hash */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              {language === 'vi' ? 'Mã băm khối trước (Previous Hash)' : 'Previous Hash'}
            </label>
            <div className="bg-[#080c16] border border-zinc-800 rounded-lg p-3 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-zinc-300 break-all">
                {previousHash}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(previousHash, 'prevHash')}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono flex items-center gap-1 shrink-0 cursor-pointer"
                title="Sao chép Previous Hash"
              >
                {copiedField === 'prevHash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'prevHash' ? (language === 'vi' ? 'Đã chép' : 'Copied') : (language === 'vi' ? 'Sao chép' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Merkle Root */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              {language === 'vi' ? 'Mã băm Merkle Root' : 'Merkle Root'}
            </label>
            <div className="bg-[#080c16] border border-zinc-800 rounded-lg p-3 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-emerald-400 break-all">
                {merkleResult.rootHash}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(merkleResult.rootHash, 'merkleRoot')}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono flex items-center gap-1 shrink-0 cursor-pointer"
                title="Sao chép Merkle Root"
              >
                {copiedField === 'merkleRoot' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'merkleRoot' ? (language === 'vi' ? 'Đã chép' : 'Copied') : (language === 'vi' ? 'Sao chép' : 'Copy')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Coinbase Reward & Status */}
        <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">
              {language === 'vi' ? 'Phần thưởng thợ đào (Coinbase):' : 'Miner reward (Coinbase):'}
            </span>
            <span className="font-mono font-semibold text-amber-400 text-sm">
              +{totalCoinbase.toFixed(4)} BTC
            </span>
            <span className="text-zinc-500 font-mono text-[11px]">
              ({baseRewardBTC} BTC cơ bản + {totalFees.toFixed(4)} BTC phí)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">
              {language === 'vi' ? 'Trạng thái:' : 'Status:'}
            </span>
            <span className="text-emerald-400 font-medium">
              ● {language === 'vi' ? 'Sẵn sàng khai thác' : 'Ready to mine'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
