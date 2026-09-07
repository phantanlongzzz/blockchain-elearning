import React, { useState } from 'react';
import { Flame, Zap, RotateCcw, Sliders, Eye, Check, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MerkleTransaction, MerkleNode, MerkleTreeResult } from '../../types';
import { INITIAL_MERKLE_TRANSACTIONS } from '../../data/merkleSeedData';
import { buildMerkleTree, calculateTxHash } from '../../utils/merkle';
import { MerkleTreeCanvas } from './MerkleTreeCanvas';
import { TransactionList } from './TransactionList';
import { MerkleProofModal } from './MerkleProofModal';
import { TamperSimulationModal } from './TamperSimulationModal';

export type MerkleBuildStage = 'idle' | 'building' | 'ready' | 'recalculating' | 'tampered';

export interface MerkleAnimStep {
  stage: MerkleBuildStage;
  level: number;
  subStage: 'computing' | 'flowing' | 'done';
}

export const MerkleTreeLab: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';
  const [transactions, setTransactions] = useState<MerkleTransaction[]>(INITIAL_MERKLE_TRANSACTIONS);
  const [isTechnicalMode, setIsTechnicalMode] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [proofTargetTx, setProofTargetTx] = useState<MerkleTransaction | null>(null);
  const [inspectNode, setInspectNode] = useState<MerkleNode | null>(null);
  const [tamperTargetTx, setTamperTargetTx] = useState<MerkleTransaction | null>(null);
  const [copiedRoot, setCopiedRoot] = useState(false);

  // Animation States
  const [animStep, setAnimStep] = useState<MerkleAnimStep>({ stage: 'idle', level: 0, subStage: 'done' });
  const [prevTreeData, setPrevTreeData] = useState<MerkleTreeResult | null>(null);

  // Store initial committed root for before/after comparison
  const [originalCommittedRoot] = useState<string>(() => {
    const tree = buildMerkleTree(INITIAL_MERKLE_TRANSACTIONS);
    return tree.rootHash;
  });

  // Calculate live tree data
  const treeData: MerkleTreeResult = buildMerkleTree(
    transactions,
    proofTargetTx ? proofTargetTx.id : undefined
  );

  const { rootHash, totalLeaves, totalNodes, treeHeight, isTampered } = treeData;

  // Auto-advance animation
  React.useEffect(() => {
    if (animStep.stage === 'building' || animStep.stage === 'recalculating') {
      const timer = setTimeout(() => {
        if (animStep.subStage === 'computing') {
          setAnimStep(prev => ({ ...prev, subStage: 'flowing' }));
        } else if (animStep.subStage === 'flowing') {
          if (animStep.level < treeHeight) {
            setAnimStep(prev => ({ ...prev, level: prev.level + 1, subStage: 'computing' }));
          } else {
            setAnimStep({ 
              stage: animStep.stage === 'building' ? 'ready' : (treeData.isTampered ? 'tampered' : 'ready'), 
              level: treeHeight, 
              subStage: 'done' 
            });
          }
        }
      }, 500); // 500ms duration for each substage
      return () => clearTimeout(timer);
    }
  }, [animStep, treeHeight, treeData.isTampered]);

  // Handlers
  const handleAddTransaction = (sender: string, receiver: string, amount: number) => {
    const newTx: MerkleTransaction = {
      id: `mtx-${Date.now()}`,
      txIndex: transactions.length,
      sender,
      receiver,
      amount,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      hash: '',
      isTampered: false,
    };
    newTx.hash = calculateTxHash(newTx);
    newTx.originalValues = {
      sender: newTx.sender,
      receiver: newTx.receiver,
      amount: newTx.amount,
      timestamp: newTx.timestamp,
      hash: newTx.hash,
    };

    setTransactions((prev) => [...prev, newTx]);
    setSelectedTxId(newTx.id);
    setAnimStep({ stage: 'idle', level: 0, subStage: 'done' });
  };

  const handleDeleteTransaction = (id: string) => {
    if (transactions.length <= 1) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (selectedTxId === id) setSelectedTxId(null);
    setAnimStep({ stage: 'idle', level: 0, subStage: 'done' });
  };

  const handleApplyTamper = (
    txId: string,
    newSender: string,
    newReceiver: string,
    newAmount: number
  ) => {
    setPrevTreeData(treeData);
    setAnimStep({ stage: 'recalculating', level: 0, subStage: 'computing' });
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === txId) {
          const newHash = calculateTxHash({
            sender: newSender,
            receiver: newReceiver,
            amount: newAmount,
            timestamp: t.timestamp,
          });
          return {
            ...t,
            sender: newSender,
            receiver: newReceiver,
            amount: newAmount,
            hash: newHash,
            isTampered: true,
          };
        }
        return t;
      })
    );
  };

  const handleRestoreTransaction = (tx: MerkleTransaction) => {
    setPrevTreeData(treeData);
    setAnimStep({ stage: 'recalculating', level: 0, subStage: 'computing' });
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === tx.id && t.originalValues) {
          return {
            ...t,
            sender: t.originalValues.sender,
            receiver: t.originalValues.receiver,
            amount: t.originalValues.amount,
            timestamp: t.originalValues.timestamp,
            hash: t.originalValues.hash,
            isTampered: false,
          };
        }
        return t;
      })
    );
  };

  const handleResetAll = () => {
    setTransactions(INITIAL_MERKLE_TRANSACTIONS);
    setProofTargetTx(null);
    setSelectedTxId(null);
    setAnimStep({ stage: 'idle', level: 0, subStage: 'done' });
  };

  const handleBuildTree = () => {
    setAnimStep({ stage: 'building', level: 0, subStage: 'computing' });
  };

  const handleCopyRoot = () => {
    if (!rootHash) return;
    navigator.clipboard.writeText(rootHash);
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 2000);
  };

  return (
    <section id="merkle-tree" className="relative py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <div id="merkle-lab" className="absolute -top-20" />

      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F2F4F7] tracking-tight font-sans">
          {isVi ? 'Phòng Thí Nghiệm Cây Merkle' : 'Merkle Tree Lab'}
        </h2>
        <p className="text-[#A5AFBF] text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-sans">
          {isVi
            ? 'Xây dựng cấu trúc cây băm từ các giao dịch lá và kiểm tra xác thực bằng chứng Merkle Proof.'
            : 'Build cryptographic hash trees from transaction leaves and verify Merkle proofs.'}
        </p>
      </div>

      {/* Compact Metrics & Action Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#0C0F14] border border-[#1C2430] mb-6 space-y-4 shadow-sm font-sans">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#090A0F] p-1 rounded-lg border border-[#1C2430]">
            <button
              type="button"
              onClick={() => setIsTechnicalMode(false)}
              className={`px-3 py-1.5 rounded text-[13px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                !isTechnicalMode
                  ? 'bg-[#1C2430] text-[#F2F4F7]'
                  : 'text-[#A5AFBF] hover:text-[#F2F4F7]'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{isVi ? 'Chế độ Tương tác' : 'Interactive'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsTechnicalMode(true)}
              className={`px-3 py-1.5 rounded text-[13px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                isTechnicalMode
                  ? 'bg-[#1C2430] text-[#F2F4F7]'
                  : 'text-[#A5AFBF] hover:text-[#F2F4F7]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{isVi ? 'Chế độ Kỹ thuật' : 'Technical'}</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {animStep.stage === 'idle' ? (
              <button
                type="button"
                onClick={handleBuildTree}
                className="px-3.5 py-2 rounded-lg bg-teach-1/10 hover:bg-teach-1/20 text-teach-1 border border-teach-1/30 text-[13px] transition-colors flex items-center gap-1.5 cursor-pointer font-medium h-[36px]"
              >
                <Zap className="w-4 h-4" />
                <span>{isVi ? 'Khởi tạo & Băm Cây Merkle' : 'Build & Hash Tree'}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (transactions.length > 0) setTamperTargetTx(transactions[0]);
                  }}
                  disabled={animStep.stage !== 'ready' && animStep.stage !== 'tampered'}
                  className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[13px] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium h-[36px]"
                >
                  <Flame className="w-4 h-4" />
                  <span>{isVi ? 'Sửa dữ liệu' : 'Tamper'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (transactions.length > 0) setProofTargetTx(transactions[0]);
                  }}
                  disabled={animStep.stage !== 'ready' && animStep.stage !== 'tampered'}
                  className="px-3.5 py-2 rounded-lg bg-teach-1/10 hover:bg-teach-1/20 text-teach-1 border border-teach-1/30 text-[13px] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium h-[36px]"
                >
                  <Check className="w-4 h-4" />
                  <span>{isVi ? 'Kiểm tra' : 'Verify'}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleResetAll}
              className="px-3.5 py-2 rounded-lg bg-[#0F131A] hover:bg-[#11161E] text-[#F2F4F7] border border-[#1C2430] text-[13px] transition-colors flex items-center gap-1.5 cursor-pointer font-medium h-[36px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isVi ? 'Đặt lại' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-3 border-t border-[#1C2430]/60">
          <div>
            <span className="text-[10px] text-[#717B8C] uppercase block mb-1">
              {isVi ? 'Số lượng giao dịch' : 'Transactions'}
            </span>
            <span className="font-sans font-semibold text-[#F2F4F7] text-sm">{totalLeaves}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#717B8C] uppercase block mb-1">
              {isVi ? 'Chiều cao cây' : 'Tree Height'}
            </span>
            <span className="font-sans font-semibold text-[#F2F4F7] text-sm">{treeHeight} {isVi ? 'tầng' : 'levels'}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#717B8C] uppercase block mb-1">
              {isVi ? 'Tổng số nút' : 'Total Nodes'}
            </span>
            <span className="font-sans font-semibold text-[#F2F4F7] text-sm">{totalNodes}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#717B8C] uppercase block mb-1">
              {isVi ? 'Độ phức tạp' : 'Complexity'}
            </span>
            <span className="font-sans font-semibold text-[#F2F4F7] text-sm">O(log {totalLeaves})</span>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-center justify-between gap-1">
            <div className="min-w-0">
              <span className="text-[10px] text-[#717B8C] uppercase block mb-1">
                {isVi ? 'Gốc Merkle' : 'Merkle Root'}
              </span>
              <span className="font-mono text-[#F59E0B] text-[12px] truncate block font-medium">
                {rootHash ? `${rootHash.slice(0, 8)}...${rootHash.slice(-4)}` : '---'}
              </span>
            </div>
          </div>
        </div>

        {/* Tamper Alert (Only when tampered) */}
        {isTampered && (
          <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/40 text-[13px] font-sans space-y-2 mt-4">
            <div className="flex items-center gap-2 text-rose-400 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{isVi ? 'Gốc Merkle đã bị thay đổi do dữ liệu nhánh bị sửa đổi' : 'Merkle root altered due to tampered branch data'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary 70/30 Responsive Layout: Merkle Tree Dominates */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Area: Compact Controls & Transaction List (approx 25–30% width) */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-4">
          <TransactionList
            transactions={transactions}
            selectedTxId={selectedTxId}
            onSelectTx={setSelectedTxId}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onTamperTransaction={(tx) => setTamperTargetTx(tx)}
            onRestoreTransaction={handleRestoreTransaction}
            onVerifyProof={(tx) => setProofTargetTx(tx)}
          />
        </div>

        {/* Right Area: Spacious Merkle Tree Visualization Canvas (approx 70–75% width) */}
        <div className="flex-1 min-w-0 w-full">
          <MerkleTreeCanvas
            treeData={treeData}
            prevTreeData={prevTreeData}
            animStep={animStep}
            isTechnicalMode={isTechnicalMode}
            selectedTxId={selectedTxId}
            onSelectTx={setSelectedTxId}
            onInspectNode={(node) => setInspectNode(node)}
            inspectNode={inspectNode}
            onCloseInspectNode={() => setInspectNode(null)}
          />
        </div>
      </div>

      {/* Theory on Demand: Merkle Tree & O(log N) Proofs */}
      <details className="mt-6 border border-[#1C2430] rounded-xl bg-[#0C0F14] text-xs overflow-hidden font-sans">
        <summary className="px-4 py-2.5 flex items-center justify-between text-[#A5AFBF] hover:text-[#F2F4F7] cursor-pointer select-none font-medium transition-colors">
          <span>
            {isVi
              ? 'Hiểu thêm về Cây Merkle, Lan truyền mã băm & Bằng chứng O(log N)'
              : 'Learn more about Merkle Trees, Hash Propagation & O(log N) Proofs'}
          </span>
          <span className="text-[11px] text-[#717B8C] font-mono">
            ▼
          </span>
        </summary>
        <div className="p-4 border-t border-[#1C2430] grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-[#A5AFBF]">
          <div className="p-3 rounded-lg bg-[#090A0F] border border-[#1C2430] space-y-1">
            <span className="text-[#F2F4F7] font-semibold block font-sans">
              {isVi ? '1. Nén Dữ Liệu O(1) Root' : '1. O(1) Root Compression'}
            </span>
            <p className="text-[11px] text-[#717B8C] leading-relaxed">
              {isVi
                ? 'Hàng ngàn giao dịch được băm theo cặp từ dưới lên tạo thành một Merkle Root duy nhất 32 byte nằm trong Block Header.'
                : 'Thousands of transactions are hashed in pairs from leaves upward into a single 32-byte Merkle Root stored in the Block Header.'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#090A0F] border border-[#1C2430] space-y-1">
            <span className="text-[#F2F4F7] font-semibold block font-sans">
              {isVi ? '2. Bằng Chứng Siêu Nhẹ O(log N)' : '2. Lightweight O(log N) Proofs'}
            </span>
            <p className="text-[11px] text-[#717B8C] leading-relaxed">
              {isVi
                ? 'Nút mạng nhẹ (SPV Client) chỉ cần log₂(N) hàm băm anh em để kiểm toán một giao dịch mà không cần tải toàn bộ khối.'
                : 'Light clients (SPV) only require log₂(N) sibling hashes to audit transaction inclusion without downloading the whole block.'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#090A0F] border border-[#1C2430] space-y-1">
            <span className="text-[#F2F4F7] font-semibold block font-sans">
              {isVi ? '3. Lan Truyền Phát Hiện Giả Mạo' : '3. Tamper Detection Cascade'}
            </span>
            <p className="text-[11px] text-[#717B8C] leading-relaxed">
              {isVi
                ? 'Thay đổi dù chỉ 1 ký tự ở nút lá lập tức làm đổi mã băm các tầng cha và làm hỏng toàn bộ Merkle Root của khối.'
                : 'Modifying a single bit in a leaf transaction immediately invalidates all parent hashes up to the Merkle Root.'}
            </p>
          </div>
        </div>
      </details>

      {/* Modals (On-Demand Inspection) */}
      <MerkleProofModal
        transaction={proofTargetTx}
        allTransactions={transactions}
        onClose={() => setProofTargetTx(null)}
      />

      <TamperSimulationModal
        transaction={tamperTargetTx}
        onClose={() => setTamperTargetTx(null)}
        onApplyTamper={handleApplyTamper}
      />
    </section>
  );
};
