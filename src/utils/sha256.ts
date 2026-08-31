import { HashResult, DetailedSha256Breakdown, RoundState } from '../types';
import { hexToBinary, bytesToHex, stringToUtf8Bytes, uint32ToHex } from './binary';

// NIST Initial Hash Values (fractional parts of square roots of first 8 primes 2..19)
export const INITIAL_H = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

// NIST Round Constants (fractional parts of cube roots of first 64 primes 2..311)
export const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

// 32-bit Right Rotation
function rotr(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

// SHA-256 logical functions
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
 * Standard Web Crypto API SHA-256 Hasher
 */
export async function hashSha256(input: string | Uint8Array): Promise<HashResult> {
  const startTime = performance.now();
  const bytes = typeof input === 'string' ? stringToUtf8Bytes(input) : input;
  const inputString = typeof input === 'string' ? input : '[Raw Binary Data]';
  
  const buffer = await crypto.subtle.digest('SHA-256', bytes);
  const hashArray = Array.from(new Uint8Array(buffer));
  const hex = bytesToHex(hashArray);
  const binary = hexToBinary(hex);
  const calcTime = performance.now() - startTime;

  return {
    input: inputString,
    hex,
    binary,
    bytes: hashArray,
    inputBytes: bytes.length,
    inputBits: bytes.length * 8,
    calculationTimeMs: Number(calcTime.toFixed(3)),
  };
}

/**
 * Pure JavaScript NIST FIPS 180-4 SHA-256 Engine with Detailed Round State Breakdown
 */
export function computeDetailedSha256(input: string | Uint8Array): DetailedSha256Breakdown {
  const msgBytes = typeof input === 'string' ? stringToUtf8Bytes(input) : input;
  const originalByteLength = msgBytes.length;
  const originalBitLength = originalByteLength * 8;

  // 1. Padding: Append bit '1' (0x80 byte), then zeros, then 64-bit big-endian length
  // Target total length in bytes must be a multiple of 64 (512 bits)
  let kZeros = 0;
  while ((originalByteLength + 1 + kZeros + 8) % 64 !== 0) {
    kZeros++;
  }

  const paddedLength = originalByteLength + 1 + kZeros + 8;
  const padded = new Uint8Array(paddedLength);
  padded.set(msgBytes, 0);
  padded[originalByteLength] = 0x80; // append 1 bit (10000000_2)
  // zeros are already initialized to 0

  // Append 64-bit bit length at the end (high 32 bits and low 32 bits)
  const highBitLen = Math.floor(originalBitLength / 0x100000000);
  const lowBitLen = originalBitLength >>> 0;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, highBitLen, false); // Big endian
  view.setUint32(paddedLength - 4, lowBitLen, false);

  // 2. Process in 512-bit (64-byte) blocks
  const blockCount = paddedLength / 64;
  let H = [...INITIAL_H];
  const blocksBreakdown: DetailedSha256Breakdown['blocks'] = [];

  for (let blockIdx = 0; blockIdx < blockCount; blockIdx++) {
    const blockOffset = blockIdx * 64;
    const blockWords: number[] = new Array(16);
    for (let i = 0; i < 16; i++) {
      blockWords[i] = view.getUint32(blockOffset + i * 4, false);
    }

    // Message schedule W[0..63]
    const W = new Array(64);
    for (let t = 0; t < 16; t++) {
      W[t] = blockWords[t];
    }
    for (let t = 16; t < 64; t++) {
      const s1 = gamma1(W[t - 2]);
      const s0 = gamma0(W[t - 15]);
      W[t] = (s1 + W[t - 7] + s0 + W[t - 16]) >>> 0;
    }

    // Initialize working variables with current hash state
    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];
    let f = H[5];
    let g = H[6];
    let h = H[7];

    const rounds: RoundState[] = [];

    // 64 compression rounds
    for (let t = 0; t < 64; t++) {
      const S1 = sigma1(e);
      const CH = ch(e, f, g);
      const temp1 = (h + S1 + CH + K[t] + W[t]) >>> 0;
      const S0 = sigma0(a);
      const MAJ = maj(a, b, c);
      const temp2 = (S0 + MAJ) >>> 0;

      rounds.push({
        round: t,
        a,
        b,
        c,
        d,
        e,
        f,
        g,
        h,
        w: W[t],
        k: K[t],
        t1: temp1,
        t2: temp2,
      });

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    // Intermediate block hash addition
    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;

    blocksBreakdown.push({
      blockIndex: blockIdx,
      w: W,
      rounds,
      finalIntermediateHash: [...H],
    });
  }

  const finalHex = H.map((w) => uint32ToHex(w)).join('');

  return {
    paddedMessageBytes: padded,
    paddedBitsLength: paddedLength * 8,
    originalBitsLength: originalBitLength,
    blockCount,
    blocks: blocksBreakdown,
    finalHashHex: finalHex,
  };
}

