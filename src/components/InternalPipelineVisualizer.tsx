import React, { useState, useMemo } from 'react';
import { Layers, Play, Pause, SkipForward, RotateCcw, ArrowRight, Cpu, FileText, Binary } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { computeDetailedSha256 } from '../utils/sha256';
import { uint32ToHex } from '../utils/binary';
import { InlineMath, BlockMath } from './MathView';

export const InternalPipelineVisualizer: React.FC = () => {
  const { strings } = useLanguage();
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
          <div className="flex items-center justify-center gap-2 text-[#00C98D] text-xs font-mono tracking-wider uppercase mb-3 font-semibold">
            <span>{strings.pipeline.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F2F4F7] tracking-tight font-sans mb-2">
            {strings.pipeline.title}
          </h2>
          <p className="text-sm text-[#A5AFBF] leading-relaxed font-sans">
            {strings.pipeline.description}
          </p>
        </div>

        {/* Interactive Pipeline Stages Navigation Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { id: 'padding', label: strings.pipeline.stage1Label, desc: strings.pipeline.stage1Desc },
            { id: 'schedule', label: strings.pipeline.stage2Label, desc: strings.pipeline.stage2Desc },
            { id: 'compression', label: strings.pipeline.stage3Label, desc: strings.pipeline.stage3Desc },
            { id: 'output', label: strings.pipeline.stage4Label, desc: strings.pipeline.stage4Desc },
          ].map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id as any)}
              className={`p-3.5 rounded-lg text-left border transition-all cursor-pointer ${
                activeStage === stage.id
                  ? 'bg-[#0F131A] border-[#00C98D]/50 shadow-sm text-[#00C98D]'
                  : 'bg-[#0C0F14] border-[#1C2430] text-[#A5AFBF] hover:border-[#2A3649] hover:text-[#F2F4F7]'
              }`}
            >
              <span className="font-sans text-xs font-bold block">{stage.label}</span>
              <span className="text-[11px] text-[#717B8C] block mt-0.5 font-sans">{stage.desc}</span>
            </button>
          ))}
        </div>

        {/* Input Controller inside Pipeline */}
        <div className="rounded-lg bg-[#0C0F14] border border-[#1C2430] p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="text-[#00C98D] font-bold uppercase font-sans">{strings.pipeline.testMessage}:</span>
            <input
              type="text"
              value={pipelineInput}
              onChange={(e) => {
                setPipelineInput(e.target.value);
                setSelectedRound(0);
              }}
              placeholder="e.g. abc"
              className="bg-[#0B0F15] border border-[#1C2430] rounded-md px-3 py-1.5 text-[#F2F4F7] focus:outline-none focus:border-[#00C98D] w-48 font-mono"
            />
          </div>
          <div className="text-[#A5AFBF] flex items-center gap-3 font-sans">
            <span>{strings.pipeline.originalBits}: <strong className="text-[#00C98D] font-mono">{breakdown.originalBitsLength}</strong></span>
            <span>{strings.pipeline.paddedBits}: <strong className="text-[#00C98D] font-mono">{breakdown.paddedBitsLength}</strong></span>
            <span>{strings.pipeline.blocksCount}: <strong className="text-[#00C98D] font-mono">{breakdown.blockCount} × 512b</strong></span>
          </div>
        </div>

        {/* Stage 1: Padding & 512-bit Alignment Inspector */}
        {activeStage === 'padding' && (
          <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-6 sm:p-7 shadow-sm space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-[#1C2430] pb-3">
              <h3 className="font-sans text-base font-bold text-[#00C98D]">
                {strings.pipeline.stage1Title}
              </h3>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-[#0F131A] text-[#A5AFBF] border border-[#1C2430]">
                Total Bytes: {breakdown.paddedMessageBytes.length}
              </span>
            </div>

            <p className="text-xs text-[#A5AFBF] leading-relaxed font-sans">
              {strings.pipeline.stage1Explanation}
            </p>

            <div className="p-4 rounded-lg bg-[#090A0F] border border-[#1C2430] font-sans text-xs space-y-3">
              <div className="text-[#F2F4F7] font-semibold mb-2 font-sans">
                Padded 512-Bit Block Byte Breakdown (Block #0):
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
                      className={`p-1 rounded text-[10px] border ${
                        isMsg
                          ? 'bg-[#00C98D]/20 border-[#00C98D]/50 text-[#00C98D] font-medium'
                          : isOneBit
                            ? 'bg-amber-950/80 border-amber-500/50 text-amber-200 font-bold'
                            : isLength
                              ? 'bg-[#11161E] border-[#1C2430] text-[#F2F4F7] font-bold'
                              : 'bg-[#0F131A] border-[#1C2430] text-[#717B8C]'
                      }`}
                      title={`Byte #${idx}: 0x${hexStr}`}
                    >
                      {hexStr}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] pt-3 border-t border-[#1C2430] text-[#A5AFBF] font-sans">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00C98D] inline-block" /> Message Bytes ({new TextEncoder().encode(pipelineInput).length})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Appended 1-bit (0x80)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0F131A] inline-block border border-[#1C2430]" /> Zero Padding (0x00)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#11161E] inline-block border border-[#1C2430]" /> 64-bit Length ({breakdown.originalBitsLength} bits)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Message Schedule Expansion W[0..63] */}
        {activeStage === 'schedule' && (
          <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-6 sm:p-7 shadow-sm space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-[#1C2430] pb-3">
              <h3 className="font-sans text-base font-bold text-[#00C98D]">
                {strings.pipeline.stage2Title}
              </h3>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-[#0F131A] text-[#A5AFBF] border border-[#1C2430]">
                W[0] through W[63]
              </span>
            </div>

            <div className="text-xs text-[#A5AFBF] leading-relaxed font-sans">
              The 16 initial 32-bit words <InlineMath math="W_0 \dots W_{15}" /> from the 512-bit block are expanded into 64 words using the recurrence:
              <div className="mt-2 p-2.5 bg-[#090A0F] rounded-lg border border-[#1C2430] text-[#00C98D]">
                <InlineMath math="W[t] = \sigma_1(W[t-2]) + W[t-7] + \sigma_0(W[t-15]) + W[t-16] \pmod{2^{32}}" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs max-h-72 overflow-y-auto p-1">
              {block0?.w.map((word, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border ${
                    idx < 16
                      ? 'bg-[#00C98D]/10 border-[#00C98D]/30 text-[#00C98D]'
                      : 'bg-[#090A0F] border-[#1C2430] text-[#F2F4F7]'
                  }`}
                >
                  <span className="text-[10px] text-[#717B8C] block">W[{idx}]</span>
                  <span className="font-bold text-[11px]">0x{uint32ToHex(word)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 3: 64 Compression Rounds Visualizer */}
        {activeStage === 'compression' && (
          <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-6 sm:p-7 shadow-sm space-y-6 font-sans">
            {/* Header & Round Selector Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2430] pb-4">
              <div>
                <h3 className="font-sans text-base font-bold text-[#00C98D] flex items-center gap-2">
                  <span>Compression Round #{selectedRound} / 63</span>
                </h3>
                <p className="text-xs text-[#A5AFBF] mt-0.5 font-sans">
                  Inspect the transformation of 8 working variables across rounds.
                </p>
              </div>

              {/* Playback controls */}
              <div className="flex items-center gap-2 font-sans">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 rounded-lg bg-[#00C98D]/15 hover:bg-[#00C98D]/25 border border-[#00C98D]/40 text-[#00C98D] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? strings.pipeline.pause : strings.pipeline.autoPlay}</span>
                </button>
                <button
                  onClick={() => setSelectedRound(0)}
                  className="p-2 rounded-lg bg-[#0F131A] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] cursor-pointer"
                  title="Reset to Round 0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedRound((prev) => Math.min(63, prev + 1))}
                  className="p-2 rounded-lg bg-[#0F131A] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] cursor-pointer"
                  title="Next Round"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Round Slider */}
            <div className="font-sans">
              <div className="flex justify-between text-xs text-[#A5AFBF] mb-1.5">
                <span>Initial State (Round 0)</span>
                <span className="text-[#00C98D] font-bold font-mono">Round {selectedRound}</span>
                <span>Final Round (Round 63)</span>
              </div>
              <input
                type="range"
                min={0}
                max={63}
                value={selectedRound}
                onChange={(e) => {
                  setSelectedRound(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full accent-[#00C98D] bg-[#0F131A] h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* 8 Working Variables Grid */}
            {currentRoundState && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 font-sans">
                {[
                  { label: 'a', val: currentRoundState.a, color: 'text-[#00C98D]' },
                  { label: 'b', val: currentRoundState.b, color: 'text-[#00C98D]' },
                  { label: 'c', val: currentRoundState.c, color: 'text-[#F2F4F7]' },
                  { label: 'd', val: currentRoundState.d, color: 'text-[#A5AFBF]' },
                  { label: 'e', val: currentRoundState.e, color: 'text-[#00C98D]' },
                  { label: 'f', val: currentRoundState.f, color: 'text-[#00C98D]' },
                  { label: 'g', val: currentRoundState.g, color: 'text-[#F2F4F7]' },
                  { label: 'h', val: currentRoundState.h, color: 'text-[#A5AFBF]' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-lg bg-[#090A0F] border border-[#1C2430] text-center"
                  >
                    <span className="text-xs text-[#717B8C] font-bold font-mono block mb-1">
                      Var {item.label}
                    </span>
                    <span className={`text-xs sm:text-sm font-bold font-mono ${item.color} block tracking-wider`}>
                      {uint32ToHex(item.val)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Round Intermediate Arithmetic Formulas */}
            {currentRoundState && (
              <div className="p-4 rounded-lg bg-[#090A0F] border border-[#1C2430] text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
                <div>
                  <span className="text-[#A5AFBF] block mb-0.5">Round Constant <span className="font-mono">K[{selectedRound}]</span>:</span>
                  <span className="text-[#F59E0B] font-bold font-mono">0x{uint32ToHex(currentRoundState.k)}</span>
                </div>
                <div>
                  <span className="text-[#A5AFBF] block mb-0.5">Schedule Word <span className="font-mono">W[{selectedRound}]</span>:</span>
                  <span className="text-[#00C98D] font-bold font-mono">0x{uint32ToHex(currentRoundState.w)}</span>
                </div>
                <div>
                  <span className="text-[#A5AFBF] block mb-0.5"><InlineMath math="T_1 = h + \Sigma_1 + \text{Ch} + K + W" />:</span>
                  <span className="text-[#F2F4F7] font-bold font-mono">0x{uint32ToHex(currentRoundState.t1)}</span>
                </div>
                <div>
                  <span className="text-[#A5AFBF] block mb-0.5"><InlineMath math="T_2 = \Sigma_0 + \text{Maj}" />:</span>
                  <span className="text-[#00C98D] font-bold font-mono">0x{uint32ToHex(currentRoundState.t2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stage 4: Final Digest Synthesis */}
        {activeStage === 'output' && (
          <div className="rounded-xl bg-[#0C0F14] border border-[#1C2430] p-6 sm:p-7 shadow-sm space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-[#1C2430] pb-3">
              <h3 className="font-sans text-base font-bold text-[#00C98D]">
                {strings.pipeline.stage4Title}
              </h3>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-[#0F131A] text-[#00C98D] border border-[#1C2430]">
                256-Bit Output
              </span>
            </div>

            <div className="text-xs text-[#A5AFBF] leading-relaxed font-sans">
              After round 63, the 8 working variables (<InlineMath math="a \dots h" />) are added modulo <InlineMath math="2^{32}" /> to the previous intermediate hash state:
              <div className="mt-2 p-2.5 bg-[#090A0F] rounded-lg border border-[#1C2430] text-[#00C98D] font-mono text-xs">
                <InlineMath math="H_0 = H_0 + a, \quad H_1 = H_1 + b, \quad \dots, \quad H_7 = H_7 + h \pmod{2^{32}}" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#090A0F] border border-[#1C2430]">
              <span className="text-[11px] font-sans text-[#A5AFBF] uppercase font-semibold block mb-2">
                Synthesized 64-Hex Digest:
              </span>
              <div className="font-mono text-base sm:text-xl font-bold text-[#00C98D] break-all select-all">
                {breakdown.finalHashHex}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

