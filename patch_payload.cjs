const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

code = code.replace(
  `    let broadcastPayload = { ...signedPayload, amount: broadcastAmount };`,
  `    let broadcastPayload = scenario === 'TAMPERED' 
      ? { ...signedPayload, amount: 100.0 } 
      : { ...signedPayload };`
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
