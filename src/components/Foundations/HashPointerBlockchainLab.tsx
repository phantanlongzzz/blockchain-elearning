import React, { useState, useMemo } from 'react';
import {
  Edit3,
  ArrowRight,
  ArrowDown,
  RotateCcw,
  Zap,
  Lock,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
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

  // Minted original baseline chain (immutable reference)
  const originalChain = useMemo(
    () => mintCleanChain(BASELINE_BLOCKS.map((b) => b.data)),
    []
  );

  // Stepper state:
  // 0: Clean baseline
  // 1: Step 1 - Tamper Block 1 data -> Block 1 actual hash explodes, Link 1->2 broken
  // 2: Step 2 - Hacker tries fixing Block 2's PrevHash -> Block 2 hash explodes, Link 2->3 broken
  // 3: Step 3 - Hacker recalculates Block 3 -> Local chain re-mined, network rejects alternative tip
  const [dominoStep, setDominoStep] = useState<0 | 1 | 2 | 3>(0);

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

  // Connector status computation: 'valid' | 'broken' | 'invalidated'
  const getConnectorState = (fromIdx: number): {
    status: 'valid' | 'broken' | 'invalidated';
    labelVi: string;
    labelEn: string;
  } => {
    if (dominoStep === 0) {
      return { status: 'valid', labelVi: 'KHỚP 100%', labelEn: 'SEALED 100%' };
    }

    if (fromIdx === 0) {
      // 0 -> 1 is always valid
      return { status: 'valid', labelVi: 'KHỚP 100%', labelEn: 'SEALED 100%' };
    }

    if (fromIdx === 1) {
      if (dominoStep === 1) {
        return {
          status: 'broken',
          labelVi: 'Hash mới ≠ PrevHash',
          labelEn: 'New Hash ≠ PrevHash',
        };
      }
      // Step 2 or 3: Hacker patched Link 1->2
      return { status: 'valid', labelVi: 'ĐÃ NỐI LẠI', labelEn: 'RE-LINKED' };
    }

    if (fromIdx === 2) {
      if (dominoStep === 1) {
        return {
          status: 'invalidated',
          labelVi: 'Vô hiệu hóa',
          labelEn: 'Invalidated',
        };
      }
      if (dominoStep === 2) {
        return {
          status: 'broken',
          labelVi: 'Hash mới ≠ PrevHash',
          labelEn: 'New Hash ≠ PrevHash',
        };
      }
      return { status: 'valid', labelVi: 'ĐÃ TÍNH LẠI', labelEn: 'RE-CALCULATED' };
    }

    return { status: 'valid', labelVi: 'KHỚP', labelEn: 'SEALED' };
  };

  // Block diagnostics: 1 Block = 1 Core State
  const getBlockState = (idx: number) => {
    if (idx === 0) {
      return {
        variant: 'cyan' as const,
        badge: isVi ? 'HỢP LỆ' : 'VALID',
        tooltip: isVi ? 'Khối Genesis khởi nguyên, điểm neo bất biến.' : 'Genesis anchor block.',
      };
    }

    if (idx === 1) {
      if (isBlock1Tampered) {
        return {
          variant: 'rose' as const,
          badge: isVi ? 'DỮ LIỆU BỊ SỬA' : 'DATA TAMPERED',
          tooltip: isVi
            ? 'Dữ liệu giao dịch bị thay đổi làm mã băm thực tế thay đổi ngay lập tức.'
            : 'Transaction data was altered, instantly changing actual hash.',
        };
      }
      return {
        variant: 'cyan' as const,
        badge: isVi ? 'HỢP LỆ' : 'VALID',
        tooltip: isVi ? 'Mã băm và con trỏ toàn vẹn.' : 'Cryptographically valid.',
      };
    }

    if (idx === 2) {
      if (dominoStep === 1) {
        return {
          variant: 'rose' as const,
          badge: isVi ? 'GÃY LIÊN KẾT' : 'BROKEN POINTER',
          tooltip: isVi
            ? 'PrevHash lưu trữ không trỏ vào Hash mới của Khối #1.'
            : 'Stored PrevHash does not match new hash of Block #1.',
        };
      }
      if (dominoStep === 2) {
        return {
          variant: 'rose' as const,
          badge: isVi ? 'HASH BỊ BIẾN ĐỔI' : 'HASH MUTATED',
          tooltip: isVi
            ? 'Cố sửa PrevHash để nối với #1 làm Hash của chính Khối #2 đổi theo.'
            : 'Fixing PrevHash mutates Block #2 hash.',
        };
      }
      if (dominoStep === 3) {
        return {
          variant: 'slate' as const,
          badge: isVi ? 'ĐÃ ĐÀO LẠI' : 'RE-MINED',
          tooltip: isVi ? 'Đã tính lại hash trên nhánh giả mạo.' : 'Recalculated on fork.',
        };
      }
      return {
        variant: 'cyan' as const,
        badge: isVi ? 'HỢP LỆ' : 'VALID',
        tooltip: isVi ? 'Mã băm và con trỏ toàn vẹn.' : 'Cryptographically valid.',
      };
    }

    // idx === 3
    if (dominoStep === 1 || dominoStep === 2) {
      return {
        variant: 'slate' as const,
        badge: isVi ? 'VÔ HIỆU HÓA' : 'INVALIDATED',
        tooltip: isVi
          ? 'Dữ liệu chưa bị đổi nhưng chuỗi phía trước đã gãy, mạng lưới từ chối toàn bộ.'
          : 'Data unchanged, but downstream chain rejected by peers.',
      };
    }
    if (dominoStep === 3) {
      return {
        variant: 'slate' as const,
        badge: isVi ? 'ĐÃ ĐÀO LẠI' : 'RE-MINED',
        tooltip: isVi ? 'Đã tính lại hash trên nhánh giả mạo.' : 'Recalculated on fork.',
      };
    }
    return {
      variant: 'cyan' as const,
      badge: isVi ? 'HỢP LỆ' : 'VALID',
      tooltip: isVi ? 'Mã băm và con trỏ toàn vẹn.' : 'Cryptographically valid.',
    };
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F19]/70 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-0.5">
            {isVi ? 'Giai đoạn 04 · Kháng giả mạo' : 'Stage 04 · Tamper Resistance'}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white font-sans">
            {isVi ? 'Vì sao Linked List không phải là Blockchain' : 'Why Linked List ≠ Blockchain'}
          </h3>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={applyStep1}
            disabled={isBlock1Tampered && dominoStep === 1}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 disabled:opacity-40 text-rose-300 hover:text-rose-200 border border-rose-500/40 text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isVi ? 'Sửa Khối #1 (10 → 999)' : 'Tamper Block #1'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-white/[0.05] border border-white/[0.1] hover:border-cyan-500/40 transition-all cursor-pointer text-xs font-sans flex items-center gap-1.5"
            title={isVi ? 'Khôi phục về trạng thái sạch ban đầu' : 'Reset to clean state'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{isVi ? 'Khôi phục gốc' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* 2. Stepper 3 Bước Tinh Gọn Ở Đầu Trang */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* Bước 1 */}
        <button
          type="button"
          onClick={applyStep1}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            dominoStep === 1
              ? 'bg-rose-950/30 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40'
              : 'bg-[#0B0F19]/60 border-white/[0.06] hover:border-white/[0.15]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-xs font-mono font-bold ${
                dominoStep === 1 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {isVi ? 'Bước 1: Sửa dữ liệu tại #1' : 'Step 1: Tamper data at #1'}
            </span>
            {dominoStep === 1 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <p className="text-[11px] font-sans text-slate-400 leading-tight">
            {isVi
              ? 'Quan sát Hash #1 nổ sang giá trị mới, đứt gãy liên kết với #2.'
              : 'Hash #1 changes instantly, severing link with #2.'}
          </p>
        </button>

        {/* Bước 2 */}
        <button
          type="button"
          onClick={applyStep2}
          disabled={!isBlock1Tampered}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between disabled:opacity-40 disabled:cursor-not-allowed ${
            dominoStep === 2
              ? 'bg-rose-950/30 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40'
              : 'bg-[#0B0F19]/60 border-white/[0.06] hover:border-white/[0.15]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-xs font-mono font-bold ${
                dominoStep === 2 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {isVi ? 'Bước 2: Sửa PrevHash tại #2' : 'Step 2: Fix PrevHash at #2'}
            </span>
            {dominoStep === 2 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <p className="text-[11px] font-sans text-slate-400 leading-tight">
            {isVi
              ? 'Nối lại với #1 nhưng làm Hash #2 đổi theo, gãy tiếp với #3.'
              : 'Re-linking to #1 mutates Hash #2, breaking link with #3.'}
          </p>
        </button>

        {/* Bước 3 */}
        <button
          type="button"
          onClick={applyStep3}
          disabled={!isBlock1Tampered}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between disabled:opacity-40 disabled:cursor-not-allowed ${
            dominoStep === 3
              ? 'bg-cyan-950/30 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
              : 'bg-[#0B0F19]/60 border-white/[0.06] hover:border-white/[0.15]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-xs font-mono font-bold ${
                dominoStep === 3 ? 'text-cyan-400' : 'text-slate-300'
              }`}
            >
              {isVi ? 'Bước 3: Hiệu ứng sụp đổ dây chuyền' : 'Step 3: Domino collapse'}
            </span>
            {dominoStep === 3 && (
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </div>
          <p className="text-[11px] font-sans text-slate-400 leading-tight">
            {isVi
              ? 'Không thể sửa quá khứ mà không tốn công đào lại toàn bộ chuỗi.'
              : 'Past is immutable without re-mining all subsequent blocks.'}
          </p>
        </button>
      </div>

      {/* 3. Main Chain Display (Clean Inline Connectors, 1 Card = 1 State, Strict Vertical Alignment) */}
      <div className="p-5 rounded-2xl bg-[#0B0F19]/80 border border-white/[0.08] space-y-4">
        {/* Status Line */}
        <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                dominoStep === 0
                  ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                  : 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
              }`}
            />
            <span
              className={`font-mono font-bold ${
                dominoStep === 0 ? 'text-cyan-400' : 'text-rose-400'
              }`}
            >
              {dominoStep === 0
                ? isVi
                  ? 'TRẠNG THÁI: TOÀN VẸN (HỢP LỆ)'
                  : 'STATUS: VALID'
                : isVi
                ? 'TRẠNG THÁI: PHÁT HIỆN CAN THIỆP GIẢ MẠO'
                : 'STATUS: TAMPER DETECTED'}
            </span>
          </div>

          <span className="text-[11px] font-sans text-slate-500 hidden sm:inline">
            {isVi ? 'Hash(N) khóa chặt vào PrevHash(N+1)' : 'Hash(N) seals PrevHash(N+1)'}
          </span>
        </div>

        {/* 4 Blocks with Inline Connectors in between */}
        <div className="flex flex-col xl:flex-row items-stretch justify-between gap-2.5">
          {computedActualBlocks.map((block, idx) => {
            const blockState = getBlockState(idx);
            const isBlock1 = idx === 1;
            const connector = idx < 3 ? getConnectorState(idx) : null;

            return (
              <React.Fragment key={block.index}>
                {/* 1 Block Card */}
                <div
                  className={`flex-1 min-w-0 p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-2.5 ${
                    blockState.variant === 'rose'
                      ? 'bg-[#190d14]/90 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.12)]'
                      : blockState.variant === 'slate'
                      ? 'bg-[#0c1017]/70 border-slate-800/80 opacity-60'
                      : 'bg-[#0E1526]/85 border-cyan-500/30 hover:border-cyan-500/50'
                  }`}
                >
                  {/* Header: Tên khối + Badge trạng thái cốt lõi */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xs font-mono font-bold ${
                          blockState.variant === 'rose'
                            ? 'text-rose-300'
                            : blockState.variant === 'slate'
                            ? 'text-slate-400'
                            : 'text-white'
                        }`}
                      >
                        KHỐI #{block.index}
                      </span>
                      <span title={blockState.tooltip} className="cursor-help">
                        <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300 transition-colors" />
                      </span>
                    </div>

                    {/* Badge trạng thái */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                        blockState.variant === 'rose'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : blockState.variant === 'slate'
                          ? 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                          : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {blockState.badge}
                    </span>
                  </div>

                  {/* Tầng 1: PrevHash */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-sans text-slate-400">
                      PrevHash:
                    </div>
                    <div
                      className={`p-2 rounded-lg font-mono text-xs truncate transition-all ${
                        blockState.variant === 'slate'
                          ? 'bg-black/20 border border-white/[0.04] text-slate-500'
                          : 'bg-black/40 border border-white/[0.08] text-slate-300'
                      }`}
                      title={block.storedPrevHash}
                    >
                      {block.storedPrevHash.slice(0, 16)}...
                    </div>
                  </div>

                  {/* Tầng 2: Data */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-sans text-slate-400 flex items-center justify-between">
                      <span>Data:</span>
                      {isBlock1 && isBlock1Tampered && (
                        <span className="text-[9px] font-mono text-rose-400 font-bold">
                          ĐÃ SỬA
                        </span>
                      )}
                    </div>

                    {isBlock1 ? (
                      <input
                        type="text"
                        value={block1Data}
                        onChange={(e) => handleBlock1Change(e.target.value)}
                        className={`w-full p-2 rounded-lg text-xs font-sans transition-all outline-none ${
                          isBlock1Tampered
                            ? 'bg-rose-950/40 border border-rose-500 text-rose-100 font-medium'
                            : 'bg-black/40 border border-white/[0.08] text-slate-200 focus:border-cyan-500/50'
                        }`}
                        placeholder="Nội dung giao dịch..."
                      />
                    ) : (
                      <div
                        className={`p-2 rounded-lg text-xs font-sans truncate min-h-[34px] flex items-center ${
                          blockState.variant === 'slate'
                            ? 'bg-black/20 border border-white/[0.04] text-slate-500'
                            : 'bg-black/40 border border-white/[0.08] text-slate-300'
                        }`}
                        title={block.data}
                      >
                        {block.data}
                      </div>
                    )}
                  </div>

                  {/* Tầng 3: BlockHash */}
                  <div className="space-y-1 pt-1 border-t border-white/[0.06]">
                    <div className="text-[11px] font-sans text-slate-400 flex items-center justify-between">
                      <span>BlockHash:</span>
                      <span className="text-[9px] font-mono text-slate-500">SHA-256</span>
                    </div>
                    <div
                      className={`p-2 rounded-lg font-mono text-xs truncate transition-all ${
                        blockState.variant === 'rose'
                          ? 'bg-rose-950/30 border border-rose-500/40 text-rose-300 font-bold'
                          : blockState.variant === 'slate'
                          ? 'bg-black/20 border border-white/[0.04] text-slate-500'
                          : 'bg-black/40 border border-white/[0.08] text-cyan-300 font-semibold'
                      }`}
                      title={block.actualHash}
                    >
                      {block.actualHash.slice(0, 16)}...
                    </div>
                  </div>
                </div>

                {/* Inline Chain Connector between Block idx and Block idx+1 */}
                {connector && (
                  <>
                    {/* Desktop Connector (xl) */}
                    <div className="hidden xl:flex flex-col items-center justify-center px-1 shrink-0 w-24 my-auto space-y-1.5">
                      {/* Visual Line with Icon */}
                      <div className="w-full flex items-center justify-center relative">
                        {/* Connecting Line */}
                        <div
                          className={`w-full h-0.5 ${
                            connector.status === 'valid'
                              ? 'bg-cyan-500/60'
                              : connector.status === 'broken'
                              ? 'border-t-2 border-dashed border-rose-500'
                              : 'border-t-2 border-dotted border-slate-700'
                          }`}
                        />

                        {/* Center Icon badge */}
                        <div
                          className={`absolute p-1 rounded-full border transition-all ${
                            connector.status === 'valid'
                              ? 'bg-[#0B0F19] border-cyan-500 text-cyan-400'
                              : connector.status === 'broken'
                              ? 'bg-rose-950 border-rose-500 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                              : 'bg-slate-900 border-slate-700 text-slate-500'
                          }`}
                        >
                          {connector.status === 'valid' && (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                          {connector.status === 'broken' && (
                            <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
                          )}
                          {connector.status === 'invalidated' && (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>

                      {/* State Badge */}
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded text-center whitespace-nowrap leading-none ${
                          connector.status === 'valid'
                            ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30'
                            : connector.status === 'broken'
                            ? 'text-rose-300 bg-rose-500/20 border border-rose-500/50 font-bold'
                            : 'text-slate-400 bg-slate-800/60 border border-slate-700/60'
                        }`}
                      >
                        {isVi ? connector.labelVi : connector.labelEn}
                      </span>
                    </div>

                    {/* Mobile / Tablet Vertical Connector (< xl) */}
                    <div className="xl:hidden flex items-center justify-center py-1.5 w-full">
                      <div
                        className={`px-3 py-1 rounded-full text-[10px] font-mono flex items-center gap-1.5 border ${
                          connector.status === 'valid'
                            ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30'
                            : connector.status === 'broken'
                            ? 'text-rose-300 bg-rose-500/20 border-rose-500/50 font-bold'
                            : 'text-slate-400 bg-slate-800/60 border-slate-700/60'
                        }`}
                      >
                        {connector.status === 'valid' && (
                          <ArrowDown className="w-3 h-3 text-cyan-400" />
                        )}
                        {connector.status === 'broken' && (
                          <Zap className="w-3 h-3 text-rose-400 fill-rose-500/20" />
                        )}
                        {connector.status === 'invalidated' && (
                          <Lock className="w-3 h-3 text-slate-500" />
                        )}
                        <span>
                          {isVi
                            ? `#${idx} ➔ #${idx + 1}: ${connector.labelVi}`
                            : `#${idx} -> #${idx + 1}: ${connector.labelEn}`}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 4. Single Minimalist Synthesis Footnote (No clutter, clear takeaway) */}
        <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-sans text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-300">
              {isVi ? 'Bản chất mật mã:' : 'Core Concept:'}
            </span>
            <span>
              {isVi
                ? 'Con trỏ băm (Hash Pointer) biến toàn bộ chuỗi thành một cấu trúc bất biến. Sửa 1 byte ở quá khứ làm nổ tung mã băm và gãy toàn bộ chuỗi phía sau.'
                : 'Hash pointers make the chain immutable: mutating 1 past byte severs downstream cryptographic pointers.'}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[10px] font-mono">
            <span className="inline-flex items-center gap-1 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {isVi ? 'Cyan: Hợp lệ' : 'Cyan: Valid'}
            </span>
            <span className="inline-flex items-center gap-1 text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {isVi ? 'Đỏ: Giả mạo' : 'Rose: Tampered'}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              {isVi ? 'Xám: Vô hiệu' : 'Slate: Disabled'}
            </span>
          </div>
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
