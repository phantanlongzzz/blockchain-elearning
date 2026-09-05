import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Boxes, ArrowRight, ArrowDown, RefreshCw, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, SkipForward, SkipBack, Layers, FileText, Binary, GraduationCap, ExternalLink, Code2, Zap, ChevronDown, ChevronUp, Link2, Info, Sliders, Plus, RotateCcw, Check, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { fastSha256Hex } from '../../utils/sha256';
import { calculateHammingDifference } from '../../utils/binary';
import { CodeViewer } from '../common/CodeViewer';

interface DataToBlockchainPipelineProps {
  onInteracted?: () => void;
  onGoToQuiz?: () => void;
}

export interface SimBlock {
  index: number;
  prevHash: string;
  data: string;
  nonce: number;
  hash: string;
  timestamp: string;
}

export interface SimTx {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  unit: string;
  timestamp: string;
  rawString: string;
}

const PYTHON_BLOCKCHAIN_CODE = `# ==========================================
# BUỔI 1: NỀN TẢNG CẤU TRÚC BLOCKCHAIN & HASH POINTER
# ==========================================
import hashlib
import time

class Block:
    def __init__(self, index: int, prev_hash: str, data: str, nonce: int = 0):
        self.index = index
        self.prev_hash = prev_hash
        self.data = data
        self.nonce = nonce
        self.timestamp = int(time.time())
        self.hash = self.compute_hash()

    def compute_hash(self) -> str:
        """Tính mã băm SHA-256 của toàn bộ nội dung khối."""
        header = f"{self.index}|{self.prev_hash}|{self.data}|{self.nonce}|{self.timestamp}"
        return hashlib.sha256(header.encode('utf-8')).hexdigest()

class Blockchain:
    def __init__(self):
        self.chain = [self.create_genesis_block()]

    def create_genesis_block(self) -> Block:
        return Block(0, "0" * 64, "Genesis Block · DLU Blockchain")

    def get_latest_block(self) -> Block:
        return self.chain[-1]

    def add_block(self, data: str) -> Block:
        latest = self.get_latest_block()
        new_block = Block(latest.index + 1, latest.hash, data)
        self.chain.append(new_block)
        return new_block

    def verify_integrity(self) -> bool:
        """Kiểm tra tính toàn vẹn của toàn bộ chuỗi khối."""
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i - 1]

            # 1. Kiểm tra mã băm của khối hiện tại có bị sửa đổi dữ liệu không
            if curr.hash != curr.compute_hash():
                print(f"❌ Khối #{curr.index} bị sửa đổi dữ liệu!")
                return False

            # 2. Kiểm tra con trỏ Previous Hash có khớp với khối trước không
            if curr.prev_hash != prev.hash:
                print(f"❌ Con trỏ Previous Hash của Khối #{curr.index} không khớp với Khối #{prev.index}!")
                return False

        print("✅ Toàn bộ Blockchain hợp lệ & toàn vẹn.")
        return True

# --- THỰC NGHIỆM TẤN CÔNG GIẢ MẠO (TAMPER ATTACK) ---
bc = Blockchain()
bc.add_block("Alice -> Bob : 10 BTC")
bc.add_block("Bob -> Charlie : 5 BTC")

print("Trạng thái ban đầu:", bc.verify_integrity()) # True

# Kẻ tấn công sửa dữ liệu Khối 1
bc.chain[1].data = "Alice -> Hacker : 100 BTC"
# Khi tính lại, hash của khối 1 thay đổi, nhưng khối 2 vẫn giữ hash cũ -> Mismatch!
print("Sau khi giả mạo:", bc.verify_integrity())   # False
`;

const TS_BLOCKCHAIN_CODE = `// ==========================================
// BUỔI 1: TYPESCRIPT BLOCKCHAIN & HASH POINTER
// ==========================================
import { fastSha256Hex } from './sha256';

export interface Block {
  index: number;
  prevHash: string;
  data: string;
  nonce: number;
  timestamp: number;
  hash: string;
}

export class Blockchain {
  public chain: Block[] = [];

  constructor() {
    this.chain.push(this.createGenesisBlock());
  }

  private createGenesisBlock(): Block {
    const timestamp = Date.now();
    const data = "Genesis Block · DLU Blockchain";
    const prevHash = "0".repeat(64);
    const hash = fastSha256Hex(\`0|\${prevHash}|\${data}|0|\${timestamp}\`);
    return { index: 0, prevHash, data, nonce: 0, timestamp, hash };
  }

  public addBlock(data: string): Block {
    const prevBlock = this.chain[this.chain.length - 1];
    const timestamp = Date.now();
    const index = prevBlock.index + 1;
    const prevHash = prevBlock.hash;
    const hash = fastSha256Hex(\`\${index}|\${prevHash}|\${data}|0|\${timestamp}\`);
    const newBlock: Block = { index, prevHash, data, nonce: 0, timestamp, hash };
    this.chain.push(newBlock);
    return newBlock;
  }

  public verifyIntegrity(): { isValid: boolean; brokenAt?: number } {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Recompute hash
      const expectedHash = fastSha256Hex(\`\${current.index}|\${current.prevHash}|\${current.data}|\${current.nonce}|\${current.timestamp}\`);
      if (current.hash !== expectedHash) {
        return { isValid: false, brokenAt: current.index };
      }
      if (current.prevHash !== previous.hash) {
        return { isValid: false, brokenAt: current.index };
      }
    }
    return { isValid: true };
  }
}
`;

