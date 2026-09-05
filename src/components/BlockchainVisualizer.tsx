import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  RefreshCw,
  Plus,
  Check,
  Copy,
  AlertTriangle,
  Unlink,
  CheckCircle2,
  Pencil,
  Eye,
  X,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { hashSha256 } from '../utils/sha256';
import { INITIAL_BLOCKCHAIN_DATA } from '../data/researchData';
import { BlockchainBlock } from '../types';

// ==========================================
// 1. INLINE HASH DISPLAY COMPONENT (DEVTOOLS FORMAT)
// ==========================================
interface InlineHashProps {
  hash: string;
  isError?: boolean;
  variant?: 'previous' | 'current';
}

const InlineHash: React.FC<InlineHashProps> = ({
  hash,
  isError,
  variant = 'current',
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  const formatted = hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : '00000000...0000';

  return (
    <div className="flex items-center justify-between font-mono tracking-tight tabular-nums text-xs py-0.5 group/hash">
      <span
        className={`${expanded ? 'break-all' : 'truncate'} select-all cursor-pointer ${
          isError
            ? 'text-rose-400 font-bold'
            : variant === 'previous'
            ? 'text-slate-300 hover:text-slate-100'
            : 'text-cyan-400 font-semibold'
        }`}
        title="Bấm để xem toàn bộ 64 ký tự băm"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
      >
        {expanded ? hash : formatted}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Sao chép mã băm"
        className="p-1 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer shrink-0 ml-1"
        title="Sao chép"
      >
        {copied ? (
          <Check className="w-3 h-3 text-cyan-400" />
        ) : (
          <Copy className="w-3 h-3 opacity-40 group-hover/hash:opacity-100 transition-opacity" />
        )}
      </button>
    </div>
  );
};

// ==========================================
// 2. MAIN BLOCKCHAIN VISUALIZER
// ==========================================
export const BlockchainVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // State
  const [blocks, setBlocks] = useState<BlockchainBlock[]>(INITIAL_BLOCKCHAIN_DATA);
  const [isMining, setIsMining] = useState<number | null>(null);
  const [simulatedNonce, setSimulatedNonce] = useState<number | null>(null);
  const [minedFeedback, setMinedFeedback] = useState<{
    blockIndex: number;
    nonce: number;
    triedCount: number;
  } | null>(null);

  const [difficulty] = useState<number>(3); // 3 leading zeros '000'
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
  const [newBlockData, setNewBlockData] = useState('');
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [expandedBlockId, setExpandedBlockId] = useState<number | null>(null);

  // Cascade invalidation transition effect
  const [invalidatingIndices, setInvalidatingIndices] = useState<Set<number>>(new Set());

  // Check prefers-reduced-motion
  const isReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const computeBlockHash = async (
    index: number,
    timestamp: string,
    previousHash: string,
    data: string,
    nonce: number
  ) => {
    const raw = `${index}|${timestamp}|${previousHash}|${data}|${nonce}`;
    const res = await hashSha256(raw);
    return res.hex;
  };

  // Recompute and validate the entire chain with cascade invalidation
  const validateAndSyncChain = useCallback(
    async (currentBlocks: BlockchainBlock[], triggerTamperIndex?: number) => {
      const updated: BlockchainBlock[] = [];
      const prefix = '0'.repeat(difficulty);

      for (let i = 0; i < currentBlocks.length; i++) {
        const b = currentBlocks[i];
        const prevHash = i === 0 ? '0'.repeat(64) : updated[i - 1].hash;
        const computedHash = await computeBlockHash(
          b.index,
          b.timestamp,
          prevHash,
          b.data,
          b.nonce
        );

        const hasValidPow = computedHash.startsWith(prefix);
        const isPreviousLinkValid = i === 0 || b.previousHash === updated[i - 1].hash;
        const isParentValid = i === 0 || updated[i - 1].isValid;
        const isValid = hasValidPow && isPreviousLinkValid && isParentValid;

        updated.push({
          ...b,
          originalHash: b.originalHash || b.hash,
          previousHash: prevHash,
          hash: computedHash,
          isValid,
        });
      }

      if (triggerTamperIndex !== undefined && !isReducedMotion && triggerTamperIndex < updated.length - 1) {
        const downstreamIndices: number[] = [];
        for (let j = triggerTamperIndex; j < updated.length; j++) {
          downstreamIndices.push(j);
        }

        setBlocks(updated);

        downstreamIndices.forEach((idx, step) => {
          setTimeout(() => {
            setInvalidatingIndices((prev) => new Set([...prev, idx]));
            setTimeout(() => {
              setInvalidatingIndices((prev) => {
                const next = new Set(prev);
                next.delete(idx);
                return next;
              });
            }, 400);
          }, step * 120);
        });
      } else {
        setBlocks(updated);
      }
    },
    [difficulty, isReducedMotion]
  );

  const handleDataChange = (index: number, newData: string) => {
    const nextBlocks = blocks.map((b, i) => (i === index ? { ...b, data: newData } : b));
    validateAndSyncChain(nextBlocks, index);
  };

  // Proof of Work Nonce Mining Animation
  const mineBlock = async (index: number) => {
    setIsMining(index);
    setMinedFeedback(null);
    const targetPrefix = '0'.repeat(difficulty);
    const b = blocks[index];
    const prevHash = index === 0 ? '0'.repeat(64) : blocks[index - 1].hash;

    let nonce = b.nonce;
    const maxIters = 300000;
    let winningNonce = nonce;
    let finalHash = '';
    let totalTried = 0;

    for (let i = 0; i < maxIters; i++) {
      nonce++;
      totalTried++;
      const candidateHash = await computeBlockHash(b.index, b.timestamp, prevHash, b.data, nonce);
      if (candidateHash.startsWith(targetPrefix)) {
        winningNonce = nonce;
        finalHash = candidateHash;
        break;
      }
    }

    if (!isReducedMotion) {
      const steps = 10;
      const stepDuration = 45;
      for (let s = 0; s < steps; s++) {
        await new Promise((res) => setTimeout(res, stepDuration));
        const pseudoNonce = Math.floor(
          b.nonce + (winningNonce - b.nonce) * ((s + 1) / steps) + (Math.random() * 40 - 20)
        );
        setSimulatedNonce(Math.max(b.nonce, pseudoNonce));
      }
    }

    const nextBlocks = blocks.map((item, idx) =>
      idx === index
        ? {
            ...item,
            nonce: winningNonce,
            hash: finalHash,
            originalHash: finalHash,
            previousHash: prevHash,
            isValid: true,
          }
        : item
    );

    await validateAndSyncChain(nextBlocks);
    setIsMining(null);
    setSimulatedNonce(null);
    setMinedFeedback({
      blockIndex: index,
      nonce: winningNonce,
      triedCount: totalTried,
    });

    setTimeout(() => {
      setMinedFeedback(null);
    }, 4000);
  };

  // Tamper attack simulation on Block #2
  const handleSimulateBlock2Tamper = () => {
    if (blocks.length <= 2) return;
    const nextBlocks = blocks.map((b, i) =>
      i === 2
        ? {
            ...b,
            data: 'Bob ➔ Dave: 250.0 BTC (Đã can thiệp)',
          }
        : b
    );
    validateAndSyncChain(nextBlocks, 2);
    setEditingBlockId(2);
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockData.trim()) return;

    const lastBlock = blocks[blocks.length - 1];
    const newIndex = blocks.length;
    const newTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const prevHash = lastBlock.hash;
    const initialNonce = 1000;
    const hash = await computeBlockHash(newIndex, newTimestamp, prevHash, newBlockData.trim(), initialNonce);

    const newBlock: BlockchainBlock = {
      id: newIndex,
      index: newIndex,
      timestamp: newTimestamp,
      previousHash: prevHash,
      data: newBlockData.trim(),
      nonce: initialNonce,
      hash,
      originalHash: hash,
      difficulty,
      isValid: false,
    };

    setIsAddBlockModalOpen(false);
    setNewBlockData('');
    const updated = [...blocks, newBlock];
    await validateAndSyncChain(updated);
  };

  const resetChain = () => {
    setBlocks(INITIAL_BLOCKCHAIN_DATA);
    setEditingBlockId(null);
    setExpandedBlockId(null);
    setMinedFeedback(null);
  };

  const isChainValid = blocks.every((b) => b.isValid);

  return (
    <section
      id="blockchain"
      className="py-5 sm:py-6 max-w-7xl mx-auto font-sans scroll-mt-20 text-slate-200"
    >
      {/* ========================================================
          1. HEADER & TOP CONTROL BAR (CLEAN & CONCISE)
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08] mb-5">
        {/* State Status Notification Line */}
        <div className="flex items-center gap-2">
          {isChainValid ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-sans text-slate-300 tracking-normal">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.8)]" />
              <span>
                {isVi
                  ? `Chuỗi ${blocks.length} khối · Liên kết mã băm SHA-256 toàn vẹn`
                  : `${blocks.length}-block chain · SHA-256 hash links verified`}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-sans text-rose-400 font-semibold tracking-normal">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
              <span>
                {isVi
                  ? 'Phát hiện sai lệch băm · Liên kết chuỗi bị đứt gãy'
                  : 'Hash mismatch detected · Chain link broken'}
              </span>
            </span>
          )}
        </div>

        {/* Action Button Cluster */}
        <div className="flex items-center gap-2">
          {/* Sửa dữ liệu mô phỏng */}
          <button
            type="button"
            id="blockchain-tamper-btn"
            onClick={handleSimulateBlock2Tamper}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 font-sans font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            title={isVi ? 'Sửa dữ liệu Khối #2 để mô phỏng can thiệp' : 'Simulate tampering on Block #2'}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{isVi ? 'Sửa dữ liệu' : 'Tamper Data'}</span>
          </button>

          {/* Thêm khối */}
          <button
            type="button"
            id="blockchain-add-block-btn"
            onClick={() => setIsAddBlockModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] hover:border-cyan-500/30 font-sans font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isVi ? 'Thêm khối' : 'Add Block'}</span>
          </button>

          {/* Đặt lại chuỗi */}
          <button
            type="button"
            id="blockchain-reset-btn"
            onClick={resetChain}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] hover:border-cyan-500/30 font-sans font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isVi ? 'Đặt lại chuỗi khối' : 'Reset blockchain'}
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>{isVi ? 'Đặt lại' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Mined Feedback Alert */}
      {minedFeedback && (
        <div className="mb-4 px-3.5 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300 font-sans tracking-normal">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              {isVi
                ? `Đã đào lại thành công Khối #${minedFeedback.blockIndex}: Nonce = `
                : `Block #${minedFeedback.blockIndex} mined: Nonce = `}
              <span className="font-mono font-semibold text-cyan-200">{minedFeedback.nonce.toLocaleString()}</span>
              {isVi
                ? ` (Đã thử ${minedFeedback.triedCount.toLocaleString()} giá trị)`
                : ` (${minedFeedback.triedCount.toLocaleString()} tested)`}
            </span>
          </div>
          <span className="font-mono font-bold text-cyan-400">000... ✓</span>
        </div>
      )}

      {/* ========================================================
          2. BLOCKCHAIN CHAIN CANVAS (BLOCK INSPECTOR LAYOUT)
          ======================================================== */}
      <div className="overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin">
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-0 min-w-full lg:min-w-max">
          {blocks.map((block, idx) => {
            const isGenesis = idx === 0;
            const isInvalid = !block.isValid;
            const isPrevLinkBroken = idx > 0 && block.previousHash !== blocks[idx - 1].hash;
            const isEditing = editingBlockId === block.id;
            const isExpanded = expandedBlockId === block.id;
            const isCascading = invalidatingIndices.has(idx);

            const hasNextBlock = idx < blocks.length - 1;
            const nextBlock = hasNextBlock ? blocks[idx + 1] : null;
            const isLinkToNextValid =
              hasNextBlock &&
              block.isValid &&
              nextBlock !== null &&
              nextBlock.previousHash === block.hash;

            return (
              <React.Fragment key={block.id}>
                {/* SINGLE BLOCK CARD */}
                <div className="w-full lg:w-[285px] xl:w-[305px] flex flex-col shrink-0">
                  <div
                    className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between flex-1 relative font-sans ${
                      isInvalid
                        ? isCascading
                          ? 'border-rose-500 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                          : 'border-rose-500/60 bg-rose-950/10 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : 'border-cyan-500/30 bg-[#0B101E]/80 hover:border-cyan-500/50 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* HEADER KHỐI: Tên khối & Icon Trạng thái góc phải */}
                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.08]">
                        <div className="font-sans font-semibold text-sm text-slate-100 tracking-normal flex items-center gap-1.5">
                          {isGenesis ? (
                            <>
                              <span className="text-amber-400 text-xs">◈</span>
                              <span>{isVi ? 'Khối nguyên thủy' : 'Genesis Block'}</span>
                            </>
                          ) : (
                            <span>{isVi ? `Khối #${block.index}` : `Block #${block.index}`}</span>
                          )}
                        </div>

                        {/* Status Icon Indicator */}
                        <div className="flex items-center gap-1.5">
                          {isInvalid ? (
                            <div className="flex items-center gap-1 text-[11px] font-sans text-rose-400" title="Mã băm không khớp">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span className="text-[10px] font-medium">{isVi ? 'Sai lệch băm' : 'Hash Error'}</span>
                            </div>
                          ) : (
                            <div title="Mã băm và liên kết toàn vẹn">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* TRƯỜNG 1: MÃ BĂM TRƯỚC (PREV HASH) */}
                      <div className="mb-2.5">
                        <div className="text-[10px] text-slate-400 uppercase font-sans font-medium tracking-wider mb-0.5">
                          {isVi ? 'Mã băm trước' : 'Previous Hash'}
                        </div>
                        <InlineHash
                          hash={block.previousHash}
                          variant="previous"
                          isError={isPrevLinkBroken}
                        />
                      </div>

                      {/* TRƯỜNG 2: DỮ LIỆU PAYLOAD */}
                      <div className="mb-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400 uppercase font-sans font-medium tracking-wider">
                            {isVi ? 'Dữ liệu' : 'Payload Data'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingBlockId(isEditing ? null : block.id)}
                            className="p-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                            title={isEditing ? (isVi ? 'Hủy sửa' : 'Cancel edit') : (isVi ? 'Sửa dữ liệu' : 'Edit data')}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Khung Text Payload */}
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <textarea
                              rows={2}
                              value={block.data}
                              onChange={(e) => handleDataChange(idx, e.target.value)}
                              placeholder="Nhập nội dung dữ liệu..."
                              className="w-full bg-black/60 border border-cyan-500/40 focus:border-cyan-400 rounded p-2 text-xs font-mono tracking-tight text-slate-200 focus:outline-none resize-none"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingBlockId(null)}
                                className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-[11px] font-sans font-medium cursor-pointer"
                              >
                                {isVi ? 'Xong' : 'Done'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => setEditingBlockId(block.id)}
                            className={`bg-black/40 border rounded p-2 font-mono tracking-tight text-xs cursor-pointer min-h-[44px] flex items-center transition-colors ${
                              isInvalid
                                ? 'border-rose-500/30 text-rose-200 hover:border-rose-500/50'
                                : 'border-white/[0.06] text-slate-200 hover:border-cyan-500/30'
                            }`}
                            title={isVi ? 'Bấm biểu tượng bút để chỉnh sửa' : 'Click pencil icon to edit'}
                          >
                            <span className="break-words leading-relaxed">{block.data}</span>
                          </div>
                        )}
                      </div>

                      {/* TRƯỜNG 3: MÃ BĂM KHỐI (BLOCK HASH) */}
                      <div className="mb-2">
                        <div className="text-[10px] text-slate-400 uppercase font-sans font-medium tracking-wider mb-0.5">
                          {isVi ? 'Mã băm khối' : 'Block Hash'}
                        </div>
                        <InlineHash
                          hash={block.hash}
                          variant="current"
                          isError={!block.hash.startsWith('0'.repeat(difficulty))}
                        />
                      </div>

                      {/* THÔNG SỐ NONCE & TIMESTAMP MỞ RỘNG (GỌN GÀNG) */}
                      <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="font-sans text-xs text-slate-400 font-normal">Nonce:</span>
                          <span className="font-mono tracking-tight tabular-nums text-xs font-semibold text-slate-200">
                            {isMining === idx && simulatedNonce !== null
                              ? simulatedNonce.toLocaleString()
                              : block.nonce.toLocaleString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                          className="hover:text-slate-200 transition-colors cursor-pointer"
                          title="Thông tin chi tiết"
                        >
                          <Eye className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                        </button>
                      </div>

                      {/* CHI TIẾT EXPANDED */}
                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-white/[0.04] space-y-1 text-xs font-sans text-slate-400 animate-in fade-in duration-100">
                          <div className="flex items-center justify-between">
                            <span className="font-sans text-[11px] text-slate-400">Thời gian:</span>
                            <span className="font-mono text-[11px] text-slate-300">{block.timestamp}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-sans text-[11px] text-slate-400">Mục tiêu băm:</span>
                            <span className="font-mono text-[11px] text-cyan-400">3 số 0 đầu (000...)</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NÚT ĐÀO LẠI KHỐI KHI CAN THIỆP HOẶC ĐANG MINING */}
                    {(isInvalid || isMining === idx) && (
                      <div className="pt-2.5 mt-2 border-t border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => mineBlock(idx)}
                          disabled={isMining !== null}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-sans ${
                            isMining === idx
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {isMining === idx ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                              <span className="font-sans">
                                {isVi ? 'Đang giải Nonce...' : 'Mining Nonce...'}
                              </span>
                              <span className="font-mono tracking-tight tabular-nums">
                                {simulatedNonce ? simulatedNonce.toLocaleString() : block.nonce.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 text-rose-400" />
                              <span className="font-sans">{isVi ? 'Đào lại khối này' : 'Re-mine Block'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ĐƯỜNG NỐI MÃ BĂM TRƯỚC (PREV HASH LINK CONNECTOR) */}
                {hasNextBlock && (
                  <div className="flex lg:flex-col items-center justify-center shrink-0 w-full lg:w-11 py-2 lg:py-0 px-2 lg:px-1 self-center select-none z-10">
                    {/* DESKTOP CONNECTOR (NGANG ───────────────▶) */}
                    <div className="hidden lg:flex flex-col items-center justify-center w-full">
                      <svg className="w-full h-5 overflow-visible" viewBox="0 0 44 20">
                        <defs>
                          <marker
                            id={`arrow-${idx}-${isLinkToNextValid ? 'valid' : 'invalid'}`}
                            viewBox="0 0 10 10"
                            refX="7"
                            refY="5"
                            markerWidth="5"
                            markerHeight="5"
                            orient="auto-start-reverse"
                          >
                            <path
                              d="M 0 1.5 L 8 5 L 0 8.5 z"
                              fill={isLinkToNextValid ? '#06b6d4' : '#f43f5e'}
                            />
                          </marker>
                        </defs>

                        <line
                          x1="2"
                          y1="10"
                          x2="38"
                          y2="10"
                          stroke={isLinkToNextValid ? '#06b6d4' : '#f43f5e'}
                          strokeWidth="1.75"
                          strokeDasharray={isLinkToNextValid ? 'none' : '3,3'}
                          strokeOpacity={isLinkToNextValid ? 0.75 : 0.9}
                          markerEnd={`url(#arrow-${idx}-${isLinkToNextValid ? 'valid' : 'invalid'})`}
                        />

                        {isLinkToNextValid && !isReducedMotion && (
                          <circle r="2" fill="#22d3ee">
                            <animate
                              attributeName="cx"
                              values="4; 36"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="cy"
                              values="10; 10"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </svg>
                      <span className={`text-[9px] font-mono tracking-tighter ${isLinkToNextValid ? 'text-cyan-500/70' : 'text-rose-500/80 font-bold'}`}>
                        {isLinkToNextValid ? 'Link' : 'Broken'}
                      </span>
                    </div>

                    {/* MOBILE CONNECTOR (DỌC ↓) */}
                    <div className="flex lg:hidden flex-col items-center justify-center my-1 w-full">
                      <svg className="w-5 h-7 overflow-visible" viewBox="0 0 20 28">
                        <defs>
                          <marker
                            id={`arrow-v-${idx}-${isLinkToNextValid ? 'valid' : 'invalid'}`}
                            viewBox="0 0 10 10"
                            refX="5"
                            refY="7"
                            markerWidth="5"
                            markerHeight="5"
                            orient="auto"
                          >
                            <path
                              d="M 1.5 0 L 5 8 L 8.5 0 z"
                              fill={isLinkToNextValid ? '#06b6d4' : '#f43f5e'}
                            />
                          </marker>
                        </defs>

                        <line
                          x1="10"
                          y1="2"
                          x2="10"
                          y2="22"
                          stroke={isLinkToNextValid ? '#06b6d4' : '#f43f5e'}
                          strokeWidth="1.75"
                          strokeDasharray={isLinkToNextValid ? 'none' : '3,3'}
                          strokeOpacity={isLinkToNextValid ? 0.75 : 0.9}
                          markerEnd={`url(#arrow-v-${idx}-${isLinkToNextValid ? 'valid' : 'invalid'})`}
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          3. ADD BLOCK MODAL (MINIMAL & STREAMLINED)
          ======================================================== */}
      {isAddBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans">
          <div className="relative w-full max-w-md bg-[#0B101E] border border-white/[0.12] rounded-xl p-5 shadow-2xl text-xs space-y-4 text-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-semibold text-slate-100 font-sans tracking-normal">
                {isVi ? `Thêm Khối #${blocks.length}` : `Append Block #${blocks.length}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddBlockModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBlock} className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs font-sans font-medium block mb-1">
                  {isVi ? 'Dữ liệu giao dịch:' : 'Transaction Payload:'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={newBlockData}
                  onChange={(e) => setNewBlockData(e.target.value)}
                  placeholder={isVi ? "Ví dụ: Alice ➔ Bob: 5.0 BTC" : "e.g. Alice ➔ Bob: 5.0 BTC"}
                  className="w-full bg-black/60 border border-white/[0.1] focus:border-cyan-400 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none font-mono tracking-tight resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddBlockModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white/[0.04] text-slate-400 hover:text-white rounded-lg text-xs font-sans font-medium cursor-pointer transition-colors"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-sans font-semibold text-xs rounded-lg transition-colors cursor-pointer hover:opacity-90"
                >
                  {isVi ? 'Nối khối' : 'Append Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

