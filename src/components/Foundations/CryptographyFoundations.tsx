import React, { useState, useMemo } from 'react';
import { Binary, Cpu, ArrowRight, ExternalLink, Lock, Unlock, CheckCircle2, FileCheck2, Layers, Key } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { fastSha256Hex } from '../../utils/sha256';
import { PublicKeyVsPrimaryKey } from './PublicKeyVsPrimaryKey';

interface CryptographyFoundationsProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
}

export const CryptographyFoundations: React.FC<CryptographyFoundationsProps> = ({
  onInteracted,
  onNextStage,
}) => {
  const { language } = useLanguage();

  // Active Primitive Tab: 0 = Hash & SHA-256, 1 = Digital Signature, 2 = Public & Private Key, 3 = Concept Map
  const [activeTab, setActiveTab] = useState<number>(0);

  // Live Avalanche Simulator Inputs
  const [avalancheInputA, setAvalancheInputA] = useState<string>('Hello');
  const [avalancheInputB, setAvalancheInputB] = useState<string>('hello');

  // Compute live hashes for Avalanche Demo
  const hashA = useMemo(() => {
    try {
      return fastSha256Hex(avalancheInputA);
    } catch {
      return '';
    }
  }, [avalancheInputA]);

  const hashB = useMemo(() => {
    try {
      return fastSha256Hex(avalancheInputB);
    } catch {
      return '';
    }
  }, [avalancheInputB]);

  // Live Digital Signature Interactive Playground
  const [sigMessage, setSigMessage] = useState<string>('Alice -> Bob: 10 BTC');
  const [simulatedPrivateKey] = useState<string>('priv_key_alice_secret_9981');
  const [isTamperingMessage, setIsTamperingMessage] = useState<boolean>(false);

  const digitalSignature = useMemo(() => {
    try {
      return fastSha256Hex(`${sigMessage}+${simulatedPrivateKey}`).slice(0, 32);
    } catch {
      return '';
    }
  }, [sigMessage, simulatedPrivateKey]);

  const isSigValid = !isTamperingMessage;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0B101E]/60 backdrop-blur-md border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="space-y-1">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            {language === 'vi'
              ? 'Giai đoạn 05 · Nền tảng mật mã học'
              : 'Stage 05 · Cryptographic Foundations'}
          </div>
          <h3 className="text-lg font-bold text-white font-sans">
            {language === 'vi'
              ? 'Mật mã học nền tảng trong Blockchain'
              : 'Fundamental Cryptography in Blockchain'}
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed font-sans">
            {language === 'vi'
              ? 'Khám phá 4 trụ cột toán học giúp bảo vệ tính toàn vẹn, xác thực danh tính và ngăn chặn gian lận trong mạng lưới Blockchain.'
              : 'Explore the 4 mathematical pillars ensuring data integrity, transaction authentication, and fraud prevention.'}
          </p>
        </div>

        <a
          href="#hash-generator"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/30 hover:text-white transition-all self-start sm:self-auto cursor-pointer"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'vi' ? 'Mở Lab SHA-256' : 'Open SHA-256 Lab'}</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>

      {/* 4 Foundation Concept Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab(0);
            onInteracted?.();
          }}
          className={`text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeTab === 0
              ? 'bg-gradient-to-b from-cyan-500/15 via-[#0B1220]/80 to-[#080D1A]/90 backdrop-blur-md border border-cyan-500/40 shadow-[0_0_20px_rgba(0,210,255,0.15)] rounded-xl p-3.5'
              : 'bg-[#0B101E]/50 backdrop-blur-sm border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03] rounded-xl p-3.5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Binary className={`w-4 h-4 shrink-0 ${activeTab === 0 ? 'text-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.8)]' : 'text-slate-400'}`} />
          <div>
            <div className={`text-xs font-sans font-semibold ${activeTab === 0 ? 'text-white' : 'text-slate-300'}`}>1. Hàm Băm & SHA-256</div>
            <div className={`text-[11px] font-sans truncate ${activeTab === 0 ? 'text-cyan-300/70' : 'text-slate-400'}`}>Dấu vân tay số 256-bit</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab(1);
            onInteracted?.();
          }}
          className={`text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeTab === 1
              ? 'bg-gradient-to-b from-cyan-500/15 via-[#0B1220]/80 to-[#080D1A]/90 backdrop-blur-md border border-cyan-500/40 shadow-[0_0_20px_rgba(0,210,255,0.15)] rounded-xl p-3.5'
              : 'bg-[#0B101E]/50 backdrop-blur-sm border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03] rounded-xl p-3.5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck2 className={`w-4 h-4 shrink-0 ${activeTab === 1 ? 'text-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.8)]' : 'text-slate-400'}`} />
          <div>
            <div className={`text-xs font-sans font-semibold ${activeTab === 1 ? 'text-white' : 'text-slate-300'}`}>2. Chữ Ký Số</div>
            <div className={`text-[11px] font-sans truncate ${activeTab === 1 ? 'text-cyan-300/70' : 'text-slate-400'}`}>Xác thực quyền sở hữu</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab(2);
            onInteracted?.();
          }}
          className={`text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeTab === 2
              ? 'bg-gradient-to-b from-cyan-500/15 via-[#0B1220]/80 to-[#080D1A]/90 backdrop-blur-md border border-cyan-500/40 shadow-[0_0_20px_rgba(0,210,255,0.15)] rounded-xl p-3.5'
              : 'bg-[#0B101E]/50 backdrop-blur-sm border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03] rounded-xl p-3.5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className={`w-4 h-4 shrink-0 ${activeTab === 2 ? 'text-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.8)]' : 'text-slate-400'}`} />
          <div>
            <div className={`text-xs font-sans font-semibold ${activeTab === 2 ? 'text-white' : 'text-slate-300'}`}>3. Khóa Public & Private</div>
            <div className={`text-[11px] font-sans truncate ${activeTab === 2 ? 'text-cyan-300/70' : 'text-slate-400'}`}>Cặp khóa bất đối xứng</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab(3);
            onInteracted?.();
          }}
          className={`text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeTab === 3
              ? 'bg-gradient-to-b from-cyan-500/15 via-[#0B1220]/80 to-[#080D1A]/90 backdrop-blur-md border border-cyan-500/40 shadow-[0_0_20px_rgba(0,210,255,0.15)] rounded-xl p-3.5'
              : 'bg-[#0B101E]/50 backdrop-blur-sm border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03] rounded-xl p-3.5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className={`w-4 h-4 shrink-0 ${activeTab === 3 ? 'text-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.8)]' : 'text-slate-400'}`} />
          <div>
            <div className={`text-xs font-sans font-semibold ${activeTab === 3 ? 'text-white' : 'text-slate-300'}`}>4. Sơ Đồ Cây Liên Kết</div>
            <div className={`text-[11px] font-sans truncate ${activeTab === 3 ? 'text-cyan-300/70' : 'text-slate-400'}`}>Ứng dụng vào Blockchain</div>
          </div>
        </button>
      </div>

      {/* Tab 0: Hash Function & SHA-256 + Live Avalanche Demo */}
      {activeTab === 0 && (
        <div className="p-6 rounded-2xl bg-[#0B101E]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.5)] space-y-5">
          <div>
            <h4 className="text-base font-sans font-bold text-white mb-1">
              {language === 'vi'
                ? 'Hàm băm mật mã học & Thuật toán SHA-256'
                : 'Cryptographic Hash Functions & SHA-256'}
            </h4>
            <p className="text-xs font-sans text-slate-400 leading-relaxed mb-4">
              {language === 'vi'
                ? 'Hàm băm là một thuật toán toán học biến đổi bất kỳ dữ liệu đầu vào nào thành chuỗi bản băm 256-bit cố định (64 ký tự Hex). Cùng một đầu vào luôn cho ra đúng một kết quả duy nhất.'
                : 'A cryptographic hash function maps arbitrary input data to a fixed 256-bit digest (64 hex characters). Deterministic: identical input always produces identical output.'}
            </p>
          </div>

          {/* Frosted Glass Experiment Plate */}
          <div className="bg-black/35 backdrop-blur-md border border-white/[0.06] rounded-xl p-5 relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
              <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>
                  {language === 'vi'
                    ? 'Thử nghiệm: Hiệu ứng Thác đổ'
                    : 'Experiment: Avalanche Effect'}
                </span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {language === 'vi' ? 'Độ nhạy phân tán bit' : 'Bit dispersion sensitivity'}
              </span>
            </div>

            {/* 2-Column Diff Hash Inspector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input A */}
              <div className="bg-[#0E1526]/70 border border-white/[0.07] hover:border-cyan-500/25 rounded-xl p-4 transition-all space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-xs font-semibold text-slate-300">Đầu vào A</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                    Chữ &quot;H&quot; hoa
                  </span>
                </div>
                <input
                  type="text"
                  value={avalancheInputA}
                  onChange={(e) => setAvalancheInputA(e.target.value)}
                  className="w-full bg-black/50 border border-white/[0.08] focus:border-cyan-400/60 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none transition-colors"
                />
                <span className="text-[10px] font-sans font-medium text-slate-400 uppercase tracking-wider mt-3 mb-1 block">
                  Mã băm SHA-256
                </span>
                <div className="bg-black/60 border border-white/[0.06] rounded-lg p-2.5 font-mono text-xs leading-relaxed break-all select-all text-slate-300">
                  {hashA}
                </div>
              </div>

              {/* Input B */}
              <div className="bg-[#0E1526]/70 border border-white/[0.07] hover:border-cyan-500/25 rounded-xl p-4 transition-all space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-xs font-semibold text-slate-300">Đầu vào B</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                    Chữ &quot;h&quot; thường
                  </span>
                </div>
                <input
                  type="text"
                  value={avalancheInputB}
                  onChange={(e) => setAvalancheInputB(e.target.value)}
                  className="w-full bg-black/50 border border-white/[0.08] focus:border-cyan-400/60 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none transition-colors"
                />
                <span className="text-[10px] font-sans font-medium text-slate-400 uppercase tracking-wider mt-3 mb-1 block">
                  Mã băm SHA-256
                </span>
                <div className="bg-black/60 border border-white/[0.06] rounded-lg p-2.5 font-mono text-xs leading-relaxed break-all select-all text-cyan-300 font-medium">
                  {hashB}
                </div>
              </div>
            </div>

            {/* Crypto Accuracy Callout */}
            <div className="mt-4 p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs font-sans text-slate-300 flex items-center gap-2">
              <span className="text-cyan-400 font-semibold font-mono whitespace-nowrap">Hiệu ứng Thác đổ:</span>
              <span>
                Chỉ thay đổi 1 bit đầu vào khiến xấp xỉ <strong className="text-white font-mono">50% số bit</strong> trong mã băm bị đảo ngẫu nhiên, ngăn chặn hoàn toàn việc suy ngược dữ liệu gốc.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Digital Signature */}
      {activeTab === 1 && (
        <div className="p-6 rounded-2xl bg-[#0B101E]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.5)] space-y-5">
          <div>
            <h4 className="text-base font-sans font-bold text-white mb-1">
              {language === 'vi' ? 'Chữ ký số (Digital Signature)' : 'Digital Signatures'}
            </h4>
            <p className="text-xs font-sans text-slate-400 leading-relaxed mb-4">
              {language === 'vi'
                ? 'Chữ ký số là bằng chứng toán học chứng minh giao dịch được tạo bởi chính chủ sở hữu tài khoản: "Khóa Bí Mật dùng để Ký — Khóa Công Khai dùng để Kiểm Tra".'
                : 'A digital signature provides mathematical proof of authorization: "Private Key signs, Public Key verifies".'}
            </p>
          </div>

          {/* Interactive Signature Workflow */}
          <div className="bg-black/35 backdrop-blur-md border border-white/[0.06] rounded-xl p-5 relative space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
              <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {language === 'vi'
                    ? 'Quy trình ký & xác minh giao dịch'
                    : 'Signing & Verification Flow'}
                </span>
              </span>

              <button
                type="button"
                onClick={() => setIsTamperingMessage(!isTamperingMessage)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer border ${
                  isTamperingMessage
                    ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.08] hover:border-cyan-500/30'
                }`}
              >
                {isTamperingMessage
                  ? language === 'vi'
                    ? 'Đang giả mạo nội dung (Sửa)'
                    : 'Message Tampered'
                  : language === 'vi'
                  ? 'Thử can thiệp nội dung'
                  : 'Simulate Message Tampering'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-[#0E1526]/70 border border-white/[0.07] space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase block font-sans font-medium">
                  1. GIAO DỊCH (MESSAGE)
                </span>
                <div
                  className={`p-2 rounded font-mono text-xs ${
                    isTamperingMessage
                      ? 'bg-rose-950/30 text-rose-300 border border-rose-500/30'
                      : 'bg-black/50 text-cyan-300 border border-white/[0.06]'
                  }`}
                >
                  {isTamperingMessage
                    ? 'Alice -> Hacker: 999 BTC'
                    : sigMessage}
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-[#0E1526]/70 border border-white/[0.07] space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase block font-sans font-medium">
                  2. KÝ BẰNG PRIVATE KEY
                </span>
                <div className="p-2 rounded bg-black/50 text-slate-300 border border-white/[0.06] truncate font-mono text-xs">
                  Sig: {digitalSignature}...
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  isSigValid
                    ? 'bg-[#0E1526]/70 border-white/[0.07] text-slate-200'
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-sans font-medium text-slate-400">
                  <span>3. PUBLIC KEY XÁC MINH</span>
                  <span className={isSigValid ? 'text-cyan-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {isSigValid ? 'VALID ✓' : 'REJECTED ✗'}
                  </span>
                </div>
                <div className="p-2 rounded bg-black/50 text-xs font-medium flex items-center gap-1.5 border border-white/[0.05]">
                  {isSigValid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-cyan-300 font-sans text-xs">Hợp lệ: Đúng chữ ký của Alice</span>
                    </>
                  ) : (
                    <>
                      <span className="text-rose-400 font-bold">✕</span>
                      <span className="text-rose-400 font-sans text-xs">Từ chối: Chữ ký không khớp!</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Public Key & Private Key */}
      {activeTab === 2 && (
        <div className="p-6 rounded-2xl bg-[#0B101E]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.5)] space-y-5">
          <div>
            <h4 className="text-base font-sans font-bold text-white mb-1">
              {language === 'vi'
                ? 'Cặp khóa bất đối xứng (Public & Private Key)'
                : 'Asymmetric Key Pairs (Public & Private Keys)'}
            </h4>
            <p className="text-xs font-sans text-slate-400 leading-relaxed mb-4">
              {language === 'vi'
                ? 'Mỗi người dùng trong Blockchain sở hữu một cặp khóa mật mã học gắn liền nhau bằng thuật toán đường cong elip.'
                : 'Every participant owns a mathematically linked cryptographic key pair generated via elliptic curves.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Public Key Card */}
            <div className="p-4 rounded-xl bg-[#0E1526]/70 border border-white/[0.07] hover:border-cyan-500/25 transition-all space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-semibold text-slate-200 flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Khóa công khai (Public Key)</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Chia sẻ công khai
                </span>
              </div>

              <p className="text-xs font-sans text-slate-300 leading-relaxed">
                {language === 'vi'
                  ? 'Tương tự như Số tài khoản ngân hàng. Bạn có thể gửi cho bất kỳ ai để nhận tiền và người khác dùng để kiểm tra chữ ký giao dịch.'
                  : 'Similar to an IBAN/Account Number. Shared publicly to receive funds and verify transaction signatures.'}
              </p>

              <div className="p-2 rounded bg-black/50 border border-white/[0.05] font-mono text-[11px] text-cyan-300 truncate">
                0x048b2a19c... (Địa chỉ ví công khai)
              </div>
            </div>

            {/* Private Key Card */}
            <div className="p-4 rounded-xl bg-[#0E1526]/70 border border-white/[0.07] hover:border-amber-500/25 transition-all space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-semibold text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Khóa riêng (Private Key)</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Tuyệt mật 100%
                </span>
              </div>

              <p className="text-xs font-sans text-slate-300 leading-relaxed">
                {language === 'vi'
                  ? 'Tương tự như Mã PIN hoặc chữ ký cá nhân. Tuyệt đối không chia sẻ. Ai có Private Key đều có toàn quyền kiểm soát số dư của ví.'
                  : 'Like a master PIN code or legal signature. Keep completely secret. Anyone with your Private Key can transfer all funds.'}
              </p>

              <div className="p-2 rounded bg-black/50 border border-white/[0.05] font-mono text-[11px] text-amber-400 truncate">
                5Kb8kLf9zg... (Secret Key · Không chia sẻ)
              </div>
            </div>
          </div>

          {/* Comparison Section: Public Key vs Primary Key */}
          <div className="pt-2">
            <PublicKeyVsPrimaryKey />
          </div>
        </div>
      )}

      {/* Tab 3: Concept Tree Map */}
      {activeTab === 3 && (
        <div className="p-6 rounded-2xl bg-[#0B101E]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.5)] space-y-4">
          <h4 className="text-base font-sans font-bold text-white mb-1">
            {language === 'vi'
              ? 'Sơ đồ cây: Mật mã học tạo nên Blockchain'
              : 'Concept Tree: How Cryptography Constructs Blockchain'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            <div className="p-4 rounded-xl bg-[#0E1526]/70 border border-white/[0.07] space-y-1.5">
              <span className="text-[11px] font-sans font-semibold text-cyan-300 uppercase block">
                1. Tính toàn vẹn (Integrity)
              </span>
              <p className="text-xs font-sans text-slate-300 leading-relaxed">
                {language === 'vi'
                  ? 'Được đảm bảo bởi Hàm băm SHA-256 và Con trỏ băm (Hash Pointer). Mọi can thiệp đều bị phát hiện ngay lập tức.'
                  : 'Guaranteed by SHA-256 and Hash Pointers. Any tampering is immediately exposed.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1526]/70 border border-white/[0.07] space-y-1.5">
              <span className="text-[11px] font-sans font-semibold text-cyan-300 uppercase block">
                2. Tính xác thực (Authentication)
              </span>
              <p className="text-xs font-sans text-slate-300 leading-relaxed">
                {language === 'vi'
                  ? 'Được đảm bảo bởi Chữ ký số (ECDSA). Chỉ người sở hữu Private Key mới có thể tạo giao dịch hợp lệ.'
                  : 'Guaranteed by Digital Signatures (ECDSA). Only the private key owner can authorize valid transactions.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1526]/70 border border-white/[0.07] space-y-1.5">
              <span className="text-[11px] font-sans font-semibold text-cyan-300 uppercase block">
                3. Tính bất biến (Immutability)
              </span>
              <p className="text-xs font-sans text-slate-300 leading-relaxed">
                {language === 'vi'
                  ? 'Kết hợp chuỗi khối băm với mạng phân tán P2P và cơ chế đồng thuận (Proof of Work / Proof of Stake).'
                  : 'Formed by combining hash-linked blocks with distributed peer-to-peer consensus.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 mt-6 border-t border-white/[0.06] gap-3">
        <span className="text-xs font-sans text-slate-400">
          {language === 'vi'
            ? 'Tiếp theo: Chạy mô phỏng toàn cảnh 8 bước từ Dữ Liệu Đến Blockchain'
            : 'Next: Run the master 8-step simulation From Data to Blockchain'}
        </span>

        <button
          type="button"
          onClick={onNextStage}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(0,210,255,0.25)] transition-all cursor-pointer"
        >
          <span>
            {language === 'vi'
              ? 'Tiếp tục sang Mô Phỏng Toàn Cảnh →'
              : 'Continue to Master Pipeline →'}
          </span>
        </button>
      </div>
    </div>
  );
};

