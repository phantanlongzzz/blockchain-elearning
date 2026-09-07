import React, { useState } from 'react';
import {
  ShieldCheck,
  Minimize2,
  Lock,
  Zap,
  CopyX,
  ArrowRight,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { InlineMath } from './MathView';

export const PropertiesSection: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';

  const fixedLengthExamples = [
    { label: 'Single Char "A"', input: 'A', bits: 8, hex: '559aead08264d5795d3909718cdd05abd49572e84fe55590eef31a88a08fdffd' },
    { label: 'Empty Message ""', input: '', bits: 0, hex: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
    { label: '10,000-Word Document', input: 'Encyclopedia payload lorem ipsum dolor sit amet... [10,000 words]', bits: 640000, hex: '8a129d8417c49120485918237194820194827104928371948201938472910482' },
  ];

  return (
    <section id="properties" className="py-20 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 font-sans">
          <div className="inline-flex items-center gap-2 text-teach-1 text-xs font-mono font-semibold tracking-wider uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{strings.properties.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F2F4F7] tracking-tight font-sans mb-3">
            {strings.properties.title}
          </h2>
          <p className="text-sm sm:text-base text-[#A5AFBF] leading-relaxed font-sans">
            {strings.properties.description}
          </p>
        </div>

        {/* 4 Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
          {/* Property 1: Fixed-Length Output */}
          <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-6 sm:p-7 shadow-lg hover:border-border-primary transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary">
                  <Minimize2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-semibold text-teach-1">
                  Property #01
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#F2F4F7] font-sans mb-2">
                {strings.properties.prop1Title}
              </h3>
              <p className="text-sm text-[#A5AFBF] mb-5 leading-relaxed font-sans">
                {isVi
                  ? 'Mọi kích thước đầu vào đều được nén thành bản băm chuẩn cố định 256 bit (32 byte).'
                  : 'Every input size is compressed into a fixed 256-bit (32-byte) digest.'}
              </p>
            </div>

            {/* Interactive Convergence Demonstration */}
            <div className="bg-[#090A0F] rounded-lg p-4 border border-[#1C2430] space-y-3 font-sans text-xs">
              <div className="text-[11px] text-[#A5AFBF] uppercase tracking-wider font-semibold">
                {strings.properties.prop1Convergence}
              </div>
              {fixedLengthExamples.map((ex, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#0F131A] border border-[#1C2430] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-sans">
                    <span className="w-2 h-2 rounded-full bg-teach-1" />
                    <span className="text-[#F2F4F7] font-semibold">{ex.label}</span>
                    <span className="text-[#717B8C] text-[10px] font-mono">({ex.bits.toLocaleString()} bits)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-teach-1 font-sans">
                    <ArrowRight className="w-3.5 h-3.5 text-[#717B8C] hidden sm:inline" />
                    <span className="px-2 py-0.5 rounded-md bg-[#090A0F] border border-[#1C2430] font-bold font-mono text-teach-1">
                      256 Bits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Property 2: One-Way Function */}
          <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-6 sm:p-7 shadow-lg hover:border-border-primary transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-semibold text-teach-2">
                  Property #02
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#F2F4F7] font-sans mb-2">
                {strings.properties.prop2Title}
              </h3>
              <p className="text-sm text-[#A5AFBF] mb-5 leading-relaxed font-sans">
                {isVi
                  ? 'Tính toán thuận tức thì, nhưng tìm ngược lại dữ liệu gốc từ bản băm là bất khả thi.'
                  : 'Forward computation is instantaneous, while reversing from digest back to input is computationally infeasible.'}
              </p>
            </div>

            {/* Visual Forward vs Reverse Block */}
            <div className="bg-[#090A0F] rounded-lg p-4 border border-[#1C2430] space-y-3 text-xs font-sans">
              <div className="p-2.5 rounded-lg bg-bg-elevated border border-border-primary flex items-center justify-between text-text-secondary">
                <span className="font-semibold font-sans">Forward: <InlineMath math="x \xrightarrow{\text{SHA-256}} H(x)" /></span>
                <span className="flex items-center gap-1 font-bold text-[11px] font-sans">
                  <CheckCircle className="w-3.5 h-3.5" /> {strings.properties.prop2ForwardStatus}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center justify-between text-rose-300">
                <span className="font-semibold font-sans">Reverse: <InlineMath math="H(x) \xrightarrow{\quad \times \quad} x" /></span>
                <span className="flex items-center gap-1 font-bold text-[11px] font-sans">
                  <XCircle className="w-3.5 h-3.5" /> {strings.properties.prop2ReverseStatus}
                </span>
              </div>

              <div className="text-[11px] text-[#A5AFBF] pt-1 leading-relaxed font-sans">
                {strings.properties.prop2Note}
              </div>
            </div>
          </div>

          {/* Property 3: Avalanche Effect */}
          <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-6 sm:p-7 shadow-lg hover:border-[#F59E0B]/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-[#0F131A] border border-[#1C2430] text-[#F59E0B]">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-semibold text-[#F59E0B]">
                  Property #03
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#F2F4F7] font-sans mb-2">
                {strings.properties.prop3Title}
              </h3>
              <p className="text-sm text-[#A5AFBF] mb-5 leading-relaxed font-sans">
                {isVi
                  ? 'Thay đổi dù chỉ 1 bit đầu vào sẽ làm đảo ngẫu nhiên xấp xỉ 50% số bit đầu ra.'
                  : 'Changing a single input bit randomly flips approximately 50% of all output bits.'}
              </p>
            </div>

            {/* Avalanche Visual Card */}
            <div className="bg-[#070A12] rounded-xl p-4 border border-white/[0.06] space-y-2 font-sans text-xs">
              <div className="flex justify-between items-center text-[#F4F4F5]">
                <span>{strings.properties.prop3InputLabel} <span className="font-mono text-white">"Hello World"</span></span>
                <span className="text-teach-1 font-mono">77e35c71...</span>
              </div>
              <div className="flex justify-between items-center text-[#F4F4F5]">
                <span>{strings.properties.prop3InputLabel} <span className="font-mono text-white">"Hello world"</span> <span className="text-purple-400 font-medium font-mono text-[11px]">(1 char diff)</span></span>
                <span className="text-purple-400 font-mono">a93f18c2...</span>
              </div>
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-teach-1 font-semibold font-sans">
                <span>{strings.properties.prop3ObservedDist}</span>
                <span className="font-mono">~128 / 256 bits changed (~50%)</span>
              </div>
            </div>
          </div>

          {/* Property 4: Collision Resistance */}
          <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-6 sm:p-7 shadow-lg hover:border-border-primary transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary">
                  <CopyX className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-semibold text-teach-3">
                  Property #04
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#F2F4F7] font-sans mb-2">
                {strings.properties.prop4Title}
              </h3>
              <p className="text-sm text-[#A5AFBF] mb-5 leading-relaxed font-sans">
                {isVi
                  ? 'Bất khả thi về mặt tính toán để tìm thấy hai đầu vào khác nhau có cùng giá trị hàm băm.'
                  : 'Computationally infeasible to find two distinct inputs yielding the identical hash output.'}
              </p>
            </div>

            {/* Scientific Birthday Attack Math */}
            <div className="bg-[#090A0F] rounded-lg p-4 border border-[#1C2430] space-y-2.5 text-xs font-sans">
              <div className="flex items-center justify-between text-[#F2F4F7]">
                <span className="text-[#A5AFBF] font-sans">{strings.properties.prop4PreimageBound}</span>
                <span className="text-teach-1 font-semibold font-mono"><InlineMath math="2^{256} \text{ operations}" /></span>
              </div>
              <div className="flex items-center justify-between text-[#F2F4F7]">
                <span className="text-[#A5AFBF] font-sans">{strings.properties.prop4BirthdayBound}</span>
                <span className="text-teach-2 font-semibold font-mono"><InlineMath math="2^{128} \text{ operations}" /></span>
              </div>
              <div className="text-[11px] text-[#A5AFBF] pt-1 leading-relaxed font-sans">
                {strings.properties.prop4Note}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

