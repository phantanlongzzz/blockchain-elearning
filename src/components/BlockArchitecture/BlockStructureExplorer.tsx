import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowDown,
  Clock,
  KeyRound,
  GitFork,
  Zap,
  Info,
  Link2,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Hash,
  ShieldCheck,
  RefreshCw,
  Code2,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { fastSha256Hex } from '../../utils/sha256';

interface BlockStructureExplorerProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
}

export type ActiveField =
  | 'none'
  | 'prevHash'
  | 'timestamp'
  | 'merkleRoot'
  | 'nonce'
  | 'body'
  | 'headerHash';

export const BlockStructureExplorer: React.FC<BlockStructureExplorerProps> = ({
  onInteracted,
  onNextStage,
}) => {
  const { strings, language } = useLanguage();
  const [activeField, setActiveField] = useState<ActiveField>('prevHash');
  const [demoTimestamp, setDemoTimestamp] = useState('1715428800'); // Sample UNIX timestamp
  const [demoNonce, setDemoNonce] = useState(48291);
  const [computedBlockHash, setComputedBlockHash] = useState('');

  const PREV_BLOCK_HASH = '0000a3f9e81b2c4d6e8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d';
  const MERKLE_ROOT = '8f4c2e1a9b7d5f3a1c8e2d4b6f0a9c8e7d6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f';

  const TRANSACTIONS = [
    { id: 'TX-01', from: 'Alice', to: 'Bob', amount: 5.0, unit: 'BTC' },
    { id: 'TX-02', from: 'Bob', to: 'Charlie', amount: 2.5, unit: 'BTC' },
    { id: 'TX-03', from: 'David', to: 'Alice', amount: 10.0, unit: 'BTC' },
    { id: 'TX-04', from: 'Charlie', to: 'Eve', amount: 1.2, unit: 'BTC' },
  ];

  // Recompute block header hash whenever timestamp or nonce changes
  useEffect(() => {
    const compute = async () => {
      const headerRaw = `42|${PREV_BLOCK_HASH}|${MERKLE_ROOT}|${demoTimestamp}|${demoNonce}`;
      const hash = await fastSha256Hex(headerRaw);
      setComputedBlockHash(hash);
    };
    compute();
  }, [demoTimestamp, demoNonce]);

  const handleSelectField = (field: ActiveField) => {
    setActiveField(field);
    if (onInteracted) onInteracted();
  };

  return (
    <div className="space-y-6">
      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Interactive Block (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Previous Block Reference (Block #41) */}
          <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 text-slate-400 text-xs flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-600"></span>
              <span className="text-slate-300 font-bold">
                {language === 'vi' ? 'BLOCK #41 (Khối trước)' : 'BLOCK #41 (Previous block)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Hash:</span>
              <span className="text-emerald-400 truncate max-w-[180px] sm:max-w-[240px]">
                {PREV_BLOCK_HASH.slice(0, 16)}...{PREV_BLOCK_HASH.slice(-8)}
              </span>
            </div>
          </div>

          {/* Cryptographic Link Pointer */}
          <div className="flex justify-center items-center gap-1.5 text-emerald-400/80 font-mono text-xs py-0.5">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>
              {language === 'vi' ? 'Liên kết hash' : 'Hash pointer link'}
            </span>
            <ArrowDown className="w-3.5 h-3.5" />
          </div>

          {/* Centerpiece: Detailed Interactive Block #42 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0b101b] border border-emerald-500/30 shadow-xl space-y-5 relative">
            {/* Block Banner Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono">
                  #42
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                    <span>BLOCK #42</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {language === 'vi' ? '4 giao dịch' : '4 transactions'}
                  </p>
                </div>
              </div>

              {/* Block SHA-256 Calculated Hash Button */}
              <button
                type="button"
                onClick={() => handleSelectField('headerHash')}
                className={`text-right p-2 rounded-lg border transition-all cursor-pointer ${
                  activeField === 'headerHash'
                    ? 'bg-emerald-500/20 border-emerald-400 text-white'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  {language === 'vi' ? 'Block Hash' : 'Block Hash'}
                </div>
                <div className="font-mono text-xs text-amber-300 font-semibold truncate max-w-[160px] sm:max-w-[200px]">
                  {computedBlockHash.slice(0, 12)}...{computedBlockHash.slice(-6)}
                </div>
              </button>
            </div>

            {/* LAYER 1: BLOCK HEADER */}
            <div className="p-4 rounded-xl bg-[#070a12] border border-emerald-500/30 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  Header (80 bytes)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1.1 Previous Hash */}
                <button
                  type="button"
                  onClick={() => handleSelectField('prevHash')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeField === 'prevHash'
                      ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Link2 className="w-3 h-3" />
                      Previous Hash
                    </span>
                    <span className="text-[10px] text-slate-500">32B</span>
                  </div>
                  <div className="font-mono text-xs text-slate-300 truncate">
                    {PREV_BLOCK_HASH.slice(0, 18)}...
                  </div>
                </button>

                {/* 1.2 Timestamp */}
                <button
                  type="button"
                  onClick={() => handleSelectField('timestamp')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeField === 'timestamp'
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Timestamp
                    </span>
                    <span className="text-[10px] text-slate-500">4B</span>
                  </div>
                  <div className="font-mono text-xs text-amber-200">
                    {demoTimestamp} (12:00:00 UTC)
                  </div>
                </button>

                {/* 1.3 Merkle Root */}
                <button
                  type="button"
                  onClick={() => handleSelectField('merkleRoot')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeField === 'merkleRoot'
                      ? 'bg-indigo-500/15 border-indigo-400 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-indigo-400 font-semibold flex items-center gap-1.5">
                      <GitFork className="w-3 h-3" />
                      Merkle Root
                    </span>
                    <span className="text-[10px] text-slate-500">32B</span>
                  </div>
                  <div className="font-mono text-xs text-indigo-200 truncate">
                    {MERKLE_ROOT.slice(0, 18)}...
                  </div>
                </button>

                {/* 1.4 Nonce */}
                <button
                  type="button"
                  onClick={() => handleSelectField('nonce')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeField === 'nonce'
                      ? 'bg-purple-500/15 border-purple-400 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-purple-400 font-semibold flex items-center gap-1.5">
                      <Zap className="w-3 h-3" />
                      Nonce
                    </span>
                    <span className="text-[10px] text-slate-500">4B</span>
                  </div>
                  <div className="font-mono text-xs text-purple-200">
                    {demoNonce.toLocaleString()}
                  </div>
                </button>
              </div>
            </div>

            {/* LAYER 2: BLOCK BODY */}
            <div className="p-4 rounded-xl bg-[#070a12] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleSelectField('body')}
                  className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 hover:underline cursor-pointer"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  Body ({TRANSACTIONS.length} {language === 'vi' ? 'giao dịch' : 'transactions'})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRANSACTIONS.map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => handleSelectField('body')}
                    className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all cursor-pointer ${
                      activeField === 'body'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-200'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-emerald-400">
                        {tx.id}
                      </span>
                      <span className="text-amber-300 font-bold">
                        {tx.amount} {tx.unit}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 truncate">
                      {tx.from} <span className="text-slate-500">→</span> {tx.to}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Component Dissection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#090d16] border border-slate-800 space-y-4 shadow-xl">
            {/* Content for active component */}
            {activeField === 'prevHash' && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>PREVIOUS HASH</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {language === 'vi'
                    ? 'Block #42 lưu hash của Block #41 để liên kết chuỗi.'
                    : 'Block #42 stores Block #41’s hash to preserve chain continuity.'}
                </p>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  <p className="text-slate-400 text-xs leading-normal">
                    {language === 'vi'
                      ? 'Nếu Block #41 bị thay đổi, hash của nó đổi theo, làm lệch Previous Hash của Block #42 và làm đứt chuỗi ngay lập tức.'
                      : 'If Block #41 is altered, its hash changes, causing a mismatch in Block #42 and breaking the chain.'}
                  </p>
                </div>
              </div>
            )}

            {activeField === 'timestamp' && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>TIMESTAMP</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {language === 'vi'
                    ? 'Ghi nhận thời điểm khối được đóng gói (UNIX epoch seconds).'
                    : 'Records when the block was packaged in UNIX epoch seconds.'}
                </p>
                {/* Mini Interactive Experiment */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-bold text-amber-300 flex items-center justify-between font-mono">
                    <span>{language === 'vi' ? 'Thử đổi Timestamp:' : 'Change Timestamp:'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDemoTimestamp((prev) => (parseInt(prev) + 600).toString())}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold cursor-pointer"
                    >
                      +10m (+600s)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoTimestamp('1715428800')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
                    >
                      {language === 'vi' ? 'Khôi phục' : 'Reset'}
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 pt-1">
                    {language === 'vi'
                      ? 'Thay đổi thời gian 1 giây sẽ tạo ra một Block Hash hoàn toàn mới.'
                      : 'Changing time by 1 second mutates the entire Block Hash.'}
                  </div>
                </div>
              </div>
            )}

            {activeField === 'merkleRoot' && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-bold">
                  <GitFork className="w-3.5 h-3.5" />
                  <span>MERKLE ROOT</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {language === 'vi'
                    ? 'Bản băm 32-byte tóm lược toàn bộ giao dịch trong Body.'
                    : 'A 32-byte cryptographic summary of all transactions in the Body.'}
                </p>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-xs text-slate-300">
                  <p className="text-slate-400 text-xs leading-normal">
                    {language === 'vi'
                      ? 'Header chỉ cần lưu Merkle Root thay vì toàn bộ dữ liệu giao dịch, giúp tiết kiệm bộ nhớ.'
                      : 'Header only stores the Merkle Root instead of full raw transactions, saving space.'}
                  </p>
                </div>
              </div>
            )}

            {activeField === 'nonce' && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>NONCE</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {language === 'vi'
                    ? 'Con số thợ đào liên tục thay đổi để tìm hash thỏa mãn độ khó.'
                    : 'Integer iterated during mining to find a hash meeting difficulty target.'}
                </p>
                {/* Mini Interactive Nonce Stepper */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-2">
                  <div className="text-xs font-bold text-purple-300 flex items-center justify-between font-mono">
                    <span>{language === 'vi' ? 'Tăng Nonce:' : 'Increment Nonce:'}</span>
                    <span className="text-xs text-purple-200">{demoNonce}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDemoNonce((prev) => prev + 1)}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold cursor-pointer"
                    >
                      +1 Nonce
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoNonce((prev) => prev + 1000)}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold cursor-pointer"
                    >
                      +1000 Nonce
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeField === 'body' && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                  <Boxes className="w-3.5 h-3.5" />
                  <span>BLOCK BODY</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {language === 'vi'
                    ? 'Chứa danh sách giao dịch thô đã được xác thực chữ ký số và số dư.'
                    : 'Holds all raw transactions validated by digital signatures and balance checks.'}
                </p>
              </div>
            )}

            {activeField === 'headerHash' && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                  <Hash className="w-3.5 h-3.5" />
                  <span>BLOCK HASH</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {language === 'vi'
                    ? 'Mã băm của khối được tính bằng cách băm 80 bytes của Block Header.'
                    : 'Block hash is computed exclusively by hashing the 80-byte Block Header.'}
                </p>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 font-mono text-xs text-slate-300">
                  <div className="text-amber-300 break-all text-[11px]">
                    SHA-256(PrevHash + MerkleRoot + Timestamp + Nonce)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Bridge Links */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-mono">
              {language === 'vi' ? 'Tiếp theo:' : 'Next:'}
            </span>
            <button
              type="button"
              onClick={onNextStage}
              className="text-emerald-400 hover:text-emerald-300 font-bold font-mono inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'vi' ? 'Chữ Ký Số' : 'Digital Signature'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
