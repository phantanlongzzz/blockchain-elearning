import React, { useState } from 'react';
import { Plus, Copy, Check, ShieldCheck, ChevronDown } from 'lucide-react';
import { E2ETransaction } from './types';
import { calculateTxHash } from '../../utils/merkle';

interface TransactionCreateStepProps {
  onCreateTx: (tx: E2ETransaction) => void;
  isMining: boolean;
  language: 'vi' | 'en';
}

const PRESET_TXS = [
  { label: 'Alice → Bob · 10 BTC (Phí: 0.0005 BTC)', labelEn: 'Alice → Bob · 10 BTC (Fee: 0.0005 BTC)', sender: 'Alice', recipient: 'Bob', amount: 10.0, fee: 0.0005 },
  { label: 'Charlie → Dave · 5.25 BTC (Phí: 0.0008 BTC)', labelEn: 'Charlie → Dave · 5.25 BTC (Fee: 0.0008 BTC)', sender: 'Charlie', recipient: 'Dave', amount: 5.25, fee: 0.0008 },
  { label: 'Eva → Frank · 2.5 BTC (Phí: 0.0002 BTC)', labelEn: 'Eva → Frank · 2.5 BTC (Fee: 0.0002 BTC)', sender: 'Eva', recipient: 'Frank', amount: 2.5, fee: 0.0002 },
  { label: 'Satoshi → Hal Finney · 50 BTC (Phí: 0.001 BTC)', labelEn: 'Satoshi → Hal Finney · 50 BTC (Fee: 0.001 BTC)', sender: 'Satoshi', recipient: 'Hal Finney', amount: 50.0, fee: 0.001 },
  { label: 'Grace → Heidi · 1.15 BTC (Phí: 0.0003 BTC)', labelEn: 'Grace → Heidi · 1.15 BTC (Fee: 0.0003 BTC)', sender: 'Grace', recipient: 'Heidi', amount: 1.15, fee: 0.0003 },
];

export const TransactionCreateStep: React.FC<TransactionCreateStepProps> = ({
  onCreateTx,
  isMining,
  language,
}) => {
  const [sender, setSender] = useState('Alice');
  const [recipient, setRecipient] = useState('Bob');
  const [amount, setAmount] = useState<number>(10.0);
  const [fee, setFee] = useState<number>(0.0005);
  const [lastCreatedTx, setLastCreatedTx] = useState<E2ETransaction | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIdx = parseInt(e.target.value, 10);
    if (isNaN(selectedIdx) || selectedIdx < 0 || selectedIdx >= PRESET_TXS.length) return;
    const preset = PRESET_TXS[selectedIdx];
    setSender(preset.sender);
    setRecipient(preset.recipient);
    setAmount(preset.amount);
    setFee(preset.fee);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.trim() || !recipient.trim() || amount <= 0) return;

    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

    const txHash = calculateTxHash({
      sender: sender.trim(),
      receiver: recipient.trim(),
      amount: Number(amount),
      timestamp,
    });

    const newTx: E2ETransaction = {
      id: `tx-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      sender: sender.trim(),
      recipient: recipient.trim(),
      amount: Number(amount),
      feeBTC: Number(fee),
      timestamp,
      hash: txHash,
      status: 'mempool',
    };

    onCreateTx(newTx);
    setLastCreatedTx(newTx);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 1800);
  };

  return (
    <div id="e2e-tx-create-step" className="space-y-6 font-sans">
      {/* Step Header */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-zinc-100">
          {language === 'vi' ? 'Tạo giao dịch mới' : 'Create Transaction'}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
          {language === 'vi'
            ? 'Ký số và phát hành giao dịch mới vào mạng ngang hàng (P2P).'
            : 'Sign and broadcast a new cryptographic transaction to the peer-to-peer network.'}
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-[#0c101c] border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-5">
        {/* Preset Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800/80">
          <label className="text-xs font-medium text-zinc-300">
            {language === 'vi' ? 'Giao dịch mẫu:' : 'Sample preset:'}
          </label>
          <div className="relative">
            <select
              id="select-tx-preset"
              onChange={handleSelectPreset}
              defaultValue=""
              disabled={isMining}
              className="appearance-none bg-[#080c16] border border-zinc-800 hover:border-zinc-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-border-primary focus:ring-1 focus:ring-white/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <option value="" disabled>
                {language === 'vi' ? 'Chọn giao dịch mẫu ▾' : 'Choose a preset ▾'}
              </option>
              {PRESET_TXS.map((preset, idx) => (
                <option key={idx} value={idx}>
                  {language === 'vi' ? preset.label : preset.labelEn}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Transaction Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sender */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                {language === 'vi' ? 'Người gửi' : 'Sender'}
              </label>
              <input
                type="text"
                id="input-tx-sender"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Alice"
                disabled={isMining}
                className="w-full bg-[#080c16] border border-zinc-800 focus:border-border-primary focus:ring-1 focus:ring-white/20 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors disabled:opacity-50"
                required
              />
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                {language === 'vi' ? 'Người nhận' : 'Recipient'}
              </label>
              <input
                type="text"
                id="input-tx-recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Bob"
                disabled={isMining}
                className="w-full bg-[#080c16] border border-zinc-800 focus:border-border-primary focus:ring-1 focus:ring-white/20 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors disabled:opacity-50"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                {language === 'vi' ? 'Số lượng BTC' : 'Amount BTC'}
              </label>
              <input
                type="number"
                id="input-tx-amount"
                step="0.001"
                min="0.001"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                disabled={isMining}
                className="w-full bg-[#080c16] border border-zinc-800 focus:border-border-primary focus:ring-1 focus:ring-white/20 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none transition-colors disabled:opacity-50"
                required
              />
            </div>

            {/* Fee */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                {language === 'vi' ? 'Phí BTC' : 'Fee BTC'}
              </label>
              <input
                type="number"
                id="input-tx-fee"
                step="0.0001"
                min="0.0001"
                value={fee}
                onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
                disabled={isMining}
                className="w-full bg-[#080c16] border border-zinc-800 focus:border-border-primary focus:ring-1 focus:ring-white/20 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none transition-colors disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              id="btn-create-e2e-tx"
              disabled={isMining}
 className="px-4 py-2 rounded-lg bg-financial hover:bg-financial/90 text-black font-semibold font-medium text-xs flex items-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Tạo giao dịch' : 'Create Transaction'}</span>
            </button>
          </div>
        </form>

        {/* Live Signed Preview */}
        {lastCreatedTx && (
          <div className="pt-4 border-t border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-success flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {language === 'vi' ? 'Giao dịch đã ký thành công & phát hành vào Mempool' : 'Transaction signed & broadcast to Mempool'}
              </span>
              <span className="text-[11px] font-mono text-zinc-500">{lastCreatedTx.timestamp}</span>
            </div>

            <div className="bg-[#080c16] border border-zinc-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="text-xs text-zinc-200 font-medium">
                  {lastCreatedTx.sender} → {lastCreatedTx.recipient} · <span className="font-mono text-[#F6C453]">{lastCreatedTx.amount} BTC</span> (Phí: <span className="text-[#F6C453]">+{lastCreatedTx.feeBTC} BTC</span>)
                </div>
                <div className="text-[11px] font-mono text-zinc-400 truncate max-w-lg">
                  TXID: {lastCreatedTx.hash}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyHash(lastCreatedTx.hash)}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                {copiedHash ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? (language === 'vi' ? 'Đã sao chép' : 'Copied') : (language === 'vi' ? 'Sao chép TXID' : 'Copy TXID')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
