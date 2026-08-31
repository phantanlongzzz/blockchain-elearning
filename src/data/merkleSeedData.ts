import { MerkleTransaction } from '../types';
import { calculateTxHash } from '../utils/merkle';

export const INITIAL_MERKLE_TRANSACTIONS: MerkleTransaction[] = (() => {
  const rawData = [
    {
      id: 'mtx-0',
      txIndex: 0,
      sender: 'Phan Tấn Long',
      receiver: 'Trịnh Thị Khánh Vy',
      amount: 1.5,
      timestamp: '2026-05-15 08:30:00',
    },
    {
      id: 'mtx-1',
      txIndex: 1,
      sender: 'CTK47B Academic Node',
      receiver: 'Faculty Research Treasury',
      amount: 3.25,
      timestamp: '2026-05-15 08:32:15',
    },
    {
      id: 'mtx-2',
      txIndex: 2,
      sender: 'Student Lab Wallet',
      receiver: 'Peer Review Auditor',
      amount: 0.75,
      timestamp: '2026-05-15 08:35:40',
    },
    {
      id: 'mtx-3',
      txIndex: 3,
      sender: 'Dalat University Node',
      receiver: 'Cryptography Seminar Pool',
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
    sender: 'Scientific Research Dept',
    receiver: 'Blockchain Research Archive',
    amount: 12.0,
  },
  {
    sender: 'Faculty Treasury',
    receiver: 'Student Scholarship Fund',
    amount: 2.4,
  },
  {
    sender: 'Validator Node #04',
    receiver: 'Network Consensus Pool',
    amount: 8.5,
  },
  {
    sender: 'Phan Tấn Long',
    receiver: 'Peer Reviewer Node',
    amount: 0.5,
  },
];
