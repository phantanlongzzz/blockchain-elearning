/**
 * Monte Carlo Simulation Engine for Cryptographic Avalanche / Diffusion Verification
 * Performs controlled 1-bit input flips and measures Hamming distance distribution over N trials.
 */

export interface MonteCarloHistogramBin {
  binStart: number;
  binEnd: number;
  label: string;
  observedCount: number;
  observedPercent: number;
  theoreticalPercent: number;
}

export interface MonteCarloResult {
  totalSamples: number;
  observedMean: number;
  observedStdDev: number;
  minDistance: number;
  maxDistance: number;
  theoreticalMean: number;
  theoreticalStdDev: number;
  bins: MonteCarloHistogramBin[];
  executionTimeMs: number;
}

// Fast population count for 32-bit integer
function popcount32(n: number): number {
  let v = n - ((n >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

// Standard normal cumulative distribution function approximation (error < 7.5e-8)
function normalCdf(x: number, mean: number, std: number): number {
  const z = (x - mean) / std;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-0.5 * z * z);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

/**
 * Executes a Monte Carlo test for SHA-256 diffusion.
 * Yields progress periodically to keep the main thread smooth.
 */
export async function runAvalancheMonteCarlo(
  sampleSize: number,
  onProgress?: (completed: number, total: number) => void
): Promise<MonteCarloResult> {
  const startTime = performance.now();
  const distances = new Uint16Array(sampleSize);

  const CHUNK_SIZE = 50; // Batch size before yielding to event loop
  let completed = 0;

  while (completed < sampleSize) {
    const chunkLimit = Math.min(completed + CHUNK_SIZE, sampleSize);
    
    // Run chunk
    for (let i = completed; i < chunkLimit; i++) {
      // 1. Generate random 32-byte input stream
      const msgA = new Uint8Array(32);
      crypto.getRandomValues(msgA);

      // 2. Clone input stream and flip exactly 1 random bit
      const msgB = new Uint8Array(msgA);
      const byteIdx = Math.floor(Math.random() * 32);
      const bitIdx = Math.floor(Math.random() * 8);
      msgB[byteIdx] ^= (1 << bitIdx);

      // 3. Hash both inputs using native crypto.subtle
      const [bufA, bufB] = await Promise.all([
        crypto.subtle.digest('SHA-256', msgA),
        crypto.subtle.digest('SHA-256', msgB),
      ]);

      // 4. Calculate exact Hamming distance using 32-bit word popcount
      const u32A = new Uint32Array(bufA);
      const u32B = new Uint32Array(bufB);
      let dist = 0;
      for (let w = 0; w < 8; w++) {
        dist += popcount32((u32A[w] ^ u32B[w]) >>> 0);
      }
      distances[i] = dist;
    }

    completed = chunkLimit;
    if (onProgress) {
      onProgress(completed, sampleSize);
    }

    // Yield to keep UI responsive
    if (completed < sampleSize) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  // Calculate descriptive statistics
  let sum = 0;
  let min = 256;
  let max = 0;
  for (let i = 0; i < sampleSize; i++) {
    const d = distances[i];
    sum += d;
    if (d < min) min = d;
    if (d > max) max = d;
  }
  const observedMean = sum / sampleSize;

  let varianceSum = 0;
  for (let i = 0; i < sampleSize; i++) {
    const diff = distances[i] - observedMean;
    varianceSum += diff * diff;
  }
  const observedStdDev = sampleSize > 1 ? Math.sqrt(varianceSum / (sampleSize - 1)) : 0;

  // Theoretical Binomial B(256, 0.5) parameters
  const theoreticalMean = 128;
  const theoreticalStdDev = 8; // sqrt(256 * 0.5 * 0.5) = 8

  // Binning: create 14 bins around mean (width = 4)
  // Bins: [<104, 104-107, 108-111, 112-115, 116-119, 120-123, 124-127, 128-131, 132-135, 136-139, 140-143, 144-147, 148-151, >151]
  const binDefs: { start: number; end: number; label: string }[] = [
    { start: 0, end: 107, label: '<108' },
    { start: 108, end: 111, label: '108–111' },
    { start: 112, end: 115, label: '112–115' },
    { start: 116, end: 119, label: '116–119' },
    { start: 120, end: 123, label: '120–123' },
    { start: 124, end: 127, label: '124–127' },
    { start: 128, end: 131, label: '128–131' },
    { start: 132, end: 135, label: '132–135' },
    { start: 136, end: 139, label: '136–139' },
    { start: 140, end: 143, label: '140–143' },
    { start: 144, end: 147, label: '144–147' },
    { start: 148, end: 256, label: '>147' },
  ];

  const bins: MonteCarloHistogramBin[] = binDefs.map((def) => {
    let count = 0;
    for (let i = 0; i < sampleSize; i++) {
      if (distances[i] >= def.start && distances[i] <= def.end) {
        count++;
      }
    }
    const observedPercent = (count / sampleSize) * 100;

    // Normal approximation for theoretical binomial probability
    const pLow = def.start === 0 ? 0 : normalCdf(def.start - 0.5, theoreticalMean, theoreticalStdDev);
    const pHigh = def.end === 256 ? 1 : normalCdf(def.end + 0.5, theoreticalMean, theoreticalStdDev);
    const theoreticalPercent = Math.max(0, (pHigh - pLow) * 100);

    return {
      binStart: def.start,
      binEnd: def.end,
      label: def.label,
      observedCount: count,
      observedPercent,
      theoreticalPercent,
    };
  });

  const executionTimeMs = performance.now() - startTime;

  return {
    totalSamples: sampleSize,
    observedMean: Number(observedMean.toFixed(2)),
    observedStdDev: Number(observedStdDev.toFixed(2)),
    minDistance: min,
    maxDistance: max,
    theoreticalMean,
    theoreticalStdDev,
    bins,
    executionTimeMs: Math.round(executionTimeMs),
  };
}
