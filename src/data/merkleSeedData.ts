import { MerkleTransaction } from '../types';
import { calculateTxHash } from '../utils/merkle';

export const INITIAL_MERKLE_TRANSACTIONS: MerkleTransaction[] = (() => {
  const rawData = [
    {
      id: 'mtx-0',
      txIndex: 0,
      sender: 'Alice',
      receiver: 'Bob',
      amount: 1.5,
      timestamp: '2026-05-15 08:30:00',
    },
    {
      id: 'mtx-1',
      txIndex: 1,
      sender: 'Charlie',
      receiver: 'Dave',
      amount: 3.25,
      timestamp: '2026-05-15 08:32:15',
    },
    {
      id: 'mtx-2',
      txIndex: 2,
      sender: 'Frank',
      receiver: 'Grace',
      amount: 0.75,
      timestamp: '2026-05-15 08:35:40',
    },
    {
      id: 'mtx-3',
      txIndex: 3,
      sender: 'Heidi',
      receiver: 'Ivan',
      amount: 5.0,
      timestamp: '2026-05-15 08:40:00',
    },
  ];

  return rawData.map((item) => {
    const hash = calculateTxHash(item);
    return {
      ...item,
      hash,
      isTampered: false,
      originalValues: {
        sender: item.sender,
        receiver: item.receiver,
        amount: item.amount,
        timestamp: item.timestamp,
        hash,
      },
    };
  });
})();

export const PRESET_MERKLE_TRANSACTIONS = [
  {
    sender: 'Alice',
    receiver: 'Charlie',
    amount: 12.0,
  },
  {
    sender: 'Bob',
    receiver: 'Dave',
    amount: 2.4,
  },
  {
    sender: 'Frank',
    receiver: 'Grace',
    amount: 8.5,
  },
  {
    sender: 'Heidi',
    receiver: 'Ivan',
    amount: 0.5,
  },
];
