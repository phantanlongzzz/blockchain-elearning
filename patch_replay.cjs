const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

code = code.replace(
  `    const replayPass = !baseSeen.has(targetSig);`,
  `    const replayPass = scenario === 'REPLAY' ? false : !baseSeen.has(targetSig);`
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
