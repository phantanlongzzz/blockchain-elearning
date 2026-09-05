import React, { useState, useRef, useEffect } from 'react';
import { Search, RotateCcw, ArrowRight, Play, Trash2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { LinkedListNodeItem } from '../../types';
import {
  INITIAL_LINKED_LIST_NODES,
  PYTHON_NODE_CLASS_CODE,
} from '../../data/foundationsData';
import { CodeViewer } from '../common/CodeViewer';

interface LinkedListPlaygroundProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
}

export const LinkedListPlayground: React.FC<LinkedListPlaygroundProps> = ({
  onInteracted,
  onNextStage,
}) => {
  const { strings, language } = useLanguage();
  const [nodes, setNodes] = useState<LinkedListNodeItem[]>(INITIAL_LINKED_LIST_NODES);
  const [inputData, setInputData] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    index: number;
    searched: boolean;
  }>({ found: false, index: -1, searched: false });
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearchIdx, setCurrentSearchIdx] = useState<number | null>(null);
  const searchIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
        searchIntervalRef.current = null;
      }
    };
  }, []);

  // Progressive disclosure mode: 'visual' | 'sushi' | 'code'
  const [viewMode, setViewMode] = useState<'visual' | 'sushi' | 'code'>('visual');

  // Insert at beginning (HEAD insertion)
  const handleInsertBeginning = () => {
    if (!inputData.trim()) return;
    const newNodeId = `node-${Date.now()}`;
    const newHeadNode: LinkedListNodeItem = {
      id: newNodeId,
      data: inputData.trim(),
      nextId: nodes.length > 0 ? nodes[0].id : null,
    };
    setNodes([newHeadNode, ...nodes]);
    setInputData('');
    setSearchResult({ found: false, index: -1, searched: false });
    onInteracted?.();
  };

  // Insert at end (TAIL insertion)
  const handleInsertEnd = () => {
    if (!inputData.trim()) return;
    const newNodeId = `node-${Date.now()}`;
    const newTailNode: LinkedListNodeItem = {
      id: newNodeId,
      data: inputData.trim(),
      nextId: null,
    };

    if (nodes.length === 0) {
      setNodes([newTailNode]);
    } else {
      const updated = nodes.map((node, idx) =>
        idx === nodes.length - 1 ? { ...node, nextId: newNodeId } : node
      );
      setNodes([...updated, newTailNode]);
    }
    setInputData('');
    setSearchResult({ found: false, index: -1, searched: false });
    onInteracted?.();
  };

  // Delete specific node
  const handleDeleteNode = (idxToDelete: number) => {
    if (nodes.length <= 1) {
      setNodes([]);
      return;
    }

    const nextIdForPrev = idxToDelete < nodes.length - 1 ? nodes[idxToDelete + 1].id : null;
    const newNodes = nodes
      .filter((_, idx) => idx !== idxToDelete)
      .map((node, idx) => {
        if (idx === idxToDelete - 1) {
          return { ...node, nextId: nextIdForPrev };
        }
        return node;
      });

    setNodes(newNodes);
    onInteracted?.();
  };

  // Load sushi recipe example: assemble -> prepare -> roll -> NULL
  const handleLoadSushiExample = () => {
    const sushiNodes: LinkedListNodeItem[] = [
      { id: 'sushi-1', data: 'assemble', nextId: 'sushi-2' },
      { id: 'sushi-2', data: 'prepare', nextId: 'sushi-3' },
      { id: 'sushi-3', data: 'roll', nextId: null },
    ];
    setNodes(sushiNodes);
    setSearchResult({ found: false, index: -1, searched: false });
    onInteracted?.();
  };

  // Step-by-step search simulation
  const handleSearch = () => {
    if (!searchTarget.trim() || nodes.length === 0) return;
    if (searchIntervalRef.current) clearInterval(searchIntervalRef.current);
    setIsSearching(true);
    setSearchResult({ searched: false, found: false, index: -1 });

    let idx = 0;
    searchIntervalRef.current = window.setInterval(() => {
      if (idx < nodes.length) {
        setCurrentSearchIdx(idx);
        if (nodes[idx].data.toLowerCase() === searchTarget.trim().toLowerCase()) {
          if (searchIntervalRef.current) {
            clearInterval(searchIntervalRef.current);
            searchIntervalRef.current = null;
          }
          setIsSearching(false);
          setSearchResult({ found: true, index: idx, searched: true });
          onInteracted?.();
          return;
        }
        idx++;
      } else {
        if (searchIntervalRef.current) {
          clearInterval(searchIntervalRef.current);
          searchIntervalRef.current = null;
        }
        setIsSearching(false);
        setSearchResult({ found: false, index: -1, searched: true });
        setCurrentSearchIdx(null);
        onInteracted?.();
      }
    }, 450);
  };

  const handleReset = () => {
    if (searchIntervalRef.current) {
      clearInterval(searchIntervalRef.current);
      searchIntervalRef.current = null;
    }
    setNodes(INITIAL_LINKED_LIST_NODES);
    setInputData('');
    setSearchTarget('');
    setSearchResult({ found: false, index: -1, searched: false });
    setCurrentSearchIdx(null);
    setIsSearching(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Section */}
      <div className="bg-[#0B0F19]/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
        <div className="space-y-1">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            {language === 'vi' ? 'Giai đoạn 02 · Cấu trúc danh sách' : 'Stage 02 · Linked Data Structure'}
          </div>
          <h3 className="text-base sm:text-lg font-sans font-bold text-white">
            {language === 'vi'
              ? 'Danh sách liên kết'
              : 'Linked List Data Structure'}
          </h3>
          <p className="text-xs font-sans text-slate-400 leading-relaxed max-w-2xl">
            {language === 'vi'
              ? 'Khảo sát tính phân tán ô nhớ RAM và cơ chế liên kết tuyến tính qua con trỏ NEXT.'
              : 'Examine dispersed RAM addresses and linear reference chaining via NEXT pointers.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleLoadSushiExample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/30 hover:text-white transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'vi' ? 'Chạy Quy Trình Mẫu' : 'Run Sample Pipeline'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/30 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'vi' ? 'Đặt Lại' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.08] pb-2">
        <button
          type="button"
          onClick={() => setViewMode('visual')}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${
            viewMode === 'visual'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-[0_0_12px_rgba(0,210,255,0.15)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
          }`}
        >
          {language === 'vi' ? '1. Mô phỏng Node & Con trỏ' : '1. Node & Pointer Simulator'}
        </button>

        <button
          type="button"
          onClick={() => setViewMode('sushi')}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${
            viewMode === 'sushi'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-[0_0_12px_rgba(0,210,255,0.15)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
          }`}
        >
          {language === 'vi' ? '2. Quy trình mẫu' : '2. Sample Pipeline'}
        </button>

        <button
          type="button"
          onClick={() => setViewMode('code')}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${
            viewMode === 'code'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-[0_0_12px_rgba(0,210,255,0.15)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
          }`}
        >
          {language === 'vi' ? '3. Code Node Class' : '3. Node Class Code'}
        </button>
      </div>

      {/* Mode 1: Visual Interactive Linked List (Outer Card Wrapper) */}
      {viewMode === 'visual' && (
        <div className="p-6 rounded-2xl bg-[#0B0F19]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-4">
          {/* Action Toolbar */}
          <div className="bg-[#070B14]/80 border border-white/[0.06] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 mb-4">
            {/* Insertion controls */}
            <div className="flex-1 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder={strings.foundations.pythonList.valuePlaceholder}
                className="bg-black/50 border border-white/[0.08] focus:border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 outline-none w-48 placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={handleInsertBeginning}
                className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-sans font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {strings.foundations.linkedList.insertBeginning}
              </button>
              <button
                type="button"
                onClick={handleInsertEnd}
                className="bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:text-white text-xs font-sans px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {strings.foundations.linkedList.insertEnd}
              </button>
            </div>

            {/* Search controls */}
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value)}
                placeholder={strings.foundations.linkedList.searchValue}
                className="bg-black/50 border border-white/[0.08] focus:border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 outline-none w-36 placeholder:text-slate-600"
              />
              <button
                type="button"
                disabled={isSearching}
                onClick={handleSearch}
                className="bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:border-cyan-500/30 hover:text-white disabled:opacity-50 text-xs font-sans px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>{strings.foundations.linkedList.search}</span>
              </button>
            </div>
          </div>

          {/* Search Result Feedback */}
          {searchResult.searched && (
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs font-mono flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${searchResult.found ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.8)]' : 'bg-rose-400'}`}></span>
              <span className={searchResult.found ? 'text-cyan-300' : 'text-rose-400'}>
                {searchResult.found
                  ? language === 'vi'
                    ? `Tìm thấy "${searchTarget}" tại Nút #${searchResult.index}`
                    : `Found "${searchTarget}" at Node #${searchResult.index}`
                  : language === 'vi'
                  ? `Không tìm thấy "${searchTarget}" trong danh sách liên kết`
                  : `Target "${searchTarget}" not found in linked list`}
              </span>
            </div>
          )}

          {/* Layer 2: Struct Inspector Canvas */}
          <div className="bg-black/35 backdrop-blur-md border border-white/[0.05] rounded-xl p-6 relative overflow-x-auto bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] min-h-[190px] flex items-center">
            {nodes.length === 0 ? (
              <div className="w-full text-center text-xs font-mono text-slate-500 py-6">
                HEAD = NULL (Danh sách rỗng)
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full pb-2">
                {/* HEAD Register Pointer */}
                <div className="bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 rounded-lg px-3 py-2 text-xs font-mono flex flex-col items-center justify-center gap-1 shadow-[0_0_12px_rgba(0,210,255,0.1)] shrink-0 mr-2">
                  <span className="text-[10px] font-semibold tracking-wider uppercase">HEAD</span>
                  <div className="w-4 h-[2px] bg-cyan-400 my-0.5 shadow-[0_0_6px_rgba(0,210,255,0.6)]" />
                  <span className="text-[10px] text-cyan-300 font-mono">→ [0]</span>
                </div>

                {/* Layer 3: Struct 2-Compartment Nodes */}
                {nodes.map((node, idx) => {
                  const isHead = idx === 0;
                  const isTail = idx === nodes.length - 1;
                  const isCurrentInSearch = currentSearchIdx === idx;
                  const isFoundNode = searchResult.found && searchResult.index === idx;
                  const hexAddr = `0x${((idx + 1) * 2048).toString(16).toUpperCase()}`;
                  const nextHexAddr = node.nextId ? `0x${((idx + 2) * 2048).toString(16).toUpperCase()}` : 'NULL';

                  return (
                    <React.Fragment key={node.id}>
                      <div className="flex flex-col items-center shrink-0">
                        {/* Struct Node Card */}
                        <div
                          className={`bg-[#0B101E]/85 backdrop-blur-md border rounded-xl p-3.5 min-w-[200px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all ${
                            isFoundNode
                              ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_24px_rgba(0,210,255,0.3)]'
                              : isCurrentInSearch
                              ? 'border-amber-400 ring-1 ring-amber-400/30 shadow-[0_0_16px_rgba(251,191,36,0.2)]'
                              : 'border-white/[0.08] hover:border-cyan-500/30'
                          }`}
                        >
                          {/* Header Meta: Index & Address */}
                          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pb-2 border-b border-white/[0.06] mb-2">
                            <span className="font-semibold text-slate-200">
                              #{idx} {isHead ? '· HEAD' : isTail ? '· TAIL' : '· NODE'}
                            </span>
                            <span className="text-slate-500 font-mono">Addr: {hexAddr}</span>
                          </div>

                          {/* Data Compartment */}
                          <div className="mb-2">
                            <span className="text-[9px] font-sans text-slate-500 uppercase font-medium block">
                              DATA
                            </span>
                            <div className="bg-black/40 border border-white/[0.05] rounded px-2 py-1.5 font-mono text-xs text-cyan-300 font-semibold text-center my-1 truncate">
                              &quot;{node.data}&quot;
                            </div>
                          </div>

                          {/* Next Pointer Compartment */}
                          <div className="pt-1.5 border-t border-white/[0.06]">
                            <span className="text-[9px] font-sans text-slate-500 uppercase font-medium block mb-1">
                              NEXT
                            </span>
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded px-2 py-1 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                              <span className={nextHexAddr === 'NULL' ? 'text-slate-500 font-semibold' : 'text-cyan-400'}>
                                {nextHexAddr}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteNode(idx)}
                                className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer p-0.5"
                                title="Xóa Node này"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pointer Connector */}
                      {idx < nodes.length - 1 ? (
                        <div className="flex flex-col items-center justify-center px-2 gap-1 shrink-0">
                          <span className="text-[9px] font-mono text-cyan-400/80">.next</span>
                          <div className="w-8 h-[2px] bg-gradient-to-r from-cyan-500/40 to-cyan-400 shadow-[0_0_6px_rgba(0,210,255,0.3)] relative flex items-center justify-end">
                            <ArrowRight className="w-3 h-3 text-cyan-400 -mr-1" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center pl-2 shrink-0">
                          <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-dashed border-white/[0.15] text-slate-400 font-mono text-xs flex items-center justify-center">
                            <span>NULL (Ground)</span>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Sushi Recipe Step */}
      {viewMode === 'sushi' && (
        <div className="p-6 rounded-2xl bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-sans font-semibold text-slate-100">
              {language === 'vi'
                ? 'Ví dụ quy trình thực hiện các bước'
                : 'Curriculum Step Pipeline'}
            </div>

            <button
              type="button"
              onClick={handleLoadSushiExample}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] hover:border-cyan-500/30 text-xs font-sans font-medium transition-colors cursor-pointer"
            >
              {language === 'vi' ? 'Nạp lại chuỗi mẫu' : 'Reload sample chain'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-[#0E1424]/85 backdrop-blur-md border border-cyan-500/20 space-y-1.5">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block font-medium">
                BƯỚC 1 · HEAD
              </span>
              <div className="font-mono text-xs font-medium text-cyan-300">&quot;assemble&quot;</div>
              <p className="text-xs font-sans text-slate-400">
                {language === 'vi'
                  ? 'Nút đầu tiên trong danh sách liên kết.'
                  : 'The head node inserted at the front.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1424]/85 backdrop-blur-md border border-cyan-500/20 space-y-1.5">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block font-medium">
                BƯỚC 2 · MIDDLE
              </span>
              <div className="font-mono text-xs font-medium text-cyan-300">&quot;prepare&quot;</div>
              <p className="text-xs font-sans text-slate-400">
                {language === 'vi'
                  ? 'Nút kế tiếp được trỏ bởi assemble.'
                  : 'Next node referenced by assemble.next.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1424]/85 backdrop-blur-md border border-cyan-500/20 space-y-1.5">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block font-medium">
                BƯỚC 3 · TAIL
              </span>
              <div className="font-mono text-xs font-medium text-cyan-300">&quot;roll&quot; → NULL</div>
              <p className="text-xs font-sans text-slate-400">
                {language === 'vi'
                  ? 'Nút cuối cùng trỏ tới con trỏ rỗng NULL.'
                  : 'The tail node pointing to NULL.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Python Code View */}
      {viewMode === 'code' && (
        <div className="p-6 rounded-2xl bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] space-y-3">
          <div className="flex items-center justify-between text-xs font-sans text-slate-400">
            <span className="font-medium text-slate-200">
              {language === 'vi' ? 'Lớp Node & LinkedList trong Python' : 'Node & LinkedList Classes'}
            </span>
            <span className="text-slate-500 font-mono">Python 3.12</span>
          </div>

          <CodeViewer
            code={PYTHON_NODE_CLASS_CODE}
            language="python"
            filename="linked_list_nodes.py"
            maxHeight="360px"
          />
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 mt-6 border-t border-white/[0.06] gap-3">
        <span className="text-xs font-sans text-slate-400">
          {language === 'vi'
            ? 'Tiếp theo: Quan sát sự chuyển đổi từ con trỏ RAM sang Con trỏ băm (Hash Pointer)'
            : 'Next: Observe transition from RAM pointers to Hash Pointers'}
        </span>
        <button
          type="button"
          onClick={onNextStage}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(0,210,255,0.25)] transition-all cursor-pointer"
        >
          <span>
            {language === 'vi'
              ? 'Tiếp tục: Con trỏ Hash →'
              : 'Continue: Hash Pointer →'}
          </span>
        </button>
      </div>
    </div>
  );
};

