/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type LessonStatus = 'locked' | 'in-progress' | 'completed';

export interface LessonProgress {
  lessonId: string;
  status: LessonStatus;
  completedAt?: number;
  quizScore?: number;
  lastVisitedAt: number;
}

export const ALL_LESSON_IDS = [
  'overview',
  'generator',
  'properties',
  'avalanche',
  'pipeline',
  'experiment',
  'data-structures',
  'block-architecture',
  'decentralization',
  'consensus-evolution',
  'transactions',
  'transaction-lifecycle',
  'proof-of-work',
  'proof-of-stake',
  'end-to-end',
  'ledger',
  'merkle-tree',
  'quiz',
  'academic',
] as const;

export type RegisteredLessonId = (typeof ALL_LESSON_IDS)[number];

const createDefaultProgressMap = (): Record<string, LessonProgress> => {
  const initialMap: Record<string, LessonProgress> = {};
  const now = Date.now();

  ALL_LESSON_IDS.forEach((id, index) => {
    initialMap[id] = {
      lessonId: id,
      // The first lesson (overview) is in-progress by default; subsequent lessons are ready to unlock
      status: index === 0 ? 'in-progress' : 'locked',
      lastVisitedAt: index === 0 ? now : 0,
    };
  });

  return initialMap;
};

export interface ProgressStoreState {
  progressMap: Record<string, LessonProgress>;
  
  // Actions
  markLessonVisited: (lessonId: string) => void;
  markLessonCompleted: (lessonId: string, quizScore?: number) => void;
  setLessonStatus: (lessonId: string, status: LessonStatus) => void;
  resetProgress: () => void;
  
  // Queries
  getLessonProgress: (lessonId: string) => LessonProgress;
  getTotalProgress: () => {
    completedCount: number;
    totalCount: number;
    percentage: number;
    lastVisitedLessonId: string;
  };
  getResumeLesson: () => {
    lessonId: string;
    moduleId: string;
  };
}

// Helper to map lesson ID to its parent module ID
export const LESSON_TO_MODULE_MAP: Record<string, string> = {
  overview: 'home',
  generator: 'hash',
  properties: 'hash',
  avalanche: 'hash',
  pipeline: 'hash',
  experiment: 'hash',
  'data-structures': 'theory',
  'block-architecture': 'theory',
  decentralization: 'theory',
  'consensus-evolution': 'theory',
  transactions: 'simulation',
  'transaction-lifecycle': 'simulation',
  'proof-of-work': 'simulation',
  'proof-of-stake': 'simulation',
  'end-to-end': 'simulation',
  ledger: 'blockchain',
  'merkle-tree': 'blockchain',
  quiz: 'blockchain',
  academic: 'blockchain',
};

