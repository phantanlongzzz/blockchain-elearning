import React, { useState, useRef, useEffect } from 'react';
import { Search, RotateCcw, ArrowRight, Play, Trash2, Loader2 } from 'lucide-react';
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

  // Real-time traversal & workflow simulation state
  const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);
  const [activeActionBtn, setActiveActionBtn] = useState<'insertBeginning' | 'insertEnd' | 'search' | null>(null);
  const [highlightedInput, setHighlightedInput] = useState<'data' | 'search' | null>(null);
  const [newlyAddedNodeId, setNewlyAddedNodeId] = useState<string | null>(null);
  const [simStatus, setSimStatus] = useState<string>('');
  const [searchResultModal, setSearchResultModal] = useState<{
    open: boolean;
    data: {
      value: string;
      position: string;
      address: string;
      steps: number;
    };
  } | null>(null);
  const simTimeoutsRef = useRef<number[]>([]);
  const workflowRunIdRef = useRef<number>(0);

  const clearSimTimeouts = () => {
    simTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    simTimeoutsRef.current = [];
  };

  const wait = (ms: number) => new Promise<void>((resolve) => {
    const timerId = window.setTimeout(resolve, ms);
    simTimeoutsRef.current.push(timerId);
  });

  useEffect(() => {
    return () => {
      workflowRunIdRef.current += 1;
      clearSimTimeouts();
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

  // Automated E2E Workflow Demonstration with Slow-Motion Timeline
  const handleRunWorkflow = async () => {
    // Increment run ID to cancel previous running workflows
    workflowRunIdRef.current += 1;
    const currentRunId = workflowRunIdRef.current;
    const isAborted = () => workflowRunIdRef.current !== currentRunId;

    clearSimTimeouts();
    if (searchIntervalRef.current) {
      clearInterval(searchIntervalRef.current);
      searchIntervalRef.current = null;
      setIsSearching(false);
      setCurrentSearchIdx(null);
    }
    setSearchResultModal(null);
    setSearchResult({ found: false, index: -1, searched: false });
    setActiveNodeIndex(null);
    setNewlyAddedNodeId(null);
    setActiveActionBtn(null);
    setHighlightedInput(null);
    setViewMode('visual');

    // 1. Khởi động (0.0s): Khóa nút bấm
    setIsAutomating(true);
    setSimStatus(
      language === 'vi'
        ? 'Khởi động quy trình tự động hóa E2E...'
        : 'Starting automated E2E workflow...'
    );
    onInteracted?.();

    await wait(600);
    if (isAborted()) return;

    // 2. Điền giá trị mới (0.6s):
    const sampleWords = ['consensus', 'mempool', 'witness', 'nonce'];
    const chosenWord = sampleWords[Math.floor(Math.random() * sampleWords.length)];

    let currentNodes = [...nodes];
    if (currentNodes.length === 0) {
      currentNodes = [...INITIAL_LINKED_LIST_NODES];
      setNodes(currentNodes);
    }

    setInputData(chosenWord);
    setHighlightedInput('data');
    setSimStatus(
      language === 'vi'
        ? `Tự động điền giá trị "${chosenWord}" vào ô nhập liệu...`
        : `Auto-populating "${chosenWord}" into input field...`
    );

    await wait(1200);
    if (isAborted()) return;

    // 3. Giả lập bấm nút Chèn (1.8s):
    const isInsertHead = Math.random() >= 0.5;
    setActiveActionBtn(isInsertHead ? 'insertBeginning' : 'insertEnd');
    setSimStatus(
      language === 'vi'
        ? isInsertHead
          ? 'Giả lập bấm nút: Chèn Đầu (HEAD)...'
          : 'Giả lập bấm nút: Chèn Cuối (TAIL)...'
        : isInsertHead
        ? 'Simulating button click: Insert at Beginning (HEAD)...'
        : 'Simulating button click: Insert at End (TAIL)...'
    );

    await wait(800);
    if (isAborted()) return;

    setActiveActionBtn(null);
    setHighlightedInput(null);

    // 4. Chèn Node vào danh sách (2.6s):
    const newNodeId = `node-${Date.now()}`;
    if (isInsertHead) {
      const newHeadNode: LinkedListNodeItem = {
        id: newNodeId,
        data: chosenWord,
        nextId: currentNodes.length > 0 ? currentNodes[0].id : null,
      };
      currentNodes = [newHeadNode, ...currentNodes];
      setSimStatus(
        language === 'vi'
          ? `Đã tạo Node mới "${chosenWord}" tại HEAD, trỏ .next vào Node cũ`
          : `Created new Node "${chosenWord}" at HEAD, pointing .next to previous HEAD`
      );
    } else {
      const newTailNode: LinkedListNodeItem = {
        id: newNodeId,
        data: chosenWord,
        nextId: null,
      };
      if (currentNodes.length === 0) {
        currentNodes = [newTailNode];
      } else {
        const updated = currentNodes.map((n, idx) =>
          idx === currentNodes.length - 1 ? { ...n, nextId: newNodeId } : n
        );
        currentNodes = [...updated, newTailNode];
      }
      setSimStatus(
        language === 'vi'
          ? `Đã tạo Node mới "${chosenWord}" tại TAIL, cập nhật con trỏ .next`
          : `Created new Node "${chosenWord}" at TAIL, updated .next pointer`
      );
    }

    setNodes(currentNodes);
    setNewlyAddedNodeId(newNodeId);
    setInputData('');

    await wait(1500);
    if (isAborted()) return;

    // 5. Điền giá trị cần tìm (4.1s):
    setSearchTarget(chosenWord);
    setHighlightedInput('search');
    setSimStatus(
      language === 'vi'
        ? `Điền giá trị tìm kiếm mục tiêu: "${chosenWord}"`
        : `Setting target search value: "${chosenWord}"`
    );

    await wait(600);
    if (isAborted()) return;

    setActiveActionBtn('search');
    setSimStatus(
      language === 'vi'
        ? 'Giả lập bấm nút: Tìm Kiếm...'
        : 'Simulating button click: Search...'
    );

    await wait(1000);
    if (isAborted()) return;

    setActiveActionBtn(null);
    setHighlightedInput(null);

    // 6. Dò tìm tuần tự từng Node (5.1s – 7.0s):
    setIsSearching(true);
    const targetIdx = currentNodes.findIndex(
      (n) => n.data.toLowerCase() === chosenWord.toLowerCase()
    );
    const maxStep = targetIdx >= 0 ? targetIdx : 0;

    for (let s = 0; s <= maxStep; s++) {
      setActiveNodeIndex(s);
      setCurrentSearchIdx(s);
      const hexAddr = `0x${((s + 1) * 2048).toString(16).toUpperCase()}`;
      setSimStatus(
        language === 'vi'
          ? `Đang duyệt tuyến tính qua Node #${s} (Địa chỉ ${hexAddr})...`
          : `Linearly traversing Node #${s} (Addr ${hexAddr})...`
      );

      await wait(900);
      if (isAborted()) return;
    }

    // Giữ viền sáng khi tìm thấy Node mục tiêu
    setSearchResult({
      found: true,
      index: maxStep,
      searched: true,
    });
    setSimStatus(
      language === 'vi'
        ? `Đã tìm thấy "${chosenWord}" tại Node #${maxStep}!`
        : `Found "${chosenWord}" at Node #${maxStep}!`
    );

    await wait(1000);
    if (isAborted()) return;

    // 7. Hiển thị Modal kết quả (Sau ~7.5s):
    setIsSearching(false);
    const totalSteps = maxStep + 1;
    const hexAddr = `0x${((maxStep + 1) * 2048).toString(16).toUpperCase()}`;
    const posLabel =
      maxStep === 0
        ? 'HEAD (Vị trí 0)'
        : maxStep === currentNodes.length - 1
        ? `TAIL (Vị trí ${maxStep})`
        : `Vị trí #${maxStep}`;

    setCurrentSearchIdx(null);
    setActiveNodeIndex(null);
    setNewlyAddedNodeId(null);

    setSearchResultModal({
      open: true,
      data: {
        value: chosenWord,
        position: posLabel,
        address: hexAddr,
        steps: totalSteps,
      },
    });

    setIsAutomating(false);
    setSimStatus(
      language === 'vi'
        ? `Hoàn tất kịch bản: Đã tìm thấy "${chosenWord}" tại ô nhớ ${hexAddr}`
        : `Workflow complete: Found "${chosenWord}" at memory ${hexAddr}`
    );
  };

  // Step-by-step search simulation
  const handleSearch = () => {
    if (!searchTarget.trim() || nodes.length === 0) return;
    if (searchIntervalRef.current) clearInterval(searchIntervalRef.current);
    clearSimTimeouts();
    setActiveNodeIndex(null);
    setIsSimulating(false);
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
    workflowRunIdRef.current += 1;
    clearSimTimeouts();
    if (searchIntervalRef.current) {
      clearInterval(searchIntervalRef.current);
      searchIntervalRef.current = null;
    }
    setActiveNodeIndex(null);
    setIsSimulating(false);
    setIsAutomating(false);
    setActiveActionBtn(null);
    setHighlightedInput(null);
    setNewlyAddedNodeId(null);
    setSearchResultModal(null);
    setSimStatus('');
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
            onClick={handleRunWorkflow}
            disabled={isAutomating || isSimulating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/30 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAutomating || isSimulating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>{language === 'vi' ? 'Đang chạy quy trình...' : 'Running workflow...'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'vi' ? 'Chạy Quy Trình Mẫu' : 'Run Sample Pipeline'}</span>
              </>
            )}
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
                disabled={isSimulating || isAutomating}
                className={`bg-black/50 border rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 outline-none w-48 placeholder:text-slate-600 transition-all ${
                  highlightedInput === 'data'
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(0,210,255,0.3)] bg-cyan-950/20'
                    : 'border-white/[0.08] focus:border-cyan-500/40'
                } disabled:opacity-75`}
              />
              <button
                type="button"
                onClick={handleInsertBeginning}
                disabled={isSimulating || isAutomating}
                className={`text-xs font-sans font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:cursor-not-allowed ${
                  activeActionBtn === 'insertBeginning'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(0,210,255,0.4)] scale-105'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 disabled:opacity-50'
                }`}
              >
                {strings.foundations.linkedList.insertBeginning}
              </button>
              <button
                type="button"
                onClick={handleInsertEnd}
                disabled={isSimulating || isAutomating}
                className={`text-xs font-sans px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:cursor-not-allowed ${
                  activeActionBtn === 'insertEnd'
                    ? 'bg-cyan-500/20 text-white border border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(0,210,255,0.4)] scale-105'
                    : 'bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:text-white disabled:opacity-50'
                }`}
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
                disabled={isSimulating || isAutomating}
                className={`bg-black/50 border rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 outline-none w-36 placeholder:text-slate-600 transition-all ${
                  highlightedInput === 'search'
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(0,210,255,0.3)] bg-cyan-950/20'
                    : 'border-white/[0.08] focus:border-cyan-500/40'
                } disabled:opacity-75`}
              />
              <button
                type="button"
                disabled={isSearching || isSimulating || isAutomating}
                onClick={handleSearch}
                className={`text-xs font-sans px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:cursor-not-allowed ${
                  activeActionBtn === 'search'
                    ? 'bg-cyan-500/20 text-white border border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(0,210,255,0.4)] scale-105'
                    : 'bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:border-cyan-500/30 hover:text-white disabled:opacity-50'
                }`}
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
                  const isActiveSimNode = activeNodeIndex === idx;
                  const isNewlyAdded = newlyAddedNodeId === node.id;
                  const hexAddr = `0x${((idx + 1) * 2048).toString(16).toUpperCase()}`;
                  const nextHexAddr = node.nextId ? `0x${((idx + 2) * 2048).toString(16).toUpperCase()}` : 'NULL';
                  const isArrowActive = activeNodeIndex === idx;

                  return (
                    <React.Fragment key={node.id}>
                      <div className="flex flex-col items-center shrink-0">
                        {/* Struct Node Card */}
                        <div
                          className={`bg-[#0B101E]/85 backdrop-blur-md border rounded-xl p-3.5 min-w-[200px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all ${
                            isNewlyAdded
                              ? 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.35)] scale-[1.02] duration-300'
                              : isActiveSimNode
                              ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(0,210,255,0.35)] scale-[1.02] duration-300'
                              : isFoundNode
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
                            <span className={isActiveSimNode || isNewlyAdded ? 'text-cyan-300 font-bold font-mono' : 'text-slate-500 font-mono'}>
                              Addr: {hexAddr}
                            </span>
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
                                disabled={isSimulating || isAutomating}
                                className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer p-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
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
                          <span
                            className={`text-[9px] font-mono transition-colors ${
                              isArrowActive
                                ? 'text-cyan-400 font-bold drop-shadow-[0_0_8px_#00d2ff]'
                                : 'text-cyan-400/80'
                            }`}
                          >
                            .next
                          </span>
                          <div
                            className={`w-8 h-[2px] relative flex items-center justify-end transition-all ${
                              isArrowActive
                                ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_10px_rgba(0,210,255,0.8)]'
                                : 'bg-gradient-to-r from-cyan-500/40 to-cyan-400 shadow-[0_0_6px_rgba(0,210,255,0.3)]'
                            }`}
                          >
                            <ArrowRight
                              className={`w-3 h-3 -mr-1 transition-all ${
                                isArrowActive
                                  ? 'text-cyan-300 drop-shadow-[0_0_8px_#00d2ff] scale-125'
                                  : 'text-cyan-400'
                              }`}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center pl-2 shrink-0">
                          <div
                            className={`px-3 py-2 rounded-lg font-mono text-xs flex items-center justify-center transition-all duration-300 ${
                              activeNodeIndex === nodes.length
                                ? 'bg-cyan-950/40 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,210,255,0.35)] scale-[1.05]'
                                : 'bg-white/[0.02] border border-dashed border-white/[0.15] text-slate-400'
                            }`}
                          >
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

          {/* Mini Status Banner for Traversal Simulation */}
          <div className="mt-4 p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 font-mono text-xs text-cyan-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{simStatus || (language === 'vi' ? 'Hệ thống sẵn sàng mô phỏng' : 'System ready for simulation')}</span>
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
              onClick={handleRunWorkflow}
              disabled={isAutomating || isSimulating}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] hover:border-cyan-500/30 text-xs font-sans font-medium transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAutomating || isSimulating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>{language === 'vi' ? 'Đang chạy quy trình...' : 'Running workflow...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'vi' ? 'Chạy quy trình mẫu' : 'Run sample pipeline'}</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div
              className={`p-4 rounded-xl backdrop-blur-md border space-y-1.5 transition-all duration-300 ${
                activeNodeIndex === 0
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.3)] scale-[1.02]'
                  : 'bg-[#0E1424]/85 border-cyan-500/20'
              }`}
            >
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

            <div
              className={`p-4 rounded-xl backdrop-blur-md border space-y-1.5 transition-all duration-300 ${
                activeNodeIndex === 1
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.3)] scale-[1.02]'
                  : 'bg-[#0E1424]/85 border-cyan-500/20'
              }`}
            >
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

            <div
              className={`p-4 rounded-xl backdrop-blur-md border space-y-1.5 transition-all duration-300 ${
                activeNodeIndex === 2
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.3)] scale-[1.02]'
                  : 'bg-[#0E1424]/85 border-cyan-500/20'
              }`}
            >
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

      {/* Clean Sans Search Result Modal (No icon, No badge) */}
      {searchResultModal?.open && searchResultModal.data && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B101E] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl transition-all">
            <h3 className="font-sans font-bold text-lg text-white mb-2">
              {language === 'vi' ? 'Kết quả tìm kiếm thành công' : 'Search Result Successful'}
            </h3>
            <p className="font-sans text-sm text-slate-300 leading-relaxed mb-5">
              {language === 'vi'
                ? 'Hệ thống đã hoàn tất duyệt tuần tự qua danh sách liên kết và tìm thấy dữ liệu mục tiêu trong bộ nhớ.'
                : 'The system has completed linear traversal through the linked list and found target data in memory.'}
            </p>

            {/* Bảng dữ liệu chi tiết */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-2.5 mb-6">
              <div className="flex justify-between items-center text-sm font-sans">
                <span className="text-slate-400">
                  {language === 'vi' ? 'Giá trị tìm thấy:' : 'Found value:'}
                </span>
                <span className="text-cyan-300 font-semibold">{searchResultModal.data.value}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-sans">
                <span className="text-slate-400">
                  {language === 'vi' ? 'Vị trí trong danh sách:' : 'Position in list:'}
                </span>
                <span className="text-slate-200">{searchResultModal.data.position}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-sans">
                <span className="text-slate-400">
                  {language === 'vi' ? 'Địa chỉ ô nhớ:' : 'Memory address:'}
                </span>
                <span className="text-slate-200">{searchResultModal.data.address}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-sans">
                <span className="text-slate-400">
                  {language === 'vi' ? 'Số bước thực hiện:' : 'Steps executed:'}
                </span>
                <span className="text-slate-200">
                  {searchResultModal.data.steps} {language === 'vi' ? 'bước' : 'steps'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-sans">
                <span className="text-slate-400">
                  {language === 'vi' ? 'Độ phức tạp thời gian:' : 'Time complexity:'}
                </span>
                <span className="text-emerald-400 font-medium">
                  {language === 'vi' ? 'O(n) - Tuyến tính' : 'O(n) - Linear'}
                </span>
              </div>
            </div>

            {/* Nút đóng */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSearchResultModal(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-semibold text-sm transition-all shadow-md cursor-pointer"
              >
                {language === 'vi' ? 'Xác nhận hoàn tất' : 'Confirm & Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

