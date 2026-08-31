/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Miner, MinerPoolPreset, RaceOutcome } from '../types';

/**
 * Predefined fixed list of 8 canonical miners (Requirement 7: Alice, Bob, Charlie, Dave, Eve, Frank, Grace, Heidi)
 */
export const FIXED_MINER_PRESETS: MinerPoolPreset[] = [
  {
    name: 'Alice',
    avatarColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    rigTypeVi: 'Máy CPU (Hiệu suất cơ bản)',
    rigTypeEn: 'CPU Rig (Standard)',
    minHashRate: 180,
    maxHashRate: 240,
  },
  {
    name: 'Bob',
    avatarColor: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    rigTypeVi: 'Máy GPU (Tối ưu thuật toán)',
    rigTypeEn: 'GPU Rig (Optimized)',
    minHashRate: 260,
    maxHashRate: 360,
  },
  {
    name: 'Charlie',
    avatarColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    rigTypeVi: 'Máy ASIC (Chuyên dụng tốc độ cao)',
    rigTypeEn: 'ASIC Rig (High Speed)',
    minHashRate: 380,
    maxHashRate: 500,
  },
  {
    name: 'Dave',
    avatarColor: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    rigTypeVi: 'Mảng chip FPGA',
    rigTypeEn: 'FPGA Array Rig',
    minHashRate: 220,
    maxHashRate: 320,
  },
  {
    name: 'Eve',
    avatarColor: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
    rigTypeVi: 'Cụm Cloud Mining',
    rigTypeEn: 'Cloud Hash Cluster',
    minHashRate: 300,
    maxHashRate: 440,
  },
  {
    name: 'Frank',
    avatarColor: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    rigTypeVi: 'Trang trại đào công nghiệp',
    rigTypeEn: 'Industrial Mine Farm',
    minHashRate: 340,
    maxHashRate: 480,
  },
  {
    name: 'Grace',
    avatarColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50',
    rigTypeVi: 'Trung tâm dữ liệu Hydro',
    rigTypeEn: 'Hydro Data Center',
    minHashRate: 250,
    maxHashRate: 390,
  },
  {
    name: 'Heidi',
    avatarColor: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
    rigTypeVi: 'Node lượng tử thử nghiệm',
    rigTypeEn: 'Experimental Node',
    minHashRate: 290,
    maxHashRate: 420,
  },
];

/**
 * Pure function: Calculates the theoretical probability of a miner finding a block
 * P ∝ (hashRate_miner / totalHashRate) * (1 / difficultyScaling)
 */
export function calculateMiningProbability(
  minerHashRate: number,
  totalHashRate: number,
  difficulty: number
): number {
  if (totalHashRate <= 0) return 0;
  const minerShare = minerHashRate / totalHashRate;
  const difficultyFactor = 1 / Math.pow(2, difficulty);
  return minerShare * difficultyFactor;
}

/**
 * Calculates expected average inter-arrival time in seconds based on difficulty & hash rate
 * - Difficulty 1: ~ 4.0s
 * - Difficulty 2: ~ 8.0s
 * - Difficulty 3: ~ 16.0s
 * - Difficulty 4: ~ 32.0s
 */
export function calculateExpectedBlockTimeSec(totalHashRate: number, difficulty: number): number {
  const baseTargetSec = 2.0;
  const difficultyMultiplier = Math.pow(2.0, difficulty);
  const normalizedHashFactor = 800 / Math.max(200, totalHashRate);
  return baseTargetSec * difficultyMultiplier * normalizedHashFactor;
}

/**
 * Poisson Process Sample:
 * Computes inter-arrival wait time (in seconds) using an Exponential Distribution:
 * waitTime = -ln(U) * meanWaitTime
 * where U ~ Uniform(0, 1) and meanWaitTime = expectedBlockTime(totalHashRate, difficulty)
 */
export function samplePoissonNextBlockWaitTime(totalHashRate: number, difficulty: number): number {
  const meanSec = calculateExpectedBlockTimeSec(totalHashRate, difficulty);
  // Avoid Math.log(0) by ensuring u in (0, 1]
  const u = Math.max(0.0001, Math.random());
  const sampledWaitSec = -Math.log(u) * meanSec;
  // Bound to reasonable simulation range: min 0.5s, max 4x mean
  return Math.max(0.6, Math.min(sampledWaitSec, meanSec * 3.5));
}

/**
 * Stochastic Miner Selection:
 * Selects the winning miner proportionally to their hash rate share:
 * P(miner_i) = hashRate_i / totalHashRate
 * NO hardcoded winner, NO round-robin.
 */
export function selectWinningMiner(miners: { id: string; hashRate: number }[]): string {
  const totalHashRate = miners.reduce((acc, m) => acc + m.hashRate, 0);
  if (totalHashRate <= 0 || miners.length === 0) {
    return miners[0]?.id || '';
  }

  const randomPoint = Math.random() * totalHashRate;
  let cumulative = 0;

  for (const miner of miners) {
    cumulative += miner.hashRate;
    if (randomPoint <= cumulative) {
      return miner.id;
    }
  }

  return miners[miners.length - 1].id;
}

/**
 * Helper to re-normalize power percentage across active miners
 */