export const useProgressStore = create<ProgressStoreState>()(
  persist(
    (set, get) => ({
      progressMap: createDefaultProgressMap(),

      markLessonVisited: (lessonId: string) => {
        const now = Date.now();
        set((state) => {
          const existing = state.progressMap[lessonId];
          // If already visited within last 5 seconds and not changing from locked, avoid re-triggering state update
          if (existing && existing.status !== 'locked' && (now - (existing.lastVisitedAt || 0) < 5000)) {
            return state;
          }

          const targetStatus: LessonStatus = existing?.status === 'completed' ? 'completed' : 'in-progress';

          return {
            progressMap: {
              ...state.progressMap,
              [lessonId]: {
                lessonId,
                ...(existing || {}),
                status: targetStatus,
                lastVisitedAt: now,
              },
            },
          };
        });
      },

      markLessonCompleted: (lessonId: string, quizScore?: number) => {
        const now = Date.now();
        set((state) => {
          const existing = state.progressMap[lessonId] || {
            lessonId,
            status: 'completed' as LessonStatus,
            lastVisitedAt: now,
          };

          // Also auto-unlock the next lesson in sequence if it was locked
          const currentIndex = ALL_LESSON_IDS.indexOf(lessonId as RegisteredLessonId);
          const nextLessonId =
            currentIndex >= 0 && currentIndex < ALL_LESSON_IDS.length - 1
              ? ALL_LESSON_IDS[currentIndex + 1]
              : null;

          const updatedMap = {
            ...state.progressMap,
            [lessonId]: {
              ...existing,
              status: 'completed' as LessonStatus,
              completedAt: now,
              quizScore: quizScore !== undefined ? quizScore : existing.quizScore,
              lastVisitedAt: now,
            },
          };

          if (nextLessonId && updatedMap[nextLessonId]?.status === 'locked') {
            updatedMap[nextLessonId] = {
              ...updatedMap[nextLessonId],
              status: 'in-progress',
            };
          }

          return { progressMap: updatedMap };
        });
      },

      setLessonStatus: (lessonId: string, status: LessonStatus) => {
        set((state) => {
          const existing = state.progressMap[lessonId] || {
            lessonId,
            status,
            lastVisitedAt: Date.now(),
          };

          return {
            progressMap: {
              ...state.progressMap,
              [lessonId]: {
                ...existing,
                status,
                ...(status === 'completed' ? { completedAt: Date.now() } : {}),
              },
            },
          };
        });
      },

      resetProgress: () => {
        set({ progressMap: createDefaultProgressMap() });
      },

      getLessonProgress: (lessonId: string) => {
        const state = get();
        return (
          state.progressMap[lessonId] || {
            lessonId,
            status: 'locked',
            lastVisitedAt: 0,
          }
        );
      },

      getTotalProgress: () => {
        const state = get();
        const map = state.progressMap;
        const totalCount = ALL_LESSON_IDS.length;
        let completedCount = 0;
        let mostRecentId = 'overview';
        let highestVisitedTime = 0;

        ALL_LESSON_IDS.forEach((id) => {
          const item = map[id];
          if (item?.status === 'completed') {
            completedCount++;
          }
          if (item?.lastVisitedAt && item.lastVisitedAt > highestVisitedTime) {
            highestVisitedTime = item.lastVisitedAt;
            mostRecentId = id;
          }
        });

        const percentage = Math.round((completedCount / totalCount) * 100);

        return {
          completedCount,
          totalCount,
          percentage,
          lastVisitedLessonId: mostRecentId,
        };
      },

      getResumeLesson: () => {
        const state = get();
        const map = state.progressMap;

        // 1. Find the latest visited lesson that is 'in-progress' (excluding 'overview' / home)
        let latestInProgressId: string | null = null;
        let latestInProgressTime = 0;

        // 2. Find the most recently visited lesson (excluding 'overview')
        let latestVisitedId: string | null = null;
        let latestVisitedTime = 0;

        ALL_LESSON_IDS.forEach((id) => {
          if (id === 'overview') return; // Skip homepage overview
          const item = map[id];
          if (!item) return;

          if (item.status === 'in-progress' && item.lastVisitedAt > latestInProgressTime) {
            latestInProgressTime = item.lastVisitedAt;
            latestInProgressId = id;
          }

          if (item.lastVisitedAt > latestVisitedTime) {
            latestVisitedTime = item.lastVisitedAt;
            latestVisitedId = id;
          }
        });

        // 3. If nothing in progress or visited beyond overview, find the first lesson that is not 'completed'
        let firstIncompleteId: string | null = null;
        for (const id of ALL_LESSON_IDS) {
          if (id === 'overview') continue;
          const item = map[id];
          if (!item || item.status !== 'completed') {
            firstIncompleteId = id;
            break;
          }
        }

        const targetId = latestInProgressId || latestVisitedId || firstIncompleteId || 'generator';
        const targetModule = LESSON_TO_MODULE_MAP[targetId] || 'hash';

        return {
          lessonId: targetId,
          moduleId: targetModule,
        };
      },
    }),
    {
      name: 'dlu_blockchain_learning_progress_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
