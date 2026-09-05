/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Boxes, 
  Hash, 
  Cpu, 
  RotateCcw, 
  Copy, 
  Check, 
  Layers, 
  ShieldCheck, 
  Binary,
  Pencil,
  FileCode,
  X
} from 'lucide-react';
import { hashSha256 } from '../../utils/sha256';
import { useLanguage } from '../../i18n/LanguageContext';

interface TransactionItem {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  originalAmount: number;
  hash: string;
  originalHash: string;
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  { id: 'tx0', sender: 'Coinbase', receiver: 'Miner_Node_1', amount: 3.125, originalAmount: 3.125, hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0', originalHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0' },
  { id: 'tx1', sender: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', receiver: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT', amount: 0.850, originalAmount: 0.850, hash: 'f0e1d2c3b4a5968778695a4b3c2d1e0f123456789abcdef0123456789abcdef0', originalHash: 'f0e1d2c3b4a5968778695a4b3c2d1e0f123456789abcdef0123456789abcdef0' },
  { id: 'tx2', sender: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', receiver: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', amount: 1.420, originalAmount: 1.420, hash: '9876543210abcdef0123456789abcdef0123456789abcdef0123456789abcdef', originalHash: '9876543210abcdef0123456789abcdef0123456789abcdef0123456789abcdef' },
  { id: 'tx3', sender: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', receiver: '1Q2TWHE3GMdB6BZKafqwxxiWAWgYqhedqu', amount: 0.500, originalAmount: 0.500, hash: '456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123', originalHash: '456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123' },
];

/**
 * Custom Hook: Matrix Decoder Scramble
 * Animates random hex character resolution during tab switching, tampering, and mining
 */
function useScrambleText(targetText: string, triggerKey: any, duration = 300) {
  const [displayText, setDisplayText] = useState(targetText);
  const [isScrambling, setIsScrambling] = useState(false);

  useEffect(() => {
    setIsScrambling(true);
    const hexChars = '0123456789abcdef';
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      if (progress >= 1) {
        setDisplayText(targetText);
        setIsScrambling(false);
        clearInterval(timer);
      } else {
        const resolvedLength = Math.floor(progress * targetText.length);
        let result = '';
        for (let i = 0; i < targetText.length; i++) {
          const char = targetText[i];
          if (char === ' ' || char === ':') {
            result += char;
          } else if (i < resolvedLength) {
            result += targetText[i];
          } else {
            result += hexChars[Math.floor(Math.random() * hexChars.length)];
          }
        }
        setDisplayText(result);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [targetText, triggerKey, duration]);

  return { displayText, isScrambling };
}

export const InteractiveBlockInspector: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [nonce, setNonce] = useState<number>(21417);
  const [blockHeight] = useState<number>(840291);
  const [prevHash] = useState<string>('000000000000000000021a4f9b87c12d45e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0');
  const [isMining, setIsMining] = useState<boolean>(false);
  const [miningFlash, setMiningFlash] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'header' | 'merkle' | 'bytestream'>('header');
  const [tamperedTxIndex, setTamperedTxIndex] = useState<number | null>(null);
  const [calculatedBlockHash, setCalculatedBlockHash] = useState<string>('000000a4f9e1d82c7b30f4e95126830a1c4b7e9f0d2a5c8e1b3d6f9a0c2e4b7a');
  const [scrambleTrigger, setScrambleTrigger] = useState<number>(0);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [isShockwave, setIsShockwave] = useState<boolean>(false);

  // 3D Hologram Tilt & Spotlight Ref and State
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number; inside: boolean }>({ x: 0, y: 0, inside: false });
  const [isInteractiveHovered, setIsInteractiveHovered] = useState<boolean>(false);

  // Modal State
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [selectedTxIndex, setSelectedTxIndex] = useState<number | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [editAmount, setEditAmount] = useState<string>('0.000');

  // Sample transactions in this block
  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS);

  // Compute Merkle Root
  const merkleRoot = useMemo(() => {
    const h0 = transactions[0].hash.slice(0, 16);
    const h1 = transactions[1].hash.slice(0, 16);
    const h2 = transactions[2].hash.slice(0, 16);
    const h3 = transactions[3].hash.slice(0, 16);
    return `d8e3b52a${h0}${h1}${h2}${h3}`.slice(0, 64);
  }, [transactions]);

