import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Layers,
  ArrowRight,
  ArrowDown,
  Clock,
  GitFork,
  Zap,
  Link2,
  Hash,
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
  const { language } = useLanguage();
  const isVi = language === 'vi';
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
    <div className="space-y-6 font-sans">
      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Interactive Block (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Previous Block Reference (Block #41) */}
          <div className="p-3.5 rounded-xl bg-[#0B0E12] border border-[#1C2430] text-[#A5AFBF] text-xs flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-600"></span>
              <span className="text-slate-300 font-bold font-sans">
                {isVi ? 'Block #41 (Khối trước)' : 'Block #41 (Previous block)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Hash:</span>
              <span className="text-slate-200 hover:text-text-primary transition-colors truncate max-w-[160px] sm:max-w-[220px]">
                {PREV_BLOCK_HASH.slice(0, 14)}...{PREV_BLOCK_HASH.slice(-8)}
              </span>
            </div>
          </div>

          {/* Cryptographic Link Pointer */}
          <div className="flex justify-center items-center gap-2 text-slate-500 font-mono text-xs py-1">
            <ArrowDown className="w-3.5 h-3.5" />
            <span className="text-[#8B949E] text-[11px] font-sans">
              {isVi ? 'Liên kết Previous Hash Pointer' : 'Previous Hash Pointer Link'}
            </span>
            <ArrowDown className="w-3.5 h-3.5" />
          </div>

          {/* Centerpiece: Detailed Interactive Block #42 */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#0B0E12] border border-[#1C2430] space-y-5">
            {/* Block Banner Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2430]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-border-primary flex items-center justify-center text-text-primary font-bold font-mono text-sm">
                  #42
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white font-sans">
                    Block #42
                  </h4>
                  <p className="text-xs text-[#A5AFBF] font-mono">
                    4 {isVi ? 'giao dịch' : 'transactions'}
                  </p>
                </div>
              </div>

              {/* Block SHA-256 Calculated Hash Button */}
              <button
                type="button"
                id="btn-select-header-hash"
                onClick={() => handleSelectField('headerHash')}
                className={`text-right p-2.5 rounded-lg border transition-all cursor-pointer group ${
                  activeField === 'headerHash'
                    ? 'bg-teach-1/10 border-teach-1/40 text-white ring-1 ring-teach-1/20'
                    : 'bg-[#10151D] border-[#1C2430] text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className={`text-[10px] font-mono font-semibold uppercase transition-colors ${
                  activeField === 'headerHash' ? 'text-teach-1' : 'text-[#8B949E] group-hover:text-teach-1'
                }`}>
                  Block Hash
                </div>
                <div className={`font-mono text-xs truncate max-w-[140px] sm:max-w-[190px] transition-colors ${
                  activeField === 'headerHash' ? 'text-white' : 'text-[#F1F5F9] group-hover:text-teach-1'
                }`}>
                  {computedBlockHash.slice(0, 10)}...{computedBlockHash.slice(-6)}
                </div>
              </button>
            </div>

            {/* LAYER 1: BLOCK HEADER */}
            <div className="p-4 rounded-lg bg-[#10151D] border border-[#1C2430] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  Header (80 bytes)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {isVi ? 'Dữ liệu băm khối' : 'Block digest input'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1.1 Previous Hash */}
                <button
                  type="button"
                  id="btn-select-prev-hash"
                  onClick={() => handleSelectField('prevHash')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer group ${
                    activeField === 'prevHash'
                      ? 'bg-teach-2/15 border-teach-2/40 text-white ring-1 ring-teach-2/20'
                      : 'bg-[#0B0E12] border-[#1C2430] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className={`font-medium flex items-center gap-1.5 transition-colors ${
                      activeField === 'prevHash' ? 'text-teach-2 font-semibold' : 'text-[#8B949E] group-hover:text-teach-2'
                    }`}>
                      <Link2 className={`w-3 h-3 ${activeField === 'prevHash' ? 'text-teach-2' : 'text-slate-400 group-hover:text-teach-2'}`} />
                      Previous Hash
                    </span>
                    <span className="text-[10px] text-slate-500">32B</span>
                  </div>
                  <div className="font-mono text-xs text-[#F1F5F9] truncate">
                    {PREV_BLOCK_HASH.slice(0, 16)}...
                  </div>
                </button>

                {/* 1.2 Timestamp */}
                <button
                  type="button"
                  id="btn-select-timestamp"
                  onClick={() => handleSelectField('timestamp')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer group ${
                    activeField === 'timestamp'
                      ? 'bg-teach-3/15 border-teach-3/40 text-white ring-1 ring-teach-3/20'
                      : 'bg-[#0B0E12] border-[#1C2430] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className={`font-medium flex items-center gap-1.5 transition-colors ${
                      activeField === 'timestamp' ? 'text-teach-3 font-semibold' : 'text-[#8B949E] group-hover:text-teach-3'
                    }`}>
                      <Clock className={`w-3 h-3 ${activeField === 'timestamp' ? 'text-teach-3' : 'text-slate-400 group-hover:text-teach-3'}`} />
                      Timestamp
                    </span>
                    <span className="text-[10px] text-slate-500">4B</span>
                  </div>
                  <div className="font-mono text-xs text-[#F1F5F9]">
                    {demoTimestamp} (12:00:00 UTC)
                  </div>
                </button>

                {/* 1.3 Merkle Root */}
                <button
                  type="button"
                  id="btn-select-merkle-root"
                  onClick={() => handleSelectField('merkleRoot')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer group ${
                    activeField === 'merkleRoot'
                      ? 'bg-teach-1/15 border-teach-1/40 text-white ring-1 ring-teach-1/20'
                      : 'bg-[#0B0E12] border-[#1C2430] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className={`font-medium flex items-center gap-1.5 transition-colors ${
                      activeField === 'merkleRoot' ? 'text-teach-1 font-semibold' : 'text-[#8B949E] group-hover:text-teach-1'
                    }`}>
                      <GitFork className={`w-3 h-3 ${activeField === 'merkleRoot' ? 'text-teach-1' : 'text-slate-400 group-hover:text-teach-1'}`} />
                      Merkle Root
                    </span>
                    <span className="text-[10px] text-slate-500">32B</span>
                  </div>
                  <div className="font-mono text-xs text-[#F1F5F9] truncate">
                    {MERKLE_ROOT.slice(0, 16)}...
                  </div>
                </button>

                {/* 1.4 Nonce */}
                <button
                  type="button"
                  id="btn-select-nonce"
                  onClick={() => handleSelectField('nonce')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer group ${
                    activeField === 'nonce'
                      ? 'bg-teach-2/15 border-teach-2/40 text-white ring-1 ring-teach-2/20'
                      : 'bg-[#0B0E12] border-[#1C2430] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className={`font-medium flex items-center gap-1.5 transition-colors ${
                      activeField === 'nonce' ? 'text-teach-2 font-semibold' : 'text-[#8B949E] group-hover:text-teach-2'
                    }`}>
                      <Zap className={`w-3 h-3 ${activeField === 'nonce' ? 'text-teach-2' : 'text-slate-400 group-hover:text-teach-2'}`} />
                      Nonce
                    </span>
                    <span className="text-[10px] text-slate-500">4B</span>
                  </div>
                  <div className="font-mono text-xs text-[#F1F5F9]">
                    {demoNonce.toLocaleString()}
                  </div>
                </button>
              </div>
            </div>

            {/* LAYER 2: BLOCK BODY */}
            <div className="p-4 rounded-lg bg-[#10151D] border border-[#1C2430] space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleSelectField('body')}
                  className="text-xs font-mono font-bold text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2 hover:text-teach-1 cursor-pointer transition-colors"
                >
                  <Boxes className="w-3.5 h-3.5 text-slate-400" />
                  Body ({TRANSACTIONS.length} {isVi ? 'giao dịch' : 'transactions'})
                </button>
                <span className="text-[11px] text-slate-500 font-mono">
                  Payload
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRANSACTIONS.map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => handleSelectField('body')}
                    className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all cursor-pointer group ${
                      activeField === 'body'
                        ? 'bg-teach-5/10 border-teach-5/40 text-slate-200'
                        : 'bg-[#0B0E12] border-[#1C2430] text-[#8B949E] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-[#8B949E] group-hover:text-slate-300 transition-colors">
                        {tx.id}
                      </span>
                      <span className="text-[#F1F5F9] font-mono font-semibold">
                        {tx.amount} {tx.unit}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 truncate font-mono">
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
          <div className="p-5 sm:p-6 rounded-xl bg-[#0B0E12] border border-[#1C2430] space-y-4">
            {/* Content for active component */}
            {activeField === 'prevHash' && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teach-2/15 text-teach-2 border border-teach-2/30 text-xs font-mono font-bold">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>PREVIOUS HASH</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {isVi
                    ? 'Block #42 lưu hash của Block #41 để liên kết chuỗi.'
                    : 'Block #42 stores Block #41’s hash to preserve chain continuity.'}
                </p>
                <div className="p-3.5 rounded-lg bg-[#10151D] border border-[#1C2430] text-xs text-[#A5AFBF] leading-relaxed">
                  {isVi
                    ? 'Nếu Block #41 bị thay đổi, hash của nó đổi theo, làm lệch Previous Hash của Block #42 và làm đứt chuỗi ngay lập tức.'
                    : 'If Block #41 is altered, its hash changes, causing a mismatch in Block #42 and breaking the chain.'}
                </div>
              </div>
            )}

            {activeField === 'timestamp' && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teach-3/15 text-teach-3 border border-teach-3/30 text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>TIMESTAMP</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {isVi
                    ? 'Ghi nhận thời điểm khối được đóng gói (UNIX epoch seconds).'
                    : 'Records when the block was packaged in UNIX epoch seconds.'}
                </p>
                {/* Mini Interactive Experiment */}
                <div className="p-3.5 rounded-lg bg-[#10151D] border border-[#1C2430] space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between font-mono">
                    <span>{isVi ? 'Thử đổi Timestamp:' : 'Change Timestamp:'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDemoTimestamp((prev) => (parseInt(prev) + 600).toString())}
                      className="px-2.5 py-1.5 rounded-md bg-teach-3/15 hover:bg-teach-3/25 text-teach-3 border border-teach-3/30 text-xs font-mono font-semibold cursor-pointer"
                    >
                      +10m (+600s)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoTimestamp('1715428800')}
                      className="px-2.5 py-1.5 rounded-md bg-[#0B0F15] hover:bg-[#11161E] text-slate-300 text-xs font-mono cursor-pointer border border-[#1C2430]"
                    >
                      {isVi ? 'Khôi phục' : 'Reset'}
                    </button>
                  </div>
                  <div className="text-xs text-[#A5AFBF] pt-1 leading-relaxed">
                    {isVi
                      ? 'Thay đổi thời gian 1 giây sẽ tạo ra một Block Hash hoàn toàn mới do hiệu ứng tuyết lở (Avalanche Effect).'
                      : 'Changing time by 1 second mutates the entire Block Hash via the avalanche effect.'}
                  </div>
                </div>
              </div>
            )}

            {activeField === 'merkleRoot' && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teach-1/15 text-teach-1 border border-teach-1/30 text-xs font-mono font-bold">
                  <GitFork className="w-3.5 h-3.5" />
                  <span>MERKLE ROOT</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {isVi
                    ? 'Bản băm 32-byte tóm lược toàn bộ giao dịch trong Body.'
                    : 'A 32-byte cryptographic summary of all transactions in the Body.'}
                </p>
                <div className="p-3.5 rounded-lg bg-[#10151D] border border-[#1C2430] text-xs text-[#A5AFBF] leading-relaxed">
                  {isVi
                    ? 'Header chỉ cần lưu Merkle Root thay vì toàn bộ dữ liệu giao dịch, giúp node nhẹ (SPV) xác thực cực nhanh mà không cần tải cả khối.'
                    : 'Header only stores the Merkle Root instead of full raw transactions, allowing light clients (SPV) to verify transactions instantly.'}
                </div>
              </div>
            )}

            {activeField === 'nonce' && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teach-2/15 text-teach-2 border border-teach-2/30 text-xs font-mono font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>NONCE</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {isVi
                    ? 'Con số thợ đào liên tục thay đổi để tìm hash thỏa mãn độ khó.'
                    : 'Integer iterated during mining to find a hash meeting difficulty target.'}
                </p>
                {/* Mini Interactive Nonce Stepper */}
                <div className="p-3.5 rounded-lg bg-[#10151D] border border-[#1C2430] space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between font-mono">
                    <span>{isVi ? 'Tăng Nonce:' : 'Increment Nonce:'}</span>
                    <span className="text-xs text-teach-2 font-bold">{demoNonce}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDemoNonce((prev) => prev + 1)}
                      className="px-2.5 py-1.5 rounded-md bg-teach-2/15 hover:bg-teach-2/25 text-teach-2 border border-teach-2/30 text-xs font-mono font-semibold cursor-pointer"
                    >
                      +1 Nonce
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoNonce((prev) => prev + 1000)}
                      className="px-2.5 py-1.5 rounded-md bg-teach-2/15 hover:bg-teach-2/25 text-teach-2 border border-teach-2/30 text-xs font-mono font-semibold cursor-pointer"
                    >
                      +1000 Nonce
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeField === 'body' && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teach-5/15 text-teach-5 border border-teach-5/30 text-xs font-mono font-bold">
                  <Boxes className="w-3.5 h-3.5" />
                  <span>BLOCK BODY</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {isVi
                    ? 'Chứa danh sách giao dịch thô đã được xác thực chữ ký số và số dư.'
                    : 'Holds all raw transactions validated by digital signatures and balance checks.'}
                </p>
                <div className="p-3.5 rounded-lg bg-[#10151D] border border-[#1C2430] text-xs text-[#A5AFBF] leading-relaxed">
                  {isVi
                    ? 'Mỗi giao dịch gồm địa chỉ gửi, địa chỉ nhận, lượng token, số nonce và chữ ký mật mã ECDSA.'
                    : 'Each transaction contains sender address, recipient address, token amount, account nonce, and ECDSA signature.'}
                </div>
              </div>
            )}

            {activeField === 'headerHash' && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teach-1/15 text-teach-1 border border-teach-1/30 text-xs font-mono font-bold">
                  <Hash className="w-3.5 h-3.5" />
                  <span>BLOCK HASH</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {isVi
                    ? 'Mã băm của khối được tính bằng cách băm 80 bytes của Block Header.'
                    : 'Block hash is computed exclusively by hashing the 80-byte Block Header.'}
                </p>
                <div className="p-3.5 rounded-lg bg-[#10151D] border border-[#1C2430] font-mono text-xs text-slate-300">
                  <div className="text-slate-200 break-all text-[11px]">
                    SHA-256(PrevHash + MerkleRoot + Timestamp + Nonce)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Bridge Links */}
          <div className="p-3.5 rounded-xl bg-[#0B0E12] border border-[#1C2430] flex items-center justify-between gap-3 text-xs">
            <span className="text-[#A5AFBF] font-sans">
              {isVi ? 'Tiếp theo:' : 'Next:'}
            </span>
            <button
              type="button"
              id="btn-next-stage-from-structure"
              onClick={onNextStage}
              className="text-text-primary hover:text-white font-semibold font-sans inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isVi ? 'Chữ Ký Số' : 'Digital Signature'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

