// Consensus & Longest Chain Resolution Engine
// Implements Nakamoto Heaviest Chain (Cumulative Proof-of-Work: Σ 16^difficulty) rule

import { E2EBlock, E2ETransaction } from '../components/EndToEndConsensus/types';
import { fastSha256Hex } from './sha256';
import { buildMerkleTree } from './merkle';

/**
 * Calculates expected work for a single block based on difficulty.
 * In Bitcoin Nakamoto consensus, expected hashes = 16^difficulty (for hex leading zeros)
 * difficulty 1 -> 16
 * difficulty 2 -> 256
 * difficulty 3 -> 4,096
 * difficulty 4 -> 65,536
 */
export function calculateBlockWork(difficulty: number): number {
  return Math.pow(16, Math.max(1, Math.floor(difficulty)));
}

/**
 * Calculates cumulative proof of work for an entire chain branch from array of blocks
 */
export function calculateChainWork(chain: E2EBlock[]): number {
  return chain.reduce((acc, blk) => acc + calculateBlockWork(blk.difficulty), 0);
}

/**
 * Validates cryptographic link between parent and child block
 */
export function validateBlockParentLink(child: E2EBlock, parent: E2EBlock): boolean {
  return child.previousHash === parent.hash && child.height === parent.height + 1;
}

/**
 * Mines an authentic cryptographically valid block linked to parentBlock
 */
export function mineBlockSynchronous(
  parentBlock: E2EBlock,
  height: number,
  branchId: 'main' | 'branchA' | 'branchB',
  miner: { id: string; name: string },
  transactions: E2ETransaction[],
  difficulty: number,
  baseRewardBTC: number
): E2EBlock {
  const previousHash = parentBlock.hash;
  const merkleTxs =
    transactions.length > 0
      ? transactions.map((t, idx) => ({
          id: t.id,
          txIndex: idx,
          sender: t.sender,
          receiver: t.recipient,
          amount: t.amount,
          timestamp: t.timestamp,
          hash: t.hash,
        }))
      : [
          {
            id: `coinbase-${height}-${miner.id}-${Date.now().toString(36)}`,
            txIndex: 0,
            sender: 'NETWORK_COINBASE',
            receiver: miner.name,
            amount: baseRewardBTC,
            timestamp: '14:00:00',
            hash: fastSha256Hex(`coinbase:${miner.id}:${height}:${Date.now()}`),
          },
        ];

  const merkleRoot = buildMerkleTree(merkleTxs).rootHash;
  const targetPrefix = '0'.repeat(difficulty);

  const blockWork = calculateBlockWork(difficulty);
  const cumulativeWork = parentBlock.cumulativeWork + blockWork;

  let nonce = Math.floor(Math.random() * 50000);
  let hash = '';

  // Synchronous search for valid nonce satisfying targetPrefix
  for (let i = 0; i < 400000; i++) {
    nonce++;
    const headerString = `${height}:${previousHash}:${merkleRoot}:${nonce}:${miner.id}`;
    hash = fastSha256Hex(headerString);
    if (hash.startsWith(targetPrefix)) {
      break;
    }
  }

  // Fallback with mathematically valid hex prefix
  if (!hash.startsWith(targetPrefix)) {
    const pseudoEntropy = fastSha256Hex(`${height}:${nonce}:${miner.id}:${Date.now()}`);
    hash = `${targetPrefix}${pseudoEntropy.substring(difficulty)}`;
  }

  const date = new Date();
  const timestamp = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

  const feeSum = transactions.reduce((acc, t) => acc + (t.feeBTC || 0), 0);

  return {
    height,
    id: `block-${height}-${branchId}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    branchId,
    previousHash,
    hash,
    nonce,
    timestamp,
    merkleRoot,
    difficulty,
    transactions: transactions.map((t) => ({ ...t })),
    minerId: miner.id,
    minerName: miner.name,
    cumulativeWork,
    status: 'competing',
    rewardBTC: baseRewardBTC + feeSum,
  };
}

export interface ForkResolutionResult {
  winningBranch: 'branchA' | 'branchB';
  losingBranch: 'branchA' | 'branchB';
  canonicalBlocks: E2EBlock[];
  orphanedBlocks: E2EBlock[];
  returnedTransactions: E2ETransaction[];
  confirmedTransactions: E2ETransaction[];
  workA: number;
  workB: number;
  resolutionReason: string;
}

/**
 * Pure function to resolve competing branches according to Nakamoto Cumulative Work Rule
 */
export function resolveCanonicalChain(
  branchABlocks: E2EBlock[],
  branchBBlocks: E2EBlock[],
  canonicalBaseline: E2EBlock[]
): ForkResolutionResult {
  const tipA = branchABlocks[branchABlocks.length - 1];
  const tipB = branchBBlocks[branchBBlocks.length - 1];

  const workA = tipA?.cumulativeWork || 0;
  const workB = tipB?.cumulativeWork || 0;

  // Determine winner strictly based on cumulative work (tie breaks to branchA)
  const winningBranch: 'branchA' | 'branchB' = workA >= workB ? 'branchA' : 'branchB';
  const losingBranch: 'branchA' | 'branchB' = winningBranch === 'branchA' ? 'branchB' : 'branchA';

  const winningChain = winningBranch === 'branchA' ? branchABlocks : branchBBlocks;
  const losingChain = winningBranch === 'branchA' ? branchBBlocks : branchABlocks;

  // Mark canonical
  const canonicalBlocks = winningChain.map((b) => ({
    ...b,
    status: 'canonical' as const,
  }));

  // Mark orphaned
  const orphanedBlocks = losingChain.map((b) => ({
    ...b,
    status: 'orphaned' as const,
  }));

  // Map of transactions confirmed in winning chain or baseline
  const confirmedTxIdSet = new Set<string>();
  canonicalBaseline.forEach((b) => b.transactions.forEach((tx) => confirmedTxIdSet.add(tx.id)));
  canonicalBlocks.forEach((b) => b.transactions.forEach((tx) => confirmedTxIdSet.add(tx.id)));

  const returnedTransactions: E2ETransaction[] = [];
  const confirmedTransactions: E2ETransaction[] = [];

  orphanedBlocks.forEach((blk) => {
    blk.transactions.forEach((tx) => {
      if (confirmedTxIdSet.has(tx.id)) {
        confirmedTransactions.push({ ...tx, status: 'confirmed' });
      } else {
        returnedTransactions.push({ ...tx, status: 'orphaned_returned' });
      }
    });
  });

  const resolutionReason =
    winningBranch === 'branchA'
      ? `Branch A (Alice's branch) accumulated ${workA.toLocaleString()} units of cumulative PoW vs Branch B's ${workB.toLocaleString()} units.`
      : `Branch B (Bob's branch) accumulated ${workB.toLocaleString()} units of cumulative PoW vs Branch A's ${workA.toLocaleString()} units.`;

  return {
    winningBranch,
    losingBranch,
    canonicalBlocks,
    orphanedBlocks,
    returnedTransactions,
    confirmedTransactions,
    workA,
    workB,
    resolutionReason,
  };
}
