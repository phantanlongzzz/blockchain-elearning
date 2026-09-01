import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Radio,
  CheckCircle2,
  Activity,
  GitFork,
  RotateCcw,
  Wifi,
  WifiOff,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { E2ENetworkNode, E2EBlock, E2EPacket } from './types';

interface NetworkBroadcastGraphProps {
  nodes: E2ENetworkNode[];
  onUpdateNodePosition: (id: string, x: number, y: number) => void;
  broadcastActive?: boolean;
  broadcastingBlock?: E2EBlock | null;
  candidateBlock?: E2EBlock | null;
  packets?: E2EPacket[];
  consensusReached?: boolean;
  forkActive?: boolean;
  onPropagationComplete?: (block: E2EBlock) => void;
  onLogEvent?: (category: 'broadcast' | 'validation' | 'consensus', message: string, details?: string) => void;
  language: 'vi' | 'en';
}

// Full mesh/relay peer connection topology
const PEER_EDGES: [string, string][] = [
  ['node-alice', 'node-bob'],
  ['node-alice', 'node-charlie'],
  ['node-bob', 'node-dave'],
  ['node-charlie', 'node-dave'],
  ['node-bob', 'node-charlie'],
  ['node-alice', 'node-dave'],
];

// Node State Machine: WAITING -> RECEIVING -> VALIDATING -> VALID (or CREATED / OFFLINE)
type NodeSimulationStatus = 'waiting' | 'created' | 'receiving' | 'validating' | 'valid' | 'offline';

type TimelineStage = 'create' | 'broadcast' | 'receive' | 'validate' | 'sync';

interface NodeRuntimeState {
  status: NodeSimulationStatus;
  isOffline: boolean;
  prevHash: boolean | null;
  merkleRoot: boolean | null;
  powValid: boolean | null;
  txValid: boolean | null;
  isAccepted: boolean | null;
}

