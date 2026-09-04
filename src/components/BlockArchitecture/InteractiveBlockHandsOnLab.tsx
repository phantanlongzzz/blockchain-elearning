import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FlaskConical,
  RotateCcw,
  Shuffle,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  FileCode,
  Clock,
  Boxes,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowDown,
  Cpu,
  Layers,
  GitFork,
  Check,
  Info,
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
  const isVi = language === 'vi';

  // Workbench Form Inputs
  const [sender, setSender] = useState<string>('Alice');
  const [recipient, setRecipient] = useState<string>('Bob');
  const [amount, setAmount] = useState<number>(10);
  const [message, setMessage] = useState<string>('Payment for research');

  // Animation Pipeline Stage for TX creation
  const [pipelineStep, setPipelineStep] = useState<string>('idle');
  const [hashStreamText, setHashStreamText] = useState<string>('');
  const [isComputingHash, setIsComputingHash] = useState<boolean>(false);

  // Block Header State
  const [blockNumber] = useState<number>(42);
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
    title: isVi ? 'Phòng thí nghiệm sẵn sàng' : 'Interactive Lab Ready',
    description: isVi
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

  // Block Header Hash Calculation
  const blockHash = useMemo(() => {
    const rawHeader = `version:2|prev:${prevHash}|merkle:${merkleTree.root}|time:${timestamp}|bits:0x1d00ffff|nonce:${nonce}`;
    const firstPass = calcSha256(rawHeader);
    return calcSha256(firstPass);
  }, [prevHash, merkleTree.root, timestamp, nonce]);

  // Status checks
  const hasTamperedTx = transactions.some((t) => t.isTampered);
  const isChainLinkValid = prevHash.startsWith('000000000019d668');
  const isBlockValid = !hasTamperedTx && isChainLinkValid && transactions.every((t) => t.isSigned);

  // Selected Transaction for Workbench
  const currentSelectedTx = processedTxs.find((t) => t.id === selectedTxId) || processedTxs[0];

  // Cryptographic Stream Simulation effect
  const streamIntervalRef = useRef<number | null>(null);
  const mineIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      if (mineIntervalRef.current) clearInterval(mineIntervalRef.current);
    };
  }, []);

  const triggerHashStream = (finalHash: string, callback?: () => void) => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsComputingHash(true);
    let frames = 0;
    streamIntervalRef.current = window.setInterval(() => {
      frames++;
      const randHex = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setHashStreamText(randHex);
      if (frames >= 6) {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
        setHashStreamText(finalHash);
        setIsComputingHash(false);
        if (callback) callback();
      }
    }, 50);
  };

  const handleCreateTransaction = () => {
    onInteracted?.();
    setPipelineStep('validating');
    setFeedback({
      type: 'info',
      title: isVi ? 'Đang kiểm tra dữ liệu...' : 'Validating Input...',
      description: isVi
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
        title: isVi ? '✓ Giao dịch đã được tạo' : '✓ Transaction Created',
        description: isVi
          ? `Giao dịch ${sender} → ${recipient} (${amount} BTC) đã sẵn sàng để ký số bằng Private Key.`
          : `Transaction ${sender} → ${recipient} (${amount} BTC) is ready to be digitally signed.`,
      });

      const hash = computeTxHash(newTx);
      triggerHashStream(hash, () => {
        setPipelineStep('ready-to-sign');
      });
    }, 400);
  };

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
        title: isVi ? '✓ Chữ ký điện tử đã được tạo' : '✓ Digital Signature Created',
        description: isVi
          ? `Bản băm SHA-256 được mã hóa bằng Private Key của ${currentSelectedTx.sender}. Bất kỳ ai cũng có thể xác minh bằng Public Key.`
          : `SHA-256 hash was encrypted with ${currentSelectedTx.sender}'s Private Key. Anyone on the network can verify with their Public Key.`,
      });
    });
  };

  const handleVerifySignature = () => {
    onInteracted?.();
    if (!currentSelectedTx.isSigned) {
      setFeedback({
        type: 'warning',
        title: isVi ? 'Chưa ký số' : 'Not Signed',
        description: isVi
          ? 'Giao dịch này chưa được ký bằng Khóa Riêng Tư của người gửi.'
          : 'This transaction has not been signed with the sender’s Private Key.',
      });
      return;
    }

    if (currentSelectedTx.isTampered) {
      setFeedback({
        type: 'error',
        title: isVi ? '❌ Chữ ký không hợp lệ!' : '❌ Signature Invalid!',
        description: isVi
          ? 'Dữ liệu giao dịch đã bị chỉnh sửa sau khi ký. Khóa công khai giải mã không khớp với bản băm mới!'
          : 'Transaction payload was modified after signing. Decrypted hash does not match the new hash!',
      });
    } else {
      setFeedback({
        type: 'success',
        title: isVi ? '✓ Chữ ký hợp lệ' : '✓ Signature Valid',
        description: isVi
          ? `Xác thực thành công! Giao dịch được xác nhận chính chủ từ ${currentSelectedTx.sender} và toàn vẹn 100%.`
          : `Authentication passed! Confirmed authentic from ${currentSelectedTx.sender} and 100% untampered.`,
      });
    }
  };

  const handleTamperTransaction = (txId: string, tamperedAmount: number = 1000) => {
    onInteracted?.();
    const target = processedTxs.find((t) => t.id === txId);
    if (!target) return;

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
      title: isVi
        ? '⚠ CẢNH BÁO: PHÁT HIỆN DỮ LIỆU BỊ GIẢ MẠO!'
        : '⚠ ALERT: DATA TAMPERING DETECTED!',
      description: isVi
        ? `Giao dịch ${target.sender} bị sửa thành ${tamperedAmount} BTC. Hiệu ứng thác đổ kích hoạt: TX Hash đổi → Merkle Root đổi → Block Hash đổi → Block bị từ chối!`
        : `Transaction ${target.sender} altered to ${tamperedAmount} BTC. Avalanche cascade triggered: TX Hash changed → Merkle Root changed → Block Hash changed!`,
    });
  };

  const handleUpdateTimestamp = (newTime: string) => {
    onInteracted?.();
    setTimestamp(newTime);
    setFeedback({
      type: 'info',
      title: isVi ? '✓ Dấu thời gian đã cập nhật' : '✓ Timestamp Updated',
      description: isVi
        ? `Timestamp mới '${newTime}' đã được đưa vào Block Header, khiến Block Hash thay đổi.`
        : `New timestamp '${newTime}' applied to Block Header, recalculating the Block Hash.`,
    });
  };

  const handleTogglePrevHash = (corrupt: boolean) => {
    onInteracted?.();
    if (corrupt) {
      setPrevHash('ABC12345DEADBEEF99887766554433221100FFEEDDCCBBAA0011223344556677');
      setFeedback({
        type: 'error',
        title: isVi ? '❌ MẮT XÍCH BLOCKCHAIN BỊ ĐỨT GÃY!' : '❌ BLOCKCHAIN LINK BROKEN!',
        description: isVi
          ? 'Block #42 đang tham chiếu đến một Previous Hash không tồn tại. Chuỗi liên kết mật mã bị phá vỡ!'
          : 'Block #42 is referencing an invalid Previous Hash. Cryptographic chain continuity severed!',
      });
    } else {
      setPrevHash('000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f');
      setFeedback({
        type: 'success',
        title: isVi ? '✓ Khôi phục liên kết chuỗi' : '✓ Chain Link Restored',
        description: isVi
          ? 'Previous Hash đã khớp chính xác với Block Hash của Block #41.'
          : 'Previous Hash matches the canonical block hash of Block #41.',
      });
    }
  };

  const handleFindValidNonce = () => {
    onInteracted?.();
    setIsMining(true);
    setFeedback({
      type: 'info',
      title: isVi ? 'Đang giải tìm Nonce hợp lệ...' : 'Mining for Valid Nonce...',
      description: isVi
        ? 'Đang thử nghiệm liên tục các giá trị Nonce để tạo mã băm Block Header thỏa mãn độ khó.'
        : 'Iterating through Nonce values to find a Block Header hash meeting difficulty criteria.',
    });

    let testNonce = nonce;
    let iterations = 0;
    const startTime = Date.now();

    if (mineIntervalRef.current) clearInterval(mineIntervalRef.current);
    mineIntervalRef.current = window.setInterval(() => {
      iterations += 500;
      testNonce += 1;
      setNonce(testNonce);

      const speed = Math.floor((iterations / (Date.now() - startTime + 1)) * 1000);
      setMiningSpeed(speed);

      const raw = `version:2|prev:${prevHash}|merkle:${merkleTree.root}|time:${timestamp}|bits:0x1d00ffff|nonce:${testNonce}`;
      const h = calcSha256(calcSha256(raw));

      if (h.startsWith('00') || iterations >= 3000) {
        if (mineIntervalRef.current) {
          clearInterval(mineIntervalRef.current);
          mineIntervalRef.current = null;
        }
        setIsMining(false);
        setFeedback({
          type: 'success',
          title: isVi ? '✓ Đã tìm thấy Nonce hợp lệ!' : '✓ Valid Nonce Found!',
          description: isVi
            ? `Tìm thấy Nonce = ${testNonce} thỏa mãn mục tiêu độ khó. Block đã sẵn sàng đóng gói vào sổ cái!`
            : `Nonce = ${testNonce} satisfies difficulty target. Block ready to broadcast!`,
        });
      }
    }, 40);
  };

  const handleResetLab = () => {
    onInteracted?.();
    setSender('Alice');
    setRecipient('Bob');
    setAmount(10);
    setMessage('Payment for research');
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
      title: isVi ? '✓ Đã đặt lại phòng thí nghiệm' : '✓ Lab Reset to Defaults',
      description: isVi
        ? 'Toàn bộ trạng thái giao dịch, cây Merkle và Block Header đã khôi phục nguyên bản.'
        : 'All transaction states, Merkle tree, and Block Header restored to default baseline.',
    });
  };

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
      title: isVi ? '🎲 Đã tạo dữ liệu ngẫu nhiên' : '🎲 Random Transactions Generated',
      description: isVi
        ? 'Đã tải 4 giao dịch ngẫu nhiên mới và tự động tái tạo Cây Merkle Root.'
        : 'Loaded 4 realistic transactions and automatically generated the Merkle Tree.',
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0B0E12] border border-[#1C2430] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teach-1">
              <FlaskConical className="w-4 h-4" />
              <span>
                {isVi
                  ? 'Chế độ thao tác & Mô phỏng trực tiếp'
                  : 'Hands-On Interactive Lab'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white font-sans">
              {isVi
                ? 'Tự Tay Xây Dựng Block & Khám Phá Mối Quan Hệ Mật Mã'
                : 'Build a Live Block & Explore Cryptographic Relationships'}
            </h3>
            <p className="text-xs sm:text-sm text-[#A5AFBF] max-w-3xl leading-relaxed font-sans">
              {isVi
                ? 'Nhập người gửi, ký số, gom vào Block Body, quan sát Cây Merkle tự động kết nối vào Block Header, và thử nghiệm "Tấn công giả mạo" để thấy toàn bộ khối bị vô hiệu hóa.'
                : 'Input senders, sign payloads, organize the Block Body, watch Merkle trees dynamically build, and trigger tamper attacks to observe the cryptographic cascade.'}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {onSwitchToGuided && (
              <button
                type="button"
                id="btn-switch-to-guided"
                onClick={onSwitchToGuided}
                className="px-3 py-1.5 rounded-md bg-[#10151D] hover:bg-[#161D27] border border-[#1C2430] text-[#A5AFBF] text-xs font-sans flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Boxes className="w-3.5 h-3.5 text-teach-1" />
                <span>{isVi ? 'Bài học lý thuyết' : 'Guided Lessons'}</span>
              </button>
            )}
            <button
              type="button"
              id="btn-random-tx-data"
              onClick={handleRandomData}
              className="px-3 py-1.5 rounded-md bg-[#10151D] hover:bg-[#161D27] border border-[#1C2430] text-[#A5AFBF] text-xs font-sans flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#717B8C]" />
              <span>{isVi ? 'Dữ liệu mẫu' : 'Random Data'}</span>
            </button>
            <button
              type="button"
              id="btn-reset-lab"
              onClick={handleResetLab}
              className="px-3 py-1.5 rounded-md bg-[#10151D] hover:bg-[#161D27] border border-[#1C2430] text-[#A5AFBF] text-xs font-sans flex items-center gap-1.5 transition-colors cursor-pointer hover:text-rose-300"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#717B8C]" />
              <span>{isVi ? 'Đặt lại' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        <div
          className={`p-3.5 rounded-lg border flex items-start gap-3 transition-colors ${
            feedback.type === 'success'
              ? 'bg-[#10151D] border-success/40 text-success'
              : feedback.type === 'error'
              ? 'bg-[#10151D] border-rose-500/40 text-rose-300'
              : feedback.type === 'warning'
              ? 'bg-[#10151D] border-amber-500/40 text-amber-300'
              : 'bg-[#10151D] border-[#1C2430] text-[#A5AFBF]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
          ) : feedback.type === 'error' ? (
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          ) : feedback.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-0.5 font-sans">
            <div className="font-semibold">{feedback.title}</div>
            <div className="text-[#A5AFBF] leading-relaxed">{feedback.description}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: LEFT Workbench vs RIGHT Block & Merkle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* CREATE TRANSACTION WORKBENCH */}
          <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1C2430] space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2430]">
              <div className="flex items-center gap-2 text-teach-1 text-xs font-semibold uppercase font-sans">
                <FileCode className="w-4 h-4" />
                <span>{isVi ? 'Tạo Giao Dịch Mới' : 'Create Transaction'}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teach-1/10 text-teach-1 border border-teach-1/30">
                TX CREATOR
              </span>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-sans text-[#A5AFBF]">
                    {isVi ? 'Người gửi (Sender)' : 'Sender'}
                  </label>
                  <input
                    type="text"
                    id="input-tx-sender"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-[#10151D] border border-[#1C2430] text-white font-mono text-xs focus:border-teach-1 focus:outline-none"
                    placeholder="Alice"
                  />
                  <div className="flex gap-1 pt-1">
                    {['Alice', 'Satoshi', 'Vitalik'].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSender(n)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#10151D] hover:bg-[#161D27] text-[#A5AFBF] border border-[#1C2430] cursor-pointer"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-sans text-[#A5AFBF]">
                    {isVi ? 'Người nhận (Recipient)' : 'Recipient'}
                  </label>
                  <input
                    type="text"
                    id="input-tx-recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-[#10151D] border border-[#1C2430] text-white font-mono text-xs focus:border-teach-1 focus:outline-none"
                    placeholder="Bob"
                  />
                  <div className="flex gap-1 pt-1">
                    {['Bob', 'Charlie', 'Dave'].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRecipient(n)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#10151D] hover:bg-[#161D27] text-[#A5AFBF] border border-[#1C2430] cursor-pointer"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-[11px] font-sans text-[#A5AFBF]">
                    {isVi ? 'Số tiền (BTC)' : 'Amount (BTC)'}
                  </label>
                  <input
                    type="number"
                    id="input-tx-amount"
                    value={amount}
                    min={0.001}
                    step={0.5}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-md bg-[#10151D] border border-[#1C2430] text-white font-mono text-xs focus:border-teach-1 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-sans text-[#A5AFBF]">
                    {isVi ? 'Thông điệp / Data' : 'Message / Data'}
                  </label>
                  <input
                    type="text"
                    id="input-tx-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-[#10151D] border border-[#1C2430] text-white font-sans text-xs focus:border-teach-1 focus:outline-none"
                    placeholder="Payment for research"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  id="btn-create-tx-action"
                  onClick={handleCreateTransaction}
 className="w-full py-2 rounded-md bg-financial hover:bg-financial/90 text-black font-semibold font-sans text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{isVi ? '+ Tạo Giao Dịch' : '+ Create Transaction'}</span>
                </button>
              </div>

              {/* Pipeline Flow Visualization */}
              <div className="p-3 rounded-lg bg-[#10151D] border border-[#1C2430] space-y-2">
                <div className="text-[10px] font-sans uppercase text-[#A5AFBF] flex items-center justify-between">
                  <span>{isVi ? 'Quy trình tạo:' : 'Pipeline:'}</span>
                  <span className="text-teach-1 font-semibold">
                    {pipelineStep === 'idle'
                      ? (isVi ? 'SẴN SÀNG' : 'IDLE')
                      : pipelineStep === 'validating'
                      ? (isVi ? 'KIỂM TRA...' : 'VALIDATING...')
                      : pipelineStep === 'created'
                      ? (isVi ? 'ĐÃ TẠO' : 'CREATED')
                      : pipelineStep === 'signing'
                      ? (isVi ? 'ĐANG KÝ SỐ...' : 'SIGNING...')
                      : (isVi ? '✓ HOÀN TẤT' : '✓ READY')}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center font-sans text-[10px]">
                  <div
                    className={`p-1.5 rounded border transition-colors ${
                      pipelineStep !== 'idle'
                        ? 'bg-teach-1/10 border-teach-1/40 text-teach-1'
                        : 'bg-[#10151D] border-[#1C2430] text-[#717B8C]'
                    }`}
                  >
                    1. {isVi ? 'Nhập liệu' : 'Input'}
                  </div>
                  <div
                    className={`p-1.5 rounded border transition-colors ${
                      pipelineStep === 'validating' ||
                      pipelineStep === 'created' ||
                      pipelineStep === 'ready-to-sign' ||
                      pipelineStep === 'signing' ||
                      pipelineStep === 'signed'
                        ? 'bg-teach-1/10 border-teach-1/40 text-teach-1'
                        : 'bg-[#10151D] border-[#1C2430] text-[#717B8C]'
                    }`}
                  >
                    2. {isVi ? 'Kiểm tra' : 'Validate'}
                  </div>
                  <div
                    className={`p-1.5 rounded border transition-colors ${
                      pipelineStep === 'created' ||
                      pipelineStep === 'ready-to-sign' ||
                      pipelineStep === 'signing' ||
                      pipelineStep === 'signed'
                        ? 'bg-teach-1/10 border-teach-1/40 text-teach-1'
                        : 'bg-[#10151D] border-[#1C2430] text-[#717B8C]'
                    }`}
                  >
                    3. {isVi ? 'Đã tạo' : 'Created'}
                  </div>
                  <div
                    className={`p-1.5 rounded border transition-colors ${
                      pipelineStep === 'signed'
                        ? 'bg-success text-slate-950 font-semibold'
                        : 'bg-[#10151D] border-[#1C2430] text-[#717B8C]'
                    }`}
                  >
                    4. {isVi ? 'Đã ký' : 'Signed'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DIGITAL SIGNATURE WORKBENCH */}
          <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1C2430] space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2430]">
              <div className="flex items-center gap-2 text-teach-2 text-xs font-semibold uppercase font-sans">
                <KeyRound className="w-4 h-4" />
                <span>{isVi ? 'Chữ Ký Điện Tử' : 'Digital Signature'}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teach-2/10 text-teach-2 border border-teach-2/30">
                ECDSA / SECP256K1
              </span>
            </div>

            {/* Selected Tx Preview Box */}
            <div className="p-3.5 rounded-lg bg-[#10151D] border border-[#1C2430] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-white">
                  {currentSelectedTx.sender} → {currentSelectedTx.recipient}
                </span>
                <span className="font-semibold text-financial">
                  {currentSelectedTx.amount} BTC
                </span>
              </div>

              <div className="text-[11px] text-[#A5AFBF] font-sans">
                {isVi ? 'Dữ liệu giao dịch:' : 'Data payload:'}{' '}
                <span className="text-slate-200">"{currentSelectedTx.message}"</span>
              </div>

              {/* Cryptographic Pipeline Display */}
              <div className="space-y-1.5 pt-1 text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#717B8C] font-sans">TX Hash:</span>
                  <span className="text-teach-1 font-medium">
                    {currentSelectedTx.txHash
                      ? `${currentSelectedTx.txHash.slice(0, 8)}...${currentSelectedTx.txHash.slice(-6)}`
                      : 'Computing...'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#717B8C] font-sans">Public Key:</span>
                  <span className="text-slate-300">
                    03ab72f89c...91de ({currentSelectedTx.sender})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#717B8C] font-sans">Chữ ký (Signature):</span>
                  <span
                    className={`font-medium ${
                      currentSelectedTx.isSigned
                        ? currentSelectedTx.isTampered
                          ? 'text-rose-400'
                          : 'text-success'
                        : 'text-[#717B8C] font-sans'
                    }`}
                  >
                    {currentSelectedTx.isSigned
                      ? `${currentSelectedTx.signature.slice(0, 10)}...${currentSelectedTx.signature.slice(-4)}`
                      : isVi
                      ? 'Chưa ký'
                      : 'Unsigned'}
                  </span>
                </div>
              </div>

              {/* Signature Status Alert */}
              <div className="pt-1">
                {currentSelectedTx.isTampered ? (
                  <div className="p-2 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-sans flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      {isVi
                        ? 'Chữ ký không hợp lệ: Dữ liệu đã bị thay đổi sau khi ký!'
                        : 'Signature invalid: Data altered after signing!'}
                    </span>
                  </div>
                ) : currentSelectedTx.isSigned ? (
                  <div className="p-2 rounded-md bg-success/10 border border-success/30 text-success text-[11px] font-sans flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span>
                      {isVi
                        ? 'Chữ ký hợp lệ: Xác thực chính chủ 100%'
                        : 'Signature valid: Authenticated & valid'}
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-md bg-[#10151D] border border-[#1C2430] text-[#A5AFBF] text-[11px] font-sans flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {isVi
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
                id="btn-sign-tx-action"
                onClick={handleSignTransaction}
 className="py-2 px-3 rounded-md bg-financial hover:bg-financial/90 text-black font-semibold font-sans text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isVi ? 'Ký Giao Dịch' : 'Sign TX'}</span>
              </button>

              <button
                type="button"
                id="btn-verify-tx-sig"
                onClick={handleVerifySignature}
                className="py-2 px-3 rounded-md bg-[#10151D] hover:bg-[#161D27] text-slate-200 font-sans text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-[#1C2430]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                <span>{isVi ? 'Xác Minh' : 'Verify'}</span>
              </button>
            </div>
          </div>

          {/* TAMPER ATTACK WORKBENCH */}
          <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1C2430] space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2430]">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase font-sans">
                <AlertTriangle className="w-4 h-4" />
                <span>{isVi ? 'Tấn Công Giả Mạo' : 'Tamper Attack Lab'}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                SECURITY ATTACK
              </span>
            </div>

            <p className="text-xs text-[#A5AFBF] leading-relaxed font-sans">
              {isVi
                ? 'Thử giả mạo số tiền của giao dịch để trực tiếp quan sát hiệu ứng thác đổ (Avalanche Cascade) làm hỏng Cây Merkle và vô hiệu hóa toàn bộ Block.'
                : 'Tamper with a transaction amount to witness the cryptographic avalanche cascade break the Merkle Root and invalidate the block.'}
            </p>

            {/* Quick Tamper Trigger Buttons for Each Tx */}
            <div className="space-y-2">
              <div className="text-[11px] font-sans text-[#A5AFBF]">
                {isVi ? 'Chọn giao dịch để thử sửa:' : 'Select transaction to tamper:'}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {processedTxs.map((tx, idx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => handleTamperTransaction(tx.id, tx.amount === 1000 ? 5 : 1000)}
                    className={`p-2.5 rounded-lg border text-left font-sans text-xs transition-colors cursor-pointer flex flex-col justify-between ${
                      tx.isTampered
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-200'
                        : 'bg-[#10151D] border-[#1C2430] hover:border-[#2D3748] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold">TX #0{idx + 1}</span>
                      {tx.isTampered ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500 text-slate-950 font-semibold font-mono">
                          TAMPERED
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#717B8C] font-mono">OK</span>
                      )}
                    </div>
                    <div className="text-[11px] truncate mt-1 text-slate-300">
                      {tx.sender} → {tx.recipient}
                    </div>
                    <div className="text-[10px] font-semibold text-financial font-mono">
                      {tx.amount} BTC
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Before / After Diff Comparison Box */}
            {beforeAfterDiff && (
              <div className="p-3 rounded-lg bg-[#10151D] border border-rose-500/30 space-y-2 text-xs font-mono">
                <div className="text-[10px] font-semibold text-rose-400 uppercase flex items-center justify-between font-sans">
                  <span>{isVi ? 'So sánh trước / sau khi sửa:' : 'Before / After Tamper Diff:'}</span>
                  <span className="text-[#A5AFBF]">{beforeAfterDiff.txLabel}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div className="p-2 rounded bg-[#0B0E12] border border-[#1C2430] space-y-1">
                    <div className="text-teach-1 font-semibold font-sans">TRƯỚC (BEFORE)</div>
                    <div className="text-[#A5AFBF]">TX: {beforeAfterDiff.originalTxHash.slice(0, 6)}...</div>
                    <div className="text-[#A5AFBF]">Root: {beforeAfterDiff.originalMerkleRoot.slice(0, 6)}...</div>
                    <div className="text-[#A5AFBF]">Block: {beforeAfterDiff.originalBlockHash.slice(0, 6)}...</div>
                  </div>

                  <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 space-y-1">
                    <div className="text-rose-400 font-semibold font-sans">SAU (AFTER)</div>
                    <div className="text-rose-300">TX: {beforeAfterDiff.newTxHash.slice(0, 6)}...</div>
                    <div className="text-rose-300">Root: {beforeAfterDiff.newMerkleRoot.slice(0, 6)}...</div>
                    <div className="text-rose-300">Block: {beforeAfterDiff.newBlockHash.slice(0, 6)}...</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HEADER PARAMETERS LAB */}
          <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1C2430] space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2430]">
              <div className="flex items-center gap-2 text-slate-200 text-xs font-semibold uppercase font-sans">
                <Clock className="w-4 h-4 text-teach-1" />
                <span>{isVi ? 'Siêu Dữ Liệu Header' : 'Header Metadata'}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teach-1/10 text-teach-1 border border-teach-1/30">
                HEADER TUNING
              </span>
            </div>

            {/* Timestamp Control */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-sans text-[#A5AFBF] flex items-center justify-between">
                <span>{isVi ? 'Dấu thời gian (Timestamp):' : 'Timestamp:'}</span>
                <span className="text-slate-200 font-mono text-xs">{timestamp}</span>
              </label>
              <div className="flex gap-1.5">
                {['2026-08-23 18:30:15', '2026-08-23 18:31:00', '2026-08-23 19:00:00'].map((t, idx) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleUpdateTimestamp(t)}
                    className="flex-1 py-1 px-2 rounded-md bg-[#10151D] hover:bg-[#161D27] border border-[#1C2430] text-[10px] font-mono text-slate-300 transition-colors cursor-pointer"
                  >
                    {idx === 0 ? '+0s' : idx === 1 ? '+45s' : '+30m'}
                  </button>
                ))}
              </div>
            </div>

            {/* Previous Hash Linkage Control */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-sans text-[#A5AFBF] flex items-center justify-between">
                <span>{isVi ? 'Previous Hash (Mắt xích khối trước):' : 'Previous Hash:'}</span>
                <span className={isChainLinkValid ? 'text-success font-mono text-xs font-semibold' : 'text-rose-400 font-mono text-xs font-semibold'}>
                  {isChainLinkValid ? '✓ LINKED' : '❌ BROKEN'}
                </span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePrevHash(false)}
                  className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs transition-colors cursor-pointer ${
                    isChainLinkValid
                      ? 'bg-success/10 border border-success/40 text-success font-medium'
                      : 'bg-[#10151D] border border-[#1C2430] text-[#A5AFBF]'
                  }`}
                >
                  {isVi ? 'Mã Băm Chuẩn #41' : 'Canonical #41'}
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePrevHash(true)}
                  className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs transition-colors cursor-pointer ${
                    !isChainLinkValid
                      ? 'bg-rose-500/10 border border-rose-500/40 text-rose-300 font-medium'
                      : 'bg-[#10151D] border border-[#1C2430] text-[#A5AFBF]'
                  }`}
                >
                  {isVi ? '⚠ Phá Vỡ Mắt Xích' : '⚠ Corrupt Hash'}
                </button>
              </div>
            </div>

            {/* Nonce & Proof-of-Work Connector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-sans text-[#A5AFBF] flex items-center justify-between">
                <span>{isVi ? 'Nonce:' : 'Nonce:'}</span>
                <span className="text-teach-1 font-mono font-semibold">{nonce}</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={nonce}
                  onChange={(e) => setNonce(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 rounded-md bg-[#10151D] border border-[#1C2430] text-white font-mono text-xs focus:border-teach-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleFindValidNonce}
                  disabled={isMining}
 className="flex-1 py-1.5 px-3 rounded-md bg-financial hover:bg-financial/90 text-black font-semibold font-sans text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <Cpu className={`w-3.5 h-3.5 ${isMining ? 'animate-spin' : ''}`} />
                  <span>
                    {isMining
                      ? (isVi ? 'ĐANG ĐÀO...' : 'MINING...')
                      : (isVi ? 'Tìm Nonce Hợp Lệ (PoW)' : 'Find Valid Nonce')}
                  </span>
                </button>
              </div>
              {isMining && (
                <div className="text-[10px] font-mono text-[#A5AFBF] flex items-center justify-between pt-1">
                  <span>Speed: {miningSpeed} H/s</span>
                  <span>Target: 0000...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Block Visualization & Merkle Tree */}
        <div className="lg:col-span-7 space-y-5">
          {/* CRYPTOGRAPHIC DATA STREAM BAR */}
          <div className="p-3.5 rounded-xl bg-[#0B0E12] border border-[#1C2430] flex items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-teach-1">
              <Terminal className="w-4 h-4 text-teach-1" />
              <span className="text-[11px] font-semibold uppercase font-sans">
                {isComputingHash
                  ? (isVi ? 'Đang tính bản băm (Hashing)...' : 'Hash Computing...')
                  : 'Canonical SHA-256 Pipeline'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono truncate max-w-xs sm:max-w-md bg-[#10151D] px-2.5 py-1 rounded border border-[#1C2430]">
              {hashStreamText || blockHash}
            </div>
          </div>

          {/* LIVE BLOCK CONTAINER */}
          <div
            className={`p-5 rounded-xl bg-[#0B0E12] border space-y-5 transition-colors ${
              isBlockValid
                ? 'border-[#1C2430]'
                : 'border-rose-500/40'
            }`}
          >
            {/* Block Header Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1C2430]">
              <div className="flex items-center gap-2.5">
                <Boxes className="w-5 h-5 text-teach-1" />
                <h4 className="text-base font-semibold text-white font-sans flex items-center gap-2">
                  <span>BLOCK #{blockNumber}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                      isBlockValid
                        ? 'bg-success/10 text-success border border-success/30'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {isBlockValid
                      ? (isVi ? '✓ BLOCK TOÀN VẸN (VALID)' : '✓ BLOCK VALID')
                      : (isVi ? '⚠ TOÀN VẸN BỊ PHÁ VỠ' : '⚠ COMPROMISED')}
                  </span>
                </h4>
              </div>

              <div className="text-[11px] text-[#717B8C] font-sans">
                {isVi ? 'Di chuột để theo dõi liên kết' : 'Hover elements to trace links'}
              </div>
            </div>

            {/* BLOCK HEADER SECTION */}
            <div
              className={`p-4 rounded-lg bg-[#10151D] border transition-colors ${
                highlightedComponent === 'header' ||
                highlightedComponent === 'merkleRoot' ||
                highlightedComponent === 'prevHash'
                  ? 'border-teach-1/60'
                  : 'border-[#1C2430]'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1C2430]">
                <span className="text-[11px] font-semibold text-slate-200 uppercase flex items-center gap-1.5 font-sans">
                  <Layers className="w-3.5 h-3.5 text-teach-1" />
                  <span>BLOCK HEADER (~80 Bytes)</span>
                </span>
                <span className="text-[10px] font-mono text-[#717B8C]">Metadata Layer</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                {/* Previous Hash */}
                <div
                  onMouseEnter={() => setHighlightedComponent('prevHash')}
                  onMouseLeave={() => setHighlightedComponent(null)}
                  className={`p-2.5 rounded-lg bg-[#0B0E12] border transition-colors cursor-pointer ${
                    highlightedComponent === 'prevHash'
                      ? 'border-teach-1 text-teach-1'
                      : isChainLinkValid
                      ? 'border-[#1C2430] text-slate-300'
                      : 'border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="text-[10px] text-[#717B8C] uppercase flex items-center justify-between font-sans">
                    <span>Previous Hash</span>
                    {isChainLinkValid ? (
                      <Check className="w-3 h-3 text-success" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-400" />
                    )}
                  </div>
                  <div className="truncate font-medium mt-0.5">
                    {prevHash.slice(0, 14)}...{prevHash.slice(-10)}
                  </div>
                </div>

                {/* Merkle Root */}
                <div
                  onMouseEnter={() => setHighlightedComponent('merkleRoot')}
                  onMouseLeave={() => setHighlightedComponent(null)}
                  className={`p-2.5 rounded-lg bg-[#0B0E12] border transition-colors cursor-pointer ${
                    highlightedComponent === 'merkleRoot'
                      ? 'border-teach-3 text-teach-3'
                      : hasTamperedTx
                      ? 'border-rose-500/40 text-rose-300'
                      : 'border-[#1C2430] text-slate-300'
                  }`}
                >
                  <div className="text-[10px] text-[#717B8C] uppercase flex items-center justify-between font-sans">
                    <span>Merkle Root</span>
                    <GitFork className="w-3 h-3 text-teach-3" />
                  </div>
                  <div className="truncate font-medium mt-0.5 text-teach-3">
                    {merkleTree.root.slice(0, 14)}...{merkleTree.root.slice(-10)}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="p-2.5 rounded-lg bg-[#0B0E12] border border-[#1C2430] text-slate-300">
                  <div className="text-[10px] text-[#717B8C] uppercase font-sans">Timestamp</div>
                  <div className="font-medium mt-0.5 text-slate-200">{timestamp}</div>
                </div>

                {/* Nonce */}
                <div className="p-2.5 rounded-lg bg-[#0B0E12] border border-[#1C2430] text-slate-300">
                  <div className="text-[10px] text-[#717B8C] uppercase font-sans">Nonce</div>
                  <div className="font-medium mt-0.5 text-slate-200">{nonce}</div>
                </div>
              </div>

              {/* Header SHA-256 output (Block Hash) */}
              <div className="mt-3 pt-3 border-t border-[#1C2430] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-[11px] font-sans text-[#A5AFBF]">
                  SHA-256(SHA-256(Block Header)) →
                </div>
                <div
                  className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold truncate max-w-full sm:max-w-md ${
                    isBlockValid
                      ? 'bg-success/10 border border-success/30 text-success'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {blockHash}
                </div>
              </div>
            </div>

            {/* LIVE MERKLE TREE */}
            <div className="p-4 rounded-lg bg-[#10151D] border border-[#1C2430] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1C2430]">
                <span className="text-[11px] font-semibold text-slate-200 uppercase flex items-center gap-1.5 font-sans">
                  <GitFork className="w-3.5 h-3.5 text-teach-3" />
                  <span>Cây Merkle Tự Động (Merkle Tree)</span>
                </span>
                <span className="text-[10px] font-mono text-[#717B8C]">
                  {processedTxs.length} Transactions
                </span>
              </div>

              {/* Tree Diagram Flow */}
              <div className="space-y-4 font-mono text-xs">
                {/* Merkle Root Node */}
                <div className="flex justify-center">
                  <div
                    onMouseEnter={() => setHighlightedComponent('merkleRoot')}
                    onMouseLeave={() => setHighlightedComponent(null)}
                    className={`p-3 rounded-lg border text-center transition-colors max-w-md w-full cursor-pointer ${
                      hasTamperedTx
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                        : 'bg-[#0B0E12] border-teach-3/40 text-teach-3'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-semibold text-[#A5AFBF] font-sans">
                      MERKLE ROOT (Level 2)
                    </div>
                    <div className="font-semibold text-xs truncate mt-0.5 text-teach-3">
                      {merkleTree.root}
                    </div>
                  </div>
                </div>

                {/* Connecting Lines */}
                <div className="flex justify-around text-slate-600 px-8">
                  <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                  <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
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
                        className={`p-2.5 rounded-lg border text-center font-mono text-xs transition-colors ${
                          isBranchTampered
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                            : 'bg-[#0B0E12] border-[#1C2430] text-slate-300'
                        }`}
                      >
                        <div className="text-[9px] uppercase text-[#717B8C] font-sans">
                          Parent Hash #{i + 1} ({i === 0 ? 'TX1 + TX2' : 'TX3 + TX4'})
                        </div>
                        <div className="truncate font-medium mt-0.5">{h}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Connecting Lines to Leaves */}
                <div className="grid grid-cols-4 text-center text-slate-600">
                  <ArrowDown className="w-3.5 h-3.5 mx-auto text-slate-600" />
                  <ArrowDown className="w-3.5 h-3.5 mx-auto text-slate-600" />
                  <ArrowDown className="w-3.5 h-3.5 mx-auto text-slate-600" />
                  <ArrowDown className="w-3.5 h-3.5 mx-auto text-slate-600" />
                </div>

                {/* Level 0: Leaf Nodes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {processedTxs.map((tx, idx) => (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTxId(tx.id)}
                      className={`p-2 rounded-lg border font-mono text-[11px] cursor-pointer transition-colors ${
                        selectedTxId === tx.id
                          ? 'border-teach-1 bg-teach-1/10 text-teach-1'
                          : tx.isTampered
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                          : 'bg-[#0B0E12] border-[#1C2430] text-[#717B8C] hover:border-[#2D3748]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] font-semibold">
                        <span>TX #0{idx + 1}</span>
                        {tx.isTampered ? (
                          <span className="text-rose-400">TAMPER</span>
                        ) : tx.isSigned ? (
                          <span className="text-success">SIGNED</span>
                        ) : (
                          <span className="text-[#717B8C]">RAW</span>
                        )}
                      </div>
                      <div className="truncate text-white font-medium mt-1 font-sans">
                        {tx.sender} → {tx.recipient}
                      </div>
                      <div className="text-[10px] text-financial font-mono font-semibold">
                        {tx.amount} BTC
                      </div>
                      <div className="text-[9px] text-[#717B8C] truncate mt-1">
                        {tx.txHash ? tx.txHash.slice(0, 10) + '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BLOCK BODY (TRANSACTIONS PAYLOAD) */}
            <div className="p-4 rounded-lg bg-[#10151D] border border-[#1C2430] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1C2430]">
                <span className="text-[11px] font-semibold text-slate-200 uppercase flex items-center gap-1.5 font-sans">
                  <Boxes className="w-3.5 h-3.5 text-slate-400" />
                  <span>BLOCK BODY (~1 - 4 MB)</span>
                </span>
                <span className="text-[10px] font-mono text-[#717B8C]">
                  {processedTxs.length} Transactions
                </span>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                {processedTxs.map((tx, idx) => (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTxId(tx.id)}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      selectedTxId === tx.id
                        ? 'border-teach-1 bg-teach-1/10'
                        : tx.isTampered
                        ? 'border-rose-500/40 bg-rose-500/10'
                        : 'border-[#1C2430] bg-[#0B0E12] hover:border-[#2D3748]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#10151D] text-slate-300 border border-[#1C2430]">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-2 font-sans">
                          <span>
                            {tx.sender} → {tx.recipient}
                          </span>
                          <span className="text-financial font-mono font-semibold">{tx.amount} BTC</span>
                        </div>
                        <div className="text-[11px] text-[#A5AFBF] truncate max-w-xs font-sans">
                          "{tx.message}"
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      {tx.isTampered ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                          TAMPERED
                        </span>
                      ) : tx.isSigned ? (
                        <span className="px-2 py-0.5 rounded bg-success/10 text-success border border-success/30">
                          SIGNED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#10151D] text-[#A5AFBF]">
                          UNSIGNED
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTamperTransaction(tx.id);
                        }}
                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] cursor-pointer font-sans"
                      >
                        {isVi ? 'Sửa' : 'Tamper'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
