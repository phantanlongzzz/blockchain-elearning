// Web Worker script for multi-threaded Proof of Work mining race
// Self-contained NIST FIPS 180-4 SHA-256 high-throughput hashing engine

export interface MinerWorkerStartConfig {
  minerId: string;
  headerPrefix: string;
  startNonce: number;
  step: number;
  targetPrefix: string;
  speedThrottleMs?: number;
  batchSize?: number;
  startAttempts?: number;
  continuous?: boolean;
}

export type MinerWorkerIncomingMessage =
  | { type: 'START'; config: MinerWorkerStartConfig }
  | { type: 'UPDATE_BLOCK'; headerPrefix: string; targetPrefix: string }
  | { type: 'STOP' };

export type MinerWorkerOutgoingMessage =
  | {
      type: 'TELEMETRY';
      minerId: string;
      currentNonce: number;
      attempts: number;
      currentHash: string;
      hashrate: number;
      measuredHashrateKHz?: number;
    }
  | {
      type: 'VALID_HASH';
      minerId: string;
      nonce: number;
      hash: string;
      attempts: number;
      timeMs: number;
      batchAttempts?: number;
      hashrate?: number;
      measuredHashrateKHz?: number;
    }
  | {
      type: 'WINNER';
      minerId: string;
      nonce: number;
      hash: string;
      attempts: number;
      timeMs: number;
      batchAttempts?: number;
      hashrate?: number;
      measuredHashrateKHz?: number;
    };

export function createMiningWorkerBlob(): string {
  const workerSource = `
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    function rotr(n, x) {
      return ((x >>> n) | (x << (32 - n))) >>> 0;
    }

    const FAST_W = new Uint32Array(64);

    // High performance pure JavaScript SHA-256 for ASCII headers
    function sha256Hex(str) {
      const len = str.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = str.charCodeAt(i) & 0xff;
      }
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

    let isRunning = false;
    let currentConfig = null;
    let nonce = 0;
    let attempts = 0;
    let startAttempts = 0;
    let startTime = 0;
    let lastReportTime = 0;
    let lastReportAttempts = 0;
    let smoothHashrate = 0;
    let headerPrefix = '';
    let targetPrefix = '';
    let minerId = '';
    let batchSize = 100;
    let speedThrottleMs = 10;
    let step = 1;

    self.onmessage = function(e) {
      const msg = e.data;
      if (!msg) return;

      if (msg.type === 'START') {
        isRunning = true;
        currentConfig = msg.config;
        minerId = currentConfig.minerId;
        headerPrefix = currentConfig.headerPrefix;
        targetPrefix = currentConfig.targetPrefix;
        step = currentConfig.step || 1;
        batchSize = Math.max(20, currentConfig.batchSize || 100);
        speedThrottleMs = currentConfig.speedThrottleMs !== undefined ? currentConfig.speedThrottleMs : 10;

        nonce = currentConfig.startNonce || 0;
        attempts = currentConfig.startAttempts || 0;
        startAttempts = attempts;
        startTime = performance.now();
        lastReportTime = startTime;
        lastReportAttempts = attempts;
        smoothHashrate = 0;

        // Immediately compute one hash and emit instant initial telemetry
        const initHash = sha256Hex(headerPrefix + nonce + ':' + minerId);
        self.postMessage({
          type: 'TELEMETRY',
          minerId: minerId,
          currentNonce: nonce,
          attempts: attempts,
          currentHash: initHash,
          hashrate: Math.round((batchSize / Math.max(speedThrottleMs + 1, 5)) * 1000),
          measuredHashrateKHz: ((batchSize / Math.max(speedThrottleMs + 1, 5)) * 1000) / 1000
        });

        function mineBatch() {
          if (!isRunning) return;

          let lastHash = '';
          for (let i = 0; i < batchSize; i++) {
            nonce += step;
            attempts++;
            const headerString = headerPrefix + nonce + ':' + minerId;
            lastHash = sha256Hex(headerString);

            if (lastHash.startsWith(targetPrefix)) {
              const elapsedSec = (performance.now() - startTime) / 1000;
              const finalHashrate = Math.round((attempts - startAttempts) / Math.max(elapsedSec, 0.001));
              
              isRunning = false;
              self.postMessage({
                type: 'WINNER',
                minerId: minerId,
                nonce: nonce,
                hash: lastHash,
                attempts: attempts,
                timeMs: performance.now() - startTime,
                batchAttempts: attempts - startAttempts,
                hashrate: finalHashrate,
                measuredHashrateKHz: finalHashrate / 1000
              });
              return;
            }
          }

          const now = performance.now();
          if (now - lastReportTime >= 90) {
            const deltaSec = (now - lastReportTime) / 1000;
            const deltaAttempts = attempts - lastReportAttempts;
            const instHashrate = deltaSec > 0.01
              ? Math.round(deltaAttempts / deltaSec)
              : Math.round((attempts - startAttempts) / Math.max((now - startTime) / 1000, 0.001));
            
            smoothHashrate = smoothHashrate === 0 
              ? instHashrate 
              : Math.round(0.65 * instHashrate + 0.35 * smoothHashrate);

            lastReportTime = now;
            lastReportAttempts = attempts;

            self.postMessage({
              type: 'TELEMETRY',
              minerId: minerId,
              currentNonce: nonce,
              attempts: attempts,
              currentHash: lastHash,
              hashrate: Math.max(smoothHashrate, 50),
              measuredHashrateKHz: Math.max(smoothHashrate, 50) / 1000
            });
          }

          if (isRunning) {
            setTimeout(mineBatch, speedThrottleMs);
          }
        }

        mineBatch();
      } else if (msg.type === 'UPDATE_BLOCK') {
        headerPrefix = msg.headerPrefix || headerPrefix;
        targetPrefix = msg.targetPrefix || targetPrefix;
      } else if (msg.type === 'STOP') {
        isRunning = false;
      }
    };
  `;

  const blob = new Blob([workerSource], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}
