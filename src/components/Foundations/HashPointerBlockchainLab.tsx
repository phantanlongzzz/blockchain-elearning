import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  RefreshCw,
  Edit3,
  ArrowRight,
  ArrowDown,
  Wrench,
  Unlink,
  Link2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { fastSha256Hex } from '../../utils/sha256';

interface HashPointerBlockchainLabProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
}

// 4-Block Initial Baseline with canonical Vietnamese transaction data
const BASELINE_BLOCKS: { index: number; data: string }[] = [
  { index: 0, data: 'Khối Khởi tạo · DLU Blockchain' },
  { index: 1, data: 'Alice chuyển 10 DLU COIN cho Bob' },
  { index: 2, data: 'Bob chuyển 5 DLU COIN cho Charlie' },
  { index: 3, data: 'Charlie chuyển 2 DLU COIN cho Dave' },
];

const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

interface MintedBlock {
  index: number;
  data: string;
  previousHash: string;
  hash: string;
}

// Compute a canonical block hash: SHA256(index | previousHash | data)
function computeBlockHash(index: number, previousHash: string, data: string): string {
  try {
    return fastSha256Hex(`${index}|${previousHash}|${data}`);
  } catch {
    return 'error';
  }
}

// Compute an entire clean chain
function mintCleanChain(datas: string[]): MintedBlock[] {
  const result: MintedBlock[] = [];
  let prev = GENESIS_PREV_HASH;

  datas.forEach((data, idx) => {
    const hash = computeBlockHash(idx, prev, data);
    result.push({
      index: idx,
      data,
      previousHash: prev,
      hash,
    });
    prev = hash;
  });

  return result;
}

