import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { RoundState } from '../types';
import { uint32ToHex } from '../utils/binary';

export type SimulationStep = 'shift' | 'mix' | 'update';

interface Sha256RoundSimulatorProps {
  rounds: RoundState[];
  onFeedForward: () => void;
  isVi: boolean;
}

export const Sha256RoundSimulator: React.FC<Sha256RoundSimulatorProps> = ({
  rounds,
  onFeedForward,
  isVi,
}) => {
  const [selectedRound, setSelectedRound] = useState<number>(0);
  const [simulationStep, setSimulationStep] = useState<SimulationStep>('shift');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x: 750ms/step | 0.5x: 1300ms/step
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Lấy dữ liệu vòng hiện tại
  const currentRoundState = rounds[selectedRound] || rounds[0];

  // Giá trị 8 biến trước khi vòng bắt đầu (round input)
  const prevA = currentRoundState.prevA ?? currentRoundState.a;
  const prevB = currentRoundState.prevB ?? currentRoundState.b;
  const prevC = currentRoundState.prevC ?? currentRoundState.c;
  const prevD = currentRoundState.prevD ?? currentRoundState.d;
  const prevE = currentRoundState.prevE ?? currentRoundState.e;
  const prevF = currentRoundState.prevF ?? currentRoundState.f;
  const prevG = currentRoundState.prevG ?? currentRoundState.g;
  const prevH = currentRoundState.prevH ?? currentRoundState.h;

  // Chuyển bước tuần tự: 1. Dịch -> 2. Trộn -> 3. Tạo trạng thái mới -> Vòng tiếp theo
  const handleStepNext = () => {
    if (simulationStep === 'shift') {
      setSimulationStep('mix');
    } else if (simulationStep === 'mix') {
      setSimulationStep('update');
    } else {
      if (selectedRound >= 63) {
        setIsPlaying(false);
        onFeedForward();
      } else {
        setSelectedRound((r) => r + 1);
        setSimulationStep('shift');
      }
    }
  };

  // Phím Space = BƯỚC TIẾP
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleStepNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRound, simulationStep, onFeedForward]);

  // Auto-play: chuyển tuần tự Dịch -> Trộn -> Tạo trạng thái mới -> Vòng tiếp
  useEffect(() => {
    if (!isPlaying) return;

    const stepDuration = playbackSpeed === 0.5 ? 1300 : 750;

    const timer = setTimeout(() => {
      if (simulationStep === 'shift') {
        setSimulationStep('mix');
      } else if (simulationStep === 'mix') {
        setSimulationStep('update');
      } else {
        if (selectedRound >= 63) {
          setIsPlaying(false);
        } else {
          setSelectedRound((r) => r + 1);
          setSimulationStep('shift');
        }
      }
    }, stepDuration);

    return () => clearTimeout(timer);
  }, [isPlaying, simulationStep, selectedRound, playbackSpeed]);

  const handleReset = () => {
    setIsPlaying(false);
    setSelectedRound(0);
    setSimulationStep('shift');
  };

  const handleSelectKeyFrame = (roundNum: number) => {
    setIsPlaying(false);
    setSelectedRound(roundNum);
    setSimulationStep('shift');
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setSelectedRound(Number(e.target.value));
    setSimulationStep('shift');
  };

  // Giá trị hiển thị 8 biến theo 3 bước:
  // - Bước 1 (Dịch): b=a_cũ, c=b_cũ, d=c_cũ, f=e_cũ, g=f_cũ, h=g_cũ; a và e chờ nạp
  // - Bước 2 (Trộn): các biến dịch giữ nguyên; T1, T2 được tính toán
  // - Bước 3 (Tạo trạng thái mới): a = T1 + T2, e = d_cũ + T1; hoàn tất vòng
  const displayVars = {
    a: simulationStep === 'update' ? currentRoundState.a : prevA,
    b: currentRoundState.b, // = prevA
    c: currentRoundState.c, // = prevB
    d: currentRoundState.d, // = prevC
    e: simulationStep === 'update' ? currentRoundState.e : prevE,
    f: currentRoundState.f, // = prevE
    g: currentRoundState.g, // = prevF
    h: currentRoundState.h, // = prevG
  };

  return (
    <div ref={containerRef} className="space-y-4 font-sans text-slate-200">
      {/* 1. THANH ĐIỀU KHIỂN & TIẾN TRÌNH VÒNG */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Round Indicator: Vòng X / 64 & Mốc [0] [16] [63] */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                {isVi ? `Vòng ${selectedRound + 1} / 64` : `Round ${selectedRound + 1} / 64`}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                (t = {selectedRound})
              </span>
            </div>

            {/* Mốc quan trọng */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleSelectKeyFrame(0)}
                className={`px-2 py-0.5 rounded cursor-pointer border transition-colors motion-reduce:transition-none ${
                  selectedRound === 0
                    ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                    : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                }`}
                title={isVi ? '0 — Khởi tạo' : '0 — Initial state'}
                aria-label="Round 0 Initial state"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleSelectKeyFrame(16)}
                className={`px-2 py-0.5 rounded cursor-pointer border transition-colors motion-reduce:transition-none ${
                  selectedRound === 16
                    ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                    : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                }`}
                title={isVi ? '16 — Mở rộng W' : '16 — Expanded W'}
                aria-label="Round 16 Expanded message schedule"
              >
                16
              </button>
              <button
                type="button"
                onClick={() => handleSelectKeyFrame(63)}
                className={`px-2 py-0.5 rounded cursor-pointer border transition-colors motion-reduce:transition-none ${
                  selectedRound === 63
                    ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                    : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                }`}
                title={isVi ? '63 — Vòng cuối' : '63 — Final round'}
                aria-label="Round 63 Final round"
              >
                63
              </button>
            </div>
          </div>

          {/* Cụm công cụ: Tự động, Tốc độ, Về đầu, Bước tiếp */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Tự chạy / Tạm dừng */}
            <button
              type="button"
              id="btn-pipeline-autoplay"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`h-8 px-3 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer motion-reduce:transition-none ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold'
              }`}
              aria-label={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>{isVi ? 'Tạm dừng' : 'Pause'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  <span>{isVi ? 'Tự động' : 'Auto'}</span>
                </>
              )}
            </button>

            {/* Tốc độ: 0.5x | 1x */}
            <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setPlaybackSpeed(0.5)}
                className={`px-2 py-1 rounded font-mono font-semibold transition-colors cursor-pointer motion-reduce:transition-none ${
                  playbackSpeed === 0.5 ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Playback speed 0.5x"
              >
                0.5x
              </button>
              <button
                type="button"
                onClick={() => setPlaybackSpeed(1)}
                className={`px-2 py-1 rounded font-mono font-semibold transition-colors cursor-pointer motion-reduce:transition-none ${
                  playbackSpeed === 1 ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Playback speed 1x"
              >
                1x
              </button>
            </div>

            {/* Về đầu */}
            <button
              type="button"
              id="btn-pipeline-reset"
              onClick={handleReset}
              className="h-8 px-2.5 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1 motion-reduce:transition-none"
              title={isVi ? 'Quay về Vòng 0' : 'Reset to Round 0'}
              aria-label="Reset to round 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isVi ? 'Về đầu' : 'Reset'}</span>
            </button>

            {/* Bước tiếp (Space) */}
            <button
              type="button"
              id="btn-pipeline-next"
              onClick={handleStepNext}
              className={`h-8 px-3.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer motion-reduce:transition-none ${
                selectedRound >= 63 && simulationStep === 'update'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-emerald-400'
                  : 'bg-slate-950 hover:bg-slate-900 text-white border-slate-700 hover:border-slate-600'
              }`}
              aria-label="Step to next action or round"
            >
              <span>
                {selectedRound >= 63 && simulationStep === 'update'
                  ? (isVi ? 'Feed-forward →' : 'Feed-forward →')
                  : (isVi ? 'Bước tiếp' : 'Next Step')}
              </span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                Space
              </kbd>
            </button>
          </div>
        </div>

        {/* Slider 0..63 */}
        <div className="pt-1">
          <input
            type="range"
            id="pipeline-round-slider"
            min={0}
            max={63}
            value={selectedRound}
            onChange={handleSliderChange}
            className="w-full accent-sky-400 bg-slate-950 h-2 rounded cursor-pointer border border-slate-800"
            aria-label="Select compression round slider"
          />
        </div>
      </div>

      {/* 2. THANH 3 BƯỚC TRỰC QUAN (DỊCH → TRỘN → TẠO TRẠNG THÁI MỚI) */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setSimulationStep('shift')}
            className={`px-3 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer motion-reduce:transition-none ${
              simulationStep === 'shift'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            1. {isVi ? 'Dịch' : 'Shift'}
          </button>
          <button
            type="button"
            onClick={() => setSimulationStep('mix')}
            className={`px-3 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer motion-reduce:transition-none ${
              simulationStep === 'mix'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            2. {isVi ? 'Trộn' : 'Mix'}
          </button>
          <button
            type="button"
            onClick={() => setSimulationStep('update')}
            className={`px-3 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer motion-reduce:transition-none ${
              simulationStep === 'update'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            3. {isVi ? 'Tạo trạng thái mới' : 'New State'}
          </button>
        </div>

        {/* Thông điệp 1 câu súc tích */}
        <div className="text-slate-300 text-xs font-sans">
          {simulationStep === 'shift' && (
            <span>{isVi ? 'Các giá trị cũ dịch sang vị trí mới.' : 'Old values shift to new register positions.'}</span>
          )}
          {simulationStep === 'mix' && (
            <span>{isVi ? 'SHA-256 trộn trạng thái hiện tại với dữ liệu của vòng.' : 'SHA-256 mixes current state with round data (K, W) to produce T₁ & T₂.'}</span>
          )}
          {simulationStep === 'update' && (
            <span>{isVi ? 'Các giá trị mới được tạo, rồi bắt đầu vòng tiếp theo.' : 'New values created (T₁+T₂ → a\', d+T₁ → e\'), ready for next round.'}</span>
          )}
        </div>
      </div>

      {/* 3. HÀNG 8 BIẾN TRẠNG THÁI 32-BIT (GỌN GÀNG, KHÔNG CARD LỚN, KHÔNG TEXT THỪA) */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-sans">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">
            {isVi ? '8 Biến trạng thái (a … h):' : '8 Working Variables (a … h):'}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {simulationStep === 'shift' && (isVi ? '1. Dịch trạng thái' : '1. Shift state')}
            {simulationStep === 'mix' && (isVi ? '2. Bộ trộn K, W → T₁, T₂' : '2. Mixer K, W → T₁, T₂')}
            {simulationStep === 'update' && (isVi ? '3. Cập nhật hoàn tất' : '3. State updated')}
          </span>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {/* a */}
          <div
            className={`p-2 rounded-lg border transition-all motion-reduce:transition-none ${
              simulationStep === 'update'
                ? 'bg-slate-900 border-cyan-500 ring-1 ring-cyan-500/40'
                : 'bg-slate-900/50 border-dashed border-sky-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-cyan-400">a</span>
              <span className="text-[10px] font-mono text-slate-400">
                {simulationStep === 'update' ? 'T₁+T₂' : (isVi ? 'chờ' : 'wait')}
              </span>
            </div>
            <div className="text-xs font-mono font-bold mt-1 text-cyan-300 truncate select-all">
              0x{uint32ToHex(displayVars.a)}
            </div>
          </div>

          {/* b */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300">b</span>
              <span className="text-[10px] font-mono text-slate-500">← a</span>
            </div>
            <div className="text-xs font-mono font-bold mt-1 text-slate-200 truncate select-all">
              0x{uint32ToHex(displayVars.b)}
            </div>
          </div>

          {/* c */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300">c</span>
              <span className="text-[10px] font-mono text-slate-500">← b</span>
            </div>
            <div className="text-xs font-mono font-bold mt-1 text-slate-200 truncate select-all">
              0x{uint32ToHex(displayVars.c)}
            </div>
          </div>

          {/* d */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300">d</span>
              <span className="text-[10px] font-mono text-slate-500">← c</span>
            </div>
            <div className="text-xs font-mono font-bold mt-1 text-slate-200 truncate select-all">
              0x{uint32ToHex(displayVars.d)}
            </div>
          </div>

          {/* e */}
          <div
            className={`p-2 rounded-lg border transition-all motion-reduce:transition-none ${
              simulationStep === 'update'
                ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500/40'
                : 'bg-slate-900/50 border-dashed border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-400">e</span>
              <span className="text-[10px] font-mono text-slate-400">
                {simulationStep === 'update' ? 'd+T₁' : (isVi ? 'chờ' : 'wait')}
              </span>
            </div>
            <div className="text-xs font-mono font-bold mt-1 text-emerald-300 truncate select-all">
              0x{uint32ToHex(displayVars.e)}
            </div>
          </div>

          {/* f */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300">f</span>
              <span className="text-[10px] font-mono text-slate-500">← e</span>
            </div>
            <div className="text-xs font-mono font-bold mt-1 text-slate-200 truncate select-all">
              0x{uint32ToHex(displayVars.f)}
            </div>
          </div>

          {/* g */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300">g</span>
              <span className="text-[10px] font-mono text-slate-500">← f</span>
            </div>
            <div className="text-xs font-mono font-bold mt-1 text-slate-200 truncate select-all">
              0x{uint32ToHex(displayVars.g)}
            </div>
          </div>

          {/* h */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300">h</span>
              <span className="text-[10px] font-mono text-slate-500">← g</span>
            </div>
            <div className="text-xs font-mono font-bold mt-1 text-slate-200 truncate select-all">
              0x{uint32ToHex(displayVars.h)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. SƠ ĐỒ LUỒNG DỮ LIỆU (SHOW, DON'T EXPLAIN) */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[760px] py-1">
            <svg viewBox="0 0 760 175" className="w-full h-auto text-slate-200 select-none">
              <defs>
                <marker id="arr-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#06b6d4" />
                </marker>
                <marker id="arr-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
                </marker>
                <marker id="arr-slate" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b" />
                </marker>
                <marker id="arr-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
                </marker>
              </defs>

              {/* 8 Ô THANH GHI TRẠNG THÁI: a...h */}
              {[
                { name: 'a', x: 20, isTarget: true, val: displayVars.a },
                { name: 'b', x: 110, isTarget: false, val: displayVars.b },
                { name: 'c', x: 200, isTarget: false, val: displayVars.c },
                { name: 'd', x: 290, isTarget: false, val: displayVars.d },
                { name: 'e', x: 400, isTarget: true, val: displayVars.e },
                { name: 'f', x: 490, isTarget: false, val: displayVars.f },
                { name: 'g', x: 580, isTarget: false, val: displayVars.g },
                { name: 'h', x: 670, isTarget: false, val: displayVars.h },
              ].map((reg) => (
                <g key={reg.name} transform={`translate(${reg.x}, 12)`}>
                  <rect
                    width="70"
                    height="42"
                    rx="6"
                    fill="#0f172a"
                    stroke={
                      reg.isTarget
                        ? simulationStep === 'update'
                          ? reg.name === 'a'
                            ? '#06b6d4'
                            : '#10b981'
                          : '#334155'
                        : '#334155'
                    }
                    strokeWidth={reg.isTarget && simulationStep === 'update' ? '2' : '1'}
                    strokeDasharray={reg.isTarget && simulationStep !== 'update' ? '3 3' : undefined}
                  />
                  <text
                    x="35"
                    y="17"
                    textAnchor="middle"
                    fill={reg.isTarget && simulationStep === 'update' ? (reg.name === 'a' ? '#38bdf8' : '#34d399') : '#cbd5e1'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="system-ui, sans-serif"
                  >
                    {reg.name}
                  </text>
                  <text
                    x="35"
                    y="32"
                    textAnchor="middle"
                    fill={reg.isTarget && simulationStep === 'update' ? (reg.name === 'a' ? '#38bdf8' : '#34d399') : '#94a3b8'}
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {uint32ToHex(reg.val).substring(0, 6)}…
                  </text>
                </g>
              ))}

              {/* BƯỚC 1: MŨI TÊN DỊCH CHUYỂN TUẦN TỰ */}
              {/* a -> b */}
              <path
                d="M 90 33 L 108 33"
                stroke={simulationStep === 'shift' ? '#38bdf8' : '#475569'}
                strokeWidth={simulationStep === 'shift' ? '2' : '1'}
                markerEnd={simulationStep === 'shift' ? 'url(#arr-cyan)' : 'url(#arr-slate)'}
              />
              {/* b -> c */}
              <path
                d="M 180 33 L 198 33"
                stroke={simulationStep === 'shift' ? '#38bdf8' : '#475569'}
                strokeWidth={simulationStep === 'shift' ? '2' : '1'}
                markerEnd={simulationStep === 'shift' ? 'url(#arr-cyan)' : 'url(#arr-slate)'}
              />
              {/* c -> d */}
              <path
                d="M 270 33 L 288 33"
                stroke={simulationStep === 'shift' ? '#38bdf8' : '#475569'}
                strokeWidth={simulationStep === 'shift' ? '2' : '1'}
                markerEnd={simulationStep === 'shift' ? 'url(#arr-cyan)' : 'url(#arr-slate)'}
              />

              {/* e -> f */}
              <path
                d="M 470 33 L 488 33"
                stroke={simulationStep === 'shift' ? '#34d399' : '#475569'}
                strokeWidth={simulationStep === 'shift' ? '2' : '1'}
                markerEnd={simulationStep === 'shift' ? 'url(#arr-emerald)' : 'url(#arr-slate)'}
              />
              {/* f -> g */}
              <path
                d="M 560 33 L 578 33"
                stroke={simulationStep === 'shift' ? '#34d399' : '#475569'}
                strokeWidth={simulationStep === 'shift' ? '2' : '1'}
                markerEnd={simulationStep === 'shift' ? 'url(#arr-emerald)' : 'url(#arr-slate)'}
              />
              {/* g -> h */}
              <path
                d="M 650 33 L 668 33"
                stroke={simulationStep === 'shift' ? '#34d399' : '#475569'}
                strokeWidth={simulationStep === 'shift' ? '2' : '1'}
                markerEnd={simulationStep === 'shift' ? 'url(#arr-emerald)' : 'url(#arr-slate)'}
              />

              {/* BƯỚC 2: BỘ TRỘN K[t], W[t] -> T1, T2 */}
              {/* Khối T1 */}
              <g transform="translate(370, 115)">
                <rect
                  width="110"
                  height="36"
                  rx="6"
                  fill="#090d16"
                  stroke={simulationStep === 'mix' ? '#06b6d4' : simulationStep === 'update' ? '#0891b2' : '#334155'}
                  strokeWidth={simulationStep === 'mix' ? '2' : '1'}
                />
                <text x="55" y="15" textAnchor="middle" fill={simulationStep === 'mix' ? '#bae6fd' : '#94a3b8'} fontSize="10" fontWeight="bold">
                  T₁
                </text>
                <text x="55" y="28" textAnchor="middle" fill={simulationStep === 'mix' ? '#38bdf8' : '#64748b'} fontSize="10" fontFamily="monospace">
                  {uint32ToHex(currentRoundState.t1).substring(0, 6)}…
                </text>
              </g>

              {/* Khối T2 */}
              <g transform="translate(100, 115)">
                <rect
                  width="110"
                  height="36"
                  rx="6"
                  fill="#090d16"
                  stroke={simulationStep === 'mix' ? '#818cf8' : simulationStep === 'update' ? '#6366f1' : '#334155'}
                  strokeWidth={simulationStep === 'mix' ? '2' : '1'}
                />
                <text x="55" y="15" textAnchor="middle" fill={simulationStep === 'mix' ? '#c7d2fe' : '#94a3b8'} fontSize="10" fontWeight="bold">
                  T₂
                </text>
                <text x="55" y="28" textAnchor="middle" fill={simulationStep === 'mix' ? '#a5b4fc' : '#64748b'} fontSize="10" fontFamily="monospace">
                  {uint32ToHex(currentRoundState.t2).substring(0, 6)}…
                </text>
              </g>

              {/* BƯỚC 3: TẠO TRẠNG THÁI MỚI (T1+T2 -> a', d+T1 -> e') */}
              {/* Bộ cộng cho a: T1 + T2 */}
              <circle
                cx="55"
                cy="88"
                r="10"
                fill="#0f172a"
                stroke={simulationStep === 'update' ? '#06b6d4' : '#475569'}
                strokeWidth={simulationStep === 'update' ? '2' : '1.5'}
              />
              <text x="55" y="92" textAnchor="middle" fill={simulationStep === 'update' ? '#06b6d4' : '#64748b'} fontSize="12" fontWeight="bold">
                +
              </text>

              {/* T2 -> Adder a */}
              <path
                d="M 100 133 C 70 133, 55 110, 55 98"
                fill="none"
                stroke={simulationStep === 'update' ? '#818cf8' : '#334155'}
                strokeWidth={simulationStep === 'update' ? '2' : '1.5'}
              />
              {/* T1 -> Adder a */}
              <path
                d="M 370 133 C 220 150, 55 125, 55 98"
                fill="none"
                stroke={simulationStep === 'update' ? '#06b6d4' : '#334155'}
                strokeWidth={simulationStep === 'update' ? '2' : '1.5'}
                strokeDasharray={simulationStep === 'update' ? '3 2' : undefined}
              />
              {/* Adder a -> a */}
              <path
                d="M 55 78 L 55 56"
                stroke={simulationStep === 'update' ? '#06b6d4' : '#475569'}
                strokeWidth={simulationStep === 'update' ? '2.5' : '1.5'}
                markerEnd={simulationStep === 'update' ? 'url(#arr-cyan)' : 'url(#arr-slate)'}
              />

              {/* Bộ cộng cho e: d_cũ + T1 */}
              <circle
                cx="435"
                cy="88"
                r="10"
                fill="#0f172a"
                stroke={simulationStep === 'update' ? '#10b981' : '#475569'}
                strokeWidth={simulationStep === 'update' ? '2' : '1.5'}
              />
              <text x="435" y="92" textAnchor="middle" fill={simulationStep === 'update' ? '#10b981' : '#64748b'} fontSize="12" fontWeight="bold">
                +
              </text>

              {/* T1 -> Adder e */}
              <path
                d="M 435 115 L 435 98"
                stroke={simulationStep === 'update' ? '#06b6d4' : '#334155'}
                strokeWidth={simulationStep === 'update' ? '2' : '1.5'}
              />
              {/* d_cũ -> Adder e */}
              <path
                d="M 325 54 C 325 78, 410 88, 425 88"
                fill="none"
                stroke={simulationStep === 'update' ? '#f59e0b' : '#334155'}
                strokeWidth={simulationStep === 'update' ? '2' : '1.5'}
                strokeDasharray="3 2"
                markerEnd={simulationStep === 'update' ? 'url(#arr-amber)' : 'url(#arr-slate)'}
              />
              {/* Adder e -> e */}
              <path
                d="M 435 78 L 435 56"
                stroke={simulationStep === 'update' ? '#10b981' : '#475569'}
                strokeWidth={simulationStep === 'update' ? '2.5' : '1.5'}
                markerEnd={simulationStep === 'update' ? 'url(#arr-emerald)' : 'url(#arr-slate)'}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 5. KHỐI TRỘN DỮ LIỆU & NÚT XEM CHI TIẾT (PROGRESSIVE DISCLOSURE) */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-white">
              {isVi ? 'Khối trộn:' : 'Mixer:'}
            </span>
            <span className="text-[11px] text-slate-400">
              K[{selectedRound}] & W[{selectedRound}] → T₁, T₂
            </span>
          </div>

          {/* Nút Xem chi tiết */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer motion-reduce:transition-none"
            aria-expanded={showDetails}
          >
            <span>
              {showDetails
                ? (isVi ? 'Ẩn chi tiết' : 'Hide details')
                : (isVi ? 'Xem chi tiết' : 'View details')}
            </span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* 4 Giá trị tóm tắt: K[t], W[t], T1, T2 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono">K[{selectedRound}]</div>
            <div className="font-mono font-bold text-amber-400 truncate mt-0.5 select-all">
              0x{uint32ToHex(currentRoundState.k)}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono">W[{selectedRound}]</div>
            <div className="font-mono font-bold text-teal-400 truncate mt-0.5 select-all">
              0x{uint32ToHex(currentRoundState.w)}
            </div>
          </div>

          <div
            className={`p-2 rounded-lg border transition-all motion-reduce:transition-none ${
              simulationStep === 'mix'
                ? 'bg-slate-900 border-sky-500/60 ring-1 ring-sky-500/30'
                : 'bg-slate-900/60 border-slate-800/80'
            }`}
          >
            <div className="text-[10px] text-slate-400 font-mono">T₁</div>
            <div className="font-mono font-bold text-sky-300 truncate mt-0.5 select-all">
              0x{uint32ToHex(currentRoundState.t1)}
            </div>
          </div>

          <div
            className={`p-2 rounded-lg border transition-all motion-reduce:transition-none ${
              simulationStep === 'mix'
                ? 'bg-slate-900 border-indigo-500/60 ring-1 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800/80'
            }`}
          >
            <div className="text-[10px] text-slate-400 font-mono">T₂</div>
            <div className="font-mono font-bold text-indigo-300 truncate mt-0.5 select-all">
              0x{uint32ToHex(currentRoundState.t2)}
            </div>
          </div>
        </div>

        {/* CHI TIẾT (CHỈ HIỆN KHI NGƯỜI DÙNG CLICK "XEM CHI TIẾT") */}
        {showDetails && (
          <div className="pt-3 border-t border-slate-800 space-y-3 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-mono text-sky-400 font-semibold">
                  T₁ = h + Σ₁(e) + Ch(e,f,g) + K[t] + W[t]
                </div>
                <div className="text-[11px] text-slate-400">
                  {isVi ? 'Tạo giá trị cho e\': ' : 'Creates value for e\': '}
                  <code className="text-emerald-300 font-mono">e' = d + T₁ (mod 2³²)</code>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-mono text-indigo-400 font-semibold">
                  T₂ = Σ₀(a) + Maj(a,b,c)
                </div>
                <div className="text-[11px] text-slate-400">
                  {isVi ? 'Tạo giá trị cho a\': ' : 'Creates value for a\': '}
                  <code className="text-cyan-300 font-mono">a' = T₁ + T₂ (mod 2³²)</code>
                </div>
              </div>
            </div>

            {/* Định nghĩa các hàm bitwise */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 space-y-2">
              <div className="font-semibold text-slate-200">
                {isVi ? 'Giải thích các hàm bitwise:' : 'Bitwise function definitions:'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                  <span className="font-mono font-bold text-sky-400">Σ₁(e):</span>{' '}
                  <span>{isVi ? 'Xoay phải và XOR ba kết quả.' : 'Rotate right and XOR 3 results.'}</span>
                  <div className="font-mono text-[10px] text-slate-400 mt-1">ROTR⁶(e) ⊕ ROTR¹¹(e) ⊕ ROTR²⁵(e)</div>
                </div>

                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                  <span className="font-mono font-bold text-emerald-400">Ch(e,f,g):</span>{' '}
                  <span>{isVi ? 'Chọn bit từ f hoặc g dựa trên bit tương ứng của e.' : 'Choose bit from f or g based on e.'}</span>
                  <div className="font-mono text-[10px] text-slate-400 mt-1">(e ∧ f) ⊕ (¬e ∧ g)</div>
                </div>

                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                  <span className="font-mono font-bold text-indigo-400">Σ₀(a):</span>{' '}
                  <span>{isVi ? 'Xoay phải và XOR ba kết quả.' : 'Rotate right and XOR 3 results.'}</span>
                  <div className="font-mono text-[10px] text-slate-400 mt-1">ROTR²(a) ⊕ ROTR¹³(a) ⊕ ROTR²²(a)</div>
                </div>

                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                  <span className="font-mono font-bold text-cyan-400">Maj(a,b,c):</span>{' '}
                  <span>{isVi ? 'Chọn giá trị chiếm đa số ở mỗi bit.' : 'Majority vote per bit position.'}</span>
                  <div className="font-mono text-[10px] text-slate-400 mt-1">(a ∧ b) ⊕ (a ∧ c) ⊕ (b ∧ c)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
