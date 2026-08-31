import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Boxes,
  Lock,
  Binary,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
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
  const { strings, language } = useLanguage();

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
      <div className="p-5 rounded-xl bg-[#090a0f] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-zinc-500 font-medium">
            {language === 'vi'
              ? 'Giai đoạn 03 · Chuyển đổi kiến trúc'
              : 'Stage 03 · Architectural Evolution'}
          </div>
          <h3 className="text-lg font-semibold text-zinc-100">
            {language === 'vi'
              ? 'Từ danh sách liên kết đến Blockchain'
              : 'Linked List to Blockchain Evolution'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            {language === 'vi'
              ? 'Quan sát cách con trỏ ô nhớ RAM thông thường (NEXT) được thay thế bằng Con trỏ băm mật mã học (PREVIOUS HASH).'
              : 'Observe how transient RAM pointers (NEXT) are replaced with Cryptographic Hash Pointers (PREVIOUS HASH).'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveView(activeView === 'animation' ? 'matrix' : 'animation')}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
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
        <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-6">
          {/* Step Stepper Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
            <div className="space-y-1">
              <div className="text-xs font-mono text-zinc-200 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>
                  {morphStep === 0 && (language === 'vi' ? 'Bước 1: Linked List truyền thống (Con trỏ RAM)' : 'Step 1: Standard Linked List (RAM Pointers)')}
                  {morphStep === 1 && (language === 'vi' ? 'Bước 2: Thay con trỏ RAM bằng Hash Pointer' : 'Step 2: Replacing RAM Pointers with Hash Pointers')}
                  {morphStep === 2 && (language === 'vi' ? 'Bước 3: Cấu trúc hoàn chỉnh: Chuỗi khối Blockchain' : 'Step 3: Completed Structure: Immutable Blockchain')}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                {morphStep === 0 && (language === 'vi' ? 'Các Node liên kết nhau bằng địa chỉ ô nhớ RAM tạm thời (0x7ffd...). Dễ bị sửa đổi không để lại dấu vết.' : 'Nodes linked by transient memory addresses. No tamper protection.')}
                {morphStep === 1 && (language === 'vi' ? 'Mỗi liên kết được thay thế bằng hàm băm SHA-256 niêm phong toàn bộ nội dung khối đứng trước.' : 'Each pointer is replaced by a 256-bit SHA-256 hash sealing prior block data.')}
                {morphStep === 2 && (language === 'vi' ? 'Khối #0 (Genesis) làm mỏ neo khởi nguyên. Mọi khối tiếp theo đều kiểm tra tính toàn vẹn qua PrevHash.' : 'Genesis Block anchors the root. Every subsequent block verifies integrity via PrevHash.')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleResetMorph}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Reset animation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMorph}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-semibold font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
          <div className="p-5 rounded-lg bg-black/40 border border-zinc-800/80 min-h-[190px] flex items-center overflow-x-auto">
            <div className="flex items-center gap-3 w-full justify-center pb-2">
              {/* Element 0 */}
              <div
                onClick={() => setSelectedEntity(morphStep === 2 ? 'block' : 'node')}
                className={`w-44 p-3.5 rounded-lg border transition-colors cursor-pointer ${
                  morphStep === 2
                    ? 'bg-zinc-900 border-emerald-500/80'
                    : morphStep === 1
                    ? 'bg-zinc-900 border-zinc-700'
                    : 'bg-zinc-900/90 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span className="text-zinc-400 font-medium">
                    {morphStep === 2 ? 'KHỐI #0 (GENESIS)' : 'NODE A'}
                  </span>
                  <span className="text-zinc-500 text-[10px]">
                    {morphStep === 2 ? 'Genesis Anchor' : 'RAM Node'}
                  </span>
                </div>

                <div className="p-2 rounded bg-black/50 border border-zinc-800 font-mono text-xs text-zinc-200 mb-2">
                  {morphStep === 2 ? '"Genesis Block"' : '"prepare"'}
                </div>

                <div className="pt-2 border-t border-zinc-800 font-mono text-[10px]">
                  <span className="text-zinc-500 block">
                    {morphStep === 2 ? 'PREVIOUS HASH' : 'NEXT POINTER'}
                  </span>
                  <span className="text-zinc-300 font-medium truncate block">
                    {morphStep === 2 ? '00000000... (Root)' : '-> 0x7ffd8a20'}
                  </span>
                </div>
              </div>

              {/* Connecting Link Arrow */}
              <div
                onClick={() => setSelectedEntity(morphStep === 2 ? 'prevHash' : 'pointer')}
                className="flex flex-col items-center px-1 cursor-pointer shrink-0"
              >
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono mb-1 border transition-colors ${
                    morphStep === 2
                      ? 'bg-zinc-800 text-emerald-400 border-zinc-700'
                      : morphStep === 1
                      ? 'bg-zinc-800 text-amber-400 border-zinc-700'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                >
                  {morphStep === 2 ? 'PrevHash' : morphStep === 1 ? 'NEXT → HASH' : 'NEXT'}
                </span>
                <ArrowRight
                  className={`w-5 h-5 transition-colors ${
                    morphStep === 2
                      ? 'text-emerald-400'
                      : morphStep === 1
                      ? 'text-amber-400'
                      : 'text-zinc-600'
                  }`}
                />
              </div>

              {/* Element 1 */}
              <div
                onClick={() => setSelectedEntity(morphStep === 2 ? 'block' : 'node')}
                className={`w-44 p-3.5 rounded-lg border transition-colors cursor-pointer ${
                  morphStep === 2
                    ? 'bg-zinc-900 border-emerald-500/80'
                    : morphStep === 1
                    ? 'bg-zinc-900 border-zinc-700'
                    : 'bg-zinc-900/90 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span className="text-zinc-400 font-medium">
                    {morphStep === 2 ? 'KHỐI #1' : 'NODE B'}
                  </span>
                  <span className="text-zinc-500 text-[10px]">
                    {morphStep === 2 ? 'Secured Block' : 'RAM Node'}
                  </span>
                </div>

                <div className="p-2 rounded bg-black/50 border border-zinc-800 font-mono text-xs text-zinc-200 mb-2">
                  {morphStep === 2 ? '"Alice -> Bob: 10"' : '"roll"'}
                </div>

                <div className="pt-2 border-t border-zinc-800 font-mono text-[10px]">
                  <span className="text-zinc-500 block">
                    {morphStep === 2 ? 'PREVIOUS HASH' : 'NEXT POINTER'}
                  </span>
                  <span className="text-zinc-300 font-medium truncate block">
                    {morphStep === 2 ? 'SHA256(Khối #0)' : '-> 0x7ffd8b40'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal Inspection Note */}
          {selectedEntity && (
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs leading-relaxed space-y-1">
              <div className="text-zinc-300 font-mono font-medium">
                {selectedEntity === 'pointer' && 'Con trỏ NEXT trong Linked List'}
                {selectedEntity === 'prevHash' && 'Previous Hash trong Blockchain'}
                {selectedEntity === 'node' && 'Nút (Node) Bộ nhớ RAM'}
                {selectedEntity === 'block' && 'Khối (Block) Mật mã học'}
              </div>
              <p className="text-zinc-400">
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
        <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-4">
          <div className="text-sm font-semibold text-zinc-100">
            {language === 'vi'
              ? 'Bảng đối chiếu: Linked List vs. Blockchain'
              : 'Comparison: Linked List vs. Blockchain'}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-2.5 px-3 uppercase font-medium">Đặc điểm</th>
                  <th className="py-2.5 px-3 uppercase font-medium text-zinc-300">
                    Linked List Truyền Thống
                  </th>
                  <th className="py-2.5 px-3 uppercase font-medium text-emerald-400">
                    Blockchain Mật Mã Học
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {COMPARISON_ITEMS.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-2.5 px-3 text-zinc-300 font-medium">
                      {item.feature[language]}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400">
                      <div className="text-zinc-200">{item.linkedList[language]}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {item.linkedList.desc[language]}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-emerald-300">
                      <div className="text-emerald-400 font-medium">{item.blockchain[language]}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
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
        <span className="text-xs font-mono text-zinc-500">
          {language === 'vi'
            ? 'Tiếp theo: Thử nghiệm can thiệp dữ liệu và quan sát phản ứng dây chuyền'
            : 'Next: Test a live tamper attack and watch the cascading chain reaction'}
        </span>

        <button
          type="button"
          onClick={onNextStage}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-semibold font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span>
            {language === 'vi'
              ? 'Tiếp tục sang Phòng Thí Nghiệm Kháng Giả Mạo'
              : 'Continue to Tamper Lab'}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