export const HashPointerBlockchainLab: React.FC<HashPointerBlockchainLabProps> = ({
  onInteracted,
  onNextStage,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Minted original baseline chain (immutable reference of how chain was initially minted)
  const originalChain = useMemo(
    () => mintCleanChain(BASELINE_BLOCKS.map((b) => b.data)),
    []
  );

  // Current simulation state
  // dominoStep:
  // 0: Clean baseline
  // 1: Step 1 - Tamper Block 1 data -> Block 1 actual hash explodes, Link 1->2 broken
  // 2: Step 2 - Hacker tries fixing Block 2's PrevHash -> Block 2 hash explodes, Link 2->3 broken
  // 3: Step 3 - Hacker recalculates Block 3 -> Local chain repaired (re-mined)
  const [dominoStep, setDominoStep] = useState<0 | 1 | 2 | 3>(0);

  // Current editable block data
  const [block1Data, setBlock1Data] = useState<string>(BASELINE_BLOCKS[1].data);

  // Stored Previous Hashes in each block's header
  const [storedPrevHashes, setStoredPrevHashes] = useState<string[]>([
    originalChain[0].previousHash,
    originalChain[1].previousHash,
    originalChain[2].previousHash,
    originalChain[3].previousHash,
  ]);

  // Synchronize when block1Data is changed manually
  const isBlock1Tampered = block1Data !== BASELINE_BLOCKS[1].data;

  // Real-time computed actual hashes of each block
  const computedActualBlocks = useMemo(() => {
    const datas = [
      BASELINE_BLOCKS[0].data,
      block1Data,
      BASELINE_BLOCKS[2].data,
      BASELINE_BLOCKS[3].data,
    ];

    const currentBlocks: {
      index: number;
      data: string;
      storedPrevHash: string;
      actualHash: string;
      originalMintedHash: string;
    }[] = [];

    datas.forEach((data, idx) => {
      const prev = storedPrevHashes[idx] || GENESIS_PREV_HASH;
      const actualHash = computeBlockHash(idx, prev, data);

      currentBlocks.push({
        index: idx,
        data,
        storedPrevHash: prev,
        actualHash,
        originalMintedHash: originalChain[idx]?.hash || '',
      });
    });

    return currentBlocks;
  }, [block1Data, storedPrevHashes, originalChain]);

  // Evaluate connection link status between block i and block i+1
  const getLinkStatus = (fromIdx: number) => {
    const fromBlock = computedActualBlocks[fromIdx];
    const toBlock = computedActualBlocks[fromIdx + 1];
    if (!toBlock) return { isValid: true, reason: '' };

    const matches = fromBlock.actualHash === toBlock.storedPrevHash;

    if (matches) {
      return {
        isValid: true,
        reason: isVi ? 'Trùng khớp 100%' : 'Exact Match',
      };
    }

    return {
      isValid: false,
      reason: isVi
        ? `Hash mới (#${fromIdx}) ≠ PrevHash đã lưu (#${fromIdx + 1})`
        : `New Hash (#${fromIdx}) ≠ Stored PrevHash (#${fromIdx + 1})`,
    };
  };

  // Evaluate individual block status with precise pedagogical distinction
  const getBlockDiagnostic = (idx: number) => {
    const block = computedActualBlocks[idx];

    if (idx === 0) {
      return {
        status: 'valid',
        badgeVi: 'HỢP LỆ · KHỞI TẠO',
        badgeEn: 'VALID · GENESIS',
        descVi: 'Khối Genesis mỏ neo khởi nguyên, không có khối trước.',
        descEn: 'Genesis anchor block, pristine root.',
      };
    }

    // Check if block's own data has been altered from its originally minted baseline
    const isDataAltered = block.data !== BASELINE_BLOCKS[idx].data;
    const isHashAltered = block.actualHash !== block.originalMintedHash;

    // Check if the link FROM prior block TO this block is valid
    const priorBlock = computedActualBlocks[idx - 1];
    const linkFromPriorMatches = priorBlock.actualHash === block.storedPrevHash;

    if (isDataAltered) {
      return {
        status: 'tampered-data',
        badgeVi: 'DỮ LIỆU BỊ CAN THIỆP',
        badgeEn: 'DATA TAMPERED',
        descVi: 'Mã băm thực tế nổ tung do hiệu ứng tuyết lở (Avalanche)!',
        descEn: 'Actual hash exploded due to the Avalanche Effect!',
      };
    }

    if (!linkFromPriorMatches) {
      return {
        status: 'broken-link',
        badgeVi: 'GÃY LIÊN KẾT MÃ BĂM',
        badgeEn: 'BROKEN HASH POINTER',
        descVi: `PrevHash (${block.storedPrevHash.slice(0, 10)}...) không trỏ vào Hash mới của Khối #${idx - 1}!`,
        descEn: `PrevHash does not point to new hash of Block #${idx - 1}!`,
      };
    }

    // If this block itself has no local error, check if any prior block was tampered
    // A full node rejects the entire chain starting from the first corrupted block
    const isUpstreamCorrupted = computedActualBlocks
      .slice(0, idx)
      .some((b, i) => {
        if (b.data !== BASELINE_BLOCKS[i].data) return true;
        if (i > 0 && computedActualBlocks[i - 1].actualHash !== b.storedPrevHash) return true;
        return false;
      });

    if (isUpstreamCorrupted) {
      return {
        status: 'orphaned',
        badgeVi: 'CỤC BỘ KHỚP · MẠNG TỪ CHỐI',
        badgeEn: 'LOCALLY SEALED · REJECTED',
        descVi: 'Dữ liệu chưa bị đổi, nhưng toàn chuỗi bị vô hiệu vì khối trước bị gãy!',
        descEn: 'Data untampered, but rejected because upstream chain is broken!',
      };
    }

    // Completely valid or re-mined
    if (dominoStep === 3) {
      return {
        status: 'remined',
        badgeVi: 'ĐÃ ĐƯỢC TÍNH TOÁN LẠI',
        badgeEn: 'RE-MINED',
        descVi: 'Đã được tính lại hash hợp lệ trên nhánh rẽ mới.',
        descEn: 'Recalculated on an alternate branch.',
      };
    }

    return {
      status: 'valid',
      badgeVi: 'HỢP LỆ',
      badgeEn: 'VALID',
      descVi: 'Mã băm và con trỏ PrevHash trùng khớp tuyệt đối.',
      descEn: 'Hash and PrevHash pointers match exactly.',
    };
  };

  // ACTION 1: Tamper Block 1 (Quick button)
  const handleTamperBlock1 = () => {
    const tamperedText = 'Alice chuyển 999 DLU COIN cho Hacker';
    setBlock1Data(tamperedText);
    setDominoStep(1);

    // Stored PrevHashes remain as they were minted
    setStoredPrevHashes([
      originalChain[0].previousHash,
      originalChain[1].previousHash,
      originalChain[2].previousHash,
      originalChain[3].previousHash,
    ]);

    onInteracted?.();
  };

  // ACTION 2: Step 2 in Domino - Hacker alters Block 2's PrevHash to match Block 1's new hash
  const handleDominoStep2 = () => {
    // Block 1 new actual hash
    const block1ActualHash = computeBlockHash(
      1,
      originalChain[1].previousHash,
      block1Data
    );

    // Set Block 2's stored PrevHash = Block 1's new hash
    const updatedPrevHashes = [...storedPrevHashes];
    updatedPrevHashes[2] = block1ActualHash;
    setStoredPrevHashes(updatedPrevHashes);

    setDominoStep(2);
    onInteracted?.();
  };

  // ACTION 3: Step 3 in Domino - Hacker alters Block 3's PrevHash to match Block 2's new hash
  const handleDominoStep3 = () => {
    // Block 1 actual hash
    const block1ActualHash = computeBlockHash(
      1,
      originalChain[1].previousHash,
      block1Data
    );
    // Block 2 new actual hash
    const block2ActualHash = computeBlockHash(
      2,
      block1ActualHash,
      BASELINE_BLOCKS[2].data
    );

    // Set Block 3's stored PrevHash = Block 2's new hash
    const updatedPrevHashes = [...storedPrevHashes];
    updatedPrevHashes[2] = block1ActualHash;
    updatedPrevHashes[3] = block2ActualHash;
    setStoredPrevHashes(updatedPrevHashes);

    setDominoStep(3);
    onInteracted?.();
  };

  // ACTION 4: Recalculate / Re-mine the entire downstream chain in one click
  const handleRecalculateEntireChain = () => {
    // Recalculate block 1
    const h1 = computeBlockHash(1, originalChain[1].previousHash, block1Data);
    // Recalculate block 2 with h1
    const h2 = computeBlockHash(2, h1, BASELINE_BLOCKS[2].data);
    // Recalculate block 3 with h2
    const updatedPrev = [
      originalChain[0].previousHash,
      originalChain[1].previousHash,
      h1,
      h2,
    ];
    setStoredPrevHashes(updatedPrev);
    setDominoStep(3);
    onInteracted?.();
  };

  // ACTION 5: Reset to baseline clean state
  const handleReset = () => {
    setBlock1Data(BASELINE_BLOCKS[1].data);
    setStoredPrevHashes([
      originalChain[0].previousHash,
      originalChain[1].previousHash,
      originalChain[2].previousHash,
      originalChain[3].previousHash,
    ]);
    setDominoStep(0);
  };

  // When block1Data is edited manually, update dominoStep accordingly
  const handleBlock1InputChange = (newVal: string) => {
    setBlock1Data(newVal);
    if (newVal === BASELINE_BLOCKS[1].data) {
      setDominoStep(0);
      setStoredPrevHashes([
        originalChain[0].previousHash,
        originalChain[1].previousHash,
        originalChain[2].previousHash,
        originalChain[3].previousHash,
      ]);
    } else {
      setDominoStep(1);
      setStoredPrevHashes([
        originalChain[0].previousHash,
        originalChain[1].previousHash,
        originalChain[2].previousHash,
        originalChain[3].previousHash,
      ]);
    }
    onInteracted?.();
  };

  // Chain state summary
  const hasAnyLinkBroken = [0, 1, 2].some((idx) => !getLinkStatus(idx).isValid);
  const isChainFullyValid = !isBlock1Tampered && !hasAnyLinkBroken;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="p-5 rounded-2xl bg-[#0B0F19]/70 border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            {isVi ? 'Giai đoạn 04 · Kháng giả mạo' : 'Stage 04 · Tamper Resistance'}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white font-sans">
            {isVi ? 'Vì sao Linked List không phải là Blockchain' : 'Why Linked List ≠ Blockchain'}
          </h3>
          <p className="text-xs font-sans text-slate-400 max-w-2xl leading-relaxed">
            {isVi
              ? 'Sửa 1 byte trong khối quá khứ làm Mã băm thực tế thay đổi ngay lập tức (hiệu ứng tuyết lở), phá vỡ liên kết con trỏ băm với tất cả các khối phía sau.'
              : 'Tampering with 1 byte in a past block immediately recalculates its hash, causing a cascading break in subsequent hash pointers.'}
          </p>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={handleTamperBlock1}
            disabled={isBlock1Tampered && dominoStep === 1}
            className="px-3.5 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 disabled:opacity-40 text-rose-300 hover:text-rose-200 border border-rose-500/40 text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>
              {isVi ? 'Thử sửa Khối #1 (10 → 999)' : 'Tamper Block #1 (10 → 999)'}
            </span>
          </button>

          {isBlock1Tampered && dominoStep < 3 && (
            <button
              type="button"
              onClick={handleRecalculateEntireChain}
              className="px-3.5 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-medium font-sans text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isVi ? 'Tính toán lại toàn chuỗi' : 'Recalculate Chain'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-lg text-slate-300 hover:text-white bg-white/[0.05] border border-white/[0.1] hover:border-cyan-500/40 transition-all cursor-pointer text-xs font-sans flex items-center gap-1.5"
            title={isVi ? 'Khôi phục về trạng thái sạch ban đầu' : 'Reset to clean state'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{isVi ? 'Khôi phục gốc' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Main Chain Canvas */}
      <div className="p-6 rounded-2xl bg-[#0B0F19]/70 border border-white/[0.08] space-y-6">
        {/* Chain Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
          <div className="text-xs font-sans font-medium flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isChainFullyValid
                  ? 'bg-emerald-400 ring-2 ring-emerald-400/20'
                  : 'bg-rose-500 ring-2 ring-rose-500/20 animate-pulse'
              }`}
            />
            <span
              className={`font-semibold tracking-wide ${
                isChainFullyValid ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isChainFullyValid
                ? isVi
                  ? 'TRẠNG THÁI CHUỖI: HỢP LỆ (TÍNH TOÀN VẸN BẢO TOÀN)'
                  : 'CHAIN STATUS: VALID (INTEGRITY PRESERVED)'
                : isVi
                ? 'TRẠNG THÁI CHUỖI: PHÁT HIỆN CAN THIỆP GIẢ MẠO'
                : 'CHAIN STATUS: TAMPER DETECTED'}
            </span>
          </div>

          <div className="text-[11px] font-sans text-slate-400">
            {isVi
              ? 'Mỗi khối lưu trữ con trỏ băm (Mã băm trước) niêm phong toàn vẹn khối liền trước'
              : 'Hash pointer seals the cryptographic integrity of the prior block'}
          </div>
        </div>

        {/* Domino Step-by-Step Stepper (Only visible when tampering is active) */}
        {isBlock1Tampered && (
          <div className="p-4 rounded-xl bg-[#121626]/90 border border-cyan-500/30 space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300">
                  {isVi ? 'HIỆU ỨNG DOMINO' : 'DOMINO EFFECT'}
                </span>
                <span className="text-xs font-sans font-bold text-white">
                  {dominoStep === 1 && (isVi ? 'Bước 1: Sửa Khối #1 ➔ Hash #1 đổi ➔ Gãy liên kết #1 → #2' : 'Step 1: Tamper Block #1 -> Hash #1 explodes -> Link 1->2 breaks')}
                  {dominoStep === 2 && (isVi ? 'Bước 2: Hacker sửa PrevHash Khối #2 ➔ Hash #2 đổi ➔ Gãy tiếp liên kết #2 → #3' : 'Step 2: Hacker fixes PrevHash in Block #2 -> Hash #2 explodes -> Link 2->3 breaks')}
                  {dominoStep === 3 && (isVi ? 'Bước 3: Hacker tính lại toàn chuỗi đến Khối #3 (Tốn chi phí khổng lồ)' : 'Step 3: Hacker recalculates all downstream blocks')}
                </span>
              </div>

              {/* Stepper Next Button */}
              <div className="flex items-center gap-2">
                {dominoStep === 1 && (
                  <button
                    type="button"
                    onClick={handleDominoStep2}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-sans font-medium flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>{isVi ? 'Xem Bước 2: Hacker thử sửa Khối #2' : 'Step 2: Hacker edits Block #2'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {dominoStep === 2 && (
                  <button
                    type="button"
                    onClick={handleDominoStep3}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-sans font-medium flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>{isVi ? 'Xem Bước 3: Hacker sửa tiếp Khối #3' : 'Step 3: Hacker edits Block #3'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Stepper Progress Visual */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-sans">
              <div
                className={`p-2 rounded-lg border transition-all ${
                  dominoStep >= 1
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                    : 'bg-black/20 border-white/[0.05] text-slate-500'
                }`}
              >
                <div className="font-semibold">{isVi ? '1. Can thiệp Khối #1' : '1. Tamper Block #1'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {isVi ? 'Hash thực tế #1 lập tức đổi' : 'Actual hash #1 recomputes'}
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border transition-all ${
                  dominoStep === 2
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                    : dominoStep > 2
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                    : 'bg-black/20 border-white/[0.05] text-slate-500'
                }`}
              >
                <div className="font-semibold">{isVi ? '2. Nối lại Khối #2?' : '2. Fix Block #2?'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {isVi ? 'Sửa PrevHash #2 làm Hash #2 nổ tung' : 'Fixing PrevHash #2 breaks Hash #2'}
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border transition-all ${
                  dominoStep === 3
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                    : 'bg-black/20 border-white/[0.05] text-slate-500'
                }`}
              >
                <div className="font-semibold">{isVi ? '3. Lan truyền toàn chuỗi' : '3. Downstream Domino'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {isVi ? 'Bắt buộc tính lại toàn bộ khối sau' : 'Must re-mine all subsequent blocks'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4 Interactive Blocks Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 relative">
          {computedActualBlocks.map((block, idx) => {
            const diagnostic = getBlockDiagnostic(idx);
            const isBlock1 = idx === 1;
            const isDataAltered = block.data !== BASELINE_BLOCKS[idx].data;
            const isHashAltered = block.actualHash !== block.originalMintedHash;
            const isCorrupted = diagnostic.status !== 'valid';

            // Next link
            const linkToNext = idx < 3 ? getLinkStatus(idx) : null;
            const isLinkToNextBroken = linkToNext ? !linkToNext.isValid : false;

            return (
              <div key={block.index} className="flex flex-col space-y-3">
                {/* Block Card */}
                <div
                  className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-3 relative ${
                    diagnostic.status === 'tampered-data'
                      ? 'bg-[#180d19]/95 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40'
                      : diagnostic.status === 'broken-link'
                      ? 'bg-[#19130d]/95 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/30'
                      : diagnostic.status === 'orphaned'
                      ? 'bg-[#121626]/80 border-slate-700/80 opacity-90'
                      : diagnostic.status === 'remined'
                      ? 'bg-[#0b1b24]/90 border-cyan-500/60'
                      : idx === 0
                      ? 'bg-[#0E1526]/90 border-cyan-500/40'
                      : 'bg-[#0E1526]/85 border-white/[0.08] hover:border-cyan-500/30'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isCorrupted ? 'text-rose-400' : 'text-slate-200'
                        }`}
                      >
                        KHỐI #{block.index}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-mono text-cyan-400">
                          · {isVi ? 'KHỞI TẠO' : 'GENESIS'}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium border flex items-center gap-1 transition-all ${
                        diagnostic.status === 'valid' || diagnostic.status === 'remined'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : diagnostic.status === 'tampered-data'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                          : diagnostic.status === 'broken-link'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          diagnostic.status === 'valid' || diagnostic.status === 'remined'
                            ? 'bg-emerald-400'
                            : diagnostic.status === 'tampered-data'
                            ? 'bg-rose-400'
                            : diagnostic.status === 'broken-link'
                            ? 'bg-amber-400'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{isVi ? diagnostic.badgeVi : diagnostic.badgeEn}</span>
                    </span>
                  </div>

                  {/* Previous Hash Row (Top of Block) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-sans text-slate-400">
                      <span className="flex items-center gap-1">
                        <Link2 className="w-3 h-3 text-cyan-400/80" />
                        <span>{isVi ? 'Mã băm trước' : 'Previous Hash'}</span>
                      </span>

                      {/* Flag if this block's stored prev hash fails to match prior block's actual hash */}
                      {idx > 0 &&
                        computedActualBlocks[idx - 1].actualHash !== block.storedPrevHash && (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/30">
                            {isVi ? 'KHÔNG TRỎ VÀO HASH MỚI' : 'MISMATCH'}
                          </span>
                        )}
                    </div>

                    <div
                      className={`p-2.5 rounded-lg font-mono text-xs transition-all break-all ${
                        idx > 0 &&
                        computedActualBlocks[idx - 1].actualHash !== block.storedPrevHash
                          ? 'bg-rose-950/40 text-rose-200 border border-rose-500/50 font-bold'
                          : 'bg-black/30 border border-white/[0.08] text-slate-300'
                      }`}
                    >
                      {idx === 0 ? (
                        <span className="text-slate-500">00000000000000000000... (Mỏ neo Root)</span>
                      ) : (
                        block.storedPrevHash.slice(0, 20) + '...'
                      )}
                    </div>
                  </div>

                  {/* Transaction Data Row (Middle of Block) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-sans text-slate-400">
                      <span>{isVi ? 'Dữ liệu giao dịch' : 'Transaction Data'}</span>
                      {isBlock1 && isDataAltered && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/30">
                          {isVi ? 'ĐÃ BỊ SỬA ĐỔI' : 'ALTERED'}
                        </span>
                      )}
                    </div>

                    {isBlock1 ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={block1Data}
                          onChange={(e) => handleBlock1InputChange(e.target.value)}
                          className={`w-full p-2 rounded-lg text-xs font-sans transition-all outline-none ${
                            isDataAltered
                              ? 'bg-rose-950/50 border border-rose-500 text-rose-100 ring-1 ring-rose-500/30'
                              : 'bg-black/30 border border-white/[0.1] text-slate-200 focus:border-cyan-500/50'
                          }`}
                          placeholder="Nhập nội dung giao dịch..."
                        />
                        <div className="flex items-center justify-between text-[10px] font-sans">
                          <span className="text-slate-500">
                            {isVi ? 'Gốc: Alice chuyển 10 DLU COIN cho Bob' : 'Original: 10 DLU COIN'}
                          </span>
                          {isDataAltered && (
                            <button
                              type="button"
                              onClick={() => handleBlock1InputChange(BASELINE_BLOCKS[1].data)}
                              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                            >
                              {isVi ? 'Khôi phục' : 'Revert'}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg text-xs leading-relaxed font-sans bg-black/30 border border-white/[0.08] text-slate-300 min-h-[38px] flex items-center">
                        {block.data}
                      </div>
                    )}
                  </div>

                  {/* Block Hash Row (Bottom of Block) */}
                  <div className="pt-2.5 border-t border-white/[0.06] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-sans text-slate-400">
                      <span className="font-semibold text-slate-300">
                        {isVi ? 'Mã băm khối thực tế' : 'Actual Block Hash'}
                      </span>
                      <span className="text-[9px] font-mono text-cyan-400/80">SHA-256</span>
                    </div>

                    {/* Actual Hash Box */}
                    <div
                      className={`p-2.5 rounded-lg font-mono text-xs transition-all break-all ${
                        isHashAltered
                          ? 'bg-rose-950/50 text-rose-200 border border-rose-500/70 font-bold shadow-sm'
                          : 'bg-black/30 border border-white/[0.08] text-cyan-300 font-semibold'
                      }`}
                    >
                      {block.actualHash.slice(0, 20)}...
                    </div>

                    {/* Compare with originally minted hash if altered */}
                    {isHashAltered && (
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] space-y-0.5 text-rose-300 font-sans">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-slate-400">{isVi ? 'Hash gốc khi đúc:' : 'Minted:'}</span>
                          <span className="text-slate-300 line-through">
                            {block.originalMintedHash.slice(0, 14)}...
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-mono font-bold text-rose-400">
                          <span>{isVi ? 'Hash mới nổ tung:' : 'New Hash:'}</span>
                          <span>{block.actualHash.slice(0, 14)}...</span>
                        </div>
                      </div>
                    )}

                    {/* Educational diagnostic helper */}
                    <div className="text-[10px] text-slate-400 font-sans leading-tight pt-1">
                      {isVi ? diagnostic.descVi : diagnostic.descEn}
                    </div>
                  </div>
                </div>

                {/* DIRECT VISUAL AFFORDANCE CONNECTOR (Bridge between block i and block i+1) */}
                {linkToNext && (
                  <div className="py-1">
                    {/* Broken Link Visual: Side-by-Side Comparison Box */}
                    {isLinkToNextBroken ? (
                      <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/50 space-y-2 text-xs font-sans animate-in fade-in">
                        <div className="flex items-center justify-between text-[11px] font-bold text-rose-400 uppercase tracking-wide">
                          <span className="flex items-center gap-1.5">
                            <Unlink className="w-3.5 h-3.5 text-rose-400" />
                            <span>
                              {isVi
                                ? `GÃY LIÊN KẾT: KHỐI #${idx} ➔ KHỐI #${idx + 1}`
                                : `BROKEN POINTER: BLOCK #${idx} -> #${idx + 1}`}
                            </span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300">
                            {isVi ? 'KHÔNG KHỚP' : 'MISMATCH'}
                          </span>
                        </div>

                        {/* Direct Comparison Rows (No eye squinting!) */}
                        <div className="space-y-1 font-mono text-[11px] bg-black/40 p-2 rounded-lg border border-rose-500/30">
                          <div className="flex items-center justify-between text-rose-300">
                            <span className="text-slate-400 text-[10px] font-sans">
                              {isVi ? `Hash mới Khối #${idx}:` : `Block #${idx} New Hash:`}
                            </span>
                            <span className="font-bold text-rose-400">
                              {computedActualBlocks[idx].actualHash.slice(0, 14)}...
                            </span>
                          </div>

                          <div className="flex items-center justify-center text-rose-500 font-bold text-sm -my-0.5">
                            ≠
                          </div>

                          <div className="flex items-center justify-between text-amber-300">
                            <span className="text-slate-400 text-[10px] font-sans">
                              {isVi ? `PrevHash lưu ở Khối #${idx + 1}:` : `Block #${idx + 1} Stored Prev:`}
                            </span>
                            <span className="font-bold text-amber-300">
                              {computedActualBlocks[idx + 1].storedPrevHash.slice(0, 14)}...
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-rose-300/90 leading-tight">
                          {isVi
                            ? `Khối #${idx + 1} vẫn đang lưu con trỏ cũ, không trỏ đúng vào mã băm mới của Khối #${idx}. Toàn bộ mạng lưới P2P lập tức từ chối giao dịch này!`
                            : `Block #${idx + 1} references old hash, failing cryptographic continuity.`}
                        </div>
                      </div>
                    ) : (
                      /* Valid Link Visual: Clean Lock Arrow */
                      <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-[11px] font-sans text-emerald-300 px-3">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-medium">
                            {isVi
                              ? `Liên kết Khối #${idx} ➔ #${idx + 1}: Khớp 100%`
                              : `Link #${idx} -> #${idx + 1}: Sealed 100%`}
                          </span>
                        </span>
                        <span className="font-mono text-[10px] text-emerald-400/80">
                          {computedActualBlocks[idx].actualHash.slice(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pedagogical Synthesis Card */}
        {isBlock1Tampered ? (
          <div className="p-4 rounded-xl bg-rose-950/25 border border-rose-500/40 text-xs leading-relaxed space-y-2 font-sans">
            <div className="flex items-center gap-2 font-semibold text-rose-300">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>
                {isVi
                  ? 'Bản chất mật mã học: Vì sao không thể âm thầm sửa dữ liệu trong Blockchain?'
                  : 'Cryptographic Reality: Why silent modification is mathematically impossible'}
              </span>
            </div>
            <p className="text-rose-200/90 text-xs leading-relaxed">
              {isVi
                ? 'Khi dữ liệu ở Khối #1 thay đổi từ 10 thành 999 DLU COIN, hàm băm SHA-256 lập tức cho ra một chuỗi băm hoàn toàn khác biệt (Hiệu ứng tuyết lở). Do Khối #2 vẫn lưu trữ Mã băm trước (PrevHash) cũ, liên kết giữa Khối #1 và #2 bị đứt gãy ngay lập tức.'
                : 'Altering data in Block #1 drastically mutates its SHA-256 hash. Because Block #2 stores the old Previous Hash, the cryptographic pointer is instantly severed.'}
            </p>
            <div className="pt-2 border-t border-rose-500/20 text-[11px] text-rose-300/80">
              {isVi
                ? '👉 Để nối lại chuỗi, kẻ tấn công phải sửa đổi trường PrevHash của Khối #2, nhưng việc này lại làm đổi Hash của Khối #2 và gãy tiếp Khối #3! Đây chính là hiệu ứng Domino bảo vệ tính bất biến của Blockchain.'
                : '👉 Fixing downstream links requires recalculating every subsequent block, rendering deep tampering computationally intractable.'}
            </div>
          </div>
        ) : (
          <div className="bg-cyan-950/20 border-l-2 border-cyan-400/80 border-y border-r border-white/[0.05] rounded-r-xl p-4 text-xs font-sans text-slate-300 leading-relaxed space-y-1">
            <div className="text-cyan-300 font-semibold">
              {isVi
                ? 'Tính phát hiện giả mạo (Tamper-Evidence) của Con trỏ băm'
                : 'Tamper-Evidence Property of Hash Pointers'}
            </div>
            <p className="text-slate-400 text-xs">
              {isVi
                ? 'Khác với Danh sách liên kết (Linked List) chỉ lưu địa chỉ ô nhớ RAM và dễ dàng bị ghi đè, Blockchain dùng Con trỏ băm mật mã (Mã băm trước). Bất kỳ sự can thiệp nào vào dữ liệu quá khứ đều bị toàn bộ mạng lưới phát hiện ngay tại điểm gãy đầu tiên.'
                : 'Unlike Linked Lists that store transient RAM pointers, Blockchain anchors every node with cryptographic SHA-256 hashes.'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 mt-6 border-t border-white/[0.06] gap-3">
        <span className="text-xs font-sans text-slate-400">
          {isVi
            ? 'Tiếp theo: Khám phá 4 khái niệm Mật Mã Học Nền Tảng'
            : 'Next: Explore fundamental Cryptography concepts'}
        </span>

        <button
          type="button"
          onClick={onNextStage}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
        >
          <span>
            {isVi
              ? 'Tiếp tục sang Mật Mã Học Nền Tảng →'
              : 'Continue to Cryptography →'}
          </span>
        </button>
      </div>
    </div>
  );
};


