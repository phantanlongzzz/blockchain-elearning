import React, { useState, useCallback, useRef, useEffect } from 'react';
import { RefreshCw, Plus, ChevronDown, ChevronUp, Check, Copy, AlertTriangle, Unlink, CheckCircle2, Lock, ArrowRight, ShieldCheck, MoreHorizontal, Edit3, Eye } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { hashSha256 } from '../utils/sha256';
import { INITIAL_BLOCKCHAIN_DATA } from '../data/researchData';
import { BlockchainBlock } from '../types';

// ==========================================
// 1. INLINE HASH DISPLAY COMPONENT
// ==========================================
interface InlineHashProps {
  hash: string;
  prefixHighlight?: number;
  isError?: boolean;
  variant?: 'previous' | 'current';
}

const InlineHash: React.FC<InlineHashProps> = ({
  hash,
  prefixHighlight,
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
    <div className="flex items-center justify-between font-mono text-xs py-0.5 group/hash">
      <span
        className={`${expanded ? 'break-all' : 'truncate'} select-all cursor-pointer font-semibold`}
        title="Click để xem toàn bộ 64 ký tự"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
      >
        {expanded ? (
          <span
            className={
              isError
                ? 'text-[#fb7185]'
                : variant === 'previous'
                ? 'text-[#94a3b8]'
                : 'text-[#2dd4bf]'
            }
          >
            {hash}
          </span>
        ) : isError ? (
          <span className="text-[#fb7185] font-bold">{formatted}</span>
        ) : variant === 'previous' ? (
          <span className="text-[#94a3b8] hover:text-[#cbd5e1] transition-colors">
            {formatted}
          </span>
        ) : prefixHighlight && hash.startsWith('0'.repeat(prefixHighlight)) ? (
          <>
            <span className="text-[#2dd4bf] font-bold">
              {hash.slice(0, prefixHighlight)}
            </span>
            <span className="text-[#2dd4bf]/85">
              {hash.slice(prefixHighlight, 8)}...{hash.slice(-6)}
            </span>
          </>
        ) : (
          <span className="text-[#2dd4bf] font-medium">{formatted}</span>
        )}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Sao chép"
        className="p-1 text-[#94a3b8] hover:text-[#e5e7eb] transition-colors cursor-pointer shrink-0 ml-1"
        title="Sao chép"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-[#2dd4bf]" />
        ) : (
          <Copy className="w-3.5 h-3.5 opacity-50 group-hover/hash:opacity-100 transition-opacity" />
        )}
      </button>
    </div>
  );
};

// ==========================================
// 2. BLOCK PAYLOAD DISPLAY (BTC & TX FORMATTING)
// ==========================================
interface BlockDataDisplayProps {
  data: string;
  isGenesis?: boolean;
  isTampered?: boolean;
  isVi: boolean;
}

