const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

code = code.replace(/let timer: NodeJS\.Timeout;/, 'let timer: ReturnType<typeof setTimeout>;');
fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
