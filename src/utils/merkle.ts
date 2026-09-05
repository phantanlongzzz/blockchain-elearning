import { MerkleTransaction, MerkleNode, MerkleProofStep, MerkleTreeResult } from '../types';
import { sha256Sync } from './sha256';
import { stringToUtf8Bytes, bytesToHex } from './binary';

/**
 * Computes canonical SHA-256 hash for a Merkle Transaction
 */
export const calculateTxHash = (tx: {
  sender: string;
  receiver: string;
  amount: number;
  timestamp: string;
}): string => {
  const canonicalString = `${tx.sender.trim()}->${tx.receiver.trim()}:${Number(tx.amount).toFixed(4)}@${tx.timestamp.trim()}`;
  const utf8 = stringToUtf8Bytes(canonicalString);
  const hashBytes = sha256Sync(utf8);
  return bytesToHex(hashBytes);
};

/**
 * Computes SHA-256 parent hash of two child hashes (Left || Right)
 */
export const calculateCombinedHash = (leftHex: string, rightHex: string): string => {
  // Standard blockchain Merkle tree: concatenate left and right hex digests and hash with SHA-256
  const combinedString = `${leftHex.toLowerCase().trim()}${rightHex.toLowerCase().trim()}`;
  const utf8 = stringToUtf8Bytes(combinedString);
  const hashBytes = sha256Sync(utf8);
  return bytesToHex(hashBytes);
};

/**
 * Builds the complete hierarchical Merkle Tree from a list of transactions
 */
export const buildMerkleTree = (
  transactions: MerkleTransaction[],
  proofTargetTxId?: string
): MerkleTreeResult => {
  if (transactions.length === 0) {
    return {
      levels: [],
      rootNode: null,
      rootHash: '',
      totalLeaves: 0,
      totalNodes: 0,
      treeHeight: 0,
      isTampered: false,
      affectedNodeIds: new Set<string>(),
    };
  }

  const affectedNodeIds = new Set<string>();
  const isAnyTampered = transactions.some((t) => t.isTampered);

  // Level 0: Leaf Nodes
  const leaves: MerkleNode[] = transactions.map((tx, idx) => {
    const isTampered = Boolean(tx.isTampered);
    const nodeId = `node-0-${idx}`;
    if (isTampered) {
      affectedNodeIds.add(nodeId);
    }
    return {
      id: nodeId,
      hash: tx.hash,
      level: 0,
      index: idx,
      label: `Tx${idx}`,
      transactionId: tx.id,
      transaction: tx,
      isTampered,
      isProofTarget: proofTargetTxId === tx.id,
    };
  });

  const levels: MerkleNode[][] = [leaves];
  let currentLevel = leaves;
  let levelIdx = 1;

  while (currentLevel.length > 1) {
    const nextLevel: MerkleNode[] = [];
    const n = currentLevel.length;

    for (let i = 0; i < n; i += 2) {
      const leftNode = currentLevel[i];
      let rightNode: MerkleNode;
      let isDup = false;

      if (i + 1 < n) {
        rightNode = currentLevel[i + 1];
      } else {
        // Odd node count: duplicate the last node
        isDup = true;
        rightNode = {
          ...leftNode,
          id: `${leftNode.id}-dup`,
          index: i + 1,
          label: `${leftNode.label} (DUP)`,
          isDuplicated: true,
        };
      }

      const isParentTampered = leftNode.isTampered || rightNode.isTampered;
      const parentHash = calculateCombinedHash(leftNode.hash, rightNode.hash);
      const parentNodeId = `node-${levelIdx}-${Math.floor(i / 2)}`;

      if (isParentTampered) {
        affectedNodeIds.add(parentNodeId);
      }

      const parentNode: MerkleNode = {
        id: parentNodeId,
        hash: parentHash,
        level: levelIdx,
        index: Math.floor(i / 2),
        label: levelIdx === 1 ? `H${leftNode.label}${rightNode.label}` : `H${levelIdx}_${Math.floor(i / 2)}`,
        leftChildId: leftNode.id,
        rightChildId: rightNode.id,
        isTampered: isParentTampered,
        combinedInput: `${leftNode.hash}${rightNode.hash}`,
      };

      nextLevel.push(parentNode);
    }

    levels.push(nextLevel);
    currentLevel = nextLevel;
    levelIdx++;
  }

  const rootNode = levels.length > 0 ? levels[levels.length - 1][0] : null;
  const rootHash = rootNode ? rootNode.hash : '';

  // Calculate total nodes in tree
  const totalNodes = levels.reduce((acc, lvl) => acc + lvl.length, 0);

  // If proof is requested, mark path & sibling nodes
  if (proofTargetTxId && rootNode) {
    markProofPathAndSiblings(levels, proofTargetTxId);
  }

  return {
    levels,
    rootNode,
    rootHash,
    totalLeaves: transactions.length,
    totalNodes,
    treeHeight: levels.length - 1,
    isTampered: isAnyTampered,
    affectedNodeIds,
  };
};

