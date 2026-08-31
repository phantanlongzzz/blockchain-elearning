export type Lesson3Stage =
  | 'money-evolution'
  | 'trust-problem'
  | 'network-topology'
  | 'double-spending'
  | 'build-blockchain'
  | 'bitcoin-ecosystem'
  | 'final-challenge';

export interface MoneyEra {
  id: string;
  name: { vi: string; en: string };
  era: { vi: string; en: string };
  iconName: string;
  problem: { vi: string; en: string };
  improvement: { vi: string; en: string };
  newTrustAssumption: { vi: string; en: string };
  limitation: { vi: string; en: string };
  criteriaScores: {
    portable: boolean; // Dễ vận chuyển
    durable: boolean; // Bền vững
    divisible: boolean; // Dễ chia nhỏ
    limitedSupply: boolean; // Khan hiếm / Khó làm giả
  };
}

export interface NetworkNode {
  id: string;
  name: string;
  role: 'client' | 'server' | 'peer' | 'miner' | 'validator';
  status: 'active' | 'offline' | 'compromised';
  x: number;
  y: number;
  balance?: number;
}

export interface SimBlock {
  index: number;
  timestamp: string;
  txs: {
    id: string;
    sender: string;
    receiver: string;
    amount: number;
    signature?: string;
  }[];
  merkleRoot: string;
  previousHash: string;
  nonce: number;
  hash: string;
  isValid: boolean;
  isTampered?: boolean;
}

export type BlockchainTypeEnum = 'public' | 'private' | 'consortium' | 'sidechain';

export interface BlockchainTypeInfo {
  id: BlockchainTypeEnum;
  name: { vi: string; en: string };
  tagline: { vi: string; en: string };
  access: { vi: string; en: string };
  control: { vi: string; en: string };
  purpose: { vi: string; en: string };
  architecture: { vi: string; en: string };
  example: string;
}

export interface EcosystemComponent {
  id: 'wallet' | 'mempool' | 'miner' | 'block' | 'blockchain' | 'full_node' | 'spv_node' | 'pruning_node';
  name: { vi: string; en: string };
  category: { vi: string; en: string };
  shortPurpose: { vi: string; en: string };
  detailedRole: { vi: string; en: string };
  keyMechanism: { vi: string; en: string };
  icon: string;
}
