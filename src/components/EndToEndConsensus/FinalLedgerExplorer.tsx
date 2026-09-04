import React, { useState } from 'react';
import {
  Boxes,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  X,
  Lock,
  Unlock,
} from 'lucide-react';
import { E2EBlock } from './types';

interface FinalLedgerExplorerProps {
  blocks: E2EBlock[];
  language: 'vi' | 'en';
}

export const FinalLedgerExplorer: React.FC<FinalLedgerExplorerProps> = ({
  blocks,
  language,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<E2EBlock | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 1800);
  };

  const hasTamperedBlock = blocks.some((b) => b.isTampered);

  return (
    <div id="e2e-final-ledger-explorer" className="space-y-6 font-sans">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <span>{language === 'vi' ? 'Sổ cái chuỗi chính thức' : 'Canonical Blockchain Ledger'}</span>
            {hasTamperedBlock ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-950/50 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                {language === 'vi' ? 'Phát hiện giả mạo dữ liệu' : 'Tamper detected'}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-success/10 text-success border border-success/30 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                {language === 'vi' ? 'Bất biến 100%' : '100% Immutable'}
              </span>
            )}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            {language === 'vi'
              ? 'Chuỗi các khối bất biến đã được mạng P2P hoàn tất đồng thuận và liên kết bằng con trỏ băm (Hash Pointer).'
              : 'Finalized immutable blocks chained by cryptographic hash pointers.'}
          </p>
        </div>

        <span className="text-xs font-mono text-text-secondary font-medium bg-white/[0.04] px-3 py-1 rounded-lg border border-border-primary self-start sm:self-auto">
          {blocks.length} {language === 'vi' ? 'khối trong chuỗi chính' : 'canonical blocks'}
        </span>
      </div>

      {/* Main Ledger Container */}
      <div className="bg-[#0c101c] border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-5">
        {/* Horizontal Chain Flow */}
        <div className="flex items-stretch gap-3 overflow-x-auto pb-4 pt-1 scrollbar-thin">
          {blocks.map((blk, idx) => {
            const isSelected = selectedBlock?.id === blk.id;
            const isGenesis = blk.height === 0;
            const isTampered = blk.isTampered;
            const prevBlock = idx > 0 ? blocks[idx - 1] : null;
            const isPointerBroken = prevBlock && blk.previousHash !== prevBlock.hash;

            return (
              <React.Fragment key={blk.id}>
                {idx > 0 && (
                  <div className="flex flex-col items-center justify-center text-zinc-600 shrink-0 px-1">
                    {isPointerBroken ? (
                      <div className="flex flex-col items-center text-rose-400" title="Hash Pointer Broken">
                        <Unlock className="w-4 h-4 text-rose-500" />
                        <span className="text-[9px] font-mono font-bold text-rose-400">BROKEN</span>
                      </div>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                )}

                <div
                  onClick={() => setSelectedBlock(blk)}
                  className={`w-64 sm:w-72 p-4 rounded-xl border transition-all cursor-pointer shrink-0 font-sans text-xs flex flex-col justify-between ${
                    isTampered
                      ? 'bg-rose-950/20 border-rose-500/60 shadow-lg ring-1 ring-rose-500/40 text-rose-100'
                      : isSelected
                      ? 'bg-[#080c16] border-success/50 shadow-md ring-1 ring-success/20'
                      : 'bg-[#080c16] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    {/* Block Title */}
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Boxes className={`w-3.5 h-3.5 ${isTampered ? 'text-rose-400' : 'text-emerald-400'}`} />
                        <span className="font-semibold text-zinc-100 text-xs">
                          {isGenesis ? 'Genesis Block' : `Khối #${blk.height}`}
                        </span>
                      </div>
                      {isTampered ? (
                        <span className="text-[10px] text-rose-400 font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/40">
                          TAMPERED
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {blk.timestamp}
                        </span>
                      )}
                    </div>

                    {/* Metadata fields */}
                    <div className="space-y-1.5 text-[11px] font-sans">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>{language === 'vi' ? 'Thợ đào:' : 'Miner:'}</span>
                        <span className="font-medium text-zinc-200">{blk.minerName}</span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400">
                        <span>{language === 'vi' ? 'Phần thưởng:' : 'Reward:'}</span>
                        <span className="font-semibold font-mono text-[#F6C453]">+{blk.rewardBTC} BTC</span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Nonce:</span>
                        <span className="font-mono text-zinc-300">{blk.nonce.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400">
                        <span>{language === 'vi' ? 'Giao dịch:' : 'Transactions:'}</span>
                        <span className={isTampered ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-medium'}>
                          {blk.transactions.length} {language === 'vi' ? 'xác nhận' : 'confirmed'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hash snippet */}
                  <div className="pt-2.5 mt-3 border-t border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block mb-1">Hash:</span>
                    <span
                      className={`text-[10px] font-mono truncate block px-2 py-1 rounded border ${
                        isTampered
                          ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                          : 'bg-[#060911] border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {blk.hash.substring(0, 12)}...{blk.hash.substring(56)}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected Block Detailed Inspection */}
        {selectedBlock && (
          <div className="p-4 sm:p-5 rounded-xl bg-[#080c16] border border-zinc-800 space-y-4 font-sans text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-zinc-100">
                  {language === 'vi' ? `Chi tiết Khối #${selectedBlock.height}` : `Block Details: #${selectedBlock.height}`}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {selectedBlock.timestamp}
                </span>
                {selectedBlock.isTampered && (
                  <span className="text-xs font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40">
                    {language === 'vi' ? 'Dữ liệu đã bị can thiệp' : 'Data Tampered'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedBlock(null)}
                className="p-1 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">PREVIOUS HASH</span>
                <div className="bg-[#060911] p-2.5 rounded-lg border border-zinc-800 text-zinc-300 font-mono break-all flex items-center justify-between gap-2">
                  <span className="text-[11px]">{selectedBlock.previousHash}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedBlock.previousHash)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 shrink-0"
                    title="Sao chép"
                  >
                    {copiedHash === selectedBlock.previousHash ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">BLOCK HASH</span>
                <div
                  className={`p-2.5 rounded-lg border font-mono break-all flex items-center justify-between gap-2 ${
                    selectedBlock.isTampered
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : 'bg-[#060911] border-zinc-800 text-emerald-400'
                  }`}
                >
                  <span className="text-[11px]">{selectedBlock.hash}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedBlock.hash)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 shrink-0"
                    title="Sao chép"
                  >
                    {copiedHash === selectedBlock.hash ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">MERKLE ROOT</span>
                <div className="bg-[#060911] p-2.5 rounded-lg border border-zinc-800 text-zinc-300 font-mono break-all text-[11px]">
                  {selectedBlock.merkleRoot}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">THÔNG SỐ KHAI THÁC</span>
                <div className="bg-[#060911] p-2.5 rounded-lg border border-zinc-800 space-y-1 text-xs">
                  <div className="text-zinc-300">Thợ đào: <span className="text-zinc-100 font-medium">{selectedBlock.minerName}</span></div>
                  <div className="text-zinc-300">Nonce: <span className="text-zinc-100 font-mono">{selectedBlock.nonce.toLocaleString()}</span></div>
                  <div className="text-zinc-300">Phần thưởng: <span className="text-[#F6C453] font-mono font-medium">+{selectedBlock.rewardBTC} BTC</span></div>
                </div>
              </div>
            </div>

            {/* Transactions in this block */}
            <div className="pt-3 border-t border-zinc-800">
              <span className="text-xs font-medium text-zinc-300 block mb-2">
                {language === 'vi' ? 'Giao dịch xác nhận trong khối:' : 'Confirmed transactions in this block:'}
              </span>
              {selectedBlock.transactions.length === 0 ? (
                <div className="text-xs text-zinc-500 italic">
                  {language === 'vi' ? 'Khối Genesis hoặc không có giao dịch chuyển tiền.' : 'Genesis block or no user transactions.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedBlock.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-lg bg-[#060911] border border-zinc-800 text-xs flex items-center justify-between"
                    >
                      <span className="text-zinc-200">{tx.sender} → {tx.recipient}</span>
                      <span className="font-mono font-semibold text-[#F6C453]">{tx.amount} BTC</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
