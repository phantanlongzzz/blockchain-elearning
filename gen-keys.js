import * as secp256k1 from '@noble/secp256k1';

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

const keys = [
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
  '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
  '99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa'
];

keys.forEach((k, i) => {
  const pub = bytesToHex(secp256k1.getPublicKey(hexToBytes(k), false));
  console.log(`Key ${i}: ${pub}`);
});
