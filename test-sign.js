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

async function hashSha256(str) {
  const hash = crypto.createHash('sha256').update(str).digest();
  return { hex: bytesToHex(hash) };
}

async function test() {
  const alice = {
    address: '0xAlice',
    publicKey: '044646ae5047316b4230d0086c8acec687f00b1cd9d1dc634f6cb358ac0a9a8ffffe77b4dd0a4bfb95851f3b7355c781dd60f8418fc8a65d14907aff47c903a559',
    privateKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  };
  
  const signedPayload = {
    id: `tx-12345`,
    sender: alice.address,
    receiver: '0xBob',
    amount: 10.0,
    timestamp: '2023-01-01 00:00:00 UTC',
    nonce: 12345,
  };
  const canonicalString = `${signedPayload.id}|${signedPayload.sender}|${signedPayload.receiver}|${Number(signedPayload.amount).toFixed(4)}|${signedPayload.timestamp}|${signedPayload.nonce || 0}`;
  const signedDigestRes = await hashSha256(canonicalString);
  
  const privBytes = hexToBytes(alice.privateKey);
  const signature = secp256k1.sign(hexToBytes(signedDigestRes.hex), privBytes, { prehash: false });
  const sigHex = signature.toCompactHex ? signature.toCompactHex() : bytesToHex(signature);
  
  const verify = secp256k1.verify(hexToBytes(sigHex), hexToBytes(signedDigestRes.hex), hexToBytes(alice.publicKey), { prehash: false });
  console.log('Test valid:', verify);
}
test();
