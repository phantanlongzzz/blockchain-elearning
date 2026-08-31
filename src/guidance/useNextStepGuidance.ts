/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { StepState, NextStepGuidanceState } from './types';

export interface UseNextStepGuidanceOptions {
  initialState?: StepState;
  initialStepId?: string;
  autoClearCompletedDelayMs?: number;
}

export function useNextStepGuidance(options: UseNextStepGuidanceOptions = {}) {
  const [stepState, setStepState] = useState<StepState>(options.initialState || 'AVAILABLE');
  const [currentStepId, setCurrentStepId] = useState<string | null>(options.initialStepId || null);
  const [lastCompletedActionVi, setLastCompletedActionVi] = useState<string | null>(null);
  const [lastCompletedActionEn, setLastCompletedActionEn] = useState<string | null>(null);
  const [nextRecommendedActionVi, setNextRecommendedActionVi] = useState<string | null>(null);
  const [nextRecommendedActionEn, setNextRecommendedActionEn] = useState<string | null>(null);
  const [nextActionTargetId, setNextActionTargetId] = useState<string | null>(null);
  const [completedTimestamp, setCompletedTimestamp] = useState<number | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  /**
   * Triggers an action completion event:
   * 1. Records what just completed (summary).
   * 2. Sets next action recommendation.
   * 3. Transitions state from COMPLETED to NEXT_STEP_READY.
   */
  const triggerStepCompleted = useCallback(
    (params: {
      completedSummaryVi: string;
      completedSummaryEn: string;
      nextActionVi?: string;
      nextActionEn?: string;
      nextStepId?: string;
    }) => {
      setLastCompletedActionVi(params.completedSummaryVi);
      setLastCompletedActionEn(params.completedSummaryEn);
      setNextRecommendedActionVi(params.nextActionVi || null);
      setNextRecommendedActionEn(params.nextActionEn || null);
      setNextActionTargetId(params.nextStepId || null);
      setCompletedTimestamp(Date.now());
      setStepState('NEXT_STEP_READY');
    },
    []
  );

  /**
   * Resets all guidance and completion markers (e.g. when simulation restarts).
   */
  const resetGuidance = useCallback((newState: StepState = 'AVAILABLE') => {
    setStepState(newState);
    setLastCompletedActionVi(null);
    setLastCompletedActionEn(null);
    setNextRecommendedActionVi(null);
    setNextRecommendedActionEn(null);
    setNextActionTargetId(null);
    setCompletedTimestamp(null);
  }, []);

  /**
   * Acknowledges the transition into the next step, transitioning state to IN_PROGRESS or AVAILABLE.
   */
  const startNextStep = useCallback((newStepId?: string) => {
    if (newStepId) setCurrentStepId(newStepId);
    setStepState('IN_PROGRESS');
    setLastCompletedActionVi(null);
    setLastCompletedActionEn(null);
    setNextRecommendedActionVi(null);
    setNextRecommendedActionEn(null);
    setNextActionTargetId(null);
    setCompletedTimestamp(null);
  }, []);

  /**
   * Utility helper to get button class names based on whether it is the currently recommended next action.
   */
  const getCtaGuidanceClasses = useCallback(
    (isNextTarget: boolean) => {
      if (!isNextTarget || stepState !== 'NEXT_STEP_READY') {
        return '';
      }

      if (isReducedMotion) {
        return 'ring-2 ring-amber-400 bg-amber-500/20 text-amber-200 border-amber-400/80';
      }

      return 'guidance-amber-pulse ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.28)] border-amber-400';
    },
    [stepState, isReducedMotion]
  );

  const guidanceSnapshot: NextStepGuidanceState = {
    currentStepId,
    stepState,
    lastCompletedActionVi,
    lastCompletedActionEn,
    nextRecommendedActionVi,
    nextRecommendedActionEn,
    nextActionTargetId,
    completedTimestamp,
  };

  return {
    stepState,
    setStepState,
    currentStepId,
    setCurrentStepId,
    isReadyForNext: stepState === 'NEXT_STEP_READY',
    isReducedMotion,
    lastCompletedActionVi,
    lastCompletedActionEn,
    nextRecommendedActionVi,
    nextRecommendedActionEn,
    nextActionTargetId,
    completedTimestamp,
    triggerStepCompleted,
    resetGuidance,
    startNextStep,
    getCtaGuidanceClasses,
    guidanceSnapshot,
  };
}
