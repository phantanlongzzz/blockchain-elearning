import React, { useState } from 'react';
import { X, Copy, Check, Code, Zap, Award, Flame, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CodeViewer } from '../common/CodeViewer';

interface PoSCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightedSection?: string;
  onSelectSection?: (sectionId: string) => void;
}

const EXACT_EDUCATIONAL_PYTHON_CODE = `import random
import hashlib
import time

#// 1. INITIALIZE VALIDATORS
# More stake = more chances to be selected

validators = {
    "Alice": 500,
    "Bob": 300,
    "Charlie": 200
}

print("=== VALIDATORS ===")

for name, stake in validators.items():
    print(f"- {name}: {stake} ETH")


# 2. SELECT VALIDATOR
# Weighted random selection based on stake

def choose_validator(validators):
    names = list(validators.keys())
    stakes = list(validators.values())

    selected = random.choices(
        names,
        weights=stakes,
        k=1
    )[0]

    return selected


# 3. CREATE BLOCK

def create_block(block_id, tx_data, validator_name, is_honest=True):

    print(
        f"\\n[Block #{block_id}] "
        f"Validator '{validator_name}' selected!"
    )

    print(f"-> Processing: {tx_data}")

    # PoS does NOT require solving a PoW puzzle
    time.sleep(0.5)

    raw_data = (
        f"{block_id}"
        f"{tx_data}"
        f"{validator_name}"
        f"{is_honest}"
    )

    block_hash = hashlib.sha256(
        raw_data.encode()
    ).hexdigest()

    return block_hash


# ============================================================
# ROUND 1 — HONEST VALIDATOR
# ============================================================

winner = choose_validator(validators)

block_hash = create_block(
    block_id=1,
    tx_data="Alice sends 2 ETH to Bob",
    validator_name=winner,
    is_honest=True
)

print("VALID BLOCK")
print(f"Hash: {block_hash[:15]}...")

# Reward
validators[winner] += 5

print(f"Reward: +5 ETH")


# ============================================================
# ROUND 2 — MALICIOUS VALIDATOR
# ============================================================

winner = choose_validator(validators)

is_honest = False

if not is_honest:

    create_block(
        block_id=2,
        tx_data="Alice tries to create 9999 ETH",
        validator_name=winner,
        is_honest=False
    )

    print(
        f"WARNING: {winner} created "
        f"a malicious block!"
    )

    # SLASHING
    print(
        f"SLASHING: "
        f"{validators[winner]} ETH confiscated!"
    )

    validators[winner] = 0

else:

    validators[winner] += 5


# ============================================================
# FINAL STAKES
# ============================================================

print("\\n=== FINAL VALIDATOR STAKES ===")

for name, stake in validators.items():
    print(f"- {name}: {stake} ETH")
`;

