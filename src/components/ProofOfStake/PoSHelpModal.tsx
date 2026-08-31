import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { HelpCircle, X, Sparkles, Layers, MousePointerClick, Activity, ShieldAlert } from 'lucide-react';
import { SimulationQuestions } from '../common/SimulationGuidePanel';

interface PoSHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: SimulationQuestions;
}

export const PoSHelpModal: React.FC<PoSHelpModalProps> = ({
  isOpen,
  onClose,
  questions,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  if (!isOpen) return null;

  const questionItems = [
    {
      id: 1,
      num: '01',
      titleVi: 'Tôi đang nhìn cái gì?',
      titleEn: 'What am I looking at?',
      descVi: questions.whatAmILookingAtVi,
      descEn: questions.whatAmILookingAtEn,
      icon: Layers,
      color: 'text-[#00C98D] border-[rgba(0,201,141,0.35)] bg-[rgba(0,201,141,0.06)]',
    },
    {
      id: 2,
      num: '02',
      titleVi: 'Tôi nên làm gì?',
      titleEn: 'What should I do?',
      descVi: questions.whatShouldIClickVi,
      descEn: questions.whatShouldIClickEn,
      icon: MousePointerClick,
      color: 'text-[#00C98D] border-[rgba(0,201,141,0.35)] bg-[rgba(0,201,141,0.06)]',
    },
    {
      id: 3,
      num: '03',
      titleVi: 'Chuyện gì vừa xảy ra?',
      titleEn: 'What just happened?',
      descVi: questions.whatJustHappenedVi,
      descEn: questions.whatJustHappenedEn,
      icon: Activity,
      color: 'text-[#F59E0B] border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.06)]',
    },
    {
      id: 4,
      num: '04',
      titleVi: 'Tại sao nó xảy ra?',
      titleEn: 'Why did it happen?',
      descVi: questions.whyDidItHappenVi,
      descEn: questions.whyDidItHappenEn,
      icon: ShieldAlert,
      color: 'text-[#00C98D] border-[rgba(0,201,141,0.35)] bg-[rgba(0,201,141,0.06)]',
    },
  ];

  return (
    <div
      id="pos-help-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0C0F14] border border-[#1C2430] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1C2430] bg-[#0F131A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.35)] flex items-center justify-center text-[#00C98D] shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#F2F4F7] font-display">
                {isVi ? 'Trợ Giúp Nhanh: 4 Câu Hỏi Trọng Tâm' : 'Quick Help: 4 Core Questions'}
              </h3>
              <p className="text-xs text-[#A5AFBF]">
                {isVi
                  ? 'Hướng dẫn tư duy phân tích mô phỏng Proof of Stake'
                  : 'Framework for understanding the Proof of Stake simulation'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-[#0F131A] transition-colors cursor-pointer"
            title={isVi ? 'Đóng [ESC]' : 'Close [ESC]'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Question Grid */}
        <div className="p-5 sm:p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {questionItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border ${item.color} space-y-2 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <h4 className="text-sm font-bold text-[#F2F4F7] font-display">
                      {item.num}. {isVi ? item.titleVi : item.titleEn}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#090A0F] text-[#717B8C] border border-[#1C2430]">
                    PoS CORE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#A5AFBF] leading-relaxed font-sans pl-6">
                  {isVi ? item.descVi : item.descEn}
                </p>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1C2430] bg-[#0F131A] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#00C98D] hover:bg-[#00B982] text-[#090A0F] font-bold text-xs font-sans transition-all cursor-pointer shadow-sm"
          >
            {isVi ? 'Đã hiểu & Tiếp tục' : 'Got it & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
