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
      color: 'text-text-secondary',
      borderColor: 'border-border-primary',
      bgGlow: 'hover:border-border-secondary',
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
      color: 'text-text-secondary',
      borderColor: 'border-border-primary',
      bgGlow: 'hover:border-border-secondary',
    },
    {
      title: isVi ? 'MỘT CHIỀU' : 'ONE-WAY',
      subtitle: isVi ? 'Pre-image Resistance' : 'Pre-image Resistance',
      desc: isVi
        ? 'Dễ dàng tính mã băm từ dữ liệu, nhưng bất khả thi về mặt toán học để giải ngược lại.'
        : 'Computationally trivial to hash forward; practically impossible to reverse.',
      icon: Lock,
      color: 'text-text-secondary',
      borderColor: 'border-border-primary',
      bgGlow: 'hover:border-border-secondary',
    },
    {
      title: isVi ? 'KHÁNG VA CHẠM' : 'COLLISION-FREE',
      subtitle: isVi ? 'Collision Resistance' : 'Collision Resistance',
      desc: isVi
        ? 'Không thể tìm thấy hai thông điệp khác biệt có cùng một mã băm SHA-256 đầu ra.'
        : 'Infeasible to find two distinct inputs producing the identical SHA-256 digest.',
      icon: ShieldCheck,
      color: 'text-text-secondary',
      borderColor: 'border-border-primary',
      bgGlow: 'hover:border-border-secondary',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8 font-sans">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="rounded-xl bg-[#10151D] border border-[#1E2936] p-5 transition-all duration-200 hover:border-[#263241]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg sm:text-xl font-bold font-sans text-[#E6EAF0] tracking-tight">
                {stat.mathTitle ? (
                  <span>
                    <InlineMath math={stat.mathTitle} className="text-[#E6EAF0] font-bold" />
                    {stat.titleSuffix}
                  </span>
                ) : (
                  <span className="text-[#E6EAF0]">{stat.title}</span>
                )}
              </span>
              <div className="p-2 rounded-lg bg-[#151B24] border border-[#1E2936]">
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-xs font-semibold text-[#E6EAF0] font-sans mb-1">
              {stat.subtitle}
            </p>
            <p className="text-xs text-[#8B95A5] leading-relaxed font-sans">
              {stat.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};
