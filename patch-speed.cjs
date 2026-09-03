const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

// 1. Add baseDelay to TraceStep
code = code.replace(
  `  focusId?: string;`,
  `  focusId?: string;
  baseDelay?: number;`
);

// 2. Add baseDelay to buildSimulationTrace steps
code = code.replace(
  `newTrace.push({ activeStep: 0, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts) });`,
  `newTrace.push({ activeStep: 0, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts), baseDelay: 900 });`
);
code = code.replace(
  `newTrace.push({ activeStep: 1, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts), focusId: 'pipeline-viz' });`,
  `newTrace.push({ activeStep: 1, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts), focusId: 'pipeline-viz', baseDelay: 1400 });`
);
code = code.replace(
  `newTrace.push({ activeStep: 2, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts) });`,
  `newTrace.push({ activeStep: 2, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts), baseDelay: 900 });`
);
code = code.replace(
  `newTrace.push({ activeStep: 3, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts) });`,
  `newTrace.push({ activeStep: 3, lastVerifiedTx: null, mempool: [...baseMempool], rejected: [...baseRejected], seenSignatures: new Set(baseSeen), accounts: cloneAccounts(baseAccounts), baseDelay: 1000 });`
);

code = code.replace(
  `        focusId: 'audit-panel'\n      });`,
  `        focusId: 'audit-panel',\n        baseDelay: 1000\n      });`
);

code = code.replace(
  `      focusId: 'result-panel'\n    });`,
  `      focusId: 'result-panel',\n      baseDelay: 1500\n    });`
);

// 3. Update speed control UI
const oldSpeedUI = `                <div className="flex items-center gap-2 pl-2 border-l border-[#252B33]">
                  <span className="text-xs text-[#68717D]">Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="bg-transparent text-xs text-[#E7E9ED] border border-[#252B33] rounded p-1 outline-none"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>`;

const newSpeedUI = `                <div className="flex items-center gap-1 pl-3 sm:pl-4 border-l border-[#252B33]">
                  <span className="text-xs text-[#68717D] mr-1 hidden sm:inline">Speed:</span>
                  <div className="flex items-center bg-[#090a0f] border border-[#252B33] rounded overflow-hidden">
                    {[0.5, 1, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={\`px-2.5 py-1 text-xs font-mono transition-colors \${
                          playbackSpeed === speed
                            ? 'bg-[#1A2028] text-[#E7E9ED] border-b-2 border-[#00D084]'
                            : 'bg-transparent text-[#68717D] hover:bg-[#1A2028]/50 hover:text-[#9AA2AE] border-b-2 border-transparent'
                        }\`}
                      >
                        {speed}×
                      </button>
                    ))}
                  </div>
                </div>`;

code = code.replace(oldSpeedUI, newSpeedUI);

// 4. Update useEffect logic
const oldEffect = `  useEffect(() => {
    let timer: any;
    if (isPlaying && trace.length > 0 && stepIndex < trace.length - 1) {
      const delay = 800 / playbackSpeed;
      timer = setTimeout(() => {
        setStepIndex(s => s + 1);
      }, delay);
    } else if (isPlaying && stepIndex >= trace.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, trace, playbackSpeed]);`;

const newEffect = `  const speedRef = React.useRef(playbackSpeed);
  useEffect(() => {
    speedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    let active = true;
    const runDelay = async () => {
      if (isPlaying && trace.length > 0 && stepIndex < trace.length - 1) {
        const baseDelay = trace[stepIndex].baseDelay || 1000;
        const scaledDelay = baseDelay / speedRef.current;
        
        await new Promise(resolve => setTimeout(resolve, scaledDelay));
        
        if (active) {
          setStepIndex(s => s + 1);
        }
      } else if (isPlaying && stepIndex >= trace.length - 1) {
        setIsPlaying(false);
      }
    };
    
    runDelay();
    return () => { active = false; };
  }, [isPlaying, stepIndex, trace]);`;

code = code.replace(oldEffect, newEffect);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
console.log('Patched speed logic');
