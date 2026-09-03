const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

code = code.replace(
  /'Từ chối giao dịch'/,
  `'Giao dịch bị từ chối'`
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
