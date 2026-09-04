import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Radio,
  Clock,
  Key,
  Database,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { CausalityStep, FaultScenarioType, E2EBlock, E2ENetworkNode } from './types';

interface FaultInjectionPanelProps {
  blockchain: E2EBlock[];
  nodes: E2ENetworkNode[];
  onTamperBlockData: (height: number) => void;
  onCorruptHash: (height: number) => void;
  onCorruptMerkle: (height: number) => void;
  onCorruptPoW: (height: number) => void;
  onToggleNodeOnline: (nodeId: string) => void;
  onResetFaults: () => void;
  tamperedBlockHeight: number | null;
  language: 'vi' | 'en';
}

export const FaultInjectionPanel: React.FC<FaultInjectionPanelProps> = ({
  blockchain,
  nodes,
  onTamperBlockData,
  onCorruptHash,
  onCorruptMerkle,
  onCorruptPoW,
  onToggleNodeOnline,
  onResetFaults,
  tamperedBlockHeight,
  language,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<FaultScenarioType | null>(null);

  // Derive Causality Chain Steps based on current fault status
  const causalitySteps: CausalityStep[] = [
    {
      titleVi: '1. Tác động của người dùng',
      titleEn: '1. User Injection',
      descVi: tamperedBlockHeight !== null
        ? `Người dùng sửa đổi dữ liệu bên trong Khối #${tamperedBlockHeight}.`
        : 'Chưa có lỗi nào được tiêm vào hệ thống.',
      descEn: tamperedBlockHeight !== null
        ? `User edited transactional data inside Block #${tamperedBlockHeight}.`
        : 'No faults injected yet.',
      type: 'action',
      status: tamperedBlockHeight !== null ? 'trigger' : 'success',
    },
    {
      titleVi: '2. Hiệu ứng thác lũ của mã băm',
      titleEn: '2. Cryptographic Hash Change',
      descVi: tamperedBlockHeight !== null
        ? `SHA-256(Block #${tamperedBlockHeight}) thay đổi hoàn toàn do hiệu ứng thác đổ.`
        : 'Hàm băm của các khối hoàn toàn nguyên vẹn.',
      descEn: tamperedBlockHeight !== null
        ? `SHA-256(Block #${tamperedBlockHeight}) diverged completely due to Avalanche effect.`
        : 'Block hashes remain consistent.',
      type: 'state_change',
      status: tamperedBlockHeight !== null ? 'warning' : 'success',
    },
    {
      titleVi: '3. Sai khớp mã băm của khối trước',
      titleEn: '3. Next Block Previous Hash Mismatch',
      descVi: tamperedBlockHeight !== null
        ? `Khối #${tamperedBlockHeight + 1} vẫn trỏ tới mã băm cũ → Mối liên kết hash pointer bị đứt gãy!`
        : 'Con trỏ hash pointer trỏ chính xác.',
      descEn: tamperedBlockHeight !== null
        ? `Block #${tamperedBlockHeight + 1} still references old hash → Hash pointer broken!`
        : 'Hash pointer correctly matches.',
      type: 'validation',
      status: tamperedBlockHeight !== null ? 'error' : 'success',
    },
    {
      titleVi: '4. Toàn bộ mạng P2P từ chối chuỗi giả mạo',
      titleEn: '4. Network Rejection & Chain Invalidation',
      descVi: tamperedBlockHeight !== null
        ? 'Tất cả các node xác thực độc lập từ chối khối và cô lập nút tấn công.'
        : 'Chuỗi khối duy trì tính toàn vẹn 100%.',
      descEn: tamperedBlockHeight !== null
        ? 'All independent peer nodes reject the tampered branch immediately.'
        : 'Blockchain maintains 100% integrity.',
      type: 'cascade',
      status: tamperedBlockHeight !== null ? 'error' : 'success',
    },
  ];

  return (
    <div
      id="e2e-fault-injection-panel"
      className="bg-[#0c101c] border border-zinc-800 rounded-xl p-4 space-y-4 font-sans text-xs"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <h4 className="text-sm font-semibold text-zinc-100">
              {language === 'vi'
                ? 'Hệ thống tiêm lỗi và phân tích nguyên nhân'
                : 'Failure Injection System & Causality Graph'}
            </h4>
          </div>
          <p className="text-zinc-400 text-xs mt-0.5">
            {language === 'vi'
              ? 'Mô phỏng các tình huống tấn công và quan sát phản ứng dây chuyền của cơ chế bảo vệ trong mạng phi tập trung.'
              : 'Inject adversarial anomalies to observe decentralization cascading defenses.'}
          </p>
        </div>

        {tamperedBlockHeight !== null && (
          <button
            type="button"
            onClick={onResetFaults}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span>{language === 'vi' ? 'Khôi phục tính toàn vẹn' : 'Restore Integrity'}</span>
          </button>
        )}
      </div>

      {/* Fault Trigger Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {/* 1. Tamper Data */}
        <button
          type="button"
          onClick={() => onTamperBlockData(1)}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            tamperedBlockHeight === 1
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-200 ring-1 ring-rose-500/30'
              : 'bg-[#080c16] border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-rose-400" />
              {language === 'vi' ? 'Sửa dữ liệu Khối #1' : 'Edit Block #1 Data'}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              Tx Tamper
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {language === 'vi'
              ? 'Thay đổi số tiền Satoshi gửi Hal Finney: 10 BTC → 999 BTC'
              : 'Change Satoshi transaction amount: 10 BTC → 999 BTC'}
          </p>
        </button>

        {/* 2. Corrupt Hash */}
        <button
          type="button"
          onClick={() => onCorruptHash(1)}
          className="p-3 rounded-lg bg-[#080c16] border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-left transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              {language === 'vi' ? 'Làm hỏng mã băm' : 'Corrupt Block Hash'}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              Hash Mismatch
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {language === 'vi'
              ? 'Thay đổi ngẫu nhiên ký tự trong mã băm của khối'
              : 'Alter arbitrary characters in the block hash signature'}
          </p>
        </button>

        {/* 3. Disconnect/Kill Peer Node */}
        <div className="p-3 rounded-lg bg-[#080c16] border border-zinc-800 text-zinc-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              {language === 'vi' ? 'Ngắt kết nối nút' : 'Disconnect Peer Node'}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              P2P Partition
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {nodes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onToggleNodeOnline(n.id)}
                className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                  n.isOffline
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                {n.name.split(' ')[0]}: {n.isOffline ? (language === 'vi' ? 'Ngoại tuyến' : 'Offline') : (language === 'vi' ? 'Trực tuyến' : 'Online')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Causality Graph Visualization */}
      <div className="bg-[#080c16] border border-zinc-800 rounded-lg p-3 space-y-2">
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
          {language === 'vi' ? 'Sơ đồ quan hệ nhân quả (Causality Graph):' : 'Causality Chain of Invalidation:'}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {causalitySteps.map((step, idx) => {
            const isFaultTriggered = tamperedBlockHeight !== null;
            return (
              <div
                key={step.titleEn}
                className={`p-2.5 rounded-lg border text-xs relative ${
                  isFaultTriggered
                    ? step.status === 'trigger'
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      : step.status === 'warning'
                      ? 'bg-orange-950/20 border-orange-500/40 text-orange-200'
                      : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                    : 'bg-[#060911] border-zinc-800/80 text-zinc-400'
                }`}
              >
                <div className="font-semibold text-zinc-200 text-xs mb-1 flex items-center justify-between">
                  <span>{language === 'vi' ? step.titleVi : step.titleEn}</span>
                  {isFaultTriggered ? (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success/50 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  {language === 'vi' ? step.descVi : step.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
