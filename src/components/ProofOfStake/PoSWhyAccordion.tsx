import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Scale,
  Flame,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const PoSWhyAccordion: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';

  const [isSectionOpen, setIsSectionOpen] = useState<boolean>(false);
  const [openQAIndex, setOpenQAIndex] = useState<number | null>(null);

  const whyPrinciples = [
    {
      num: '01',
      titleVi: 'Vì sao phải đặt cọc (Stake)?',
      titleEn: 'Why is Staking required?',
      descVi: 'Khóa tài sản (ETH) vào hợp đồng tạo ra "vũ khí kinh tế" (Skin in the game). Nếu làm đúng sẽ nhận phần thưởng, nhưng nếu tấn công mạng lưới sẽ mất tiền cọc — chi phí gian lận luôn lớn hơn lợi ích thu được.',
      descEn: 'Locking collateral establishes economic "skin in the game". Honest validators earn rewards, while attackers face immediate confiscation — making attacks economically irrational.',
      icon: ShieldCheck,
      color: 'text-[#00C98D] border-[rgba(0,201,141,0.3)] bg-[rgba(0,201,141,0.05)]',
    },
    {
      num: '02',
      titleVi: 'Vì sao chọn ngẫu nhiên có trọng số?',
      titleEn: 'Why weighted pseudo-random lottery?',
      descVi: 'Tỷ lệ được chọn tỷ lệ thuận với số tiền đặt cọc để đảm bảo tính công bằng theo vốn góp, nhưng vẫn đảm bảo tính ngẫu nhiên bất khả đoán trước (RANDAO/VRF) để ngăn chặn kẻ xấu thao túng thời điểm tạo khối.',
      descEn: 'Probability scales with stake to reflect capital contribution fairly, while verifiable randomness (RANDAO/VRF) prevents adversaries from predicting or manipulating block production slots.',
      icon: Zap,
      color: 'text-[#F59E0B] border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.05)]',
    },
    {
      num: '03',
      titleVi: 'Vì sao cần xác thực chéo (Attestation)?',
      titleEn: 'Why is peer attestation needed?',
      descVi: 'Một mình người tạo khối không thể tự quyết định. Hội đồng các Validator khác phải cùng kiểm tra lại tính hợp lệ của mọi giao dịch và ký số xác nhận (ít nhất 2/3 tổng cọc đồng thuận) trước khi khối được hoàn tất.',
      descEn: 'A single block proposer cannot unilaterally dictate state. A committee of peer validators must verify transactions and sign attestations (requiring a 2/3 supermajority) before finality.',
      icon: Scale,
      color: 'text-[#00C98D] border-[rgba(0,201,141,0.3)] bg-[rgba(0,201,141,0.05)]',
    },
    {
      num: '04',
      titleVi: 'Điều gì xảy ra khi gian lận (Slashing)?',
      titleEn: 'What happens during fraud (Slashing)?',
      descVi: 'Nếu một validator ký vào 2 khối khác nhau ở cùng một độ cao (Double Signing) hoặc đề xuất khối vi phạm quy tắc, giao thức sẽ tự động đốt (burn) tiền cọc và loại trừ nút đó vĩnh viễn khỏi mạng lưới.',
      descEn: 'If a validator signs two conflicting blocks at the same slot (Double Signing) or proposes invalid transactions, the protocol automatically slashes and burns their stake, expelling the node permanently.',
      icon: Flame,
      color: 'text-[#EF4444] border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)]',
    },
  ];

  const qaList = [
    { id: 1, q: strings.proofOfStake.qaItems.q1, a: strings.proofOfStake.qaItems.a1 },
    { id: 2, q: strings.proofOfStake.qaItems.q2, a: strings.proofOfStake.qaItems.a2 },
    { id: 3, q: strings.proofOfStake.qaItems.q3, a: strings.proofOfStake.qaItems.a3 },
    { id: 4, q: strings.proofOfStake.qaItems.q4, a: strings.proofOfStake.qaItems.a4 },
    { id: 5, q: strings.proofOfStake.qaItems.q5, a: strings.proofOfStake.qaItems.a5 },
    { id: 6, q: strings.proofOfStake.qaItems.q6, a: strings.proofOfStake.qaItems.a6 },
  ];

  return (
    <div className="bg-[#0C0F14] border border-[#1C2430] rounded-2xl overflow-hidden shadow-xl transition-all">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        id="pos-why-accordion-toggle"
        onClick={() => setIsSectionOpen(!isSectionOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#0F131A] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.35)] flex items-center justify-center text-[#00C98D] shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#F2F4F7] font-display flex items-center gap-2">
              <span>{isVi ? '💡 TẠI SAO CƠ CHẾ NÀY HOẠT ĐỘNG?' : '💡 WHY DOES THIS MECHANISM WORK?'}</span>
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-[#0F131A] text-[#A5AFBF] border border-[#1C2430]">
                {isVi ? '4 Nguyên lý & 6 Câu hỏi mở rộng' : '4 Principles & 6 Deep Dive Q&As'}
              </span>
            </h3>
            <p className="text-xs text-[#A5AFBF] mt-0.5">
              {isVi
                ? 'Giải thích lý thuyết kinh tế học hành vi & cơ chế bảo mật đằng sau Proof of Stake'
                : 'Behavioral economics & game theory security behind Proof of Stake'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#A5AFBF]">
          <span className="hidden sm:inline">
            {isSectionOpen ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Xem chi tiết' : 'Expand details')}
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#0F131A] border border-[#1C2430] flex items-center justify-center text-[#00C98D]">
            {isSectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Accordion Content Body */}
      {isSectionOpen && (
        <div className="p-5 sm:p-6 border-t border-[#1C2430] bg-[#090A0F]/60 space-y-6 animate-in fade-in duration-200">
          {/* 4 Fundamental "Why" Principles Cards */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#A5AFBF] font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00C98D]" />
              <span>{isVi ? '4 NGUYÊN TẮC BẢO MẬT KINH TẾ CỐT LÕI' : '4 CORE ECONOMIC SECURITY PILLARS'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {whyPrinciples.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.num}
                    className={`p-4 rounded-xl border ${card.color} flex flex-col justify-between space-y-2`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-mono font-bold text-[#717B8C]">
                          #{card.num}
                        </span>
                      </div>
                      <h5 className="text-xs sm:text-sm font-bold text-[#F2F4F7] font-display mb-1">
                        {isVi ? card.titleVi : card.titleEn}
                      </h5>
                      <p className="text-xs text-[#A5AFBF] leading-relaxed font-sans">
                        {isVi ? card.descVi : card.descEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep-dive Q&A Accordion */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#A5AFBF] font-bold flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#00C98D]" />
              <span>{isVi ? 'CÂU HỎI THƯỜNG GẶP VỀ CƠ CHẾ POS' : 'FREQUENTLY ASKED POS QUESTIONS'}</span>
            </h4>

            <div className="space-y-2">
              {qaList.map((item, index) => {
                const isOpen = openQAIndex === index;
                return (
                  <div
                    key={item.id}
                    className="bg-[#0F131A] border border-[#1C2430] rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      id={`pos-why-qa-${item.id}`}
                      onClick={() => setOpenQAIndex(isOpen ? null : index)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-[#11161E] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-[#090A0F] border border-[#1C2430] flex items-center justify-center text-[11px] font-mono font-bold text-[#00C98D] shrink-0">
                          Q{item.id}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-[#F2F4F7] font-sans">
                          {item.q}
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#00C98D] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#717B8C] shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-3.5 pt-1 text-xs text-[#A5AFBF] leading-relaxed font-sans border-t border-[#1C2430] bg-[#090A0F]/50">
                        <div className="p-3 rounded-lg bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.25)] text-[#F2F4F7] font-sans text-xs leading-relaxed">
                          {item.a}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
