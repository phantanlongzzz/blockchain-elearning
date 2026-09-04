import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Globe,
  Building,
  Users,
  Layers,
  ArrowDown,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { fastSha256Hex } from '../../utils/sha256';
import { SimBlock, BlockchainTypeEnum, BlockchainTypeInfo } from './types';

interface BuildBlockchainLabProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
  onPrevStage?: () => void;
  isHandsOn?: boolean;
}

const BLOCKCHAIN_TYPES: BlockchainTypeInfo[] = [
  {
    id: 'public',
    name: { vi: 'Public Blockchain (Mở / Công Khai)', en: 'Public Blockchain (Permissionless)' },
    tagline: { vi: 'Bất kỳ ai cũng có thể tham gia đọc, gửi giao dịch và đào khối', en: 'Anyone can join, read, transact, and validate blocks' },
    access: { vi: 'Hoàn toàn mở (Permissionless)', en: 'Open / Permissionless' },
    control: { vi: 'Phi tập trung hoàn toàn (P2P Consensus)', en: 'Fully Decentralized' },
    purpose: { vi: 'Tiền tệ phi tập trung, hợp đồng thông minh toàn cầu', en: 'Decentralized sound money, global smart contracts' },
    architecture: { vi: 'Hàng chục nghìn node độc lập phân tán', en: 'Tens of thousands of sovereign nodes' },
    example: 'Bitcoin, Ethereum',
  },
  {
    id: 'private',
    name: { vi: 'Private Blockchain (Nội Bộ / Cấp Phép)', en: 'Private Blockchain (Permissioned)' },
    tagline: { vi: 'Thuộc quyền sở hữu và kiểm soát nghiêm ngặt của 1 tổ chức duy nhất', en: 'Strictly owned and operated by a single enterprise' },
    access: { vi: 'Phải được cấp quyền mời vào', en: 'Restricted / Whitelist only' },
    control: { vi: 'Tập trung vào 1 tổ chức quản trị', en: 'Centralized to 1 organization' },
    purpose: { vi: 'Quản lý chuỗi cung ứng nội bộ, tối ưu hóa cơ sở dữ liệu', en: 'Internal supply-chain tracking, database audit' },
    architecture: { vi: 'Một nhóm server do tổ chức tự vận hành', en: 'Enterprise-controlled private server cluster' },
    example: 'Hyperledger Fabric, R3 Corda',
  },
  {
    id: 'consortium',
    name: { vi: 'Consortium Blockchain (Liên Minh)', en: 'Consortium / Federated' },
    tagline: { vi: 'Được đồng quản trị bởi một nhóm các tổ chức/doanh nghiệp uy tín', en: 'Governed by a pre-selected consortium of institutions' },
    access: { vi: 'Cấp phép cho các thành viên trong liên minh', en: 'Permissioned among alliance members' },
    control: { vi: 'Đa trung tâm (Multi-organization consensus)', en: 'Multi-institutional governance' },
    purpose: { vi: 'Thanh toán liên ngân hàng, logistic đa quốc gia', en: 'Interbank settlement, cross-border logistics' },
    architecture: { vi: 'Mỗi ngân hàng/tổ chức đóng góp 1 hoặc vài validator nodes', en: 'Each member runs authorized validator nodes' },
    example: 'Quorum (JPMorgan), B3i (Insurance Consortium)',
  },
  {
    id: 'sidechain',
    name: { vi: 'Sidechain (Chuỗi Phụ)', en: 'Sidechain (Layer-2 / Pegged)' },
    tagline: { vi: 'Chuỗi khối độc lập chạy song song và neo giá với Chuỗi chính (Mainchain)', en: 'Independent blockchain connected via a two-way peg' },
    access: { vi: 'Thường công khai hoặc bán công khai', en: 'Hybrid public / custom consensus' },
    control: { vi: 'Cơ chế đồng thuận riêng, giảm tải cho Mainchain', en: 'Independent consensus, offloads mainnet' },
    purpose: { vi: 'Tăng tốc độ giao dịch, giảm phí gas, mở rộng quy mô', en: 'High throughput, micro-fees, scalability' },
    architecture: { vi: 'Liên kết với chuỗi chính qua cầu nối Hai Chiều (Two-way Peg)', en: 'Two-way peg bridge to parent mainchain' },
    example: 'Liquid Network (Bitcoin), Polygon PoS (Ethereum)',
  },
];

