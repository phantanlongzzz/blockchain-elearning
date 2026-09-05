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
        <p className="text-sm text-slate-300 mb-4 whitespace-pre-line">
          {isVi
            ? 'Bitcoin không lưu trữ tiền dưới dạng một số dư cố định.\nTài sản được thể hiện thông qua các UTXO chưa được chi tiêu.\n\nHãy chọn các UTXO đủ để tạo giao dịch gửi 10 BTC cho Bob.'
            : 'Bitcoin does not store static balances. It stores Unspent Transaction Outputs (UTXOs).\nSelect enough UTXOs to cover 10 BTC.'}
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
                    ? 'bg-[#F5C451]/10 border-[#F5C451] shadow-[0_0_15px_rgba(214,168,74,0.1)]'
                    : 'bg-[#0B0E12] border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl font-bold text-money">{utxo.value} BTC</span>
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${isSelected ? 'bg-[#F5C451] text-amber-950' : 'bg-slate-800 text-transparent'}`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">TxID:</span>
                    <span className="text-blue-400 font-mono">{utxo.txid.slice(0, 8)}...</span>
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
            <span className={`text-2xl font-bold text-money`}>
              {currentTotal} BTC
            </span>
            <span className="text-sm text-financial font-mono mb-1">/ 10 BTC</span>
          </div>
          {canProceed && (
            <div className="flex items-center gap-1 text-success text-xs font-medium mt-1">
              <Check className="w-3.5 h-3.5" />
              {isVi ? 'Đủ để tạo giao dịch' : 'Sufficient to build transaction'}
            </div>
          )}
        </div>
        <button
          id="proceed-button"
          disabled={!canProceed}
          onClick={onNext}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            canProceed
              ? 'bg-success hover:bg-success/90 text-slate-950 font-bold'
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
