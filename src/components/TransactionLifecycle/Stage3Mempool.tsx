import React, { useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Transaction } from './types';
import { ArrowRight, Database, Box } from 'lucide-react';

interface Props {
  currentTransaction: Transaction | null;
  mempool: Transaction[];
  setMempool: React.Dispatch<React.SetStateAction<Transaction[]>>;
  onNext: () => void;
  focusElement: (id: string) => void;
}

export const Stage3Mempool: React.FC<Props> = ({ currentTransaction, mempool, setMempool, onNext, focusElement }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useEffect(() => {
    // Add to mempool if not already there
    if (currentTransaction && currentTransaction.valid) {
      setMempool(prev => {
        if (prev.some(tx => tx.id === currentTransaction.id)) return prev;
        return [...prev, currentTransaction];
      });
      setTimeout(() => {
        focusElement(`tx-${currentTransaction.id}`);
      }, 300);
    }
  }, [currentTransaction, setMempool, focusElement]);

  const handleCreateCandidateBlock = () => {
    onNext();
  };

  return (
    <div id="stage-3-container" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <Database className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Mempool</h2>
          <p className="text-sm text-slate-400">
            {isVi ? 'Hàng chờ các giao dịch hợp lệ chưa được đưa vào khối.' : 'Waiting room for valid unconfirmed transactions.'}
          </p>
        </div>
      </div>

      <div className="bg-[#101419] rounded-2xl border border-slate-800 p-5">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
          <span className="text-sm text-slate-400">{isVi ? 'Các giao dịch đang chờ' : 'Pending Transactions'}</span>
          <span className="text-sm font-bold text-purple-400">{mempool.length} TXs</span>
        </div>

        <div className="space-y-3">
          {mempool.map((tx) => {
            const isUserTx = tx.id === currentTransaction?.id;
            return (
              <div 
                key={tx.id} 
                id={`tx-${tx.id}`}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isUserTx ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-[#0B0E12] border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-300">{tx.id}</span>
                    {isUserTx && <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">Your TX</span>}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Inputs: {tx.inputs.length} | Outputs: {tx.outputs.length}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 font-mono">Total:</span>
                  <span className="font-bold text-emerald-400">
                    {tx.outputs.reduce((sum, o) => sum + o.value, 0).toFixed(2)} BTC
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleCreateCandidateBlock}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] cursor-pointer"
        >
          <Box className="w-4 h-4" />
          <span>{isVi ? 'Đóng gói vào Khối Ứng cử viên' : 'Package into Candidate Block'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
