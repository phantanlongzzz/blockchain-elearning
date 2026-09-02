import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  signTransactionData,
  verifyTransactionSignature,
  computeTransactionDigest,
} from '../../utils/crypto';

export interface LedgerAccount {
  name: string;
  address: string;
  publicKey: string;
  privateKey: string;
  balance: number;
}

export interface MempoolTransaction {
  id: string;
  txNumber: string;
  senderName: string;
  senderAddress: string;
  senderPublicKey: string;
  receiverName: string;
  receiverAddress: string;
  amount: number;
  timestamp: string;
  signature: string;
  digest: string;
  nonce: number;
  isValid: boolean;
  status: 'MEMPOOL' | 'REJECTED';
  rejectionReason?: string;
  verificationChecks: {
    format: boolean;
    publicKey: boolean;
    signature: boolean;
    balance: boolean;
    replay: boolean;
    fields: boolean;
  };
}

const INITIAL_ACCOUNTS: LedgerAccount[] = [
  {
    name: 'Alice',
    address: '0xAlice7192aBcD8910482019482710492837194029',
    publicKey: '04a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde04a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde',
    privateKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    balance: 20.0,
  },
  {
    name: 'Bob',
    address: '0xBob83910fEcD7194028472910482910394820193',
    publicKey: '04f0e1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c04f0e1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c',
    privateKey: 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    balance: 10.0,
  },
  {
    name: 'Phan Tấn Long',
    address: '0xLong2312679CTK47B91038472910482910394820',
    publicKey: '04394810293847192837461928374619283746192837461928374619283746190439481029384719283746192837461928374619283746192837461928374619',
    privateKey: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
    balance: 15.0,
  },
  {
    name: 'Kho Bạc Mạng Lưới (Treasury)',
    address: '0xTreasury889900112233445566778899aabbccdd',
    publicKey: '048899aabbccddeeff00112233445566778899aabbccddeeff00112233445566048899aabbccddeeff00112233445566778899aabbccddeeff00112233445566',
    privateKey: '99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa',
    balance: 50.0,
  },
];

