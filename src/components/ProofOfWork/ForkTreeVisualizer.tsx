import React from 'react';
import { GitFork, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Zap, ArrowRight, ArrowDown } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Miner } from './ProofOfWorkLab';

interface ForkTreeVisualizerProps {
  miners: Miner[];
  isRacing: boolean;
  isGameOver: boolean;
}

export const ForkTreeVisualizer: React.FC<ForkTreeVisualizerProps> = ({
  miners,
  isRacing,
  isGameOver,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const maxBlocks = Math.max(0, ...miners.map((m) => m.chain.length));
  const activeMinersWithBlocks = miners.filter((m) => m.chain.length > 0);
  const longestMiners = miners.filter((m) => m.chain.length === maxBlocks && maxBlocks > 0);
  const isTie = longestMiners.length > 1;
  const isSingleWinner = longestMiners.length === 1;

  if (activeMinersWithBlocks.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#0C0F14] border border-[#1C2430] rounded-xl p-5 sm:p-6 mb-8 font-sans shadow-sm">
      {/* Header with Title & 1-sentence Subtitle */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1C2430] pb-4 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#0F131A] border border-[#1C2430] rounded-lg text-[#00C98D]">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-mono font-bold text-[#F2F4F7] flex items-center gap-2">
              <span>{isVi ? 'Sơ đồ cây chuỗi khối' : 'Blockchain Tree Diagram'}</span>
              {isTie && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.35)]">
                  {isVi ? '⚡ Phân nhánh' : '⚡ Fork Active'}
                </span>
              )}
              {isSingleWinner && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[rgba(0,201,141,0.1)] text-[#00C98D] border border-[rgba(0,201,141,0.35)]">
                  {isVi ? '✓ Chuỗi chính' : '✓ Canonical Chain'}
                </span>
              )}
            </h3>
            <p className="text-xs text-[#A5AFBF] mt-0.5">
              {isVi
                ? 'Quan sát các khối được thêm vào chuỗi và các nhánh phát sinh.'
                : 'Observe blocks added to the chain and emerging branches.'}
            </p>
          </div>
        </div>

        {/* Status Callout Badge */}
        <div className="flex items-center gap-2">
          {isTie ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.35)] rounded-md text-[#F59E0B] text-xs font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{isVi ? 'Phân nhánh hòa' : 'Competing branches'}</span>
            </div>
          ) : isSingleWinner ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[rgba(0,201,141,0.1)] border border-[rgba(0,201,141,0.35)] rounded-md text-[#00C98D] text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00C98D]" />
              <span>
                {longestMiners[0].name} {isVi ? 'dẫn đầu' : 'leads'} ({maxBlocks} {isVi ? 'khối' : 'blocks'})
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Explanatory banner when fork happens */}
      {isTie && (
        <div className="mb-5 p-3.5 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.35)] rounded-lg text-xs text-[#F59E0B] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold font-mono text-[#F59E0B]">
              {isVi ? 'Hiện tượng phân nhánh (Blockchain Fork):' : 'Blockchain Fork in Progress:'}
            </div>
            <div className="text-[#A5AFBF] leading-relaxed">
              {isVi
                ? `Có ${longestMiners.map((m) => m.name).join(' và ')} cùng có ${maxBlocks} khối nối từ khối gốc. Cả hai nhánh đều hợp lệ và đang cạnh tranh. Khi một thợ đào tìm được khối tiếp theo, nhánh đó sẽ trở thành Chuỗi chính.`
                : `${longestMiners.map((m) => m.name).join(' and ')} both have ${maxBlocks} blocks extending from parent. When another block is discovered on either branch, the Longest Chain Rule resolves the fork.`}
            </div>
          </div>
        </div>
      )}

      {/* Technical reference note on Previous Hash */}
      <div className="mb-4 px-3 py-1.5 bg-[#090A0F] border border-[#1C2430] rounded-md text-[11px] font-mono text-[#A5AFBF] flex items-center gap-2">
        <span className="text-[#00C98D] font-bold">ℹ</span>
        <span>
          {isVi
            ? 'Mỗi khối mới tham chiếu khối liền trước bằng Previous Hash để đảm bảo tính liên kết bất biến.'
            : 'Each newly mined block points to its predecessor via Previous Hash to guarantee immutable lineage.'}
        </span>
      </div>

      {/* Visual Tree Visualization */}
      <div className="space-y-3.5">
        {miners.map((m) => {
          if (m.chain.length === 0) return null;

          const isLongest = m.chain.length === maxBlocks;
          const isCanonical = isSingleWinner && isLongest;
          const isCompeting = isTie && isLongest;
          const isOrphaned = !isLongest && isSingleWinner;

          return (
            <div
              key={m.id}
              className={`p-4 rounded-lg border transition-all ${
                isCanonical
                  ? 'bg-[rgba(0,201,141,0.06)] border-[#00C98D] shadow-sm'
                  : isCompeting
                  ? 'bg-[rgba(245,158,11,0.06)] border-[#F59E0B] shadow-sm'
                  : 'bg-[#0F131A] border-[#1C2430] opacity-60'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Miner Tag & Hash power */}
                <div className="flex items-center gap-2.5 min-w-[180px]">
                  <div
                    className={`w-7 h-7 rounded-md border flex items-center justify-center font-mono font-bold text-xs shrink-0 ${m.avatarColor}`}
                  >
                    {m.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#F2F4F7] font-mono flex items-center gap-1.5">
                      <span>{m.name}</span>
                      <span className="text-[10px] text-[#717B8C] font-sans font-normal">
                        ({m.powerPercent}%)
                      </span>
                    </div>
                    <div className="text-[10px] text-[#717B8C]">
                      {m.chain.length} {isVi ? 'khối tìm được' : 'blocks found'}
                    </div>
                  </div>
                </div>

                {/* Blocks Linked Flow (Genesis -> Block 1 -> Block 2...) */}
                <div className="flex items-center gap-2 flex-wrap flex-1 overflow-x-auto py-1">
                  {/* Genesis Node */}
                  <div className="px-2.5 py-1.5 bg-[#090A0F] border border-[#1C2430] rounded-md text-[11px] font-mono text-[#A5AFBF] flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#717B8C]" />
                    <span>#0 Genesis</span>
                  </div>

                  {m.chain.map((b, idx) => (
                    <React.Fragment key={idx}>
                      <span className="text-[#717B8C] font-mono text-xs shrink-0">→</span>
                      <div
                        className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
                          isCanonical
                            ? 'bg-[rgba(0,201,141,0.12)] border-[#00C98D] text-[#00C98D] font-semibold'
                            : isCompeting
                            ? 'bg-[rgba(245,158,11,0.12)] border-[#F59E0B] text-[#F59E0B] font-semibold'
                            : 'bg-[#090A0F] border-[#1C2430] text-[#A5AFBF]'
                        }`}
                      >
                        <span className="font-bold">#{b.blockNumber}</span>
                        <span className="text-[10px] opacity-75">Nonce: {b.nonce.toLocaleString()}</span>
                        {b.previousHash && (
                          <span className="text-[9px] text-[#717B8C] hidden sm:inline">
                            (Prev: {b.previousHash.slice(0, 6)}...)
                          </span>
                        )}
                      </div>
                    </React.Fragment>
                  ))}

                  {/* Active mining pulse indicator on active branches */}
                  {isRacing && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-[#00C98D] px-2 py-0.5 bg-[rgba(0,201,141,0.1)] rounded border border-[rgba(0,201,141,0.3)] shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00C98D] animate-pulse" />
                      <span>{isVi ? 'Đang mở rộng' : 'Mining next...'}</span>
                    </div>
                  )}
                </div>

                {/* Branch Status Outcome Tag */}
                <div className="min-w-[170px] flex justify-start lg:justify-end">
                  {isCanonical ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(0,201,141,0.1)] border border-[#00C98D] text-[#00C98D] rounded-md text-xs font-mono font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00C98D]" />
                      <span>{isVi ? 'Chuỗi chính' : 'Canonical chain'}</span>
                    </span>
                  ) : isCompeting ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(245,158,11,0.1)] border border-[#F59E0B] text-[#F59E0B] rounded-md text-xs font-mono font-semibold">
                      <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{isVi ? 'Đang cạnh tranh' : 'Competing (Fork)'}</span>
                    </span>
                  ) : isOrphaned ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#090A0F] text-[#717B8C] border border-[#1C2430] rounded-md text-xs font-mono">
                      <XCircle className="w-3.5 h-3.5 text-[#717B8C]" />
                      <span>{isVi ? 'Nhánh bị loại' : 'Orphaned branch'}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-[#717B8C] font-mono">
                      {isVi ? 'Đang mở rộng' : 'Extending'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
