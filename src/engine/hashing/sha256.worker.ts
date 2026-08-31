/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sha256Sync, findValidNonce } from './pure-hash';
import type { BlockHeader } from '../types';

export interface Sha256WorkerRequest {
  id: string;
  type: 'HASH' | 'MINE_NONCE';
  payload: string | { headerWithoutNonce: Omit<BlockHeader, 'nonce'>; difficulty: number; startNonce?: number; maxAttempts?: number };
}

export interface Sha256WorkerResponse {
  id: string;
  type: 'HASH_RESULT' | 'MINE_NONCE_RESULT' | 'ERROR';
  result?: any;
  error?: string;
}

self.onmessage = (e: MessageEvent<Sha256WorkerRequest>) => {
  const { id, type, payload } = e.data;

  try {
    if (type === 'HASH') {
      const hash = sha256Sync(payload as string);
      self.postMessage({ id, type: 'HASH_RESULT', result: { hash } } as Sha256WorkerResponse);
    } else if (type === 'MINE_NONCE') {
      const p = payload as { headerWithoutNonce: Omit<BlockHeader, 'nonce'>; difficulty: number; startNonce?: number; maxAttempts?: number };
      const res = findValidNonce(p.headerWithoutNonce, p.difficulty, p.startNonce || 0, p.maxAttempts || 50000);
      self.postMessage({ id, type: 'MINE_NONCE_RESULT', result: res } as Sha256WorkerResponse);
    }
  } catch (err: any) {
    self.postMessage({ id, type: 'ERROR', error: err?.message || 'Worker hashing error' } as Sha256WorkerResponse);
  }
};