export const MempoolDashboard: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';
  const vStr = strings.verification;

  const [accounts, setAccounts] = useState<LedgerAccount[]>(INITIAL_ACCOUNTS);
  const [mempool, setMempool] = useState<MempoolTransaction[]>([]);
  const [rejected, setRejected] = useState<MempoolTransaction[]>([]);
  const [seenSignatures, setSeenSignatures] = useState<Set<string>>(new Set());

  // Progressive disclosure & interaction states
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [revealedKeyAccount, setRevealedKeyAccount] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Verification Animation States
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [lastVerifiedTx, setLastVerifiedTx] = useState<MempoolTransaction | null>(null);

  // Helper to copy text to clipboard
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback
    }
  };

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-5)}`;
  };

  // Initialize seed transactions into mempool
  useEffect(() => {
    const initSeed = async () => {
      const alice = INITIAL_ACCOUNTS[0];
      const bob = INITIAL_ACCOUNTS[1];
      const long = INITIAL_ACCOUNTS[2];
      const treasury = INITIAL_ACCOUNTS[3];

      const seed1Payload = {
        id: 'seed-1',
        sender: alice.address,
        receiver: bob.address,
        amount: 2.5,
        timestamp: '2026-01-01 12:00:00 UTC',
        nonce: 101,
      };
      const d1 = await computeTransactionDigest(seed1Payload);
      const sig1 = await signTransactionData(d1.hex, alice.privateKey);

      const tx1: MempoolTransaction = {
        id: 'tx-seed-1',
        txNumber: 'TX-001',
        senderName: alice.name,
        senderAddress: alice.address,
        senderPublicKey: alice.publicKey,
        receiverName: bob.name,
        receiverAddress: bob.address,
        amount: 2.5,
        timestamp: '2026-01-01 12:00:00 UTC',
        signature: sig1,
        digest: d1.hex,
        nonce: 101,
        isValid: true,
        status: 'MEMPOOL',
        verificationChecks: {
          format: true,
          publicKey: true,
          signature: true,
          balance: true,
          replay: true,
          fields: true,
        },
      };

      const seed2Payload = {
        id: 'seed-2',
        sender: long.address,
        receiver: treasury.address,
        amount: 5.0,
        timestamp: '2026-01-01 12:05:00 UTC',
        nonce: 102,
      };
      const d2 = await computeTransactionDigest(seed2Payload);
      const sig2 = await signTransactionData(d2.hex, long.privateKey);

      const tx2: MempoolTransaction = {
        id: 'tx-seed-2',
        txNumber: 'TX-002',
        senderName: long.name,
        senderAddress: long.address,
        senderPublicKey: long.publicKey,
        receiverName: treasury.name,
        receiverAddress: treasury.address,
        amount: 5.0,
        timestamp: '2026-01-01 12:05:00 UTC',
        signature: sig2,
        digest: d2.hex,
        nonce: 102,
        isValid: true,
        status: 'MEMPOOL',
        verificationChecks: {
          format: true,
          publicKey: true,
          signature: true,
          balance: true,
          replay: true,
          fields: true,
        },
      };

      setMempool([tx1, tx2]);
      setSeenSignatures(new Set([sig1, sig2]));
    };

    initSeed();
  }, []);

  // Helper to execute full 6-point verification
  const processTransactionSubmission = async (
    sAcc: LedgerAccount,
    rAcc: LedgerAccount,
    signedAmount: number,
    broadcastAmount: number,
    customNonce?: number,
    forceDuplicateSig?: string
  ) => {
    setIsVerifying(true);
    setActiveStep(1); // Step 1: Create

    await new Promise((r) => setTimeout(r, 200));
    setActiveStep(2); // Step 2: Sign

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const txNonce = customNonce || Math.floor(Math.random() * 90000) + 10000;

    // 1. Compute digest for signed payload
    const signedPayload = {
      id: `tx-${Date.now()}`,
      sender: sAcc.address,
      receiver: rAcc.address,
      amount: signedAmount,
      timestamp,
      nonce: txNonce,
    };
    const signedDigestRes = await computeTransactionDigest(signedPayload);
    const signature = forceDuplicateSig || (await signTransactionData(signedDigestRes.hex, sAcc.privateKey));

    await new Promise((r) => setTimeout(r, 200));
    setActiveStep(3); // Step 3: Broadcast

    await new Promise((r) => setTimeout(r, 250));
    setActiveStep(4); // Step 4: Node Verification

    // Node checks the broadcast payload against sender public key and signature
    const broadcastPayload = {
      id: signedPayload.id,
      sender: sAcc.address,
      receiver: rAcc.address,
      amount: broadcastAmount,
      timestamp,
      nonce: txNonce,
    };
    const broadcastDigestRes = await computeTransactionDigest(broadcastPayload);

    // Check 1: Format & Structure
    const formatPass = Boolean(
      sAcc.address && rAcc.address && broadcastAmount > 0 && timestamp
    );

    // Check 2: Public Key validation
    const publicKeyPass = Boolean(
      sAcc.publicKey && sAcc.publicKey.startsWith('04') && sAcc.publicKey.length >= 64
    );

    // Check 3: Digital Signature Verification against broadcast digest
    const signaturePass = await verifyTransactionSignature(
      broadcastDigestRes.hex,
      signature,
      sAcc.publicKey
    );

    // Check 4: Balance & Liquidity Verification
    const balancePass = sAcc.balance >= broadcastAmount;

    // Check 5: Replay Protection Check
    const replayPass = !seenSignatures.has(signature);

    // Check 6: Required Fields & Timestamp Valid
    const fieldsPass = Boolean(txNonce && sAcc.address !== rAcc.address);

    const isAllValid =
      formatPass && publicKeyPass && signaturePass && balancePass && replayPass && fieldsPass;

    let reason: string | undefined = undefined;
    if (!signaturePass) {
      reason = isVi
        ? 'Chữ ký không hợp lệ: Dữ liệu giao dịch đã bị chỉnh sửa sau khi ký'
        : 'Invalid signature: Transaction data was altered after signing';
    } else if (!balancePass) {
      reason = isVi
        ? `Số dư không đủ: Tài khoản có ${sAcc.balance} BTC, cần chuyển ${broadcastAmount} BTC`
        : `Insufficient balance: Account has ${sAcc.balance} BTC, needs ${broadcastAmount} BTC`;
    } else if (!replayPass) {
      reason = isVi
        ? 'Phát hiện tấn công phát lại: Chữ ký hoặc Nonce đã được thực hiện trước đó'
        : 'Replay attack detected: Duplicate transaction signature / nonce already processed';
    } else if (!publicKeyPass) {
      reason = isVi
        ? 'Khóa công khai người gửi không hợp lệ'
        : 'Malformed sender public key';
    } else if (!formatPass || !fieldsPass) {
      reason = isVi
        ? 'Cấu trúc gói tin giao dịch không hợp lệ'
        : 'Malformed transaction payload structure';
    }

    const txNum = `TX-${String(mempool.length + rejected.length + 1).padStart(3, '0')}`;

    const txResult: MempoolTransaction = {
      id: broadcastPayload.id,
      txNumber: txNum,
      senderName: sAcc.name,
      senderAddress: sAcc.address,
      senderPublicKey: sAcc.publicKey,
      receiverName: rAcc.name,
      receiverAddress: rAcc.address,
      amount: broadcastAmount,
      timestamp,
      signature,
      digest: broadcastDigestRes.hex,
      nonce: txNonce,
      isValid: isAllValid,
      status: isAllValid ? 'MEMPOOL' : 'REJECTED',
      rejectionReason: reason,
      verificationChecks: {
        format: formatPass,
        publicKey: publicKeyPass,
        signature: signaturePass,
        balance: balancePass,
        replay: replayPass,
        fields: fieldsPass,
      },
    };

    await new Promise((r) => setTimeout(r, 200));
    setActiveStep(isAllValid ? 5 : 6); // Step 5: Accepted to Mempool or Step 6: Rejected

    setLastVerifiedTx(txResult);

    if (isAllValid) {
      // Deduct balance from sender and credit receiver in educational ledger
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.address === sAcc.address) {
            return { ...acc, balance: Number((acc.balance - broadcastAmount).toFixed(4)) };
          }
          if (acc.address === rAcc.address) {
            return { ...acc, balance: Number((acc.balance + broadcastAmount).toFixed(4)) };
          }
          return acc;
        })
      );
      setMempool((prev) => [txResult, ...prev]);
      setSeenSignatures((prev) => new Set([...prev, signature]));
    } else {
      setRejected((prev) => [txResult, ...prev]);
    }

    setIsVerifying(false);
  };

  // Preset 1: Standard Valid Transaction
  const runPresetValid = () => {
    const alice = accounts[0];
    const bob = accounts[1];
    processTransactionSubmission(alice, bob, 10.0, 10.0);
  };

  // Preset 2: REQUIRED DEMO — 10 BTC -> 100 BTC Tampering with Original Signature
  const runPresetTamperedAmount = () => {
    const alice = accounts[0];
    const bob = accounts[1];
    // Alice signs 10 BTC, but attacker broadcasts 100 BTC with original signature
    processTransactionSubmission(alice, bob, 10.0, 100.0);
  };

  // Preset 3: Insufficient Balance
  const runPresetInsufficientBalance = () => {
    const alice = accounts[0];
    const bob = accounts[1];
    // Alice tries to send 100 BTC (Balance 20 BTC)
    processTransactionSubmission(alice, bob, 100.0, 100.0);
  };

  // Preset 4: Replay Attack Demo
  const runPresetReplayAttack = () => {
    if (mempool.length === 0) {
      runPresetValid();
      return;
    }
    const target = mempool[0];
    const sAcc = accounts.find((a) => a.address === target.senderAddress) || accounts[0];
    const rAcc = accounts.find((a) => a.address === target.receiverAddress) || accounts[1];
    // Attempt to broadcast identical transaction signature again
    processTransactionSubmission(
      sAcc,
      rAcc,
      target.amount,
      target.amount,
      target.nonce,
      target.signature
    );
  };

  // Reset entire dashboard
  const handleReset = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setMempool([]);
    setRejected([]);
    setSeenSignatures(new Set());
    setLastVerifiedTx(null);
    setActiveStep(0);
    setExpandedAccount(null);
    setRevealedKeyAccount(null);
  };

  const totalSubmitted = mempool.length + rejected.length;
  const validCount = mempool.length;
  const rejectedCount = rejected.length;
  const rejectionRate =
    totalSubmitted > 0 ? ((rejectedCount / totalSubmitted) * 100).toFixed(1) : '0.0';

  const verificationRules = [
    {
      name: isVi ? 'Định dạng giao dịch' : 'Transaction format',
      pass: lastVerifiedTx?.verificationChecks.format,
      desc: isVi ? 'Cấu trúc gói tin chuẩn' : 'Canonical structure',
    },
    {
      name: isVi ? 'Khóa công khai người gửi' : 'Sender public key',
      pass: lastVerifiedTx?.verificationChecks.publicKey,
      desc: isVi ? 'Điểm đường cong SECP256K1 hợp lệ' : 'Valid SECP256K1 point',
    },
    {
      name: isVi ? 'Chữ ký ECDSA' : 'ECDSA signature',
      pass: lastVerifiedTx?.verificationChecks.signature,
      desc: isVi ? 'Khớp mã băm SHA-256 nội dung' : 'Matches SHA-256 digest',
    },
    {
      name: isVi ? 'Kiểm tra số dư' : 'Balance check',
      pass: lastVerifiedTx?.verificationChecks.balance,
      desc: isVi ? 'Số dư người gửi ≥ số tiền chuyển' : 'Balance ≥ amount',
    },
    {
      name: isVi ? 'Chống phát lại (Replay)' : 'Replay protection',
      pass: lastVerifiedTx?.verificationChecks.replay,
      desc: isVi ? 'Tính duy nhất của Nonce / Chữ ký' : 'Unique nonce & sig',
    },
    {
      name: isVi ? 'Trường dữ liệu bắt buộc' : 'Required fields',
      pass: lastVerifiedTx?.verificationChecks.fields,
      desc: isVi ? 'Đầy đủ người gửi, người nhận, thời gian' : 'Complete fields',
    },
  ];

  return (
    <div id="mempool-lab" className="space-y-6">
      {/* 1. Lifecycle Pipeline & Statistics Container */}
      <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1B2027] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1B2027]">
          <div>
            <h3 className="text-sm font-semibold text-[#E7E9ED]">
              {vStr.pipelineTitle}
            </h3>
            <p className="text-xs text-[#9AA2AE] mt-0.5">
              {vStr.pipelineDesc}
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-[#0F1217] hover:bg-[#1A2028] text-[#C5CBD3] border border-[#1B2027] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{vStr.resetDemo}</span>
          </button>
        </div>

        {/* 6-Stage Process Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {[
            { step: 1, title: vStr.stepWallet, desc: vStr.stepWalletDesc, active: activeStep === 1 },
            { step: 2, title: vStr.stepSign, desc: vStr.stepSignDesc, active: activeStep === 2 },
            { step: 3, title: vStr.stepBroadcast, desc: vStr.stepBroadcastDesc, active: activeStep === 3 },
            { step: 4, title: vStr.stepAudit, desc: vStr.stepAuditDesc, active: activeStep === 4 },
            { step: 5, title: vStr.stepMempool, desc: vStr.stepMempoolDesc, active: activeStep === 5, success: true },
            { step: 6, title: vStr.stepRejected, desc: vStr.stepRejectedDesc, active: activeStep === 6, failed: true },
          ].map((s) => (
            <div
              key={s.step}
              className={`p-3 rounded-lg border transition-colors flex flex-col justify-between ${
                s.active
                  ? 'border-[#00D084] bg-[#00D084]/10 text-[#00D084]'
                  : s.success && activeStep === 5
                  ? 'border-[#00D084]/40 bg-[#00D084]/5 text-[#00D084]'
                  : s.failed && activeStep === 6
                  ? 'border-rose-500/40 bg-rose-950/20 text-rose-400'
                  : 'border-[#1B2027] bg-[#090C10] text-[#9AA2AE]'
              }`}
            >
              <div className="font-medium text-[#E7E9ED] text-xs">{s.title}</div>
              <div className="text-[11px] text-[#68717D] mt-1">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Dynamic Statistics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-1">
          <div className="p-3 rounded-lg bg-[#090C10] border border-[#1B2027]">
            <span className="text-[11px] text-[#68717D] block">{vStr.statTotal}</span>
            <div className="text-lg font-semibold text-[#E7E9ED] mt-0.5 font-mono">{totalSubmitted}</div>
          </div>

          <div className="p-3 rounded-lg bg-[#090C10] border border-[#1B2027]">
            <span className="text-[11px] text-[#68717D] block">{vStr.statValid}</span>
            <div className="text-lg font-semibold text-[#00D084] mt-0.5 font-mono">{validCount}</div>
          </div>

          <div className="p-3 rounded-lg bg-[#090C10] border border-[#1B2027]">
            <span className="text-[11px] text-[#68717D] block">{vStr.statInvalid}</span>
            <div className="text-lg font-semibold text-rose-400 mt-0.5 font-mono">{rejectedCount}</div>
          </div>

          <div className="p-3 rounded-lg bg-[#090C10] border border-[#1B2027]">
            <span className="text-[11px] text-[#68717D] block">{vStr.statSize}</span>
            <div className="text-lg font-semibold text-[#E7E9ED] mt-0.5 font-mono">{mempool.length} TXs</div>
          </div>

          <div className="p-3 rounded-lg bg-[#090C10] border border-[#1B2027] col-span-2 sm:col-span-1">
            <span className="text-[11px] text-[#68717D] block">{vStr.statRate}</span>
            <div className="text-lg font-semibold text-[#C5CBD3] mt-0.5 font-mono">{rejectionRate}%</div>
          </div>
        </div>
      </div>

      {/* 2. Test Scenarios Action Area */}
      <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1B2027] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1B2027]">
          <span className="text-sm font-semibold text-[#E7E9ED]">
            {vStr.attacksTitle}
          </span>
          <span className="text-xs text-[#68717D]">{vStr.attacksSubtitle}</span>
        </div>

        {/* Compact action buttons row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={runPresetValid}
            disabled={isVerifying}
            className="px-4 py-2.5 rounded-lg bg-[#0F1217] hover:bg-[#1A2028] active:bg-[#1A2028] border border-[#252B33] hover:border-[#00D084]/40 text-[#E7E9ED] hover:text-[#00D084] text-xs font-medium transition-all text-center cursor-pointer disabled:opacity-50"
          >
            {vStr.attack1Title}
          </button>

          <button
            onClick={runPresetTamperedAmount}
            disabled={isVerifying}
            className="px-4 py-2.5 rounded-lg bg-[#0F1217] hover:bg-[#1A2028] active:bg-[#1A2028] border border-[#252B33] hover:border-rose-500/40 text-[#E7E9ED] hover:text-rose-300 text-xs font-medium transition-all text-center cursor-pointer disabled:opacity-50"
          >
            {vStr.attack2Title}
          </button>

          <button
            onClick={runPresetInsufficientBalance}
            disabled={isVerifying}
            className="px-4 py-2.5 rounded-lg bg-[#0F1217] hover:bg-[#1A2028] active:bg-[#1A2028] border border-[#252B33] hover:border-amber-500/40 text-[#E7E9ED] hover:text-amber-300 text-xs font-medium transition-all text-center cursor-pointer disabled:opacity-50"
          >
            {vStr.attack3Title}
          </button>

          <button
            onClick={runPresetReplayAttack}
            disabled={isVerifying}
            className="px-4 py-2.5 rounded-lg bg-[#0F1217] hover:bg-[#1A2028] active:bg-[#1A2028] border border-[#252B33] hover:border-emerald-500/40 text-[#E7E9ED] hover:text-emerald-300 text-xs font-medium transition-all text-center cursor-pointer disabled:opacity-50"
          >
            {vStr.attack4Title}
          </button>
        </div>
      </div>

      {/* 3. Main 2-Column Area: Wallets & Balances + Transaction Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Wallets & Balances */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#0B0E12] border border-[#1B2027] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1B2027]">
            <span className="text-sm font-semibold text-[#E7E9ED]">
              {vStr.ledgerTitle}
            </span>
            <span className="text-xs text-[#68717D]">{vStr.liveAccounts}</span>
          </div>

          <div className="space-y-2.5">
            {accounts.map((acc) => {
              const isExpanded = expandedAccount === acc.name;
              const isKeyRevealed = revealedKeyAccount === acc.name;
              const isCopied = copiedKey === `addr-${acc.name}`;

              return (
                <div
                  key={acc.name}
                  className="p-3.5 rounded-lg bg-[#090C10] border border-[#1B2027] space-y-2"
                >
                  {/* Primary Row: Name & Balance */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#E7E9ED] text-xs">{acc.name}</span>
                    <span className="font-mono text-xs font-semibold text-amber-400">
                      {acc.balance.toFixed(2)} BTC
                    </span>
                  </div>

                  {/* Secondary Row: Shortened address + copy & details toggle */}
                  <div className="flex items-center justify-between text-xs text-[#9AA2AE] pt-0.5">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-[#9AA2AE]">{truncateAddress(acc.address)}</span>
                      <button
                        onClick={() => handleCopy(acc.address, `addr-${acc.name}`)}
                        className="text-[#68717D] hover:text-[#C5CBD3] p-0.5 rounded cursor-pointer transition-colors"
                        title={isVi ? 'Sao chép địa chỉ' : 'Copy address'}
                      >
                        {isCopied ? (
                          <Check className="w-3 h-3 text-[#00D084]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => setExpandedAccount(isExpanded ? null : acc.name)}
                      className="text-[11px] text-[#9AA2AE] hover:text-[#E7E9ED] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{isExpanded ? (isVi ? 'Ẩn' : 'Hide') : (isVi ? 'Chi tiết' : 'Details')}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Progressive disclosure expandable panel */}
                  {isExpanded && (
                    <div className="pt-2 mt-2 border-t border-[#1B2027] space-y-2 text-[11px] font-mono text-[#9AA2AE]">
                      <div>
                        <span className="text-[#68717D] block font-sans text-[10px]">
                          {isVi ? 'Địa chỉ đầy đủ:' : 'Full address:'}
                        </span>
                        <span className="text-[#E7E9ED] break-all text-[10px]">{acc.address}</span>
                      </div>

                      <div>
                        <span className="text-[#68717D] block font-sans text-[10px]">
                          {isVi ? 'Khóa công khai (Public Key):' : 'Public Key:'}
                        </span>
                        <span className="text-[#00D084]/90 break-all text-[10px]">
                          {acc.publicKey.slice(0, 32)}...
                        </span>
                      </div>

                      {/* Private key reveal toggle */}
                      <div className="pt-1.5 flex items-center justify-between border-t border-[#1B2027]/80 text-[10px]">
                        <span className="text-[#68717D] flex items-center gap-1 font-sans">
                          <Lock className="w-3 h-3 text-[#68717D]" />
                          <span>{isVi ? 'Khóa bí mật' : 'Private Key'}</span>
                        </span>
                        <button
                          onClick={() => setRevealedKeyAccount(isKeyRevealed ? null : acc.name)}
                          className="text-[#9AA2AE] hover:text-[#E7E9ED] flex items-center gap-1 font-sans cursor-pointer"
                        >
                          {isKeyRevealed ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>{isVi ? 'Ẩn' : 'Hide'}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>{isVi ? 'Xem' : 'Reveal'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {isKeyRevealed && (
                        <div className="p-2 rounded bg-rose-950/20 border border-rose-500/30 text-[10px] text-rose-300 break-all">
                          {acc.privateKey}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-[#090C10] border border-[#1B2027] text-[11px] text-[#9AA2AE]">
            <span className="text-[#E7E9ED] font-medium">{vStr.roleTitle}: </span>
            {vStr.roleDesc}
          </div>
        </div>

        {/* Right Column (7 cols): Transaction Verification Engine */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-[#0B0E12] border border-[#1B2027] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1B2027]">
            <span className="text-sm font-semibold text-[#E7E9ED]">
              {vStr.auditEngineTitle}
            </span>
            <span className="text-xs text-[#68717D]">{vStr.auditRules}</span>
          </div>

          {/* Compact Inline Result/Error Area */}
          {lastVerifiedTx ? (
            lastVerifiedTx.isValid ? (
              <div className="px-3.5 py-2.5 rounded-lg bg-[#00D084]/10 border border-[#00D084]/35 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#00D084] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#00D084] shrink-0" />
                  <span>{isVi ? 'Đã chấp nhận vào Mempool' : 'Accepted into Mempool'}</span>
                  <span className="text-[#9AA2AE] font-normal">
                    · {lastVerifiedTx.txNumber}: {lastVerifiedTx.senderName} → {lastVerifiedTx.receiverName} ({lastVerifiedTx.amount} BTC)
                  </span>
                </div>
              </div>
            ) : (
              <div className="px-3.5 py-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                    <span>{isVi ? 'Từ chối giao dịch' : 'Transaction rejected'}</span>
                    <span className="text-[#9AA2AE] font-normal">· {lastVerifiedTx.txNumber}</span>
                  </div>
                </div>
                {lastVerifiedTx.rejectionReason && (
                  <div className="text-rose-300/90 text-xs pl-4 font-normal">
                    {lastVerifiedTx.rejectionReason}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="px-3.5 py-2.5 rounded-lg bg-[#090C10] border border-[#1B2027] text-xs text-[#68717D] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4B5563]" />
              <span>
                {isVi
                  ? 'Chọn một kịch bản kiểm thử phía trên để tiến hành xác thực.'
                  : 'Select a test scenario above to start real-time verification.'}
              </span>
            </div>
          )}

          {/* 6 Validation Results as a Compact Flat List (No nested cards, subtle status dot + text) */}
          <div className="divide-y divide-[#1B2027] border border-[#1B2027] rounded-lg overflow-hidden bg-[#090C10]">
            {verificationRules.map((chk, i) => (
              <div
                key={i}
                className="px-3.5 py-2.5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="text-[#E7E9ED] font-medium">{chk.name}</span>
                  <span className="text-[#68717D] text-[11px] ml-2 hidden sm:inline">
                    · {chk.desc}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono">
                  {chk.pass !== undefined ? (
                    chk.pass ? (
                      <span className="text-[#00D084] flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00D084]" />
                        <span>{isVi ? 'Hợp lệ' : 'Valid'}</span>
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span>{isVi ? 'Lỗi' : 'Invalid'}</span>
                      </span>
                    )
                  ) : (
                    <span className="text-[#68717D] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#374151]" />
                      <span>{isVi ? 'Chờ kiểm tra' : 'Pending'}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Live Mempool (Accepted) vs Rejected Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Mempool (Valid Pending Transactions) */}
        <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1B2027] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1B2027] text-xs">
            <span className="font-semibold text-[#E7E9ED]">
              {vStr.activeMempool} ({mempool.length})
            </span>
            <span className="text-[#68717D]">{vStr.readyForBlock}</span>
          </div>

          <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-1">
            {mempool.length === 0 ? (
              <div className="p-5 rounded-lg bg-[#090C10] border border-[#1B2027] text-center text-[#68717D] text-xs">
                {isVi ? 'Mempool hiện đang trống.' : 'Mempool is currently empty.'}
              </div>
            ) : (
              mempool.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-lg bg-[#090C10] border border-[#1B2027] hover:border-[#252B33] transition-colors flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#E7E9ED]">
                        {tx.txNumber}
                      </span>
                      <span className="text-[#C5CBD3]">
                        {tx.senderName} → {tx.receiverName}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#68717D]">
                      Sig: {tx.signature.slice(0, 14)}... · Nonce: {tx.nonce}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-[#00D084]">
                      {tx.amount} BTC
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rejected Transactions Area */}
        <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1B2027] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1B2027] text-xs">
            <span className="font-semibold text-[#E7E9ED]">
              {vStr.rejectedTransactions} ({rejected.length})
            </span>
            <span className="text-[#68717D]">{vStr.droppedFromConsensus}</span>
          </div>

          <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-1">
            {rejected.length === 0 ? (
              <div className="p-5 rounded-lg bg-[#090C10] border border-[#1B2027] text-center text-[#68717D] text-xs">
                {vStr.noRejected}
              </div>
            ) : (
              rejected.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-lg bg-[#090C10] border border-[#1B2027] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#E7E9ED]">
                        {tx.txNumber}
                      </span>
                      <span className="text-[#C5CBD3]">
                        {tx.senderName} → {tx.receiverName}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-rose-400">
                      {tx.amount} BTC
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-400/90">
                    {tx.rejectionReason || (isVi ? 'Xác minh thất bại' : 'Validation failed')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
