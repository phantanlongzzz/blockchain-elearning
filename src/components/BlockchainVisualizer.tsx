import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  RefreshCw,
  Plus,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  AlertTriangle,
  Unlink,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { hashSha256 } from '../utils/sha256';
import { INITIAL_BLOCKCHAIN_DATA } from '../data/researchData';
import { BlockchainBlock } from '../types';

interface InlineHashProps {
  hash: string;
  prefixHighlight?: number;
  isError?: boolean;
}

const InlineHash: React.FC<InlineHashProps> = ({
  hash,
  prefixHighlight,
  isError,
}) => {
  const [copied, setCopied] = useState(false);

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

  const formatted = `${hash.slice(0, 8)}...${hash.slice(-6)}`;

  return (
    <div className="flex items-center justify-between font-mono text-xs py-0.5 group/hash">
      <span className="truncate select-all" title={hash}>
        {prefixHighlight && hash.startsWith('0'.repeat(prefixHighlight)) ? (
          <>
            <span className={isError ? 'text-rose-400 font-bold' : 'text-[#00C98D] font-bold'}>
              {hash.slice(0, prefixHighlight)}
            </span>
            <span className="text-[#A5AFBF]">
              {hash.slice(prefixHighlight, 8)}...{hash.slice(-6)}
            </span>
          </>
        ) : (
          <span className={isError ? 'text-rose-400 font-semibold' : 'text-[#F2F4F7]'}>
            {formatted}
          </span>
        )}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy hash"
        className="p-1 text-[#717B8C] hover:text-[#F2F4F7] transition-colors cursor-pointer shrink-0"
        title="Sao chép mã băm"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-[#00C98D]" />
        ) : (
          <Copy className="w-3.5 h-3.5 opacity-60 group-hover/hash:opacity-100" />
        )}
      </button>
    </div>
  );
};

