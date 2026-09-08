import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  ArrowRight,
  GitFork,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface HashPointerBlockchainLabProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
}

// Canonical hashes (first 6 characters)
const HASHES = {
  genesisPrev: '000000',
  block0: 'e3b0c4',
  block1Clean: 'b43b92',
  block1Tampered: 'a8d29f',
  block2Clean: '7f8a1c',
  block2Remined: 'f173b8',
  block3Clean: 'c29e4d',
  block3Remined: '94e015',
  block4: '5a8b1f',
  block5: '9e3d7a',
};

export const HashPointerBlockchainLab: React.FC<HashPointerBlockchainLabProps> = ({
  onInteracted,
  onNextStage,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // 8.0s timeline state (0ms to 8000ms)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Determine current active phase:
  // 0: Baseline (0s)
  // 1: 0ms - 2000ms: Khối #1 bị sửa (Dữ liệu đổi -> Hash nổ tung)
  // 2: 2000ms - 4000ms: Đứt gãy liên kết (Khối #2 từ chối: Sai mã liên kết)
  // 3: 4000ms - 6500ms: Hacker cố đào lại (Tính lại toàn bộ chuỗi giả mạo)
  // 4: 6500ms - 8000ms: Mạng lưới đào thải (Mạng lưới chỉ tin chuỗi dài nhất)
  const currentPhase: 0 | 1 | 2 | 3 | 4 = (() => {
    if (currentTime <= 0) return 0;
    if (currentTime <= 2000) return 1;
    if (currentTime <= 4000) return 2;
    if (currentTime <= 6500) return 3;
    return 4;
  })();

  // 60fps animation timer
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= 8000) {
          setIsPlaying(false);
          return 8000;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Controls
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentTime >= 8000) {
        setCurrentTime(0);
      }
      setIsPlaying(true);
      onInteracted?.();
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleJumpToPhase = (phase: 1 | 2 | 3 | 4) => {
    onInteracted?.();
    if (phase === 1) setCurrentTime(500);
    if (phase === 2) setCurrentTime(2500);
    if (phase === 3) setCurrentTime(4500);
    if (phase === 4) setCurrentTime(7000);
    setIsPlaying(true);
  };

  // Status message configuration for the single prominent central frame
  const getStatusMessage = () => {
    switch (currentPhase) {
      case 1:
        return {
          title: isVi
            ? 'Dữ liệu đổi ➔ Mã băm Khối #1 nổ tung'
            : 'Data changed ➔ Block #1 hash mutates instantly',
          subtitle: isVi
            ? '10 COIN bị sửa thành 999 COIN. Tính chất tuyết lở SHA-256 làm mã băm lập tức đổi màu đỏ.'
            : '10 COIN tampered to 999 COIN. SHA-256 avalanche effect alters block hash immediately.',
          color: 'rose',
          icon: <Flame className="w-5 h-5 text-rose-400 animate-pulse" />,
        };
      case 2:
        return {
          title: isVi
            ? 'Khối #2 từ chối: Sai mã liên kết'
            : 'Block #2 rejects: Broken hash pointer',
          subtitle: isVi
            ? 'PrevHash ở Khối #2 vẫn nhớ mã băm cũ. Mũi tên liên kết bị gãy vỡ đứt đoạn.'
            : 'PrevHash stored in Block #2 still remembers the old hash. The link fractures.',
          color: 'rose',
          icon: <Zap className="w-5 h-5 text-rose-400" />,
        };
      case 3:
        return {
          title: isVi
            ? 'Hacker tính lại toàn bộ chuỗi giả mạo'
            : 'Attacker recomputes entire fake chain',
          subtitle: isVi
            ? 'Kẻ tấn công vá PrevHash của Khối #2 và #3, tạo thành một nhánh rẽ độc lập màu vàng cam.'
            : 'Attacker patches PrevHash of Block #2 and #3, forming an isolated amber fork.',
          color: 'amber',
          icon: <GitFork className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />,
        };
      case 4:
        return {
          title: isVi
            ? 'Thất bại: Mạng lưới chỉ tin chuỗi dài nhất'
            : 'Rejected: Network only trusts the longest chain',
          subtitle: isVi
            ? 'Trong khi hacker loay hoay đào lại, mạng P2P trung thực đã tiến đến Khối #5. Nhánh cam bị đào thải.'
            : 'While the attacker was re-mining, the honest network reached Block #5. Attacker fork is orphaned.',
          color: 'cyan',
          icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />,
        };
      default:
        return {
          title: isVi
            ? 'Chuỗi chính thống: Mọi khối liên kết mật mã toàn vẹn'
            : 'Canonical Chain: All blocks cryptographically linked',
          subtitle: isVi
            ? 'Bấm ▶ để quan sát kịch bản mô phỏng 4 nhịp (8 giây).'
            : 'Click ▶ to watch the 4-phase auto simulation (8 seconds).',
          color: 'cyan',
          icon: <CheckCircle2 className="w-5 h-5 text-cyan-400" />,
        };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="space-y-6 font-sans select-none animate-in fade-in duration-200">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            {isVi ? 'Giai đoạn 04 · Kháng giả mạo' : 'Stage 04 · Tamper Resistance'}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {isVi
              ? 'Mô Phỏng Trực Quan: Tại Sao Không Thể Sửa Đổi Blockchain?'
              : 'Visual Simulation: Why Blockchain History Is Immutable?'}
          </h2>
        </div>

        {/* Total timer indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-slate-300 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{(currentTime / 1000).toFixed(1)}s / 8.0s</span>
        </div>
      </div>

      {/* 2. THE SINGLE PROMINENT CENTRAL STATUS FRAME (No Wall of Text) */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
          status.color === 'rose'
            ? 'bg-[#180A12] border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/40'
            : status.color === 'amber'
            ? 'bg-[#1C1307] border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40'
            : 'bg-[#07131F] border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/30'
        }`}
      >
        {/* Progress scanline along top border */}
        <div
          className={`absolute top-0 left-0 h-1 transition-all duration-75 ${
            status.color === 'rose'
              ? 'bg-rose-500'
              : status.color === 'amber'
              ? 'bg-amber-400'
              : 'bg-cyan-400'
          }`}
          style={{ width: `${(currentTime / 8000) * 100}%` }}
        />

        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 border ${
              status.color === 'rose'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : status.color === 'amber'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
            }`}
          >
            {status.icon}
          </div>

          <div className="space-y-1">
            <h3
              className={`text-lg sm:text-2xl font-bold tracking-tight leading-tight ${
                status.color === 'rose'
                  ? 'text-rose-300'
                  : status.color === 'amber'
                  ? 'text-amber-300'
                  : 'text-cyan-300'
              }`}
            >
              {status.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {status.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 3. VISUAL STAGE: BLOCKS & CHAIN RENDERING */}
      {currentPhase === 4 ? (
        /* PHASE 4 SPECIAL VIEW: HONEST CHAIN EXTENSION (TOP) VS FORK ORPHANED (BOTTOM) */
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Track 1: Honest Canonical Chain (#0 -> #1 -> #2 -> #3 -> #4 -> #5) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#06121E] border-2 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                <span className="text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wide">
                  {isVi
                    ? 'Chuỗi Chính Thống (Mạng P2P) · Độ Khó Tích Lũy Lớn Nhất'
                    : 'Canonical Chain (P2P Network) · Greatest Cumulative Difficulty'}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 text-[11px] font-bold">
                {isVi ? 'HỢP LỆ 100% · DÀI HƠN' : '100% VALID · LONGER'}
              </span>
            </div>

            {/* Blocks Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {[
                { idx: 0, data: 'Genesis DLU', prev: HASHES.genesisPrev, hash: HASHES.block0 },
                { idx: 1, data: 'Alice ➔ 10 Bob', prev: HASHES.block0, hash: HASHES.block1Clean },
                { idx: 2, data: 'Bob ➔ 5 Charlie', prev: HASHES.block1Clean, hash: HASHES.block2Clean },
                { idx: 3, data: 'Charlie ➔ 2 Dave', prev: HASHES.block2Clean, hash: HASHES.block3Clean },
                { idx: 4, data: 'Dave ➔ 1 Eve', prev: HASHES.block3Clean, hash: HASHES.block4, isNew: true },
                { idx: 5, data: 'Eve ➔ 0.5 Frank', prev: HASHES.block4, hash: HASHES.block5, isNew: true },
              ].map((b) => (
                <div
                  key={b.idx}
                  className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 bg-[#0A1829] ${
                    b.isNew
                      ? 'border-cyan-400 ring-1 ring-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">#{b.idx}</span>
                    {b.isNew && (
                      <span className="text-[10px] font-bold text-cyan-300 px-1.5 py-0.2 bg-cyan-500/20 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium truncate" title={b.data}>
                    {b.data}
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400/90 pt-1 border-t border-cyan-500/20 truncate">
                    Hash: {b.hash}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Track 2: Attacker's Orphaned Fork (Mờ 35% + Nhãn Đào Thải Lớn) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#140D07] border border-amber-500/30 relative overflow-hidden transition-all duration-300 opacity-35 hover:opacity-75">
            {/* Big Rejection Stamped Banner */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="px-6 py-2.5 rounded-xl bg-rose-950/90 border-2 border-rose-500 text-rose-200 text-sm sm:text-base font-bold tracking-wider uppercase shadow-2xl flex items-center gap-2 transform -rotate-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>
                  {isVi
                    ? 'ĐÃ BỊ ĐÀO THẢI · NHÁNH MỒ CÔI (ORPHANED)'
                    : 'REJECTED · ORPHANED FORK'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <GitFork className="w-4 h-4" />
                <span>{isVi ? 'Nhánh Giả Mạo Của Hacker (Chỉ Dài 4 Khối)' : 'Attacker Fork (Only 4 Blocks)'}</span>
              </div>
              <span className="text-[11px] font-mono text-rose-400">
                {isVi ? 'Thua sức mạnh tính toán 51%' : 'Lacks 51% network hashpower'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
              {[
                { idx: 0, data: 'Genesis DLU', hash: HASHES.block0 },
                { idx: 1, data: 'Alice ➔ 999 Hacker', hash: HASHES.block1Tampered, tampered: true },
                { idx: 2, data: 'Bob ➔ 5 Charlie', hash: HASHES.block2Remined, remined: true },
                { idx: 3, data: 'Charlie ➔ 2 Dave', hash: HASHES.block3Remined, remined: true },
              ].map((b) => (
                <div
                  key={b.idx}
                  className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 bg-[#1C1208] ${
                    b.tampered
                      ? 'border-rose-500/60 text-rose-200'
                      : 'border-amber-500/50 text-amber-200'
                  }`}
                >
                  <span className="text-xs font-bold">#{b.idx} (Fork)</span>
                  <div className="text-[11px] font-medium truncate">{b.data}</div>
                  <div className="text-[11px] font-mono opacity-80 truncate">Hash: {b.hash}...</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* PHASES 0, 1, 2, 3: THE 4 CORE BLOCKS WITH FOCUSED MUTATION & FRACTURE */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          {/* BLOCK #0: GENESIS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#081424] border border-cyan-500/40 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
              <span className="text-xs font-bold text-white tracking-wide">
                {isVi ? 'KHỐI #0' : 'BLOCK #0'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase">
                {isVi ? 'Gốc Hợp Lệ' : 'Root Valid'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">PrevHash:</span>
                <div className="p-2 rounded-lg bg-black/40 border border-white/[0.08] font-mono text-cyan-300">
                  {HASHES.genesisPrev}...
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isVi ? 'Giao dịch:' : 'Transaction:'}
                </span>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.08] text-slate-200 font-medium">
                  {isVi ? 'Khởi tạo DLU Genesis' : 'DLU Genesis Anchor'}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">BlockHash:</span>
                <div className="p-2 rounded-lg bg-black/40 border border-cyan-500/30 font-mono text-cyan-300 font-bold">
                  {HASHES.block0}...
                </div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs text-center font-medium flex items-center justify-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>#0 ➔ #1: {isVi ? 'Khớp 100%' : 'Sealed'}</span>
            </div>
          </div>

          {/* BLOCK #1: THE ATTACK POINT */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
              currentPhase >= 1
                ? 'bg-[#1C0913] border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/50'
                : 'bg-[#081424] border-cyan-500/40'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-2 border-b ${
                currentPhase >= 1 ? 'border-rose-500/30' : 'border-cyan-500/20'
              }`}
            >
              <span
                className={`text-xs font-bold tracking-wide ${
                  currentPhase >= 1 ? 'text-rose-200' : 'text-white'
                }`}
              >
                {isVi ? 'KHỐI #1' : 'BLOCK #1'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                  currentPhase >= 1
                    ? 'bg-rose-500/30 text-rose-200 border border-rose-500 animate-pulse'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {currentPhase >= 1
                  ? isVi
                    ? 'DỮ LIỆU BỊ SỬA'
                    : 'DATA TAMPERED'
                  : isVi
                  ? 'HỢP LỆ'
                  : 'VALID'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">PrevHash:</span>
                <div className="p-2 rounded-lg bg-black/40 border border-white/[0.08] font-mono text-cyan-300">
                  {HASHES.block0}...
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isVi ? 'Giao dịch:' : 'Transaction:'}
                </span>
                <div
                  className={`p-2.5 rounded-lg font-medium transition-all duration-300 ${
                    currentPhase >= 1
                      ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-100 font-bold shadow-inner'
                      : 'bg-black/40 border border-white/[0.08] text-slate-200'
                  }`}
                >
                  {currentPhase >= 1 ? (
                    <span className="text-rose-200 flex items-center justify-between">
                      <span>Alice ➔ 999 COIN ➔ Hacker</span>
                      <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
                    </span>
                  ) : (
                    <span>Alice ➔ 10 COIN ➔ Bob</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">BlockHash:</span>
                <div
                  className={`p-2 rounded-lg font-mono font-bold transition-all duration-300 ${
                    currentPhase >= 1
                      ? 'bg-rose-950/60 border border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse'
                      : 'bg-black/40 border border-cyan-500/30 text-cyan-300'
                  }`}
                >
                  {currentPhase >= 1 ? `${HASHES.block1Tampered}...` : `${HASHES.block1Clean}...`}
                </div>
              </div>
            </div>

            {/* CONNECTOR TO #2 */}
            <div
              className={`p-2 rounded-xl text-xs text-center font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${
                currentPhase === 1 || currentPhase === 2
                  ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
                  : currentPhase === 3
                  ? 'bg-amber-500/20 border border-amber-500 text-amber-200'
                  : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
              }`}
            >
              {currentPhase === 1 || currentPhase === 2 ? (
                <>
                  <Zap className="w-4 h-4 text-rose-400 fill-rose-500" />
                  <span>#1 ➔ #2: {isVi ? 'ĐỨT GÃY LIÊN KẾT!' : 'BROKEN LINK!'}</span>
                </>
              ) : currentPhase === 3 ? (
                <>
                  <GitFork className="w-4 h-4 text-amber-400" />
                  <span>#1 ➔ #2: {isVi ? 'Đã vá (Nhánh rẽ)' : 'Patched (Fork)'}</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>#1 ➔ #2: {isVi ? 'Khớp 100%' : 'Sealed'}</span>
                </>
              )}
            </div>
          </div>

          {/* BLOCK #2: THE REACTION / RE-MINING POINT */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden ${
              currentPhase === 1 || currentPhase === 2
                ? 'bg-[#160B12] border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : currentPhase === 3
                ? 'bg-[#1C1207] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50'
                : 'bg-[#081424] border-cyan-500/40'
            }`}
          >
            {/* Mining beam in Phase 3 */}
            {currentPhase === 3 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/15 to-transparent animate-pulse pointer-events-none" />
            )}

            <div
              className={`flex items-center justify-between pb-2 border-b ${
                currentPhase === 1 || currentPhase === 2
                  ? 'border-rose-500/30'
                  : currentPhase === 3
                  ? 'border-amber-500/30'
                  : 'border-cyan-500/20'
              }`}
            >
              <span
                className={`text-xs font-bold tracking-wide ${
                  currentPhase === 3 ? 'text-amber-200' : 'text-white'
                }`}
              >
                {isVi ? 'KHỐI #2' : 'BLOCK #2'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  currentPhase === 1 || currentPhase === 2
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : currentPhase === 3
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {currentPhase === 1 || currentPhase === 2
                  ? isVi
                    ? 'TỪ CHỐI'
                    : 'REJECTED'
                  : currentPhase === 3
                  ? isVi
                    ? 'ĐÃ ĐÀO LẠI'
                    : 'RE-MINED'
                  : isVi
                  ? 'HỢP LỆ'
                  : 'VALID'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">PrevHash:</span>
                <div
                  className={`p-2 rounded-lg font-mono font-bold transition-all ${
                    currentPhase === 1 || currentPhase === 2
                      ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-200 animate-pulse'
                      : currentPhase === 3
                      ? 'bg-amber-950/60 border border-amber-500/60 text-amber-200'
                      : 'bg-black/40 border border-white/[0.08] text-cyan-300'
                  }`}
                >
                  {currentPhase === 3
                    ? `${HASHES.block1Tampered}...`
                    : `${HASHES.block1Clean}...`}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isVi ? 'Giao dịch:' : 'Transaction:'}
                </span>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.08] text-slate-200 font-medium">
                  Bob ➔ 5 COIN ➔ Charlie
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">BlockHash:</span>
                <div
                  className={`p-2 rounded-lg font-mono font-bold ${
                    currentPhase === 3
                      ? 'bg-amber-950/60 border border-amber-500 text-amber-300'
                      : 'bg-black/40 border border-cyan-500/30 text-cyan-300'
                  }`}
                >
                  {currentPhase === 3 ? `${HASHES.block2Remined}...` : `${HASHES.block2Clean}...`}
                </div>
              </div>
            </div>

            {/* CONNECTOR TO #3 */}
            <div
              className={`p-2 rounded-xl text-xs text-center font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${
                currentPhase === 3
                  ? 'bg-amber-500/20 border border-amber-500 text-amber-200'
                  : currentPhase >= 1
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
              }`}
            >
              {currentPhase === 3 ? (
                <>
                  <GitFork className="w-3.5 h-3.5 text-amber-400" />
                  <span>#2 ➔ #3: {isVi ? 'Đã đào lại' : 'Re-mined'}</span>
                </>
              ) : currentPhase >= 1 ? (
                <span>#2 ➔ #3: {isVi ? 'Vô hiệu hóa' : 'Orphaned'}</span>
              ) : (
                <>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>#2 ➔ #3: {isVi ? 'Khớp 100%' : 'Sealed'}</span>
                </>
              )}
            </div>
          </div>

          {/* BLOCK #3: DOWNSTREAM ORPHANED / RE-MINED */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
              currentPhase === 3
                ? 'bg-[#1C1207] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50'
                : currentPhase >= 1
                ? 'bg-[#0F1420] border-slate-700/80 opacity-70'
                : 'bg-[#081424] border-cyan-500/40'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-xs font-bold text-white tracking-wide">
                {isVi ? 'KHỐI #3' : 'BLOCK #3'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  currentPhase === 3
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500'
                    : currentPhase >= 1
                    ? 'bg-slate-800 text-slate-300 border border-slate-600'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {currentPhase === 3
                  ? isVi
                    ? 'ĐÃ ĐÀO LẠI'
                    : 'RE-MINED'
                  : currentPhase >= 1
                  ? isVi
                    ? 'VÔ HIỆU'
                    : 'ORPHANED'
                  : isVi
                  ? 'HỢP LỆ'
                  : 'VALID'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">PrevHash:</span>
                <div className="p-2 rounded-lg bg-black/40 border border-white/[0.08] font-mono text-slate-300">
                  {currentPhase === 3
                    ? `${HASHES.block2Remined}...`
                    : `${HASHES.block2Clean}...`}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isVi ? 'Giao dịch:' : 'Transaction:'}
                </span>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.08] text-slate-200 font-medium">
                  Charlie ➔ 2 COIN ➔ Dave
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">BlockHash:</span>
                <div
                  className={`p-2 rounded-lg font-mono font-bold ${
                    currentPhase === 3
                      ? 'bg-amber-950/60 border border-amber-500 text-amber-300'
                      : 'bg-black/40 border border-cyan-500/30 text-cyan-300'
                  }`}
                >
                  {currentPhase === 3 ? `${HASHES.block3Remined}...` : `${HASHES.block3Clean}...`}
                </div>
              </div>
            </div>

            <div
              className={`p-2 rounded-xl text-xs text-center font-medium ${
                currentPhase === 3
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                  : 'bg-black/30 border border-white/[0.06] text-slate-400'
              }`}
            >
              {currentPhase === 3
                ? isVi
                  ? 'Khớp toán học trên nhánh rẽ'
                  : 'Mathematically sealed on fork'
                : isVi
                ? 'Đỉnh chuỗi hiện tại'
                : 'Current tip'}
            </div>
          </div>
        </div>
      )}

      {/* 4. MINIMALIST FLOATING DOCK (CENTERED CONTROLS & STEPPER DOTS) */}
      <div className="sticky bottom-4 z-30 flex justify-center px-2">
        <div className="w-full max-w-4xl p-3 sm:p-4 rounded-2xl bg-[#090D16]/95 backdrop-blur-xl border border-white/[0.15] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Media Controls (International Standard Icon-Only) */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            {/* Play/Pause circular toggle */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg shrink-0 hover:scale-105 active:scale-95 ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_16px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/40'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_16px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/40'
              }`}
              title={
                isPlaying
                  ? isVi ? 'Tạm dừng (Pause)' : 'Pause'
                  : currentTime >= 8000
                  ? isVi ? 'Xem lại từ đầu (Replay)' : 'Replay'
                  : isVi ? 'Bắt đầu xem (Play)' : 'Play'
              }
              aria-label={
                isPlaying
                  ? isVi ? 'Tạm dừng' : 'Pause'
                  : isVi ? 'Phát' : 'Play'
              }
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Replay circular button */}
            <button
              type="button"
              onClick={handleReset}
              className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
              title={isVi ? 'Làm lại từ đầu (↺)' : 'Reset to start (↺)'}
              aria-label={isVi ? 'Làm lại từ đầu' : 'Reset to start'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Stepper Dots with Direct Phase Jump */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto py-1">
            {[
              { phase: 1 as const, vi: '1. Sửa đổi', en: '1. Tamper', time: '0-2s' },
              { phase: 2 as const, vi: '2. Gãy chuỗi', en: '2. Fracture', time: '2-4s' },
              { phase: 3 as const, vi: '3. Đào lại', en: '3. Re-mine', time: '4-6.5s' },
              { phase: 4 as const, vi: '4. Đào thải', en: '4. Reject', time: '6.5-8s' },
            ].map((step) => {
              const isActive = currentPhase === step.phase;
              return (
                <button
                  key={step.phase}
                  type="button"
                  onClick={() => handleJumpToPhase(step.phase)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? step.phase === 4
                        ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : step.phase === 3
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'bg-rose-500/25 text-rose-200 border border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                      : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isActive
                        ? step.phase === 4
                          ? 'bg-cyan-400 animate-ping'
                          : step.phase === 3
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-rose-400 animate-ping'
                        : 'bg-slate-600'
                    }`}
                  />
                  <span>{isVi ? step.vi : step.en}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Navigation Link to next section */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.06] text-xs text-slate-400">
        <span>
          {isVi
            ? 'Tiếp theo: Tìm hiểu 4 trụ cột Mật Mã Học Nền Tảng (Hash, Asymmetric, Signature, Zero-Knowledge)'
            : 'Next: Explore fundamental Cryptography concepts (Hash, Asymmetric, Signature, ZK)'}
        </span>

        <button
          type="button"
          onClick={onNextStage}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-cyan-300 hover:text-cyan-200 font-medium transition-all cursor-pointer"
        >
          <span>{isVi ? 'Sang Mật Mã Học Nền Tảng' : 'Continue to Cryptography'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
