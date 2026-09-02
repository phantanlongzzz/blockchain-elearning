import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Layers,
  FileCode2,
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
# CẤU TRÚC BLOCKCHAIN BLOCK & MERKLE ROOT
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
// TYPESCRIPT BLOCK ARCHITECTURE
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
  onPrevStage,
  onOpenHandsOnLab,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [codeLang, setCodeLang] = useState<'python' | 'typescript'>('python');
  const [showCode, setShowCode] = useState<boolean>(false);

  const handleScrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Guide */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0B0E12] border border-[#1C2430] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <GraduationCap className="w-4 h-4" />
            <span>
              {isVi
                ? 'Tổng kết kiến trúc & Vòng đời khối'
                : 'Architectural Summary & Block Lifecycle'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white font-sans">
            {isVi
              ? 'Toàn Cảnh Kiến Trúc: Từ Giao Dịch Đến Chuỗi Khối'
              : 'End-to-End Architecture: From Transaction to Blockchain'}
          </h3>
          <p className="text-xs sm:text-sm text-[#A5AFBF] font-sans">
            {isVi
              ? 'Bạn đã hoàn thành các bước phân tích từng thành phần của một Block. Dưới đây là sơ đồ tổng kết luồng dữ liệu và mã nguồn chuẩn.'
              : 'You have completed the module on Block components. Below is the master architecture flow and reference implementation.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-summary-prev-stage"
            onClick={onPrevStage}
            className="px-3.5 py-2 rounded-md bg-[#10151D] hover:bg-[#161D27] text-slate-300 font-sans text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-[#1C2430]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isVi ? 'Quay Lại Mô Phỏng' : 'Back to Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Visual Architectural Master Flow Chart */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0B0E12] border border-[#1C2430] space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isVi ? 'Sơ Đồ Hệ Thống Kiến Trúc Khối' : 'Master System Architecture Flow'}
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-white font-mono">
            Transaction → Signature → Body → Merkle Tree → Header → Hash → Blockchain
          </h4>
        </div>

        {/* Master Flow Diagram Nodes */}
        <div className="max-w-2xl mx-auto space-y-3 font-sans text-xs">
          {/* Node 1: Transaction */}
          <div className="p-3.5 rounded-lg bg-[#10151D] border border-[#1C2430] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-semibold font-mono text-xs border border-emerald-500/20">
                1
              </div>
              <div>
                <span className="font-semibold text-slate-200">Giao Dịch (Transaction)</span>
                <p className="text-[11px] text-[#A5AFBF]">
                  Dữ liệu chuyển giá trị (Alice → Bob : 10 BTC)
                </p>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
              Raw Data
            </span>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 2: Digital Signature */}
          <div className="p-3.5 rounded-lg bg-[#10151D] border border-[#1C2430] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-semibold font-mono text-xs border border-emerald-500/20">
                2
              </div>
              <div>
                <span className="font-semibold text-slate-200">Chữ Ký Số (Digital Signature)</span>
                <p className="text-[11px] text-[#A5AFBF]">
                  Ký bằng Alice Private Key & Xác minh bằng Public Key
                </p>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
              ECDSA SECP256K1
            </span>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 3: Block Body */}
          <div className="p-3.5 rounded-lg bg-[#10151D] border border-[#1C2430] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-semibold font-mono text-xs border border-emerald-500/20">
                3
              </div>
              <div>
                <span className="font-semibold text-slate-200">Block Body (Thân Khối)</span>
                <p className="text-[11px] text-[#A5AFBF]">
                  Chứa danh sách toàn bộ các giao dịch đã xác thực (~1-4 MB)
                </p>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
              Transactions List
            </span>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 4: Merkle Tree & Root */}
          <div className="p-3.5 rounded-lg bg-[#10151D] border border-[#1C2430] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-semibold font-mono text-xs border border-emerald-500/20">
                4
              </div>
              <div>
                <span className="font-semibold text-slate-200">Cây Merkle & Merkle Root</span>
                <p className="text-[11px] text-[#A5AFBF]">
                  Băm phân cấp tóm lược toàn bộ Body thành 1 mã băm 32 bytes duy nhất
                </p>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
              32-byte Root Hash
            </span>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 5: Block Header */}
          <div className="p-4 rounded-lg bg-[#10151D] border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                5. Block Header (~80 Bytes)
              </span>
              <span className="text-[#717B8C] font-mono text-[11px]">Metadata Layer</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded bg-[#0B0E12] border border-[#1C2430] text-center">
                <span className="text-[#717B8C] block text-[10px]">1. Prev Hash</span>
                <span className="text-emerald-400 font-medium font-mono text-[10px]">Hash Pointer</span>
              </div>
              <div className="p-2 rounded bg-[#0B0E12] border border-[#1C2430] text-center">
                <span className="text-[#717B8C] block text-[10px]">2. Timestamp</span>
                <span className="text-slate-200 font-medium font-mono text-[10px]">Epoch Time</span>
              </div>
              <div className="p-2 rounded bg-[#0B0E12] border border-[#1C2430] text-center">
                <span className="text-[#717B8C] block text-[10px]">3. Merkle Root</span>
                <span className="text-emerald-400 font-medium font-mono text-[10px]">Body Digest</span>
              </div>
              <div className="p-2 rounded bg-[#0B0E12] border border-[#1C2430] text-center">
                <span className="text-[#717B8C] block text-[10px]">4. Nonce</span>
                <span className="text-slate-200 font-medium font-mono text-[10px]">PoW Trial</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 6: SHA-256 Engine */}
          <div className="p-3 rounded-lg bg-[#10151D] border border-[#1C2430] text-center font-semibold text-slate-300 font-mono">
            SHA-256( Block Header )
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 7: Final Block Hash & Blockchain Link */}
          <div className="p-4 rounded-lg bg-[#10151D] border border-emerald-500/50 text-center space-y-1">
            <div className="font-semibold text-emerald-400 text-sm">
              ✓ BLOCK HASH (MÃ BĂM KHỐI HOÀN TẤT)
            </div>
            <div className="text-[11px] text-[#A5AFBF]">
              Gắn kết an toàn vào sổ cái Blockchain phân tán toàn cầu.
            </div>
          </div>
        </div>

        {/* Master Takeaway Callout */}
        <div className="p-5 rounded-lg bg-[#10151D] border border-[#1C2430] text-center space-y-2">
          <div className="text-sm sm:text-base font-semibold text-white">
            {isVi
              ? 'Nguyên lý toàn vẹn dữ liệu trong Blockchain'
              : 'Cryptographic Integrity in Blockchain'}
          </div>
          <p className="text-xs text-[#A5AFBF] max-w-2xl mx-auto leading-relaxed font-sans">
            {isVi
              ? 'Bất kỳ thay đổi nào trong dữ liệu giao dịch ở quá khứ sẽ làm thay đổi Leaf Hash → Merkle Root → Block Header → Block Hash, ngay lập tức phá vỡ liên kết Hash Pointer của toàn bộ các khối tiếp theo.'
              : 'Any alteration in historical transaction data mutates Leaf Hash → Merkle Root → Block Header → Block Hash, immediately invalidating the hash chain pointer of all downstream blocks.'}
          </p>
        </div>

        {/* Source Code Viewer Toggle */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase text-slate-200">
                {isVi
                  ? 'Mã nguồn cài đặt cấu trúc Block'
                  : 'Block Data Structure Source Code'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-toggle-summary-code"
                onClick={() => setShowCode((prev) => !prev)}
                className="px-3 py-1.5 rounded-md bg-[#10151D] hover:bg-[#161D27] text-slate-300 font-sans text-xs border border-[#1C2430] cursor-pointer"
              >
                {showCode ? (isVi ? 'Ẩn mã nguồn' : 'Hide Code') : (isVi ? 'Xem mã nguồn' : 'View Code')}
              </button>
            </div>
          </div>

          {showCode && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCodeLang('python')}
                  className={`px-3 py-1 rounded-md text-xs font-sans transition-colors cursor-pointer ${
                    codeLang === 'python'
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'bg-[#10151D] text-[#A5AFBF] hover:text-white border border-[#1C2430]'
                  }`}
                >
                  Python (Block & Merkle)
                </button>
                <button
                  type="button"
                  onClick={() => setCodeLang('typescript')}
                  className={`px-3 py-1 rounded-md text-xs font-sans transition-colors cursor-pointer ${
                    codeLang === 'typescript'
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'bg-[#10151D] text-[#A5AFBF] hover:text-white border border-[#1C2430]'
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

        {/* HANDS-ON LAB CALL TO ACTION */}
        {onOpenHandsOnLab && (
          <div className="p-4 rounded-lg bg-[#10151D] border border-[#1C2430] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4" />
                <span>{isVi ? 'Sẵn sàng tự tay thực hành?' : 'Ready for Hands-On Lab?'}</span>
              </div>
              <p className="text-xs text-[#A5AFBF]">
                {isVi
                  ? 'Chuyển sang chế độ "Tự tay thao tác" để tự nhập người gửi, ký số, phá vỡ liên kết chuỗi và đào Nonce.'
                  : 'Switch to Hands-On mode to create custom transactions, sign payloads, tamper with data, and mine nonces.'}
              </p>
            </div>
            <button
              type="button"
              id="btn-summary-open-lab"
              onClick={onOpenHandsOnLab}
              className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{isVi ? 'Mở Chế Độ Thực Hành' : 'Open Hands-On Lab'}</span>
            </button>
          </div>
        )}

        {/* Knowledge Exploration Bridge Buttons */}
        <div className="pt-4 border-t border-[#1C2430] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-sans text-xs">
          <button
            type="button"
            onClick={() => handleScrollTo('foundations')}
            className="p-3.5 rounded-lg bg-[#10151D] hover:bg-[#161D27] border border-[#1C2430] text-left space-y-1 transition-colors cursor-pointer group"
          >
            <span className="text-emerald-400 font-semibold flex items-center justify-between">
              <span>← Buổi 1: Nền Tảng</span>
              <ArrowLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-[#A5AFBF] block">
              Linked List & Hash Pointer
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo('blockchain')}
            className="p-3.5 rounded-lg bg-[#10151D] hover:bg-[#161D27] border border-[#1C2430] text-left space-y-1 transition-colors cursor-pointer group"
          >
            <span className="text-slate-200 font-semibold flex items-center justify-between">
              <span>Proof of Work</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
            </span>
            <span className="text-[11px] text-[#A5AFBF] block">
              Cuộc Đua Khai Thác Nonce
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo('proof-of-stake')}
            className="p-3.5 rounded-lg bg-[#10151D] hover:bg-[#161D27] border border-[#1C2430] text-left space-y-1 transition-colors cursor-pointer group"
          >
            <span className="text-slate-200 font-semibold flex items-center justify-between">
              <span>Proof of Stake</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
            </span>
            <span className="text-[11px] text-[#A5AFBF] block">
              Cơ Chế Đặt Cọc Validator
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo('quiz-section')}
            className="p-3.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left space-y-1 transition-colors cursor-pointer group"
          >
            <span className="text-emerald-300 font-semibold flex items-center justify-between">
              <span>Kiểm Tra Kiến Thức</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-[#A5AFBF] block">
              Thi Trắc Nghiệm & Chứng Chỉ
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
