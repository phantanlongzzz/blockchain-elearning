import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Shuffle,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  FileCode,
  Hash,
  Clock,
  Boxes,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Cpu,
  Layers,
  Search,
  Eye,
  GitFork,
  Check,
  Zap,
  Info,
  Copy,
  Terminal,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { sha256Sync } from '../../utils/sha256';
import { bytesToHex, stringToUtf8Bytes } from '../../utils/binary';

export interface HandsOnTx {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  message: string;
  timestamp: string;
  isSigned: boolean;
  isTampered: boolean;
  signature: string;
  txHash: string;
  originalAmount?: number;
  originalMessage?: string;
}

export const InteractiveBlockHandsOnLab: React.FC<{
  onInteracted?: () => void;
  onSwitchToGuided?: () => void;
}> = ({ onInteracted, onSwitchToGuided }) => {
  const { language } = useLanguage();

  // Workbench Form Inputs
  const [sender, setSender] = useState<string>('Alice');
  const [recipient, setRecipient] = useState<string>('Bob');
  const [amount, setAmount] = useState<number>(10);
  const [message, setMessage] = useState<string>('Payment for research');

  // Animation Pipeline Stage for TX creation: 'idle' | 'validating' | 'created' | 'signing' | 'signed'
  const [pipelineStep, setPipelineStep] = useState<string>('idle');
  const [hashStreamText, setHashStreamText] = useState<string>('');
  const [isComputingHash, setIsComputingHash] = useState<boolean>(false);

  // Block Header State
  const [blockNumber, setBlockNumber] = useState<number>(42);
  const [prevHash, setPrevHash] = useState<string>(
    '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f'
  );
  const [timestamp, setTimestamp] = useState<string>('2026-08-23 18:30:15');
  const [nonce, setNonce] = useState<number>(208323);
  const [isMining, setIsMining] = useState<boolean>(false);
  const [miningSpeed, setMiningSpeed] = useState<number>(0);

  // Selected Dependency Highlight Target
  const [highlightedComponent, setHighlightedComponent] = useState<string | null>(null);

  // Educational Feedback Toast / Status
  const [feedback, setFeedback] = useState<{
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    description: string;
  }>({
    type: 'info',
    title:
      language === 'vi'
        ? 'Phòng Thí Nghiệm Đang Sẵn Sàng'
        : 'Interactive Lab Ready',
    description:
      language === 'vi'
        ? 'Hãy tạo giao dịch, ký số bằng Khóa Riêng Tư và quan sát cây Merkle tự động kết nối vào Block Header.'
        : 'Create a transaction, sign it with a Private Key, and watch the Merkle tree automatically link into the Block Header.',
  });

  // Default 4 Transactions in the Block Body
  const [transactions, setTransactions] = useState<HandsOnTx[]>([
    {
      id: 'tx-1',
      sender: 'Alice',
      recipient: 'Bob',
      amount: 10,
      message: 'Payment for research',
      timestamp: '18:30:00',
      isSigned: true,
      isTampered: false,
      signature: '3045022100a94bf872e41c4961b7f0e9b97ca9910d5ec423',
      txHash: '',
    },
    {
      id: 'tx-2',
      sender: 'Bob',
      recipient: 'Charlie',
      amount: 4,
      message: 'Server hosting fee',
      timestamp: '18:30:04',
      isSigned: true,
      isTampered: false,
      signature: '3045022031ef82a7bc498801d941cb904a8b712fae498c01',
      txHash: '',
    },
    {
      id: 'tx-3',
      sender: 'Charlie',
      recipient: 'Dave',
      amount: 2,
      message: 'Peer review bounty',
      timestamp: '18:30:08',
      isSigned: true,
      isTampered: false,
      signature: '30450221008f1b9472e391b4028f8ac7201bb8d923fa8c02',
      txHash: '',
    },
    {
      id: 'tx-4',
      sender: 'Dave',
      recipient: 'Alice',
      amount: 1,
      message: 'Coffee payback',
      timestamp: '18:30:12',
      isSigned: true,
      isTampered: false,
      signature: '3045022062fa9108c3e809187a22091faec8991bce098231',
      txHash: '',
    },
  ]);

  // Selected TX for workbench editing / signing / tampering
  const [selectedTxId, setSelectedTxId] = useState<string>('tx-1');

  // Before / After State tracking for Tampering Diff
  const [beforeAfterDiff, setBeforeAfterDiff] = useState<{
    originalTxHash: string;
    newTxHash: string;
    originalMerkleRoot: string;
    newMerkleRoot: string;
    originalBlockHash: string;
    newBlockHash: string;
    txLabel: string;
  } | null>(null);

  // Helper: compute standard SHA-256 Hex
  const calcSha256 = (input: string): string => {
    try {
      const bytes = stringToUtf8Bytes(input);
      const hashBytes = sha256Sync(bytes);
      return bytesToHex(hashBytes);
    } catch {
      return '0000000000000000000000000000000000000000000000000000000000000000';
    }
  };

  // Helper: compute Tx Hash from fields
  const computeTxHash = (tx: HandsOnTx): string => {
    const raw = `${tx.sender.trim()}->${tx.recipient.trim()}:${Number(tx.amount).toFixed(4)}:${tx.message.trim()}@${tx.timestamp}`;
    return calcSha256(raw);
  };

  // Update Tx hashes on transactions change
  const processedTxs = useMemo(() => {
    return transactions.map((t) => ({
      ...t,
      txHash: computeTxHash(t),
    }));
  }, [transactions]);

  // Merkle Tree Calculation
  const merkleTree = useMemo(() => {
    if (processedTxs.length === 0) {
      return {
        leaves: [] as string[],
        level1: [] as string[],
        root: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      };
    }

    const leaves = processedTxs.map((t) => t.txHash);
    const paddedLeaves = [...leaves];
    // Pad to power of 2 (at least 2, 4, etc.)
    if (paddedLeaves.length % 2 !== 0) {
      paddedLeaves.push(paddedLeaves[paddedLeaves.length - 1]);
    }

    const level1: string[] = [];
    for (let i = 0; i < paddedLeaves.length; i += 2) {
      const left = paddedLeaves[i];
      const right = paddedLeaves[i + 1] || left;
      const combined = left + right;
      level1.push(calcSha256(combined));
    }

    let currentLevel = [...level1];
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        nextLevel.push(calcSha256(left + right));
      }
      currentLevel = nextLevel;
    }

    const root = currentLevel[0] || paddedLeaves[0] || '';
    return {
      leaves: paddedLeaves,
      level1,
      root,
    };
  }, [processedTxs]);

  // Block Header Hash Calculation: Double SHA-256(Version + PrevHash + MerkleRoot + Timestamp + Bits + Nonce)
  const blockHash = useMemo(() => {
    const rawHeader = `version:2|prev:${prevHash}|merkle:${merkleTree.root}|time:${timestamp}|bits:0x1d00ffff|nonce:${nonce}`;
    const firstPass = calcSha256(rawHeader);
    return calcSha256(firstPass);
  }, [prevHash, merkleTree.root, timestamp, nonce]);

  // Check if Block has any tampered or broken link
  const hasTamperedTx = transactions.some((t) => t.isTampered);
  const isChainLinkValid = prevHash.startsWith('000000000019d668');
  const isProofOfWorkValid = blockHash.startsWith('0000') || blockHash.startsWith('00');
  const isBlockValid = !hasTamperedTx && isChainLinkValid && transactions.every((t) => t.isSigned);

  // Selected Transaction for Workbench
  const currentSelectedTx = processedTxs.find((t) => t.id === selectedTxId) || processedTxs[0];

  // Cryptographic Stream Simulation effect
  const triggerHashStream = (finalHash: string, callback?: () => void) => {
    setIsComputingHash(true);
    let frames = 0;
    const interval = setInterval(() => {
      frames++;
      const randHex = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setHashStreamText(randHex);
      if (frames >= 6) {
        clearInterval(interval);
        setHashStreamText(finalHash);
        setIsComputingHash(false);
        if (callback) callback();
      }
    }, 50);
  };

  // 19.2 Handler: Create Transaction with animation pipeline
  const handleCreateTransaction = () => {
    onInteracted?.();
    setPipelineStep('validating');
    setFeedback({
      type: 'info',
      title: language === 'vi' ? 'Đang Kiểm Tra Dữ Liệu...' : 'Validating Input...',
      description:
        language === 'vi'
          ? `Kiểm tra số dư của ${sender} và định dạng trường tin nhắn.`
          : `Verifying ${sender}'s balance and payload formatting.`,
    });

    setTimeout(() => {
      setPipelineStep('created');
      const newTxId = `tx-${Date.now().toString().slice(-4)}`;
      const now = new Date().toTimeString().split(' ')[0];
      const newTx: HandsOnTx = {
        id: newTxId,
        sender,
        recipient,
        amount: Number(amount) || 1,
        message,
        timestamp: now,
        isSigned: false,
        isTampered: false,
        signature: '',
        txHash: '',
      };

      setTransactions((prev) => [...prev, newTx]);
      setSelectedTxId(newTxId);

      setFeedback({
        type: 'success',
        title: language === 'vi' ? '✓ Giao Dịch Đã Được Tạo' : '✓ Transaction Created',
        description:
          language === 'vi'
            ? `Giao dịch ${sender} → ${recipient} (${amount} BTC) đã sẵn sàng để ký số bằng Private Key.`
            : `Transaction ${sender} → ${recipient} (${amount} BTC) is ready to be digitally signed.`,
      });

      // Stream hash
      const hash = computeTxHash(newTx);
      triggerHashStream(hash, () => {
        setPipelineStep('ready-to-sign');
      });
    }, 400);
  };

  // 19.3 Handler: Sign Selected Transaction
  const handleSignTransaction = () => {
    if (!currentSelectedTx) return;
    onInteracted?.();
    setPipelineStep('signing');

    const generatedSig =
      '3045022100' +
      calcSha256(`${currentSelectedTx.sender}_privkey_${Date.now()}`).slice(0, 38);

    triggerHashStream(currentSelectedTx.txHash, () => {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === currentSelectedTx.id
            ? {
                ...t,
                isSigned: true,
                isTampered: false,
                signature: generatedSig,
                originalAmount: t.amount,
                originalMessage: t.message,
              }
            : t
        )
      );
      setPipelineStep('signed');
      setFeedback({
        type: 'success',
        title: language === 'vi' ? '✓ Chữ Ký Điện Tử Đã Được Tạo' : '✓ Digital Signature Created',
        description:
          language === 'vi'
            ? `Bản băm SHA-256 được mã hóa bằng Private Key của ${currentSelectedTx.sender}. Bất kỳ ai cũng có thể xác minh bằng Public Key.`
            : `SHA-256 hash was encrypted with ${currentSelectedTx.sender}'s Private Key. Anyone on the network can verify with their Public Key.`,
      });
    });
  };

  // 19.3 Handler: Verify Signature
  const handleVerifySignature = () => {
    onInteracted?.();
    if (!currentSelectedTx.isSigned) {
      setFeedback({
        type: 'warning',
        title: language === 'vi' ? 'Chưa Ký Số' : 'Not Signed',
        description:
          language === 'vi'
            ? 'Giao dịch này chưa được ký bằng Khóa Riêng Tư của người gửi.'
            : 'This transaction has not been signed with the sender’s Private Key.',
      });
      return;
    }

    if (currentSelectedTx.isTampered) {
      setFeedback({
        type: 'error',
        title: language === 'vi' ? '❌ Chữ Ký Không Hợp Lệ!' : '❌ Signature Invalid!',
        description:
          language === 'vi'
            ? 'Dữ liệu giao dịch đã bị chỉnh sửa sau khi ký. Khóa công khai giải mã không khớp với bản băm mới!'
            : 'Transaction payload was modified after signing. Decrypted hash does not match the new hash!',
      });
    } else {
      setFeedback({
        type: 'success',
        title: language === 'vi' ? '✓ Chữ Ký Hợp Lệ' : '✓ Signature Valid',
        description:
          language === 'vi'
            ? `Xác thực thành công! Giao dịch được xác nhận chính chủ từ ${currentSelectedTx.sender} và toàn vẹn 100%.`
            : `Authentication passed! Confirmed authentic from ${currentSelectedTx.sender} and 100% untampered.`,
      });
    }
  };

  // 19.6 Handler: Tamper Attack (Người học tự phá dữ liệu)
  const handleTamperTransaction = (txId: string, tamperedAmount: number = 1000) => {
    onInteracted?.();
    const target = processedTxs.find((t) => t.id === txId);
    if (!target) return;

    // Capture before state
    const beforeTxHash = target.txHash;
    const beforeRoot = merkleTree.root;
    const beforeBlockHash = blockHash;

    const modified = {
      ...target,
      amount: tamperedAmount,
      message: `${target.message} [TAMPERED]`,
      isTampered: true,
    };

    const newTxHash = computeTxHash(modified);

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? modified : t))
    );

    // Save diff
    setTimeout(() => {
      setBeforeAfterDiff({
        originalTxHash: beforeTxHash,
        newTxHash: newTxHash,
        originalMerkleRoot: beforeRoot,
        newMerkleRoot: merkleTree.root,
        originalBlockHash: beforeBlockHash,
        newBlockHash: blockHash,
        txLabel: `${target.sender} → ${target.recipient}`,
      });
    }, 100);

    setFeedback({
      type: 'error',
      title:
        language === 'vi'
          ? '⚠ CẢNH BÁO: PHÁT HIỆN DỮ LIỆU BỊ GIẢ MẠO!'
          : '⚠ ALERT: DATA TAMPERING DETECTED!',
      description:
        language === 'vi'
          ? `Giao dịch ${target.sender} bị sửa thành ${tamperedAmount} BTC. Hiệu ứng thác đổ kích hoạt: TX Hash đổi → Merkle Parent đổi → Merkle Root đổi → Block Hash đổi → Block bị từ chối!`
          : `Transaction ${target.sender} altered to ${tamperedAmount} BTC. Avalanche cascade triggered: TX Hash changed → Merkle Parent changed → Merkle Root changed → Block Hash changed!`,
    });
  };

  // 19.7 Handler: Update Timestamp
  const handleUpdateTimestamp = (newTime: string) => {
    onInteracted?.();
    setTimestamp(newTime);
    setFeedback({
      type: 'info',
      title: language === 'vi' ? '✓ Dấu Thời Gian Cập Nhật' : '✓ Timestamp Updated',
      description:
        language === 'vi'
          ? `Timestamp mới '${newTime}' đã được đưa vào Block Header, khiến Block Hash thay đổi hoàn toàn.`
          : `New timestamp '${newTime}' applied to Block Header, recalculating the entire Block Hash.`,
    });
  };

  // 19.8 Handler: Change Prev Hash
  const handleTogglePrevHash = (corrupt: boolean) => {
    onInteracted?.();
    if (corrupt) {
      setPrevHash('ABC12345DEADBEEF99887766554433221100FFEEDDCCBBAA0011223344556677');
      setFeedback({
        type: 'error',
        title: language === 'vi' ? '❌ MẮT XÍCH BLOCKCHAIN BỊ ĐỨT GÃY!' : '❌ BLOCKCHAIN LINK BROKEN!',
        description:
          language === 'vi'
            ? 'Block #42 đang tham chiếu đến một Previous Hash không tồn tại của Block #41. Chuỗi liên kết mật mã bị phá vỡ!'
            : 'Block #42 is referencing an invalid Previous Hash for Block #41. Cryptographic chain continuity severed!',
      });
    } else {
      setPrevHash('000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f');
      setFeedback({
        type: 'success',
        title: language === 'vi' ? '✓ Khôi Phục Liên Kết Chuỗi' : '✓ Chain Link Restored',
        description:
          language === 'vi'
            ? 'Previous Hash đã khớp chính xác với Block Hash của Block #41.'
            : 'Previous Hash matches the canonical block hash of Block #41.',
      });
    }
  };

  // 19.9 Handler: Find Valid Nonce (Proof-of-Work connector)
  const handleFindValidNonce = () => {
    onInteracted?.();
    setIsMining(true);
    setFeedback({
      type: 'info',
      title: language === 'vi' ? '⛏ Đang Đào Tìm Nonce Hợp Lệ...' : '⛏ Mining for Valid Nonce...',
      description:
        language === 'vi'
          ? 'Đang thử nghiệm liên tục các giá trị Nonce để tạo mã băm Block Header thỏa mãn độ khó (bắt đầu bằng 0000...)'
          : 'Iterating through Nonce values to find a Block Header hash meeting difficulty criteria (leading zeros).',
    });

    let testNonce = nonce;
    let iterations = 0;
    const startTime = Date.now();

    const mineInterval = setInterval(() => {
      iterations += 500;
      testNonce += Math.floor(Math.random() * 50) + 1;
      setNonce(testNonce);
      setMiningSpeed(Math.round(iterations / ((Date.now() - startTime) / 1000 || 1)));

      const rawHeader = `version:2|prev:${prevHash}|merkle:${merkleTree.root}|time:${timestamp}|bits:0x1d00ffff|nonce:${testNonce}`;
      const hash1 = calcSha256(rawHeader);
      const hash2 = calcSha256(hash1);

      if (hash2.startsWith('0000') || iterations > 4000) {
        clearInterval(mineInterval);
        setIsMining(false);
        setFeedback({
          type: 'success',
          title: language === 'vi' ? '🎉 Đã Tìm Thấy Nonce Hợp Lệ!' : '🎉 Valid Nonce Discovered!',
          description:
            language === 'vi'
              ? `Nonce = ${testNonce} tạo ra mã băm khối bắt đầu bằng '0000...'. Khối đã được mạng lưới chấp thuận!`
              : `Nonce = ${testNonce} generates a Block Hash starting with '0000...'. The block is valid for consensus!`,
        });
      }
    }, 40);
  };

  // 25. Reset Lab
  const handleResetLab = () => {
    onInteracted?.();
    setSender('Alice');
    setRecipient('Bob');
    setAmount(10);
    setMessage('Payment for research');
    setBlockNumber(42);
    setPrevHash('000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f');
    setTimestamp('2026-08-23 18:30:15');
    setNonce(208323);
    setPipelineStep('idle');
    setBeforeAfterDiff(null);
    setHighlightedComponent(null);
    setTransactions([
      {
        id: 'tx-1',
        sender: 'Alice',
        recipient: 'Bob',
        amount: 10,
        message: 'Payment for research',
        timestamp: '18:30:00',
        isSigned: true,
        isTampered: false,
        signature: '3045022100a94bf872e41c4961b7f0e9b97ca9910d5ec423',
        txHash: '',
      },
      {
        id: 'tx-2',
        sender: 'Bob',
        recipient: 'Charlie',
        amount: 4,
        message: 'Server hosting fee',
        timestamp: '18:30:04',
        isSigned: true,
        isTampered: false,
        signature: '3045022031ef82a7bc498801d941cb904a8b712fae498c01',
        txHash: '',
      },
      {
        id: 'tx-3',
        sender: 'Charlie',
        recipient: 'Dave',
        amount: 2,
        message: 'Peer review bounty',
        timestamp: '18:30:08',
        isSigned: true,
        isTampered: false,
        signature: '30450221008f1b9472e391b4028f8ac7201bb8d923fa8c02',
        txHash: '',
      },
      {
        id: 'tx-4',
        sender: 'Dave',
        recipient: 'Alice',
        amount: 1,
        message: 'Coffee payback',
        timestamp: '18:30:12',
        isSigned: true,
        isTampered: false,
        signature: '3045022062fa9108c3e809187a22091faec8991bce098231',
        txHash: '',
      },
    ]);
    setSelectedTxId('tx-1');
    setFeedback({
      type: 'info',
      title: language === 'vi' ? '✓ Đã Đặt Lại Phòng Thí Nghiệm' : '✓ Lab Reset to Defaults',
      description:
        language === 'vi'
          ? 'Toàn bộ trạng thái giao dịch, cây Merkle và Block Header đã khôi phục nguyên bản.'
          : 'All transaction states, Merkle tree, and Block Header restored to default baseline.',
    });
  };

  // 25. Populate Random realistic transactions
  const handleRandomData = () => {
    onInteracted?.();
    const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Grace', 'Satoshi'];
    const msgs = [
      'P2P transfer',
      'Smart contract invoke',
      'NFT purchase',
      'Staking deposit',
      'Validator reward',
      'Liquidity pool swap',
    ];

    const randomTxs: HandsOnTx[] = Array.from({ length: 4 }).map((_, i) => {
      const s = names[i % names.length];
      const r = names[(i + 1) % names.length];
      const a = Math.floor(Math.random() * 25) + 1;
      const m = msgs[i % msgs.length];
      const t = `18:30:${(i * 10).toString().padStart(2, '0')}`;
      return {
        id: `tx-rand-${i + 1}`,
        sender: s,
        recipient: r,
        amount: a,
        message: m,
        timestamp: t,
        isSigned: true,
        isTampered: false,
        signature: '3045022100' + calcSha256(`rand_sig_${i}_${Date.now()}`).slice(0, 38),
        txHash: '',
      };
    });

    setTransactions(randomTxs);
    setSelectedTxId(randomTxs[0].id);
    setBeforeAfterDiff(null);

    setFeedback({
      type: 'success',
      title: language === 'vi' ? '🎲 Dữ Liệu Ngẫu Nhiên Đã Tạo' : '🎲 Random Transactions Generated',
      description:
        language === 'vi'
          ? 'Đã tải 4 giao dịch ngẫu nhiên mới và tự động tái tạo Cây Merkle Root.'
          : 'Loaded 4 realistic transactions and automatically generated the Merkle Tree.',
    });
  };

  return (
    <div className="space-y-6">
      {/* 27. Mode Header / Hero Card */}
      <div className="p-6 rounded-2xl bg-[#070b14] border border-emerald-500/30 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>
                {language === 'vi'
                  ? 'CHẾ ĐỘ THAO TÁC & MÔ PHỎNG TRỰC TIẾP'
                  : 'HANDS-ON INTERACTIVE LAB'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {language === 'vi'
                ? 'Tự Tay Xây Dựng Block & Khám Phá Mối Quan Hệ Mật Mã'
                : 'Build a Live Block & Explore Cryptographic Relationships'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {language === 'vi'
                ? 'Hãy tự nhập người gửi, ký số, gom vào Block Body, quan sát Cây Merkle tự động kết nối vào Block Header, và thử nghiệm "Tấn công giả mạo" để thấy toàn bộ khối bị vô hiệu hóa ra sao.'
                : 'Input senders, sign payloads, organize the Block Body, watch Merkle trees dynamically build, and trigger tamper attacks to watch the cryptographic cascade.'}
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {onSwitchToGuided && (
              <button
                type="button"
                onClick={onSwitchToGuided}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:text-white"
              >
                <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'vi' ? 'Về Chế Độ Hướng Dẫn' : 'Guided Lessons'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleRandomData}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:text-white"
            >
              <Shuffle className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === 'vi' ? 'Dữ Liệu Ngẫu Nhiên' : 'Random Data'}</span>
            </button>
            <button
              type="button"
              onClick={handleResetLab}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:text-rose-300 hover:border-rose-500/40"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'vi' ? 'Đặt Lại Lab' : 'Reset Lab'}</span>
            </button>
          </div>
        </div>

        {/* 26. Real-time Educational Feedback Banner */}
        <div
          className={`mt-4 p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-300 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
              : feedback.type === 'error'
              ? 'bg-rose-950/60 border-rose-500/60 text-rose-300'
              : feedback.type === 'warning'
              ? 'bg-amber-950/50 border-amber-500/50 text-amber-300'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : feedback.type === 'error' ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : feedback.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-0.5">
            <div className="font-bold tracking-wide uppercase font-mono">{feedback.title}</div>
            <div className="text-slate-300 leading-relaxed">{feedback.description}</div>
          </div>
        </div>
      </div>

      {/* 20. Main Responsive Split Layout: LEFT Controls vs. RIGHT Live Block & Merkle Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            LEFT COLUMN (5 Cols): Workbench, Inputs, Signing & Tamper Lab
            ======================================================== */}
        <div className="lg:col-span-5 space-y-5">
          {/* 19.2 CREATE TRANSACTION WORKBENCH */}
          <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <FileCode className="w-4 h-4" />
                <span>{language === 'vi' ? '19.2 Tạo Giao Dịch Mới' : '19.2 Create New Transaction'}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                TX CREATOR
              </span>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase">
                    {language === 'vi' ? 'Người gửi (Sender)' : 'Sender'}
                  </label>
                  <input
                    type="text"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="Alice"
                  />
                  <div className="flex gap-1 pt-1">
                    {['Alice', 'Satoshi', 'Vitalik'].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSender(n)}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase">
                    {language === 'vi' ? 'Người nhận (Recipient)' : 'Recipient'}
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="Bob"
                  />
                  <div className="flex gap-1 pt-1">
                    {['Bob', 'Charlie', 'Dave'].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRecipient(n)}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase">
                    {language === 'vi' ? 'Số tiền (BTC)' : 'Amount (BTC)'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    min={0.001}
                    step={0.5}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase">
                    {language === 'vi' ? 'Thông điệp / Data' : 'Message / Data'}
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="Payment for research"
                  />
                </div>
              </div>

              {/* Action Button & Pipeline Animation */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreateTransaction}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{language === 'vi' ? '+ TẠO TRANSACTION' : '+ CREATE TRANSACTION'}</span>
                </button>
              </div>

              {/* Pipeline Flow Visualization */}
              <div className="p-3 rounded-xl bg-black/50 border border-slate-800/80 space-y-2">
                <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                  <span>{language === 'vi' ? 'Quy Trình Tạo Giao Dịch:' : 'Creation Pipeline:'}</span>
                  <span className="text-emerald-400 font-bold">
                    {pipelineStep === 'idle'
                      ? language === 'vi'
                        ? 'CHỜ SẴN SÀNG'
                        : 'IDLE'
                      : pipelineStep === 'validating'
                      ? language === 'vi'
                        ? 'ĐANG KIỂM TRA...'
                        : 'VALIDATING...'
                      : pipelineStep === 'created'
                      ? language === 'vi'
                        ? 'ĐÃ TẠO XONG'
                        : 'CREATED'
                      : pipelineStep === 'signing'
                      ? language === 'vi'
                        ? 'ĐANG BĂM & KÝ SỐ...'
                        : 'HASHING & SIGNING...'
                      : language === 'vi'
                      ? '✓ SẴN SÀNG / ĐÃ KÝ'
                      : '✓ READY / SIGNED'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[9px]">
                  <div
                    className={`p-1.5 rounded border transition-all ${
                      pipelineStep !== 'idle'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    1. {language === 'vi' ? 'NHẬP LIỆU' : 'INPUT'}
                  </div>
                  <div
                    className={`p-1.5 rounded border transition-all ${
                      pipelineStep === 'validating' ||
                      pipelineStep === 'created' ||
                      pipelineStep === 'ready-to-sign' ||
                      pipelineStep === 'signing' ||
                      pipelineStep === 'signed'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    2. {language === 'vi' ? 'KIỂM TRA' : 'VALIDATE'}
                  </div>
                  <div
                    className={`p-1.5 rounded border transition-all ${
                      pipelineStep === 'created' ||
                      pipelineStep === 'ready-to-sign' ||
                      pipelineStep === 'signing' ||
                      pipelineStep === 'signed'
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    3. {language === 'vi' ? 'ĐÃ TẠO' : 'CREATED'}
                  </div>
                  <div
                    className={`p-1.5 rounded border transition-all ${
                      pipelineStep === 'signed'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    4. {language === 'vi' ? 'ĐÃ KÝ' : 'SIGNED'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 19.3 DIGITAL SIGNATURE INTERACTION WORKBENCH */}
          <div className="p-5 rounded-2xl bg-[#090d16] border border-purple-900/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                <KeyRound className="w-4 h-4" />
                <span>
                  {language === 'vi'
                    ? '19.3 Chữ Ký Điện Tử (Digital Signature Pipeline)'
                    : '19.3 Digital Signature Pipeline'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                ECDSA / SECP256K1
              </span>
            </div>

            {/* Selected Tx Preview Box */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-white">
                  {currentSelectedTx.sender} → {currentSelectedTx.recipient}
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {currentSelectedTx.amount} BTC
                </span>
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                {language === 'vi' ? 'Dữ liệu giao dịch:' : 'Data payload:'}{' '}
                <span className="text-slate-200">"{currentSelectedTx.message}"</span>
              </div>

              {/* Cryptographic Pipeline Display */}
              <div className="space-y-1.5 pt-1 text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transaction Hash:</span>
                  <span className="text-emerald-400 font-bold">
                    {currentSelectedTx.txHash
                      ? `${currentSelectedTx.txHash.slice(0, 8)}...${currentSelectedTx.txHash.slice(-6)}`
                      : 'Computing...'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Public Key:</span>
                  <span className="text-purple-300">
                    03ab72f89c...91de ({currentSelectedTx.sender})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Signature:</span>
                  <span
                    className={`font-bold ${
                      currentSelectedTx.isSigned
                        ? currentSelectedTx.isTampered
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {currentSelectedTx.isSigned
                      ? `${currentSelectedTx.signature.slice(0, 10)}...${currentSelectedTx.signature.slice(-4)}`
                      : language === 'vi'
                      ? 'Chưa ký'
                      : 'Unsigned'}
                  </span>
                </div>
              </div>

              {/* Signature Status Alert */}
              <div className="pt-1">
                {currentSelectedTx.isTampered ? (
                  <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/60 text-rose-300 text-[11px] font-mono flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      {language === 'vi'
                        ? '❌ SIGNATURE INVALID: Dữ liệu bị thay đổi sau khi ký!'
                        : '❌ SIGNATURE INVALID: Data altered after signing!'}
                    </span>
                  </div>
                ) : currentSelectedTx.isSigned ? (
                  <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-[11px] font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {language === 'vi'
                        ? '✓ SIGNATURE VALID: Chữ ký chính chủ hợp lệ 100%'
                        : '✓ SIGNATURE VALID: Signature authentic and valid'}
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-mono flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {language === 'vi'
                        ? 'Giao dịch chưa được ký bằng Private Key'
                        : 'Transaction not yet signed with Private Key'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Control Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleSignTransaction}
                className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'KÝ GIAO DỊCH' : 'SIGN TX'}</span>
              </button>

              <button
                type="button"
                onClick={handleVerifySignature}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'vi' ? 'XÁC MINH' : 'VERIFY'}</span>
              </button>
            </div>
          </div>

          {/* 19.6 TAMPER ATTACK WORKBENCH (NGƯỜI HỌC TỰ PHÁ DỮ LIỆU) */}
          <div className="p-5 rounded-2xl bg-[#090d16] border border-rose-900/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {language === 'vi'
                    ? '19.6 Tấn Công Giả Mạo (Tamper Attack Lab)'
                    : '19.6 Tamper Attack Lab'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                SECURITY ATTACK
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'vi'
                ? 'Hãy thử giả mạo số tiền của một giao dịch (ví dụ: sửa từ 2 BTC → 1000 BTC) để trực quan thấy hiệu ứng thác đổ (Avalanche Cascade) làm hỏng Cây Merkle và vô hiệu hóa toàn bộ Block.'
                : 'Tamper with a transaction amount (e.g. 2 BTC → 1000 BTC) to visually witness the cryptographic avalanche cascade break the Merkle Root and compromise the whole block.'}
            </p>

            {/* Quick Tamper Trigger Buttons for Each Tx */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase">
                {language === 'vi' ? 'Chọn giao dịch để tấn công:' : 'Select transaction to tamper:'}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {processedTxs.map((tx, idx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => handleTamperTransaction(tx.id, tx.amount === 1000 ? 5 : 1000)}
                    className={`p-2.5 rounded-xl border text-left font-mono text-xs transition-all cursor-pointer flex flex-col justify-between ${
                      tx.isTampered
                        ? 'bg-rose-950/70 border-rose-500 text-rose-200'
                        : 'bg-black/60 border-slate-800 hover:border-rose-500/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">TX #0{idx + 1}</span>
                      {tx.isTampered ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500 text-white font-bold">
                          TAMPERED
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-500">OK</span>
                      )}
                    </div>
                    <div className="text-[11px] truncate mt-1">
                      {tx.sender} → {tx.recipient}
                    </div>
                    <div className="text-[10px] font-bold text-amber-400">
                      {tx.amount} BTC
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 24. Before / After Diff Comparison Box */}
            {beforeAfterDiff && (
              <div className="p-3.5 rounded-xl bg-black/70 border border-rose-500/40 space-y-2 text-xs font-mono">
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{language === 'vi' ? 'BIẾN ĐỔI TRƯỚC / SAU KHI GIẢ MẠO:' : 'BEFORE / AFTER TAMPER DIFF:'}</span>
                  <span className="text-slate-400">{beforeAfterDiff.txLabel}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="text-emerald-400 font-bold">TRƯỚC (BEFORE)</div>
                    <div className="text-slate-400">TX Hash: {beforeAfterDiff.originalTxHash.slice(0, 6)}...</div>
                    <div className="text-slate-400">Root: {beforeAfterDiff.originalMerkleRoot.slice(0, 6)}...</div>
                    <div className="text-slate-400">Block: {beforeAfterDiff.originalBlockHash.slice(0, 6)}...</div>
                  </div>

                  <div className="p-2 rounded bg-rose-950/40 border border-rose-800/80 space-y-1">
                    <div className="text-rose-400 font-bold">SAU (AFTER)</div>
                    <div className="text-rose-300">TX Hash: {beforeAfterDiff.newTxHash.slice(0, 6)}...</div>
                    <div className="text-rose-300">Root: {beforeAfterDiff.newMerkleRoot.slice(0, 6)}...</div>
                    <div className="text-rose-300">Block: {beforeAfterDiff.newBlockHash.slice(0, 6)}...</div>
                  </div>
                </div>

                <div className="text-[10px] text-center text-amber-400 font-bold pt-1">
                  DATA CHANGED → HASH CASCADE → INTEGRITY COMPROMISED
                </div>
              </div>
            )}
          </div>

          {/* 19.7, 19.8, 19.9 HEADER PARAMETERS LAB */}
          <div className="p-5 rounded-2xl bg-[#090d16] border border-amber-900/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>
                  {language === 'vi'
                    ? '19.7 - 19.9 Siêu Dữ Liệu Header (Timestamp, PrevHash, Nonce)'
                    : '19.7 - 19.9 Header Metadata Lab'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                HEADER TUNING
              </span>
            </div>

            {/* Timestamp Control */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>{language === 'vi' ? 'Dấu thời gian (Timestamp):' : 'Block Timestamp:'}</span>
                <span className="text-amber-400">{timestamp}</span>
              </label>
              <div className="flex gap-1.5">
                {['2026-08-23 18:30:15', '2026-08-23 18:31:00', '2026-08-23 19:00:00'].map((t, idx) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleUpdateTimestamp(t)}
                    className="flex-1 py-1 px-2 rounded-lg bg-black/60 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 transition-all"
                  >
                    {idx === 0 ? '+0s' : idx === 1 ? '+45s' : '+30m'}
                  </button>
                ))}
              </div>
            </div>

            {/* Previous Hash Linkage Control */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>{language === 'vi' ? 'Previous Hash (Mắt xích khối trước):' : 'Previous Hash Linkage:'}</span>
                <span className={isChainLinkValid ? 'text-emerald-400' : 'text-rose-400'}>
                  {isChainLinkValid ? '✓ LINKED' : '❌ BROKEN'}
                </span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePrevHash(false)}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-mono text-xs transition-all ${
                    isChainLinkValid
                      ? 'bg-emerald-950/60 border border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border border-slate-700 text-slate-400'
                  }`}
                >
                  {language === 'vi' ? 'Mã Băm Chuẩn #41' : 'Canonical #41 Hash'}
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePrevHash(true)}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-mono text-xs transition-all ${
                    !isChainLinkValid
                      ? 'bg-rose-950/70 border border-rose-500 text-rose-300'
                      : 'bg-slate-900 border border-slate-700 text-slate-400'
                  }`}
                >
                  {language === 'vi' ? '⚠ Phá Vỡ Mắt Xích' : '⚠ Corrupt Hash'}
                </button>
              </div>
            </div>

            {/* Nonce & Proof-of-Work Connector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>{language === 'vi' ? 'Nonce:' : 'Nonce (Mining Variable):'}</span>
                <span className="text-emerald-400 font-bold">{nonce}</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={nonce}
                  onChange={(e) => setNonce(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleFindValidNonce}
                  disabled={isMining}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Cpu className={`w-3.5 h-3.5 ${isMining ? 'animate-spin' : ''}`} />
                  <span>
                    {isMining
                      ? language === 'vi'
                        ? 'ĐANG ĐÀO...'
                        : 'MINING...'
                      : language === 'vi'
                      ? 'TÌM NONCE HỢP LỆ (PoW)'
                      : 'FIND VALID NONCE (PoW)'}
                  </span>
                </button>
              </div>
              {isMining && (
                <div className="text-[10px] font-mono text-amber-400 flex items-center justify-between pt-1">
                  <span>Mining speed: {miningSpeed} H/s</span>
                  <span>Target: 0000...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN (7 Cols): Live Block Visualization & Cyber Merkle Tree
            ======================================================== */}
        <div className="lg:col-span-7 space-y-5">
          {/* 21. CRYPTOGRAPHIC DATA STREAM BAR */}
          <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 shadow-sm flex items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-emerald-400">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {isComputingHash
                  ? language === 'vi'
                    ? 'ĐANG TÍNH BẢN BĂM (HASHING)...'
                    : 'HASH COMPUTING...'
                  : 'CANONICAL SHA-256 PIPELINE'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono truncate max-w-xs sm:max-w-md bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              {hashStreamText || blockHash}
            </div>
          </div>

          {/* 20. LIVE BLOCK CONTAINER */}
          <div
            className={`p-5 rounded-2xl bg-[#090d16] border shadow-sm space-y-5 transition-all duration-300 ${
              isBlockValid
                ? 'border-emerald-500/40'
                : 'border-rose-500/60'
            }`}
          >
            {/* Block Header Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Boxes className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-base font-extrabold text-white font-mono flex items-center gap-2">
                    <span>BLOCK #{blockNumber}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        isBlockValid
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                      }`}
                    >
                      {isBlockValid
                        ? language === 'vi'
                          ? '✓ BLOCK TOÀN VẸN (VALID)'
                          : '✓ BLOCK VALID'
                        : language === 'vi'
                        ? '⚠ TOÀN VẸN BỊ PHÁ VỠ'
                        : '⚠ INTEGRITY COMPROMISED'}
                    </span>
                  </h4>
                </div>
              </div>

              {/* Dependency Highlight Legend */}
              <div className="text-[10px] font-mono text-slate-400">
                {language === 'vi'
                  ? 'Nhấn hoặc rê chuột để làm sáng chuỗi quan hệ'
                  : 'Click/hover elements to trace dependency chain'}
              </div>
            </div>

            {/* 1. BLOCK HEADER SECTION (YELLOW / CYAN THEME) */}
            <div
              className={`p-4 rounded-xl bg-black/70 border transition-all ${
                highlightedComponent === 'header' ||
                highlightedComponent === 'merkleRoot' ||
                highlightedComponent === 'prevHash'
                  ? 'border-emerald-400 ring-2 ring-emerald-500/30 bg-emerald-950/20'
                  : 'border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>BLOCK HEADER (~80 Bytes)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Metadata Only</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                {/* Previous Hash */}
                <div
                  onMouseEnter={() => setHighlightedComponent('prevHash')}
                  onMouseLeave={() => setHighlightedComponent(null)}
                  className={`p-2.5 rounded-lg bg-slate-900/80 border transition-all cursor-pointer ${
                    highlightedComponent === 'prevHash'
                      ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                      : isChainLinkValid
                      ? 'border-slate-800 text-slate-300'
                      : 'border-rose-500 bg-rose-950/30 text-rose-300'
                  }`}
                >
                  <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                    <span>Previous Hash</span>
                    {isChainLinkValid ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-400" />
                    )}
                  </div>
                  <div className="truncate font-bold mt-0.5">
                    {prevHash.slice(0, 14)}...{prevHash.slice(-10)}
                  </div>
                </div>

                {/* Merkle Root */}
                <div
                  onMouseEnter={() => setHighlightedComponent('merkleRoot')}
                  onMouseLeave={() => setHighlightedComponent(null)}
                  className={`p-2.5 rounded-lg bg-slate-900/80 border transition-all cursor-pointer ${
                    highlightedComponent === 'merkleRoot'
                      ? 'border-indigo-400 bg-indigo-950/40 text-indigo-200'
                      : hasTamperedTx
                      ? 'border-rose-500 bg-rose-950/30 text-rose-300'
                      : 'border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                    <span>Merkle Root</span>
                    <GitFork className="w-3 h-3 text-indigo-400" />
                  </div>
                  <div className="truncate font-bold mt-0.5 text-indigo-300">
                    {merkleTree.root.slice(0, 14)}...{merkleTree.root.slice(-10)}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <div className="text-[10px] text-slate-400 uppercase">Timestamp</div>
                  <div className="font-bold mt-0.5 text-amber-300">{timestamp}</div>
                </div>

                {/* Nonce */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <div className="text-[10px] text-slate-400 uppercase">Nonce</div>
                  <div className="font-bold mt-0.5 text-emerald-300">{nonce}</div>
                </div>
              </div>

              {/* Header SHA-256 output (Block Hash) */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-[11px] font-mono text-slate-400">
                  SHA-256(SHA-256(Block Header)) →
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold truncate max-w-full sm:max-w-md ${
                    isBlockValid
                      ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
                  }`}
                >
                  {blockHash}
                </div>
              </div>
            </div>

            {/* 19.5 LIVE MERKLE TREE (CYBER-LAB VISUAL FLOW) */}
            <div className="p-4 rounded-xl bg-black/70 border border-indigo-500/30 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5" />
                  <span>19.5 Live Merkle Tree (Cây Merkle Tự Động)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {processedTxs.length} Transactions
                </span>
              </div>

              {/* Tree Diagram Flow */}
              <div className="space-y-4 font-mono text-xs">
                {/* Level 2: Merkle Root Node */}
                <div className="flex justify-center">
                  <div
                    onMouseEnter={() => setHighlightedComponent('merkleRoot')}
                    onMouseLeave={() => setHighlightedComponent(null)}
                    className={`p-3 rounded-xl border text-center transition-all duration-300 max-w-md w-full cursor-pointer ${
                      hasTamperedTx
                        ? 'bg-rose-950/60 border-rose-500 text-rose-200 ring-2 ring-rose-500/40'
                        : 'bg-indigo-950/60 border-indigo-500/60 text-indigo-200 ring-2 ring-indigo-500/30'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      MERKLE ROOT (Level 2)
                    </div>
                    <div className="font-bold text-xs truncate mt-0.5 text-indigo-300">
                      {merkleTree.root}
                    </div>
                  </div>
                </div>

                {/* Connecting Lines / Down Arrows */}
                <div className="flex justify-around text-slate-600 px-8">
                  <ArrowDown className="w-3.5 h-3.5 text-indigo-400/80" />
                  <ArrowDown className="w-3.5 h-3.5 text-indigo-400/80" />
                </div>

                {/* Level 1: Pair Hashes */}
                <div className="grid grid-cols-2 gap-4">
                  {merkleTree.level1.map((h, i) => {
                    const isBranchTampered =
                      i === 0
                        ? processedTxs[0]?.isTampered || processedTxs[1]?.isTampered
                        : processedTxs[2]?.isTampered || processedTxs[3]?.isTampered;

                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border text-center font-mono text-xs transition-all ${
                          isBranchTampered
                            ? 'bg-rose-950/50 border-rose-500 text-rose-300'
                            : 'bg-slate-900/90 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="text-[9px] uppercase text-slate-500">
                          Parent Hash #{i + 1} ({i === 0 ? 'TX1 + TX2' : 'TX3 + TX4'})
                        </div>
                        <div className="truncate font-bold mt-0.5">{h}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Connecting Lines to Leaves */}
                <div className="grid grid-cols-4 text-center text-slate-600">
                  <ArrowDown className="w-3.5 h-3.5 mx-auto text-slate-500" />
                  <ArrowDown className="w-3.5 h-3.5 mx-auto text-slate-500" />
                  <ArrowDown className="w-3.5 h-3.5 mx-auto text-slate-500" />
                  <ArrowDown className="w-3.5 h-3.5 mx-auto text-slate-500" />
                </div>

                {/* Level 0: Leaf Nodes (Transaction Hashes) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {processedTxs.map((tx, idx) => (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTxId(tx.id)}
                      className={`p-2 rounded-xl border font-mono text-[11px] cursor-pointer transition-all ${
                        selectedTxId === tx.id
                          ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-950/40 text-emerald-200'
                          : tx.isTampered
                          ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                          : 'bg-black/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span>TX #0{idx + 1}</span>
                        {tx.isTampered ? (
                          <span className="text-rose-400">TAMPER</span>
                        ) : tx.isSigned ? (
                          <span className="text-emerald-400">SIGNED</span>
                        ) : (
                          <span className="text-slate-500">RAW</span>
                        )}
                      </div>
                      <div className="truncate text-white font-bold mt-1">
                        {tx.sender} → {tx.recipient}
                      </div>
                      <div className="text-[10px] text-amber-400 font-bold">
                        {tx.amount} BTC
                      </div>
                      <div className="text-[9px] text-slate-500 truncate mt-1">
                        {tx.txHash ? tx.txHash.slice(0, 10) + '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. BLOCK BODY (TRANSACTIONS PAYLOAD) */}
            <div className="p-4 rounded-xl bg-black/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BLOCK BODY (~1 - 4 MB)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {processedTxs.length} Transactions Included
                </span>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                {processedTxs.map((tx, idx) => (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTxId(tx.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      selectedTxId === tx.id
                        ? 'border-emerald-500 bg-emerald-950/30'
                        : tx.isTampered
                        ? 'border-rose-500/60 bg-rose-950/30'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/60 text-slate-300 border border-slate-800">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                          <span>
                            {tx.sender} → {tx.recipient}
                          </span>
                          <span className="text-amber-400">{tx.amount} BTC</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          "{tx.message}"
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      {tx.isTampered ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          ❌ TAMPERED
                        </span>
                      ) : tx.isSigned ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ✓ SIGNED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          UNSIGNED
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTamperTransaction(tx.id);
                        }}
                        className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-[10px] cursor-pointer"
                      >
                        {language === 'vi' ? 'Sửa' : 'Tamper'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 22. VISUAL DEPENDENCY RELATIONSHIP SUMMARY */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2.5 font-mono text-xs text-slate-300">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              {language === 'vi'
                ? '22. Sơ Đồ Luồng Dữ Liệu & Ràng Buộc Mật Mã Khối'
                : '22. Cryptographic Dependency Pipeline'}
            </div>
            <div className="p-3 rounded-xl bg-black/60 border border-slate-800/80 text-[11px] leading-relaxed space-y-1">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400 font-bold">Transaction</span> →{' '}
                <span className="text-purple-400 font-bold">Signature</span> +{' '}
                <span className="text-emerald-400 font-bold">Hash</span> →{' '}
                <span className="text-indigo-400 font-bold">Merkle Tree</span> →{' '}
                <span className="text-indigo-300 font-bold">Merkle Root</span> →{' '}
                <span className="text-amber-400 font-bold">Block Header</span> →{' '}
                <span className="text-emerald-400 font-bold">Block Hash</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1">
                {language === 'vi'
                  ? 'Bất kỳ sự thay đổi nào ở từng byte dữ liệu giao dịch cũng làm đổi toàn bộ chuỗi mắt xích mật mã, khiến việc gian lận trong Blockchain là bất khả thi về mặt toán học.'
                  : 'Any modification in a single transaction byte ripples across the entire cryptographic chain, rendering mathematical fraud impossible.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
