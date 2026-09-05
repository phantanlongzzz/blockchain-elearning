/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Boxes, 
  Hash, 
  Cpu, 
  RotateCcw, 
  Copy, 
  Check, 
  Layers, 
  ShieldCheck, 
  Binary,
  Pencil,
  AlertTriangle,
  FileCode,
  X
} from 'lucide-react';
import { hashSha256 } from '../../utils/sha256';
import { useLanguage } from '../../i18n/LanguageContext';

interface TransactionItem {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  originalAmount: number;
  hash: string;
  originalHash: string;
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  { id: 'tx0', sender: 'Coinbase (Reward)', receiver: 'Miner_Node_1', amount: 3.125, originalAmount: 3.125, hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0', originalHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0' },
  { id: 'tx1', sender: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', receiver: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT', amount: 0.850, originalAmount: 0.850, hash: 'f0e1d2c3b4a5968778695a4b3c2d1e0f123456789abcdef0123456789abcdef0', originalHash: 'f0e1d2c3b4a5968778695a4b3c2d1e0f123456789abcdef0123456789abcdef0' },
  { id: 'tx2', sender: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', receiver: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', amount: 1.420, originalAmount: 1.420, hash: '9876543210abcdef0123456789abcdef0123456789abcdef0123456789abcdef', originalHash: '9876543210abcdef0123456789abcdef0123456789abcdef0123456789abcdef' },
  { id: 'tx3', sender: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', receiver: '1Q2TWHE3GMdB6BZKafqwxxiWAWgYqhedqu', amount: 0.500, originalAmount: 0.500, hash: '456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123', originalHash: '456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123' },
];

export const InteractiveBlockInspector: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [nonce, setNonce] = useState<number>(21417);
  const [blockHeight] = useState<number>(840291);
  const [prevHash] = useState<string>('000000000000000000021a4f9b87c12d45e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0');
  const [isMining, setIsMining] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'header' | 'merkle' | 'bytestream'>('header');
  const [tamperedTxIndex, setTamperedTxIndex] = useState<number | null>(null);
  const [calculatedBlockHash, setCalculatedBlockHash] = useState<string>('000000a4f9e1d82c7b30f4e95126830a1c4b7e9f0d2a5c8e1b3d6f9a0c2e4b7a');

  // Modal State
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [selectedTxIndex, setSelectedTxIndex] = useState<number | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [editAmount, setEditAmount] = useState<number>(0);

