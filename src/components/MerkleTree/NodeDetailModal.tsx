import React, { useState } from 'react';
import {
  X,
  Layers,
  Crown,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Binary,
  Code,
  ArrowDown,
  Info,
} from 'lucide-react';
import { MerkleNode } from '../../types';
import { hexToBinary } from '../../utils/binary';

interface NodeDetailModalProps {
  node: MerkleNode | null;
  onClose: () => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({ node, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!node) return null;

  const isLeaf = node.level === 0;
  const isRoot = !node.leftChildId && node.level > 0; // or top level
  const binaryString = hexToBinary(node.hash);

  const handleCopy = () => {
    navigator.clipboard.writeText(node.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full sm:w-[400px] h-[85vh] sm:h-auto max-h-[100vh] sm:max-h-[90vh] bg-[#0C0F14] sm:border border-[#1C2430] sm:rounded-2xl rounded-t-2xl shadow-2xl text-[#F2F4F7] font-mono text-xs flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C2430] p-5 sm:p-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F131A] border border-[#1C2430] flex items-center justify-center text-[#00C98D]">
              {isLeaf ? (
                <FileText className="w-5 h-5 text-[#00C98D]" />
              ) : (
                <Layers className="w-5 h-5 text-[#F59E0B]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#F2F4F7] tracking-wider font-mono">
                  SOI CHI TIẾT MẬT MÃ NÚT MERKLE
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(0,201,141,0.1)] text-[#00C98D] border border-[rgba(0,201,141,0.35)]">
                  Tầng {node.level} : Vị trí {node.index}
                </span>
              </div>
              <p className="text-xs text-[#A5AFBF] font-sans mt-0.5">
                Chi tiết giá trị băm SHA-256 256-bit, tham số ghép chuỗi và tính toàn vẹn.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          {/* Node Classification & Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1C2430]">
              <span className="text-[10px] text-[#717B8C] uppercase block">
              Phân loại nút
            </span>
            <span className="font-bold text-[#00C98D]">
              {isLeaf ? 'Nút Lá (Giao dịch)' : 'Nút Cha (Ghép băm)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1C2430]">
            <span className="text-[10px] text-[#717B8C] uppercase block">
              Độ sâu cây
            </span>
            <span className="font-bold text-[#F2F4F7]">
              Tầng {node.level}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1C2430]">
            <span className="text-[10px] text-[#717B8C] uppercase block">
              Nhân đôi
            </span>
            <span className={`font-bold ${node.isDuplicated ? 'text-[#F59E0B]' : 'text-[#717B8C]'}`}>
              {node.isDuplicated ? 'Có (Số lẻ)' : 'Không'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1C2430]">
            <span className="text-[10px] text-[#717B8C] uppercase block">
              Tính toàn vẹn
            </span>
            <span className={`font-bold ${node.isTampered ? 'text-rose-400' : 'text-[#00C98D]'}`}>
              {node.isTampered ? '✕ Bị sửa đổi' : '✓ Hợp lệ'}
            </span>
          </div>
        </div>

        {/* Full 64-char Hash Display */}
        <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1C2430] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#A5AFBF] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-[#00C98D]" />
              <span>Chuỗi băm Hex 256-bit đầy đủ (64 ký tự hex):</span>
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-[#0F131A] hover:bg-[#11161E] border border-[#1C2430] text-[#00C98D] flex items-center gap-1 text-[10px] cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-[#00C98D]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép Hex'}</span>
            </button>
          </div>
          <div className="p-3 rounded-xl bg-[#0F131A] border border-[#1C2430] font-mono text-[#00C98D] break-all text-xs leading-relaxed">
            {node.hash}
          </div>
        </div>

        {/* Inputs Concatenation Breakdown */}
        {isLeaf && node.transaction ? (
          <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1C2430] space-y-2">
            <span className="text-[#A5AFBF] font-bold uppercase tracking-wider text-[11px] block">
              Dữ liệu giao dịch gốc (Pre-Image):
            </span>
            <div className="p-3 rounded-xl bg-[#0F131A] border border-[#1C2430] space-y-1.5 text-xs">
              <div><span className="text-[#717B8C]">Người gửi:</span> <span className="text-[#F2F4F7] font-bold">{node.transaction.sender}</span></div>
              <div><span className="text-[#717B8C]">Người nhận:</span> <span className="text-[#F2F4F7] font-bold">{node.transaction.receiver}</span></div>
              <div><span className="text-[#717B8C]">Số tiền:</span> <span className="text-[#00C98D] font-bold">{node.transaction.amount.toFixed(4)} BTC</span></div>
              <div><span className="text-[#717B8C]">Thời gian:</span> <span className="text-[#A5AFBF]">{node.transaction.timestamp}</span></div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1C2430] space-y-2">
            <span className="text-[#A5AFBF] font-bold uppercase tracking-wider text-[11px] block">
              Công thức nút cha & Các mã băm ghép đôi:
            </span>
            <div className="p-3 rounded-xl bg-[#0F131A] border border-[#1C2430] space-y-2">
              <div className="text-[10px] text-[#00C98D] font-mono">
                Công thức: Mã_Băm_Cha = SHA-256( Mã_Băm_Con_Trái || Mã_Băm_Con_Phải )
              </div>
              {node.combinedInput && (
                <div>
                  <span className="text-[10px] text-[#717B8C] block mb-1">
                    Chuỗi ghép đầu vào 128 ký tự:
                  </span>
                  <div className="p-2 rounded bg-[#090A0F] border border-[#1C2430] text-[10px] text-[#A5AFBF] break-all font-mono">
                    {node.combinedInput}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Binary Stream snippet */}
        <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1C2430] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#A5AFBF]">
            <span className="flex items-center gap-1 font-bold uppercase">
              <Binary className="w-3.5 h-3.5 text-[#00C98D]" />
              <span>Luồng nhị phân (128 bit đầu / 256 bit):</span>
            </span>
            <span className="text-[#717B8C]">256 Bits Total</span>
          </div>
          <div className="p-2 rounded bg-[#0F131A] font-mono text-[9px] text-[#A5AFBF] break-all leading-tight">
            {binaryString.slice(0, 128)}...
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-[#1C2430]">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#F2F4F7] border border-[#1C2430] font-mono font-bold cursor-pointer transition-all"
          >
            Đóng
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

