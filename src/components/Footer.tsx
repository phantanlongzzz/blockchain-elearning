import React from 'react';
import { ShieldCheck, Cpu, GraduationCap } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const Footer: React.FC = () => {
  const { strings } = useLanguage();

  return (
    <footer
      id="main-footer"
      className="border-t border-[#1C2430] bg-[#090A0F] relative font-sans text-xs text-[#A5AFBF] mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* 1. LEFT COLUMN — PLATFORM INFORMATION */}
          <div
            id="footer-col-platform"
            className="p-5 sm:p-6 rounded-2xl bg-[#0C0F14] border border-[#1C2430] flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0F131A] border border-[#1C2430] flex items-center justify-center text-text-primary shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-[#F2F4F7] font-bold text-lg tracking-tight font-sans">
                  {strings.footer.platformTitle}
                </h3>
              </div>
              <p className="text-[#B5BFCF] text-[14px] sm:text-[15px] leading-relaxed font-sans">
                {strings.footer.platformSubtitle}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#1C2430] flex items-center gap-2 text-xs font-mono text-[#8E9AA8]">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>SHA-256 · FIPS 180-4 · ECDSA</span>
            </div>
          </div>

          {/* 2. CENTER COLUMN — INSTRUCTOR + STUDENT */}
          <div
            id="footer-col-academic"
            className="p-5 sm:p-6 rounded-2xl bg-[#0C0F14] border border-[#1C2430] flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <GraduationCap className="w-4 h-4 text-text-primary shrink-0" />
                <h4 className="text-sm font-bold text-text-primary font-sans">
                  {strings.footer.academicProjectLabel}
                </h4>
              </div>

              <div className="space-y-3">
                {/* Instructor Info */}
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-[#8E9AA8] block font-sans">
                    {strings.footer.instructorLabel}
                  </span>
                  <div className="text-[#F2F4F7] font-semibold text-base font-sans">
                    {strings.footer.instructorName}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#1C2430] my-2.5" />

                {/* Student Info */}
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-[#8E9AA8] block font-sans">
                    {strings.footer.studentLabel}
                  </span>
                  <div className="text-[#F2F4F7] font-semibold text-base font-sans">
                    {strings.footer.studentName}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. RIGHT COLUMN — TECHNOLOGY / ACADEMIC STANDARD */}
          <div
            id="footer-col-technology"
            className="p-5 sm:p-6 rounded-2xl bg-[#0C0F14] border border-[#1C2430] flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <Cpu className="w-4 h-4 text-text-primary shrink-0" />
                <h4 className="text-sm font-bold text-text-primary font-sans">
                  {strings.footer.techStandardLabel}
                </h4>
              </div>

              <div className="space-y-3">
                {/* Platform Name */}
                <div className="text-[#F2F4F7] font-semibold text-base font-sans">
                  {strings.footer.techPlatformName}
                </div>

                {/* Standard Badge */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-text-primary text-xs font-medium font-sans">
                    <ShieldCheck className="w-3.5 h-3.5 text-text-primary shrink-0" />
                    <span>{strings.footer.techStandardName}</span>
                  </span>
                </div>

                {/* Tech Stack List */}
                <div className="pt-2 text-[#9AA5B5] text-[13px] leading-relaxed font-mono">
                  {strings.footer.techStackList}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
