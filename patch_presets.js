const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

// First, remove initSeed entirely so we start empty.
code = code.replace(
  /\/\/ Initialize seed transactions into mempool[\s\S]*?initSeed\(\);\n  \}, \[\]\);/,
  `// Start with an empty mempool as requested
  useEffect(() => {
    // No initial seed transactions
  }, []);`
);

// Second, fix handleReset to ensure we reset everything
code = code.replace(
  /const handleReset = \(\) => \{[\s\S]*?\};/,
  `const handleReset = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setMempool([]);
    setRejected([]);
    setSeenSignatures(new Set());
    setLastVerifiedTx(null);
    setActiveStep(0);
    setExpandedAccount(null);
    setRevealedKeyAccount(null);
  };`
);

// Third, make presets clear state BEFORE running, or just run them.
// Since setState is async, we can just clear state and then run.
// Wait, `processTransactionSubmission` reads `mempool.length` from closure. If we clear state, `mempool.length` in the closure is still the old one.
// We can pass the new txNum or just calculate it based on prev.
