import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Boxes,
  KeyRound,
  Layers,
  GitFork,
  Clock,
  Zap,
  Hash,
  FileCode2,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Cpu,
  BookOpen,
  FlaskConical,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CodeViewer } from '../common/CodeViewer';

interface BlockEducationalSummaryProps {
  onInteracted?: () => void;
  onPrevStage?: () => void;
  onOpenHandsOnLab?: () => void;
}

const PYTHON_BLOCK_SOURCE = `# ==========================================
# BUỔI 2: CẤU TRÚC BLOCKCHAIN BLOCK & MERKLE ROOT
# ==========================================
import hashlib
import time
from typing import List

class Transaction:
    def __init__(self, sender: str, recipient: str, amount: float, signature: str = ""):
        self.sender = sender
        self.recipient = recipient
        self.amount = amount
        self.signature = signature

    def compute_hash(self) -> str:
        payload = f"{self.sender}->{self.recipient}:{self.amount}"
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()

class MerkleTree:
    @staticmethod
    def build_root(transactions: List[Transaction]) -> str:
        if not transactions:
            return ""
        
        current_level = [tx.compute_hash() for tx in transactions]
        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                combined = hashlib.sha256((left + right).encode('utf-8')).hexdigest()
                next_level.append(combined)
            current_level = next_level
        return current_level[0]

class BlockHeader:
    def __init__(self, prev_hash: str, merkle_root: str, timestamp: int, nonce: int = 0):
        self.prev_hash = prev_hash
        self.merkle_root = merkle_root
        self.timestamp = timestamp
        self.nonce = nonce

    def compute_hash(self) -> str:
        header_raw = f"{self.prev_hash}|{self.merkle_root}|{self.timestamp}|{self.nonce}"
        return hashlib.sha256(header_raw.encode('utf-8')).hexdigest()

class Block:
    def __init__(self, index: int, prev_hash: str, transactions: List[Transaction], nonce: int = 0):
        self.index = index
        self.body = transactions
        merkle_root = MerkleTree.build_root(transactions)
        self.header = BlockHeader(prev_hash, merkle_root, int(time.time()), nonce)
        self.hash = self.header.compute_hash()
`;

const TYPESCRIPT_BLOCK_SOURCE = `// ==========================================
// LESSON 2: TYPESCRIPT BLOCK ARCHITECTURE
// ==========================================
import { sha256Sync } from './sha256';

export interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  signature?: string;
}

export class MerkleEngine {
  static computeTxHash(tx: Transaction): string {
    const raw = \`\${tx.sender}->\${tx.recipient}:\${tx.amount}\`;
    return sha256Sync(new TextEncoder().encode(raw));
  }

  static buildMerkleRoot(transactions: Transaction[]): string {
    if (transactions.length === 0) return '';
    let currentLevel = transactions.map(t => this.computeTxHash(t));

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        const combined = sha256Sync(new TextEncoder().encode(left + right));
        nextLevel.push(combined);
      }
      currentLevel = nextLevel;
    }
    return currentLevel[0];
  }
}

export interface BlockHeader {
  prevHash: string;
  merkleRoot: string;
  timestamp: number;
  nonce: number;
}

export class BlockchainBlock {
  public index: number;
  public header: BlockHeader;
  public body: Transaction[];
  public hash: string;

  constructor(index: number, prevHash: string, transactions: Transaction[], nonce: number = 0) {
    this.index = index;
    this.body = transactions;
    const merkleRoot = MerkleEngine.buildMerkleRoot(transactions);
    this.header = {
      prevHash,
      merkleRoot,
      timestamp: Math.floor(Date.now() / 1000),
      nonce,
    };
    this.hash = this.computeHeaderHash();
  }

  public computeHeaderHash(): string {
    const raw = \`\${this.header.prevHash}|\${this.header.merkleRoot}|\${this.header.timestamp}|\${this.header.nonce}\`;
    return sha256Sync(new TextEncoder().encode(raw));
  }
}
`;