export const BlockchainVisualizer: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';

  // 100% Preserved State & Logic with Enhanced Interaction
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

  // Progressive Disclosure UI States
  const [expandedBlockId, setExpandedBlockId] = useState<number | null>(null);
  const [isAuditMatrixExpanded, setIsAuditMatrixExpanded] = useState<boolean>(false);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState<boolean>(false);

  // Cascade invalidation active state (tracks blocks in transition)
  const [invalidatingIndices, setInvalidatingIndices] = useState<Set<number>>(new Set());

  // Check prefers-reduced-motion
  const isReducedMotion = typeof window !== 'undefined'
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

      // If a specific tamper index triggered this and motion is allowed, play a 150ms cascade ripple
      if (triggerTamperIndex !== undefined && !isReducedMotion && triggerTamperIndex < updated.length - 1) {
        const downstreamIndices: number[] = [];
        for (let j = triggerTamperIndex; j < updated.length; j++) {
          downstreamIndices.push(j);
        }

        // Set immediate state
        setBlocks(updated);

        // Stagger cascade invalidation cues
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

  // Proof of Work Nonce Mining Animation (600-900ms realistic laboratory simulation)
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

    // Calculate actual winning nonce
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

    // Interactive simulated ticker animation (if not reduced motion)
    if (!isReducedMotion) {
      const steps = 12;
      const stepDuration = 55; // ms
      for (let s = 0; s < steps; s++) {
        await new Promise((res) => setTimeout(res, stepDuration));
        const pseudoNonce = Math.floor(
          b.nonce + (winningNonce - b.nonce) * ((s + 1) / steps) + (Math.random() * 40 - 20)
        );
        setSimulatedNonce(Math.max(b.nonce, pseudoNonce));
      }
    }

    // Apply winning block and resync
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

    // Clear feedback after 4.5s
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
    setExpandedBlockId(2);
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
    setExpandedBlockId(null);
    setMinedFeedback(null);
  };

  // Evaluate individual validation checks
  const isAllLinksValid = blocks.every((b, i) => i === 0 || b.previousHash === blocks[i - 1].hash);
  const isChainValid = blocks.every((b) => b.isValid);

  // Stepper definition
  const chainSteps = [
    {
      step: 1,
      titleVi: 'Quan sát chuỗi khối toàn vẹn',
      titleEn: 'Observe a Valid Blockchain',
      instructionVi: 'Mỗi khối được gắn kết bằng mã băm của khối trước (Mã băm trước). Toàn bộ chuỗi đang ở trạng thái hợp lệ.',
      instructionEn: 'Each block references the hash of the preceding block (Previous Hash). All blocks are currently valid.',
      isDone: isChainValid,
    },
    {
      step: 2,
      titleVi: 'Thử sửa dữ liệu (Mô phỏng tấn công)',
      titleEn: 'Simulate Data Tampering',
      instructionVi: 'Thử sửa nội dung trong Khối #2 hoặc bấm nút "Sửa Khối #2 (Tấn công)".',
      instructionEn: 'Modify data in Block #2 or click "Tamper Block #2".',
      isDone: !isChainValid || tamperedIndex !== null,
    },
    {
      step: 3,
      titleVi: 'Quan sát hiệu ứng dây chuyền & Đào lại',
      titleEn: 'Cascade Invalidation & Re-Mining',
      instructionVi: 'Khối bị sửa đổi lập tức đổi mã băm, làm đứt gãy liên kết của toàn bộ khối phía sau. Bấm "Đào lại khối" trên từng khối để phục hồi.',
      instructionEn: 'The altered block invalidates all downstream blocks. Click "Re-mine block" on invalid blocks to recalculate.',
      isDone: guideStepIndex === 2,
    },
  ];

  const currentStep = chainSteps[guideStepIndex];

  return (
    <section id="blockchain" className="py-6 sm:py-8 max-w-7xl mx-auto font-sans scroll-mt-20 text-[#F2F4F7]">
      {/* 1. Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1C2430] mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F2F4F7] font-sans">
            {isVi ? 'Mô phỏng chuỗi khối' : 'Blockchain Simulation'}
          </h2>
          <p className="text-xs sm:text-sm text-[#A5AFBF] mt-1 max-w-2xl font-sans leading-relaxed">
            {isVi
              ? 'Quan sát cách liên kết mật mã bảo vệ tính bất biến của sổ cái khi dữ liệu bị thay đổi.'
              : 'Observe how cryptographic linking guarantees ledger immutability against historical data tampering.'}
          </p>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Segmented Mode Switcher */}
          <div className="flex items-center bg-[#090A0F] p-1 rounded-lg border border-[#1C2430] font-sans text-xs">
            <button
              type="button"
              id="blockchain-mode-guided-btn"
              onClick={() => setGuideMode('guided')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                guideMode === 'guided'
                  ? 'bg-[#1C2430] text-[#F2F4F7] font-semibold'
                  : 'text-[#A5AFBF] hover:text-[#F2F4F7]'
              }`}
            >
              {isVi ? 'Hướng dẫn' : 'Guided'}
            </button>

            <button
              type="button"
              id="blockchain-mode-free-btn"
              onClick={() => setGuideMode('free')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                guideMode === 'free'
                  ? 'bg-[#1C2430] text-[#F2F4F7] font-semibold'
                  : 'text-[#A5AFBF] hover:text-[#F2F4F7]'
              }`}
            >
              {isVi ? 'Tự do' : 'Free'}
            </button>
          </div>

          {/* Tamper Attack Trigger */}
          <button
            type="button"
            id="blockchain-tamper-btn"
            onClick={handleSimulateBlock2Tamper}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-sans font-medium text-xs transition-all cursor-pointer flex items-center gap-1.5"
            title={isVi ? 'Sửa đổi dữ liệu Khối #2 để mô phỏng tấn công' : 'Tamper Block #2 to demonstrate invalidation'}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{isVi ? 'Sửa Khối #2 (Tấn công)' : 'Tamper Block #2'}</span>
          </button>

          {/* Add Block */}
          <button
            type="button"
            id="blockchain-add-block-btn"
            onClick={() => setIsAddBlockModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#11161E] hover:bg-[#161D26] text-[#F2F4F7] border border-[#1C2430] font-sans font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#00C98D]" />
            <span>{isVi ? 'Thêm khối' : 'Add Block'}</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            id="blockchain-reset-btn"
            onClick={resetChain}
            className="p-2 rounded-lg bg-[#11161E] hover:bg-[#161D26] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] transition-colors cursor-pointer"
            title={isVi ? 'Đặt lại chuỗi khối' : 'Reset blockchain'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Step-by-step Interactive Guidance (Guided Mode) */}
      {guideMode === 'guided' && (
        <div
          id="blockchain-guided-banner"
          className="mb-6 p-4 rounded-xl bg-[#0C0F14] border border-[#1C2430] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs shadow-sm"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-medium text-[#00C98D] px-2 py-0.5 rounded bg-[#00C98D]/10 border border-[#00C98D]/30">
                {isVi ? `Bước ${guideStepIndex + 1}/3:` : `Step ${guideStepIndex + 1}/3:`}
              </span>
              <span className="font-semibold text-[#F2F4F7]">
                {isVi ? currentStep.titleVi : currentStep.titleEn}
              </span>
            </div>
            <p className="text-[#A5AFBF] font-sans leading-relaxed">
              {isVi ? currentStep.instructionVi : currentStep.instructionEn}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {guideStepIndex > 0 && (
              <button
                type="button"
                onClick={() => setGuideStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-lg bg-[#11161E] hover:bg-[#161D26] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] text-xs font-medium transition-all cursor-pointer font-sans"
              >
                {isVi ? '← Lùi lại' : '← Back'}
              </button>
            )}

            {guideStepIndex < 2 ? (
              <button
                type="button"
                onClick={() => setGuideStepIndex((prev) => Math.min(2, prev + 1))}
                className="px-3.5 py-1.5 rounded-lg bg-[#00C98D] hover:bg-[#00C98D]/90 text-slate-950 font-semibold text-xs transition-all cursor-pointer font-sans"
              >
                {isVi ? 'Bước tiếp →' : 'Next →'}
              </button>
            ) : (
              <button
                type="button"
                onClick={resetChain}
                className="px-3.5 py-1.5 rounded-lg bg-[#11161E] hover:bg-[#161D26] text-[#F2F4F7] font-medium text-xs border border-[#1C2430] transition-all cursor-pointer font-sans"
              >
                {isVi ? 'Bắt đầu lại' : 'Restart'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Attack State Prominent Feedback */}
      {!isChainValid && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans animate-in fade-in duration-150">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-semibold text-rose-300 text-sm flex items-center gap-1.5">
                <Unlink className="w-4 h-4 text-rose-400" />
                <span>{isVi ? 'Phát hiện tấn công: Chuỗi bị đứt gãy' : 'Tampering Detected: Chain Broken'}</span>
              </span>
            </div>
            <p className="text-[#A5AFBF] text-xs">
              {isVi
                ? 'Dữ liệu thay đổi làm đổi mã băm của khối bị sửa, khiến các khối phía sau không còn khớp mã băm trước.'
                : 'Modified payload altered the block hash, breaking subsequent Previous Hash links down the chain.'}
            </p>
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
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-medium cursor-pointer transition-colors"
            >
              {isVi ? 'Xem giải thích →' : 'Why it happened →'}
            </button>

            <button
              type="button"
              onClick={() => setIsAuditMatrixExpanded(!isAuditMatrixExpanded)}
              className="px-3 py-1.5 rounded-lg bg-[#11161E] hover:bg-[#161D26] text-[#F2F4F7] border border-[#1C2430] text-xs font-medium cursor-pointer transition-colors"
            >
              {isAuditMatrixExpanded ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Chi tiết' : 'Details')}
            </button>
          </div>
        </div>
      )}

      {/* 4. Nonce Mined Success Alert */}
      {minedFeedback && (
        <div className="mb-6 p-3.5 rounded-xl bg-[#00C98D]/10 border border-[#00C98D]/30 flex items-center justify-between text-xs font-sans text-[#00C98D] animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00C98D] shrink-0" />
            <span>
              {isVi
                ? `Đã đào thành công Khối #${minedFeedback.blockIndex}: Tìm thấy Nonce = ${minedFeedback.nonce.toLocaleString()} (Đã thử ${minedFeedback.triedCount.toLocaleString()} giá trị nonces)`
                : `Successfully mined Block #${minedFeedback.blockIndex}: Valid Nonce = ${minedFeedback.nonce.toLocaleString()} (Tested ${minedFeedback.triedCount.toLocaleString()} candidates)`}
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#00C98D] font-bold shrink-0">
            000... ✓
          </span>
        </div>
      )}

      {/* 5. Collapsible Master Audit Matrix */}
      {isAuditMatrixExpanded && (
        <div className="mb-6 p-4 rounded-xl bg-[#0C0F14] border border-[#1C2430] space-y-3 font-sans animate-in fade-in duration-150 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1C2430]">
            <div className="flex items-center gap-2">
              <span className="text-[#F2F4F7] font-semibold text-xs">
                {isVi ? 'Bảng kiểm tra tính toàn vẹn' : strings.blockchain.auditMatrix}
              </span>
              <span
                className={`text-xs font-medium ${
                  isChainValid ? 'text-[#00C98D]' : 'text-rose-400'
                }`}
              >
                {isChainValid
                  ? isVi ? '✓ Chuỗi hợp lệ' : `✓ ${strings.blockchain.blockValid}`
                  : isVi ? '✕ Chuỗi bị đứt gãy' : `✕ ${strings.blockchain.blockTampered}`}
              </span>
            </div>

            <span className="text-[#717B8C] text-[11px] font-mono">
              SHA-256 (0x{difficulty} {isVi ? 'số 0 đầu' : 'zeros'})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Metric 1: Hash Integrity */}
            <div className="p-3 rounded-lg bg-[#11161E] border border-[#1C2430] flex items-center justify-between">
              <div>
                <span className="text-[#F2F4F7] font-medium block text-xs">
                  {isVi ? 'Toàn vẹn mã băm' : strings.blockchain.hashIntegrity}
                </span>
                <span className="text-[11px] text-[#717B8C] font-sans">
                  {isVi ? 'Dữ liệu khớp mã băm' : 'Payload matches hash'}
                </span>
              </div>
              <span
                className={`font-semibold text-xs ${
                  isChainValid ? 'text-[#00C98D]' : 'text-rose-400'
                }`}
              >
                {isChainValid
                  ? isVi ? 'ĐẠT' : strings.blockchain.pass
                  : isVi ? 'CHƯA ĐẠT' : strings.blockchain.fail}
              </span>
            </div>

            {/* Metric 2: Previous Hash Links */}
            <div className="p-3 rounded-lg bg-[#11161E] border border-[#1C2430] flex items-center justify-between">
              <div>
                <span className="text-[#F2F4F7] font-medium block text-xs">
                  {isVi ? 'Liên kết mã băm trước' : strings.blockchain.prevHashLinks}
                </span>
                <span className="text-[11px] text-[#717B8C] font-sans">
                  {isVi ? 'Mã băm trước khớp khối liền trước' : 'previousHash matches parent'}
                </span>
              </div>
              <span
                className={`font-semibold text-xs ${
                  isAllLinksValid ? 'text-[#00C98D]' : 'text-rose-400'
                }`}
              >
                {isAllLinksValid
                  ? isVi ? 'ĐẠT' : strings.blockchain.pass
                  : isVi ? 'CHƯA ĐẠT' : strings.blockchain.fail}
              </span>
            </div>

            {/* Metric 3: Overall Chain Validity */}
            <div className="p-3 rounded-lg bg-[#11161E] border border-[#1C2430] flex items-center justify-between">
              <div>
                <span className="text-[#F2F4F7] font-medium block text-xs">
                  {isVi ? 'Toàn vẹn chuỗi khối' : 'Overall Integrity'}
                </span>
                <span className="text-[11px] text-[#717B8C] font-sans">
                  {isVi ? 'Xác thực mật mã liên tục' : 'Sequential cryptographic proof'}
                </span>
              </div>
              <span
                className={`font-semibold text-xs ${
                  isChainValid ? 'text-[#00C98D]' : 'text-rose-400'
                }`}
              >
                {isChainValid
                  ? isVi ? 'ĐẠT' : 'PASS'
                  : isVi ? 'ĐỨT GÃY' : 'BROKEN'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. HERO ELEMENT: Connected Blockchain Blocks Flow (#0 → #1 → #2 → #3 → #4) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-sans font-semibold text-[#F2F4F7] tracking-wider">
              {isVi ? 'Chuỗi khối liên kết mật mã' : 'Cryptographically Linked Chain'}
            </h3>
            <span className="text-xs text-[#717B8C] font-mono">
              ({blocks.length} {isVi ? 'khối' : 'blocks'})
            </span>
          </div>
          {isChainValid && (
            <button
              type="button"
              onClick={() => setIsAuditMatrixExpanded(!isAuditMatrixExpanded)}
              className="text-xs text-[#A5AFBF] hover:text-[#F2F4F7] transition-colors cursor-pointer font-sans"
            >
              {isAuditMatrixExpanded ? (isVi ? 'Ẩn kiểm tra kỹ thuật' : 'Hide audit') : (isVi ? 'Kiểm tra kỹ thuật →' : 'Technical audit →')}
            </button>
          )}
        </div>

        {/* Continuous Horizontal Connected Chain Container */}
        <div className="overflow-x-auto pb-4 pt-1 px-1 flex items-stretch gap-0 scrollbar-thin">
          {blocks.map((block, idx) => {
            const isInvalid = !block.isValid;
            const isGenesis = idx === 0;
            const isPrevLinkBroken = idx > 0 && block.previousHash !== blocks[idx - 1].hash;
            const isExpanded = expandedBlockId === block.id;
            const isCascading = invalidatingIndices.has(idx);

            // Hash diff check
            const hasOriginalHash = !!block.originalHash;
            const isHashAltered = hasOriginalHash && block.originalHash !== block.hash;

            // Link connection to the next block
            const hasNextBlock = idx < blocks.length - 1;
            const nextBlock = hasNextBlock ? blocks[idx + 1] : null;
            const isLinkToNextValid =
              hasNextBlock &&
              block.isValid &&
              nextBlock !== null &&
              nextBlock.previousHash === block.hash;

            return (
              <React.Fragment key={block.id}>
                {/* Block Card */}
                <div className="min-w-[260px] sm:min-w-[280px] max-w-[320px] flex-1 flex flex-col shrink-0">
                  <div
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between flex-1 shadow-sm relative ${
                      isInvalid
                        ? isCascading
                          ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30'
                          : 'bg-rose-950/20 border-rose-500/50'
                        : 'bg-[#0C0F14] border-[#1C2430] hover:border-[#283547]'
                    }`}
                  >
                    <div>
                      {/* Header: #0, #1, #2, etc. + status indicator (Color + Icon + Text) */}
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1C2430]">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-sm font-bold text-[#F2F4F7]">#{block.index}</span>
                          {isGenesis && (
                            <span className="text-[11px] text-[#717B8C] font-sans">
                              {isVi ? '(Khởi nguồn)' : '(Genesis)'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isInvalid ? (
                            <span className="flex items-center gap-1 text-[11px] text-rose-400 font-sans font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>{isVi ? 'Không hợp lệ' : 'Invalid'}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-[#00C98D] font-sans font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#00C98D]" />
                              <span>{isVi ? 'Hợp lệ' : 'Valid'}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Field 1: Previous Hash */}
                      <div className="mb-2.5">
                        <div className="text-[10px] font-medium text-[#717B8C] mb-0.5">
                          {isVi ? 'Mã băm trước' : 'Previous Hash'}
                        </div>
                        <InlineHash
                          hash={block.previousHash}
                          isError={isPrevLinkBroken}
                        />
                      </div>

                      {/* Field 2: Static Clean Data Display */}
                      <div className="mb-2.5">
                        <div className="text-[10px] font-medium text-[#717B8C] mb-0.5">
                          {isVi ? 'Dữ liệu' : 'Data'}
                        </div>
                        <div
                          className={`w-full bg-[#080C10] border rounded-lg p-2.5 text-xs font-mono min-h-[50px] leading-relaxed break-words whitespace-pre-wrap transition-colors ${
                            isInvalid
                              ? 'border-rose-500/40 text-rose-200'
                              : 'border-[#1C2430] text-[#F2F4F7]'
                          }`}
                        >
                          {block.data}
                        </div>
                      </div>

                      {/* Field 3: Current Hash */}
                      <div className="mb-2.5">
                        <div className="text-[10px] font-medium text-[#717B8C] mb-0.5">
                          {isVi ? 'Mã băm hiện tại' : 'Current Hash'}
                        </div>
                        <InlineHash
                          hash={block.hash}
                          prefixHighlight={difficulty}
                          isError={!block.hash.startsWith('0'.repeat(difficulty))}
                        />
                      </div>

                      {/* 7. HASH DIFF VISUALIZATION (When Block is Modified or Tampered) */}
                      {isHashAltered && block.originalHash && (
                        <div className="mb-3 p-2.5 rounded-lg bg-[#080C10] border border-rose-500/40 text-[11px] font-mono space-y-1.5 animate-in fade-in duration-100">
                          <div className="text-[10px] font-sans font-semibold text-rose-300 uppercase tracking-wider">
                            {isVi ? 'So sánh mã băm (Hash Diff)' : 'Hash Diff Analysis'}
                          </div>

                          <div className="flex items-center justify-between text-[#A5AFBF]">
                            <span className="font-sans text-[10px]">{isVi ? 'Trước sửa:' : 'Before:'}</span>
                            <span className="text-[#00C98D] font-bold">
                              {block.originalHash.slice(0, 8)}...{block.originalHash.slice(-6)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[#A5AFBF]">
                            <span className="font-sans text-[10px]">{isVi ? 'Sau sửa:' : 'After:'}</span>
                            <span className="text-rose-400 font-bold">
                              {block.hash.slice(0, 8)}...{block.hash.slice(-6)}
                            </span>
                          </div>

                          <div className="text-[10px] text-[#717B8C] font-sans pt-1 border-t border-[#1C2430] leading-tight">
                            {isVi
                              ? 'Hiệu ứng thác đổ: Đổi 1 ký tự dữ liệu làm đảo lộn hoàn toàn mã băm.'
                              : 'Avalanche effect: 1 character change completely scrambles the output hash.'}
                          </div>
                        </div>
                      )}

                      {/* Field 4: Progressive Disclosure Details */}
                      <div className="mb-3">
                        <button
                          type="button"
                          onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                          className="w-full py-1 text-[#A5AFBF] hover:text-[#F2F4F7] text-[11px] font-sans flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? (isVi ? 'Ẩn chi tiết' : 'Hide details') : (isVi ? 'Chi tiết khối →' : 'Block details →')}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 pt-2 border-t border-[#1C2430] space-y-2.5 text-[11px] font-sans animate-in fade-in duration-100">
                            <div>
                              <span className="text-[#717B8C] text-[10px] block mb-1">
                                {isVi ? 'Chỉnh sửa dữ liệu' : 'Edit payload'}
                              </span>
                              <textarea
                                rows={2}
                                value={block.data}
                                onChange={(e) => handleDataChange(idx, e.target.value)}
                                className="w-full bg-[#080C10] border border-[#1C2430] rounded-lg p-2 text-xs font-mono text-[#F2F4F7] focus:outline-none focus:border-[#00C98D]/60 resize-none"
                              />
                            </div>
                            <div>
                              <span className="text-[#717B8C] text-[10px] uppercase font-mono block">Timestamp</span>
                              <span className="text-[#A5AFBF] font-mono text-xs">{block.timestamp}</span>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-[10px] uppercase font-mono text-[#717B8C] mb-1">
                                <span>Nonce</span>
                                <span className="text-[#F2F4F7] font-mono">
                                  {isMining === idx && simulatedNonce !== null
                                    ? simulatedNonce.toLocaleString()
                                    : block.nonce.toLocaleString()}
                                </span>
                              </div>
                              <input
                                type="number"
                                value={isMining === idx && simulatedNonce !== null ? simulatedNonce : block.nonce}
                                onChange={(e) => handleNonceChange(idx, Number(e.target.value))}
                                className="w-full bg-[#080C10] border border-[#1C2430] rounded-lg px-2.5 py-1 text-xs text-[#F2F4F7] font-mono focus:outline-none focus:border-[#00C98D]/60"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Primary Action on Block: Re-Mine Button with Live Nonce Ticker */}
                    <div className="pt-2 border-t border-[#1C2430]">
                      <button
                        type="button"
                        onClick={() => mineBlock(idx)}
                        disabled={isMining !== null}
                        aria-label={isVi ? `Đào lại khối #${block.index}` : `Re-mine block #${block.index}`}
                        className={`w-full py-1.5 px-2.5 rounded-lg font-sans text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isInvalid
                            ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold shadow-sm'
                            : 'bg-[#11161E] hover:bg-[#161D26] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430]'
                        }`}
                      >
                        {isMining === idx ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-[#00C98D]" />
                            <span className="font-mono text-[11px] text-[#00C98D]">
                              {isVi ? 'Đang giải block...' : 'Mining...'} Nonce:{' '}
                              {simulatedNonce ? simulatedNonce.toLocaleString() : block.nonce.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3 opacity-70" />
                            <span>{isVi ? 'Giải lại khối' : 'Re-mine block'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* CHAIN CONNECTOR LINK (Between Block idx and Block idx+1) */}
                {hasNextBlock && (
                  <div className="flex flex-col items-center justify-center shrink-0 w-8 sm:w-11 md:w-12 self-center z-10 px-0.5 select-none py-2">
                    <div className="relative flex flex-col items-center justify-center w-full">
                      {/* Label on Chain Link */}
                      <span
                        className={`text-[9px] font-mono mb-1 px-1 py-0.5 rounded border transition-colors flex items-center gap-0.5 ${
                          isLinkToNextValid
                            ? 'text-[#00C98D] bg-[#00C98D]/10 border-[#00C98D]/30'
                            : 'text-rose-400 bg-rose-950/50 border-rose-500/40'
                        }`}
                        title={
                          isLinkToNextValid
                            ? isVi
                              ? 'Mã băm khối trước khớp'
                              : 'Hash link valid'
                            : isVi
                            ? 'Mã băm trước không khớp'
                            : 'Hash link broken'
                        }
                      >
                        {isLinkToNextValid ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-[#00C98D]" />
                            <span>{isVi ? 'Mã băm' : 'Hash'}</span>
                          </>
                        ) : (
                          <>
                            <Unlink className="w-2.5 h-2.5 text-rose-400" />
                            <span>{isVi ? 'Đứt gãy' : 'Broken'}</span>
                          </>
                        )}
                      </span>

                      {/* SVG Arrow with dynamic Data Packet animation */}
                      <svg className="w-full h-8 overflow-visible" viewBox="0 0 44 24">
                        <defs>
                          <marker
                            id={`arrow-${idx}-${isLinkToNextValid ? 'valid' : 'invalid'}`}
                            viewBox="0 0 10 10"
                            refX="6"
                            refY="5"
                            markerWidth="5"
                            markerHeight="5"
                            orient="auto-start-reverse"
                          >
                            <path
                              d="M 0 1.5 L 8 5 L 0 8.5 z"
                              fill={isLinkToNextValid ? '#00C98D' : '#f43f5e'}
                            />
                          </marker>
                        </defs>

                        {/* Base connecting line */}
                        <line
                          x1="2"
                          y1="12"
                          x2="36"
                          y2="12"
                          stroke={isLinkToNextValid ? '#00C98D' : '#f43f5e'}
                          strokeWidth="2"
                          strokeDasharray={isLinkToNextValid ? 'none' : '3,3'}
                          strokeOpacity={isLinkToNextValid ? 0.8 : 0.65}
                          markerEnd={`url(#arrow-${idx}-${isLinkToNextValid ? 'valid' : 'invalid'})`}
                        />

                        {/* Smooth data packet moving from left to right block */}
                        {isLinkToNextValid && !isReducedMotion && (
                          <circle r="2.8" fill="#00C98D">
                            <animate
                              attributeName="cx"
                              values="4; 34"
                              dur="2.0s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="cy"
                              values="12; 12"
                              dur="2.0s"
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

      {/* 8. Level 3: Collapsible Deep-Dive & Academic Explanations */}
      <div id="blockchain-deep-dive" className="rounded-xl bg-[#0C0F14] border border-[#1C2430] overflow-hidden font-sans shadow-sm">
        <button
          type="button"
          onClick={() => setIsDeepDiveOpen(!isDeepDiveOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#11161E]/50 transition-colors cursor-pointer"
        >
          <div>
            <div className="text-xs sm:text-sm font-semibold text-[#F2F4F7]">
              {isVi ? 'Tìm hiểu thêm: Vì sao Blockchain có tính bất biến?' : 'Deep Dive: Why is Blockchain Tamper-Proof?'}
            </div>
            <div className="text-xs text-[#A5AFBF] mt-0.5 font-sans">
              {isVi
                ? 'Giải thích cơ chế liên kết mã băm & câu hỏi định hướng tư duy'
                : 'Cryptographic hash linking mechanics & core concepts'}
            </div>
          </div>

          <div className="text-[#A5AFBF] flex items-center gap-1.5 text-xs font-sans">
            <span>{isDeepDiveOpen ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Mở rộng' : 'Expand')}</span>
            {isDeepDiveOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {isDeepDiveOpen && (
          <div className="p-4 sm:p-6 border-t border-[#1C2430] space-y-6 bg-[#090C12] animate-in fade-in duration-150">
            {/* Core Explanations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 rounded-lg bg-[#0C0F14] border border-[#1C2430] space-y-2">
                <div className="text-[#F2F4F7] font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#00C98D]" />
                  <span>{isVi ? 'Vì sao mã băm trước phát hiện được sự thay đổi?' : 'Why does previousHash detect tampering?'}</span>
                </div>
                <p className="text-[#A5AFBF] leading-relaxed">
                  {isVi
                    ? 'Mỗi khối tính toán mã băm trên toàn bộ dữ liệu của chính nó VÀ mã băm của khối liền trước (Mã băm trước). Khi bạn sửa đổi dù chỉ 1 ký tự ở Khối #2, mã băm Khối #2 thay đổi hoàn toàn. Do Khối #3 vẫn lưu mã băm cũ, liên kết bị đứt gãy, kéo theo toàn bộ các khối #3, #4 phía sau bị vô hiệu hóa.'
                    : 'Every block computes its hash over its payload plus the preceding block’s previousHash digest. Modifying even a single character in Block #2 changes its hash drastically, immediately breaking the link to Block #3 and invalidating all subsequent blocks in the chain.'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#0C0F14] border border-[#1C2430] space-y-2">
                <div className="text-[#F2F4F7] font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00C98D]" />
                  <span>{isVi ? 'Tính bất biến của sổ cái được bảo vệ như thế nào?' : 'How is ledger immutability enforced?'}</span>
                </div>
                <p className="text-[#A5AFBF] leading-relaxed">
                  {isVi
                    ? 'Để thay đổi một giao dịch trong quá khứ một cách trót lọt, kẻ tấn công bắt buộc phải đào lại khối đó và tất cả các khối tiếp theo nhanh hơn toàn bộ phần còn lại của mạng lưới phân tán — một điều bất khả thi về mặt chi phí và năng lực tính toán.'
                    : 'To successfully alter a historical transaction, an adversary would have to recalculate the proof-of-work for that block and ALL downstream blocks faster than the cumulative hash power of the rest of the network.'}
                </p>
              </div>
            </div>

            {/* 4-Question Thinking Framework */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#F2F4F7] tracking-wider">
                {isVi ? 'Hỏi đáp định hướng tư duy' : 'Core Thinking Framework'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-[#0C0F14] border border-[#1C2430] space-y-1.5">
                  <span className="font-semibold text-[#F2F4F7] block">
                    {isVi ? '1. Bạn đang nhìn thấy gì?' : '1. What are you seeing?'}
                  </span>
                  <p className="text-[#A5AFBF] text-[11px] leading-relaxed">
                    {isVi
                      ? 'Sổ cái chuỗi khối phân tán nơi mỗi khối liên kết mật mã chặt chẽ với khối trước qua Mã băm trước.'
                      : 'A distributed blockchain ledger where sequential blocks are cryptographically tied via Previous Hash pointers.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0C0F14] border border-[#1C2430] space-y-1.5">
                  <span className="font-semibold text-[#F2F4F7] block">
                    {isVi ? '2. Cần làm gì tiếp theo?' : '2. What to do next?'}
                  </span>
                  <p className="text-[#A5AFBF] text-[11px] leading-relaxed">
                    {isVi
                      ? 'Bấm "Sửa Khối #2 (Tấn công)", sau đó bấm "Đào lại khối" để quan sát cách phục hồi liên kết.'
                      : 'Click "Tamper Block #2", then click "Re-mine block" to observe link recovery.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0C0F14] border border-[#1C2430] space-y-1.5">
                  <span className="font-semibold text-[#F2F4F7] block">
                    {isVi ? '3. Kết quả vừa nhận được?' : '3. What was the outcome?'}
                  </span>
                  <p className="text-[#A5AFBF] text-[11px] leading-relaxed">
                    {isVi
                      ? 'Khi dữ liệu khối đổi, mã băm khối thay đổi hoàn toàn, làm đứt gãy liên kết của toàn bộ chuỗi phía sau.'
                      : 'Changing block data creates a completely different hash, breaking subsequent links down the line.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0C0F14] border border-[#1C2430] space-y-1.5">
                  <span className="font-semibold text-[#F2F4F7] block">
                    {isVi ? '4. Vì sao lại như vậy?' : '4. Why did it happen?'}
                  </span>
                  <p className="text-[#A5AFBF] text-[11px] leading-relaxed">
                    {isVi
                      ? 'Hàm băm SHA-256 một chiều và liên kết đệ quy biến chuỗi khối thành cấu trúc bất biến không thể bị sửa trộm.'
                      : 'One-way SHA-256 and recursive pointers make historical tampering mathematically impossible to conceal.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Terminology */}
            <div className="pt-2 border-t border-[#1C2430]">
              <span className="text-[#A5AFBF] text-[11px] font-sans font-semibold block mb-2">
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
                    <span className="px-2.5 py-1 bg-[#11161E] border border-[#1C2430] text-[#F2F4F7] rounded-lg cursor-help hover:border-[#00C98D]/40 hover:text-[#00C98D] transition-colors font-medium">
                      {item.term}
                    </span>
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#0C0F14] border border-[#1C2430] rounded-lg text-xs font-sans text-[#F2F4F7] shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-150 z-50">
                      <div className="font-semibold text-[#00C98D] mb-1 border-b border-[#1C2430] pb-1">
                        {item.term}
                      </div>
                      <div className="text-[11px] leading-relaxed text-[#A5AFBF]">
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

      {/* Add Block Modal */}
      {isAddBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans">
          <div className="relative w-full max-w-lg bg-[#0C0F14] border border-[#1C2430] rounded-xl p-6 shadow-2xl text-xs space-y-4 text-[#F2F4F7] font-sans animate-in fade-in duration-150">
            <h3 className="text-sm font-bold text-[#F2F4F7] tracking-wider font-sans">
              {isVi ? `Thêm khối mới vào chuỗi (Khối #${blocks.length})` : `Add New Block (Block #${blocks.length})`}
            </h3>

            <form onSubmit={handleAddBlock} className="space-y-4">
              <div>
                <label className="text-[#A5AFBF] text-[10px] block mb-1 font-sans font-medium">
                  {isVi ? 'Dữ liệu giao dịch:' : 'Block Data Payload:'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={newBlockData}
                  onChange={(e) => setNewBlockData(e.target.value)}
                  placeholder={isVi ? "Ví dụ: Alice gửi 50 BTC cho Charlie..." : "e.g. Alice transfers 50 BTC to Charlie..."}
                  className="w-full bg-[#080C10] border border-[#1C2430] rounded-lg p-3 text-xs text-[#F2F4F7] focus:outline-none focus:border-[#00C98D]/60 font-mono resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 font-sans">
                <button
                  type="button"
                  onClick={() => setIsAddBlockModalOpen(false)}
                  className="px-4 py-2 bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] rounded-lg cursor-pointer text-xs font-medium transition-colors"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00C98D] hover:bg-[#00C98D]/90 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
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