  // Sample transactions in this block
  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS);

  // Compute Merkle Root
  const merkleRoot = useMemo(() => {
    const h0 = transactions[0].hash.slice(0, 16);
    const h1 = transactions[1].hash.slice(0, 16);
    const h2 = transactions[2].hash.slice(0, 16);
    const h3 = transactions[3].hash.slice(0, 16);
    return `d8e3b52a${h0}${h1}${h2}${h3}`.slice(0, 64);
  }, [transactions]);

  // Recompute block hash when nonce or merkle root changes
  const updateHash = useCallback(async (currentNonce: number, mRoot: string) => {
    const rawHeader = `${blockHeight}:${prevHash.slice(0, 16)}:${mRoot.slice(0, 16)}:${currentNonce}:0x20000000`;
    const res = await hashSha256(rawHeader);
    setCalculatedBlockHash(res.hex);
  }, [blockHeight, prevHash]);

  useEffect(() => {
    updateHash(nonce, merkleRoot);
  }, [nonce, merkleRoot, updateHash]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleMineStep = () => {
    setIsMining(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setNonce((prev) => prev + Math.floor(Math.random() * 7) + 1);
      if (step >= 8) {
        clearInterval(interval);
        setIsMining(false);
      }
    }, 60);
  };

  const handleOpenTxModal = (index: number) => {
    const tx = transactions[index];
    setSelectedTx(tx);
    setSelectedTxIndex(index);
    setEditAmount(tx.amount);
    setIsTxModalOpen(true);
  };

  const handleCloseTxModal = () => {
    setIsTxModalOpen(false);
    setSelectedTx(null);
    setSelectedTxIndex(null);
  };

  const handleApplyTamper = () => {
    if (selectedTxIndex === null || selectedTx === null) return;
    const targetIdx = selectedTxIndex;
    const numAmount = Math.max(0, Number(editAmount) || 0);

    setTransactions((prev) => {
      return prev.map((tx, idx) => {
        if (idx === targetIdx) {
          const isChanged = Math.abs(numAmount - tx.originalAmount) > 0.000001;
          return {
            ...tx,
            amount: numAmount,
            hash: isChanged ? ('deadbeef' + tx.originalHash.slice(8)) : tx.originalHash,
          };
        }
        return { ...tx };
      });
    });

    const isChanged = Math.abs(numAmount - transactions[targetIdx].originalAmount) > 0.000001;
    if (isChanged) {
      setTamperedTxIndex(targetIdx);
    } else {
      if (tamperedTxIndex === targetIdx) {
        setTamperedTxIndex(null);
      }
    }

    handleCloseTxModal();
  };

  const handleRevertTamper = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setTamperedTxIndex(null);
  };

  const rawHeaderBytes = useMemo(() => {
    const v = '00000020';
    const p = prevHash.slice(0, 32);
    const m = merkleRoot.slice(0, 32);
    const t = '65e4a890';
    const b = '1d00ffff';
    const n = nonce.toString(16).padStart(8, '0');
    return `${v} ${p.slice(0, 16)} ${p.slice(16, 32)} ${m.slice(0, 16)} ${m.slice(16, 32)} ${t} ${b} ${n}`;
  }, [prevHash, merkleRoot, nonce]);

  const renderHighlightedHash = (hash: string) => {
    const match = hash.match(/^(0+)(.*)$/);
    if (match) {
      return (
        <>
          <span className="text-cyan-400/70 font-semibold">{match[1]}</span>
          <span>{match[2]}</span>
        </>
      );
    }
    return hash;
  };

  return (
    <div className="relative group w-full rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 text-slate-200 transition-all duration-300 hover:border-cyan-500/30">
      {/* Subtle background glow element strictly inside the card */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Top Header Row */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono font-bold text-sm text-slate-100">
              {isVi ? `Khối #${blockHeight}` : `Block #${blockHeight}`}
            </div>
          </div>
        </div>

        {/* Action Button: Đào khối */}
        <button
          onClick={handleMineStep}
          disabled={isMining}
          className="bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs px-3 py-1.5 rounded-lg font-sans font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Cpu className={`w-3.5 h-3.5 text-cyan-400 ${isMining ? 'animate-spin' : ''}`} />
          <span>{isMining ? (isVi ? 'Đang đào...' : 'Mining...') : (isVi ? 'Đào khối' : 'Mine Block')}</span>
        </button>
      </div>

      {/* 2. Navigation Sub-tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-lg border border-white/[0.06] mb-4">
        <button
          onClick={() => setActiveTab('header')}
          className={`py-1.5 text-xs font-sans font-medium rounded transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'header'
              ? 'bg-white/[0.08] text-white border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isVi ? 'Tiêu đề khối' : 'Block Header'}</span>
        </button>
        <button
          onClick={() => setActiveTab('merkle')}
          className={`py-1.5 text-xs font-sans font-medium rounded transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'merkle'
              ? 'bg-white/[0.08] text-white border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>{isVi ? 'Cây Merkle' : 'Merkle Tree'}</span>
        </button>
        <button
          onClick={() => setActiveTab('bytestream')}
          className={`py-1.5 text-xs font-sans font-medium rounded transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'bytestream'
              ? 'bg-white/[0.08] text-white border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Binary className="w-3.5 h-3.5 text-teal-400" />
          <span>{isVi ? 'Luồng 80-Byte' : '80-Byte Stream'}</span>
        </button>
      </div>

      {/* 3. Tab Content 1: Block Header Inspector */}
      {activeTab === 'header' && (
        <div className="space-y-3 font-sans text-xs">
          {/* Previous Block Hash */}
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-slate-400">
                <Hash className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{isVi ? 'Mã băm trước' : 'Previous Hash'}</span>
              </span>
              <button
                onClick={() => handleCopy(prevHash, 'prev')}
                className="text-slate-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                title={isVi ? 'Sao chép' : 'Copy'}
              >
                {copiedKey === 'prev' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />}
              </button>
            </div>
            <div className="bg-black/40 border border-white/[0.06] rounded-lg px-3 py-2 font-mono text-[11px] leading-relaxed break-all text-slate-300 select-all">
              {renderHighlightedHash(prevHash)}
            </div>
          </div>

          {/* Merkle Root Hash */}
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-slate-400">
                <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{isVi ? 'Gốc Merkle' : 'Merkle Root'}</span>
              </span>
              <button
                onClick={() => handleCopy(merkleRoot, 'merkle')}
                className="text-slate-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                title={isVi ? 'Sao chép' : 'Copy'}
              >
                {copiedKey === 'merkle' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />}
              </button>
            </div>
            <div className={`bg-black/40 border rounded-lg px-3 py-2 font-mono text-[11px] leading-relaxed break-all select-all transition-colors ${
              tamperedTxIndex !== null
                ? 'bg-rose-950/30 text-rose-300 border-rose-500/40'
                : 'border-white/[0.06] text-slate-300'
            }`}>
              {merkleRoot}
            </div>
          </div>

          {/* 4. Nonce & Timestamp & Version Grid (3 Columns) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">Nonce</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-sm text-cyan-400 tabular-nums">{nonce}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setNonce((n) => Math.max(0, n - 1))}
                    className="w-4 h-4 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[10px] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-white/[0.06]"
                    title="Decrease Nonce"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setNonce((n) => n + 1)}
                    className="w-4 h-4 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[10px] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-white/[0.06]"
                    title="Increase Nonce"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
                {isVi ? 'Thời gian' : 'Time'}
              </span>
              <span className="font-mono text-xs text-slate-200 tabular-nums block mt-1">
                10:14:54 UTC
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
                {isVi ? 'Phiên bản' : 'Version'}
              </span>
              <span className="font-mono text-xs text-slate-300 block mt-1">
                0x20000000
              </span>
            </div>
          </div>

          {/* Computed Hash */}
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{isVi ? 'Mã băm khối' : 'Block Hash'}</span>
              </span>
              <button
                onClick={() => handleCopy(calculatedBlockHash, 'computed')}
                className="text-slate-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                title={isVi ? 'Sao chép' : 'Copy'}
              >
                {copiedKey === 'computed' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />}
              </button>
            </div>
            <div className="bg-black/40 border border-white/[0.06] rounded-lg px-3 py-2 font-mono text-[11px] leading-relaxed break-all text-slate-300 select-all">
              {renderHighlightedHash(calculatedBlockHash)}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Merkle Tree Inspector */}
      {activeTab === 'merkle' && (
        <div className="space-y-3 font-sans text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{isVi ? 'Nhấp vào giao dịch để mô phỏng phát hiện gian lận:' : 'Click on any transaction to simulate tamper detection:'}</span>
            {tamperedTxIndex !== null && (
              <button
                onClick={handleRevertTamper}
                className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isVi ? 'Khôi phục' : 'Revert Tamper'}</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {transactions.map((tx, idx) => {
              const isTampered = tamperedTxIndex === idx;

              if (isTampered) {
                return (
                  <div
                    key={tx.id}
                    onClick={() => handleOpenTxModal(idx)}
                    title={isVi ? 'Nhấp để kiểm tra và can thiệp giao dịch' : 'Click to inspect and tamper transaction'}
                    className="flex items-center justify-between p-3 rounded-xl border border-rose-500/80 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all cursor-pointer group"
                  >
                    {idx === 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold text-rose-400 bg-rose-500/20 border border-rose-500/40">
                          T0
                        </span>
                        <span className="font-sans text-xs text-rose-200 font-medium">
                          {isVi ? 'Thưởng đào khối (Coinbase)' : 'Coinbase Block Reward'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold text-rose-400 bg-rose-500/20 border border-rose-500/40">
                          T{idx}
                        </span>
                        <span className="font-mono text-xs text-rose-200 ml-2.5">
                          {tx.sender.slice(0, 6)}...{tx.receiver.slice(-6)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-xs text-rose-400 animate-pulse">
                        {tx.amount.toFixed(3)} BTC
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-sans font-bold text-rose-300 bg-rose-500/20 border border-rose-500/40">
                        {isVi ? 'Đã sửa' : 'Edited'}
                      </span>
                    </div>
                  </div>
                );
              }

              if (idx === 0) {
                return (
                  <div
                    key={tx.id}
                    onClick={() => handleOpenTxModal(idx)}
                    title={isVi ? 'Nhấp để kiểm tra và can thiệp giao dịch' : 'Click to inspect and tamper transaction'}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-400/50 hover:bg-cyan-500/[0.04] hover:shadow-[0_0_15px_rgba(0,210,255,0.15)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30">
                        T0
                      </span>
                      <span className="font-sans text-xs text-slate-300 font-medium">
                        {isVi ? 'Thưởng đào khối (Coinbase)' : 'Coinbase Block Reward'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                      {tx.amount.toFixed(3)} BTC
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={tx.id}
                  onClick={() => handleOpenTxModal(idx)}
                  title={isVi ? 'Nhấp để kiểm tra và can thiệp giao dịch' : 'Click to inspect and tamper transaction'}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-400/50 hover:bg-cyan-500/[0.04] hover:shadow-[0_0_15px_rgba(0,210,255,0.15)] transition-all cursor-pointer group"
                >
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30">
                      T{idx}
                    </span>
                    <span className="font-mono text-xs text-slate-300 ml-2.5">
                      {tx.sender.slice(0, 6)}...{tx.receiver.slice(-6)}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                    {tx.amount.toFixed(3)} BTC
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 3: 80-Byte Stream Serialization */}
      {activeTab === 'bytestream' && (
        <div className="space-y-2.5 font-sans text-xs">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>{isVi ? 'Chuỗi nhị phân chuẩn hóa 80-Byte Header Bitcoin:' : 'Canonical Bitcoin 80-Byte Header Serialization:'}</span>
            <span className="text-cyan-400 font-mono text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              80 BYTES / 160 HEX
            </span>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-[11px] lg:text-xs text-slate-300 leading-relaxed break-all select-all font-mono tracking-normal">
            {rawHeaderBytes}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-sans pt-1">
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Version</span>
              <span className="font-mono text-slate-200">4 Bytes (0x20000000)</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Prev Hash</span>
              <span className="font-mono text-slate-200">32 Bytes (LE)</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Merkle Root</span>
              <span className="font-mono text-slate-200">32 Bytes (LE)</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Nonce + Time</span>
              <span className="font-mono text-slate-200">12 Bytes</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Footer trạng thái mạng (Network Status Bar) */}
      {tamperedTxIndex !== null ? (
        <div className="flex items-center gap-2 text-xs font-mono text-rose-400 pt-2 border-t border-rose-500/20 mt-4">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-[0_0_10px_rgba(244,63,94,1)]" />
          <span className="font-semibold">{isVi ? 'Mất đồng thuận · Khối vô hiệu' : 'Consensus Broken · Invalid Block'}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-mono text-success pt-2 border-t border-white/[0.06] mt-4">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span>{isVi ? 'Mạng đồng thuận' : 'Network Consensus'}</span>
        </div>
      )}

      {/* Transaction Inspector Modal (Glassmorphism Popup) */}
      {isTxModalOpen && selectedTx && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={handleCloseTxModal}
        >
          <div 
            className="max-w-md w-full bg-[#0B101E]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative font-sans text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="font-sans font-semibold text-sm text-white">
                  {isVi ? `Chi tiết giao dịch #${selectedTxIndex ?? 0}` : `Transaction details #${selectedTxIndex ?? 0}`}
                </span>
              </div>
              <button 
                onClick={handleCloseTxModal}
                className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3.5 mt-3.5">
              {/* TxID */}
              <div>
                <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-slate-400 mb-1 block">
                  {isVi ? 'Mã giao dịch' : 'Transaction ID'}
                </span>
                <div className="font-mono text-[11px] text-slate-300 bg-black/50 border border-white/[0.06] rounded-lg p-2 break-all select-all">
                  {selectedTx.hash}
                </div>
              </div>

              {/* Sender & Receiver */}
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-slate-400 mb-1 block">
                    {isVi ? 'Người gửi' : 'Sender'}
                  </span>
                  <div className="font-mono text-xs text-slate-300 bg-black/40 border border-white/[0.05] p-2 rounded-lg break-all">
                    {selectedTx.sender}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-slate-400 mb-1 block">
                    {isVi ? 'Người nhận' : 'Recipient'}
                  </span>
                  <div className="font-mono text-xs text-slate-300 bg-black/40 border border-white/[0.05] p-2 rounded-lg break-all">
                    {selectedTx.receiver}
                  </div>
                </div>
              </div>

              {/* Amount BTC - Tamper Zone */}
              <div>
                <label className="text-xs font-sans font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isVi ? 'Giá trị giao dịch' : 'Transaction Value'}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full bg-black/60 border border-amber-500/40 focus:border-amber-400 rounded-lg px-3 py-2 text-sm font-mono text-amber-300 font-bold outline-none pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                    BTC
                  </span>
                </div>

                {/* Quick Edit Buttons */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditAmount((prev) => +(Number(prev) + 1.0).toFixed(3))}
                    className="text-xs font-mono px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    +1.0 BTC
                  </button>
                  {editAmount !== selectedTx.originalAmount && (
                    <button
                      type="button"
                      onClick={() => setEditAmount(selectedTx.originalAmount)}
                      className="text-xs font-sans px-2.5 py-1 rounded bg-white/[0.02] border border-white/[0.06] hover:text-white text-slate-400 transition-all cursor-pointer ml-auto flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isVi ? 'Khôi phục gốc' : 'Reset'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08] mt-4">
              <button
                type="button"
                onClick={handleCloseTxModal}
                className="px-3.5 py-1.5 rounded-lg text-xs font-sans text-slate-300 hover:bg-white/[0.05] border border-white/[0.08] cursor-pointer transition-all"
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>
              <button
                type="button"
                onClick={handleApplyTamper}
                className="px-4 py-2 rounded-lg text-xs font-sans font-medium text-rose-200 bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)] transition-all cursor-pointer"
              >
                {isVi ? 'Lưu thay đổi' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
