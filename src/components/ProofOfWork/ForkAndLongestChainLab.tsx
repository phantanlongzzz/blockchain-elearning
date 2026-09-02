import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface SimpleBlockNode {
  id: string;
  number: string;
  height: number;
  miner: string;
  minerRole: 'genesis' | 'alice' | 'bob' | 'network';
  branch: 'root' | 'branchA' | 'branchB';
  status: 'canonical' | 'competing' | 'orphaned';
  parentNumber: string;
  stepAdded: number; // which simulation step it was added in
}

interface SimulationStepEvent {
  step: number;
  titleEn: string;
  titleVi: string;
  messageEn: string;
  messageVi: string;
  addedBlockId?: string;
  activeBranch?: 'branchA' | 'branchB' | 'root';
  branchAWork: number;
  branchBWork: number;
  isFork: boolean;
  isFinished: boolean;
}

const ROOT_BLOCKS: SimpleBlockNode[] = [
  { id: 'genesis', number: 'Genesis', height: 0, miner: 'Satoshi', minerRole: 'genesis', branch: 'root', status: 'canonical', parentNumber: 'None', stepAdded: 0 },
  { id: 'block-1', number: 'Block #1', height: 1, miner: 'Node #1', minerRole: 'network', branch: 'root', status: 'canonical', parentNumber: 'Genesis', stepAdded: 0 },
  { id: 'block-2', number: 'Block #2', height: 2, miner: 'Node #2', minerRole: 'network', branch: 'root', status: 'canonical', parentNumber: 'Block #1', stepAdded: 0 },
];

const FORK_BLOCKS: SimpleBlockNode[] = [
  { id: 'block-3a', number: 'Block #3A', height: 3, miner: 'Alice', minerRole: 'alice', branch: 'branchA', status: 'canonical', parentNumber: 'Block #2', stepAdded: 1 },
  { id: 'block-3b', number: 'Block #3B', height: 3, miner: 'Bob', minerRole: 'bob', branch: 'branchB', status: 'competing', parentNumber: 'Block #2', stepAdded: 2 },
  { id: 'block-4a', number: 'Block #4A', height: 4, miner: 'Alice', minerRole: 'alice', branch: 'branchA', status: 'canonical', parentNumber: 'Block #3A', stepAdded: 3 },
  { id: 'block-4b', number: 'Block #4B', height: 4, miner: 'Bob', minerRole: 'bob', branch: 'branchB', status: 'competing', parentNumber: 'Block #3B', stepAdded: 4 },
  { id: 'block-5a', number: 'Block #5A', height: 5, miner: 'Alice', minerRole: 'alice', branch: 'branchA', status: 'canonical', parentNumber: 'Block #4A', stepAdded: 5 },
];

