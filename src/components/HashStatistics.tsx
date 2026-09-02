import React from 'react';
import { Binary, Database, Lock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { InlineMath } from './MathView';

interface HashStatisticsProps {
  inputBytes: number;
  inputBits: number;
  calculationTimeMs: number;
}

export const HashStatistics: React.FC<HashStatisticsProps> = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const stats = [
    {
      title: '256 BITS',
      subtitle: isVi ? 'Độ dài cố định (64 Hex)' : 'Fixed Digest (64 Hex)',
      desc: isVi
        ? 'Dù đầu vào là 1 ký tự hay 1 GB, đầu ra luôn đúng 256 bit (32 bytes · 64 hex).'
        : 'Uniform 256-bit output (32 bytes · 64 hex characters) regardless of input size.',
      icon: Binary,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgGlow: 'hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    },
    {
      title: '2²⁵⁶',
      mathTitle: '2^{256}',
      titleSuffix: isVi ? ' TRẠNG THÁI' : ' OUTPUTS',
      subtitle: isVi ? '≈ 1.1579 × 10⁷⁷ giá trị' : '≈ 1.1579 × 10⁷⁷ states',
      desc: isVi
        ? 'Không gian mẫu khổng lồ vượt qua tổng số nguyên tử trong vũ trụ quan sát được.'
        : 'Colossal state space exceeding the total atoms in the observable universe.',
      icon: Database,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgGlow: 'hover:border-emerald-500/40',
    },
    {
      title: isVi ? 'MỘT CHIỀU' : 'ONE-WAY',
      subtitle: isVi ? 'Pre-image Resistance' : 'Pre-image Resistance',
      desc: isVi
        ? 'Dễ dàng tính mã băm từ dữ liệu, nhưng bất khả thi về mặt toán học để giải ngược lại.'
        : 'Computationally trivial to hash forward; practically impossible to reverse.',
      icon: Lock,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgGlow: 'hover:border-emerald-500/40',
    },
    {
      title: isVi ? 'KHÁNG VA CHẠM' : 'COLLISION-FREE',
      subtitle: isVi ? 'Collision Resistance' : 'Collision Resistance',
      desc: isVi
        ? 'Không thể tìm thấy hai thông điệp khác biệt có cùng một mã băm SHA-256 đầu ra.'
        : 'Infeasible to find two distinct inputs producing the identical SHA-256 digest.',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgGlow: 'hover:border-emerald-500/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8 font-sans">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-5 transition-all duration-200 hover:border-[#2A3649]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg sm:text-xl font-bold font-sans text-[#F2F4F7] tracking-tight">
                {stat.mathTitle ? (
                  <span>
                    <InlineMath math={stat.mathTitle} className="text-[#00C98D] font-bold" />
                    {stat.titleSuffix}
                  </span>
                ) : (
                  <span className="text-[#00C98D]">{stat.title}</span>
                )}
              </span>
              <div className="p-2 rounded-lg bg-[#0F131A] border border-[#1C2430]">
                <Icon className="w-4 h-4 text-[#00C98D]" />
              </div>
            </div>
            <p className="text-xs font-semibold text-[#F2F4F7] font-sans mb-1">
              {stat.subtitle}
            </p>
            <p className="text-xs text-[#A5AFBF] leading-relaxed font-sans">
              {stat.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};