export const BuildBlockchainLab: React.FC<BuildBlockchainLabProps> = ({
  onInteracted,
  onNextStage,
  onPrevStage,
  isHandsOn = false,
}) => {
  const { language } = useLanguage();

  // 4 Blocks in the chain
  const [chain, setChain] = useState<SimBlock[]>([
    {
      index: 0,
      timestamp: '2009-01-03 18:15:05',
      txs: [{ id: 'tx0', sender: 'COINBASE', receiver: 'Satoshi', amount: 50 }],
      merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      nonce: 2083236893,
      hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
      isValid: true,
    },
    {
      index: 1,
      timestamp: '2026-08-20 10:00:00',
      txs: [{ id: 'tx1', sender: 'Alice', receiver: 'Bob', amount: 10 }],
      merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      previousHash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
      nonce: 14829,
      hash: '00008fbc72d63412a88432a10b99de23456123490aafe123456789abcdef0123',
      isValid: true,
      isTampered: false,
    },
    {
      index: 2,
      timestamp: '2026-08-20 10:10:00',
      txs: [{ id: 'tx2', sender: 'Bob', receiver: 'Charlie', amount: 5 }],
      merkleRoot: '7d5a99f603f231d539ee9d8f6d2e67f0b5d5b8823528b6d88ff7b7bb6f784e2a',
      previousHash: '00008fbc72d63412a88432a10b99de23456123490aafe123456789abcdef0123',
      nonce: 98124,
      hash: '000034aefc882145990812736123984012938471203984710293847129384712',
      isValid: true,
      isTampered: false,
    },
    {
      index: 3,
      timestamp: '2026-08-20 10:20:00',
      txs: [{ id: 'tx3', sender: 'Charlie', receiver: 'Dave', amount: 2 }],
      merkleRoot: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      previousHash: '000034aefc882145990812736123984012938471203984710293847129384712',
      nonce: 45712,
      hash: '0000918237461928374619283746192837461928374619283746192837461928',
      isValid: true,
      isTampered: false,
    },
  ]);

  const [isChainTampered, setIsChainTampered] = useState<boolean>(false);
  const [selectedBlockchainType, setSelectedBlockchainType] = useState<BlockchainTypeEnum>('public');

  // Recalculate block validity whenever chain updates
  const computeChainIntegrity = (blocks: SimBlock[]) => {
    let valid = true;
    for (let i = 1; i < blocks.length; i++) {
      const prev = blocks[i - 1];
      const curr = blocks[i];
      if (curr.previousHash !== prev.hash) {
        curr.isValid = false;
        valid = false;
      } else {
        curr.isValid = !curr.isTampered;
        if (!curr.isValid) valid = false;
      }
    }
    return valid;
  };

  // Tamper Block 1: change amount from 10 to 1000 BTC
  const handleTamperBlock1 = () => {
    const newChain = [...chain];
    const b1 = { ...newChain[1] };
    b1.txs = [{ id: 'tx1', sender: 'Alice', receiver: 'Bob', amount: 1000 }];
    b1.isTampered = true;
    // Changing data changes its hash
    b1.hash = 'c9a87f1234455829103847102938471029384712938471928374918273641234';
    b1.isValid = false;

    newChain[1] = b1;

    // Block 2 previousHash still points to old hash => mismatch
    newChain[2] = { ...newChain[2], isValid: false };
    // Block 3 also broken
    newChain[3] = { ...newChain[3], isValid: false };

    setChain(newChain);
    setIsChainTampered(true);
    onInteracted?.();
  };

  // Restore chain
  const handleRestoreChain = () => {
    setChain([
      {
        index: 0,
        timestamp: '2009-01-03 18:15:05',
        txs: [{ id: 'tx0', sender: 'COINBASE', receiver: 'Satoshi', amount: 50 }],
        merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
        previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        nonce: 2083236893,
        hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
        isValid: true,
      },
      {
        index: 1,
        timestamp: '2026-08-20 10:00:00',
        txs: [{ id: 'tx1', sender: 'Alice', receiver: 'Bob', amount: 10 }],
        merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        previousHash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
        nonce: 14829,
        hash: '00008fbc72d63412a88432a10b99de23456123490aafe123456789abcdef0123',
        isValid: true,
        isTampered: false,
      },
      {
        index: 2,
        timestamp: '2026-08-20 10:10:00',
        txs: [{ id: 'tx2', sender: 'Bob', receiver: 'Charlie', amount: 5 }],
        merkleRoot: '7d5a99f603f231d539ee9d8f6d2e67f0b5d5b8823528b6d88ff7b7bb6f784e2a',
        previousHash: '00008fbc72d63412a88432a10b99de23456123490aafe123456789abcdef0123',
        nonce: 98124,
        hash: '000034aefc882145990812736123984012938471203984710293847129384712',
        isValid: true,
        isTampered: false,
      },
      {
        index: 3,
        timestamp: '2026-08-20 10:20:00',
        txs: [{ id: 'tx3', sender: 'Charlie', receiver: 'Dave', amount: 2 }],
        merkleRoot: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        previousHash: '000034aefc882145990812736123984012938471203984710293847129384712',
        nonce: 45712,
        hash: '0000918237461928374619283746192837461928374619283746192837461928',
        isValid: true,
        isTampered: false,
      },
    ]);
    setIsChainTampered(false);
    onInteracted?.();
  };

  const activeTypeInfo = BLOCKCHAIN_TYPES.find((t) => t.id === selectedBlockchainType)!;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0e1d1f] to-[#080c16] border border-border-primary shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-border-primary text-text-primary text-xs font-mono font-bold uppercase">
              <Boxes className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'PHẦN 05 · XÂY DỰNG CHUỖI BLOCKCHAIN' : 'PART 05 · BUILD A BLOCKCHAIN'}</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {language === 'vi'
                ? 'Hash Pointer & Tính Bất Biến (Immutability) Của Chuỗi Khối'
                : 'Hash Pointers & Cryptographic Immutability'}
            </h3>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {language === 'vi'
                ? 'Mỗi khối chứa mã băm của khối đứng trước (Previous Hash). Bất kỳ một sự thay đổi nhỏ nào trong quá khứ cũng làm sụp đổ tính toàn vẹn của toàn bộ các khối tiếp theo.'
                : 'Every block encapsulates the cryptographic hash of its predecessor. Any historical modification cascades and invalidates the entire downstream chain.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isChainTampered ? (
              <button
                type="button"
                onClick={handleTamperBlock1}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/60 transition-all hover:scale-105"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? '⚠ TẤN CÔNG GIẢ MẠO BLOCK #1' : '⚠ TAMPER BLOCK #1'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRestoreChain}
 className="px-3.5 py-2 rounded-xl bg-text-primary hover:bg-white/90 text-bg-primary font-semibold text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Khôi phục tính toàn vẹn' : 'Restore Integrity'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Chain Integrity Alert Banner */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono ${
              isChainTampered
                ? 'bg-rose-950/40 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-[#0e1422] border-border-secondary text-text-secondary'
            }`}
          >
            <div className="flex items-center gap-2">
              {isChainTampered ? (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              )}
              <span>
                {isChainTampered
                  ? (language === 'vi'
                      ? '🚨 CẢNH BÁO: TÍNH TOÀN VẸN BỊ PHÁ VỠ! Block #1 bị sửa khiến Previous Hash của Block #2 & #3 không khớp!'
                      : '🚨 ALERT: CHAIN INTEGRITY BROKEN! Block #1 was tampered, invalidating Previous Hash pointers downstream!')
                  : (language === 'vi'
                      ? '✓ CHUỖI KHỐI TOÀN VẸN: Mọi Previous Hash đều khớp 100% với mã băm của khối trước.'
                      : '✓ CHAIN INTEGRITY PERFECT: All Previous Hash pointers match their predecessors cryptographically.')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {chain.map((block) => (
          <div
            key={block.index}
            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
              block.isValid
                ? 'bg-[#090d16] border-slate-800 shadow-lg'
                : 'bg-rose-950/20 border-rose-500 ring-2 ring-rose-500/20 shadow-xl shadow-rose-950/40'
            }`}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                      block.index === 0
                        ? 'bg-amber-500 text-black'
                        : block.isValid
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    BLOCK #{block.index} {block.index === 0 && '(GENESIS)'}
                  </span>
                </div>

                <div>
                  {block.isValid ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <Lock className="w-3 h-3" />
                      <span>VALID</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1 font-bold">
                      <Unlock className="w-3 h-3" />
                      <span>INVALID</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Data Fields */}
              <div className="space-y-2 text-xs font-mono">
                {/* 1. Transaction Data */}
                <div className="p-2.5 rounded-lg bg-[#05070c] border border-slate-900 space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase">GIAO DỊCH</div>
                  {block.txs.map((tx) => (
                    <div
                      key={tx.id}
                      className={`font-bold ${
                        block.isTampered ? 'text-rose-400 line-through' : 'text-white'
                      }`}
                    >
                      {tx.sender} → {tx.receiver}: <span className="text-financial font-mono font-semibold">{tx.amount} BTC</span>
                    </div>
                  ))}
                  {block.isTampered && (
                    <div className="text-rose-400 font-bold text-[11px]">
                      👉 ĐÃ BỊ SỬA THÀNH: Alice → Bob: <span className="text-financial font-mono font-semibold">1000 BTC</span>!
                    </div>
                  )}
                </div>

                {/* 2. Previous Hash */}
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>PREVIOUS HASH:</span>
                    {block.index > 0 && !block.isValid && (
                      <span className="text-rose-400 font-bold">KHÔNG KHỚP!</span>
                    )}
                  </div>
                  <div
                    className={`p-1.5 rounded text-[10px] break-all border ${
                      block.index > 0 && !block.isValid
                        ? 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                        : 'bg-[#05070c] border-slate-900 text-slate-400'
                    }`}
                  >
                    {block.previousHash.slice(0, 16)}...{block.previousHash.slice(-8)}
                  </div>
                </div>

                {/* 3. Nonce */}
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Nonce:</span>
                  <span className="text-white font-bold">{block.nonce}</span>
                </div>

                {/* 4. Block Hash */}
                <div className="space-y-0.5 pt-1">
                  <div className="text-[10px] text-slate-500">BLOCK HASH (SHA-256):</div>
                  <div
                    className={`p-1.5 rounded text-[10px] break-all border font-bold ${
                      block.isValid
                        ? 'bg-[#0e1422] border-border-secondary text-text-secondary'
                        : 'bg-rose-950/40 border-rose-500 text-rose-300'
                    }`}
                  >
                    {block.hash.slice(0, 16)}...{block.hash.slice(-8)}
                  </div>
                </div>
              </div>
            </div>

            {/* Pointer Arrow indicator to next block */}
            <div className="text-center text-[10px] font-mono text-slate-500 pt-1">
              {block.index < 3 ? 'Hash Pointer ──▶ Nối sang Block kế tiếp' : 'Khối mới nhất (Chain Tip)'}
            </div>
          </div>
        ))}
      </div>

      {/* 4 Types of Blockchain Section */}
      <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>{language === 'vi' ? 'PHÂN LOẠI 4 LOẠI HÌNH BLOCKCHAIN PHỔ BIẾN' : '4 MAJOR BLOCKCHAIN ARCHITECTURES'}</span>
            </div>
            <h4 className="text-base font-bold text-white mt-1">
              {language === 'vi' ? 'Không phải mọi Blockchain đều giống nhau' : 'Not All Blockchains Are Built The Same'}
            </h4>
          </div>

          {/* 4 Type Selector Tabs */}
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap gap-1">
            {BLOCKCHAIN_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedBlockchainType(t.id);
                  onInteracted?.();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedBlockchainType === t.id
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.name[language].split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Type Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-bold text-white">{activeTypeInfo.name[language]}</h5>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
                Ví dụ: {activeTypeInfo.example}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{activeTypeInfo.tagline[language]}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#05070c] border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-500">QUYỀN TRUY CẬP (ACCESS):</div>
                <div className="text-xs font-mono font-bold text-emerald-300">{activeTypeInfo.access[language]}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#05070c] border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-500">KIỂM SOÁT & ĐỒNG THUẬN:</div>
                <div className="text-xs font-mono font-bold text-amber-300">{activeTypeInfo.control[language]}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#05070c] border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-500">MỤC ĐÍCH ỨNG DỤNG:</div>
                <div className="text-xs font-mono text-slate-300">{activeTypeInfo.purpose[language]}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#05070c] border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-500">KIẾN TRÚC MẠNG:</div>
                <div className="text-xs font-mono text-slate-300">{activeTypeInfo.architecture[language]}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-4 rounded-xl bg-[#05070c] border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-text-muted" />
              <span>{language === 'vi' ? 'Quy luật cốt lõi:' : 'Golden Rule:'}</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {language === 'vi'
                ? 'Công nghệ Blockchain cung cấp cấu trúc dữ liệu chuỗi bất biến. Tuy nhiên, mức độ PHI TẬP TRUNG phụ thuộc hoàn toàn vào việc có bao nhiêu bên độc lập tham gia xác thực.'
                : 'Blockchain provides immutable data chaining. However, decentralization depends entirely on how many independent sovereign nodes validate blocks.'}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          {onPrevStage && (
            <button
              type="button"
              onClick={onPrevStage}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-400 cursor-pointer"
            >
              {language === 'vi' ? '← Quay lại Phần 04' : '← Back to Part 04'}
            </button>
          )}
          {onNextStage && (
            <button
              type="button"
              onClick={onNextStage}
 className="px-4 py-2 rounded-xl bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ml-auto shadow-md"
            >
              <span>{language === 'vi' ? 'Tiếp: Phần 06 · Hệ Sinh Thái Bitcoin' : 'Next: Part 06 · Bitcoin Ecosystem'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
