import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Layers, FileText, Copy, Check, Binary, Code, ArrowLeft } from 'lucide-react';
import { MerkleNode } from '../../types';
import { hexToBinary } from '../../utils/binary';

interface NodeDetailModalProps {
  node: MerkleNode | null;
  onClose: () => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({ node, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setPortalTarget(document.fullscreenElement || document.body);
    }
  }, [node]);

  useEffect(() => {
    if (node) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [node, onClose]);

  if (!node || !portalTarget) return null;

  const isLeaf = node.level === 0;
  const isRoot = !node.leftChildId && node.level > 0; // or top level
  const binaryString = hexToBinary(node.hash);

  const handleCopy = () => {
    navigator.clipboard.writeText(node.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex flex-col bg-[#090A0F] animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C2430] p-4 sm:p-5 shrink-0 bg-[#0C0F14]">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F131A] border border-[#1C2430] flex items-center justify-center text-teach-1 shrink-0">
              {isLeaf ? (
                <FileText className="w-5 h-5 text-teach-1" />
              ) : (
                <Layers className="w-5 h-5 text-financial" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#F2F4F7] tracking-wider font-mono">
                  SOI CHI TIẾT MẬT MÃ NÚT MERKLE
                </h3>
              </div>
              <p className="text-xs text-[#A5AFBF] font-sans mt-0.5 hidden sm:block">
                Chi tiết giá trị băm SHA-256 256-bit, tham số ghép chuỗi và tính toàn vẹn.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0F131A] text-teach-1 border border-[#1C2430] hidden sm:flex items-center gap-2">
            <span>Tầng {node.level}</span>
            <span className="w-1 h-1 rounded-full bg-[#1C2430]"></span>
            <span>Vị trí {node.index}</span>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Node Classification & Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0F131A] border border-[#1C2430]">
              <span className="text-[11px] text-[#717B8C] uppercase block mb-1">
                Phân loại nút
              </span>
              <span className="font-bold text-sm text-teach-1">
                {isLeaf ? 'Nút Lá (Giao dịch)' : 'Nút Cha (Ghép băm)'}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#0F131A] border border-[#1C2430]">
              <span className="text-[11px] text-[#717B8C] uppercase block mb-1">
                Độ sâu cây
              </span>
              <span className="font-bold text-sm text-[#F2F4F7]">
                Tầng {node.level}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#0F131A] border border-[#1C2430]">
              <span className="text-[11px] text-[#717B8C] uppercase block mb-1">
                Nhân đôi
              </span>
              <span className={`font-bold text-sm ${node.isDuplicated ? 'text-financial' : 'text-[#717B8C]'}`}>
                {node.isDuplicated ? 'Có (Số lẻ)' : 'Không'}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#0F131A] border border-[#1C2430]">
              <span className="text-[11px] text-[#717B8C] uppercase block mb-1">
                Tính toàn vẹn
              </span>
              <span className={`font-bold text-sm ${node.isTampered ? 'text-rose-400' : 'text-success'}`}>
                {node.isTampered ? '✕ Bị sửa đổi' : '✓ Hợp lệ'}
              </span>
            </div>
          </div>

          {/* Full 64-char Hash Display */}
          <div className="p-5 rounded-xl bg-[#0F131A] border border-[#1C2430] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A5AFBF] font-bold uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-teach-1" />
                <span>Chuỗi băm Hex 256-bit đầy đủ (64 ký tự hex):</span>
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-[#11161E] hover:bg-[#1C2430] border border-[#1C2430] text-teach-1 flex items-center gap-1.5 text-[11px] cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép Hex'}</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1C2430] font-mono text-teach-1 break-all text-sm sm:text-base leading-relaxed">
              {node.hash}
            </div>
          </div>

          {/* Inputs Concatenation Breakdown */}
          {isLeaf && node.transaction ? (
            <div className="p-5 rounded-xl bg-[#0F131A] border border-[#1C2430] space-y-3">
              <span className="text-[#A5AFBF] font-bold uppercase tracking-wider text-xs block">
                Dữ liệu giao dịch gốc (Pre-Image):
              </span>
              <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1C2430] space-y-2 text-sm">
                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-[#717B8C]">Người gửi:</span>
                  <span className="text-[#F2F4F7] font-bold">{node.transaction.sender}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-[#717B8C]">Người nhận:</span>
                  <span className="text-[#F2F4F7] font-bold">{node.transaction.receiver}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-[#717B8C]">Số tiền:</span>
                  <span className="text-financial font-bold">{node.transaction.amount.toFixed(4)} BTC</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-[#717B8C]">Thời gian:</span>
                  <span className="text-[#A5AFBF]">{node.transaction.timestamp}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-[#0F131A] border border-[#1C2430] space-y-3">
              <span className="text-[#A5AFBF] font-bold uppercase tracking-wider text-xs block">
                Công thức nút cha & Các mã băm ghép đôi:
              </span>
              <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1C2430] space-y-3">
                <div className="text-xs sm:text-sm text-teach-2 font-mono">
                  Công thức: Mã_Băm_Cha = SHA-256( Mã_Băm_Con_Trái || Mã_Băm_Con_Phải )
                </div>
                {node.combinedInput && (
                  <div>
                    <span className="text-xs text-[#717B8C] block mb-2 mt-4">
                      Chuỗi ghép đầu vào 128 ký tự:
                    </span>
                    <div className="p-3 rounded-lg bg-[#0C0F14] border border-[#1C2430] text-xs sm:text-sm text-[#A5AFBF] break-all font-mono">
                      {node.combinedInput}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Binary Stream snippet */}
          <div className="p-5 rounded-xl bg-[#0F131A] border border-[#1C2430] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#A5AFBF]">
              <span className="flex items-center gap-2 font-bold uppercase">
                <Binary className="w-4 h-4 text-teach-1" />
                <span>Luồng nhị phân (128 bit đầu / 256 bit):</span>
              </span>
              <span className="text-[#717B8C] font-bold">256 Bits Total</span>
            </div>
            <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1C2430] font-mono text-[10px] sm:text-xs text-[#A5AFBF] break-all leading-relaxed">
              {binaryString.slice(0, 128)}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalTarget);
};
