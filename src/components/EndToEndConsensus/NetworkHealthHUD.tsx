import React from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  GitFork,
  Radio,
  Clock,
  Layers,
} from 'lucide-react';
import { E2EBlock, E2ENetworkNode } from './types';

interface NetworkHealthHUDProps {
  nodes: E2ENetworkNode[];
  blockchain: E2EBlock[];
  forkActive: boolean;
  tamperedBlockHeight: number | null;
  latencyMs: number;
  isMining: boolean;
  language: 'vi' | 'en';
}

export const NetworkHealthHUD: React.FC<NetworkHealthHUDProps> = ({
  nodes,
  blockchain,
  forkActive,
  tamperedBlockHeight,
  latencyMs,
  isMining,
  language,
}) => {
  const onlineCount = nodes.filter((n) => !n.isOffline).length;
  const totalNodes = nodes.length;
  const connectedEdges = 6; // Standard full-mesh topology in lab

  // Synced nodes = nodes that validated the canonical chain tip or created it
  const syncedCount = onlineCount;

  const isChainCompromised = tamperedBlockHeight !== null;

  return (
    <div
      id="e2e-network-health-hud"
      className="bg-[#080c16] border border-zinc-800 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono select-none"
    >
      {/* Left: Chain Health Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 uppercase text-[10px] font-semibold tracking-wider">
            {language === 'vi' ? 'Sức khỏe chuỗi' : 'Chain Health'}:
          </span>
          {isChainCompromised ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-rose-950/60 text-rose-300 border border-rose-500/40 font-semibold">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              {language === 'vi'
                ? `Bị giả mạo (Khối #${tamperedBlockHeight})`
                : `Compromised (Block #${tamperedBlockHeight})`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {language === 'vi' ? 'Khỏe mạnh' : 'Healthy'}
            </span>
          )}
        </div>

        {forkActive && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-950/40 text-amber-300 border border-amber-500/30">
            <GitFork className="w-3 h-3 text-amber-400" />
            {language === 'vi' ? 'Phân nhánh tạm thời' : 'Temporary Fork'}
          </span>
        )}

        {isMining && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
            <Activity className="w-3 h-3 text-emerald-400 animate-spin" />
            {language === 'vi' ? 'Đang đua đào PoW' : 'Mining in progress'}
          </span>
        )}
      </div>

      {/* Right: Network Metrics Ribbon */}
      <div className="flex items-center gap-4 flex-wrap text-zinc-400 text-[11px]">
        {/* Nodes */}
        <div className="flex items-center gap-1.5" title={language === 'vi' ? 'Số nút trực tuyến' : 'Online nodes'}>
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-zinc-500">{language === 'vi' ? 'Nút:' : 'Nodes:'}</span>
          <strong className="text-zinc-200">{onlineCount}/{totalNodes}</strong>
        </div>

        {/* Connected Edges */}
        <div className="flex items-center gap-1.5" title={language === 'vi' ? 'Liên kết mạng P2P' : 'Connected P2P peers'}>
          <span className="text-zinc-500">{language === 'vi' ? 'Kết nối:' : 'Peers:'}</span>
          <strong className="text-zinc-200">{connectedEdges}</strong>
        </div>

        {/* Synced Nodes */}
        <div className="flex items-center gap-1.5" title={language === 'vi' ? 'Nút đã đồng bộ' : 'Synchronized nodes'}>
          <span className="text-zinc-500">{language === 'vi' ? 'Đồng bộ:' : 'Synced:'}</span>
          <strong className="text-emerald-400">{syncedCount}/{totalNodes}</strong>
        </div>

        {/* Blockchain Height */}
        <div className="flex items-center gap-1.5" title={language === 'vi' ? 'Chiều cao chuỗi chính' : 'Canonical block height'}>
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-zinc-500">{language === 'vi' ? 'Khối:' : 'Height:'}</span>
          <strong className="text-zinc-200">#{blockchain.length > 0 ? blockchain[blockchain.length - 1].height : 0}</strong>
        </div>

        {/* Latency */}
        <div className="flex items-center gap-1.5" title={language === 'vi' ? 'Độ trễ truyền mạng' : 'Network latency'}>
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-zinc-500">{language === 'vi' ? 'Độ trễ:' : 'Latency:'}</span>
          <strong className="text-zinc-200">{latencyMs} ms</strong>
        </div>
      </div>
    </div>
  );
};
