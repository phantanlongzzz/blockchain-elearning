import React, { useState } from 'react';
import {
  Cpu,
  Wallet,
  Layers,
  FileCode2,
  HardDrive,
  Radio,
  Server,
  Zap,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Send,
  RotateCcw,
  Pickaxe,
  Boxes,
  Database,
  Flame,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EcosystemComponent } from './types';

interface BitcoinEcosystemLabProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
  onPrevStage?: () => void;
  isHandsOn?: boolean;
}

const ECOSYSTEM_ROLES: EcosystemComponent[] = [
  {
    id: 'wallet',
    name: { vi: 'Ví Bitcoin (Wallet)', en: 'Bitcoin Wallet' },
    category: { vi: 'Người Dùng (User Layer)', en: 'User Interface' },
    shortPurpose: { vi: 'Quản lý cặp Khóa (Private/Public Key) và tạo Chữ ký số', en: 'Manages cryptographic keypairs & generates digital signatures' },
    detailedRole: {
      vi: 'Ví không chứa đồng coin thật nào. Ví chỉ chứa Khóa Riêng Tư (Private Key) để ký xác thực quyền chuyển tiền từ các UTXO trên Blockchain.',
      en: 'Wallets do not hold coins. They store Private Keys used to mathematically sign transactions from UTXOs on-chain.',
    },
    keyMechanism: { vi: 'Thuật toán Elliptic Curve (ECDSA / Schnorr)', en: 'ECDSA / Schnorr Cryptographic Signatures' },
    icon: 'Wallet',
  },
  {
    id: 'mempool',
    name: { vi: 'Hàng Đợi Mempool', en: 'Bể Giao Dịch Chờ' },
    category: { vi: 'Bộ Nhớ Tạm (Buffer Layer)', en: 'Transient Buffer' },
    shortPurpose: { vi: 'Khu vực chờ tạm thời của các giao dịch hợp lệ trước khi vào Block', en: 'Waiting area for valid unconfirmed transactions before block inclusion' },
    detailedRole: {
      vi: 'Mỗi Full Node có một Mempool riêng trong RAM. Các giao dịch có phí (Fee rate tính bằng sat/vB) cao hơn sẽ được thợ đào ưu tiên gắp vào khối trước.',
      en: 'Each full node maintains an in-memory pool. Higher fee-rate transactions are prioritized by miners for faster confirmation.',
    },
    keyMechanism: { vi: 'Ưu tiên theo Phí Giao Dịch (Fee Priority)', en: 'Fee-market prioritization (sat/vB)' },
    icon: 'Layers',
  },
  {
    id: 'miner',
    name: { vi: 'Thợ Đào (Miner / ASIC)', en: 'Mining Node (ASIC)' },
    category: { vi: 'Sản Xuất Khối (Block Producer)', en: 'Consensus Work' },
    shortPurpose: { vi: 'Gom giao dịch từ Mempool và thi đua giải bài toán Proof of Work', en: 'Bundles transactions and competes in PoW hash puzzles' },
    detailedRole: {
      vi: 'Thực hiện hàng nghìn tỷ phép thử băm SHA-256 mỗi giây để tìm Nonce thỏa mãn độ khó (Difficulty Target), nhận phần thưởng khối (Block Reward) và phí giao dịch.',
      en: 'Computes trillions of SHA-256 hashes per second to find a valid Nonce, securing the network and earning newly minted coins & fees.',
    },
    keyMechanism: { vi: 'Bằng chứng Công việc (Proof of Work - SHA256)', en: 'Proof of Work Hash Inversion (SHA-256)' },
    icon: 'Pickaxe',
  },
  {
    id: 'full_node',
    name: { vi: 'Full Node (Nút Đầy Đủ)', en: 'Full Archival Node' },
    category: { vi: 'Xác Thực & Lưu Trữ (The Real Law Enforcers)', en: 'Validation & Truth' },
    shortPurpose: { vi: 'Tải và độc lập xác thực 100% mọi khối và giao dịch từ Genesis', en: 'Independently validates every block and tx against consensus rules' },
    detailedRole: {
      vi: 'Trọng tài thực sự của mạng Bitcoin. Nếu thợ đào tạo ra khối gian lận (in thêm coin trái luật), Full Node sẽ lập tức bác bỏ và không lan truyền khối đó.',
      en: 'The true supreme referees of Bitcoin. If miners propose an invalid block, full nodes instantly reject it regardless of hash power.',
    },
    keyMechanism: { vi: 'Tự xác thực độc lập (Trustless Verification)', en: 'Strict Consensus Validation Rulebook' },
    icon: 'Server',
  },
  {
    id: 'pruning_node',
    name: { vi: 'Pruning Node (Nút Cắt Tỉa)', en: 'Pruned Full Node' },
    category: { vi: 'Tiết Kiệm Dung Lượng (Storage Saver)', en: 'Storage Optimized' },
    shortPurpose: { vi: 'Xác thực toàn bộ lịch sử rồi xóa bớt các khối cũ để tiết kiệm ổ cứng', en: 'Validates full history then prunes old block files to save disk space' },
    detailedRole: {
      vi: 'Vẫn là Full Node xác thực đầy đủ quy tắc, nhưng chỉ giữ lại vài GB khối gần nhất và bộ trạng thái UTXO Set.',
      en: 'Performs full validation but maintains only the latest blocks and UTXO set on disk (typically < 10GB).',
    },
    keyMechanism: { vi: 'Lưu giữ UTXO Set & Khối mới nhất', en: 'UTXO Set Preservation' },
    icon: 'Database',
  },
  {
    id: 'spv_node',
    name: { vi: 'SPV Node (Light Wallet / Ví Nhẹ)', en: 'SPV / Light Client' },
    category: { vi: 'Thiết Bị Di Động (Mobile Client)', en: 'Lightweight Client' },
    shortPurpose: { vi: 'Chỉ tải Block Header (80 bytes) và xác thực qua Merkle Proofs', en: 'Downloads only 80-byte block headers, verifies via Merkle proofs' },
    detailedRole: {
      vi: 'Dành cho điện thoại thông minh. Không cần tải hàng trăm GB dữ liệu mà vẫn kiểm tra được giao dịch của mình đã vào khối hay chưa.',
      en: 'Ideal for mobile devices. Relies on Merkle branch paths without hosting the complete ledger.',
    },
    keyMechanism: { vi: 'Xác minh thanh toán đơn giản (Merkle Proofs)', en: 'Simplified Payment Verification (SPV)' },
    icon: 'Zap',
  },
];

