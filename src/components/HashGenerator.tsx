import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  ArrowDown,
  Copy,
  Check,
  Trash2,
  UploadCloud,
  FileCode,
  Sparkles,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { hashSha256 } from '../utils/sha256';
import { HashResult } from '../types';
import { NIST_TEST_VECTORS } from '../data/researchData';
import { HashVisualizer } from './HashVisualizer';
import { HashStatistics } from './HashStatistics';

import { AnimatedHash } from './AnimatedHash';

export const HashGenerator: React.FC = () => {
  const { strings } = useLanguage();
  const [inputMode, setInputMode] = useState<'text' | 'file' | 'hex'>('text');
  const [inputText, setInputText] = useState('Hello World');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [hashResult, setHashResult] = useState<HashResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculate = useCallback(async (content: string | Uint8Array, label?: string) => {
    setIsCalculating(true);
    try {
      const startTime = performance.now();
      const result = await hashSha256(content);
      const elapsed = performance.now() - startTime;
      
      // Ensure at least 300ms processing state for visual feedback unless reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion && elapsed < 300) {
        await new Promise(resolve => setTimeout(resolve, 300 - elapsed));
      }
      
      if (label) {
        result.input = label;
      }
      setHashResult(result);
    } catch (err) {
      console.error('Hashing error:', err);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  useEffect(() => {
    if (inputMode === 'text') {
      calculate(inputText);
    } else if (inputMode === 'hex') {
      // Clean hex string and convert to bytes
      const cleanHex = inputText.replace(/[^0-9a-fA-F]/g, '');
      const bytes = new Uint8Array(cleanHex.length / 2);
      for (let i = 0; i < cleanHex.length; i += 2) {
        bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16) || 0;
      }
      calculate(bytes, `[Hex Bytes: ${cleanHex.slice(0, 20)}...]`);
    }
  }, [inputText, inputMode, calculate]);

  const handleFileUpload = async (file: File) => {
    setFileInfo({ name: file.name, size: file.size });
    setIsCalculating(true);
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    await calculate(uint8, `File: ${file.name} (${file.size} bytes)`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setInputMode('file');
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const copyHash = async () => {
    if (!hashResult?.hex) return;
    await navigator.clipboard.writeText(hashResult.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="hash-generator" className="py-12 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 font-sans">
          <div className="inline-flex items-center gap-2 text-[#00C98D] text-xs font-mono font-semibold tracking-wider uppercase mb-3">
            <span>{strings.hashGenerator.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F2F4F7] tracking-tight font-sans mb-2">
            {strings.hashGenerator.title}
          </h2>
          <p className="text-sm text-[#A5AFBF] font-sans">
            {strings.hashGenerator.description}
          </p>
        </div>

        {/* Generator Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
          {/* Left / Top: Input Panel */}
          <div className="lg:col-span-12 rounded-xl bg-[#0C0F14] border border-[#1C2430] p-5 sm:p-7 shadow-lg">
            {/* Input Header & Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C2430] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans font-bold text-[#00C98D] uppercase tracking-wider">
                  {strings.hashGenerator.inputMessage}
                </span>
                <span className="text-[#A5AFBF] text-xs font-sans hidden sm:inline">
                  {strings.hashGenerator.inputSubtitle}
                </span>
              </div>

              {/* Mode Tabs */}
              <div className="inline-flex rounded-lg bg-[#090A0F] p-1 border border-[#1C2430] text-xs font-sans">
                <button
                  onClick={() => setInputMode('text')}
                  className={`px-3 py-1.5 rounded-md transition-all font-medium cursor-pointer ${
                    inputMode === 'text'
                      ? 'bg-[#00C98D]/15 text-[#00C98D] border border-[#00C98D]/30'
                      : 'text-[#A5AFBF] hover:text-[#F2F4F7]'
                  }`}
                >
                  {strings.hashGenerator.tabText}
                </button>
                <button
                  onClick={() => setInputMode('hex')}
                  className={`px-3 py-1.5 rounded-md transition-all font-medium cursor-pointer ${
                    inputMode === 'hex'
                      ? 'bg-[#00C98D]/15 text-[#00C98D] border border-[#00C98D]/30'
                      : 'text-[#A5AFBF] hover:text-[#F2F4F7]'
                  }`}
                >
                  {strings.hashGenerator.tabHex}
                </button>
                <button
                  onClick={() => setInputMode('file')}
                  className={`px-3 py-1.5 rounded-md transition-all font-medium cursor-pointer ${
                    inputMode === 'file'
                      ? 'bg-[#00C98D]/15 text-[#00C98D] border border-[#00C98D]/30'
                      : 'text-[#A5AFBF] hover:text-[#F2F4F7]'
                  }`}
                >
                  {strings.hashGenerator.tabFile}
                </button>
              </div>
            </div>

            {/* Input Content Area */}
            {inputMode === 'text' || inputMode === 'hex' ? (
              <div>
                <textarea
                  id="sha256-input-textarea"
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    inputMode === 'text'
                      ? strings.hashGenerator.placeholderText
                      : strings.hashGenerator.placeholderHex
                  }
                  className="w-full bg-[#0B0F15] border border-[#1C2430] rounded-lg p-4 text-sm sm:text-base font-mono text-[#F2F4F7] placeholder-[#717B8C] focus:outline-none focus:border-[#00C98D] focus:ring-1 focus:ring-[#00C98D] shadow-inner resize-y min-h-[110px]"
                />

                {/* Input metadata & quick tools */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-[#1C2430] text-xs font-sans">
                  <div className="flex items-center gap-4 text-[#A5AFBF] font-mono">
                    <span>
                      Length: <strong className="text-[#00C98D]">{inputText.length}</strong> {strings.hashGenerator.lengthChars}
                    </span>
                    <span>
                      Bytes: <strong className="text-[#00C98D]">{new TextEncoder().encode(inputText).length}</strong> {strings.hashGenerator.lengthBytes}
                    </span>
                    <span>
                      Bits: <strong className="text-[#00C98D]">{new TextEncoder().encode(inputText).length * 8}</strong> {strings.hashGenerator.lengthBits}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-sans">
                    <button
                      onClick={() => setInputText('')}
                      className="px-3 py-1.5 rounded-lg bg-[#0F131A] hover:bg-rose-950/40 text-[#A5AFBF] hover:text-rose-400 border border-[#1C2430] transition-all flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{strings.hashGenerator.clear}</span>
                    </button>
                    <button
                      onClick={() => setInputText('Hello World ' + Math.floor(Math.random() * 10000))}
                      className="px-3 py-1.5 rounded-lg bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#00C98D] border border-[#1C2430] transition-all flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{strings.hashGenerator.randomize}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* File Drag and Drop Zone */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#00C98D]/30 hover:border-[#00C98D] rounded-xl p-8 text-center bg-[#090A0F] transition-all cursor-pointer group"
                onClick={() => document.getElementById('file-upload-hidden-input')?.click()}
              >
                <input
                  id="file-upload-hidden-input"
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-[#00C98D] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-semibold text-[#F2F4F7] font-sans mb-1">
                  {strings.hashGenerator.dragDropText}
                </p>
                <p className="text-xs text-[#A5AFBF] font-sans">
                  {strings.hashGenerator.dragDropSubtext}
                </p>
                {fileInfo && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00C98D]/10 border border-[#00C98D]/40 text-xs font-mono text-[#00C98D]">
                    <FileCode className="w-4 h-4" />
                    <span>
                      {fileInfo.name} ({(fileInfo.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Test Vector Presets */}
            <div className="mt-5 pt-4 border-t border-[#1C2430] font-sans">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-sans text-[#A5AFBF] font-semibold uppercase tracking-wider">
                  {strings.hashGenerator.testVectorsLabel}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {NIST_TEST_VECTORS.map((vec) => (
                  <button
                    key={vec.id}
                    onClick={() => {
                      setInputMode('text');
                      setInputText(vec.input);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all border text-left cursor-pointer ${
                      inputText === vec.input && inputMode === 'text'
                        ? 'bg-[#00C98D]/15 text-[#00C98D] border-[#00C98D]/40 shadow-sm'
                        : 'bg-[#090A0F] text-[#A5AFBF] hover:text-[#F2F4F7] border-[#1C2430] hover:border-[#2A3649]'
                    }`}
                    title={vec.description}
                  >
                    <span className="font-semibold text-[#F2F4F7] font-sans">{vec.name}</span>
                    <span className="text-[10px] text-[#717B8C] block truncate max-w-[200px] font-mono">
                      {vec.input === '' ? '<empty>' : `"${vec.input}"`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>



          {/* Bottom Output Panel: 64 Hex Character Digest */}
          <div className="lg:col-span-12 rounded-xl bg-[#0C0F14] border border-[#1C2430] p-5 sm:p-7 shadow-lg relative font-sans">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C2430] pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-bold text-[#00C98D] uppercase tracking-wider">
                    {strings.hashGenerator.outputLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#090A0F] border border-[#1C2430] text-[10px] font-mono uppercase tracking-widest text-[#00C98D]/80">
                    {strings.hashGenerator.processEngine}
                  </span>
                </div>
                <p className="text-xs text-[#A5AFBF] mt-0.5 font-sans">
                  {strings.hashGenerator.outputSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-sans text-[#A5AFBF] font-mono">
                  {strings.hashGenerator.computedIn} <strong className="text-[#00C98D]">{hashResult?.calculationTimeMs || 0.05} ms</strong>
                </span>
                <button
                  id="hash-generator-copy-btn"
                  onClick={copyHash}
                  className="px-4 py-2 rounded-lg bg-[#00C98D] hover:bg-[#00C98D]/90 text-[#090A0F] font-sans font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-[#090A0F]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? strings.hashGenerator.copied : strings.hashGenerator.copyFullHash}</span>
                </button>
              </div>
            </div>

            {/* Digest Output String Box */}
            <div className="p-4 rounded-lg bg-[#090A0F] border border-[#1C2430] mb-6 group relative">
              <p
                id="sha256-output-hex"
                className="font-mono text-base sm:text-xl lg:text-2xl font-bold tracking-[0.05em] tabular-nums text-[#00C98D] break-all select-all leading-relaxed"
              >
                <AnimatedHash hash={hashResult?.hex || '...'} isCalculating={isCalculating} />
              </p>
            </div>

            {/* Detailed Interactive Visualizer Component */}
            {hashResult && (
              <HashVisualizer
                hex={hashResult.hex}
                binary={hashResult.binary}
                bytes={hashResult.bytes}
              />
            )}
          </div>
        </div>

        {/* Four Technical Stat Cards */}
        {hashResult && (
          <HashStatistics
            inputBytes={hashResult.inputBytes}
            inputBits={hashResult.inputBits}
            calculationTimeMs={hashResult.calculationTimeMs}
          />
        )}
      </div>
    </section>
  );
};