/**
 * Helper to mark proof path and proof sibling nodes
 */
function markProofPathAndSiblings(levels: MerkleNode[][], targetTxId: string) {
  const leafIdx = levels[0].findIndex((n) => n.transactionId === targetTxId);
  if (leafIdx === -1) return;

  let currentIdx = leafIdx;

  for (let l = 0; l < levels.length; l++) {
    const levelNodes = levels[l];
    if (currentIdx < levelNodes.length) {
      const currentNode = levelNodes[currentIdx];
      currentNode.isProofPath = true;
      if (l === 0) currentNode.isProofTarget = true;

      // Find sibling node if not root level
      if (l < levels.length - 1) {
        const isLeft = currentIdx % 2 === 0;
        const siblingIdx = isLeft ? currentIdx + 1 : currentIdx - 1;
        if (siblingIdx < levelNodes.length) {
          levelNodes[siblingIdx].isProofSibling = true;
        }
      }
      currentIdx = Math.floor(currentIdx / 2);
    }
  }
}

/**
 * Generates an exact Merkle Proof for a given transaction ID
 */
export const generateMerkleProof = (
  transactions: MerkleTransaction[],
  targetTxId: string
): {
  targetTx: MerkleTransaction | undefined;
  targetLeafHash: string;
  steps: MerkleProofStep[];
  expectedRoot: string;
  isValid: boolean;
} => {
  const targetTx = transactions.find((t) => t.id === targetTxId);
  if (!targetTx) {
    return {
      targetTx: undefined,
      targetLeafHash: '',
      steps: [],
      expectedRoot: '',
      isValid: false,
    };
  }

  const { levels, rootHash } = buildMerkleTree(transactions);
  const steps: MerkleProofStep[] = [];

  let currentIdx = levels[0].findIndex((n) => n.transactionId === targetTxId);
  if (currentIdx === -1) {
    return { targetTx, targetLeafHash: targetTx.hash, steps: [], expectedRoot: rootHash, isValid: false };
  }

  for (let l = 0; l < levels.length - 1; l++) {
    const levelNodes = levels[l];
    const isLeft = currentIdx % 2 === 0;
    const currentNode = levelNodes[currentIdx];

    let siblingHash: string;
    let siblingPosition: 'left' | 'right';

    if (isLeft) {
      if (currentIdx + 1 < levelNodes.length) {
        siblingHash = levelNodes[currentIdx + 1].hash;
      } else {
        // Odd node count duplication
        siblingHash = currentNode.hash;
      }
      siblingPosition = 'right';
    } else {
      siblingHash = levelNodes[currentIdx - 1].hash;
      siblingPosition = 'left';
    }

    const combinedHex =
      siblingPosition === 'right'
        ? `${currentNode.hash}${siblingHash}`
        : `${siblingHash}${currentNode.hash}`;

    const parentHash = calculateCombinedHash(
      siblingPosition === 'right' ? currentNode.hash : siblingHash,
      siblingPosition === 'right' ? siblingHash : currentNode.hash
    );

    steps.push({
      level: l,
      currentHash: currentNode.hash,
      siblingHash,
      siblingPosition,
      parentHash,
      isTarget: l === 0,
      combinedHex,
    });

    currentIdx = Math.floor(currentIdx / 2);
  }

  return {
    targetTx,
    targetLeafHash: targetTx.hash,
    steps,
    expectedRoot: rootHash,
    isValid: true,
  };
};

/**
 * Re-computes and verifies a Merkle Proof from target hash through sibling steps
 */
export const verifyMerkleProof = (
  targetHash: string,
  steps: MerkleProofStep[],
  expectedRoot: string
): { isValid: boolean; computedRoot: string; trace: { step: number; input: string; output: string }[] } => {
  let currentHash = targetHash;
  const trace: { step: number; input: string; output: string }[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const left = step.siblingPosition === 'right' ? currentHash : step.siblingHash;
    const right = step.siblingPosition === 'right' ? step.siblingHash : currentHash;
    const combined = `${left}${right}`;
    const nextParent = calculateCombinedHash(left, right);

    trace.push({
      step: i + 1,
      input: combined,
      output: nextParent,
    });

    currentHash = nextParent;
  }

  const isValid = currentHash.toLowerCase() === expectedRoot.toLowerCase();

  return {
    isValid,
    computedRoot: currentHash,
    trace,
  };
};
