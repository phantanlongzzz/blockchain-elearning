import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { UTXO } from './types';
import { Check, ArrowRight, Coins } from 'lucide-react';

interface Props {
  utxos: UTXO[];
  selectedUtxoIds: string[];
  setSelectedUtxoIds: (ids: string[]) => void;
  onNext: () => void;
  focusElement: (id: string) => void;
}

export const Stage1Wallet: React.FC<Props> = ({ utxos, selectedUtxoIds, setSelectedUtxoIds, onNext, focusElement }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const aliceUtxos = utxos.filter((u) => u.owner === 'Alice' && !u.spent);
  const targetAmount = 10;
  const currentTotal = selectedUtxoIds.reduce((sum, id) => {
    const u = utxos.find((utxo) => utxo.id === id);
    return sum + (u ? u.value : 0);
  }, 0);

  const canProceed = currentTotal >= targetAmount;

  const toggleSelection = (id: string) => {
    setSelectedUtxoIds((prev) => {
      const newSelection = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      const newTotal = newSelection.reduce((sum, selId) => {
        const u = utxos.find((utxo) => utxo.id === selId);
        return sum + (u ? u.value : 0);
      }, 0);
      
      if (newTotal >= targetAmount) {
        focusElement('proceed-button');
      }
      return newSelection;
    });
  };

  return (
    <div id="stage-1-container" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <Coins className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{isVi ? 'Ví của Alice' : "Alice's Wallet"}</h2>
          <p className="text-sm text-slate-400">
            {isVi ? 'Nhiệm vụ: Gửi 10 BTC cho Bob' : 'Task: Send 10 BTC to Bob'}
          </p>
        </div>
      </div>

      <div className="bg-[#101419] rounded-2xl border border-slate-800 p-5">
        <p className="text-sm text-slate-300 mb-4">
          {isVi
            ? 'Bitcoin không lưu trữ số dư tĩnh. Nó lưu trữ các Đầu ra chưa chi tiêu (UTXO). Chọn các UTXO đủ 10 BTC để tạo giao dịch.'
            : 'Bitcoin does not store static balances. It stores Unspent Transaction Outputs (UTXOs). Select enough UTXOs to cover 10 BTC.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aliceUtxos.map((utxo) => {
            const isSelected = selectedUtxoIds.includes(utxo.id);
            return (
              <div
                key={utxo.id}
                onClick={() => toggleSelection(utxo.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    : 'bg-[#0B0E12] border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl font-bold text-white">{utxo.value} BTC</span>
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-transparent'}`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">TxID:</span>
                    <span className="text-slate-300 font-mono">{utxo.txid.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Index:</span>
                    <span className="text-slate-300 font-mono">{utxo.index}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#101419] rounded-2xl border border-slate-800 p-5">
        <div>
          <p className="text-sm text-slate-400 mb-1">{isVi ? 'Tổng đã chọn' : 'Selected Total'}</p>
          <div className="flex items-end gap-2">
            <span className={`text-2xl font-bold ${canProceed ? 'text-emerald-400' : 'text-white'}`}>
              {currentTotal} BTC
            </span>
            <span className="text-sm text-slate-500 mb-1">/ 10 BTC</span>
          </div>
        </div>

        <button
          id="proceed-button"
          disabled={!canProceed}
          onClick={onNext}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            canProceed
              ? 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>{isVi ? 'Tiếp tục tạo giao dịch' : 'Proceed to Build Transaction'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
