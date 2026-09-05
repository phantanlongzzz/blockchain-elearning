import React, { useState } from 'react';
import { ArrowRight, Layers, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { COMPARISON_ITEMS } from '../../data/foundationsData';

interface LinkedListVsBlockchainProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
}

export const LinkedListVsBlockchain: React.FC<LinkedListVsBlockchainProps> = ({
  onInteracted,
  onNextStage,
}) => {
  const { language } = useLanguage();

  // Mode: 'animation' (visual morph) | 'matrix' (side-by-side table)
  const [activeView, setActiveView] = useState<'animation' | 'matrix'>('animation');

  // Animation morph step: 0 = Linked List, 1 = Morphing / Highlighting Pointers, 2 = Blockchain
  const [morphStep, setMorphStep] = useState<number>(0);
  const [selectedEntity, setSelectedEntity] = useState<'node' | 'block' | 'pointer' | 'prevHash' | null>(null);

  const handleNextMorph = () => {
    setMorphStep((prev) => (prev + 1) % 3);
    onInteracted?.();
  };

  const handleResetMorph = () => {
    setMorphStep(0);
    setSelectedEntity(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#0B101E]/80 backdrop-blur-md border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="space-y-1">
          <div className="text-xs font-sans font-semibold text-cyan-400 tracking-normal">
            {language === 'vi'
              ? 'Giai đoạn 03 · Chuyển đổi kiến trúc'
              : 'Stage 03 · Architectural Evolution'}
          </div>
          <h3 className="text-base font-bold text-white tracking-normal font-sans">
            {language === 'vi'
              ? 'Từ danh sách liên kết đến Blockchain'
              : 'Linked List to Blockchain Evolution'}
          </h3>
          <p className="text-xs font-sans text-slate-400 max-w-2xl leading-relaxed">
            {language === 'vi'
              ? 'Quan sát cách con trỏ ô nhớ RAM thông thường (NEXT) được thay thế bằng Con trỏ băm mật mã học (PREVIOUS HASH).'
              : 'Observe how transient RAM pointers (NEXT) are replaced with Cryptographic Hash Pointers (PREVIOUS HASH).'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveView(activeView === 'animation' ? 'matrix' : 'animation')}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] hover:border-cyan-500/30 text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {activeView === 'animation'
                ? language === 'vi'
                  ? 'Bảng đối chiếu'
                  : 'Comparison Matrix'
                : language === 'vi'
                ? 'Hoạt họa chuyển đổi'
                : 'Transformation Animation'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Interactive Morph Canvas */}
      {activeView === 'animation' && (
        <div className="p-6 rounded-xl bg-[#0B101E]/80 backdrop-blur-md border border-white/[0.08] space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          {/* Step Stepper Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="text-xs font-sans text-slate-200 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.8)]" />
                <span className="font-semibold text-slate-100">
                  {morphStep === 0 && (language === 'vi' ? 'Bước 1: Linked List truyền thống (Con trỏ RAM)' : 'Step 1: Standard Linked List (RAM Pointers)')}
                  {morphStep === 1 && (language === 'vi' ? 'Bước 2: Thay con trỏ RAM bằng Hash Pointer' : 'Step 2: Replacing RAM Pointers with Hash Pointers')}
                  {morphStep === 2 && (language === 'vi' ? 'Bước 3: Cấu trúc hoàn chỉnh: Chuỗi khối Blockchain' : 'Step 3: Completed Structure: Immutable Blockchain')}
                </span>
              </div>
              <p className="text-xs font-sans text-slate-400">
                {morphStep === 0 && (language === 'vi' ? 'Các Node liên kết nhau bằng địa chỉ ô nhớ RAM tạm thời (0x7ffd...). Dễ bị sửa đổi không để lại dấu vết.' : 'Nodes linked by transient memory addresses. No tamper protection.')}
                {morphStep === 1 && (language === 'vi' ? 'Mỗi liên kết được thay thế bằng hàm băm SHA-256 niêm phong toàn bộ nội dung khối đứng trước.' : 'Each pointer is replaced by a 256-bit SHA-256 hash sealing prior block data.')}
                {morphStep === 2 && (language === 'vi' ? 'Khối #0 (Genesis) làm mỏ neo khởi nguyên. Mọi khối tiếp theo đều kiểm tra tính toàn vẹn qua PrevHash.' : 'Genesis Block anchors the root. Every subsequent block verifies integrity via PrevHash.')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleResetMorph}
                className="p-2 rounded-lg text-slate-400 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/30 transition-all cursor-pointer"
                title={language === 'vi' ? 'Đặt lại hoạt họa' : 'Reset animation'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMorph}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all active:scale-95 cursor-pointer"
              >
                <span>
                  {morphStep === 0 && (language === 'vi' ? 'Chuyển sang Hash Pointer' : 'Morph to Hash Pointer')}
                  {morphStep === 1 && (language === 'vi' ? 'Khóa chặt bằng SHA-256' : 'Seal with SHA-256')}
                  {morphStep === 2 && (language === 'vi' ? 'Xem lại từ đầu' : 'Restart Morph')}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Morph Visualization Arena */}
          <div className="p-6 rounded-xl bg-black/40 border border-white/[0.06] min-h-[200px] flex items-center overflow-x-auto justify-center">
            <div className="flex items-center gap-4 w-full justify-center pb-2">
              {/* Element 0 - Node A / Block #0 */}
              <div
                onClick={() => setSelectedEntity(morphStep === 2 ? 'block' : 'node')}
                className={`w-48 p-4 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.45)] ${
                  morphStep === 2
                    ? 'bg-[#0B101E]/90 border-cyan-500/40 ring-1 ring-cyan-500/30 shadow-[0_0_20px_rgba(0,210,255,0.15)]'
                    : morphStep === 1
                    ? 'bg-[#0B101E]/80 border-cyan-500/30 hover:border-cyan-500/50'
                    : 'bg-[#0B101E]/80 border-white/[0.08] hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans font-semibold text-xs text-slate-200">
                    {morphStep === 2 ? 'KHỐI #0 (GENESIS)' : 'NODE A'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-slate-400">
                    {morphStep === 2 ? 'Genesis Anchor' : 'RAM Node'}
                  </span>
                </div>

                <div className="bg-black/40 border border-white/[0.06] rounded-lg p-2.5 my-3 text-center">
                  <span className="font-mono text-xs text-cyan-300 font-semibold tracking-tight">
                    {morphStep === 2 ? '"Genesis Block"' : '"prepare"'}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-sans font-medium text-slate-400 uppercase tracking-wider block mb-1">
                    {morphStep === 2 ? 'PREVIOUS HASH' : 'NEXT POINTER'}
                  </span>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[11px] px-2 py-1 rounded flex items-center gap-1.5 truncate">
                    <span className="truncate">
                      {morphStep === 2 ? '00000000... (Root)' : '→ 0x7ffd8a20'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connecting Link - Pointer Connector */}
              <div
                onClick={() => setSelectedEntity(morphStep === 2 ? 'prevHash' : 'pointer')}
                className="flex flex-col items-center justify-center gap-1 px-3 cursor-pointer shrink-0 group"
                title={language === 'vi' ? 'Bấm để xem chi tiết liên kết' : 'Click to inspect pointer'}
              >
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider transition-colors group-hover:text-cyan-300">
                  {morphStep === 2 ? 'PREV HASH' : morphStep === 1 ? 'HASH PTR' : 'NEXT'}
                </span>
                <div className="w-12 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(0,210,255,0.4)] relative flex items-center justify-end">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 -mr-1 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Element 1 - Node B / Block #1 */}
              <div
                onClick={() => setSelectedEntity(morphStep === 2 ? 'block' : 'node')}
                className={`w-48 p-4 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.45)] ${
                  morphStep === 2
                    ? 'bg-[#0B101E]/90 border-cyan-500/40 ring-1 ring-cyan-500/30 shadow-[0_0_20px_rgba(0,210,255,0.15)]'
                    : morphStep === 1
                    ? 'bg-[#0B101E]/80 border-cyan-500/30 hover:border-cyan-500/50'
                    : 'bg-[#0B101E]/80 border-white/[0.08] hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans font-semibold text-xs text-slate-200">
                    {morphStep === 2 ? 'KHỐI #1' : 'NODE B'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-slate-400">
                    {morphStep === 2 ? 'Secured Block' : 'RAM Node'}
                  </span>
                </div>

                <div className="bg-black/40 border border-white/[0.06] rounded-lg p-2.5 my-3 text-center">
                  <span className="font-mono text-xs text-cyan-300 font-semibold tracking-tight">
                    {morphStep === 2 ? '"Alice ➔ Bob: 10"' : '"roll"'}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-sans font-medium text-slate-400 uppercase tracking-wider block mb-1">
                    {morphStep === 2 ? 'PREVIOUS HASH' : 'NEXT POINTER'}
                  </span>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[11px] px-2 py-1 rounded flex items-center gap-1.5 truncate">
                    <span className="truncate">
                      {morphStep === 2 ? 'SHA256(Khối #0)' : '→ 0x7ffd8b40'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal Inspection Note */}
          {selectedEntity && (
            <div className="p-4 rounded-xl bg-[#0B101E]/90 backdrop-blur-sm border border-white/[0.08] text-xs leading-relaxed space-y-1.5 animate-in fade-in duration-150">
              <div className="text-slate-200 font-sans font-semibold text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>
                  {selectedEntity === 'pointer' && 'Con trỏ NEXT trong Linked List'}
                  {selectedEntity === 'prevHash' && 'Previous Hash trong Blockchain'}
                  {selectedEntity === 'node' && 'Nút (Node) Bộ nhớ RAM'}
                  {selectedEntity === 'block' && 'Khối (Block) Mật mã học'}
                </span>
              </div>
              <p className="text-slate-400 font-sans text-xs">
                {selectedEntity === 'pointer' &&
                  'Chỉ đơn thuần lưu địa chỉ bộ nhớ (VD: 0x7ffd...). Nếu nội dung của Node A bị thay đổi, con trỏ NEXT vẫn trỏ tới Node B mà không hề biết rằng dữ liệu đã bị sửa đổi.'}
                {selectedEntity === 'prevHash' &&
                  'Lưu toàn bộ bản băm SHA-256 của Khối 0. Nếu bất kỳ 1 byte nào ở Khối 0 bị thay đổi, bản băm của Khối 0 sẽ đổi ngay lập tức, khiến Previous Hash ở Khối 1 không còn khớp.'}
                {selectedEntity === 'node' &&
                  'Một đối tượng thông thường trong RAM, chỉ tồn tại trong phiên chạy của chương trình và có thể bị ghi đè.'}
                {selectedEntity === 'block' &&
                  'Một container chứa danh sách giao dịch, Merkle Root, Timestamp và Previous Hash, được xác thực bởi mạng lưới đồng thuận.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Detailed Side-by-Side Matrix */}
      {activeView === 'matrix' && (
        <div className="p-6 rounded-xl bg-[#0B101E]/80 backdrop-blur-md border border-white/[0.08] space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <div className="text-sm font-sans font-semibold text-slate-100">
            {language === 'vi'
              ? 'Bảng đối chiếu: Linked List vs. Blockchain'
              : 'Comparison: Linked List vs. Blockchain'}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400">
                  <th className="py-2.5 px-3 uppercase font-medium text-[11px] tracking-wider">Đặc điểm</th>
                  <th className="py-2.5 px-3 uppercase font-medium text-slate-300 text-[11px] tracking-wider">
                    Linked List Truyền Thống
                  </th>
                  <th className="py-2.5 px-3 uppercase font-medium text-cyan-400 text-[11px] tracking-wider">
                    Blockchain Mật Mã Học
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {COMPARISON_ITEMS.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 text-slate-300 font-medium font-sans">
                      {item.feature[language]}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">
                      <div className="text-slate-200">{item.linkedList[language]}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
                        {item.linkedList.desc[language]}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">
                      <div className="text-cyan-300 font-medium">{item.blockchain[language]}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
                        {item.blockchain.desc[language]}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-sans text-slate-400">
          {language === 'vi'
            ? 'Tiếp theo: Thử nghiệm can thiệp dữ liệu và quan sát phản ứng dây chuyền'
            : 'Next: Test a live tamper attack and watch the cascading chain reaction'}
        </span>

        <button
          type="button"
          onClick={onNextStage}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(0,210,255,0.25)] transition-all cursor-pointer"
        >
          <span>
            {language === 'vi'
              ? 'Tiếp tục: Kháng Giả Mạo →'
              : 'Continue: Tamper Lab →'}
          </span>
        </button>
      </div>
    </div>
  );
};

