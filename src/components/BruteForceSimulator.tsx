import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  RotateCcw,
} from 'lucide-react';
import { sha256Sync } from '../utils/sha256';
import { stringToUtf8Bytes, bytesToHex } from '../utils/binary';
import { useLanguage } from '../i18n/LanguageContext';

interface TargetPreset {
  labelEn: string;
  labelVi: string;
  targetInput: string;
  charSet: string;
  charSetNameEn: string;
  charSetNameVi: string;
}

const PRESETS: TargetPreset[] = [
  {
    labelEn: '"abc"',
    labelVi: '"abc"',
    targetInput: 'abc',
    charSet: 'abcdefghijklmnopqrstuvwxyz',
    charSetNameEn: 'Lowercase (26 chars)',
    charSetNameVi: 'Chữ thường (26 ký tự)',
  },
  {
    labelEn: 'PIN 789',
    labelVi: 'PIN 789',
    targetInput: '789',
    charSet: '0123456789',
    charSetNameEn: 'Digits (10 chars)',
    charSetNameVi: 'Chữ số (10 ký tự)',
  },
  {
    labelEn: 'PIN 42',
    labelVi: 'PIN 42',
    targetInput: '42',
    charSet: '0123456789',
    charSetNameEn: 'Digits (10 chars)',
    charSetNameVi: 'Chữ số (10 ký tự)',
  },
  {
    labelEn: '"key"',
    labelVi: '"key"',
    targetInput: 'key',
    charSet: 'abcdefghijklmnopqrstuvwxyz0123456789',
    charSetNameEn: 'Alphanumeric (36 chars)',
    charSetNameVi: 'Chữ & số (36 ký tự)',
  },
];