export const BlockEducationalSummary: React.FC<BlockEducationalSummaryProps> = ({
  onInteracted,
  onPrevStage,
  onOpenHandsOnLab,
}) => {
  const { strings, language } = useLanguage();
  const [codeLang, setCodeLang] = useState<'python' | 'typescript'>('python');
  const [showCode, setShowCode] = useState<boolean>(false);

  const handleScrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Guide */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>
              {language === 'vi'
                ? 'PHẦN 6: SƠ ĐỒ TỔNG KẾT & CẦU NỐI KIẾN THỨC'
                : 'PART 6: ARCHITECTURAL SUMMARY & NEXT STEPS'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {language === 'vi'
              ? 'Toàn Cảnh Kiến Trúc: Từ Transaction Đến Blockchain'
              : 'End-to-End Architecture: From Transaction to Blockchain'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            {language === 'vi'
              ? 'Chúc mừng bạn! Bạn vừa đi qua toàn bộ quy trình cấu thành một Block. Dưới đây là sơ đồ tổng kết logic và các liên kết mở rộng để kiểm tra kiến thức.'
              : 'Congratulations! You have completed the complete block creation flow. Below is the master architectural summary and knowledge bridge.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onPrevStage}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Quay Lại Mô Phỏng' : 'Back to Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Visual Architectural Master Flow Chart */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#090d16] border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {language === 'vi' ? 'SƠ ĐỒ HỆ THỐNG BUỔI 2' : 'LESSON 2 MASTER SYSTEM FLOW'}
            </span>
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-white font-mono">
            TRANSACTION → SIGNATURE → BODY → MERKLE TREE → HEADER → HASH → BLOCKCHAIN
          </h4>
        </div>

        {/* Master Flow Diagram Nodes */}
        <div className="max-w-3xl mx-auto space-y-3 font-mono text-xs">
          {/* Node 1: Transaction & Signature */}
          <div className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <span className="font-bold text-white">GIAO DỊCH</span>
                <p className="text-[11px] text-slate-400">
                  Dữ liệu chuyển tiền (Alice → Bob : 10 BTC)
                </p>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Raw Data
            </span>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 2: Digital Signature */}
          <div className="p-3.5 rounded-xl bg-[#0b101b] border border-purple-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <span className="font-bold text-purple-300">CHỮ KÝ SỐ</span>
                <p className="text-[11px] text-slate-400">
                  Ký bằng Alice Private Key & Xác minh bằng Public Key
                </p>
              </div>
            </div>
            <span className="text-[11px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              ECDSA SECP256K1
            </span>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 3: Block Body */}
          <div className="p-3.5 rounded-xl bg-[#0b101b] border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <span className="font-bold text-emerald-300">BLOCK BODY (THÂN KHỐI)</span>
                <p className="text-[11px] text-slate-400">
                  Chứa danh sách hàng nghìn giao dịch đã xác thực (~1-4 MB)
                </p>
              </div>
            </div>
            <span className="text-[11px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Transactions List
            </span>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 4: Merkle Tree & Root */}
          <div className="p-3.5 rounded-xl bg-[#0b101b] border border-indigo-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <span className="font-bold text-indigo-300">CÂY MERKLE & MERKLE ROOT</span>
                <p className="text-[11px] text-slate-400">
                  Băm phân cấp tóm lược toàn bộ Body thành 1 mã băm 32 bytes duy nhất
                </p>
              </div>
            </div>
            <span className="text-[11px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              32-byte Root Hash
            </span>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 5: Block Header */}
          <div className="p-4 rounded-xl bg-[#070a12] border-2 border-emerald-500/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                5. BLOCK HEADER (~80 BYTES)
              </span>
              <span className="text-slate-500">Metadata Layer</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px]">1. Prev Hash</span>
                <span className="text-emerald-300 font-semibold">Hash Pointer</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px]">2. Timestamp</span>
                <span className="text-amber-300 font-semibold">Epoch Time</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px]">3. Merkle Root</span>
                <span className="text-indigo-300 font-semibold">Body Digest</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px]">4. Nonce</span>
                <span className="text-purple-300 font-semibold">PoW Trial</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 6: SHA-256 Engine */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-center font-bold text-emerald-300">
            SHA-256( Block Header )
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 7: Final Block Hash & Blockchain Link */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border-2 border-emerald-500 text-center space-y-1">
            <div className="font-bold text-emerald-300 text-sm">
              ✓ BLOCK HASH (MÃ BĂM KHỐI HOÀN TẤT)
            </div>
            <div className="text-[11px] text-slate-300">
              Gắn kết thành công vào Blockchain phân tán toàn cầu!
            </div>
          </div>
        </div>

        {/* Master Takeaway Callout */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 text-center space-y-2">
          <div className="text-base sm:text-lg font-bold text-white">
            {language === 'vi'
              ? '🎉 Bạn vừa đi qua toàn bộ quá trình từ một Transaction đơn lẻ đến một Block hoàn chỉnh!'
              : '🎉 You have walked through the entire journey from a single Transaction to a complete Block!'}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            {language === 'vi'
              ? 'Bây giờ bạn đã hiểu rõ vì sao không thể thay đổi dữ liệu trong quá khứ mà không bị phát hiện, và cách mà mật mã học bảo vệ toàn bộ mạng lưới Blockchain.'
              : 'You now understand why past data cannot be altered undetected, and how cryptography secures the entire distributed ledger.'}
          </p>
        </div>

        {/* Source Code Viewer Toggle */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase text-white">
                {language === 'vi'
                  ? 'MÃ NGUỒN CÀI ĐẶT CẤU TRÚC BLOCK'
                  : 'BLOCK DATA STRUCTURE SOURCE CODE'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCode((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold cursor-pointer"
              >
                {showCode ? 'Ẩn Mã Nguồn' : 'Xem Mã Nguồn (VS Code Dark)'}
              </button>
            </div>
          </div>

          {showCode && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCodeLang('python')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    codeLang === 'python'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Python (Block & Merkle)
                </button>
                <button
                  type="button"
                  onClick={() => setCodeLang('typescript')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    codeLang === 'typescript'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  TypeScript (BlockchainBlock)
                </button>
              </div>

              <CodeViewer
                code={codeLang === 'python' ? PYTHON_BLOCK_SOURCE : TYPESCRIPT_BLOCK_SOURCE}
                language={codeLang}
                filename={codeLang === 'python' ? 'block_architecture.py' : 'BlockArchitecture.ts'}
                maxHeight="420px"
                showLineNumbers={true}
              />
            </div>
          )}
        </div>

        {/* 27. HANDS-ON LAB CALL TO ACTION */}
        {onOpenHandsOnLab && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-[#070a12] to-emerald-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-purple-400" />
                <span>{language === 'vi' ? '🧪 SẴN SÀNG TỰ TAY THỰC HÀNH?' : '🧪 READY FOR HANDS-ON LAB?'}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {language === 'vi'
                  ? 'Chuyển sang chế độ "Tự tay thao tác" để tự nhập người gửi, ký số, phá vỡ liên kết chuỗi và đào Nonce.'
                  : 'Switch to Hands-On mode to create custom transactions, sign payloads, tamper with data, and mine nonces.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenHandsOnLab}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider shrink-0 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Mở Lab Tự Tay' : 'Open Hands-On Lab'}</span>
            </button>
          </div>
        )}

        {/* Knowledge Exploration Bridge Buttons */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={() => handleScrollTo('foundations')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left space-y-1 transition-all cursor-pointer group"
          >
            <span className="text-emerald-400 font-bold block flex items-center justify-between">
              <span>← Buổi 1: Nền Tảng</span>
              <ArrowLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-slate-400 block">
              Linked List & Hash Pointer
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo('blockchain')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left space-y-1 transition-all cursor-pointer group"
          >
            <span className="text-purple-400 font-bold block flex items-center justify-between">
              <span>Proof of Work</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-slate-400 block">
              Cuộc Đua Khai Thác Nonce
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo('proof-of-stake')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left space-y-1 transition-all cursor-pointer group"
          >
            <span className="text-amber-400 font-bold block flex items-center justify-between">
              <span>Proof of Stake</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-slate-400 block">
              Proof of Stake
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo('quiz-section')}
            className="p-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left space-y-1 transition-all cursor-pointer group"
          >
            <span className="text-emerald-300 font-bold block flex items-center justify-between">
              <span>Kiểm Tra Kiến Thức</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-slate-400 block">
              Thi Trắc Nghiệm & Chứng Chỉ
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
