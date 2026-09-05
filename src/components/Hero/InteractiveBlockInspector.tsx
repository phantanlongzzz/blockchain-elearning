/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Boxes, 
  Hash, 
  Key, 
  Cpu, 
  CheckCircle2, 
  RotateCcw, 
  Copy, 
  Check, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Binary,
  Zap,
  RefreshCw
} from 'lucide-react';
import { hashSha256 } from '../../utils/sha256';

interface TransactionItem {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  hash: string;
}

export const InteractiveBlockInspector: React.FC = () => {
  const [nonce, setNonce] = useState<number>(21417);
  const [blockHeight] = useState<number>(840291);
  const [prevHash] = useState<string>('000000000000000000021a4f9b87c12d45e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0');
  const [isMining, setIsMining] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'header' | 'merkle' | 'bytestream'>('header');
  const [tamperedTxIndex, setTamperedTxIndex] = useState<number | null>(null);
  const [calculatedBlockHash, setCalculatedBlockHash] = useState<string>('000000a4f9e1d82c7b30f4e95126830a1c4b7e9f0d2a5c8e1b3d6f9a0c2e4b7a');

  // Sample transactions in this block
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    { id: 'tx0', sender: 'Coinbase (Reward)', receiver: 'Miner_Node_1', amount: 3.125, hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0' },
    { id: 'tx1', sender: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', receiver: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT', amount: 0.850, hash: 'f0e1d2c3b4a5968778695a4b3c2d1e0f123456789abcdef0123456789abcdef0' },
    { id: 'tx2', sender: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', receiver: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', amount: 1.420, hash: '9876543210abcdef0123456789abcdef0123456789abcdef0123456789abcdef' },
    { id: 'tx3', sender: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', receiver: '1Q2TWHE3GMdB6BZKafqwxxiWAWgYqhedqu', amount: 0.250, hash: '456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123' },
  ]);

  // Compute Merkle Root
  const merkleRoot = useMemo(() => {
    // simplified pairwise hash for demonstration
    const h0 = transactions[0].hash.slice(0, 16);
    const h1 = transactions[1].hash.slice(0, 16);
    const h2 = transactions[2].hash.slice(0, 16);
    const h3 = transactions[3].hash.slice(0, 16);
    return `d8e3b52a${h0}${h1}${h2}${h3}`.slice(0, 64);
  }, [transactions]);

  // Recompute block hash when nonce or merkle root changes
  const updateHash = useCallback(async (currentNonce: number, mRoot: string) => {
    const rawHeader = `${blockHeight}:${prevHash.slice(0, 16)}:${mRoot.slice(0, 16)}:${currentNonce}:0x20000000`;
    const res = await hashSha256(rawHeader);
    setCalculatedBlockHash(res.hex);
  }, [blockHeight, prevHash]);

  useEffect(() => {
    updateHash(nonce, merkleRoot);
  }, [nonce, merkleRoot, updateHash]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleMineStep = () => {
    setIsMining(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setNonce((prev) => prev + Math.floor(Math.random() * 7) + 1);
      if (step >= 8) {
        clearInterval(interval);
        setIsMining(false);
      }
    }, 60);
  };

  const toggleTamperTx = (index: number) => {
    if (tamperedTxIndex === index) {
      // Revert
      setTransactions((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          amount: index === 1 ? 0.850 : 1.420,
          hash: index === 1 
            ? 'f0e1d2c3b4a5968778695a4b3c2d1e0f123456789abcdef0123456789abcdef0'
            : '9876543210abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
        };
        return copy;
      });
      setTamperedTxIndex(null);
    } else {
      // Tamper
      setTransactions((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          amount: copy[index].amount * 10,
          hash: 'deadbeef' + copy[index].hash.slice(8)
        };
        return copy;
      });
      setTamperedTxIndex(index);
    }
  };

  // Raw byte stream preview
  const rawHeaderBytes = useMemo(() => {
    const v = '00000020';
    const p = prevHash.slice(0, 32);
    const m = merkleRoot.slice(0, 32);
    const t = '65e4a890';
    const b = '1d00ffff';
    const n = nonce.toString(16).padStart(8, '0');
    return `${v} ${p.slice(0, 16)} ${p.slice(16, 32)} ${m.slice(0, 16)} ${m.slice(16, 32)} ${t} ${b} ${n}`;
  }, [prevHash, merkleRoot, nonce]);

  const isValidBlock = calculatedBlockHash.startsWith('0000') || !tamperedTxIndex;

  return (
    <div className="relative group w-full rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 text-slate-200 transition-all duration-300 hover:border-cyan-500/30">
      {/* Subtle background glow element strictly inside the card */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white tracking-wider">
                BLOCK #{blockHeight}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                NIST FIPS 180-4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Diff Target: 0x1d00ffff · 4 Transactions
            </p>
          </div>
        </div>

        {/* Mining button */}
        <button
          onClick={handleMineStep}
          disabled={isMining}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Zap className={`w-3.5 h-3.5 text-cyan-400 ${isMining ? 'animate-spin' : ''}`} />
          <span>{isMining ? 'Mining...' : 'Mine Nonce'}</span>
        </button>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-lg border border-white/[0.06] mb-4">
        <button
          onClick={() => setActiveTab('header')}
          className={`py-1.5 text-xs font-mono font-medium rounded transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'header'
              ? 'bg-white/[0.08] text-white border border-white/[0.1]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Block Header</span>
        </button>
        <button
          onClick={() => setActiveTab('merkle')}
          className={`py-1.5 text-xs font-mono font-medium rounded transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'merkle'
              ? 'bg-white/[0.08] text-white border border-white/[0.1]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Merkle Tree</span>
        </button>
        <button
          onClick={() => setActiveTab('bytestream')}
          className={`py-1.5 text-xs font-mono font-medium rounded transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'bytestream'
              ? 'bg-white/[0.08] text-white border border-white/[0.1]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Binary className="w-3.5 h-3.5 text-teal-400" />
          <span>80-Byte Stream</span>
        </button>
      </div>

      {/* Tab Content 1: Block Header Inspector */}
      {activeTab === 'header' && (
        <div className="space-y-3 font-mono text-xs">
          {/* Previous Block Hash */}
          <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-cyan-400" />
                <span>Previous Block Hash (Parent):</span>
              </span>
              <button
                onClick={() => handleCopy(prevHash, 'prev')}
                className="hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'prev' ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'prev' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-300 break-all select-all font-mono tracking-tight bg-black/40 p-1.5 rounded border border-white/[0.04]">
              {prevHash}
            </div>
          </div>

          {/* Merkle Root Hash */}
          <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-400" />
                <span>Merkle Root (TXs Commitment):</span>
              </span>
              <button
                onClick={() => handleCopy(merkleRoot, 'merkle')}
                className="hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'merkle' ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'merkle' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className={`text-[11px] break-all select-all font-mono tracking-tight p-1.5 rounded border ${
              tamperedTxIndex !== null
                ? 'bg-rose-950/30 text-rose-300 border-rose-500/40'
                : 'bg-black/40 text-cyan-300 border-white/[0.04]'
            }`}>
              {merkleRoot}
            </div>
          </div>

          {/* Nonce & Timestamp Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 block uppercase">Nonce (PoW)</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold text-white font-mono">{nonce}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setNonce((n) => n + 1)}
                    className="w-5 h-5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setNonce((n) => Math.max(0, n - 1))}
                    className="w-5 h-5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    -
                  </button>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 block uppercase">Timestamp (UTC)</span>
              <span className="text-xs font-semibold text-slate-200 mt-1 block">
                {new Date().toISOString().slice(11, 19)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.06] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block uppercase">Block Version</span>
              <span className="text-xs font-semibold text-cyan-300 mt-1 block">
                0x20000000 (v4)
              </span>
            </div>
          </div>

          {/* Computed Double SHA-256 Hash */}
          <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-cyan-300 uppercase font-semibold">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>SHA-256² Computed Block Digest:</span>
              </span>
              <span className="text-[9px] font-mono text-cyan-400">
                {calculatedBlockHash.startsWith('0000') ? 'VALID PROOF-OF-WORK' : 'HEADER HASH'}
              </span>
            </div>
            <div className="text-[11px] text-cyan-200 font-bold break-all select-all font-mono tracking-tight bg-black/50 p-1.5 rounded border border-cyan-500/20">
              {calculatedBlockHash}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Merkle Tree Tree Inspector */}
      {activeTab === 'merkle' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
            <span>Click on any transaction to simulate tamper detection:</span>
            {tamperedTxIndex !== null && (
              <button
                onClick={() => toggleTamperTx(tamperedTxIndex)}
                className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-mono"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Revert Tamper</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {transactions.map((tx, idx) => {
              const isTampered = tamperedTxIndex === idx;
              return (
                <div
                  key={tx.id}
                  onClick={() => toggleTamperTx(idx)}
                  className={`p-2 rounded-lg border transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 ${
                    isTampered
                      ? 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                      : 'bg-black/30 border-white/[0.06] hover:border-white/[0.12] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-white/[0.06] flex items-center justify-center text-[10px] font-bold shrink-0">
                      T{idx}
                    </span>
                    <div className="truncate text-[11px]">
                      <span className="text-slate-400">{tx.sender.slice(0, 10)}...</span>
                      <span className="text-slate-500 mx-1">→</span>
                      <span className="text-slate-200">{tx.receiver.slice(0, 10)}...</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-amber-400 font-bold text-[11px]">
                      {tx.amount.toFixed(3)} BTC
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                      isTampered
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-white/[0.06] text-slate-400'
                    }`}>
                      {isTampered ? 'TAMPERED' : 'VERIFIED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
            Changing a single transaction bit causes the pairwise Merkle intermediate hashes to cascade changes up to the Merkle Root, invalidating the entire Block Header.
          </p>
        </div>
      )}

      {/* Tab Content 3: 80-Byte Stream Serialization */}
      {activeTab === 'bytestream' && (
        <div className="space-y-2.5 font-mono text-xs">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Canonical Bitcoin 80-Byte Header Serialization:</span>
            <span className="text-cyan-400 font-mono">80 BYTES / 160 HEX</span>
          </div>
          <div className="p-3 rounded-lg bg-black/60 border border-white/[0.08] text-[11px] text-cyan-300/90 leading-relaxed break-all select-all font-mono tracking-wider">
            {rawHeaderBytes}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400 font-sans pt-1">
            <div className="p-1.5 rounded bg-black/30 border border-white/[0.04]">
              <span className="text-slate-500 block">Version:</span>
              <span className="font-mono text-white">4 Bytes (0x20000000)</span>
            </div>
            <div className="p-1.5 rounded bg-black/30 border border-white/[0.04]">
              <span className="text-slate-500 block">Prev Hash:</span>
              <span className="font-mono text-white">32 Bytes (LE)</span>
            </div>
            <div className="p-1.5 rounded bg-black/30 border border-white/[0.04]">
              <span className="text-slate-500 block">Merkle Root:</span>
              <span className="font-mono text-white">32 Bytes (LE)</span>
            </div>
            <div className="p-1.5 rounded bg-black/30 border border-white/[0.04]">
              <span className="text-slate-500 block">Nonce + Time:</span>
              <span className="font-mono text-white">12 Bytes</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Pill at Bottom */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="text-slate-300 font-medium">
            Network State: <strong className="text-cyan-300 font-semibold">Consensus Synchronized</strong>
          </span>
        </div>

        <span className="text-[10px] font-mono text-slate-400">
          Peer Nodes: 12 Active
        </span>
      </div>
    </div>
  );
};
