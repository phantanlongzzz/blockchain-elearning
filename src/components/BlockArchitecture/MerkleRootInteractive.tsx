import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Boxes,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  HelpCircle,
  Hash,
  Layers,
  ArrowUp,
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
  const { strings, language } = useLanguage();

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
  const [blockHash, setBlockHash] = useState('');

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

  const handleScrollToMerkleLab = () => {
    const el = document.getElementById('merkle-tree');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isTampered = tamperedTxId !== null;

  return (
    <div className="space-y-6">
      {/* Main Visual Merkle Tree Explorer Card */}
      <div className="p-5 sm:p-7 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              {language === 'vi'
                ? 'Mô phỏng cây Merkle (4 TXs)'
                : 'Merkle Tree simulation (4 TXs)'}
            </h4>
          </div>

          {/* Tamper Button Controls */}
          <div className="flex items-center gap-2">
            {!isTampered ? (
              <button
                type="button"
                onClick={() => handleTamperTx3(100)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {language === 'vi'
                    ? 'Sửa TX #3: 10 → 100 BTC'
                    : 'Tamper TX #3: 10 → 100 BTC'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRestoreTxs}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Khôi phục gốc' : 'Restore original'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Hierarchical Merkle Tree Diagram */}
        <div className="space-y-4">
          {/* TIER 3: MERKLE ROOT (Root Node) */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1 flex items-center gap-1.5">
              <span>{language === 'vi' ? 'Gốc Merkle (Block Header)' : 'Merkle Root (Block Header)'}</span>
            </div>
            <div
              className={`p-4 rounded-xl border-2 max-w-md w-full text-center transition-all ${
                isTampered
                  ? 'bg-rose-950/30 border-rose-500 shadow-xl shadow-rose-950/30'
                  : 'bg-indigo-950/30 border-indigo-500 shadow-xl shadow-indigo-950/20'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="font-bold text-indigo-300 flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5" />
                  MERKLE ROOT
                </span>
                {isTampered ? (
                  <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                    {language === 'vi' ? 'ĐÃ ĐỔI ✗' : 'CHANGED ✗'}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    {language === 'vi' ? 'HỢP LỆ ✓' : 'VALID ✓'}
                  </span>
                )}
              </div>
              <div
                className={`font-mono text-xs font-bold break-all p-2 rounded bg-black/50 ${
                  isTampered ? 'text-rose-300' : 'text-amber-300'
                }`}
              >
                {merkleRoot}
              </div>
            </div>

            {/* Tree Branch Connectors */}
            <div className="h-6 w-px bg-slate-700 my-1"></div>
            <div className="w-1/2 h-px bg-slate-700"></div>
          </div>

          {/* TIER 2: INTERMEDIATE PARENT HASHES */}
          <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Hash 1+2 */}
            <div className="p-3 rounded-xl bg-[#0b101b] border border-slate-800 space-y-1 text-center font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold">H_12</span>
                <span className="text-slate-500 text-[10px]">Level 1</span>
              </div>
              <div className="text-xs text-slate-300 truncate font-semibold p-1.5 rounded bg-black/40">
                {h12.slice(0, 14)}...
              </div>
            </div>

            {/* Hash 3+4 (Affected by TX3) */}
            <div
              className={`p-3 rounded-xl border space-y-1 text-center font-mono transition-all ${
                isTampered
                  ? 'bg-rose-950/20 border-rose-500/60 shadow-lg'
                  : 'bg-[#0b101b] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-bold ${isTampered ? 'text-rose-400' : 'text-indigo-400'}`}
                >
                  H_34
                </span>
                {isTampered && (
                  <span className="text-rose-400 text-[10px] font-bold">
                    {language === 'vi' ? 'ĐÃ ĐỔI' : 'CHANGED'}
                  </span>
                )}
              </div>
              <div
                className={`text-xs truncate font-semibold p-1.5 rounded bg-black/40 ${
                  isTampered ? 'text-rose-300 font-bold' : 'text-slate-300'
                }`}
              >
                {h34.slice(0, 14)}...
              </div>
            </div>
          </div>

          {/* Tree Branch Connectors to Leaves */}
          <div className="flex justify-around max-w-3xl mx-auto px-10">
            <div className="h-4 w-px bg-slate-700"></div>
            <div className="h-4 w-px bg-slate-700"></div>
          </div>

          {/* TIER 1: LEAF HASHES (4 Hashes) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-center font-mono text-xs">
              <div className="text-[10px] text-slate-400">Leaf H_1</div>
              <div className="text-emerald-300 truncate font-semibold mt-0.5">
                {h1.slice(0, 10)}...
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-center font-mono text-xs">
              <div className="text-[10px] text-slate-400">Leaf H_2</div>
              <div className="text-emerald-300 truncate font-semibold mt-0.5">
                {h2.slice(0, 10)}...
              </div>
            </div>

            <div
              className={`p-2.5 rounded-lg border text-center font-mono text-xs transition-all ${
                isTampered
                  ? 'bg-rose-950/30 border-rose-500 text-rose-300 font-bold'
                  : 'bg-black/40 border-slate-800 text-emerald-300'
              }`}
            >
              <div className="text-[10px] text-slate-400">Leaf H_3</div>
              <div className="truncate font-semibold mt-0.5">{h3.slice(0, 10)}...</div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-center font-mono text-xs">
              <div className="text-[10px] text-slate-400">Leaf H_4</div>
              <div className="text-emerald-300 truncate font-semibold mt-0.5">
                {h4.slice(0, 10)}...
              </div>
            </div>
          </div>

          {/* TIER 0: RAW TRANSACTIONS (Block Body) */}
          <div className="pt-2">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-2">
              {language === 'vi' ? 'Giao dịch trong thân khối (Block Body)' : 'Transactions in Block Body'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {transactions.map((tx) => {
                const isThisTampered = tx.id === 'TX-03' && isTampered;
                return (
                  <div
                    key={tx.id}
                    className={`p-3 rounded-xl border font-mono text-xs space-y-1.5 transition-all ${
                      isThisTampered
                        ? 'bg-rose-950/30 border-rose-500 shadow-md'
                        : 'bg-[#0b101b] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-bold ${
                          isThisTampered ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {tx.id}
                      </span>
                      {isThisTampered && (
                        <span className="text-[10px] text-rose-300 font-bold">
                          {language === 'vi' ? 'SỬA ĐỔI' : 'TAMPERED'}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-300 text-xs">
                      {tx.sender} → {tx.receiver}
                    </div>
                    <div
                      className={`font-bold ${
                        isThisTampered ? 'text-rose-400' : 'text-amber-300'
                      }`}
                    >
                      {tx.amount} {tx.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Educational Reaction Banner */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            isTampered
              ? 'bg-rose-950/20 border-rose-500/50 text-rose-200'
              : 'bg-indigo-950/20 border-indigo-500/30 text-slate-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {isTampered ? (
              <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <div className="font-bold text-sm">
                {isTampered
                  ? (language === 'vi' ? 'Hiệu ứng lan truyền cây Merkle:' : 'Merkle cascade effect:')
                  : (language === 'vi' ? 'Tóm lược giao dịch an toàn:' : 'Secure transaction summarization:')}
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {isTampered
                  ? (language === 'vi'
                    ? 'TX #3 đổi → Leaf Hash H_3 đổi → Parent Hash H_34 đổi → Merkle Root đổi → Toàn bộ Block Hash đổi.'
                    : 'TX #3 mutated → Leaf Hash H_3 mutates → Parent Hash H_34 mutates → Merkle Root mutates → Block Hash mutates.')
                  : (language === 'vi'
                    ? 'Thay vì lưu toàn bộ giao dịch vào Header, chỉ cần 32-byte Merkle Root để đại diện và bảo vệ toàn bộ dữ liệu.'
                    : 'Instead of storing thousands of transactions in the header, a 32-byte Merkle Root cryptographically secures all of them.')}
              </p>
            </div>
          </div>
        </div>

        {/* Bridge Link */}
        <div className="pt-2 flex items-center justify-between gap-3 text-xs border-t border-slate-800/80">
          <button
            type="button"
            onClick={onPrevStage}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Quay lại' : 'Back'}</span>
          </button>
          <button
            type="button"
            onClick={onNextStage}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow"
          >
            <span>{language === 'vi' ? 'Tiếp: Vòng đời khối' : 'Next: Lifecycle'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
