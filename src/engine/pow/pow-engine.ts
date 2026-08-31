/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PowEngineEvent,
  PowSimulationConfig,
  Miner,
  MinedBlock,
  MinerTelemetryBatch,
} from '../types';
import {
  samplePoissonNextBlockWaitTime,
  selectWinningMiner,
  evaluateRaceOutcome,
} from './pure-pow';
import { sha256Sync } from '../hashing/pure-hash';

export type PowEventListener = (event: PowEngineEvent) => void;

const GENESIS_BLOCK_HASH = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';

/**
 * PowEngine: Host controller interface for the PoW Simulation.
 * Connects to Web Worker when available, with a transparent zero-latency fallback engine for sandboxed environments.
 */
export class PowEngine {
  private worker: Worker | null = null;
  private listeners: Set<PowEventListener> = new Set();
  private useFallback = false;

  // Fallback engine state (if Web Workers are blocked in iframe)
  private fallbackTimer: any = null;
  private isFallbackRunning = false;
  private durationSec = 30;
  private difficulty = 2;
  private miners: Miner[] = [];
  private runId = 0;
  private startTime = 0;
  private lastTickTime = 0;
  private lastTelemetryTime = 0;
  private nextBlockTime = 0;
  private currentPreviousHash = GENESIS_BLOCK_HASH;
  private globalBlockHeight = 0;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    try {
      if (typeof Worker !== 'undefined') {
        this.worker = new Worker(new URL('./miner.worker.ts', import.meta.url), {
          type: 'module',
        });

        this.worker.onmessage = (e: MessageEvent<PowEngineEvent>) => {
          this.emitEvent(e.data);
        };

        this.worker.onerror = (err) => {
          console.warn('[PowEngine] Web Worker error, falling back to local ticker:', err);
          this.useFallback = true;
          if (this.worker) {
            this.worker.terminate();
            this.worker = null;
          }
        };
      } else {
        this.useFallback = true;
      }
    } catch (err) {
      console.warn('[PowEngine] Web Worker instantiation blocked, using fallback engine:', err);
      this.useFallback = true;
    }
  }

  public onEvent(listener: PowEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitEvent(event: PowEngineEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[PowEngine] Error in event listener:', err);
      }
    });
  }

  public startRace(config: PowSimulationConfig) {
    if (!this.useFallback && this.worker) {
      this.worker.postMessage({ type: 'START_RACE', config });
    } else {
      this.startFallbackRace(config);
    }
  }

  public stopRace() {
    if (!this.useFallback && this.worker) {
      this.worker.postMessage({ type: 'STOP_RACE' });
    } else {
      this.stopFallbackRace();
    }
  }

  public updateMiners(miners: Miner[]) {
    if (!this.useFallback && this.worker) {
      this.worker.postMessage({ type: 'UPDATE_MINERS', miners });
    } else {
      this.miners = miners;
    }
  }

  public updateDifficulty(difficulty: number) {
    if (!this.useFallback && this.worker) {
      this.worker.postMessage({ type: 'UPDATE_DIFFICULTY', difficulty });
    } else {
      this.difficulty = difficulty;
    }
  }

  public destroy() {
    this.stopRace();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.listeners.clear();
  }

  // ==========================================================================
  // FALLBACK ENGINE IMPLEMENTATION (Guarantees identical behavior without worker)
  // ==========================================================================

  private startFallbackRace(config: PowSimulationConfig) {
    this.stopFallbackRace();

    this.durationSec = config.durationSec;
    this.difficulty = config.difficulty;
    this.runId = config.runId;
    this.miners = config.miners.map((m) => ({
      ...m,
      currentGuess: Math.floor(Math.random() * 10000),
      currentHash: '',
      attempts: 0,
      chain: [],
      status: 'guessing',
    }));

    this.currentPreviousHash = GENESIS_BLOCK_HASH;
    this.globalBlockHeight = 0;
    this.isFallbackRunning = true;
    this.startTime = performance.now();
    this.lastTickTime = this.startTime;
    this.lastTelemetryTime = this.startTime;

    const totalHashRate = this.miners.reduce((acc, m) => acc + m.hashRate, 0);
    const initialWaitSec = samplePoissonNextBlockWaitTime(totalHashRate, this.difficulty);
    this.nextBlockTime = this.startTime + initialWaitSec * 1000;

    this.emitEvent({
      type: 'MINING_STARTED',
      durationSec: this.durationSec,
      difficulty: this.difficulty,
      miners: this.miners,
      timestamp: Date.now(),
    });

    this.fallbackTimer = setInterval(() => this.fallbackLoopStep(), 50);
  }

  private stopFallbackRace() {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (this.isFallbackRunning) {
      this.isFallbackRunning = false;
      this.miners = this.miners.map((m) => ({ ...m, status: 'stopped' }));
      this.emitEvent({
        type: 'MINING_STOPPED',
        timestamp: Date.now(),
      });
    }
  }

  private fallbackLoopStep() {
    if (!this.isFallbackRunning) return;

    const now = performance.now();
    const elapsedSec = (now - this.startTime) / 1000;
    const timeLeft = Math.max(0, Math.ceil(this.durationSec - elapsedSec));

    if (elapsedSec >= this.durationSec) {
      this.finishFallbackRace();
      return;
    }

    const dt = Math.max(0.001, (now - this.lastTickTime) / 1000);
    this.lastTickTime = now;

    for (const miner of this.miners) {
      const hashesThisStep = Math.max(1, Math.round(miner.hashRate * dt));
      miner.attempts += hashesThisStep;
      miner.currentGuess = (miner.currentGuess + hashesThisStep) % 2147483647;
      const candidatePayload = `${this.globalBlockHeight + 1}|${this.currentPreviousHash}|${miner.id}|${miner.currentGuess}|${this.runId}`;
      miner.currentHash = sha256Sync(candidatePayload);
    }

    if (now >= this.nextBlockTime) {
      this.mineFallbackBlock(now);
    }

    if (now - this.lastTelemetryTime >= 200) {
      this.lastTelemetryTime = now;

      const batches: MinerTelemetryBatch[] = this.miners.map((m) => ({
        minerId: m.id,
        currentNonce: m.currentGuess,
        currentHash: m.currentHash,
        batchAttempts: Math.round(m.hashRate * 0.2),
        totalAttempts: m.attempts,
      }));

      this.emitEvent({
        type: 'ATTEMPT',
        batches,
        timestamp: Date.now(),
      });

      this.emitEvent({
        type: 'TICK',
        timeLeft,
        elapsedSec: Math.floor(elapsedSec),
      });
    }
  }

  private mineFallbackBlock(now: number) {
    if (this.miners.length === 0) return;

    const winningMinerId = selectWinningMiner(this.miners);
    const winner = this.miners.find((m) => m.id === winningMinerId);
    if (!winner) return;

    this.globalBlockHeight++;
    const targetPrefix = '0'.repeat(Math.max(1, this.difficulty));
    const randomSuffix = Math.random().toString(16).substring(2, 10);
    const simulatedValidHash = `${targetPrefix}${winner.id.slice(0, 4)}${randomSuffix}${sha256Sync(winner.name + this.globalBlockHeight).slice(0, 64 - this.difficulty - 12)}`;

    const newBlock: MinedBlock = {
      blockNumber: this.globalBlockHeight,
      nonce: winner.currentGuess,
      hash: simulatedValidHash,
      previousHash: this.currentPreviousHash,
      minerName: winner.name,
      minerId: winner.id,
      timestamp: new Date().toLocaleTimeString(),
      difficulty: this.difficulty,
      merkleRoot: sha256Sync(`tx-root-block-${this.globalBlockHeight}`).slice(0, 32),
      txCount: Math.floor(Math.random() * 8) + 2,
    };

    winner.chain.push(newBlock);
    winner.status = 'won_block';
    this.currentPreviousHash = newBlock.hash;

    const totalNetworkBlocks = this.miners.reduce((acc, m) => acc + m.chain.length, 0);

    this.emitEvent({
      type: 'BLOCK_FOUND',
      minerId: winner.id,
      minerName: winner.name,
      block: newBlock,
      chainLength: winner.chain.length,
      totalNetworkBlocks,
      timestamp: Date.now(),
    });

    const totalHashRate = this.miners.reduce((acc, m) => acc + m.hashRate, 0);
    const nextWaitSec = samplePoissonNextBlockWaitTime(totalHashRate, this.difficulty);
    this.nextBlockTime = now + nextWaitSec * 1000;
  }

  private finishFallbackRace() {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    this.isFallbackRunning = false;

    const outcome = evaluateRaceOutcome(this.miners, this.durationSec, this.difficulty);

    this.emitEvent({
      type: 'RACE_FINISHED',
      outcome,
      finalMiners: this.miners,
      timestamp: Date.now(),
    });
  }
}
