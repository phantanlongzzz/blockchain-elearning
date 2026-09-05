import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, RotateCcw, CheckCircle2, AlertTriangle, Building, Coins, FileText, Flame, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface TrustProblemSimulationProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
  onPrevStage?: () => void;
  isHandsOn?: boolean;
}

export const TrustProblemSimulation: React.FC<TrustProblemSimulationProps> = ({
  onInteracted,
  onNextStage,
  onPrevStage,
  isHandsOn = false,
}) => {
  const { language } = useLanguage();

  // Simulation State
  const [step, setStep] = useState<number>(1);
  const [vaultGold, setVaultGold] = useState<number>(100);
  const [aliceGold, setAliceGold] = useState<number>(0);
  const [aliceCert, setAliceCert] = useState<number>(100);
  const [bobCert, setBobCert] = useState<number>(0);
  const [charlieCert, setCharlieCert] = useState<number>(0);
  const [secretIssueCount, setSecretIssueCount] = useState<number>(0);
  const [isBankRunTriggered, setIsBankRunTriggered] = useState<boolean>(false);

  const totalPaperClaims = aliceCert + bobCert + charlieCert;
  const isFractionalReserveExceeded = totalPaperClaims > vaultGold;

  const handleReset = () => {
    setStep(1);
    setVaultGold(100);
    setAliceGold(0);
    setAliceCert(100);
    setBobCert(0);
    setCharlieCert(0);
    setSecretIssueCount(0);
    setIsBankRunTriggered(false);
  };

  const handleStep1 = () => {
    // Alice deposits 100 Gold, gets 100 cert
    setStep(1);
    setVaultGold(100);
    setAliceGold(0);
    setAliceCert(100);
    setBobCert(0);
    setCharlieCert(0);
    setSecretIssueCount(0);
    setIsBankRunTriggered(false);
    onInteracted?.();
  };

  const handleStep2 = () => {
    // Alice pays Bob with 100 cert
    setStep(2);
    setAliceCert(0);
    setBobCert(100);
    onInteracted?.();
  };

  const handleStep3 = () => {
    // Goldsmith secretly prints 100 extra cert to Charlie
    setStep(3);
    setCharlieCert(100);
    setSecretIssueCount(100);
    onInteracted?.();
  };

  const handleStep4 = () => {
    // Bank Run / Trust Breakdown
    setStep(4);
    setIsBankRunTriggered(true);
    onInteracted?.();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0B0E12] border border-border-primary shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-border-primary text-text-primary text-xs font-mono font-bold uppercase">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'PHẦN 02 · NGHỊCH LÝ NIỀM TIN' : 'PART 02 · THE TRUST PARADOX'}</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {language === 'vi'
                ? 'Thí nghiệm Goldsmith (Thợ Kim Hoàn) & Căn nguyên sự sụp đổ niềm tin'
                : 'The Goldsmith Experiment & The Origin of Trust Breakdown'}
            </h3>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {language === 'vi'
                ? 'Khi con người chuyển từ "Vàng vật lý tự giữ" sang "Chứng chỉ giấy được một bên thứ 3 bảo quản", chúng ta trao quyền lực tối thượng cho Người trung gian. Điều gì sẽ xảy ra khi bên trung gian bí mật lạm dụng quyền lực này?'
                : 'When transitioning from physical self-custody to paper certificates, absolute power is entrusted to the custodian. What happens when the intermediary covertly exploits this trust?'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-[#0F1217] hover:bg-[#161D26] border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Làm lại thí nghiệm' : 'Reset Experiment'}</span>
            </button>
          </div>
        </div>

        {/* 4 Step Progress Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-6">
          {[
            { num: 1, title: { vi: '1. Alice gửi 100 Vàng', en: '1. Alice deposits 100 Gold' }, action: handleStep1 },
            { num: 2, title: { vi: '2. Alice trả 100 Giấy cho Bob', en: '2. Alice pays 100 Cert to Bob' }, action: handleStep2 },
            { num: 3, title: { vi: '3. Goldsmith lén in thêm 100', en: '3. Goldsmith covertly prints 100' }, action: handleStep3 },
            { num: 4, title: { vi: '4. Khủng hoảng niềm tin (Run)', en: '4. Trust Breakdown (Bank Run)' }, action: handleStep4 },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={s.action}
              className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                step === s.num
                  ? 'bg-white/[0.06] border-border-primary text-text-primary ring-1 ring-white/10'
                  : step > s.num
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : 'bg-[#05070c] border-slate-900 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900">
                  BƯỚC 0{s.num}
                </span>
                {step > s.num && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
              </div>
              <span className="text-xs font-mono font-bold mt-2">{s.title[language]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Simulation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Visual Vault & Actors */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl space-y-6">
          {/* Top: The Central Custodian (Goldsmith) */}
          <div className={`p-4 rounded-xl border transition-all ${
            isFractionalReserveExceeded
              ? 'bg-rose-950/20 border-rose-500/40 shadow-rose-950/30'
              : 'bg-[#05070c] border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white uppercase">
                    {language === 'vi' ? '🏛️ THỢ KIM HOÀN (GOLDSMITH - BÊN TRUNG GIAN)' : '🏛️ GOLDSMITH (THE CUSTODIAN)'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === 'vi' ? 'Quản lý Két vàng vật lý & Độc quyền phát hành Giấy nợ' : 'Controls Vault Gold & Issues Paper Certificates'}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right font-mono">
                {isFractionalReserveExceeded ? (
                  <span className="px-2 py-1 rounded bg-rose-500/20 border border-rose-500 text-rose-400 text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? 'ĐÃ PHÁT HÀNH KHỐNG' : 'OVER-ISSUED'}</span>
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-white/[0.04] border border-border-primary text-text-primary text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? 'DỰ TRỮ 100%' : '100% BACKED'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Vault Balance Display */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
              <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" />
                  <span>{language === 'vi' ? 'VÀNG THẬT TRONG KÉT' : 'PHYSICAL GOLD'}</span>
                </div>
                <div className="text-lg font-bold font-mono text-amber-400 mt-1">{vaultGold} VÀNG (GOLD)</div>
              </div>

              <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-text-muted" />
                  <span>{language === 'vi' ? 'TỔNG CHỨNG CHỈ ĐÃ IN' : 'TOTAL CERTIFICATES'}</span>
                </div>
                <div className={`text-lg font-bold font-mono mt-1 ${
                  isFractionalReserveExceeded ? 'text-rose-400 animate-pulse' : 'text-success'
                }`}>
                  {totalPaperClaims} CHỨNG CHỈ
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800 col-span-2 sm:col-span-1">
                <div className="text-[10px] font-mono text-slate-500">
                  {language === 'vi' ? 'TỶ LỆ BẢO CHỨNG' : 'BACKING RATIO'}
                </div>
                <div className={`text-lg font-bold font-mono mt-1 ${
                  totalPaperClaims > 0 ? (vaultGold / totalPaperClaims < 1 ? 'text-rose-400' : 'text-success') : 'text-slate-400'
                }`}>
                  {totalPaperClaims > 0 ? Math.round((vaultGold / totalPaperClaims) * 100) : 100}%
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: 3 Alphabetical Actors (Alice, Bob, Charlie) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Alice */}
            <div className="p-4 rounded-xl bg-[#05070c] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
                    A
                  </div>
                  <span className="font-mono font-bold text-xs text-white">Alice (Depositor)</span>
                </div>
              </div>
              <div className="space-y-1 pt-1 text-xs font-mono">
                <div className="text-slate-400 text-[11px]">{language === 'vi' ? 'Sở hữu ban đầu:' : 'Initial asset:'}</div>
                <div className="text-slate-200">💰 0 Gold</div>
                <div className="text-text-primary font-bold">📜 {aliceCert} Paper Cert</div>
              </div>
            </div>

            {/* 2. Bob */}
            <div className="p-4 rounded-xl bg-[#05070c] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.08] text-text-primary flex items-center justify-center font-bold text-xs">
                    B
                  </div>
                  <span className="font-mono font-bold text-xs text-white">Bob (Merchant)</span>
                </div>
              </div>
              <div className="space-y-1 pt-1 text-xs font-mono">
                <div className="text-slate-400 text-[11px]">{language === 'vi' ? 'Nhận từ Alice:' : 'Received from Alice:'}</div>
                <div className="text-slate-200">💰 0 Gold</div>
                <div className="text-text-primary font-bold">📜 {bobCert} Paper Cert</div>
              </div>
            </div>

            {/* 3. Charlie */}
            <div className="p-4 rounded-xl bg-[#05070c] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    C
                  </div>
                  <span className="font-mono font-bold text-xs text-white">Charlie (Borrower)</span>
                </div>
              </div>
              <div className="space-y-1 pt-1 text-xs font-mono">
                <div className="text-slate-400 text-[11px]">{language === 'vi' ? 'Vay từ Goldsmith:' : 'Loaned from Goldsmith:'}</div>
                <div className="text-slate-200">💰 0 Gold</div>
                <div className={`font-bold ${charlieCert > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                  📜 {charlieCert} Paper Cert (Khống)
                </div>
              </div>
            </div>
          </div>

          {/* Step Action Controllers */}
          <div className="p-4 rounded-xl bg-[#05070c] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-300">
              {step === 1 && (language === 'vi' ? 'Bước 1: Alice đã gửi 100 Vàng và cầm 100 Giấy chứng nhận.' : 'Step 1: Alice deposited 100 Gold, holds 100 Cert.')}
              {step === 2 && (language === 'vi' ? 'Bước 2: Alice chuyển 100 Giấy chứng nhận cho Bob để thanh toán.' : 'Step 2: Alice transferred 100 Cert to Bob for trade.')}
              {step === 3 && (language === 'vi' ? 'Bước 3: Goldsmith lén in thêm 100 Giấy khống cho Charlie vay.' : 'Step 3: Goldsmith covertly printed 100 unbacked Certs to Charlie.')}
              {step === 4 && (language === 'vi' ? 'Bước 4: Bob & Charlie cùng đến rút vàng! Chỉ có 100 vàng cho 200 giấy!' : 'Step 4: Bank Run! Only 100 Gold exists for 200 paper claims!')}
            </div>

            <div className="flex items-center gap-2">
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1) handleStep2();
                    else if (step === 2) handleStep3();
                    else if (step === 3) handleStep4();
                  }}
 className="px-4 py-2 rounded-lg bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <span>{language === 'vi' ? 'Tiếp tục diễn biến →' : 'Next Step →'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
                >
                  {language === 'vi' ? 'Làm lại từ đầu' : 'Restart Simulation'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Educational Breakdown Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-text-primary uppercase">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'vi' ? 'BÀI HỌC VỀ NIỀM TIN' : 'TRUST LESSON'}</span>
            </div>

            {step < 4 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">
                  {language === 'vi'
                    ? 'Tại sao Thợ kim hoàn lại dám in khống giấy?'
                    : 'Why did the Goldsmith over-issue paper?'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'vi'
                    ? 'Thợ kim hoàn quan sát thấy rằng người dân thích dùng Giấy chứng nhận để trao đổi hơn là mang vàng nặng. Rất hiếm khi tất cả mọi người cùng đến rút vàng trong một ngày.'
                    : 'The custodian noticed that people preferred trading paper receipts. Rarely did everyone withdraw physical gold on the same day.'}
                </p>
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                  <div className="font-bold font-mono flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? 'Cám dỗ quyền lực trung gian:' : 'Intermediary Temptation:'}</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    {language === 'vi'
                      ? 'Bên trung gian có thể âm thầm tạo ra tiền từ hư vô để cho vay lấy lãi, vì KHÔNG AI CÓ THỂ KIỂM TOÁN két sắt của họ.'
                      : 'The intermediary can create unbacked claims from thin air, as NOBODY CAN INDEPENDENTLY AUDIT their vault.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-fadeIn">
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono uppercase">
                    <Flame className="w-4 h-4" />
                    <span>{language === 'vi' ? '⚠ KHỦNG HOẢNG NIỀM TIN (BANK RUN)' : '⚠ TRUST BREAKDOWN'}</span>
                  </div>
                  <p className="text-xs text-rose-200 leading-relaxed">
                    {language === 'vi'
                      ? 'Khi tin đồn lộ ra, Bob và Charlie cùng mang 200 giấy đến rút vàng. Két chỉ có 100 vàng thật. Hệ thống sụp đổ, người rút sau mất trắng!'
                      : 'When word spread, both rushed to withdraw. Only 100 gold existed for 200 paper claims. The system collapsed!'}
                  </p>
                </div>

                <div className="space-y-1 text-xs text-slate-300 pt-1">
                  <div className="font-bold text-white">{language === 'vi' ? 'Kết luận cốt lõi:' : 'Core Takeaway:'}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {language === 'vi'
                      ? 'Hệ thống dựa trên "Sự tin tưởng vào con người/tổ chức trung gian" luôn mang rủi ro gian lận và sụp đổ. Blockchain ra đời để thay thế sự tin tưởng mù quáng đó bằng "Toán học & Mật mã học có thể tự kiểm toán công khai".'
                      : 'Systems relying on human trust carry systemic failure risk. Blockchain replaces blind trust with publicly verifiable cryptography.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {onPrevStage && (
              <button
                type="button"
                onClick={onPrevStage}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-400 cursor-pointer"
              >
                {language === 'vi' ? '← Quay lại Phần 01' : '← Back to Part 01'}
              </button>
            )}
            {onNextStage && (
              <button
                type="button"
                onClick={onNextStage}
 className="px-4 py-2 rounded-xl bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ml-auto shadow-md"
              >
                <span>{language === 'vi' ? 'Tiếp: Phần 03 · Mô Hình Mạng' : 'Next: Part 03 · Network Topologies'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
