import React, { useState } from 'react';
import { Copy, Check, Binary, Grid, Hash, Info } from 'lucide-react';
import { formatHexWords, formatHexBytes, hexToBinary } from '../utils/binary';
import { useLanguage } from '../i18n/LanguageContext';

interface HashVisualizerProps {
  hex: string;
  binary: string;
  bytes: number[];
}

export const HashVisualizer: React.FC<HashVisualizerProps> = ({ hex, binary, bytes }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [viewMode, setViewMode] = useState<'words' | 'bytes' | 'binary'>('words');
  const [copied, setCopied] = useState(false);
  const [hoveredByteIdx, setHoveredByteIdx] = useState<number | null>(null);
  const [hoveredBitIdx, setHoveredBitIdx] = useState<number | null>(null);

  const words = formatHexWords(hex);
  const formattedBytes = formatHexBytes(hex);
  const binaryString = binary || hexToBinary(hex);

  const copyHash = async () => {
    if (!hex) return;
    await navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inspect selected byte or default to byte 0
  const activeByteIndex = hoveredByteIdx !== null 
    ? hoveredByteIdx 
    : hoveredBitIdx !== null 
      ? Math.floor(hoveredBitIdx / 8) 
      : 0;

  const activeByteHex = formattedBytes[activeByteIndex] || '00';
  const activeByteDec = bytes[activeByteIndex] !== undefined ? bytes[activeByteIndex] : parseInt(activeByteHex, 16);
  const activeByteBin = activeByteDec.toString(2).padStart(8, '0');
  const activeByteAscii = (activeByteDec >= 32 && activeByteDec <= 126)
    ? String.fromCharCode(activeByteDec)
    : isVi ? '• không in được' : '• non-printable';
  const activeWordIndex = Math.floor(activeByteIndex / 4);

  return (
    <div
      id="hash-visualizer-container"
      className="rounded-xl bg-[#10151D] border border-[#1E2936] p-5 sm:p-7 shadow-sm font-sans"
    >
      {/* Header with Mode Switches */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2936] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans text-[#E6EAF0] font-bold uppercase tracking-wider">
              {isVi ? 'Trực Quan Hóa Mã Băm Mật Mã' : 'Cryptographic Digest Visualization'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#151B24] border border-[#1E2936] text-[#2DD4BF]">
              256-BIT
            </span>
          </div>
          <p className="text-xs text-[#8B95A5] mt-0.5 font-sans">
            {isVi
              ? 'Rê chuột qua bất kỳ từ word, byte hoặc bit nào để kiểm tra cấu trúc toán học nội bộ.'
              : 'Hover over any word, byte, or bit to inspect its internal mathematical structure.'}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-[#0A0D12] p-1 border border-[#1E2936]">
            <button
              onClick={() => setViewMode('words')}
              className={`px-3 py-1 text-xs font-sans rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'words'
                  ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 shadow-sm font-medium'
                  : 'text-[#8B95A5] hover:text-[#E6EAF0]'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>{isVi ? 'Từ Word (8×32b)' : 'Words (8×32b)'}</span>
            </button>
            <button
              onClick={() => setViewMode('bytes')}
              className={`px-3 py-1 text-xs font-sans rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'bytes'
                  ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 shadow-sm font-medium'
                  : 'text-[#8B95A5] hover:text-[#E6EAF0]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{isVi ? 'Bytes (32B)' : 'Bytes (32B)'}</span>
            </button>
            <button
              onClick={() => setViewMode('binary')}
              className={`px-3 py-1 text-xs font-sans rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'binary'
                  ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 shadow-sm font-medium'
                  : 'text-[#8B95A5] hover:text-[#E6EAF0]'
              }`}
            >
              <Binary className="w-3.5 h-3.5" />
              <span>{isVi ? 'Nhị phân (256b)' : 'Binary (256b)'}</span>
            </button>
          </div>

          <button
            id="copy-digest-action-btn"
            onClick={copyHash}
            className="px-3 py-1.5 rounded-lg bg-[#151B24] hover:bg-[#151B24] border border-[#1E2936] text-xs font-sans text-[#2DD4BF] hover:border-[#2DD4BF]/40 transition-all flex items-center gap-1.5 cursor-pointer"
            title={isVi ? 'Sao chép 64 ký tự Hex' : 'Copy 64 hex characters'}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#2DD4BF]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {copied ? (isVi ? 'Đã chép' : 'Copied') : isVi ? 'Chép Hex' : 'Copy Hex'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Visualizer Body */}
      <div className="space-y-4">
        {/* Mode 1: Words View */}
        {viewMode === 'words' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {words.map((word, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredByteIdx(idx * 4)}
                onMouseLeave={() => setHoveredByteIdx(null)}
                className={`group p-4 sm:p-5 rounded-lg border transition-all duration-200 cursor-pointer ${
                  activeWordIndex === idx
                    ? 'bg-[#151B24] border-[#2DD4BF]/60 shadow-sm ring-1 ring-[#2DD4BF]/40'
                    : 'bg-[#0A0D12] border-[#1E2936] hover:border-[#263241] hover:bg-[#151B24]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono tracking-[0.05em] tabular-nums mb-2">
                  <span className="font-semibold text-[#5F6B7A] uppercase tracking-wider">Word H{idx}</span>
                  <span className="text-[#5F6B7A] font-medium">Bits {idx * 32}–{idx * 32 + 31}</span>
                </div>
                <div className="font-mono text-lg sm:text-xl font-bold tracking-[0.05em] tabular-nums text-[#E6EAF0] group-hover:text-[#7DD3FC] transition-colors break-all select-all my-1.5">
                  {word}
                </div>
                <div className="mt-2.5 text-[11px] font-mono tracking-[0.05em] tabular-nums flex justify-between items-center border-t border-[#1E2936] pt-2">
                  <span className="text-[#5F6B7A] font-medium">Bytes {idx * 4}–{idx * 4 + 3}</span>
                  <span className="text-[#7DD3FC] font-semibold">0x{word}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mode 2: 32 Bytes View */}
        {viewMode === 'bytes' && (
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-2">
            {formattedBytes.map((byte, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredByteIdx(idx)}
                onMouseLeave={() => setHoveredByteIdx(null)}
                className={`p-2.5 rounded-md border text-center transition-all cursor-pointer ${
                  activeByteIndex === idx
                    ? 'bg-[#2DD4BF]/15 border-[#2DD4BF] text-[#2DD4BF] shadow-sm ring-1 ring-[#2DD4BF]/40'
                    : 'bg-[#0A0D12] border-[#1E2936] text-[#8B95A5] hover:border-[#263241]'
                }`}
              >
                <span className="text-[10px] font-mono tracking-[0.05em] tabular-nums text-[#5F6B7A] font-medium block">B{idx}</span>
                <span className="font-mono text-sm font-bold tracking-[0.05em] tabular-nums text-[#E6EAF0] mt-0.5 block">{byte}</span>
              </div>
            ))}
          </div>
        )}

        {/* Mode 3: 256 Bits Binary Matrix View */}
        {viewMode === 'binary' && (
          <div>
            <div className="grid grid-cols-16 sm:grid-cols-32 gap-1 p-3.5 bg-[#0A0D12] rounded-lg border border-[#1E2936]">
              {Array.from(binaryString).map((bit, idx) => {
                const isHovered = hoveredBitIdx === idx;
                const isOne = bit === '1';
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredBitIdx(idx)}
                    onMouseLeave={() => setHoveredBitIdx(null)}
                    className={`aspect-square rounded-sm flex items-center justify-center font-mono tracking-[0.05em] tabular-nums text-[9px] sm:text-[10px] transition-all cursor-crosshair ${
                      isHovered
                        ? 'bg-[#2DD4BF] text-[#090A0F] font-extrabold scale-125 z-10 shadow-sm'
                        : isOne
                          ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 hover:border-[#2DD4BF] font-semibold'
                          : 'bg-[#151B24] border border-[#1E2936] text-[#5F6B7A] hover:text-[#8B95A5]'
                    }`}
                    title={`Bit #${idx}: ${bit} (Byte ${Math.floor(idx / 8)})`}
                  >
                    {bit}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono tracking-[0.05em] tabular-nums text-[#5F6B7A] font-medium mt-2 px-1">
              <span>Bit 0 (MSB)</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-[#2DD4BF]/40 border border-[#2DD4BF] inline-block" /> 1-bit
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-[#151B24] border border-[#1E2936] inline-block" /> 0-bit
                </span>
              </div>
              <span>Bit 255 (LSB)</span>
            </div>
          </div>
        )}

        {/* Live Byte / Nibble Inspector Subpanel */}
        <div className="mt-4 p-4 rounded-lg bg-[#0A0D12] border border-[#1E2936] flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-[0.05em] tabular-nums font-sans">
          <div className="flex items-center gap-2 font-sans">
            <Info className="w-4 h-4 text-[#2DD4BF] flex-shrink-0" />
            <span className="text-[#E6EAF0] font-medium">
              {isVi ? 'Đang kiểm tra Byte vị trí:' : 'Inspecting Byte Index:'}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#151B24] border border-[#1E2936] text-[#2DD4BF] font-bold font-mono tracking-[0.05em] tabular-nums">
              {isVi ? `Byte #${activeByteIndex} (trên 32)` : `Byte #${activeByteIndex} (of 32)`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[#E6EAF0] font-mono">
            <div>
              <span className="text-[#5F6B7A] font-medium mr-1.5 font-sans">Hex:</span>
              <span className="text-[#2DD4BF] font-bold tracking-[0.05em] tabular-nums">0x{activeByteHex}</span>
            </div>
            <div>
              <span className="text-[#5F6B7A] font-medium mr-1.5 font-sans">{isVi ? 'Nhị phân:' : 'Binary:'}</span>
              <span className="text-[#E6EAF0] font-bold tracking-[0.05em] tabular-nums">{activeByteBin}</span>
            </div>
            <div>
              <span className="text-[#5F6B7A] font-medium mr-1.5 font-sans">{isVi ? 'Thập phân:' : 'Decimal:'}</span>
              <span className="text-[#E6EAF0] font-bold tracking-[0.05em] tabular-nums">{activeByteDec}</span>
            </div>
            <div>
              <span className="text-[#5F6B7A] font-medium mr-1.5 font-sans">ASCII:</span>
              <span className="text-[#2DD4BF] font-bold tracking-[0.05em] tabular-nums">{activeByteAscii}</span>
            </div>
            <div>
              <span className="text-[#5F6B7A] font-medium mr-1.5 font-sans">{isVi ? 'Từ Word:' : 'Word:'}</span>
              <span className="text-[#F59E0B] font-bold tracking-[0.05em] tabular-nums">H{activeWordIndex}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

