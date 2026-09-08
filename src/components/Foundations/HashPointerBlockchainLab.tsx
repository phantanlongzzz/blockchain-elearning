import React, { useState, useMemo } from 'react';
import {
  Edit3,
  ArrowRight,
  ArrowDown,
  RotateCcw,
  Zap,
  Lock,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  GitFork,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { fastSha256Hex } from '../../utils/sha256';

interface HashPointerBlockchainLabProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
}

// 4-Block Baseline with canonical Vietnamese transaction data
const BASELINE_BLOCKS: { index: number; data: string }[] = [
  { index: 0, data: 'Khối Khởi tạo · DLU Genesis Block' },
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

  // Minted original baseline chain (immutable reference for honest network)
  const originalChain = useMemo(
    () => mintCleanChain(BASELINE_BLOCKS.map((b) => b.data)),
    []
  );

  // Stepper state:
  // 0: Clean baseline (Honest Canonical Chain)
  // 1: Step 1 - Tamper Block 1 data -> Block 1 actual hash mutates, Link 1->2 broken
  // 2: Step 2 - Hacker patches Block 2's PrevHash -> Block 2 hash mutates, Link 2->3 broken
  // 3: Step 3 - Hacker re-mines all downstream blocks -> Local hash pointers match, BUT rejected by P2P network (Longest Chain Rule)
  const [dominoStep, setDominoStep] = useState<0 | 1 | 2 | 3>(0);

  // Toggle for consensus explanation in Step 3
  const [showConsensusDetails, setShowConsensusDetails] = useState<boolean>(false);

  // Active tooltip modal/drawer state
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  // Editable Block 1 data
  const [block1Data, setBlock1Data] = useState<string>(BASELINE_BLOCKS[1].data);

  // Stored Previous Hashes in each block's header
  const [storedPrevHashes, setStoredPrevHashes] = useState<string[]>([
    originalChain[0].previousHash,
    originalChain[1].previousHash,
    originalChain[2].previousHash,
    originalChain[3].previousHash,
  ]);

  const isBlock1Tampered = block1Data !== BASELINE_BLOCKS[1].data;

  // Real-time computed actual hashes of each block in current local view
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
    }[] = [];

    datas.forEach((data, idx) => {
      const prev = storedPrevHashes[idx] || GENESIS_PREV_HASH;
      const actualHash = computeBlockHash(idx, prev, data);

      currentBlocks.push({
        index: idx,
        data,
        storedPrevHash: prev,
        actualHash,
      });
    });

    return currentBlocks;
  }, [block1Data, storedPrevHashes]);

  // Stepper transitions
  const applyStep1 = () => {
    const tampered = 'Alice chuyển 999 DLU COIN cho Hacker';
    setBlock1Data(tampered);
    setDominoStep(1);
    setStoredPrevHashes([
      originalChain[0].previousHash,
      originalChain[1].previousHash,
      originalChain[2].previousHash,
      originalChain[3].previousHash,
    ]);
    onInteracted?.();
  };

  const applyStep2 = () => {
    const h1 = computeBlockHash(1, originalChain[1].previousHash, block1Data);
    setStoredPrevHashes([
      originalChain[0].previousHash,
      originalChain[1].previousHash,
      h1,
      originalChain[3].previousHash,
    ]);
    setDominoStep(2);
    onInteracted?.();
  };

  const applyStep3 = () => {
    const h1 = computeBlockHash(1, originalChain[1].previousHash, block1Data);
    const h2 = computeBlockHash(2, h1, BASELINE_BLOCKS[2].data);
    setStoredPrevHashes([
      originalChain[0].previousHash,
      originalChain[1].previousHash,
      h1,
      h2,
    ]);
    setDominoStep(3);
    onInteracted?.();
  };

  const handleReset = () => {
    setBlock1Data(BASELINE_BLOCKS[1].data);
    setStoredPrevHashes([
      originalChain[0].previousHash,
      originalChain[1].previousHash,
      originalChain[2].previousHash,
      originalChain[3].previousHash,
    ]);
    setDominoStep(0);
    setActiveTooltip(null);
  };

  const handleBlock1Change = (val: string) => {
    setBlock1Data(val);
    if (val === BASELINE_BLOCKS[1].data) {
      handleReset();
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

  // Connector status computation: 'valid' | 'broken' | 'forked' | 'invalidated'
  const getConnectorState = (fromIdx: number): {
    status: 'valid' | 'broken' | 'forked' | 'invalidated';
    labelVi: string;
    labelEn: string;
  } => {
    if (dominoStep === 0) {
      return { status: 'valid', labelVi: 'Khớp', labelEn: 'Valid' };
    }

    if (fromIdx === 0) {
      // 0 -> 1 is always valid
      return { status: 'valid', labelVi: 'Khớp', labelEn: 'Valid' };
    }

    if (fromIdx === 1) {
      if (dominoStep === 1) {
        return {
          status: 'broken',
          labelVi: 'Gãy',
          labelEn: 'Broken',
        };
      }
      // In Step 2 & 3, Hacker patched PrevHash on his private fork
      return {
        status: 'forked',
        labelVi: 'Đã vá',
        labelEn: 'Patched',
      };
    }

    if (fromIdx === 2) {
      if (dominoStep === 1) {
        return {
          status: 'invalidated',
          labelVi: 'Vô hiệu',
          labelEn: 'Orphaned',
        };
      }
      if (dominoStep === 2) {
        return {
          status: 'broken',
          labelVi: 'Gãy',
          labelEn: 'Broken',
        };
      }
      // Step 3: Recalculated on fork
      return {
        status: 'forked',
        labelVi: 'Đã đào lại',
        labelEn: 'Re-mined',
      };
    }

    return { status: 'valid', labelVi: 'Khớp', labelEn: 'Valid' };
  };

  // Block diagnostics: 1 Block = 1 Core State
  // Variants: 'cyan' (Valid/Canonical), 'rose' (Tampered/Broken), 'amber' (Forked/Re-mined on attacker branch), 'slate' (Unreachable/Downstream severed)
  const getBlockState = (idx: number) => {
    if (idx === 0) {
      return {
        variant: 'cyan' as const,
        badge: isVi ? 'HỢP LỆ' : 'VALID',
        desc: isVi
          ? 'Khối Genesis khởi nguyên, điểm neo bất biến của toàn hệ thống.'
          : 'Genesis block, immutable root anchor of the blockchain.',
      };
    }

    if (idx === 1) {
      if (isBlock1Tampered) {
        return {
          variant: 'rose' as const,
          badge: isVi ? 'BỊ SỬA' : 'TAMPERED',
          desc: isVi
            ? 'Nội dung giao dịch bị can thiệp làm mã băm SHA-256 thay đổi ngay lập tức (hiệu ứng tuyết lở).'
            : 'Transaction payload was modified, instantly mutating the SHA-256 hash.',
        };
      }
      return {
        variant: 'cyan' as const,
        badge: isVi ? 'HỢP LỆ' : 'VALID',
        desc: isVi ? 'Dữ liệu và mã băm toàn vẹn.' : 'Cryptographically intact and valid.',
      };
    }

    if (idx === 2) {
      if (dominoStep === 1) {
        return {
          variant: 'rose' as const,
          badge: isVi ? 'GÃY LIÊN KẾT' : 'BROKEN LINK',
          desc: isVi
            ? 'PrevHash đang lưu trữ không khớp với Hash của Khối #1.'
            : 'Stored PrevHash does not match the new hash of Block #1.',
        };
      }
      if (dominoStep === 2) {
        return {
          variant: 'rose' as const,
          badge: isVi ? 'HASH ĐỔI' : 'HASH MUTATED',
          desc: isVi
            ? 'Vá PrevHash làm thay đổi Hash của chính Khối #2, tiếp tục làm gãy Khối #3.'
            : 'Patching PrevHash altered Block #2 own hash, breaking the link to Block #3.',
        };
      }
      if (dominoStep === 3) {
        return {
          variant: 'amber' as const,
          badge: isVi ? 'ĐÃ ĐÀO LẠI' : 'RE-MINED',
          desc: isVi
            ? 'Đã được hacker tính toán lại mã băm trên nhánh rẽ cá nhân.'
            : 'Recalculated on the attacker private fork.',
        };
      }
      return {
        variant: 'cyan' as const,
        badge: isVi ? 'HỢP LỆ' : 'VALID',
        desc: isVi ? 'Mã băm và con trỏ toàn vẹn.' : 'Cryptographically intact and valid.',
      };
    }

    // idx === 3
    if (dominoStep === 1 || dominoStep === 2) {
      return {
        variant: 'slate' as const,
        badge: isVi ? 'VÔ HIỆU' : 'ORPHANED',
        desc: isVi
          ? 'Khối đứng trước bị gãy nên toàn bộ chuỗi phía sau bị vô hiệu hóa.'
          : 'Orphaned because preceding link was severed.',
      };
    }
    if (dominoStep === 3) {
      return {
        variant: 'amber' as const,
        badge: isVi ? 'ĐÃ ĐÀO LẠI' : 'RE-MINED',
        desc: isVi
          ? 'Hacker đã đào lại toàn bộ để nối con trỏ, nhưng mạng lưới P2P từ chối do thua độ khó tích lũy.'
          : 'Re-mined on attacker fork, but rejected by P2P network under longest chain rule.',
      };
    }
    return {
      variant: 'cyan' as const,
      badge: isVi ? 'HỢP LỆ' : 'VALID',
      desc: isVi ? 'Mã băm và con trỏ toàn vẹn.' : 'Cryptographically intact and valid.',
    };
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F19]/80 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            {isVi ? 'Giai đoạn 04 · Kháng giả mạo' : 'Stage 04 · Tamper Resistance'}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white font-sans">
            {isVi
              ? 'Cơ Chế Con Trỏ Băm & Tại Sao Không Thể Làm Giả Quá Khứ'
              : 'Hash Pointers & Why Blockchain History Is Immutable'}
          </h3>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={applyStep1}
            disabled={isBlock1Tampered && dominoStep === 1}
            className="px-3.5 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 disabled:opacity-40 text-rose-300 hover:text-rose-200 border border-rose-500/40 text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isVi ? 'Sửa Khối #1 (10 → 999)' : 'Tamper Block #1'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-lg text-slate-300 hover:text-white bg-white/[0.05] border border-white/[0.1] hover:border-cyan-500/40 transition-all cursor-pointer text-xs font-sans flex items-center gap-1.5"
            title={isVi ? 'Khôi phục về chuỗi hợp lệ ban đầu' : 'Reset to clean canonical state'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{isVi ? 'Khôi phục gốc' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* 2. Stepper 3 Bước Tinh Gọn Ở Đầu Trang */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Bước 1 */}
        <button
          type="button"
          onClick={applyStep1}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            dominoStep === 1
              ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] ring-1 ring-rose-500/50'
              : 'bg-[#0B0F19]/60 border-white/[0.08] hover:border-white/[0.2]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`text-xs font-mono font-bold leading-normal ${
                dominoStep === 1 ? 'text-rose-300' : 'text-slate-300'
              }`}
            >
              {isVi ? 'Bước 1: Sửa dữ liệu tại #1' : 'Step 1: Tamper data at #1'}
            </span>
            {dominoStep === 1 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
            )}
          </div>
          <p className="text-xs font-sans text-slate-400 leading-relaxed">
            {isVi
              ? 'Hash #1 nổ sang giá trị mới ngay lập tức. Con trỏ tại #2 bị lệch (Gãy liên kết #1 → #2).'
              : 'Hash #1 mutates instantly. Link to #2 is broken.'}
          </p>
        </button>

        {/* Bước 2 */}
        <button
          type="button"
          onClick={applyStep2}
          disabled={!isBlock1Tampered}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between disabled:opacity-40 disabled:cursor-not-allowed ${
            dominoStep === 2
              ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] ring-1 ring-rose-500/50'
              : 'bg-[#0B0F19]/60 border-white/[0.08] hover:border-white/[0.2]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`text-xs font-mono font-bold leading-normal ${
                dominoStep === 2 ? 'text-rose-300' : 'text-slate-300'
              }`}
            >
              {isVi ? 'Bước 2: Sửa PrevHash tại #2' : 'Step 2: Patch PrevHash at #2'}
            </span>
            {dominoStep === 2 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
            )}
          </div>
          <p className="text-xs font-sans text-slate-400 leading-relaxed">
            {isVi
              ? 'Khối #2 vá lại với #1, nhưng làm Hash của chính #2 đổi theo, tiếp tục gãy liên kết sang #3.'
              : 'Patching #2 mutates Hash #2, continuing to break link with #3.'}
          </p>
        </button>

        {/* Bước 3 */}
        <button
          type="button"
          onClick={applyStep3}
          disabled={!isBlock1Tampered}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between disabled:opacity-40 disabled:cursor-not-allowed ${
            dominoStep === 3
              ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50'
              : 'bg-[#0B0F19]/60 border-white/[0.08] hover:border-white/[0.2]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`text-xs font-mono font-bold leading-normal ${
                dominoStep === 3 ? 'text-amber-300' : 'text-slate-300'
              }`}
            >
              {isVi ? 'Bước 3: Đào lại toàn bộ chuỗi' : 'Step 3: Re-mine downstream'}
            </span>
            {dominoStep === 3 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            )}
          </div>
          <p className="text-xs font-sans text-slate-400 leading-relaxed">
            {isVi
              ? 'Hacker tính toán lại toàn bộ con trỏ. Các khối khớp toán học, nhưng bị mạng P2P từ chối vì thua độ khó tích lũy.'
              : 'Internal pointers match, but P2P network rejects it under the Longest Chain Rule.'}
          </p>
        </button>
      </div>

      {/* 3. Main Chain Display */}
      <div className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-white/[0.08] space-y-4">
        {/* Status Line: Clear distinction between Internal Structural Linkage & Network Consensus */}
        <div className="pb-3 border-b border-white/[0.06] space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            {/* Primary Status */}
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  dominoStep === 0
                    ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                    : dominoStep === 3
                    ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                    : 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
                }`}
              />
              <span
                className={`text-xs font-mono font-bold tracking-wide uppercase ${
                  dominoStep === 0
                    ? 'text-cyan-300'
                    : dominoStep === 3
                    ? 'text-amber-300'
                    : 'text-rose-300'
                }`}
              >
                {dominoStep === 0 &&
                  (isVi
                    ? 'TRẠNG THÁI: CHUỖI CHÍNH THỨC (CANONICAL) · HỢP LỆ TOÀN VẸN'
                    : 'STATUS: CANONICAL CHAIN · FULLY VALID')}
                {dominoStep === 1 &&
                  (isVi
                    ? 'TRẠNG THÁI: GÃY LIÊN KẾT MẬT MÃ (KHỐI #1 BỊ SỬA ➔ #2 TỪ CHỐI)'
                    : 'STATUS: CRYPTOGRAPHIC LINK BROKEN (BLOCK #1 TAMPERED)')}
                {dominoStep === 2 &&
                  (isVi
                    ? 'TRẠNG THÁI: HIỆU ỨNG DOMINO (VÁ #2 LÀM HASH #2 ĐỔI ➔ GÃY SANG #3)'
                    : 'STATUS: DOMINO EFFECT (PATCHING #2 BREAKS LINK TO #3)')}
                {dominoStep === 3 &&
                  (isVi
                    ? 'TRẠNG THÁI: CON TRỎ NỘI BỘ ĐÃ NỐI · MẠNG P2P TỪ CHỐI (QUY TẮC ĐỘ KHÓ TÍCH LŨY)'
                    : 'STATUS: POINTERS SEALED · REJECTED BY P2P CONSENSUS (LONGEST CHAIN RULE)')}
              </span>
            </div>

            {/* Sub-tag indication */}
            <div className="flex items-center gap-2 text-[11px] font-mono">
              {dominoStep === 3 ? (
                <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium">
                  {isVi ? 'Nhánh rẽ mồ côi (Orphan Fork)' : 'Orphaned Fork'}
                </span>
              ) : (
                <span className="text-slate-400 font-sans text-xs">
                  {isVi ? 'Quy tắc: Hash(N) = PrevHash(N+1)' : 'Rule: Hash(N) = PrevHash(N+1)'}
                </span>
              )}
            </div>
          </div>

          {/* Collapsible Accordion for Step 3 */}
          {dominoStep === 3 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowConsensusDetails(!showConsensusDetails)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-sans transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {isVi
                    ? 'Vì sao chuỗi này bị từ chối? (Quy tắc chuỗi dài nhất)'
                    : 'Why is this chain rejected? (Longest chain rule)'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-200 ${
                    showConsensusDetails ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showConsensusDetails && (
                <div className="mt-2 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs font-sans text-amber-100 flex items-start gap-2.5 leading-relaxed animate-in fade-in duration-150">
                  <GitFork className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    {isVi
                      ? 'Trên mạng P2P phân tán, các node tuân thủ Quy tắc chuỗi có độ khó tích lũy lớn nhất (Longest Chain Rule). Trong thời gian kẻ tấn công đào lại các khối cũ, mạng lưới trung thực đã đào tiếp các khối mới (#4, #5...), khiến nhánh giả mạo bị cô lập vĩnh viễn thành nhánh mồ côi (Orphaned Fork).'
                      : 'Distributed nodes follow the Longest Chain Rule. While the attacker re-mined past blocks, the honest network continued advancing with new blocks, leaving the attacker fork permanently isolated as an orphan.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4 Blocks Display with Inline Connectors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4 items-stretch">
          {computedActualBlocks.map((block, idx) => {
            const blockState = getBlockState(idx);
            const isBlock1 = idx === 1;
            const connector = idx < 3 ? getConnectorState(idx) : null;

            return (
              <div key={block.index} className="flex flex-col justify-between space-y-3">
                {/* 1 Block Card */}
                <div
                  className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                    blockState.variant === 'rose'
                      ? 'bg-[#190D14] border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                      : blockState.variant === 'amber'
                      ? 'bg-[#1C1409] border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : blockState.variant === 'slate'
                      ? 'bg-[#0F172A] border-slate-700/90'
                      : 'bg-[#0B1528] border-cyan-500/40 hover:border-cyan-500/60'
                  }`}
                >
                  {/* Header: Block Title + Status Badge */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
                    <div className="flex items-center">
                      <span
                        className={`text-xs font-sans font-bold tracking-tight leading-normal ${
                          blockState.variant === 'rose'
                            ? 'text-rose-200'
                            : blockState.variant === 'amber'
                            ? 'text-amber-200'
                            : blockState.variant === 'slate'
                            ? 'text-slate-300'
                            : 'text-white'
                        }`}
                      >
                        {isVi ? `KHỐI #${block.index}` : `BLOCK #${block.index}`}
                      </span>

                      {/* Tooltip trigger button */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTooltip(activeTooltip === block.index ? null : block.index)
                        }
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-slate-300 hover:text-white text-[10px] font-mono leading-none align-middle ml-1.5 transition-colors cursor-pointer"
                        title={blockState.desc}
                      >
                        ?
                      </button>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider leading-none whitespace-nowrap ${
                        blockState.variant === 'rose'
                          ? 'bg-rose-500/20 text-rose-200 border border-rose-500/50'
                          : blockState.variant === 'amber'
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50'
                          : blockState.variant === 'slate'
                          ? 'bg-slate-800 text-slate-300 border border-slate-600/70'
                          : 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40'
                      }`}
                    >
                      {blockState.badge}
                    </span>
                  </div>

                  {/* Tooltip drawer if active */}
                  {activeTooltip === block.index && (
                    <div className="p-2.5 rounded-lg bg-black/60 border border-white/[0.12] text-[11px] font-sans text-slate-200 leading-relaxed animate-in fade-in duration-150">
                      {blockState.desc}
                    </div>
                  )}

                  {/* Tầng 1: PrevHash */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-sans text-slate-400">
                      PrevHash:
                    </div>
                    <div
                      className={`p-2.5 rounded-lg font-mono text-xs truncate transition-all ${
                        blockState.variant === 'rose'
                          ? 'bg-black/50 border border-rose-500/30 text-rose-200'
                          : blockState.variant === 'amber'
                          ? 'bg-black/50 border border-amber-500/30 text-amber-200'
                          : blockState.variant === 'slate'
                          ? 'bg-black/40 border border-slate-700/60 text-slate-300'
                          : 'bg-black/50 border border-cyan-500/20 text-cyan-200'
                      }`}
                      title={block.storedPrevHash}
                    >
                      {block.storedPrevHash.slice(0, 18)}...
                    </div>
                  </div>

                  {/* Tầng 2: Data (NO TRUNCATION, FULL TEXT VISIBLE) */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-sans text-slate-400">
                      {isVi ? 'Giao dịch:' : 'Transaction:'}
                    </div>

                    {isBlock1 ? (
                      <div className="space-y-1">
                        <textarea
                          rows={2}
                          value={block1Data}
                          onChange={(e) => handleBlock1Change(e.target.value)}
                          className={`w-full p-2.5 rounded-lg text-xs font-sans leading-relaxed resize-none outline-none transition-all ${
                            isBlock1Tampered
                              ? 'bg-rose-950/60 border-2 border-rose-500 text-rose-100 font-medium placeholder-rose-400/60'
                              : 'bg-black/50 border border-white/[0.12] text-slate-200 focus:border-cyan-500'
                          }`}
                          placeholder={isVi ? 'Nội dung giao dịch...' : 'Transaction payload...'}
                        />
                      </div>
                    ) : (
                      <div
                        className={`p-2.5 rounded-lg text-xs font-sans leading-relaxed min-h-[52px] flex items-center break-words ${
                          blockState.variant === 'rose'
                            ? 'bg-black/50 border border-rose-500/30 text-rose-100 font-medium'
                            : blockState.variant === 'amber'
                            ? 'bg-black/50 border border-amber-500/30 text-amber-100 font-medium'
                            : blockState.variant === 'slate'
                            ? 'bg-black/40 border border-slate-700/60 text-slate-200'
                            : 'bg-black/50 border border-white/[0.08] text-slate-100'
                        }`}
                      >
                        {block.data}
                      </div>
                    )}
                  </div>

                  {/* Tầng 3: BlockHash (SHA-256) */}
                  <div className="space-y-1 pt-2 border-t border-white/[0.08]">
                    <div className="text-[11px] font-sans text-slate-400 flex items-center justify-between">
                      <span>BlockHash:</span>
                      <span className="text-[10px] font-mono text-slate-400">SHA-256</span>
                    </div>
                    <div
                      className={`p-2.5 rounded-lg font-mono text-xs truncate font-semibold transition-all ${
                        blockState.variant === 'rose'
                          ? 'bg-rose-950/40 border border-rose-500/50 text-rose-300'
                          : blockState.variant === 'amber'
                          ? 'bg-amber-950/40 border border-amber-500/50 text-amber-300'
                          : blockState.variant === 'slate'
                          ? 'bg-black/40 border border-slate-700/60 text-slate-300'
                          : 'bg-black/50 border border-cyan-500/30 text-cyan-300'
                      }`}
                      title={block.actualHash}
                    >
                      {block.actualHash.slice(0, 18)}...
                    </div>
                  </div>
                </div>

                {/* Inline Chain Connector to Next Block */}
                {connector && (
                  <div className="flex items-center justify-center p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                    <div
                      className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-mono font-medium flex items-center justify-center gap-2 border transition-all ${
                        connector.status === 'valid'
                          ? 'text-cyan-200 bg-cyan-500/10 border-cyan-500/40'
                          : connector.status === 'broken'
                          ? 'text-rose-200 bg-rose-500/20 border-rose-500/60 font-bold shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                          : connector.status === 'forked'
                          ? 'text-amber-200 bg-amber-500/20 border-amber-500/50 font-bold'
                          : 'text-slate-300 bg-slate-800/80 border-slate-700'
                      }`}
                    >
                      {connector.status === 'valid' && (
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                      {connector.status === 'broken' && (
                        <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30 shrink-0" />
                      )}
                      {connector.status === 'forked' && (
                        <GitFork className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      {connector.status === 'invalidated' && (
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}

                      <span className="leading-normal">
                        #{idx} ➔ #{idx + 1}: {isVi ? connector.labelVi : connector.labelEn}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 4. Semantic Color Legend (Clean & Uncluttered) */}
        <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-center sm:justify-end gap-4 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1.5 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            {isVi ? 'Hợp lệ' : 'Valid'}
          </span>
          <span className="inline-flex items-center gap-1.5 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {isVi ? 'Bị sửa / Gãy' : 'Tampered / Broken'}
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {isVi ? 'Nhánh rẽ' : 'Fork'}
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            {isVi ? 'Vô hiệu' : 'Orphaned'}
          </span>
        </div>
      </div>

      {/* 5. Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/[0.06] gap-3">
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
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
