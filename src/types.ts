export interface HashResult {
  input: string;
  hex: string;
  binary: string;
  bytes: number[];
  inputBytes: number;
  inputBits: number;
  calculationTimeMs: number;
}

export interface RoundState {
  round: number;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  g: number;
  h: number;
  w: number;
  k: number;
  t1: number;
  t2: number;
}

export interface DetailedSha256Breakdown {
  paddedMessageBytes: Uint8Array;
  paddedBitsLength: number;
  originalBitsLength: number;
  blockCount: number;
  blocks: {
    blockIndex: number;
    w: number[]; // 64 32-bit words schedule
    rounds: RoundState[];
    finalIntermediateHash: number[]; // 8 words (H0..H7)
  }[];
  finalHashHex: string;
}

export interface BlockchainBlock {
  id: number;
  index: number;
  timestamp: string;
  previousHash: string;
  data: string;
  nonce: number;
  hash: string;
  difficulty: number;
  isValid: boolean;
  originalHash?: string;
  previousValidHash?: string;
}

export interface BitDiffResult {
  totalBits: number;
  changedBits: number;
  percentage: number;
  bitsA: string;
  bitsB: string;
  diffIndices: number[];
  hexA: string;
  hexB: string;
}

export interface TestVector {
  id: string;
  name: string;
  category: string;
  input: string;
  expectedHex: string;
  description: string;
}

export interface WalletAccount {
  id: string;
  name: string;
  role: string;
  privateKey: string;
  publicKey: string; // Uncompressed 04...
  address: string;
}

export interface TransactionItem {
  id: string;
  txNumber: string; // e.g. "TX-001"
  sender: string; // Public key or wallet address
  senderName?: string;
  receiver: string;
  receiverName?: string;
  amount: number;
  timestamp: string;
  signature: string; // ECDSA SECP256K1 compact hex
  signatureR?: string;
  signatureS?: string;
  algorithm: string; // "ECDSA · SECP256K1"
  hashAlgorithm: string; // "SHA-256"
  ellipticCurve: string; // "SECP256K1"
  blockIndex?: number;
  blockHash?: string;
  previousBlockHash?: string;
  nonce?: number;
  difficulty?: number;
  isTampered?: boolean;
  tamperedField?: 'amount' | 'receiver' | 'sender' | 'timestamp' | 'none';
  originalValues?: {
    sender: string;
    receiver: string;
    amount: number;
    timestamp: string;
    digest: string;
  };
  currentDigest: string;
  isValid: boolean;
  failureReason?: string;
}

export interface MerkleTransaction {
  id: string;
  txIndex: number;
  sender: string;
  receiver: string;
  amount: number;
  timestamp: string;
  hash: string;
  isTampered?: boolean;
  originalValues?: {
    sender: string;
    receiver: string;
    amount: number;
    timestamp: string;
    hash: string;
  };
}

export interface MerkleNode {
  id: string;
  hash: string;
  level: number; // 0 = leaf, 1 = parent level 1, ..., H = root
  index: number;
  label: string;
  leftChildId?: string;
  rightChildId?: string;
  isDuplicated?: boolean;
  transactionId?: string;
  transaction?: MerkleTransaction;
  isTampered?: boolean;
  isProofTarget?: boolean;
  isProofSibling?: boolean;
  isProofPath?: boolean;
  combinedInput?: string;
}

export interface MerkleProofStep {
  level: number;
  currentHash: string;
  siblingHash: string;
  siblingPosition: 'left' | 'right';
  parentHash: string;
  isTarget: boolean;
  combinedHex: string;
}

export interface MerkleTreeResult {
  levels: MerkleNode[][];
  rootNode: MerkleNode | null;
  rootHash: string;
  totalLeaves: number;
  totalNodes: number;
  treeHeight: number;
  isTampered: boolean;
  affectedNodeIds: Set<string>;
}

export interface PoSValidator {
  id: string;
  name: string;
  avatarColor: string;
  stake: number;
  isOnline: boolean;
  isActive: boolean; // meets minimum stake (e.g. >= 32 COIN)
  isMalicious: boolean;
  votingPower: number; // percentage (0 - 100)
  totalBlocksProposed: number;
  totalRewards: number;
  slashedAmount: number;
  lastAttestation?: 'attest' | 'reject' | 'offline' | 'idle';
}

export interface PoSBlock {
  blockNumber: number;
  proposer: string; // validator name
  proposerId: string;
  timestamp: string;
  previousHash: string;
  txCount: number;
  blockHash: string;
  merkleRoot: string;
  isMalicious: boolean;
  maliciousReason?: string;
  status: 'proposed' | 'validating' | 'accepted' | 'rejected';
}

