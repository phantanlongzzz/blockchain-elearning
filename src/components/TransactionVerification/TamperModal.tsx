import React, { useState } from 'react';
import { X, ShieldAlert, ArrowRight, RotateCcw, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { TransactionItem } from '../../types';
import { computeTransactionDigest, verifyTransactionSignature } from '../../utils/crypto';

interface TamperModalProps {
  transaction: TransactionItem | null;
  onClose: () => void;
  onApplyTamper: (updatedTx: TransactionItem) => void;
}

export const TamperModal: React.FC<TamperModalProps> = ({
  transaction,
  onClose,
  onApplyTamper,
}) => {
  if (!transaction) return null;

  const original = transaction.originalValues || {
    sender: transaction.sender,
    receiver: transaction.receiver,
    amount: transaction.amount,
    timestamp: transaction.timestamp,
    digest: transaction.currentDigest,
  };

  const [tamperedAmount, setTamperedAmount] = useState<number>(
    transaction.tamperedField === 'amount' ? transaction.amount : original.amount * 10
  );
  const [tamperedReceiver, setTamperedReceiver] = useState<string>(
    transaction.tamperedField === 'receiver'
      ? transaction.receiver
      : '04deadbeef9876543210abcdef0123456789abcdef0123456789abcdef01234567891234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  );
  const [tamperedTimestamp, setTamperedTimestamp] = useState<string>(transaction.timestamp);
  const [selectedTamperType, setSelectedTamperType] = useState<'amount' | 'receiver' | 'timestamp'>('amount');

  const handleApply = async () => {
    let newAmount = transaction.amount;
    let newReceiver = transaction.receiver;
    let newTimestamp = transaction.timestamp;
    let field: 'amount' | 'receiver' | 'timestamp' = selectedTamperType;

    if (selectedTamperType === 'amount') {
      newAmount = Number(tamperedAmount);
    } else if (selectedTamperType === 'receiver') {
      newReceiver = tamperedReceiver;
    } else if (selectedTamperType === 'timestamp') {
      newTimestamp = tamperedTimestamp;
    }

    const payload = {
      id: transaction.id,
      sender: transaction.sender,
      receiver: newReceiver,
      amount: newAmount,
      timestamp: newTimestamp,
      blockIndex: transaction.blockIndex,
    };

    // 1. Recalculate transaction SHA-256 digest
    const newDigestResult = await computeTransactionDigest(payload);

    // 2. Keep the original signature
    const sigToVerify = transaction.signature;

    // 3. Real ECDSA SECP256K1 verification
    const isValid = await verifyTransactionSignature(
      newDigestResult.hex,
      sigToVerify,
      transaction.sender
    );

    const isDifferent =
      newAmount !== original.amount ||
      newReceiver !== original.receiver ||
      newTimestamp !== original.timestamp;

    const updatedTx: TransactionItem = {
      ...transaction,
      amount: newAmount,
      receiver: newReceiver,
      timestamp: newTimestamp,
      currentDigest: newDigestResult.hex,
      isValid,
      isTampered: isDifferent,
      tamperedField: isDifferent ? field : 'none',
      originalValues: original,
      failureReason: isValid
        ? undefined
        : `Digital signature verification failed: ${field.toUpperCase()} modified after private key signing.`,
    };

    onApplyTamper(updatedTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0B0E12] border border-rose-500/50 p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.3)] text-[#E7E9ED] font-mono text-xs space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1B2027] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-wider font-mono">
                DATA TAMPERING DEMONSTRATION
              </h3>
              <p className="text-xs text-[#9AA2AE] font-sans mt-0.5">
                Modify transaction fields to observe how SHA-256 and ECDSA cryptographic authentication detect tampering.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#0F1217] hover:bg-[#1A2028] text-[#9AA2AE] hover:text-white border border-[#1B2027]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Educational Callout */}
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-[#C5CBD3] font-sans text-xs space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold text-rose-400 text-[11px] uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Cryptographic Principle under Demonstration</span>
          </div>
          <p className="leading-relaxed">
            In blockchain architectures, the sender signs the <strong>SHA-256 message digest</strong> with their private key. If an attacker or malicious node changes the amount or recipient address, the SHA-256 digest changes completely (due to the <em>Avalanche Effect</em>), causing the public key verification equation to fail.
          </p>
        </div>

        {/* Tamper Mode Tabs */}
        <div>
          <label className="text-[#9AA2AE] font-bold uppercase text-[10px] block mb-2">
            Select Field to Tamper:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'amount', label: '1. Tamper Amount' },
              { id: 'receiver', label: '2. Hijack Receiver' },
              { id: 'timestamp', label: '3. Alter Timestamp' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTamperType(tab.id as any)}
                className={`py-2 px-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                  selectedTamperType === tab.id
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                    : 'bg-[#090C10] text-[#9AA2AE] border-[#1B2027] hover:border-[#252B33]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Tamper Form */}
        <div className="p-4 rounded-xl bg-[#090C10] border border-[#1B2027] space-y-4">
          {selectedTamperType === 'amount' && (
            <div>
              <div className="flex justify-between items-center text-[11px] mb-2">
                <span className="text-[#9AA2AE]">Original Signed Amount:</span>
                <span className="text-[#00D084] font-bold">{original.amount.toFixed(2)} Units</span>
              </div>
              <label className="text-rose-400 font-bold uppercase text-[10px] block mb-1">
                Modified Amount (e.g. inflating transaction):
              </label>
              <input
                type="number"
                step="0.1"
                value={tamperedAmount}
                onChange={(e) => setTamperedAmount(Number(e.target.value))}
                className="w-full bg-[#0F1217] border border-rose-500/60 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-400 font-mono text-sm"
              />
              <div className="mt-2 flex gap-2">
                {[original.amount * 2, original.amount * 10, 100, 999].map((val) => (
                  <button
                    key={val}
                    onClick={() => setTamperedAmount(val)}
                    className="px-2.5 py-1 rounded bg-[#0F1217] hover:bg-[#1A2028] border border-[#1B2027] text-[#C5CBD3] text-[10px]"
                  >
                    Set {val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedTamperType === 'receiver' && (
            <div>
              <div className="flex justify-between items-center text-[11px] mb-2">
                <span className="text-[#9AA2AE]">Original Receiver:</span>
                <span className="text-[#00D084] font-bold truncate max-w-[200px]">
                  {original.receiver.slice(0, 14)}...
                </span>
              </div>
              <label className="text-rose-400 font-bold uppercase text-[10px] block mb-1">
                Tampered / Rogue Destination Address:
              </label>
              <input
                type="text"
                value={tamperedReceiver}
                onChange={(e) => setTamperedReceiver(e.target.value)}
                className="w-full bg-[#0F1217] border border-rose-500/60 rounded-xl px-3.5 py-2 text-rose-200 focus:outline-none focus:border-rose-400 font-mono text-xs"
              />
            </div>
          )}

          {selectedTamperType === 'timestamp' && (
            <div>
              <div className="flex justify-between items-center text-[11px] mb-2">
                <span className="text-[#9AA2AE]">Original Signed Timestamp:</span>
                <span className="text-[#00D084] font-bold">{original.timestamp}</span>
              </div>
              <label className="text-rose-400 font-bold uppercase text-[10px] block mb-1">
                Modified Timestamp:
              </label>
              <input
                type="text"
                value={tamperedTimestamp}
                onChange={(e) => setTamperedTimestamp(e.target.value)}
                className="w-full bg-[#0F1217] border border-rose-500/60 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-400 font-mono text-xs"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#1B2027]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0F1217] hover:bg-[#1A2028] text-[#9AA2AE] hover:text-white border border-[#1B2027]"
          >
            Cancel
          </button>

          <button
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-black font-bold font-mono text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Apply Tamper & Verify</span>
          </button>
        </div>
      </div>
    </div>
  );
};
