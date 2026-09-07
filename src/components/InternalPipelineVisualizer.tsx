import React, { useState, useMemo } from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { computeDetailedSha256 } from '../utils/sha256';
import { uint32ToHex } from '../utils/binary';
import { InlineMath } from './MathView';

export const InternalPipelineVisualizer: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';

  const labels = {
    compressionRound: isVi ? 'Vòng nén' : 'Compression Round',
    inspectVariables: isVi
      ? 'Quan sát sự thay đổi của 8 biến làm việc qua từng vòng nén.'
      : 'Inspect the transformation of 8 working variables across compression rounds.',
    initialState: isVi ? 'Trạng thái ban đầu (Vòng 0)' : 'Initial State (Round 0)',
    roundPrefix: isVi ? 'Vòng' : 'Round',
    finalRound: isVi ? 'Vòng cuối cùng (Vòng 63)' : 'Final Round (Round 63)',
    roundConstant: isVi ? 'Hằng số vòng' : 'Round Constant',
    scheduleWord: isVi ? 'Từ thông điệp' : 'Schedule Word',
    workingVar: isVi ? 'Biến' : 'Var',
    resetRound: isVi ? 'Quay lại Vòng 0' : 'Reset to Round 0',
    nextRound: isVi ? 'Vòng tiếp theo' : 'Next Round',
    placeholder: isVi ? 'Ví dụ: abc' : 'e.g. abc',
    totalBytes: isVi ? 'Tổng số byte:' : 'Total Bytes:',
    byteBreakdown: isVi
      ? 'Chi tiết phân tách byte khối 512 bit (Khối #0):'
      : 'Padded 512-Bit Block Byte Breakdown (Block #0):',
    msgBytes: isVi ? 'Byte thông điệp' : 'Message Bytes',
    appended1: isVi ? 'Bit 1 đệm (0x80)' : 'Appended 1-bit (0x80)',
    zeroPadding: isVi ? 'Đệm bit 0 (0x00)' : 'Zero Padding (0x00)',
    lengthBits: (bits: number) => (isVi ? `Độ dài 64-bit (${bits} bit)` : `64-bit Length (${bits} bits)`),
    wordsRange: isVi ? '64 từ: W[0] → W[63]' : '64 words: W[0] → W[63]',
    stage2IntroPre: isVi ? '16 từ 32-bit ban đầu ' : 'The 16 initial 32-bit words ',
    stage2IntroPost: isVi
      ? ' từ khối 512 bit được mở rộng thành 64 từ bằng công thức truy hồi mật mã:'
      : ' from the 512-bit block are expanded into 64 words using the recurrence:',
    outputBadge: isVi ? 'Đầu ra 256 bit' : '256-Bit Output',
    stage4IntroPre: isVi ? 'Sau 64 vòng nén (vòng 0 đến 63), 8 biến làm việc (' : 'After round 63, the 8 working variables (',
    stage4IntroMid: isVi ? ') được cộng theo modulo ' : ') are added modulo ',
    stage4IntroPost: isVi ? ' với trạng thái băm trung gian trước đó:' : ' to the previous intermediate hash state:',
    synthesizedDigest: isVi ? 'Mã băm tổng hợp 64 ký tự Hex (256 bit):' : 'Synthesized 64-Hex Digest (256-bit):',
  };

  const [pipelineInput, setPipelineInput] = useState('abc');
  const [selectedRound, setSelectedRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStage, setActiveStage] = useState<'padding' | 'schedule' | 'compression' | 'output'>('compression');

  // Compute breakdown for current message
  const breakdown = useMemo(() => {
    try {
      return computeDetailedSha256(pipelineInput);
    } catch {
      return computeDetailedSha256('abc');
    }
  }, [pipelineInput]);

  const block0 = breakdown.blocks[0];
  const currentRoundState = block0?.rounds[selectedRound] || block0?.rounds[0];

  // Auto-playback effect for compression rounds
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSelectedRound((prev) => {
        if (prev >= 63) {
          setIsPlaying(false);
          return 63;
        }
        return prev + 1;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section id="pipeline" className="py-12 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 font-sans">
          <div className="flex items-center justify-center gap-2 text-sky-400 text-xs tracking-wider uppercase mb-3 font-semibold font-sans">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>{strings.pipeline.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans mb-3">
            {strings.pipeline.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            {strings.pipeline.description}
          </p>
        </div>

        {/* Interactive Pipeline Stages Navigation Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 font-sans">
          {[
            { id: 'padding', label: strings.pipeline.stage1Label, desc: strings.pipeline.stage1Desc },
            { id: 'schedule', label: strings.pipeline.stage2Label, desc: strings.pipeline.stage2Desc },
            { id: 'compression', label: strings.pipeline.stage3Label, desc: strings.pipeline.stage3Desc },
            { id: 'output', label: strings.pipeline.stage4Label, desc: strings.pipeline.stage4Desc },
          ].map((stage) => {
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                id={`btn-stage-${stage.id}`}
                type="button"
                onClick={() => setActiveStage(stage.id as any)}
                className={`p-4 rounded-xl text-left border transition-all cursor-pointer font-sans ${
                  isActive
                    ? 'bg-slate-900 border-sky-500 ring-1 ring-sky-500/40 shadow-sm text-white'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span className="font-sans text-sm sm:text-base font-bold text-white block">
                  {stage.label}
                </span>
                <span className="text-xs sm:text-sm text-slate-300 block mt-1 leading-normal font-sans">
                  {stage.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Input Controller inside Pipeline */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm font-sans shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-200 font-semibold font-sans whitespace-nowrap">
              {strings.pipeline.testMessage.replace(/:+$/, '')}:
            </span>
            <input
              type="text"
              id="pipeline-test-input"
              value={pipelineInput}
              onChange={(e) => {
                setPipelineInput(e.target.value);
                setSelectedRound(0);
              }}
              placeholder={labels.placeholder}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 w-52 font-mono text-sm"
            />
          </div>
          <div className="text-slate-300 flex flex-wrap items-center gap-4 sm:gap-6 font-sans text-sm">
            <span>
              {strings.pipeline.originalBits.replace(/:+$/, '')}: <strong className="text-white font-mono font-semibold ml-1">{breakdown.originalBitsLength}</strong>
            </span>
            <span>
              {strings.pipeline.paddedBits.replace(/:+$/, '')}: <strong className="text-white font-mono font-semibold ml-1">{breakdown.paddedBitsLength}</strong>
            </span>
            <span>
              {strings.pipeline.blocksCount.replace(/:+$/, '')}: <strong className="text-white font-mono font-semibold ml-1">{breakdown.blockCount} × 512b</strong>
            </span>
          </div>
        </div>

        {/* Stage 1: Padding & 512-bit Alignment Inspector */}
        {activeStage === 'padding' && (
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-sm space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-sans text-base sm:text-lg font-bold text-white">
                {strings.pipeline.stage1Title}
              </h3>
              <span className="text-xs sm:text-sm font-sans px-3 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
                {labels.totalBytes} <strong className="font-mono font-bold text-sky-400">{breakdown.paddedMessageBytes.length} byte</strong>
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              {strings.pipeline.stage1Explanation}
            </p>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 font-sans space-y-4">
              <div className="text-white font-semibold text-sm sm:text-base font-sans">
                {labels.byteBreakdown}
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 text-center font-mono">
                {Array.from(breakdown.paddedMessageBytes.slice(0, 64)).map((byteVal: number, idx: number) => {
                  const isMsg = idx < new TextEncoder().encode(pipelineInput).length;
                  const isOneBit = idx === new TextEncoder().encode(pipelineInput).length;
                  const isLength = idx >= 56;
                  const hexStr = Number(byteVal).toString(16).padStart(2, '0');

                  return (
                    <div
                      key={idx}
                      className={`p-1.5 rounded text-xs border font-mono ${
                        isMsg
                          ? 'bg-sky-950/80 border-sky-500/50 text-sky-300 font-bold'
                          : isOneBit
                            ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 font-bold'
                            : isLength
                              ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                      title={`Byte #${idx}: 0x${hexStr}`}
                    >
                      {hexStr}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm pt-3 border-t border-slate-800 text-slate-300 font-sans">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block" /> {labels.msgBytes} ({new TextEncoder().encode(pipelineInput).length})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> {labels.appended1}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-slate-700 inline-block border border-slate-600" /> {labels.zeroPadding}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-400 inline-block" /> {labels.lengthBits(breakdown.originalBitsLength)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Message Schedule Expansion W[0..63] */}
        {activeStage === 'schedule' && (
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-sm space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-sans text-base sm:text-lg font-bold text-white">
                {strings.pipeline.stage2Title}
              </h3>
              <span className="text-xs sm:text-sm font-sans px-3 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
                {labels.wordsRange}
              </span>
            </div>

            <div className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              {labels.stage2IntroPre}<InlineMath math="W_0 \dots W_{15}" />{labels.stage2IntroPost}
              <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-sky-300 overflow-x-auto font-sans">
                <InlineMath math="W[t] = \sigma_1(W[t-2]) + W[t-7] + \sigma_0(W[t-15]) + W[t-16] \pmod{2^{32}}" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 max-h-80 overflow-y-auto p-1 font-sans">
              {block0?.w.map((word, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    idx < 16
                      ? 'bg-sky-950/40 border-sky-500/40 text-sky-300'
                      : 'bg-slate-950 border-slate-800/90 text-slate-200'
                  }`}
                >
                  <span className="text-xs text-slate-400 font-sans font-medium block">W[{idx}]</span>
                  <span className="font-mono font-bold text-xs sm:text-[13px] text-white block select-all">0x{uint32ToHex(word)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 3: 64 Compression Rounds Visualizer */}
        {activeStage === 'compression' && (
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-sm space-y-6 font-sans">
            {/* Header & Round Selector Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-sans text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{labels.compressionRound} #{selectedRound} / 63</span>
                </h3>
                <p className="text-sm text-slate-300 mt-1 font-sans leading-relaxed">
                  {labels.inspectVariables}
                </p>
              </div>

              {/* Playback controls */}
              <div className="flex items-center gap-2 font-sans">
                <button
                  type="button"
                  id="btn-pipeline-autoplay"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3.5 py-2 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? strings.pipeline.pause : strings.pipeline.autoPlay}</span>
                </button>
                <button
                  type="button"
                  id="btn-pipeline-reset"
                  onClick={() => setSelectedRound(0)}
                  className="p-2 sm:px-3 sm:py-2 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer text-xs sm:text-sm flex items-center gap-1.5"
                  title={labels.resetRound}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline font-sans">{labels.resetRound}</span>
                </button>
                <button
                  type="button"
                  id="btn-pipeline-next"
                  onClick={() => setSelectedRound((prev) => Math.min(63, prev + 1))}
                  className="p-2 sm:px-3 sm:py-2 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer text-xs sm:text-sm flex items-center gap-1.5"
                  title={labels.nextRound}
                >
                  <SkipForward className="w-4 h-4" />
                  <span className="hidden sm:inline font-sans">{labels.nextRound}</span>
                </button>
              </div>
            </div>

            {/* Interactive Round Slider */}
            <div className="font-sans space-y-2">
              <div className="flex justify-between text-xs sm:text-sm text-slate-300 font-sans">
                <span className="font-medium">{labels.initialState}</span>
                <span className="text-sky-400 font-bold font-sans">
                  {labels.roundPrefix} <span className="font-mono">{selectedRound}</span> / 63
                </span>
                <span className="font-medium">{labels.finalRound}</span>
              </div>
              <input
                type="range"
                id="pipeline-round-slider"
                min={0}
                max={63}
                value={selectedRound}
                onChange={(e) => {
                  setSelectedRound(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full accent-sky-400 bg-slate-950 h-2.5 rounded-lg cursor-pointer border border-slate-800"
              />
            </div>

            {/* 8 Working Variables Grid */}
            {currentRoundState && (
              <div className="space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-sky-400 rounded-full" />
                    <span>{isVi ? '8 biến làm việc (32 bit mỗi biến)' : '8 Working Variables (32-bit each)'}</span>
                  </span>
                  <span className="text-xs text-slate-400 font-sans hidden sm:inline">
                    {isVi ? 'a, e nhận giá trị tính toán mới; b..d và f..h dịch chuyển trạng thái' : 'a, e receive new inputs; b..d and f..h cascade'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3 font-sans">
                  {[
                    { label: 'a', val: currentRoundState.a, roleVi: 'Mới (T₁ + T₂)', roleEn: 'New (T₁ + T₂)', isNew: true },
                    { label: 'b', val: currentRoundState.b, roleVi: 'Dịch từ a', roleEn: 'From a', isNew: false },
                    { label: 'c', val: currentRoundState.c, roleVi: 'Dịch từ b', roleEn: 'From b', isNew: false },
                    { label: 'd', val: currentRoundState.d, roleVi: 'Dịch từ c', roleEn: 'From c', isNew: false },
                    { label: 'e', val: currentRoundState.e, roleVi: 'Mới (d + T₁)', roleEn: 'New (d + T₁)', isNew: true },
                    { label: 'f', val: currentRoundState.f, roleVi: 'Dịch từ e', roleEn: 'From e', isNew: false },
                    { label: 'g', val: currentRoundState.g, roleVi: 'Dịch từ f', roleEn: 'From f', isNew: false },
                    { label: 'h', val: currentRoundState.h, roleVi: 'Dịch từ g', roleEn: 'From g', isNew: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`p-3 sm:p-3.5 rounded-xl border text-center transition-all bg-slate-900/90 ${
                        item.isNew
                          ? 'border-sky-500/40 shadow-xs ring-1 ring-sky-500/20'
                          : 'border-slate-800'
                      }`}
                    >
                      {/* Label in clean Sans-serif */}
                      <div className="flex items-center justify-center gap-1.5 mb-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-slate-300 font-sans">
                          {labels.workingVar}
                        </span>
                        <span className="font-serif italic font-bold text-sm sm:text-base text-white">
                          {item.label}
                        </span>
                      </div>

                      {/* Semantic role badge */}
                      <div className="mb-2">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-sans font-medium ${
                            item.isNew
                              ? 'bg-sky-950/80 text-sky-300 border border-sky-500/30'
                              : 'bg-slate-950/80 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {isVi ? item.roleVi : item.roleEn}
                        </span>
                      </div>

                      {/* Hex value in clean, crisp Monospace */}
                      <div className="bg-slate-950 rounded-lg py-1.5 px-2 border border-slate-800/80">
                        <span className="text-xs sm:text-sm font-bold font-mono text-white tracking-wider block select-all">
                          {uint32ToHex(item.val)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Round Intermediate Arithmetic Formulas */}
            {currentRoundState && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
                {/* 1. Round constant K_t */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-sans">
                    <span className="font-semibold">{labels.roundConstant}</span>
                    <span className="font-mono text-amber-400 font-bold">K[{selectedRound}]</span>
                  </div>
                  <div className="text-xs text-slate-400 font-sans">
                    <InlineMath math={`K_{${selectedRound}}`} /> (NIST FIPS 180-4)
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-amber-300 select-all tracking-wide pt-1 border-t border-slate-800/60">
                    0x{uint32ToHex(currentRoundState.k)}
                  </div>
                </div>

                {/* 2. Schedule word W_t */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-sans">
                    <span className="font-semibold">{labels.scheduleWord}</span>
                    <span className="font-mono text-teal-400 font-bold">W[{selectedRound}]</span>
                  </div>
                  <div className="text-xs text-slate-400 font-sans">
                    <InlineMath math={`W_{${selectedRound}}`} /> ({isVi ? 'Từ thông điệp mở rộng' : 'Expanded word'})
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-teal-300 select-all tracking-wide pt-1 border-t border-slate-800/60">
                    0x{uint32ToHex(currentRoundState.w)}
                  </div>
                </div>

                {/* 3. Intermediate sum T1 */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-sans">
                    <span className="font-semibold">{isVi ? 'Biến phụ T₁' : 'Temporary Var T₁'}</span>
                    <span className="font-mono text-sky-400 font-bold">T₁</span>
                  </div>
                  <div className="text-xs text-slate-300 font-sans overflow-x-auto no-scrollbar">
                    <InlineMath math="T_1 = h + \Sigma_1 + \text{Ch} + K + W" />
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-sky-300 select-all tracking-wide pt-1 border-t border-slate-800/60">
                    0x{uint32ToHex(currentRoundState.t1)}
                  </div>
                </div>

                {/* 4. Intermediate sum T2 */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-sans">
                    <span className="font-semibold">{isVi ? 'Biến phụ T₂' : 'Temporary Var T₂'}</span>
                    <span className="font-mono text-indigo-400 font-bold">T₂</span>
                  </div>
                  <div className="text-xs text-slate-300 font-sans overflow-x-auto no-scrollbar">
                    <InlineMath math="T_2 = \Sigma_0 + \text{Maj}" />
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-indigo-300 select-all tracking-wide pt-1 border-t border-slate-800/60">
                    0x{uint32ToHex(currentRoundState.t2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stage 4: Final Digest Synthesis */}
        {activeStage === 'output' && (
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-sm space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-sans text-base sm:text-lg font-bold text-white">
                {strings.pipeline.stage4Title}
              </h3>
              <span className="text-xs sm:text-sm font-sans px-3 py-1 rounded-lg bg-sky-950/60 text-sky-300 border border-sky-500/40 font-semibold">
                {labels.outputBadge}
              </span>
            </div>

            <div className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              {labels.stage4IntroPre}<InlineMath math="a \dots h" />{labels.stage4IntroMid}<InlineMath math="2^{32}" />{labels.stage4IntroPost}
              <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-sky-300 font-sans overflow-x-auto">
                <InlineMath math="H_0 = H_0 + a, \quad H_1 = H_1 + b, \quad \dots, \quad H_7 = H_7 + h \pmod{2^{32}}" />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs sm:text-sm font-sans text-slate-300 uppercase font-semibold tracking-wider block">
                {labels.synthesizedDigest}
              </span>
              <div className="font-mono text-base sm:text-xl font-bold text-sky-400 break-all select-all tracking-wider bg-slate-900/80 p-3.5 rounded-lg border border-sky-500/30">
                {breakdown.finalHashHex}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
