import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  Zap,
  Boxes,
  Cpu,
  Layers,
  Flame,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface FinalChallengeSectionProps {
  onInteracted?: () => void;
  onCompleteLesson?: () => void;
  onPrevStage?: () => void;
  isHandsOn?: boolean;
}

interface PipelineItem {
  id: string;
  name: { vi: string; en: string };
  order: number;
}

const CORRECT_PIPELINE: PipelineItem[] = [
  { id: 'wallet', name: { vi: '1. Ví (Wallet)', en: '1. Wallet' }, order: 1 },
  { id: 'transaction', name: { vi: '2. Giao Dịch', en: '2. Transaction' }, order: 2 },
  { id: 'signature', name: { vi: '3. Chữ Ký Số', en: '3. Digital Signature' }, order: 3 },
  { id: 'mempool', name: { vi: '4. Hàng Đợi Mempool', en: '4. Mempool' }, order: 4 },
  { id: 'miner', name: { vi: '5. Thợ Đào (Miner / ASIC)', en: '5. Miner' }, order: 5 },
  { id: 'block', name: { vi: '6. Khối Mới (Block)', en: '6. Block' }, order: 6 },
  { id: 'blockchain', name: { vi: '7. Blockchain', en: '7. Blockchain' }, order: 7 },
  { id: 'full_node', name: { vi: '8. Full Node Xác Thực', en: '8. Full Node' }, order: 8 },
];

