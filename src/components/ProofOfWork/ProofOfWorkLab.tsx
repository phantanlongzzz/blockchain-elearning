/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PowLesson } from './PowLesson';
import type { Miner, MinedBlock } from '../../engine/types';

export { PowLesson };
export type { Miner, MinedBlock };

export const ProofOfWorkLab: React.FC = () => {
  return <PowLesson />;
};
