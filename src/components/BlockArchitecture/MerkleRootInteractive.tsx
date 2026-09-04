import React, { useState, useEffect } from 'react';
import {
  GitFork,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { calculateTxHash, calculateCombinedHash } from '../../utils/merkle';
import { fastSha256Hex } from '../../utils/sha256';

interface MerkleRootInteractiveProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
  onPrevStage?: () => void;
}

interface MiniTx {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  unit: string;
  timestamp: string;
}

export const MerkleRootInteractive: React.FC<MerkleRootInteractiveProps> = ({
  onInteracted,
  onNextStage,
  onPrevStage,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const INITIAL_TXS: MiniTx[] = [
    { id: 'TX-01', sender: 'Alice', receiver: 'Bob', amount: 5.0, unit: 'BTC', timestamp: '2026-05-11 12:01' },
    { id: 'TX-02', sender: 'Bob', receiver: 'Charlie', amount: 2.5, unit: 'BTC', timestamp: '2026-05-11 12:03' },
    { id: 'TX-03', sender: 'David', receiver: 'Alice', amount: 10.0, unit: 'BTC', timestamp: '2026-05-11 12:05' },
    { id: 'TX-04', sender: 'Charlie', receiver: 'Eve', amount: 1.2, unit: 'BTC', timestamp: '2026-05-11 12:08' },
  ];

  const [transactions, setTransactions] = useState<MiniTx[]>(INITIAL_TXS);
  const [tamperedTxId, setTamperedTxId] = useState<string | null>(null);

  // Live computed Merkle nodes
  const [h1, setH1] = useState('');
  const [h2, setH2] = useState('');
  const [h3, setH3] = useState('');
  const [h4, setH4] = useState('');
  const [h12, setH12] = useState('');
  const [h34, setH34] = useState('');
  const [merkleRoot, setMerkleRoot] = useState('');
  const [, setBlockHash] = useState('');

  // Recompute Merkle Tree in real-time
  useEffect(() => {
    const computeTree = async () => {
      const hash1 = calculateTxHash(transactions[0]);
      const hash2 = calculateTxHash(transactions[1]);
      const hash3 = calculateTxHash(transactions[2]);
      const hash4 = calculateTxHash(transactions[3]);

      const hash12 = calculateCombinedHash(hash1, hash2);
      const hash34 = calculateCombinedHash(hash3, hash4);
      const root = calculateCombinedHash(hash12, hash34);

      setH1(hash1);
      setH2(hash2);
      setH3(hash3);
      setH4(hash4);
      setH12(hash12);
      setH34(hash34);
      setMerkleRoot(root);

      // Recompute sample block hash
      const prevHash = '0000a3f9e81b2c4d6e8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d';
      const bHash = await fastSha256Hex(`42|${prevHash}|${root}|1715428800|48291`);
      setBlockHash(bHash);
    };

    computeTree();
  }, [transactions]);

  const handleTamperTx3 = (newAmount: number) => {
    setTamperedTxId('TX-03');
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === 'TX-03' ? { ...tx, amount: newAmount } : tx))
    );
    if (onInteracted) onInteracted();
  };

  const handleRestoreTxs = () => {
    setTamperedTxId(null);
    setTransactions(INITIAL_TXS);
    if (onInteracted) onInteracted();
  };

  const isTampered = tamperedTxId !== null;

  return (
    <div className="space-y-6 font-sans">
      {/* Main Visual Merkle Tree Explorer Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0B0E12] border border-[#1C2430] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C2430]">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-text-muted" />
            <h4 className="text-sm font-semibold text-white font-sans">
              {isVi
                ? 'Mô phỏng Cây Merkle (4 Giao dịch)'
                : 'Merkle Tree Simulation (4 Transactions)'}
            </h4>
          </div>

          {/* Tamper Button Controls */}
          <div className="flex items-center gap-2">
            {!isTampered ? (
              <button
                type="button"
                id="btn-tamper-merkle-tx3"
                onClick={() => handleTamperTx3(100)}
                className="px-3 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {isVi
                    ? 'Giả lập sửa TX #3: 10 → 100 BTC'
                    : 'Tamper TX #3: 10 → 100 BTC'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-restore-merkle-tx"
                onClick={handleRestoreTxs}
                className="px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-text-primary border border-border-primary text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isVi ? 'Khôi phục ban đầu' : 'Restore original'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Hierarchical Merkle Tree Diagram */}
        <div className="space-y-4">
          {/* TIER 3: MERKLE ROOT (Root Node) */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-sans text-[#A5AFBF] font-medium mb-1.5 flex items-center gap-1.5">
              <span>{isVi ? 'Gốc Merkle (Ghi vào Block Header)' : 'Merkle Root (Stored in Block Header)'}</span>
            </div>
            <div
              className={`p-4 rounded-lg border max-w-md w-full text-center transition-all ${
                isTampered
                  ? 'bg-[#10151D] border-rose-500/60'
                  : 'bg-[#10151D] border-border-primary'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="font-semibold text-slate-200 flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5 text-text-muted" />
                  MERKLE ROOT
                </span>
                {isTampered ? (
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-semibold font-sans">
                    {isVi ? 'ĐÃ ĐỔI ✗' : 'MUTATED ✗'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-success/10 text-success border border-success/30 text-[10px] font-semibold font-sans">
                    {isVi ? 'HỢP LỆ ✓' : 'VALID ✓'}
                  </span>
                )}
              </div>
              <div
                className={`font-mono text-xs font-medium break-all p-2 rounded bg-[#0B0E12] border ${
                  isTampered ? 'text-rose-300 border-rose-500/40' : 'text-text-primary border-border-secondary'
                }`}
              >
                {merkleRoot}
              </div>
            </div>

            {/* Tree Branch Connectors */}
            <div className="h-4 w-px bg-slate-700 my-1"></div>
            <div className="w-1/2 h-px bg-slate-700"></div>
          </div>

          {/* TIER 2: INTERMEDIATE PARENT HASHES */}
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Hash 1+2 */}
            <div className="p-3 rounded-lg bg-[#10151D] border border-[#1C2430] space-y-1 text-center font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">H_12 (TX1 + TX2)</span>
                <span className="text-[#717B8C] text-[10px] font-sans">Tầng 1</span>
              </div>
              <div className="text-xs text-slate-300 truncate font-mono p-1.5 rounded bg-[#0B0E12] border border-[#1C2430]">
                {h12.slice(0, 16)}...
              </div>
            </div>

            {/* Hash 3+4 (Affected by TX3) */}
            <div
              className={`p-3 rounded-lg border space-y-1 text-center font-mono transition-all ${
                isTampered
                  ? 'bg-[#10151D] border-rose-500/50'
                  : 'bg-[#10151D] border-[#1C2430]'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-medium ${isTampered ? 'text-rose-400' : 'text-slate-300'}`}
                >
                  H_34 (TX3 + TX4)
                </span>
                {isTampered && (
                  <span className="text-rose-400 text-[10px] font-sans font-semibold">
                    {isVi ? 'ĐÃ ĐỔI' : 'MUTATED'}
                  </span>
                )}
              </div>
              <div
                className={`text-xs truncate font-mono p-1.5 rounded bg-[#0B0E12] border ${
                  isTampered ? 'text-rose-300 border-rose-500/30' : 'text-slate-300 border-[#1C2430]'
                }`}
              >
                {h34.slice(0, 16)}...
              </div>
            </div>
          </div>

          {/* Tree Branch Connectors to Leaves */}
          <div className="flex justify-around max-w-2xl mx-auto px-8">
            <div className="h-3 w-px bg-slate-700"></div>
            <div className="h-3 w-px bg-slate-700"></div>
          </div>

          {/* TIER 1: LEAF HASHES (4 Hashes) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-[#10151D] border border-[#1C2430] text-center font-mono text-xs">
              <div className="text-[10px] text-[#A5AFBF]">Leaf H_1</div>
              <div className="text-slate-300 truncate font-mono mt-0.5">
                {h1.slice(0, 10)}...
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#10151D] border border-[#1C2430] text-center font-mono text-xs">
              <div className="text-[10px] text-[#A5AFBF]">Leaf H_2</div>
              <div className="text-slate-300 truncate font-mono mt-0.5">
                {h2.slice(0, 10)}...
              </div>
            </div>

            <div
              className={`p-2.5 rounded-lg border text-center font-mono text-xs transition-all ${
                isTampered
                  ? 'bg-[#10151D] border-rose-500/50 text-rose-300'
                  : 'bg-[#10151D] border-[#1C2430] text-slate-300'
              }`}
            >
              <div className="text-[10px] text-[#A5AFBF]">Leaf H_3</div>
              <div className="truncate font-mono mt-0.5">{h3.slice(0, 10)}...</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#10151D] border border-[#1C2430] text-center font-mono text-xs">
              <div className="text-[10px] text-[#A5AFBF]">Leaf H_4</div>
              <div className="text-slate-300 truncate font-mono mt-0.5">
                {h4.slice(0, 10)}...
              </div>
            </div>
          </div>

          {/* TIER 0: RAW TRANSACTIONS (Block Body) */}
          <div className="pt-2">
            <div className="text-xs font-sans text-[#A5AFBF] font-semibold mb-2">
              {isVi ? 'Giao dịch trong thân khối (Block Body)' : 'Transactions in Block Body'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {transactions.map((tx) => {
                const isThisTampered = tx.id === 'TX-03' && isTampered;
                return (
                  <div
                    key={tx.id}
                    className={`p-3 rounded-lg border font-mono text-xs space-y-1.5 transition-all ${
                      isThisTampered
                        ? 'bg-[#10151D] border-rose-500/60 shadow-sm'
                        : 'bg-[#10151D] border-[#1C2430]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-medium ${
                          isThisTampered ? 'text-rose-400 font-semibold' : 'text-[#8B949E]'
                        }`}
                      >
                        {tx.id}
                      </span>
                      {isThisTampered && (
                        <span className="text-[10px] text-rose-300 font-semibold font-sans">
                          {isVi ? 'SỬA ĐỔI' : 'TAMPERED'}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-300 text-xs font-sans">
                      {tx.sender} → {tx.receiver}
                    </div>
                    <div
                      className={`font-semibold ${
                        isThisTampered ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      <span className="text-financial font-mono font-semibold"><span className="text-financial font-mono font-semibold">{tx.amount} {tx.unit}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Educational Reaction Banner */}
        <div
          className={`p-4 rounded-lg border transition-all ${
            isTampered
              ? 'bg-[#10151D] border-rose-500/40 text-rose-200'
              : 'bg-[#10151D] border-[#1C2430] text-slate-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {isTampered ? (
              <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <HelpCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <div className="font-semibold text-sm text-white">
                {isTampered
                  ? (isVi ? 'Hiệu ứng lan truyền cây Merkle:' : 'Merkle cascade effect:')
                  : (isVi ? 'Tóm lược giao dịch an toàn:' : 'Cryptographic integrity:')}
              </div>
              <p className="text-[#A5AFBF] text-xs leading-relaxed font-sans">
                {isTampered
                  ? (isVi
                    ? 'TX #3 đổi → Leaf Hash H_3 đổi → Parent Hash H_34 đổi → Merkle Root đổi → Toàn bộ Block Hash đổi.'
                    : 'TX #3 mutated → Leaf Hash H_3 mutates → Parent Hash H_34 mutates → Merkle Root mutates → Block Hash mutates.')
                  : (isVi
                    ? 'Thay vì lưu toàn bộ giao dịch vào Header, chỉ cần 32-byte Merkle Root để đại diện và bảo vệ tính toàn vẹn của mọi giao dịch trong khối.'
                    : 'Instead of storing entire transactions in the header, a 32-byte Merkle Root cryptographically anchors and validates the whole block.')}
              </p>
            </div>
          </div>
        </div>

        {/* Bridge Link */}
        <div className="pt-3 flex items-center justify-between gap-3 text-xs border-t border-[#1C2430]">
          <button
            type="button"
            id="btn-prev-stage-from-merkle"
            onClick={onPrevStage}
            className="px-3 py-1.5 rounded-md bg-[#10151D] hover:bg-[#161D27] text-slate-300 border border-[#1C2430] text-xs flex items-center gap-1.5 cursor-pointer font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isVi ? 'Quay lại: Timestamp' : 'Back: Timestamp'}</span>
          </button>
          <button
            type="button"
            id="btn-next-stage-from-merkle"
            onClick={onNextStage}
 className="px-4 py-2 rounded-md bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm font-sans"
          >
            <span>{isVi ? 'Tiếp: Vòng Đời Khối' : 'Next: Block Lifecycle'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