export const PoSCodeModal: React.FC<PoSCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(EXACT_EDUCATIONAL_PYTHON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isVi = language === 'vi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0C0F14] border border-[#1C2430] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#1C2430] bg-[#0F131A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.35)] flex items-center justify-center text-text-primary font-mono font-bold text-sm">
              &lt;/&gt;
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[#F2F4F7] font-display">
                  Proof-of-Stake — Simplified Simulation
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(0,201,141,0.1)] border border-[rgba(0,201,141,0.35)] text-text-primary">
                  {isVi ? 'Mô hình học thuật — Tinh gọn để thuyết trình' : 'Educational model — simplified for presentation'}
                </span>
              </div>
              <p className="text-xs text-[#A5AFBF]">
                {isVi
                  ? 'Mô hình ngắn gọn giải thích cơ chế cốt lõi trong 30–60 giây'
                  : 'Quick educational walkthrough of core staking, selection, and slashing'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              id="pos-copy-code-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F131A] hover:bg-[#11161E] text-[#F2F4F7] border border-[#1C2430] rounded-lg text-xs font-medium transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-text-primary" />
                  <span className="text-text-primary font-mono">{isVi ? 'Đã sao chép ✓' : 'Copied ✓'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#A5AFBF]" />
                  <span className="font-mono">{isVi ? 'Sao chép mã' : 'COPY CODE'}</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              id="pos-close-code-btn"
              onClick={onClose}
              className="p-1.5 text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-[#0F131A] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Educational Simplification Notice */}
        <div className="px-5 sm:px-6 py-2.5 bg-[#090A0F] border-b border-[#1C2430] flex items-start sm:items-center gap-2.5 text-xs text-[#A5AFBF]">
          <div className="px-2 py-0.5 rounded bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.35)] text-[#F59E0B] font-mono text-[10px] font-bold uppercase tracking-wider shrink-0">
            {isVi ? 'Đơn giản hóa phục vụ giảng dạy' : 'Educational Simplification'}
          </div>
          <p className="text-[11px] text-[#A5AFBF] leading-snug">
            {isVi
              ? 'Mã nguồn này là mô hình giáo dục tinh giản của Proof-of-Stake. Động cơ mô phỏng tương tác trên ứng dụng bao gồm thêm kiểm tra xác thực, giao dịch và phân tán đồng hàng.'
              : 'This code is a simplified educational model of Proof-of-Stake. The actual simulation engine may contain additional validation, consensus, transaction, and blockchain logic.'}
          </p>
        </div>

        {/* Code Content View (VS Code Dark Style) */}
        <div className="p-4 sm:p-6 bg-[#090A0F] border-b border-[#1C2430]">
          <CodeViewer
            code={EXACT_EDUCATIONAL_PYTHON_CODE}
            language="python"
            filename="pos_consensus.py"
            maxHeight="44vh"
            highlightLine={(num, line) => {
              if (
                line.includes('random.choices') ||
                line.includes('validators[winner] += 5') ||
                line.includes('validators[winner] = 0') ||
                line.includes('hashlib.sha256')
              ) {
                return 'active';
              }
              return null;
            }}
          />
        </div>

        {/* "CORE IDEA" Panel below the code */}
        <div className="p-4 sm:p-5 bg-[#0C0F14] border-t border-[#1C2430] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-text-primary" />
              <h3 className="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-[#F2F4F7]">
                {isVi ? 'Ý TƯỞNG CỐT LÕI (CORE IDEA)' : 'CORE IDEA'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#717B8C]">
              {isVi ? 'Giải thích cho Giảng viên trong 30 giây' : '30-second presentation summary'}
            </span>
          </div>

          {/* 2-Column Core Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Left: Key Mechanism Statements */}
            <div className="p-3 rounded-xl bg-[#0F131A] border border-[#1C2430] space-y-2 font-mono">
              <div className="flex items-center gap-2 text-text-primary">
                <Zap className="w-3.5 h-3.5 shrink-0 text-text-primary" />
                <span className="font-semibold">
                  {isVi
                    ? 'Càng nhiều cổ phần (Stake) → Xác suất được chọn giải khối càng cao'
                    : 'More stake → higher probability of becoming validator'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-primary">
                <Award className="w-3.5 h-3.5 shrink-0 text-text-primary" />
                <span>
                  {isVi ? (
                    <>Người xác thực trung thực → <strong>Nhận thưởng (+5 ETH)</strong></>
                  ) : (
                    <>Honest Validator → <strong>Reward (+5 ETH)</strong></>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#EF4444]">
                <Flame className="w-3.5 h-3.5 shrink-0 text-[#EF4444]" />
                <span>
                  {isVi ? (
                    <>Kẻ gian lận phá hoại → <strong>Bị phạt Slashing (Tịch thu cọc)</strong></>
                  ) : (
                    <>Malicious Validator → <strong>Slashing (Confiscated)</strong></>
                  )}
                </span>
              </div>
            </div>

            {/* Right: Visual Validator Probabilities */}
            <div className="p-3 rounded-xl bg-[#0F131A] border border-[#1C2430] flex flex-col justify-between">
              <div className="text-[11px] font-mono text-[#A5AFBF] mb-1.5 flex items-center justify-between">
                <span>{isVi ? 'TỶ LỆ CHỌN BAN ĐẦU:' : 'INITIAL SELECTION ODDS:'}</span>
                <span className="text-text-primary">{isVi ? 'Tổng: 1,000 ETH' : 'Total: 1,000 ETH'}</span>
              </div>

              {/* Progress bar breakdown */}
              <div className="w-full h-3 rounded bg-[#090A0F] flex overflow-hidden border border-[#1C2430] mb-2">
                <div style={{ width: '50%' }} className="bg-success h-full" title="Alice: 50%" />
                <div style={{ width: '30%' }} className="bg-[#F59E0B] h-full" title="Bob: 30%" />
                <div style={{ width: '20%' }} className="bg-[#8B5CF6] h-full" title="Charlie: 20%" />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-center">
                <div className="p-1 rounded bg-[rgba(0,201,141,0.08)] border border-[rgba(0,201,141,0.35)] text-text-primary">
                  <strong>Alice</strong>
                  <div className="text-[10px] text-text-primary">500 ETH · 50%</div>
                </div>
                <div className="p-1 rounded bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.35)] text-[#F59E0B]">
                  <strong>Bob</strong>
                  <div className="text-[10px] text-[#F59E0B]">300 ETH · 30%</div>
                </div>
                <div className="p-1 rounded bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.35)] text-[#8B5CF6]">
                  <strong>Charlie</strong>
                  <div className="text-[10px] text-[#8B5CF6]">200 ETH · 20%</div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-mono text-[#717B8C] text-center italic">
            {isVi
              ? '* Các tỷ lệ phần trăm này là trọng số xác suất ban đầu trước khi nhận thưởng. Việc chọn validator dựa trên tỷ lệ cọc theo mô hình quay xổ số ngẫu nhiên.'
              : '* These percentages are the approximate selection weights before any reward changes the stake. Selection is weighted by stake, not a guaranteed outcome.'}
          </p>
        </div>
      </div>
    </div>
  );
};
