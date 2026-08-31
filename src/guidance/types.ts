/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StepState =
  | 'LOCKED'
  | 'AVAILABLE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'NEXT_STEP_READY';

export interface StepGuidanceInfo {
  stepId: string;
  stepNumber?: number;
  titleVi: string;
  titleEn: string;
  state: StepState;
  completedSummaryVi?: string;
  completedSummaryEn?: string;
  nextActionLabelVi?: string;
  nextActionLabelEn?: string;
  nextStepId?: string;
}

export interface NextStepGuidanceState {
  currentStepId: string | null;
  stepState: StepState;
  lastCompletedActionVi: string | null;
  lastCompletedActionEn: string | null;
  nextRecommendedActionVi: string | null;
  nextRecommendedActionEn: string | null;
  nextActionTargetId: string | null;
  completedTimestamp: number | null;
}