export const FinalChallengeSection: React.FC<FinalChallengeSectionProps> = ({
  onInteracted,
  onCompleteLesson,
  onPrevStage,
  isHandsOn = false,
}) => {
  const { language } = useLanguage();

  // Shuffled items for ordering challenge
  const [availableItems, setAvailableItems] = useState<PipelineItem[]>([
    { id: 'mempool', name: { vi: 'Mempool', en: 'Mempool' }, order: 4 },
    { id: 'wallet', name: { vi: 'Ví (Wallet)', en: 'Wallet' }, order: 1 },
    { id: 'blockchain', name: { vi: 'Blockchain', en: 'Blockchain' }, order: 7 },
    { id: 'miner', name: { vi: 'Thợ Đào', en: 'Miner' }, order: 5 },
    { id: 'signature', name: { vi: 'Chữ Ký Số (Signature)', en: 'Signature' }, order: 3 },
    { id: 'transaction', name: { vi: 'Giao Dịch (Tx)', en: 'Transaction' }, order: 2 },
    { id: 'full_node', name: { vi: 'Full Node Xác Thực', en: 'Full Node' }, order: 8 },
    { id: 'block', name: { vi: 'Khối Mới (Block)', en: 'Block' }, order: 6 },
  ]);

  const [userSequence, setUserSequence] = useState<PipelineItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isAllCorrect, setIsAllCorrect] = useState<boolean>(false);

  const handleSelectItem = (item: PipelineItem) => {
    if (isSubmitted) return;
    setUserSequence((prev) => [...prev, item]);
    setAvailableItems((prev) => prev.filter((i) => i.id !== item.id));
    onInteracted?.();
  };

  const handleRemoveItem = (item: PipelineItem) => {
    if (isSubmitted) return;
    setUserSequence((prev) => prev.filter((i) => i.id !== item.id));
    setAvailableItems((prev) => [...prev, item]);
    onInteracted?.();
  };

  const handleCheckAnswer = () => {
    setIsSubmitted(true);
    const isCorrect =
      userSequence.length === CORRECT_PIPELINE.length &&
      userSequence.every((item, idx) => item.order === idx + 1);
    setIsAllCorrect(isCorrect);
    if (isCorrect) {
      onCompleteLesson?.();
    }
    onInteracted?.();
  };

  const handleResetChallenge = () => {
    setAvailableItems([
      { id: 'mempool', name: { vi: 'Mempool', en: 'Mempool' }, order: 4 },
      { id: 'wallet', name: { vi: 'Ví (Wallet)', en: 'Wallet' }, order: 1 },
      { id: 'blockchain', name: { vi: 'Blockchain', en: 'Blockchain' }, order: 7 },
      { id: 'miner', name: { vi: 'Thợ Đào', en: 'Miner' }, order: 5 },
      { id: 'signature', name: { vi: 'Chữ Ký Số (Signature)', en: 'Signature' }, order: 3 },
      { id: 'transaction', name: { vi: 'Giao Dịch (Tx)', en: 'Transaction' }, order: 2 },
      { id: 'full_node', name: { vi: 'Full Node Xác Thực', en: 'Full Node' }, order: 8 },
      { id: 'block', name: { vi: 'Khối Mới (Block)', en: 'Block' }, order: 6 },
    ]);
    setUserSequence([]);
    setIsSubmitted(false);
    setIsAllCorrect(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#131d16] to-[#080c16] border border-border-primary shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-border-primary text-text-primary text-xs font-mono font-bold uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'PHẦN 07 · THỬ THÁCH TỔNG KẾT' : 'PART 07 · FINAL CHALLENGE'}</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {language === 'vi'
                ? 'Thử Thách: Sắp Xếp Dòng Chảy Hệ Thống (Build The System)'
                : 'Final Challenge: Arrange the Complete System Pipeline'}
            </h3>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {language === 'vi'
                ? 'Hãy tự tay sắp xếp 8 thành phần cốt lõi của một hệ thống Blockchain từ điểm bắt đầu tạo giao dịch đến lúc được toàn mạng lưới xác nhận vĩnh viễn.'
                : 'Assemble the 8 fundamental components of a decentralized blockchain from initial transaction signing to final immutable consensus.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetChallenge}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Làm lại thử thách' : 'Reset'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Drag/Click Ordering Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl space-y-6">
          {/* Target Sequence Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-white uppercase">
                {language === 'vi' ? 'DÒNG CHẢY HỆ THỐNG CỦA BẠN (1 ➔ 8):' : 'YOUR SYSTEM PIPELINE SEQUENCE (1 ➔ 8):'}
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {userSequence.length} / 8 {language === 'vi' ? 'thành phần' : 'items'}
              </span>
            </div>

            <div className="min-h-[90px] p-3.5 rounded-xl bg-[#05070c] border border-slate-800 flex flex-wrap gap-2 items-center">
              {userSequence.length === 0 ? (
                <div className="text-slate-600 text-xs font-mono italic p-2">
                  {language === 'vi'
                    ? 'Chưa chọn thành phần nào. Nhấp vào các thẻ bên dưới theo thứ tự đúng...'
                    : 'No items selected yet. Click the component cards below in the correct order...'}
                </div>
              ) : (
                userSequence.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleRemoveItem(item)}
                    disabled={isSubmitted}
                    className={`px-3 py-2 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSubmitted
                        ? item.order === idx + 1
                          ? 'bg-success/15 border-success/50 text-success'
                          : 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-white/[0.04] border-border-primary text-text-primary hover:bg-white/[0.08]'
                    }`}
                  >
                    <span>#{idx + 1}</span>
                    <span>{item.name[language].replace(/^\d+\.\s*/, '')}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Available Components Pool */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">
              {language === 'vi' ? 'CÁC THÀNH PHẦN CÓ SẴN (BẤM ĐỂ CHỌN):' : 'AVAILABLE COMPONENTS (CLICK TO ADD):'}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className="p-3 rounded-xl bg-[#05070c] border border-slate-800 hover:border-border-primary hover:bg-white/[0.04] text-xs font-mono font-bold text-slate-200 transition-all cursor-pointer text-center"
                >
                  {item.name[language].replace(/^\d+\.\s*/, '')}
                </button>
              ))}
            </div>
          </div>

          {/* Submit / Verification Controller */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs font-mono text-slate-400">
              {isSubmitted && (
                isAllCorrect ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'vi' ? 'XUẤT SẮC! BẠN ĐÃ SẮP XẾP CHÍNH XÁC 100%!' : 'PERFECT! 100% CORRECT SEQUENCE!'}</span>
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Thứ tự chưa chính xác, hãy bấm "Làm lại" để thử lại.' : 'Incorrect sequence. Click Reset to retry.'}</span>
                  </span>
                )
              )}
            </div>

            <button
              type="button"
              disabled={userSequence.length < 8 || isSubmitted}
              onClick={handleCheckAnswer}
 className="px-5 py-2.5 rounded-xl bg-info hover:bg-info/90 text-white font-semibold font-mono text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg transition-all"
            >
              {language === 'vi' ? 'KIỂM TRA KẾT QUẢ' : 'VERIFY SEQUENCE'}
            </button>
          </div>
        </div>

        {/* Right Column: Educational Takeaways & Summary */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'vi' ? 'TỔNG KẾT TOÀN DIỆN BUỔI 3' : 'LESSON 3 SUMMARY'}</span>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">
                {language === 'vi' ? 'WHY DID BLOCKCHAIN NEED TO EXIST?' : 'Why Did Blockchain Need To Exist?'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'vi'
                  ? 'Blockchain không ra đời chỉ để đầu cơ giá. Blockchain ra đời để giải quyết bài toán: "Làm thế nào để các thực thể không quen biết nhau có thể cùng đồng thuận về một sự thật lịch sử duy nhất mà không cần một ông chủ trung tâm nào làm trọng tài?".'
                  : 'Blockchain was born to solve a profound problem: "How can sovereign distrusting peers agree on an immutable historical truth without trusting any central referee?".'}
              </p>

              <div className="p-3 rounded-xl bg-[#05070c] border border-slate-800 space-y-2 text-xs font-mono">
                <div className="text-emerald-400 font-bold">CHUỖI TIẾN HÓA LOGIC:</div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  Tiền Tệ ➔ Niềm Tin ➔ Trung Gian Tập Trung ➔ Khủng Hoảng/Lạm Phát ➔ Bài Toán Tiêu Đúp ➔ Mạng Ngang Hàng (P2P) ➔ Blockchain ➔ Bitcoin.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {onPrevStage && (
              <button
                type="button"
                onClick={onPrevStage}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-400 cursor-pointer"
              >
                {language === 'vi' ? '← Quay lại Phần 06' : '← Back to Part 06'}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onCompleteLesson?.();
                onInteracted?.();
              }}
 className="px-4 py-2 rounded-xl bg-success hover:bg-success/90 text-white font-semibold font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ml-auto shadow-md"
            >
              <span>{language === 'vi' ? '✓ HOÀN THÀNH BUỔI 3' : '✓ COMPLETE LESSON 3'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
