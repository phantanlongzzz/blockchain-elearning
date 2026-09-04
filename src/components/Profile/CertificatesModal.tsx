import React from 'react';
import {
  X,
  Award,
  ShieldCheck,
  Lock,
  Sparkles,
  Info,
  Layers,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const CertificatesModal: React.FC = () => {
  const {
    certificatesModalOpen,
    setCertificatesModalOpen,
    getCertificates,
    user,
  } = useAuth();
  const { strings, language } = useLanguage();

  if (!certificatesModalOpen || !user) return null;

  const certs = getCertificates();
  const activeCert = certs.length > 0 ? certs[0] : null;

  return (
    <div
      id="certificates-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090A0F]/85 backdrop-blur-sm animate-fade-in font-sans"
      onClick={() => setCertificatesModalOpen(false)}
    >
      <div
        id="certificates-modal-container"
        className="relative w-full max-w-xl bg-[#0C0F14] border border-[#1C2430] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-cert-modal"
          onClick={() => setCertificatesModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#717B8C] hover:text-[#F2F4F7] rounded-lg hover:bg-[#11161E] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-4 border-b border-[#1C2430] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F2F4F7] tracking-tight">
              {strings.certificates.title}
            </h3>
            <p className="text-xs text-[#717B8C]">
              {strings.certificates.subtitle}
            </p>
          </div>
        </div>

        {/* Future-Ready Certificate Status & Placeholder */}
        <div className="my-6 space-y-4">
          <div className="p-6 bg-[#090A0F] border border-[#1C2430] rounded-2xl text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teach-1/10 border border-teach-1/30 text-teach-1 shadow-inner">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teach-1/10 border border-teach-1/20 text-[11px] font-semibold text-teach-1 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                {strings.certificates.previewBadge}
              </span>
              <h4 className="text-base font-bold text-[#F2F4F7]">
                {language === 'vi'
                  ? 'Chứng Chỉ Đánh Giá Năng Lực Học Thuật'
                  : 'Academic Assessment Certification'}
              </h4>
              <p className="text-xs text-[#A5AFBF] mt-2 font-medium">
                {language === 'vi'
                  ? 'Chứng chỉ sẽ được cấp sau khi hoàn thành các bài đánh giá đạt chuẩn.'
                  : 'Certificates will be available after completing eligible assessments.'}
              </p>
            </div>

            {/* Eligibility Status Check */}
            {activeCert ? (
              <div className="p-4 bg-teach-1/5 border border-teach-1/30 rounded-xl text-left text-xs space-y-2">
                <div className="flex items-center justify-between text-teach-1 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {language === 'vi'
                        ? 'Đã Đạt Điều Kiện Cấp Chứng Nhận'
                        : 'Assessment Requirement Met'}
                    </span>
                  </div>
                  <span className="font-mono text-teach-1 font-bold">
                    {activeCert.score}%
                  </span>
                </div>
                <p className="text-[#A5AFBF] text-[11px] leading-relaxed">
                  {language === 'vi'
                    ? `Sinh viên ${user.name} (${user.studentId} - ${user.class}) đã đạt ${activeCert.score}% tại bài kiểm tra phiên bản v${activeCert.quizVersion}. Mã định danh lưu trữ: ${activeCert.certificateId}.`
                    : `Student ${user.name} (${user.studentId} - ${user.class}) achieved ${activeCert.score}% on version v${activeCert.quizVersion}. Stored Certificate Identifier: ${activeCert.certificateId}.`}
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-[#0C0F14] border border-[#1C2430] rounded-xl text-left text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#F2F4F7] font-medium">
                  <Info className="w-4 h-4 text-teach-1 shrink-0" />
                  <span>{strings.certificates.passRequirement}</span>
                </div>
                <p className="text-[#717B8C] text-[11px] leading-relaxed">
                  {language === 'vi'
                    ? 'Hệ thống lưu trữ cấu trúc dữ liệu chứng chỉ tự động liên kết với từng lần nộp bài (Quiz Attempt) có điểm số từ 75% trở lên.'
                    : 'The underlying data architecture automatically links verifiable certificate records to quiz attempts scoring 75% or higher.'}
                </p>
              </div>
            )}

            {/* Architecture Schema Preview */}
            <div className="p-4 bg-[#0B0F15] border border-[#1C2430] rounded-xl text-left text-xs font-mono space-y-1.5">
              <div className="flex items-center gap-2 text-[#717B8C] text-[10px] uppercase tracking-wider font-bold mb-2">
                <Database className="w-3.5 h-3.5 text-teach-1" />
                <span>Certificate Data Architecture Model</span>
              </div>
              <div className="text-[11px] text-[#A5AFBF] space-y-1">
                <div><span className="text-teach-1">userId:</span> "{user.userId}"</div>
                <div><span className="text-teach-1">quizVersion:</span> "1.0"</div>
                <div><span className="text-teach-1">certificateId:</span> "{activeCert ? activeCert.certificateId : 'BC-CERT-XXXXXX'}"</div>
                <div><span className="text-teach-1">status:</span> "{activeCert ? 'eligible' : 'pending'}"</div>
              </div>
            </div>

            <button
              id="btn-take-quiz-from-cert"
              onClick={() => {
                setCertificatesModalOpen(false);
                const el = document.getElementById('quiz-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
 className="px-5 py-2.5 bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{strings.quiz.startQuiz}</span>
            </button>
          </div>

          {/* Platform Notice */}
          <div className="p-3 bg-[#090A0F] rounded-xl border border-[#1C2430] text-[11px] text-[#717B8C] text-center leading-relaxed">
            {language === 'vi'
              ? 'Chứng chỉ được cấp bởi Nền tảng Blockchain Elearning. Tính năng xuất tệp PDF và xác thực chữ ký số sẽ được tích hợp trong bản cập nhật tiếp theo.'
              : 'Certificates are issued by the Blockchain Elearning platform. PDF export and cryptographic signature verification will be integrated in a future release.'}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#1C2430] flex justify-end">
          <button
            onClick={() => setCertificatesModalOpen(false)}
            className="px-4 py-2 bg-[#11161E] hover:bg-[#151C26] text-[#A5AFBF] hover:text-[#F2F4F7] text-xs font-medium rounded-xl border border-[#1C2430] transition-colors cursor-pointer"
          >
            {strings.profile.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