  // Raw 80-byte header string
  const rawHeaderBytes = useMemo(() => {
    const v = '00000020';
    const p = prevHash.slice(0, 32);
    const m = merkleRoot.slice(0, 32);
    const t = '65e4a890';
    const b = '1d00ffff';
    const n = nonce.toString(16).padStart(8, '0');
    return `${v} ${p.slice(0, 16)} ${p.slice(16, 32)} ${m.slice(0, 16)} ${m.slice(16, 32)} ${t} ${b} ${n}`;
  }, [prevHash, merkleRoot, nonce]);

  // Recompute block hash when nonce or merkle root changes
  const updateHash = useCallback(async (currentNonce: number, mRoot: string) => {
    const rawHeader = `${blockHeight}:${prevHash.slice(0, 16)}:${mRoot.slice(0, 16)}:${currentNonce}:0x20000000`;
    const res = await hashSha256(rawHeader);
    setCalculatedBlockHash(res.hex);
  }, [blockHeight, prevHash]);

  useEffect(() => {
    updateHash(nonce, merkleRoot);
  }, [nonce, merkleRoot, updateHash]);

  // Scramble hooks for matrix decoder animation
  const { displayText: scrambledPrevHash, isScrambling: isPrevScrambling } = useScrambleText(
    prevHash,
    activeTab + '_' + scrambleTrigger,
    300
  );
  const { displayText: scrambledMerkleRoot, isScrambling: isMerkleScrambling } = useScrambleText(
    merkleRoot,
    activeTab + '_' + scrambleTrigger + '_' + tamperedTxIndex,
    300
  );
  const { displayText: scrambledHeaderBytes, isScrambling: isHeaderBytesScrambling } = useScrambleText(
    rawHeaderBytes,
    activeTab + '_' + scrambleTrigger,
    300
  );
  const { displayText: scrambledBlockHash, isScrambling: isHashScrambling } = useScrambleText(
    calculatedBlockHash,
    activeTab + '_' + scrambleTrigger + '_' + nonce,
    isMining ? 60 : 300
  );

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 3D Tilt calculation on mousemove with Interactive Flattening Lock
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // 1. Lock 3D calculation completely when Tx Modal is open
    if (isTxModalOpen) {
      setTilt({ x: 0, y: 0 });
      return;
    }
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    // 2. Check if hovering over interactive elements (buttons, tabs, inputs, transaction items)
    const target = e.target as HTMLElement | null;
    const isInteractive = !!target?.closest(
      'button, input, [role="button"], a, select, textarea, .cursor-pointer, .interactive-item'
    );