export const NetworkBroadcastGraph: React.FC<NetworkBroadcastGraphProps> = ({
  nodes,
  onUpdateNodePosition,
  candidateBlock: propCandidateBlock,
  broadcastingBlock,
  forkActive = false,
  onPropagationComplete,
  onLogEvent,
  language,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Effective block to propagate (strictly inherited from Step 04 winner or Step 03 candidate)
  const activeBlock: E2EBlock = useMemo(() => {
    if (propCandidateBlock) return propCandidateBlock;
    if (broadcastingBlock) return broadcastingBlock;
    return {
      height: 3,
      id: 'block-3-mined',
      branchId: 'main',
      previousHash: '0000a891f7c2b3d4e5f60718293a4b5c6d7e8f90123456789abcdef012345678',
      hash: '000f0fd7e7c50d38a8b6c0d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f',
      nonce: 7557,
      timestamp: new Date().toLocaleTimeString(),
      merkleRoot: '7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e',
      difficulty: 4,
      transactions: [],
      minerId: 'miner-alice',
      minerName: 'Alice Node',
      cumulativeWork: 65536,
      status: 'candidate',
      rewardBTC: 3.125,
    };
  }, [propCandidateBlock, broadcastingBlock]);

  // Identify Origin Node ID from block miner (e.g. Alice Node)
  const originNodeId = useMemo(() => {
    const minerId = activeBlock.minerId;
    const minerName = activeBlock.minerName || '';
    if (minerId) {
      const match = nodes.find((n) => n.id === minerId || n.id === minerId.replace('miner-', 'node-'));
      if (match) return match.id;
    }
    const nameMatch = nodes.find(
      (n) =>
        n.name.toLowerCase().includes(minerName.toLowerCase()) ||
        minerName.toLowerCase().includes(n.name.toLowerCase())
    );
    if (nameMatch) return nameMatch.id;
    return nodes[0]?.id || 'node-alice';
  }, [activeBlock, nodes]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>(originNodeId);

  // Runtime states for all nodes
  const [nodeRuntime, setNodeRuntime] = useState<Record<string, NodeRuntimeState>>(() => {
    const init: Record<string, NodeRuntimeState> = {};
    nodes.forEach((n) => {
      const isOrigin = n.id === originNodeId;
      init[n.id] = {
        status: isOrigin ? 'created' : 'waiting',
        isOffline: false,
        prevHash: isOrigin ? true : null,
        merkleRoot: isOrigin ? true : null,
        powValid: isOrigin ? true : null,
        txValid: isOrigin ? true : null,
        isAccepted: isOrigin ? true : null,
      };
    });
    return init;
  });

  // Re-sync when origin node or block changes
  useEffect(() => {
    setNodeRuntime((prev) => {
      const next: Record<string, NodeRuntimeState> = {};
      nodes.forEach((n) => {
        const isOrigin = n.id === originNodeId;
        const currentOffline = prev[n.id]?.isOffline ?? false;
        next[n.id] = {
          status: currentOffline ? 'offline' : isOrigin ? 'created' : 'waiting',
          isOffline: currentOffline,
          prevHash: !currentOffline && isOrigin ? true : null,
          merkleRoot: !currentOffline && isOrigin ? true : null,
          powValid: !currentOffline && isOrigin ? true : null,
          txValid: !currentOffline && isOrigin ? true : null,
          isAccepted: !currentOffline && isOrigin ? true : null,
        };
      });
      return next;
    });
    setSelectedNodeId(originNodeId);
  }, [originNodeId, activeBlock.id, nodes]);

  // Propagation Animation & Timeline State
  const [isPropagating, setIsPropagating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timelineStage, setTimelineStage] = useState<TimelineStage>('create');
  const [activePackets, setActivePackets] = useState<E2EPacket[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const nodeMap = useMemo(() => new Map<string, E2ENetworkNode>(nodes.map((n) => [n.id, n])), [nodes]);
  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;
  const selectedRuntime = selectedNodeId ? nodeRuntime[selectedNodeId] : null;

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const node = nodeMap.get(nodeId);
    if (!node || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(60, Math.min(rect.width - 60, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(60, Math.min(rect.height - 60, e.clientY - rect.top - dragOffset.y));
    onUpdateNodePosition(draggingNodeId, newX, newY);
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Toggle node Online / Offline (Fault Tolerance Simulation)
  const handleToggleOffline = (nodeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPropagating) return; // Prevent during active transmission

    setNodeRuntime((prev) => {
      const current = prev[nodeId];
      const nextOffline = !current.isOffline;
      const isOrigin = nodeId === originNodeId;

      return {
        ...prev,
        [nodeId]: {
          ...current,
          isOffline: nextOffline,
          status: nextOffline ? 'offline' : isOrigin ? 'created' : 'waiting',
          prevHash: !nextOffline && isOrigin ? true : null,
          merkleRoot: !nextOffline && isOrigin ? true : null,
          powValid: !nextOffline && isOrigin ? true : null,
          txValid: !nextOffline && isOrigin ? true : null,
          isAccepted: !nextOffline && isOrigin ? true : null,
        },
      };
    });

    setIsCompleted(false);
    setTimelineStage('create');
  };

  // Reset simulation state
  const handleResetPropagation = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    setIsPropagating(false);
    setIsCompleted(false);
    setTimelineStage('create');
    setActivePackets([]);

    setNodeRuntime((prev) => {
      const next: Record<string, NodeRuntimeState> = {};
      nodes.forEach((n) => {
        const isOrigin = n.id === originNodeId;
        const currentOffline = prev[n.id]?.isOffline ?? false;
        next[n.id] = {
          status: currentOffline ? 'offline' : isOrigin ? 'created' : 'waiting',
          isOffline: currentOffline,
          prevHash: !currentOffline && isOrigin ? true : null,
          merkleRoot: !currentOffline && isOrigin ? true : null,
          powValid: !currentOffline && isOrigin ? true : null,
          txValid: !currentOffline && isOrigin ? true : null,
          isAccepted: !currentOffline && isOrigin ? true : null,
        };
      });
      return next;
    });
  }, [nodes, originNodeId]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Multi-hop Gossip Relay Simulation
  const handleStartPropagation = () => {
    if (isPropagating) return;

    handleResetPropagation();
    setIsPropagating(true);
    setIsCompleted(false);
    setTimelineStage('broadcast');

    if (onLogEvent) {
      onLogEvent(
        'broadcast',
        language === 'vi'
          ? `Bắt đầu phát tán khối #${activeBlock.height} từ nút tạo khối: ${activeBlock.minerName}`
          : `Initiating P2P block propagation for #${activeBlock.height} from origin: ${activeBlock.minerName}`,
        `Hash: ${activeBlock.hash.substring(0, 18)}... | Nonce: ${activeBlock.nonce.toLocaleString()}`
      );
    }

    const originNode = nodes.find((n) => n.id === originNodeId);
    if (!originNode || nodeRuntime[originNodeId]?.isOffline) {
      setIsPropagating(false);
      return;
    }

    // Graph adjacency for online peers
    const getConnectedOnlinePeers = (sourceId: string, visited: Set<string>): string[] => {
      const neighbors: string[] = [];
      PEER_EDGES.forEach(([a, b]) => {
        if (a === sourceId && !visited.has(b) && !nodeRuntime[b]?.isOffline) {
          neighbors.push(b);
        } else if (b === sourceId && !visited.has(a) && !nodeRuntime[a]?.isOffline) {
          neighbors.push(a);
        }
      });
      return Array.from(new Set(neighbors));
    };

    const visitedNodes = new Set<string>([originNodeId]);

    // Animate a hop of packets with gentle easing
    const animatePacketHop = (
      transmissions: { from: string; to: string }[],
      onHopComplete: (reachedNodeIds: string[]) => void
    ) => {
      if (transmissions.length === 0) {
        onHopComplete([]);
        return;
      }

      const packets: E2EPacket[] = transmissions.map((t, idx) => ({
        id: `pkt-${Date.now()}-${idx}-${t.from}-${t.to}`,
        fromNodeId: t.from,
        toNodeId: t.to,
        progress: 0,
        type: 'block',
        color: '#10B981',
      }));

      setActivePackets(packets);

      const startTime = performance.now();
      const durationMs = 850; // Smooth 850ms duration per hop

      const step = (now: number) => {
        const elapsed = now - startTime;
        const rawProgress = elapsed / durationMs;
        // Cubic ease-out
        const progress = Math.min(1, 1 - Math.pow(1 - Math.min(1, rawProgress), 3));

        setActivePackets((prev) => prev.map((p) => ({ ...p, progress })));

        if (rawProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          setActivePackets([]);
          const reached = transmissions.map((t) => t.to);
          onHopComplete(reached);
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
    };

    // --- HOP 1: Origin (e.g. Alice) -> Direct Peers (e.g. Bob, Charlie) ---
    const hop1Targets = getConnectedOnlinePeers(originNodeId, visitedNodes);
    hop1Targets.forEach((t) => visitedNodes.add(t));

    const hop1Transmissions = hop1Targets.map((targetId) => ({
      from: originNodeId,
      to: targetId,
    }));

    animatePacketHop(hop1Transmissions, (reachedHop1) => {
      if (reachedHop1.length === 0) {
        finalizeSimulation();
        return;
      }

      // Step T2: Receiving
      setTimelineStage('receive');
      reachedHop1.forEach((nodeId) => {
        setNodeRuntime((prev) => ({
          ...prev,
          [nodeId]: { ...prev[nodeId], status: 'receiving' },
        }));
      });

      const t1 = setTimeout(() => {
        // Step T3: Validating
        setTimelineStage('validate');
        reachedHop1.forEach((nodeId) => {
          setNodeRuntime((prev) => ({
            ...prev,
            [nodeId]: { ...prev[nodeId], status: 'validating' },
          }));
        });

        const t2 = setTimeout(() => {
          // Cryptographic validation passed at Hop 1
          reachedHop1.forEach((nodeId) => {
            setNodeRuntime((prev) => ({
              ...prev,
              [nodeId]: {
                ...prev[nodeId],
                status: 'valid',
                prevHash: true,
                merkleRoot: true,
                powValid: true,
                txValid: true,
                isAccepted: true,
              },
            }));
          });

          // --- HOP 2 (Gossip Relay): Validated Hop 1 peers (Bob, Charlie) -> Remaining Peers (Dave) ---
          const hop2Transmissions: { from: string; to: string }[] = [];
          const nextTargets = new Set<string>();

          reachedHop1.forEach((senderId) => {
            const peers = getConnectedOnlinePeers(senderId, visitedNodes);
            peers.forEach((peerId) => {
              nextTargets.add(peerId);
              hop2Transmissions.push({ from: senderId, to: peerId });
            });
          });

          nextTargets.forEach((t) => visitedNodes.add(t));

          if (hop2Transmissions.length > 0) {
            setTimelineStage('broadcast');
            animatePacketHop(hop2Transmissions, (reachedHop2) => {
              setTimelineStage('receive');
              reachedHop2.forEach((nodeId) => {
                setNodeRuntime((prev) => ({
                  ...prev,
                  [nodeId]: { ...prev[nodeId], status: 'receiving' },
                }));
              });

              const t3 = setTimeout(() => {
                setTimelineStage('validate');
                reachedHop2.forEach((nodeId) => {
                  setNodeRuntime((prev) => ({
                    ...prev,
                    [nodeId]: { ...prev[nodeId], status: 'validating' },
                  }));
                });

                const t4 = setTimeout(() => {
                  reachedHop2.forEach((nodeId) => {
                    setNodeRuntime((prev) => ({
                      ...prev,
                      [nodeId]: {
                        ...prev[nodeId],
                        status: 'valid',
                        prevHash: true,
                        merkleRoot: true,
                        powValid: true,
                        txValid: true,
                        isAccepted: true,
                      },
                    }));
                  });

                  // --- HOP 3 (If any remaining peers exist) ---
                  const hop3Transmissions: { from: string; to: string }[] = [];
                  reachedHop2.forEach((senderId) => {
                    const peers = getConnectedOnlinePeers(senderId, visitedNodes);
                    peers.forEach((peerId) => {
                      visitedNodes.add(peerId);
                      hop3Transmissions.push({ from: senderId, to: peerId });
                    });
                  });

                  if (hop3Transmissions.length > 0) {
                    animatePacketHop(hop3Transmissions, (reachedHop3) => {
                      reachedHop3.forEach((nodeId) => {
                        setNodeRuntime((prev) => ({
                          ...prev,
                          [nodeId]: {
                            ...prev[nodeId],
                            status: 'valid',
                            prevHash: true,
                            merkleRoot: true,
                            powValid: true,
                            txValid: true,
                            isAccepted: true,
                          },
                        }));
                      });
                      finalizeSimulation();
                    });
                  } else {
                    finalizeSimulation();
                  }
                }, 600);
                timeoutsRef.current.push(t4);
              }, 400);
              timeoutsRef.current.push(t3);
            });
          } else {
            finalizeSimulation();
          }
        }, 600);
        timeoutsRef.current.push(t2);
      }, 400);
      timeoutsRef.current.push(t1);
    });

    const finalizeSimulation = () => {
      setIsPropagating(false);
      setIsCompleted(true);
      setTimelineStage('sync');

      const onlineCount = nodes.filter((n) => !nodeRuntime[n.id]?.isOffline).length;
      if (onLogEvent) {
        onLogEvent(
          'validation',
          language === 'vi'
            ? `Hoàn tất lan truyền P2P: ${onlineCount}/${onlineCount} nút trực tuyến đã xác thực hợp lệ khối #${activeBlock.height}`
            : `P2P propagation completed: ${onlineCount}/${onlineCount} online nodes validated block #${activeBlock.height}`
        );
      }

      if (onPropagationComplete) {
        onPropagationComplete(activeBlock);
      }
    };
  };

  // Stats calculation
  const onlineNodes = nodes.filter((n) => !nodeRuntime[n.id]?.isOffline);
  const validatedNodesCount = nodes.filter((n) => {
    const r = nodeRuntime[n.id];
    return !r?.isOffline && (r?.status === 'valid' || r?.status === 'created');
  }).length;

  const isOriginSelected = selectedNode?.id === originNodeId;

  return (
    <div id="e2e-network-broadcast-graph" className="space-y-5 font-sans">
      {/* Step Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-100">
              {language === 'vi' ? 'Lan truyền & Xác thực P2P' : 'P2P Propagation & Independent Validation'}
            </h3>

            {isCompleted && !isPropagating && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {language === 'vi'
                  ? `Toàn mạng đã đồng bộ (${validatedNodesCount}/${onlineNodes.length})`
                  : `Network synchronized (${validatedNodesCount}/${onlineNodes.length})`}
              </span>
            )}

            {forkActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans bg-amber-950/40 text-amber-300 border border-amber-500/30">
                <GitFork className="w-3 h-3 text-amber-400" />
                {language === 'vi' ? 'Phân nhánh tạm thời' : 'Fork state'}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            {language === 'vi'
              ? 'Khối được phát tán qua mạng P2P Gossip. Mỗi nút nhận khối độc lập kiểm tra Previous Hash, Merkle Root và PoW.'
              : 'Blocks propagate via P2P Gossip protocol. Each peer independently verifies Previous Hash, Merkle Root, and PoW.'}
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex items-center gap-2">
          {!isCompleted ? (
            <button
              type="button"
              id="btn-start-p2p-propagation"
              onClick={handleStartPropagation}
              disabled={isPropagating}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {isPropagating ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'vi' ? 'Đang phát tán...' : 'Broadcasting...'}</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Phát tán khối' : 'Broadcast Block'}</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'vi' ? '✓ Mạng đã đồng bộ' : '✓ Network Synchronized'}</span>
              </div>
              <button
                type="button"
                id="btn-repropagate-p2p"
                onClick={handleStartPropagation}
                disabled={isPropagating}
                className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Phát lại' : 'Replay'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visual Timeline Bar */}
      <div className="p-2.5 bg-[#080c16] border border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
          {/* Step 1: Tạo khối */}
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-[10px]">
              ✓
            </span>
            <span>{language === 'vi' ? '1. Tạo khối' : '1. Block Created'}</span>
          </div>

          <span className="text-zinc-600">→</span>

          {/* Step 2: Phát tán */}
          <div
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              timelineStage === 'broadcast'
                ? 'text-emerald-400'
                : isCompleted || timelineStage === 'receive' || timelineStage === 'validate' || timelineStage === 'sync'
                ? 'text-emerald-400/80'
                : 'text-zinc-500'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                timelineStage === 'broadcast'
                  ? 'bg-emerald-500 text-zinc-950 animate-pulse font-bold'
                  : isCompleted || timelineStage === 'receive' || timelineStage === 'validate' || timelineStage === 'sync'
                  ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900 border border-zinc-700 text-zinc-500'
              }`}
            >
              {isCompleted || timelineStage === 'receive' || timelineStage === 'validate' || timelineStage === 'sync'
                ? '✓'
                : '2'}
            </span>
            <span>{language === 'vi' ? '2. Phát tán' : '2. Propagate'}</span>
          </div>

          <span className="text-zinc-600">→</span>

          {/* Step 3: Nhận khối */}
          <div
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              timelineStage === 'receive'
                ? 'text-purple-400'
                : isCompleted || timelineStage === 'validate' || timelineStage === 'sync'
                ? 'text-emerald-400/80'
                : 'text-zinc-500'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                timelineStage === 'receive'
                  ? 'bg-purple-500 text-zinc-950 animate-pulse font-bold'
                  : isCompleted || timelineStage === 'validate' || timelineStage === 'sync'
                  ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900 border border-zinc-700 text-zinc-500'
              }`}
            >
              {isCompleted || timelineStage === 'validate' || timelineStage === 'sync' ? '✓' : '3'}
            </span>
            <span>{language === 'vi' ? '3. Nhận khối' : '3. Receive'}</span>
          </div>

          <span className="text-zinc-600">→</span>

          {/* Step 4: Xác thực */}
          <div
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              timelineStage === 'validate'
                ? 'text-amber-400'
                : isCompleted || timelineStage === 'sync'
                ? 'text-emerald-400/80'
                : 'text-zinc-500'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                timelineStage === 'validate'
                  ? 'bg-amber-500 text-zinc-950 animate-pulse font-bold'
                  : isCompleted || timelineStage === 'sync'
                  ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900 border border-zinc-700 text-zinc-500'
              }`}
            >
              {isCompleted || timelineStage === 'sync' ? '✓' : '4'}
            </span>
            <span>{language === 'vi' ? '4. Xác thực' : '4. Validate'}</span>
          </div>

          <span className="text-zinc-600">→</span>

          {/* Step 5: Đồng bộ */}
          <div
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              isCompleted || timelineStage === 'sync' ? 'text-emerald-400 font-semibold' : 'text-zinc-500'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                isCompleted || timelineStage === 'sync'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 border border-zinc-700 text-zinc-500'
              }`}
            >
              {isCompleted ? '✓' : '5'}
            </span>
            <span>{language === 'vi' ? '5. Đồng bộ' : '5. Consensus'}</span>
          </div>
        </div>

        {/* Block Telemetry Ribbon */}
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {language === 'vi' ? 'Khối đang phát tán:' : 'Broadcasting Block:'}{' '}
              <strong className="text-zinc-100">#{activeBlock.height}</strong>
            </span>
          </div>
          <span className="text-zinc-600">·</span>
          <div className="truncate font-mono text-[11px]">
            Nonce: <strong className="text-zinc-200">{activeBlock.nonce.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Main Graph Canvas & Independent Validation Details Container */}
      <div className="bg-[#0c101c] border border-zinc-800 rounded-xl overflow-hidden p-4 sm:p-6 space-y-4">
        {/* SVG Interactive Canvas */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative w-full h-[360px] sm:h-[400px] bg-[#060911] border border-zinc-800/80 rounded-xl overflow-hidden select-none"
        >
          <svg className="w-full h-full absolute inset-0 pointer-events-none">
            {/* Peer Edges */}
            {PEER_EDGES.map(([srcId, dstId], idx) => {
              const src = nodeMap.get(srcId);
              const dst = nodeMap.get(dstId);
              if (!src || !dst) return null;

              const srcOffline = nodeRuntime[srcId]?.isOffline;
              const dstOffline = nodeRuntime[dstId]?.isOffline;
              const isEdgeDisabled = srcOffline || dstOffline;

              // Check if any packet is traveling this edge
              const isEdgeActive = activePackets.some(
                (p) =>
                  (p.fromNodeId === srcId && p.toNodeId === dstId) ||
                  (p.fromNodeId === dstId && p.toNodeId === srcId)
              );

              return (
                <line
                  key={`edge-${idx}`}
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke={isEdgeActive ? '#10b981' : isEdgeDisabled ? '#18181b' : '#27272a'}
                  strokeWidth={isEdgeActive ? '2.5' : '1.5'}
                  strokeDasharray={isEdgeDisabled ? '3 3' : isEdgeActive ? 'none' : '4 4'}
                  className="transition-colors duration-200"
                />
              );
            })}

            {/* Gossip Packets (Smooth Moving Dots with Block Height Badge) */}
            {activePackets.map((pkt) => {
              const src = nodeMap.get(pkt.fromNodeId);
              const dst = nodeMap.get(pkt.toNodeId);
              if (!src || !dst) return null;

              const curX = src.x + (dst.x - src.x) * pkt.progress;
              const curY = src.y + (dst.y - src.y) * pkt.progress;

              return (
                <g key={pkt.id} transform={`translate(${curX}, ${curY})`}>
                  {/* Subtle outer halo */}
                  <circle r="12" fill={pkt.color} opacity="0.2" />
                  <rect
                    x="-14"
                    y="-9"
                    width="28"
                    height="18"
                    rx="4"
                    fill="#064e3b"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill="#ecfdf5"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    #{activeBlock.height}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Draggable Nodes */}
          {nodes.map((node) => {
            const isOrigin = node.id === originNodeId;
            const runtime = nodeRuntime[node.id] || {
              status: isOrigin ? 'created' : 'waiting',
              isOffline: false,
            };
            const isOffline = runtime.isOffline;
            const isSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onClick={() => setSelectedNodeId(node.id)}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute cursor-grab active:cursor-grabbing rounded-xl p-3 border text-xs select-none z-10 w-44 sm:w-48 transition-all ${
                  isSelected
                    ? 'bg-[#080c16] border-emerald-400 shadow-md ring-1 ring-emerald-500/40'
                    : isOrigin
                    ? 'bg-[#080c16] border-emerald-500/70 shadow-sm'
                    : runtime.status === 'valid'
                    ? 'bg-[#080c16] border-emerald-500/40'
                    : runtime.status === 'validating'
                    ? 'bg-[#080c16] border-amber-500/50'
                    : runtime.status === 'receiving'
                    ? 'bg-[#080c16] border-purple-500/50'
                    : isOffline
                    ? 'bg-[#080c16]/70 border-zinc-800 opacity-60'
                    : 'bg-[#080c16] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Node Name, Region & Online Toggle */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-zinc-100 text-xs truncate">
                      {node.name}
                    </span>
                    {isOrigin && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-600/30 font-medium">
                        {language === 'vi' ? 'Nguồn' : 'Origin'}
                      </span>
                    )}
                  </div>

                  {/* Offline Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleOffline(node.id, e)}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      isOffline
                        ? 'text-rose-400 hover:bg-rose-950/40'
                        : 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'
                    }`}
                    title={
                      isOffline
                        ? language === 'vi'
                          ? 'Bật kết nối'
                          : 'Turn Online'
                        : language === 'vi'
                        ? 'Tắt nút'
                        : 'Turn Offline'
                    }
                  >
                    {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                  </button>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/80">
                  <span className="text-zinc-500 font-mono text-[10px]">{node.region}</span>

                  {isOffline ? (
                    <span className="text-rose-400 flex items-center gap-1 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                      {language === 'vi' ? 'Mất kết nối' : 'Offline'}
                    </span>
                  ) : isOrigin ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      {language === 'vi' ? 'Đã tạo khối' : 'Block created'}
                    </span>
                  ) : runtime.status === 'valid' ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      {language === 'vi' ? 'Đã xác thực' : 'Validated'}
                    </span>
                  ) : runtime.status === 'validating' ? (
                    <span className="text-amber-400 font-medium flex items-center gap-1 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                      {language === 'vi' ? 'Đang xác thực' : 'Validating'}
                    </span>
                  ) : runtime.status === 'receiving' ? (
                    <span className="text-purple-400 font-medium flex items-center gap-1 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping inline-block" />
                      {language === 'vi' ? 'Đang nhận' : 'Receiving'}
                    </span>
                  ) : (
                    <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />
                      {language === 'vi' ? 'Chờ nhận khối' : 'Awaiting block'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Node Detail Drawer / Inspection Panel */}
        {selectedNode && selectedRuntime && (
          <div className="bg-[#080c16] border border-zinc-800 rounded-xl p-4 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-zinc-200">
                  {isOriginSelected
                    ? language === 'vi'
                      ? `Kiểm tra nút: ${selectedNode.name}`
                      : `Inspecting Node: ${selectedNode.name}`
                    : language === 'vi'
                    ? `Kiểm tra độc lập tại nút: ${selectedNode.name}`
                    : `Independent Validation at: ${selectedNode.name}`}
                  <span className="font-normal text-zinc-400"> ({selectedNode.region})</span>
                </span>
                {isOriginSelected && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                    {language === 'vi' ? 'Nút tạo khối' : 'Origin Miner Node'}
                  </span>
                )}
                {selectedRuntime.isOffline && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/60 text-rose-300 border border-rose-500/30">
                    {language === 'vi' ? 'Mất kết nối' : 'Disconnected'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleOffline(selectedNode.id)}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {selectedRuntime.isOffline ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span>{language === 'vi' ? 'Bật kết nối' : 'Turn Online'}</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-rose-400" />
                      <span>{language === 'vi' ? 'Tắt nút' : 'Turn Offline'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* If Origin Node: show created block info */}
            {isOriginSelected ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#060911] border border-zinc-800/80 space-y-1.5">
                  <span className="text-zinc-400 font-medium text-[11px]">Previous Hash</span>
                  <div className="space-y-0.5">
                    <span className="text-emerald-400 font-medium block">
                      {language === 'vi' ? '✓ Khớp với đỉnh chuỗi hiện tại' : '✓ Matches Canonical Chain Tip'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block truncate" title={activeBlock.previousHash}>
                      {activeBlock.previousHash.substring(0, 16)}...
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#060911] border border-zinc-800/80 space-y-1.5">
                  <span className="text-zinc-400 font-medium text-[11px]">Merkle Root</span>
                  <div className="space-y-0.5">
                    <span className="text-emerald-400 font-medium block">
                      {language === 'vi'
                        ? `✓ Cây băm (${activeBlock.transactions?.length || 0} giao dịch)`
                        : `✓ Merkle Root (${activeBlock.transactions?.length || 0} txs)`}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block truncate" title={activeBlock.merkleRoot}>
                      {activeBlock.merkleRoot.substring(0, 16)}...
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#060911] border border-zinc-800/80 space-y-1.5">
                  <span className="text-zinc-400 font-medium text-[11px]">Proof of Work</span>
                  <div className="space-y-0.5">
                    <span className="text-emerald-400 font-medium block">
                      {language === 'vi'
                        ? `✓ Nonce hợp lệ (${activeBlock.nonce.toLocaleString()})`
                        : `✓ Valid Nonce (${activeBlock.nonce.toLocaleString()})`}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block truncate" title={activeBlock.hash}>
                      {activeBlock.hash.substring(0, 16)}...
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* If Peer Node: show independent validation state */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Previous Hash Check */}
                <div className="p-3 rounded-lg bg-[#060911] border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-medium text-[11px]">Previous Hash</span>
                    {selectedRuntime.prevHash === true ? (
                      <span className="text-[10px] text-emerald-400 font-mono">OK</span>
                    ) : null}
                  </div>
                  {selectedRuntime.isOffline ? (
                    <span className="text-rose-400 text-[11px] block">
                      {language === 'vi' ? '✕ Mất kết nối' : '✕ Node offline'}
                    </span>
                  ) : selectedRuntime.prevHash === true ? (
                    <div className="space-y-0.5">
                      <span className="text-emerald-400 font-medium block">
                        {language === 'vi'
                          ? '✓ Khớp với hash của block trước'
                          : '✓ Matches hash of previous block'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 block truncate" title={activeBlock.previousHash}>
                        {activeBlock.previousHash.substring(0, 16)}...
                      </span>
                    </div>
                  ) : selectedRuntime.status === 'validating' ? (
                    <span className="text-amber-400 text-[11px] block animate-pulse">
                      {language === 'vi' ? '◌ Đang kiểm tra...' : '◌ Verifying chain tip...'}
                    </span>
                  ) : selectedRuntime.status === 'receiving' ? (
                    <span className="text-purple-400 text-[11px] block animate-pulse">
                      {language === 'vi' ? '◌ Đang nhận khối...' : '◌ Receiving block...'}
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-[11px] block">
                      {language === 'vi' ? 'Chờ nhận khối' : 'Awaiting block'}
                    </span>
                  )}
                </div>

                {/* Merkle Root Check */}
                <div className="p-3 rounded-lg bg-[#060911] border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-medium text-[11px]">Merkle Root</span>
                    {selectedRuntime.merkleRoot === true ? (
                      <span className="text-[10px] text-emerald-400 font-mono">OK</span>
                    ) : null}
                  </div>
                  {selectedRuntime.isOffline ? (
                    <span className="text-rose-400 text-[11px] block">
                      {language === 'vi' ? '✕ Mất kết nối' : '✕ Node offline'}
                    </span>
                  ) : selectedRuntime.merkleRoot === true ? (
                    <div className="space-y-0.5">
                      <span className="text-emerald-400 font-medium block">
                        {language === 'vi'
                          ? '✓ Khớp với dữ liệu giao dịch'
                          : '✓ Matches transaction data'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 block truncate" title={activeBlock.merkleRoot}>
                        {activeBlock.merkleRoot.substring(0, 16)}...
                      </span>
                    </div>
                  ) : selectedRuntime.status === 'validating' ? (
                    <span className="text-amber-400 text-[11px] block animate-pulse">
                      {language === 'vi' ? '◌ Đang kiểm tra...' : '◌ Computing Merkle tree...'}
                    </span>
                  ) : selectedRuntime.status === 'receiving' ? (
                    <span className="text-purple-400 text-[11px] block animate-pulse">
                      {language === 'vi' ? '◌ Đang nhận khối...' : '◌ Receiving block...'}
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-[11px] block">
                      {language === 'vi' ? 'Chờ nhận khối' : 'Awaiting block'}
                    </span>
                  )}
                </div>

                {/* PoW Target Check */}
                <div className="p-3 rounded-lg bg-[#060911] border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-medium text-[11px]">PoW Target</span>
                    {selectedRuntime.powValid === true ? (
                      <span className="text-[10px] text-emerald-400 font-mono">OK</span>
                    ) : null}
                  </div>
                  {selectedRuntime.isOffline ? (
                    <span className="text-rose-400 text-[11px] block">
                      {language === 'vi' ? '✕ Mất kết nối' : '✕ Node offline'}
                    </span>
                  ) : selectedRuntime.powValid === true ? (
                    <div className="space-y-0.5">
                      <span className="text-emerald-400 font-medium block">
                        {language === 'vi'
                          ? '✓ Hash block đạt mục tiêu'
                          : '✓ Block hash meets target'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 block truncate">
                        Nonce: {activeBlock.nonce.toLocaleString()}
                      </span>
                    </div>
                  ) : selectedRuntime.status === 'validating' ? (
                    <span className="text-amber-400 text-[11px] block animate-pulse">
                      {language === 'vi' ? '◌ Đang kiểm tra...' : '◌ Checking SHA-256 target...'}
                    </span>
                  ) : selectedRuntime.status === 'receiving' ? (
                    <span className="text-purple-400 text-[11px] block animate-pulse">
                      {language === 'vi' ? '◌ Đang nhận khối...' : '◌ Receiving block...'}
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-[11px] block">
                      {language === 'vi' ? 'Chờ nhận khối' : 'Awaiting block'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
