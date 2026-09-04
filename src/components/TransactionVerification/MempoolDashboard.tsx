
import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  Play,
  Pause,
  SkipBack,
  SkipForward
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
    format?: boolean;
    publicKey?: boolean;
    signature?: boolean;
    balance?: boolean;
    replay?: boolean;
    fields?: boolean;
  };
}

const INITIAL_ACCOUNTS: LedgerAccount[] = [
  {
    name: 'Alice',
    address: '0xAlice7192aBcD8910482019482710492837194029',
    publicKey: '044646ae5047316b4230d0086c8acec687f00b1cd9d1dc634f6cb358ac0a9a8ffffe77b4dd0a4bfb95851f3b7355c781dd60f8418fc8a65d14907aff47c903a559',
    privateKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    balance: 20.0,
  },
  {
    name: 'Bob',
    address: '0xBob83910fEcD7194028472910482910394820193',
    publicKey: '0488e2ddeb04657dbd0edadf9c1f98da3b3895faa1f00527934dd35d17542ffe9b1e7640d7737e24e36d208effb77e86affe670a9a497aa7fb52bf4e687a17fff4',
    privateKey: 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    balance: 10.0,
  },
  {
    name: 'Charlie',
    address: '0xCharlie2312679CTK47B91038472910482910394820',
    publicKey: '04f3487993f80fa3e0b31ea74eaa98e2f2333ef868d3f4fa57bb571bb3bd86142ba6f8d3c890b3c6a24f36c6224431877d94f0cef73aafeebcff18a35324d3f076',
    privateKey: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
    balance: 15.0,
  },
  {
    name: 'Kho bạc mạng lưới',
    address: '0xTreasury889900112233445566778899aabbccdd',
    publicKey: '04e68da570b51f8234f0906d39368a3406868fe25f418fd7b1b66d69e5928ba293a4bf54bbd213b62bf17953f99657841e74970053825152a219a373de79e8f822',
    privateKey: '99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa',
    balance: 50.0,
  },
];

interface TraceStep {
  activeStep: number;
  lastVerifiedTx: MempoolTransaction | null;
  accounts: LedgerAccount[];
  mempool: MempoolTransaction[];
  rejected: MempoolTransaction[];
  seenSignatures: Set<string>;
  focusId?: string;
  baseDelay?: number;
}

