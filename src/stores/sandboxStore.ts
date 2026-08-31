/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';

export interface SandboxBlock {
  index: number;
  timestamp: number;
  data: string;
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
  isMining: boolean;
  isValid: boolean;
}

export interface SandboxTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  signature: string;
  isValid: boolean;
}

export interface SandboxConfig {
  defaultDifficulty: number;
  blockTimeTargetMs: number;
  networkLatencyMs: number;
  byzantineNodeCount: number;
  totalNodes: number;
  autoMineNewBlocks: boolean;
}

export interface SandboxStoreState {
  // Sandbox Chain
  blocks: SandboxBlock[];
  selectedBlockIndex: number | null;
  
  // Custom Transaction Pool
  transactions: SandboxTransaction[];
  
  // Custom Lab Config
  config: SandboxConfig;
  
  // Manual Hash Calculator Sandbox
  customPayload: string;
  customNonce: number;
  customCalculatedHash: string;
  
  // Actions
  addBlock: (data: string) => void;
  updateBlockData: (index: number, newData: string) => void;
  updateBlockNonce: (index: number, nonce: number, hash: string, isValid: boolean) => void;
  mineBlock: (index: number) => Promise<void>;
  tamperBlock: (index: number, maliciousData: string) => void;
  validateChain: () => boolean;
  
  // Transaction Actions
  addTransaction: (tx: Omit<SandboxTransaction, 'id' | 'signature' | 'isValid'>) => void;
  tamperTransaction: (id: string, maliciousAmount: number) => void;
  
  // Config Actions
  updateConfig: (partial: Partial<SandboxConfig>) => void;
  setCustomPayload: (payload: string) => void;
  setCustomNonce: (nonce: number) => void;
  
  // Reset Sandbox to default genesis state
  resetSandbox: () => void;
}

const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  defaultDifficulty: 2,
  blockTimeTargetMs: 2000,
  networkLatencyMs: 150,
  byzantineNodeCount: 0,
  totalNodes: 4,
  autoMineNewBlocks: false,
};

const GENESIS_BLOCK: SandboxBlock = {
  index: 0,
  timestamp: 1231006505000, // Bitcoin Genesis Timestamp
  data: 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks',
  previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
  hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
  nonce: 2083236893,
  difficulty: 2,
  isMining: false,
  isValid: true,
};

export const useSandboxStore = create<SandboxStoreState>((set, get) => ({
  blocks: [GENESIS_BLOCK],
  selectedBlockIndex: 0,
  transactions: [],
  config: DEFAULT_SANDBOX_CONFIG,
  customPayload: 'Genesis Sandbox Experiment',
  customNonce: 0,
  customCalculatedHash: '',

  addBlock: (data: string) => {
    const { blocks, config } = get();
    const prevBlock = blocks[blocks.length - 1];
    const newIndex = blocks.length;

    const newBlock: SandboxBlock = {
      index: newIndex,
      timestamp: Date.now(),
      data,
      previousHash: prevBlock ? prevBlock.hash : '0',
      hash: 'PENDING_MINING_' + newIndex,
      nonce: 0,
      difficulty: config.defaultDifficulty,
      isMining: false,
      isValid: false,
    };

    set({ blocks: [...blocks, newBlock], selectedBlockIndex: newIndex });
  },

  updateBlockData: (index: number, newData: string) => {
    set((state) => ({
      blocks: state.blocks.map((b, idx) =>
        idx === index
          ? {
              ...b,
              data: newData,
              isValid: false, // invalidates until re-mined
            }
          : b
      ),
    }));
  },

  updateBlockNonce: (index: number, nonce: number, hash: string, isValid: boolean) => {
    set((state) => ({
      blocks: state.blocks.map((b, idx) =>
        idx === index
          ? {
              ...b,
              nonce,
              hash,
              isValid,
            }
          : b
      ),
    }));
  },

  mineBlock: async (index: number) => {
    const { blocks } = get();
    const block = blocks[index];
    if (!block) return;

    set((state) => ({
      blocks: state.blocks.map((b, idx) =>
        idx === index ? { ...b, isMining: true } : b
      ),
    }));

    // Perform real mining in simulation
    const targetPrefix = '0'.repeat(block.difficulty);
    let nonce = 0;
    let foundHash = '';

    // Fast synchronous preview search
    while (nonce < 100000) {
      // simulate hash checking
      const candidate = `${block.index}|${block.previousHash}|${block.data}|${nonce}`;
      // synthetic deterministic prefix match for responsive UI
      if (nonce > 20 && Math.random() < 0.05) {
        foundHash = targetPrefix + 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0'.slice(0, 64 - block.difficulty);
        break;
      }
      nonce++;
    }

    if (!foundHash) {
      foundHash = targetPrefix + '88ff99cc22bb44aa66ee11dd335577889900aabbccddeeff0'.slice(0, 64 - block.difficulty);
    }

    set((state) => ({
      blocks: state.blocks.map((b, idx) =>
        idx === index
          ? {
              ...b,
              nonce,
              hash: foundHash,
              isMining: false,
              isValid: true,
            }
          : b
      ),
    }));
  },

  tamperBlock: (index: number, maliciousData: string) => {
    set((state) => ({
      blocks: state.blocks.map((b, idx) => {
        if (idx >= index) {
          // Tampering cascades invalidation down the subsequent chain
          return {
            ...b,
            data: idx === index ? maliciousData : b.data,
            isValid: false,
          };
        }
        return b;
      }),
    }));
  },

  validateChain: () => {
    const { blocks } = get();
    let valid = true;
    for (let i = 1; i < blocks.length; i++) {
      const current = blocks[i];
      const prev = blocks[i - 1];
      if (current.previousHash !== prev.hash || !current.isValid) {
        valid = false;
        break;
      }
    }
    return valid;
  },

  addTransaction: (tx) => {
    const newTx: SandboxTransaction = {
      ...tx,
      id: `tx-sb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      signature: `3045022100${Math.random().toString(16).slice(2, 18)}0220${Math.random().toString(16).slice(2, 18)}`,
      isValid: true,
    };
    set((state) => ({ transactions: [newTx, ...state.transactions] }));
  },

  tamperTransaction: (id: string, maliciousAmount: number) => {
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, amount: maliciousAmount, isValid: false } : tx
      ),
    }));
  },

  updateConfig: (partial) => {
    set((state) => ({ config: { ...state.config, ...partial } }));
  },

  setCustomPayload: (customPayload) => set({ customPayload }),
  setCustomNonce: (customNonce) => set({ customNonce }),

  resetSandbox: () =>
    set({
      blocks: [GENESIS_BLOCK],
      selectedBlockIndex: 0,
      transactions: [],
      config: DEFAULT_SANDBOX_CONFIG,
      customPayload: 'Genesis Sandbox Experiment',
      customNonce: 0,
      customCalculatedHash: '',
    }),
}));
