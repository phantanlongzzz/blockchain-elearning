import * as secp256k1 from '@noble/secp256k1';
import { WalletAccount, TransactionItem } from '../types';
import {
  bytesToHex,
  computeTransactionDigest,
  signTransactionDigest,
  verifyTransactionSignature,
  initSecp256k1Hashes,
} from '../utils/crypto';

// Initialize noble-secp256k1 hashes
initSecp256k1Hashes();

// Deterministic academic research seed wallets
const rawPrivKeys = [
  {
    id: 'wallet-long',
    name: 'Phan Tấn Long (Lead Researcher)',
    role: 'Student Node #01',
    priv: '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
  },
  {
    id: 'wallet-ctk47b',
    name: 'CTK47B Academic Node',
    role: 'Faculty Node #02',
    priv: '6cbed15c793ce57650b9877cfbebef0ac96453970161c136d6979d457c0f1e09',
  },
  {
    id: 'wallet-treasury',
    name: 'Faculty Research Treasury',
    role: 'Validator Node #03',
    priv: '8b9c6d4e2f1a0b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c',
  },
  {
    id: 'wallet-auditor',
    name: 'Peer Review Verification Node',
    role: 'Audit Node #04',
    priv: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
  },
];

export const RESEARCH_WALLETS: WalletAccount[] = rawPrivKeys.map((item) => {
  const privBytes = new Uint8Array(item.priv.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
  const pubBytes = secp256k1.getPublicKey(privBytes, false); // Uncompressed 04...
  const pubHex = bytesToHex(pubBytes);
  const shortAddress = `0x${pubHex.slice(2, 10)}${pubHex.slice(-6)}`.toLowerCase();

  return {
    id: item.id,
    name: item.name,
    role: item.role,
    privateKey: item.priv,
    publicKey: pubHex,
    address: shortAddress,
  };
});

// Initial Seed Transactions Generator
export const createInitialTransactions = async (): Promise<TransactionItem[]> => {
  const w1 = RESEARCH_WALLETS[0]; // Phan Tấn Long
  const w2 = RESEARCH_WALLETS[1]; // CTK47B
  const w3 = RESEARCH_WALLETS[2]; // Treasury
  const w4 = RESEARCH_WALLETS[3]; // Auditor

  // Transaction 1: Valid - Long -> CTK47B
  const tx1Raw = {
    id: 'tx-001',
    txNumber: 'TX-001',
    sender: w1.publicKey,
    senderName: w1.name,
    receiver: w2.publicKey,
    receiverName: w2.name,
    amount: 2.5,
    timestamp: '2026-08-18 10:45:21',
    blockIndex: 1,
    blockHash: '000a39fbc8102d7e127394d65829e102f98124bca8210385934bcde10294812',
    previousBlockHash: '0000000000000000000000000000000000000000000000000000000000000000',
    nonce: 1042,
    difficulty: 3,
  };
  const d1 = await computeTransactionDigest(tx1Raw);
  const s1 = await signTransactionDigest(d1.hex, w1.privateKey);

  // Transaction 2: Valid - Treasury -> Long (Research Grant)
  const tx2Raw = {
    id: 'tx-002',
    txNumber: 'TX-002',
    sender: w3.publicKey,
    senderName: w3.name,
    receiver: w1.publicKey,
    receiverName: w1.name,
    amount: 15.75,
    timestamp: '2026-08-18 10:52:14',
    blockIndex: 2,
    blockHash: '0007812bcfa091823904e9281aef10283746192847291038472910384710293',
    previousBlockHash: '000a39fbc8102d7e127394d65829e102f98124bca8210385934bcde10294812',
    nonce: 38291,
    difficulty: 3,
  };
  const d2 = await computeTransactionDigest(tx2Raw);
  const s2 = await signTransactionDigest(d2.hex, w3.privateKey);

  // Transaction 3: Valid - CTK47B -> Auditor (Dataset Publication Fee)
  const tx3Raw = {
    id: 'tx-003',
    txNumber: 'TX-003',
    sender: w2.publicKey,
    senderName: w2.name,
    receiver: w4.publicKey,
    receiverName: w4.name,
    amount: 0.85,
    timestamp: '2026-08-18 11:15:40',
    blockIndex: 3,
    blockHash: '000bf8201948271049283719402948172948201938472910482910394820193',
    previousBlockHash: '0007812bcfa091823904e9281aef10283746192847291038472910384710293',
    nonce: 51209,
    difficulty: 3,
  };
  const d3 = await computeTransactionDigest(tx3Raw);
  const s3 = await signTransactionDigest(d3.hex, w2.privateKey);

  // Transaction 4: INVALID (Tampered Amount) - Originally 5.00 signed by W1, but amount tampered to 50.00
  const tx4Original = {
    id: 'tx-004',
    sender: w1.publicKey,
    receiver: w4.publicKey,
    amount: 5.0,
    timestamp: '2026-08-18 11:02:15',
  };
  const d4Orig = await computeTransactionDigest(tx4Original);
  const s4Orig = await signTransactionDigest(d4Orig.hex, w1.privateKey); // Signed for 5.00
  // Now tampered to 50.00
  const tx4Tampered = {
    ...tx4Original,
    amount: 50.0,
  };
  const d4Tampered = await computeTransactionDigest(tx4Tampered);

  // Transaction 5: Valid - Auditor -> Treasury (Audit Clearance Escrow)
  const tx5Raw = {
    id: 'tx-005',
    txNumber: 'TX-005',
    sender: w4.publicKey,
    senderName: w4.name,
    receiver: w3.publicKey,
    receiverName: w3.name,
    amount: 1.2,
    timestamp: '2026-08-18 11:30:05',
    blockIndex: 4,
    blockHash: '000394810293847192837461928374619283746192837461928374619283746',
    previousBlockHash: '000bf8201948271049283719402948172948201938472910482910394820193',
    nonce: 27184,
    difficulty: 3,
  };
  const d5 = await computeTransactionDigest(tx5Raw);
  const s5 = await signTransactionDigest(d5.hex, w4.privateKey);

  // Transaction 6: INVALID (Tampered Receiver/Hijacked Address) - Signed by W2 for W1, but receiver redirected to Rogue Address
  const rogueReceiverPub =
    '04deadbeef9876543210abcdef0123456789abcdef0123456789abcdef01234567891234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const tx6Original = {
    id: 'tx-006',
    sender: w2.publicKey,
    receiver: w1.publicKey,
    amount: 8.0,
    timestamp: '2026-08-18 11:42:00',
  };
  const d6Orig = await computeTransactionDigest(tx6Original);
  const s6Orig = await signTransactionDigest(d6Orig.hex, w2.privateKey);
  const tx6Tampered = {
    ...tx6Original,
    receiver: rogueReceiverPub,
  };
  const d6Tampered = await computeTransactionDigest(tx6Tampered);

  const transactions: TransactionItem[] = [
    {
      ...tx1Raw,
      signature: s1.signatureHex,
      signatureR: s1.r,
      signatureS: s1.s,
      algorithm: 'ECDSA · SECP256K1',
      hashAlgorithm: 'SHA-256',
      ellipticCurve: 'SECP256K1',
      currentDigest: d1.hex,
      isValid: true,
      originalValues: {
        sender: tx1Raw.sender,
        receiver: tx1Raw.receiver,
        amount: tx1Raw.amount,
        timestamp: tx1Raw.timestamp,
        digest: d1.hex,
      },
    },
    {
      ...tx2Raw,
      signature: s2.signatureHex,
      signatureR: s2.r,
      signatureS: s2.s,
      algorithm: 'ECDSA · SECP256K1',
      hashAlgorithm: 'SHA-256',
      ellipticCurve: 'SECP256K1',
      currentDigest: d2.hex,
      isValid: true,
      originalValues: {
        sender: tx2Raw.sender,
        receiver: tx2Raw.receiver,
        amount: tx2Raw.amount,
        timestamp: tx2Raw.timestamp,
        digest: d2.hex,
      },
    },
    {
      ...tx3Raw,
      signature: s3.signatureHex,
      signatureR: s3.r,
      signatureS: s3.s,
      algorithm: 'ECDSA · SECP256K1',
      hashAlgorithm: 'SHA-256',
      ellipticCurve: 'SECP256K1',
      currentDigest: d3.hex,
      isValid: true,
      originalValues: {
        sender: tx3Raw.sender,
        receiver: tx3Raw.receiver,
        amount: tx3Raw.amount,
        timestamp: tx3Raw.timestamp,
        digest: d3.hex,
      },
    },
    {
      id: 'tx-004',
      txNumber: 'TX-004',
      sender: tx4Tampered.sender,
      senderName: w1.name,
      receiver: tx4Tampered.receiver,
      receiverName: w4.name,
      amount: tx4Tampered.amount, // 50.00
      timestamp: tx4Tampered.timestamp,
      signature: s4Orig.signatureHex, // Signature belongs to 5.00
      signatureR: s4Orig.r,
      signatureS: s4Orig.s,
      algorithm: 'ECDSA · SECP256K1',
      hashAlgorithm: 'SHA-256',
      ellipticCurve: 'SECP256K1',
      blockIndex: 2,
      blockHash: '0007812bcfa091823904e9281aef10283746192847291038472910384710293',
      previousBlockHash: '000a39fbc8102d7e127394d65829e102f98124bca8210385934bcde10294812',
      nonce: 38291,
      difficulty: 3,
      isTampered: true,
      tamperedField: 'amount',
      originalValues: {
        sender: tx4Original.sender,
        receiver: tx4Original.receiver,
        amount: tx4Original.amount, // 5.00
        timestamp: tx4Original.timestamp,
        digest: d4Orig.hex,
      },
      currentDigest: d4Tampered.hex,
      isValid: false,
      failureReason: 'Signature verification failed: Message digest does not match digital signature',
    },
    {
      ...tx5Raw,
      signature: s5.signatureHex,
      signatureR: s5.r,
      signatureS: s5.s,
      algorithm: 'ECDSA · SECP256K1',
      hashAlgorithm: 'SHA-256',
      ellipticCurve: 'SECP256K1',
      currentDigest: d5.hex,
      isValid: true,
      originalValues: {
        sender: tx5Raw.sender,
        receiver: tx5Raw.receiver,
        amount: tx5Raw.amount,
        timestamp: tx5Raw.timestamp,
        digest: d5.hex,
      },
    },
    {
      id: 'tx-006',
      txNumber: 'TX-006',
      sender: tx6Tampered.sender,
      senderName: w2.name,
      receiver: tx6Tampered.receiver, // Rogue address
      receiverName: 'Unauthorized Attacker Address',
      amount: tx6Tampered.amount,
      timestamp: tx6Tampered.timestamp,
      signature: s6Orig.signatureHex, // Signature belongs to original receiver
      signatureR: s6Orig.r,
      signatureS: s6Orig.s,
      algorithm: 'ECDSA · SECP256K1',
      hashAlgorithm: 'SHA-256',
      ellipticCurve: 'SECP256K1',
      blockIndex: 4,
      blockHash: '000394810293847192837461928374619283746192837461928374619283746',
      previousBlockHash: '000bf8201948271049283719402948172948201938472910482910394820193',
      nonce: 27184,
      difficulty: 3,
      isTampered: true,
      tamperedField: 'receiver',
      originalValues: {
        sender: tx6Original.sender,
        receiver: tx6Original.receiver,
        amount: tx6Original.amount,
        timestamp: tx6Original.timestamp,
        digest: d6Orig.hex,
      },
      currentDigest: d6Tampered.hex,
      isValid: false,
      failureReason: 'Signature verification failed: Receiver address modified after signing',
    },
  ];

  return transactions;
};
