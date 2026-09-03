import * as secp256k1 from '@noble/secp256k1';
import { hashSha256, sha256Sync, hmacSha256Sync } from './sha256';

// Configure noble-secp256k1 hashes at module load time
export const initSecp256k1Hashes = () => {
  try {
    secp256k1.hashes.sha256 = (msg: Uint8Array) => sha256Sync(msg);
    secp256k1.hashes.hmacSha256 = (key: Uint8Array, msg: Uint8Array) => hmacSha256Sync(key, msg);
    if ((secp256k1 as any).etc) {
      (secp256k1 as any).etc.hashes = {
        sha256: (msg: Uint8Array) => sha256Sync(msg),
        hmacSha256: (key: Uint8Array, msg: Uint8Array) => hmacSha256Sync(key, msg),
      };
      (secp256k1 as any).etc.sha256Sync = (msg: Uint8Array) => sha256Sync(msg);
      (secp256k1 as any).etc.hmacSha256Sync = (key: Uint8Array, msg: Uint8Array) => hmacSha256Sync(key, msg);
    }
  } catch (e) {
    // safe fallback
  }
};

// Immediate initialization
initSecp256k1Hashes();

// Helper to convert Uint8Array to Hex string
export const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// Helper to convert Hex string to Uint8Array
export const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const len = clean.length;
  const bytes = new Uint8Array(Math.ceil(len / 2));
  for (let i = 0; i < len; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16) || 0;
  }
  return bytes;
};

// Generate a real SECP256K1 Keypair
export const generateWalletKeyPair = () => {
  initSecp256k1Hashes();
  const privateKeyBytes = secp256k1.utils.randomSecretKey();
  const privateKeyHex = bytesToHex(privateKeyBytes);
  // Uncompressed public key starting with 04 (65 bytes -> 130 hex chars)
  const publicKeyUncompressedBytes = secp256k1.getPublicKey(privateKeyBytes, false);
  const publicKeyHex = bytesToHex(publicKeyUncompressedBytes);
  // Compressed public key starting with 02 or 03 (33 bytes -> 66 hex chars)
  const publicKeyCompressedBytes = secp256k1.getPublicKey(privateKeyBytes, true);
  const publicKeyCompressedHex = bytesToHex(publicKeyCompressedBytes);

  return {
    privateKey: privateKeyHex,
    publicKey: publicKeyHex,
    publicKeyCompressed: publicKeyCompressedHex,
  };
};

export interface TransactionPayload {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  timestamp: string;
  nonce?: number;
  blockIndex?: number;
}

// Compute the canonical SHA-256 hash digest of a transaction
export const computeTransactionDigest = async (tx: {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  timestamp: string;
  nonce?: number;
  blockIndex?: number;
}): Promise<{ hex: string; bytes: Uint8Array }> => {
  // Canonical serialization format
  const canonicalString = `${tx.id}|${tx.sender}|${tx.receiver}|${Number(tx.amount).toFixed(4)}|${tx.timestamp}|${tx.nonce || 0}`;
  const hashResult = await hashSha256(canonicalString);
  const bytes = hexToBytes(hashResult.hex);
  return {
    hex: hashResult.hex,
    bytes,
  };
};

// Sign a transaction digest with an ECDSA private key on SECP256K1
export const signTransactionDigest = async (
  digestHex: string,
  privateKeyHex: string
): Promise<{ signatureHex: string; r: string; s: string; recovery?: number }> => {
  initSecp256k1Hashes();
  const digestBytes = hexToBytes(digestHex);
  const privBytes = hexToBytes(privateKeyHex);
  // Using prehash: false because digestBytes is already the 32-byte SHA-256 digest
  const signature = secp256k1.sign(digestBytes, privBytes, { prehash: false });

  const sigHex = typeof (signature as any).toCompactHex === 'function'
    ? (signature as any).toCompactHex()
    : bytesToHex(signature as any);

  let rHex = '';
  let sHex = '';
  if ((signature as any).r && (signature as any).s) {
    rHex = (signature as any).r.toString(16).padStart(64, '0');
    sHex = (signature as any).s.toString(16).padStart(64, '0');
  } else if (sigHex.length >= 128) {
    rHex = sigHex.slice(0, 64);
    sHex = sigHex.slice(64, 128);
  }

  return {
    signatureHex: sigHex,
    r: rHex,
    s: sHex,
    recovery: (signature as any).recovery,
  };
};

// Verify an ECDSA SECP256K1 signature against a message digest and public key
export const verifyTransactionSignature = async (
  digestHex: string,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> => {
  try {
    if (!digestHex || !signatureHex || !publicKeyHex) return false;
    initSecp256k1Hashes();
    const digestBytes = hexToBytes(digestHex);
    const pubBytes = hexToBytes(publicKeyHex);
    const sigBytes = hexToBytes(signatureHex);

    // prehash: false since digestBytes is already the 32-byte SHA-256 digest
    return secp256k1.verify(sigBytes, digestBytes, pubBytes, { prehash: false });
  } catch (err) {
    // If invalid signature format or curve point error
    return false;
  }
};

export const generateSecp256k1KeyPair = generateWalletKeyPair;

export const signTransactionData = async (
  digestHex: string,
  privateKeyHex: string
): Promise<string> => {
  const res = await signTransactionDigest(digestHex, privateKeyHex);
  return res.signatureHex;
};


