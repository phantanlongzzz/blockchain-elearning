import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { BookOpen, X, Sparkles, Coins, Users, ShieldCheck, Flame } from 'lucide-react';

interface TerminologyItem {
  id: string;
  termVi: string;
  termEn: string;
  badgeVi: string;
  badgeEn: string;
  defVi: string;
  defEn: string;
  whyVi: string;
  whyEn: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

const TERMINOLOGY_ITEMS: TerminologyItem[] = [
  {
    id: 'pos',
    termVi: 'PoS (Proof of Stake)',
    termEn: 'PoS (Proof of Stake)',
    badgeVi: 'ĐỒNG THUẬN',
    badgeEn: 'CONSENSUS',
    defVi: 'Cơ chế đồng thuận nơi quyền tạo khối và bỏ phiếu tỷ lệ thuận với lượng tiền mã hóa đặt cọc vào mạng lưới.',
    defEn: 'Consensus mechanism where block creation and validation rights are proportional to staked tokens.',
    whyVi: 'Thay thế việc đốt điện năng bằng cam kết tài chính (kinh tế học hành vi).',
    whyEn: 'Replaces raw energy consumption with financial commitment.',
    icon: ShieldCheck,
    colorClass: 'text-[#00C98D] border-[rgba(0,201,141,0.35)] bg-[rgba(0,201,141,0.08)]',
  },
  {
    id: 'validator',
    termVi: 'Validator (Người xác thực)',
    termEn: 'Validator (Node)',
    badgeVi: 'NÚT MẠNG',
    badgeEn: 'NODE',
    defVi: 'Nút mạng tham gia đặt cọc tối thiểu để xác nhận tính hợp lệ của giao dịch và đề xuất khối mới.',
    defEn: 'A network node that deposits collateral to validate transactions and propose new blocks.',
    whyVi: 'Đảm bảo chỉ những nút có cam kết tài sản mới được quyền duy trì sổ cái.',
    whyEn: 'Ensures only invested participants have the right to maintain ledger state.',
    icon: Users,
    colorClass: 'text-[#F59E0B] border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.08)]',
  },
  {
    id: 'stake',
    termVi: 'Stake (Tiền đặt cọc)',
    termEn: 'Stake (Collateral)',
    badgeVi: 'TÀI SẢN',
    badgeEn: 'ASSET',
    defVi: 'Lượng tài sản (ETH) bị khóa lại trong hợp đồng thông minh làm bảo chứng cho sự trung thực.',
    defEn: 'The cryptocurrency deposited and locked as collateral to guarantee honest participation.',
    whyVi: 'Đặt cọc càng nhiều → Cơ hội được chọn giải khối nhận thưởng càng cao.',
    whyEn: 'Higher stake → higher probability of being chosen for block rewards.',
    icon: Coins,
    colorClass: 'text-[#00C98D] border-[rgba(0,201,141,0.35)] bg-[rgba(0,201,141,0.08)]',
  },
  {
    id: 'slashing',
    termVi: 'Slashing (Tịch thu cọc)',
    termEn: 'Slashing (Penalty)',
    badgeVi: 'TRỪNG PHẠT',
    badgeEn: 'PENALTY',
    defVi: 'Cơ chế tự động tịch thu hoặc đốt một phần/toàn bộ số tiền đặt cọc khi validator cố tình gian lận.',
    defEn: 'Automatic protocol penalty that destroys or confiscates deposit upon detecting fraudulent blocks.',
    whyVi: 'Tạo rủi ro kinh tế cực lớn khiến chi phí tấn công mạng lưới cao hơn lợi nhuận thu được.',
    whyEn: 'Creates massive economic risk making attacks far more costly than potential gains.',
    icon: Flame,
    colorClass: 'text-[#EF4444] border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.08)]',
  },
];

export const PoSTerminologyBar: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [selectedTerm, setSelectedTerm] = useState<TerminologyItem | null>(null);

  return (
    <div className="relative">
      {/* Compact Terminology Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-[#A5AFBF] text-[11px] uppercase flex items-center gap-1.5 font-bold shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-[#00C98D]" />
          <span>{isVi ? 'Thuật ngữ cốt lõi:' : 'Core Terminology:'}</span>
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {TERMINOLOGY_ITEMS.map((item) => {
            const isSelected = selectedTerm?.id === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                id={`pos-term-chip-${item.id}`}
                onClick={() => setSelectedTerm(isSelected ? null : item)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00C98D] text-[#090A0F] border-[#00C98D] font-bold shadow-sm'
                    : 'bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border-[#1C2430]'
                }`}
                title={isVi ? `Bấm để xem giải thích thuật ngữ ${item.termVi}` : `Click to view definition for ${item.termEn}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#090A0F]' : 'text-[#717B8C]'}`} />
                <span>{item.id.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popover / Expandable Definition Card */}
      {selectedTerm && (
        <div
          id="pos-term-popover"
          className="mt-2.5 p-3.5 sm:p-4 rounded-xl bg-[#0C0F14] border border-[rgba(0,201,141,0.35)] shadow-xl space-y-2 animate-in fade-in slide-in-from-top-1 duration-150 relative z-20"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#1C2430] pb-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${selectedTerm.colorClass}`}>
                {isVi ? selectedTerm.badgeVi : selectedTerm.badgeEn}
              </span>
              <h4 className="text-sm font-bold text-[#F2F4F7] font-display">
                {isVi ? selectedTerm.termVi : selectedTerm.termEn}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTerm(null)}
              className="p-1 rounded-md text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-[#0F131A] transition-colors cursor-pointer"
              title={isVi ? 'Đóng' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#A5AFBF] leading-relaxed font-sans">
            {isVi ? selectedTerm.defVi : selectedTerm.defEn}
          </p>

          <div className="flex items-start gap-1.5 text-[11px] font-sans text-[#00C98D] bg-[rgba(0,201,141,0.08)] p-2 rounded-lg border border-[rgba(0,201,141,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#00C98D] shrink-0 mt-0.5" />
            <span>
              <strong>{isVi ? 'Ý nghĩa trong PoS: ' : 'Role in PoS: '}</strong>
              {isVi ? selectedTerm.whyVi : selectedTerm.whyEn}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
