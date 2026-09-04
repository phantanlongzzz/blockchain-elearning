import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface PoWVsPoSInteractiveProps {
  isHandsOn?: boolean;
  onInteracted?: () => void;
  onPrevStage?: () => void;
  onNextStage?: () => void;
}

export const PoWVsPoSInteractive: React.FC<PoWVsPoSInteractiveProps> = ({
  onInteracted,
  onPrevStage,
  onNextStage,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      onInteracted?.();
    }
  }, [onInteracted]);

  const comparisonRows = [
    {
      id: 'resource',
      titleVi: 'Tài nguyên bảo mật',
      titleEn: 'Security resource',
      powVi: 'Năng lượng điện & phần cứng chuyên dụng (ASIC / GPU)',
      powEn: 'Electricity & dedicated hardware (ASIC / GPU)',
      posVi: 'Vốn stake ký quỹ (Native Token)',
      posEn: 'Staked capital (Native Token)',
    },
    {
      id: 'production',
      titleVi: 'Cơ chế tạo khối',
      titleEn: 'Block production',
      powVi: 'Tìm Nonce thỏa mãn độ khó băm SHA-256',
      powEn: 'Finding valid Nonce meeting SHA-256 target',
      posVi: 'Chọn ngẫu nhiên có trọng số theo lượng stake',
      posEn: 'Weighted pseudo-random selection by stake',
    },
    {
      id: 'energy',
      titleVi: 'Tiêu thụ năng lượng',
      titleEn: 'Energy consumption',
      powVi: 'Rất lớn (chi phí nhiệt động lực học)',
      powEn: 'Very high (thermodynamic cost)',
      posVi: 'Tiết kiệm ~99.95% so với PoW',
      posEn: '~99.95% reduction compared to PoW',
    },
    {
      id: 'security',
      titleVi: 'Ngưỡng tấn công',
      titleEn: 'Attack threshold',
      powVi: '51% tổng công suất tính toán (Hashrate)',
      powEn: '51% of total network hashrate',
      posVi: '33% (đình trệ liveness) / 67% (tạo xung đột safety)',
      posEn: '33% (liveness stall) / 67% (safety violation)',
    },
    {
      id: 'penalty',
      titleVi: 'Cơ chế xử phạt',
      titleEn: 'Penalties & slashing',
      powVi: 'Lãng phí chi phí điện và phần cứng khi tạo khối sai',
      powEn: 'Wasted electricity and hardware costs on invalid blocks',
      posVi: 'Slashing: Tịch thu và đốt trực tiếp lượng token ký quỹ',
      posEn: 'Slashing: Burning a portion of staked capital',
    },
    {
      id: 'finality',
      titleVi: 'Tính hoàn tất',
      titleEn: 'Finality',
      powVi: 'Xác suất (Probabilistic) — an toàn tăng dần theo độ sâu khối',
      powEn: 'Probabilistic — security increases with block depth',
      posVi: 'Xác định theo checkpoint epoch (ví dụ: Casper FFG)',
      posEn: 'Deterministic at epoch checkpoints (e.g. Casper FFG)',
    },
  ];

  return (
    <div id="pow-vs-pos-comparison-section" className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* A. Section Header */}
      <div className="pb-4 border-b border-zinc-800 space-y-1">
        <h2 className="text-xl font-semibold text-zinc-100 font-sans tracking-tight">
          {isVi ? 'So sánh PoW vs PoS' : 'PoW vs PoS Comparison'}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          {isVi
            ? 'Đối chiếu cách hai cơ chế sử dụng tài nguyên, tạo khối và bảo vệ mạng blockchain.'
            : 'Compare how both mechanisms utilize resources, produce blocks, and secure the blockchain network.'}
        </p>
      </div>

      {/* B. Minimal Head-to-Head Summary Strip */}
      <div className="rounded-xl bg-[#0B0E12] border border-zinc-800 p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-6">
          {/* PoW Core Model */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-100">Proof of Work (PoW)</span>
              <span className="text-xs text-zinc-500 font-mono">Bitcoin</span>
            </div>
            <div className="text-xs text-zinc-300 font-medium">
              {isVi ? 'Năng lượng + Phần cứng' : 'Energy + Hardware'}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isVi
                ? 'Bảo mật bắt nguồn từ công sức tính toán và chi phí năng lượng vật lý.'
                : 'Security comes primarily from computational work and physical energy cost.'}
            </p>
          </div>

          {/* VS Divider */}
          <div className="hidden md:flex flex-col items-center justify-center px-2">
            <div className="w-px h-6 bg-zinc-800" />
            <span className="py-1 text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
              VS
            </span>
            <div className="w-px h-6 bg-zinc-800" />
          </div>
          <div className="md:hidden flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
              VS
            </span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* PoS Core Model */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-100">Proof of Stake (PoS)</span>
              <span className="text-xs text-zinc-500 font-mono">Ethereum</span>
            </div>
            <div className="text-xs text-zinc-300 font-medium">
              {isVi ? 'Vốn và Ký quỹ' : 'Capital + Staking'}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isVi
                ? 'Bảo mật bắt nguồn từ vốn ký quỹ và các ràng buộc khuyến khích kinh tế.'
                : 'Security comes primarily from staked capital and economic incentives.'}
            </p>
          </div>
        </div>
      </div>

      {/* C. Technical Comparison Table */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-zinc-300 px-0.5">
          {isVi ? 'Bảng đối chiếu tiêu chí kỹ thuật' : 'Technical Comparison Matrix'}
        </div>

        <div className="rounded-xl bg-[#0B0E12] border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#080C10] text-zinc-400 text-[11px] font-medium border-b border-zinc-800">
                <tr>
                  <th scope="col" className="py-3 px-4 w-1/4 font-semibold text-zinc-300">
                    {isVi ? 'Tiêu chí' : 'Criteria'}
                  </th>
                  <th scope="col" className="py-3 px-4 w-[37.5%] font-semibold text-zinc-200">
                    Proof of Work (PoW)
                  </th>
                  <th scope="col" className="py-3 px-4 w-[37.5%] font-semibold text-zinc-200">
                    Proof of Stake (PoS)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {comparisonRows.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-zinc-200 align-top">
                      {isVi ? row.titleVi : row.titleEn}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 leading-relaxed align-top">
                      {isVi ? row.powVi : row.powEn}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 leading-relaxed align-top">
                      {isVi ? row.posVi : row.posEn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* D. Supporting Architectural Note */}
      <div className="px-3.5 py-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-xs text-zinc-400 leading-relaxed">
        <span className="font-semibold text-zinc-300">
          {isVi ? 'Khác biệt cốt lõi:' : 'Core architectural difference:'}
        </span>{' '}
        {isVi
          ? 'PoW neo sự an toàn vào năng lượng vật lý ngoài đời thực (chi phí ngoại sinh), trong khi PoS tạo sự an toàn bằng các quy tắc phạt kinh tế và vốn khóa bên trong giao thức (chi phí nội sinh).'
          : 'PoW anchors security in external physical energy (exogenous cost), whereas PoS creates security through economic penalty rules and locked tokens within the protocol (endogenous cost).'}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        {onPrevStage ? (
          <button
            type="button"
            id="btn-pow-pos-prev"
            onClick={onPrevStage}
            className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
          >
            {isVi ? 'Quay lại' : 'Back'}
          </button>
        ) : (
          <div />
        )}

        {onNextStage && (
          <button
            type="button"
            id="btn-pow-pos-next"
            onClick={onNextStage}
 className="px-4 py-2 rounded-lg bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <span>{isVi ? 'Tiếp: Thử thách tổng kết' : 'Next: Final Challenge'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
