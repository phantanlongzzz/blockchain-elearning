/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sha256Sync } from '../hashing/pure-hash';

export interface MerkleNodeData {
  id: string;
  hash: string;
  left?: MerkleNodeData;
  right?: MerkleNodeData;
  level: number;
  index: number;
  isLeaf: boolean;
  txData?: string;
}

export interface MerkleProofItem {
  position: 'left' | 'right';
  hash: string;
}

export interface MerkleTreeSummary {
  rootHash: string;
  totalLeaves: number;
  treeHeight: number;
  levels: MerkleNodeData[][];
}

/**
 * Pure function: Combines two hex hashes and hashes them with SHA-256 (Left || Right)
 */
export function combineHashPair(leftHex: string, rightHex: string): string {
  const combined = `${leftHex.toLowerCase().trim()}${rightHex.toLowerCase().trim()}`;
  return sha256Sync(combined);
}

/**
 * Pure function: Computes leaf hash for a transaction string
 */
export function hashTransactionLeaf(tx: string): string {
  return sha256Sync(tx.trim());
}

/**
 * Pure function: Computes the Merkle Root for an array of transaction strings
 */
export function computeMerkleRoot(transactions: string[]): string {
  if (transactions.length === 0) {
    return '0000000000000000000000000000000000000000000000000000000000000000';
  }

  let currentLevelHashes = transactions.map((tx) => hashTransactionLeaf(tx));

  while (currentLevelHashes.length > 1) {
    const nextLevelHashes: string[] = [];

    for (let i = 0; i < currentLevelHashes.length; i += 2) {
      const left = currentLevelHashes[i];
      // If odd number of elements, duplicate the last element (Bitcoin standard)
      const right = i + 1 < currentLevelHashes.length ? currentLevelHashes[i + 1] : left;
      nextLevelHashes.push(combineHashPair(left, right));
    }

    currentLevelHashes = nextLevelHashes;
  }

  return currentLevelHashes[0];
}

/**
 * Pure function: Builds the complete hierarchical Merkle tree structure
 */
export function buildMerkleTree(transactions: string[]): MerkleTreeSummary {
  if (transactions.length === 0) {
    return {
      rootHash: '0000000000000000000000000000000000000000000000000000000000000000',
      totalLeaves: 0,
      treeHeight: 0,
      levels: [],
    };
  }

  const levels: MerkleNodeData[][] = [];

  // Level 0: Leaf Nodes
  const leaves: MerkleNodeData[] = transactions.map((tx, idx) => ({
    id: `leaf-${idx}`,
    hash: hashTransactionLeaf(tx),
    level: 0,
    index: idx,
    isLeaf: true,
    txData: tx,
  }));

  levels.push(leaves);

  let currentLevel = leaves;
  let levelIdx = 1;

  while (currentLevel.length > 1) {
    const nextLevel: MerkleNodeData[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
      const parentHash = combineHashPair(left.hash, right.hash);

      const parentNode: MerkleNodeData = {
        id: `node-${levelIdx}-${Math.floor(i / 2)}`,
        hash: parentHash,
        left,
        right,
        level: levelIdx,
        index: Math.floor(i / 2),
        isLeaf: false,
      };

      nextLevel.push(parentNode);
    }

    levels.push(nextLevel);
    currentLevel = nextLevel;
    levelIdx++;
  }

  return {
    rootHash: currentLevel[0].hash,
    totalLeaves: transactions.length,
    treeHeight: levels.length,
    levels,
  };
}

/**
 * Pure function: Generates a cryptographic Merkle Proof for a transaction at txIndex
 */
export function getMerkleProof(
  transactions: string[],
  txIndex: number
): MerkleProofItem[] {
  if (txIndex < 0 || txIndex >= transactions.length) {
    return [];
  }

  const proof: MerkleProofItem[] = [];
  let currentLevelHashes = transactions.map((tx) => hashTransactionLeaf(tx));
  let targetIndex = txIndex;

  while (currentLevelHashes.length > 1) {
    const nextLevelHashes: string[] = [];
    const isTargetEven = targetIndex % 2 === 0;
    const siblingIndex = isTargetEven ? targetIndex + 1 : targetIndex - 1;

    // Sibling hash (duplicate if odd length at end)
    let siblingHash: string;
    if (siblingIndex < currentLevelHashes.length) {
      siblingHash = currentLevelHashes[siblingIndex];
    } else {
      siblingHash = currentLevelHashes[targetIndex]; // duplicate self
    }

    proof.push({
      position: isTargetEven ? 'right' : 'left',
      hash: siblingHash,
    });

    // Build parent level
    for (let i = 0; i < currentLevelHashes.length; i += 2) {
      const left = currentLevelHashes[i];
      const right = i + 1 < currentLevelHashes.length ? currentLevelHashes[i + 1] : left;
      nextLevelHashes.push(combineHashPair(left, right));
    }

    currentLevelHashes = nextLevelHashes;
    targetIndex = Math.floor(targetIndex / 2);
  }

  return proof;
}

/**
 * Pure function: Verifies a Merkle Proof against the expected root
 */
export function verifyMerkleProof(
  tx: string,
  proof: MerkleProofItem[],
  expectedRoot: string
): boolean {
  let currentHash = hashTransactionLeaf(tx);

  for (const step of proof) {
    if (step.position === 'right') {
      currentHash = combineHashPair(currentHash, step.hash);
    } else {
      currentHash = combineHashPair(step.hash, currentHash);
    }
  }

  return currentHash.toLowerCase() === expectedRoot.toLowerCase();
}
