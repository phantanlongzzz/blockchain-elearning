export interface UTXO {
  id: string;
  txid: string;
  index: number;
  owner: string;
  value: number;
  spent: boolean;
}

export interface TransactionInput {
  txid: string;
  index: number;
  sig: string;
  pubKey: string;
  value: number;
}

export interface TransactionOutput {
  address: string;
  value: number;
}

export interface Transaction {
  id: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  valid: boolean;
  tampered?: boolean;
  isCoinbase?: boolean;
}

export interface VerificationResult {
  step: string;
  valid: boolean;
  message: string;
}

export interface Block {
  index: number;
  previousHash: string;
  merkleRoot: string;
  timestamp: number;
  nonce: number;
  hash: string;
  transactions: Transaction[];
}
