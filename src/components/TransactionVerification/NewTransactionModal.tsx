import React, { useState } from 'react';
import { X, Key, Send } from 'lucide-react';
import { TransactionItem } from '../../types';
import { RESEARCH_WALLETS } from '../../data/transactionData';
import {
  computeTransactionDigest,
  signTransactionDigest,
  verifyTransactionSignature,
} from '../../utils/crypto';

interface NewTransactionModalProps {
  onClose: () => void;
  onAddTransaction: (tx: TransactionItem) => void;
  nextTxIndex: number;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  onClose,
  onAddTransaction,
  nextTxIndex,
}) => {
  const [senderId, setSenderId] = useState<string>(RESEARCH_WALLETS[0].id);
  const [receiverId, setReceiverId] = useState<string>(RESEARCH_WALLETS[1].id);
  const [amount, setAmount] = useState<number>(3.14);
  const [isProcessing, setIsProcessing] = useState(false);

  const senderWallet = RESEARCH_WALLETS.find((w) => w.id === senderId) || RESEARCH_WALLETS[0];
  const receiverWallet =
    RESEARCH_WALLETS.find((w) => w.id === receiverId) || RESEARCH_WALLETS[1];

  const handleCreateAndSign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const now = new Date();
      const timestamp = now.toISOString().replace('T', ' ').slice(0, 19);
      const txNumber = `TX-${String(nextTxIndex).padStart(3, '0')}`;
      const id = `tx-${Date.now()}`;

      const payload = {
        id,
        sender: senderWallet.publicKey,
        receiver: receiverWallet.publicKey,
        amount: Number(amount),
        timestamp,
      };

      // 1. Calculate canonical SHA-256 digest
      const digestResult = await computeTransactionDigest(payload);

      // 2. Sign digest with Sender's SECP256K1 Private Key
      const sigResult = await signTransactionDigest(digestResult.hex, senderWallet.privateKey);

      // 3. Verify with Sender's Public Key
      const isValid = await verifyTransactionSignature(
        digestResult.hex,
        sigResult.signatureHex,
        senderWallet.publicKey
      );

      const newTx: TransactionItem = {
        id,
        txNumber,
        sender: senderWallet.publicKey,
        senderName: senderWallet.name,
        receiver: receiverWallet.publicKey,
        receiverName: receiverWallet.name,
        amount: Number(amount),
        timestamp,
        signature: sigResult.signatureHex,
        signatureR: sigResult.r,
        signatureS: sigResult.s,
        algorithm: 'ECDSA · SECP256K1',
        hashAlgorithm: 'SHA-256',
        ellipticCurve: 'SECP256K1',
        currentDigest: digestResult.hex,
        isValid,
        originalValues: {
          sender: senderWallet.publicKey,
          receiver: receiverWallet.publicKey,
          amount: Number(amount),
          timestamp,
          digest: digestResult.hex,
        },
      };

      onAddTransaction(newTx);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-xl bg-bg-primary border border-border-primary p-6 sm:p-7 text-text-primary font-mono text-xs space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-primary pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teach-1/10 border border-teach-1/30 flex items-center justify-center text-teach-1">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wider font-mono">
                CREATE & SIGN TRANSACTION
              </h3>
              <p className="text-xs text-text-muted font-sans mt-0.5">
                ECDSA signature generation on SECP256K1 elliptic curve with SHA-256 hashing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-bg-secondary hover:bg-bg-elevated text-text-muted hover:text-white border border-border-primary cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreateAndSign} className="space-y-4">
          {/* Sender Selection */}
          <div>
            <label className="text-text-muted uppercase font-semibold text-[10px] block mb-1">
              SENDER ACCOUNT (Signs with Private Key):
            </label>
            <select
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-teach-1 font-mono text-xs cursor-pointer"
            >
              {RESEARCH_WALLETS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.role})
                </option>
              ))}
            </select>
          </div>

          {/* Receiver Selection */}
          <div>
            <label className="text-text-muted uppercase font-semibold text-[10px] block mb-1">
              RECEIVER ACCOUNT (Recipient):
            </label>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-teach-1 font-mono text-xs cursor-pointer"
            >
              {RESEARCH_WALLETS.filter((w) => w.id !== senderId).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.role})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="text-text-muted uppercase font-semibold text-[10px] block mb-1">
              TRANSFER AMOUNT (Units):
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-bg-secondary border border-border-primary rounded-lg px-3.5 py-2 text-financial font-bold focus:outline-none focus:border-teach-1 font-mono text-sm"
            />
          </div>

          {/* Cryptography preview note */}
          <div className="p-3 rounded-lg bg-bg-secondary border border-border-primary text-[11px] text-text-muted font-sans space-y-1">
            <span className="text-teach-1 font-mono font-bold uppercase text-[10px] block">
              Cryptographic Execution Pipeline:
            </span>
            <p>
              1. Constructs serialized payload → 2. Hashes with SHA-256 to produce 256-bit scalar → 3. Signs with {senderWallet.name}'s SECP256K1 private key → 4. Broadcasts for node verification.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border-primary">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-bg-secondary hover:bg-bg-elevated text-text-muted hover:text-white border border-border-primary cursor-pointer transition-colors text-xs font-mono"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg bg-teach-1 hover:bg-teach-1/90 text-bg-primary font-bold font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Signing & Hashing...' : 'Sign & Broadcast'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
