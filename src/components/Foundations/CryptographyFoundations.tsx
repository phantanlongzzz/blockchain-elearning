import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Binary,
  Cpu,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
  Unlock,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  Layers,
  Key,
  Database,
  Search,
} from 'lucide-react';
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
  const { strings, language } = useLanguage();

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
  const [simulatedPrivateKey, setSimulatedPrivateKey] = useState<string>('priv_key_alice_secret_9981');
  const [isSigned, setIsSigned] = useState<boolean>(true);
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
      <div className="p-5 rounded-xl bg-[#090a0f] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-zinc-500 font-medium">
            {language === 'vi'
              ? 'Giai đoạn 05 · Nền tảng mật mã học'
              : 'Stage 05 · Cryptographic Foundations'}
          </div>
          <h3 className="text-lg font-semibold text-zinc-100">
            {language === 'vi'
              ? 'Mật mã học nền tảng trong Blockchain'
              : 'Fundamental Cryptography in Blockchain'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            {language === 'vi'
              ? 'Khám phá 4 trụ cột toán học giúp bảo vệ tính toàn vẹn, xác thực danh tính và ngăn chặn gian lận trong mạng lưới Blockchain.'
              : 'Explore the 4 mathematical pillars ensuring data integrity, transaction authentication, and fraud prevention.'}
          </p>
        </div>

        <a
          href="#hash-generator"
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>{language === 'vi' ? 'Mở Lab SHA-256' : 'Open SHA-256 Lab'}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 4 Foundation Concept Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab(0);
            onInteracted?.();
          }}
          className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-2.5 ${
            activeTab === 0
              ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
              : 'bg-[#090a0f] border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Binary className="w-4 h-4 shrink-0 text-zinc-400" />
          <div>
            <div className="text-xs font-mono font-medium text-zinc-200">1. Hàm Băm & SHA-256</div>
            <div className="text-[10px] text-zinc-500 truncate">Dấu vân tay số 256-bit</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab(1);
            onInteracted?.();
          }}
          className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-2.5 ${
            activeTab === 1
              ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
              : 'bg-[#090a0f] border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4 shrink-0 text-zinc-400" />
          <div>
            <div className="text-xs font-mono font-medium text-zinc-200">2. Chữ Ký Số</div>
            <div className="text-[10px] text-zinc-500 truncate">Xác thực quyền sở hữu</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab(2);
            onInteracted?.();
          }}
          className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-2.5 ${
            activeTab === 2
              ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
              : 'bg-[#090a0f] border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Key className="w-4 h-4 shrink-0 text-zinc-400" />
          <div>
            <div className="text-xs font-mono font-medium text-zinc-200">3. Khóa Public & Private</div>
            <div className="text-[10px] text-zinc-500 truncate">Cặp khóa bất đối xứng</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab(3);
            onInteracted?.();
          }}
          className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-2.5 ${
            activeTab === 3
              ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
              : 'bg-[#090a0f] border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0 text-zinc-400" />
          <div>
            <div className="text-xs font-mono font-medium text-zinc-200">4. Sơ Đồ Cây Liên Kết</div>
            <div className="text-[10px] text-zinc-500 truncate">Ứng dụng vào Blockchain</div>
          </div>
        </button>
      </div>

      {/* Tab 0: Hash Function & SHA-256 + Live Avalanche Demo */}
      {activeTab === 0 && (
        <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-5">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-zinc-100">
              {language === 'vi'
                ? 'Hàm băm mật mã học & Thuật toán SHA-256'
                : 'Cryptographic Hash Functions & SHA-256'}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {language === 'vi'
                ? 'Hàm băm là một thuật toán toán học biến đổi bất kỳ dữ liệu đầu vào nào thành chuỗi bản băm 256-bit cố định (64 ký tự Hex). Cùng một đầu vào luôn cho ra đúng một kết quả duy nhất.'
                : 'A cryptographic hash function maps arbitrary input data to a fixed 256-bit digest (64 hex characters). Deterministic: identical input always produces identical output.'}
            </p>
          </div>

          {/* Interactive Avalanche Comparison Box */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-zinc-200 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {language === 'vi'
                    ? 'Thực nghiệm: Hiệu ứng thác đổ (Avalanche Effect)'
                    : 'Avalanche Effect Experiment'}
                </span>
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                {language === 'vi' ? 'Thử đổi chữ H thành h bên dưới:' : 'Compare "Hello" vs "hello":'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Input A */}
              <div className="p-3 rounded-lg bg-black/40 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>ĐẦU VÀO A</span>
                  <span className="text-zinc-300">Chữ H hoa</span>
                </div>
                <input
                  type="text"
                  value={avalancheInputA}
                  onChange={(e) => setAvalancheInputA(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-500"
                />
                <div className="space-y-1 font-mono text-[10px]">
                  <span className="text-zinc-500">SHA-256 Digest:</span>
                  <div className="p-1.5 rounded bg-zinc-900 text-zinc-300 break-all font-mono border border-zinc-800">
                    {hashA}
                  </div>
                </div>
              </div>

              {/* Input B */}
              <div className="p-3 rounded-lg bg-black/40 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>ĐẦU VÀO B</span>
                  <span className="text-zinc-300">Chữ h thường</span>
                </div>
                <input
                  type="text"
                  value={avalancheInputB}
                  onChange={(e) => setAvalancheInputB(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-500"
                />
                <div className="space-y-1 font-mono text-[10px]">
                  <span className="text-zinc-500">SHA-256 Digest:</span>
                  <div className="p-1.5 rounded bg-zinc-900 text-zinc-300 break-all font-mono border border-zinc-800">
                    {hashB}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {language === 'vi'
                ? 'Quan sát: Chỉ thay đổi 1 ký tự ("H" → "h") làm cho 100% bản băm đầu ra thay đổi hoàn toàn. Đây là lý do Blockchain phát hiện giả mạo ngay lập tức.'
                : 'Observation: Changing just 1 character completely shifts the output hash. This property is why Blockchain detects any minor tamper instantly.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 1: Digital Signature */}
      {activeTab === 1 && (
        <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-5">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-zinc-100">
              {language === 'vi' ? 'Chữ ký số (Digital Signature)' : 'Digital Signatures'}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {language === 'vi'
                ? 'Chữ ký số là bằng chứng toán học chứng minh giao dịch được tạo bởi chính chủ sở hữu tài khoản: "Khóa Bí Mật dùng để Ký — Khóa Công Khai dùng để Kiểm Tra".'
                : 'A digital signature provides mathematical proof of authorization: "Private Key signs, Public Key verifies".'}
            </p>
          </div>

          {/* Interactive Signature Workflow */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono font-medium text-zinc-200 uppercase flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  {language === 'vi'
                    ? 'Quy trình ký & xác minh giao dịch'
                    : 'Signing & Verification Flow'}
                </span>
              </span>

              <button
                type="button"
                onClick={() => setIsTamperingMessage(!isTamperingMessage)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer border ${
                  isTamperingMessage
                    ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
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
              <div className="p-3 rounded-lg bg-black/40 border border-zinc-800 space-y-1.5">
                <span className="text-[10px] text-zinc-500 uppercase block font-medium">
                  1. GIAO DỊCH (MESSAGE)
                </span>
                <div
                  className={`p-2 rounded font-mono text-xs ${
                    isTamperingMessage
                      ? 'bg-rose-950/30 text-rose-300 border border-rose-500/30'
                      : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {isTamperingMessage
                    ? 'Alice -> Hacker: 999 BTC'
                    : sigMessage}
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-lg bg-black/40 border border-zinc-800 space-y-1.5">
                <span className="text-[10px] text-zinc-500 uppercase block font-medium">
                  2. KÝ BẰNG PRIVATE KEY
                </span>
                <div className="p-2 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 truncate font-mono text-xs">
                  Sig: {digitalSignature}...
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`p-3 rounded-lg border space-y-1.5 ${
                  isSigValid
                    ? 'bg-black/40 border-zinc-800 text-zinc-200'
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500">
                  <span>3. PUBLIC KEY XÁC MINH</span>
                  <span className={isSigValid ? 'text-emerald-400' : 'text-rose-400'}>
                    {isSigValid ? 'VALID ✓' : 'REJECTED ✗'}
                  </span>
                </div>
                <div className="p-2 rounded bg-zinc-900 text-xs font-medium flex items-center gap-1.5">
                  {isSigValid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-emerald-400">Hợp lệ: Đúng chữ ký của Alice</span>
                    </>
                  ) : (
                    <>
                      <span className="text-rose-400 font-bold">✕</span>
                      <span className="text-rose-400">Từ chối: Chữ ký không khớp!</span>
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
        <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-5">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-zinc-100">
              {language === 'vi'
                ? 'Cặp khóa bất đối xứng (Public & Private Key)'
                : 'Asymmetric Key Pairs (Public & Private Keys)'}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {language === 'vi'
                ? 'Mỗi người dùng trong Blockchain sở hữu một cặp khóa mật mã học gắn liền nhau bằng thuật toán đường cong elip.'
                : 'Every participant owns a mathematically linked cryptographic key pair generated via elliptic curves.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Public Key Card */}
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-zinc-200 uppercase flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Khóa công khai</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Chia sẻ công khai
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {language === 'vi'
                  ? 'Tương tự như Số tài khoản ngân hàng. Bạn có thể gửi cho bất kỳ ai để nhận tiền và người khác dùng để kiểm tra chữ ký giao dịch.'
                  : 'Similar to an IBAN/Account Number. Shared publicly to receive funds and verify transaction signatures.'}
              </p>

              <div className="p-2 rounded bg-black/40 border border-zinc-800 font-mono text-[11px] text-zinc-400 truncate">
                0x048b2a19c... (Địa chỉ ví công khai)
              </div>
            </div>

            {/* Private Key Card */}
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-zinc-200 uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Khóa riêng (Private Key)</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-amber-400 border border-zinc-700">
                  Tuyệt mật 100%
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {language === 'vi'
                  ? 'Tương tự như Mã PIN hoặc chữ ký cá nhân. Tuyệt đối không chia sẻ. Ai có Private Key đều có toàn quyền kiểm soát số dư của ví.'
                  : 'Like a master PIN code or legal signature. Keep completely secret. Anyone with your Private Key can transfer all funds.'}
              </p>

              <div className="p-2 rounded bg-black/40 border border-zinc-800 font-mono text-[11px] text-amber-400 truncate">
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
        <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-4">
          <div className="text-sm font-semibold text-zinc-100">
            {language === 'vi'
              ? 'Sơ đồ cây: Mật mã học tạo nên Blockchain'
              : 'Concept Tree: How Cryptography Constructs Blockchain'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-zinc-300 uppercase block">
                1. Tính toàn vẹn (Integrity)
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {language === 'vi'
                  ? 'Được đảm bảo bởi Hàm băm SHA-256 và Con trỏ băm (Hash Pointer). Mọi can thiệp đều bị phát hiện ngay lập tức.'
                  : 'Guaranteed by SHA-256 and Hash Pointers. Any tampering is immediately exposed.'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-zinc-300 uppercase block">
                2. Tính xác thực (Authentication)
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {language === 'vi'
                  ? 'Được đảm bảo bởi Chữ ký số (ECDSA). Chỉ người sở hữu Private Key mới có thể tạo giao dịch hợp lệ.'
                  : 'Guaranteed by Digital Signatures (ECDSA). Only the private key owner can authorize valid transactions.'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-zinc-300 uppercase block">
                3. Tính bất biến (Immutability)
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {language === 'vi'
                  ? 'Kết hợp chuỗi khối băm với mạng phân tán P2P và cơ chế đồng thuận (Proof of Work / Proof of Stake).'
                  : 'Formed by combining hash-linked blocks with distributed peer-to-peer consensus.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-mono text-zinc-500">
          {language === 'vi'
            ? 'Tiếp theo: Chạy mô phỏng toàn cảnh 8 bước từ Dữ Liệu Đến Blockchain'
            : 'Next: Run the master 8-step simulation From Data to Blockchain'}
        </span>

        <button
          type="button"
          onClick={onNextStage}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-semibold font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span>
            {language === 'vi'
              ? 'Tiếp tục sang Mô Phỏng Toàn Cảnh'
              : 'Continue to Master Pipeline'}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