export interface AttestationVote {
  validatorId: string;
  validatorName: string;
  stake: number;
  votingPower: number;
  vote: 'yes' | 'no' | 'offline';
  timestamp: string;
  checks: {
    hashIntegrity: boolean;
    previousHash: boolean;
    txValidation: boolean;
    proposerEligibility: boolean;
  };
}

export interface PoSConsensusResult {
  totalOnlineValidators: number;
  totalOnlineStake: number;
  yesVotesCount: number;
  yesVotesStake: number;
  yesVotingPowerPercentage: number;
  requiredVoteThreshold: number; // e.g. ceil(2 * N / 3)
  requiredStakeThresholdPercentage: number; // 66.67%
  isCountConsensusReached: boolean;
  isStakeConsensusReached: boolean;
  isConsensusReached: boolean;
  rewardGiven: number;
  slashedPenalty: number;
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  studentId: string;
  class: string;
  createdAt: string;
  updatedAt: string;
}

export type QuizTopic =
  | 'foundations'
  | 'sha256'
  | 'transaction'
  | 'signature'
  | 'mempool'
  | 'merkle-tree'
  | 'blockchain'
  | 'proof-of-work'
  | 'proof-of-stake';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  id: string;
  lessonId?: string; // e.g. "lesson-1"
  category?: string; // e.g. "python-list", "linked-list", "hash-pointer", "cryptography", "sha256", "blockchain-basics"
  question: {
    en: string;
    vi: string;
  };
  options: { id: string; en: string; vi: string; }[];
  correctOptionId: string;
  explanation: {
    en: string;
    vi: string;
  };
  difficulty: QuestionDifficulty;
  topic: QuizTopic;
}

export interface QuizModule {
  quizId: string;
  title: {
    en: string;
    vi: string;
  };
  description: {
    en: string;
    vi: string;
  };
  version: string; // e.g. "1.0"
  topic: string;
  questions: QuizQuestion[];
  difficulty: 'all' | QuestionDifficulty;
  passingScore: number; // percentage, e.g. 70
  createdAt: string;
}

export interface QuizAnswerRecord {
  questionId: string;
  selectedOption: number; // Deprecated, kept for backward compatibility
  selectedOptionId?: string;
  optionOrder?: string[]; // Array of option IDs in the order they were presented
  isCorrect: boolean;
}

export interface QuizAttempt {
  questionOrder?: string[]; // Array of question IDs in the order they were presented
  id: string;
  userId: string;
  quizId: string;
  quizTitle: {
    en: string;
    vi: string;
  };
  quizVersion: string; // "1.0"
  score: number; // percentage (0 - 100)
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  durationSeconds: number;
  answers: QuizAnswerRecord[];
  topicBreakdown?: Record<string, { correct: number; total: number }>;
}

export interface CertificateRecord {
  id: string;
  userId: string;
  quizAttemptId: string;
  certificateId: string; // e.g. "BC-CERT-000127"
  quizVersion: string; // "1.0"
  level: 'Foundation' | 'Proficient' | 'Mastery';
  score: number;
  issuedAt: string;
  status: 'eligible' | 'issued' | 'pending';
}

export interface LearningProgress {
  foundations: boolean;
  blockArchitecture: boolean;
  decentralizationEvolution: boolean;
  consensusMechanisms: boolean;
  sha256: boolean;
  transaction: boolean;
  signature: boolean;
  mempool: boolean;
  merkleTree: boolean;
  blockchain: boolean;
  proofOfWork: boolean;
  proofOfStake: boolean;
}

export interface PythonListItem {
  id: string;
  value: string | number | boolean;
  type: 'int' | 'float' | 'str' | 'bool';
}

export interface LinkedListNodeItem {
  id: string;
  data: string;
  nextId: string | null;
}

export interface HashPointerBlockItem {
  index: number;
  data: string;
  previousHash: string;
  hash: string;
  isTampered?: boolean;
}

export interface LessonSectionMeta {
  id: string;
  title: {
    vi: string;
    en: string;
  };
  shortDescription?: {
    vi: string;
    en: string;
  };
  icon: string;
}

export interface LessonMeta {
  id: string; // e.g. "lesson-1"
  lessonNumber: number;
  slug: string;
  title: {
    vi: string;
    en: string;
  };
  subtitle: {
    vi: string;
    en: string;
  };
  badge: {
    vi: string;
    en: string;
  };
  levelBadge: {
    vi: string;
    en: string;
  };
  sections: LessonSectionMeta[];
  quizModuleId: string;
  isAvailable: boolean;
}

export interface CryptoConceptItem {
  id: string;
  name: {
    vi: string;
    en: string;
  };
  shortDef: {
    vi: string;
    en: string;
  };
  example: {
    vi: string;
    en: string;
  };
  whyBlockchain: {
    vi: string;
    en: string;
  };
  badge: string;
  ctaLabLabel: {
    vi: string;
    en: string;
  };
  ctaLabHref: string;
  iconName: string;
}





