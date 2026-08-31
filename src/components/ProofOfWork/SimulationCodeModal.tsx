import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2, Cpu, CheckCircle2, Play, Sparkles, BookOpen } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CodeViewer } from '../common/CodeViewer';

interface SimulationCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExecutionState?: 'idle' | 'mining' | 'winner' | 'verified';
}

const PYTHON_CODE = `import hashlib
import random
import time

class Miner:
    """
    Competitive Proof-of-Work Miner Node.
    Explores an independent, non-overlapping partition of the nonce search space.
    """
    def __init__(self, name: str, start_nonce: int, step: int = 4):
        self.name = name
        self.nonce = start_nonce
        self.step = step
        self.attempts = 0

    def calculate_hash(self, block_data: str) -> str:
        """Computes NIST FIPS 180-4 SHA-256 cryptographic hash."""
        raw_payload = f"{block_data}|{self.nonce}"
        return hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()

    def step_mine(self, block_data: str, target_prefix: str):
        hash_value = self.calculate_hash(block_data)
        self.attempts += 1
        current_nonce = self.nonce
        self.nonce += self.step

        # Check Proof-of-Work Target (e.g. starts with "000")
        if hash_value.startswith(target_prefix):
            # FIRST VALID NONCE DISCOVERED -> THIS MINER WINS
            return {
                "winner": self.name,
                "nonce": current_nonce,
                "hash": hash_value,
                "attempts": self.attempts
            }
        return None


def run_time_limited_mining_race(block_data: str, difficulty: int = 3, duration_sec: int = 30):
    """
    Simulates a multi-node Time-Limited Proof-of-Work mining race.
    
    IMPORTANT SCIENTIFIC PRINCIPLE:
    - Proof-of-Work is a computational race.
    - Miners continuously search the nonce space concurrently.
    - When time expires, total computational work (hash attempts) determines the winner.
    - Finding valid target hashes is an achievement, but the race runs until duration ends.
    """
    target = "0" * difficulty

    miners = [
        Miner("Miner Alpha", start_nonce=random.randint(0, 5000) * 4 + 0),
        Miner("Miner Beta",  start_nonce=random.randint(5000, 15000) * 4 + 1),
        Miner("Miner Gamma", start_nonce=random.randint(15000, 30000) * 4 + 2),
        Miner("Miner Delta", start_nonce=random.randint(30000, 50000) * 4 + 3),
    ]

    start_time = time.time()
    valid_blocks_discovered = []

    # Continuous mining until countdown timer expires
    while time.time() - start_time < duration_sec:
        for miner in miners:
            result = miner.step_mine(block_data, target)
            if result:
                valid_blocks_discovered.append(result)

    # Determine winner based primarily on total computational work (attempts)
    winner = max(miners, key=lambda m: m.attempts)
    return {
        "winner": winner.name,
        "total_attempts": winner.attempts,
        "valid_blocks": valid_blocks_discovered,
        "elapsed_sec": duration_sec
    }
`;

const TS_CODE = `import { fastSha256Hex } from '../utils/sha256';

export interface MinerNode {
  id: string;
  name: string;
  nonce: number;
  step: number;
  attempts: number;
  status: 'mining' | 'winner' | 'stopped';
}

export function initializeRandomizedMiners(): MinerNode[] {
  // Randomize initial search offsets to provide distinct search trajectories per run
  const offsetAlpha = Math.floor(Math.random() * 5000) * 4;
  const offsetBeta  = 20000 + Math.floor(Math.random() * 5000) * 4;
  const offsetGamma = 45000 + Math.floor(Math.random() * 5000) * 4;
  const offsetDelta = 70000 + Math.floor(Math.random() * 5000) * 4;

  return [
    { id: 'alpha', name: 'Miner Alpha', nonce: offsetAlpha,     step: 4, attempts: 0, status: 'mining' },
    { id: 'beta',  name: 'Miner Beta',  nonce: offsetBeta + 1,  step: 4, attempts: 0, status: 'mining' },
    { id: 'gamma', name: 'Miner Gamma', nonce: offsetGamma + 2, step: 4, attempts: 0, status: 'mining' },
    { id: 'delta', name: 'Miner Delta', nonce: offsetDelta + 3, step: 4, attempts: 0, status: 'mining' },
  ];
}

export function runContinuousMiningBatch(
  blockPayload: string,
  miners: MinerNode[],
  difficulty: number,
  batchSize: number = 40
) {
  const targetPrefix = '0'.repeat(difficulty);
  const validDiscovered: { minerId: string; nonce: number; hash: string }[] = [];

  for (let b = 0; b < batchSize; b++) {
    for (const miner of miners) {
      if (miner.status !== 'mining') continue;

      const raw = \`\${blockPayload}|\${miner.nonce}\`;
      const hash = fastSha256Hex(raw);
      miner.attempts++;

      // Real SHA-256 target validation
      if (hash.startsWith(targetPrefix)) {
        validDiscovered.push({
          minerId: miner.id,
          nonce: miner.nonce,
          hash: hash,
        });
      }

      miner.nonce += miner.step;
    }
  }

  return validDiscovered;
}
`;