export const MempoolDashboard: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';
  const vStr = strings.verification as any;

  // Selected Scenario
  const [selectedScenario, setSelectedScenario] = useState<'VALID' | 'TAMPERED' | 'INSUFFICIENT' | 'REPLAY' | null>(null);

  // Playback State
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // UI State
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [revealedKeyAccount, setRevealedKeyAccount] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Derived state from current step
  const currentTrace = trace[stepIndex] || {
    activeStep: 0,
    lastVerifiedTx: null,
    accounts: INITIAL_ACCOUNTS,
    mempool: [],
    rejected: [],
    seenSignatures: new Set()
  };

  const { activeStep, lastVerifiedTx, accounts, mempool, rejected, seenSignatures } = currentTrace;

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-5)}`;
  };

  const buildSimulationTrace = async (scenario: 'VALID' | 'TAMPERED' | 'INSUFFICIENT' | 'REPLAY') => {
    setIsGenerating(true);
    const alice = INITIAL_ACCOUNTS[0];
    const bob = INITIAL_ACCOUNTS[1];
    
    let signedAmount = 10.0;
    let broadcastAmount = 10.0;
    
    if (scenario === 'TAMPERED') {
      broadcastAmount = 100.0;
    } else if (scenario === 'INSUFFICIENT') {
      signedAmount = 100.0;
      broadcastAmount = 100.0;
    }
    
    const newTrace: TraceStep[] = [];
    
    const baseMempool: MempoolTransaction[] = [];
    const baseRejected: MempoolTransaction[] = [];
    const baseSeen = new Set<string>();
    const baseAccounts = JSON.parse(JSON.stringify(INITIAL_ACCOUNTS)); 
    
    const txNonce = Math.floor(Math.random() * 90000) + 10000;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    
    const signedPayload = {
      id: `tx-${Date.now()}`,
      sender: alice.address,
      receiver: bob.address,
      amount: signedAmount,
      timestamp,
      nonce: txNonce,
    };
    
    const signedDigestRes = await computeTransactionDigest(signedPayload);
    const signature = await signTransactionData(signedDigestRes.hex, alice.privateKey);
    
    let targetNonce = txNonce;
    let targetSig = signature;
    let broadcastPayload = scenario === 'TAMPERED' 
      ? { ...signedPayload, amount: 100.0 } 
      : { ...signedPayload };
    
    // Scenario Replay: inject a valid tx first
    if (scenario === 'REPLAY') {
      const firstPayload = {
        id: `tx-${Date.now() - 10000}`,
        sender: alice.address,
        receiver: bob.address,
        amount: 5.0,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        nonce: Math.floor(Math.random() * 90000) + 10000,
      };
      const firstDigest = await computeTransactionDigest(firstPayload);
      const firstSig = await signTransactionData(firstDigest.hex, alice.privateKey);
      
      const firstTx: MempoolTransaction = {
        id: firstPayload.id,
        txNumber: 'TX-001',
        senderName: alice.name,
        senderAddress: alice.address,
        senderPublicKey: alice.publicKey,
        receiverName: bob.name,
        receiverAddress: bob.address,
        amount: firstPayload.amount,
        timestamp: firstPayload.timestamp,
        signature: firstSig,
        digest: firstDigest.hex,
        nonce: firstPayload.nonce,
        isValid: true,
        status: 'MEMPOOL',
        verificationChecks: { format: true, publicKey: true, signature: true, balance: true, replay: true, fields: true }
      };
      baseMempool.push(firstTx);
      baseSeen.add(firstSig);
      baseAccounts[0].balance -= 5.0;
      baseAccounts[1].balance += 5.0;
      
      broadcastPayload = firstPayload;
      targetSig = firstSig;
      targetNonce = firstPayload.nonce;
    }
    
    const broadcastDigestRes = await computeTransactionDigest(broadcastPayload);
    
    const cloneAccounts = (accs: any) => JSON.parse(JSON.stringify(accs));
    
    newTrace.push({ activeStep: 0, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts), baseDelay: 900 });
    newTrace.push({ activeStep: 1, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts), focusId: 'pipeline-viz', baseDelay: 1400 });
    newTrace.push({ activeStep: 2, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts), baseDelay: 900 });
    newTrace.push({ activeStep: 3, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts), baseDelay: 1000 });
    
    const formatPass = Boolean(alice.address && bob.address && broadcastPayload.amount > 0 && broadcastPayload.timestamp);
    const publicKeyPass = Boolean(alice.publicKey && alice.publicKey.startsWith('04'));
    const signaturePass = await verifyTransactionSignature(broadcastDigestRes.hex, targetSig, alice.publicKey);
    const balancePass = baseAccounts[0].balance >= broadcastPayload.amount;
    const replayPass = scenario === 'REPLAY' ? false : !baseSeen.has(targetSig);
    const fieldsPass = Boolean(broadcastPayload.nonce && alice.address !== bob.address);
    
    const createTxObj = (checks: any): MempoolTransaction => ({
      id: broadcastPayload.id,
      txNumber: scenario === 'REPLAY' ? 'TX-002' : 'TX-001',
      senderName: alice.name,
      senderAddress: alice.address,
      senderPublicKey: alice.publicKey,
      receiverName: bob.name,
      receiverAddress: bob.address,
      amount: broadcastPayload.amount,
      timestamp: broadcastPayload.timestamp,
      signature: targetSig,
      digest: broadcastDigestRes.hex,
      nonce: targetNonce,
      isValid: false,
      status: 'REJECTED',
      verificationChecks: checks
    });
    
    let currentChecks: any = { format: undefined, publicKey: undefined, signature: undefined, balance: undefined, replay: undefined, fields: undefined };
    
    const addAuditStep = (key: string, result: boolean) => {
      currentChecks = { ...currentChecks, [key]: result };
      newTrace.push({
        activeStep: 4,
        lastVerifiedTx: createTxObj(currentChecks),
        mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts),
        focusId: 'audit-panel',
        baseDelay: 1000
      });
      return result;
    };
    
    let failed = false;
    if (!failed) { if (!addAuditStep('format', formatPass)) failed = true; }
    if (!failed) { if (!addAuditStep('publicKey', publicKeyPass)) failed = true; }
    if (!failed) { if (!addAuditStep('signature', signaturePass)) failed = true; }
    if (!failed) { if (!addAuditStep('balance', balancePass)) failed = true; }
    if (!failed) { if (!addAuditStep('replay', replayPass)) failed = true; }
    if (!failed) { if (!addAuditStep('fields', fieldsPass)) failed = true; }
    
    const isAllValid = !failed;
    const txResult = createTxObj(currentChecks);
    txResult.isValid = isAllValid;
    txResult.status = isAllValid ? 'MEMPOOL' : 'REJECTED';
    
    if (!signaturePass) {
      txResult.rejectionReason = isVi ? 'Chữ ký không hợp lệ: Dữ liệu giao dịch đã bị thay đổi sau khi ký.' : 'Invalid signature: Transaction data was altered after signing.';
    } else if (!balancePass) {
      txResult.rejectionReason = isVi ? 'Số dư khả dụng không đủ để thực hiện giao dịch.' : 'Insufficient balance: Available funds are not enough.';
    } else if (!replayPass) {
      txResult.rejectionReason = isVi ? 'Phát hiện giao dịch trùng lặp: Nonce hoặc chữ ký đã được xử lý trước đó.' : 'Duplicate transaction detected: Nonce or signature already processed.';
    }
    
    const finalMempool = isAllValid ? [txResult, ...baseMempool] : [...baseMempool];
    const finalRejected = isAllValid ? [...baseRejected] : [txResult, ...baseRejected];
    const finalAccounts = cloneAccounts(baseAccounts);
    if (isAllValid) {
      finalAccounts[0].balance -= broadcastPayload.amount;
      finalAccounts[1].balance += broadcastPayload.amount;
    }
    const finalSeen = new Set(baseSeen);
    finalSeen.add(targetSig);
    
    newTrace.push({
      activeStep: isAllValid ? 5 : 6,
      lastVerifiedTx: txResult,
      mempool: finalMempool,
      rejected: finalRejected,
      seenSignatures: finalSeen,
      accounts: finalAccounts,
      focusId: 'result-panel',
      baseDelay: 1500
    });
    
    setTrace(newTrace);
    setStepIndex(0);
    setIsGenerating(false);
    setIsPlaying(true);
  };

  const handleStartSimulation = () => {
    if (selectedScenario) {
      buildSimulationTrace(selectedScenario);
    }
  };

  const handleReset = () => {
    setSelectedScenario(null);
    setTrace([]);
    setStepIndex(0);
    setIsPlaying(false);
    setExpandedAccount(null);
    setRevealedKeyAccount(null);
  };

  const speedRef = React.useRef(playbackSpeed);
  useEffect(() => {
    speedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const runDelay = async () => {
      if (isPlaying && trace.length > 0 && stepIndex < trace.length - 1) {
        const baseDelay = trace[stepIndex].baseDelay || 1000;
        const scaledDelay = baseDelay / speedRef.current;
        
        await new Promise(resolve => {
          timer = setTimeout(resolve, scaledDelay);
        });
        
        if (active) {
          setStepIndex(s => s + 1);
        }
      } else if (isPlaying && stepIndex >= trace.length - 1) {
        setIsPlaying(false);
      }
    };
    
    runDelay();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isPlaying, stepIndex, trace]);

  useEffect(() => {
    const current = trace[stepIndex];
    if (current?.focusId) {
      const el = document.getElementById(current.focusId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [stepIndex, trace]);

  const totalSubmitted = mempool.length + rejected.length;
  const validCount = mempool.length;
  const rejectedCount = rejected.length;
  const rejectionRate = totalSubmitted > 0 ? ((rejectedCount / totalSubmitted) * 100).toFixed(1) : '0.0';

  const verificationRules = [
    { name: isVi ? 'Định dạng giao dịch' : 'Transaction format', pass: lastVerifiedTx?.verificationChecks.format, desc: isVi ? 'Cấu trúc gói tin chuẩn' : 'Canonical structure' },
    { name: isVi ? 'Khóa công khai người gửi' : 'Sender public key', pass: lastVerifiedTx?.verificationChecks.publicKey, desc: isVi ? 'Điểm đường cong SECP256K1 hợp lệ' : 'Valid SECP256K1 point' },
    { name: isVi ? 'Chữ ký ECDSA' : 'ECDSA signature', pass: lastVerifiedTx?.verificationChecks.signature, desc: isVi ? 'Khớp mã băm SHA-256 nội dung' : 'Matches SHA-256 digest' },
    { name: isVi ? 'Kiểm tra số dư khả dụng' : 'Available funds check', pass: lastVerifiedTx?.verificationChecks.balance, desc: isVi ? 'Số dư người gửi ≥ số tiền chuyển' : 'Balance ≥ amount' },
    { name: isVi ? 'Đang kiểm tra chống phát lại' : 'Replay protection running', pass: lastVerifiedTx?.verificationChecks.replay, desc: isVi ? 'Tính duy nhất của Nonce / Chữ ký' : 'Unique nonce & sig' },
    { name: isVi ? 'Trường dữ liệu bắt buộc' : 'Required fields', pass: lastVerifiedTx?.verificationChecks.fields, desc: isVi ? 'Đầy đủ người gửi, người nhận, thời gian' : 'Complete fields' },
  ];

  const steps = [
    { step: 1, title: vStr.stepCreate, desc: vStr.stepCreateDesc, active: activeStep === 1 },
    { step: 2, title: vStr.stepSign, desc: vStr.stepSignDesc, active: activeStep === 2 },
    { step: 3, title: vStr.stepBroadcast, desc: vStr.stepBroadcastDesc, active: activeStep === 3 },
    { step: 4, title: vStr.stepAudit, desc: vStr.stepAuditDesc, active: activeStep === 4 },
    { step: 5, title: activeStep === 6 ? vStr.stepRejected : vStr.stepMempool, desc: activeStep === 6 ? vStr.stepRejectedDesc : vStr.stepMempoolDesc, active: activeStep === 5 || activeStep === 6, failed: activeStep === 6 },
  ];

  return (
    <div id="mempool-lab" className="space-y-6">
      
      {/* 0. Scenario Selection & Playback Controls */}
      <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1B2027] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#E7E9ED]">
            {isVi ? 'Kịch bản kiểm thử' : 'Test Scenarios'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setSelectedScenario('VALID')}
            className={`px-4 py-2.5 rounded-lg border text-xs font-medium transition-all text-center cursor-pointer ${selectedScenario === 'VALID' ? 'bg-[#1A2028] border-[#00D084] text-[#00D084]' : 'bg-[#0F1217] border-[#252B33] text-[#E7E9ED] hover:bg-[#1A2028] hover:border-[#00D084]/40 hover:text-[#00D084]'}`}
          >
            {vStr.attack1Title}
          </button>
          <button
            onClick={() => setSelectedScenario('TAMPERED')}
            className={`px-4 py-2.5 rounded-lg border text-xs font-medium transition-all text-center cursor-pointer ${selectedScenario === 'TAMPERED' ? 'bg-[#1A2028] border-rose-500 text-rose-400' : 'bg-[#0F1217] border-[#252B33] text-[#E7E9ED] hover:bg-[#1A2028] hover:border-rose-500/40 hover:text-rose-400'}`}
          >
            {vStr.attack2Title}
          </button>
          <button
            onClick={() => setSelectedScenario('INSUFFICIENT')}
            className={`px-4 py-2.5 rounded-lg border text-xs font-medium transition-all text-center cursor-pointer ${selectedScenario === 'INSUFFICIENT' ? 'bg-[#1A2028] border-amber-500 text-amber-400' : 'bg-[#0F1217] border-[#252B33] text-[#E7E9ED] hover:bg-[#1A2028] hover:border-amber-500/40 hover:text-amber-400'}`}
          >
            {vStr.attack3Title}
          </button>
          <button
            onClick={() => setSelectedScenario('REPLAY')}
            className={`px-4 py-2.5 rounded-lg border text-xs font-medium transition-all text-center cursor-pointer ${selectedScenario === 'REPLAY' ? 'bg-[#1A2028] border-purple-500 text-purple-400' : 'bg-[#0F1217] border-[#252B33] text-[#E7E9ED] hover:bg-[#1A2028] hover:border-purple-500/40 hover:text-purple-400'}`}
          >
            {vStr.attack4Title}
          </button>
        </div>

        {selectedScenario && (
          <div className="flex flex-wrap items-center gap-3 p-3 mt-4 rounded-lg bg-[#090C10] border border-[#1B2027]">
            {!trace.length ? (
              <button
                onClick={handleStartSimulation}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded bg-[#00D084]/10 text-[#00D084] border border-[#00D084]/30 hover:bg-[#00D084]/20 transition-colors text-sm font-medium"
              >
                <Play className="w-4 h-4" />
                {isVi ? 'Bắt đầu mô phỏng' : 'Start Simulation'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-[#1A2028] text-[#E7E9ED] border border-[#252B33] hover:border-[#374151] transition-colors text-sm font-medium"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? (isVi ? 'Tạm dừng' : 'Pause') : (isVi ? 'Tiếp tục' : 'Resume')}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-[#1A2028] text-[#E7E9ED] border border-[#252B33] hover:border-rose-500/40 hover:text-rose-400 transition-colors text-sm font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isVi ? 'Đặt lại' : 'Reset'}
                </button>

                <div className="flex-1 min-w-[20px]" />

                <div className="flex items-center gap-2 border border-[#252B33] rounded-lg p-1 bg-[#0B0E12]">
                  <button
                    onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
                    disabled={stepIndex === 0}
                    className="p-1.5 rounded hover:bg-[#1A2028] text-[#9AA2AE] hover:text-[#E7E9ED] disabled:opacity-50"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-[#9AA2AE] font-mono min-w-[60px] text-center">
                    {isVi ? 'Bước' : 'Step'} {Math.max(1, Math.min(5, activeStep))} / 5
                  </span>
                  <button
                    onClick={() => setStepIndex(Math.min(trace.length - 1, stepIndex + 1))}
                    disabled={stepIndex === trace.length - 1}
                    className="p-1.5 rounded hover:bg-[#1A2028] text-[#9AA2AE] hover:text-[#E7E9ED] disabled:opacity-50"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1 pl-3 sm:pl-4 border-l border-[#252B33]">
                  <span className="text-xs text-[#68717D] mr-1 hidden sm:inline">Speed:</span>
                  <div className="flex items-center bg-[#090a0f] border border-[#252B33] rounded overflow-hidden">
                    {[0.5, 1, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-2.5 py-1 text-xs font-mono transition-colors ${
                          playbackSpeed === speed
                            ? 'bg-[#1A2028] text-[#E7E9ED] border-b-2 border-[#00D084]'
                            : 'bg-transparent text-[#68717D] hover:bg-[#1A2028]/50 hover:text-[#9AA2AE] border-b-2 border-transparent'
                        }`}
                      >
                        {speed}×
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 1. Lifecycle Pipeline & Statistics Container */}
      <div id="pipeline-viz" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Visualization */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0B0E12] border border-[#1B2027] flex flex-col justify-center">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4">
            {steps.map((s, idx) => (
              <React.Fragment key={s.step}>
                <div
                  className={`flex flex-col items-center gap-2 relative ${
                    s.active ? 'scale-110 z-10' : 'opacity-50 grayscale'
                  } transition-all duration-300`}
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 font-mono text-sm sm:text-base font-bold shadow-lg
                    ${
                      s.active
                        ? s.failed
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-rose-500/20'
                          : 'bg-[#00D084]/20 border-[#00D084] text-[#00D084] shadow-[#00D084]/20'
                        : 'bg-[#090C10] border-[#252B33] text-[#68717D]'
                    }
                  `}
                  >
                    {s.step}
                  </div>
                  <div className="text-center absolute top-14 w-24">
                    <div
                      className={`text-[10px] sm:text-xs font-semibold ${
                        s.active
                          ? s.failed
                            ? 'text-rose-400'
                            : 'text-[#00D084]'
                          : 'text-[#68717D]'
                      }`}
                    >
                      {s.title}
                    </div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-[#1B2027] hidden sm:block relative mb-8">
                    {activeStep > s.step && (
                      <div className="absolute inset-0 bg-[#00D084]/50 animate-pulse" />
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>


        {/* Current Transaction Simulation Context */}
        {activeStep >= 1 && (
          <div id="step-create" className="lg:col-span-3 p-5 rounded-xl bg-[#090C10] border border-[#1B2027] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1B2027]">
              <span className="text-sm font-semibold text-[#E7E9ED]">
                {isVi ? 'Giao dịch đang mô phỏng' : 'Current Simulation Context'}
              </span>
              <span className="text-xs text-[#00D084] font-mono">
                {activeStep === 1 && (isVi ? 'Đang tạo...' : 'Creating...')}
                {activeStep === 2 && (isVi ? 'Đang ký...' : 'Signing...')}
                {activeStep === 3 && (isVi ? 'Truyền P2P...' : 'Broadcasting...')}
                {activeStep === 4 && (isVi ? 'Đang xác thực...' : 'Validating...')}
                {activeStep === 5 && (isVi ? 'Đã chấp nhận' : 'Accepted')}
                {activeStep === 6 && (isVi ? 'Bị từ chối' : 'Rejected')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Payload block */}
               <div className="p-3 rounded-lg bg-[#0F1217] border border-[#252B33] flex flex-col gap-2">
                 <div className="text-xs text-[#68717D]">{isVi ? 'Người gửi' : 'Sender'}</div>
                 <div className="text-sm font-semibold text-[#E7E9ED]">Alice</div>
                 <div className="text-xs text-[#68717D] mt-2">{isVi ? 'Người nhận' : 'Receiver'}</div>
                 <div className="text-sm font-semibold text-[#E7E9ED]">Bob</div>
                 <div className="text-xs text-[#68717D] mt-2">{isVi ? 'Số tiền' : 'Amount'}</div>
                 <div className="text-sm font-mono font-semibold text-money">
                   {selectedScenario === 'TAMPERED' && activeStep >= 3 ? (
                      <span className="text-money">100.0 BTC <span className="text-rose-400">(Bị sửa đổi!)</span></span>
                   ) : selectedScenario === 'INSUFFICIENT' ? (
                      <span className="text-money">100.0 BTC</span>
                   ) : (
                      <span>10.0 BTC</span>
                   )}
                 </div>
               </div>

               {/* Signing block */}
               {activeStep >= 2 && (
                 <div id="step-sign" className="p-3 rounded-lg bg-[#0F1217] border border-[#252B33] flex flex-col gap-2 col-span-1 sm:col-span-2 lg:col-span-3">
                   <div className="text-xs text-[#68717D]">{isVi ? 'Quá trình ký (Mô phỏng)' : 'Signing Process (Simulated)'}</div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                     <div className="p-3 bg-[#0A0D11] rounded border border-[#1B2027] text-[11px] font-mono text-sky-300/80 break-all leading-relaxed">
                       <span className="block text-[#68717D] mb-1">{isVi ? "Mã băm giao dịch (SHA-256)" : "Transaction Digest (SHA-256)"}</span>
                       a94f82c1...
                     </div>
                     <div className="hidden md:flex justify-center text-[#68717D]">
                        <span className="text-xs font-mono">+ {isVi ? "Khóa riêng" : "Private Key"} (Alice)</span>
                     </div>
                     <div className="p-3 bg-[#0A0D11] rounded border border-[#00D084]/30 text-[11px] font-mono text-[#00D084] break-all leading-relaxed">
                       <span className="block text-[#00D084]/70 mb-1">{isVi ? "Chữ ký số (ECDSA)" : "Digital Signature (ECDSA)"}</span>
                       30450221008f...9e21
                     </div>
                   </div>
                 </div>
               )}
            </div>

            {/* P2P Broadcast animation block */}
            {activeStep === 3 && (
               <div id="step-broadcast" className="p-4 rounded-lg bg-[#0F1217] border border-[#252B33] flex items-center justify-center h-24">
                  <div className="flex items-center gap-6 animate-pulse">
                     <div className="text-xs font-semibold text-[#E7E9ED]">Alice</div>
                     <div className="text-[#00D084] text-xs">───► (P2P Network) ───►</div>
                     <div className="flex gap-4 text-xs font-mono text-[#68717D]">
                       <span>Node A</span>
                       <span>Node B</span>
                       <span>Node C</span>
                     </div>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* Global Network Stats */}
        <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1B2027] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#E7E9ED]">
              {vStr.matrixTitle}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#090C10] border border-[#1B2027]">
              <div className="text-xs text-[#68717D] mb-1">{vStr.statTotal}</div>
              <div className="text-xl font-mono text-[#E7E9ED]">
                {totalSubmitted}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#090C10] border border-[#1B2027]">
              <div className="text-xs text-[#68717D] mb-1">{vStr.successRate}</div>
              <div className="text-xl font-mono text-[#00D084]">
                {totalSubmitted > 0 ? (100 - parseFloat(rejectionRate)).toFixed(1) : '100.0'}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#00D084]/5 border border-[#00D084]/20">
              <div className="text-xs text-[#00D084]/70 mb-1">{vStr.statValid}</div>
              <div className="text-xl font-mono text-[#00D084]">
                {validCount}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20">
              <div className="text-xs text-rose-400/70 mb-1">{vStr.statInvalid}</div>
              <div className="text-xl font-mono text-rose-400">
                {rejectedCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Educational Ledger & Account States */}
      <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1B2027] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#E7E9ED]">
            {vStr.ledgerTitle}
          </span>
          <span className="text-xs text-[#68717D]">{vStr.ledgerSubtitle}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {accounts.map((acc) => {
            const isExpanded = expandedAccount === acc.name;
            const isKeyRevealed = revealedKeyAccount === acc.name;

            return (
              <div
                key={acc.name}
                className="rounded-lg bg-[#090C10] border border-[#1B2027] overflow-hidden"
              >
                <div className="p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#E7E9ED]">
                      {acc.name}
                    </span>
                    <span className="font-mono text-money font-medium">
                      {acc.balance.toFixed(2)} BTC
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1A2028] border border-[#252B33]">
                      <span className="text-[#9AA2AE]">
                        {truncateAddress(acc.address)}
                      </span>
                      <button
                        onClick={() => handleCopy(acc.address, acc.name)}
                        className="text-[#68717D] hover:text-[#E7E9ED] cursor-pointer"
                      >
                        {copiedKey === acc.name ? <Check className="w-3 h-3 text-[#00D084]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <button
                      onClick={() => setExpandedAccount(isExpanded ? null : acc.name)}
                      className="text-[#68717D] hover:text-[#E7E9ED] p-1 cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pt-3 mt-3 border-t border-[#1B2027] space-y-3">
                      <div>
                        <span className="text-[#68717D] block font-sans text-[10px] mb-1">
                          {isVi ? 'Địa chỉ ví' : 'Wallet Address'}
                        </span>
                        <div className="bg-[#0A0D11] border border-[#1B2027] p-2 rounded text-[#E7E9ED] font-mono text-[11px] break-all leading-relaxed">
                          {acc.address}
                        </div>
                      </div>
                      <div>
                        <span className="text-[#68717D] block font-sans text-[10px] mb-1">
                          {isVi ? 'Khóa công khai' : 'Public Key'}
                        </span>
                        <div className="bg-[#0A0D11] border border-[#1B2027] p-2 rounded text-sky-300/80 font-mono text-[11px] break-all leading-relaxed">
                          {acc.publicKey.slice(0, 48)}...
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[#68717D] flex items-center gap-1 font-sans text-[10px]">
                            <Lock className="w-3 h-3 text-[#68717D]" />
                            <span>{isVi ? 'Khóa riêng' : 'Private Key'}</span>
                          </span>
                          <button
                            onClick={() => setRevealedKeyAccount(isKeyRevealed ? null : acc.name)}
                            className="text-[#9AA2AE] hover:text-[#E7E9ED] flex items-center gap-1 font-sans cursor-pointer text-[10px]"
                          >
                            {isKeyRevealed ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>{isVi ? 'Ẩn khóa' : 'Hide Key'}</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>{isVi ? 'Hiện khóa' : 'Reveal Key'}</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-[#0A0D11] border border-[#1B2027] p-2 rounded text-rose-400/90 font-mono text-[11px] break-all leading-relaxed">
                          {isKeyRevealed ? acc.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Real-Time Node Verification Audit Log */}
      <div id="audit-panel" className="grid grid-cols-1 gap-6">
        <div className="p-5 rounded-xl bg-[#0B0E12] border border-[#1B2027] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#E7E9ED]">
              {vStr.auditEngineTitle}
            </span>
            <span className="text-xs text-[#68717D]">{vStr.auditRules}</span>
          </div>

          <div id="result-panel">
            {lastVerifiedTx ? (
              lastVerifiedTx.isValid ? (
                <div className="px-3.5 py-2.5 mb-4 rounded-lg bg-[#00D084]/10 border border-[#00D084]/35 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#00D084] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#00D084] shrink-0" />
                    <span>{isVi ? 'Đã chấp nhận vào Mempool' : 'Accepted into Mempool'}</span>
                    <span className="text-[#9AA2AE] font-normal">
                      · {lastVerifiedTx.txNumber}: {lastVerifiedTx.senderName} → {lastVerifiedTx.receiverName} (<span className="text-money">{lastVerifiedTx.amount} BTC</span>)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="px-3.5 py-2.5 mb-4 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                      <span>{isVi ? 'Giao dịch bị từ chối' : 'Transaction rejected'}</span>
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
              <div className="px-3.5 py-2.5 mb-4 rounded-lg bg-[#090C10] border border-[#1B2027] text-xs text-[#68717D] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4B5563]" />
                <span>
                  {isVi
                    ? 'Chọn kịch bản và Bắt đầu mô phỏng để xem tiến trình xác thực.'
                    : 'Select a scenario and click Start Simulation to view validation progress.'}
                </span>
              </div>
            )}
          </div>

          <div className="divide-y divide-[#1B2027] border border-[#1B2027] rounded-lg overflow-hidden bg-[#090C10]">
            {verificationRules.map((chk, i) => (
              <div
                key={i}
                className="px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors duration-500"
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
                        <span>{isVi ? 'Không hợp lệ' : 'Invalid'}</span>
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
                      <span className="font-mono text-[11px] font-semibold text-[#E7E9ED] bg-[#0A0D11] border border-[#1B2027] px-1.5 py-0.5 rounded">
                        {tx.txNumber}
                      </span>
                      <span className="text-[#C5CBD3]">
                        {tx.senderName} → {tx.receiverName}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#68717D]">
                      Sig: <span className="text-[#E7E9ED] bg-[#1A2028] px-1 py-0.5 rounded">{tx.signature.slice(0, 14)}...</span> · Nonce: <span className="text-[#E7E9ED] bg-[#1A2028] px-1 py-0.5 rounded">{tx.nonce}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-money">
                      {tx.amount} BTC
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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
                      <span className="font-mono text-[11px] font-semibold text-[#E7E9ED] bg-[#0A0D11] border border-[#1B2027] px-1.5 py-0.5 rounded">
                        {tx.txNumber}
                      </span>
                      <span className="text-[#C5CBD3]">
                        {tx.senderName} → {tx.receiverName}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-money">
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
