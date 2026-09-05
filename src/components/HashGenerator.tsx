import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, UploadCloud, FileCode, RefreshCw } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { hashSha256 } from '../utils/sha256';
import { HashResult } from '../types';
import { NIST_TEST_VECTORS } from '../data/researchData';
import { HashVisualizer } from './HashVisualizer';
import { HashStatistics } from './HashStatistics';

import { AnimatedHash } from './AnimatedHash';

export const HashGenerator: React.FC = () => {
  const { language, strings } = useLanguage();
  const isVi = language === 'vi';
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
    <section id="hash-generator" className="py-8 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 font-sans">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-cyan-400 uppercase tracking-wider mb-2">
            <span>{strings.hashGenerator.badge}</span>
          </div>
          <h2 className="text-2xl font-bold font-sans text-white mt-1 mb-2">
            {strings.hashGenerator.title}
          </h2>
          <p className="text-xs font-sans text-slate-400 mt-1">
            {strings.hashGenerator.description}
          </p>
        </div>

        {/* Generator Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
          {/* Left / Top: Input Panel */}
          <div className="lg:col-span-12 rounded-xl bg-[#0B101E]/80 backdrop-blur-md border border-white/[0.08] p-5 sm:p-7 shadow-lg">
            {/* Input Header & Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans font-bold text-white uppercase tracking-wider">
                  {strings.hashGenerator.inputMessage}
                </span>
                <span className="text-slate-400 text-xs font-sans hidden sm:inline">
                  {strings.hashGenerator.inputSubtitle}
                </span>
              </div>

              {/* Mode Tabs */}
              <div className="inline-flex rounded-lg bg-[#0A0E1A]/80 p-1 border border-white/[0.08] text-xs font-sans">
                <button
                  onClick={() => setInputMode('text')}
                  className={`px-3 py-1.5 rounded-md transition-all font-medium cursor-pointer ${
                    inputMode === 'text'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {strings.hashGenerator.tabText}
                </button>
                <button
                  onClick={() => setInputMode('hex')}
                  className={`px-3 py-1.5 rounded-md transition-all font-medium cursor-pointer ${
                    inputMode === 'hex'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {strings.hashGenerator.tabHex}
                </button>
                <button
                  onClick={() => setInputMode('file')}
                  className={`px-3 py-1.5 rounded-md transition-all font-medium cursor-pointer ${
                    inputMode === 'file'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {strings.hashGenerator.tabFile}
                </button>
              </div>
            </div>

            {/* Input Content Area */}
            {inputMode === 'text' || inputMode === 'hex' ? (
              <div>
                <div className="bg-[#0A0E1A]/80 backdrop-blur-md border border-white/[0.08] focus-within:border-cyan-500/40 rounded-xl p-4 shadow-inner transition-colors">
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
                    className="font-mono text-sm text-slate-200 w-full min-h-[140px] outline-none resize-none bg-transparent placeholder-slate-500"
                  />
                </div>

                {/* Input metadata & quick tools */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-white/[0.08] text-xs font-sans">
                  <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
                    <span>
                      {isVi ? 'Độ dài:' : 'Length:'} <span className="text-cyan-400 font-semibold">{inputText.length}</span> {isVi ? 'ký tự' : 'chars'} · <span className="text-cyan-400 font-semibold">{new TextEncoder().encode(inputText).length}</span> {isVi ? 'byte' : 'bytes'} · <span className="text-cyan-400 font-semibold">{new TextEncoder().encode(inputText).length * 8}</span> bit
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-sans">
                    <button
                      onClick={() => setInputText('')}
                      className="px-3 py-1.5 rounded-lg bg-[#0A0E1A]/60 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-white/[0.08] transition-all flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{strings.hashGenerator.clear}</span>
                    </button>
                    <button
                      onClick={() => setInputText('Hello World ' + Math.floor(Math.random() * 10000))}
                      className="px-3 py-1.5 rounded-lg bg-[#0A0E1A]/60 hover:bg-white/[0.04] text-slate-400 hover:text-cyan-300 border border-white/[0.08] transition-all flex items-center gap-1 font-medium cursor-pointer"
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
                className="border-2 border-dashed border-white/[0.12] hover:border-cyan-500/50 rounded-xl p-8 text-center bg-[#0A0E1A]/80 backdrop-blur-md transition-all cursor-pointer group"
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
                <UploadCloud className="w-10 h-10 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-semibold text-white font-sans mb-1">
                  {strings.hashGenerator.dragDropText}
                </p>
                <p className="text-xs text-slate-400 font-sans">
                  {strings.hashGenerator.dragDropSubtext}
                </p>
                {fileInfo && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                    <FileCode className="w-4 h-4" />
                    <span>
                      {fileInfo.name} ({(fileInfo.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Test Vector Presets */}
            <div className="mt-5 pt-4 border-t border-white/[0.08] font-sans">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-xs font-sans text-slate-400 font-semibold uppercase tracking-wider">
                  {strings.hashGenerator.testVectorsLabel}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {NIST_TEST_VECTORS.map((vec) => {
                  const isSelected = inputText === vec.input && inputMode === 'text';
                  return (
                    <button
                      key={vec.id}
                      onClick={() => {
                        setInputMode('text');
                        setInputText(vec.input);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-all border text-center cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35 shadow-[0_0_8px_rgba(0,210,255,0.15)] font-semibold'
                          : 'bg-[#0A0E1A]/60 text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border-white/[0.08]'
                      }`}
                      title={vec.description}
                    >
                      {vec.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Output Panel: 64 Hex Character Digest */}
          <div className="lg:col-span-12 rounded-xl bg-[#0B101E]/80 backdrop-blur-md border border-white/[0.08] p-5 sm:p-7 shadow-lg relative font-sans">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-bold text-white uppercase tracking-wider">
                    {strings.hashGenerator.outputLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#0A0E1A]/80 border border-white/[0.08] text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    {strings.hashGenerator.processEngine}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  {strings.hashGenerator.outputSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-sans text-slate-400 font-mono">
                  {strings.hashGenerator.computedIn} <strong className="text-cyan-400 font-semibold">{hashResult?.calculationTimeMs || 0.05} ms</strong>
                </span>
                <button
                  id="hash-generator-copy-btn"
                  onClick={copyHash}
                  className="px-4 py-2 rounded-lg bg-[#151B24] hover:bg-[#1E2936] text-slate-200 border border-white/[0.08] hover:border-cyan-500/40 hover:text-cyan-300 font-sans font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-current" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? strings.hashGenerator.copied : strings.hashGenerator.copyFullHash}</span>
                </button>
              </div>
            </div>

            {/* Digest Output String Box */}
            <div className="p-4 rounded-lg bg-[#0A0E1A]/80 backdrop-blur-md border border-white/[0.08] mb-6 group relative">
              <p
                id="sha256-output-hex"
                className="font-mono text-base sm:text-xl lg:text-2xl font-bold tracking-[0.05em] tabular-nums text-cyan-300 break-all select-all leading-relaxed"
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