export const BruteForceSimulator: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [selectedPreset, setSelectedPreset] = useState<TargetPreset>(PRESETS[0]);
  const [customInput, setCustomInput] = useState<string>('abc');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [targetHash, setTargetHash] = useState<string>('');
  const [currentCandidate, setCurrentCandidate] = useState<string>('');
  const [currentHash, setCurrentHash] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [hashRate, setHashRate] = useState<number>(0);
  const [foundResult, setFoundResult] = useState<string | null>(null);

  const isRunningRef = useRef(false);
  isRunningRef.current = isRunning;
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const input = customInput.trim();
    if (!input) return;
    const utf8 = stringToUtf8Bytes(input);
    const hash = bytesToHex(sha256Sync(utf8));
    setTargetHash(hash);
    setFoundResult(null);
    setAttempts(0);
    setElapsedMs(0);
    setHashRate(0);
    setCurrentCandidate('');
    setCurrentHash('');
  }, [customInput]);

  const searchSpaceSize = Math.pow(
    selectedPreset.charSet.length,
    customInput.length
  );

  const startBruteForce = () => {
    const target = customInput;
    if (!target) return;

    setIsRunning(true);
    setFoundResult(null);
    setAttempts(0);
    const start = performance.now();
    setStartTime(start);

    const chars = selectedPreset.charSet;
    const maxLen = target.length;
    let localAttempts = 0;

    function* generateCandidates(current = '', len = 0): Generator<string> {
      if (len === maxLen) {
        yield current;
        return;
      }
      for (let i = 0; i < chars.length; i++) {
        yield* generateCandidates(current + chars[i], len + 1);
      }
    }

    const generator = generateCandidates('', 0);
    let lastUiUpdate = 0;

    const runBatch = () => {
      if (!isRunningRef.current) return;

      const batchSize = 250;
      let matched = false;

      for (let i = 0; i < batchSize; i++) {
        const next = generator.next();
        if (next.done) {
          setIsRunning(false);
          return;
        }

        localAttempts++;
        const candidate = next.value;
        const cHash = bytesToHex(sha256Sync(stringToUtf8Bytes(candidate)));

        if (cHash === targetHash) {
          setCurrentCandidate(candidate);
          setCurrentHash(cHash);
          setAttempts(localAttempts);
          const end = performance.now();
          const elapsed = end - start;
          setElapsedMs(elapsed);
          setHashRate(Math.round((localAttempts / (Math.max(elapsed, 1) / 1000))));
          setFoundResult(candidate);
          setIsRunning(false);
          matched = true;
          break;
        }
      }

      if (!matched && isRunningRef.current) {
        const now = performance.now();
        if (now - lastUiUpdate >= 60) {
          lastUiUpdate = now;
          const elapsed = now - start;
          setAttempts(localAttempts);
          setElapsedMs(elapsed);
          if (elapsed > 0) {
            setHashRate(Math.round((localAttempts / (elapsed / 1000))));
          }
        }
        rafRef.current = requestAnimationFrame(runBatch);
      }
    };

    rafRef.current = requestAnimationFrame(runBatch);
  };

  const stopBruteForce = () => {
    setIsRunning(false);
  };

  const resetAll = () => {
    setIsRunning(false);
    setFoundResult(null);
    setAttempts(0);
    setElapsedMs(0);
    setHashRate(0);
    setCurrentCandidate('');
    setCurrentHash('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* 1. Header */}
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 font-sans tracking-tight">
              {isVi ? 'Mô phỏng vét cạn (Brute-Force)' : 'Brute-force preimage simulator'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isVi
                ? 'Thử nghiệm tìm ngược dữ liệu ban đầu (Preimage) từ mã băm SHA-256 trong không gian giới hạn.'
                : 'Simulate reversing a SHA-256 hash by exhaustively searching restricted candidate sets.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isRunning ? (
              <button
                type="button"
                onClick={startBruteForce}
 className="px-4 py-1.5 rounded-lg bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isVi ? 'Bắt đầu tìm' : 'Start search'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopBruteForce}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{isVi ? 'Dừng lại' : 'Stop'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={resetAll}
              disabled={isRunning}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer disabled:opacity-40"
              title={isVi ? 'Đặt lại' : 'Reset'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Presets Chips */}
        <div className="flex items-center gap-2 pt-2 flex-wrap">
          <span className="text-xs text-slate-400">
            {isVi ? 'Mẫu thử nghiệm:' : 'Presets:'}
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              disabled={isRunning}
              onClick={() => {
                setSelectedPreset(p);
                setCustomInput(p.targetInput);
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                selectedPreset.targetInput === p.targetInput && customInput === p.targetInput
                  ? 'bg-slate-800 text-teach-1 border border-teach-1/40'
                  : 'bg-[#080c16] text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {isVi ? p.labelVi : p.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Input & Metrics */}
      <div className="p-5 rounded-xl bg-[#0c101c] border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 block font-medium">
              {isVi ? 'Dữ liệu mục tiêu (Preimage)' : 'Target preimage'}
            </label>
            <input
              type="text"
              maxLength={4}
              disabled={isRunning}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value.toLowerCase())}
              className="w-full bg-[#080c16] border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 block font-medium">
              {isVi ? 'Tập ký tự (Σ)' : 'Character set (Σ)'}
            </label>
            <div className="px-3 py-1.5 rounded-md bg-[#080c16] border border-slate-800 text-xs font-mono text-slate-300 truncate">
              {isVi ? selectedPreset.charSetNameVi : selectedPreset.charSetNameEn}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 block font-medium">
              {isVi ? 'Không gian tìm kiếm' : 'Search space'}
            </label>
            <div className="px-3 py-1.5 rounded-md bg-[#080c16] border border-slate-800 text-xs font-mono text-amber-400 font-medium">
              {searchSpaceSize.toLocaleString()} {isVi ? 'tổ hợp' : 'combinations'}
            </div>
          </div>
        </div>

        {/* Target Hash */}
        <div className="p-3 rounded-lg bg-[#080c16] border border-slate-800 space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{isVi ? 'Mã hash mục tiêu:' : 'Target hash:'}</span>
            <span className="text-slate-500">SHA-256("{customInput}")</span>
          </div>
          <div className="text-emerald-300 break-all text-xs font-mono">
            {targetHash}
          </div>
        </div>

        {/* Real-time metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-[#080c16] border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">{isVi ? 'Số lần thử' : 'Attempts'}</span>
            <div className="text-base font-semibold text-slate-100">{attempts.toLocaleString()}</div>
          </div>

          <div className="p-3 rounded-lg bg-[#080c16] border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">{isVi ? 'Thời gian' : 'Time'}</span>
            <div className="text-base font-semibold text-emerald-400">{(elapsedMs / 1000).toFixed(2)}s</div>
          </div>

          <div className="p-3 rounded-lg bg-[#080c16] border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">{isVi ? 'Tốc độ' : 'Speed'}</span>
            <div className="text-base font-semibold text-slate-300">{hashRate.toLocaleString()} H/s</div>
          </div>

          <div className="p-3 rounded-lg bg-[#080c16] border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">{isVi ? 'Trạng thái' : 'Status'}</span>
            <div
              className={`text-xs font-semibold mt-0.5 truncate ${
                foundResult
                  ? 'text-emerald-400'
                  : isRunning
                  ? 'text-amber-400 animate-pulse'
                  : 'text-slate-500'
              }`}
            >
              {foundResult
                ? (isVi ? 'Đã tìm thấy ✓' : 'Found ✓')
                : isRunning
                ? (isVi ? 'Đang tìm...' : 'Searching...')
                : (isVi ? 'Đang chờ' : 'Idle')}
            </div>
          </div>
        </div>

        {/* Live Candidate Box */}
        {(isRunning || currentCandidate) && (
          <div className="p-3 rounded-lg bg-[#080c16] border border-slate-800 space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{isVi ? 'Candidate đang thử:' : 'Candidate:'}</span>
              <span className="text-slate-200 font-semibold">"{currentCandidate}"</span>
            </div>
            <div className="text-[11px] text-slate-500 break-all">
              {currentHash}
            </div>
          </div>
        )}

        {/* Found Result Banner */}
        {foundResult && (
          <div className="p-3.5 rounded-lg bg-[#080c16] border border-success/50 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success shrink-0" />
              <span className="font-semibold text-success">
                {isVi ? `Đã tìm thấy preimage: "${foundResult}"` : `Preimage found: "${foundResult}"`}
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">
                ({attempts.toLocaleString()} {isVi ? 'lần thử trong' : 'attempts in'} {(elapsedMs / 1000).toFixed(3)}s)
              </span>
            </div>
          </div>
        )}

        {/* Theory note */}
        <div className="p-3 rounded-lg bg-[#080c16] border border-slate-800 text-xs text-slate-400 space-y-1">
          <span className="font-medium text-slate-300">
            {isVi ? 'Kháng Preimage trong thực tế: ' : 'Real-world preimage resistance: '}
          </span>
          <p className="leading-relaxed">
            {isVi
              ? 'Trong mô phỏng này, brute-force thành công vì không gian đầu vào chỉ vài nghìn tổ hợp. Với mã băm 256-bit bất kỳ, không gian là 2²⁵⁶ ≈ 1.15 × 10⁷⁷ khả năng — bất khả thi về mặt tính toán đối với mọi hệ thống máy tính hiện tại.'
              : 'Brute force works here only because the space is artificially small. For a full 256-bit hash, the space is 2²⁵⁶ ≈ 1.15 × 10⁷⁷ possibilities—computationally infeasible to reverse.'}
          </p>
        </div>
      </div>
    </div>
  );
};
