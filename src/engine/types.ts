/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// BLOCK & MINING CORE INTERFACES
// ============================================================================

export interface BlockHeader {
  version: number;
  blockNumber: number;
  previousHash: string;
  merkleRoot: string;
  timestamp: number;
  difficulty: number;
  nonce: number;
  minerId: string;
}

export interface MinedBlock {
  blockNumber: number;
  nonce: number;
  hash: string;
  previousHash: string;
  minerName: string;
  minerId: string;
  timestamp: string;
  difficulty: number;
  merkleRoot: string;
  txCount: number;
}

export interface Miner {
  id: string;
  name: string;
  avatarColor: string;
  rigTypeVi: string;
  rigTypeEn: string;
  hashRate: number; // Simulated hashes per second (e.g., 250 H/s)
  powerPercent: number; // Normalized network hash rate share (%)
  currentGuess: number;
  currentHash: string;
  attempts: number;
  chain: MinedBlock[];
  status: 'idle' | 'guessing' | 'won_block' | 'stopped';
}

export interface MinerPoolPreset {
  name: string;
  avatarColor: string;
  rigTypeVi: string;
  rigTypeEn: string;
  minHashRate: number;
  maxHashRate: number;
}

// ============================================================================
// SIMULATION ENGINE EVENTS (Worker <-> Controller <-> UI)
// ============================================================================

export type PowEngineEventType =
  | 'MINING_STARTED'
  | 'ATTEMPT'
  | 'BLOCK_FOUND'
  | 'TICK'
  | 'MINING_STOPPED'
  | 'RACE_FINISHED';

export interface MiningStartedEvent {
  type: 'MINING_STARTED';
  durationSec: number;
  difficulty: number;
  miners: Miner[];
  timestamp: number;
}

export interface MinerTelemetryBatch {
  minerId: string;
  currentNonce: number;
  currentHash: string;
  batchAttempts: number;
  totalAttempts: number;
}

export interface AttemptEvent {
  type: 'ATTEMPT';
  batches: MinerTelemetryBatch[];
  timestamp: number;
}

export interface BlockFoundEvent {
  type: 'BLOCK_FOUND';
  minerId: string;
  minerName: string;
  block: MinedBlock;
  chainLength: number;
  totalNetworkBlocks: number;
  timestamp: number;
}

export interface TickEvent {
  type: 'TICK';
  timeLeft: number;
  elapsedSec: number;
}

export interface MiningStoppedEvent {
  type: 'MINING_STOPPED';
  timestamp: number;
}

export interface RaceOutcome {
  isTie: boolean;
  tiedMinerNames: string[];
  winner: Miner | null;
  winnerChainLength: number;
  totalBlocksMined: number;
  durationSec: number;
  difficulty: number;
  summaryMessageVi: string;
  summaryMessageEn: string;
}

export interface RaceFinishedEvent {
  type: 'RACE_FINISHED';
  outcome: RaceOutcome;
  finalMiners: Miner[];
  timestamp: number;
}

export type PowEngineEvent =
  | MiningStartedEvent
  | AttemptEvent
  | BlockFoundEvent
  | TickEvent
  | MiningStoppedEvent
  | RaceFinishedEvent;

// ============================================================================
// WORKER COMMANDS (Controller -> Worker)
// ============================================================================

export interface PowSimulationConfig {
  durationSec: number;
  difficulty: number;
  miners: Miner[];
  targetPrefix: string;
  runId: number;
}

export type PowWorkerCommand =
  | { type: 'START_RACE'; config: PowSimulationConfig }
  | { type: 'STOP_RACE' }
  | { type: 'UPDATE_MINERS'; miners: Miner[] }
  | { type: 'UPDATE_DIFFICULTY'; difficulty: number };
