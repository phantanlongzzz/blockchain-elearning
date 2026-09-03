const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

code = code.replace(
  /\/\/ Initialize seed transactions into mempool[\s\S]*?initSeed\(\);\n  \}, \[\]\);/,
  `// Start with an empty mempool as requested
  useEffect(() => {
    // No initial seed transactions
  }, []);`
);

code = code.replace(
  /const txNum = \`TX-\$\{String\(mempool\.length \+ rejected\.length \+ 1\)\.padStart\(3, '0'\)\}\`;/,
  `// Calculate txNum dynamically from state if possible, but for isolation we'll just use 1 since we clear state
    const txNum = \`TX-\$\{String(mempool.length + rejected.length + 1).padStart(3, '0')\}\`;`
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
