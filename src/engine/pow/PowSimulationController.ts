/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { PowEngine } from './pow-engine';
import {
  Miner,
  MinedBlock,
  RaceOutcome,
  PowEngineEvent,
  PowSimulationConfig,
} from '../types';
import {
  createInitialMiners,
  addMiner as addMinerPure,
  removeMiner as removeMinerPure,
} from './pure-pow';
import { useProgressStore } from '../../stores/progressStore';

export interface UsePowSimulationReturn {
  // State
  miners: Miner[];
  isRacing: boolean;
  isGameOver: boolean;
  timeLeft: number;
  elapsedSec: number;
  durationSec: number;
  difficulty: number;
  raceOutcome: RaceOutcome | null;
  recentMinedToast: {
    minerName: string;
    blockNum: number;
    nonce: number;
  } | null;
  totalNetworkBlocks: number;
  totalNetworkHashrate: number;

  // Actions
  startRace: () => void;
  stopRace: () => void;
  resetRace: () => void;
  setDurationSec: (sec: number) => void;
  setDifficulty: (diff: number) => void;
  handleAddMiner: () => void;
  handleRemoveMiner: () => void;
  dismissToast: () => void;
}

export function usePowSimulation(initialMinersCount = 3): UsePowSimulationReturn {
  const [miners, setMiners] = useState<Miner[]>(() => createInitialMiners(initialMinersCount));
  const [durationSec, setDurationSecState] = useState<number>(30);
  const [difficulty, setDifficultyState] = useState<number>(2);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [raceOutcome, setRaceOutcome] = useState<RaceOutcome | null>(null);
  const [recentMinedToast, setRecentMinedToast] = useState<{
    minerName: string;
    blockNum: number;
    nonce: number;
  } | null>(null);

  const engineRef = useRef<PowEngine | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Initialize engine once
  useEffect(() => {
    const engine = new PowEngine();
    engineRef.current = engine;

    const unsubscribe = engine.onEvent((event: PowEngineEvent) => {
      switch (event.type) {
        case 'MINING_STARTED':
          setIsRacing(true);
          setIsGameOver(false);
          setRaceOutcome(null);
          setTimeLeft(event.durationSec);
          setElapsedSec(0);
          setMiners(event.miners);
          break;

        case 'ATTEMPT':
          // Batch telemetry update for all miners (No per-nonce setState)
          setMiners((prevMiners) =>
            prevMiners.map((m) => {
              const batch = event.batches.find((b) => b.minerId === m.id);
              if (!batch) return m;
              return {
                ...m,
                currentGuess: batch.currentNonce,
                currentHash: batch.currentHash,
                attempts: batch.totalAttempts,
                status: 'guessing',
              };
            })
          );
          break;

        case 'BLOCK_FOUND':
          // Progress mark: block discovered
          useProgressStore.getState().markLessonCompleted('proof-of-work');

          setMiners((prevMiners) =>
            prevMiners.map((m) =>
              m.id === event.minerId
                ? {
                    ...m,
                    chain: [...m.chain, event.block],
                    status: 'won_block',
                  }
                : m
            )
          );

          setRecentMinedToast({
            minerName: event.minerName,
            blockNum: event.block.blockNumber,
            nonce: event.block.nonce,
          });

          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          toastTimeoutRef.current = setTimeout(() => {
            setRecentMinedToast(null);
          }, 3500);
          break;

        case 'TICK':
          setTimeLeft(event.timeLeft);
          setElapsedSec(event.elapsedSec);
          break;

        case 'MINING_STOPPED':
          setIsRacing(false);
          setMiners((prev) => prev.map((m) => ({ ...m, status: 'stopped' })));
          break;

        case 'RACE_FINISHED':
          setIsRacing(false);
          setIsGameOver(true);
          setTimeLeft(0);
          setRaceOutcome(event.outcome);
          setMiners(event.finalMiners.map((m) => ({ ...m, status: 'stopped' })));
          useProgressStore.getState().markLessonCompleted('proof-of-work');
          break;
      }
    });

    return () => {
      unsubscribe();
      engine.destroy();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const startRace = useCallback(() => {
    if (!engineRef.current) return;
    const config: PowSimulationConfig = {
      durationSec,
      difficulty,
      miners,
      targetPrefix: '0'.repeat(difficulty),
      runId: Date.now(),
    };
    engineRef.current.startRace(config);
  }, [durationSec, difficulty, miners]);

  const stopRace = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.stopRace();
  }, []);

  const resetRace = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stopRace();
    }
    setIsRacing(false);
    setIsGameOver(false);
    setRaceOutcome(null);
    setTimeLeft(durationSec);
    setElapsedSec(0);
    setRecentMinedToast(null);
    setMiners((prev) =>
      prev.map((m) => ({
        ...m,
        chain: [],
        attempts: 0,
        currentHash: '',
        status: 'idle',
      }))
    );
  }, [durationSec]);

  const setDurationSec = useCallback(
    (sec: number) => {
      if (isRacing) return;
      setDurationSecState(sec);
      setTimeLeft(sec);
    },
    [isRacing]
  );

  const setDifficulty = useCallback(
    (diff: number) => {
      setDifficultyState(diff);
      if (engineRef.current) {
        engineRef.current.updateDifficulty(diff);
      }
    },
    []
  );

  const handleAddMiner = useCallback(() => {
    if (isRacing) return;
    setMiners((prev) => {
      const updated = addMinerPure(prev);
      if (engineRef.current) engineRef.current.updateMiners(updated);
      return updated;
    });
  }, [isRacing]);

  const handleRemoveMiner = useCallback(() => {
    if (isRacing) return;
    setMiners((prev) => {
      const updated = removeMinerPure(prev);
      if (engineRef.current) engineRef.current.updateMiners(updated);
      return updated;
    });
  }, [isRacing]);

  const dismissToast = useCallback(() => {
    setRecentMinedToast(null);
  }, []);

  const totalNetworkBlocks = miners.reduce((acc, m) => acc + m.chain.length, 0);
  const totalNetworkHashrate = miners.reduce((acc, m) => acc + m.hashRate, 0);

  return {
    miners,
    isRacing,
    isGameOver,
    timeLeft,
    elapsedSec,
    durationSec,
    difficulty,
    raceOutcome,
    recentMinedToast,
    totalNetworkBlocks,
    totalNetworkHashrate,
    startRace,
    stopRace,
    resetRace,
    setDurationSec,
    setDifficulty,
    handleAddMiner,
    handleRemoveMiner,
    dismissToast,
  };
}
