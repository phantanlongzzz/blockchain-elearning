import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Layers,
  Code2,
  ListTree,
  Utensils,
  Lightbulb,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#090a0f] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-zinc-500 font-medium">
            {language === 'vi'
              ? 'Giai đoạn 02 · Cấu trúc liên kết động'
              : 'Stage 02 · Dynamic Linked Structure'}
          </div>
          <h3 className="text-lg font-semibold text-zinc-100">
            {language === 'vi'
              ? 'Danh sách liên kết (Linked List)'
              : 'Linked List Data Structure'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            {language === 'vi'
              ? 'Mỗi phần tử là một Nút (Node) chứa Dữ liệu (DATA) và Con trỏ (NEXT) trỏ tới địa chỉ ô nhớ của nút tiếp theo.'
              : 'Each element is a Node containing payload (DATA) and a reference pointer (NEXT) pointing to the next node in memory.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleLoadSushiExample}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>{strings.foundations.linkedList.sushiExampleBtn}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{strings.foundations.linkedList.reset}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setViewMode('visual')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
            viewMode === 'visual'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          {language === 'vi' ? '1. Mô phỏng Node & Con trỏ' : '1. Node & Pointer Simulator'}
        </button>

        <button
          type="button"
          onClick={() => setViewMode('sushi')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
            viewMode === 'sushi'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          {language === 'vi' ? '2. Quy trình mẫu' : '2. Sample Pipeline'}
        </button>

        <button
          type="button"
          onClick={() => setViewMode('code')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
            viewMode === 'code'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          {language === 'vi' ? '3. Code Node Class' : '3. Node Class Code'}
        </button>
      </div>

      {/* Mode 1: Visual Interactive Linked List */}
      {viewMode === 'visual' && (
        <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-6">
          {/* Action Toolbar */}
          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs font-mono">
            {/* Insertion controls */}
            <div className="flex-1 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder={strings.foundations.pythonList.valuePlaceholder}
                className="flex-1 min-w-[120px] px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
              <button
                type="button"
                onClick={handleInsertBeginning}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-semibold font-mono text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {strings.foundations.linkedList.insertBeginning}
              </button>
              <button
                type="button"
                onClick={handleInsertEnd}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium font-mono text-xs border border-zinc-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
                className="w-36 sm:w-44 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
              <button
                type="button"
                disabled={isSearching}
                onClick={handleSearch}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 font-medium font-mono text-xs border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{strings.foundations.linkedList.search}</span>
              </button>
            </div>
          </div>

          {/* Search Result Feedback */}
          {searchResult.searched && (
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-mono flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${searchResult.found ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={searchResult.found ? 'text-emerald-400' : 'text-rose-400'}>
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

          {/* Linked List Canvas */}
          <div className="p-5 rounded-lg bg-black/40 border border-zinc-800/80 min-h-[150px] flex items-center overflow-x-auto">
            {nodes.length === 0 ? (
              <div className="w-full text-center text-xs font-mono text-zinc-600 py-6">
                HEAD = NULL (Danh sách rỗng)
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full pb-2">
                {/* HEAD Anchor */}
                <div className="flex flex-col items-center mr-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] font-medium border border-zinc-700">
                    HEAD
                  </span>
                  <div className="h-4 w-px bg-zinc-600 my-1"></div>
                  <span className="text-[10px] font-mono text-zinc-500">→ [0]</span>
                </div>

                {/* Nodes List */}
                {nodes.map((node, idx) => {
                  const isHead = idx === 0;
                  const isTail = idx === nodes.length - 1;
                  const isCurrentInSearch = currentSearchIdx === idx;
                  const isFoundNode = searchResult.found && searchResult.index === idx;

                  return (
                    <React.Fragment key={node.id}>
                      <div className="flex flex-col items-center shrink-0">
                        {/* Node Label */}
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 mb-1">
                          <span>#{idx}</span>
                          {isHead && <span className="text-zinc-400">· HEAD</span>}
                          {isTail && <span className="text-emerald-400">· TAIL</span>}
                        </div>

                        {/* Node Cell: Data & Next */}
                        <div
                          className={`w-36 rounded-lg border transition-colors ${
                            isFoundNode
                              ? 'bg-zinc-900 border-border-primary ring-1 ring-white/20'
                              : isCurrentInSearch
                              ? 'bg-zinc-900 border-amber-500 ring-1 ring-amber-500/30'
                              : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="p-2 border-b border-zinc-800 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">DATA</span>
                            <span className="font-mono text-xs font-medium text-zinc-100 truncate max-w-[90px]">
                              &quot;{node.data}&quot;
                            </span>
                          </div>

                          <div className="p-2 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-zinc-500">NEXT</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-zinc-400">
                                {node.nextId ? `0x${((idx + 2) * 2048).toString(16)}` : 'NULL'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteNode(idx)}
                                className="text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete node"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      {idx < nodes.length - 1 ? (
                        <div className="flex flex-col items-center px-1 shrink-0 text-zinc-600">
                          <ArrowRight className="w-4 h-4 text-zinc-500" />
                          <span className="text-[9px] font-mono text-zinc-600">.next</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center pl-2 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-500 font-mono text-[10px] border border-zinc-800">
                            NULL
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Minimal Concept Note */}
          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs leading-relaxed space-y-1">
            <div className="text-zinc-300 font-mono font-medium">
              {language === 'vi'
                ? 'Kiến trúc Node: [ DATA | NEXT POINTER ]'
                : 'Node Architecture: [ DATA | NEXT POINTER ]'}
            </div>
            <p className="text-zinc-400">
              {language === 'vi'
                ? 'Các Node trong Linked List có thể phân tán ở các địa chỉ RAM khác nhau, kết nối nhờ con trỏ NEXT. Tuy nhiên, con trỏ NEXT này chỉ là địa chỉ bộ nhớ tạm thời và không mang tính chất xác thực bảo mật.'
                : 'Linked list nodes can be scattered across memory addresses, linked via NEXT pointers. These pointers are transient memory offsets and offer no cryptographic integrity.'}
            </p>
          </div>
        </div>
      )}

      {/* Mode 2: Sushi Recipe Step */}
      {viewMode === 'sushi' && (
        <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-100">
              {language === 'vi'
                ? 'Ví dụ quy trình thực hiện các bước'
                : 'Curriculum Step Pipeline'}
            </div>

            <button
              type="button"
              onClick={handleLoadSushiExample}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              {language === 'vi' ? 'Nạp lại chuỗi mẫu' : 'Reload sample chain'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block font-medium">
                BƯỚC 1 · HEAD
              </span>
              <div className="font-mono text-xs font-medium text-zinc-200">&quot;assemble&quot;</div>
              <p className="text-xs text-zinc-400">
                {language === 'vi'
                  ? 'Nút đầu tiên trong danh sách liên kết.'
                  : 'The head node inserted at the front.'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block font-medium">
                BƯỚC 2 · MIDDLE
              </span>
              <div className="font-mono text-xs font-medium text-zinc-200">&quot;prepare&quot;</div>
              <p className="text-xs text-zinc-400">
                {language === 'vi'
                  ? 'Nút kế tiếp được trỏ bởi assemble.'
                  : 'Next node referenced by assemble.next.'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block font-medium">
                BƯỚC 3 · TAIL
              </span>
              <div className="font-mono text-xs font-medium text-zinc-200">&quot;roll&quot; → NULL</div>
              <p className="text-xs text-zinc-400">
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
        <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="font-medium text-zinc-300">
              {language === 'vi' ? 'Lớp Node & LinkedList trong Python' : 'Node & LinkedList Classes'}
            </span>
            <span className="text-zinc-500">Python 3.12</span>
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
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-mono text-zinc-500">
          {language === 'vi'
            ? 'Tiếp theo: Quan sát cách Linked List chuyển đổi thành Blockchain'
            : 'Next: Observe the visual transformation from Linked List to Blockchain'}
        </span>

        <button
          type="button"
          onClick={onNextStage}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-semibold font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span>
            {language === 'vi'
              ? 'Tiếp tục sang Chuyển Đổi Blockchain'
              : 'Continue to Morphing'}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
