export type ConsensusLessonStage =
  | 'fundamentals'
  | 'byzantine-problem'
  | 'oral-messages'
  | 'signed-messages'
  | 'pow-consensus'
  | 'pos-consensus'
  | 'pow-vs-pos'
  | 'final-challenge';

export interface GeneralNode {
  id: string;
  name: string;
  role: 'commander' | 'lieutenant';
  isTraitor: boolean;
  x: number; // percentage in SVG coordinate space (0..100)
  y: number; // percentage in SVG coordinate space (0..100)
  directOrderReceived?: 'ATTACK' | 'RETREAT' | null;
  forwardedOrdersReceived: Record<string, 'ATTACK' | 'RETREAT'>;
  decision?: 'ATTACK' | 'RETREAT' | 'UNDECIDED' | null;
  status: 'idle' | 'sending' | 'receiving' | 'verifying' | 'decided';
  signatureStatus?: 'valid' | 'tampered' | 'none';
}

export interface NetworkPacket {
  id: string;
  fromId: string;
  toId: string;
  payload: 'ATTACK' | 'RETREAT';
  isSigned: boolean;
  signature?: string;
  isTampered?: boolean;
  progress: number; // 0 to 100
  color: string;
}

export interface ThresholdItem {
  traitors: number;
  minNodes: number;
  toleratedMaxTraitors: number;
  isFeasible: boolean;
  explanation: {
    vi: string;
    en: string;
  };
}

export interface ConsensusChallengeScenario {
  id: string;
  title: {
    vi: string;
    en: string;
  };
  description: {
    vi: string;
    en: string;
  };
  totalNodes: number;
  honestNodes: number;
  byzantineNodes: number;
  blockProposal: {
    blockHeight: number;
    proposer: string;
    previousHash: string;
    txCount: number;
    transactions: {
      txId: string;
      sender: string;
      receiver: string;
      amount: number;
      signatureValid: boolean;
      isDoubleSpend?: boolean;
    }[];
    merkleRoot: string;
    nonce?: number;
    isValidBlock: boolean;
  };
}