const SIMULATION_EVENTS: SimulationStepEvent[] = [
  { step: 0, titleEn: 'Single Canonical Chain', titleVi: 'Chuỗi Đơn Đồng Nhất', messageEn: 'Network starts with a single agreed canonical chain.', messageVi: 'Mạng lưới bắt đầu với một chuỗi gốc duy nhất.', branchAWork: 2, branchBWork: 2, isFork: false, isFinished: false },
  { step: 1, titleEn: 'Alice solves Block #3A', titleVi: 'Alice tìm ra Khối #3A', messageEn: 'Alice solves a valid block at height 3.', messageVi: 'Alice tìm ra khối hợp lệ tại độ cao 3.', addedBlockId: 'block-3a', activeBranch: 'branchA', branchAWork: 3, branchBWork: 2, isFork: false, isFinished: false },
  { step: 2, titleEn: 'Bob solves competing Block #3B', titleVi: 'Bob tìm ra Khối đối thủ #3B', messageEn: 'Bob also solves Block #3. Temporary Fork occurs!', messageVi: 'Bob cũng tìm ra khối #3 cùng độ cao. Phân nhánh tạm thời!', addedBlockId: 'block-3b', activeBranch: 'branchB', branchAWork: 3, branchBWork: 3, isFork: true, isFinished: false },
  { step: 3, titleEn: 'Alice solves Block #4A', titleVi: 'Alice tìm ra Khối #4A', messageEn: 'Alice mines on top of Branch A.', messageVi: 'Alice đào tiếp trên Nhánh A.', addedBlockId: 'block-4a', activeBranch: 'branchA', branchAWork: 4, branchBWork: 3, isFork: true, isFinished: false },
  { step: 4, titleEn: 'Bob solves Block #4B', titleVi: 'Bob tìm ra Khối #4B', messageEn: 'Bob finds Block #4B. Branches are tied again.', messageVi: 'Bob tìm ra Khối #4B. Cả hai nhánh lại hòa nhau.', addedBlockId: 'block-4b', activeBranch: 'branchB', branchAWork: 4, branchBWork: 4, isFork: true, isFinished: false },
  { step: 5, titleEn: 'Alice solves Block #5A', titleVi: 'Alice tìm ra Khối #5A', messageEn: 'Alice solves Block #5A! Branch A leads.', messageVi: 'Alice tìm ra Khối #5A! Nhánh A dẫn trước.', addedBlockId: 'block-5a', activeBranch: 'branchA', branchAWork: 5, branchBWork: 4, isFork: true, isFinished: false },
  { step: 6, titleEn: 'Consensus Reached', titleVi: 'Đạt Đồng Thuận', messageEn: 'Branch A is Canonical. Branch B is Orphaned.', messageVi: 'Nhánh A làm Chuỗi Chính. Nhánh B bị loại.', branchAWork: 5, branchBWork: 4, isFork: false, isFinished: true },
];

