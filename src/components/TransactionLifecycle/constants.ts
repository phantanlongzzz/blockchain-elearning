import { UTXO, Transaction, Block } from './types';

export const INITIAL_UTXOS: UTXO[] = [
  { id: 'u1', txid: '7f3a91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d89c21', index: 0, owner: 'Alice', value: 4, spent: false },
  { id: 'u2', txid: '1b8d4e3f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d', index: 1, owner: 'Alice', value: 7, spent: false },
  { id: 'u3', txid: '9c217f3a91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', index: 0, owner: 'Alice', value: 8, spent: false },
];

export const INITIAL_MEMPOOL: Transaction[] = [
  {
    id: 'TX-02',
    inputs: [{ txid: 'a1b2...', index: 0, sig: '30440220...', pubKey: '02fa...', value: 2.1 }],
    outputs: [{ address: 'Dave', value: 2 }],
    valid: true
  },
  {
    id: 'TX-03',
    inputs: [{ txid: 'c3d4...', index: 1, sig: '30450221...', pubKey: '03eb...', value: 1.6 }],
    outputs: [{ address: 'Frank', value: 1.5 }],
    valid: true
  }
];

export const INITIAL_BLOCKCHAIN: Block[] = [
  {
    index: 0,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    timestamp: 1231006505,
    nonce: 2083236893,
    hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
    transactions: []
  },
  {
    index: 1,
    previousHash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
    merkleRoot: '9b0fc92260312ce44e74ef369f5c66b15dcb33d8b2d1ed903b44b82d3e5e4fa4',
    timestamp: 1231469665,
    nonce: 2573394689,
    hash: '00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048',
    transactions: []
  },
  {
    index: 2,
    previousHash: '00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048',
    merkleRoot: 'df2b060fa2e5e196ce00179f0c8313e3c04d022b7dc009cbbfceb3a3c220f12d',
    timestamp: 1231469744,
    nonce: 1639830024,
    hash: '000000006a625f06636b8bb6ac7b960a8d03705d1ace08b1a19da3fdcc99ddbd',
    transactions: []
  }
];