/**
 * Synchronous pure SHA-256 returning 32-byte Uint8Array
 */
export function sha256Sync(msg: Uint8Array): Uint8Array {
  const breakdown = computeDetailedSha256(msg);
  const hex = breakdown.finalHashHex;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16) || 0;
  }
  return bytes;
}

/**
 * Synchronous HMAC-SHA-256 (RFC 2104) returning 32-byte Uint8Array
 */
export function hmacSha256Sync(key: Uint8Array, msg: Uint8Array): Uint8Array {
  const blockSize = 64;
  let formattedKey = new Uint8Array(blockSize);

  if (key.length > blockSize) {
    const hashedKey = sha256Sync(key);
    formattedKey.set(hashedKey, 0);
  } else {
    formattedKey.set(key, 0);
  }

  const oPad = new Uint8Array(blockSize);
  const iPad = new Uint8Array(blockSize);

  for (let i = 0; i < blockSize; i++) {
    oPad[i] = formattedKey[i] ^ 0x5c;
    iPad[i] = formattedKey[i] ^ 0x36;
  }

  // Inner hash: SHA-256(iPad || msg)
  const innerMsg = new Uint8Array(blockSize + msg.length);
  innerMsg.set(iPad, 0);
  innerMsg.set(msg, blockSize);
  const innerHash = sha256Sync(innerMsg);

  // Outer hash: SHA-256(oPad || innerHash)
  const outerMsg = new Uint8Array(blockSize + innerHash.length);
  outerMsg.set(oPad, 0);
  outerMsg.set(innerHash, blockSize);

  return sha256Sync(outerMsg);
}

// Reusable word buffers for fastSha256Hex to minimize garbage collection
const FAST_W = new Uint32Array(64);

/**
 * High-performance synchronous SHA-256 string hasher for Proof-of-Work loops
 */
export function fastSha256Hex(input: string): string {
  const bytes = stringToUtf8Bytes(input);
  const byteLen = bytes.length;
  const bitLen = byteLen * 8;

  let kZeros = 0;
  while ((byteLen + 1 + kZeros + 8) % 64 !== 0) {
    kZeros++;
  }

  const paddedLen = byteLen + 1 + kZeros + 8;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes, 0);
  padded[byteLen] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const blockCount = paddedLen / 64;
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  for (let b = 0; b < blockCount; b++) {
    const offset = b * 64;
    for (let i = 0; i < 16; i++) {
      FAST_W[i] = view.getUint32(offset + i * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = (rotr(7, FAST_W[t - 15]) ^ rotr(18, FAST_W[t - 15]) ^ (FAST_W[t - 15] >>> 3)) >>> 0;
      const s1 = (rotr(17, FAST_W[t - 2]) ^ rotr(19, FAST_W[t - 2]) ^ (FAST_W[t - 2] >>> 10)) >>> 0;
      FAST_W[t] = (FAST_W[t - 16] + s0 + FAST_W[t - 7] + s1) >>> 0;
    }

    let a = h0, bVal = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = (rotr(6, e) ^ rotr(11, e) ^ rotr(25, e)) >>> 0;
      const chVal = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + S1 + chVal + K[t] + FAST_W[t]) >>> 0;
      const S0 = (rotr(2, a) ^ rotr(13, a) ^ rotr(22, a)) >>> 0;
      const majVal = ((a & bVal) ^ (a & c) ^ (bVal & c)) >>> 0;
      const temp2 = (S0 + majVal) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = bVal;
      bVal = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + bVal) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return (
    h0.toString(16).padStart(8, '0') +
    h1.toString(16).padStart(8, '0') +
    h2.toString(16).padStart(8, '0') +
    h3.toString(16).padStart(8, '0') +
    h4.toString(16).padStart(8, '0') +
    h5.toString(16).padStart(8, '0') +
    h6.toString(16).padStart(8, '0') +
    h7.toString(16).padStart(8, '0')
  );
}