export const DataToBlockchainPipeline: React.FC<DataToBlockchainPipelineProps> = ({
  onInteracted,
  onGoToQuiz,
}) => {
  const { strings, language } = useLanguage();

  // Active step (1 to 8)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(1);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  // ----------------------------------------------------
  // STEP 1 STATE: Raw Transaction Input
  // ----------------------------------------------------
  const [txSender, setTxSender] = useState<string>('Alice');
  const [txRecipient, setTxRecipient] = useState<string>('Bob');
  const [txAmount, setTxAmount] = useState<number>(10);
  const [txUnit, setTxUnit] = useState<string>('BTC');
  const [isTxCreated, setIsTxCreated] = useState<boolean>(true);
  const [createdTx, setCreatedTx] = useState<SimTx>({
    id: 'tx_001',
    sender: 'Alice',
    recipient: 'Bob',
    amount: 10,
    unit: 'BTC',
    timestamp: '12:00:00',
    rawString: 'Alice -> Bob : 10 BTC',
  });

  const handleCreateTransaction = () => {
    const rawString = `${txSender.trim()} -> ${txRecipient.trim()} : ${txAmount} ${txUnit}`;
    const newTx: SimTx = {
      id: `tx_${Date.now().toString().slice(-4)}`,
      sender: txSender.trim() || 'Alice',
      recipient: txRecipient.trim() || 'Bob',
      amount: txAmount,
      unit: txUnit,
      timestamp: new Date().toLocaleTimeString(),
      rawString,
    };
    setCreatedTx(newTx);
    setIsTxCreated(true);
    unlockUpToStep(2);
    onInteracted?.();
  };

  // ----------------------------------------------------
  // STEP 2 STATE: SHA-256 Hash & Re-hash
  // ----------------------------------------------------
  const [step2HashCalculated, setStep2HashCalculated] = useState<boolean>(true);
  const [step2EditAmount, setStep2EditAmount] = useState<number>(11);
  const [step2ModifiedHash, setStep2ModifiedHash] = useState<string>('');
  const [step2IsRehashed, setStep2IsRehashed] = useState<boolean>(false);

  const rawTxString = createdTx.rawString;
  const originalTxHash = useMemo(() => {
    return fastSha256Hex(rawTxString);
  }, [rawTxString]);

  const handleComputeStep2Hash = () => {
    setStep2HashCalculated(true);
    unlockUpToStep(3);
    onInteracted?.();
  };

  const handleRehashStep2 = () => {
    const modifiedString = `${createdTx.sender} -> ${createdTx.recipient} : ${step2EditAmount} ${createdTx.unit}`;
    const newHash = fastSha256Hex(modifiedString);
    setStep2ModifiedHash(newHash);
    setStep2IsRehashed(true);
    unlockUpToStep(3);
    onInteracted?.();
  };

  // ----------------------------------------------------
  // STEP 3 STATE: Block Packaging
  // ----------------------------------------------------
  const [isBlockPacked, setIsBlockPacked] = useState<boolean>(true);
  const genesisPrevHash = '0'.repeat(64);
  const genesisData = 'Genesis Block · DLU Blockchain';
  const genesisHash = useMemo(() => {
    return fastSha256Hex(`0|${genesisPrevHash}|${genesisData}|0|0`);
  }, []);

  const block1InitialHash = useMemo(() => {
    return fastSha256Hex(`1|${genesisHash}|${rawTxString}|0|0`);
  }, [genesisHash, rawTxString]);

  const handlePackBlock = () => {
    setIsBlockPacked(true);
    unlockUpToStep(4);
    onInteracted?.();
  };

  // ----------------------------------------------------
  // STEP 4 STATE: Hash Pointer & Linked List Bridge
  // ----------------------------------------------------
  const [hoveredPointer, setHoveredPointer] = useState<string | null>(null);

  // ----------------------------------------------------
  // STEP 5 STATE: Expanding Blockchain (Dynamic Chain State)
  // ----------------------------------------------------
  const [chainBlocks, setChainBlocks] = useState<SimBlock[]>([
    {
      index: 0,
      prevHash: genesisPrevHash,
      data: genesisData,
      nonce: 0,
      hash: genesisHash,
      timestamp: '00:00:00',
    },
    {
      index: 1,
      prevHash: genesisHash,
      data: 'Alice -> Bob : 10 BTC',
      nonce: 0,
      hash: block1InitialHash,
      timestamp: '12:00:01',
    },
    {
      index: 2,
      prevHash: block1InitialHash,
      data: 'Charlie -> Dave : 5 BTC',
      nonce: 0,
      hash: fastSha256Hex(`2|${block1InitialHash}|Charlie -> Dave : 5 BTC|0|0`),
      timestamp: '12:00:02',
    },
  ]);

  const [newBlockSender, setNewBlockSender] = useState<string>('Eve');
  const [newBlockRecipient, setNewBlockRecipient] = useState<string>('Frank');
  const [newBlockAmount, setNewBlockAmount] = useState<number>(2.5);

  const handleAddBlockToChain = () => {
    setChainBlocks((prevChain) => {
      const last = prevChain[prevChain.length - 1];
      const newIndex = last.index + 1;
      const dataStr = `${newBlockSender.trim()} -> ${newBlockRecipient.trim()} : ${newBlockAmount} BTC`;
      const prevHash = last.hash;
      const hash = fastSha256Hex(`${newIndex}|${prevHash}|${dataStr}|0|0`);
      const newBlock: SimBlock = {
        index: newIndex,
        prevHash,
        data: dataStr,
        nonce: 0,
        hash,
        timestamp: new Date().toLocaleTimeString(),
      };
      return [...prevChain, newBlock];
    });
    unlockUpToStep(6);
    onInteracted?.();
  };

  // ----------------------------------------------------
  // STEP 6 STATE: Tamper Attack Experiment
  // ----------------------------------------------------
  const [tamperTargetBlock, setTamperTargetBlock] = useState<number>(1);
  const [tamperAmount, setTamperAmount] = useState<number>(100);
  const [isTampered, setIsTampered] = useState<boolean>(false);

  // Compute live tampered blockchain state
  const tamperedChainState = useMemo(() => {
    if (!isTampered) {
      return chainBlocks;
    }
    // Deep clone and modify target block data & recalculate ONLY target block hash
    return chainBlocks.map((blk) => {
      if (blk.index === tamperTargetBlock) {
        const tamperedData = `Alice -> Hacker : ${tamperAmount} BTC (TAMPERED ⚠️)`;
        const newHash = fastSha256Hex(`${blk.index}|${blk.prevHash}|${tamperedData}|${blk.nonce}|0`);
        return {
          ...blk,
          data: tamperedData,
          hash: newHash,
        };
      }
      return blk;
    });
  }, [chainBlocks, isTampered, tamperTargetBlock, tamperAmount]);

  const handleExecuteTamper = () => {
    setIsTampered(true);
    unlockUpToStep(7);
    onInteracted?.();
  };

  const handleRestoreChain = () => {
    setIsTampered(false);
    onInteracted?.();
  };

  // ----------------------------------------------------
  // STEP 7 STATE: Avalanche Effect Live Bit Distance Lab
  // ----------------------------------------------------
  const [avalancheInputA, setAvalancheInputA] = useState<string>('Alice -> Bob : 10 BTC');
  const [avalancheInputB, setAvalancheInputB] = useState<string>('Alice -> Bob : 11 BTC');

  const avalancheHashA = useMemo(() => fastSha256Hex(avalancheInputA), [avalancheInputA]);
  const avalancheHashB = useMemo(() => fastSha256Hex(avalancheInputB), [avalancheInputB]);

  const avalancheDiff = useMemo(() => {
    return calculateHammingDifference(avalancheHashA, avalancheHashB);
  }, [avalancheHashA, avalancheHashB]);

  // ----------------------------------------------------
  // STEP 8 STATE: Blockchain Integrity Verification Engine
  // ----------------------------------------------------
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyProgressIndex, setVerifyProgressIndex] = useState<number>(-1);
  const [verificationDone, setVerificationDone] = useState<boolean>(false);
  const [verificationLog, setVerificationLog] = useState<
    { index: number; valid: boolean; title: string; detail: string }[]
  >([]);
  const [isChainValid, setIsChainValid] = useState<boolean | null>(null);
  const verifyIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (verifyIntervalRef.current) {
        clearInterval(verifyIntervalRef.current);
        verifyIntervalRef.current = null;
      }
    };
  }, []);

  const handleRunVerification = () => {
    if (verifyIntervalRef.current) clearInterval(verifyIntervalRef.current);
    setIsVerifying(true);
    setVerificationDone(false);
    setVerifyProgressIndex(0);
    setVerificationLog([]);
    setIsChainValid(null);

    const targetChain = tamperedChainState;
    const logs: { index: number; valid: boolean; title: string; detail: string }[] = [];
    let chainPassed = true;

    let idx = 0;
    verifyIntervalRef.current = window.setInterval(() => {
      if (idx >= targetChain.length) {
        if (verifyIntervalRef.current) {
          clearInterval(verifyIntervalRef.current);
          verifyIntervalRef.current = null;
        }
        setIsVerifying(false);
        setVerificationDone(true);
        setIsChainValid(chainPassed);
        onInteracted?.();
        return;
      }

      const curr = targetChain[idx];
      setVerifyProgressIndex(idx);

      if (idx === 0) {
        // Check Genesis Block
        const expectedGenesisHash = fastSha256Hex(`0|${curr.prevHash}|${curr.data}|0|0`);
        const isValid = curr.hash === expectedGenesisHash;
        logs.push({
          index: 0,
          valid: isValid,
          title: language === 'vi' ? 'Khối Khởi Nguyên #0 (Genesis)' : 'Genesis Block #0',
          detail: isValid
            ? language === 'vi'
              ? 'Mã băm gốc khớp hoàn toàn.'
              : 'Genesis digest matches root.'
            : language === 'vi'
            ? 'Khối Genesis bị sửa đổi!'
            : 'Genesis block corrupted!',
        });
        if (!isValid) chainPassed = false;
      } else {
        const prev = targetChain[idx - 1];
        // 1. Check data integrity
        const computedHash = fastSha256Hex(`${curr.index}|${curr.prevHash}|${curr.data}|${curr.nonce}|0`);
        const isDataHashValid = curr.hash === computedHash;

        // 2. Check previous hash pointer
        const isPointerValid = curr.prevHash === prev.hash;

        const isBlockValid = isDataHashValid && isPointerValid;
        if (!isBlockValid) chainPassed = false;

        let detailMsg = '';
        if (isBlockValid) {
          detailMsg =
            language === 'vi'
              ? `Mã băm khớp (${curr.hash.slice(0, 10)}...) và Previous Hash trỏ đúng Khối #${idx - 1}.`
              : `Hash matches and Previous Hash links correctly to Block #${idx - 1}.`;
        } else if (!isDataHashValid) {
          detailMsg =
            language === 'vi'
              ? `❌ Dữ liệu khối bị thay đổi! Mã băm lưu trữ không khớp với dữ liệu thực.`
              : `❌ Data altered! Stored hash does not match computed data hash.`;
        } else if (!isPointerValid) {
          detailMsg =
            language === 'vi'
              ? `❌ Mất liên kết (Mismatch)! Previous Hash (${curr.prevHash.slice(0, 10)}...) không khớp với mã băm mới của Khối #${idx - 1} (${prev.hash.slice(0, 10)}...).`
              : `❌ Pointer Mismatch! Previous Hash does not match updated hash of Block #${idx - 1}.`;
        }

        logs.push({
          index: idx,
          valid: isBlockValid,
          title: language === 'vi' ? `Khối #${idx}` : `Block #${idx}`,
          detail: detailMsg,
        });
      }

      setVerificationLog([...logs]);
      idx++;
    }, 400);
  };

  const unlockUpToStep = (targetStep: number) => {
    setMaxUnlockedStep((prev) => Math.max(prev, targetStep));
  };

  const handleStepSelect = (stepNum: number) => {
    setCurrentStep(stepNum);
    unlockUpToStep(stepNum);
    onInteracted?.();
  };

  const handleResetAll = () => {
    setCurrentStep(1);
    setMaxUnlockedStep(1);
    setIsTxCreated(true);
    setTxSender('Alice');
    setTxRecipient('Bob');
    setTxAmount(10);
    setCreatedTx({
      id: 'tx_001',
      sender: 'Alice',
      recipient: 'Bob',
      amount: 10,
      unit: 'BTC',
      timestamp: '12:00:00',
      rawString: 'Alice -> Bob : 10 BTC',
    });
    setIsTampered(false);
    setVerificationDone(false);
    setIsChainValid(null);
    setChainBlocks([
      {
        index: 0,
        prevHash: genesisPrevHash,
        data: genesisData,
        nonce: 0,
        hash: genesisHash,
        timestamp: '00:00:00',
      },
      {
        index: 1,
        prevHash: genesisHash,
        data: 'Alice -> Bob : 10 BTC',
        nonce: 0,
        hash: block1InitialHash,
        timestamp: '12:00:01',
      },
      {
        index: 2,
        prevHash: block1InitialHash,
        data: 'Charlie -> Dave : 5 BTC',
        nonce: 0,
        hash: fastSha256Hex(`2|${block1InitialHash}|Charlie -> Dave : 5 BTC|0|0`),
        timestamp: '12:00:02',
      },
    ]);
    onInteracted?.();
  };

  // Step definitions with single core takeaway & badges
  const PIPELINE_STEPS = [
    {
      step: 1,
      title: language === 'vi' ? '1. Nhập Giao Dịch' : '1. Enter Transaction',
      badge: language === 'vi' ? 'Dữ liệu thô' : 'Raw Data',
      coreMessage:
        language === 'vi'
          ? 'Blockchain bắt đầu từ dữ liệu.'
          : 'Blockchain begins with raw transaction data.',
      explanation:
        language === 'vi'
          ? 'Mọi giao dịch trong mạng lưới phi tập trung (chuyển tiền, hợp đồng thông minh) đều xuất phát từ một cấu trúc dữ liệu thô gồm Người gửi (Sender), Người nhận (Recipient), Số lượng (Amount) và Timestamp.'
          : 'Every decentralized transaction originates as raw payload data containing Sender, Recipient, Amount, and Timestamp before cryptographic processing.',
    },
    {
      step: 2,
      title: language === 'vi' ? '2. Băm SHA-256' : '2. SHA-256 Hashing',
      badge: language === 'vi' ? 'Dấu vân tay số' : 'Digital Fingerprint',
      coreMessage:
        language === 'vi'
          ? 'Hash biến dữ liệu thành dấu vân tay số.'
          : 'Hash turns data into a unique digital fingerprint.',
      explanation:
        language === 'vi'
          ? 'Thuật toán SHA-256 nhận chuỗi giao dịch có độ dài bất kỳ và nén thành bản băm 64 ký tự hex (256-bit). Chỉ cần thay đổi 1 ký tự nhỏ ở input, bản băm đầu ra sẽ biến đổi ngẫu nhiên toàn diện (Hiệu ứng thác đổ - Avalanche Effect).'
          : 'SHA-256 maps arbitrary transaction text into an immutable 64-hex-character (256-bit) digest. Changing even one bit cascades into completely different hash outputs.',
    },
    {
      step: 3,
      title: language === 'vi' ? '3. Đóng Gói Khối' : '3. Block Packaging',
      badge: language === 'vi' ? 'Đóng gói Block' : 'Containerization',
      coreMessage:
        language === 'vi'
          ? 'Các giao dịch được đóng gói thành Block.'
          : 'Transactions are packaged into Block containers.',
      explanation:
        language === 'vi'
          ? 'Khối là đơn vị lưu trữ cơ bản gom các giao dịch lại với nhau kèm theo siêu dữ liệu: Số thứ tự Khối (Index), Previous Hash, Nonce và Timestamp.'
          : 'A Block is the fundamental storage unit encapsulating transaction payloads alongside cryptographic metadata: Index, Previous Hash, Nonce, and Timestamp.',
    },
    {
      step: 4,
      title: language === 'vi' ? '4. Con Trỏ Băm' : '4. Hash Pointer',
      badge: language === 'vi' ? 'Liên kết mật mã' : 'Crypto Pointer',
      coreMessage:
        language === 'vi'
          ? 'Previous Hash tạo liên kết mật mã giữa các Block.'
          : 'Previous Hash creates cryptographic linkage between Blocks.',
      explanation:
        language === 'vi'
          ? 'Trong Linked List truyền thống, Node trỏ tới ô nhớ RAM (0x7ffd...). Trong Blockchain, Block trỏ tới mã băm SHA-256 của khối trước. Nhờ vậy, chuỗi khối không thể bị chèn hay sửa mà không bị phát hiện.'
          : 'Unlike traditional Linked Lists pointing to volatile RAM memory addresses, Blockchain links via 256-bit SHA-256 cryptographic digests of prior blocks.',
    },
    {
      step: 5,
      title: language === 'vi' ? '5. Mở Rộng Chuỗi' : '5. Extend Blockchain',
      badge: language === 'vi' ? 'Xâu chuỗi khối' : 'Chaining Blocks',
      coreMessage:
        language === 'vi'
          ? 'Các Block nối tiếp nhau tạo thành Blockchain.'
          : 'Sequential Blocks link together to form a Blockchain.',
      explanation:
        language === 'vi'
          ? 'Mỗi khi có khối mới được tạo ra, nó đọc mã băm của khối đứng ngay trước và gắn vào trường Previous Hash của mình, kéo dài sổ cái không thể phá hủy.'
          : 'Whenever a new block is produced, it references the preceding block hash in its Previous Hash header, perpetually extending the ledger.',
    },
    {
      step: 6,
      title: language === 'vi' ? '6. Thử Nghiệm Giả Mạo' : '6. Tamper Attack',
      badge: language === 'vi' ? 'Phát hiện tấn công' : 'Attack Detection',
      coreMessage:
        language === 'vi'
          ? 'Thay đổi dữ liệu làm hỏng liên kết.'
          : 'Altering historical data breaks hash linkage immediately.',
      explanation:
        language === 'vi'
          ? 'Nếu kẻ tấn công sửa số tiền từ 10 BTC thành 100 BTC ở Khối #1, mã băm của Khối #1 lập tức thay đổi. Do Khối #2 vẫn lưu trữ mã băm cũ, liên kết Previous Hash bị gãy hoàn toàn.'
          : 'If an adversary alters Block #1 data, Block #1 hash recalculates to a totally new value. Block #2 still holds the old hash pointer, triggering an instant mismatch.',
    },
    {
      step: 7,
      title: language === 'vi' ? '7. Hiệu Ứng Thác Đổ' : '7. Avalanche Effect',
      badge: language === 'vi' ? 'Độ nhạy cực cao' : 'Hyper Sensitivity',
      coreMessage:
        language === 'vi'
          ? 'Hash cực kỳ nhạy với thay đổi dữ liệu.'
          : 'Hash is hyper-sensitive to any single-bit input change.',
      explanation:
        language === 'vi'
          ? 'Một thay đổi nhỏ như 10 BTC thành 11 BTC làm đảo lộn ~50% toàn bộ 256 bits của mã băm output. Tính chất thác đổ này đảm bảo không ai có thể dự đoán hay giấu diếm việc sửa đổi dữ liệu.'
          : 'A single character edit flips approximately 50% of all 256 bits across the output hash, ensuring cryptographic tamper evidence.',
    },
    {
      step: 8,
      title: language === 'vi' ? '8. Xác Minh Toàn Vẹn' : '8. Integrity Verification',
      badge: language === 'vi' ? 'Bảo vệ toàn vẹn' : 'Consensus Verify',
      coreMessage:
        language === 'vi'
          ? 'Mạng có thể phát hiện dữ liệu bị thay đổi.'
          : 'The network algorithmically detects and rejects tampered ledgers.',
      explanation:
        language === 'vi'
          ? 'Mọi máy tính (Node) trong mạng lưới có thể chạy vòng lặp kiểm tra toàn vẹn O(N) trong vài mili-giây để phát hiện chính xác khối nào bị sửa đổi dữ liệu hoặc sai lệch Previous Hash.'
          : 'Every validator node executes an O(N) verification routine to mathematically confirm data hashes and previous hash continuity.',
    },
  ];

  const currentStepDef = PIPELINE_STEPS[currentStep - 1];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#090a0f] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-zinc-500 font-medium">
            {language === 'vi'
              ? 'Giai đoạn 06 · Mô phỏng tương tác 8 bước'
              : 'Stage 06 · 8-Step Interactive Pipeline'}
          </div>
          <h3 className="text-lg font-semibold text-zinc-100">
            {language === 'vi' ? 'Từ Dữ Liệu Đến Blockchain' : 'From Data to Blockchain'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            {language === 'vi'
              ? 'Tự tay tạo giao dịch, tính mã băm SHA-256, đóng gói khối, nối con trỏ Previous Hash và thực nghiệm tấn công giả mạo.'
              : 'Create transactions, compute SHA-256 digests, package blocks, link hash pointers, and execute live tamper experiments.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsCodeModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title={language === 'vi' ? 'Xem Code Python & TypeScript' : 'View Code'}
          >
            <Code2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>{language === 'vi' ? 'Mã Nguồn' : 'Source Code'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title={language === 'vi' ? 'Khởi động lại mô phỏng' : 'Reset simulation'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Đặt Lại' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Interactive 8-Step Stepper Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teach-1" />
            <span className="text-zinc-300 font-medium">
              {language === 'vi' ? 'Lộ trình 8 bước thực nghiệm' : '8-Step Pipeline Workflow'}
            </span>
          </div>
          <span className="text-zinc-400 font-mono text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
            {language === 'vi' ? `Bước ${currentStep} / 8` : `Step ${currentStep} / 8`}
          </span>
        </div>

        {/* 8 Step Clickable Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {PIPELINE_STEPS.map((s) => {
            const isCurrent = currentStep === s.step;
            const isUnlocked = s.step <= maxUnlockedStep;
            const isTamper = s.step === 6 && isTampered;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => handleStepSelect(s.step)}
                className={`p-2 rounded-lg border text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                  isCurrent
                    ? isTamper
                      ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-100'
                    : isUnlocked
                    ? 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400'
                    : 'bg-transparent border-zinc-900 text-zinc-600'
                }`}
              >
                <span className="text-[11px] font-mono font-medium">
                  {language === 'vi' ? `BƯỚC ${s.step}` : `STEP ${s.step}`}
                </span>
                <span className="text-[9px] font-mono truncate max-w-full block mt-0.5 text-zinc-500">
                  {s.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Step Focus Box (Single Core Takeaway + Expandable Explanation) */}
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                  {currentStepDef.badge}
                </span>
                <h4 className="text-sm font-semibold text-zinc-200">
                  {currentStepDef.title}
                </h4>
              </div>
              <p className="text-xs text-zinc-300 font-medium">
                &ldquo;{currentStepDef.coreMessage}&rdquo;
              </p>
            </div>

            {/* Deep Explanation Toggle */}
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="self-start sm:self-center px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Info className="w-3 h-3 text-zinc-400" />
              <span>
                {showExplanation
                  ? language === 'vi'
                    ? 'Ẩn giải thích'
                    : 'Hide details'
                  : language === 'vi'
                  ? 'Xem giải thích'
                  : 'Deep dive'}
              </span>
              {showExplanation ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>

          {showExplanation && (
            <div className="p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-400 leading-relaxed font-sans animate-in fade-in">
              {currentStepDef.explanation}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* ACTIVE STEP WORKBENCH (INTERACTIVE STAGES 1 - 8) */}
      {/* ==================================================== */}
      <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-6">
        {/* STEP 1: ENTER RAW TRANSACTION */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Input Form */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#05070c] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teach-1" />
                    <span>{language === 'vi' ? 'Dữ Liệu Giao Dịch Thô' : 'Raw Transaction Payload'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Input Stage
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {language === 'vi' ? 'Người Gửi (Sender):' : 'Sender:'}
                    </label>
                    <input
                      type="text"
                      value={txSender}
                      onChange={(e) => setTxSender(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-teach-1 font-bold focus:outline-none focus:border-teach-1"
                      placeholder="e.g. Alice"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {language === 'vi' ? 'Người Nhận (Recipient):' : 'Recipient:'}
                    </label>
                    <input
                      type="text"
                      value={txRecipient}
                      onChange={(e) => setTxRecipient(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Bob"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        {language === 'vi' ? 'Số Lượng (Amount):' : 'Amount:'}
                      </label>
                      <input
                        type="number"
                        value={txAmount}
                        onChange={(e) => setTxAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-financial font-bold focus:outline-none focus:border-financial"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        {language === 'vi' ? 'Đơn Vị (Unit):' : 'Unit:'}
                      </label>
                      <input
                        type="text"
                        value={txUnit}
                        onChange={(e) => setTxUnit(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-bold focus:outline-none focus:border-slate-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateTransaction}
 className="w-full py-3 rounded-xl bg-financial hover:bg-financial/90 text-black font-semibold font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg "
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'vi' ? 'TẠO GIAO DỊCH' : 'CREATE TRANSACTION'}</span>
                  </button>
                </div>
              </div>

              {/* Right: Created Transaction Object Display */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#05070c] border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teach-1" />
                    <span>{language === 'vi' ? 'Đối Tượng Giao Dịch Được Tạo' : 'Transaction Object'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-teach-1 bg-teach-1/10 px-2 py-0.5 rounded border border-teach-1/30">
                    Active Object
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Transaction ID:</span>
                    <span className="text-teach-1 font-bold">{createdTx.id}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-slate-800 flex items-center justify-between">
                    <span className="text-teach-1 font-bold">{createdTx.sender}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <span className="text-amber-400 font-bold">{createdTx.recipient}</span>
                    <span className="text-financial font-bold bg-financial/10 px-2 py-0.5 rounded border border-financial/30">
                      {createdTx.amount} {createdTx.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Raw String Payload:</span>
                    <span className="text-slate-200 font-bold">&quot;{createdTx.rawString}&quot;</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-bg-elevated border border-border-primary text-xs text-text-secondary font-sans">
                  <p className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
                    <span>
                      {language === 'vi'
                        ? 'Đây là dữ liệu thô trước khi được mã hóa bằng hàm băm. Bấm "Tiếp Tục" để chuyển sang bước băm SHA-256.'
                        : 'This is the raw data payload before hashing. Click "Continue" to proceed to SHA-256 computation.'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SHA-256 TRANSACTION HASH & RE-HASH */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Raw Data to Hash Flow */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#05070c] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
                    <Binary className="w-4 h-4 text-teach-1" />
                    <span>{language === 'vi' ? 'Quy Trình Băm SHA-256' : 'SHA-256 Flow'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-teach-1 bg-teach-1/10 px-2 py-0.5 rounded border border-teach-1/30">
                    256-bit Digest
                  </span>
                </div>

                {/* Visual Flow: Raw -> Engine -> Hash */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">RAW TRANSACTION</span>
                    <span className="text-slate-200 font-bold">{rawTxString}</span>
                  </div>

                  <div className="flex justify-center my-1 text-teach-1">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  <div className="p-2.5 rounded-lg bg-teach-1/10 border border-teach-1/30 flex items-center justify-between">
                    <span className="text-teach-1 font-bold">SHA-256 ENGINE</span>
                    <span className="text-[10px] text-teach-1">64 Compression Rounds</span>
                  </div>

                  <div className="flex justify-center my-1 text-teach-1">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  <div className="p-3 rounded-lg bg-black border border-teach-1/40 space-y-1">
                    <span className="text-[10px] text-slate-400 block">TRANSACTION HASH (OUTPUT)</span>
                    <div className="break-all text-xs font-bold text-teach-1 font-mono">
                      {originalTxHash}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleComputeStep2Hash}
 className="w-full py-2.5 rounded-xl bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{language === 'vi' ? 'TÍNH SHA-256' : 'COMPUTE SHA-256'}</span>
                </button>
              </div>

              {/* Right: Interactive Re-Hash Avalanche Experiment */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#05070c] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>{language === 'vi' ? 'Thử Thay Đổi Dữ Liệu & Hash Lại' : 'Interactive Re-Hash'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/30">
                    Avalanche Demo
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <p className="text-slate-400 font-sans text-xs">
                    {language === 'vi'
                      ? 'Thử sửa số tiền từ 10 BTC thành 11 BTC và bấm "HASH LẠI" để quan sát sự khác biệt:'
                      : 'Modify amount from 10 to 11 BTC and click "RE-HASH" to observe hash mutation:'}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{createdTx.sender} &rarr; {createdTx.recipient} :</span>
                    <input
                      type="number"
                      value={step2EditAmount}
                      onChange={(e) => setStep2EditAmount(parseFloat(e.target.value) || 0)}
                      className="w-24 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold focus:outline-none focus:border-amber-400 text-xs font-mono"
                    />
                    <span className="text-slate-400">{createdTx.unit}</span>

                    <button
                      type="button"
                      onClick={handleRehashStep2}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs transition-all cursor-pointer shrink-0"
                    >
                      {language === 'vi' ? 'HASH LẠI' : 'RE-HASH'}
                    </button>
                  </div>

                  {step2IsRehashed && (
                    <div className="space-y-2 pt-2 border-t border-slate-800 animate-in fade-in">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Original Hash (10 BTC):</span>
                        <span className="text-[11px] text-slate-400 break-all">{originalTxHash}</span>
                      </div>

                      <div className="p-2 rounded bg-amber-950/30 border border-amber-500/40">
                        <span className="text-[10px] text-amber-400 block font-bold">
                          New Hash ({step2EditAmount} BTC):
                        </span>
                        <span className="text-[11px] text-amber-300 font-bold break-all">
                          {step2ModifiedHash}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 font-sans">
                        {language === 'vi'
                          ? '⚡ Chỉ cần thay đổi một phần rất nhỏ của dữ liệu, kết quả hash thay đổi mạnh. Đây là Avalanche Effect (Hiệu ứng thác đổ).'
                          : '⚡ Even a minute modification flips the cryptographic digest drastically (Avalanche Effect).'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PACKAGE INTO BLOCK */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Block Structure Explanation & Action */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-[#05070c] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-teach-1" />
                    <span>{language === 'vi' ? 'Đóng Gói Khối' : 'Package Block'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-teach-1 bg-teach-1/10 px-2 py-0.5 rounded border border-teach-1/30">
                    Block #1
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {language === 'vi'
                    ? 'Block là nơi đóng gói dữ liệu giao dịch trước khi được gắn vào chuỗi. Mỗi Block bao gồm: Số thứ tự Khối, Con trỏ Previous Hash trỏ tới khối trước, Dữ liệu giao dịch, Nonce và Bản băm khối.'
                    : 'A Block encapsulates transaction payload data before linking into the chain, including Block Index, Previous Hash pointer, Data, Nonce, and Block Hash.'}
                </p>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Previous Hash (Khối 0):</span>
                    <span className="text-teach-1 font-bold">{genesisHash.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transactions:</span>
                    <span className="text-slate-200 font-bold">{rawTxString}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nonce:</span>
                    <span className="text-slate-400">0</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePackBlock}
 className="w-full py-3 rounded-xl bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg "
                >
                  <Boxes className="w-4 h-4" />
                  <span>{language === 'vi' ? 'ĐÓNG GÓI BLOCK #1' : 'PACK BLOCK #1'}</span>
                </button>
              </div>

              {/* Right: Visual Block Card */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-[#05070c] border border-border-primary shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teach-1" />
                    <span className="text-sm font-mono font-bold text-teach-1">
                      BLOCK #1 (PACKAGED CONTAINER)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-teach-1/10 text-teach-1 border border-teach-1/30 font-bold">
                    VALID BLOCK
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold uppercase">
                      PREVIOUS HASH (Trỏ tới Block #0 Genesis)
                    </span>
                    <div className="p-2 rounded bg-slate-900/90 text-teach-1 text-xs truncate border border-slate-800 font-bold">
                      {genesisHash}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold uppercase">
                      DATA / TRANSACTIONS
                    </span>
                    <div className="p-2.5 rounded bg-slate-900/90 text-slate-200 text-xs border border-slate-800 font-bold">
                      {rawTxString}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">NONCE</span>
                      <div className="p-1.5 rounded bg-slate-900/90 text-slate-400 text-xs border border-slate-800">
                        0
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">TIMESTAMP</span>
                      <div className="p-1.5 rounded bg-slate-900/90 text-slate-400 text-xs border border-slate-800">
                        {createdTx.timestamp}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-teach-1 block font-bold uppercase">
                      BLOCK HASH = SHA256(Index + PrevHash + Data + Nonce)
                    </span>
                    <div className="p-2.5 rounded bg-teach-1/10 text-teach-1 text-xs break-all border border-teach-1/30 font-bold">
                      {block1InitialHash}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: HASH POINTER & LINKED LIST BRIDGE */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Visual 3-Block Hash Pointer Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Block 0 */}
              <div className="p-4 rounded-2xl bg-[#05070c] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-slate-300">BLOCK #0 (GENESIS)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teach-1/10 text-teach-1 border border-teach-1/20">
                    Genesis
                  </span>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">PREVIOUS HASH</span>
                    <div className="p-1.5 rounded bg-slate-900 text-slate-500 text-[10px] truncate border border-slate-800">
                      {genesisPrevHash}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">DATA</span>
                    <div className="p-1.5 rounded bg-slate-900 text-slate-300 text-xs border border-slate-800">
                      {genesisData}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-teach-1 block font-bold">BLOCK HASH (Hash #0)</span>
                    <div
                      onMouseEnter={() => setHoveredPointer('b0')}
                      onMouseLeave={() => setHoveredPointer(null)}
                      className={`p-2 rounded text-[10px] break-all border font-bold cursor-pointer transition-all ${
                        hoveredPointer === 'b0'
                          ? 'bg-teach-1/30 text-white border-teach-1 ring-2 ring-teach-1'
                          : 'bg-teach-1/10 text-teach-1 border border-teach-1/30'
                      }`}
                    >
                      {genesisHash}
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 1 */}
              <div
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  hoveredPointer === 'b0'
                    ? 'bg-teach-1/10 border-teach-1 ring-2 ring-teach-1/40 shadow-xl'
                    : 'bg-[#05070c] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-teach-1">BLOCK #1</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teach-1/10 text-teach-1 border border-teach-1/20">
                    Linked
                  </span>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-teach-1 block font-bold">
                      PREVIOUS HASH (Khớp với Hash #0 ☝️)
                    </span>
                    <div
                      onMouseEnter={() => setHoveredPointer('b0')}
                      onMouseLeave={() => setHoveredPointer(null)}
                      className={`p-1.5 rounded text-[10px] truncate border cursor-pointer font-bold ${
                        hoveredPointer === 'b0'
                          ? 'bg-teach-1/30 text-white border-teach-1 ring-2 ring-teach-1'
                          : 'bg-slate-900 text-teach-1 border border-slate-800'
                      }`}
                    >
                      {genesisHash}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">DATA</span>
                    <div className="p-1.5 rounded bg-slate-900 text-slate-300 text-xs border border-slate-800">
                      {rawTxString}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-teach-1 block font-bold">BLOCK HASH (Hash #1)</span>
                    <div
                      onMouseEnter={() => setHoveredPointer('b1')}
                      onMouseLeave={() => setHoveredPointer(null)}
                      className={`p-2 rounded text-[10px] break-all border font-bold cursor-pointer transition-all ${
                        hoveredPointer === 'b1'
                          ? 'bg-teach-1/30 text-white border-teach-1 ring-2 ring-teach-1'
                          : 'bg-teach-1/10 text-teach-1 border border-teach-1/30'
                      }`}
                    >
                      {block1InitialHash}
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 2 */}
              <div
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  hoveredPointer === 'b1'
                    ? 'bg-teach-1/10 border-teach-1 ring-2 ring-teach-1/40 shadow-xl'
                    : 'bg-[#05070c] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-slate-300">BLOCK #2</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teach-1/10 text-teach-1 border border-teach-1/20">
                    Linked
                  </span>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-teach-1 block font-bold">
                      PREVIOUS HASH (Khớp với Hash #1 ☝️)
                    </span>
                    <div
                      onMouseEnter={() => setHoveredPointer('b1')}
                      onMouseLeave={() => setHoveredPointer(null)}
                      className={`p-1.5 rounded text-[10px] truncate border cursor-pointer font-bold ${
                        hoveredPointer === 'b1'
                          ? 'bg-teach-1/30 text-white border-teach-1 ring-2 ring-teach-1'
                          : 'bg-slate-900 text-teach-1 border border-slate-800'
                      }`}
                    >
                      {block1InitialHash}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">DATA</span>
                    <div className="p-1.5 rounded bg-slate-900 text-slate-300 text-xs border border-slate-800">
                      Charlie -&gt; Dave : 5 BTC
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-teach-1 block font-bold">BLOCK HASH (Hash #2)</span>
                    <div className="p-2 rounded bg-teach-1/10 text-teach-1 text-[10px] break-all border border-teach-1/30 font-bold">
                      {fastSha256Hex(`2|${block1InitialHash}|Charlie -> Dave : 5 BTC|0|0`)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked List vs Blockchain Conceptual Comparison Bridge */}
            <div className="p-5 rounded-2xl bg-[#0B0E12] border border-border-primary space-y-4">
              <div className="flex items-center gap-2 text-teach-1 font-bold text-sm font-mono uppercase">
                <Link2 className="w-4 h-4 text-teach-1" />
                <span>
                  {language === 'vi'
                    ? 'Cầu Nối Khái Niệm: Linked List (Buổi 1) ➔ Blockchain'
                    : 'Concept Bridge: Linked List ➔ Blockchain'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {/* Linked List */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-bold">
                    <span>DANH SÁCH LIÊN KẾT</span>
                    <span className="text-[10px] text-slate-500">RAM Pointer</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 text-slate-300 space-y-1">
                    <div>Node A: DATA + <span className="text-teach-1 font-bold">NEXT (0x7ffd98a10)</span></div>
                    <div className="text-center text-slate-500">&darr; Trỏ ô nhớ RAM</div>
                    <div>Node B: DATA + <span className="text-teach-1 font-bold">NEXT (0x7ffd98a28)</span></div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    {language === 'vi'
                      ? 'Sửa dữ liệu Node A không làm thay đổi địa chỉ ô nhớ RAM của Node B. Không có tính năng phát hiện giả mạo.'
                      : 'Modifying Node A does not affect RAM address of Node B. No cryptographic tampering detection.'}
                  </p>
                </div>

                {/* Blockchain */}
                <div className="p-3.5 rounded-xl bg-teach-1/10 border border-teach-1/40 space-y-2">
                  <div className="flex items-center justify-between text-teach-1 font-bold">
                    <span>BLOCKCHAIN</span>
                    <span className="text-[10px] text-teach-1">Cryptographic Hash Pointer</span>
                  </div>
                  <div className="p-2.5 rounded bg-black/60 text-slate-300 space-y-1">
                    <div>Block #0: DATA + <span className="text-teach-1 font-bold">Hash #0 (6a09e667...)</span></div>
                    <div className="text-center text-teach-1">&darr; Khóa chặt bằng SHA-256</div>
                    <div>Block #1: <span className="text-teach-1 font-bold">PrevHash = Hash #0</span> + DATA</div>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {language === 'vi'
                      ? 'Blockchain kế thừa ý tưởng liên kết chuỗi từ Linked List, nhưng thay con trỏ bộ nhớ bằng liên kết dựa trên Hash không thể làm giả.'
                      : 'Blockchain inherits sequential chaining from Linked Lists, but substitutes volatile memory pointers with immutable cryptographic hashes.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: EXPAND BLOCKCHAIN (ADD BLOCKS DYNAMICALLY) */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#05070c] border border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-slate-300 uppercase block">
                  {language === 'vi' ? 'Thêm Giao Dịch & Mở Rộng Chuỗi Khối' : 'Add Transactions & Grow Chain'}
                </span>
                <span className="text-xs text-slate-400 font-sans">
                  {language === 'vi'
                    ? `Hiện tại chuỗi đang có ${chainBlocks.length} khối liên kết thực tế.`
                    : `Currently ${chainBlocks.length} real blocks linked in live state.`}
                </span>
              </div>

              {/* Quick Input Bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <input
                  type="text"
                  value={newBlockSender}
                  onChange={(e) => setNewBlockSender(e.target.value)}
                  placeholder="Sender"
                  className="w-24 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-teach-1 font-bold"
                />
                <span className="text-slate-500">&rarr;</span>
                <input
                  type="text"
                  value={newBlockRecipient}
                  onChange={(e) => setNewBlockRecipient(e.target.value)}
                  placeholder="Recipient"
                  className="w-24 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold"
                />
                <input
                  type="number"
                  value={newBlockAmount}
                  onChange={(e) => setNewBlockAmount(parseFloat(e.target.value) || 0)}
                  placeholder="BTC"
                  className="w-20 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-financial font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddBlockToChain}
 className="px-4 py-1.5 rounded-lg bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? '+ TẠO BLOCK MỚI' : '+ CREATE BLOCK'}</span>
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Blockchain Chain */}
            <div className="overflow-x-auto pb-4 pt-1">
              <div className="flex items-stretch gap-4 min-w-max">
                {chainBlocks.map((blk, idx) => (
                  <React.Fragment key={blk.index}>
                    <div className="w-72 p-4 rounded-2xl bg-[#05070c] border border-slate-800 space-y-2.5 font-mono text-xs flex flex-col justify-between shadow-xl">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-teach-1 font-bold">
                          BLOCK #{blk.index} {blk.index === 0 ? '(GENESIS)' : ''}
                        </span>
                        <span className="text-[10px] text-teach-1 bg-teach-1/10 px-2 py-0.5 rounded border border-teach-1/30">
                          VALID
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block">PREVIOUS HASH</span>
                          <div className="p-1 rounded bg-slate-900 text-slate-400 text-[10px] truncate border border-slate-800 font-bold">
                            {blk.prevHash}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block">DATA</span>
                          <div className="p-1.5 rounded bg-slate-900 text-slate-200 text-xs border border-slate-800">
                            {blk.data}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-teach-1 block font-bold">BLOCK HASH</span>
                          <div className="p-1.5 rounded bg-teach-1/10 text-teach-1 text-[10px] break-all border border-teach-1/30 font-bold">
                            {blk.hash}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
                        <span>Nonce: {blk.nonce}</span>
                        <span>{blk.timestamp}</span>
                      </div>
                    </div>

                    {idx < chainBlocks.length - 1 && (
                      <div className="flex flex-col items-center justify-center text-teach-1 px-1">
                        <Link2 className="w-5 h-5 text-teach-1" />
                        <span className="text-[9px] font-mono mt-1 text-slate-500">Hash Pointer</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: TAMPER ATTACK EXPERIMENT */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#05070c] border border-rose-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <h4 className="text-sm font-bold text-white font-mono uppercase">
                    {language === 'vi'
                      ? 'PHÒNG THỰC NGHIỆM TẤN CÔNG GIẢ MẠO DỮ LIỆU'
                      : 'TAMPER ATTACK LABORATORY'}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExecuteTamper}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-rose-950/50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? '⚠️ GIẢ MẠO DỮ LIỆU' : '⚠️ EXECUTE TAMPER'}</span>
                  </button>

                  {isTampered && (
                    <button
                      type="button"
                      onClick={handleRestoreChain}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{language === 'vi' ? 'Khôi Phục Gốc' : 'Restore'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Target Data Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">CHỌN KHỐI TẤN CÔNG</span>
                  <select
                    value={tamperTargetBlock}
                    onChange={(e) => setTamperTargetBlock(parseInt(e.target.value) || 1)}
                    className="w-full bg-transparent text-teach-1 font-bold focus:outline-none mt-1"
                  >
                    <option value={1}>Block #1 (Alice -&gt; Bob)</option>
                    <option value={2}>Block #2 (Charlie -&gt; Dave)</option>
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 sm:col-span-2">
                  <span className="text-[10px] text-slate-500 block">DỮ LIỆU BỊ SỬA ĐỔI GIAN LẬN (DATA)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-400">Alice -&gt; Hacker :</span>
                    <input
                      type="number"
                      value={tamperAmount}
                      onChange={(e) => setTamperAmount(parseFloat(e.target.value) || 100)}
                      className="w-24 px-2 py-0.5 rounded bg-black border border-slate-700 text-rose-300 font-bold"
                    />
                    <span className="text-slate-400">BTC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Blockchain showing broken link */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {tamperedChainState.slice(0, 3).map((blk, idx) => {
                const isTargetTampered = isTampered && blk.index === tamperTargetBlock;
                const isDownstreamBroken = isTampered && blk.index > tamperTargetBlock;

                return (
                  <div
                    key={blk.index}
                    className={`p-4 rounded-2xl border transition-all space-y-3 font-mono text-xs ${
                      isTargetTampered
                        ? 'bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/40 shadow-xl'
                        : isDownstreamBroken
                        ? 'bg-amber-950/20 border-amber-500/50'
                        : 'bg-[#05070c] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span
                        className={`font-bold ${
                          isTargetTampered
                            ? 'text-rose-400'
                            : isDownstreamBroken
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }`}
                      >
                        BLOCK #{blk.index}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] border ${
                          isTargetTampered
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                            : isDownstreamBroken
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-success/10 text-success border-success/20'
                        }`}
                      >
                        {isTargetTampered
                          ? 'TAMPERED ⚠️'
                          : isDownstreamBroken
                          ? 'MISMATCH ❌'
                          : 'VALID ✅'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">PREVIOUS HASH</span>
                        <div
                          className={`p-1.5 rounded text-[10px] truncate border ${
                            isDownstreamBroken
                              ? 'bg-amber-950/40 text-amber-200 border-amber-500/50 font-bold'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {blk.prevHash}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block">DATA</span>
                        <div
                          className={`p-1.5 rounded text-xs border ${
                            isTargetTampered
                              ? 'bg-rose-950/40 text-rose-200 border-rose-500/40 font-bold'
                              : 'bg-slate-900 text-slate-200 border-slate-800'
                          }`}
                        >
                          {blk.data}
                        </div>
                      </div>

                      <div>
                        <span
                          className={`text-[10px] block font-bold ${
                            isTargetTampered ? 'text-rose-400' : 'text-success'
                          }`}
                        >
                          BLOCK HASH
                        </span>
                        <div
                          className={`p-2 rounded text-[10px] break-all border font-bold ${
                            isTargetTampered
                              ? 'bg-rose-950/50 text-rose-200 border-rose-500/50'
                              : 'bg-slate-900/80 text-success border-slate-800'
                          }`}
                        >
                          {blk.hash}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Animation Breakdown Card */}
            {isTampered && (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2 text-xs font-mono animate-in fade-in">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>
                    {language === 'vi'
                      ? 'CƠ CHẾ LAN TRUYỀN HỎNG LIÊN KẾT (CASCADING BREAK):'
                      : 'CASCADING INVALIDATION BREAKDOWN:'}
                  </span>
                </div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  1. Dữ liệu Khối #1 thay đổi &rarr; 2. Mã băm Khối #1 tính lại khác hoàn toàn &rarr; 3. Khối #2 vẫn giữ Previous Hash cũ nên <strong>KHÔNG KHỚP (MISMATCH)</strong> &rarr; 4. Toàn bộ chuỗi phía sau bị vô hiệu hóa!
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 7: AVALANCHE EFFECT EXPERIMENT */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* String A */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#05070c] border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-teach-1">INPUT A (ORIGINAL)</span>
                  <span className="text-[10px] text-slate-500">64 Hex Output</span>
                </div>
                <input
                  type="text"
                  value={avalancheInputA}
                  onChange={(e) => setAvalancheInputA(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-teach-1 font-bold focus:outline-none"
                />
                <div>
                  <span className="text-[10px] text-slate-500 block">SHA-256 HASH A:</span>
                  <div className="p-2.5 rounded bg-black text-teach-1 text-xs break-all border border-teach-1/30 font-bold">
                    {avalancheHashA}
                  </div>
                </div>
              </div>

              {/* String B */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#05070c] border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-amber-300">INPUT B (MODIFIED 1 CHAR)</span>
                  <span className="text-[10px] text-amber-400">Mutated Output</span>
                </div>
                <input
                  type="text"
                  value={avalancheInputB}
                  onChange={(e) => setAvalancheInputB(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold focus:outline-none"
                />
                <div>
                  <span className="text-[10px] text-slate-500 block">SHA-256 HASH B:</span>
                  <div className="p-2.5 rounded bg-black text-amber-300 text-xs break-all border border-amber-500/30 font-bold">
                    {avalancheHashB}
                  </div>
                </div>
              </div>
            </div>

            {/* Bit Distance Calculation Metric */}
            <div className="p-5 rounded-2xl bg-[#0B0E12] border border-border-primary space-y-4 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <span className="font-bold text-white uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teach-1" />
                  <span>
                    {language === 'vi'
                      ? 'KẾT QUẢ TÍNH TOÁN HIỆU ỨNG THÁC ĐỔ (HAMMING BIT DISTANCE)'
                      : 'AVALANCHE EFFECT HAMMING DISTANCE'}
                  </span>
                </span>
                <span className="text-teach-1 font-bold px-3 py-1 rounded bg-teach-1/10 border border-teach-1/30">
                  Different Bits: {avalancheDiff.changedBits} / 256 ({avalancheDiff.percentage.toFixed(2)}%)
                </span>
              </div>

              {/* Bit Matrix Preview */}
              <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-500 block">
                  {language === 'vi'
                    ? 'So sánh trực tiếp 256 bits (Các bit màu cam là bit bị đảo ngược hoàn toàn):'
                    : '256-bit side-by-side binary comparison (Orange indicates flipped bits):'}
                </span>
                <div className="flex flex-wrap gap-0.5 max-h-24 overflow-y-auto p-1 font-mono text-[9px]">
                  {Array.from({ length: 256 }).map((_, i) => {
                    const isDiff = avalancheDiff.diffIndices.includes(i);
                    return (
                      <span
                        key={i}
                        className={`w-3.5 h-3.5 flex items-center justify-center rounded-xs select-none ${
                          isDiff
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                        title={`Bit #${i}: HashA=${avalancheDiff.bitsA[i]} vs HashB=${avalancheDiff.bitsB[i]}`}
                      >
                        {avalancheDiff.bitsA[i]}
                      </span>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {language === 'vi'
                  ? '⚡ Thay đổi rất nhỏ ở input có thể tạo ra thay đổi rất lớn ở output hash (~50% số bit bị đảo ngược). Điều này đảm bảo không kẻ gian nào có thể "đoán" hoặc "điều chỉnh" dữ liệu mà không làm lộ dấu vết.'
                  : '⚡ Minute input adjustments trigger macro output variations (~50% bit flip rate), providing mathematical tamper resistance.'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 8: INTEGRITY VERIFICATION LOOP */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#05070c] border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-success" />
                    <h4 className="text-sm font-bold text-white font-mono uppercase">
                      {language === 'vi'
                        ? 'XÁC MINH TÍNH TOÀN VẸN CỦA TOÀN BỘ BLOCKCHAIN'
                        : 'BLOCKCHAIN INTEGRITY VERIFICATION'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    {language === 'vi'
                      ? 'Thuật toán duyệt qua từng khối kiểm tra: 1. Mã băm dữ liệu nội tại & 2. Con trỏ Previous Hash với khối trước.'
                      : 'Verifies each block: 1. Internal payload digest & 2. Continuity of Previous Hash pointer.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={handleRunVerification}
 className="px-5 py-2.5 rounded-xl bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-bold font-mono text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg "
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isVerifying
                        ? language === 'vi'
                          ? 'ĐANG KIỂM TRA...'
                          : 'VERIFYING...'
                        : language === 'vi'
                        ? '🔍 VERIFY BLOCKCHAIN'
                        : '🔍 VERIFY BLOCKCHAIN'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Verification Checklist */}
              {verificationLog.length > 0 && (
                <div className="space-y-2 font-mono text-xs animate-in fade-in">
                  {verificationLog.map((log) => (
                    <div
                      key={log.index}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        log.valid
                          ? 'bg-success/15 border-success/40 text-success'
                          : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {log.valid ? (
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold block">{log.title}</span>
                          <span className="text-[11px] opacity-80">{log.detail}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border">
                        {log.valid ? 'PASSED ✓' : 'FAILED ✗'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Final Verification Banner */}
              {verificationDone && (
                <div
                  className={`p-4 rounded-xl border-2 space-y-2 animate-in fade-in ${
                    isChainValid
                      ? 'bg-success/15 border-success/60 text-success'
                      : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-bold font-mono">
                    {isChainValid ? (
                      <>
                        <ShieldCheck className="w-5 h-5 text-success" />
                        <span>BLOCKCHAIN VALID ✓ — CHUỖI KHỐI TOÀN VẸN & HỢP LỆ</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-5 h-5 text-rose-400" />
                        <span>BLOCKCHAIN INVALID ✗ — PHÁT HIỆN DỮ LIỆU BỊ GIẢ MẠO</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs font-sans leading-relaxed opacity-90">
                    {isChainValid
                      ? language === 'vi'
                        ? 'Mọi mã băm khối và con trỏ Previous Hash đều khớp chính xác 100%. Mạng lưới đồng thuận công nhận sổ cái này.'
                        : 'All block digests and Previous Hash references are mathematically validated. Consensus network approves ledger.'
                      : language === 'vi'
                      ? 'Phát hiện sự sai lệch giữa mã băm thực tế và Previous Hash được lưu giữ. Mọi node trong mạng lưới sẽ ngay lập tức từ chối chuỗi này.'
                      : 'Detected cryptographic divergence between actual data digests and downstream hash pointers. Network immediately rejects this chain.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP CONTROLS FOOTER: [BACK] [ACTION] [CONTINUE] */}
        {/* ==================================================== */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Back Button */}
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => handleStepSelect(Math.max(1, currentStep - 1))}
            className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Quay lại' : 'Back'}</span>
          </button>

          {/* Step Indicator */}
          <span className="text-xs font-mono text-zinc-500 hidden md:inline-block">
            {language === 'vi' ? `Bước ${currentStep} / 8: ${currentStepDef.badge}` : `Step ${currentStep} / 8: ${currentStepDef.badge}`}
          </span>

          {/* Continue Button (Enabled only when prerequisite action is satisfied) */}
          <button
            type="button"
            disabled={currentStep === 8}
            onClick={() => handleStepSelect(Math.min(8, currentStep + 1))}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-medium font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{language === 'vi' ? 'Tiếp tục' : 'Continue'}</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Final Completion Action (Link to Quiz) when on Step 8 */}
        {currentStep === 8 && verificationDone && (
          <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="text-xs text-zinc-400 font-sans">
              {language === 'vi'
                ? 'Hoàn thành toàn bộ thực nghiệm 8 bước từ Dữ liệu thô đến Blockchain toàn vẹn.'
                : 'Completed all 8 interactive pipeline steps from raw data to verified blockchain.'}
            </div>

            <a
              href="#quiz-section"
              onClick={onGoToQuiz}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>
                {language === 'vi'
                  ? 'Làm bài kiểm tra đánh giá'
                  : 'Take Quiz Assessment'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Code Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-xl bg-[#090a0f] border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-zinc-200">
                <Code2 className="w-4 h-4 text-zinc-400" />
                <span>
                  {language === 'vi'
                    ? 'MÃ NGUỒN CƠ CHẾ BLOCKCHAIN & CON TRỎ BĂM'
                    : 'SOURCE CODE: BLOCKCHAIN & HASH POINTER'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCodeModalOpen(false)}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono cursor-pointer transition-colors"
              >
                ✕ {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>

            {/* Modal Body with CodeViewer */}
            <div className="p-4 overflow-y-auto space-y-4 bg-[#090a0f]">
              <CodeViewer
                code={PYTHON_BLOCKCHAIN_CODE}
                language="python"
                filename="blockchain_foundation.py"
                maxHeight="60vh"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