export const BitcoinEcosystemLab: React.FC<BitcoinEcosystemLabProps> = ({
  onInteracted,
  onNextStage,
  onPrevStage,
  isHandsOn = false,
}) => {
  const { language } = useLanguage();

  // Transaction Journey 7-Step Pipeline state
  const [pipelineStep, setPipelineStep] = useState<number>(1);
  const [isMining, setIsMining] = useState<boolean>(false);

  // Selected Role for Deep Dive Explorer
  const [selectedRoleId, setSelectedRoleId] = useState<string>('full_node');

  // Custom Transaction Inputs for Hands-on Lab
  const [senderName, setSenderName] = useState<string>('Alice');
  const [receiverName, setReceiverName] = useState<string>('Bob');
  const [amountBtc, setAmountBtc] = useState<number>(0.5);
  const [customMempool, setCustomMempool] = useState<
    { id: string; txText: string; fee: string }[]
  >([
    { id: 'tx_demo1', txText: 'Alice → Bob: 0.5 BTC', fee: '15 sat/vB' },
    { id: 'tx_demo2', txText: 'Charlie → Dave: 1.2 BTC', fee: '28 sat/vB' },
  ]);

  // Peer Nodes state (can simulate node failure)
  const [nodes, setNodes] = useState<{ id: string; name: string; isOnline: boolean }[]>([
    { id: 'node_vn', name: 'Node Hanoi (Vietnam)', isOnline: true },
    { id: 'node_us', name: 'Node Virginia (USA)', isOnline: true },
    { id: 'node_eu', name: 'Node Frankfurt (Germany)', isOnline: true },
    { id: 'node_jp', name: 'Node Tokyo (Japan)', isOnline: true },
  ]);

  const activeRole = ECOSYSTEM_ROLES.find((r) => r.id === selectedRoleId)!;

  const handleNextPipelineStep = () => {
    if (pipelineStep < 7) {
      if (pipelineStep === 4) {
        setIsMining(true);
        setTimeout(() => {
          setIsMining(false);
          setPipelineStep(5);
        }, 1000);
      } else {
        setPipelineStep((prev) => prev + 1);
      }
    } else {
      setPipelineStep(1);
    }
    onInteracted?.();
  };

  const handleAddCustomTx = () => {
    if (!senderName || !receiverName || amountBtc <= 0) return;
    const newTx = {
      id: `tx_${Date.now()}`,
      txText: `${senderName} → ${receiverName}: ${amountBtc} BTC`,
      fee: '22 sat/vB',
    };
    setCustomMempool((prev) => [newTx, ...prev]);
    onInteracted?.();
  };

  const handleToggleNode = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isOnline: !n.isOnline } : n))
    );
    onInteracted?.();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0B0E12] border border-amber-500/20 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase">
              <Cpu className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'PHẦN 06 · HỆ SINH THÁI BITCOIN' : 'PART 06 · BITCOIN ECOSYSTEM'}</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {language === 'vi'
                ? 'Hành Trình Giao Dịch & Mạng Lưới Các Nút Xác Thực'
                : 'The Complete Transaction Lifecycle & Sovereign Node Roles'}
            </h3>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {language === 'vi'
                ? 'Quan sát từng bước một giao dịch chuyển từ ví người gửi qua hàng đợi Mempool, được thợ đào đóng khối bằng Proof of Work, và lan truyền khắp các Full Nodes trên toàn cầu.'
                : 'Track a transaction from local wallet cryptographic signing to mempool queuing, PoW block packaging, and global full node validation.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPipelineStep(1)}
              className="px-3 py-1.5 rounded-lg bg-[#0F1217] hover:bg-[#161D26] border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Làm lại quy trình' : 'Reset Flow'}</span>
            </button>
          </div>
        </div>

        {/* 7-Step Interactive Pipeline Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {[
              { step: 1, label: { vi: '1. Ví ký số', en: '1. Wallet Sign' } },
              { step: 2, label: { vi: '2. Broadcast P2P', en: '2. P2P Broadcast' } },
              { step: 3, label: { vi: '3. Hàng đợi Mempool', en: '3. Mempool Queue' } },
              { step: 4, label: { vi: '4. Đóng Block ứng viên', en: '4. Candidate Block' } },
              { step: 5, label: { vi: '5. Đào Proof of Work', en: '5. PoW Mining' } },
              { step: 6, label: { vi: '6. Lan truyền Khối', en: '6. Block Broadcast' } },
              { step: 7, label: { vi: '7. Full Node xác thực', en: '7. Node Validation' } },
            ].map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setPipelineStep(s.step);
                  onInteracted?.();
                }}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  pipelineStep === s.step
                    ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-950/40'
                    : pipelineStep > s.step
                    ? 'bg-[#0a0f1d] border-emerald-500/40 text-emerald-300'
                    : 'bg-[#05070c] border-slate-900 text-slate-500'
                }`}
              >
                <div className="text-[10px] font-mono truncate">{s.label[language]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Simulation Stage & Step Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Visual Animation Stage */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h4 className="text-sm font-bold font-mono text-white uppercase">
                {language === 'vi' ? 'MÔ PHỎNG CHI TIẾT BƯỚC' : 'STEP DETAIL'}: {pipelineStep} / 7
              </h4>
            </div>

            <button
              type="button"
              onClick={handleNextPipelineStep}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <span>{pipelineStep < 7 ? (language === 'vi' ? 'Bước kế tiếp →' : 'Next Step →') : (language === 'vi' ? 'Bắt đầu lại' : 'Start Over')}</span>
            </button>
          </div>

          {/* Dynamic Step Visualization Area */}
          <div className="p-6 rounded-xl bg-[#05070c] border border-slate-900 min-h-[220px] flex flex-col justify-center items-center space-y-4">
            {pipelineStep === 1 && (
              <div className="text-center space-y-3 animate-fadeIn max-w-md">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/40 mx-auto flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  Alice Wallet: Ký số Cryptographic Signature
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'vi'
                    ? 'Alice nhập 0.5 BTC gửi cho Bob. Ví của Alice dùng Private Key (Khóa Riêng Tư) tạo ra một Chữ Ký Số (ECDSA Signature) gắn liền với giao dịch này.'
                    : 'Alice authorizes sending 0.5 BTC to Bob. Her wallet uses her sovereign Private Key to generate a cryptographic ECDSA signature.'}
                </p>
              </div>
            )}

            {pipelineStep === 2 && (
              <div className="text-center space-y-3 animate-fadeIn max-w-md">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  Lan Truyền Mạng Ngang Hàng (P2P Broadcast)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'vi'
                    ? 'Giao dịch đã ký được gửi đến các Node lân cận. Các Node kiểm tra sơ bộ định dạng và tiếp tục lan truyền (Gossip Protocol) cho toàn bộ các node khác trên thế giới.'
                    : 'The signed transaction is broadcast to peer nodes using the Gossip protocol across the decentralized network.'}
                </p>
              </div>
            )}

            {pipelineStep === 3 && (
              <div className="text-center space-y-3 animate-fadeIn max-w-md">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  Nằm Trong Hàng Đợi Bộ Nhớ (Mempool Queue)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'vi'
                    ? 'Giao dịch được lưu tạm thời vào Mempool (RAM) của từng node. Nó chưa được ghi vào Blockchain chính thức, vẫn mang trạng thái "Chờ xác nhận (0-Confirmation)".'
                    : 'The transaction sits in node RAM buffers (Mempool) awaiting miner selection. Status remains unconfirmed (0-conf).'}
                </p>
              </div>
            )}

            {pipelineStep === 4 && (
              <div className="text-center space-y-3 animate-fadeIn max-w-md">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                  <Boxes className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  Thợ Đào Gom Giao Dịch & Tạo Khối Ứng Viên
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'vi'
                    ? 'Thợ đào (Miner) chọn các giao dịch có phí cao nhất từ Mempool, tính toán Merkle Root, lấy Previous Hash của khối mới nhất và chuẩn bị bắt đầu đào.'
                    : 'Miners assemble candidate blocks by prioritizing transactions with the highest fee rates and computing the Merkle Root.'}
                </p>
              </div>
            )}

            {pipelineStep === 5 && (
              <div className="text-center space-y-3 animate-fadeIn max-w-md">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mx-auto flex items-center justify-center">
                  <Pickaxe className={`w-6 h-6 ${isMining ? 'animate-spin' : ''}`} />
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  Giải Thuật Toán Proof of Work (Tìm Nonce Hợp Lệ)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'vi'
                    ? 'Các máy đào ASIC liên tục thay đổi giá trị Nonce hàng tỷ lần mỗi giây để tìm ra mã băm bắt đầu bằng các số 0 theo mục tiêu độ khó. Tìm thấy Nonce hợp lệ!'
                    : 'ASIC miners compute billions of SHA-256 hashes per second until finding a valid Nonce below the target difficulty threshold.'}
                </p>
              </div>
            )}

            {pipelineStep === 6 && (
              <div className="text-center space-y-3 animate-fadeIn max-w-md">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                  <Radio className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  Phát Sóng Khối Mới Lên Toàn Mạng Lưới
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'vi'
                    ? 'Thợ đào chiến thắng lập tức phát sóng khối vừa đào được cho toàn bộ các Full Node trên thế giới.'
                    : 'The winning miner broadcasts the newly found block to the global peer network.'}
                </p>
              </div>
            )}

            {pipelineStep === 7 && (
              <div className="text-center space-y-3 animate-fadeIn max-w-md">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-black mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  Full Nodes Xác Thực Độc Lập & Gắn Vào Chuỗi
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'vi'
                    ? 'Mỗi Full Node tự mình kiểm tra tính hợp lệ của chữ ký và các quy tắc. Khi hợp lệ, khối được gắn vào chuỗi và giao dịch của Alice đạt 1-Confirmation!'
                    : 'Every full node verifies signatures and rules independently. Once validated, the block is appended, achieving 1-Confirmation!'}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Peer Nodes Resiliency Sub-Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase">
                {language === 'vi' ? 'MÔ PHỎNG TÍNH BỀN VỮNG CỦA CÁC FULL NODE TOÀN CẦU:' : 'GLOBAL NODE RESILIENCY LAB:'}
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {language === 'vi' ? 'Bấm để tắt thử 1 node bất kỳ' : 'Click to toggle node failure'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {nodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => handleToggleNode(node.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    node.isOnline
                      ? 'bg-[#05070c] border-slate-800 hover:border-slate-700'
                      : 'bg-rose-950/20 border-rose-500/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        node.isOnline ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        node.isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {node.isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white truncate">{node.name}</div>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {language === 'vi'
                  ? 'Kể cả khi 1 hoặc nhiều quốc gia mất điện hoặc ngắt kết nối Internet, hàng chục nghìn Full Nodes ở các châu lục khác vẫn tiếp tục duy trì mạng lưới 24/7!'
                  : 'Even if nodes in one country go offline, tens of thousands of sovereign nodes across other continents keep the network running 24/7/365.'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Sovereign Role Explorer */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'vi' ? 'TRA CỨU VAI TRÒ TRONG HỆ SINH THÁI' : 'ECOSYSTEM ROLES EXPLORER'}</span>
            </div>

            {/* Role Buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              {ECOSYSTEM_ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    onInteracted?.();
                  }}
                  className={`p-2 rounded-lg text-left border text-xs font-mono font-bold transition-all cursor-pointer truncate ${
                    selectedRoleId === role.id
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                      : 'bg-[#05070c] border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {role.name[language].split(' (')[0]}
                </button>
              ))}
            </div>

            {/* Active Role Card */}
            <div className="p-4 rounded-xl bg-[#05070c] border border-slate-800 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h5 className="text-xs font-mono font-bold text-white">{activeRole.name[language]}</h5>
                <span className="text-[10px] font-mono text-amber-400">{activeRole.category[language]}</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-[10px] font-mono text-slate-500 uppercase">NHIỆM VỤ CHÍNH:</div>
                <p className="text-slate-300 leading-relaxed">{activeRole.shortPurpose[language]}</p>
              </div>

              <div className="space-y-1 text-xs pt-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase">BẢN CHẤT KỸ THUẬT:</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{activeRole.detailedRole[language]}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[11px] font-mono text-amber-300 space-y-0.5">
                <div className="text-[10px] text-amber-400 font-bold uppercase">CƠ CHẾ THEN CHỐT:</div>
                <div>{activeRole.keyMechanism[language]}</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {onPrevStage && (
              <button
                type="button"
                onClick={onPrevStage}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-400 cursor-pointer"
              >
                {language === 'vi' ? '← Quay lại Phần 05' : '← Back to Part 05'}
              </button>
            )}
            {onNextStage && (
              <button
                type="button"
                onClick={onNextStage}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ml-auto shadow-md"
              >
                <span>{language === 'vi' ? 'Tiếp: Phần 07 · Thử Thách Tổng Kết' : 'Next: Part 07 · Final Challenge'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
