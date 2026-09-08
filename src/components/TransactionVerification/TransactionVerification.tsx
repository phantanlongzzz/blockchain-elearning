import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Boxes,
  Layers,
  Hash,
  FileText,
  UploadCloud,
  Plus,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { TransactionItem } from '../../types';
import { createInitialTransactions } from '../../data/transactionData';

import { TransactionDetailModal } from './TransactionDetailModal';
import { TamperModal } from './TamperModal';
import { NewTransactionModal } from './NewTransactionModal';
import { computeTransactionDigest, verifyTransactionSignature } from '../../utils/crypto';
import { MempoolDashboard } from './MempoolDashboard';
import { TransactionCard } from './TransactionCard';
import { TextIntegrityPlayground } from './TextIntegrityPlayground';
import { FileIntegrityPlayground } from './FileIntegrityPlayground';

export const TransactionVerification: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';

  // Primary Domain Switcher: Transaction Validation vs Hash & Integrity
  const [domain, setDomain] = useState<'transaction' | 'hash'>('transaction');

  // Sub-tabs for each domain
  const [txSubView, setTxSubView] = useState<'mempool' | 'ledger'>('mempool');
  const [hashSubView, setHashSubView] = useState<'text' | 'file'>('text');

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

  // Statistical calculations
  const totalCount = transactions.length;
  const verifiedCount = transactions.filter((tx) => tx.isValid).length;
  const failedCount = transactions.filter((tx) => !tx.isValid).length;
  const successRate = totalCount > 0 ? ((verifiedCount / totalCount) * 100).toFixed(1) : '100.0';

  // Chain integrity logic:
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
      className="pt-6 pb-16 sm:pt-8 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative scroll-mt-20 font-sans"
    >
      {/* 1. PRIMARY DOMAIN SWITCHER: Separate Hash Integrity vs Transaction Validation */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 shadow-md">
          <button
            type="button"
            onClick={() => setDomain('transaction')}
            className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              domain === 'transaction'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${domain === 'transaction' ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>{strings.verification.txDomain}</span>
          </button>
          <button
            type="button"
            onClick={() => setDomain('hash')}
            className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              domain === 'hash'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Hash className={`w-4 h-4 ${domain === 'hash' ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>{strings.verification.hashDomain}</span>
          </button>
        </div>
      </div>

      {/* 2. CONTEXT-SPECIFIC HEADERS */}
      {domain === 'transaction' ? (
        <div className="text-center max-w-3xl mx-auto mb-7 font-sans">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 text-slate-300 text-xs font-mono mb-3 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>{strings.verification.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-display">
            {strings.verification.title}
          </h2>
          <p className="mt-2 text-slate-300 text-sm sm:text-base font-sans max-w-2xl mx-auto leading-relaxed">
            {strings.verification.subtitle}
          </p>

          {/* Sub-view Selector for Transaction Domain */}
          <div className="flex justify-center mt-6">
            <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setTxSubView('mempool')}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  txSubView === 'mempool'
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${txSubView === 'mempool' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{strings.verification.tabMempool}</span>
              </button>

              <button
                type="button"
                onClick={() => setTxSubView('ledger')}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  txSubView === 'ledger'
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Boxes className={`w-3.5 h-3.5 ${txSubView === 'ledger' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{strings.verification.tabLedger}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center max-w-3xl mx-auto mb-7 font-sans">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 text-slate-300 text-xs font-mono mb-3 shadow-xs">
            <Hash className="w-3.5 h-3.5 text-cyan-400" />
            <span>HASH & INTEGRITY · SHA-256</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-display">
            {strings.verification.hashTitle}
          </h2>
          <p className="mt-2 text-slate-300 text-sm sm:text-base font-sans max-w-2xl mx-auto leading-relaxed">
            {strings.verification.hashSubtitle}
          </p>

          {/* Sub-view Selector for Hash Domain */}
          <div className="flex justify-center mt-6">
            <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setHashSubView('text')}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  hashSubView === 'text'
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${hashSubView === 'text' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{strings.verification.tabTextCheck}</span>
              </button>

              <button
                type="button"
                onClick={() => setHashSubView('file')}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  hashSubView === 'file'
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <UploadCloud className={`w-3.5 h-3.5 ${hashSubView === 'file' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{strings.verification.tabFileCheck}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE VIEW */}
      {domain === 'transaction' && txSubView === 'mempool' && (
        <MempoolDashboard />
      )}

      {domain === 'transaction' && txSubView === 'ledger' && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#0B0F19]/90 border border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">{strings.verification.totalTxs}: </span>
                  <span className="text-white font-bold">{totalCount}</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono">
                  <span className="text-emerald-400">{strings.verification.verified}: </span>
                  <span className="text-emerald-300 font-bold">{verifiedCount}</span>
                </div>
                {failedCount > 0 && (
                  <div className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs font-mono">
                    <span className="text-rose-400">{strings.verification.failed}: </span>
                    <span className="text-rose-300 font-bold">{failedCount}</span>
                  </div>
                )}
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">{strings.verification.chainIntegrity}: </span>
                  <span className={`font-semibold ${isChainValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isChainValid ? strings.verification.chainValid : strings.verification.chainCompromised}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTxModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{strings.verification.newTx}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  title={strings.verification.resetDemo}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>{strings.verification.resetDemo}</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={strings.verification.searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Transactions List */}
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 font-mono text-xs">
              {isVi ? 'Đang tải danh sách giao dịch sổ cái...' : 'Loading blockchain ledger transactions...'}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 font-mono text-xs">
              {isVi ? 'Không tìm thấy giao dịch nào phù hợp.' : 'No matching transactions found.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTransactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  onInspect={setSelectedTxForDetail}
                  onTamper={setSelectedTxForTamper}
                  onRestore={handleRestore}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* HASH DOMAIN: Text Integrity vs File Integrity */}
      {domain === 'hash' && hashSubView === 'text' && (
        <TextIntegrityPlayground />
      )}

      {domain === 'hash' && hashSubView === 'file' && (
        <FileIntegrityPlayground />
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


