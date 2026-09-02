import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { hashSha256, sha256Sync } from '../utils/sha256';
import {
  hexToBinary,
  formatHexBytes,
  calculateHammingDifference,
  stringToUtf8Bytes,
  bytesToHex,
  truncateHashToBits,
} from '../utils/binary';

export const ExperimentLab: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';

  const [activeTab, setActiveTab] = useState<
    'determinism' | 'dispersion' | 'speed' | 'compare' | 'birthday'
  >('determinism');

  // ==========================================
  // Experiment 1: Determinism & Encodings State
  // ==========================================
  const [repInput, setRepInput] = useState('Blockchain Elearning');
  const [repHash, setRepHash] = useState('');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  useEffect(() => {
    hashSha256(repInput).then((res) => setRepHash(res.hex));
  }, [repInput]);

  const copyToClipboard = async (text: string, formatName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const hexToBase64 = (hexStr: string) => {
    if (!hexStr) return '';
    try {
      const match = hexStr.match(/.{1,2}/g);
      if (!match) return '';
      const bytes = new Uint8Array(match.map((byte) => parseInt(byte, 16)));
      return btoa(String.fromCharCode(...bytes));
    } catch {
      return '';
    }
  };

  // ==========================================
  // Experiment 2: Dispersion & Salting State
  // ==========================================
  const [message, setMessage] = useState('Confidential Financial Report');
  const [saltKey, setSaltKey] = useState('SecretSaltKey_DLU');
  const [saltedHash, setSaltedHash] = useState('');

  useEffect(() => {
    hashSha256(`${saltKey}::${message}`).then((res) => setSaltedHash(res.hex));
  }, [message, saltKey]);

  // Compute bit dispersion on the salted hash
  const binaryOfSaltedHash = saltedHash ? hexToBinary(saltedHash) : '';
  const onesCount = binaryOfSaltedHash
    ? (binaryOfSaltedHash.match(/1/g) || []).length
    : 0;
  const zerosCount = binaryOfSaltedHash
    ? (binaryOfSaltedHash.match(/0/g) || []).length
    : 0;
  const onesPercentage = binaryOfSaltedHash ? ((onesCount / 256) * 100).toFixed(1) : '0';
  const zerosPercentage = binaryOfSaltedHash ? ((zerosCount / 256) * 100).toFixed(1) : '0';

  // ==========================================
  // Experiment 3: Hash Rate & Scale Invariance State
  // ==========================================
  const [repeatCount, setRepeatCount] = useState(10);
  const [lengthSampleHash, setLengthSampleHash] = useState('');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<{
    hashesPerSec: number;
    avgTimeUs: number;
    totalMs: number;
    iterations: number;
  } | null>(null);

  useEffect(() => {
    const text = 'DataChunk_'.repeat(repeatCount);
    hashSha256(text).then((res) => setLengthSampleHash(res.hex));
  }, [repeatCount]);

  const runBenchmark = () => {
    setIsBenchmarking(true);
    setTimeout(() => {
      const iterations = 5000;
      const sample = stringToUtf8Bytes('benchmark_payload_sample_data_2026');
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        sha256Sync(sample);
      }
      const end = performance.now();
      const totalMs = end - start;
      const hashesPerSec = Math.round((iterations / (totalMs / 1000)));
      const avgTimeUs = Number(((totalMs / iterations) * 1000).toFixed(2));
      setBenchmarkResult({
        hashesPerSec,
        avgTimeUs,
        totalMs: Number(totalMs.toFixed(1)),
        iterations,
      });
      setIsBenchmarking(false);
    }, 50);
  };

  // ==========================================
  // Experiment 4: Hash Comparison State
  // ==========================================
  const [compareInputA, setCompareInputA] = useState('Hello World');
  const [compareInputB, setCompareInputB] = useState('Hello world');
  const [compareHashA, setCompareHashA] = useState('');
  const [compareHashB, setCompareHashB] = useState('');
  const [diffStats, setDiffStats] = useState<{
    changedBits: number;
    percentage: number;
    hexA: string;
    hexB: string;
  } | null>(null);

  const updateComparison = useCallback(async (a: string, b: string) => {
    const [resA, resB] = await Promise.all([hashSha256(a), hashSha256(b)]);
    setCompareHashA(resA.hex);
    setCompareHashB(resB.hex);
    const diff = calculateHammingDifference(resA.hex, resB.hex);
    setDiffStats({
      changedBits: diff.changedBits,
      percentage: diff.percentage,
      hexA: resA.hex,
      hexB: resB.hex,
    });
  }, []);

  useEffect(() => {
    updateComparison(compareInputA, compareInputB);
  }, [compareInputA, compareInputB, updateComparison]);

  const comparePresets = [
    {
      label: isVi ? 'Đổi 1 chữ hoa/thường ("W" vs "w")' : 'Case Shift ("W" vs "w")',
      a: 'Hello World',
      b: 'Hello world',
    },
    {
      label: isVi ? 'Thêm 1 dấu chấm ("." ở cuối)' : 'Add Period (".")',
      a: 'The quick brown fox jumps over the lazy dog',
      b: 'The quick brown fox jumps over the lazy dog.',
    },
    {
      label: isVi ? 'Thay đổi 1 chữ số ("1" vs "2")' : 'Digit Change ("1" vs "2")',
      a: 'Blockchain0001',
      b: 'Blockchain0002',
    },
    {
      label: isVi ? 'Đảo 1 bit ("0" vs "1")' : 'Single Bit ("0" vs "1")',
      a: '0',
      b: '1',
    },
  ];

  // ==========================================
  // Experiment 5: Birthday Paradox & Collision State
  // ==========================================
  const [reducedBits, setReducedBits] = useState<number>(12);
  const [isSearchingCollision, setIsSearchingCollision] = useState(false);
  const [collisionResult, setCollisionResult] = useState<{
    inputA: string;
    inputB: string;
    fullHashA: string;
    fullHashB: string;
    truncatedHash: string;
    attempts: number;
    timeMs: number;
  } | null>(null);

  const isSearchingRef = useRef(false);
  isSearchingRef.current = isSearchingCollision;
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      isSearchingRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const runCollisionSearch = () => {
    setIsSearchingCollision(true);
    setCollisionResult(null);

    const startTime = performance.now();
    const seenHashes = new Map<string, { input: string; fullHex: string }>();
    let attempts = 0;
    const maxAttempts = 150000;

    const searchChunk = () => {
      if (!isSearchingRef.current) return;

      const batchSize = 1000;
      for (let i = 0; i < batchSize; i++) {
        attempts++;
        const candidate = `probe_${Math.random().toString(36).substring(2, 9)}_${attempts}`;
        const utf8 = stringToUtf8Bytes(candidate);
        const hex = bytesToHex(sha256Sync(utf8));
        const truncated = truncateHashToBits(hex, reducedBits);

        if (seenHashes.has(truncated)) {
          const match = seenHashes.get(truncated)!;
          if (match.input !== candidate) {
            const timeMs = Number((performance.now() - startTime).toFixed(2));
            setCollisionResult({
              inputA: match.input,
              inputB: candidate,
              fullHashA: match.fullHex,
              fullHashB: hex,
              truncatedHash: truncated,
              attempts,
              timeMs,
            });
            setIsSearchingCollision(false);
            return;
          }
        } else {
          seenHashes.set(truncated, { input: candidate, fullHex: hex });
        }

        if (attempts >= maxAttempts) {
          setIsSearchingCollision(false);
          return;
        }
      }

      if (isSearchingRef.current) {
        requestAnimationFrame(searchChunk);
      }
    };

    requestAnimationFrame(searchChunk);
  };

  const stopCollisionSearch = () => {
    setIsSearchingCollision(false);
  };

  const resetCollision = () => {
    setIsSearchingCollision(false);
    setCollisionResult(null);
  };

  const bitOptions = [
    {
      bits: 8,
      label: isVi
        ? 'Rút gọn 8-Bit (2⁸ = 256 trạng thái, ~19 lần thử)'
        : '8-Bit Truncation (2⁸ = 256 states, ~19 attempts)',
      states: 256,
      estAttempts: 19,
    },
    {
      bits: 12,
      label: isVi
        ? 'Rút gọn 12-Bit (2¹² = 4.096 trạng thái, ~75 lần thử)'
        : '12-Bit Truncation (2¹² = 4,096 states, ~75 attempts)',
      states: 4096,
      estAttempts: 75,
    },
    {
      bits: 16,
      label: isVi
        ? 'Rút gọn 16-Bit (2¹⁶ = 65.536 trạng thái, ~300 lần thử)'
        : '16-Bit Truncation (2¹⁶ = 65,536 states, ~300 attempts)',
      states: 65536,
      estAttempts: 300,
    },
    {
      bits: 20,
      label: isVi
        ? 'Rút gọn 20-Bit (2²⁰ = 1.048.576 trạng thái, ~1.200 lần thử)'
        : '20-Bit Truncation (2²⁰ = 1,048,576 states, ~1,200 attempts)',
      states: 1048576,
      estAttempts: 1200,
    },
  ];

  // Navigation tab list - Clean text only, no decorative icons in headings/tabs
  const TABS = [
    { id: 'determinism', label: strings.experiments.tab1 },
    { id: 'dispersion', label: strings.experiments.tab2 },
    { id: 'speed', label: strings.experiments.tab3 },
    { id: 'compare', label: strings.experiments.tab4 },
    { id: 'birthday', label: strings.experiments.tab5 },
  ] as const;

  return (
    <section id="experiment-lab" className="py-12 sm:py-16 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#0E1210] border border-[#1C2430] text-[#00C98D] text-xs font-mono tracking-widest uppercase mb-3">
            <span>{strings.experiments.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F2F4F7] tracking-tight font-sans mb-3">
            {strings.experiments.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#A5AFBF] leading-relaxed font-sans">
            {strings.experiments.description}
          </p>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-sans text-xs sm:text-sm transition-colors border cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#121713] text-[#00C98D] border-[#00C98D]/50 shadow-sm font-semibold'
                  : 'bg-[#0E1210] text-[#A5AFBF] hover:text-[#F2F4F7] border-[#1C2430] hover:border-[#24313D] font-medium'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area: 100% Unified Surface Card */}
        <div className="rounded-2xl bg-[#0C0F14] border border-[#1C2430] p-6 sm:p-8 shadow-xl space-y-6 font-sans">
          {/* ========================================================= */}
          {/* 1. TÍNH XÁC ĐỊNH (Determinism & Multi-Format Encodings)    */}
          {/* ========================================================= */}
          {activeTab === 'determinism' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2430] pb-4">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#00C98D]">
                    {strings.experiments.exp1Title}
                  </h3>
                  <p className="text-xs text-[#A5AFBF] mt-0.5 font-sans">
                    {strings.experiments.exp1Desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 font-sans text-xs">
                  <span className="text-[#A5AFBF] whitespace-nowrap">
                    {strings.experiments.exp1TestInput}
                  </span>
                  <input
                    type="text"
                    value={repInput}
                    onChange={(e) => setRepInput(e.target.value)}
                    className="bg-[#080C10] border border-[#1C2430] rounded-xl px-3 py-1.5 text-[#F2F4F7] focus:outline-none focus:border-[#00C98D] w-48 sm:w-64 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Encodings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {/* Hexadecimal */}
                <div className="p-4 rounded-xl bg-[#080C10] border border-[#1C2430] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#00C98D] font-bold font-sans">
                      {strings.experiments.exp1Hex}
                    </span>
                    <button
                      onClick={() => copyToClipboard(repHash, 'hex')}
                      className="text-[#A5AFBF] hover:text-[#F2F4F7] flex items-center gap-1 font-sans text-xs cursor-pointer"
                    >
                      {copiedFormat === 'hex' ? (
                        <Check className="w-3 h-3 text-[#00C98D]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>
                        {copiedFormat === 'hex'
                          ? strings.hashGenerator.copied
                          : strings.hashGenerator.copyFullHash}
                      </span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0E1210] text-[#F2F4F7] break-all select-all font-semibold font-mono border border-[#1C2430]">
                    {repHash}
                  </div>
                </div>

                {/* Base64 */}
                <div className="p-4 rounded-xl bg-[#080C10] border border-[#1C2430] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#00C98D] font-bold font-sans">
                      {strings.experiments.exp1Base64}
                    </span>
                    <button
                      onClick={() => copyToClipboard(hexToBase64(repHash), 'base64')}
                      className="text-[#A5AFBF] hover:text-[#F2F4F7] flex items-center gap-1 font-sans text-xs cursor-pointer"
                    >
                      {copiedFormat === 'base64' ? (
                        <Check className="w-3 h-3 text-[#00C98D]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>
                        {copiedFormat === 'base64'
                          ? strings.hashGenerator.copied
                          : strings.hashGenerator.copyFullHash}
                      </span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0E1210] text-[#F2F4F7] break-all select-all font-semibold font-mono border border-[#1C2430]">
                    {hexToBase64(repHash)}
                  </div>
                </div>

                {/* 32 Decimal Bytes */}
                <div className="p-4 rounded-xl bg-[#080C10] border border-[#1C2430] space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#00C98D] font-bold font-sans">
                      {strings.experiments.exp1Bytes}
                    </span>
                    <span className="text-[#717B8C] text-[11px] font-sans">
                      32 uint8 elements (0..255)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0E1210] text-[#00C98D] font-mono text-[11px] break-all select-all leading-relaxed border border-[#1C2430]">
                    [{formatHexBytes(repHash).map((h) => parseInt(h, 16)).join(', ')}]
                  </div>
                </div>

                {/* Full 256-bit Binary String */}
                <div className="p-4 rounded-xl bg-[#080C10] border border-[#1C2430] space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#00C98D] font-bold font-sans">
                      {strings.experiments.exp1Binary}
                    </span>
                    <button
                      onClick={() => copyToClipboard(hexToBinary(repHash), 'binary')}
                      className="text-[#A5AFBF] hover:text-[#F2F4F7] flex items-center gap-1 font-sans text-xs cursor-pointer"
                    >
                      {copiedFormat === 'binary' ? (
                        <Check className="w-3 h-3 text-[#00C98D]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>
                        {copiedFormat === 'binary'
                          ? strings.hashGenerator.copied
                          : strings.hashGenerator.copyFullHash}
                      </span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0E1210] text-[#F2F4F7] font-mono text-[10px] break-all select-all leading-normal max-h-24 overflow-y-auto border border-[#1C2430]">
                    {hexToBinary(repHash)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. PHÂN TÍCH ĐỘ PHÂN TÁN (Dispersion & Cryptographic Salt) */}
          {/* ========================================================= */}
          {activeTab === 'dispersion' && (
            <div className="space-y-6 font-sans">
              <div className="border-b border-[#1C2430] pb-4">
                <h3 className="font-sans text-base font-bold text-[#00C98D]">
                  {strings.experiments.exp2Title}
                </h3>
                <p className="text-xs text-[#A5AFBF] mt-0.5 font-sans">
                  {strings.experiments.exp2Desc}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
                <div className="space-y-4">
                  <div>
                    <label className="text-[#A5AFBF] block mb-1 font-semibold">
                      {strings.experiments.exp2SaltLabel}
                    </label>
                    <input
                      type="text"
                      value={saltKey}
                      onChange={(e) => setSaltKey(e.target.value)}
                      className="w-full bg-[#080C10] border border-[#1C2430] rounded-xl px-4 py-2.5 text-[#F2F4F7] focus:outline-none focus:border-[#00C98D] font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[#A5AFBF] block mb-1 font-semibold">
                      {strings.experiments.exp2MsgLabel}
                    </label>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#080C10] border border-[#1C2430] rounded-xl px-4 py-2.5 text-[#F2F4F7] focus:outline-none focus:border-[#00C98D] font-mono text-xs"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#080C10] border border-[#1C2430] space-y-2">
                    <span className="text-[#717B8C] text-[11px] block font-sans font-semibold">
                      {strings.experiments.exp2Combined}
                    </span>
                    <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430] text-[#00C98D] font-bold break-all select-all text-xs font-mono">
                      {saltedHash}
                    </div>
                  </div>
                </div>

                {/* Bit Dispersion Breakdown Panel */}
                <div className="p-5 rounded-xl bg-[#080C10] border border-[#1C2430] flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#A5AFBF] font-semibold text-xs font-sans">
                        {isVi ? 'Phân Bố Tỷ Lệ Bit (Bit Dispersion Ratio):' : 'Bit Dispersion Ratio (256 Bits):'}
                      </span>
                      <span className="text-[#00C98D] font-mono text-xs font-bold">
                        {isVi ? 'Tiệm cận 50% ngẫu nhiên' : '~50% Ideal Entropy'}
                      </span>
                    </div>

                    {/* Dispersion Bar */}
                    <div className="h-3 w-full rounded-full bg-[#1C2430] overflow-hidden flex mb-3">
                      <div
                        style={{ width: `${onesPercentage}%` }}
                        className="bg-[#00C98D] h-full transition-all duration-300"
                        title={`Bit 1: ${onesCount} (${onesPercentage}%)`}
                      />
                      <div
                        style={{ width: `${zerosPercentage}%` }}
                        className="bg-[#1C2430] h-full transition-all duration-300"
                        title={`Bit 0: ${zerosCount} (${zerosPercentage}%)`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
                      <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430]">
                        <span className="text-[#717B8C] text-[10px] block font-sans">
                          {isVi ? 'Số lượng Bit 1' : 'Bit 1 Count'}
                        </span>
                        <span className="text-[#00C98D] font-bold text-sm">
                          {onesCount} <span className="text-xs text-[#A5AFBF]">({onesPercentage}%)</span>
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430]">
                        <span className="text-[#717B8C] text-[10px] block font-sans">
                          {isVi ? 'Số lượng Bit 0' : 'Bit 0 Count'}
                        </span>
                        <span className="text-[#A5AFBF] font-bold text-sm">
                          {zerosCount} <span className="text-xs text-[#717B8C]">({zerosPercentage}%)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#A5AFBF] space-y-1.5 font-sans border-t border-[#1C2430] pt-3">
                    <p>• {strings.experiments.exp2Note1}</p>
                    <p>• {strings.experiments.exp2Note2}</p>
                    <p>• {isVi ? 'Ngăn chặn tấn công bảng cầu vồng (Rainbow Table Attacks).' : 'Guarantees resistance against precomputed rainbow table attacks.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. TỐC ĐỘ BĂM (Hash Rate Benchmark & Length Invariance)    */}
          {/* ========================================================= */}
          {activeTab === 'speed' && (
            <div className="space-y-6 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2430] pb-4">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#00C98D]">
                    {strings.experiments.exp3Title}
                  </h3>
                  <p className="text-xs text-[#A5AFBF] mt-0.5 font-sans">
                    {strings.experiments.exp3Desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={runBenchmark}
                  disabled={isBenchmarking}
                  className="px-4 py-2 rounded-xl bg-[#00C98D] hover:bg-[#00C98D]/90 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  {isBenchmarking
                    ? strings.experiments.exp3Benchmarking
                    : strings.experiments.exp3RunBenchmark}
                </button>
              </div>

              {/* Benchmark Result Box */}
              {benchmarkResult && (
                <div className="p-4 rounded-xl bg-[#080C10] border border-[#00C98D]/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430]">
                    <span className="text-[#717B8C] text-[10px] block font-sans">
                      {isVi ? 'Tốc độ thực tế' : 'Throughput'}
                    </span>
                    <span className="text-[#00C98D] font-bold text-sm">
                      {benchmarkResult.hashesPerSec.toLocaleString()} H/s
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430]">
                    <span className="text-[#717B8C] text-[10px] block font-sans">
                      {isVi ? 'Thời gian / bản băm' : 'Avg Time / Hash'}
                    </span>
                    <span className="text-[#F2F4F7] font-bold text-sm">
                      {benchmarkResult.avgTimeUs} µs
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430]">
                    <span className="text-[#717B8C] text-[10px] block font-sans">
                      {isVi ? 'Tổng thời gian đo' : 'Total Test Time'}
                    </span>
                    <span className="text-[#A5AFBF] font-bold text-sm">
                      {benchmarkResult.totalMs} ms
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430]">
                    <span className="text-[#717B8C] text-[10px] block font-sans">
                      {isVi ? 'Số mẫu đã tính' : 'Sample Iterations'}
                    </span>
                    <span className="text-[#A5AFBF] font-bold text-sm">
                      {benchmarkResult.iterations.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Length Invariance Controls & Metrics */}
              <div className="space-y-4 font-sans text-xs">
                <div>
                  <div className="flex justify-between text-[#A5AFBF] mb-2">
                    <span>{strings.experiments.exp3Multiplier}</span>
                    <span className="text-[#00C98D] font-bold font-mono">
                      {repeatCount} {isVi ? 'lần lặp' : 'repeats'} ({repeatCount * 10} {isVi ? 'ký tự' : 'characters'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={500}
                    value={repeatCount}
                    onChange={(e) => setRepeatCount(Number(e.target.value))}
                    className="w-full accent-[#00C98D] bg-[#1C2430] h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-[#080C10] border border-[#1C2430]">
                    <span className="text-[#717B8C] block mb-1 font-sans">
                      {strings.experiments.exp3PayloadSize}
                    </span>
                    <span className="text-[#F2F4F7] font-bold text-sm font-mono">
                      {repeatCount * 10} bytes
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080C10] border border-[#1C2430]">
                    <span className="text-[#717B8C] block mb-1 font-sans">
                      {strings.experiments.exp3BlocksReq}
                    </span>
                    <span className="text-[#00C98D] font-bold text-sm font-mono">
                      {Math.ceil((repeatCount * 10 + 9) / 64)} blocks (512-bit)
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080C10] border border-[#1C2430]">
                    <span className="text-[#717B8C] block mb-1 font-sans">
                      {strings.experiments.exp3DigestSize}
                    </span>
                    <span className="text-[#00C98D] font-bold text-sm font-mono">
                      {strings.experiments.exp3Fixed256}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#080C10] border border-[#1C2430] space-y-1">
                  <span className="text-[#717B8C] text-[11px] block uppercase font-semibold font-sans">
                    {strings.experiments.exp3ComputedDigest}
                  </span>
                  <div className="p-3 rounded-lg bg-[#0E1210] font-bold text-[#00C98D] break-all select-all font-mono text-xs border border-[#1C2430]">
                    {lengthSampleHash}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. SO SÁNH CHUỖI BĂM (Hash Comparison & Hamming Distance) */}
          {/* ========================================================= */}
          {activeTab === 'compare' && (
            <div className="space-y-6 font-sans">
              <div className="border-b border-[#1C2430] pb-4">
                <h3 className="font-sans text-base font-bold text-[#00C98D]">
                  {strings.experiments.exp4Title}
                </h3>
                <p className="text-xs text-[#A5AFBF] mt-0.5 font-sans">
                  {strings.experiments.exp4Desc}
                </p>
              </div>

              {/* Sample Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#717B8C] font-sans">
                  {strings.experiments.exp4Presets}
                </span>
                {comparePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCompareInputA(preset.a);
                      setCompareInputB(preset.b);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-colors cursor-pointer border ${
                      compareInputA === preset.a && compareInputB === preset.b
                        ? 'bg-[#121713] text-[#00C98D] border-[#00C98D]/40'
                        : 'bg-[#080C10] text-[#A5AFBF] border-[#1C2430] hover:text-[#F2F4F7]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Dual Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="text-[#A5AFBF] block mb-1.5 font-semibold">
                    {strings.experiments.exp4InputA}
                  </label>
                  <input
                    type="text"
                    value={compareInputA}
                    onChange={(e) => setCompareInputA(e.target.value)}
                    className="w-full bg-[#080C10] border border-[#1C2430] rounded-xl px-4 py-2.5 text-[#F2F4F7] focus:outline-none focus:border-[#00C98D] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[#A5AFBF] block mb-1.5 font-semibold">
                    {strings.experiments.exp4InputB}
                  </label>
                  <input
                    type="text"
                    value={compareInputB}
                    onChange={(e) => setCompareInputB(e.target.value)}
                    className="w-full bg-[#080C10] border border-[#1C2430] rounded-xl px-4 py-2.5 text-[#F2F4F7] focus:outline-none focus:border-[#00C98D] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Hash A vs Hash B Display Panel */}
              <div className="p-5 rounded-xl bg-[#080C10] border border-[#1C2430] space-y-4">
                {/* Hash A */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#717B8C] font-semibold">
                      {strings.experiments.exp4HashA}
                    </span>
                    <span className="text-[11px] text-[#717B8C] font-mono">
                      len: {compareInputA.length} chars
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430] text-[#00C98D] font-mono text-xs sm:text-sm font-semibold break-all select-all">
                    {compareHashA}
                  </div>
                </div>

                {/* Hash B */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#717B8C] font-semibold">
                      {strings.experiments.exp4HashB}
                    </span>
                    <span className="text-[11px] text-[#717B8C] font-mono">
                      len: {compareInputB.length} chars
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430] text-[#F2F4F7] font-mono text-xs sm:text-sm font-semibold break-all select-all">
                    {compareHashB}
                  </div>
                </div>

                {/* Comparison Metrics */}
                {diffStats && (
                  <div className="pt-3 border-t border-[#1C2430] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430]">
                      <span className="text-[#717B8C] text-[10px] block font-sans">
                        {strings.experiments.exp4BitDiff}
                      </span>
                      <span className="text-rose-400 font-bold text-sm font-mono">
                        {diffStats.changedBits} / 256 bits
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430]">
                      <span className="text-[#717B8C] text-[10px] block font-sans">
                        {strings.experiments.exp4DiffRatio}
                      </span>
                      <span className="text-[#00C98D] font-bold text-sm font-mono">
                        {diffStats.percentage.toFixed(2)}%
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430]">
                      <span className="text-[#717B8C] text-[10px] block font-sans">
                        {isVi ? 'Số bit giữ nguyên' : 'Unchanged Bits'}
                      </span>
                      <span className="text-[#A5AFBF] font-bold text-sm font-mono">
                        {256 - diffStats.changedBits} / 256 bits
                      </span>
                    </div>
                  </div>
                )}

                {/* Character-by-Character Comparison Visualizer */}
                {compareHashA && compareHashB && (
                  <div className="pt-2">
                    <span className="text-[11px] text-[#717B8C] block mb-2 font-sans font-semibold">
                      {isVi ? 'Đối Sánh 64 Ký Tự Hex Trực Tiếp:' : 'Direct 64-Hex Character Comparison:'}
                    </span>
                    <div className="p-3 rounded-lg bg-[#0E1210] border border-[#1C2430] font-mono text-xs sm:text-sm tracking-wider flex flex-wrap gap-1 leading-relaxed">
                      {Array.from(compareHashA).map((charA, idx) => {
                        const charB = compareHashB[idx];
                        const isMatch = charA === charB;
                        return (
                          <span
                            key={idx}
                            title={`Pos ${idx}: '${charA}' vs '${charB}'`}
                            className={`px-1 py-0.5 rounded ${
                              isMatch
                                ? 'bg-[#00C98D]/10 text-[#00C98D] border border-[#00C98D]/30 font-bold'
                                : 'bg-[#1C2430]/60 text-[#A5AFBF]'
                            }`}
                          >
                            {charA}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-[#717B8C]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#00C98D]/20 border border-[#00C98D]/50" />
                        <span>{isVi ? 'Ký tự trùng khớp' : 'Matching character'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#1C2430]" />
                        <span>{isVi ? 'Ký tự khác biệt' : 'Flipped character'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. NGHỊCH LÝ SINH NHẬT (Birthday Paradox & Collision)      */}
          {/* ========================================================= */}
          {activeTab === 'birthday' && (
            <div className="space-y-6 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2430] pb-4">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#00C98D]">
                    {strings.experiments.exp5Title}
                  </h3>
                  <p className="text-xs text-[#A5AFBF] mt-0.5 font-sans">
                    {strings.experiments.exp5Desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={reducedBits}
                    onChange={(e) => {
                      setReducedBits(Number(e.target.value));
                      setCollisionResult(null);
                    }}
                    disabled={isSearchingCollision}
                    aria-label={strings.experiments.exp5Space}
                    className="bg-[#080C10] border border-[#1C2430] text-[#F2F4F7] text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-[#00C98D] font-sans"
                  >
                    {bitOptions.map((opt) => (
                      <option key={opt.bits} value={opt.bits}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {!isSearchingCollision ? (
                    <button
                      type="button"
                      onClick={runCollisionSearch}
                      className="px-4 py-2 rounded-xl bg-[#00C98D] hover:bg-[#00C98D]/90 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      {strings.experiments.exp5Find}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCollisionSearch}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      {strings.experiments.exp5Searching}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={resetCollision}
                    disabled={isSearchingCollision}
                    className="px-3 py-2 rounded-xl bg-[#0E1210] hover:bg-[#121713] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] text-xs transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {strings.experiments.exp5Reset}
                  </button>
                </div>
              </div>

              {/* Collision Result Display */}
              {collisionResult ? (
                <div className="rounded-xl bg-[#080C10] border border-[#00C98D]/40 p-5 font-sans text-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1C2430] pb-3">
                    <div className="text-[#00C98D] font-bold text-sm">
                      {strings.experiments.exp5CollisionFound} ({collisionResult.attempts.toLocaleString()}{' '}
                      {isVi ? 'lần thử trong' : 'attempts in'} {collisionResult.timeMs} ms)
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#0E1210] text-[#00C98D] border border-[#1C2430] text-[11px] font-mono">
                      {reducedBits} Bits Prefix Match
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-[#0E1210] rounded-xl border border-[#1C2430] space-y-1">
                      <span className="text-[10px] text-[#717B8C] uppercase block font-sans font-semibold">
                        {strings.experiments.exp5Msg1}
                      </span>
                      <div className="text-[#F2F4F7] font-mono font-bold break-all">
                        {collisionResult.inputA}
                      </div>
                      <span className="text-[10px] text-[#717B8C] block pt-1">
                        {isVi ? 'Mã băm 256-bit đầy đủ:' : 'Full 256-bit SHA-256:'}
                      </span>
                      <div className="text-[#A5AFBF] text-[11px] font-mono break-all">
                        {collisionResult.fullHashA}
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#0E1210] rounded-xl border border-[#1C2430] space-y-1">
                      <span className="text-[10px] text-[#717B8C] uppercase block font-sans font-semibold">
                        {strings.experiments.exp5Msg2}
                      </span>
                      <div className="text-[#F2F4F7] font-mono font-bold break-all">
                        {collisionResult.inputB}
                      </div>
                      <span className="text-[10px] text-[#717B8C] block pt-1">
                        {isVi ? 'Mã băm 256-bit đầy đủ:' : 'Full 256-bit SHA-256:'}
                      </span>
                      <div className="text-[#A5AFBF] text-[11px] font-mono break-all">
                        {collisionResult.fullHashB}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#0E1210] rounded-xl border border-[#00C98D]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[#A5AFBF] font-sans">
                        {strings.experiments.exp5MatchingBits}{' '}
                      </span>
                      <strong className="text-[#00C98D] text-sm tracking-widest font-mono">
                        {collisionResult.truncatedHash}
                      </strong>
                    </div>
                    <div className="text-[#717B8C] text-[11px] font-sans">
                      {isVi
                        ? 'Các giá trị băm 256-bit đầy đủ vẫn hoàn toàn khác biệt.'
                        : 'Full 256-bit digests remain completely distinct.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-[#080C10] border border-dashed border-[#1C2430] text-center font-sans text-xs text-[#A5AFBF] space-y-2">
                  <p className="font-semibold text-[#F2F4F7] text-sm font-sans">
                    {isVi
                      ? 'Sẵn sàng thử nghiệm va chạm theo Nghịch Lý Sinh Nhật'
                      : 'Ready to test Birthday Attack Collision Dynamics'}
                  </p>
                  <p className="text-[#717B8C] max-w-lg mx-auto leading-relaxed">
                    {isVi
                      ? 'Chọn không gian bit rút gọn (ví dụ 12-bit hoặc 16-bit) và nhấn "Bắt đầu tìm" để quan sát tốc độ va chạm trong không gian mẫu nhỏ so với không gian thực 256-bit.'
                      : 'Select a truncated bit space (e.g. 12-bit or 16-bit) and click "Find Collision" to observe collision dynamics in reduced spaces.'}
                  </p>
                </div>
              )}

              {/* Scientific Comparison Cards */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-[#A5AFBF]">
                <div className="p-3.5 rounded-xl bg-[#080C10] border border-[#1C2430]">
                  <span className="text-[#717B8C] block mb-1 font-sans font-semibold">
                    {strings.experiments.exp5Formula}
                  </span>
                  <div className="text-[#00C98D] font-bold text-sm font-mono">
                    ≈ 1.17 × √(2ⁿ)
                  </div>
                  <p className="text-[11px] text-[#717B8C] mt-1 font-sans">
                    {isVi
                      ? 'Giảm độ phức tạp căn bậc hai cho bài toán va chạm'
                      : 'Square root reduction for collision resistance'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080C10] border border-[#1C2430]">
                  <span className="text-[#717B8C] block mb-1 font-sans font-semibold">
                    {strings.experiments.exp5FullWork}
                  </span>
                  <div className="text-[#00C98D] font-bold text-sm font-mono">
                    2¹²⁸ ≈ 3.4 × 10³⁸
                  </div>
                  <p className="text-[11px] text-[#717B8C] mt-1 font-sans">
                    {isVi ? 'phép toán băm độc lập' : 'independent hash operations'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080C10] border border-[#1C2430]">
                  <span className="text-[#717B8C] block mb-1 font-sans font-semibold">
                    {strings.experiments.exp5Conclusion}
                  </span>
                  <span className="text-[#00C98D] font-bold text-sm font-sans">
                    {isVi ? 'Bất khả thi về tính toán' : 'Computationally Infeasible'}
                  </span>
                  <p className="text-[11px] text-[#717B8C] mt-1 font-sans">
                    {isVi
                      ? 'Chưa từng có va chạm SHA-256 nào được ghi nhận'
                      : 'No SHA-256 collision has ever been discovered'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
