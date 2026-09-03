import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Wallet, PenTool, Database, Pickaxe, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { UTXO, Transaction, Block, VerificationResult } from './types';
import { INITIAL_UTXOS, INITIAL_MEMPOOL, INITIAL_BLOCKCHAIN } from './constants';
import { Stage1Wallet } from './Stage1Wallet';
import { Stage2BuildTx } from './Stage2BuildTx';
import { Stage3Mempool } from './Stage3Mempool';
import { Stage4MineBlock } from './Stage4MineBlock';

export const TransactionLifecycleLab: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Global Simulation State
  const [activeStage, setActiveStage] = useState<number>(1);
  const [utxos, setUtxos] = useState<UTXO[]>(INITIAL_UTXOS);
  const [selectedUtxoIds, setSelectedUtxoIds] = useState<string[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [mempool, setMempool] = useState<Transaction[]>(INITIAL_MEMPOOL);
  const [blockchain, setBlockchain] = useState<Block[]>(INITIAL_BLOCKCHAIN);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus helper
  const focusElement = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const resetSimulation = () => {
    setUtxos(INITIAL_UTXOS);
    setSelectedUtxoIds([]);
    setCurrentTransaction(null);
    setMempool(INITIAL_MEMPOOL);
    setBlockchain(INITIAL_BLOCKCHAIN);
    setActiveStage(1);
    focusElement('stage-nav');
  };

  const handleNextStage = () => {
    if (activeStage < 4) {
      setActiveStage(activeStage + 1);
      focusElement(`stage-${activeStage + 1}-container`);
    }
  };

  const stages = [
    { id: 1, title: isVi ? '1. Ví & UTXO' : '1. Wallet & UTXO', icon: Wallet },
    { id: 2, title: isVi ? '2. Tạo giao dịch' : '2. Build Transaction', icon: PenTool },
    { id: 3, title: isVi ? '3. Mempool' : '3. Mempool', icon: Database },
    { id: 4, title: isVi ? '4. Đào khối & Merkle Tree' : '4. Mine Block & Merkle Tree', icon: Pickaxe },
  ];

  return (
    <section className="font-sans animate-in fade-in duration-500 max-w-6xl mx-auto" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            {isVi ? 'Vòng đời Giao dịch UTXO' : 'UTXO Transaction Lifecycle'}
          </h1>
        </div>
        <button
          onClick={resetSimulation}
          className="px-4 py-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] text-xs font-bold transition-all"
        >
          {isVi ? 'Đặt lại mô phỏng' : 'Reset Simulation'}
        </button>
      </div>

      {/* Stage Navigation */}
      <div id="stage-nav" className="flex flex-wrap items-center gap-2 mb-8 bg-[#0C0F14] p-2 rounded-2xl border border-slate-800/60">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isActive = activeStage === stage.id;
          const isPast = activeStage > stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => {
                if (isPast || isActive) {
                  setActiveStage(stage.id);
                  focusElement(`stage-${stage.id}-container`);
                }
              }}
              className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : isPast
                  ? 'bg-[#10151D] text-emerald-500/70 border border-emerald-500/10 hover:text-emerald-400 cursor-pointer'
                  : 'bg-transparent text-slate-500 border border-transparent cursor-not-allowed opacity-50'
              }`}
            >
              {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              <span>{stage.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Stage Content */}
      <div className="bg-[#0A0D11] rounded-3xl border border-slate-800/80 p-4 sm:p-6 min-h-[600px] shadow-2xl relative overflow-hidden">
        {activeStage === 1 && (
          <Stage1Wallet
            utxos={utxos}
            selectedUtxoIds={selectedUtxoIds}
            setSelectedUtxoIds={setSelectedUtxoIds}
            onNext={handleNextStage}
            focusElement={focusElement}
          />
        )}
        {activeStage === 2 && (
          <Stage2BuildTx
            utxos={utxos}
            selectedUtxoIds={selectedUtxoIds}
            currentTransaction={currentTransaction}
            setCurrentTransaction={setCurrentTransaction}
            setUtxos={setUtxos}
            onNext={handleNextStage}
            focusElement={focusElement}
          />
        )}
        {activeStage === 3 && (
          <Stage3Mempool
            currentTransaction={currentTransaction}
            mempool={mempool}
            setMempool={setMempool}
            onNext={handleNextStage}
            focusElement={focusElement}
          />
        )}
        {activeStage === 4 && (
          <Stage4MineBlock
            mempool={mempool}
            setMempool={setMempool}
            blockchain={blockchain}
            setBlockchain={setBlockchain}
            focusElement={focusElement}
          />
        )}
      </div>
    </section>
  );
};
