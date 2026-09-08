
import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ArrowRight,
  Inbox,
  Layers,
  AlertOctagon,
  CheckCircle2,
  Send,
  ShieldCheck,
  FileEdit,
  Coins,
  Repeat,
  Hash,
  Cpu,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { PassIcon, DenyIcon } from '../common/StatusIcons';
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
  const [isP2pExpanded, setIsP2pExpanded] = useState<boolean>(true);
  const [showLedger, setShowLedger] = useState<boolean>(false);

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
    newTrace.push({ activeStep: 2, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts), baseDelay: 1200 });
    newTrace.push({ activeStep: 3, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts), baseDelay: 1800 });
    
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
  const successRateValue =
    totalSubmitted > 0 ? ((validCount / totalSubmitted) * 100).toFixed(1) : '--';

  const verificationRules = [
    { name: isVi ? 'Định dạng giao dịch' : 'Transaction format', pass: lastVerifiedTx?.verificationChecks.format, desc: isVi ? 'Cấu trúc gói tin chuẩn' : 'Canonical structure' },
    { name: isVi ? 'Khóa công khai người gửi' : 'Sender public key', pass: lastVerifiedTx?.verificationChecks.publicKey, desc: isVi ? 'Điểm đường cong SECP256K1 hợp lệ' : 'Valid SECP256K1 point' },
    { name: isVi ? 'Chữ ký ECDSA' : 'ECDSA signature', pass: lastVerifiedTx?.verificationChecks.signature, desc: isVi ? 'Khớp mã băm SHA-256 nội dung' : 'Matches SHA-256 digest' },
    { name: isVi ? 'Kiểm tra số dư khả dụng' : 'Available funds check', pass: lastVerifiedTx?.verificationChecks.balance, desc: isVi ? 'Số dư người gửi ≥ số tiền chuyển' : 'Balance ≥ amount' },
    { name: isVi ? 'Chống phát lại (Replay Protection)' : 'Replay Protection', pass: lastVerifiedTx?.verificationChecks.replay, desc: isVi ? 'Tính duy nhất của Nonce / Chữ ký' : 'Unique nonce & sig' },
    { name: isVi ? 'Trường dữ liệu bắt buộc' : 'Required fields', pass: lastVerifiedTx?.verificationChecks.fields, desc: isVi ? 'Đầy đủ người gửi, người nhận, thời gian' : 'Complete fields' },
  ];

  const scenarioItems = [
    {
      id: 'VALID' as const,
      title: isVi ? 'Giao dịch hợp lệ' : 'Valid Transaction',
      desc: isVi ? 'Chữ ký số hợp lệ và đủ số dư khả dụng' : 'Valid digital signature and sufficient balance',
      icon: CheckCircle2,
      accentBorder: 'border-emerald-500/70',
      accentBg: 'bg-emerald-950/20',
      activeText: 'text-emerald-300',
      badge: isVi ? 'Hợp lệ' : 'Valid',
      badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'TAMPERED' as const,
      title: isVi ? 'Sửa dữ liệu sau khi ký' : 'Data Altered Post-Signing',
      desc: isVi ? 'Số tiền bị sửa đổi sau khi tạo chữ ký' : 'Amount modified after signature creation',
      icon: FileEdit,
      accentBorder: 'border-rose-500/70',
      accentBg: 'bg-rose-950/20',
      activeText: 'text-rose-300',
      badge: isVi ? 'Sai chữ ký' : 'Bad Signature',
      badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-500/30',
      iconColor: 'text-rose-400',
    },
    {
      id: 'INSUFFICIENT' as const,
      title: isVi ? 'Vượt số dư' : 'Insufficient Balance',
      desc: isVi ? 'Số tiền chuyển vượt quá số dư khả dụng' : 'Transfer amount exceeds available balance',
      icon: Coins,
      accentBorder: 'border-amber-500/70',
      accentBg: 'bg-amber-950/20',
      activeText: 'text-amber-300',
      badge: isVi ? 'Thiếu số dư' : 'Low Balance',
      badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      id: 'REPLAY' as const,
      title: isVi ? 'Phát lại giao dịch' : 'Transaction Replay',
      desc: isVi ? 'Giao dịch gửi lại với Nonce đã qua sử dụng' : 'Resending transaction with already used Nonce',
      icon: Repeat,
      accentBorder: 'border-purple-500/70',
      accentBg: 'bg-purple-950/20',
      activeText: 'text-purple-300',
      badge: isVi ? 'Trùng Nonce' : 'Replay Nonce',
      badgeColor: 'bg-purple-950/60 text-purple-300 border-purple-500/30',
      iconColor: 'text-purple-400',
    },
  ];

  const steps = [
    { step: 1, num: '01', title: isVi ? 'Tạo TX' : 'Create TX', sub: 'Transaction', active: activeStep === 1 },
    { step: 2, num: '02', title: isVi ? 'Ký số' : 'Sign', sub: 'ECDSA', active: activeStep === 2 },
    { step: 3, num: '03', title: isVi ? 'Truyền phát' : 'Broadcast', sub: 'P2P Gossip', active: activeStep === 3 },
    { step: 4, num: '04', title: isVi ? 'Kiểm định' : 'Node Audit', sub: 'Verify', active: activeStep === 4 },
    { step: 5, num: '05', title: activeStep === 6 ? (isVi ? 'Từ chối' : 'Rejected') : (isVi ? 'Mempool' : 'Mempool'), sub: activeStep === 6 ? (isVi ? 'Thất bại' : 'Failed') : (isVi ? 'Hàng đợi' : 'Queue'), active: activeStep === 5 || activeStep === 6, failed: activeStep === 6 },
  ];

  const progressPercent = activeStep === 0 ? 0 : activeStep === 1 ? 20 : activeStep === 2 ? 40 : activeStep === 3 ? 60 : activeStep === 4 ? 80 : 100;

  return (
    <div id="mempool-lab" className="space-y-6">
      
      {/* 0. Scenario Cards */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0B0F19]/90 border border-slate-800 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {isVi ? 'Kịch bản kiểm thử giao dịch' : 'Transaction Test Scenarios'}
            </span>
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              (4 Scenarios)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-sans">
            {isVi ? 'Chọn 1 kịch bản để chạy qua tiến trình xác thực bên dưới' : 'Select a scenario to run through the validation pipeline'}
          </span>
        </div>
        
        {/* 4 Selectable Scenario Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          {scenarioItems.map((item) => {
            const isSelected = selectedScenario === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedScenario(item.id)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? `${item.accentBg} ${item.accentBorder} ring-1 ring-cyan-500/40 shadow-sm`
                    : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-slate-900/80 border border-slate-700/60' : 'bg-slate-950/60 border border-slate-800'}`}>
                      <Icon className={`w-4 h-4 ${isSelected ? item.iconColor : 'text-slate-400 group-hover:text-slate-300'}`} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                    </div>
                  </div>
                  <h4 className={`text-xs sm:text-sm font-semibold tracking-tight mb-1 ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Lifecycle Pipeline & Statistics Container */}
      <div id="pipeline-viz" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horizontal Verification Pipeline with Integrated Playback Controls */}
        <div className="lg:col-span-2 p-4 sm:p-5 rounded-xl bg-[#0B0F19]/90 border border-slate-800 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2.5 pb-2.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                {isVi ? 'Tiến trình xác thực giao dịch' : 'Transaction Validation Pipeline'}
              </span>
              <span className="text-xs font-mono text-cyan-400 font-medium px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                {activeStep > 0 ? `${Math.max(1, Math.min(5, activeStep))}/5 Bước` : '0/5 Bước'}
              </span>
            </div>

            {/* Contextual Playback Controls directly inside the Pipeline */}
            <div className="flex items-center gap-2 flex-wrap">
              {!trace.length ? (
                <button
                  type="button"
                  onClick={handleStartSimulation}
                  disabled={isGenerating || !selectedScenario}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-lg font-semibold shadow-xs transition-all cursor-pointer active:scale-98 ${
                    selectedScenario
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 ring-1 ring-cyan-400/40'
                      : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-800'
                  }`}
                  title={!selectedScenario ? (isVi ? 'Vui lòng chọn 1 kịch bản bên trên' : 'Select a scenario above first') : ''}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isVi ? 'Chạy tiến trình' : 'Run Pipeline'}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                      isPlaying
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? (isVi ? 'Tạm dừng' : 'Pause') : (isVi ? 'Tiếp tục' : 'Resume')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 font-medium transition-colors cursor-pointer"
                    title={isVi ? 'Đặt lại tiến trình' : 'Reset pipeline'}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isVi ? 'Đặt lại' : 'Reset'}</span>
                  </button>

                  {/* Stepper controls */}
                  <div className="flex items-center gap-0.5 bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
                      disabled={stepIndex === 0}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                      title={isVi ? 'Bước trước' : 'Previous step'}
                    >
                      <SkipBack className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] text-slate-300 font-mono px-1.5 text-center font-semibold min-w-[32px]">
                      {Math.max(1, Math.min(5, activeStep))}/5
                    </span>
                    <button
                      type="button"
                      onClick={() => setStepIndex(Math.min(trace.length - 1, stepIndex + 1))}
                      disabled={stepIndex === trace.length - 1}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                      title={isVi ? 'Bước tiếp' : 'Next step'}
                    >
                      <SkipForward className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Speed selector */}
                  <div className="bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-[10px] font-mono flex items-center gap-0.5">
                    {[0.5, 1, 2].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          playbackSpeed === speed
                            ? 'bg-slate-800 text-cyan-300 font-semibold shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {speed}×
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar & Status Line */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                {activeStep === 0 && <span className="text-slate-500">{isVi ? 'Trạng thái: Sẵn sàng kiểm thử' : 'Status: Ready'}</span>}
                {activeStep === 1 && <span className="text-cyan-300">{isVi ? 'Bước 1/5: Tạo dữ liệu giao dịch' : 'Step 1/5: Creating Payload'}</span>}
                {activeStep === 2 && <span className="text-cyan-300">{isVi ? 'Bước 2/5: Băm SHA-256 & Ký số ECDSA' : 'Step 2/5: Hashing & ECDSA Signing'}</span>}
                {activeStep === 3 && <span className="text-cyan-300">{isVi ? 'Bước 3/5: Truyền phát mạng ngang hàng P2P' : 'Step 3/5: P2P Network Propagation'}</span>}
                {activeStep === 4 && <span className="text-amber-300">{isVi ? 'Bước 4/5: Nút mạng kiểm tra 6 tiêu chí' : 'Step 4/5: Node Verification Checks'}</span>}
                {activeStep === 5 && <span className="text-emerald-300">{isVi ? 'Bước 5/5: Hoàn tất - Chấp nhận vào Mempool' : 'Step 5/5: Accepted into Mempool'}</span>}
                {activeStep === 6 && <span className="text-rose-400">{isVi ? 'Bước 5/5: Thất bại - Giao dịch bị từ chối' : 'Step 5/5: Transaction Rejected'}</span>}
              </span>
              <span className="font-semibold text-slate-300">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  activeStep === 6 ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 5 Interconnected Pipeline Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full pt-1">
            {steps.map((s) => {
              const isPast = activeStep > s.step;
              const isCurrent = activeStep === s.step || (s.step === 5 && activeStep === 6);
              const isFailed = s.failed;

              return (
                <div
                  key={s.step}
                  className={`p-2.5 rounded-lg border transition-all duration-200 flex flex-col justify-between space-y-1.5 ${
                    isCurrent
                      ? isFailed
                        ? 'bg-rose-950/30 border-rose-500/70 text-rose-200 ring-1 ring-rose-500/40 shadow-sm'
                        : 'bg-cyan-950/30 border-cyan-500/70 text-cyan-200 ring-1 ring-cyan-500/40 shadow-sm'
                      : isPast || (s.step === 5 && activeStep === 5)
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900/40 border-slate-800/70 text-slate-400 hover:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold tracking-wider opacity-80">
                      {s.num}
                    </span>
                    <div>
                      {isPast || (s.step === 5 && activeStep === 5) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        isFailed ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                        )
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-tight text-white truncate">
                      {s.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {s.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty-state helper line when not yet simulated */}
          {trace.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 animate-pulse shrink-0" />
              <span>
                {isVi
                  ? 'Chọn một kịch bản và bắt đầu mô phỏng để quan sát vòng đời giao dịch.'
                  : 'Select a scenario and click Start Simulation to observe the transaction lifecycle.'}
              </span>
            </div>
          )}
        </div>

        {/* Global Network Stats */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0B0F19]/90 border border-slate-800/90 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {vStr.matrixTitle}
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Live Metrics</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Stat 1: Total Submitted */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{vStr.statTotal}</span>
                <Send className="w-3 h-3 text-cyan-400/70" />
              </div>
              <div className="text-2xl font-mono font-bold tracking-tight text-white">
                {totalSubmitted}
              </div>
            </div>

            {/* Stat 2: Success Rate */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{vStr.successRate}</span>
                <ShieldCheck className="w-3 h-3 text-emerald-400/70" />
              </div>
              <div
                className={`text-2xl font-mono font-bold tracking-tight ${
                  totalSubmitted > 0 && validCount > 0
                    ? 'text-emerald-400'
                    : totalSubmitted > 0
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {totalSubmitted > 0 ? `${successRateValue}%` : '--'}
              </div>
            </div>

            {/* Stat 3: Valid */}
            <div className={`p-3 rounded-lg transition-all ${
              validCount > 0
                ? 'bg-emerald-950/20 border border-emerald-500/40'
                : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={validCount > 0 ? 'text-emerald-300 font-medium' : 'text-slate-400'}>{vStr.statValid}</span>
                <CheckCircle2 className={`w-3 h-3 ${validCount > 0 ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>
              <div className={`text-2xl font-mono font-bold tracking-tight ${validCount > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {validCount}
              </div>
            </div>

            {/* Stat 4: Rejected */}
            <div className={`p-3 rounded-lg transition-all ${
              rejectedCount > 0
                ? 'bg-rose-950/20 border border-rose-500/40'
                : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={rejectedCount > 0 ? 'text-rose-300 font-medium' : 'text-slate-400'}>{vStr.statInvalid}</span>
                <AlertOctagon className={`w-3 h-3 ${rejectedCount > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
              </div>
              <div className={`text-2xl font-mono font-bold tracking-tight ${rejectedCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {rejectedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Empty State / Ready to Simulate stage card when idle */}
        {activeStep === 0 && (
          <div className="lg:col-span-3 p-6 sm:p-8 rounded-xl bg-[#0B0F19]/90 border border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-lg">
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                {isVi ? 'Sẵn sàng mô phỏng vòng đời giao dịch' : 'Ready to Simulate'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {isVi
                  ? 'Chọn một kịch bản kiểm thử bên trên để bắt đầu quy trình xác thực giao dịch.'
                  : 'Select a test scenario above to begin transaction validation.'}
              </p>
            </div>
            {selectedScenario ? (
              <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleStartSimulation}
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>{isVi ? 'Bắt đầu mô phỏng ▶' : 'Start Simulation ▶'}</span>
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  {isVi ? 'Kịch bản: ' : 'Scenario: '}
                  <span className="text-cyan-300 font-semibold">
                    {selectedScenario === 'VALID' && (isVi ? 'Giao dịch hợp lệ' : 'Valid Transaction')}
                    {selectedScenario === 'TAMPERED' && (isVi ? 'Sửa dữ liệu sau khi ký' : 'Data Altered Post-Signing')}
                    {selectedScenario === 'INSUFFICIENT' && (isVi ? 'Vượt số dư' : 'Insufficient Balance')}
                    {selectedScenario === 'REPLAY' && (isVi ? 'Phát lại giao dịch' : 'Transaction Replay')}
                  </span>
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
                <span>👈 {isVi ? 'Chọn một kịch bản kiểm thử phía trên để tiếp tục' : 'Select a scenario above to proceed'}</span>
              </div>
            )}
          </div>
        )}

        {/* Current Transaction Simulation Context & Cryptographic Pipeline */}
        {activeStep >= 1 && (
          <div id="step-create" className="lg:col-span-3 p-5 rounded-xl bg-bg-secondary border border-border-primary space-y-4">
            {/* Header & Status Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-border-primary">
              <span className="text-sm font-semibold text-text-primary">
                {isVi ? 'Giao dịch đang mô phỏng' : 'Current Simulation Context'}
              </span>
              <div>
                {activeStep === 1 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted bg-bg-primary border border-border-secondary px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                    {isVi ? 'Đang tạo...' : 'Creating...'}
                  </span>
                )}
                {activeStep === 2 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-teach-1 bg-teach-1/10 border border-teach-1/20 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-teach-1" />
                    {isVi ? 'Đang ký số...' : 'Signing...'}
                  </span>
                )}
                {activeStep === 3 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-teach-2 bg-teach-2/10 border border-teach-2/20 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-teach-2" />
                    {isVi ? 'Truyền P2P...' : 'Broadcasting...'}
                  </span>
                )}
                {activeStep === 4 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-color-info bg-color-info/10 border border-color-info/20 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-color-info" />
                    {isVi ? 'Đang xác thực...' : 'Validating...'}
                  </span>
                )}
                {activeStep === 5 && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-success bg-success/10 border border-success/20 px-2.5 py-0.5 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Đã chấp nhận' : 'Accepted'}</span>
                  </span>
                )}
                {activeStep === 6 && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-error bg-error/10 border border-error/20 px-2.5 py-0.5 rounded-full">
                    <X className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Bị từ chối' : 'Rejected'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* 2 Balanced Columns: TX Parameters + Cryptographic Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Cột 1: Thông số TX (col-span-1 lg:col-span-5) */}
              <div className="lg:col-span-5 p-4 rounded-lg bg-bg-primary border border-border-secondary flex flex-col justify-between space-y-3">
                <div className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  {isVi ? 'Thông số giao dịch' : 'Transaction Payload'}
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border-secondary">
                    <span className="text-text-muted">{isVi ? 'Người gửi' : 'Sender'}</span>
                    <span className="text-text-primary font-mono font-medium">Alice <span className="text-text-muted text-[11px]">(0xAlice7...)</span></span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-border-secondary">
                    <span className="text-text-muted">{isVi ? 'Người nhận' : 'Receiver'}</span>
                    <span className="text-text-primary font-mono font-medium">Bob <span className="text-text-muted text-[11px]">(0xBob839...)</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">{isVi ? 'Số tiền' : 'Amount'}</span>
                    <div className="text-right">
                      {selectedScenario === 'TAMPERED' && activeStep >= 3 ? (
                        <div className="space-y-0.5">
                          <span className="text-financial font-mono font-bold text-sm sm:text-base">100.00 BTC</span>
                          <span className="text-error text-[11px] font-mono block">({isVi ? 'Bị sửa đổi trái phép!' : 'Tampered Payload!'})</span>
                        </div>
                      ) : selectedScenario === 'INSUFFICIENT' ? (
                        <div className="space-y-0.5">
                          <span className="text-financial font-mono font-bold text-sm sm:text-base">100.00 BTC</span>
                          <span className="text-text-muted text-[11px] font-mono block">({isVi ? 'Số dư không đủ' : 'Insufficient funds'})</span>
                        </div>
                      ) : (
                        <span className="text-financial font-mono font-bold text-sm sm:text-base">10.00 BTC</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột 2: Quy trình ký ECDSA (col-span-1 lg:col-span-7) */}
              <div id="step-sign" className="lg:col-span-7 p-4 rounded-lg bg-bg-primary border border-border-secondary flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    {isVi ? 'Quy trình ký số ECDSA' : 'ECDSA Cryptographic Pipeline'}
                  </span>
                  <span className="text-[11px] font-mono text-text-muted">SECP256k1</span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-2 justify-between">
                  {/* Box Hash */}
                  <div className="flex-1 bg-bg-secondary border border-border-secondary p-2.5 rounded font-mono text-xs space-y-1 min-w-0">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted block">
                      DIGEST (SHA-256)
                    </span>
                    <span className="text-teach-1 font-mono text-xs break-all block truncate" title="a94f82c16e789d34b2210871">
                      a94f82c1...e871
                    </span>
                  </div>

                  {/* Connector */}
                  <div className="flex flex-row sm:flex-col items-center justify-center shrink-0 px-1 py-0.5 text-center gap-1 sm:gap-0.5">
                    <div className="flex items-center gap-1 text-text-muted">
                      <ArrowRight className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
                      <span className="text-xs font-mono text-text-muted sm:hidden">+</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted whitespace-nowrap">
                      {isVi ? '+ Khóa riêng (Alice)' : '+ Private Key (Alice)'}
                    </span>
                  </div>

                  {/* Box Chữ ký ECDSA */}
                  <div className="flex-1 bg-bg-secondary border border-border-secondary p-2.5 rounded font-mono text-xs space-y-1 min-w-0">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted block">
                      {isVi ? 'CHỮ KÝ ECDSA (r, s)' : 'ECDSA SIGNATURE (r, s)'}
                    </span>
                    <span className="text-teach-2 font-mono text-xs break-all block truncate" title="30450221008f39...9e21">
                      30450221008f...9e21
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* P2P Broadcast Network Flow Animation block (Persistent & Collapsible) */}
            {(() => {
              const isP2pPending = activeStep < 3;
              const isP2pActive = activeStep === 3;
              const isP2pCompleted = activeStep >= 4;

              return (
                <div id="step-broadcast" className="p-4 sm:p-5 rounded-lg bg-bg-primary border border-border-secondary space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                        {isVi ? 'Mạng ngang hàng P2P (Gossip Protocol)' : 'P2P Gossip Network Propagation'}
                      </span>
                      {!isP2pExpanded && (
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isP2pPending 
                            ? 'text-text-muted bg-bg-elevated border border-border-secondary'
                            : isP2pActive 
                            ? 'text-teach-1 bg-teach-1/10 border border-teach-1/20'
                            : 'text-success bg-success/10 border border-success/20'
                        }`}>
                          {isP2pPending ? (
                            <span>{isVi ? '0/3 Nodes (Chờ phát sóng)' : '0/3 Nodes (Awaiting)'}</span>
                          ) : isP2pActive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-teach-1" />
                              <span>{isVi ? 'Đang lan truyền...' : 'Broadcasting...'}</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 text-success" />
                              <span>{isVi ? '3/3 Nodes đã đồng bộ' : '3/3 Nodes Synced'}</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isP2pExpanded && (
                        <>
                          {isP2pPending && (
                            <span className="text-[11px] font-mono text-text-muted bg-bg-elevated border border-border-secondary px-2 py-0.5 rounded-full flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-text-muted/50" />
                              {isVi ? 'Chờ phát sóng...' : 'Awaiting broadcast...'}
                            </span>
                          )}
                          {isP2pActive && (
                            <span className="text-[11px] font-mono text-teach-1 bg-teach-1/10 border border-teach-1/20 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teach-1" />
                              {isVi ? 'Đang lan truyền gói tin...' : 'Broadcasting payload...'}
                            </span>
                          )}
                          {isP2pCompleted && (
                            <span className="text-[11px] font-mono text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-success" />
                              {isVi ? '3/3 Nodes đã nhận gói tin' : '3/3 Nodes Synced'}
                            </span>
                          )}
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsP2pExpanded(!isP2pExpanded)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
                        title={isP2pExpanded ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Mở rộng' : 'Expand')}
                      >
                        <span className="text-[11px]">{isP2pExpanded ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Mở rộng' : 'Expand')}</span>
                        {isP2pExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {isP2pExpanded && (
                    <div className="space-y-4 pt-1">
                      {/* Top Flow: Alice Wallet -> Gossip Network */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 py-2">
                        {/* Alice Wallet */}
                        <div className={`px-3.5 py-2 rounded-md bg-bg-secondary border flex items-center gap-2 text-xs font-mono transition-colors duration-200 ${
                          isP2pPending 
                            ? 'border-border-primary opacity-60 text-text-muted' 
                            : isP2pActive 
                            ? 'border-teach-1/40 text-text-primary shadow-xs' 
                            : 'border-border-primary text-text-primary'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isP2pPending ? 'bg-text-muted/40' : 'bg-teach-1'}`} />
                          <span className="font-semibold">Alice (Wallet)</span>
                        </div>

                        {/* Packet Connector */}
                        <div className="flex items-center gap-1.5 text-text-muted text-xs font-mono">
                          <span className="hidden sm:inline">──</span>
                          <span className={`px-2 py-0.5 rounded bg-bg-elevated border text-[10px] font-mono transition-colors duration-200 ${
                            isP2pPending 
                              ? 'border-border-secondary text-text-muted opacity-50' 
                              : isP2pActive 
                              ? 'border-teach-1/30 text-teach-1 shadow-xs' 
                              : 'border-border-secondary text-text-muted'
                          }`}>
                            TX Packet: 224B
                          </span>
                          <span>──►</span>
                        </div>

                        {/* P2P Gossip Network Gateway */}
                        <div className={`px-3.5 py-2 rounded-md bg-bg-secondary border flex items-center gap-2 text-xs font-mono font-medium transition-colors duration-200 ${
                          isP2pPending 
                            ? 'border-border-primary text-text-muted opacity-60' 
                            : isP2pActive 
                            ? 'border-teach-1/30 text-teach-1 shadow-xs' 
                            : 'border-border-primary text-text-primary'
                        }`}>
                          <Layers className={`w-3.5 h-3.5 ${isP2pPending ? 'text-text-muted' : isP2pActive ? 'text-teach-1' : 'text-text-secondary'}`} />
                          <span>P2P Gossip Protocol</span>
                        </div>
                      </div>

                      {/* Fan-out Connector visual */}
                      <div className="hidden sm:flex flex-col items-center justify-center -my-1">
                        <div className={`w-0.5 h-3 ${isP2pPending ? 'bg-border-secondary/40' : 'bg-border-primary'}`} />
                        <div className={`w-2/3 h-0.5 relative ${isP2pPending ? 'bg-border-secondary/40' : 'bg-border-primary'}`}>
                          <div className={`absolute left-0 top-0.5 w-0.5 h-2.5 ${isP2pPending ? 'bg-border-secondary/40' : 'bg-border-primary'}`} />
                          <div className={`absolute left-1/2 -translate-x-1/2 top-0.5 w-0.5 h-2.5 ${isP2pPending ? 'bg-border-secondary/40' : 'bg-border-primary'}`} />
                          <div className={`absolute right-0 top-0.5 w-0.5 h-2.5 ${isP2pPending ? 'bg-border-secondary/40' : 'bg-border-primary'}`} />
                        </div>
                      </div>

                      {/* Peer Nodes Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        {/* Node A (Peer) */}
                        <div className={`p-3 rounded-md bg-bg-elevated border transition-all duration-300 space-y-1.5 ${
                          isP2pPending ? 'border-border-secondary/50 opacity-60' : 'border-border-primary'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-mono font-medium ${isP2pPending ? 'text-text-muted' : 'text-text-primary'}`}>Node A (Peer)</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isP2pPending 
                                ? 'text-text-muted bg-bg-primary border border-border-secondary/50' 
                                : 'text-teach-1 bg-teach-1/10'
                            }`}>
                              {isP2pPending ? (isVi ? 'Chờ gói tin' : 'Awaiting Packet') : (isVi ? 'Đã nhận gói tin' : 'Packet Received')}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-text-muted flex items-center justify-between">
                            <span>IP: 198.51.100.24</span>
                            <span className={isP2pPending ? 'text-text-muted' : 'text-success font-medium'}>
                              {isP2pPending ? 'Pending' : '✓ Ingested'}
                            </span>
                          </div>
                        </div>

                        {/* Node B (Miner) */}
                        <div className={`p-3 rounded-md bg-bg-elevated border transition-all duration-300 space-y-1.5 ${
                          isP2pPending ? 'border-border-secondary/50 opacity-60' : 'border-border-primary'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-mono font-medium ${isP2pPending ? 'text-text-muted' : 'text-text-primary'}`}>Node B (Miner)</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isP2pPending 
                                ? 'text-text-muted bg-bg-primary border border-border-secondary/50' 
                                : 'text-teach-1 bg-teach-1/10'
                            }`}>
                              {isP2pPending ? (isVi ? 'Chờ gói tin' : 'Awaiting Packet') : (isVi ? 'Đã nhận gói tin' : 'Packet Received')}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-text-muted flex items-center justify-between">
                            <span>IP: 203.0.113.88</span>
                            <span className={isP2pPending ? 'text-text-muted' : 'text-success font-medium'}>
                              {isP2pPending ? 'Pending' : '✓ Queued'}
                            </span>
                          </div>
                        </div>

                        {/* Node C (Full Node) */}
                        <div className={`p-3 rounded-md bg-bg-elevated border transition-all duration-300 space-y-1.5 ${
                          isP2pPending ? 'border-border-secondary/50 opacity-60' : 'border-border-primary'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-mono font-medium ${isP2pPending ? 'text-text-muted' : 'text-text-primary'}`}>Node C (Full Node)</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isP2pPending 
                                ? 'text-text-muted bg-bg-primary border border-border-secondary/50' 
                                : 'text-teach-1 bg-teach-1/10'
                            }`}>
                              {isP2pPending ? (isVi ? 'Chờ gói tin' : 'Awaiting Packet') : (isVi ? 'Đã nhận gói tin' : 'Packet Received')}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-text-muted flex items-center justify-between">
                            <span>IP: 192.0.2.147</span>
                            <span className={isP2pPending ? 'text-text-muted' : 'text-success font-medium'}>
                              {isP2pPending ? 'Pending' : '✓ Verifying'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* 2. Educational Ledger & Account States */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0B0F19]/90 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {vStr.ledgerTitle}
            </span>
            <button
              type="button"
              onClick={() => setShowLedger(!showLedger)}
              aria-expanded={showLedger}
              aria-controls="educational-ledger-content"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>
                {showLedger
                  ? (isVi ? 'Thu gọn Sổ cái' : 'Collapse Ledger')
                  : (isVi ? 'Hiển thị Sổ cái & Tài khoản' : 'Show Ledger & Accounts')
                }
              </span>
              {showLedger ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span className="text-xs text-slate-400 font-sans hidden sm:block">{vStr.ledgerSubtitle}</span>
        </div>

        {/* Collapsed Account Summary Strip */}
        {!showLedger && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {accounts.map((acc) => (
              <div
                key={acc.name}
                onClick={() => setShowLedger(true)}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {acc.name}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {truncateAddress(acc.address)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">
                    {acc.balance.toFixed(2)} BTC
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Nonce: {acc.name === 'Alice' ? (selectedScenario === 'REPLAY' ? '2' : '1') : '0'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showLedger && (
          <div id="educational-ledger-content" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
            {accounts.map((acc) => {
            const isExpanded = expandedAccount === acc.name;
            const isKeyRevealed = revealedKeyAccount === acc.name;

            return (
              <div
                key={acc.name}
                className="rounded-lg bg-[#070A12]/80 border border-white/[0.06] overflow-hidden"
              >
                <div className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#F4F4F5]">
                      {acc.name}
                    </span>
                    <span className="font-mono text-financial font-semibold text-sm">
                      {acc.balance.toFixed(2)} BTC
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-xs text-[#71717A] tracking-tight">
                      <span>
                        {truncateAddress(acc.address)}
                      </span>
                      <button
                        onClick={() => handleCopy(acc.address, acc.name)}
                        className="text-[#71717A] hover:text-[#F4F4F5] p-0.5 rounded transition-colors cursor-pointer"
                        title={isVi ? "Sao chép địa chỉ" : "Copy address"}
                      >
                        {copiedKey === acc.name ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      onClick={() => setExpandedAccount(isExpanded ? null : acc.name)}
                      className="text-[#71717A] hover:text-[#F4F4F5] p-1 rounded transition-colors cursor-pointer"
                      title={isExpanded ? (isVi ? "Thu gọn" : "Collapse") : (isVi ? "Mở rộng" : "Expand")}
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-3">
                      <div>
                        <span className="text-[#71717A] block font-sans text-[10px] mb-1">
                          {isVi ? 'Địa chỉ ví' : 'Wallet Address'}
                        </span>
                        <div className="bg-[#0B0F19] border border-white/[0.06] p-2 rounded text-[#F4F4F5] font-mono text-[11px] break-all leading-relaxed">
                          {acc.address}
                        </div>
                      </div>
                      <div>
                        <span className="text-[#71717A] block font-sans text-[10px] mb-1">
                          {isVi ? 'Khóa công khai' : 'Public Key'}
                        </span>
                        <div className="bg-[#0B0F19] border border-white/[0.06] p-2 rounded text-sky-400 font-mono text-[11px] break-all leading-relaxed">
                          {acc.publicKey.slice(0, 48)}...
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[#71717A] flex items-center gap-1 font-sans text-[10px]">
                            <Lock className="w-3 h-3 text-[#71717A]" />
                            <span>{isVi ? 'Khóa riêng' : 'Private Key'}</span>
                          </span>
                          <button
                            onClick={() => setRevealedKeyAccount(isKeyRevealed ? null : acc.name)}
                            className="text-[#A1A1AA] hover:text-[#F4F4F5] flex items-center gap-1 font-sans cursor-pointer text-[10px] transition-colors"
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
                        <div className="bg-[#0B0F19] border border-white/[0.06] p-2 rounded text-rose-400 font-mono text-[11px] break-all leading-relaxed">
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
        )}
      </div>

      {/* 3. Real-Time Node Verification Audit Log */}
      <div id="audit-panel" className="grid grid-cols-1 gap-6">
        <div className="p-4 sm:p-5 rounded-xl bg-bg-secondary border border-border-primary space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {vStr.auditEngineTitle}
            </span>
          </div>

          <div id="result-panel">
            {lastVerifiedTx ? (
              lastVerifiedTx.isValid ? (
                <div className="px-3.5 py-2.5 mb-3 rounded-lg bg-success/10 border border-success/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-success font-medium">
                    <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                    <span>{isVi ? 'Đã chấp nhận vào Mempool' : 'Accepted into Mempool'}</span>
                    <span className="text-text-muted font-normal">
                      · {lastVerifiedTx.txNumber}: {lastVerifiedTx.senderName} → {lastVerifiedTx.receiverName} (<span className="text-financial font-mono">{lastVerifiedTx.amount} BTC</span>)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="px-3.5 py-2.5 mb-3 rounded-lg bg-error/10 border border-error/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-error font-medium">
                      <span className="w-2 h-2 rounded-full bg-error shrink-0" />
                      <span>{isVi ? 'Giao dịch bị từ chối' : 'Transaction rejected'}</span>
                      <span className="text-text-muted font-normal">· {lastVerifiedTx.txNumber}</span>
                    </div>
                  </div>
                  {lastVerifiedTx.rejectionReason && (
                    <div className="text-error/90 text-xs pl-4 font-normal">
                      {lastVerifiedTx.rejectionReason}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="px-3.5 py-2.5 mb-3 rounded-lg bg-bg-primary border border-border-secondary text-xs text-text-muted flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span>
                  {isVi
                    ? 'Chọn kịch bản và Bắt đầu mô phỏng để xem tiến trình xác thực.'
                    : 'Select a scenario and click Start Simulation to view validation progress.'}
                </span>
              </div>
            )}
          </div>

          <div className="divide-y divide-border-secondary/40 border border-border-secondary rounded-lg overflow-hidden bg-bg-primary">
            {verificationRules.map((chk, i) => (
              <div
                key={i}
                title={chk.desc}
                className="px-3.5 py-2 sm:py-2.5 flex items-center justify-between text-xs transition-colors duration-150 hover:bg-bg-elevated/40"
              >
                <div>
                  <span className={chk.pass !== undefined ? 'font-medium text-text-primary' : 'font-medium text-text-secondary'}>
                    {chk.name}
                  </span>
                </div>
                <div className="flex items-center text-xs font-mono">
                  {chk.pass !== undefined ? (
                    chk.pass ? (
                      <span
                        title={isVi ? 'Hợp lệ' : 'Passed'}
                        className="inline-flex items-center justify-center text-success"
                      >
                        <PassIcon className="w-4 h-4" />
                      </span>
                    ) : (
                      <span
                        title={isVi ? 'Không hợp lệ' : 'Failed'}
                        className="inline-flex items-center justify-center text-error"
                      >
                        <DenyIcon className="w-4 h-4" />
                      </span>
                    )
                  ) : (
                    <span
                      title={isVi ? 'Chờ kiểm tra' : 'Pending'}
                      className="w-1.5 h-1.5 rounded-full bg-white/20 inline-block"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Live Mempool (Accepted) vs Rejected Transactions - Deep Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
        {/* Active Mempool Column */}
        <div className="p-5 sm:p-6 rounded-xl bg-[#0B0F19]/60 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="font-semibold text-[#F4F4F5] text-sm">
                {vStr.activeMempool} ({mempool.length})
              </span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs max-h-[520px] overflow-y-auto pr-1">
            {mempool.length === 0 ? (
              <div className="p-8 rounded-lg bg-[#070A12]/80 border border-white/[0.06] min-h-[160px] flex flex-col items-center justify-center text-center space-y-2 text-[#71717A] text-xs">
                <Layers className="w-8 h-8 text-[#71717A]/40 mb-1" />
                <div className="font-medium text-[#A1A1AA]">
                  {isVi ? 'Mempool hiện đang trống' : 'Mempool is currently empty'}
                </div>
                <div className="text-[11px] text-[#71717A] max-w-sm leading-relaxed">
                  {isVi
                    ? 'Các giao dịch hợp lệ sau khi kiểm tra chữ ký và số dư sẽ được xếp hàng tại đây để chờ thợ đào đóng khối.'
                    : 'Valid transactions passing cryptographic & ledger checks will queue here awaiting miner block inclusion.'}
                </div>
              </div>
            ) : (
              mempool.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 rounded-xl bg-[#0B0F19]/80 border border-white/[0.08] hover:border-cyan-500/30 hover:bg-[#0B0F19] transition-all duration-150 space-y-3.5"
                >
                  {/* TẦNG 1: HEADER & GIÁ TRỊ (Rộng & Rõ ràng) */}
                  <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                    {/* Left: Indicator + TX Tag + Flow with full addresses */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0"
                          title={isVi ? 'Đang chờ đóng block' : 'Pending block inclusion'}
                        />
                        <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#070A12] text-[#F4F4F5] border border-white/10 font-semibold shrink-0">
                          {tx.txNumber}
                        </span>
                        <span className="text-[11px] font-mono text-[#71717A] hidden sm:inline">
                          {tx.timestamp || 'Just now'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#F4F4F5] font-medium flex-wrap">
                        <span>
                          {tx.senderName}{' '}
                          <span className="font-mono text-[11px] text-[#71717A]">
                            ({truncateAddress(tx.senderAddress)})
                          </span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        <span>
                          {tx.receiverName}{' '}
                          <span className="font-mono text-[11px] text-[#71717A]">
                            ({truncateAddress(tx.receiverAddress)})
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Right: Amount & Fee */}
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-xl font-mono font-bold leading-tight text-financial">
                        {Number(tx.amount).toFixed(2)}{' '}
                        <span className="text-sm font-semibold">BTC</span>
                      </div>
                      <div className="text-xs text-[#71717A] font-mono mt-0.5">
                        Fee: 0.00045 BTC (18 sat/vB)
                      </div>
                    </div>
                  </div>

                  {/* TẦNG 2: THAM SỐ MẬT MÃ & KỸ THUẬT (DÀN HÀNG NGANG / GRID) */}
                  <div className="space-y-2 pt-2.5 border-t border-white/[0.06]">
                    {/* Signature Box */}
                    <div className="bg-[#070A12] border border-white/[0.06] px-3 py-2 rounded-lg font-mono text-xs text-[#A1A1AA] flex items-center justify-between gap-2 overflow-hidden">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[#71717A] font-semibold text-[11px] uppercase tracking-wider shrink-0">
                          SIG:
                        </span>
                        <span className="text-[#F4F4F5] truncate tracking-tight" title={tx.signature}>
                          {tx.signature.slice(0, 24)}...{tx.signature.slice(-8)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(tx.signature, `sig-${tx.id}`)}
                        className="text-[#71717A] hover:text-[#F4F4F5] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-[11px]"
                        title={isVi ? 'Sao chép chữ ký đầy đủ' : 'Copy full signature'}
                      >
                        {copiedKey === `sig-${tx.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                            <span className="text-[#10B981] text-[10px] hidden sm:inline">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[#71717A] text-[10px] hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Tech Parameters Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                      <div className="bg-[#070A12] border border-white/[0.06] px-2.5 py-1.5 rounded flex items-center justify-between">
                        <span className="text-[#71717A] text-[11px]">nonce:</span>
                        <span className="text-[#F4F4F5] font-semibold">{tx.nonce}</span>
                      </div>
                      <div className="bg-[#070A12] border border-white/[0.06] px-2.5 py-1.5 rounded flex items-center justify-between">
                        <span className="text-[#71717A] text-[11px]">size:</span>
                        <span className="text-[#F4F4F5]">224 Bytes</span>
                      </div>
                      <div className="bg-[#070A12] border border-white/[0.06] px-2.5 py-1.5 rounded flex items-center justify-between col-span-2 sm:col-span-1">
                        <span className="text-[#71717A] text-[11px]">format:</span>
                        <span className="text-sky-400 text-[11px]">SECP256k1 / SHA-256</span>
                      </div>
                    </div>
                  </div>

                  {/* TẦNG 3: TRẠNG THÁI & LÝ DO CHI TIẾT */}
                  <div className="w-full bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] px-3.5 py-2.5 rounded-lg text-xs font-mono flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981]" />
                    <div className="leading-snug">
                      <span className="font-semibold uppercase text-[#10B981] mr-1.5">
                        {isVi ? 'SẴN SÀNG ĐÓNG KHỐI:' : 'READY FOR BLOCK:'}
                      </span>
                      <span className="text-[#A1A1AA]">
                        {isVi
                          ? 'Đang nằm trong hàng đợi ưu tiên cao của Miner'
                          : 'In high-priority queue ready for miner inclusion'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rejected Transactions Column */}
        <div className="p-5 sm:p-6 rounded-xl bg-[#0B0F19]/60 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="font-semibold text-[#F4F4F5] text-sm">
                {vStr.rejectedTransactions} ({rejected.length})
              </span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs max-h-[520px] overflow-y-auto pr-1">
            {rejected.length === 0 ? (
              <div className="p-8 rounded-lg bg-[#070A12]/80 border border-white/[0.06] min-h-[160px] flex flex-col items-center justify-center text-center space-y-2 text-[#71717A] text-xs">
                <Inbox className="w-8 h-8 text-[#71717A]/40 mb-1" />
                <div className="font-medium text-[#A1A1AA]">
                  {vStr.noRejected || (isVi ? 'Chưa có giao dịch nào bị từ chối' : 'No rejected transactions')}
                </div>
                <div className="text-[11px] text-[#71717A] max-w-sm leading-relaxed">
                  {isVi
                    ? 'Các giao dịch vi phạm chữ ký giả mạo, thiếu số dư hoặc tấn công phát lại sẽ hiển thị tại đây.'
                    : 'Transactions with forged signatures, insufficient funds, or replay attacks will appear here.'}
                </div>
              </div>
            ) : (
              rejected.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 rounded-xl bg-[#0B0F19]/80 border border-rose-500/25 hover:border-rose-500/40 hover:bg-[#0B0F19] transition-all duration-150 space-y-3.5"
                >
                  {/* TẦNG 1: HEADER & GIÁ TRỊ (Rộng & Rõ ràng) */}
                  <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                    {/* Left: Indicator + TX Tag + Flow with full addresses */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"
                          title={isVi ? 'Giao dịch bị từ chối' : 'Transaction rejected'}
                        />
                        <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#070A12] text-[#F4F4F5] border border-white/10 font-semibold shrink-0">
                          {tx.txNumber}
                        </span>
                        <span className="text-[11px] font-mono text-[#71717A] hidden sm:inline">
                          {tx.timestamp || 'Just now'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#F4F4F5] font-medium flex-wrap">
                        <span>
                          {tx.senderName}{' '}
                          <span className="font-mono text-[11px] text-[#71717A]">
                            ({truncateAddress(tx.senderAddress)})
                          </span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        <span>
                          {tx.receiverName}{' '}
                          <span className="font-mono text-[11px] text-[#71717A]">
                            ({truncateAddress(tx.receiverAddress)})
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Right: Amount & Fee */}
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-xl font-mono font-bold leading-tight text-rose-400">
                        {Number(tx.amount).toFixed(2)}{' '}
                        <span className="text-sm font-semibold">BTC</span>
                      </div>
                      <div className="text-xs text-[#71717A] font-mono mt-0.5">
                        Fee: 0.00045 BTC (18 sat/vB)
                      </div>
                    </div>
                  </div>

                  {/* TẦNG 2: THAM SỐ MẬT MÃ & KỸ THUẬT (DÀN HÀNG NGANG / GRID) */}
                  <div className="space-y-2 pt-2.5 border-t border-white/[0.06]">
                    {/* Signature Box */}
                    <div className="bg-[#070A12] border border-white/[0.06] px-3 py-2 rounded-lg font-mono text-xs text-[#A1A1AA] flex items-center justify-between gap-2 overflow-hidden">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[#71717A] font-semibold text-[11px] uppercase tracking-wider shrink-0">
                          SIG:
                        </span>
                        <span className="text-[#F4F4F5] truncate tracking-tight" title={tx.signature}>
                          {tx.signature.slice(0, 24)}...{tx.signature.slice(-8)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(tx.signature, `sig-${tx.id}`)}
                        className="text-[#71717A] hover:text-[#F4F4F5] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-[11px]"
                        title={isVi ? 'Sao chép chữ ký đầy đủ' : 'Copy full signature'}
                      >
                        {copiedKey === `sig-${tx.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                            <span className="text-[#10B981] text-[10px] hidden sm:inline">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[#71717A] text-[10px] hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Tech Parameters Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                      <div className="bg-[#070A12] border border-white/[0.06] px-2.5 py-1.5 rounded flex items-center justify-between">
                        <span className="text-[#71717A] text-[11px]">nonce:</span>
                        <span className="text-[#F4F4F5] font-semibold">{tx.nonce}</span>
                      </div>
                      <div className="bg-[#070A12] border border-white/[0.06] px-2.5 py-1.5 rounded flex items-center justify-between">
                        <span className="text-[#71717A] text-[11px]">size:</span>
                        <span className="text-[#F4F4F5]">224 Bytes</span>
                      </div>
                      <div className="bg-[#070A12] border border-white/[0.06] px-2.5 py-1.5 rounded flex items-center justify-between col-span-2 sm:col-span-1">
                        <span className="text-[#71717A] text-[11px]">format:</span>
                        <span className="text-sky-400 text-[11px]">SECP256k1 / SHA-256</span>
                      </div>
                    </div>
                  </div>

                  {/* TẦNG 3: TRẠNG THÁI & LÝ DO CHI TIẾT */}
                  <div className="w-full bg-rose-500/10 border border-rose-500/25 text-rose-400 px-3.5 py-2.5 rounded-lg text-xs font-mono flex items-start sm:items-center gap-2.5">
                    <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400 mt-0.5 sm:mt-0" />
                    <div className="leading-snug">
                      <span className="font-semibold uppercase text-rose-300 mr-1.5">
                        {isVi ? 'LÝ DO TỪ CHỐI:' : 'REJECTION REASON:'}
                      </span>
                      <span>
                        {tx.rejectionReason ||
                          (isVi
                            ? 'Chữ ký ECDSA không hợp lệ hoặc dữ liệu bị sửa đổi'
                            : 'Invalid ECDSA signature or payload tampered')}
                      </span>
                    </div>
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
