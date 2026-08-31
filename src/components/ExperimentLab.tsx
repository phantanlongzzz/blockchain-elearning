import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Binary,
  Sliders,
  Maximize2,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { hashSha256 } from '../utils/sha256';
import { hexToBinary, formatHexBytes, formatHexWords } from '../utils/binary';
import { CollisionVisualizer } from './CollisionVisualizer';
import { BruteForceSimulator } from './BruteForceSimulator';
import { Search } from 'lucide-react';

export const ExperimentLab: React.FC = () => {
  const { strings } = useLanguage();
  const [activeTab, setActiveTab] = useState<'representation' | 'salt' | 'length' | 'collision' | 'bruteforce'>('representation');

  // Experiment 1: Representation State
  const [repInput, setRepInput] = useState('Blockchain Elearning');
  const [repHash, setRepHash] = useState('');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Experiment 2: Salt / HMAC State
  const [message, setMessage] = useState('Confidential Financial Report');
  const [saltKey, setSaltKey] = useState('SecretSaltKey_DLU');
  const [saltedHash, setSaltedHash] = useState('');

  // Experiment 3: Length Invariance State
  const [repeatCount, setRepeatCount] = useState(10);
  const [lengthSampleHash, setLengthSampleHash] = useState('');

  useEffect(() => {
    hashSha256(repInput).then((res) => setRepHash(res.hex));
  }, [repInput]);

  useEffect(() => {
    hashSha256(`${saltKey}::${message}`).then((res) => setSaltedHash(res.hex));
  }, [message, saltKey]);

  useEffect(() => {
    const text = 'DataChunk_'.repeat(repeatCount);
    hashSha256(text).then((res) => setLengthSampleHash(res.hex));
  }, [repeatCount]);

  const copyToClipboard = async (text: string, formatName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Convert hex to base64
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

  return (
    <section id="experiment-lab" className="py-20 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111111] border border-[#292929] text-emerald-400 text-xs font-mono tracking-widest uppercase mb-3">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{strings.experiments.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f5f5f5] tracking-tight font-sans mb-3">
            {strings.experiments.title}
          </h2>
          <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed font-sans">
            {strings.experiments.description}
          </p>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'representation', label: strings.experiments.tab1, icon: Binary },
            { id: 'salt', label: strings.experiments.tab2, icon: Lock },
            { id: 'length', label: strings.experiments.tab3, icon: Maximize2 },
            { id: 'collision', label: strings.experiments.tab4, icon: Sparkles },
            { id: 'bruteforce', label: strings.experiments.tab5, icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#181818] text-emerald-400 border-emerald-500/50 shadow-md'
                    : 'bg-[#111111] text-[#a1a1aa] hover:text-[#f5f5f5] border-[#292929] hover:border-[#383838]'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Experiment 1: Multi-Format Representations */}
        {activeTab === 'representation' && (
          <div className="rounded-2xl bg-[#111111] border border-[#292929] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292929] pb-4">
              <div>
                <h3 className="font-sans text-base font-bold text-emerald-400">
                  {strings.experiments.tab1}
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-0.5 font-sans">
                  {strings.experiments.exp1Desc}
                </p>
              </div>

              <div className="flex items-center gap-2 font-sans text-xs">
                <span className="text-[#a1a1aa]">Input Data:</span>
                <input
                  type="text"
                  value={repInput}
                  onChange={(e) => setRepInput(e.target.value)}
                  className="bg-[#0a0a0a] border border-[#292929] rounded-xl px-3 py-1.5 text-[#f5f5f5] focus:outline-none focus:border-emerald-500 w-48 sm:w-64 font-mono"
                />
              </div>
            </div>

            {/* Encodings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {/* Hexadecimal */}
              <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#292929] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold uppercase font-sans">{strings.experiments.exp1Hex}</span>
                  <button
                    onClick={() => copyToClipboard(repHash, 'hex')}
                    className="text-[#a1a1aa] hover:text-[#f5f5f5] flex items-center gap-1 font-sans cursor-pointer"
                  >
                    {copiedFormat === 'hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedFormat === 'hex' ? strings.hashGenerator.copied : strings.hashGenerator.copyFullHash}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-[#181818] text-[#f5f5f5] break-all select-all font-semibold font-mono border border-[#292929]">
                  {repHash}
                </div>
              </div>

              {/* Base64 */}
              <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#292929] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-300 font-bold uppercase font-sans">{strings.experiments.exp1Base64}</span>
                  <button
                    onClick={() => copyToClipboard(hexToBase64(repHash), 'base64')}
                    className="text-[#a1a1aa] hover:text-[#f5f5f5] flex items-center gap-1 font-sans cursor-pointer"
                  >
                    {copiedFormat === 'base64' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedFormat === 'base64' ? strings.hashGenerator.copied : strings.hashGenerator.copyFullHash}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-[#181818] text-[#f5f5f5] break-all select-all font-semibold font-mono border border-[#292929]">
                  {hexToBase64(repHash)}
                </div>
              </div>

              {/* 32 Decimal Bytes */}
              <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#292929] space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold uppercase font-sans">{strings.experiments.exp1Bytes}</span>
                  <span className="text-[#71717a] text-[11px] font-sans">32 uint8 elements</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#181818] text-emerald-300 font-mono text-[11px] break-all select-all leading-relaxed border border-[#292929]">
                  [{formatHexBytes(repHash).map((h) => parseInt(h, 16)).join(', ')}]
                </div>
              </div>

              {/* Full 256-bit Binary String */}
              <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#292929] space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold uppercase font-sans">{strings.experiments.exp1Binary}</span>
                  <button
                    onClick={() => copyToClipboard(hexToBinary(repHash), 'binary')}
                    className="text-[#a1a1aa] hover:text-[#f5f5f5] flex items-center gap-1 font-sans cursor-pointer"
                  >
                    {copiedFormat === 'binary' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedFormat === 'binary' ? strings.hashGenerator.copied : strings.hashGenerator.copyFullHash}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-[#181818] text-[#f5f5f5] font-mono text-[10px] break-all select-all leading-normal max-h-24 overflow-y-auto border border-[#292929]">
                  {hexToBinary(repHash)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experiment 2: Salted Hash & MAC Primitive */}
        {activeTab === 'salt' && (
          <div className="rounded-2xl bg-[#111111] border border-[#292929] p-6 sm:p-8 shadow-xl space-y-6 font-sans">
            <div className="border-b border-[#292929] pb-4">
              <h3 className="font-sans text-base font-bold text-emerald-400">
                {strings.experiments.tab2}
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-0.5 font-sans">
                {strings.experiments.exp2Desc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
              <div className="space-y-4">
                <div>
                  <label className="text-[#a1a1aa] block mb-1 font-semibold uppercase">
                    {strings.experiments.exp2SaltLabel}
                  </label>
                  <input
                    type="text"
                    value={saltKey}
                    onChange={(e) => setSaltKey(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#292929] rounded-xl px-4 py-2.5 text-[#f5f5f5] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[#a1a1aa] block mb-1 font-semibold uppercase">
                    {strings.experiments.exp2MsgLabel}
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#292929] rounded-xl px-4 py-2.5 text-[#f5f5f5] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0a0a0a] border border-[#292929] flex flex-col justify-between">
                <div>
                  <span className="text-[#71717a] uppercase text-[11px] block mb-1 font-sans">
                    {strings.experiments.exp2Combined}
                  </span>
                  <div className="p-3 rounded-lg bg-[#181818] border border-[#292929] text-emerald-400 font-bold break-all select-all mb-3 text-xs sm:text-sm font-mono">
                    {saltedHash}
                  </div>
                </div>

                <div className="text-[11px] text-[#a1a1aa] space-y-1 font-sans">
                  <p>• Formula: <code className="font-mono text-emerald-400">SHA-256(Salt || Message)</code></p>
                  <p>• Protects against offline pre-computed rainbow table lookup attacks.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experiment 3: Length & Scale Invariance */}
        {activeTab === 'length' && (
          <div className="rounded-2xl bg-[#111111] border border-[#292929] p-6 sm:p-8 shadow-xl space-y-6 font-sans">
            <div className="border-b border-[#292929] pb-4">
              <h3 className="font-sans text-base font-bold text-emerald-400">
                {strings.experiments.tab3}
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-0.5 font-sans">
                {strings.experiments.exp3Desc}
              </p>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div>
                <div className="flex justify-between text-[#a1a1aa] mb-2">
                  <span>{strings.experiments.exp3Multiplier}</span>
                  <span className="text-emerald-400 font-bold font-mono">{repeatCount} repeats ({repeatCount * 10} characters)</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={500}
                  value={repeatCount}
                  onChange={(e) => setRepeatCount(Number(e.target.value))}
                  className="w-full accent-emerald-400 bg-[#292929] h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#292929]">
                  <span className="text-[#71717a] block mb-1">{strings.experiments.exp3PayloadSize}</span>
                  <span className="text-[#f5f5f5] font-bold text-sm font-mono">{repeatCount * 10} bytes</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#292929]">
                  <span className="text-[#71717a] block mb-1">{strings.experiments.exp3BlocksReq}</span>
                  <span className="text-emerald-400 font-bold text-sm font-mono">{Math.ceil((repeatCount * 10 + 9) / 64)} blocks</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#292929]">
                  <span className="text-[#71717a] block mb-1">{strings.experiments.exp3DigestSize}</span>
                  <span className="text-emerald-400 font-bold text-sm font-mono">Strictly 256 bits (32B)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#292929]">
                <span className="text-[#71717a] text-[11px] block mb-1 uppercase font-semibold">
                  {strings.experiments.exp3ComputedDigest}
                </span>
                <div className="p-3 rounded-lg bg-[#181818] font-bold text-emerald-400 break-all select-all font-mono border border-[#292929]">
                  {lengthSampleHash}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experiment 4: Collision & Birthday Paradox */}
        {activeTab === 'collision' && (
          <CollisionVisualizer />
        )}

        {/* Experiment 5: Safe Preimage Brute-Force */}
        {activeTab === 'bruteforce' && (
          <BruteForceSimulator />
        )}
      </div>
    </section>
  );
};