export function normalizeMinersPower(miners: Miner[]): Miner[] {
  const totalHash = miners.reduce((acc, m) => acc + m.hashRate, 0);
  if (totalHash <= 0) return miners;

  return miners.map((m) => ({
    ...m,
    powerPercent: Math.round((m.hashRate / totalHash) * 100),
  }));
}

/**
 * Pure factory: Generate initial miners (default 3: Alice, Bob, Charlie)
 */
export function createInitialMiners(count = 3): Miner[] {
  const clampedCount = Math.max(2, Math.min(count, FIXED_MINER_PRESETS.length));
  const rawMiners: Miner[] = [];

  for (let i = 0; i < clampedCount; i++) {
    const preset = FIXED_MINER_PRESETS[i];
    // Generate random hashRate within miner's range
    const hashRate =
      preset.minHashRate +
      Math.floor(Math.random() * (preset.maxHashRate - preset.minHashRate + 1));

    rawMiners.push({
      id: `miner-${preset.name.toLowerCase()}`,
      name: preset.name,
      avatarColor: preset.avatarColor,
      rigTypeVi: preset.rigTypeVi,
      rigTypeEn: preset.rigTypeEn,
      hashRate,
      powerPercent: 0,
      currentGuess: Math.floor(Math.random() * 5000),
      currentHash: '',
      attempts: 0,
      chain: [],
      status: 'idle',
    });
  }

  return normalizeMinersPower(rawMiners);
}

/**
 * Pure function: Add next miner from the fixed 8-name sequence
 */
export function addMiner(currentMiners: Miner[]): Miner[] {
  if (currentMiners.length >= FIXED_MINER_PRESETS.length) {
    return currentMiners;
  }

  const nextIndex = currentMiners.length;
  const preset = FIXED_MINER_PRESETS[nextIndex];
  const hashRate =
    preset.minHashRate +
    Math.floor(Math.random() * (preset.maxHashRate - preset.minHashRate + 1));

  const newMiner: Miner = {
    id: `miner-${preset.name.toLowerCase()}`,
    name: preset.name,
    avatarColor: preset.avatarColor,
    rigTypeVi: preset.rigTypeVi,
    rigTypeEn: preset.rigTypeEn,
    hashRate,
    powerPercent: 0,
    currentGuess: Math.floor(Math.random() * 5000) + nextIndex * 1000,
    currentHash: '',
    attempts: 0,
    chain: [],
    status: 'idle',
  };

  return normalizeMinersPower([...currentMiners, newMiner]);
}

/**
 * Pure function: Remove last miner (minimum 2 miners maintained)
 */
export function removeMiner(currentMiners: Miner[]): Miner[] {
  if (currentMiners.length <= 2) {
    return currentMiners;
  }
  return normalizeMinersPower(currentMiners.slice(0, -1));
}

/**
 * Evaluates race outcome, strictly handling ties (Requirement 4)
 * If 2 or more miners share the maximum chain length, declare a tie without picking an arbitrary winner.
 */
export function evaluateRaceOutcome(
  miners: Miner[],
  durationSec: number,
  difficulty: number
): RaceOutcome {
  const totalBlocksMined = miners.reduce((acc, m) => acc + m.chain.length, 0);

  if (totalBlocksMined === 0) {
    return {
      isTie: false,
      tiedMinerNames: [],
      winner: null,
      winnerChainLength: 0,
      totalBlocksMined: 0,
      durationSec,
      difficulty,
      summaryMessageVi: 'Hết thời gian! Chưa có miner nào tìm thấy block hợp lệ theo độ khó yêu cầu.',
      summaryMessageEn: 'Time expired! No miner found a valid block for the requested difficulty.',
    };
  }

  // Find max chain length
  let maxLength = 0;
  for (const m of miners) {
    if (m.chain.length > maxLength) {
      maxLength = m.chain.length;
    }
  }

  // Find all miners sharing the longest chain
  const topMiners = miners.filter((m) => m.chain.length === maxLength);

  if (topMiners.length > 1) {
    const tiedNames = topMiners.map((m) => m.name);
    const namesStr = tiedNames.join(' & ');
    return {
      isTie: true,
      tiedMinerNames: tiedNames,
      winner: null,
      winnerChainLength: maxLength,
      totalBlocksMined,
      durationSec,
      difficulty,
      summaryMessageVi: `Có ${topMiners.length} chuỗi đang cùng dài (${namesStr} đều đạt ${maxLength} blocks), mạng chưa có người thắng duy nhất! Cần thêm block để phá vỡ fork.`,
      summaryMessageEn: `${topMiners.length} chains have the same length (${namesStr} both at ${maxLength} blocks). The network has no single winner yet!`,
    };
  }

  const soleWinner = topMiners[0];
  return {
    isTie: false,
    tiedMinerNames: [],
    winner: soleWinner,
    winnerChainLength: maxLength,
    totalBlocksMined,
    durationSec,
    difficulty,
    summaryMessageVi: `🏆 ${soleWinner.name} chiến thắng với chuỗi dài nhất: ${maxLength} block(s)!`,
    summaryMessageEn: `🏆 ${soleWinner.name} won with the longest chain: ${maxLength} block(s)!`,
  };
}
