import React, { useState } from 'react';
import { Edit3, RotateCcw, Maximize2, ArrowRight, Boxes } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { TransactionItem } from '../../types';

interface TransactionCardProps {
  transaction: TransactionItem;
  onInspect: (tx: TransactionItem) => void;
  onTamper: (tx: TransactionItem) => void;
  onRestore: (tx: TransactionItem) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onInspect,
  onTamper,
  onRestore,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = async (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback
    }
  };

  const isOk = transaction.isValid;
  const isTampered = transaction.isTampered;

  const truncate = (str: string, lead = 8, tail = 4) => {
    if (!str) return '';
    if (str.length <= lead + tail) return str;
    return `${str.slice(0, lead)}...${str.slice(-tail)}`;
  };

  return (
    <div
      onClick={() => onInspect(transaction)}
      className={`rounded-xl p-4.5 border transition-all duration-200 relative cursor-pointer group flex flex-col justify-between ${
        isOk
          ? 'bg-[#0B0E12] border-[#1B2027] hover:border-[#00D084]/50 shadow-sm'
          : 'bg-[#120B0E] border-rose-500/50 hover:border-rose-400 shadow-sm'
      }`}
    >
      <div className="space-y-3">
        {/* Top Header: TX ID + Status */}
        <div className="flex items-center justify-between border-b border-[#1B2027] pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider">
              {transaction.txNumber}
            </span>
            {transaction.blockIndex && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#090C10] text-[#00D084] border border-[#1B2027] flex items-center gap-1">
                <Boxes className="w-2.5 h-2.5 text-[#00D084]" />
                <span>#{transaction.blockIndex}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            {isOk ? (
              <span className="text-[#00D084] flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D084]" />
                <span>{isVi ? 'Hợp lệ' : 'Valid'}</span>
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>{isVi ? 'Không hợp lệ' : 'Invalid'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Sender -> Receiver Flow */}
        <div className="flex items-center justify-between gap-2 text-xs font-sans">
          {/* Sender */}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-[#68717D] block uppercase font-semibold">
              {isVi ? 'Người gửi' : 'From'}
            </span>
            <div className="font-medium text-[#E7E9ED] truncate">
              {transaction.senderName || truncate(transaction.sender, 6, 4)}
            </div>
            <div className="text-[10px] font-mono text-[#68717D] truncate">
              {truncate(transaction.sender, 6, 4)}
            </div>
          </div>

          {/* Arrow */}
          <div className="p-1.5 rounded-full bg-[#090C10] border border-[#1B2027] text-[#00D084] shrink-0">
            <ArrowRight className="w-3 h-3" />
          </div>

          {/* Receiver */}
          <div className="min-w-0 flex-1 text-right">
            <span className="text-[10px] text-[#68717D] block uppercase font-semibold">
              {isVi ? 'Người nhận' : 'To'}
            </span>
            <div
              className={`font-medium truncate ${
                transaction.tamperedField === 'receiver' ? 'text-rose-400 font-bold' : 'text-[#E7E9ED]'
              }`}
            >
              {transaction.receiverName || truncate(transaction.receiver, 6, 4)}
            </div>
            <div className="text-[10px] font-mono text-[#68717D] truncate">
              {truncate(transaction.receiver, 6, 4)}
            </div>
          </div>
        </div>

        {/* Amount and Timestamp Line */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1B2027] text-xs">
          <div>
            <span className="text-[10px] text-[#68717D] block font-sans">
              {isVi ? 'Số tiền' : 'Amount'}
            </span>
            <span
              className={`font-mono font-bold text-sm sm:text-base ${
                transaction.tamperedField === 'amount' ? 'text-rose-400' : 'text-[#00D084]'
              }`}
            >
              {Number(transaction.amount).toFixed(2)} BTC
            </span>
            {transaction.tamperedField === 'amount' && transaction.originalValues && (
              <span className="text-[10px] font-mono text-[#68717D] line-through ml-1.5">
                ({Number(transaction.originalValues.amount).toFixed(2)})
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#68717D] block font-sans">
              {isVi ? 'Thời gian' : 'Time'}
            </span>
            <span className="text-[11px] font-mono text-[#9AA2AE]">
              {transaction.timestamp.split(' ')[1] || transaction.timestamp}
            </span>
          </div>
        </div>

        {/* Failure alert banner if invalid */}
        {!isOk && transaction.failureReason && (
          <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 font-sans leading-tight">
            <strong>{isVi ? 'Lỗi: ' : 'Error: '}</strong>
            {transaction.failureReason}
          </div>
        )}
      </div>

      {/* Card Action Controls */}
      <div className="pt-3 mt-3 border-t border-[#1B2027] flex items-center justify-between gap-2 font-sans text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspect(transaction);
          }}
          className="px-2.5 py-1.5 rounded-lg bg-[#0F1217] hover:bg-[#1A2028] text-[#C5CBD3] hover:text-white border border-[#1B2027] flex items-center gap-1.5 text-[11px] transition-all cursor-pointer"
        >
          <Maximize2 className="w-3 h-3 text-[#00D084]" />
          <span>{isVi ? 'Chi tiết' : 'Details'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {isTampered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestore(transaction);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#00D084]/20 hover:bg-[#00D084]/30 text-[#00D084] border border-[#00D084]/40 flex items-center gap-1 text-[11px] transition-all font-semibold cursor-pointer"
              title={isVi ? 'Khôi phục về trạng thái hợp lệ ban đầu' : 'Restore to original valid signed state'}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isVi ? 'Đặt lại' : 'Restore'}</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onTamper(transaction);
            }}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 text-[11px] transition-all font-semibold cursor-pointer ${
              isTampered
                ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-500/50'
                : 'bg-[#0F1217] hover:bg-[#1A2028] text-amber-300 border-[#1B2027] hover:border-amber-500/40'
            }`}
            title={isVi ? 'Thử sửa đổi nội dung giao dịch để xem chữ ký bị hỏng' : 'Modify payload to observe signature validation failure'}
          >
            <Edit3 className="w-3 h-3" />
            <span>{isTampered ? (isVi ? 'Sửa tiếp' : 'Tamper More') : (isVi ? 'Thử sửa' : 'Tamper')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
