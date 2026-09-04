import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Maximize,
  Minimize,
  Focus,
} from 'lucide-react';
import { MerkleNode, MerkleTreeResult } from '../../types';
import { MerkleNodeCard } from './MerkleNodeCard';
import { NodeDetailModal } from './NodeDetailModal';
import { MerkleAnimStep } from './MerkleTreeLab';

interface MerkleTreeCanvasProps {
  treeData: MerkleTreeResult;
  prevTreeData: MerkleTreeResult | null;
  animStep: MerkleAnimStep;
  isTechnicalMode: boolean;
  selectedTxId: string | null;
  onSelectTx: (id: string | null) => void;
  onInspectNode: (node: MerkleNode) => void;
  inspectNode?: MerkleNode | null;
  onCloseInspectNode?: () => void;
}

export const MerkleTreeCanvas: React.FC<MerkleTreeCanvasProps> = ({
  treeData,
  prevTreeData,
  animStep,
  isTechnicalMode,
  selectedTxId,
  onSelectTx,
  onInspectNode,
  inspectNode,
  onCloseInspectNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const { levels, rootNode, treeHeight, isTampered } = treeData;
  const maxLeaves = levels && levels.length > 0 ? levels[0].length : 0;

  const CARD_WIDTH = maxLeaves > 4 ? 140 : 160;
  const ROOT_WIDTH = CARD_WIDTH + 20;
  const CARD_HEIGHT = maxLeaves > 4 ? 70 : 80;
  const SIBLING_SPACING = maxLeaves > 4 ? 30 : 50;
  const LEAF_SPACING = CARD_WIDTH + SIBLING_SPACING;
  const LEVEL_SPACING = maxLeaves > 4 ? 90 : 110;
  const PADDING_X = 40;
  const PADDING_Y = 50;

  const treeWidth = maxLeaves > 0 ? (maxLeaves - 1) * LEAF_SPACING + CARD_WIDTH : 0;
  const treeTotalHeight = maxLeaves > 0 ? treeHeight * LEVEL_SPACING + CARD_HEIGHT : 0;

  const treeBoundingWidth = treeWidth + PADDING_X * 2;
  const treeBoundingHeight = treeTotalHeight + PADDING_Y * 2;

  const changeZoom = useCallback((delta: number) => {
    setZoom((prevZoom) => {
      const newZoom = Math.min(Math.max(prevZoom + delta, 0.25), 2.0);
      if (newZoom !== prevZoom && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const centerX = container.scrollLeft + container.clientWidth / 2;
        const centerY = container.scrollTop + container.clientHeight / 2;
        
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
             scrollContainerRef.current.scrollLeft = (centerX / prevZoom) * newZoom - container.clientWidth / 2;
             scrollContainerRef.current.scrollTop = (centerY / prevZoom) * newZoom - container.clientHeight / 2;
          }
        });
      }
      return newZoom;
    });
  }, []);

  const handleZoomIn = useCallback(() => changeZoom(0.15), [changeZoom]);
  const handleZoomOut = useCallback(() => changeZoom(-0.15), [changeZoom]);

  const handleFitToTree = useCallback(() => {
    if (maxLeaves === 0 || !scrollContainerRef.current) return;
    const { clientWidth, clientHeight } = scrollContainerRef.current;
    
    // Calculate available space minus padding
    const availableWidth = clientWidth - 48;
    const availableHeight = clientHeight - 48;

    const scaleX = availableWidth / treeBoundingWidth;
    const scaleY = availableHeight / treeBoundingHeight;

    const fitZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.25), 2.0);
    setZoom(fitZoom);
  }, [maxLeaves, treeBoundingWidth, treeBoundingHeight]);

  // Handle Fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (isFs) {
        setTimeout(() => handleFitToTree(), 100);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [handleFitToTree]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!isFullscreen) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else {
          setIsFullscreen(true);
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        } else {
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  // Auto-fit when tree structure changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitToTree();
    }, 50);
    return () => clearTimeout(timer);
  }, [maxLeaves, treeHeight, handleFitToTree]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Escape') {
        if (inspectNode && onCloseInspectNode) {
          e.preventDefault();
          e.stopPropagation();
          onCloseInspectNode();
          // Note: if browser is in native fullscreen, it might still exit fullscreen, 
          // which is standard browser security behavior.
        } else if (isFullscreen && !document.fullscreenElement) {
          setIsFullscreen(false);
        }
      } else if (e.key === '=' || e.key === '+') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleFitToTree();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleFitToTree, isFullscreen, inspectNode, onCloseInspectNode]);

  // Wheel zoom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (isFullscreen || e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        
        setZoom(prevZoom => {
          const newZoom = Math.min(Math.max(prevZoom + delta, 0.25), 2.0);
          if (newZoom !== prevZoom) {
             const rect = container.getBoundingClientRect();
             const mouseX = e.clientX - rect.left + container.scrollLeft;
             const mouseY = e.clientY - rect.top + container.scrollTop;

             requestAnimationFrame(() => {
                container.scrollLeft = (mouseX / prevZoom) * newZoom - (e.clientX - rect.left);
                container.scrollTop = (mouseY / prevZoom) * newZoom - (e.clientY - rect.top);
             });
          }
          return newZoom;
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [isFullscreen]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    if ((e.target as HTMLElement).closest('button, [role="button"]')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: scrollContainerRef.current?.scrollLeft || 0,
      scrollTop: scrollContainerRef.current?.scrollTop || 0,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    scrollContainerRef.current.scrollLeft = dragStart.scrollLeft - dx;
    scrollContainerRef.current.scrollTop = dragStart.scrollTop - dy;
  };

  const handleMouseUp = () => setIsDragging(false);

  let statusText = '';
  if (animStep.stage === 'building') {
    if (animStep.level === 0) statusText = 'Đang băm các giao dịch...';
    else if (animStep.level < treeHeight) statusText = 'Đang kết hợp các cặp băm...';
    else statusText = 'Đang tính toán Gốc Merkle...';
  } else if (animStep.stage === 'recalculating') {
    statusText = 'Đang tính toán lại đường dẫn...';
  } else if (animStep.stage === 'idle') {
    statusText = 'Chưa khởi tạo';
  } else if (animStep.stage === 'ready') {
    statusText = 'Hoàn tất';
  } else if (animStep.stage === 'tampered') {
    statusText = 'Phát hiện sửa đổi';
  }

  if (!levels || levels.length === 0 || !rootNode) {
    return (
      <div className="h-96 rounded-xl bg-[#0C0F14] border border-[#1C2430] flex flex-col items-center justify-center text-[#717B8C] font-sans text-sm space-y-3 p-8 shadow-sm">
        <p className="text-[#F2F4F7] font-medium">
          Chưa có giao dịch nào trong Cây Merkle.
        </p>
        <span className="text-[#717B8C]">
          Thêm giao dịch ở bảng bên trái để khởi tạo cây.
        </span>
      </div>
    );
  }

  // Calculate coordinates for every node in each level (Level 0 = bottom leaves, Level treeHeight = top root)
  const nodePositions: Record<string, { x: number; y: number; node: MerkleNode }> = {};

  const startX = PADDING_X + CARD_WIDTH / 2;

  // Level 0: Leaves
  if (levels.length > 0) {
    levels[0].forEach((node, idx) => {
      nodePositions[node.id] = {
        x: startX + idx * LEAF_SPACING,
        y: treeBoundingHeight - PADDING_Y - CARD_HEIGHT / 2,
        node,
      };
    });
  }

  // Level 1 to treeHeight: Parents
  for (let l = 1; l < levels.length; l++) {
    levels[l].forEach((node, pIdx) => {
      const leftChildIdx = pIdx * 2;
      const rightChildIdx = pIdx * 2 + 1;

      const leftChild = levels[l - 1][leftChildIdx];
      const rightChild = rightChildIdx < levels[l - 1].length ? levels[l - 1][rightChildIdx] : null;

      let x = 0;
      if (leftChild) {
        const leftX = nodePositions[leftChild.id]?.x || 0;
        if (rightChild) {
          const rightX = nodePositions[rightChild.id]?.x || 0;
          x = (leftX + rightX) / 2;
        } else {
          x = leftX;
        }
      }

      nodePositions[node.id] = {
        x,
        y: treeBoundingHeight - PADDING_Y - CARD_HEIGHT / 2 - l * LEVEL_SPACING,
        node,
      };
    });
  }

  // Calculate connecting lines between parents and their children
  const connections: {
    id: string;
    parentX: number;
    parentY: number;
    childX: number;
    childY: number;
    isTampered: boolean;
    isProofPath: boolean;
    isDuplicated: boolean;
    childNode: MerkleNode;
    parentNode: MerkleNode;
  }[] = [];

  for (let l = 1; l < levels.length; l++) {
    const parentLevel = levels[l];
    const childLevel = levels[l - 1];

    parentLevel.forEach((parentNode, pIdx) => {
      const parentPos = nodePositions[parentNode.id];
      if (!parentPos) return;

      const leftChildIdx = pIdx * 2;
      const rightChildIdx = pIdx * 2 + 1;

      // Left child
      if (leftChildIdx < childLevel.length) {
        const leftChild = childLevel[leftChildIdx];
        const childPos = nodePositions[leftChild.id];
        if (childPos) {
          connections.push({
            id: `conn-${parentNode.id}-${leftChild.id}`,
            parentX: parentPos.x,
            parentY: parentPos.y + CARD_HEIGHT / 2,
            childX: childPos.x,
            childY: childPos.y - CARD_HEIGHT / 2,
            isTampered: Boolean(parentNode.isTampered && leftChild.isTampered),
            isProofPath: Boolean(parentNode.isProofPath && leftChild.isProofPath),
            isDuplicated: false,
            childNode: leftChild,
            parentNode,
          });
        }
      }

      // Right child
      if (rightChildIdx < childLevel.length) {
        const rightChild = childLevel[rightChildIdx];
        const childPos = nodePositions[rightChild.id];
        if (childPos) {
          connections.push({
            id: `conn-${parentNode.id}-${rightChild.id}`,
            parentX: parentPos.x,
            parentY: parentPos.y + CARD_HEIGHT / 2,
            childX: childPos.x,
            childY: childPos.y - CARD_HEIGHT / 2,
            isTampered: Boolean(parentNode.isTampered && rightChild.isTampered),
            isProofPath: Boolean(parentNode.isProofPath && rightChild.isProofPath),
            isDuplicated: Boolean(rightChild.isDuplicated),
            childNode: rightChild,
            parentNode,
          });
        }
      } else if (leftChildIdx < childLevel.length) {
        // Odd duplicate right child
        const leftChild = childLevel[leftChildIdx];
        const childPos = nodePositions[leftChild.id];
        if (childPos) {
          connections.push({
            id: `conn-${parentNode.id}-dup`,
            parentX: parentPos.x,
            parentY: parentPos.y + CARD_HEIGHT / 2,
            childX: childPos.x,
            childY: childPos.y - CARD_HEIGHT / 2,
            isTampered: Boolean(parentNode.isTampered && leftChild.isTampered),
            isProofPath: Boolean(parentNode.isProofPath && leftChild.isProofPath),
            isDuplicated: true,
            childNode: leftChild,
            parentNode,
          });
        }
      }
    });
  }

  const getOldNode = (id: string): MerkleNode | undefined => {
    if (!prevTreeData) return undefined;
    for (const level of prevTreeData.levels) {
      const found = level.find(n => n.id === id);
      if (found) return found;
    }
    return undefined;
  };

  const nodeVisuals = useMemo(() => {
    const visuals: Record<string, { state: 'idle' | 'processing' | 'valid' | 'tampered', hash: string }> = {};
    
    levels.forEach((levelNodes) => {
      levelNodes.forEach(node => {
        let vState: 'idle' | 'processing' | 'valid' | 'tampered' = 'idle';
        let dHash = '';
        
        const oldNode = getOldNode(node.id);
        const isTamperedPath = node.isTampered || (oldNode?.isTampered);
        
        if (animStep.stage === 'idle') {
          vState = 'idle';
          dHash = '';
        } else if (animStep.stage === 'ready') {
          vState = 'valid';
          dHash = node.hash;
        } else if (animStep.stage === 'tampered') {
          vState = node.isTampered ? 'tampered' : 'valid';
          dHash = node.hash;
        } else if (animStep.stage === 'building') {
          if (node.level < animStep.level) {
            vState = 'valid';
            dHash = node.hash;
          } else if (node.level === animStep.level) {
            if (animStep.subStage === 'computing') {
              vState = 'processing';
              dHash = 'Computing...';
            } else {
              vState = 'valid';
              dHash = node.hash;
            }
          } else {
            vState = 'idle';
            dHash = '';
          }
        } else if (animStep.stage === 'recalculating') {
          if (!isTamperedPath) {
            vState = 'valid';
            dHash = node.hash;
          } else {
            if (node.level < animStep.level) {
              vState = node.isTampered ? 'tampered' : 'valid';
              dHash = node.hash;
            } else if (node.level === animStep.level) {
              if (animStep.subStage === 'computing') {
                vState = 'processing';
                dHash = 'Computing...';
              } else {
                vState = node.isTampered ? 'tampered' : 'valid';
                dHash = node.hash;
              }
            } else {
              vState = oldNode?.isTampered ? 'tampered' : 'valid';
              dHash = oldNode?.hash || node.hash;
            }
          }
        }
        
        visuals[node.id] = { state: vState, hash: dHash };
      });
    });
    return visuals;
  }, [levels, animStep, prevTreeData]);

  const edgeVisuals = useMemo(() => {
    const visuals: Record<string, { isFlowing: boolean, strokeState: 'default' | 'valid' | 'tampered' }> = {};
    
    connections.forEach(conn => {
      let strokeState: 'default' | 'valid' | 'tampered' = 'default';
      let isFlowing = false;
      
      const childOld = getOldNode(conn.childNode.id);
      const parentOld = getOldNode(conn.parentNode.id);
      
      const isTamperedEdgeNow = conn.childNode.isTampered && conn.parentNode.isTampered;
      const isTamperedEdgeOld = childOld?.isTampered && parentOld?.isTampered;
      const isTargetEdge = isTamperedEdgeNow || isTamperedEdgeOld;
      
      if (animStep.stage === 'idle') {
        strokeState = 'default';
      } else if (animStep.stage === 'ready') {
        strokeState = 'valid';
      } else if (animStep.stage === 'tampered') {
        strokeState = isTamperedEdgeNow ? 'tampered' : 'valid';
      } else if (animStep.stage === 'building') {
        if (conn.childNode.level < animStep.level) {
          strokeState = 'valid';
        } else if (conn.childNode.level === animStep.level && animStep.subStage === 'flowing') {
          strokeState = 'valid';
          isFlowing = true;
        } else {
          strokeState = 'default';
        }
      } else if (animStep.stage === 'recalculating') {
        if (!isTargetEdge) {
          strokeState = 'valid';
        } else {
          if (conn.childNode.level < animStep.level) {
            strokeState = isTamperedEdgeNow ? 'tampered' : 'valid';
          } else if (conn.childNode.level === animStep.level && animStep.subStage === 'flowing') {
            strokeState = isTamperedEdgeNow ? 'tampered' : 'valid';
            isFlowing = true;
          } else {
            strokeState = isTamperedEdgeOld ? 'tampered' : 'valid';
          }
        }
      }
      
      if (conn.childNode.isProofPath && conn.parentNode.isProofPath && animStep.stage !== 'recalculating' && animStep.stage !== 'building') {
         strokeState = 'valid';
      }
      
      visuals[conn.id] = { strokeState, isFlowing };
    });
    return visuals;
  }, [connections, animStep, prevTreeData]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-[#0B0E12] flex flex-col font-sans ${
        isFullscreen ? 'fixed inset-0 z-[100] p-4 sm:p-6 border-none' : 'rounded-xl border border-[#1C2430] shadow-sm p-4 sm:p-5'
      }`}
      style={isFullscreen ? { width: '100vw', height: '100vh', maxWidth: 'none', borderRadius: 0 } : {}}
    >
      {/* Header Row: Title & Zoom Controls on the SAME row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1C2430] mb-3">
        {/* Title and subtle status */}
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-[#F2F4F7] font-sans tracking-tight">
            Cây Merkle
          </h3>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-medium border ${
              animStep.stage === 'tampered' || animStep.stage === 'recalculating'
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : animStep.stage === 'building'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : animStep.stage === 'idle'
                ? 'bg-[#1C2430]/40 text-[#A5AFBF] border-[#1C2430]'
                : 'bg-teach-1/10 text-teach-1 border border-teach-1/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                animStep.stage === 'tampered'
                  ? 'bg-rose-500'
                  : animStep.stage === 'building' || animStep.stage === 'recalculating'
                  ? 'bg-amber-400 animate-pulse'
                  : animStep.stage === 'idle'
                  ? 'bg-[#717B8C]'
                  : 'bg-teach-1'
              }`}
            />
            <span>{statusText}</span>
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-[#090A0F] p-0.5 rounded-lg border border-[#1C2430] text-xs">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded text-[#717B8C] hover:text-[#F2F4F7] hover:bg-[#11161E] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Thu nhỏ"
            aria-label="Thu nhỏ"
            disabled={zoom <= 0.4}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 text-[11px] font-mono text-[#A5AFBF] min-w-[48px] text-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded text-[#717B8C] hover:text-[#F2F4F7] hover:bg-[#11161E] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Phóng to"
            aria-label="Phóng to"
            disabled={zoom >= 1.6}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-[#1C2430] mx-0.5" />
          <button
            type="button"
            onClick={handleFitToTree}
            className="p-1.5 rounded text-[#717B8C] hover:text-[#F2F4F7] hover:bg-[#11161E] transition-colors cursor-pointer"
            title="Vừa khung"
            aria-label="Vừa khung"
          >
            <Focus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded text-[#717B8C] hover:text-[#F2F4F7] hover:bg-[#11161E] transition-colors cursor-pointer ml-1"
            title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Odd Count Notification banner if duplicated nodes exist */}
      {levels.some((lvl) => lvl.some((n) => n.isDuplicated)) && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-sans flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Số nút lẻ: Nút lá cuối cùng được sao chép để tạo cặp băm hợp lệ theo chuẩn Bitcoin.
          </span>
        </div>
      )}

      {/* Scrollable Graph Area (Pan / Zoom without page horizontal scroll) */}
      <div 
        ref={scrollContainerRef}
        className={`relative flex-1 w-full overflow-auto rounded-lg bg-[#090A0F] border border-[#1C2430] custom-scrollbar ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={isFullscreen ? {} : { minHeight: '400px', maxHeight: '620px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="flex min-w-full min-h-full"
          style={{ padding: '24px', width: 'fit-content', height: 'fit-content' }}
        >
          <div
            style={{
              width: `${treeBoundingWidth * zoom}px`,
              height: `${treeBoundingHeight * zoom}px`,
              position: 'relative',
              margin: 'auto',
            }}
          >
            <div
              style={{
                width: `${treeBoundingWidth}px`,
                height: `${treeBoundingHeight}px`,
                transformOrigin: 'top left',
                transform: `scale(${zoom})`,
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              {/* SVG Connection Layer */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width={treeBoundingWidth}
                height={treeBoundingHeight}
                style={{ width: '100%', height: '100%' }}
              >
                {connections.map((conn) => {
                  const midY = (conn.parentY + conn.childY) / 2;
                  // Reverse the path to go from child (bottom) to parent (top) so animateMotion flows upwards
                  const pathD = `M ${conn.childX} ${conn.childY} C ${conn.childX} ${midY}, ${conn.parentX} ${midY}, ${conn.parentX} ${conn.parentY}`;

                  const v = edgeVisuals[conn.id];
                  let stroke = '#1C2430'; 
                  let strokeWidth = 1.5;
                  let strokeDasharray = conn.isDuplicated ? '3 3' : undefined;

                  if (v.strokeState === 'tampered') {
                    stroke = 'rgba(244, 63, 94, 0.6)'; // subtle red/pink accent
                    strokeWidth = 2;
                  } else if (v.strokeState === 'valid') {
                    // Once propagation completes, connection lines return to normal static state
                    stroke = '#1C2430';
                    strokeWidth = 1.5;
                  }

                  // If it's flowing, we can subtly highlight the path itself if desired, or just rely on the circle
                  if (v.isFlowing && v.strokeState === 'valid') {
                    stroke = 'rgba(56, 189, 248, 0.4)'; // subtle teach-1 sky blue trail while flowing
                  }
                  if (v.isFlowing && v.strokeState === 'tampered') {
                    stroke = 'rgba(244, 63, 94, 0.8)'; 
                  }

                  return (
                    <g key={conn.id}>
                      <path
                        id={conn.id}
                        d={pathD}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                        className="transition-colors duration-300 ease-in-out"
                      />
                      {v.isFlowing && (
                        <circle r="4" fill={v.strokeState === 'tampered' ? '#f43f5e' : 'var(--teach-1)'}>
                          <animateMotion dur="0.3s" repeatCount="1" fill="freeze" keyTimes="0;1" calcMode="linear">
                            <mpath href={`#${conn.id}`} />
                          </animateMotion>
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* HTML Nodes Overlay Layer */}
              {Object.entries(nodePositions).map(([nodeId, pos]) => {
                const isRootNode = pos.node.level === treeHeight;
                const isSelected = Boolean(pos.node.transactionId && selectedTxId === pos.node.transactionId);
                const v = nodeVisuals[nodeId];

                return (
                  <div
                    key={nodeId}
                    className="absolute transition-all duration-150 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      width: isRootNode ? `${ROOT_WIDTH}px` : `${CARD_WIDTH}px`,
                      height: `${CARD_HEIGHT}px`,
                      zIndex: isRootNode ? 10 : 1
                    }}
                  >
                    <MerkleNodeCard
                      node={pos.node}
                      visualState={v.state}
                      displayHash={v.hash}
                      isTechnicalMode={isTechnicalMode}
                      onInspect={onInspectNode}
                      isRoot={isRootNode}
                      isSelected={isSelected}
                      onSelectLeaf={onSelectTx}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Legend */}
      {!isFullscreen ? (
        <div className="mt-3 pt-2.5 border-t border-[#1C2430] flex flex-wrap items-center justify-between gap-3 text-[11px] font-sans text-[#A5AFBF]">
          <span className="font-sans text-[#717B8C] text-[11px]">
            Nhấp vào nút để xem chi tiết
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[#F2F4F7]">Hợp lệ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[#F2F4F7]">Sửa đổi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teach-1" />
              <span className="text-[#F2F4F7]">Mục tiêu chứng minh</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teach-2" />
              <span className="text-[#F2F4F7]">Nút anh em</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[#F2F4F7]">Gốc Merkle</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-[#1C2430] text-center text-[11px] font-sans text-[#717B8C]">
          Kéo để di chuyển · Cuộn để zoom · Fit để xem toàn bộ · ESC để thoát
        </div>
      )}

      {inspectNode && onCloseInspectNode && (
        <NodeDetailModal
          node={inspectNode}
          onClose={onCloseInspectNode}
        />
      )}
    </div>
  );
};
