export interface E2ETransaction {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  feeBTC: number;
  timestamp: string;
  hash: string;
  status: 'mempool' | 'selected' | 'confirmed' | 'orphaned_returned';
}

export interface E2EMiner {
  id: string;
  name: string;
  avatarColor: string;
  hashrateKHz: number;
  currentNonce: number;
  currentHash: string;
  attempts: number;
  status: 'idle' | 'mining' | 'winner' | 'stopped' | 'lost' | 'validating';
  rangeStart: number;
  rangeStep: number;
}

export interface E2EBlock {
  height: number;
  id: string;
  branchId: 'main' | 'branchA' | 'branchB';
  previousHash: string;
  hash: string;
  nonce: number;
  timestamp: string;
  merkleRoot: string;
  difficulty: number;
  transactions: E2ETransaction[];
  minerId: string;
  minerName: string;
  cumulativeWork: number;
  status: 'canonical' | 'candidate' | 'competing' | 'orphaned';
  rewardBTC: number;
  isTampered?: boolean;
  tamperReason?: string;
}

export interface E2ENetworkNode {
  id: string;
  name: string;
  role: 'miner' | 'validator';
  x: number;
  y: number;
  region: string;
  isOffline?: boolean;
  status?: 'idle' | 'created' | 'receiving' | 'validating' | 'validated' | 'offline';
  validationState: {
    prevHash: boolean | null;
    merkleRoot: boolean | null;
    txValid: boolean | null;
    powValid: boolean | null;
    isAccepted: boolean | null;
  };
  receivedBlockId: string | null;
}

export interface E2EPacket {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  progress: number; // 0 to 1
  type: 'tx' | 'block' | 'validation';
  blockId?: string;
  color: string;
}

export interface E2EEventLog {
  id: string;
  timestamp: string;
  category: 'tx' | 'block' | 'mining' | 'broadcast' | 'validation' | 'consensus' | 'fork' | 'orphan' | 'reward' | 'fault';
  message: string;
  badge?: string;
  details?: string;
  nodeId?: string;
  blockHeight?: number;
}

export interface E2EExperimentConfig {
  minerCount: number;
  difficulty: number;
  networkLatencyMs: number;
  forkSimulationEnabled: boolean;
  baseRewardBTC: number;
}

export type SimulationMode = 'guided' | 'free' | 'debug';

export type SimulationSpeed = 0.5 | 1 | 2 | 4;

export type FaultScenarioType =
  | 'edit_block_data'
  | 'corrupt_hash'
  | 'invalid_merkle'
  | 'invalid_pow'
  | 'kill_node'
  | 'network_delay'
  | 'disconnect_peer';

export interface CausalityStep {
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  type: 'action' | 'state_change' | 'validation' | 'cascade';
  status: 'trigger' | 'warning' | 'error' | 'success';
}