export const SimulationCodeModal: React.FC<SimulationCodeModalProps> = ({
  isOpen,
  onClose,
  activeExecutionState = 'idle',
}) => {
  const { strings, language } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<'python' | 'typescript'>('python');

  if (!isOpen) return null;

  const currentCode = selectedLang === 'python' ? PYTHON_CODE : TS_CODE;

  const stepsList = [
    {
      step: 1,
      titleEn: 'Build candidate block data',
      titleVi: 'Đóng gói dữ liệu khối ứng viên',
      descEn: 'Aggregate Block Index, Timestamp, Previous Hash, and Merkle Root into canonical payload string.',
      descVi: 'Tổng hợp Số khối, Thời gian, Hash khối trước và Merkle Root thành chuỗi dữ liệu chuẩn hóa.',
    },
    {
      step: 2,
      titleEn: 'Start multiple competitive miners',
      titleVi: 'Khởi động 4 thợ đào cạnh tranh',
      descEn: 'Partition the 32-bit nonce search space across Miner Alpha, Beta, Gamma, Delta using disjoint step intervals.',
      descVi: 'Phân chia không gian tìm kiếm Nonce cho Miner Alpha, Beta, Gamma, Delta theo các bước nhảy độc lập.',
    },
    {
      step: 3,
      titleEn: 'Iterate nonce values independently',
      titleVi: 'Tịnh tiến giá trị Nonce độc lập',
      descEn: 'Miners Alpha (0,4,8...), Beta (1,5,9...), Gamma (2,6,10...), Delta (3,7,11...) test disjoint nonces without collisions.',
      descVi: 'Mỗi thợ đào thử nghiệm các giá trị Nonce riêng biệt, tránh lãng phí tài nguyên tính toán lặp lại.',
    },
    {
      step: 4,
      titleEn: 'Execute SHA-256 compression rounds',
      titleVi: 'Thực thi vòng nén SHA-256',
      descEn: 'Compute real double-round or single-round 256-bit hash digest for each candidate payload.',
      descVi: 'Tính toán chuỗi băm mật mã 256-bit thực tế từ chuỗi khối ứng viên kết hợp Nonce.',
    },
    {
      step: 5,
      titleEn: 'Evaluate against PoW difficulty target',
      titleVi: 'So khớp với độ khó mục tiêu',
      descEn: 'Check if computed hexadecimal hash begins with required leading zeros (e.g., "000" or "0000").',
      descVi: 'Kiểm tra xem mã băm có bắt đầu bằng số lượng số 0 mục tiêu theo độ khó đã thiết lập hay không.',
    },
    {
      step: 6,
      titleEn: 'First valid nonce wins the race',
      titleVi: 'Thợ đào đầu tiên tìm ra Nonce hợp lệ sẽ chiến thắng',
      descEn: 'The first miner discovering a hash < target satisfies the cryptographic consensus rule.',
      descVi: 'Thợ đào đầu tiên tìm ra mã băm thỏa mãn điều kiện sẽ giành quyền đóng gói khối mới.',
    },
    {
      step: 7,
      titleEn: 'Halt competing miners',
      titleVi: 'Dừng toàn bộ các thợ đào còn lại',
      descEn: 'The network broadcasts the winning block, signaling all competing nodes to abort and save compute energy.',
      descVi: 'Mạng lưới phát tán khối chiến thắng, các thợ đào lập tức dừng cuộc đua hiện tại.',
    },
    {
      step: 8,
      titleEn: 'Consensus verification & ledger commit',
      titleVi: 'Xác minh đồng thuận và ghi sổ cái vĩnh viễn',
      descEn: 'Network peers verify previousHash, PoW target, and Merkle transactions before appending to blockchain.',
      descVi: 'Các nút mạng kiểm tra tính toàn vẹn, xác nhận PoW hợp lệ rồi chính thức nối khối vào chuỗi.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm font-sans">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-xl bg-[#0C0F14] border border-[#1C2430] shadow-2xl overflow-hidden text-[#F2F4F7] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#1C2430] flex items-center justify-between gap-4 bg-[#090A0F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0F131A] border border-[#1C2430] flex items-center justify-center text-[#00C98D]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#F2F4F7] uppercase tracking-wider font-display">
                  {language === 'vi' ? 'MÃ NGUỒN MÔ PHỎNG MINING POW' : 'SIMULATION CODE'}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[rgba(0,201,141,0.1)] text-[#00C98D] border border-[rgba(0,201,141,0.35)]">
                  SECTION 6 · VERIFIED ALGORITHM
                </span>
              </div>
              <p className="text-xs text-[#A5AFBF] font-sans mt-0.5">
                {language === 'vi'
                  ? 'Thuật toán cốt lõi minh họa cơ chế Proof-of-Work cạnh tranh đa thợ đào'
                  : 'Core logic used to demonstrate competitive Proof-of-Work mining across nodes.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Code Editor + Explanation */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Controls Bar: Language Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#090A0F] p-3 rounded-lg border border-[#1C2430]">
            <div className="flex items-center gap-1.5 p-1 rounded-md bg-[#0F131A] border border-[#1C2430]">
              <button
                onClick={() => setSelectedLang('python')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold font-display transition-all cursor-pointer ${
                  selectedLang === 'python'
                    ? 'bg-[rgba(0,201,141,0.1)] text-[#00C98D] border border-[rgba(0,201,141,0.35)]'
                    : 'text-[#A5AFBF] hover:text-[#F2F4F7]'
                }`}
              >
                Python 3.12 (Educational)
              </button>
              <button
                onClick={() => setSelectedLang('typescript')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold font-display transition-all cursor-pointer ${
                  selectedLang === 'typescript'
                    ? 'bg-[rgba(0,201,141,0.1)] text-[#00C98D] border border-[rgba(0,201,141,0.35)]'
                    : 'text-[#A5AFBF] hover:text-[#F2F4F7]'
                }`}
              >
                TypeScript (Engine)
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Dynamic Execution Link Status */}
              <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-[#0F131A] border border-[#1C2430]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeExecutionState === 'mining'
                      ? 'bg-[#F59E0B] animate-ping'
                      : activeExecutionState === 'winner'
                      ? 'bg-[#00C98D]'
                      : 'bg-[#00C98D]'
                  }`}
                />
                <span className="text-[#A5AFBF]">
                  {activeExecutionState === 'mining'
                    ? (language === 'vi' ? 'Đang chạy: vòng lặp calculate_hash()' : 'Active: calculate_hash() loop')
                    : activeExecutionState === 'winner'
                    ? (language === 'vi' ? 'Kích hoạt: trả về kết quả (Thắng)' : 'Triggered: return result (Winner)')
                    : (language === 'vi' ? 'Sẵn sàng: Chờ kích hoạt mô phỏng' : 'Ready: Standby for simulation')}
                </span>
              </div>
            </div>
          </div>

          {/* VS Code Dark Style Code Viewer */}
          <CodeViewer
            code={currentCode}
            language={selectedLang}
            filename={selectedLang === 'python' ? 'pow_mining_simulation.py' : 'pow_mining_engine.ts'}
            maxHeight="440px"
            highlightLine={(lineNum, lineText) => {
              if (
                activeExecutionState === 'mining' &&
                (lineText.includes('calculate_hash') || lineText.includes('startswith') || lineText.includes('fastSha256Hex'))
              ) {
                return 'warning';
              }
              if (
                activeExecutionState === 'winner' &&
                (lineText.includes('return {') || lineText.includes('"winner"') || lineText.includes('First valid nonce'))
              ) {
                return 'winner';
              }
              return null;
            }}
          />

          {/* "HOW IT WORKS" Explanation Section */}
          <div className="p-5 sm:p-6 rounded-lg bg-[#090A0F] border border-[#1C2430] space-y-4 font-sans">
            <div className="flex items-center gap-2 text-[#00C98D] font-display font-bold uppercase tracking-wider text-sm">
              <BookOpen className="w-4 h-4" />
              <span>{language === 'vi' ? 'NGUYÊN LÝ HOẠT ĐỘNG (8 BƯỚC)' : 'HOW IT WORKS (8 STEPS)'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {stepsList.map((item) => (
                <div
                  key={item.step}
                  className="p-3.5 rounded-lg bg-[#0F131A] border border-[#1C2430] flex flex-col justify-between hover:border-[rgba(0,201,141,0.35)] transition-all group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-5 h-5 rounded-md bg-[#090A0F] border border-[rgba(0,201,141,0.35)] text-[#00C98D] text-[10px] font-mono font-bold flex items-center justify-center group-hover:bg-[#00C98D] group-hover:text-[#090A0F] transition-all">
                        {item.step}
                      </span>
                      <span className="font-display text-xs font-bold text-[#F2F4F7] uppercase">
                        {language === 'vi' ? item.titleVi : item.titleEn}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A5AFBF] leading-relaxed font-sans">
                      {language === 'vi' ? item.descVi : item.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1C2430] bg-[#090A0F] flex items-center justify-between text-xs text-[#A5AFBF] font-sans">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#00C98D]" />
            <span>NIST FIPS 180-4 Standard Compliance · Blockchain Elearning</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#0F131A] hover:bg-[#11161E] text-[#F2F4F7] font-display font-semibold uppercase tracking-wider text-xs border border-[#1C2430] cursor-pointer transition-all"
          >
            {language === 'vi' ? 'Đóng' : 'Close Viewer'}
          </button>
        </div>
      </div>
    </div>
  );
};