const BlockDataDisplay: React.FC<BlockDataDisplayProps> = ({
  data,
  isGenesis,
  isTampered,
  isVi,
}) => {
  if (isGenesis) {
    return (
      <div className="space-y-0.5 py-0.5">
        <div className="text-xs font-semibold text-[#e5e7eb] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f5c451]" />
          <span>Khởi tạo chuỗi</span>
        </div>
        <div className="text-[11px] text-[#94a3b8] font-mono truncate">
          {data.replace(/^GENESIS BLOCK #\d+:\s*/i, '') || 'Genesis Node Anchor'}
        </div>
      </div>
    );
  }

  // Check if data is formatted as transaction: "Tx: Sender -> Receiver [Amount BTC]"
  // Or "Alice -> Bob 10 BTC" or similar
  const txMatch = data.match(/(?:Tx:\s*)?([A-Za-z0-9_]+)\s*(?:->|→)\s*([A-Za-z0-9_]+)(?:\s*\[?([\d\.]+\s*BTC)\]?)?/i);

  if (txMatch && !isTampered) {
    const sender = txMatch[1];
    const receiver = txMatch[2];
    const btcAmount = txMatch[3];

    return (
      <div className="space-y-1 py-0.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#e5e7eb]">{sender}</span>
          <span className="text-[#64748b] px-1 font-mono text-[11px]">→</span>
          <span className="font-medium text-[#e5e7eb]">{receiver}</span>
        </div>
        {btcAmount ? (
          <div className="flex justify-end items-center font-mono text-xs font-semibold text-[#f5c451]">
            <span>{btcAmount}</span>
          </div>
        ) : (
          <div className="text-[11px] text-[#94a3b8] text-right font-mono">
            {isVi ? 'Giao dịch chuyển khoản' : 'Transfer transaction'}
          </div>
        )}
      </div>
    );
  }

  // If it mentions BTC anywhere in string, highlight BTC with #f5c451
  const btcRegex = /(\b\d+(?:\.\d+)?\s*BTC\b)/gi;
  const parts = data.split(btcRegex);

  return (
    <div className={`text-xs leading-relaxed break-words font-sans py-0.5 ${isTampered ? 'text-rose-300 font-medium' : 'text-[#e5e7eb]'}`}>
      {parts.map((part, i) =>
        btcRegex.test(part) ? (
          <span key={i} className="font-mono font-semibold text-[#f5c451] px-0.5">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </div>
  );
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export const BlockchainVisualizer: React.FC = () => {
  const { strings, language } = useLanguage();
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
  const [tamperedIndex, setTamperedIndex] = useState<number | null>(null);
  const [guideMode, setGuideMode] = useState<'guided' | 'free'>('guided');
  const [guideStepIndex, setGuideStepIndex] = useState<number>(0);

  // Per-block UI toggles
  const [activeActionMenu, setActiveActionMenu] = useState<number | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [expandedBlockId, setExpandedBlockId] = useState<number | null>(null);

  // Global drawers
  const [isAuditMatrixExpanded, setIsAuditMatrixExpanded] = useState<boolean>(false);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState<boolean>(false);

  // Cascade invalidation active state (tracks blocks in transition)
  const [invalidatingIndices, setInvalidatingIndices] = useState<Set<number>>(new Set());

  // Close menus when clicking outside
  const menuContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          }, step * 150);
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

  const handleNonceChange = (index: number, newNonce: number) => {
    const nextBlocks = blocks.map((b, i) => (i === index ? { ...b, nonce: newNonce } : b));
    validateAndSyncChain(nextBlocks);
  };

  // Proof of Work Nonce Mining Animation
  const mineBlock = async (index: number) => {
    setIsMining(index);
    setMinedFeedback(null);
    setActiveActionMenu(null);
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
      const steps = 12;
      const stepDuration = 50;
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
    }, 4500);
  };

  // Tamper attack simulation on Block #2
  const handleSimulateBlock2Tamper = () => {
    if (blocks.length <= 2) return;
    setTamperedIndex(2);
    const nextBlocks = blocks.map((b, i) =>
      i === 2
        ? {
            ...b,
            data: isVi
              ? 'Chuyển 1000 BTC cho Tin Tặc (0xDEADBEEF)'
              : 'Transfer 1000 BTC to Hacker (0xDEADBEEF)',
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
    setTamperedIndex(null);
    setGuideStepIndex(0);
    setActiveActionMenu(null);
    setEditingBlockId(null);
    setExpandedBlockId(null);
    setMinedFeedback(null);
  };

  const isAllLinksValid = blocks.every((b, i) => i === 0 || b.previousHash === blocks[i - 1].hash);
  const isChainValid = blocks.every((b) => b.isValid);

  // Stepper definition
  const chainSteps = [
    {
      step: 1,
      titleVi: 'Quan sát chuỗi khối toàn vẹn và mối liên kết giữa các Block',
      titleEn: 'Observe block continuity and cryptographic hash links',
      instructionVi: 'Mỗi khối lưu trữ mã băm của khối trước đó (Mã băm trước). Toàn bộ chuỗi đang ở trạng thái hợp lệ.',
      instructionEn: 'Each block embeds the hash of its parent block. All blocks are cryptographically verified.',
    },
    {
      step: 2,
      titleVi: 'Sửa dữ liệu mô phỏng tấn công (Thay đổi 1 ký tự)',
      titleEn: 'Simulate tampering by altering transaction data',
      instructionVi: 'Bấm nút "Sửa dữ liệu" hoặc sửa nội dung trong Khối #2 để chứng kiến hiệu ứng đứt gãy dây chuyền.',
      instructionEn: 'Click "Tamper Data" or modify Block #2 payload to watch downstream links break.',
    },
    {
      step: 3,
      titleVi: 'Phục hồi chuỗi bằng cơ chế Đào lại khối (Proof-of-Work)',
      titleEn: 'Recover chain validity via Proof-of-Work re-mining',
      instructionVi: 'Kẻ tấn công phải giải lại Proof-of-Work cho khối bị sửa và TẤT CẢ các khối phía sau.',
      instructionEn: 'The adversary must re-mine Proof-of-Work for the tampered block and all subsequent blocks.',
    },
  ];

  const currentStep = chainSteps[guideStepIndex];

  return (
    <section
      id="blockchain"
      ref={menuContainerRef}
      className="py-6 sm:py-8 max-w-7xl mx-auto font-sans scroll-mt-20 text-[#e5e7eb]"
    >
      {/* ========================================================
          1. HEADER & TOP CONTROL BAR
          ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(148,163,184,0.14)] mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#e5e7eb]">
            {isVi ? 'Mô phỏng chuỗi khối' : 'Blockchain Simulation'}
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-1 leading-relaxed">
            {isVi
              ? 'Quan sát cách liên kết mật mã bảo vệ tính bất biến của sổ cái khi dữ liệu bị thay đổi.'
              : 'Observe how cryptographic linking guarantees ledger immutability when data is altered.'}
          </p>
        </div>

        {/* Top Control Clusters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Cụm bên trái: Chế độ (Segmented control) */}
          <div className="flex items-center bg-[#090d12] p-1 rounded-lg border border-[rgba(148,163,184,0.14)] text-xs">
            <button
              type="button"
              id="blockchain-mode-guided-btn"
              onClick={() => setGuideMode('guided')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                guideMode === 'guided'
                  ? 'bg-[#161f2c] text-[#e5e7eb] font-semibold'
                  : 'text-[#94a3b8] hover:text-[#e5e7eb]'
              }`}
            >
              {guideMode === 'guided' && <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]" />}
              <span>{isVi ? 'Hướng dẫn' : 'Guided'}</span>
            </button>

            <button
              type="button"
              id="blockchain-mode-free-btn"
              onClick={() => setGuideMode('free')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                guideMode === 'free'
                  ? 'bg-[#161f2c] text-[#e5e7eb] font-semibold'
                  : 'text-[#94a3b8] hover:text-[#e5e7eb]'
              }`}
            >
              {guideMode === 'free' && <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]" />}
              <span>{isVi ? 'Tự do' : 'Free'}</span>
            </button>
          </div>

          {/* Cụm bên phải: Actions */}
          <div className="flex items-center gap-2">
            {/* Sửa dữ liệu (Cảnh báo/Nguy hiểm nhẹ) */}
            <button
              type="button"
              id="blockchain-tamper-btn"
              onClick={handleSimulateBlock2Tamper}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              title={isVi ? 'Sửa dữ liệu Khối #2 để mô phỏng tấn công' : 'Modify Block #2 data'}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{isVi ? 'Sửa dữ liệu' : 'Tamper Data'}</span>
            </button>

            {/* Thêm khối (Teal) */}
            <button
              type="button"
              id="blockchain-add-block-btn"
              onClick={() => setIsAddBlockModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#2dd4bf]/15 hover:bg-[#2dd4bf]/25 text-[#2dd4bf] border border-[#2dd4bf]/30 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isVi ? 'Thêm khối' : 'Add Block'}</span>
            </button>

            {/* Reset icon button */}
            <button
              type="button"
              id="blockchain-reset-btn"
              onClick={resetChain}
              className="p-2 rounded-lg bg-[#0d131b] hover:bg-[#161f2c] text-[#94a3b8] hover:text-[#e5e7eb] border border-[rgba(148,163,184,0.14)] transition-colors cursor-pointer"
              title={isVi ? 'Đặt lại chuỗi khối' : 'Reset blockchain'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. SLIM INSTRUCTION BAR (THẺ HƯỚNG DẪN BƯỚC)
          ======================================================== */}
      {guideMode === 'guided' && (
        <div
          id="blockchain-guided-banner"
          className="mb-6 px-4 py-3 rounded-xl bg-[#0d131b] border border-[rgba(148,163,184,0.14)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#2dd4bf] tracking-wider text-[11px]">
                {isVi ? `BƯỚC ${guideStepIndex + 1} / 3` : `STEP ${guideStepIndex + 1} / 3`}
              </span>
              <span className="text-[#64748b]">·</span>
              <span className="font-semibold text-[#e5e7eb]">
                {isVi ? currentStep.titleVi : currentStep.titleEn}
              </span>
            </div>
            <p className="text-[#94a3b8] text-xs leading-normal">
              {isVi ? currentStep.instructionVi : currentStep.instructionEn}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {guideStepIndex > 0 && (
              <button
                type="button"
                onClick={() => setGuideStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1 rounded-lg text-[#94a3b8] hover:text-[#e5e7eb] text-xs transition-colors cursor-pointer"
              >
                {isVi ? 'Lùi lại' : 'Back'}
              </button>
            )}

            {guideStepIndex < 2 ? (
              <button
                type="button"
                onClick={() => setGuideStepIndex((prev) => Math.min(2, prev + 1))}
                className="px-3.5 py-1.5 rounded-lg bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-slate-950 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <span>{isVi ? 'Tiếp' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={resetChain}
                className="px-3.5 py-1.5 rounded-lg bg-[#161f2c] hover:bg-[#202c3d] text-[#e5e7eb] font-medium text-xs border border-[rgba(148,163,184,0.14)] transition-colors cursor-pointer"
              >
                {isVi ? 'Bắt đầu lại' : 'Restart'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Attack Alert Bar (When Tampered/Invalid) */}
      {!isChainValid && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-rose-950/25 border border-rose-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <Unlink className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-semibold text-rose-300">
                {isVi ? 'Phát hiện can thiệp dữ liệu: Chuỗi bị đứt gãy' : 'Tampering Detected: Chain Broken'}
              </span>
              <p className="text-[#94a3b8] text-[11px] mt-0.5">
                {isVi
                  ? 'Mã băm của khối bị sửa đổi không còn khớp với "Mã băm trước" của các khối liền sau.'
                  : 'Modified payload altered the block hash, breaking downstream Previous Hash links.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('blockchain-deep-dive');
                if (el) {
                  setIsDeepDiveOpen(true);
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-2.5 py-1 rounded-md bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-medium cursor-pointer transition-colors"
            >
              {isVi ? 'Xem giải thích →' : 'Explanation →'}
            </button>
          </div>
        </div>
      )}

      {/* Nonce Mined Success Alert */}
      {minedFeedback && (
        <div className="mb-6 px-4 py-2.5 rounded-xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 flex items-center justify-between text-xs text-[#2dd4bf]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2dd4bf] shrink-0" />
            <span>
              {isVi
                ? `Đã đào thành công Khối #${minedFeedback.blockIndex}: Nonce = ${minedFeedback.nonce.toLocaleString()} (Đã kiểm tra ${minedFeedback.triedCount.toLocaleString()} nonces)`
                : `Block #${minedFeedback.blockIndex} mined: Nonce = ${minedFeedback.nonce.toLocaleString()} (${minedFeedback.triedCount.toLocaleString()} tested)`}
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold shrink-0">000... ✓</span>
        </div>
      )}

      {/* ========================================================
          3. HERO BLOCKCHAIN VISUALIZATION SECTION
          ======================================================== */}
      <div className="mb-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-sm font-semibold text-[#e5e7eb]">
              {isVi ? 'Chuỗi khối liên kết' : 'Connected Blockchain'}
            </h3>
            <span className="text-xs text-[#94a3b8] font-mono">
              {blocks.length} {isVi ? 'khối' : 'blocks'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAuditMatrixExpanded(!isAuditMatrixExpanded)}
            className="text-xs text-[#94a3b8] hover:text-[#2dd4bf] transition-colors cursor-pointer"
          >
            {isAuditMatrixExpanded
              ? (isVi ? 'Ẩn kiểm tra kỹ thuật' : 'Hide audit')
              : (isVi ? 'Kiểm tra kỹ thuật →' : 'Technical audit →')}
          </button>
        </div>

        {/* Collapsible Technical Audit Matrix */}
        {isAuditMatrixExpanded && (
          <div className="mb-4 p-4 rounded-xl bg-[#0d131b] border border-[rgba(148,163,184,0.14)] space-y-3 text-xs shadow-sm animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(148,163,184,0.14)]">
              <span className="font-semibold text-[#e5e7eb]">
                {isVi ? 'Bảng kiểm tra tính toàn vẹn chuỗi' : 'Chain Integrity Audit Matrix'}
              </span>
              <span className={`font-mono font-medium ${isChainValid ? 'text-[#2dd4bf]' : 'text-[#fb7185]'}`}>
                {isChainValid
                  ? (isVi ? '● Chuỗi hợp lệ' : '● Valid Chain')
                  : (isVi ? '● Chuỗi đứt gãy' : '● Broken Chain')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-[#090d12] border border-[rgba(148,163,184,0.14)] flex items-center justify-between">
                <div>
                  <span className="text-[#e5e7eb] font-medium block">
                    {isVi ? 'Toàn vẹn mã băm' : 'Hash Integrity'}
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">
                    SHA-256 (0x3 {isVi ? 'số 0 đầu' : 'zeros'})
                  </span>
                </div>
                <span className={`font-semibold ${isChainValid ? 'text-[#2dd4bf]' : 'text-[#fb7185]'}`}>
                  {isChainValid ? (isVi ? 'ĐẠT' : 'PASS') : (isVi ? 'LỖI' : 'FAIL')}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090d12] border border-[rgba(148,163,184,0.14)] flex items-center justify-between">
                <div>
                  <span className="text-[#e5e7eb] font-medium block">
                    {isVi ? 'Liên kết khối trước' : 'Parent Hash Link'}
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">
                    previousHash == parent.hash
                  </span>
                </div>
                <span className={`font-semibold ${isAllLinksValid ? 'text-[#2dd4bf]' : 'text-[#fb7185]'}`}>
                  {isAllLinksValid ? (isVi ? 'ĐẠT' : 'PASS') : (isVi ? 'LỖI' : 'FAIL')}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090d12] border border-[rgba(148,163,184,0.14)] flex items-center justify-between">
                <div>
                  <span className="text-[#e5e7eb] font-medium block">
                    {isVi ? 'Toàn vẹn tổng thể' : 'Overall Consensus'}
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">
                    {isVi ? 'Xác thực mật mã liên tục' : 'Sequential proof'}
                  </span>
                </div>
                <span className={`font-semibold ${isChainValid ? 'text-[#2dd4bf]' : 'text-[#fb7185]'}`}>
                  {isChainValid ? (isVi ? 'ĐẠT' : 'PASS') : (isVi ? 'ĐỨT GÃY' : 'BROKEN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            RESPONSIVE BLOCKCHAIN CHAIN:
            - Desktop: horizontal overflow-x-auto with thin clean scrollbar
            - Mobile (< lg): vertical stack with downward arrows
            ======================================================== */}
        <div className="overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin">
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-0 min-w-full lg:min-w-max">
            {blocks.map((block, idx) => {
              const isGenesis = idx === 0;
              const isInvalid = !block.isValid;
              const isPrevLinkBroken = idx > 0 && block.previousHash !== blocks[idx - 1].hash;
              const isExpanded = expandedBlockId === block.id;
              const isEditing = editingBlockId === block.id;
              const isMenuOpen = activeActionMenu === block.id;
              const isCascading = invalidatingIndices.has(idx);

              const hasOriginalHash = !!block.originalHash;
              const isHashAltered = hasOriginalHash && block.originalHash !== block.hash;

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
                  <div className="w-full lg:w-[290px] xl:w-[310px] flex flex-col shrink-0">
                    <div
                      className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between flex-1 relative ${
                        isGenesis
                          ? isInvalid
                            ? 'bg-[#0d131b] border-rose-500/60 ring-1 ring-rose-500/30'
                            : 'bg-[#0d131b] border-[rgba(245,196,81,0.3)] hover:border-[rgba(245,196,81,0.5)]'
                          : isInvalid
                          ? isCascading
                            ? 'bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/30'
                            : 'bg-[#0d131b] border-rose-500/50'
                          : 'bg-[#0d131b] border-[rgba(148,163,184,0.14)] hover:border-[rgba(148,163,184,0.25)]'
                      }`}
                    >
                      <div>
                        {/* 1. TOP ROW: Status badge on left, Menu ••• on right */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(148,163,184,0.14)]">
                          {/* Status: ● Hợp lệ / ● Không hợp lệ */}
                          {isInvalid ? (
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#fb7185]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#fb7185]" />
                              <span>{isVi ? 'Không hợp lệ' : 'Invalid'}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#2dd4bf]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]" />
                              <span>{isVi ? 'Hợp lệ' : 'Valid'}</span>
                            </span>
                          )}

                          {/* Menu ••• (More options) */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionMenu(isMenuOpen ? null : block.id);
                              }}
                              className="p-1 rounded text-[#94a3b8] hover:text-[#e5e7eb] hover:bg-[#161f2c] transition-colors cursor-pointer"
                              title="Tùy chọn khối"
                              aria-label="Tùy chọn khối"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Popover */}
                            {isMenuOpen && (
                              <div className="absolute right-0 top-full mt-1 w-44 rounded-lg bg-[#0d131b] border border-[rgba(148,163,184,0.18)] shadow-xl py-1 text-xs z-30 font-sans">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExpandedBlockId(isExpanded ? null : block.id);
                                    setActiveActionMenu(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-[#e5e7eb] hover:bg-[#161f2c] flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#94a3b8]" />
                                  <span>{isExpanded ? (isVi ? 'Ẩn chi tiết' : 'Hide details') : (isVi ? 'Xem chi tiết' : 'View details')}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingBlockId(isEditing ? null : block.id);
                                    setActiveActionMenu(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-[#e5e7eb] hover:bg-[#161f2c] flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#94a3b8]" />
                                  <span>{isEditing ? (isVi ? 'Đóng ô sửa' : 'Close edit') : (isVi ? 'Chỉnh sửa dữ liệu' : 'Edit data')}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    mineBlock(idx);
                                    setActiveActionMenu(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-[#2dd4bf] hover:bg-[#161f2c] flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>{isVi ? 'Đào lại khối' : 'Re-mine block'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 2. BLOCK TITLE */}
                        <div className="mb-1">
                          {isGenesis ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#f5c451] font-mono font-bold text-xs">◈</span>
                              <span className="font-mono font-bold text-xs text-[#e5e7eb] tracking-wide">
                                GENESIS BLOCK
                              </span>
                            </div>
                          ) : (
                            <div className="font-mono font-bold text-xs text-[#e5e7eb] tracking-wide">
                              BLOCK #{block.index}
                            </div>
                          )}
                        </div>

                        {/* 3. PREVIOUS HASH (Hash đầu tiên - trực tiếp dưới tiêu đề, không có label) */}
                        <div className="mb-3">
                          {isGenesis ? (
                            <InlineHash
                              hash="0000000000000000000000000000000000000000000000000000000000000000"
                              variant="previous"
                            />
                          ) : (
                            <InlineHash
                              hash={block.previousHash}
                              variant="previous"
                              isError={isPrevLinkBroken}
                            />
                          )}
                        </div>

                        {/* 4. DỮ LIỆU (Giữ lại nhãn DỮ LIỆU) */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                              {isVi ? 'DỮ LIỆU' : 'DATA'}
                            </span>
                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => setEditingBlockId(block.id)}
                                className="text-[10px] text-[#94a3b8] hover:text-[#2dd4bf] transition-colors cursor-pointer flex items-center gap-0.5"
                                title="Sửa dữ liệu khối này"
                              >
                                <span>{isVi ? 'Sửa' : 'Edit'}</span>
                              </button>
                            )}
                          </div>

                          {/* Editable Area or Clean Display Card */}
                          {isEditing ? (
                            <div className="space-y-1.5">
                              <textarea
                                rows={2}
                                value={block.data}
                                onChange={(e) => handleDataChange(idx, e.target.value)}
                                placeholder="Nhập dữ liệu giao dịch..."
                                className="w-full bg-[#090d12] border border-[rgba(148,163,184,0.18)] focus:border-[#2dd4bf] rounded-lg p-2 text-xs font-mono text-[#e5e7eb] focus:outline-none resize-none"
                              />
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setEditingBlockId(null)}
                                  className="px-2.5 py-1 rounded bg-[#161f2c] text-[#e5e7eb] text-[11px] font-medium hover:bg-[#202c3d] cursor-pointer"
                                >
                                  {isVi ? 'Xong' : 'Done'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => setEditingBlockId(block.id)}
                              className={`w-full bg-[#090d12] border rounded-lg p-2.5 text-xs transition-colors cursor-pointer min-h-[46px] flex flex-col justify-center ${
                                isInvalid
                                  ? 'border-rose-500/40 text-rose-200'
                                  : 'border-[rgba(148,163,184,0.14)] text-[#e5e7eb] hover:border-[rgba(148,163,184,0.25)]'
                              }`}
                              title={isVi ? 'Bấm để sửa dữ liệu' : 'Click to edit payload'}
                            >
                              <BlockDataDisplay
                                data={block.data}
                                isGenesis={isGenesis}
                                isTampered={isInvalid && block.data.includes('Tin Tặc')}
                                isVi={isVi}
                              />
                            </div>
                          )}
                        </div>

                        {/* 5. CURRENT HASH (Hash cuối cùng - ở cuối Block Card, không có label) */}
                        <div className="mb-2">
                          <InlineHash
                            hash={block.hash}
                            variant="current"
                            prefixHighlight={difficulty}
                            isError={!block.hash.startsWith('0'.repeat(difficulty))}
                          />
                        </div>

                        {/* 5. HASH DIFF ANALYSIS (When modified / tampered) */}
                        {isHashAltered && block.originalHash && (
                          <div className="mb-3 p-2.5 rounded-lg bg-[#090d12] border border-rose-500/35 text-[11px] font-mono space-y-1">
                            <div className="text-[10px] font-sans font-semibold text-rose-300 uppercase tracking-wider">
                              {isVi ? 'So sánh mã băm (Avalanche Effect)' : 'Hash Diff'}
                            </div>
                            <div className="flex items-center justify-between text-[#94a3b8] text-[10px]">
                              <span>{isVi ? 'Trước:' : 'Before:'}</span>
                              <span className="text-[#2dd4bf] font-bold">
                                {block.originalHash.slice(0, 8)}...{block.originalHash.slice(-6)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[#94a3b8] text-[10px]">
                              <span>{isVi ? 'Sau:' : 'After:'}</span>
                              <span className="text-[#fb7185] font-bold">
                                {block.hash.slice(0, 8)}...{block.hash.slice(-6)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* 6. EXPANDABLE TECHNICAL DETAILS */}
                        {isExpanded && (
                          <div className="mt-2 pt-2 border-t border-[rgba(148,163,184,0.14)] space-y-2 text-[11px] font-mono">
                            <div className="flex items-center justify-between">
                              <span className="text-[#94a3b8] text-[10px] uppercase">Timestamp</span>
                              <span className="text-[#e5e7eb] text-xs">{block.timestamp}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#94a3b8] text-[10px] uppercase">Nonce</span>
                              <span className="text-[#2dd4bf] font-bold text-xs">
                                {isMining === idx && simulatedNonce !== null
                                  ? simulatedNonce.toLocaleString()
                                  : block.nonce.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#94a3b8] text-[10px] uppercase">Độ khó mục tiêu</span>
                              <span className="text-[#e5e7eb] text-xs">{difficulty} số 0 (000...)</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 7. BOTTOM ACTION AREA:
                          - Mặc định KHÔNG hiển thị nút "Giải lại khối" trên các block hợp lệ bình thường!
                          - CHỈ hiển thị khi:
                            a) Block không hợp lệ (cần đào lại để sửa lỗi)
                            b) Hoặc đang thực hiện đào (isMining === idx)
                      */}
                      {(isInvalid || isMining === idx) && (
                        <div className="pt-2.5 mt-1 border-t border-[rgba(148,163,184,0.14)]">
                          <button
                            type="button"
                            onClick={() => mineBlock(idx)}
                            disabled={isMining !== null}
                            className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                              isMining === idx
                                ? 'bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/40'
                                : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {isMining === idx ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2dd4bf]" />
                                <span className="font-mono text-[11px]">
                                  {isVi ? 'Đang giải...' : 'Mining...'} Nonce:{' '}
                                  {simulatedNonce ? simulatedNonce.toLocaleString() : block.nonce.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>{isVi ? 'Đào lại khối này' : 'Re-mine this block'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CHAIN CONNECTOR LINK (BETWEEN BLOCK idx AND BLOCK idx+1) */}
                  {hasNextBlock && (
                    <div className="flex lg:flex-col items-center justify-center shrink-0 w-full lg:w-12 py-2 lg:py-0 px-2 lg:px-1 self-center select-none z-10">
                      {/* DESKTOP CONNECTOR (HORIZONTAL ───────────────▶) */}
                      <div className="hidden lg:flex items-center justify-center w-full">
                        <svg className="w-full h-6 overflow-visible" viewBox="0 0 48 20">
                          <defs>
                            <marker
                              id={`arrow-${idx}-${isLinkToNextValid ? 'valid' : 'invalid'}`}
                              viewBox="0 0 10 10"
                              refX="7"
                              refY="5"
                              markerWidth="6"
                              markerHeight="6"
                              orient="auto-start-reverse"
                            >
                              <path
                                d="M 0 1.5 L 8 5 L 0 8.5 z"
                                fill={isLinkToNextValid ? '#2dd4bf' : '#fb7185'}
                              />
                            </marker>
                          </defs>

                          <line
                            x1="2"
                            y1="10"
                            x2="40"
                            y2="10"
                            stroke={isLinkToNextValid ? '#2dd4bf' : '#fb7185'}
                            strokeWidth="1.75"
                            strokeDasharray={isLinkToNextValid ? 'none' : '4,4'}
                            strokeOpacity={isLinkToNextValid ? 0.8 : 0.85}
                            markerEnd={`url(#arrow-${idx}-${isLinkToNextValid ? 'valid' : 'invalid'})`}
                          />

                          {isLinkToNextValid && !isReducedMotion && (
                            <circle r="2.2" fill="#2dd4bf">
                              <animate
                                attributeName="cx"
                                values="4; 38"
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
                      </div>

                      {/* MOBILE CONNECTOR (VERTICAL ↓) */}
                      <div className="flex lg:hidden items-center justify-center my-2 w-full">
                        <svg className="w-6 h-8 overflow-visible" viewBox="0 0 20 32">
                          <defs>
                            <marker
                              id={`arrow-v-${idx}-${isLinkToNextValid ? 'valid' : 'invalid'}`}
                              viewBox="0 0 10 10"
                              refX="5"
                              refY="7"
                              markerWidth="6"
                              markerHeight="6"
                              orient="auto"
                            >
                              <path
                                d="M 1.5 0 L 5 8 L 8.5 0 z"
                                fill={isLinkToNextValid ? '#2dd4bf' : '#fb7185'}
                              />
                            </marker>
                          </defs>

                          <line
                            x1="10"
                            y1="2"
                            x2="10"
                            y2="24"
                            stroke={isLinkToNextValid ? '#2dd4bf' : '#fb7185'}
                            strokeWidth="1.75"
                            strokeDasharray={isLinkToNextValid ? 'none' : '4,4'}
                            strokeOpacity={isLinkToNextValid ? 0.8 : 0.85}
                            markerEnd={`url(#arrow-v-${idx}-${isLinkToNextValid ? 'valid' : 'invalid'})`}
                          />

                          {isLinkToNextValid && !isReducedMotion && (
                            <circle r="2.2" fill="#2dd4bf">
                              <animate
                                attributeName="cy"
                                values="4; 22"
                                dur="2s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="cx"
                                values="10; 10"
                                dur="2s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          )}
                        </svg>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MINIMALIST ACCORDION: "VÌ SAO BLOCKCHAIN CÓ TÍNH BẤT BIẾN?"
          ======================================================== */}
      <div id="blockchain-deep-dive" className="pt-2 border-t border-[rgba(148,163,184,0.14)]">
        <button
          type="button"
          onClick={() => setIsDeepDiveOpen(!isDeepDiveOpen)}
          className="w-full py-3 flex items-center justify-between text-left text-xs text-[#94a3b8] hover:text-[#e5e7eb] transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <span className="text-[#f5c451]">💡</span>
            <span className="font-semibold text-[#e5e7eb] group-hover:text-[#2dd4bf] transition-colors">
              {isVi ? 'Vì sao Blockchain có tính bất biến?' : 'Why is Blockchain immutable?'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#94a3b8]">
            <span>{isDeepDiveOpen ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Mở rộng' : 'Expand')}</span>
            {isDeepDiveOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {isDeepDiveOpen && (
          <div className="pt-2 pb-6 space-y-6 text-xs animate-in fade-in duration-150">
            {/* Visual Flow Diagram */}
            <div className="p-4 rounded-xl bg-[#0d131b] border border-[rgba(148,163,184,0.14)] space-y-3">
              <p className="text-[#94a3b8] leading-relaxed">
                {isVi
                  ? 'Blockchain không hoàn toàn “không thể thay đổi”. Tính bất biến đến từ việc mỗi Block chứa mã băm của Block trước đó.'
                  : 'Blockchain is not inherently uneditable. Its immutability arises because every Block embeds the hash of its parent block.'}
              </p>

              <div className="text-[11px] font-semibold text-[#2dd4bf]">
                {isVi ? 'Nếu dữ liệu Block #1 thay đổi:' : 'If Block #1 payload is modified:'}
              </div>

              {/* Step Flow Box */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-[#090d12] border border-[rgba(148,163,184,0.14)] text-center">
                  <span className="text-[#fb7185] font-semibold block">Hash #1</span>
                  <span className="text-[10px] text-[#94a3b8]">{isVi ? 'thay đổi hoàn toàn' : 'changes completely'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#090d12] border border-[rgba(148,163,184,0.14)] text-center">
                  <span className="text-[#fb7185] font-semibold block">Prev Hash #2</span>
                  <span className="text-[10px] text-[#94a3b8]">{isVi ? 'không còn khớp' : 'no longer matches'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#090d12] border border-[rgba(148,163,184,0.14)] text-center">
                  <span className="text-[#fb7185] font-semibold block">Block #2</span>
                  <span className="text-[10px] text-[#94a3b8]">{isVi ? 'trở nên không hợp lệ' : 'becomes invalid'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#090d12] border border-rose-500/40 text-center">
                  <span className="text-rose-300 font-semibold block">{isVi ? 'Toàn bộ chuỗi' : 'Entire chain'}</span>
                  <span className="text-[10px] text-[#94a3b8]">{isVi ? 'phía sau bị vô hiệu hóa' : 'downstream breaks'}</span>
                </div>
              </div>
            </div>

            {/* Core Explanations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0d131b] border border-[rgba(148,163,184,0.14)] space-y-2">
                <div className="text-[#e5e7eb] font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#2dd4bf]" />
                  <span>{isVi ? 'Vì sao mã băm trước phát hiện được sự thay đổi?' : 'Why does previousHash detect tampering?'}</span>
                </div>
                <p className="text-[#94a3b8] leading-relaxed">
                  {isVi
                    ? 'Mỗi khối tính toán mã băm trên toàn bộ dữ liệu của chính nó VÀ mã băm của khối liền trước (Mã băm trước). Khi bạn sửa đổi dù chỉ 1 ký tự ở Khối #2, mã băm Khối #2 thay đổi hoàn toàn. Do Khối #3 vẫn lưu mã băm cũ, liên kết bị đứt gãy, kéo theo toàn bộ các khối #3, #4 phía sau bị vô hiệu hóa.'
                    : 'Every block computes its hash over its payload plus the preceding block’s previousHash digest. Modifying even a single character in Block #2 changes its hash drastically, immediately breaking the link to Block #3 and invalidating all subsequent blocks in the chain.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d131b] border border-[rgba(148,163,184,0.14)] space-y-2">
                <div className="text-[#e5e7eb] font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2dd4bf]" />
                  <span>{isVi ? 'Tính bất biến của sổ cái được bảo vệ như thế nào?' : 'How is ledger immutability enforced?'}</span>
                </div>
                <p className="text-[#94a3b8] leading-relaxed">
                  {isVi
                    ? 'Để thay đổi một giao dịch trong quá khứ một cách trót lọt, kẻ tấn công bắt buộc phải đào lại khối đó và tất cả các khối tiếp theo nhanh hơn toàn bộ phần còn lại của mạng lưới phân tán — một điều bất khả thi về mặt chi phí và năng lực tính toán.'
                    : 'To successfully alter a historical transaction, an adversary would have to recalculate the proof-of-work for that block and ALL downstream blocks faster than the cumulative hash power of the rest of the network.'}
                </p>
              </div>
            </div>

            {/* Core Terminology Tooltips */}
            <div className="pt-2 border-t border-[rgba(148,163,184,0.14)]">
              <span className="text-[#94a3b8] text-[11px] font-semibold block mb-2">
                {isVi ? 'Thuật ngữ cốt lõi:' : 'Core Terminology:'}
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                {[
                  {
                    term: isVi ? 'Mã băm trước' : 'Previous Hash',
                    descVi: 'Mã băm đại diện cho toàn bộ trạng thái của khối trước, dùng làm mắt xích nối các khối.',
                    descEn: 'The cryptographic hash of the preceding block header that ties sequential blocks together.',
                  },
                  {
                    term: isVi ? 'Khối khởi nguồn' : 'Genesis Block',
                    descVi: 'Khối đầu tiên trong lịch sử blockchain (Khối #0), có mã băm trước toàn số 0.',
                    descEn: 'The initial block in the blockchain with a previousHash of all zeros.',
                  },
                  {
                    term: isVi ? 'Tính bất biến' : 'Immutability',
                    descVi: 'Không thể chỉnh sửa hay xóa bỏ dữ liệu đã ghi nhận vào chuỗi khối.',
                    descEn: 'The mathematical guarantee that past finalized transactions cannot be altered.',
                  },
                  {
                    term: 'Nonce',
                    descVi: 'Con số được thử đi thử lại cho đến khi tìm được mã băm thỏa mãn độ khó mục tiêu.',
                    descEn: 'A 32-bit arbitrary number iterated until the block hash satisfies target difficulty.',
                  },
                ].map((item, i) => (
                  <div key={i} className="group relative inline-block">
                    <span className="px-2.5 py-1 bg-[#0d131b] border border-[rgba(148,163,184,0.14)] text-[#e5e7eb] rounded-lg cursor-help hover:border-[#2dd4bf]/40 hover:text-[#2dd4bf] transition-colors font-medium">
                      {item.term}
                    </span>
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#0d131b] border border-[rgba(148,163,184,0.2)] rounded-lg text-xs font-sans text-[#e5e7eb] shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-150 z-50">
                      <div className="font-semibold text-[#2dd4bf] mb-1 border-b border-[rgba(148,163,184,0.14)] pb-1">
                        {item.term}
                      </div>
                      <div className="text-[11px] leading-relaxed text-[#94a3b8]">
                        {isVi ? item.descVi : item.descEn}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          5. ADD BLOCK MODAL
          ======================================================== */}
      {isAddBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans">
          <div className="relative w-full max-w-md bg-[#0d131b] border border-[rgba(148,163,184,0.18)] rounded-xl p-5 shadow-2xl text-xs space-y-4 text-[#e5e7eb] animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(148,163,184,0.14)]">
              <h3 className="text-sm font-bold text-[#e5e7eb]">
                {isVi ? `Thêm khối mới (Khối #${blocks.length})` : `Add New Block (Block #${blocks.length})`}
              </h3>
              <span className="text-[11px] font-mono text-[#2dd4bf]">
                Prev: {blocks[blocks.length - 1].hash.slice(0, 6)}...
              </span>
            </div>

            <form onSubmit={handleAddBlock} className="space-y-3">
              <div>
                <label className="text-[#94a3b8] text-[11px] font-medium block mb-1">
                  {isVi ? 'Dữ liệu giao dịch:' : 'Transaction Payload:'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={newBlockData}
                  onChange={(e) => setNewBlockData(e.target.value)}
                  placeholder={isVi ? "Ví dụ: Alice -> Charlie 10 BTC" : "e.g. Alice -> Charlie 10 BTC"}
                  className="w-full bg-[#090d12] border border-[rgba(148,163,184,0.18)] focus:border-[#2dd4bf] rounded-lg p-2.5 text-xs text-[#e5e7eb] focus:outline-none font-mono resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBlockModalOpen(false)}
                  className="px-3.5 py-1.5 bg-[#161f2c] text-[#94a3b8] hover:text-[#e5e7eb] rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {isVi ? 'Thêm khối' : 'Append Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
