import * as secp256k1 from '@noble/secp256k1';
import crypto from 'crypto';

function sha256Sync(msg) {
  return crypto.createHash('sha256').update(msg).digest();
}
function hmacSha256Sync(key, msg) {
  return crypto.createHmac('sha256', key).update(msg).digest();
}
try {
  secp256k1.hashes.sha256 = (msg) => sha256Sync(msg);
  secp256k1.hashes.hmacSha256 = (key, msg) => hmacSha256Sync(key, msg);
  if (secp256k1.etc) {
    secp256k1.etc.hashes = {
      sha256: (msg) => sha256Sync(msg),
      hmacSha256: (key, msg) => hmacSha256Sync(key, msg),
    };
    secp256k1.etc.sha256Sync = (msg) => sha256Sync(msg);
    secp256k1.etc.hmacSha256Sync = (key, msg) => hmacSha256Sync(key, msg);
  }
} catch (e) {}

const bytesToHex = (bytes) => Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
const hexToBytes = (hex) => {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const len = clean.length;
  const bytes = new Uint8Array(Math.ceil(len / 2));
  for (let i = 0; i < len; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16) || 0;
  }
  return bytes;
};

const digestHex = bytesToHex(sha256Sync(Buffer.from('test')));
const privateKeyHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const privBytes = hexToBytes(privateKeyHex);
const publicKeyBytes = secp256k1.getPublicKey(privBytes, false);
const publicKeyHex = bytesToHex(publicKeyBytes);

const signature = secp256k1.sign(hexToBytes(digestHex), privBytes, { prehash: false });
const sigHex = signature.toCompactHex ? signature.toCompactHex() : bytesToHex(signature);

const verify = secp256k1.verify(hexToBytes(sigHex), hexToBytes(digestHex), hexToBytes(publicKeyHex), { prehash: false });
console.log('Test valid:', verify);
console.log('Pub Key from code:', '04a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde04a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde');
console.log('Real Pub Key:', publicKeyHex);
