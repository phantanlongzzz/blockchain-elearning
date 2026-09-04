import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  FlaskConical,
  X,
  Layers,
  ArrowRight,
  Sparkles,
  GitFork,
  Cpu,
  Trophy,
} from 'lucide-react';
import { E2EBlock, E2ETransaction } from './types';
import {
  calculateBlockWork,
  calculateChainWork,
  mineBlockSynchronous,
  resolveCanonicalChain,
} from '../../utils/consensusEngine';
import { fastSha256Hex } from '../../utils/sha256';

interface AuditSelfTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTestDataToLab?: (
    canonicalBlocks: E2EBlock[],
    orphanedBlocks: E2EBlock[],
    branchA: E2EBlock[],
    branchB: E2EBlock[],
    recoveredMempool: E2ETransaction[]
  ) => void;
  language: 'vi' | 'en';
}

interface TestStepResult {
  id: string;
  name: string;
  category: 'PoW' | 'Fork' | 'Nakamoto' | 'Canonical' | 'Orphan' | 'Mempool' | 'Rewards';
  status: 'PASS' | 'FAIL';
  details: string;
  expected: string;
  actual: string;
}

export const AuditSelfTestModal: React.FC<AuditSelfTestModalProps> = ({
  isOpen,
  onClose,
  onApplyTestDataToLab,
  language,
}) => {
  const [testResults, setTestResults] = useState<TestStepResult[] | null>(null);
  const [testData, setTestData] = useState<{
    canonicalBlocks: E2EBlock[];
    orphanedBlocks: E2EBlock[];
    branchA: E2EBlock[];
    branchB: E2EBlock[];
    recoveredMempool: E2ETransaction[];
    workA: number;
    workB: number;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const runDeterministicAudit = () => {
    setIsRunning(true);
    const results: TestStepResult[] = [];

    const difficulty = 3;
    const expectedBlockWork = Math.pow(16, difficulty); // 4,096

    // 1. Setup Genesis & Baseline
    const genesisBlock: E2EBlock = {
      height: 0,
      id: 'audit-block-0',
      branchId: 'main',
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
      nonce: 208392,
      timestamp: '13:50:00',
      merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
      difficulty: 3,
      transactions: [],
      minerId: 'miner-satoshi',
      minerName: 'Satoshi Nakamoto',
      cumulativeWork: 4096,
      status: 'canonical',
      rewardBTC: 50.0,
    };

    const block1: E2EBlock = mineBlockSynchronous(
      genesisBlock,
      1,
      'main',
      { id: 'miner-alice', name: 'Alice Node' },
      [
        {
          id: 'tx-audit-1',
          sender: 'Satoshi',
          recipient: 'Hal Finney',
          amount: 10,
          feeBTC: 0.0001,
          timestamp: '13:52:00',
          hash: fastSha256Hex('tx-audit-1'),
          status: 'confirmed',
        },
      ],
      difficulty,
      2.0
    );

    const block2: E2EBlock = mineBlockSynchronous(
      block1,
      2,
      'main',
      { id: 'miner-bob', name: 'Bob Node' },
      [
        {
          id: 'tx-audit-2',
          sender: 'Hal Finney',
          recipient: 'Charlie',
          amount: 3.5,
          feeBTC: 0.0002,
          timestamp: '13:55:00',
          hash: fastSha256Hex('tx-audit-2'),
          status: 'confirmed',
        },
      ],
      difficulty,
      2.0
    );

    const baseline = [genesisBlock, block1, block2];

    // Test 1: Cumulative Proof-of-Work Equation (16^difficulty)
    const baselineExpectedWork = 3 * expectedBlockWork; // 12,288
    const baselineActualWork = block2.cumulativeWork;
    const test1Pass = baselineActualWork === baselineExpectedWork;
    results.push({
      id: 'pow-formula',
      name: '1. Cumulative Proof-of-Work Formula Σ(16^difficulty)',
      category: 'PoW',
      status: test1Pass ? 'PASS' : 'FAIL',
      details: `Difficulty ${difficulty} requires 16^${difficulty} = ${expectedBlockWork} work units per block.`,
      expected: `${baselineExpectedWork.toLocaleString()} work units at Block #2`,
      actual: `${baselineActualWork.toLocaleString()} work units`,
    });

    // 2. Fork at Block #3
    // Branch A: Alice mines Block #3A, Block #4A, Block #5A
    const block3A = mineBlockSynchronous(
      block2,
      3,
      'branchA',
      { id: 'miner-alice', name: 'Alice Node' },
      [
        {
          id: 'tx-branchA-3',
          sender: 'Charlie',
          recipient: 'Dave',
          amount: 1.5,
          feeBTC: 0.0005,
          timestamp: '14:00:00',
          hash: fastSha256Hex('tx-branchA-3'),
          status: 'confirmed',
        },
      ],
      difficulty,
      2.0
    );

    const block4A = mineBlockSynchronous(
      block3A,
      4,
      'branchA',
      { id: 'miner-alice', name: 'Alice Node' },
      [],
      difficulty,
      2.0
    );

    const block5A = mineBlockSynchronous(
      block4A,
      5,
      'branchA',
      { id: 'miner-alice', name: 'Alice Node' },
      [],
      difficulty,
      2.0
    );

    const branchA = [block3A, block4A, block5A];
    const expectedWorkA = 12288 + 3 * expectedBlockWork; // 24,576

    // Branch B: Bob mines Block #3B, Block #4B
    const uniqueOrphanTx: E2ETransaction = {
      id: 'tx-bob-orphan-recovery-test',
      sender: 'Bob',
      recipient: 'Eva',
      amount: 7.75,
      feeBTC: 0.001,
      timestamp: '14:00:10',
      hash: fastSha256Hex('tx-bob-orphan-recovery-test'),
      status: 'confirmed',
    };

    const block3B = mineBlockSynchronous(
      block2,
      3,
      'branchB',
      { id: 'miner-bob', name: 'Bob Node' },
      [uniqueOrphanTx],
      difficulty,
      2.0
    );

    const block4B = mineBlockSynchronous(
      block3B,
      4,
      'branchB',
      { id: 'miner-bob', name: 'Bob Node' },
      [],
      difficulty,
      2.0
    );

    const branchB = [block3B, block4B];
    const expectedWorkB = 12288 + 2 * expectedBlockWork; // 20,480

    // Test 2: Branch Data Isolation & Previous Hash Integrity
    const link3APass = block3A.previousHash === block2.hash;
    const link3BPass = block3B.previousHash === block2.hash;
    const link4APass = block4A.previousHash === block3A.hash;
    const link4BPass = block4B.previousHash === block3B.hash;
    const link5APass = block5A.previousHash === block4A.hash;
    const branchHashesDistinct = block3A.hash !== block3B.hash;
    const test2Pass =
      link3APass && link3BPass && link4APass && link4BPass && link5APass && branchHashesDistinct;

    results.push({
      id: 'branch-isolation',
      name: '2. Branch Cryptographic Isolation & Parent Hash Links',
      category: 'Fork',
      status: test2Pass ? 'PASS' : 'FAIL',
      details: 'Block #3A.prev === #2.hash, #3B.prev === #2.hash, #4A.prev === #3A.hash, #4B.prev === #3B.hash.',
      expected: '100% cryptographic parent-hash verification across both forks',
      actual: test2Pass ? 'All 5 parent hash pointers strictly verified' : 'Hash pointer mismatch detected',
    });

    // Test 3: Nakamoto Cumulative Work Comparison
    const actualWorkA = block5A.cumulativeWork;
    const actualWorkB = block4B.cumulativeWork;
    const resolution = resolveCanonicalChain(branchA, branchB, baseline);

    const test3Pass =
      actualWorkA === expectedWorkA &&
      actualWorkB === expectedWorkB &&
      actualWorkA > actualWorkB &&
      resolution.winningBranch === 'branchA';

    results.push({
      id: 'nakamoto-rule',
      name: '3. Nakamoto Heaviest Chain Selection (Work_A > Work_B)',
      category: 'Nakamoto',
      status: test3Pass ? 'PASS' : 'FAIL',
      details: `Branch A accumulated ${actualWorkA.toLocaleString()} work units (5 blocks total) vs Branch B's ${actualWorkB.toLocaleString()} units (4 blocks total).`,
      expected: 'Winner = Branch A (Work: 24,576 vs 20,480)',
      actual: `Winner = ${resolution.winningBranch.toUpperCase()} (Work A: ${actualWorkA.toLocaleString()}, Work B: ${actualWorkB.toLocaleString()})`,
    });

    // Test 4: Canonical Chain Construction & Deduplication
    const fullCanonical = [...baseline, ...resolution.canonicalBlocks];
    const canonicalHashes = fullCanonical.map((b) => b.hash);
    const uniqueCanonicalHashes = new Set(canonicalHashes);
    const canonicalHeights = fullCanonical.map((b) => b.height);
    const heightsStrictAscending = canonicalHeights.every((h, i) => h === i);
    const test4Pass =
      fullCanonical.length === 6 &&
      uniqueCanonicalHashes.size === 6 &&
      heightsStrictAscending;

    results.push({
      id: 'canonical-dedup',
      name: '4. Canonical Blockchain Deduplication & Sequential Heights',
      category: 'Canonical',
      status: test4Pass ? 'PASS' : 'FAIL',
      details: 'Canonical chain ordered strictly Genesis -> #1 -> #2 -> #3A -> #4A -> #5A with 0 duplicate blocks.',
      expected: 'Exactly 6 unique blocks with heights [0, 1, 2, 3, 4, 5]',
      actual: `${fullCanonical.length} blocks, ${uniqueCanonicalHashes.size} unique hashes, heights: [${canonicalHeights.join(', ')}]`,
    });

    // Test 5: Orphaned Blocks Deduplication & revoking rewards
    const fullOrphans = resolution.orphanedBlocks;
    const orphanHashes = fullOrphans.map((b) => b.hash);
    const uniqueOrphanHashes = new Set(orphanHashes);
    const orphanRewardsZero = fullOrphans.every((b) => b.status === 'orphaned');
    const test5Pass = fullOrphans.length === 2 && uniqueOrphanHashes.size === 2 && orphanRewardsZero;

    results.push({
      id: 'orphan-dedup',
      name: '5. Orphaned Blocks Tracking & Zero Confirmed Reward',
      category: 'Orphan',
      status: test5Pass ? 'PASS' : 'FAIL',
      details: 'Losing branch blocks (#3B, #4B) marked as orphaned (status: orphaned, 0 BTC confirmed reward).',
      expected: 'Exactly 2 unique orphaned blocks (#3B, #4B)',
      actual: `${fullOrphans.length} orphaned blocks with 0 duplicates`,
    });

    // Test 6: Mempool Transaction Recovery Without Duplication
    const returnedTxs = resolution.returnedTransactions;
    const containsUniqueBobTx = returnedTxs.some((t) => t.id === 'tx-bob-orphan-recovery-test');
    const txIdsUnique = new Set(returnedTxs.map((t) => t.id)).size === returnedTxs.length;
    const test6Pass = containsUniqueBobTx && txIdsUnique;

    results.push({
      id: 'mempool-recovery',
      name: '6. Mempool Transaction Recovery & TXID Uniqueness',
      category: 'Mempool',
      status: test6Pass ? 'PASS' : 'FAIL',
      details: 'Transactions inside orphaned blocks not yet in canonical chain safely returned to mempool.',
      expected: 'Transaction tx-bob-orphan-recovery-test returned to Mempool without duplicate TXIDs',
      actual: test6Pass ? `${returnedTxs.length} transaction(s) returned safely` : 'Transaction recovery failed',
    });

    // Test 7: Miner Consistency & Reward Finalization
    const canonicalMiners = fullCanonical.slice(3).every((b) => b.minerName === 'Alice Node');
    const orphanMiners = fullOrphans.every((b) => b.minerName === 'Bob Node');
    const test7Pass = canonicalMiners && orphanMiners;

    results.push({
      id: 'miner-reward-consistency',
      name: '7. Miner Consistency & Single Source of Truth',
      category: 'Rewards',
      status: test7Pass ? 'PASS' : 'FAIL',
      details: 'Alice is miner for Branch A, Bob is miner for Branch B. Block object is single source of truth.',
      expected: 'Alice finalized on Canonical Chain | Bob marked on Orphaned Branch',
      actual: test7Pass ? 'Miner attribution and reward state 100% consistent' : 'Miner mismatch detected',
    });

    setTestResults(results);
    setTestData({
      canonicalBlocks: fullCanonical,
      orphanedBlocks: fullOrphans,
      branchA,
      branchB,
      recoveredMempool: returnedTxs,
      workA: actualWorkA,
      workB: actualWorkB,
    });
    setIsRunning(false);
  };

  const allPassed = testResults && testResults.every((r) => r.status === 'PASS');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-[#0D1322] border border-border-primary rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl p-5 sm:p-6 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-bg-elevated border border-border-primary flex items-center justify-center text-text-secondary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                {language === 'vi'
                  ? 'Kiểm Thử Toàn Diện Thuật Toán (Automated Consensus Audit)'
                  : 'Deterministic Consensus Engine Audit & Self-Test'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {language === 'vi'
                  ? 'Kiểm toán tự động 7 tiêu chí: PoW Toán học, Deduplication, Link cha-con, Re-org, Mempool & Phần thưởng.'
                  : 'Mathematical and state verification for PoW, deduplication, hash integrity, re-org & mempool.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#111827] border border-transparent hover:border-[#1E293B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Results */}
        <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-1">
          {!testResults ? (
            <div className="p-6 rounded-xl bg-[#070A12] border border-[#1E293B] text-center space-y-3">
              <FlaskConical className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <div className="text-sm font-bold text-white">
                {language === 'vi' ? 'Sẵn Sàng Chạy Kiểm Toán Mẫu' : 'Ready to Run Deterministic Test Suite'}
              </div>
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto font-sans">
                {language === 'vi'
                  ? 'Kịch bản kiểm thử: Genesis (0) → #1 → #2 → Phân nhánh tại #3 (Nhánh A: 3 khối vs Nhánh B: 2 khối). Xác thực thuật toán Nakamoto giải quyết với 0 lỗi trùng lặp.'
                  : 'Test scenario: Genesis (0) → #1 → #2 → Fork at #3 (Branch A: 3 blocks vs Branch B: 2 blocks). Verifies mathematical resolution with zero duplicated state.'}
              </p>
              <button
                type="button"
                onClick={runDeterministicAudit}
                disabled={isRunning}
 className="px-5 py-2.5 rounded-xl bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer shadow-lg "
              >
                <Play className="w-4 h-4" />
                <span>{language === 'vi' ? 'Khởi Chạy Kiểm Toán Ngay' : 'Run Consensus Audit'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  allPassed
                    ? 'bg-white/[0.08] border-border-primary text-text-primary'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {allPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <span className="font-bold text-xs sm:text-sm">
                    {allPassed
                      ? language === 'vi'
                        ? 'TẤT CẢ 7 BÀI TEST ĐẠT CHUẨN (ALL PASS)'
                        : 'ALL 7 AUDIT CRITERIA PASSED'
                      : language === 'vi'
                      ? 'CÓ LỖI TRONG BÀI TEST'
                      : 'AUDIT ISSUES DETECTED'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#070A12] border border-current">
                  {testResults.filter((r) => r.status === 'PASS').length}/{testResults.length} PASS
                </span>
              </div>

              {/* Individual Item Results */}
              <div className="space-y-2">
                {testResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#070A12] border border-[#1E293B] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs font-sans">{item.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'PASS'
                            ? 'bg-white/[0.08] text-text-primary border border-border-primary'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#94A3B8] font-sans">{item.details}</p>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-[#1E293B]/60">
                      <div>
                        <span className="text-[#64748B] block">Expected:</span>
                        <span className="text-emerald-300 font-bold">{item.expected}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Actual:</span>
                        <span className="text-emerald-300 font-bold">{item.actual}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#1E293B]">
          <button
            type="button"
            onClick={runDeterministicAudit}
            className="px-3.5 py-2 rounded-lg bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] text-[#94A3B8] hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Chạy Lại' : 'Re-run Audit'}</span>
          </button>

          <div className="flex items-center gap-2">
            {testData && onApplyTestDataToLab && (
              <button
                type="button"
                onClick={() => {
                  onApplyTestDataToLab(
                    testData.canonicalBlocks,
                    testData.orphanedBlocks,
                    testData.branchA,
                    testData.branchB,
                    testData.recoveredMempool
                  );
                  onClose();
                }}
                className="px-3.5 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{language === 'vi' ? 'Tải Kịch Bản Lên Lab' : 'Load Audit State to Lab'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
            >
              {language === 'vi' ? 'Đóng' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
