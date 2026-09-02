import React, { useState } from 'react';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ConsensusFinalChallengeProps {
  isHandsOn?: boolean;
  onInteracted?: () => void;
  onPrevStage?: () => void;
}

interface BlockTransaction {
  id: string;
  txCode: string;
  from: string;
  fromAddress: string;
  fromBalance: number;
  to: string;
  toAddress: string;
  amount: number;
  nonce: number;
  dataHash: string;
  signedHash: string;
  publicKey: string;
  signature: string;
  isFraud: boolean;
  fraudReasonVi: string;
  fraudReasonEn: string;
  validReasonVi: string;
  validReasonEn: string;
}

export const ConsensusFinalChallenge: React.FC<ConsensusFinalChallengeProps> = ({
  onInteracted,
  onPrevStage,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // 4 steps: 1 = Kiểm tra, 2 = Chọn giao dịch, 3 = Đồng thuận, 4 = Kết quả
  const [step, setStep] = useState<number>(1);
  const [inspectedTxId, setInspectedTxId] = useState<string | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<'pow' | 'pos' | 'bft' | null>('pow');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Candidate block data with neutral technical evidence (no spoilers in labels/status)
  const candidateBlock = {
    height: 1042,
    proposer: 'Charlie',
    txs: [
      {
        id: 'tx-01',
        txCode: 'TX-01',
        from: 'Alice',
        fromAddress: '0xAlice7192aBcD8910482019482710492837194029',
        fromBalance: 20.0,
        to: 'Bob',
        toAddress: '0xBob83910fEcD7194028472910482910394820193',
        amount: 2.5,
        nonce: 101,
        dataHash: '4a12f9b8c0e2d31a5f67b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
        signedHash: '4a12f9b8c0e2d31a5f67b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
        publicKey: '04a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde',
        signature: '3045022100a891f74c1029384756b1029384756c1029384756d1029384756e1029384756',
        isFraud: false,
        fraudReasonVi: 'Không phải giao dịch này.',
        fraudReasonEn: 'Not this transaction.',
        validReasonVi: 'Chữ ký ECDSA khớp chính xác với mã băm dữ liệu và số dư người gửi hợp lệ (20.0 BTC ≥ 2.5 BTC).',
        validReasonEn: 'ECDSA signature matches transaction payload digest and balance is sufficient (20.0 BTC ≥ 2.5 BTC).',
      },
      {
        id: 'tx-02',
        txCode: 'TX-02',
        from: 'Charlie',
        fromAddress: '0xCharlie3849102938475619283746192837461928',
        fromBalance: 50.0,
        to: 'Dave',
        toAddress: '0xDave192837461928374619283746192837461928',
        amount: 100.0,
        nonce: 102,
        dataHash: '7b88e14c9a0f123456789abcdef0123456789abcdef0123456789abcdef01234',
        signedHash: '1a249d3f5e6789abcdef0123456789abcdef0123456789abcdef0123456789ab',
        publicKey: '04f0e1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c',
        signature: '304402207b19283746501928374650192837465019283746501928374650192837465022',
        isFraud: true,
        fraudReasonVi: 'Chữ ký giao dịch không khớp mã băm dữ liệu (dữ liệu bị chỉnh sửa sau khi ký) và số dư không đủ (50.0 BTC < 100.0 BTC).',
        fraudReasonEn: 'Transaction signature does not match payload digest (tampered amount) and sender balance is insufficient (50.0 BTC < 100.0 BTC).',
        validReasonVi: 'Không hợp lệ.',
        validReasonEn: 'Invalid.',
      },
      {
        id: 'tx-03',
        txCode: 'TX-03',
        from: 'Eve',
        fromAddress: '0xEve99887766554433221100ffeeddccbbaa9988',
        fromBalance: 5.0,
        to: 'Frank',
        toAddress: '0xFrank112233445566778899aabbccddeeff1122',
        amount: 0.8,
        nonce: 103,
        dataHash: '9c31fa7d8e90123456789abcdef0123456789abcdef0123456789abcdef01234',
        signedHash: '9c31fa7d8e90123456789abcdef0123456789abcdef0123456789abcdef01234',
        publicKey: '048899aabbccddeeff00112233445566778899aabbccddeeff00112233445566',
        signature: '30460221008899aabbccddeeff00112233445566778899aabbccddeeff00112233445566',
        isFraud: false,
        fraudReasonVi: 'Không phải giao dịch này.',
        fraudReasonEn: 'Not this transaction.',
        validReasonVi: 'Chữ ký ECDSA khớp chính xác với mã băm dữ liệu và số dư người gửi hợp lệ (5.0 BTC ≥ 0.8 BTC).',
        validReasonEn: 'ECDSA signature matches transaction payload digest and balance is sufficient (5.0 BTC ≥ 0.8 BTC).',
      },
    ] as BlockTransaction[],
  };

  const handleToggleInspect = (id: string) => {
    setInspectedTxId((prev) => (prev === id ? null : id));
    onInteracted?.();
  };

  const handleSelectTx = (id: string) => {
    setSelectedTxId(id);
    if (step === 1) {
      setStep(2);
    }
    onInteracted?.();
  };

  const handleProceedToConsensus = () => {
    if (!selectedTxId) return;
    setStep(3);
    onInteracted?.();
  };

  const handleExecuteConsensus = () => {
    if (!selectedProtocol) return;
    setIsEvaluating(true);
    onInteracted?.();

    setTimeout(() => {
      setIsEvaluating(false);
      setStep(4);
    }, 600);
  };

  const handleReset = () => {
    setStep(1);
    setInspectedTxId(null);
    setSelectedTxId(null);
    setSelectedProtocol('pow');
    setIsEvaluating(false);
  };

  const isTxSelectionCorrect = selectedTxId === 'tx-02';

  const stepsList = [
    { num: 1, label: isVi ? 'Kiểm tra' : 'Inspect' },
    { num: 2, label: isVi ? 'Chọn giao dịch' : 'Select TX' },
    { num: 3, label: isVi ? 'Đồng thuận' : 'Consensus' },
    { num: 4, label: isVi ? 'Kết quả' : 'Result' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header: Clean and minimal */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 font-sans tracking-tight">
            {isVi ? 'Kiểm tra block' : 'Inspect block'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isVi
              ? 'Phát hiện giao dịch không hợp lệ trước khi chấp nhận block.'
              : 'Detect invalid transactions before accepting the block.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="self-start sm:self-auto text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isVi ? 'Khôi phục' : 'Reset'}</span>
        </button>
      </div>

      {/* 2. Progress: Minimal horizontal text indicator */}
      <div className="flex items-center gap-2 sm:gap-4 text-xs font-sans text-slate-400 overflow-x-auto pb-1">
        {stepsList.map((s, idx) => {
          const isActive = step === s.num;
          const isPassed = step > s.num;
          return (
            <React.Fragment key={s.num}>
              <div
                className={`flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-emerald-400 font-medium'
                    : isPassed
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                <span className="font-mono">{s.num}</span>
                <span>{s.label}</span>
              </div>
              {idx < stepsList.length - 1 && (
                <span className="text-slate-700">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 3 & 4. Block & Transactions (Steps 1 & 2) */}
      {(step === 1 || step === 2) && (
        <div className="rounded-xl bg-[#0B0E12] border border-slate-800 p-6 space-y-6">
          {/* Block Header */}
          <div className="flex items-center justify-between text-sm pb-4 border-b border-slate-800">
            <span className="font-semibold text-slate-200 font-mono">
              Block #{candidateBlock.height}
            </span>
            <span className="text-slate-400 text-xs sm:text-sm">
              {isVi ? 'Người đề xuất:' : 'Proposer:'}{' '}
              <span className="text-slate-200 font-medium">{candidateBlock.proposer}</span>
            </span>
          </div>

          {/* Subheader Instruction */}
          <div>
            <h3 className="text-sm font-medium text-slate-200">
              {isVi ? 'Chọn giao dịch không hợp lệ' : 'Select the invalid transaction'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isVi
                ? 'Nhấp vào từng hàng để kiểm tra bằng chứng mật mã và số dư trước khi đưa ra quyết định.'
                : 'Click any row to inspect cryptographic evidence and balances before making your decision.'}
            </p>
          </div>

          {/* Transactions List: Flat horizontal rows separated by subtle dividers */}
          <div className="divide-y divide-slate-800/80 border border-slate-800/80 rounded-lg overflow-hidden bg-[#080C10]">
            {candidateBlock.txs.map((tx) => {
              const isSelected = selectedTxId === tx.id;
              const isInspected = inspectedTxId === tx.id;

              return (
                <div key={tx.id} className="transition-colors">
                  {/* Summary Row */}
                  <div
                    onClick={() => {
                      handleToggleInspect(tx.id);
                    }}
                    className={`px-4 py-3.5 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/40 text-slate-100'
                        : isInspected
                        ? 'bg-slate-900/80 text-slate-200'
                        : 'hover:bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4 sm:gap-8">
                      <span
                        className={`font-mono text-xs font-medium ${
                          isSelected ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {tx.txCode}
                      </span>
                      <span className="text-slate-200 font-sans">
                        {tx.from} → {tx.to}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-slate-300 font-medium">
                        {tx.amount} BTC
                      </span>
                      <span className="text-slate-500 hover:text-slate-300 text-[11px]">
                        {isInspected
                          ? isVi
                            ? 'Đóng'
                            : 'Close'
                          : isVi
                          ? 'Kiểm tra'
                          : 'Inspect'}
                      </span>
                    </div>
                  </div>

                  {/* Compact Technical Evidence Panel (Revealed on click) */}
                  {isInspected && (
                    <div className="px-4 py-3.5 bg-[#080C10] border-t border-slate-800/80 text-xs space-y-3">
                      {/* Evidence Grid: Neutral data fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] font-mono">
                        <div className="space-y-0.5">
                          <span className="text-slate-500 font-sans text-[10px] block">
                            {isVi ? 'Người gửi & Số dư hiện tại:' : 'Sender & Current Balance:'}
                          </span>
                          <span className="text-slate-300">
                            {tx.from} ({tx.fromBalance} BTC)
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-slate-500 font-sans text-[10px] block">
                            {isVi ? 'Người nhận & Số tiền chuyển:' : 'Receiver & Transfer Amount:'}
                          </span>
                          <span className="text-slate-300">
                            {tx.to} ({tx.amount} BTC)
                          </span>
                        </div>

                        <div className="space-y-0.5 sm:col-span-2">
                          <span className="text-slate-500 font-sans text-[10px] block">
                            {isVi ? 'Mã băm dữ liệu giao dịch (SHA-256):' : 'Transaction Payload Hash (SHA-256):'}
                          </span>
                          <span className="text-slate-300 break-all text-[10px]">
                            {tx.dataHash}
                          </span>
                        </div>

                        <div className="space-y-0.5 sm:col-span-2">
                          <span className="text-slate-500 font-sans text-[10px] block">
                            {isVi ? 'Mã băm trích xuất từ chữ ký ECDSA:' : 'Digest Recovered from ECDSA Signature:'}
                          </span>
                          <span className="text-slate-300 break-all text-[10px]">
                            {tx.signedHash}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-slate-500 font-sans text-[10px] block">
                            {isVi ? 'Số thứ tự Nonce:' : 'Nonce:'}
                          </span>
                          <span className="text-slate-300">{tx.nonce}</span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-slate-500 font-sans text-[10px] block">
                            {isVi ? 'So khớp băm dữ liệu & chữ ký:' : 'Digest & Signature Match:'}
                          </span>
                          <span className="text-slate-300">
                            {tx.dataHash === tx.signedHash
                              ? isVi
                                ? 'Trùng khớp (0x... = 0x...)'
                                : 'Match (0x... = 0x...)'
                              : isVi
                              ? 'Không trùng khớp'
                              : 'Mismatch'}
                          </span>
                        </div>
                      </div>

                      {/* Action to select this transaction */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                        <span className="text-[11px] text-slate-400 font-sans">
                          {isSelected
                            ? isVi
                              ? 'Đã đánh dấu giao dịch này là không hợp lệ.'
                              : 'Marked as invalid transaction.'
                            : isVi
                            ? 'Chọn giao dịch này nếu bạn xác định nó không hợp lệ.'
                            : 'Select this transaction if you conclude it is invalid.'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTx(tx.id);
                          }}
                          className={`px-3 py-1.5 rounded text-xs font-medium font-sans transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-300'
                              : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200'
                          }`}
                        >
                          {isSelected
                            ? isVi
                              ? 'Đã chọn'
                              : 'Selected'
                            : isVi
                            ? 'Chọn giao dịch này'
                            : 'Select transaction'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA: Confirmation action button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 font-sans">
              {selectedTxId ? (
                <span>
                  {isVi ? 'Giao dịch được chọn: ' : 'Selected transaction: '}
                  <span className="font-mono text-slate-200 font-semibold">
                    {candidateBlock.txs.find((t) => t.id === selectedTxId)?.txCode}
                  </span>
                </span>
              ) : (
                <span className="text-slate-500">
                  {isVi
                    ? 'Chưa chọn giao dịch nào.'
                    : 'No transaction selected.'}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!selectedTxId}
              onClick={handleProceedToConsensus}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{isVi ? 'Xác nhận lựa chọn' : 'Confirm selection'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Step 3: Choose Consensus Protocol */}
      {step === 3 && (
        <div className="rounded-xl bg-[#0B0E12] border border-slate-800 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-200">
              {isVi ? 'Cơ chế đồng thuận' : 'Consensus mechanism'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isVi
                ? 'Chọn cơ chế để mạng lưới xác thực và xử lý block này.'
                : 'Select the mechanism for the network to validate and process this block.'}
            </p>
          </div>

          {/* 3 Simple Protocol Options */}
          <div className="space-y-2.5">
            {[
              {
                id: 'pow',
                name: 'Proof of Work',
                descVi: 'Các nút độc lập kiểm tra chữ ký và loại bỏ block không hợp lệ.',
                descEn: 'Independent nodes verify signatures and reject invalid blocks.',
              },
              {
                id: 'pos',
                name: 'Proof of Stake',
                descVi: 'Hội đồng Attestation kiểm tra chữ ký và trừng phạt (slash) nút đề xuất nếu phát hiện gian lận.',
                descEn: 'Attestation committee verifies signatures and slashes dishonest proposer.',
              },
              {
                id: 'bft',
                name: 'Byzantine Fault Tolerance (BFT)',
                descVi: 'Hội đồng biểu quyết loại bỏ đề xuất gian lận theo nguyên tắc đa số quá bán.',
                descEn: 'Quorum votes to discard Byzantine proposals through majority consensus.',
              },
            ].map((proto) => {
              const isSelected = selectedProtocol === proto.id;
              return (
                <div
                  key={proto.id}
                  onClick={() => setSelectedProtocol(proto.id as any)}
                  className={`p-4 rounded-lg border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#080C10] border-emerald-500/50 text-slate-100'
                      : 'bg-[#080C10] border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className={isSelected ? 'text-emerald-400' : 'text-slate-200'}>
                      {proto.name}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-emerald-400' : 'bg-transparent'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {isVi ? proto.descVi : proto.descEn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer py-1"
            >
              {isVi ? '← Quay lại' : '← Back'}
            </button>

            <button
              type="button"
              disabled={isEvaluating}
              onClick={handleExecuteConsensus}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>
                {isEvaluating
                  ? isVi
                    ? 'Đang thực thi...'
                    : 'Executing...'
                  : isVi
                  ? 'Chạy đồng thuận'
                  : 'Run consensus'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Step 4: Restrained, Precise Feedback */}
      {step === 4 && (
        <div className="rounded-xl bg-[#0B0E12] border border-slate-800 p-6 space-y-6">
          {/* Main Outcome */}
          <div className="space-y-1.5 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isTxSelectionCorrect ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <h3 className="text-sm font-semibold text-slate-100 font-sans">
                {isTxSelectionCorrect
                  ? isVi
                    ? 'Chính xác · Đã bảo vệ sổ cái'
                    : 'Correct · Ledger protected'
                  : isVi
                  ? 'Chưa chính xác'
                  : 'Incorrect'}
              </h3>
            </div>
            <p className="text-xs text-slate-300 pl-4">
              {isTxSelectionCorrect
                ? isVi
                  ? 'Bạn đã phát hiện chính xác giao dịch không hợp lệ trong Block #1042. Mạng lưới đã từ chối block rác và bảo toàn tính toàn vẹn của sổ cái.'
                  : 'You correctly identified the invalid transaction in Block #1042. The network rejected the malformed block and maintained ledger integrity.'
                : isVi
                ? 'Giao dịch bạn chọn là hợp lệ. Giao dịch TX-02 của Charlie mới là giao dịch có chữ ký không khớp.'
                : 'The transaction you selected was valid. TX-02 from Charlie was the transaction with the invalid signature.'}
            </p>
          </div>

          {/* Validation summary for all transactions in Block */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">
              {isVi ? 'Chi tiết giao dịch trong block:' : 'Transaction verification details:'}
            </span>

            <div className="divide-y divide-slate-800/80 border border-slate-800/80 rounded-lg overflow-hidden bg-[#080C10]">
              {candidateBlock.txs.map((tx) => {
                const isSelectedByLearner = selectedTxId === tx.id;

                return (
                  <div
                    key={tx.id}
                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-300 font-medium">{tx.txCode}</span>
                      <span className="text-slate-200">
                        {tx.from} → {tx.to} ({tx.amount} BTC)
                      </span>
                      {isSelectedByLearner && (
                        <span className="text-[11px] text-slate-500 font-mono">
                          ({isVi ? 'lựa chọn của bạn' : 'your choice'})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {tx.isFraud ? (
                        <span className="text-rose-400 flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <span>{isVi ? 'Không hợp lệ' : 'Invalid'}</span>
                          <span className="text-slate-500 font-normal">
                            · {isVi ? tx.fraudReasonVi : tx.fraudReasonEn}
                          </span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{isVi ? 'Hợp lệ' : 'Valid'}</span>
                          <span className="text-slate-500 font-normal">
                            · {isVi ? tx.validReasonVi : tx.validReasonEn}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors cursor-pointer"
            >
              {isVi ? 'Thử lại' : 'Try again'}
            </button>

            {onPrevStage && (
              <button
                type="button"
                onClick={onPrevStage}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer py-1"
              >
                {isVi ? '← Quay lại bài học' : '← Back to lessons'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