    if (isInteractive) {
      setIsInteractiveHovered(true);
      setTilt({ x: 0, y: 0 }); // Neutralize 3D tilt instantly for precise interaction
      setMousePos({ x, y, inside: true });
    } else {
      setIsInteractiveHovered(false);
      // Max tilt angle ±5 deg
      const rotateX = -((y / height) - 0.5) * 10;
      const rotateY = ((x / width) - 0.5) * 10;

      setTilt({ x: rotateX, y: rotateY });
      setMousePos({ x, y, inside: true });
    }
  };

  const handleMouseLeave = () => {
    setIsInteractiveHovered(false);
    setTilt({ x: 0, y: 0 });
    setMousePos((prev) => ({ ...prev, inside: false }));
  };

  // Real-time Nonce Mining Engine
  const handleMineStep = () => {
    if (isMining) return;
    setIsMining(true);
    const startNonce = 0;
    const targetNonce = 21417;
    const startTime = performance.now();
    const duration = 1200; // 1.2s

    const animateNonce = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease-out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(startNonce + (targetNonce - startNonce) * easeProgress);

      setNonce(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animateNonce);
      } else {
        setNonce(targetNonce);
        setIsMining(false);
        setMiningFlash(true);
        setScrambleTrigger((prev) => prev + 1);
        setTimeout(() => setMiningFlash(false), 450);
      }
    };
    requestAnimationFrame(animateNonce);
  };

  const handleOpenTxModal = (index: number) => {
    const tx = transactions[index];
    setSelectedTx(tx);
    setSelectedTxIndex(index);
    setEditAmount(tx.amount.toFixed(3));
    setIsTxModalOpen(true);
    setTilt({ x: 0, y: 0 });
  };

  const handleCloseTxModal = () => {
    setIsTxModalOpen(false);
    setSelectedTx(null);
    setSelectedTxIndex(null);
  };

  const handleApplyTamper = () => {
    if (selectedTxIndex === null || selectedTx === null) return;
    const targetIdx = selectedTxIndex;
    const numAmount = Math.max(0, parseFloat(editAmount) || 0);

    setTransactions((prev) => {
      return prev.map((tx, idx) => {
        if (idx === targetIdx) {
          const isChanged = Math.abs(numAmount - tx.originalAmount) > 0.000001;
          return {
            ...tx,
            amount: numAmount,
            hash: isChanged ? ('deadbeef' + tx.originalHash.slice(8)) : tx.originalHash,
          };
        }
        return { ...tx };
      });
    });

    const isChanged = Math.abs(numAmount - transactions[targetIdx].originalAmount) > 0.000001;
    if (isChanged) {
      setTamperedTxIndex(targetIdx);
      setIsGlitching(true);
      setIsShockwave(true);
      setTimeout(() => setIsGlitching(false), 200);
      setTimeout(() => setIsShockwave(false), 600);
    } else {
      if (tamperedTxIndex === targetIdx) {
        setTamperedTxIndex(null);
      }
    }

    setScrambleTrigger((prev) => prev + 1);
    handleCloseTxModal();
  };

  const handleRevertTamper = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setTamperedTxIndex(null);
    setScrambleTrigger((prev) => prev + 1);
  };

  const renderHighlightedHash = (hash: string, isScrambling = false) => {
    if (isScrambling) {
      return (
        <span className="text-cyan-300 font-semibold drop-shadow-[0_0_6px_rgba(0,210,255,0.6)]">
          {hash}
        </span>
      );
    }
    const match = hash.match(/^(0+)(.*)$/);
    if (match) {
      return (
        <>
          <span className="text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(0,210,255,0.8)]">{match[1]}</span>
          <span>{match[2]}</span>
        </>
      );
    }
    return hash;
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isTxModalOpen 
          ? 'none' 
          : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isTxModalOpen
          ? 'none'
          : isInteractiveHovered || (tilt.x === 0 && tilt.y === 0)
          ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease'
          : (mousePos.inside 
              ? 'transform 0.08s ease-out' 
              : 'transform 0.5s ease-out, border-color 0.3s ease, box-shadow 0.3s ease'),
      }}
      className={`relative group w-full rounded-2xl bg-white/[0.03] backdrop-blur-md border p-5 sm:p-6 text-slate-200 overflow-hidden transition-all duration-300 ${
        isGlitching ? 'animate-micro-glitch' : ''
      } ${
        miningFlash
          ? 'ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(0,210,255,0.6)] border-cyan-400'
          : isShockwave
          ? 'border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.4)]'
          : tamperedTxIndex !== null
          ? 'border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.2)]'
          : 'border-white/[0.08] hover:border-cyan-500/30'
      }`}
    >
      {/* 0. Radial Spotlight Follow Effect */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 -z-0"
        style={{
          opacity: (!isTxModalOpen && mousePos.inside) ? 1 : 0,
          background:
            tamperedTxIndex !== null
              ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(244, 63, 94, 0.12), transparent 80%)`
              : `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 210, 255, 0.08), transparent 80%)`,
        }}
      />

      {/* Subtle background glow element strictly inside the card */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Laser Scanline ngầm - Freeze on Hover */}
      <div
        className={`pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent ${
          tamperedTxIndex !== null
            ? 'via-rose-500/[0.12] animate-[scanline_2s_ease-in-out_infinite]'
            : 'via-cyan-400/[0.07] animate-[scanline_4s_ease-in-out_infinite]'
        } to-transparent -z-0 group-hover:[animation-play-state:paused]`}
      />

      {/* Cyber Corner Highlights */}
      <div className={`absolute top-0 left-0 w-3 h-[1px] ${tamperedTxIndex !== null ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_6px_#00d2ff]'}`} />
      <div className={`absolute top-0 left-0 w-[1px] h-3 ${tamperedTxIndex !== null ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_6px_#00d2ff]'}`} />
      <div className={`absolute top-0 right-0 w-3 h-[1px] ${tamperedTxIndex !== null ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_6px_#00d2ff]'}`} />
      <div className={`absolute top-0 right-0 w-[1px] h-3 ${tamperedTxIndex !== null ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_6px_#00d2ff]'}`} />
      <div className={`absolute bottom-0 left-0 w-3 h-[1px] ${tamperedTxIndex !== null ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_6px_#00d2ff]'}`} />
      <div className={`absolute bottom-0 left-0 w-[1px] h-3 ${tamperedTxIndex !== null ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_6px_#00d2ff]'}`} />
      <div className={`absolute bottom-0 right-0 w-3 h-[1px] ${tamperedTxIndex !== null ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_6px_#00d2ff]'}`} />
      <div className={`absolute bottom-0 right-0 w-[1px] h-3 ${tamperedTxIndex !== null ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_6px_#00d2ff]'}`} />

      {/* 1. Top Header Row */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono font-bold text-sm text-slate-100">
              {isVi ? `Khối #${blockHeight}` : `Block #${blockHeight}`}
            </div>
          </div>
        </div>

        {/* Action Button: Đào khối (Kinetic Nonce Mining Engine) */}
        <button
          onClick={handleMineStep}
          disabled={isMining}
          className="bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs px-3 py-1.5 rounded-lg font-sans font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Cpu className={`w-3.5 h-3.5 text-cyan-400 ${isMining ? 'animate-spin' : ''}`} />
          <span>{isMining ? (isVi ? 'Đang tính toán Nonce...' : 'Computing Nonce...') : (isVi ? 'Đào khối' : 'Mine Block')}</span>
        </button>
      </div>

      {/* 2. Navigation Sub-tabs (Neon Capsule Tabs) */}
      <div className="p-1 bg-black/50 backdrop-blur-md border border-white/[0.08] rounded-xl flex items-center gap-1.5 mb-4 relative z-10">
        <button
          onClick={() => {
            setActiveTab('header');
            setScrambleTrigger((prev) => prev + 1);
          }}
          className={`flex-1 px-4 py-2 rounded-lg font-sans text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'header'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_14px_rgba(0,210,255,0.3)] font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent font-medium'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isVi ? 'Tiêu đề khối' : 'Block Header'}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('merkle');
            setScrambleTrigger((prev) => prev + 1);
          }}
          className={`flex-1 px-4 py-2 rounded-lg font-sans text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'merkle'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_14px_rgba(0,210,255,0.3)] font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent font-medium'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>{isVi ? 'Cây Merkle' : 'Merkle Tree'}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('bytestream');
            setScrambleTrigger((prev) => prev + 1);
          }}
          className={`flex-1 px-4 py-2 rounded-lg font-sans text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'bytestream'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_14px_rgba(0,210,255,0.3)] font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent font-medium'
          }`}
        >
          <Binary className="w-3.5 h-3.5 text-teal-400" />
          <span>{isVi ? 'Luồng 80-Byte' : '80-Byte Stream'}</span>
        </button>
      </div>

      {/* 3. Anti-Layout Shift Tab Content Container */}
      <div className="min-h-[385px] flex flex-col justify-between py-2 transition-all duration-200 relative z-10">
        {/* Tab Content 1: Block Header Inspector */}
        {activeTab === 'header' && (
          <div className="space-y-3 font-sans text-xs">
            {/* Previous Block Hash */}
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-slate-400">
                  <Hash className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{isVi ? 'Mã băm trước' : 'Previous Hash'}</span>
                </span>
                <button
                  onClick={() => handleCopy(prevHash, 'prev')}
                  className="text-slate-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                  title={isVi ? 'Sao chép' : 'Copy'}
                >
                  {copiedKey === 'prev' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />}
                </button>
              </div>
              <div className="bg-black/40 border border-white/[0.06] rounded-lg px-3 py-2 font-mono text-[11px] leading-relaxed break-all text-slate-300 select-all cursor-text">
                {renderHighlightedHash(scrambledPrevHash, isPrevScrambling)}
              </div>
            </div>

            {/* Merkle Root Hash */}
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{isVi ? 'Gốc Merkle' : 'Merkle Root'}</span>
                </span>
                <button
                  onClick={() => handleCopy(merkleRoot, 'merkle')}
                  className="text-slate-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                  title={isVi ? 'Sao chép' : 'Copy'}
                >
                  {copiedKey === 'merkle' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />}
                </button>
              </div>
              <div className={`bg-black/40 border rounded-lg px-3 py-2 font-mono text-[11px] leading-relaxed break-all select-all cursor-text transition-colors ${
                tamperedTxIndex !== null
                  ? 'bg-rose-950/30 text-rose-300 border-rose-500/40'
                  : isMerkleScrambling
                  ? 'border-cyan-500/30 text-cyan-300'
                  : 'border-white/[0.06] text-slate-300'
              }`}>
                {isMerkleScrambling ? (
                  <span className="text-cyan-300 font-semibold drop-shadow-[0_0_6px_rgba(0,210,255,0.6)]">
                    {scrambledMerkleRoot}
                  </span>
                ) : (
                  scrambledMerkleRoot
                )}
              </div>
            </div>

            {/* 4. Nonce & Timestamp & Version Grid (3 Columns) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">Nonce</span>
                <div className="flex items-center justify-between">
                  <span className={`font-mono font-semibold text-sm tabular-nums transition-colors ${
                    isMining ? 'text-amber-400 animate-pulse group-hover:[animation-play-state:paused] drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-cyan-400'
                  }`}>
                    {nonce}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setNonce((n) => Math.max(0, n - 1))}
                      className="w-4 h-4 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[10px] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-white/[0.06]"
                      title="Decrease Nonce"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setNonce((n) => n + 1)}
                      className="w-4 h-4 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[10px] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-white/[0.06]"
                      title="Increase Nonce"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
                  {isVi ? 'Thời gian' : 'Time'}
                </span>
                <span className="font-mono text-xs text-slate-200 tabular-nums block mt-1">
                  10:14:54 UTC
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
                  {isVi ? 'Phiên bản' : 'Version'}
                </span>
                <span className="font-mono text-xs text-slate-300 block mt-1">
                  0x20000000
                </span>
              </div>
            </div>

            {/* Computed Hash */}
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{isVi ? 'Mã băm khối' : 'Block Hash'}</span>
                </span>
                <button
                  onClick={() => handleCopy(calculatedBlockHash, 'computed')}
                  className="text-slate-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                  title={isVi ? 'Sao chép' : 'Copy'}
                >
                  {copiedKey === 'computed' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />}
                </button>
              </div>
              <div className={`bg-black/40 border rounded-lg px-3 py-2 font-mono text-[11px] leading-relaxed break-all select-all cursor-text transition-all duration-300 ${
                miningFlash
                  ? 'ring-2 ring-cyan-400 bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.6)] text-cyan-200'
                  : 'border-white/[0.06] text-slate-300'
              }`}>
                {renderHighlightedHash(scrambledBlockHash, isHashScrambling || isMining)}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Merkle Tree Inspector */}
        {activeTab === 'merkle' && (
          <div className="space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{isVi ? 'Nhấp vào giao dịch để mô phỏng phát hiện gian lận:' : 'Click on any transaction to simulate tamper detection:'}</span>
              {tamperedTxIndex !== null && (
                <button
                  onClick={handleRevertTamper}
                  className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isVi ? 'Khôi phục' : 'Revert Tamper'}</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {transactions.map((tx, idx) => {
                const isTampered = tamperedTxIndex === idx;

                if (isTampered) {
                  return (
                    <div
                      key={tx.id}
                      onClick={() => handleOpenTxModal(idx)}
                      title={isVi ? 'Nhấp để kiểm tra và can thiệp giao dịch' : 'Click to inspect and tamper transaction'}
                      className="flex items-center justify-between p-3 rounded-xl border border-rose-500/70 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.25)] animate-pulse group-hover:[animation-play-state:paused] transition-all cursor-pointer group/tampered"
                    >
                      {idx === 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold text-rose-400 bg-rose-500/20 border border-rose-500/40">
                            T0
                          </span>
                          <span className="font-sans text-xs text-rose-200 font-medium">
                            {isVi ? 'Thưởng đào khối (Coinbase)' : 'Coinbase Block Reward'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold text-rose-400 bg-rose-500/20 border border-rose-500/40">
                            T{idx}
                          </span>
                          <span className="font-mono text-xs text-rose-200 ml-2.5">
                            {tx.sender.slice(0, 6)}...{tx.receiver.slice(-6)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-xs text-rose-400">
                          {tx.amount.toFixed(3)} BTC
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-sans font-bold text-rose-300 bg-rose-500/20 border border-rose-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping group-hover:[animation-play-state:paused]" />
                          <span>{isVi ? 'Đã can thiệp' : 'Tampered'}</span>
                        </span>
                      </div>
                    </div>
                  );
                }

                if (idx === 0) {
                  return (
                    <div
                      key={tx.id}
                      onClick={() => handleOpenTxModal(idx)}
                      title={isVi ? 'Nhấp để kiểm tra và can thiệp giao dịch' : 'Click to inspect and tamper transaction'}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-400/50 hover:bg-cyan-500/[0.04] hover:shadow-[0_0_15px_rgba(0,210,255,0.15)] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30">
                          T0
                        </span>
                        <span className="font-sans text-xs text-slate-300 font-medium">
                          {isVi ? 'Thưởng đào khối (Coinbase)' : 'Coinbase Block Reward'}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                        {tx.amount.toFixed(3)} BTC
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={tx.id}
                    onClick={() => handleOpenTxModal(idx)}
                    title={isVi ? 'Nhấp để kiểm tra và can thiệp giao dịch' : 'Click to inspect and tamper transaction'}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-400/50 hover:bg-cyan-500/[0.04] hover:shadow-[0_0_15px_rgba(0,210,255,0.15)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30">
                        T{idx}
                      </span>
                      <span className="font-mono text-xs text-slate-300 ml-2.5">
                        {tx.sender.slice(0, 6)}...{tx.receiver.slice(-6)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                      {tx.amount.toFixed(3)} BTC
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content 3: 80-Byte Stream Serialization */}
        {activeTab === 'bytestream' && (
          <div className="space-y-3 font-sans text-xs">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>{isVi ? 'Chuỗi nhị phân chuẩn hóa 80-Byte Header Bitcoin:' : 'Canonical Bitcoin 80-Byte Header Serialization:'}</span>
              <span className="text-cyan-400 font-mono text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                80 BYTES / 160 HEX
              </span>
            </div>
            <div className={`p-3.5 rounded-lg bg-black/40 border text-[11px] lg:text-xs leading-relaxed break-all select-all cursor-text font-mono tracking-normal transition-colors ${
              isHeaderBytesScrambling ? 'border-cyan-500/30 text-cyan-300 drop-shadow-[0_0_6px_rgba(0,210,255,0.4)]' : 'border-white/[0.06] text-slate-300'
            }`}>
              {scrambledHeaderBytes}
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10px] font-sans pt-1">
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Version</span>
                <span className="font-mono text-slate-200">4 Bytes</span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Prev Hash</span>
                <span className="font-mono text-slate-200">32 Bytes</span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Merkle Root</span>
                <span className="font-mono text-slate-200">32 Bytes</span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Nonce+Time</span>
                <span className="font-mono text-slate-200">12 Bytes</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Footer trạng thái mạng (Network Status Bar) */}
      {tamperedTxIndex !== null ? (
        <div className="flex items-center gap-2 text-xs font-mono text-rose-400 pt-2 border-t border-rose-500/20 mt-4 relative z-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-80 group-hover:[animation-play-state:paused]" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          </span>
          <span className="font-semibold">{isVi ? 'Mất đồng thuận · Khối vô hiệu' : 'Consensus Broken · Invalid Block'}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-mono text-success pt-2 border-t border-white/[0.06] mt-4 relative z-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-success opacity-75 group-hover:[animation-play-state:paused]" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </span>
          <span>{isVi ? 'Mạng đồng thuận' : 'Network Consensus'}</span>
        </div>
      )}

      {/* Transaction Inspector Modal (Glassmorphism Popup) */}
      {isTxModalOpen && selectedTx && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={handleCloseTxModal}
        >
          <div 
            className="max-w-md w-full bg-[#0B101E]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative font-sans text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {(() => {
              const isCoinbase = selectedTx.id === 'tx0' || selectedTxIndex === 0;
              return (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <FileCode className={`w-4 h-4 ${isCoinbase ? 'text-purple-400' : 'text-cyan-400'}`} />
                      {isCoinbase ? (
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-semibold text-sm text-white">
                            {isVi ? 'Chi tiết giao dịch #0' : 'Transaction details #0'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 border border-purple-500/30 text-purple-300">
                            Coinbase
                          </span>
                        </div>
                      ) : (
                        <span className="font-sans font-semibold text-sm text-white">
                          {isVi ? `Chi tiết giao dịch #${selectedTxIndex ?? 0}` : `Transaction details #${selectedTxIndex ?? 0}`}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={handleCloseTxModal}
                      className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="py-4 space-y-3.5">
                    {/* Tx ID & Hash */}
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[11px] font-medium block">
                        {isVi ? 'Mã băm giao dịch (TxID)' : 'Transaction Hash (TxID)'}
                      </span>
                      <div className="p-2.5 rounded-lg bg-black/50 border border-white/[0.06] font-mono text-[11px] text-slate-300 break-all select-all cursor-text leading-relaxed">
                        {selectedTx.hash}
                      </div>
                    </div>

                    {/* Sender & Receiver */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          {isVi ? 'Người gửi' : 'Sender'}
                        </span>
                        <span className="font-mono text-[11px] text-slate-200 break-all select-all cursor-text block">
                          {isCoinbase ? 'Coinbase (Hệ thống)' : `${selectedTx.sender.slice(0, 10)}...`}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          {isVi ? 'Người nhận' : 'Receiver'}
                        </span>
                        <span className="font-mono text-[11px] text-slate-200 break-all select-all cursor-text block">
                          {`${selectedTx.receiver.slice(0, 10)}...`}
                        </span>
                      </div>
                    </div>

                    {/* Amount & Tamper Simulation Input */}
                    <div className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-sans font-medium text-amber-300 text-xs flex items-center gap-1.5">
                          <Pencil className="w-3.5 h-3.5" />
                          <span>{isVi ? 'Thử nghiệm can thiệp giá trị Bitcoin' : 'Simulate Value Tampering'}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {isVi ? 'Gốc:' : 'Original:'} {selectedTx.originalAmount.toFixed(3)} BTC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {isVi 
                          ? 'Thay đổi số lượng BTC sẽ làm biến đổi mã băm TxID ➔ thay đổi Gốc Merkle ➔ phá vỡ tính toàn vẹn của khối.' 
                          : 'Modifying the BTC amount alters the TxID hash ➔ invalidates Merkle Root ➔ breaks block integrity.'}
                      </p>

                      <div className="relative mt-2">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          lang="en-US"
                          inputMode="decimal"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full bg-black/60 border border-amber-500/40 focus:border-amber-400 rounded-lg px-3 py-2 text-sm font-mono text-amber-300 font-bold outline-none pr-14"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                          BTC
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setEditAmount((prev) => (Math.max(0, parseFloat(prev || '0')) + 1.0).toFixed(3))}
                          className="px-2.5 py-1 rounded-md text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer"
                        >
                          +1.0 BTC
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditAmount(selectedTx.originalAmount.toFixed(3))}
                          className="px-2.5 py-1 rounded-md text-xs font-sans text-slate-400 bg-white/[0.04] border border-white/[0.08] hover:text-white transition-all cursor-pointer"
                        >
                          {isVi ? 'Khôi phục mặc định' : 'Reset to default'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={handleCloseTxModal}
                      className="px-3.5 py-2 rounded-lg text-xs font-sans text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                    >
                      {isVi ? 'Hủy' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyTamper}
                      className={`px-4 py-2 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer ${
                        Math.abs((parseFloat(editAmount) || 0) - selectedTx.originalAmount) > 0.000001
                          ? 'bg-rose-600/30 text-rose-200 border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:bg-rose-600/40'
                          : 'bg-white/[0.06] text-slate-400 border border-white/[0.08] hover:text-white'
                      }`}
                    >
                      {Math.abs((parseFloat(editAmount) || 0) - selectedTx.originalAmount) > 0.000001
                        ? (isVi ? 'Áp dụng can thiệp (Giả mạo)' : 'Apply Tamper (Simulate)')
                        : (isVi ? 'Đóng' : 'Done')}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
