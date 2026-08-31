import React, { useState } from 'react';
import {
  Crown,
  Copy,
  Check,
} from 'lucide-react';
import { MerkleNode } from '../../types';

interface MerkleNodeCardProps {
  node: MerkleNode;
  visualState: 'idle' | 'processing' | 'valid' | 'tampered';
  displayHash: string;
  isTechnicalMode: boolean;
  onInspect: (node: MerkleNode) => void;
  isRoot?: boolean;
  isSelected?: boolean;
  onSelectLeaf?: (txId: string) => void;
}

export const MerkleNodeCard: React.FC<MerkleNodeCardProps> = ({
  node,
  visualState,
  displayHash,
  isTechnicalMode,
  onInspect,
  isRoot = false,
  isSelected = false,
  onSelectLeaf,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(node.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClick = () => {
    if (node.transactionId && onSelectLeaf) {
      onSelectLeaf(node.transactionId);
    }
    onInspect(node);
  };

  const isTampered = Boolean(node.isTampered);
  const isProofTarget = Boolean(node.isProofTarget);
  const isProofSibling = Boolean(node.isProofSibling);
  const isProofPath = Boolean(node.isProofPath);
  const isLeaf = node.level === 0;

  // Modern Minimalist Single-Container Styling
  let borderClass = 'border-[#1C2430] hover:border-[#151C26]';
  let bgClass = 'bg-[#0C0F14]';
  let statusDotColor = 'bg-[#1C2430]';

  if (visualState === 'tampered') {
    borderClass = 'border-rose-500/60 hover:border-rose-400';
    bgClass = 'bg-rose-950/20';
    statusDotColor = 'bg-rose-500';
  } else if (visualState === 'valid') {
    if (isProofTarget) {
      borderClass = 'border-[#00C98D] ring-1 ring-[rgba(0,201,141,0.4)]';
      bgClass = 'bg-[#0F131A]';
      statusDotColor = 'bg-[#00C98D]';
    } else if (isProofSibling) {
      borderClass = 'border-[#717B8C] ring-1 ring-[#717B8C]/40';
      bgClass = 'bg-[#0F131A]';
      statusDotColor = 'bg-[#717B8C]';
    } else if (isProofPath) {
      borderClass = 'border-[#00C98D]/60 hover:border-[#00C98D]';
      bgClass = 'bg-[#0F131A]';
      statusDotColor = 'bg-[#00C98D]';
    } else if (isRoot) {
      borderClass = 'border-[#F59E0B]/40 hover:border-[#F59E0B]/80';
      bgClass = 'bg-[#0C0F14]';
      statusDotColor = 'bg-[#F59E0B]';
    } else {
      borderClass = 'border-[#00C98D]/30 hover:border-[#00C98D]/60';
      bgClass = 'bg-[#0F131A]';
      statusDotColor = 'bg-[#00C98D]';
    }
  } else if (visualState === 'processing') {
    borderClass = 'border-[#00C98D]/60';
    bgClass = 'bg-[#00C98D]/10';
    statusDotColor = 'bg-[#00C98D] animate-pulse';
  } else if (visualState === 'idle') {
    borderClass = 'border-[#1C2430] hover:border-[#1C2430]/80 opacity-60';
    bgClass = 'bg-[#090A0F]';
    statusDotColor = 'bg-[#1C2430]';
  }

  if (isSelected) {
    borderClass = 'border-[#00C98D] ring-1 ring-[rgba(0,201,141,0.6)]';
    bgClass = 'bg-[#0F131A]';
  }

  // Shortened display hash
  let shortHash = '';
  if (visualState === 'idle') {
    shortHash = '---';
  } else if (visualState === 'processing') {
    shortHash = displayHash;
  } else {
    shortHash = displayHash
      ? `${displayHash.slice(0, 6)}...${displayHash.slice(-4)}`
      : '0000...0000';
  }

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`relative w-full rounded-xl border p-3 text-left select-none transition-all duration-150 cursor-pointer shadow-sm ${borderClass} ${bgClass}`}
    >
      {/* Line 1: Node Title + Status Dot */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isRoot && <Crown className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />}
          <span
            className={`font-mono text-[11px] font-semibold truncate ${
              isRoot ? 'text-[#F59E0B]' : isLeaf ? 'text-[#F2F4F7]' : 'text-[#A5AFBF]'
            }`}
          >
            {isRoot ? 'Gốc' : isLeaf ? node.label : node.label || `H${node.level}_${node.index}`}
          </span>
          {node.isDuplicated && (
            <span className="text-[9px] font-mono text-[#F59E0B]/80 uppercase font-medium">
              dup
            </span>
          )}
        </div>

        {/* Subtle Status Dot */}
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${statusDotColor}`}
          title={
            visualState === 'tampered'
              ? 'Đã thay đổi'
              : visualState === 'processing'
              ? 'Đang tính toán...'
              : visualState === 'idle'
              ? 'Chưa khởi tạo'
              : isProofTarget
              ? 'Mục tiêu chứng minh'
              : isProofSibling
              ? 'Nút anh em'
              : isRoot
              ? 'Gốc Merkle'
              : 'SHA-256 hợp lệ'
          }
        />
      </div>

      {/* Line 2 (For Leaf): Alice → Bob • Amount */}
      {isLeaf && node.transaction && (
        <div className="mt-1.5 flex items-center justify-between gap-1 text-[11px] font-sans text-[#A5AFBF]">
          <span className="truncate text-[#F2F4F7]">
            {node.transaction.sender.split(' ')[0]} → {node.transaction.receiver.split(' ')[0]}
          </span>
          <span className="shrink-0 font-mono text-[#717B8C] text-[10px]">
            {node.transaction.amount.toFixed(2)} BTC
          </span>
        </div>
      )}

      {/* Line 2 (For Technical Mode on Parent): Formula preview */}
      {!isLeaf && !isRoot && isTechnicalMode && (
        <div className="mt-1 text-[10px] font-mono text-[#717B8C] truncate">
          SHA-256(H_L || H_R)
        </div>
      )}

      {/* Line 3: Shortened Hash + Copy Button */}
      <div className="mt-2 flex items-center justify-between gap-1 text-[11px] font-mono text-[#717B8C] pt-1.5 border-t border-[#1C2430]">
        <span className="truncate text-[#717B8C] font-mono text-[10px] tracking-tight hover:text-[#F2F4F7]">
          {shortHash}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded text-[#717B8C] hover:text-[#00C98D] hover:bg-[#11161E] transition-colors shrink-0 cursor-pointer"
          title="Sao chép mã băm"
        >
          {copied ? <Check className="w-3 h-3 text-[#00C98D]" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};
