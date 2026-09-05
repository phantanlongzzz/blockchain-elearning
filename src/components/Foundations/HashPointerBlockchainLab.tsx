import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Edit3, ArrowRight, Wrench } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { HashPointerBlockItem } from '../../types';
import { fastSha256Hex } from '../../utils/sha256';

interface HashPointerBlockchainLabProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
}

// 4-Block Initial Baseline
const BASELINE_BLOCKS: { index: number; data: string }[] = [
  { index: 0, data: 'Genesis Block · DLU Blockchain' },
  { index: 1, data: 'Alice chuyển 10 DLU COIN cho Bob' },
  { index: 2, data: 'Bob chuyển 5 DLU COIN cho Charlie' },
  { index: 3, data: 'Charlie chuyển 2 DLU COIN cho Dave' },
];

export const HashPointerBlockchainLab: React.FC<HashPointerBlockchainLabProps> = ({
  onInteracted,
  onNextStage,
}) => {
  const { strings, language } = useLanguage();

  // Baseline uncorrupted chain state
  const [blocksData, setBlocksData] = useState<string[]>(
    BASELINE_BLOCKS.map((b) => b.data)
  );

  // Computed actual blocks
  const [blocks, setBlocks] = useState<HashPointerBlockItem[]>([]);

  // Snapshot of what previous hashes were originally recorded when chain was minted
  const [expectedPrevHashes, setExpectedPrevHashes] = useState<string[]>([]);

  // Track tampering state
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [tamperedBlockIdx, setTamperedBlockIdx] = useState<number | null>(null);

  // Compute canonical baseline chain
  const computeChain = (dataArray: string[]) => {
    const computed: HashPointerBlockItem[] = [];
    let prev = '0000000000000000000000000000000000000000000000000000000000000000';

    dataArray.forEach((data, idx) => {
      const payload = `${idx}|${prev}|${data}`;
      let hash = '';
      try {
        hash = fastSha256Hex(payload);
      } catch {
        hash = 'error';
      }

      computed.push({
        index: idx,
        data,
        previousHash: prev,
        hash,
      });

      prev = hash;
    });

    return computed;
  };

  // Initialize canonical chain
  useEffect(() => {
    const initialChain = computeChain(BASELINE_BLOCKS.map((b) => b.data));
    setBlocks(initialChain);
    // Record expected previous hashes for blocks 1, 2, 3
    setExpectedPrevHashes(initialChain.map((b) => b.previousHash));
  }, []);

  // Handle Tamper on Block 1
  const handleTamperBlock1 = () => {
    const newDatas = [...blocksData];
    newDatas[1] = 'Alice chuyển 999 DLU COIN cho Hacker (Đã bị sửa!)';
    setBlocksData(newDatas);

    // Compute actual new hashes with updated data
    const newBlocks: HashPointerBlockItem[] = [];
    let runningPrev = '0000000000000000000000000000000000000000000000000000000000000000';

    newDatas.forEach((data, idx) => {
      // In the tamper scenario, each block's stored Previous Hash is still what was recorded before!
      const storedPrev = idx === 0 ? runningPrev : expectedPrevHashes[idx] || runningPrev;
      const payload = `${idx}|${storedPrev}|${data}`;
      let hash = '';
      try {
        hash = fastSha256Hex(payload);
      } catch {
        hash = 'error';
      }

      newBlocks.push({
        index: idx,
        data,
        previousHash: storedPrev,
        hash,
      });

      runningPrev = hash;
    });

    setBlocks(newBlocks);
    setIsTampered(true);
    setTamperedBlockIdx(1);
    onInteracted?.();
  };

  // Handle Repair / Recalculate All Downstream Hashes
  const handleRepairChain = () => {
    const repairedChain = computeChain(blocksData);
    setBlocks(repairedChain);
    setExpectedPrevHashes(repairedChain.map((b) => b.previousHash));
    setIsTampered(false);
    setTamperedBlockIdx(null);
    onInteracted?.();
  };

  // Reset to original clean state
  const handleReset = () => {
    const initialData = BASELINE_BLOCKS.map((b) => b.data);
    setBlocksData(initialData);
    const initialChain = computeChain(initialData);
    setBlocks(initialChain);
    setExpectedPrevHashes(initialChain.map((b) => b.previousHash));
    setIsTampered(false);
    setTamperedBlockIdx(null);
  };

  // Check validity of a block
  const getBlockStatus = (idx: number) => {
    if (idx === 0) return { isValid: true, reason: 'Genesis' };
    if (!isTampered) return { isValid: true, reason: 'Valid' };

    // If block is the tampered block or any block after it
    if (tamperedBlockIdx !== null && idx >= tamperedBlockIdx) {
      if (idx === tamperedBlockIdx) {
        return {
          isValid: false,
          reason: language === 'vi' ? 'Dữ liệu bị sửa đổi (Hash bị biến đổi)' : 'Data Modified (Hash Changed)',
        };
      }
      return {
        isValid: false,
        reason: language === 'vi' ? 'Previous Hash không khớp với mã băm khối trước!' : 'PrevHash does not match prior block hash!',
      };
    }

    return { isValid: true, reason: 'Valid' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0B0F19]/70 backdrop-blur-xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
        <div className="space-y-1">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            {language === 'vi'
              ? 'Giai đoạn 04 · Kháng giả mạo'
              : 'Stage 04 · Tamper-Evidence Lab'}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white font-sans">
            {language === 'vi'
              ? 'Vì sao Linked List không phải là Blockchain'
              : 'Why Linked List ≠ Blockchain'}
          </h3>
          <p className="text-xs font-sans text-slate-400 max-w-2xl leading-relaxed">
            {language === 'vi'
              ? 'Thử nghiệm can thiệp sửa đổi một khối ở quá khứ và quan sát hiệu ứng sụp đổ dây chuyền của tất cả các khối phía sau.'
              : 'Simulate tampering with a past block and observe the cascading invalidation across all subsequent blocks.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleTamperBlock1}
            disabled={isTampered}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>
              {language === 'vi'
                ? 'Thử sửa Khối #1 (10 → 999)'
                : 'Tamper Block #1 (10 → 999)'}
            </span>
          </button>

          {isTampered && (
            <button
              type="button"
              onClick={handleRepairChain}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-medium font-sans text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(0,210,255,0.25)]"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'vi' ? 'Tính toán lại chuỗi' : 'Recalculate Chain'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/30 transition-all cursor-pointer"
            title={strings.foundations.hashPointer.resetBtn}
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Main 4-Block Interactive Chain Canvas (Layer 1 Outer Card) */}
      <div className="p-6 rounded-2xl bg-[#0B0F19]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
          <div className="text-xs font-sans font-medium flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isTampered ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.8)]'
              }`}
            ></span>
            <span className={isTampered ? 'text-rose-400 font-semibold' : 'text-slate-200'}>
              {language === 'vi'
                ? `Trạng thái chuỗi 4 khối: ${isTampered ? 'PHÁT HIỆN GIẢ MẠO (INVALID)' : 'HỢP LỆ (VALID)'}`
                : `4-Block Chain Status: ${isTampered ? 'TAMPER DETECTED (INVALID)' : 'INTACT (VALID)'}`}
            </span>
          </div>

          <span className="text-[11px] font-sans text-slate-400">
            {language === 'vi'
              ? 'Con trỏ băm khóa chặt dữ liệu của khối trước'
              : 'Hash pointers cryptographically seal adjacent blocks'}
          </span>
        </div>

        {/* 4 Blocks Grid (Layer 2 Inset Canvas) */}
        <div className="bg-black/40 backdrop-blur-md border border-white/[0.05] rounded-xl p-5 relative overflow-hidden bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {blocks.map((block, idx) => {
              const status = getBlockStatus(idx);
              const isCorrupted = !status.isValid;
              const isTargetOfTamper = isTampered && idx === 1;

              return (
                <div
                  key={block.index}
                  className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                    isCorrupted
                      ? 'bg-[#180d19]/90 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                      : idx === 0
                      ? 'bg-[#0E1526]/85 backdrop-blur-md border-cyan-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                      : 'bg-[#0E1526]/85 backdrop-blur-md border-white/[0.08] hover:border-cyan-500/35 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                  }`}
                >
                  {/* Block Header Tag */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <span
                        className={`text-xs font-mono font-semibold ${
                          isCorrupted ? 'text-rose-400' : 'text-slate-200'
                        }`}
                      >
                        KHỐI #{block.index} {idx === 0 ? '(GENESIS)' : ''}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border flex items-center gap-1 ${
                          isCorrupted
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isCorrupted ? 'bg-rose-400' : 'bg-cyan-400'}`} />
                        {status.isValid ? 'VALID' : 'BROKEN'}
                      </span>
                    </div>

                    {/* Previous Hash Field */}
                    <div className="space-y-1 font-mono text-[10px]">
                      <div className="flex items-center justify-between text-slate-400 font-sans text-[10px]">
                        <span>PREVIOUS HASH</span>
                        {idx > 0 && isTampered && idx >= 2 && (
                          <span className="text-rose-400 font-semibold">MISMATCH</span>
                        )}
                      </div>
                      <div
                        className={`p-1.5 rounded truncate font-mono text-[10px] ${
                          idx > 0 && isTampered && idx >= 2
                            ? 'bg-rose-950/30 text-rose-300 border border-rose-500/30 font-semibold'
                            : 'bg-black/40 text-slate-400 border border-white/[0.05]'
                        }`}
                      >
                        {block.previousHash.slice(0, 18)}...
                      </div>
                    </div>

                    {/* Block Data Field */}
                    <div className="space-y-1 text-xs font-sans">
                      <span className="text-[10px] text-slate-400 block font-sans">DATA</span>
                      <div
                        className={`p-2 rounded text-xs leading-relaxed font-sans ${
                          isTargetOfTamper
                            ? 'bg-rose-950/40 text-rose-200 border border-rose-500/40 font-medium'
                            : 'bg-black/40 text-slate-300 border border-white/[0.05]'
                        }`}
                      >
                        {block.data}
                      </div>
                    </div>
                  </div>

                  {/* Block Hash */}
                  <div className="pt-2 border-t border-white/[0.06] font-mono text-[10px]">
                    <div className="flex items-center justify-between text-slate-400 font-sans text-[10px] mb-1">
                      <span>BLOCK HASH</span>
                      <span className="text-[9px] text-slate-500 font-mono">SHA-256</span>
                    </div>
                    <div
                      className={`p-1.5 rounded truncate font-mono ${
                        isCorrupted
                          ? 'bg-rose-950/30 text-rose-300 border border-rose-500/30'
                          : 'bg-black/40 text-cyan-300 border border-white/[0.05]'
                      }`}
                    >
                      {block.hash.slice(0, 20)}...
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Observation Note */}
        {isTampered ? (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-xs leading-relaxed space-y-1.5 animate-in fade-in font-sans">
            <div className="flex items-center gap-2 font-sans font-semibold text-rose-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                {language === 'vi'
                  ? 'Hiệu ứng lan truyền: Sửa 1 byte ở Khối #1 làm hỏng toàn bộ các khối phía sau'
                  : 'Cascading Invalidation: Modifying 1 byte in Block #1 breaks all downstream blocks'}
              </span>
            </div>
            <p className="text-rose-200/80 font-sans text-xs">
              {language === 'vi'
                ? 'Khi dữ liệu Khối #1 bị đổi, giá trị SHA-256 của nó đổi theo. Khối #2 vẫn lưu Previous Hash cũ nên không còn khớp. Cả chuỗi từ Khối #1 trở đi đều bị mạng lưới lập tức từ chối.'
                : 'Altering Block #1 changes its SHA-256 hash. Block #2 still references the old Previous Hash, causing an immediate mismatch. Downstream blocks are instantly rejected by all nodes.'}
            </p>
          </div>
        ) : (
          <div className="bg-cyan-950/20 border-l-2 border-cyan-400/80 border-y border-r border-white/[0.05] rounded-r-xl p-4 text-xs font-sans text-slate-300 leading-relaxed space-y-1">
            <div className="text-cyan-300 font-sans font-semibold">
              {language === 'vi'
                ? 'Tính phát hiện giả mạo (Tamper-Evidence)'
                : 'Tamper-Evidence Property'}
            </div>
            <p className="text-slate-400 font-sans text-xs">
              {language === 'vi'
                ? 'Con trỏ băm cung cấp khả năng phát hiện giả mạo tức thì. Để đạt được tính bất biến (Immutability) toàn diện, Blockchain kết hợp thêm mạng ngang hàng P2P và cơ chế đồng thuận.'
                : 'Hash pointers provide immediate tamper-evidence. Complete immutability is achieved when combined with peer-to-peer distribution and consensus mechanisms.'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 mt-6 border-t border-white/[0.06] gap-3">
        <span className="text-xs font-sans text-slate-400">
          {language === 'vi'
            ? 'Tiếp theo: Khám phá 4 khái niệm Mật Mã Học Nền Tảng'
            : 'Next: Explore fundamental Cryptography concepts'}
        </span>

        <button
          type="button"
          onClick={onNextStage}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(0,210,255,0.25)] transition-all cursor-pointer"
        >
          <span>
            {language === 'vi'
              ? 'Tiếp tục sang Mật Mã Học Nền Tảng →'
              : 'Continue to Cryptography →'}
          </span>
        </button>
      </div>
    </div>
  );
};
