import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Search,
  Key,
  Boxes,
  Lock,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { TransactionItem } from '../../types';
import { createInitialTransactions } from '../../data/transactionData';
import { TransactionCard } from './TransactionCard';
import { TransactionDetailModal } from './TransactionDetailModal';
import { TamperModal } from './TamperModal';
import { NewTransactionModal } from './NewTransactionModal';
import { computeTransactionDigest, verifyTransactionSignature } from '../../utils/crypto';
import { MempoolDashboard } from './MempoolDashboard';

export const TransactionVerification: React.FC = () => {
  const { strings } = useLanguage();
  const [activeView, setActiveView] = useState<'mempool' | 'ledger'>('mempool');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<TransactionItem | null>(null);
  const [selectedTxForTamper, setSelectedTxForTamper] = useState<TransactionItem | null>(null);
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);

  // Initialize seed transactions
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const txs = await createInitialTransactions();
        setTransactions(txs);
      } catch (err) {
        console.error('Failed to initialize seed transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.txNumber.toLowerCase().includes(q) ||
      tx.sender.toLowerCase().includes(q) ||
      tx.receiver.toLowerCase().includes(q) ||
      (tx.senderName && tx.senderName.toLowerCase().includes(q)) ||
      (tx.receiverName && tx.receiverName.toLowerCase().includes(q)) ||
      tx.currentDigest.toLowerCase().includes(q)
    );
  });

  const verifiedList = filteredTransactions.filter((tx) => tx.isValid);
  const failedList = filteredTransactions.filter((tx) => !tx.isValid);

  // Statistical calculations
  const totalCount = transactions.length;
  const verifiedCount = transactions.filter((tx) => tx.isValid).length;
  const failedCount = transactions.filter((tx) => !tx.isValid).length;
  const successRate = totalCount > 0 ? ((verifiedCount / totalCount) * 100).toFixed(1) : '100.0';

  // Chain integrity logic:
  // Blockchain is considered compromised if any confirmed block transaction is invalid
  const hasCompromisedBlockTx = transactions.some((tx) => tx.blockIndex && !tx.isValid);
  const isChainValid = !hasCompromisedBlockTx;

  // Handler to apply tampered transaction
  const handleApplyTamper = (updatedTx: TransactionItem) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === updatedTx.id ? updatedTx : item))
    );
    if (selectedTxForDetail && selectedTxForDetail.id === updatedTx.id) {
      setSelectedTxForDetail(updatedTx);
    }
  };

  // Handler to restore transaction to original valid state
  const handleRestore = async (tx: TransactionItem) => {
    if (!tx.originalValues) return;

    const restoredPayload = {
      id: tx.id,
      sender: tx.originalValues.sender,
      receiver: tx.originalValues.receiver,
      amount: tx.originalValues.amount,
      timestamp: tx.originalValues.timestamp,
      blockIndex: tx.blockIndex,
    };

    const digestResult = await computeTransactionDigest(restoredPayload);
    const isValid = await verifyTransactionSignature(
      digestResult.hex,
      tx.signature,
      tx.originalValues.sender
    );

    const restoredTx: TransactionItem = {
      ...tx,
      sender: tx.originalValues.sender,
      receiver: tx.originalValues.receiver,
      amount: tx.originalValues.amount,
      timestamp: tx.originalValues.timestamp,
      currentDigest: digestResult.hex,
      isTampered: false,
      tamperedField: 'none',
      isValid,
      failureReason: undefined,
    };

    setTransactions((prev) =>
      prev.map((item) => (item.id === tx.id ? restoredTx : item))
    );
    if (selectedTxForDetail && selectedTxForDetail.id === tx.id) {
      setSelectedTxForDetail(restoredTx);
    }
  };

  // Reset all to initial seed state
  const handleResetAll = async () => {
    setIsLoading(true);
    const txs = await createInitialTransactions();
    setTransactions(txs);
    setSelectedTxForDetail(null);
    setSelectedTxForTamper(null);
    setIsLoading(false);
  };

  // Add newly created valid transaction
  const handleAddNewTransaction = (newTx: TransactionItem) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <section
      id="verification"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative scroll-mt-20 font-sans"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 font-sans">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{strings.verification.badge}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-display">
          {strings.verification.title}
        </h2>
        <p className="mt-2.5 text-slate-400 text-sm sm:text-base font-sans max-w-2xl mx-auto leading-relaxed">
          {strings.verification.subtitle}
        </p>
      </div>

      {/* Module Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8 font-sans">
        <button
          onClick={() => setActiveView('mempool')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border font-sans cursor-pointer ${
            activeView === 'mempool'
              ? 'bg-[#00D084]/15 text-[#00D084] border-[#00D084]/50 shadow-sm'
              : 'bg-[#0B0E12] text-[#9AA2AE] hover:text-[#E7E9ED] border-[#1B2027] hover:border-[#252B33]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#00D084]" />
          <span>{strings.verification.tabMempool}</span>
        </button>

        <button
          onClick={() => setActiveView('ledger')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border font-sans cursor-pointer ${
            activeView === 'ledger'
              ? 'bg-[#00D084]/15 text-[#00D084] border-[#00D084]/50 shadow-sm'
              : 'bg-[#0B0E12] text-[#9AA2AE] hover:text-[#E7E9ED] border-[#1B2027] hover:border-[#252B33]'
          }`}
        >
          <Boxes className="w-4 h-4 text-purple-400" />
          <span>{strings.verification.tabLedger}</span>
        </button>
      </div>

      {/* View 1: Interactive Mempool & Node Verification Dashboard */}
      {activeView === 'mempool' && <MempoolDashboard />}

      {/* View 2: Committed Block Transactions Explorer */}
      {activeView === 'ledger' && (
        <>
      {/* Top Verification Summary & Blockchain Integrity Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10 font-sans">
        {/* Left 2 Cols: Dynamic Statistics */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0B0E12] border border-[#00D084]/30 p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1B2027] pb-3 mb-5">
            <span className="text-xs font-display font-bold text-[#C5CBD3] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00D084]" />
              <span>{strings.verification.matrixTitle}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#090C10] border border-[#252B33] text-[#9AA2AE]">
              {strings.verification.statusPending}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
            {/* Total */}
            <div className="p-4 rounded-xl bg-[#090C10] border border-[#1B2027] flex flex-col justify-between">
              <span className="text-[11px] font-sans text-[#9AA2AE] uppercase font-semibold">
                {strings.verification.totalTxs}
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono">
                {totalCount}
              </div>
              <span className="text-[10px] text-[#68717D] font-sans mt-1">
                {strings.verification.mempoolQueue}
              </span>
            </div>

            {/* Verified */}
            <div className="p-4 rounded-xl bg-[#090C10] border border-[#00D084]/30 flex flex-col justify-between shadow-[0_0_15px_rgba(0,208,132,0.05)]">
              <span className="text-[11px] font-sans text-[#00D084] uppercase font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{strings.verification.verified}</span>
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-black text-[#00D084] font-mono">
                {verifiedCount}
              </div>
              <span className="text-[10px] text-[#00D084]/80 font-sans mt-1">
                {strings.verification.validTxBadge}
              </span>
            </div>

            {/* Failed */}
            <div className="p-4 rounded-xl bg-[#090C10] border border-rose-500/40 flex flex-col justify-between shadow-[0_0_15px_rgba(244,63,94,0.08)]">
              <span className="text-[11px] font-sans text-rose-400 uppercase font-semibold flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                <span>{strings.verification.failed}</span>
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                {failedCount}
              </div>
              <span className="text-[10px] text-rose-400/80 font-sans mt-1">
                {strings.verification.invalidTxBadge}
              </span>
            </div>

            {/* Success Rate */}
            <div className="p-4 rounded-xl bg-[#090C10] border border-[#1B2027] flex flex-col justify-between">
              <span className="text-[11px] font-sans text-[#00D084] uppercase font-semibold">
                {strings.verification.successRate}
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-black text-[#00D084] font-mono">
                {successRate}%
              </div>
              <span className="text-[10px] text-[#68717D] font-sans mt-1">
                {verifiedCount}/{totalCount} {strings.verification.verified.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Blockchain Integrity Status */}
        <div className="rounded-2xl bg-[#0B0E12] border border-[#00D084]/30 p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1B2027] pb-3 mb-4">
              <span className="text-xs font-mono font-bold text-[#C5CBD3] uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-purple-400" />
                <span>{strings.verification.chainIntegrity}</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isChainValid
                    ? 'bg-[#00D084]/10 text-[#00D084] border border-[#00D084]/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/40 animate-pulse'
                }`}
              >
                {isChainValid ? `✓ ${strings.verification.chainValid}` : `✕ ${strings.verification.chainCompromised}`}
              </span>
            </div>

            {/* Integrity Checklist Items */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#090C10] border border-[#1B2027]">
                <span className="text-[#9AA2AE] text-[11px] font-sans">{strings.blockchain.hashIntegrity} (SHA-256)</span>
                <span className="text-[#00D084] font-bold text-[11px]">✓ {strings.blockchain.pass}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#090C10] border border-[#1B2027]">
                <span className="text-[#9AA2AE] text-[11px] font-sans">{strings.blockchain.prevHashLinks}</span>
                <span className="text-[#00D084] font-bold text-[11px]">✓ {strings.blockchain.pass}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#090C10] border border-[#1B2027]">
                <span className="text-[#9AA2AE] text-[11px] font-sans">Proof of Work</span>
                <span className="text-[#00D084] font-bold text-[11px]">✓ {strings.blockchain.pass}</span>
              </div>
              <div
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  isChainValid
                    ? 'bg-[#090C10] border-[#1B2027]'
                    : 'bg-rose-950/30 border-rose-500/50'
                }`}
              >
                <span className="text-[#C5CBD3] text-[11px] font-sans">{strings.verification.stepSign}</span>
                <span
                  className={`font-bold text-[11px] ${
                    isChainValid ? 'text-[#00D084]' : 'text-rose-400'
                  }`}
                >
                  {isChainValid ? `✓ ${strings.blockchain.pass}` : `✕ ${strings.blockchain.fail}`}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[#9AA2AE] font-sans mt-4 leading-relaxed">
            {isChainValid
              ? 'Tất cả các giao dịch trong khối đều thỏa mãn tính toàn vẹn và chữ ký mật mã ECDSA SECP256K1 hợp lệ.'
              : 'Phát hiện có giao dịch trong khối bị sửa đổi! Quy tắc đồng thuận yêu cầu từ chối khối bị can thiệp.'}
          </p>
        </div>
      </div>

      {/* Action Toolbar: Search & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 font-sans">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#68717D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={strings.verification.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0E12] border border-[#1B2027] focus:border-[#00D084]/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#E7E9ED] focus:outline-none font-mono shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68717D] hover:text-white text-xs font-mono cursor-pointer"
            >
              {strings.hashGenerator.clear}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end font-sans">
          <button
            onClick={handleResetAll}
            className="px-3.5 py-2 rounded-xl bg-[#0F1217] hover:bg-[#1A2028] text-[#C5CBD3] hover:text-white border border-[#1B2027] text-xs font-sans flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{strings.verification.resetDemo}</span>
          </button>

          <button
            onClick={() => setIsNewTxModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#00D084] hover:bg-[#00A86B] text-[#06100B] font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,208,132,0.3)] hover:shadow-[0_0_20px_rgba(0,208,132,0.5)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{strings.verification.newTx}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column UI: Verified (Left) vs Failed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
        {/* Left Column: VERIFIED TRANSACTIONS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#00D084]/30 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#00D084] shadow-[0_0_8px_rgba(0,208,132,0.8)]" />
                <h3 className="font-display text-base font-bold text-[#00D084] uppercase tracking-wider">
                  {strings.verification.verifiedTxs}
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#00D084]/15 border border-[#00D084]/30 text-[#00D084] text-xs font-mono font-bold">
                  {verifiedList.length}
                </span>
              </div>
              <p className="text-xs text-[#9AA2AE] font-sans mt-0.5">
                Chữ ký mật mã đã được xác thực thành công.
              </p>
            </div>
          </div>

          {/* Cards List */}
          {verifiedList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0B0E12] border border-dashed border-[#1B2027] text-center text-[#68717D] font-sans text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-[#4B5563]" />
              <p>Không có giao dịch hợp lệ nào khớp với bộ lọc.</p>
              <button
                onClick={handleResetAll}
                className="text-[#00D084] hover:underline inline-block mt-1 cursor-pointer"
              >
                {strings.verification.resetDemo}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {verifiedList.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  onInspect={(t) => setSelectedTxForDetail(t)}
                  onTamper={(t) => setSelectedTxForTamper(t)}
                  onRestore={handleRestore}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: FAILED VERIFICATION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-rose-500/40 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
                <h3 className="font-display text-base font-bold text-rose-400 uppercase tracking-wider">
                  {strings.verification.failedTxs}
                </h3>
                <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
                  {failedList.length}
                </span>
              </div>
              <p className="text-xs text-[#9AA2AE] font-sans mt-0.5">
                Giao dịch không vượt qua kiểm tra chữ ký mật mã.
              </p>
            </div>
          </div>

          {/* Cards List */}
          {failedList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0B0E12] border border-dashed border-[#1B2027] text-center text-[#68717D] font-sans text-xs space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-[#00D084]" />
              <p>Không có giao dịch lỗi. Toàn bộ chữ ký hiện đang hợp lệ.</p>
              <p className="text-[11px] text-[#9AA2AE] font-sans">
                Nhấp nút "Sửa Đổi" trên bất kỳ thẻ nào để mô phỏng hành vi can thiệp trái phép.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {failedList.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  onInspect={(t) => setSelectedTxForDetail(t)}
                  onTamper={(t) => setSelectedTxForTamper(t)}
                  onRestore={handleRestore}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Educational Research Note Box */}
      <div className="mt-12 p-6 rounded-2xl bg-[#0B0E12] border border-[#1B2027] text-xs font-sans text-[#C5CBD3] space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-[#00D084] font-display font-bold text-sm uppercase">
          <Cpu className="w-4 h-4" />
          <span>Lưu Ý Kiến Trúc · Xác Thực Mật Mã Trong Mạng Lưới Phân Tán</span>
        </div>
        <p className="leading-relaxed text-[#9AA2AE] font-sans">
          Trong Bitcoin và các mạng lưới đồng thuận phân tán, các giao dịch không sử dụng mật khẩu hay phiên đăng nhập tập trung. Thay vào đó, hệ thống dựa trên <strong>Mật mã bất đối xứng (ECDSA trên đường cong SECP256K1)</strong> kết hợp cùng <strong>hàm băm SHA-256</strong>. Người gửi dùng khóa bí mật để tạo ra chữ ký toán học (r, s) cho chính xác bản tóm lược 256-bit e = SHA-256(m). Mọi sự can thiệp vào địa chỉ người nhận, số tiền hay dấu thời gian đều làm thay đổi hoàn toàn mã băm, khiến phương trình xác thực thất bại trên toàn bộ các nút mạng.
        </p>
      </div>

        </>
      )}

      {/* Modals */}
      <TransactionDetailModal
        transaction={selectedTxForDetail}
        onClose={() => setSelectedTxForDetail(null)}
        onTamper={(tx) => {
          setSelectedTxForDetail(null);
          setSelectedTxForTamper(tx);
        }}
        onRestore={handleRestore}
      />

      <TamperModal
        transaction={selectedTxForTamper}
        onClose={() => setSelectedTxForTamper(null)}
        onApplyTamper={handleApplyTamper}
      />

      {isNewTxModalOpen && (
        <NewTransactionModal
          onClose={() => setIsNewTxModalOpen(false)}
          onAddTransaction={handleAddNewTransaction}
          nextTxIndex={transactions.length + 1}
        />
      )}
    </section>
  );
};

