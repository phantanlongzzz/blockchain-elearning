import React from 'react';
import {
  X,
  Radio,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Cpu,
  MapPin,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';
import { E2ENetworkNode, E2EBlock } from './types';

interface NodeInspectorModalProps {
  node: E2ENetworkNode | null;
  currentBlock: E2EBlock | null;
  onClose: () => void;
  onToggleOnline: (nodeId: string) => void;
  language: 'vi' | 'en';
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  node,
  currentBlock,
  onClose,
  onToggleOnline,
  language,
}) => {
  if (!node) return null;

  const isAccepted = node.validationState.isAccepted;
  const isOffline = node.isOffline;

  // Determine why the node arrived at its current status
  const getWhyExplanation = () => {
    if (isOffline) {
      return language === 'vi'
        ? 'Nút này đang ở trạng thái ngắt kết nối (Offline). Nó không thể nhận gói tin P2P hoặc tham gia bỏ phiếu đồng thuận.'
        : 'This node is currently offline and isolated. It cannot receive P2P gossiped blocks or participate in consensus.';
    }
    if (isAccepted === true) {
      return language === 'vi'
        ? 'Nút đã kiểm tra độc lập 4 tiêu chí khắt khe: (1) Previous Hash trùng khớp với đỉnh chuỗi cục bộ; (2) Cây Merkle Root tính toán lại chính xác 100%; (3) Toàn bộ chữ ký số ECDSA của giao dịch hợp lệ; (4) Mã băm thỏa mãn độ khó PoW. Do đó, nút chấp nhận khối vào sổ cái cục bộ và lan truyền tiếp tới các peer lân cận.'
        : 'The node independently verified all 4 consensus rules: Previous Hash match, Merkle Root validity, transaction signatures integrity, and Proof-of-Work target difficulty. The block is accepted and relayed.';
    }
    if (isAccepted === false) {
      return language === 'vi'
        ? 'Nút phát hiện sai lệch trong quá trình xác thực (có thể do mã băm sai lệch, chữ ký không hợp lệ, hoặc không đạt độ khó PoW). Khối bị từ chối và bị drop ngay lập tức.'
        : 'The node detected invalid criteria during independent verification. The block has been rejected and dropped.';
    }
    return language === 'vi'
      ? 'Nút đang lắng nghe trên cổng P2P, sẵn sàng nhận gói tin gossip từ các thợ đào trong mạng.'
      : 'The node is listening for incoming P2P gossip messages from network miners.';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans text-xs animate-in fade-in duration-200">
      <div className="bg-[#0c101c] border border-zinc-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#080c16] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">{node.name}</h3>
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-500" />
                  {node.region}
                </span>
                <span>•</span>
                <span className="capitalize">{node.role}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto scrollbar-thin">
          {/* Status & Online Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#080c16] border border-zinc-800">
            <div>
              <span className="text-zinc-500 text-[11px] block">
                {language === 'vi' ? 'Trạng thái hoạt động:' : 'Operational Status:'}
              </span>
              <div className="flex items-center gap-2 mt-0.5 font-mono">
                {isOffline ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Offline (Đã ngắt kết nối)
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online (Trực tuyến)
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleOnline(node.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isOffline
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 hover:bg-rose-900/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {isOffline
                ? language === 'vi' ? 'Kết nối lại' : 'Reconnect'
                : language === 'vi' ? 'Ngắt kết nối' : 'Disconnect'}
            </button>
          </div>

          {/* Validation Checklist Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase font-mono tracking-wider">
              {language === 'vi' ? 'Quy trình kiểm tra độc lập (Validation Pipeline)' : 'Independent Validation Pipeline'}
            </h4>

            <div className="grid grid-cols-1 gap-2 font-mono">
              {/* 1. Previous Hash */}
              <div className="p-2.5 rounded-lg bg-[#080c16] border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-300">1. Previous Hash = Tip</span>
                {node.validationState.prevHash === true ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Khớp (Matched)
                  </span>
                ) : node.validationState.prevHash === false ? (
                  <span className="text-rose-400 flex items-center gap-1 text-xs">
                    <XCircle className="w-3.5 h-3.5" /> Sai lệch (Mismatch)
                  </span>
                ) : (
                  <span className="text-zinc-500 text-xs">Chờ kiểm tra</span>
                )}
              </div>

              {/* 2. Merkle Root */}
              <div className="p-2.5 rounded-lg bg-[#080c16] border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-300">2. Merkle Root Integrity</span>
                {node.validationState.merkleRoot === true ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ (Valid)
                  </span>
                ) : node.validationState.merkleRoot === false ? (
                  <span className="text-rose-400 flex items-center gap-1 text-xs">
                    <XCircle className="w-3.5 h-3.5" /> Sai lệch (Invalid)
                  </span>
                ) : (
                  <span className="text-zinc-500 text-xs">Chờ kiểm tra</span>
                )}
              </div>

              {/* 3. Transaction Signatures */}
              <div className="p-2.5 rounded-lg bg-[#080c16] border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-300">3. Transaction Signatures</span>
                {node.validationState.txValid === true ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ (Valid)
                  </span>
                ) : node.validationState.txValid === false ? (
                  <span className="text-rose-400 flex items-center gap-1 text-xs">
                    <XCircle className="w-3.5 h-3.5" /> Sai chữ ký
                  </span>
                ) : (
                  <span className="text-zinc-500 text-xs">Chờ kiểm tra</span>
                )}
              </div>

              {/* 4. Proof-of-Work Target */}
              <div className="p-2.5 rounded-lg bg-[#080c16] border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-300">4. PoW Target Difficulty</span>
                {node.validationState.powValid === true ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đạt yêu cầu (Target met)
                  </span>
                ) : node.validationState.powValid === false ? (
                  <span className="text-rose-400 flex items-center gap-1 text-xs">
                    <XCircle className="w-3.5 h-3.5" /> Không đạt độ khó
                  </span>
                ) : (
                  <span className="text-zinc-500 text-xs">Chờ kiểm tra</span>
                )}
              </div>
            </div>
          </div>

          {/* "Why?" Explainability Section */}
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-300 font-semibold text-xs">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>{language === 'vi' ? 'Giải thích quyết định (Why Mode)' : 'Explainability: Why this decision?'}</span>
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed font-sans">
              {getWhyExplanation()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#080c16] border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
          >
            {language === 'vi' ? 'Đóng cửa sổ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
