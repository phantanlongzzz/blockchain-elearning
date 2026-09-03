import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { UTXO, Transaction, VerificationResult, TransactionInput, TransactionOutput } from './types';
import { ArrowRight, CheckCircle2, AlertCircle, Send, Play } from 'lucide-react';

interface Props {
  utxos: UTXO[];
  selectedUtxoIds: string[];
  currentTransaction: Transaction | null;
  setCurrentTransaction: (tx: Transaction) => void;
  setUtxos: React.Dispatch<React.SetStateAction<UTXO[]>>;
  onNext: () => void;
  focusElement: (id: string) => void;
}

export const Stage2BuildTx: React.FC<Props> = ({ utxos, selectedUtxoIds, currentTransaction, setCurrentTransaction, setUtxos, onNext, focusElement }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [verificationSteps, setVerificationSteps] = useState<VerificationResult[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  // Initialize transaction if not exists
  useEffect(() => {
    if (!currentTransaction && selectedUtxoIds.length > 0) {
      const selectedUtxos = selectedUtxoIds.map(id => utxos.find(u => u.id === id)!).filter(Boolean);
      const totalInput = selectedUtxos.reduce((sum, u) => sum + u.value, 0);
      
      const newTx: Transaction = {
        id: 'TX-NEW',
        inputs: selectedUtxos.map(u => ({
          txid: u.txid,
          index: u.index,
          sig: '30440220...a8f',
          pubKey: '02fab...c91',
          value: u.value
        })),
        outputs: [
          { address: 'Bob', value: 10 },
          { address: 'Alice (Change)', value: totalInput - 10 }
        ],
        valid: false
      };
      setCurrentTransaction(newTx);
    }
  }, [currentTransaction, selectedUtxoIds, utxos, setCurrentTransaction]);

  if (!currentTransaction) return null;

  const totalInput = currentTransaction.inputs.reduce((sum, i) => sum + i.value, 0);
  const totalOutput = currentTransaction.outputs.reduce((sum, o) => sum + o.value, 0);

  const tamperOutputValue = () => {
    setCurrentTransaction({
      ...currentTransaction,
      outputs: currentTransaction.outputs.map((o, i) => i === 0 ? { ...o, value: 12 } : o),
      tampered: true
    });
    setVerificationSteps([]);
  };

  const tamperSignature = () => {
    setCurrentTransaction({
      ...currentTransaction,
      inputs: currentTransaction.inputs.map((i, idx) => idx === 0 ? { ...i, sig: 'INVALID_SIG_999' } : i),
      tampered: true
    });
    setVerificationSteps([]);
  };

  const resetTransaction = () => {
    const selectedUtxos = selectedUtxoIds.map(id => utxos.find(u => u.id === id)!).filter(Boolean);
    const initialTotalInput = selectedUtxos.reduce((sum, u) => sum + u.value, 0);
    setCurrentTransaction({
      ...currentTransaction,
      inputs: selectedUtxos.map(u => ({
        txid: u.txid,
        index: u.index,
        sig: '30440220...a8f',
        pubKey: '02fab...c91',
        value: u.value
      })),
      outputs: [
        { address: 'Bob', value: 10 },
        { address: 'Alice (Change)', value: initialTotalInput - 10 }
      ],
      tampered: false,
      valid: false
    });
    setVerificationSteps([]);
  };

  const runVerification = () => {
    setIsVerifying(true);
    setVerificationSteps([]);
    focusElement('verification-panel');

    const steps: VerificationResult[] = [];
    
    setTimeout(() => {
      // Step 1: UTXO exists & unspent
      let utxoValid = true;
      currentTransaction.inputs.forEach(input => {
        const u = utxos.find(ut => ut.txid === input.txid && ut.index === input.index);
        if (!u || u.spent) utxoValid = false;
      });
      steps.push({
        step: isVi ? 'Kiểm tra UTXO đầu vào' : 'Check Input UTXOs',
        valid: utxoValid,
        message: utxoValid ? (isVi ? 'UTXO hợp lệ và chưa chi tiêu.' : 'UTXOs exist and are unspent.') : (isVi ? 'Phát hiện Double Spending hoặc UTXO không tồn tại.' : 'Double spending detected or UTXO missing.')
      });
      setVerificationSteps([...steps]);

      setTimeout(() => {
        // Step 2: Signature
        const sigValid = currentTransaction.inputs.every(i => i.sig.startsWith('3044'));
        steps.push({
          step: isVi ? 'Xác thực chữ ký (ScriptSig)' : 'Verify Signatures (ScriptSig)',
          valid: sigValid,
          message: sigValid ? (isVi ? 'Chữ ký mật mã hợp lệ.' : 'Cryptographic signatures valid.') : (isVi ? 'Chữ ký không khớp với ScriptPubKey.' : 'Signature does not match ScriptPubKey.')
        });
        setVerificationSteps([...steps]);

        setTimeout(() => {
          // Step 3: Amounts
          const amountValid = totalOutput <= totalInput;
          steps.push({
            step: isVi ? 'Kiểm tra số tiền' : 'Check Amounts',
            valid: amountValid,
            message: amountValid ? (isVi ? 'Tổng đầu ra <= Tổng đầu vào.' : 'Total output <= Total input.') : (isVi ? 'Đầu ra vượt quá đầu vào.' : 'Outputs exceed inputs.')
          });
          setVerificationSteps([...steps]);

          setTimeout(() => {
            const allValid = steps.every(s => s.valid);
            setCurrentTransaction({ ...currentTransaction, valid: allValid });
            setIsVerifying(false);
            if (allValid) {
              focusElement('send-mempool-btn');
            }
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleSendToMempool = () => {
    // Mark UTXOs as spent locally for simulation (Double spend test)
    setUtxos(prev => prev.map(u => {
      if (currentTransaction.inputs.some(i => i.txid === u.txid && i.index === u.index)) {
        return { ...u, spent: true }; // Mark as spent to prevent double spending in next iteration
      }
      return u;
    }));
    onNext();
  };

  const handleDoubleSpend = () => {
    // Actually mark a UTXO as spent to simulate double spending error
    setUtxos(prev => prev.map(u => {
      if (u.txid === currentTransaction.inputs[0].txid) {
        return { ...u, spent: true };
      }
      return u;
    }));
    setVerificationSteps([]);
  };

  return (
    <div id="stage-2-container" className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Transaction Flow */}
        <div className="flex-1 bg-[#101419] rounded-2xl border border-slate-800 p-5 relative">
          <h3 className="text-lg font-bold text-white mb-6 text-center">{isVi ? 'Cấu trúc Giao dịch' : 'Transaction Structure'}</h3>
          
          <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4 relative z-10">
            {/* Inputs */}
            <div className="flex-1 space-y-3">
              <div className="text-center text-sm font-bold text-slate-400 mb-2">{isVi ? 'ĐẦU VÀO (INPUTS)' : 'INPUTS'}</div>
              {currentTransaction.inputs.map((input, idx) => (
                <div key={idx} className="p-3 bg-[#0B0E12] border border-slate-700/50 rounded-xl relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-blue-400">TxID: {input.txid.slice(0, 8)}...</span>
                    <span className="text-sm font-bold text-money">{input.value} BTC</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono break-all bg-[#0A0D11] p-1.5 rounded border border-slate-800">
                    <span className="text-amber-400/70">Sig: </span>{input.sig}
                  </div>
                </div>
              ))}
              <div className="text-right text-sm font-bold text-money pr-2">
                Total: {totalInput} BTC
              </div>
            </div>

            {/* Middle Arrow */}
            <div className="flex items-center justify-center py-4 sm:py-0">
              <ArrowRight className="w-8 h-8 text-slate-600 rotate-90 sm:rotate-0" />
            </div>

            {/* Outputs */}
            <div className="flex-1 space-y-3">
              <div className="text-center text-sm font-bold text-slate-400 mb-2">{isVi ? 'ĐẦU RA (OUTPUTS)' : 'OUTPUTS'}</div>
              {currentTransaction.outputs.map((output, idx) => (
                <div key={idx} className={`p-3 rounded-xl border ${currentTransaction.tampered && idx === 0 ? 'bg-rose-950/20 border-rose-500/50' : 'bg-[#0B0E12] border-slate-700/50'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-300">{output.address}</span>
                    <span className={`text-sm font-bold ${currentTransaction.tampered && idx === 0 ? 'text-rose-400' : 'text-money'}`}>{output.value} BTC</span>
                  </div>
                </div>
              ))}
              <div className="text-right text-sm font-bold text-money pr-2">
                Total: {totalOutput} BTC
              </div>
            </div>
          </div>
        </div>

        {/* Verification Panel */}
        <div id="verification-panel" className="w-full lg:w-80 bg-[#101419] rounded-2xl border border-slate-800 p-5 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">{isVi ? 'Xác thực' : 'Verification'}</h3>
          
          <div className="flex-1 space-y-3 mb-6">
            {verificationSteps.length === 0 && !isVerifying && (
              <p className="text-sm text-slate-500 text-center py-4">
                {isVi ? 'Bấm "Xác thực" để kiểm tra tính hợp lệ.' : 'Click "Verify" to check validity.'}
              </p>
            )}
            
            {verificationSteps.map((step, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-1">
                  {step.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                  <span className={`text-sm font-bold ${step.valid ? 'text-emerald-400' : 'text-rose-400'}`}>{step.step}</span>
                </div>
                <p className="text-xs text-slate-400 pl-6">{step.message}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={runVerification}
              disabled={isVerifying}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>{isVerifying ? (isVi ? 'Đang kiểm tra...' : 'Verifying...') : (isVi ? 'Xác thực Giao dịch' : 'Verify Transaction')}</span>
            </button>
            
            {!isVerifying && currentTransaction.valid && (
              <button
                id="send-mempool-btn"
                onClick={handleSendToMempool}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer animate-in fade-in duration-500"
              >
                <span>{isVi ? 'Gửi vào Mempool' : 'Send to Mempool'}</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tampering Scenarios */}
      {!isVerifying && !currentTransaction.valid && (
        <div className="bg-[#151111] rounded-2xl border border-rose-900/30 p-5 mt-6">
          <h4 className="text-sm font-bold text-rose-400 mb-3">{isVi ? 'Mô phỏng lỗi' : 'Error Scenarios'}</h4>
          <div className="flex flex-wrap gap-3">
            <button onClick={tamperOutputValue} className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs hover:bg-rose-500/20 transition-all cursor-pointer">
              {isVi ? 'Sửa số tiền sai (> Đầu vào)' : 'Invalid Amount (> Inputs)'}
            </button>
            <button onClick={tamperSignature} className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs hover:bg-rose-500/20 transition-all cursor-pointer">
              {isVi ? 'Làm hỏng chữ ký ECDSA' : 'Corrupt Signature'}
            </button>
            <button onClick={handleDoubleSpend} className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs hover:bg-rose-500/20 transition-all cursor-pointer">
              {isVi ? 'Mô phỏng Double Spending' : 'Simulate Double Spend'}
            </button>
            {currentTransaction.tampered && (
              <button onClick={resetTransaction} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs hover:bg-slate-700 transition-all ml-auto cursor-pointer">
                {isVi ? 'Khôi phục' : 'Restore Valid State'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
