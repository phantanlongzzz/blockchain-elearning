const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

code = code.replace(
  /const processTransactionSubmission = async \([\s\S]*?\) => \{/,
  `const processTransactionSubmission = async (
    sAcc: LedgerAccount,
    rAcc: LedgerAccount,
    signedPayload: any,
    broadcastPayload: any,
    forceDuplicateSig?: string,
    isolateScenario: boolean = false
  ) => {
    if (isolateScenario) {
      setAccounts(INITIAL_ACCOUNTS);
      setMempool([]);
      setRejected([]);
      setSeenSignatures(new Set());
      setLastVerifiedTx(null);
      sAcc = INITIAL_ACCOUNTS.find(a => a.address === sAcc.address) || sAcc;
      rAcc = INITIAL_ACCOUNTS.find(a => a.address === rAcc.address) || rAcc;
    }`
);

code = code.replace(
  /\/\/ Calculate txNum dynamically from state if possible, but for isolation we'll just use 1 since we clear state\n    const txNum = \`TX-\$\{String\(mempool\.length \+ rejected\.length \+ 1\)\.padStart\(3, '0'\)\}\`;/,
  `const txNum = isolateScenario ? 'TX-001' : \`TX-\$\{String(mempool.length + rejected.length + 1).padStart(3, '0')\}\`;`
);

code = code.replace(
  /if \(isAllValid\) \{[\s\S]*?\} else \{[\s\S]*?\}/,
  `if (isAllValid) {
      // Deduct balance from sender and credit receiver in educational ledger
      setAccounts((prev) => {
        const baseAccounts = isolateScenario ? INITIAL_ACCOUNTS : prev;
        return baseAccounts.map((acc) => {
          if (acc.address === sAcc.address) {
            return { ...acc, balance: Number((acc.balance - broadcastPayload.amount).toFixed(4)) };
          }
          if (acc.address === rAcc.address) {
            return { ...acc, balance: Number((acc.balance + broadcastPayload.amount).toFixed(4)) };
          }
          return acc;
        });
      });
      setMempool((prev) => isolateScenario ? [txResult] : [txResult, ...prev]);
      setSeenSignatures((prev) => isolateScenario ? new Set([signature]) : new Set([...prev, signature]));
    } else {
      setAccounts((prev) => isolateScenario ? INITIAL_ACCOUNTS : prev);
      setRejected((prev) => isolateScenario ? [txResult] : [txResult, ...prev]);
      if (isolateScenario && forceDuplicateSig) {
        setSeenSignatures(new Set([forceDuplicateSig]));
      }
    }`
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
