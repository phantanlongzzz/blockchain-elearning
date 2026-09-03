const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

const oldEffect = `  useEffect(() => {
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

const newEffect = `  useEffect(() => {
    let active = true;
    let timer: NodeJS.Timeout;

    const runDelay = async () => {
      if (isPlaying && trace.length > 0 && stepIndex < trace.length - 1) {
        const baseDelay = trace[stepIndex].baseDelay || 1000;
        const scaledDelay = baseDelay / speedRef.current;
        
        await new Promise(resolve => {
          timer = setTimeout(resolve, scaledDelay);
        });
        
        if (active) {
          setStepIndex(s => s + 1);
        }
      } else if (isPlaying && stepIndex >= trace.length - 1) {
        setIsPlaying(false);
      }
    };
    
    runDelay();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isPlaying, stepIndex, trace]);`;

code = code.replace(oldEffect, newEffect);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
