/**
 * Binary & Hexadecimal Cryptographic Utility Functions
 */

// Convert hex string to 256-character binary string
export function hexToBinary(hex: string): string {
  let binary = '';
  for (let i = 0; i < hex.length; i++) {
    const bin = parseInt(hex[i], 16).toString(2).padStart(4, '0');
    binary += bin;
  }
  return binary;
}

// Convert byte array to hex string
export function bytesToHex(bytes: Uint8Array | number[]): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert UTF-8 string to Uint8Array bytes
export function stringToUtf8Bytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert hex string to Uint8Array bytes
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(Math.floor(cleanHex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}


// Convert 32-bit unsigned integer to 8-character hex
export function uint32ToHex(num: number): string {
  return (num >>> 0).toString(16).padStart(8, '0');
}

// Convert 32-bit integer to 32-bit binary string
export function uint32ToBinary(num: number): string {
  return (num >>> 0).toString(2).padStart(32, '0');
}

// Format 64-character hex into groups of 8 characters (8 32-bit words)
export function formatHexWords(hex: string): string[] {
  const words: string[] = [];
  for (let i = 0; i < hex.length; i += 8) {
    words.push(hex.slice(i, i + 8));
  }
  return words;
}

// Format 64-character hex into groups of 2 characters (32 individual bytes)
export function formatHexBytes(hex: string): string[] {
  const bytes: string[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(hex.slice(i, i + 2));
  }
  return bytes;
}

// Calculate Hamming distance and detailed bit difference between two hex digests
export function calculateHammingDifference(hexA: string, hexB: string) {
  const binA = hexToBinary(hexA).padEnd(256, '0');
  const binB = hexToBinary(hexB).padEnd(256, '0');
  
  let changedBits = 0;
  const diffIndices: number[] = [];
  
  for (let i = 0; i < 256; i++) {
    if (binA[i] !== binB[i]) {
      changedBits++;
      diffIndices.push(i);
    }
  }
  
  const percentage = (changedBits / 256) * 100;
  
  return {
    totalBits: 256,
    changedBits,
    percentage,
    bitsA: binA,
    bitsB: binB,
    diffIndices,
    hexA,
    hexB,
  };
}

// Calculate input bit difference between two text strings
export function calculateInputBitDifference(strA: string, strB: string) {
  const bytesA = stringToUtf8Bytes(strA);
  const bytesB = stringToUtf8Bytes(strB);
  
  let binA = '';
  let binB = '';
  
  for (let i = 0; i < bytesA.length; i++) {
    binA += bytesA[i].toString(2).padStart(8, '0');
  }
  for (let i = 0; i < bytesB.length; i++) {
    binB += bytesB[i].toString(2).padStart(8, '0');
  }
  
  const maxLen = Math.max(binA.length, binB.length);
  const padA = binA.padEnd(maxLen, '0');
  const padB = binB.padEnd(maxLen, '0');
  
  let changedBits = 0;
  for (let i = 0; i < maxLen; i++) {
    if (padA[i] !== padB[i]) {
      changedBits++;
    }
  }
  
  return {
    maxLen,
    changedBits,
    percentage: maxLen > 0 ? (changedBits / maxLen) * 100 : 0,
    binA,
    binB,
  };
}

// Truncate hash to N bits (for collision demonstration in smaller spaces)
export function truncateHashToBits(hex: string, bitCount: number): string {
  const bin = hexToBinary(hex).slice(0, bitCount);
  return bin;
}
