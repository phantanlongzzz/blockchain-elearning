/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';

export interface SimMinedBlock {
  blockNumber: number;
  nonce: number;
  hash: string;
  previousHash: string;
  minerName: string;
  minerId: string;
  timestamp: string;
}

export interface SimMiner {
  id: string;
  name: string;
  avatarColor: string;
  rigTypeVi: string;
  rigTypeEn: string;
  powerPercent: number;
  currentGuess: number;
  currentHash: string;
  attempts: number;
  chain: SimMinedBlock[];
  status: 'idle' | 'guessing' | 'won_block' | 'stopped';
}

export interface SimTransaction {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  signature: string;
  status: 'pending' | 'verified' | 'tampered';
  timestamp: number;
}

export interface SimValidator {
  id: string;
  name: string;
  stakeAmount: number;
  reputation: number;
  proposedBlocks: number;
  isSlashed: boolean;
  status: 'active' | 'selected' | 'attesting' | 'slashed';
}

export interface SimulationStoreState {
  // ----------------------------------------
  // General Active Simulation Metadata
  // ----------------------------------------
  activeSimulationId: string | null;
  isRunning: boolean;
  
  // ----------------------------------------
  // Proof of Work (PoW) Mining State
  // ----------------------------------------
  powDifficulty: number;
  powTargetPrefix: string;
  powDurationSec: number;
  powTimeLeft: number;
  powMiners: SimMiner[];
  powMinedBlocks: SimMinedBlock[];
  powActiveNonce: number;
  powWinner: string | null;
  
  // ----------------------------------------
  // Transaction Mempool State
  // ----------------------------------------
  mempoolTransactions: SimTransaction[];
  selectedTxId: string | null;
  
  // ----------------------------------------
  // Proof of Stake (PoS) State
  // ----------------------------------------
  posValidators: SimValidator[];
  posCurrentEpoch: number;
  posCurrentSlot: number;
  posProposerId: string | null;
  
  // ----------------------------------------
  // Actions
  // ----------------------------------------
  setRunning: (isRunning: boolean) => void;
  setActiveSimulation: (simId: string | null) => void;
  
  // PoW Actions
  setPowDifficulty: (diff: number) => void;
  setPowMiners: (miners: SimMiner[]) => void;
  updateMinerGuess: (minerId: string, guess: number, hash: string, attemptsInc: number) => void;
  addPowMinedBlock: (minerId: string, block: SimMinedBlock) => void;
  setPowWinner: (winner: string | null) => void;
  
  // Mempool Actions
  addMempoolTx: (tx: SimTransaction) => void;
  verifyMempoolTx: (txId: string) => void;
  tamperMempoolTx: (txId: string, newAmount: number) => void;
  
  // PoS Actions
  setPosValidators: (validators: SimValidator[]) => void;
  advancePosSlot: () => void;
  
  // COMPLETE RESET: Cleans up all ephemeral in-memory state
  // Notice: this explicitly DOES NOT touch progressStore!
  resetSimulationState: () => void;
}

const INITIAL_SIMULATION_STATE = {
  activeSimulationId: null,
  isRunning: false,
  powDifficulty: 2,
  powTargetPrefix: '00',
  powDurationSec: 30,
  powTimeLeft: 30,
  powMiners: [],
  powMinedBlocks: [],
  powActiveNonce: 0,
  powWinner: null,
  mempoolTransactions: [],
  selectedTxId: null,
  posValidators: [],
  posCurrentEpoch: 1,
  posCurrentSlot: 1,
  posProposerId: null,
};

export const useSimulationStore = create<SimulationStoreState>((set) => ({
  ...INITIAL_SIMULATION_STATE,

  setRunning: (isRunning) => set({ isRunning }),
  setActiveSimulation: (activeSimulationId) => set({ activeSimulationId }),

  setPowDifficulty: (powDifficulty) =>
    set({
      powDifficulty,
      powTargetPrefix: '0'.repeat(powDifficulty),
    }),

  setPowMiners: (powMiners) => set({ powMiners }),

  updateMinerGuess: (minerId, guess, hash, attemptsInc) =>
    set((state) => ({
      powMiners: state.powMiners.map((m) =>
        m.id === minerId
          ? {
              ...m,
              currentGuess: guess,
              currentHash: hash,
              attempts: m.attempts + attemptsInc,
            }
          : m
      ),
    })),

  addPowMinedBlock: (minerId, block) =>
    set((state) => ({
      powMinedBlocks: [...state.powMinedBlocks, block],
      powMiners: state.powMiners.map((m) =>
        m.id === minerId
          ? {
              ...m,
              chain: [...m.chain, block],
              status: 'won_block',
            }
          : m
      ),
    })),

  setPowWinner: (powWinner) => set({ powWinner }),

  addMempoolTx: (tx) =>
    set((state) => ({
      mempoolTransactions: [tx, ...state.mempoolTransactions],
    })),

  verifyMempoolTx: (txId) =>
    set((state) => ({
      mempoolTransactions: state.mempoolTransactions.map((tx) =>
        tx.id === txId ? { ...tx, status: 'verified' } : tx
      ),
    })),

  tamperMempoolTx: (txId, newAmount) =>
    set((state) => ({
      mempoolTransactions: state.mempoolTransactions.map((tx) =>
        tx.id === txId ? { ...tx, amount: newAmount, status: 'tampered' } : tx
      ),
    })),

  setPosValidators: (posValidators) => set({ posValidators }),

  advancePosSlot: () =>
    set((state) => {
      const nextSlot = state.posCurrentSlot + 1;
      const nextEpoch = nextSlot > 32 ? state.posCurrentEpoch + 1 : state.posCurrentEpoch;
      return {
        posCurrentSlot: nextSlot > 32 ? 1 : nextSlot,
        posCurrentEpoch: nextEpoch,
      };
    }),

  // Reset function strictly purges ephemeral state without affecting progressStore
  resetSimulationState: () => set(INITIAL_SIMULATION_STATE),
}));