export const ForkAndLongestChainLab: React.FC<{onInteracted?: () => void}> = ({ onInteracted }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [quizAns, setQuizAns] = useState<'A' | 'B' | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentEvent = SIMULATION_EVENTS[currentStep] || SIMULATION_EVENTS[0];
  const isFinished = currentStep === SIMULATION_EVENTS.length - 1;

  // Auto-focus camera on current step/fork event
  useEffect(() => {
    if (canvasRef.current && currentStep > 0) {
      const el = canvasRef.current;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollTo({
        left: el.scrollWidth,
        behavior: prefersReduced ? 'auto' : 'smooth'
      });
    }
  }, [currentStep]);

  const handleStepNext = () => {
    setCurrentStep((prev) => Math.min(SIMULATION_EVENTS.length - 1, prev + 1));
    onInteracted?.();
  };

  const handleReset = () => {
    setCurrentStep(0);
    setQuizAns(null);
    setQuizResult(null);
  };

  const visibleBlocks = useMemo(() => {
    const root = [...ROOT_BLOCKS];
    const forks = FORK_BLOCKS.filter((b) => b.stepAdded <= currentStep);

    return [...root, ...forks].map((b) => {
      if (b.branch === 'root') {
        return { ...b, status: 'canonical' as const };
      }
      if (isFinished) {
        if (b.branch === 'branchA') {
          return { ...b, status: 'canonical' as const };
        } else {
          return { ...b, status: 'orphaned' as const };
        }
      } else {
        if (currentEvent.branchAWork > currentEvent.branchBWork && b.branch === 'branchA') {
          return { ...b, status: 'canonical' as const };
        } else if (currentEvent.branchBWork > currentEvent.branchAWork && b.branch === 'branchB') {
          return { ...b, status: 'canonical' as const };
        } else {
          return { ...b, status: 'competing' as const };
        }
      }
    });
  }, [currentStep, isFinished, currentEvent.branchAWork, currentEvent.branchBWork]);

  const hasBlock = (id: string) => visibleBlocks.some((b) => b.id === id);
  const getBlock = (id: string) => visibleBlocks.find((b) => b.id === id);

  const getButtonLabel = () => {
    if (currentStep === 0) return isVi ? 'Khai thác khối #3A (Alice)' : 'Mine Block #3A (Alice)';
    if (currentStep === 1) return isVi ? 'Khai thác khối cạnh tranh #3B (Bob)' : 'Mine competing Block #3B (Bob)';
    if (currentStep === 2) return isVi ? 'Khai thác tiếp trên nhánh A (#4A)' : 'Mine on Branch A (#4A)';
    if (currentStep === 3) return isVi ? 'Khai thác tiếp trên nhánh B (#4B)' : 'Mine on Branch B (#4B)';
    if (currentStep === 4) return isVi ? 'Khai thác khối #5A (Alice)' : 'Mine Block #5A (Alice)';
    if (currentStep === 5) return isVi ? 'Hoàn tất & Áp dụng Consensus' : 'Resolve Consensus';
    return isVi ? 'Khởi động lại mô phỏng' : 'Restart Simulation';
  };

  const baseTime = 1718000000000;
  const logs = SIMULATION_EVENTS.slice(0, currentStep + 1).map((evt, i) => {
    const d = new Date(baseTime + i * 4500);
    return {
      time: d.toLocaleTimeString('en-GB', { hour12: false }),
      level: evt.isFinished ? 'DONE' : evt.isFork ? 'WARN' : 'INFO',
      msg: isVi ? evt.titleVi : evt.titleEn
    };
  });

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const checkQuiz = () => {
    if (quizAns === 'A') setQuizResult('correct');
    else setQuizResult('incorrect');
  };

  return (
    <div id="fork-longest-chain-simulation-lab" className="bg-[#0a0d12] border border-zinc-800/80 rounded-xl overflow-hidden font-sans text-zinc-100 antialiased shadow-xl">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-[#0a0d12]">
        <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-zinc-500">
          01 — 02 — 03 — 04 — 05 — <span className="text-zinc-200 font-medium tracking-tight">●06 {isVi ? 'Phân nhánh chuỗi' : 'Fork Resolution'}</span> — 07 — 08
        </div>
        <h2 className="text-lg font-medium tracking-tight">
          {isVi ? "Phân nhánh chuỗi & Giải quyết tranh chấp" : "Fork Resolution"}
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row">
        
        {/* Left: Visualizer */}
        <div className="flex-1 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col bg-[#0a0d12]">
          
          <div ref={canvasRef} className="flex-1 p-6 sm:p-8 overflow-x-auto min-h-[400px] flex items-center justify-center relative custom-scrollbar">
            <div className="flex items-center">
              {/* Trunk */}
              <div className="flex items-center gap-5 z-10">
                <BlockNode node={ROOT_BLOCKS[0]} />
                <div className="w-5 h-px bg-zinc-800" />
                <BlockNode node={ROOT_BLOCKS[1]} />
                <div className="w-5 h-px bg-zinc-800" />
                <BlockNode node={ROOT_BLOCKS[2]} />
              </div>

              {/* Fork Connector */}
              <div className="flex items-center relative z-0">
                <div className="w-5 h-px bg-zinc-800" />
                <div className="w-px h-[160px] bg-zinc-800 relative">
                  <div className="absolute top-0 left-0 w-5 h-px bg-zinc-800" />
                  <div className="absolute bottom-0 left-0 w-5 h-px bg-zinc-800" />
                  {currentEvent.isFork && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-zinc-950 border border-amber-500/30 text-amber-500 text-[10px] font-mono px-2 py-0.5 rounded whitespace-nowrap z-20 shadow-sm">
                      Fork detected
                    </div>
                  )}
                </div>
              </div>

              {/* Branches */}
              <div className="flex flex-col gap-8 z-10 py-4">
                
                {/* Branch A */}
                <div className="flex items-center gap-5 h-[128px]">
                  {hasBlock('block-3a') ? <BlockNode node={getBlock('block-3a')!} /> : <EmptySlot label="Block #3A" />}
                  <div className={`w-5 h-px ${hasBlock('block-4a') ? 'bg-zinc-800' : 'bg-transparent'}`} />
                  {hasBlock('block-4a') ? <BlockNode node={getBlock('block-4a')!} /> : hasBlock('block-3a') ? <EmptySlot label="Block #4A" /> : <div className="w-32" />}
                  <div className={`w-5 h-px ${hasBlock('block-5a') ? 'bg-zinc-800' : 'bg-transparent'}`} />
                  {hasBlock('block-5a') ? <BlockNode node={getBlock('block-5a')!} /> : hasBlock('block-4a') ? <EmptySlot label="Block #5A" /> : <div className="w-32" />}
                </div>

                {/* Branch B */}
                <div className="flex items-center gap-5 h-[128px]">
                  {hasBlock('block-3b') ? <BlockNode node={getBlock('block-3b')!} /> : <EmptySlot label="Block #3B" />}
                  <div className={`w-5 h-px ${hasBlock('block-4b') ? 'bg-zinc-800' : 'bg-transparent'}`} />
                  {hasBlock('block-4b') ? <BlockNode node={getBlock('block-4b')!} /> : hasBlock('block-3b') ? <EmptySlot label="Block #4B" /> : <div className="w-32" />}
                </div>

              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="p-6 border-t border-zinc-800 bg-[#090a0f] flex flex-col items-center justify-center min-h-[140px]">
            <button
              onClick={currentStep < SIMULATION_EVENTS.length - 1 ? handleStepNext : handleReset}
              className="px-5 py-2 bg-zinc-100 text-zinc-900 text-sm font-medium rounded shadow-sm hover:bg-white transition-all active:scale-95 flex items-center gap-2 font-sans"
            >
              {getButtonLabel()}
              {currentStep < SIMULATION_EVENTS.length - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
            
            {isFinished && (
              <div className="mt-5 border-t border-zinc-800/50 pt-4 w-full max-w-lg text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h4 className="text-sm font-medium text-zinc-200 mb-1">{isVi ? 'Vì sao Bob bị loại?' : 'Why is Bob orphaned?'}</h4>
                <p className="text-xs text-zinc-400">
                  {isVi ? 'Alice đã tạo thêm một block, khiến nhánh Alice trở thành chain được chọn. Block trên nhánh còn lại trở thành orphan.' : 'Alice mined another block, making her branch the longest chain. The block on the other branch becomes an orphan.'}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right: Telemetry & Logs */}
        <div className="w-full lg:w-[320px] flex flex-col shrink-0 bg-[#090a0f]">
          
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-[10px] font-mono text-zinc-500 mb-4 uppercase tracking-wider">Consensus Telemetry</h3>
            <div className="space-y-3 font-mono text-xs text-zinc-400">
              <div className="flex justify-between items-center">
                <span>Block Height</span>
                <span className="text-zinc-100">{Math.max(currentEvent.branchAWork, currentEvent.branchBWork)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Chain Length</span>
                <span className="text-zinc-100">{Math.max(currentEvent.branchAWork, currentEvent.branchBWork)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fork Depth</span>
                <span className="text-zinc-100">{currentEvent.isFork ? Math.max(currentEvent.branchAWork, currentEvent.branchBWork) - 2 : 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status</span>
                <span className={isFinished ? 'text-emerald-400' : currentEvent.isFork ? 'text-amber-400' : 'text-emerald-400'}>
                  {isFinished ? 'Resolved' : currentEvent.isFork ? 'Competing' : 'Stable'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Rule</span>
                <span className="text-zinc-100 truncate ml-2">Longest Chain</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col min-h-[250px]">
            <h3 className="text-[10px] font-mono text-zinc-500 mb-4 uppercase tracking-wider">Live Consensus Log</h3>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
              {logs.map((log, idx) => (
                <div key={idx} className="font-mono text-[10px] flex gap-2 items-start leading-relaxed opacity-90 hover:opacity-100 transition-opacity">
                  <span className="text-zinc-600 shrink-0">{log.time}</span>
                  <span className={`shrink-0 ${log.level === 'WARN' ? 'text-amber-500' : log.level === 'DONE' ? 'text-emerald-400' : 'text-emerald-500'}`}>
                    {log.level.padEnd(4)}
                  </span>
                  <span className="text-zinc-300">{log.msg}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

        </div>
      </div>

      {/* Quick Check */}
      <div className="border-t border-zinc-800 p-6 bg-[#0a0d12] flex items-center justify-center">
        <div className="w-full max-w-xl">
          <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-3">Quick Check</h4>
          <p className="text-sm text-zinc-200 mb-4">
            {isVi ? 'Nhánh nào được mạng lưới chọn sau khi Alice khai thác thêm một block?' : 'Which branch is selected by the network after Alice mines another block?'}
          </p>
          <div className="space-y-3 mb-5">
            <label className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer group">
              <input type="radio" name="quiz" className="bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-0 focus:ring-offset-0 w-4 h-4" onChange={() => setQuizAns('A')} checked={quizAns === 'A'} />
              <span className="group-hover:text-zinc-100 transition-colors">Alice</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer group">
              <input type="radio" name="quiz" className="bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-0 focus:ring-offset-0 w-4 h-4" onChange={() => setQuizAns('B')} checked={quizAns === 'B'} />
              <span className="group-hover:text-zinc-100 transition-colors">Bob</span>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={checkQuiz} disabled={!quizAns} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-medium rounded transition-colors">
              {isVi ? 'Kiểm tra' : 'Check'}
            </button>
            {quizResult && (
              <div className={`text-xs ${quizResult === 'correct' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {quizResult === 'correct' ? (isVi ? 'Chính xác! Nhánh dài hơn được chọn.' : 'Correct! The longer branch is selected.') : (isVi ? 'Chưa đúng. Hãy xem lại cơ chế chuỗi dài nhất.' : 'Incorrect. Remember the longest chain rule.')}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

// --- Subcomponents ---

const BlockNode: React.FC<{ node: SimpleBlockNode }> = ({ node }) => {
  const isOrphaned = node.status === 'orphaned';
  const isCanonical = node.status === 'canonical';
  const isCompeting = node.status === 'competing';
  
  const hash = node.id === 'genesis' ? '0000...0000' : 
               node.id.includes('a') ? '0000...a' + node.height :
               node.id.includes('b') ? '0000...b' + node.height : 
               '0000...c' + node.height;
  
  return (
    <div className={`w-32 h-[128px] rounded-lg border p-3 font-mono flex flex-col transition-all duration-500 relative shrink-0 ${
      isOrphaned ? 'border-zinc-800 bg-zinc-950/60 text-zinc-600 grayscale opacity-50' :
      isCanonical ? 'border-zinc-600 bg-zinc-800/20 text-zinc-100' :
      'border-zinc-700 bg-zinc-900/50 text-zinc-300'
    }`}>
      {isCanonical && <div className="absolute inset-0 bg-emerald-500/5 rounded-lg pointer-events-none" />}
      
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-xs text-zinc-200">{node.number}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${isCanonical ? 'bg-zinc-300' : isCompeting ? 'bg-amber-500' : 'bg-zinc-600'}`} />
      </div>
      <div className="text-[10px] text-zinc-500 mb-3 truncate">Miner: <span className={isOrphaned ? "text-zinc-600" : "text-zinc-300"}>{node.miner}</span></div>
      
      <div className="mt-auto space-y-1.5">
        <div className="flex flex-col">
          <span className="text-[8px] uppercase tracking-wider text-zinc-600">Hash</span>
          <span className="text-[10px] text-zinc-400">{hash}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] uppercase tracking-wider text-zinc-600">Nonce</span>
          <span className="text-[10px] text-zinc-400">{(node.height * 12345).toString().slice(0, 5)}</span>
        </div>
      </div>
    </div>
  );
};

const EmptySlot: React.FC<{ label: string }> = ({ label }) => (
  <div className="w-32 h-[128px] rounded-lg border border-dashed border-zinc-800 bg-transparent flex flex-col items-center justify-center shrink-0">
    <span className="font-mono text-[10px] text-zinc-600">{label}</span>
  </div>
);
