import React, { useState, useEffect } from 'react';
import { ShieldCheck, Boxes, Layers } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { TransactionItem } from '../../types';
import { createInitialTransactions } from '../../data/transactionData';

import { TransactionDetailModal } from './TransactionDetailModal';
import { TamperModal } from './TamperModal';
import { NewTransactionModal } from './NewTransactionModal';
import { computeTransactionDigest, verifyTransactionSignature } from '../../utils/crypto';
import { MempoolDashboard } from './MempoolDashboard';
import { TextIntegrityPlayground } from './TextIntegrityPlayground';

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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-border-primary text-text-primary text-xs font-medium mb-3">
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
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ease-out flex items-center gap-2 border font-sans cursor-pointer backdrop-blur-md ${
            activeView === 'mempool'
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.15)]'
              : 'bg-[#0B0F19]/60 text-slate-400 hover:text-white hover:bg-[#0B0F19]/90 border-white/[0.07] hover:border-white/[0.15]'
          }`}
        >
          <Layers className={`w-4 h-4 transition-colors duration-200 ${activeView === 'mempool' ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>{strings.verification.tabMempool}</span>
        </button>

        <button
          onClick={() => setActiveView('ledger')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ease-out flex items-center gap-2 border font-sans cursor-pointer backdrop-blur-md ${
            activeView === 'ledger'
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.15)]'
              : 'bg-[#0B0F19]/60 text-slate-400 hover:text-white hover:bg-[#0B0F19]/90 border-white/[0.07] hover:border-white/[0.15]'
          }`}
        >
          <Boxes className={`w-4 h-4 transition-colors duration-200 ${activeView === 'ledger' ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>{strings.verification.tabLedger}</span>
        </button>
      </div>

      {/* View 1: Interactive Mempool & Node Verification Dashboard */}
      {activeView === 'mempool' && <MempoolDashboard />}

      {/* View 2: Committed Block Transactions Explorer */}
      {activeView === 'ledger' && <TextIntegrityPlayground />}

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

