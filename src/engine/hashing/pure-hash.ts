/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlockHeader } from '../types';

// NIST Initial Round Constants
const K: number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

// NIST Initial State
const INITIAL_H: number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

function rotr(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function ch(x: number, y: number, z: number): number {
  return ((x & y) ^ (~x & z)) >>> 0;
}

function maj(x: number, y: number, z: number): number {
  return ((x & y) ^ (x & z) ^ (y & z)) >>> 0;
}

function sigma0(x: number): number {
  return (rotr(2, x) ^ rotr(13, x) ^ rotr(22, x)) >>> 0;
}

function sigma1(x: number): number {
  return (rotr(6, x) ^ rotr(11, x) ^ rotr(25, x)) >>> 0;
}

function gamma0(x: number): number {
  return (rotr(7, x) ^ rotr(18, x) ^ (x >>> 3)) >>> 0;
}

function gamma1(x: number): number {
  return (rotr(17, x) ^ rotr(19, x) ^ (x >>> 10)) >>> 0;
}

/**
 * Converts a UTF-8 string to Uint8Array bytes
 */
export function stringToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Converts bytes array to hex string
 */
export function bytesToHex(bytes: Uint8Array | number[]): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Pure synchronous SHA-256 implementation (NIST FIPS 180-4 compliant)
 */
export function sha256Sync(input: string | Uint8Array): string {
  const msgBytes = typeof input === 'string' ? stringToBytes(input) : input;
  const msgLen = msgBytes.length;
  const bitLen = msgLen * 8;

  // Pre-processing: padding
  // Pad with 0x80, then k zeroes, then 64-bit big-endian integer bitLen
  // Total length must be multiple of 64 bytes (512 bits)
  const padLen = (msgLen % 64 < 56) ? 56 - (msgLen % 64) : 120 - (msgLen % 64);
  const totalLen = msgLen + padLen + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(msgBytes, 0);
  padded[msgLen] = 0x80;

  // Append length in bits as 64-bit big-endian
  const view = new DataView(padded.buffer);
  view.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(totalLen - 4, bitLen >>> 0, false);

  // Hash state
  let [h0, h1, h2, h3, h4, h5, h6, h7] = INITIAL_H;

  const w = new Uint32Array(64);

  // Process 512-bit (64-byte) blocks
  for (let offset = 0; offset < totalLen; offset += 64) {
    // Prepare 64 message words
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = gamma0(w[i - 15]);
      const s1 = gamma1(w[i - 2]);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = [h0, h1, h2, h3, h4, h5, h6, h7];

    for (let i = 0; i < 64; i++) {
      const t1 = (h + sigma1(e) + ch(e, f, g) + K[i] + w[i]) >>> 0;
      const t2 = (sigma0(a) + maj(a, b, c)) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  // Construct 32-byte hash
  const outBuffer = new Uint8Array(32);
  const outView = new DataView(outBuffer.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);

  return bytesToHex(outBuffer);
}

/**
 * Pure function: Computes block hash from BlockHeader
 */
export function hashBlock(header: BlockHeader): string {
  const headerString = `${header.version}|${header.blockNumber}|${header.previousHash}|${header.merkleRoot}|${header.timestamp}|${header.difficulty}|${header.nonce}|${header.minerId}`;
  return sha256Sync(headerString);
}

/**
 * Checks if a hash satisfies the difficulty constraint (e.g., starts with targetPrefix '0' * difficulty)
 */
export function verifyBlockHash(hash: string, difficulty: number): boolean {
  const prefix = '0'.repeat(Math.max(1, difficulty));
  return hash.startsWith(prefix);
}

/**
 * Pure function: Search for a valid nonce satisfying difficulty
 */
export function findValidNonce(
  headerWithoutNonce: Omit<BlockHeader, 'nonce'>,
  difficulty: number,
  startNonce = 0,
  maxAttempts = 50000
): { found: boolean; nonce: number; hash: string; attempts: number } {
  const targetPrefix = '0'.repeat(Math.max(1, difficulty));
  let nonce = startNonce;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const fullHeader: BlockHeader = { ...headerWithoutNonce, nonce };
    const hash = hashBlock(fullHeader);
    attempts++;

    if (hash.startsWith(targetPrefix)) {
      return { found: true, nonce, hash, attempts };
    }
    nonce++;
  }

  return { found: false, nonce, hash: '', attempts };
}
