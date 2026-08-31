/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PowWorkerCommand,
  PowEngineEvent,
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

const GENESIS_BLOCK_HASH = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';

class MinerWorkerEngine {
  private isRunning = false;
  private durationSec = 30;
  private difficulty = 2;
  private miners: Miner[] = [];
  private runId = 0;

  private startTime = 0;
  private lastTickTime = 0;
  private lastTelemetryTime = 0;
  private nextBlockTime = 0;
  private timerHandle: any = null;

  // Global longest chain head hash
  private currentPreviousHash = GENESIS_BLOCK_HASH;
  private globalBlockHeight = 0;

  public handleCommand(cmd: PowWorkerCommand) {
    switch (cmd.type) {
      case 'START_RACE':
        this.startRace(cmd.config);
        break;
      case 'STOP_RACE':
        this.stopRace();
        break;
      case 'UPDATE_MINERS':
        this.miners = cmd.miners;
        break;
      case 'UPDATE_DIFFICULTY':
        this.difficulty = cmd.difficulty;
        break;
    }
  }

  private postEvent(event: PowEngineEvent) {
    self.postMessage(event);
  }

  private startRace(config: {
    durationSec: number;
    difficulty: number;
    miners: Miner[];
    runId: number;
  }) {
    this.stopRace();

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
    this.isRunning = true;
    this.startTime = performance.now();
    this.lastTickTime = this.startTime;
    this.lastTelemetryTime = this.startTime;

    // Calculate total hash rate
    const totalHashRate = this.miners.reduce((acc, m) => acc + m.hashRate, 0);

    // Initial Poisson sample for first block arrival
    const initialWaitSec = samplePoissonNextBlockWaitTime(totalHashRate, this.difficulty);
    this.nextBlockTime = this.startTime + initialWaitSec * 1000;

    this.postEvent({
      type: 'MINING_STARTED',
      durationSec: this.durationSec,
      difficulty: this.difficulty,
      miners: this.miners,
      timestamp: Date.now(),
    });

    // Start simulation loop (runs at ~20-30Hz tick rate in worker)
    this.timerHandle = setInterval(() => this.loopStep(), 40);
  }

  private stopRace() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
    if (this.isRunning) {
      this.isRunning = false;
      this.miners = this.miners.map((m) => ({ ...m, status: 'stopped' }));
      this.postEvent({
        type: 'MINING_STOPPED',
        timestamp: Date.now(),
      });
    }
  }

  private loopStep() {
    if (!this.isRunning) return;

    const now = performance.now();
    const elapsedSec = (now - this.startTime) / 1000;
    const timeLeft = Math.max(0, Math.ceil(this.durationSec - elapsedSec));

    // Check if time expired
    if (elapsedSec >= this.durationSec) {
      this.finishRace();
      return;
    }

    const dt = Math.max(0.001, (now - this.lastTickTime) / 1000);
    this.lastTickTime = now;

    // Simulate batch attempts for each miner
    for (const miner of this.miners) {
      const hashesThisStep = Math.max(1, Math.round(miner.hashRate * dt));
      miner.attempts += hashesThisStep;
      miner.currentGuess = (miner.currentGuess + hashesThisStep) % 2147483647;
      
      // Periodically update preview hash for visual richness
      const candidatePayload = `${this.globalBlockHeight + 1}|${this.currentPreviousHash}|${miner.id}|${miner.currentGuess}|${this.runId}`;
      miner.currentHash = sha256Sync(candidatePayload);
    }

    // Check Poisson block arrival
    if (now >= this.nextBlockTime) {
      this.mineBlock(now);
    }

    // Throttled Batched Telemetry event every ~200ms
    if (now - this.lastTelemetryTime >= 200) {
      this.lastTelemetryTime = now;

      const batches: MinerTelemetryBatch[] = this.miners.map((m) => ({
        minerId: m.id,
        currentNonce: m.currentGuess,
        currentHash: m.currentHash,
        batchAttempts: Math.round(m.hashRate * 0.2),
        totalAttempts: m.attempts,
      }));

      this.postEvent({
        type: 'ATTEMPT',
        batches,
        timestamp: Date.now(),
      });

      this.postEvent({
        type: 'TICK',
        timeLeft,
        elapsedSec: Math.floor(elapsedSec),
      });
    }
  }

  private mineBlock(now: number) {
    if (this.miners.length === 0) return;

    // Select winner proportionally to miner's hash rate (Pure Poisson competition)
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

    // Update winner chain & previous hash
    winner.chain.push(newBlock);
    winner.status = 'won_block';
    this.currentPreviousHash = newBlock.hash;

    const totalNetworkBlocks = this.miners.reduce((acc, m) => acc + m.chain.length, 0);

    this.postEvent({
      type: 'BLOCK_FOUND',
      minerId: winner.id,
      minerName: winner.name,
      block: newBlock,
      chainLength: winner.chain.length,
      totalNetworkBlocks,
      timestamp: Date.now(),
    });

    // Schedule next Poisson block arrival
    const totalHashRate = this.miners.reduce((acc, m) => acc + m.hashRate, 0);
    const nextWaitSec = samplePoissonNextBlockWaitTime(totalHashRate, this.difficulty);
    this.nextBlockTime = now + nextWaitSec * 1000;
  }

  private finishRace() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
    this.isRunning = false;

    const outcome = evaluateRaceOutcome(this.miners, this.durationSec, this.difficulty);

    this.postEvent({
      type: 'RACE_FINISHED',
      outcome,
      finalMiners: this.miners,
      timestamp: Date.now(),
    });
  }
}

const engine = new MinerWorkerEngine();

self.onmessage = (e: MessageEvent<PowWorkerCommand>) => {
  engine.handleCommand(e.data);
};
